// server/routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // Built-in node module for random codes
const User = require("../models/User");

const router = express.Router();

// Helper: Generate random 6-char code (e.g., "AB12CD")
const generateOrgCode = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    // We now accept 'role' and 'orgCode' (if user is joining an org)
    const { name, email, password, role, orgCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare base user data
    let userData = {
      name,
      email,
      password: hashedPassword,
      role: role || "user", // Default to user if not specified
    };

    // --- LOGIC: ADMIN VS USER ---
    if (userData.role === "admin") {
      // 1. ADMIN REGISTRATION: Generate a unique Org Code
      let code = generateOrgCode();
      let isUnique = false;
      
      // Ensure code is truly unique in DB
      while (!isUnique) {
        const check = await User.findOne({ orgCode: code });
        if (!check) isUnique = true;
        else code = generateOrgCode();
      }
      
      userData.orgCode = code;
      // Don't set linkedAdmin for admins

    } else {
      // 2. USER REGISTRATION: Must provide an Org Code to join
      if (!orgCode) {
        return res.status(400).json({ 
          message: "Organization Code is required for standard users." 
        });
      }

      // Verify the Org Code exists
      const adminUser = await User.findOne({ orgCode, role: "admin" });
      if (!adminUser) {
        return res.status(404).json({ message: "Invalid Organization Code" });
      }

      // Link User to this Admin
      userData.linkedAdmin = adminUser._id;
    }

    // Create the user in MongoDB
    const newUser = await User.create(userData);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      orgCode: newUser.orgCode, // Return code so Admin can see it immediately
      role: newUser.role
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ 
      message: "Server error during registration",
      error: error.message 
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    // Embed Role in the Token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,         // Frontend needs this to redirect
        orgCode: user.orgCode,   // Admin dashboard needs this
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;