import Chat from "../model/chat.model.js";
import User from "../model/user.model.js";
import Message from "../model/message.model.js";

// Fetch all chats for a user
export const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmins", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
      
    // Deep populate the sender of the latest message
    const populatedChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "fullName profilePic email",
    });

    res.status(200).json(populatedChats);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Access or create 1-on-1 chat
export const accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "UserId is required" });

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "fullName profilePic email",
    });

    if (isChat.length > 0) {
      return res.status(200).json(isChat[0]);
    } else {
      var chatData = {
        isGroupChat: false,
        users: [req.user._id, userId],
        userStates: [
          { userId: req.user._id },
          { userId: userId }
        ]
      };

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
      res.status(200).json(FullChat);
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Create a group chat
export const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all fields" });
  }

  let users = JSON.parse(req.body.users);
  if (users.length < 2) {
    return res.status(400).send("More than 2 users required for a group chat");
  }
  users.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      isGroupChat: true,
      groupName: req.body.name,
      users: users,
      groupAdmins: [req.user._id],
      userStates: users.map(u => ({ userId: u }))
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmins", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Rename Group
export const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { groupName: chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmins", "-password");

    if (!updatedChat) return res.status(404).json({ message: "Chat Not Found" });
    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Add to Group
export const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { 
        $push: { users: userId, userStates: { userId: userId } }
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmins", "-password");

    if (!added) return res.status(404).json({ message: "Chat Not Found" });
    res.status(200).json(added);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Remove from Group
export const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { 
        $pull: { users: userId, userStates: { userId: userId } }
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmins", "-password");

    if (!removed) return res.status(404).json({ message: "Chat Not Found" });
    res.status(200).json(removed);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update user specific state (mute, pin, archive, clear)
export const updateChatState = async (req, res) => {
  const { chatId } = req.params;
  const { isPinned, isMuted, isArchived, clearChat } = req.body;
  
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat Not Found" });
    
    let stateIndex = chat.userStates.findIndex(s => s.userId?.toString() === req.user._id.toString());
    if (stateIndex === -1) {
       chat.userStates.push({ userId: req.user._id });
       stateIndex = chat.userStates.length - 1;
    }
    
    if (isPinned !== undefined) chat.userStates[stateIndex].isPinned = isPinned;
    if (isMuted !== undefined) chat.userStates[stateIndex].isMuted = isMuted;
    if (isArchived !== undefined) chat.userStates[stateIndex].isArchived = isArchived;
    if (clearChat) chat.userStates[stateIndex].clearedAt = new Date(); // Hides prior messages

    await chat.save();
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

