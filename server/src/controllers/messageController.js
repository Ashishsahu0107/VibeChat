import Message from "../model/message.model.js";
import Chat from "../model/chat.model.js";
import User from "../model/user.model.js";
import cloudinary from "../config/cloudinary.js";
import { getIo } from "../socket/socket.js";

// ── Helper ──────────────────────────────────────────────────────────────────
const populateMessage = (msg) =>
  msg
    .populate("sender", "fullName profilePic email")
    .populate({
      path: "replyTo",
      populate: { path: "sender", select: "fullName profilePic" },
    });

// ── Send Message ─────────────────────────────────────────────────────────────
export const sendMessage = async (req, res) => {
  const { content, chatId, attachments, replyTo, isForwarded } = req.body;

  if (!content && (!attachments || attachments.length === 0)) {
    return res.status(400).json({ message: "Content or attachment required" });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (!chat.users.some((u) => u.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not a member of this chat" });
    }

    let message = await Message.create({
      sender: req.user._id,
      content: content || "",
      chatId,
      attachments: attachments || [],
      replyTo: replyTo || null,
      isForwarded: !!isForwarded,
    });

    // Populate the newly created message
    message = await Message.findById(message._id)
      .populate("sender", "fullName profilePic email")
      .populate("chatId")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "fullName profilePic" },
      });

    message = await User.populate(message, {
      path: "chatId.users",
      select: "fullName profilePic email",
    });

    // Update latestMessage & increment unread for other members
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id,
      $inc: {},
    });

    // Increment unread for other members
    await Chat.updateOne(
      { _id: chatId },
      {
        $inc: {
          "userStates.$[elem].unreadCount": 1,
        },
      },
      {
        arrayFilters: [{ "elem.userId": { $ne: req.user._id } }],
      }
    );

    // Emit via socket to all room members
    try {
      const io = getIo();
      io.to(chatId.toString()).emit("message-received", message);
    } catch (_) {}

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Get Messages (paginated) ─────────────────────────────────────────────────
export const allMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (!chat.users.some((u) => u.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not a member of this chat" });
    }

    const userState = chat.userStates?.find(
      (s) => s.userId && s.userId.toString() === req.user._id.toString()
    );
    const clearedAt = userState?.clearedAt || null;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    let query = {
      chatId: req.params.chatId,
      deletedFor: { $ne: req.user._id },
    };
    if (clearedAt) query.createdAt = { $gt: clearedAt };

    const total = await Message.countDocuments(query);
    const messages = await Message.find(query)
      .populate("sender", "fullName profilePic email")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "fullName profilePic" },
      })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ messages, total, page, limit });
  } catch (error) {
    console.error("Error in allMessages:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Edit Message ─────────────────────────────────────────────────────────────
export const editMessage = async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: "Content required" });

  try {
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    if (msg.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Cannot edit others' messages" });
    }

    msg.content = content.trim();
    msg.isEdited = true;
    await msg.save();

    const populated = await populateMessage(msg);

    try {
      const io = getIo();
      io.to(msg.chatId.toString()).emit("message-edited", populated);
    } catch (_) {}

    res.status(200).json(populated);
  } catch (error) {
    console.error("Error in editMessage:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Delete Message ────────────────────────────────────────────────────────────
export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const { forEveryone } = req.body;

  try {
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    const isSender = msg.sender.toString() === req.user._id.toString();

    if (forEveryone && isSender) {
      msg.content = "This message was deleted";
      msg.attachments = [];
      msg.isDeleted = true;
      await msg.save();

      try {
        const io = getIo();
        io.to(msg.chatId.toString()).emit("message-deleted", {
          messageId,
          chatId: msg.chatId,
          forEveryone: true,
        });
      } catch (_) {}

      return res.status(200).json({ message: "Message deleted for everyone", messageId });
    } else {
      if (!msg.deletedFor.includes(req.user._id)) {
        msg.deletedFor.push(req.user._id);
        await msg.save();
      }
      return res.status(200).json({ message: "Message deleted for you", messageId });
    }
  } catch (error) {
    console.error("Error in deleteMessage:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── React to Message ──────────────────────────────────────────────────────────
export const reactToMessage = async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;

  try {
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    const userId = req.user._id.toString();
    const existingIdx = msg.reactions.findIndex(
      (r) => r.userId.toString() === userId
    );

    if (existingIdx > -1) {
      if (msg.reactions[existingIdx].emoji === emoji) {
        // Toggle off — remove reaction
        msg.reactions.splice(existingIdx, 1);
      } else {
        // Update emoji
        msg.reactions[existingIdx].emoji = emoji;
      }
    } else {
      msg.reactions.push({ userId: req.user._id, emoji });
    }

    await msg.save();

    const reactionData = { messageId, chatId: msg.chatId, reactions: msg.reactions };

    try {
      const io = getIo();
      io.to(msg.chatId.toString()).emit("message-reaction", reactionData);
    } catch (_) {}

    res.status(200).json(reactionData);
  } catch (error) {
    console.error("Error in reactToMessage:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Star / Unstar Message ─────────────────────────────────────────────────────
export const starMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    const userId = req.user._id;
    const isStarred = msg.starredBy.some((id) => id.toString() === userId.toString());

    if (isStarred) {
      msg.starredBy = msg.starredBy.filter((id) => id.toString() !== userId.toString());
    } else {
      msg.starredBy.push(userId);
    }

    await msg.save();
    res.status(200).json({ messageId, starred: !isStarred });
  } catch (error) {
    console.error("Error in starMessage:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Mark Messages as Read ────────────────────────────────────────────────────
export const markAsRead = async (req, res) => {
  const { chatId } = req.params;

  try {
    // Reset unread count for this user in this chat
    await Chat.updateOne(
      { _id: chatId, "userStates.userId": req.user._id },
      { $set: { "userStates.$.unreadCount": 0 } }
    );

    // Mark all unread messages in this chat as read
    const updated = await Message.updateMany(
      {
        chatId,
        sender: { $ne: req.user._id },
        "readBy.userId": { $ne: req.user._id },
      },
      {
        $push: { readBy: { userId: req.user._id, at: new Date() } },
        $set: { status: "read" },
      }
    );

    try {
      const io = getIo();
      io.to(chatId.toString()).emit("messages-read", {
        chatId,
        userId: req.user._id,
      });
    } catch (_) {}

    res.status(200).json({ updated: updated.modifiedCount });
  } catch (error) {
    console.error("Error in markAsRead:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Upload Attachment ────────────────────────────────────────────────────────
export const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const mimeType = req.file.mimetype;
    let resourceType = "auto";
    let attachmentType = "document";

    if (mimeType.startsWith("image/")) {
      resourceType = "image";
      attachmentType = "image";
    } else if (mimeType.startsWith("video/")) {
      resourceType = "video";
      attachmentType = "video";
    } else if (mimeType.startsWith("audio/")) {
      resourceType = "video"; // Cloudinary uses "video" resource type for audio
      attachmentType = "audio";
    } else {
      resourceType = "raw";
      attachmentType = "document";
    }

    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: "vibechat_attachments",
          use_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const uploadResponse = await uploadPromise;

    const attachment = {
      url: uploadResponse.secure_url,
      type: attachmentType,
      name: req.file.originalname,
      size: req.file.size,
    };

    res.status(200).json(attachment);
  } catch (error) {
    console.error("Error in uploadAttachment:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ── Search Messages ───────────────────────────────────────────────────────────
export const searchMessages = async (req, res) => {
  const { chatId } = req.params;
  const { q } = req.query;

  if (!q) return res.status(400).json({ message: "Query required" });

  try {
    const messages = await Message.find({
      chatId,
      content: { $regex: q, $options: "i" },
      deletedFor: { $ne: req.user._id },
      isDeleted: { $ne: true },
    })
      .populate("sender", "fullName profilePic")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in searchMessages:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
