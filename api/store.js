import Airtable from "airtable";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    signal,
    headline,
    story,
    questions,
    analysis,
    email,
    completionTime,
    timestamp,
    adminMode,
  } = req.body;

  const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
  }).base(process.env.AIRTABLE_BASE_ID);

  await base("Responses").create({
    Signal: signal || "",
    Headline: headline || "",
    Story: story || "",
    Q1: (questions && questions[0]) || "",
    Q2: (questions && questions[1]) || "",
    Q3: (questions && questions[2]) || "",
    Analysis: analysis || "",
    Email: email || "",
    CompletionTime: completionTime || 0,
    Timestamp: timestamp || new Date().toISOString(),
    AdminMode: adminMode || false,
  });

  res.json({ success: true });
}
