// server/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // --- NEW FIELDS FOR MULTI-TENANCY ---
  role: { 
    type: String, 
    enum: ["user", "admin"], 
    default: "user" 
  },
  
  // For Admins: The unique code they share with employees
  orgCode: { 
    type: String, 
    unique: true, 
    sparse: true // Allows null for users
  },

  // For Users: The ID of the Admin they work for
  linkedAdmin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);