import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { sendResetPasswordEmail } from "../utils/sendEmail.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req, res) => {
  try {
    let { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    email = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const profilePic = `https://ui-avatars.com/api/?name=${fullName.replace(' ', '+')}&background=random`;

    const newUser = new User({
      fullName: fullName.trim(),
      email,
      password: hashedPassword,
      phone: phone || "",
      profilePic: profilePic,
    });

    await newUser.save();

    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      phone: newUser.phone,
      about: newUser.about,
      settings: newUser.settings
    });
  } catch (error) {
    console.log("Error in Register controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    email = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      phone: user.phone,
      about: user.about,
      settings: user.settings
    });
  } catch (error) {
    console.log("Error in Login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { 
      maxAge: 0,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: process.env.NODE_ENV === "production"
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in Logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await (await import("../model/user.model.js")).default
      .findById(req.user._id)
      .select("-password");
    if (!user) return res.status(401).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in CheckAuth controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GoogleUserLogin = async (req, res) => {
  try {
    // googleMiddleware.js should attach req.user if token is valid
    // For now, let's just create/login based on req.body
    let { email, fullName, profilePic } = req.body;
    email = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        email,
        fullName,
        profilePic: profilePic || `https://ui-avatars.com/api/?name=${fullName?.replace(' ', '+')}`,
        password: "google-auth-no-password",
      });
      await user.save();
    }
    
    generateToken(user._id, res);
    
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      phone: user.phone,
      about: user.about,
      settings: user.settings
    });
  } catch (error) {
    console.log("Error in Google Login", error.message);
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
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    const cleanEmail = email.trim();
    const user = await User.findOne({
      $or: [
        { email: cleanEmail.toLowerCase() },
        { email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
      ],
    });
    if (!user) {
      return res.status(400).json({ error: "No account found with this email address. Please check your email or sign up." });
    }

    // Generate 6 digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
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
      return res.status(400).json({ error: "Email, OTP and new password are required" });
    }

    email = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const cleanEmail = email.trim();
    const user = await User.findOne({
      $or: [
        { email: cleanEmail.toLowerCase() },
        { email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
      ],
    });
    if (!user) {
      return res.status(400).json({ error: "User account not found with this email address." });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordExpires) {
      return res.status(400).json({ error: "No password reset was requested or OTP has expired" });
    }

    if (new Date() > new Date(user.resetPasswordExpires)) {
      user.resetPasswordOtp = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(otp.trim(), user.resetPasswordOtp);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid OTP code. Please check and try again." });
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
