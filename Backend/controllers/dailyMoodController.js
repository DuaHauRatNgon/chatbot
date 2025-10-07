const dailyMoodService = require("../services/dailyMoodService");

class DailyMoodController {
  // POST /api/daily-moods - Save today's mood
  async saveDailyMood(req, res) {
    try {
      const { emotion } = req.body;
      const userId = req.user.id; // From auth middleware

      const result = await dailyMoodService.saveDailyMood(userId, emotion);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Controller error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  }

  // GET /api/daily-moods/history?days=7 - Get mood history
  async getMoodHistory(req, res) {
    try {
      const userId = req.user.id; // From auth middleware
      const days = parseInt(req.query.days) || 7;

      const result = await dailyMoodService.getMoodHistory(userId, days);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Controller error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  }

  // GET /api/daily-moods/today - Get today's mood
  async getTodayMood(req, res) {
    try {
      const userId = req.user.id; // From auth middleware

      const result = await dailyMoodService.getTodayMood(userId);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Controller error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  }
}

module.exports = new DailyMoodController();
