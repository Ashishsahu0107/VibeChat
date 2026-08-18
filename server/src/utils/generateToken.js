import jwt from "jsonwebtoken";

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in MS
    httpOnly: true, // prevent XSS attacks
    sameSite: "strict", // CSRF protection
    secure: process.env.NODE_ENV !== "development",
  });
};

export default generateToken;
