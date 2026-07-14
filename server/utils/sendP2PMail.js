// utils/sendP2PMail.js

import nodemailer from "nodemailer";

// Set your environment or hardcoded credentials (recommended to use environment variables)
// const transporter = nodemailer.createTransport({
//   service: "gmail", // or "Outlook", "Yahoo", etc.
//   auth: {
//     user: process.env.process.env.HOSTINGER_EMAIL,     // e.g., your Gmail address
//     pass: process.env.HOSTINGER_PASSWORD,   // e.g., App Password or your email password
//   },
// });

  const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com", // Hostinger SMTP server
      port: 465,                  // SSL port
      secure: true,               // true for 465, false for 587
      auth: {
        user: process.env.HOSTINGER_EMAIL, // Business email
        pass: process.env.HOSTINGER_PASSWORD,           // Email password from Hostinger
      },
    });

const sendP2PTranstion = async ({ to, receiverName, amount, fromEmail }) => {
  try {
    const mailOptions = {
      from: `"Crypto ROI Platform" <${process.env.HOSTINGER_EMAIL}>`,
      to,
      bcc: process.env.HOSTINGER_EMAIL,
      subject: `💸 You’ve Received a P2P Transfer`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
          <h2 style="color: #22c55e;">You’ve received a new transfer!</h2>
          <p>Hi ${receiverName},</p>
          <p>You have received <strong>$${amount.toFixed(2)}</strong> in your <strong>Main Wallet</strong> from <strong>${fromEmail}</strong>.</p>
          <p style="margin-top: 20px;">You can view this transaction in your dashboard.</p>
          <hr />
          <p style="font-size: 0.9em; color: #666;">This is an automated message from Crypto ROI Platform.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ P2P email sent to:", to);
  } catch (error) {
    console.error("❌ Failed to send P2P email:", error.message);
  }
};

export default sendP2PTranstion;
