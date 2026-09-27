import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    profilePic: { type: String, default: "" },
    about: { type: String, default: "Hey there! I am using VibeChat." },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    settings: {
      theme: { type: String, default: "light" },
      notifications: { type: Boolean, default: true },
      readReceipts: { type: Boolean, default: true },
      lastSeenVisible: { type: Boolean, default: true },
      soundEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
