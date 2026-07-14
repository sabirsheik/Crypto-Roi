import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // sender email
    pass: process.env.EMAIL_PASS  // app password (not actual gmail password)
  }
});

  // const transporter = nodemailer.createTransport({
  //     host: "smtp.hostinger.com", // Hostinger SMTP server
  //     port: 465,                  // SSL port
  //     secure: true,               // true for 465, false for 587
  //     auth: {
  //       user: process.env.HOSTINGER_EMAIL, // Business email
  //       pass: process.env.HOSTINGER_PASSWORD,           // Email password from Hostinger
  //     },
  //   });

export const sendEmail = async (to, subject, html, text) => {
  try {
    const msg = {
      from: `"AI WORLD TECH" <${process.env.EMAIL_USER}>`,
      to,
       bcc: process.env.EMAIL_USER,
      subject,
      text,
      html
    };

    await transporter.sendMail(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};
