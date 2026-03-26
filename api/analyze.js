import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    signal, headline, story,
    ideaType = 'personal',
    icp = '', method = '', destination = '', competition = '',
    q1 = '', q2 = '', q3 = ''
  } = req.body;

  if (!signal || !story) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are analyzing a future scenario written as part of an idea stress test exercise.

Idea: ${signal}
Headline: ${headline}
Idea type: ${ideaType}${ideaType === 'business' ? `
Customer (ICP): ${icp}
How they find out: ${method}
3-year destination: ${destination}
Alternatives/competition: ${competition}` : ''}
Their story: ${story}

Analyze in exactly these labeled sections. Be specific to their actual words. Quote them back where relevant. Never be generic.

UNPLANNED
What did they surface that they didn't consciously plan to write? 2-3 specific observations from the text.

EMOTIONAL FIELD
What emotions are embedded that they didn't name directly? Name 4-6 specific emotional states present in the writing.

ASSUMPTIONS
The 5 most load-bearing assumptions in this story — beliefs that would have to be true for this future to exist. Rank 1-5, most load-bearing first.

PREREQUISITES
What technology, social norms, relationships, or systems must exist for this future to work?

EARLY WARNINGS
3 specific, observable things happening TODAY that signal this future is already arriving. Make these concrete and watchable.

ABSENCE
What was conspicuously missing from this story given the signal? What does that absence reveal?

ONE ACTION
One concrete action they could take THIS WEEK to test whether their assumptions are right. Under 2 hours. Under $50. Specific to their story, not generic advice.

THE PERSON'S OWN REFLECTIONS
They answered three questions before seeing any analysis. Use these to sharpen your findings — they are evidence too.

Who's in the story and who isn't:
${q1}

What they assumed stayed the same:
${q2}

What they didn't write about:
${q3}

Where their reflections confirm your findings, note it. Where they contradict or add to your findings, note that too.`,
        },
      ],
    });

    res.json({ analysis: response.content[0].text });
  } catch (err) {
    console.error("Anthropic API error:", err);
    res.status(500).json({ error: err.message || "Analysis failed" });
  }
}
