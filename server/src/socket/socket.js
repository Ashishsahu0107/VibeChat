import { Server } from "socket.io";
import User from "../model/user.model.js";
import jwt from "jsonwebtoken";

let io;
// Map: userId -> Set of socketIds (support multiple tabs)
const userSocketMap = {}; // userId -> socketId (keep simple for compatibility)

export const initSocket = (server) => {
  io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: (origin, callback) => callback(null, true),
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // ── Setup: register user socket ──────────────────────────────────────────
    socket.on("setup", async (userId) => {
      if (!userId) return;
      userSocketMap[userId] = socket.id;
      socket.userId = userId; // store on socket for disconnect lookup
      socket.join(userId);

      try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
      } catch (_) {}

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      socket.emit("connected");
    });

    // ── Join Chat Room ───────────────────────────────────────────────────────
    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("leave-chat", (chatId) => {
      socket.leave(chatId);
    });

    // ── Typing Indicators ────────────────────────────────────────────────────
    socket.on("typing", ({ chatId, userId, userName }) => {
      socket.to(chatId).emit("typing", { chatId, userId, userName });
    });

    socket.on("stop-typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("stop-typing", { chatId, userId });
    });

    // ── Message Delivered / Read ─────────────────────────────────────────────
    socket.on("message-delivered", ({ messageId, chatId, userId }) => {
      socket.to(chatId).emit("message-status-updated", { messageId, status: "delivered", userId });
    });

    socket.on("message-read", ({ messageId, chatId, userId }) => {
      socket.to(chatId).emit("message-status-updated", { messageId, status: "read", userId });
    });

    // ── Bulk Read ────────────────────────────────────────────────────────────
    socket.on("messages-read-bulk", ({ chatId, userId }) => {
      socket.to(chatId).emit("messages-read", { chatId, userId });
    });

    // ── WebRTC Call Signaling ────────────────────────────────────────────────
    socket.on("call-user", ({ userToCall, signalData, from, name, isVideoCall, chatId }) => {
      const socketId = userSocketMap[userToCall];
      if (socketId) {
        io.to(socketId).emit("call-incoming", { signal: signalData, from, name, isVideoCall, chatId });
      }
    });

    socket.on("answer-call", (data) => {
      const socketId = userSocketMap[data.to];
      if (socketId) io.to(socketId).emit("call-accepted", data.signal);
    });

    socket.on("ice-candidate", (data) => {
      const socketId = userSocketMap[data.to];
      if (socketId) io.to(socketId).emit("ice-candidate", data.candidate);
    });

    socket.on("end-call", ({ to, chatId }) => {
      const socketId = userSocketMap[to];
      if (socketId) io.to(socketId).emit("call-ended", { chatId });
    });

    socket.on("call-rejected", ({ to }) => {
      const socketId = userSocketMap[to];
      if (socketId) io.to(socketId).emit("call-rejected");
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      const userId = socket.userId;
      if (userId && userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        try {
          await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
        } catch (_) {}
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        // Notify all rooms this user was in
        io.emit("user-offline", { userId, lastSeen: new Date() });
      }
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};
