// SYSTEM CONTRACT: EWS_SYSTEM_CONTRACT.md
// All changes to this file must be checked against the system contract before implementation.
// If a proposed change cannot be mapped to one of the six primitives, it does not belong in EWS.
import Anthropic from '@anthropic-ai/sdk';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { story, signal, headline, narrativeName, analysisRaw, stage = 'early', lens = '', sessionId } = req.body;

  if (!story || story.trim().length < 50) {
    return res.status(400).json({ error: 'Story too short' });
  }

  const client = new Anthropic();

  const calibrationBlock = `---
Calibration instruction (runs before all sections)

Where they are: ${stage}
Their lens or worldview (if provided): ${lens || 'none provided'}

${stage === 'deep'
  ? `This person is deep in their subject. Use VERIFICATION mode throughout.
- Vignettes: Write them as a map of what this narrative has already built — not a warning. The 1/3/5/10 year scenes should feel like recognition, not alarm. Show the costs as structural consequences of a known pattern, not as a cautionary tale.
- Replace the section "WHAT THIS NARRATIVE COSTS WITHOUT YOU REALIZING IT" with "WHAT THIS NARRATIVE MAKES POSSIBLE — AND WHAT IT KEEPS FORECLOSING". Show both sides: what this narrative has enabled and what it continues to block from view, even at this level of depth.`
  : `This person is ${stage === 'mid' ? 'in the middle of' : 'just starting to explore'} their subject. Use DISCOVERY mode throughout.
