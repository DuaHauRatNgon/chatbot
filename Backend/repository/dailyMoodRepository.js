const DailyMood = require("../model/dailyMood");

class DailyMoodRepository {
  // Save or update daily mood for a user
  async saveDailyMood(userId, date, emotion) {
    try {
      const result = await DailyMood.findOneAndUpdate(
        { user_id: userId, date },
        { emotion, created_at: new Date() },
        { upsert: true, new: true }
      );
      return { success: true, data: result };
    } catch (error) {
      console.error("Repository error:", error);
      return { success: false, message: error.message };
    }
  }

  // Get daily moods for a user within a date range
  async getDailyMoods(userId, fromDate, toDate) {
    try {
      const query = { user_id: userId };
      if (fromDate || toDate) {
        query.date = {};
        if (fromDate) query.date.$gte = fromDate;
        if (toDate) query.date.$lte = toDate;
      }
      
      const moods = await DailyMood.find(query).sort({ date: 1 });
      return { success: true, data: moods };
    } catch (error) {
      console.error("Repository error:", error);
      return { success: false, message: error.message };
    }
  }

  // Get today's mood for a user
  async getTodayMood(userId, date) {
    try {
      const mood = await DailyMood.findOne({ user_id: userId, date });
      return { success: true, data: mood };
    } catch (error) {
      console.error("Repository error:", error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new DailyMoodRepository();
