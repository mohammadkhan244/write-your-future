export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { headline, signal, story, analysisRaw } = req.body || {};
  if (!analysisRaw) return res.status(400).json({ error: 'Missing analysisRaw' });

  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return res.status(500).json({ error: 'KV not configured' });
  }

  const id = Math.random().toString(36).slice(2, 9);
  const payload = JSON.stringify({ headline: headline || '', signal: signal || '', story: story || '', analysisRaw });
  const ttl = 60 * 60 * 24 * 90; // 90 days

  const kvRes = await fetch(`${process.env.KV_REST_API_URL}/set/${id}/${encodeURIComponent(payload)}?ex=${ttl}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
  });

  if (!kvRes.ok) {
    const err = await kvRes.text();
    console.error('KV set error:', err);
    return res.status(500).json({ error: 'Failed to store share link' });
  }

  const origin = req.headers['x-forwarded-host']
    ? `https://${req.headers['x-forwarded-host']}`
    : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  return res.json({ url: `${origin}/?id=${id}` });
}
