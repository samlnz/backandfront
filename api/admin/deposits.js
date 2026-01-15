import fetch from 'node-fetch';

// Basic auth helper
function unauthorized(res) {
  res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
  return res.status(401).send('Unauthorized');
}

export default async function handler(req, res) {
  const auth = req.headers.authorization;
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!auth || !auth.startsWith('Basic ')) return unauthorized(res);
  const creds = Buffer.from(auth.split(' ')[1], 'base64').toString();
  const [user, pass] = creds.split(':');
  if (user !== ADMIN_USERNAME || pass !== ADMIN_PASSWORD) return unauthorized(res);

  // List GitHub issues labeled 'deposit'
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = process.env.REPO_OWNER;
  const REPO_NAME = process.env.REPO_NAME;
  if (!(GITHUB_TOKEN && REPO_OWNER && REPO_NAME)) {
    return res.status(400).json({ error: 'missing_github_config' });
  }
  try {
    const ghResp = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?labels=deposit&state=open`, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!ghResp.ok) return res.status(500).json({ error: 'github_error' });
    const issues = await ghResp.json();
    return res.json({ issues });
  } catch (e) {
    return res.status(500).json({ error: 'internal', message: e.message || String(e) });
  }
}
