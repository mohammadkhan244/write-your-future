export default async function handler(req, res) {
  console.log("AIRTABLE_BASE_ID present:", !!process.env.AIRTABLE_BASE_ID);
  console.log("AIRTABLE_API_KEY present:", !!process.env.AIRTABLE_API_KEY);
  console.log("BASE_ID value:", process.env.AIRTABLE_BASE_ID);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    console.error("Missing Airtable env vars");
    return res.status(500).json({ error: "Airtable not configured" });
  }

  try {
    const body = req.body;
    console.log("Storing record:", JSON.stringify(body, null, 2));

    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Responses`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            Idea: String(body.idea || body.signal || ""),
            Headline: String(body.headline || ""),
            Story: String(body.story || ""),
            IdeaType: String(body.ideaType || ""),
            ICP: String(body.icp || ""),
            Method: String(body.method || ""),
            Destination: String(body.destination || ""),
            Competition: String(body.competition || ""),
            Q1_Who: String(body.q1 || (body.questions && body.questions[0]) || ""),
            Q2_Assumptions: String(body.q2 || (body.questions && body.questions[1]) || ""),
            Q3_Absent: String(body.q3 || (body.questions && body.questions[2]) || ""),
            Analysis_Full: String(body.analysis || ""),
            Email: String(body.email || ""),
            Completion_Time_Mins: Number(body.completionTime) || 0,
            Admin_Mode: Boolean(body.adminMode),
            Partial: Boolean(body.partial || false),
            Timestamp: body.timestamp || new Date().toISOString(),
          },
        }),
      }
    );

    const data = await response.json();
    console.log("Airtable response:", response.status, JSON.stringify(data));

    if (!response.ok) {
      console.error("Airtable write failed:", data);
      return res.status(500).json({
        error: "Airtable write failed",
        details: data,
      });
    }

    return res.json({ success: true, id: data.id });
  } catch (err) {
    console.error("Store handler exception:", err);
    return res.status(500).json({
      error: "Internal error",
      message: err.message,
    });
  }
}
