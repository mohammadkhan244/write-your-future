export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY');
    return res.status(500).json({ error: 'Email not configured' });
  }

  try {
    const { email, headline, idea, story, timerDuration, ownWordsQuote } = req.body;

    // Word count
    const wordCount = story ? story.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
    const minutes = timerDuration || 10;

    // Sanitize quote
    const quote = ownWordsQuote
      ? ownWordsQuote.replace(/^[""]|[""]$/g, '').trim()
      : null;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="background:#0a0a0a; color:#f0ece4; font-family:Georgia,serif; max-width:560px; margin:0 auto; padding:48px 24px;">

  <p style="font-size:15px; line-height:1.8; color:rgba(240,236,228,0.85); margin:0 0 24px;">
    You wrote ${wordCount} words in ${minutes} minutes. Here's what was underneath them.
  </p>

  ${quote ? `
  <div style="border-left:2px solid #b87333; padding-left:20px; margin:32px 0;">
    <p style="font-family:Georgia,serif; font-size:17px; font-style:italic; color:#f0ece4; line-height:1.6; margin:0 0 12px;">
      &ldquo;${quote}&rdquo;
    </p>
    <p style="font-size:13px; color:rgba(240,236,228,0.45); margin:0;">
      You didn't plan to write that. The report will show you why it matters.
    </p>
  </div>
  ` : ''}

  <p style="font-size:15px; line-height:1.8; color:rgba(240,236,228,0.85); margin:32px 0 24px;">
    Your report is attached.
  </p>

  <p style="font-size:15px; color:rgba(240,236,228,0.85); margin:0 0 4px;">— Mohammad</p>

  <hr style="border:none; border-top:1px solid rgba(184,115,51,0.2); margin:40px 0;">

  <div style="text-align:center;">
    <p style="font-size:14px; color:rgba(240,236,228,0.5); margin:0 0 16px;">
      Want to go deeper? The sprint finds the narrative. The session is where we examine what to do about it.
    </p>
    <a href="https://tidycal.com/mohammadukhan135/uncover-your-myth"
       style="background:#b87333; color:#ffffff; padding:12px 24px; border-radius:4px; text-decoration:none; font-size:14px; display:inline-block;">
      Book a session — $500
    </a>
  </div>

  <p style="font-size:11px; color:rgba(240,236,228,0.25); text-align:center; margin-top:40px;">
    Modern Myths | Mohammad Khan
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
        from: 'Mohammad Khan <mohammadkhan@themohammadkhan.com>',
        to: email,
        subject: 'Your Write Your Future report is here',
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
