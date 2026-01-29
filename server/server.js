const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

if (!process.env.MONGO_URI) {
  console.error(" MONGO_URI is missing");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error(" JWT_SECRET is missing");
  process.exit(1);
}

const app = express();

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://form-builder-app-vert.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed", err);
    process.exit(1);
  });

// routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running successfully 🚀",
  });
});

// --- CRITICAL FIX HERE ---
// Changed from "/auth" to "/api/auth" to match your frontend API calls
app.use("/api/auth", require("./routes/authRoutes")); 
app.use("/api/forms", require("./routes/formRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});