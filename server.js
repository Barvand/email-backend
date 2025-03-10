const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Sanitize input function (Preserve spaces & newlines)
const escapeHTML = (str) => {
  return String(str)
    .replace(/&/g, "&amp;") // Escape &
    .replace(/</g, "&lt;") // Escape <
    .replace(/>/g, "&gt;") // Escape >
    .replace(/"/g, "&quot;") // Escape "
    .replace(/'/g, "&#039;") // Escape '
    .replace(/\n/g, "<br>") // Preserve newlines for readability
    .trim();
};

// Validate email function
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Send Email Route
app.post("/send-email", async (req, res) => {
  let { subject, textArea, email, name } = req.body;

  // Sanitize all inputs
  name = sanitizeInput(name);
  subject = sanitizeInput(subject);
  textArea = sanitizeInput(textArea);

  // Validate email
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  // Validate subject & message length
  if (!subject || subject.length > 100) {
    return res
      .status(400)
      .json({ error: "Subject is required (max 100 characters)" });
  }
  if (!textArea || textArea.length > 1000) {
    return res
      .status(400)
      .json({ error: "Message is required (max 1000 characters)" });
  }

  try {
    await transporter.sendMail({
      from: `"${escapeHTML(name)}" <no-reply@yourdomain.com>`,
      to: "bartberg11@gmail.com",
      subject: escapeHTML(subject),
      text: `New Contact Form Submission\n\n${JSON.stringify(
        req.body,
        null,
        2
      )}`, // Plain text email
      html: `
    <h3>New Contact Form Submission</h3>
    <pre>${escapeHTML(
      JSON.stringify(req.body, null, 2)
    )}</pre> <!-- ✅ Now fully escapes HTML -->
  `,
    });

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
