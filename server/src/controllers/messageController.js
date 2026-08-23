import Message from "../model/message.model.js";
import Chat from "../model/chat.model.js";
import User from "../model/user.model.js";

// Send Message
export const sendMessage = async (req, res) => {
  const { content, chatId, attachments, replyTo } = req.body;

  if (!content && (!attachments || attachments.length === 0)) {
    return res.status(400).json({ message: "Invalid data passed into request" });
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chatId: chatId,
    attachments: attachments || [],
    replyTo: replyTo || null
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "fullName profilePic");
    message = await message.populate("chatId");
    message = await message.populate("replyTo");
    message = await User.populate(message, {
      path: "chatId.users",
      select: "fullName profilePic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get All Messages for a Chat
export const allMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    
    // Check clearedAt
    const userState = chat.userStates?.find(s => s.userId && s.userId.toString() === req.user._id.toString());
    const clearedAt = userState ? userState.clearedAt : null;
    
    let query = { chatId: req.params.chatId };
    if (clearedAt) {
      query.createdAt = { $gt: clearedAt };
    }
    // Also ignore messages deleted by this user
    query.deletedFor = { $ne: req.user._id };

    const messages = await Message.find(query)
      .populate("sender", "fullName profilePic email")
      .populate("replyTo")
      .sort({ createdAt: 1 });
      
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete Message for Me or Everyone
export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const { forEveryone } = req.body;
  try {
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    
    if (forEveryone && msg.sender.toString() === req.user._id.toString()) {
       await Message.findByIdAndDelete(messageId);
       return res.status(200).json({ message: "Message deleted for everyone" });
    } else {
       msg.deletedFor.push(req.user._id);
       await msg.save();
       return res.status(200).json({ message: "Message deleted for you" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


import cloudinary from "../config/cloudinary.js";

export const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      folder: "vibechat_attachments",
    });

    const attachment = {
      url: uploadResponse.secure_url,
      type: req.file.mimetype.startsWith("audio/") ? "audio" : 
            req.file.mimetype.startsWith("video/") ? "video" : 
            req.file.mimetype.startsWith("image/") ? "image" : "document",
      name: req.file.originalname,
      size: req.file.size
    };

    res.status(200).json(attachment);
  } catch (error) {
    console.log("Error in uploadAttachment: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
