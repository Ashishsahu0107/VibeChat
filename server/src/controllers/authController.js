import crypto from "crypto";
import User from "../model/user.model.js";
import PendingUser from "../model/pendingUser.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import {
  sendResetPasswordEmail,
  sendRegistrationOtpEmail,
} from "../utils/sendEmail.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatSmtpError = (mailError) => {
  if (!mailError)
    return "Failed to send verification email. Please try again later.";
  const msg = mailError.message || "";
  if (
    mailError.code === "EAUTH" ||
    mailError.responseCode === 535 ||
    msg.includes("535") ||
    msg.toLowerCase().includes("authentication failed")
  ) {
    return "Brevo SMTP authentication failed (535): Invalid Login or SMTP Key. In Brevo, go to Settings > SMTP & API > SMTP tab and copy your exact 'Login' into BREVO_SMTP_USER and your key into BREVO_SMTP_KEY.";
  }
  if (
    mailError.responseCode === 550 ||
    msg.includes("550") ||
    msg.toLowerCase().includes("sender") ||
    msg.toLowerCase().includes("not verified")
  ) {
    return "Brevo rejected sender email. Please ensure your BREVO_SENDER_EMAIL is verified in your Brevo account under Senders & IPs.";
  }
  if (
    mailError.code === "ESOCKET" ||
    mailError.code === "ETIMEDOUT" ||
    mailError.code === "ECONNREFUSED"
  ) {
    return "Could not connect to Brevo SMTP server (smtp-relay.brevo.com:587). Please check your network connection or firewall.";
  }
  return `Failed to send verification email: ${msg}`;
};

/**
 * Step 1: Validate registration info, check for existing user,
 * generate 6-digit OTP, store in PendingUser (5 min TTL), and email via Brevo SMTP.
 */
