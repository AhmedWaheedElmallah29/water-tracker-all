const mongoose = require("mongoose");

const waterEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: String, // غيرناها لـ String عشان تناسب Clerk
      required: true,
    },
    goal: { type: Number, default: 3 },
    amount: { type: Number, default: 0 },
    date: { type: Date, required: true },
    entries: [
      {
        amount: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("WaterEntry", waterEntrySchema);
