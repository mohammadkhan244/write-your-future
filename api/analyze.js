import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  console.log("=== ANALYZE START ===", new Date().toISOString());
  console.log("ANTHROPIC_API_KEY present:", !!process.env.ANTHROPIC_API_KEY);
  console.log("Story length:", req.body?.story?.length);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("MISSING ANTHROPIC_API_KEY");
    return res.status(500).json({
      error: "API key not configured",
      detail: "ANTHROPIC_API_KEY environment variable is missing"
    });
  }

  const { idea, headline, story, narrativeName, q1 } = req.body;

  const analysisPrompt = `You are analyzing a 10-minute clarity sprint. Someone has been circling a decision, idea, or question and wrote a story where it resolved. Surface what their writing reveals that analytical thinking couldn't reach.

For every finding, quote their exact words as evidence. If something is absent from the story, name it — absence is information.

What they're circling: ${idea || "not specified"}
Headline they gave it: ${headline || "not specified"}
Narrative name they gave it: ${narrativeName || "not named"}
Story they wrote:
${story}

What surprised them when writing it: ${q1 || "not answered"}

Respond with exactly these sections in exactly this order, using exactly these headers:

## YOUR OWN WORDS
Find the single most unplanned line in this story — the one that reads like it slipped past the writer's conscious control. Not the most dramatic line, not the most poetic line — the one that was written before the writer could decide whether to write it.

Return it in exactly this format with nothing before or after:

"[the line]"
[Why this line stood out — what makes it feel unplanned rather than constructed. 2-3 sentences. Reference specific words or details from the line itself, not general observations about the story.]
Before you read further, consider: [One question specific to this line and this person only. Not a clarifying question — a deepening one. It must be answerable only by this specific person about this specific line. It must open something rather than explain something. It cannot apply to any other story or any other writer.]

## PART 0 — THE WORLDVIEW UNDERNEATH
What does this story assume to be permanently true about how the world works — about people, systems, and what gets rewarded? What future does this worldview create if it's right? What falls through the cracks if it's wrong?

## PART 1 — WHAT YOU DIDN'T PLAN TO WRITE
Two or three things that surfaced in the writing that the person didn't consciously plan to include. Quote exact phrases. Explain why each feels unplanned rather than constructed.

## PART 2 — THE EMOTIONAL FIELD UNDERNEATH
Name 4-6 emotional states embedded in the story without being directly stated. For each: quote the exact phrase that carries the emotion, name the specific emotion, explain what it reveals about what this person actually values or fears. Be precise — not "sadness" but "grief at what was left behind."

## PART 3 — THE ASSUMPTIONS RUNNING YOUR STORY
The 5 most load-bearing assumptions in this story. Rank 1-5, most load-bearing first. Format each exactly as:
[number]. "[exact quote from story]" — [why this assumption is load-bearing]

## PART 4 — WHAT MUST BE TRUE FOR THIS FUTURE TO EXIST
4 conditions — technological, social, relational, or systemic — that the world would need to meet for this story's version of success to be possible. These are not assumptions about the person. They are conditions about the world. Quote story evidence where relevant.

## PART 5 — WHAT TO WATCH FOR RIGHT NOW
3 signals classified exactly as:
EYEWITNESS: [something they'd notice in daily life without trying — no research required]
EXPLAINER: [something that connects this signal to other domains or industries]
EXPERT: [something only people deep in this space would catch]

## PART 6 — WHAT'S MISSING AND WHAT THAT MEANS
What was conspicuously absent from the story given what they said they were circling? Name it directly. Reference their surprise answer where relevant. Absence of evidence is evidence.

## PART 8 — DEFAULT NARRATIVE

NAME IT
One sentence. The exact narrative running underneath this story. Not a summary of beliefs — the cultural or inherited story they're operating inside without knowing it.

WHY IT MATTERS
Two to three sentences. What this narrative has already been building in the background — decisions made, paths taken, energy spent — without the person choosing it consciously. Make it feel like recognition, not accusation.

THE EVIDENCE IN YOUR STORY
Two to four specific moments from the story that prove this narrative is already active. Each one should feel like a fingerprint, not a critique.

WHAT IT COSTS
One to two sentences. Not what's wrong with the narrative — what it makes impossible to see or do while it stays invisible. This is the reason naming it matters.

ONE MOVE
One specific action that addresses both what the analysis revealed and what the Default Narrative has been building. Under 2 hours. Under $50. Produces real signal from actual humans — not planning, not research, not more thinking. It must be specific to what this person actually wrote and it must test whether the narrative is load-bearing or optional. Not "reflect on it." Something that produces actual signal.

The tone throughout should feel like discovery, not diagnosis. The person should read this and think "how did it know that" — not "I'm being analyzed."`;

  console.log("=== PROMPT SECTION HEADERS ===");
  const headers = analysisPrompt.match(/## PART \d+ —.+/g);
  console.log(headers);

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    console.log("=== CALLING ANTHROPIC ===");

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [{ role: "user", content: analysisPrompt }]
    });

    console.log("=== ANTHROPIC SUCCESS ===");
    console.log("Stop reason:", response.stop_reason);
    console.log("Output tokens:", response.usage?.output_tokens);

    const analysisText = response.content[0].text;

    console.log("=== RETURNED SECTION HEADERS ===");
    const returnedHeaders = analysisText.match(/## PART \d+ —.+/g);
    console.log(returnedHeaders);

    return res.json({
      success: true,
      analysis: analysisText
    });

  } catch (err) {
    console.error("=== ANTHROPIC ERROR ===");
    console.error("Name:", err.name);
    console.error("Message:", err.message);
    console.error("Status:", err.status);
    console.error("Detail:", JSON.stringify(err.error || {}, null, 2));

    return res.status(500).json({
      error: "Anthropic API call failed",
      name: err.name,
      message: err.message,
      status: err.status || null,
      detail: err.error || null
    });
  }
}
