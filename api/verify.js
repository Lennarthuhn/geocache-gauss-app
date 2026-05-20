module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const buffers = [];
  for await (const chunk of req) { buffers.push(chunk); }
  const body = Buffer.concat(buffers).toString();
  const params = new URLSearchParams(body);
  const token = params.get('g-recaptcha-response');
  
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!token) return res.status(400).send('Captcha Token Missing');

  try {
    // Revert to Standard reCAPTCHA v3 / v2 API because the provided key format 
    // (6LfXr_Is...) is a classic Secret Key, not a Google Cloud API Key.
    const googleUrl = `https://www.google.com/recaptcha/api/siteverify`;
    
    const response = await fetch(googleUrl, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }).toString()
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
        note: 'The key looks like a classic reCAPTCHA Secret Key. Ensuring standard v3 API is used.'
      });
    }
  } catch (err) {
    res.status(500).send('Server Error: ' + err.message);
  }
};
