const express = require("express");
const router = express.Router();
const WaterEntry = require("../models/WaterEntry");
const { body, validationResult } = require("express-validator");

// استيراد الـ Middleware الخاص بالـ Auth
const authMiddleware = require("../middleware/auth");

// تطبيق الـ Middleware على جميع المسارات بالأسفل
router.use(authMiddleware);

// -----------------------------------------------------------
// 1. الحصول على بيانات اليوم (GET Today's Data)
// -----------------------------------------------------------
router.get("/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // تصفير الوقت للمقارنة باليوم فقط

    let waterEntry = await WaterEntry.findOne({
      userId: req.userId,
      date: today,
    });

    if (!waterEntry) {
      // إنشاء سجل جديد لو مش موجود لليوم الحالي
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

// -----------------------------------------------------------
// 2. إضافة مياة (POST Add Intake) - حل مشكلة الـ Duplicate Key
// -----------------------------------------------------------
router.post(
  "/add",
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // استخدام findOneAndUpdate مع upsert لمنع تكرار السجل لليوم الواحد
      const waterEntry = await WaterEntry.findOneAndUpdate(
        { userId: req.userId, date: today },
        {
          $inc: { amount: amount }, // جمع الكمية الجديدة
          $push: { entries: { amount, timestamp: new Date() } }, // إضافة سجل فرعي
          $setOnInsert: { goal: 3 }, // لو سجل جديد، حط الهدف 3
        },
        { upsert: true, new: true, runValidators: true },
      );

      res.json(waterEntry);
    } catch (error) {
      console.error("[ADD WATER] Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);
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

      // تحديث الهدف لليوم الحالي، ولو مش موجود يفتحه ويحط الهدف الجديد
      const waterEntry = await WaterEntry.findOneAndUpdate(
        { userId: req.userId, date: today },
        { $set: { goal: goal } },
        { upsert: true, new: true },
      );

      res.json(waterEntry);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// -----------------------------------------------------------
// 3. مسح سجل فرعي (DELETE Remove Entry) - حل مشكلة الـ Remove القديمة
// -----------------------------------------------------------
router.delete("/remove/:entryId", async (req, res) => {
  try {
    const { entryId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const waterEntry = await WaterEntry.findOne({
      userId: req.userId,
      date: today,
    });

    if (!waterEntry)
      return res.status(404).json({ message: "No entry for today" });

    // إيجاد السجل الفرعي لمعرفة قيمته قبل المسح
    const entry = waterEntry.entries.id(entryId);
    if (!entry) return res.status(404).json({ message: "Sub-entry not found" });

    const amountToSubtract = entry.amount;

    // استخدام pull لمسح العنصر من المصفوفة بأمان
    waterEntry.entries.pull(entryId);

    // طرح القيمة من الإجمالي وضمان عدم النزول عن الصفر
    waterEntry.amount = Math.max(0, waterEntry.amount - amountToSubtract);

    await waterEntry.save();
    res.json(waterEntry);
  } catch (error) {
    console.error("Error in REMOVE route:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// -----------------------------------------------------------
// 4. مسح كمية مخصصة (DELETE Remove Amount) - حل إيرور 404
// -----------------------------------------------------------
router.delete("/remove-amount", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let waterEntry = await WaterEntry.findOne({
      userId: req.userId,
      date: today,
    });

    if (!waterEntry)
      return res.status(404).json({ message: "No water entry found" });

    // توثيق عملية المسح بسجل فرعي سالب
    waterEntry.entries.push({
      amount: -amount,
      timestamp: new Date(),
      note: "Custom removal",
    });

    waterEntry.amount = Math.max(0, waterEntry.amount - amount);

    await waterEntry.save();
    res.json(waterEntry);
  } catch (error) {
    console.error("Error in remove-amount:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------------------------------------
// 5. تصفير اليوم (POST Reset Day)
// -----------------------------------------------------------
router.post("/reset", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const waterEntry = await WaterEntry.findOneAndUpdate(
      { userId: req.userId, date: today },
      { $set: { amount: 0, entries: [] } },
      { new: true },
    );

    res.json({ message: "Water data reset.", reset: true, waterEntry });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------------------------------------
// 6. التاريخ (GET History)
// -----------------------------------------------------------
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
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
