import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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

const logoUrl = `https://api.aiworldtech.org/uploads/Logo.png`;
const sendOtp = async (email, otp) => {
  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>OTP Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #f4f4f4;
        padding: 20px;
        margin: 0;
      }
      .container {
        max-width: 500px;
        background: #ffffff;
        padding: 30px;
        margin: auto;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
      }
      .header {
        text-align: center;
        padding-bottom: 20px;
      }
      .header img {
        width: 300px;
      }
      .title {
        font-size: 24px;
        font-weight: bold;
        color: #333333;
        margin-top: 10px;
      }
      .otp {
        background: #007bff;
        color: #ffffff;
        padding: 15px 30px;
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 4px;
        border-radius: 6px;
        display: inline-block;
        margin: 20px 0;
      }
      .content {
        font-size: 16px;
        color: #555555;
        line-height: 1.6;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #999999;
        margin-top: 30px;
      }
      @media(max-width:600px){
        .container{
          padding:20px;
        }
        .otp{
          font-size: 20px;
          padding: 12px 25px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="${logoUrl}" />
        <div class="title">OTP Verification</div>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) for verification is:</p>
        <div class="otp">${otp}</div>
        <p>Please use this code to complete your login or verification process.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} AI World TECH | All Rights Reserved.
      </div>
    </div>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"AI World TECH" <${process.env.HOSTINGER_OTP_EMAIL}>`,
    to: email, // Send to the real user email now
    bcc: process.env.HOSTINGER_OTP_EMAIL,
    subject: "Your OTP Verification Code",
    html: htmlTemplate
  });
};

export default sendOtp ;
