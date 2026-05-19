module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  // Vercel hat den Body oft schon geparst, wenn der Content-Type stimmt.
  // Wir unterstützen beide Wege (geparst oder Stream).
  let token = req.body?.['g-recaptcha-response'];
  
  if (!token) {
    // Falls nicht geparst, manuell aus dem Stream lesen
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const body = Buffer.concat(buffers).toString();
    const params = new URLSearchParams(body);
    token = params.get('g-recaptcha-response');
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!token) {
    return res.status(400).send('Captcha Token Missing');
  }

  try {
    // Wir senden die Daten als URLSearchParams Objekt, was fetch automatisch 
    // als korrektes application/x-www-form-urlencoded formatiert.
    const googleParams = new URLSearchParams();
    googleParams.append('secret', secret);
    googleParams.append('response', token);

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: googleParams
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
        sent_token_preview: token.substring(0, 10) + '...'
      });
    }
  } catch (err) {
    res.status(500).send('Server Error: ' + err.message);
  }
};
