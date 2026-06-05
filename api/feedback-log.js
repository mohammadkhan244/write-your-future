import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const log = await kv.get('feedback:log') || [];
    return res.status(200).json({ success: true, log });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
