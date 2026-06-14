import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  const { token } = req.query;
  if (!token) return res.status(401).json({ error: 'No token' });

  const valid = await kv.get(`admin:token:${token}`);
  if (!valid) return res.status(401).json({ error: 'Invalid or expired token' });

  try {
    const [feedback, narratives, reportIndex] = await Promise.all([
      kv.get('feedback:log'),
      kv.get('narrative:log'),
      kv.get('report:index')
    ]);
    return res.status(200).json({
      success: true,
      feedback: feedback || [],
      narratives: narratives || [],
      reports: reportIndex || []
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
