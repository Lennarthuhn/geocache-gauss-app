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
    // Sende die Daten exakt so, wie Google es für v3 dokumentiert
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`
    });
    
    const data = await response.json();

    // v3 Prüfung: Wir akzeptieren Erfolg (data.success)
    if (data.success) {
      res.setHeader('Set-Cookie', `auth_token=verified; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);
      res.writeHead(302, { Location: '/map' });
      res.end();
    } else {
      // Detailliertes Debugging für Lennart
      res.status(401).json({
        error: 'v3 Verification Failed',
        google_response: data,
        debug_info: {
          secret_preview: secret ? secret.substring(0, 5) + '...' : 'MISSING',
          token_received: !!token,
          sent_body_type: 'urlencoded'
        }
      });
    }
  } catch (err) {
    res.status(500).send('Server Error: ' + err.message);
  }
};
