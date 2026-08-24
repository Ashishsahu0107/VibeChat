import { Server } from "socket.io";

let io;
const userSocketMap = {}; // userId -> socketId

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      credentials: true,
      methods: ["GET", "POST"],
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (userId) => {
      userSocketMap[userId] = socket.id;
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    socket.on("join-groups", (groupIds) => {
      if (Array.isArray(groupIds)) {
        groupIds.forEach(groupId => {
          socket.join(groupId.toString());
        });
      }
    });

    socket.on("call-user", ({ userToCall, signalData, from, name, isVideoCall }) => {
      const socketId = userSocketMap[userToCall];
      if (socketId) {
        io.to(socketId).emit("call-incoming", { signal: signalData, from, name, isVideoCall });
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

    socket.on("end-call", ({ to }) => {
      const socketId = userSocketMap[to];
      if (socketId) {
        io.to(socketId).emit("call-ended");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (let [userId, socketId] of Object.entries(userSocketMap)) {
        if (socketId === socket.id) {
          delete userSocketMap[userId];
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
