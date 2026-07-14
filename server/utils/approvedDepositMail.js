// controllers/sendDepositMail.js
import nodemailer from "nodemailer";

const sendDepositMail = async ({ name, email, amount }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
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

    const mailOptions = {
      from: `"Crypto ROI Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      bcc: process.env.EMAIL_USER,
      subject: "Deposit Approved ✅",
      html: `
        <div style="font-family:sans-serif; color:#111;">
          <h2>Hello ${name},</h2>
          <p>Your deposit of <strong>$${amount.toFixed(2)}</strong> has been <span style="color:green;"><strong>approved</strong></span>.</p>
          <p>The amount has been credited to your <strong>Main Wallet</strong>.</p>
          <br/>
          <p>Thank you for using our platform!</p>
          <p>– Crypto ROI Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Deposit approval email sent to ${email}`);
  } catch (err) {
    console.error("Error sending deposit mail:", err.message);
  }
};

export default sendDepositMail;
