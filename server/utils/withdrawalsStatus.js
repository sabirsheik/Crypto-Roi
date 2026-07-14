import nodemailer from "nodemailer";

// Create transport (use your real credentials)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send withdrawal status email
export const sendWithdrawalStatusMail = async (toEmail, userName, amount, status) => {
  const subject =
    status === "approved"
      ? "Withdrawal Approved"
      : "Withdrawal Rejected";

  const html =
    status === "approved"
      ? `<p>Hello ${userName},</p><p>Your withdrawal request of <strong>$${amount}</strong> has been <span style="color:green;"><strong>approved</strong></span>.</p><p>The funds will be transferred shortly.</p>`
      : `<p>Hello ${userName},</p><p>Your withdrawal request of <strong>$${amount}</strong> has been <span style="color:red;"><strong>rejected</strong></span>.</p><p>The amount has been refunded to your CashBox wallet.</p>`;

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: toEmail,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Withdrawal status mail sent to", toEmail);
  } catch (err) {
    console.error("Error sending withdrawal email:", err.message);
  }
};



// import nodemailer from "nodemailer";

// // Hostinger SMTP transporter
// const transporter = nodemailer.createTransport({
//   host: "smtp.hostinger.com", // Hostinger SMTP server
//   port: 465,                  // SSL port
//   secure: true,               // true for 465, false for 587
//   auth: {
//     user: process.env.HOSTINGER_EMAIL, // Business email
//     pass: process.env.HOSTINGER_PASSWORD,           // Email password from Hostinger
//   },
// });

// export const sendWithdrawalStatusMail = async (toEmail, name, amount, status) => {
//   const subject =
//     status === "approved"
//       ? "Withdrawal Approved"
//       : "Withdrawal Rejected";

//   const html =
//     status === "approved"
//       ? `<p>Hello ${name},</p>
//          <p>Your withdrawal request of <strong>$${amount}</strong> has been 
//          <span style="color:green;"><strong>approved</strong></span>.</p>
//          <p>The funds will be transferred shortly.</p>`
//       : `<p>Hello ${name},</p>
//          <p>Your withdrawal request of <strong>$${amount}</strong> has been 
//          <span style="color:red;"><strong>rejected</strong></span>.</p>
//          <p>The amount has been refunded to your CashBox wallet.</p>`;

//   const mailOptions = {
//     from: '"AI World Tech" <contact@aiworldtech.org>', // Sender name + email
//     to: toEmail,
//     bcc: process.env.HOSTINGER_EMAIL,
//     subject,
//     html,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("✅ Withdrawal status mail sent to", toEmail);
//   } catch (err) {
//     console.error("❌ Error sending withdrawal email:", err.message);
//   }
// };
