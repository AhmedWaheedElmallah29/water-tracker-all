const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));

// -----------------------------------------------------
// 1. تظبيط الـ CORS (عشان Netlify يعرف يكلم Vercel)
// -----------------------------------------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://water-tracker-all.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Invalid JSON format" });
  }
  next();
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Models & Routes
const User = require("./models/User");
const waterRoutes = require("./routes/waterRoutes"); // تأكد إن المسار صح
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Routes Setup
app.use("/api/water", waterRoutes);

// Auth Routes (Sign Up)
app.post("/api/auth/signup", async (req, res) => {
  // ... (نفس كود الـ Signup بتاعك) ...
  // اختصاراً للكود هنا، سيب الكود القديم زي ما هو داخل الـ functions
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Required fields missing" });
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ message: "User exists" });
    const user = new User({ username, password });
    await user.save();
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// Auth Routes (Sign In)
app.post("/api/auth/signin", async (req, res) => {
  // ... (نفس كود الـ Signin بتاعك) ...
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "API is running on Vercel!" });
});

// -----------------------------------------------------
// 2. أهم حتة عشان Vercel (Export vs Listen)
// -----------------------------------------------------
const PORT = process.env.PORT || 5000;

// لو الكود شغال على جهازك (Development)، شغل السيرفر عادي
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on port ${PORT}`);
  });
}

// السطر ده عشان Vercel يفهم الكود
module.exports = app;
