import Chat from "../model/chat.model.js";
import User from "../model/user.model.js";
import Message from "../model/message.model.js";
import cloudinary from "../config/cloudinary.js";
import { getIo } from "../socket/socket.js";

// ── Fetch all chats ───────────────────────────────────────────────────────────
export const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmins", "-password")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "fullName profilePic email" },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error in fetchChats:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Access or Create 1-on-1 chat ─────────────────────────────────────────────
export const accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "UserId is required" });

  try {
    let chats = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "fullName profilePic email" },
      });

    if (chats.length > 0) {
      return res.status(200).json(chats[0]);
    }

    const chatData = {
      isGroupChat: false,
      users: [req.user._id, userId],
      userStates: [{ userId: req.user._id }, { userId }],
    };

    const created = await Chat.create(chatData);
    const fullChat = await Chat.findById(created._id).populate("users", "-password");
    res.status(200).json(fullChat);
  } catch (error) {
    console.error("Error in accessChat:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Create Group Chat ─────────────────────────────────────────────────────────
export const createGroupChat = async (req, res) => {
  const { name, users, description } = req.body;
  if (!users || !name) return res.status(400).json({ message: "Please fill all fields" });

  let parsedUsers;
  try {
    parsedUsers = typeof users === "string" ? JSON.parse(users) : users;
  } catch {
    return res.status(400).json({ message: "Invalid users data" });
  }

  if (parsedUsers.length < 2) {
    return res.status(400).json({ message: "More than 2 users required for a group chat" });
  }

  const allUsers = [...parsedUsers, req.user._id.toString()];

  try {
    const groupChat = await Chat.create({
      isGroupChat: true,
      groupName: name,
      groupDescription: description || "",
      users: allUsers,
      groupAdmins: [req.user._id],
      userStates: allUsers.map((u) => ({ userId: u })),
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users", "-password")
      .populate("groupAdmins", "-password");

    // Notify all members via socket
    try {
      const io = getIo();
      fullGroupChat.users.forEach((u) => {
        if (u._id.toString() !== req.user._id.toString()) {
          io.to(u._id.toString()).emit("group-created", fullGroupChat);
        }
      });
    } catch (_) {}

    res.status(200).json(fullGroupChat);
  } catch (error) {
    console.error("Error in createGroupChat:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Rename Group ──────────────────────────────────────────────────────────────
export const renameGroup = async (req, res) => {
  const { chatId, chatName, description } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat Not Found" });
    
    const isAdmin = chat.groupAdmins.some((a) => a.toString() === req.user._id.toString());
    if (!isAdmin) return res.status(403).json({ message: "Only admins can rename the group" });

    const update = {};
    if (chatName) update.groupName = chatName;
    if (description !== undefined) update.groupDescription = description;

    const updatedChat = await Chat.findByIdAndUpdate(chatId, update, { new: true })
      .populate("users", "-password")
      .populate("groupAdmins", "-password");

    try {
      const io = getIo();
      io.to(chatId).emit("group-updated", updatedChat);
    } catch (_) {}

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error in renameGroup:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Update Group Avatar ───────────────────────────────────────────────────────
export const updateGroupAvatar = async (req, res) => {
  const { chatId } = req.params;
  try {
    if (!req.file) return res.status(400).json({ message: "No image provided" });
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "Image size must not exceed 5 MB" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat Not Found" });
    
    const isAdmin = chat.groupAdmins.some((a) => a.toString() === req.user._id.toString());
    if (!isAdmin) return res.status(403).json({ message: "Only admins can update group image" });

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "vibechat_groups",
      transformation: [{ width: 400, height: 400, crop: "fill" }],
    });

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { groupAvatar: result.secure_url },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmins", "-password");

    try {
      const io = getIo();
      io.to(chatId).emit("group-updated", updatedChat);
    } catch (_) {}

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error in updateGroupAvatar:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Add to Group ──────────────────────────────────────────────────────────────
export const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat Not Found" });
    
    const isAdmin = chat.groupAdmins.some((a) => a.toString() === req.user._id.toString());
    if (!isAdmin) return res.status(403).json({ message: "Only admins can add members" });

    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId, userStates: { userId } } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmins", "-password");

    try {
      const io = getIo();
      io.to(chatId).emit("group-updated", added);
      io.to(userId.toString()).emit("group-created", added);
    } catch (_) {}

    res.status(200).json(added);
  } catch (error) {
    console.error("Error in addToGroup:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Remove from Group ─────────────────────────────────────────────────────────
export const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat Not Found" });

    const isAdmin = chat.groupAdmins.some((a) => a.toString() === req.user._id.toString());
    const isSelf = userId === req.user._id.toString();

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Only admins can remove members" });
    }

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId, userStates: { userId }, groupAdmins: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmins", "-password");

    try {
      const io = getIo();
      io.to(chatId).emit("group-updated", removed);
      io.to(userId.toString()).emit("removed-from-group", { chatId });
    } catch (_) {}

    res.status(200).json(removed);
  } catch (error) {
    console.error("Error in removeFromGroup:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Make Admin ────────────────────────────────────────────────────────────────
export const makeAdmin = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat Not Found" });
    
    const isAdmin = chat.groupAdmins.some((a) => a.toString() === req.user._id.toString());
    if (!isAdmin) return res.status(403).json({ message: "Only admins can assign admins" });

    const updated = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { groupAdmins: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmins", "-password");

    try {
      const io = getIo();
      io.to(chatId).emit("group-updated", updated);
    } catch (_) {}

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error in makeAdmin:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Update Chat State (mute, pin, archive, clear) ────────────────────────────
export const updateChatState = async (req, res) => {
  const { chatId } = req.params;
  const { isPinned, isMuted, isArchived, clearChat } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat Not Found" });

    let stateIndex = chat.userStates.findIndex(
      (s) => s.userId?.toString() === req.user._id.toString()
    );
    if (stateIndex === -1) {
      chat.userStates.push({ userId: req.user._id });
      stateIndex = chat.userStates.length - 1;
    }

    if (isPinned !== undefined) chat.userStates[stateIndex].isPinned = isPinned;
    if (isMuted !== undefined) chat.userStates[stateIndex].isMuted = isMuted;
    if (isArchived !== undefined) chat.userStates[stateIndex].isArchived = isArchived;
    if (clearChat) {
      chat.userStates[stateIndex].clearedAt = new Date();
      chat.userStates[stateIndex].unreadCount = 0;
    }

    await chat.save();
    res.status(200).json(chat);
  } catch (error) {
    console.error("Error in updateChatState:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Delete Chat (remove user from it) ────────────────────────────────────────
export const deleteChat = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat Not Found" });
    if (!chat.users.some((u) => u.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not a member of this chat" });
    }

    if (chat.isGroupChat) {
      // Just remove user from group
      await Chat.findByIdAndUpdate(chatId, {
        $pull: { users: req.user._id, userStates: { userId: req.user._id }, groupAdmins: req.user._id },
      });
    } else {
      // For 1-on-1, soft delete (mark clearedAt)
      let stateIndex = chat.userStates.findIndex(
        (s) => s.userId?.toString() === req.user._id.toString()
      );
      if (stateIndex === -1) {
        chat.userStates.push({ userId: req.user._id });
        stateIndex = chat.userStates.length - 1;
      }
      chat.userStates[stateIndex].clearedAt = new Date();
      await chat.save();
    }

    res.status(200).json({ message: "Chat deleted", chatId });
  } catch (error) {
    console.error("Error in deleteChat:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
