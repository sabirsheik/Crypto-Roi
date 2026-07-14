// utils/sendP2PMail.js
import nodemailer from "nodemailer";

const sendP2PMail = async ({ to, otp, email }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // const transporter = nodemailer.createTransport({
    //   host: "smtp.hostinger.com", // Hostinger SMTP server
    //   port: 465,                  // SSL port
    //   secure: true,               // true for 465, false for 587
    //   auth: {
    //     user: process.env.HOSTINGER_EMAIL, // Business email
    //     pass: process.env.HOSTINGER_PASSWORD,           // Email password from Hostinger
    //   },
    // });
    

    const mailOptions = {
      from: `"P2P Transfer" <${process.env.EMAIL_USER}>`,
      to,
       bcc: process.env.EMAIL_USER,
      subject: "Your P2P Transfer OTP",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #4F46E5;">P2P Transfer OTP</h2>
          <p>Your OTP for completing the P2P transfer is:</p>
          <p style="font-size: 26px; font-weight: bold; letter-spacing: 2px; color: #4F46E5;">${otp}</p>
          <p>This OTP will expire in <strong>5 minutes</strong>. Please do not share it with anyone.</p>
          <hr />
          <p style="font-size: 12px; color: #777;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${to}`);
  } catch (error) {
    console.error("❌ Failed to send P2P OTP email:", error);
    throw new Error("Email sending failed");
  }
};

export default sendP2PMail;
