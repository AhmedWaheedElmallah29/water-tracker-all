const express = require("express");
const router = express.Router();
const WaterEntry = require("../models/WaterEntry");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Import authMiddleware from server.js
const authMiddleware = require("../middleware/auth");

// All routes below require authentication
router.use(authMiddleware);

// Get today's water data
router.get("/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let waterEntry = await WaterEntry.findOne({
      userId: req.userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });
    if (!waterEntry) {
      // Create new entry for today
      waterEntry = new WaterEntry({
        userId: req.userId,
        date: today,
        amount: 0,
        goal: 3,
        entries: [],
      });
      await waterEntry.save();
    }
    res.json(waterEntry);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add water intake
router.post(
  "/add",
  [
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("amount").isFloat({ min: 0 }).withMessage("Amount must be positive"),
  ],
  async (req, res) => {
    try {
      console.log("[ADD WATER] Request body:", req.body);
      console.log("[ADD WATER] userId:", req.userId);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("[ADD WATER] Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount } = req.body;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let waterEntry = await WaterEntry.findOne({
        userId: req.userId,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      if (!waterEntry) {
        waterEntry = new WaterEntry({
          userId: req.userId,
          date: today,
          amount: 0,
          goal: 3,
          entries: [],
        });
      }

      waterEntry.amount += amount;
      waterEntry.entries.push({
        amount: amount,
        timestamp: new Date(),
      });

      await waterEntry.save();
      res.json(waterEntry);
    } catch (error) {
      console.error("[ADD WATER] Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Update daily goal
router.put(
  "/goal",
  [
    body("goal").isNumeric().withMessage("Goal must be a number"),
    body("goal").isFloat({ min: 0 }).withMessage("Goal must be positive"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { goal } = req.body;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let waterEntry = await WaterEntry.findOne({
        userId: req.userId,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      if (!waterEntry) {
        waterEntry = new WaterEntry({
          userId: req.userId,
          date: today,
          amount: 0,
          goal: goal,
          entries: [],
        });
      } else {
        waterEntry.goal = goal;
      }

      await waterEntry.save();
      res.json(waterEntry);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Update water entry for a specific date (e.g., yesterday)
router.put(
  "/update/:date",
  [
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("amount").isFloat({ min: 0 }).withMessage("Amount must be positive"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount } = req.body;
      const dateParam = req.params.date;
      const date = new Date(dateParam);
      // البحث باليوم والشهر والسنة فقط
      let waterEntry = await WaterEntry.findOne({
        userId: req.userId,
        $expr: {
          $and: [
            { $eq: [{ $dayOfMonth: "$date" }, date.getDate()] },
            { $eq: [{ $month: "$date" }, date.getMonth() + 1] },
            { $eq: [{ $year: "$date" }, date.getFullYear()] },
          ],
        },
      });

      if (!waterEntry) {
        return res
          .status(404)
          .json({ message: "Entry not found for this date" });
      }

      waterEntry.amount = amount;
      await waterEntry.save();

      res.json(waterEntry);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Update water entry by _id (أكثر دقة)
router.put(
  "/update-by-id/:id",
  [
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("amount").isFloat({ min: 0 }).withMessage("Amount must be positive"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { amount } = req.body;
      const id = req.params.id;
      const waterEntry = await WaterEntry.findOne({
        _id: id,
        userId: req.userId,
      });
      if (!waterEntry) {
        return res.status(404).json({ message: "Entry not found for this id" });
      }
      waterEntry.amount = amount;
      await waterEntry.save();
      res.json(waterEntry);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Express route to update water entry by _id (على مستوى app)
// ملاحظة: يجب أن تضيف هذا في server.js إذا كنت تريد على مستوى app مباشرة
// لكن هنا سنضيفه في الراوتر بنفس المنطق:
router.put("/update-by-id/:id", async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  try {
    const updated = await WaterEntry.findByIdAndUpdate(
      id,
      { amount },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Entry not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Reset today's water data
router.post("/reset", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let waterEntry = await WaterEntry.findOne({
      userId: req.userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!waterEntry) {
      // If no entry, nothing to reset
      return res.json({ message: "Already reset.", reset: true });
    }

    waterEntry.amount = 0;
    waterEntry.entries = [];
    await waterEntry.save();
    res.json({
      message: "Water data reset for today.",
      reset: true,
      waterEntry,
    });
  } catch (error) {
    console.error("Error resetting water data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get water history (last 7 days, حتى اليوم فقط)
router.get("/history", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const history = await WaterEntry.find({
      userId: req.userId,
      date: { $gte: sevenDaysAgo, $lte: today },
    }).sort({ date: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all water data
router.get("/all", async (req, res) => {
  try {
    const allEntries = await WaterEntry.find({ userId: req.userId }).sort({
      date: -1,
    });
    res.json(allEntries);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
