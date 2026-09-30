import Status from "../model/status.model.js";
import Chat from "../model/chat.model.js";
import { getIo } from "../socket/socket.js";

// ── Create Status ─────────────────────────────────────────────────────────────
export const createStatus = async (req, res) => {
  try {
    const { type, content, background } = req.body;

    if (!type || !content) {
      return res.status(400).json({ message: "Type and content are required" });
    }

    // Debounce duplicate status submissions within 10 seconds
    const recentDuplicate = await Status.findOne({
      sender: req.user._id,
      type,
      content,
      createdAt: { $gt: new Date(Date.now() - 10000) },
    }).populate("sender", "fullName profilePic");

    if (recentDuplicate) {
      return res.status(200).json(recentDuplicate);
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    let status = await Status.create({
      sender: req.user._id,
      type,
      content,
      background: background || "#000000",
      expiresAt,
      viewers: [],
    });

    status = await status.populate("sender", "fullName profilePic");

    // Emit to socket
    const io = getIo();
    io.emit("new-status", status); // Broadly emit, clients filter if they are contacts

    res.status(201).json(status);
  } catch (error) {
    console.error("Error in createStatus:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Get Statuses ──────────────────────────────────────────────────────────────
export const getStatuses = async (req, res) => {
  try {
    // 1. Get all users the current user has a chat with (Contacts)
    const chats = await Chat.find({ users: req.user._id });
    const contactIds = new Set();
    chats.forEach((chat) => {
      chat.users.forEach((u) => {
        if (u.toString() !== req.user._id.toString()) {
          contactIds.add(u.toString());
        }
      });
    });

    // 2. Fetch active statuses (not expired) for contacts + self
    const activeStatuses = await Status.find({
      sender: { $in: [...Array.from(contactIds), req.user._id] },
      expiresAt: { $gt: new Date() },
    })
      .populate("sender", "fullName profilePic")
      .populate("viewers.user", "fullName profilePic")
      .sort({ createdAt: 1 }); // Oldest first so stories play in order

    res.status(200).json(activeStatuses);
  } catch (error) {
    console.error("Error in getStatuses:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── View Status ───────────────────────────────────────────────────────────────
export const viewStatus = async (req, res) => {
  try {
    const { statusId } = req.params;

    const status = await Status.findById(statusId);
    if (!status) return res.status(404).json({ message: "Status not found" });

    // Don't count own views
    if (status.sender.toString() === req.user._id.toString()) {
      return res.status(200).json(status);
    }

    const hasViewed = status.viewers.some(
      (v) => v.user.toString() === req.user._id.toString()
    );

    if (!hasViewed) {
      status.viewers.push({ user: req.user._id, viewedAt: new Date() });
      await status.save();
      
      // Emit update to the status owner
      const io = getIo();
      io.to(status.sender.toString()).emit("status-viewed", {
        statusId: status._id,
        viewer: { _id: req.user._id, fullName: req.user.fullName, profilePic: req.user.profilePic },
      });
    }

    res.status(200).json(status);
  } catch (error) {
    console.error("Error in viewStatus:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Delete Status ─────────────────────────────────────────────────────────────
export const deleteStatus = async (req, res) => {
  try {
    const { statusId } = req.params;

    const status = await Status.findById(statusId);
    if (!status) return res.status(404).json({ message: "Status not found" });

    if (status.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await status.deleteOne();

    const io = getIo();
    io.emit("status-deleted", statusId);

    res.status(200).json({ message: "Status deleted successfully" });
  } catch (error) {
    console.error("Error in deleteStatus:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
