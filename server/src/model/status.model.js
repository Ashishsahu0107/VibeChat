import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "video"],
      required: true,
    },
    content: {
      type: String, // Text content or media URL
      required: true,
    },
    background: {
      type: String, // Hex color or CSS gradient for text status
      default: "#000000",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatically delete document when expiresAt is reached
    },
    viewers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Status = mongoose.model("Status", statusSchema);

export default Status;
