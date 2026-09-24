import { Server } from "socket.io";
import User from "../model/user.model.js";

let io;
const userSocketMap = {}; // userId -> socketId

export const initSocket = (server) => {
  io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: (origin, callback) => callback(null, true),
      credentials: true,
      methods: ["GET", "POST"],
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Initial setup when user logs in
    socket.on("setup", async (userId) => {
      userSocketMap[userId] = socket.id;
      socket.join(userId); // Join personal room for targeted events
      
      // Update DB
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      socket.emit("connected");
    });

    // Join a specific chat room (for typing/read events)
    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    // New Message Event
    socket.on("new-message", (newMessageReceived) => {
      let chat = newMessageReceived.chatId;

      if (!chat.users) return console.log("chat.users not defined");

      chat.users.forEach((user) => {
        if (user._id === newMessageReceived.sender._id) return; // Don't send to self
        
        socket.in(user._id).emit("message-received", newMessageReceived);
      });
    });

    // Typing Indicators
    socket.on("typing", (room) => socket.in(room).emit("typing", room));
    socket.on("stop-typing", (room) => socket.in(room).emit("stop-typing", room));

    // Message Status Events (Delivered / Read)
    socket.on("message-delivered", ({ messageId, chatId, userId }) => {
      // In a real app, you might update DB here or via API
      socket.in(chatId).emit("message-status-updated", { messageId, status: "delivered", userId });
    });

    socket.on("message-read", ({ messageId, chatId, userId }) => {
       socket.in(chatId).emit("message-status-updated", { messageId, status: "read", userId });
    });

    // Call Signaling (WebRTC)
    socket.on("call-user", ({ userToCall, signalData, from, name, isVideoCall, chatId }) => {
      const socketId = userSocketMap[userToCall];
      if (socketId) {
        io.to(socketId).emit("call-incoming", { signal: signalData, from, name, isVideoCall, chatId });
      }
    });

    socket.on("answer-call", (data) => {
      const socketId = userSocketMap[data.to];
      if (socketId) {
        io.to(socketId).emit("call-accepted", data.signal);
      }
    });

    socket.on("ice-candidate", (data) => {
      const socketId = userSocketMap[data.to];
      if (socketId) {
        io.to(socketId).emit("ice-candidate", data.candidate);
      }
    });

    socket.on("end-call", ({ to, chatId }) => {
      const socketId = userSocketMap[to];
      if (socketId) {
        io.to(socketId).emit("call-ended", { chatId });
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);
      for (let [userId, socketId] of Object.entries(userSocketMap)) {
        if (socketId === socket.id) {
          delete userSocketMap[userId];
          // Update DB
          await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
          io.emit("getOnlineUsers", Object.keys(userSocketMap));
          break;
        }
      }
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};
