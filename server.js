const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
  service: "gmail", // Use another service if needed
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // App password (not the real password)
  },
});

app.post("/send-email", async (req, res) => {
  const { subject, textArea, email, name } = req.body;

  try {
    await transporter.sendMail({
      from: `"${name}" <${email}>`, // Name and email of the sender
      to: "bartberg11@gmail.com", // Replace with your actual email
      subject: subject,
      text: `Sender Name: ${name}\nSender Email: ${email}\n\nMessage:\n${textArea}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${textArea}</p>
      `,
    });

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
