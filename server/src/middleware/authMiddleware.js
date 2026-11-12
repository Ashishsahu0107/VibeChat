import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies?.jwt;

    // Check Authorization Bearer header as reliable cross-origin fallback
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password").lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware: ", error.message);
    res.status(401).json({ error: "Unauthorized - Invalid or Expired Token" });
  }
};
