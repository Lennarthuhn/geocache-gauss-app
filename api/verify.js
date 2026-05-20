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
    const googleUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`;
    const response = await fetch(googleUrl, { method: 'POST' });
    const data = await response.json();

    if (data.success) {
      res.setHeader('Set-Cookie', `auth_token=verified; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);
      res.writeHead(302, { Location: '/map' });
      res.end();
    } else {
      res.status(401).json({
        error: 'Enterprise Verification Failed',
        google_response: data,
        tip: 'Stelle sicher, dass in der Cloud Console fuer den Key "Legacy-Unterstuetzung" aktiv ist oder nutze reCAPTCHA v3 (nicht Enterprise).'
      });
    }
  } catch (err) {
    res.status(500).send('Server Error: ' + err.message);
  }
};
