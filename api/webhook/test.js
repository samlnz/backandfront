import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const data = req.body || {};

  const headers = req.headers || {};
  const validation = {
    received: data,
    headers,
    ok: true,
  };

  if (data && typeof data.amount !== 'undefined' && data.phone) validation.format = 'tasker';
  else if (headers['x-github-event']) validation.format = 'github';
  else validation.format = 'unknown';

  return res.status(200).json(validation);
}
