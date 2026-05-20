module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  // Body manuell auslesen
  const buffers = [];
  for await (const chunk of req) { buffers.push(chunk); }
  const body = Buffer.concat(buffers).toString();
  const params = new URLSearchParams(body);
  const token = params.get('g-recaptcha-response');
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!token) return res.status(400).send('Captcha Token Missing');

  try {
    // Vercel/Node fetch an die Google API (Standard v3)
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`
    });
    
    const data = await response.json();

    if (data.success) {
      // Erfolgreich: Cookie setzen und zur Karte
      res.setHeader('Set-Cookie', `auth_token=verified; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);
      res.writeHead(302, { Location: '/map' });
      res.end();
    } else {
      // Fehler: JSON-Debug-Ausgabe
      res.status(401).json({
        error: 'Verification Failed',
        google_response: data,
        note: 'Check if RECAPTCHA_SECRET_KEY in Vercel matches the "Geheimer Schlüssel" from Google Console.'
      });
    }
  } catch (err) {
    res.status(500).send('Server Error: ' + err.message);
  }
};
