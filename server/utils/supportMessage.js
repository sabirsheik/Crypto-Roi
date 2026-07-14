import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.HOSTINGER_EMAIL,  // support@aiworldtech.org
    pass: process.env.HOSTINGER_PASSWORD,       // AiWorld@Tech9
  },
});

export const sendSupportEmail = async ({ name, email, message }) => {
  const mailOptions = {
    from: `"AI WorldTech Support" <${process.env.HOSTINGER_EMAIL}>`,
    to: process.env.HOSTINGER_EMAIL, // where messages land
    bcc : process.env.HOSTINGER_EMAIL, // for record-keeping
    subject: `New Support Message from ${name}`,
    html: `
      <div style="font-family:Arial, sans-serif; padding:20px; border:1px solid #eee; border-radius:10px; max-width:600px; margin:auto;">
        <h2 style="color:#2563eb; text-align:center;">New Support Request</h2>
        <p style="font-size:16px;">You have received a new support message:</p>

        <table style="width:100%; border-collapse:collapse; margin:20px 0;">
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><b>Name</b></td>
            <td style="padding:8px; border:1px solid #ddd;">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><b>Email</b></td>
            <td style="padding:8px; border:1px solid #ddd;">${email}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><b>Message</b></td>
            <td style="padding:8px; border:1px solid #ddd;">${message}</td>
          </tr>
        </table>

        <p style="font-size:14px; color:#666;">This email was sent automatically by AI WorldTech Support System.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
