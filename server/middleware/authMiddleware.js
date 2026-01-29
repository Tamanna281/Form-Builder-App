const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach User ID and Role to the request object
    req.userId = decoded.userId;
    req.userRole = decoded.role; // <-- NEW: Now you can access req.userRole anywhere!
    
    next();
  } catch (error) {
    // console.error("Token Verification Error:", error.message); // Optional debug
    res.status(401).json({ message: "Invalid or expired token" });
  }
};