const mongoose = require("mongoose");

const dailyMoodSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  emotion: {
    type: String,
    enum: ["happy", "fear", "sad", "angry"],
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure one mood per user per day
dailyMoodSchema.index({ user_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyMood", dailyMoodSchema);
