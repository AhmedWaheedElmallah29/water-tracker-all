const mongoose = require("mongoose");
const WaterEntry = require("./models/WaterEntry");

async function migrate() {
  // TODO: Replace with your actual MongoDB connection string
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/watertracker";
  await mongoose.connect(MONGODB_URI);

  const entries = await WaterEntry.find({});
  let updated = 0;

  for (const doc of entries) {
    let changed = false;
    for (const entry of doc.entries) {
      if (!entry._id) {
        entry._id = new mongoose.Types.ObjectId();
        changed = true;
      }
    }
    if (changed) {
      await doc.save();
      updated++;
    }
  }

  console.log(`Updated ${updated} documents.`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
