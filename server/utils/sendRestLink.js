import nodemailer from "nodemailer";

const sendResetLink = async (email, resetUrl) => {
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
    from: `"AI World tech" <${process.env.EMAIL_USER}>`,
    to: email,
    bcc: process.env.EMAIL_PASS,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial; padding: 20px; background: #f9f9f9; border-radius: 8px;">
        <h2>Reset Your Password</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; margin-top: 10px; background: #0066ff; color: white; padding: 10px 15px; border-radius: 4px; text-decoration: none;">Reset Password</a>
        <p style="margin-top: 15px; font-size: 0.9em;">If you did not request a reset, you can ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default sendResetLink;
