import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Profile Pic placeholder
    const profilePic = `https://ui-avatars.com/api/?name=${fullName}&background=random`;

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      image: profilePic,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.image,
        message: "Registration successful!",
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in register controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || "",
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.image,
      message: "Login successful!",
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const GoogleUserLogin = async (req, res, next) => {
  try {
    let { name, email, id, imageUrl } = req.body;

    if (!imageUrl) {
      imageUrl = `https://ui-avatars.com/api/?name=${name}&background=random`;
    }
    let existingUser = await User.findOne({ email });
    const salt = await bcrypt.genSalt(10);

    if (existingUser) {
      if (!existingUser.userType || existingUser.userType === "regular") {
        existingUser.userType = "hybrid";
        existingUser.googleId = await bcrypt.hash(id, salt);
        await existingUser.save();
      } else {
        const isVerified = await bcrypt.compare(id, existingUser.googleId);
        if (!isVerified) {
          const error = new Error("User Not Verified");
          error.statusCode = 400;
          return next(error);
        }
      }
    } else {
      const hashGoogleID = await bcrypt.hash(id, salt);

      const newUser = await User.create({
        fullName: name,
        email,
        googleId: hashGoogleID,
        userType: "google",
        image: imageUrl,
      });
      existingUser = newUser;
    }

    generateToken(existingUser._id, res);
    res.status(200).json({
      _id: existingUser._id,
      fullName: existingUser.fullName,
      email: existingUser.email,
      profilePic: existingUser.image,
      message: "Login successful!",
    });
  } catch (error) {
    next(error);
  }
};
