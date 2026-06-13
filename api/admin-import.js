import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { token, narratives = [], feedback = [] } = req.body || {};
  if (!token) return res.status(401).json({ error: 'No token' });

  const valid = await kv.get(`admin:token:${token}`);
  if (!valid) return res.status(401).json({ error: 'Invalid or expired token' });

  const TTL = 60 * 60 * 24 * 365;
  const results = {};

  try {
    if (narratives.length) {
      const existing = await kv.get('narrative:log') || [];
      const existingIds = new Set(existing.map(n => n.sessionId).filter(Boolean));
      const newEntries = narratives.filter(n => n.sessionId && !existingIds.has(n.sessionId));
      await kv.set('narrative:log', [...existing, ...newEntries].slice(0, 500), { ex: TTL });
      results.narrativesImported = newEntries.length;
      results.narrativesSkipped = narratives.length - newEntries.length;
    }

    if (feedback.length) {
      const existing = await kv.get('feedback:log') || [];
      const existingIds = new Set(existing.map(f => f.id).filter(Boolean));
      const newEntries = feedback.filter(f => f.id && !existingIds.has(f.id));
      await kv.set('feedback:log', [...existing, ...newEntries].slice(0, 500), { ex: TTL });
      results.feedbackImported = newEntries.length;
      results.feedbackSkipped = feedback.length - newEntries.length;
    }

    return res.status(200).json({ success: true, ...results });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
