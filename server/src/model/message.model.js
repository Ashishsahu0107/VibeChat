import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video", "document", "audio"], required: true },
  name: String,
  size: Number
});

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    content: { type: String },
    attachments: [attachmentSchema],
    
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    isForwarded: { type: Boolean, default: false },
    
    // Status tracking (for 1-on-1, simplify. For groups, use arrays)
    status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
    deliveredTo: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      at: { type: Date, default: Date.now }
    }],
    readBy: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      at: { type: Date, default: Date.now }
    }],

    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
