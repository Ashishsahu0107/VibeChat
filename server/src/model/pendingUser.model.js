import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    }, // Stored pre-hashed with bcrypt
    otp: {
      type: String,
      required: true,
    }, // Stored securely hashed with bcrypt
    otpExpiresAt: {
      type: Date,
      required: true,
    },
    lastOtpSentAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // MongoDB TTL index: automatically deletes document 300 seconds (5 minutes) after createdAt
    },
  },
  { timestamps: true }
);

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

export default PendingUser;

