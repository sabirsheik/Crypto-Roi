// Server/Utils/sendMail.js
import nodemailer from "nodemailer";

const createTransporter = () => {
  // Use Hostinger SMTP (mapped from your existing env vars)
  const host = "smtp.gmail.com"; // Default Hostinger SMTP
  const port = 465;                  // SSL Port
  const secure = true;               // Use SSL (recommended)

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing in .env");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

export async function sendMail({ to, subject, text, html }) {
  try {
    const transporter = createTransporter();
    const from = process.env.EMAIL_USER; // default "from" address

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
}
