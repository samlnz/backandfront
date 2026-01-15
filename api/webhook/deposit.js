import fetch from 'node-fetch';

// Environment variables expected at deploy time:
// TELEGRAM_BOT_TOKEN, ADMIN_CHAT_ID, GITHUB_TOKEN, REPO_OWNER, REPO_NAME

function parseAmountPhone(data) {
  let amount = null;
  let phone = null;
  if (data && typeof data.amount !== 'undefined') amount = Number(data.amount) || null;
  if (data && data.phone) phone = String(data.phone);
  if ((!amount || !phone) && data.issue && data.issue.title) {
    const title = data.issue.title;
    const amtMatch = title.match(/\b(\d+(?:\.\d+)?)\b/);
    if (amtMatch) amount = Number(amtMatch[1]);
    const phoneMatch = title.match(/(09\d{7,8}|\+?\d{7,15})/);
    if (phoneMatch) phone = phoneMatch[1];
  }
  return { amount, phone };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const data = req.body || {};
  const { amount, phone } = parseAmountPhone(data);
  if (!amount || !phone) return res.status(400).json({ error: 'invalid_payload', details: { amount, phone } });

  const issueTitle = `Deposit: ${amount} - ${phone}`;
  const issueBody = `Deposit received\n\nAmount: ${amount}\nPhone: ${phone}\n\nRaw payload:\n\n${JSON.stringify(data, null, 2)}`;

  // Create a GitHub issue to persist the deposit (requires GITHUB_TOKEN + REPO info)
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = process.env.REPO_OWNER;
  const REPO_NAME = process.env.REPO_NAME;
  let issueUrl = null;
  if (GITHUB_TOKEN && REPO_OWNER && REPO_NAME) {
    try {
      const ghResp = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: issueTitle, body: issueBody, labels: ['deposit'] })
      });
      if (ghResp.ok) {
        const ghJson = await ghResp.json();
        issueUrl = ghJson.html_url;
      }
    } catch (e) {
      console.warn('GitHub issue creation failed', e.message || e);
    }
  }

  // Notify admin via Telegram if configured
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
  if (TELEGRAM_BOT_TOKEN && ADMIN_CHAT_ID) {
    try {
      const text = `New deposit received:\nAmount: ${amount}\nPhone: ${phone}` + (issueUrl ? `\nIssue: ${issueUrl}` : '');
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text })
      });
    } catch (e) {
      console.warn('Telegram notification failed', e.message || e);
    }
  }

  return res.status(200).json({ ok: true, issueUrl });
}
