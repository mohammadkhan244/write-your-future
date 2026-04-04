import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  console.log("=== ANALYZE START ===", new Date().toISOString());
  console.log("ANTHROPIC_API_KEY present:", !!process.env.ANTHROPIC_API_KEY);
  console.log("Story length:", req.body?.story?.length);
  console.log("IdeaType:", req.body?.ideaType);

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

  const {
    idea, headline, story, ideaType,
    icp, method, destination, competition,
    q1, q2, q3
  } = req.body;

  if (!story || story.trim().length < 10) {
    return res.status(400).json({
      error: "Story too short",
      detail: `Story length: ${story?.length || 0} characters`
    });
  }

  const isPersonal = ideaType !== "business";

  const personalPrompt = `You are analyzing a 10-minute clarity sprint. Someone has been circling a decision or idea and wrote a story where it resolved. Surface what their writing reveals that analytical thinking couldn't reach.

For every finding, quote their exact words as evidence. If something is absent from the story, name it — absence is information.

What they're circling: ${idea || "not specified"}
Headline they gave it: ${headline || "not specified"}
Story they wrote:
${story}

Their own reflections:
- Who's in the story / who isn't: ${q1 || "not answered"}
- What they assumed stayed the same: ${q2 || "not answered"}
- What they didn't write about: ${q3 || "not answered"}

Respond with exactly these 7 sections in exactly this order, using exactly these headers:

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
What was conspicuously absent from the story given what they said they were circling? Name it directly. Reference their Q3 answer where relevant. Absence of evidence is evidence.

## PART 7 — ONE THING TO DO THIS WEEK
One specific action only. Under 2 hours. Under $50. Produces real signal from actual humans — not planning, not research, not more thinking. Make it specific to what this person actually wrote, not generic advice.`;

  const businessPrompt = `You are analyzing a 10-minute clarity sprint about a business idea or career move. Someone has been circling this and wrote a story where it resolved. Surface what their writing reveals that analytical thinking couldn't reach.

For every finding, quote their exact words as evidence. If something is absent, name it — absence is information.

What they're circling: ${idea || "not specified"}
Headline they gave it: ${headline || "not specified"}
Story they wrote:
${story}

Their stated vision:
- Who it's for: ${icp || "not specified"}
- Method: ${method || "not specified"}
- Transformation: ${destination || "not specified"}
- What already exists: ${competition || "not specified"}

Their own reflections:
- Who's in the story / who isn't: ${q1 || "not answered"}
- What they assumed stayed the same: ${q2 || "not answered"}
- What they didn't write about: ${q3 || "not answered"}

Respond with exactly these 8 sections in exactly this order, using exactly these headers:

## PART 0 — THE WORLDVIEW UNDERNEATH
What does this story assume to be permanently true about the market, customers, and how value gets created? What future does this worldview create if it's right? What falls through the cracks if it's wrong?

## PART 1 — WHAT YOU DIDN'T PLAN TO WRITE
Two or three things that surfaced in the writing that the person didn't consciously plan to include. Quote exact phrases. Explain why each feels unplanned.

## PART 2 — THE EMOTIONAL FIELD UNDERNEATH
Name 4-6 emotional states embedded in the story without being directly stated. For each: quote the exact phrase, name the specific emotion, explain what it reveals. Be precise.

## PART 3 — THE ASSUMPTIONS RUNNING YOUR STORY
The 5 most load-bearing assumptions. Rank 1-5. Include assumptions about market, customer, timing, and capability. Format each as:
[number]. "[exact quote]" — [why load-bearing]

## PART 4 — STATED VISION VS WHAT THE STORY REVEALED
Compare what they said they were building against what the story actually showed. For each row quote evidence or note its absence.

WHO IT'S FOR
Stated: ${icp || "not specified"}
Story revealed: [who actually appeared in the story]
Evidence: [direct quote or "absent from story"]

METHOD
Stated: ${method || "not specified"}
Story revealed: [how the work was actually described]
Evidence: [direct quote or "absent from story"]

DESTINATION
Stated: ${destination || "not specified"}
Story revealed: [where the story actually ended up]
Evidence: [direct quote or "absent from story"]

COMPETITION
Stated: ${competition || "not specified"}
Story revealed: [what the story assumed didn't exist]
Evidence: [direct quote or "absent from story — which is itself an assumption"]

## PART 5 — WHAT TO WATCH FOR RIGHT NOW
3 signals:
EYEWITNESS: [something they'd notice in daily life without trying]
EXPLAINER: [connects this signal to other domains]
EXPERT: [only people deep in this market would catch]
Then: who else is watching the same signals for completely different reasons?

## PART 6 — WHAT'S MISSING AND WHAT THAT MEANS
What was conspicuously absent given what they said they were circling? Name it directly. Reference their Q3 answer. Absence is evidence.

## PART 7 — ONE THING TO DO THIS WEEK
One specific action. Under 2 hours. Under $50. Produces signal from actual humans. Specific to their ICP and method.`;

  const prompt = isPersonal ? personalPrompt : businessPrompt;

  console.log("=== PROMPT SECTION HEADERS ===");
  const headers = prompt.match(/## PART \d+ —.+/g);
  console.log(headers);

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    console.log("=== CALLING ANTHROPIC ===");

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }]
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
