import nodemailer from "nodemailer";

/**
 * Check if a config string is empty or contains an unedited placeholder
 */
const isPlaceholder = (val) => {
  if (!val || typeof val !== "string") return true;
  const lower = val.trim().toLowerCase();
  return (
    lower === "" ||
    lower.includes("example.com") ||
    lower.includes("your_brevo") ||
    lower.includes("your_verified") ||
    lower.includes("your_api_key") ||
    lower.includes("your_account") ||
    lower.startsWith("your_")
  );
};

/**
 * Helper to build Nodemailer transporter configured for Brevo SMTP
 * Supports BREVO_SMTP_*, SMTP_*, and EMAIL_* environment variables
 */
const createBrevoTransporter = () => {
  const host =
    process.env.BREVO_SMTP_HOST ||
    process.env.SMTP_HOST ||
    "smtp-relay.brevo.com";
  const port = Number(
    process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || 587
  );
  const user =
    process.env.BREVO_SMTP_USER ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER;
  const pass =
    process.env.BREVO_SMTP_KEY ||
    process.env.BREVO_SMTP_PASS ||
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASS;

  if (isPlaceholder(user) || isPlaceholder(pass)) {
    return null;
  }

  const rawSender =
    process.env.BREVO_SENDER_EMAIL ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    user;

  const senderEmail = isPlaceholder(rawSender) ? user : rawSender.trim();
  const senderName = process.env.BREVO_SENDER_NAME || "VibeChat";

  const transporter = nodemailer.createTransport({
    host: host.trim(),
    port,
    secure: port === 465, // true for 465 (SSL), false for 587 (TLS/STARTTLS)
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
    tls: {
      rejectUnauthorized: false, // Ensures compatibility across local/cloud environments
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
  });

  return {
    transporter,
    senderEmail,
    senderName,
  };
};

/**
 * Send 6-digit registration OTP via Brevo SMTP
 */
export const sendRegistrationOtpEmail = async (
  toEmail,
  otp,
  fullName = "there"
) => {
  const mailConfig = createBrevoTransporter();

  console.log(`\n======================================================`);
  console.log(`📧 REGISTRATION OTP for ${toEmail}: [ ${otp} ]`);
  console.log(`⏰ Valid for 5 minutes (300 seconds) | Recipient: ${fullName}`);
  if (!mailConfig) {
    console.log(
      `⚠️  Brevo SMTP credentials not fully configured or using placeholders in .env.`
    );
    console.log(
      `💡 Local simulated mode active: enter the 6-digit code above to proceed!`
    );
  }
  console.log(`======================================================\n`);

  if (!mailConfig) {
    // Local / development fallback when credentials are not configured or placeholder
    return { success: true, simulated: true, otp };
  }

  try {
    const { transporter, senderEmail, senderName } = mailConfig;

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: toEmail,
      subject: `${otp} is your VibeChat verification code`,
      text: `Hello ${fullName},\n\nYour 6-digit VibeChat verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you did not initiate this request, please ignore this email.\n\nBest regards,\nThe VibeChat Team`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your VibeChat account</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #07090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #07090e; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 520px; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);" cellspacing="0" cellpadding="0" border="0">
                  <!-- Header with Gradient Accent -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%); height: 6px;"></td>
                  </tr>
                  <tr>
                    <td style="padding: 36px 32px 20px 32px; text-align: center;">
                      <div style="display: inline-block; padding: 10px 18px; border-radius: 14px; background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); margin-bottom: 20px;">
                        <span style="font-size: 22px; font-weight: 800; background: linear-gradient(135deg, #67e8f9 0%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px;">
                          VibeChat
                        </span>
                      </div>
                      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 10px 0; letter-spacing: -0.5px;">
                        Verify Your Email Address
                      </h1>
                      <p style="color: #94a3b8; font-size: 15px; margin: 0; line-height: 1.5;">
                        Welcome, <strong style="color: #f1f5f9;">${fullName}</strong>! Use the verification code below to complete your registration.
                      </p>
                    </td>
                  </tr>

                  <!-- OTP Display Box -->
                  <tr>
                    <td align="center" style="padding: 10px 32px 24px 32px;">
                      <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(147, 197, 253, 0.25); border-radius: 16px; padding: 22px 28px; text-align: center; max-width: 320px;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; text-shadow: 0 0 20px rgba(56, 189, 248, 0.4); display: block; padding-left: 10px;">
                          ${otp}
                        </span>
                      </div>
                    </td>
                  </tr>

                  <!-- Expiration and Safety notice -->
                  <tr>
                    <td style="padding: 0 32px 32px 32px; text-align: center;">
                      <div style="display: inline-block; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 10px; padding: 8px 16px; margin-bottom: 20px;">
                        <p style="color: #fbbf24; font-size: 13px; font-weight: 600; margin: 0;">
                          ⏱️ Code expires in 5 minutes (300 seconds)
                        </p>
                      </div>
                      <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
                        For your security, never share this code with anyone. VibeChat representatives will never ask for your code.
                      </p>
                      <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 12px 0 0 0;">
                        If you didn't create an account with VibeChat, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: rgba(15, 23, 42, 0.8); border-top: 1px solid rgba(255, 255, 255, 0.06); padding: 20px 32px; text-align: center;">
                      <p style="color: #475569; font-size: 12px; margin: 0;">
                        &copy; ${new Date().getFullYear()} VibeChat. Real-Time Secure Messaging.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Registration OTP successfully sent to ${toEmail} via Brevo SMTP (MessageId: ${info.messageId})`
    );
    return { success: true, simulated: false, messageId: info.messageId };
  } catch (error) {
    console.error(
      "❌ Failed to send registration OTP email via Brevo SMTP:",
      error.message
    );

    const isDev = process.env.NODE_ENV !== "production";
    const isIpBlock =
      error.responseCode === 525 ||
      error.message?.includes("525") ||
      error.message?.toLowerCase().includes("unauthorized ip");

    // In local development, fall back to simulated OTP so development/testing is never blocked
    if (isDev) {
      console.log(`\n======================================================`);
      console.log(`⚠️  Brevo SMTP attempt failed: ${error.message}`);
      console.log(`💡 Local Development Fallback: Using simulated OTP for testing!`);
      console.log(`🔑 REGISTRATION OTP for ${toEmail}: [ ${otp} ]`);
      if (isIpBlock) {
        console.log(`👉 TO RECEIVE REAL EMAILS IN YOUR INBOX:`);
        console.log(`   1. Open Gmail (${process.env.BREVO_SENDER_EMAIL || "your email"}) and find Brevo's 'Validate your IP address' email -> click Validate.`);
        console.log(`   2. OR in Brevo dashboard: Settings > Security > Authorized IPs > click 'Deactivate' on 'Blocking of unknown IP addresses'.`);
      }
      console.log(`======================================================\n`);
      return { success: true, simulated: true, otp, ipBlocked: isIpBlock };
    }

    throw error;
  }
};

