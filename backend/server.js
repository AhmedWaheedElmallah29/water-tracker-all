const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const serverless = require("serverless-http"); // 👈 إضافة مهمة
const jwt = require("jsonwebtoken");

// Load environment variables
// التعديل: شلنا تحديد المسار عشان يشتغل محلي وعلى السيرفر
dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));

// إعدادات الـ CORS
// ⚠️ ملاحظة: لما ترفع الفرونت إند، خد اللينك بتاعه وحطه مكان اللينك اللي تحت ده
app.use(
  cors({
    origin: [
      "http://localhost:5173", // للتجربة المحلية
      "https://YOUR-FRONTEND-SITE.netlify.app", // 👈 حط لينك موقعك هنا
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// Error handling middleware for JSON parsing
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    console.error("JSON parsing error:", error.message);
    return res.status(400).json({ message: "Invalid JSON format" });
  }
  next();
});

// MongoDB Connection
// التعديل: التأكد من الاتصال داخل الدالة عشان الـ Serverless
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
};

// لازم ننادي الاتصال في بداية الطلب
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Import Models
const User = require("./models/User");
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
      { expiresIn: "7d" },
    );
    res.json({ token, username: user.username });
  } catch (err) {
    console.error("Signup error:", err);
    if (err.name === "ValidationError") {
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
      { expiresIn: "7d" },
    );
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Import Routes
const waterRoutes = require("./routes/waterRoutes");
app.use("/api/water", waterRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Water Tracker API is running on Netlify!" });
});

app.get("/api", (req, res) => {
  res.json({ message: "Water Tracker API is running on Netlify!" });
});

// ---------------------------------------------------------
// التغيير الجذري عشان Netlify
// ---------------------------------------------------------

// لو احنا شغالين Local (على جهازك) استخدم app.listen
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on port ${PORT}`);
  });
}

// لو احنا على Netlify صدر الـ handler
module.exports.handler = serverless(app);
