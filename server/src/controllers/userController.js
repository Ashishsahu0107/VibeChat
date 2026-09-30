import User from "../model/user.model.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";
import Chat from "../model/chat.model.js";
import Message from "../model/message.model.js";

// ── Get Users for Sidebar / Search ────────────────────────────────────────────
export const getUsersForSidebar = async (req, res) => {
  try {
    const { search } = req.query;

    const keyword = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const currentUser = await User.findById(req.user._id).select("blockedUsers");
    const blockedIds = currentUser?.blockedUsers || [];

    const users = await User.find(keyword)
      .find({
        _id: { $ne: req.user._id, $nin: blockedIds },
      })
      .select("-password")
      .limit(50);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Update Profile ─────────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, about, settings } = req.body;

    let updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (phone !== undefined) updateFields.phone = phone;
    if (about !== undefined) updateFields.about = about;

    if (settings) {
      if (settings.theme !== undefined) updateFields["settings.theme"] = settings.theme;
      if (settings.notifications !== undefined) updateFields["settings.notifications"] = settings.notifications;
      if (settings.readReceipts !== undefined) updateFields["settings.readReceipts"] = settings.readReceipts;
      if (settings.lastSeenVisible !== undefined) updateFields["settings.lastSeenVisible"] = settings.lastSeenVisible;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Change Password ────────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both passwords required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Upload Profile Image ───────────────────────────────────────────────────────
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "Image size must not exceed 5 MB" });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: "vibechat_profiles",
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in uploadProfileImage:", error.message);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// ── Block User ─────────────────────────────────────────────────────────────────
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot block yourself" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { blockedUsers: userId } },
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in blockUser:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Unblock User ───────────────────────────────────────────────────────────────
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { blockedUsers: userId } },
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in unblockUser:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Global Search ──────────────────────────────────────────────────────────────
export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.status(400).json({ error: "Query required" });
    }

    const regex = { $regex: q, $options: "i" };

    // Search users
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ fullName: regex }, { email: regex }],
    })
      .select("-password")
      .limit(10);

    // Get user's chats for context
    const userChatIds = await Chat.find({ users: req.user._id }).distinct("_id");

    // Search messages in user's chats
    const messages = await Message.find({
      chatId: { $in: userChatIds },
      content: regex,
      deletedFor: { $ne: req.user._id },
      isDeleted: { $ne: true },
    })
      .populate("sender", "fullName profilePic")
      .populate("chatId", "isGroupChat groupName users")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ users, messages });
  } catch (error) {
    console.error("Error in globalSearch:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Get User Profile by ID ─────────────────────────────────────────────────────
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password -blockedUsers");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserById:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
