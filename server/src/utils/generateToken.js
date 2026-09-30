import jwt from "jsonwebtoken";

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    httpOnly: true, // prevent XSS attacks
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // cross-site allowed in prod
    secure: process.env.NODE_ENV === "production",
  });
};

export default generateToken;
