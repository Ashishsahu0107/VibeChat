import jwt from "jsonwebtoken";

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  if (res) {
    res.cookie("jwt", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
      httpOnly: true, // Prevent client-side XSS access to cookie
      sameSite: isProduction ? "none" : "lax", // "none" allows cross-origin requests in prod; "lax" for localhost
      secure: isProduction, // Required by browsers when sameSite is "none"
      path: "/", // Available across all backend paths
    });
  }

  return token;
};

export default generateToken;
