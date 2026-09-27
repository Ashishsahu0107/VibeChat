import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video", "document", "audio"], required: true },
  name: String,
  size: Number,
});

const reactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  emoji: { type: String, required: true },
});

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    content: { type: String, default: "" },
    attachments: [attachmentSchema],

    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    isForwarded: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },

    // Reactions
    reactions: [reactionSchema],

    // Starred by these users
    starredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Status tracking
    status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
    deliveredTo: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      at: { type: Date, default: Date.now },
    }],
    readBy: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      at: { type: Date, default: Date.now },
    }],

    // Soft delete per user
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ chatId: 1, content: "text" }); // For text search

const Message = mongoose.model("Message", messageSchema);
export default Message;
