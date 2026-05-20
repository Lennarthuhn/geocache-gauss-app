module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const buffers = [];
  for await (const chunk of req) { buffers.push(chunk); }
  const body = Buffer.concat(buffers).toString();
  const params = new URLSearchParams(body);
  const token = params.get('g-recaptcha-response');
  
  const apiKey = process.env.RECAPTCHA_SECRET_KEY;
  const projectID = "project-628827b8-1611-446e-9fa";
  const siteKey = "6LfXr_IsAAAAAMcDUJxt2EtQvVbsLjT8UCFthNUR";

  if (!token) return res.status(400).send('Captcha Token Missing');

  try {
    const enterpriseUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectID}/assessments?key=${apiKey}`;

    const response = await fetch(enterpriseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: {
          token: token,
          siteKey: siteKey,
          expectedAction: "LOGIN"
        }
      })
    });
    
    const data = await response.json();

    if (data.tokenProperties && data.tokenProperties.valid === true) {
      res.setHeader('Set-Cookie', `auth_token=verified; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);
      res.writeHead(302, { Location: '/map' });
      res.end();
    } else {
      res.status(401).json({
        error: 'Enterprise Verification Failed',
        details: data
      });
    }
  } catch (err) {
    res.status(500).send('Server Error: ' + err.message);
  }
};
