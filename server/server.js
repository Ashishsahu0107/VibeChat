import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.js";
import authRouter from "./src/routes/authRouter.js";
import userRouter from "./src/routes/userRouter.js";
import messageRouter from "./src/routes/messageRouter.js";

dotenv.config();

const port = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Vite frontend
    credentials: true,
  }),
);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);

app.get("/", (req, res) => {
  res.json({ message: "This main route" });
});

app.listen(port, () => {
  connectDB();
  console.log(`server is running on port ${port}`);
})