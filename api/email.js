export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY');
    return res.status(500).json({ error: 'Email not configured' });
  }

  try {
    const { email, headline, idea, analysis, story } = req.body;

    const getSection = (text, label) => {
      const regex = new RegExp(`${label}[\\s\\S]*?\\n([\\s\\S]*?)(?=\\n[A-Z][A-Z\\s]+\\n|$)`);
      const match = text?.match(regex);
      return match ? match[1].trim().slice(0, 500) : "See your full report.";
    };

    const assumptions = getSection(analysis, 'HIDDEN ASSUMPTIONS');
    const signals     = getSection(analysis, 'SIGNALS TO WATCH');
    const actions     = getSection(analysis, 'THREE THINGS TO ACT ON');
    const missing     = getSection(analysis, "WHAT'S MISSING");

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="background:#0a0a0a; color:#f0ece4; font-family: Georgia, serif;
             max-width:600px; margin:0 auto; padding:40px 24px;">

  <h1 style="color:#b87333; font-size:24px; margin-bottom:8px;">
    Stress Test Your Ideas Before They Break
  </h1>

  <p style="color:rgba(240,236,228,0.6); font-size:14px; margin-bottom:32px;">
    Your stress test report for: <strong style="color:#f0ece4;">${headline}</strong>
  </p>

  <hr style="border:none; border-top:1px solid rgba(184,115,51,0.3); margin:24px 0;">

  <h2 style="color:#b87333; font-size:13px; letter-spacing:0.15em;
             text-transform:uppercase; margin-bottom:12px;">
    Your Idea
  </h2>
  <p style="font-size:15px; line-height:1.6; color:rgba(240,236,228,0.85);">
    ${idea}
  </p>

  <hr style="border:none; border-top:1px solid rgba(184,115,51,0.3); margin:24px 0;">

  <h2 style="color:#b87333; font-size:13px; letter-spacing:0.15em;
             text-transform:uppercase; margin-bottom:12px;">
    The Hidden Assumptions
  </h2>
  <p style="font-size:14px; line-height:1.7; color:rgba(240,236,228,0.8);">
    ${assumptions}
  </p>

  <hr style="border:none; border-top:1px solid rgba(184,115,51,0.3); margin:24px 0;">

  <h2 style="color:#b87333; font-size:13px; letter-spacing:0.15em;
             text-transform:uppercase; margin-bottom:12px;">
    Signals To Watch
  </h2>
  <p style="font-size:14px; line-height:1.7; color:rgba(240,236,228,0.8);">
    ${signals}
  </p>

  <hr style="border:none; border-top:1px solid rgba(184,115,51,0.3); margin:24px 0;">

  <h2 style="color:#b87333; font-size:13px; letter-spacing:0.15em;
             text-transform:uppercase; margin-bottom:12px;">
    Three Things To Act On
  </h2>
  <p style="font-size:14px; line-height:1.7; color:rgba(240,236,228,0.8);">
    ${actions}
  </p>

  <hr style="border:none; border-top:1px solid rgba(184,115,51,0.3); margin:24px 0;">

  <h2 style="color:#b87333; font-size:13px; letter-spacing:0.15em;
             text-transform:uppercase; margin-bottom:12px;">
    What's Missing
  </h2>
  <p style="font-size:14px; line-height:1.7; color:rgba(240,236,228,0.8);">
    ${missing}
  </p>

  <hr style="border:none; border-top:1px solid rgba(184,115,51,0.3); margin:32px 0;">

  <div style="background:rgba(184,115,51,0.08); border:1px solid #b87333;
              border-radius:6px; padding:24px; text-align:center;">
    <p style="font-size:16px; color:#f0ece4; margin-bottom:8px;">
      You just found the cracks.
    </p>
    <p style="font-size:14px; color:rgba(240,236,228,0.7); margin-bottom:20px;">
      The session is where we figure out which ones matter —
      and what to do about them before they cost you.
    </p>
    <a href="https://tidycal.com/mohammadukhan135/uncover-your-myth"
       style="background:#b87333; color:#ffffff; padding:14px 28px;
              border-radius:4px; text-decoration:none; font-size:15px;
              display:inline-block;">
      Book a session — $500
    </a>
  </div>

  <p style="font-size:12px; color:rgba(240,236,228,0.3);
            text-align:center; margin-top:32px;">
    Modern Myths | Mohammad Khan<br>
    Your full PDF report was also downloaded to your device.
  </p>

</body>
</html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: email,
        subject: `[EWS] Here's your Report + more info`,
        html: emailHtml
      })
    });

    const data = await response.json();
    console.log('Resend response:', response.status, data);

    if (!response.ok) {
      return res.status(500).json({ error: 'Email failed', details: data });
    }

    return res.json({ success: true, id: data.id });

  } catch(err) {
    console.error('Email handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
