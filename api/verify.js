module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  let token = '';
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const body = Buffer.concat(buffers).toString();
  
  // Wir parsen den Body manuell
  if (req.headers['content-type']?.includes('application/json')) {
    try {
      token = JSON.parse(body)['g-recaptcha-response'];
    } catch(e) {}
  } else {
    const params = new URLSearchParams(body);
    token = params.get('g-recaptcha-response');
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!token) {
    return res.status(400).send('Captcha Token Missing in Body');
  }

  try {
    // Reiner URL-basiert Check als Fallback (manche Google-Instanzen bevorzugen das bei v3)
    const googleUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`;

    const response = await fetch(googleUrl, {
      method: 'POST'
    });
    
    const data = await response.json();

    if (data.success) {
      res.setHeader('Set-Cookie', `auth_token=verified; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);
      res.writeHead(302, { Location: '/map' });
      res.end();
    } else {
      res.status(401).json({
        error: 'Verification Failed',
        google_response: data,
        debug: {
          secret_length: secret?.length,
          token_length: token?.length,
          content_type: req.headers['content-type']
        }
      });
    }
  } catch (err) {
    res.status(500).send('Server Error: ' + err.message);
  }
};
