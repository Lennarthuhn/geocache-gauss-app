module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  // body-parser ist bei Vercel Node Functions für Form-POSTs nicht immer aktiv
  // Wir lesen den Stream manuell aus
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  
  req.on('end', async () => {
    const params = new URLSearchParams(body);
    const token = params.get('g-recaptcha-response');
    const secret = process.env.RECAPTCHA_SECRET_KEY;

    if (!token) {
      return res.status(400).send('Captcha Token Missing in Body');
    }

    try {
      // WICHTIG: Google erwartet die Parameter im Body eines POST-Requests, nicht in der URL
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secret}&response=${token}`
      });
      
      const data = await response.json();

      if (data.success && data.score >= 0.3) {
        res.setHeader('Set-Cookie', `auth_token=verified; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);
        res.writeHead(302, { Location: '/map' });
        res.end();
      } else {
        res.status(401).json({
          error: 'Verification Failed',
          google_response: data
        });
      }
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });
};
