const { verify } = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  // Extrahiere Body-Daten (Vercel parst POST-Body automatisch für application/x-www-form-urlencoded)
  const token = req.body['g-recaptcha-response'];
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!token) {
    return res.status(400).send('Captcha Token Missing');
  }

  try {
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`
    });
    
    const data = await response.json();

    if (data.success) {
      res.setHeader('Set-Cookie', `auth_token=verified; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);
      res.writeHead(302, { Location: '/map' });
      res.end();
    } else {
      res.status(401).send('Captcha Verification Failed: ' + JSON.stringify(data['error-codes']));
    }
  } catch (err) {
    res.status(500).send('Server Error during Verification');
  }
};
