import { Resend } from 'resend';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, stage, type, message, featureRequest } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Message required' });

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'EWS Feedback <mohammadkhan@themohammadkhan.com>',
      to: 'mohammadkhan@themohammadkhan.com',
      subject: `[${type || 'Feedback'}] Stage ${stage || '?'} — ${name || 'Anonymous'}`,
      html: `
        <p><strong>Type:</strong> ${type || 'Feedback'}</p>
        <p><strong>Name:</strong> ${name || 'Not provided'}</p>
        <p><strong>Email:</strong> ${email || 'Not provided'}</p>
        <p><strong>Stage:</strong> ${stage || 'Unknown'}</p>
        <p><strong>Message:</strong><br>${message}</p>
        ${featureRequest ? `<p><strong>Feature Request:</strong><br>${featureRequest}</p>` : ''}
      `
    });

    const existing = await kv.get('feedback:log') || [];
    const entry = {
      id: Date.now(),
      type: type || 'Feedback',
      name: name || 'Anonymous',
      email: email || '',
      stage: stage || 'unknown',
      message,
      featureRequest: featureRequest || '',
      submittedAt: new Date().toISOString()
    };
    const updated = [entry, ...existing].slice(0, 50);
    await kv.set('feedback:log', updated, { ex: 60 * 60 * 24 * 90 });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
