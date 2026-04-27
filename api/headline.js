import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key not configured' });

  const { story, signal } = req.body;
  if (!story || story.trim().length < 20) return res.status(400).json({ error: 'Story too short' });

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [{
        role: "user",
        content: `Someone wrote a 10-minute clarity story about: "${signal || 'a decision they are circling'}"\n\nStory excerpt:\n${story.slice(0, 800)}\n\nGive 5 short memorable names for this story — the kind that is memetic, meaning someone could reference it in future conversation and immediately recall what it was about. Each should be 3-6 words. Return ONLY a JSON array of 5 strings, nothing else.`
      }]
    });

    const text = response.content[0].text.trim();
    const match = text.match(/\[[\s\S]*\]/);
    const examples = match ? JSON.parse(match[0]) : JSON.parse(text);
    if (!Array.isArray(examples)) throw new Error('Not an array');
    return res.json({ success: true, examples });
  } catch (err) {
    console.error('Headline API error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
