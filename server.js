const express = require("express");
const { Resend } = require("resend");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHTML = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>")
    .trim();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

app.post("/send-email", async (req, res) => {
  let { subject, textArea, email, name } = req.body;

  name = escapeHTML(name);
  subject = escapeHTML(subject);
  textArea = escapeHTML(textArea);

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }
  if (!subject || subject.length > 100) {
    return res
      .status(400)
      .json({ error: "Subject is required (max 100 characters)." });
  }
  if (!textArea || textArea.length > 1000) {
    return res
      .status(400)
      .json({ error: "Message is required (max 1000 characters)." });
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;padding:0 16px;">

        <div style="background:#0d1b2a;border-radius:12px 12px 0 0;padding:32px 40px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#ff6b00;">
            Portfolio Contact
          </p>
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
            New message from ${name}
          </h1>
        </div>

        <div style="background:#ffffff;padding:40px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
          <div style="margin-bottom:28px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">From</p>
            <p style="margin:0;font-size:15px;color:#1e293b;">
              ${name} &mdash; <a href="mailto:${email}" style="color:#ff6b00;text-decoration:none;">${email}</a>
            </p>
          </div>

          <div style="margin-bottom:28px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">Subject</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:#1e293b;">${subject}</p>
          </div>

          <div style="border-top:1px solid #e2e8f0;margin-bottom:28px;"></div>

          <div>
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">Message</p>
            <p style="margin:0;font-size:15px;color:#334155;line-height:1.8;">${textArea}</p>
          </div>
        </div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:20px 40px;">
          <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
            Reply directly to this email to respond to ${name}.
            Sent via the contact form at <a href="https://bartholomeusberg.com" style="color:#ff6b00;text-decoration:none;">bartholomuesberg.no</a>.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: [process.env.BCC_EMAIL],
      reply_to: email,
      subject: `[Portfolio] ${subject}`,
      text: `New message from ${name} (${email})\n\nSubject: ${subject}\n\n${textArea}`,
      html,
    });

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
