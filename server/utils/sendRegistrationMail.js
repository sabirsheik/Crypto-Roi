import nodemailer from "nodemailer";

const sendRegistrationMail = async (email, name) => {
  try {
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS
    //   }
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

    const logoUrl = `https://api.aiworldtech.org/uploads/Logo.png`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="AI Tech World Logo" width="100" style="margin-bottom: 10px;" />
        </div>
        <h2 style="color: #6a1b9a; text-align: center;">Welcome, ${name}!</h2>
        <p style="font-size: 16px; color: #444;">Your account has been <strong>successfully registered</strong> on the AI TECH WORLD platform.</p>

        <p style="font-size: 16px; color: #444;"><strong>Your User ID:</strong> <span style="color: #2e7d32;">${email}</span></p>

        <p style="font-size: 16px; color: #555;">You can now log in and explore your dashboard, make investments, earn ROI, and more!</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.Client}" style="padding: 12px 24px; background-color: #6a1b9a; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Platform</a>
        </div>

        <hr style="border: none; border-top: 1px solid #ccc;" />

        <p style="font-size: 14px; color: #888;">If you have any questions or need support, feel free to reply to this email.</p>

        <p style="font-size: 14px; color: #444;">Regards,<br/>AI WORLD TECH Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"AI WORLD TECH Platform" <${process.env.HOSTINGER_EMAIL}>`,
      to: email,
      bcc: process.env.HOSTINGER_EMAIL,
      subject: "Welcome to AI WORLD TECH - Registration Successful",
      html
    });

    console.log(`✅ Registration email sent to ${email}`);
  } catch (err) {
    console.error("❌ Error sending registration mail:", err.message);
  }
};

export default sendRegistrationMail;
