import nodemailer from "nodemailer";

/**
 * Send password reset email or log OTP in development
 */
export const sendResetPasswordEmail = async (toEmail, otp) => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  console.log(`\n==============================================`);
  console.log(`🔑 PASSWORD RESET OTP for ${toEmail}: [ ${otp} ]`);
  console.log(`⏰ Valid for 10 minutes`);
  console.log(`==============================================\n`);

  if (!user || !pass) {
    // Development / local mode: no SMTP credentials configured
    return { sent: false, simulated: true, otp };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });

    const mailOptions = {
      from: `"VibeChat Support" <${user}>`,
      to: toEmail,
      subject: "VibeChat - Password Reset Code",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #6366f1; margin: 0; font-size: 26px;">VibeChat</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Password Reset Request</p>
          </div>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hello,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">We received a request to reset your VibeChat password. Use the verification code below to complete the reset process:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4f46e5; background: #eef2ff; padding: 12px 28px; border-radius: 12px; border: 1px dashed #818cf8;">
              ${otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 13px; text-align: center;">This code will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} VibeChat. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { sent: true, simulated: false };
  } catch (error) {
    console.error("Failed to send reset email via SMTP:", error.message);
    return { sent: false, simulated: true, error: error.message, otp };
  }
};
