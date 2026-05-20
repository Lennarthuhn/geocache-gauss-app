module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  // Body manuell auslesen (verhindert Parsing-Fehler bei Vercel)
  const buffers = [];
  for await (const chunk of req) { buffers.push(chunk); }
  const body = Buffer.concat(buffers).toString();
  
  // Token aus dem Formular-POST extrahieren
  const params = new URLSearchParams(body);
  const token = params.get('g-recaptcha-response');
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!token) return res.status(400).send('Captcha Token Missing');

  try {
    // WICHTIG: Laut Dokumentation müssen die Parameter für siteverify 
    // entweder in der URL ODER im POST-Body als x-www-form-urlencoded gesendet werden.
    // Wir senden sie jetzt EXAKT im Body, wie Google es für v2/v3 Schlüssel erwartet.
    const googleResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secret,
        response: token
      }).toString()
    });
    
    const data = await googleResponse.json();

    if (data.success) {
      res.setHeader('Set-Cookie', `auth_token=verified; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);
      res.writeHead(302, { Location: '/map' });
      res.end();
    } else {
      res.status(401).json({
        error: 'Verification Failed',
        google_response: data,
        debug: {
          token_preview: token.substring(0, 15) + '...',
          secret_preview: secret ? secret.substring(0, 5) + '...' : 'null'
        }
      });
    }
  } catch (err) {
    res.status(500).send('Server Error: ' + err.message);
  }
};
