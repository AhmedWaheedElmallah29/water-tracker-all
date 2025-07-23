const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: __dirname + "/config.env" });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Error handling middleware for JSON parsing
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    console.error("JSON parsing error:", error.message);
    return res.status(400).json({ message: "Invalid JSON format" });
  }
  next();
});
app.use(
  cors({
    origin: [
      "https://water-front-2k86d9phd-ahmed-elmallahs-projects.vercel.app",
      "https://water-front-nflhajo0w-ahmed-elmallahs-projects.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Import WaterEntry model
const WaterEntry = require("./models/WaterEntry");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Auth: Sign Up
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username and password required" });
    const existing = await User.findOne({ username });
    if (existing)
      return res.status(409).json({ message: "Username already exists" });
    const user = new User({ username, password });
    await user.save();
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, username: user.username });
  } catch (err) {
    console.error("Signup error:", err);
    if (err.name === "ValidationError") {
      // Collect all validation messages
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(" ") });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Auth: Sign In
app.post("/api/auth/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username and password required" });
    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: "Invalid username or password" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid username or password" });
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Remove all /api/water routes from here. Only use the router:
const waterRoutes = require("./routes/waterRoutes");
app.use("/api/water", waterRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Water Tracker API is running!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
  console.log(`💾 Using MongoDB Atlas for data persistence`);
});
