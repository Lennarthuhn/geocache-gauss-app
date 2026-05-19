module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  // Body-Inhalt sammeln
  const buffers = [];
  for await (const chunk of req) { buffers.push(chunk); }
  const body = Buffer.concat(buffers).toString();
  
  // Token extrahieren (URLSearchParams parst sowohl "key=val" als auch Roh-Strings)
  const params = new URLSearchParams(body);
  const token = params.get('g-recaptcha-response');
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!token) return res.status(400).send('Captcha Token Missing');

  try {
    // Sende Daten EXAKT als URLSearchParams Objekt (Fetch setzt Header automatisch)
    const verificationData = new URLSearchParams({
      secret: secret,
      response: token
    });

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: verificationData.toString()
    });
    
    const data = await response.json();

    if (data.success) {
      res.setHeader('Set-Cookie', `auth_token=verified; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);
      res.writeHead(302, { Location: '/map' });
      res.end();
    } else {
      res.status(401).json({
        error: 'v3 Verification Failed',
        google_response: data,
        debug_internal: {
          body_length: body.length,
          token_length: token.length,
          secret_verified: secret === "6LfXr_IsAAAAAK6AyCrOrpTU4p5iAv21Q1NTaiWU"
        }
      });
    }
  } catch (err) {
    res.status(500).send('Server Error: ' + err.message);
  }
};
