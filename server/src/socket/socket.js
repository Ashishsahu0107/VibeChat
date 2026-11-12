import { Server } from "socket.io";
import User from "../model/user.model.js";

let io;
// Map: userId -> Set of socketIds (supports multi-tab, multi-device)
const userSocketMap = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    pingTimeout: 20000,
    pingInterval: 10000,
    perMessageDeflate: false, // Low CPU overhead, faster delivery for small JSON messages
    transports: ["websocket", "polling"], // Prefer WebSocket for lowest latency
    cors: {
      origin: (origin, callback) => callback(null, true),
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // ── Setup: register user socket ──────────────────────────────────────────
    socket.on("setup", async (userId) => {
      if (!userId) return;
      const uid = String(userId);
      socket.userId = uid;
      socket.join(uid);

      if (!userSocketMap.has(uid)) {
        userSocketMap.set(uid, new Set());
      }
      userSocketMap.get(uid).add(socket.id);

      try {
        await User.findByIdAndUpdate(uid, { isOnline: true });
      } catch (_) {}

      io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
      socket.emit("connected");
    });

    // ── Join Chat Room ───────────────────────────────────────────────────────
    socket.on("join-chat", (chatId) => {
      if (chatId) socket.join(String(chatId));
    });

    socket.on("leave-chat", (chatId) => {
      if (chatId) socket.leave(String(chatId));
    });

    // ── Typing Indicators ────────────────────────────────────────────────────
    socket.on("typing", ({ chatId, userId, userName }) => {
      if (chatId) socket.to(String(chatId)).emit("typing", { chatId, userId, userName });
    });

    socket.on("stop-typing", ({ chatId, userId }) => {
      if (chatId) socket.to(String(chatId)).emit("stop-typing", { chatId, userId });
    });

    // ── Message Delivered / Read Receipts ─────────────────────────────────────
    socket.on("message-delivered", ({ messageId, chatId, userId }) => {
      if (chatId) {
        socket.to(String(chatId)).emit("message-status-updated", {
          messageId,
          status: "delivered",
          userId,
        });
      }
    });

    socket.on("message-read", ({ messageId, chatId, userId }) => {
      if (chatId) {
        socket.to(String(chatId)).emit("message-status-updated", {
          messageId,
          status: "read",
          userId,
        });
      }
    });

    // ── Bulk Read ────────────────────────────────────────────────────────────
    socket.on("messages-read-bulk", ({ chatId, userId }) => {
      if (chatId) socket.to(String(chatId)).emit("messages-read", { chatId, userId });
    });

    // ── WebRTC Call Signaling (broadcasts to all sockets of targeted user) ────
    socket.on(
      "call-user",
      ({ userToCall, signalData, from, name, isVideoCall, chatId }) => {
        if (userToCall) {
          io.to(String(userToCall)).emit("call-incoming", {
            signal: signalData,
            from,
            name,
            isVideoCall,
            chatId,
          });
        }
      },
    );

    socket.on("answer-call", (data) => {
      if (data?.to) {
        io.to(String(data.to)).emit("call-accepted", data.signal);
      }
    });

    socket.on("ice-candidate", (data) => {
      if (data?.to) {
        io.to(String(data.to)).emit("ice-candidate", data.candidate);
      }
    });

    socket.on("end-call", ({ to, chatId }) => {
      if (to) {
        io.to(String(to)).emit("call-ended", { chatId });
      }
    });

    socket.on("call-rejected", ({ to }) => {
      if (to) {
        io.to(String(to)).emit("call-rejected");
      }
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      const uid = socket.userId;
      if (uid && userSocketMap.has(uid)) {
        const userSockets = userSocketMap.get(uid);
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          userSocketMap.delete(uid);
          const lastSeen = new Date();
          try {
            await User.findByIdAndUpdate(uid, {
              isOnline: false,
              lastSeen,
            });
          } catch (_) {}
          io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
          io.emit("user-offline", { userId: uid, lastSeen });
        }
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
  const sockets = userSocketMap.get(String(receiverId));
  if (sockets && sockets.size > 0) {
    return Array.from(sockets)[0];
  }
  return null;
};