- Vignettes: Write them as a portrait of where this narrative is already taking them — show compounding, not alarm. The uncanniness should come from specificity.
- The costs section should feel like naming something the reader already half-knew, not a critique.`}

Write all timeline vignettes using 'you' — second person. Never use the reader's name or any name placeholder.
---`;

  const prompt = `You are writing a Default Narrative Report for Write Your Future — Modern Myths, by Mohammad Khan.

${calibrationBlock}

You are writing in Mohammad Khan's voice. Here is how he writes:

VOICE RULES:
- Short declaratives that build pressure, then a longer sentence that releases it in a new direction
- Single-sentence paragraphs at arrival moments
- Fragments as completeness
- Precise and dry. Understated, never emphatic
- "I" earns authority before "you" challenges. Never opens in "you"
- One dry observation per section. Never scattered warmth
- Never uses: em dashes, "journey," "resonate," "empower," "leverage," soft hedges, preachy closers
- Opens with a specific observed detail or quoted line — never with a thesis
- The insight arrives after the observation, not before
- Never moralizes. Observes and lets it sit
- Trusts the reader to make the connection without over-explaining

STYLE REFERENCE:
"My mom sat beneath the amber light at our breakfast table, fidgeting with a cut-open envelope and her shoulders were tense. My brother furrowed his eyebrows and oscillated like a pendulum in the background between the unlit dining room and lit breakfast table. An obvious tell when something is on his mind."

"Events don't tell you who someone is. Choices do."

"The 'agh' is the tell. That's not a planned detail. That's a real feeling that slipped out before the editing brain could catch it."

FOR THE 1/3/5/10 YEAR VIGNETTES:
- Write each one as a scene, not a summary
- Open with a sensory detail pulled directly from their actual story
- Show the world the narrative has built — don't explain the lesson, let the scene carry it
- Each vignette should feel like the opening paragraph of a short story
- The uncanniness comes from specificity, not drama
- Style: grounded, specific, slightly uncanny — Ted Chiang, PKD, Harlan Ellison running a theme forward
- End with one sentence that lands and stops. No call to action.

---

What they're circling: ${signal || 'not specified'}
Headline they gave it: ${headline || 'not specified'}
Narrative name: ${narrativeName || headline || 'not named'}

Their story:
${story}

Previous analysis (use this to extract the Default Narrative already identified — do not contradict it, build from it):
${analysisRaw || 'not available'}

---

Write the report in exactly this structure, using exactly these section headers:

## THE LENS

Write 3-4 short paragraphs introducing the storytelling lens — the filmmaker/blocking framing. Use Mohammad's voice. End with: "This report reads your story the way a filmmaker reads a scene. Not to judge the plot. But to find the choices underneath it."

## WHAT YOU DIDN'T PLAN TO WRITE

Find 3 specific moments from the story that slipped through — things the writer didn't consciously plan. For each: quote the exact line, give it a short bold title (2-4 words), then explain in 2-3 sentences why it feels unplanned. Use Mohammad's voice throughout. The explanation should observe, not diagnose.

## [TITLE — name the narrative in one short declarative sentence, no quotes]

Open with: "That's what the story is really about."

Then name the Default Narrative in bold — one sentence, the invisible operating belief.

Write 3-4 short paragraphs in letter form, addressed directly to the reader. Name what you noticed. Quote the exact line that gave it away. Explain why that line is the tell — not the theme, the specific line. Don't hedge. Just say it.

End this section with the load-bearing assumption — one sentence, bold.

## LIKE ANY STORY IN A BOOK OR FILM, THEY ALL HAVE A DESTINATION. HERE'S WHERE YOURS COULD END UP.

Write four vignettes. Each one is a scene, not a summary.

**1 year.** [scene — one paragraph, opens with sensory detail from their story]

**3 years.** [scene — one paragraph, the narrative has compounded]

**5 years.** [scene — one paragraph, the cost is visible but still unnamed by the person]

**10 years.** [scene — one paragraph, looking back]

End with exactly two lines:
"None of this is fixed. A narrative only runs if nothing interrupts it."
Then one final line: "The fact that you can see it is the interrupt."

## THE INTERRUPT

You've shown where the narrative leads if nothing changes.
Now write what happens if the ONE MOVE actually gets made — and made consistently for a year.

Write four vignettes: 1 year, 3 years, 5 years, 10 years. Label each exactly as:
"1 year, interrupted." / "3 years, interrupted." etc.

Rules — these are hard constraints, not suggestions:
- Every vignette must be grounded specifically in the ONE MOVE from this report. Not a generic improvement arc. The specific action, its specific consequences.
- Name real places, real friction, real people where the story warrants it. "Someone in a city" is not acceptable. Name the city. Name the industry. Make it as specific as the uninterrupted arc.
- Show what's harder than expected in at least two vignettes — not just what improves.
- The narrative doesn't disappear. It loosens. Show the moment where the old belief still shows up — and now has something to argue with.
- Each vignette ends with one sentence naming what's now possible that wasn't before. Not as encouragement. As observation.
- Same length as the uninterrupted vignettes — 4-6 sentences each.
- Same voice as the rest of this report — dry, precise, no enthusiasm, no soft hedges.
- Never uses: "journey", "growth", "transformation", "shift", "breakthrough", "resonate", "unlock", "empower".

After the four interrupted vignettes, close with exactly:
"None of this is guaranteed. But the first move is already in your hands. You wrote it."

If stage is "deep" (VERIFICATION mode): reframe THE INTERRUPT as "THE NEXT QUESTION" — not what changes if you act, but what becomes possible to ask that wasn't possible before. Same four time periods, same specificity, different frame. The narrative is working — show what it opens up next.

## WHAT THIS NARRATIVE COSTS WITHOUT YOU REALIZING IT

Write 3 cost items. Each has a short bold title (2-4 words) followed by 2-3 sentences. Name the specific cost to this person — not generic. Quote their story where relevant.

## ONE MOVE THIS WEEK

One specific action. Not a system. Not a strategy. Written as a short paragraph in Mohammad's voice — dry, precise, ends with a single sentence that lands and stops.

End the entire report with exactly this line, on its own:
"The unexamined life isn't a philosophy problem. It's a ten-minute conversation."

Do not add any closing CTA, booking link, or sign-off. That gets added separately.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 5000,
      messages: [{ role: 'user', content: prompt }]
    });

    const report = response.content[0].text.trim();

    if (sessionId) {
      try {
        await kv.set(
          `report:${sessionId}`,
          {
            sessionId,
            narrativeReport: report,
            narrativeName: narrativeName || headline,
            generatedAt: new Date().toISOString()
          },
          { ex: 60 * 60 * 24 * 90 }
        );

        const reportIndex = await kv.get('report:index') || [];
        const indexEntry = {
          sessionId,
          narrativeName: narrativeName || headline,
          generatedAt: new Date().toISOString()
        };
        const updatedIndex = [indexEntry, ...reportIndex].slice(0, 200);
        await kv.set('report:index', updatedIndex, { ex: 60 * 60 * 24 * 90 });
      } catch (kvErr) {
        console.warn('KV save failed (non-fatal):', kvErr.message);
      }
    }

    return res.status(200).json({ success: true, report });

  } catch(err) {
    console.error('narrative-report error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
