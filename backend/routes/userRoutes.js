const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

const router = express.Router();

// Function to Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Middleware to Protect Routes
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) res.status(401).json({ message: "Not authorized, no token" });
};

// Register User
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      rewards: user.rewards,
      role: "Customer",
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      rewards: user.rewards,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

// ✅ Move this route **after** the `protect` function definition
router.get("/profile", protect, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// Update user profile
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    console.log(user)

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, 10);
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        rewards: updatedUser.rewards,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Send reset email
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "No user with that email" });

  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const resetURL = `http://localhost:8081/reset/${token}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail", 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: user.email,
    subject: "Password Reset",
    html: `<p>You requested a password reset</p><p>Click <a href="${resetURL}">here</a> to reset your password</p>`,
  });

  res.json({ message: "Password reset email sent" });
});

// Reset password route
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  res.status(200).json({ message: "Password reset successful" });
});

router.get("/all", protect, async (req, res) => {
  const requester = await User.findById(req.user._id);
  if (!requester || requester.role !== "Admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const users = await User.find().select("-password");
  res.json(users);
});

router.put("/:id", protect, async (req, res) => {
  const requester = await User.findById(req.user._id);
  if (!requester || requester.role !== "Admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { email, rewards, role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.email = email || user.email;
  user.rewards = rewards ?? user.rewards;
  user.role = role || user.role;

  await user.save();
  res.json({ message: "User updated" });
});

router.delete("/:id", protect, async (req, res) => {
  const requester = await User.findById(req.user._id);
  if (!requester || requester.role !== "Admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await user.deleteOne();
  res.json({ message: "User deleted" });
});

router.post("/scan/:id", protect, async (req, res) => {
  const scanner = await User.findById(req.user._id);

  if (!scanner || (scanner.role !== "Admin" && scanner.role !== "Employee")) {
    return res.status(403).json({ message: "Only Admins or Employees can scan QR codes" });
  }

  try {
    const scannedUser = await User.findById(req.params.id);
    if (!scannedUser) return res.status(404).json({ message: "User not found" });

    scannedUser.rewards += 1;
    await scannedUser.save();

    res.json({ message: "1 point added", rewards: scannedUser.rewards });
  } catch (error) {
    console.error("Error adding reward point:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = { router, protect };