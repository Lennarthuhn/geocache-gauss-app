const { verify } = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const buffers = [];
  for await (const chunk of req) { buffers.push(chunk); }
  const body = Buffer.concat(buffers).toString();
  const params = new URLSearchParams(body);
  const token = params.get('g-recaptcha-response');
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!token) {
    // Statt einer Fehlermeldung leiten wir mit einem Fehler-Parameter zurück
    res.writeHead(302, { Location: '/?error=missing_captcha' });
    return res.end();
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`
    });
    
    const data = await response.json();

    if (data.success) {
      res.setHeader('Set-Cookie', `auth_token=verified; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);
      res.writeHead(302, { Location: '/' });
      res.end();
    } else {
      // Auch bei fehlgeschlagener Verifizierung zurück zur Startseite mit Error
      res.writeHead(302, { Location: '/?error=invalid_captcha' });
      res.end();
    }
  } catch (err) {
    res.writeHead(302, { Location: '/?error=server_error' });
    res.end();
  }
};
