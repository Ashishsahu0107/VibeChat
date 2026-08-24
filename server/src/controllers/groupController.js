import Group from "../model/group.model.js";
import Message from "../model/message.model.js";
import { getIo, getReceiverSocketId } from "../socket/socket.js";

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const admin = req.user._id;

    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    if (!members || members.length === 0) {
      return res.status(400).json({ error: "At least one member is required" });
    }

    // Include the admin in the members array if not already present
    const allMembers = [...new Set([...members, admin.toString()])];

    const group = await Group.create({
      name,
      admin,
      members: allMembers,
    });

    const populatedGroup = await Group.findById(group._id).populate("members", "fullName email");

    return res.status(201).json(populatedGroup);
  } catch (err) {
    console.log("Error in createGroup controller: ", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId }).populate("members", "fullName email");

    return res.status(200).json(groups);
  } catch (err) {
    console.log("Error in getGroups controller: ", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { id: groupId } = req.params;

    const messages = await Message.find({ groupId }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (err) {
    console.log("Error in getGroupMessages controller: ", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { message } = req.body;
    const senderId = req.user._id;

    if (!message) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (!group.members.includes(senderId)) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    const newMessage = await Message.create({ senderId, groupId, message });

    // Socket logic
    const io = getIo();
    io.to(groupId.toString()).emit("newGroupMessage", newMessage);

    return res.status(201).json(newMessage);
  } catch (err) {
    console.log("Error in sendGroupMessage controller: ", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
