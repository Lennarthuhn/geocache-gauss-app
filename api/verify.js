const { verify } = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  // Vercel parst POST-Bodys von HTML-Formularen automatisch in req.body
  const token = req.body['g-recaptcha-response'];
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!token) {
    return res.status(400).send('Captcha Token Missing');
  }

  try {
    // reCAPTCHA v3 Verifizierung (Backend-Check)
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;
    
    const response = await fetch(verifyUrl, { method: 'POST' });
    const data = await response.json();

    if (data.success && data.score >= 0.5) {
      // Erfolgreich verifiziert: Setze Auth-Cookie
      res.setHeader('Set-Cookie', `auth_token=verified; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);
      res.writeHead(302, { Location: '/map' });
      res.end();
    } else {
      // Fehler-Details ausgeben
      const errorMsg = data['error-codes'] ? data['error-codes'].join(', ') : 'Low Score (' + data.score + ')';
      res.status(401).send(`Verification Failed: ${errorMsg}`);
    }
  } catch (err) {
    console.error('Verify Error:', err);
    res.status(500).send('Server Error during Verification');
  }
};
