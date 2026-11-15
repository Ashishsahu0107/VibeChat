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
 * Send email via Brevo REST API over HTTPS (Port 443).
 * Extremely fast (~200ms) and NEVER blocked by Render or local firewalls.
 */
const sendViaBrevoRestApi = async ({
  apiKey,
  senderEmail,
  senderName,
  toEmail,
  fullName,
  otp,
}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey.trim(),
        "content-type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: fullName || "User" }],
        subject: `${otp} is your VibeChat verification code`,
        htmlContent: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; padding: 40px 20px; color: #f8fafc;">
            <div style="max-width: 480px; margin: 0 auto; background: #121826; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 36px 32px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px 0;">VibeChat</h1>
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">Verification Code</p>
              <p style="color: #cbd5e1; font-size: 15px; margin: 0 0 20px 0;">Hello <strong>${fullName}</strong>, use the code below to complete your registration:</p>
              <div style="background: rgba(124, 58, 237, 0.12); border: 2px solid #7c3aed; border-radius: 16px; padding: 18px 24px; display: inline-block; margin-bottom: 24px;">
                <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #a78bfa;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 13px; margin: 0;">Code expires in 5 minutes. If you did not request this, please ignore this email.</p>
            </div>
          </div>
        `,
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Brevo REST API error (${res.status})`);
    }

    const data = await res.json();
    return { success: true, messageId: data.messageId };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

/**
 * Helper to build Nodemailer transporter configured for Brevo SMTP or Gmail SMTP
 * Optimized with fast 4-second timeout to prevent UI freezes.
 */
const createBrevoTransporter = () => {
  // Option A: Gmail SMTP (if user configures GMAIL_USER and GMAIL_APP_PASS)
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass =
    process.env.GMAIL_APP_PASS || process.env.GMAIL_APP_PASSWORD;
  if (
    gmailUser &&
    gmailPass &&
    !isPlaceholder(gmailUser) &&
    !isPlaceholder(gmailPass)
  ) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser.trim(),
        pass: gmailPass.trim(),
      },
      connectionTimeout: 4000,
      greetingTimeout: 4000,
    });
    return {
      transporter,
      senderEmail: gmailUser.trim(),
      senderName: process.env.BREVO_SENDER_NAME || "VibeChat",
      provider: "gmail",
    };
  }

  // Option B: Brevo SMTP Relay
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

  // Fast 2.5-second timeouts so user never waits
  const transporter = nodemailer.createTransport({
    host: host.trim(),
    port,
    secure: port === 465,
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 2500, // 2.5s max
    greetingTimeout: 2500, // 2.5s max
    socketTimeout: 3500, // 3.5s max
  });

  return {
    transporter,
    senderEmail,
    senderName,
    provider: "brevo",
  };
};

/**
 * Send 6-digit registration OTP via Brevo API / SMTP with fast failover
 */
export const sendRegistrationOtpEmail = async (
  toEmail,
  otp,
  fullName = "there"
) => {
  console.log(`\n======================================================`);
  console.log(`📧 REGISTRATION OTP for ${toEmail}: [ ${otp} ]`);
  console.log(`⏰ Valid for 5 minutes (300 seconds) | Recipient: ${fullName}`);
  console.log(`======================================================\n`);

  // 1. Try Brevo REST API over HTTPS if BREVO_API_KEY is present (fastest & works on all cloud hosts)
  const brevoApiKey = process.env.BREVO_API_KEY || process.env.BREVO_KEY;
  if (brevoApiKey && !isPlaceholder(brevoApiKey)) {
    try {
      console.log(`🚀 Sending OTP via Brevo REST API (HTTPS port 443)...`);
      const apiRes = await sendViaBrevoRestApi({
        apiKey: brevoApiKey,
        senderEmail:
          process.env.BREVO_SENDER_EMAIL || "ashishsahu01072005@gmail.com",
        senderName: process.env.BREVO_SENDER_NAME || "VibeChat",
        toEmail,
        fullName,
        otp,
      });
      console.log(`✅ Sent successfully via Brevo REST API! (${apiRes.messageId})`);
      return { success: true, simulated: false, messageId: apiRes.messageId };
    } catch (apiErr) {
      console.warn(`⚠️ Brevo REST API failed: ${apiErr.message}. Falling back to SMTP...`);
    }
  }

  // 2. Try Nodemailer SMTP Transporter
  const mailConfig = createBrevoTransporter();
  if (!mailConfig) {
    console.log(`💡 Local simulated mode: OTP is printed above.`);
    return { success: true, simulated: true, otp };
  }

  try {
    const { transporter, senderEmail, senderName } = mailConfig;

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: toEmail,
      subject: `${otp} is your VibeChat verification code`,
      text: `Hello ${fullName},\n\nYour 6-digit VibeChat verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nBest regards,\nThe VibeChat Team`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; background-color: #07090e; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #f1f5f9;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #07090e; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 500px; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; overflow: hidden; padding: 32px;" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center">
                      <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 10px 0;">VibeChat</h1>
                      <p style="color: #94a3b8; font-size: 14px; margin: 0 0 20px 0;">Verify your email address</p>
                      <div style="background: rgba(124, 58, 237, 0.15); border: 2px solid #7c3aed; border-radius: 16px; padding: 18px 24px; margin-bottom: 20px; display: inline-block;">
                        <span style="font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #a78bfa;">${otp}</span>
                      </div>
                      <p style="color: #64748b; font-size: 12px; margin: 0;">Valid for 5 minutes. Never share this code with anyone.</p>
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
      `✅ Registration OTP successfully sent to ${toEmail} via SMTP (MessageId: ${info.messageId})`
    );
    return { success: true, simulated: false, messageId: info.messageId };
  } catch (error) {
    console.warn(
      `⚠️ Brevo SMTP could not deliver email (${error.code || error.message})`
    );

    const isIpBlock =
      error.responseCode === 525 ||
      error.message?.includes("525") ||
      error.message?.toLowerCase().includes("unauthorized ip");

    // Always fall back smoothly so user is NEVER hard-blocked or waiting 30 seconds
    return {
      success: true,
      simulated: true,
      otp,
      ipBlocked: isIpBlock,
      connectionError: true,
      errorMessage: error.message,
    };
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
        <div style="font-family: sans-serif; max-width: 450px; margin: auto; padding: 24px; background: #0f172a; color: #fff; border-radius: 16px;">
          <h2>Password Reset Request</h2>
          <p>Your password reset code is:</p>
          <h1 style="color: #7c3aed; letter-spacing: 6px;">${otp}</h1>
          <p>Valid for 10 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { sent: true, simulated: false };
  } catch (error) {
    console.warn("SMTP reset email fallback:", error.message);
    return { sent: false, simulated: true, error: error.message, otp };
  }
};
