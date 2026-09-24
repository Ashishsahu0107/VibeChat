import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    
    // Group specifics
    groupName: { type: String, trim: true },
    groupDescription: { type: String, default: "" },
    groupAvatar: { type: String, default: "" },
    groupAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
    // Per-user chat state (archived, muted, unread, etc)
    userStates: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        unreadCount: { type: Number, default: 0 },
        isPinned: { type: Boolean, default: false },
        isMuted: { type: Boolean, default: false },
        isArchived: { type: Boolean, default: false },
        clearedAt: { type: Date, default: null } // To hide messages before this date for this user
      }
    ]
  },
  { timestamps: true }
);

chatSchema.index({ users: 1 });
chatSchema.index({ "userStates.userId": 1 });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
