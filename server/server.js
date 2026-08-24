import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.js";
import authRouter from "./src/routes/authRouter.js";
import userRouter from "./src/routes/userRouter.js";
import messageRouter from "./src/routes/messageRouter.js";
import publicRouter from "./src/routes/publicRouter.js";
import groupRouter from "./src/routes/groupRouter.js";
import http from "http";
import { initSocket } from "./src/socket/socket.js";

dotenv.config();

const port = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  }),
);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupRouter);
app.use("/api/public", publicRouter);

app.get("/", (req, res) => {
  res.json({ message: "This main route" });
});

const server = http.createServer(app);
const io = initSocket(server);

server.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});