/**
 * Send password reset email or log OTP in development
 */
export const sendResetPasswordEmail = async (toEmail, otp) => {
  const mailConfig = createBrevoTransporter();

  console.log(`\n==============================================`);
  console.log(`🔑 PASSWORD RESET OTP for ${toEmail}: [ ${otp} ]`);
  console.log(`⏰ Valid for 10 minutes`);
  if (!mailConfig) {
    console.log(
      `⚠️  Brevo SMTP credentials not configured or using placeholders. Simulated mode active.`
    );
  }
  console.log(`==============================================\n`);

  if (!mailConfig) {
    return { sent: false, simulated: true, otp };
  }

  try {
    const { transporter, senderEmail, senderName } = mailConfig;

    const mailOptions = {
      from: `"${senderName} Support" <${senderEmail}>`,
      to: toEmail,
      subject: "VibeChat - Password Reset Code",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: auto; padding: 28px; border: 1px solid #334155; border-radius: 16px; background-color: #0f172a; color: #f8fafc;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #38bdf8; margin: 0; font-size: 26px; font-weight: 800;">VibeChat</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">Password Reset Request</p>
          </div>
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.5;">Hello,</p>
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.5;">We received a request to reset your VibeChat password. Use the verification code below to complete the reset process:</p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #38bdf8; background: #1e293b; padding: 14px 28px; border-radius: 12px; border: 1px dashed #38bdf8;">
              ${otp}
            </span>
          </div>
          <p style="color: #94a3b8; font-size: 13px; text-align: center;">This code will expire in <strong style="color: #f1f5f9;">10 minutes</strong>. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />
          <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} VibeChat. All rights reserved.</p>
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
