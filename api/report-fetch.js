import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const { session, token } = req.query;
  if (!session) return res.status(400).json({ error: 'Missing session ID' });

  // Validate admin token if provided (allows admin access regardless of future restrictions)
  let isAdmin = false;
  if (token) {
    try {
      const valid = await kv.get(`admin:token:${token}`);
      isAdmin = !!valid;
    } catch {}
  }

  try {
    const data = await kv.get(`report:${session}`);
    if (!data) return res.status(404).json({ error: 'Report not found' });
    return res.status(200).json({ success: true, data, isAdmin });
  } catch (err) {
    console.error('report-fetch error:', err);
    return res.status(500).json({ error: err.message });
  }
}
