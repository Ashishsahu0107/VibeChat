import Message from "../model/message.model.js";
import User from "../model/user.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const { message } = req.body;
    const senderId = req.user._id;

    if (!message) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const newMessage = await Message.create({ senderId, receiverId, message });
    return res.status(201).json(newMessage);
  } catch (err) {
    console.log("Error in sendMessage controller: ", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (err) {
    console.log("Error in getMessages controller: ", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessages = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const senderId = req.user._id;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: "Message IDs are required" });
    }

    await Message.deleteMany({
      _id: { $in: messageIds },
      $or: [{ senderId: senderId }, { receiverId: senderId }]
    });

    return res.status(200).json({ message: "Messages deleted successfully" });
  } catch (err) {
    console.log("Error in deleteMessages controller: ", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
