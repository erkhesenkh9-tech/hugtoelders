/** Vercel serverless function — forwards contact form to hugstoelders@gmail.com via Web3Forms. */
module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return res.status(500).json({ error: 'Contact form is not configured on the server' });
  }

  const { name, email, subject, message, interest } = req.body || {};
  const interestLabel = interest || subject;

  if (!name || !email || !message || !interestLabel) {
    return res.status(400).json({ error: 'Please fill in all required fields' });
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `H2E Contact: ${interestLabel} from ${name}`,
        from_name: name,
        email,
        message: `Interest: ${interestLabel}\nReply to: ${email}\n\n${message}`
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to send message');
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to send message' });
  }
};