export const sendRegisterOtp = async (req, res) => {
  try {
    let { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const cleanName = typeof fullName === "string" ? fullName.trim() : "";
    if (!cleanName || cleanName.length < 2) {
      return res
        .status(400)
        .json({ error: "Full name must be at least 2 characters long" });
    }

    const cleanEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res
        .status(400)
        .json({ error: "Please provide a valid email address" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    // 1. Check if user already exists in permanent User collection
    const existingUser = await User.exists({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        error: "An account with this email already exists. Please log in instead.",
      });
    }

    // 2. Check 60-second cooldown on existing PendingUser
    const existingPending = await PendingUser.findOne({ email: cleanEmail });
    if (existingPending && existingPending.lastOtpSentAt) {
      const elapsedMs =
        Date.now() - new Date(existingPending.lastOtpSentAt).getTime();
      if (elapsedMs < 60000) {
        const waitSec = Math.ceil((60000 - elapsedMs) / 1000);
        return res.status(429).json({
          error: `Please wait ${waitSec}s before requesting a new verification code.`,
          waitSeconds: waitSec,
        });
      }
    }

    // 3. Generate secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // 4. Securely hash password and OTP with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // 5. Expiration time: 5 minutes from now
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 6. Upsert into PendingUser collection (MongoDB TTL will auto-purge after 5 min)
    await PendingUser.findOneAndUpdate(
      { email: cleanEmail },
      {
        fullName: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        otp: hashedOtp,
        otpExpiresAt,
        lastOtpSentAt: new Date(),
        createdAt: new Date(), // Reset TTL timestamp
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 7. Send OTP email via Brevo SMTP
    try {
      const emailResult = await sendRegistrationOtpEmail(
        cleanEmail,
        otp,
        cleanName
      );

      return res.status(200).json({
        message: "A 6-digit verification code has been sent to your email.",
        email: cleanEmail,
        expiresIn: 300, // 5 minutes
        resendCooldown: 60, // 60 seconds
        devOtp: emailResult.simulated ? otp : undefined,
      });
    } catch (mailError) {
      console.error(
        "Failed to deliver registration OTP email via Brevo:",
        mailError.message
      );
      // Clean up pending registration so user can retry cleanly
      await PendingUser.deleteOne({ email: cleanEmail });
      return res.status(500).json({
        error: formatSmtpError(mailError),
      });
    }
  } catch (error) {
    console.error("Error in sendRegisterOtp controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Step 2: Verify the 6-digit OTP, create permanent MongoDB User document,
 * remove PendingUser, generate JWT, and return authenticated session.
 */
export const verifyRegisterOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ error: "Email and verification code are required" });
    }

    const cleanEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanOtp = typeof otp === "string" ? otp.trim() : String(otp).trim();

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid 6-digit numeric verification code" });
    }

    // 1. Find the pending registration
    const pending = await PendingUser.findOne({ email: cleanEmail });

    if (!pending) {
      // Check if user is already verified and exists in User
      const alreadyRegistered = await User.exists({ email: cleanEmail });
      if (alreadyRegistered) {
        return res.status(400).json({
          error: "This email is already registered and verified. Please sign in.",
        });
      }
      return res.status(400).json({
        error:
          "Verification code expired or not found. Please request a new code.",
      });
    }

    // 2. Check if OTP has expired (5-minute window)
    if (new Date() > new Date(pending.otpExpiresAt)) {
      await PendingUser.deleteOne({ email: cleanEmail });
      return res.status(400).json({
        error:
          "Verification code has expired (5 minute limit). Please request a new code.",
      });
    }

    // 3. Verify OTP against bcrypt hash
    const isOtpValid = await bcrypt.compare(cleanOtp, pending.otp);
    if (!isOtpValid) {
      return res.status(400).json({
        error: "Invalid verification code. Please check your code and try again.",
      });
    }

    // 4. Double-check duplicate prevention before permanent user creation
    const existingUser = await User.exists({ email: cleanEmail });
    if (existingUser) {
      await PendingUser.deleteOne({ email: cleanEmail });
      return res.status(400).json({
        error: "An account with this email already exists. Please log in.",
      });
    }

    // 5. Create the permanent MongoDB User document
    const profilePic = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      pending.fullName
    )}&background=0f172a&color=38bdf8`;

    const newUser = new User({
      fullName: pending.fullName,
      email: cleanEmail,
      password: pending.password, // Pre-hashed with bcrypt in Step 1
      profilePic,
    });

    await newUser.save();

    // 6. Delete the pending registration record
    await PendingUser.deleteOne({ email: cleanEmail });

    // 7. Issue JWT cookie and token
    const token = generateToken(newUser._id, res);

    return res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      phone: newUser.phone,
      about: newUser.about,
      settings: newUser.settings,
      token,
      message: "Account verified and created successfully! Welcome to VibeChat.",
    });
  } catch (error) {
    console.error("Error in verifyRegisterOtp controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Resend OTP with strict 60-second cooldown timer
 */
export const resendRegisterOtp = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const cleanEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    // 1. Locate pending registration
    const pending = await PendingUser.findOne({ email: cleanEmail });

    if (!pending) {
      const alreadyRegistered = await User.exists({ email: cleanEmail });
      if (alreadyRegistered) {
        return res.status(400).json({
          error: "This email is already registered and verified. Please sign in.",
        });
      }
      return res.status(400).json({
        error:
          "No pending registration found for this email. Please sign up again.",
      });
    }

    // 2. Enforce 60-second cooldown timer
    const elapsedMs =
      Date.now() - new Date(pending.lastOtpSentAt).getTime();
    if (elapsedMs < 60000) {
      const waitSec = Math.ceil((60000 - elapsedMs) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSec}s before requesting a new verification code.`,
        waitSeconds: waitSec,
      });
    }

    // 3. Generate new 6-digit OTP
    const newOtp = crypto.randomInt(100000, 1000000).toString();

    // 4. Hash new OTP
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(newOtp, salt);

    // 5. Update pending record and refresh 5-minute expiry + TTL
    pending.otp = hashedOtp;
    pending.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    pending.lastOtpSentAt = new Date();
    pending.createdAt = new Date(); // Reset 5-minute MongoDB TTL
    await pending.save();

    // 6. Send new OTP email via Brevo SMTP
    try {
      const emailResult = await sendRegistrationOtpEmail(
        cleanEmail,
        newOtp,
        pending.fullName
      );

      return res.status(200).json({
        message: "A new verification code has been sent to your email.",
        email: cleanEmail,
        expiresIn: 300,
        resendCooldown: 60,
        devOtp: emailResult.simulated ? newOtp : undefined,
      });
    } catch (mailError) {
      console.error(
        "Failed to deliver resent registration OTP via Brevo:",
        mailError.message
      );
      return res.status(500).json({
        error: formatSmtpError(mailError),
      });
    }
  } catch (error) {
    console.error("Error in resendRegisterOtp controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Register wrapper for backward compatibility - delegates to sendRegisterOtp
 */
export const register = async (req, res) => {
  return sendRegisterOtp(req, res);
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    email = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!email || !EMAIL_REGEX.test(email)) {
      return res
        .status(400)
        .json({ error: "Please provide a valid email address" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      phone: user.phone,
      about: user.about,
      settings: user.settings,
      token,
    });
  } catch (error) {
    console.error("Error in Login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in Logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").lean();
    if (!user) return res.status(401).json({ error: "User not found" });

    let token = req.cookies?.jwt;
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      token = generateToken(user._id, res);
    }

    res.status(200).json({ ...user, token });
  } catch (error) {
    console.error("Error in CheckAuth controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GoogleUserLogin = async (req, res) => {
  try {
    let { email, fullName, profilePic } = req.body;
    email = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        fullName: fullName || email.split("@")[0],
        profilePic:
          profilePic ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            fullName || "User"
          )}&background=0f172a&color=38bdf8`,
        password: "google-auth-no-password",
      });
      await user.save();
    }

    const token = generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      phone: user.phone,
      about: user.about,
      settings: user.settings,
      token,
    });
  } catch (error) {
    console.error("Error in Google Login", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Please enter your email address" });
    }

    email = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!EMAIL_REGEX.test(email)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address" });
    }

    const cleanEmail = email.trim();
    const user = await User.findOne({
      $or: [
        { email: cleanEmail.toLowerCase() },
        {
          email: {
            $regex: new RegExp(
              `^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i"
            ),
          },
        },
      ],
    });
    if (!user) {
      return res.status(400).json({
        error:
          "No account found with this email address. Please check your email or sign up.",
      });
    }

    // Generate 6 digit numeric OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const emailResult = await sendResetPasswordEmail(user.email, otp);

    res.status(200).json({
      message: "Password reset OTP has been sent!",
      email: user.email,
      devOtp: emailResult.simulated ? otp : undefined,
    });
  } catch (error) {
    console.error("Error in forgotPassword controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    let { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ error: "Email, OTP and new password are required" });
    }

    email = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const cleanEmail = email.trim();
    const user = await User.findOne({
      $or: [
        { email: cleanEmail.toLowerCase() },
        {
          email: {
            $regex: new RegExp(
              `^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              "i"
            ),
          },
        },
      ],
    });
    if (!user) {
      return res
        .status(400)
        .json({ error: "User account not found with this email address." });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordExpires) {
      return res
        .status(400)
        .json({ error: "No password reset was requested or OTP has expired" });
    }

    if (new Date() > new Date(user.resetPasswordExpires)) {
      user.resetPasswordOtp = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res
        .status(400)
        .json({ error: "OTP has expired. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(otp.trim(), user.resetPasswordOtp);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "Invalid OTP code. Please check and try again." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      message: "Password has been reset successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Error in resetPassword controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
