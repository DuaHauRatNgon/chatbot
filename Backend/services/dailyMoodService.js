const dailyMoodRepository = require("../repository/dailyMoodRepository");

class DailyMoodService {
  // Save daily mood
  async saveDailyMood(userId, emotion) {
    try {
      if (!userId || !emotion) {
        return {
          success: false,
          message: "User ID và emotion là bắt buộc",
          statusCode: 400,
        };
      }

      if (!["happy", "fear", "sad", "angry"].includes(emotion)) {
        return {
          success: false,
          message: "Emotion phải là một trong: happy, fear, sad, angry",
          statusCode: 400,
        };
      }

      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const result = await dailyMoodRepository.saveDailyMood(userId, date, emotion);

      if (!result.success) {
        return {
          success: false,
          message: "Lỗi khi lưu cảm xúc hàng ngày",
          statusCode: 500,
        };
      }

      return {
        success: true,
        message: "Lưu cảm xúc hàng ngày thành công",
        data: result.data,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Service error:", error);
      return {
        success: false,
        message: "Lỗi server",
        statusCode: 500,
      };
    }
  }

  // Get mood history for last N days
  async getMoodHistory(userId, days = 7) {
    try {
      if (!userId) {
        return {
          success: false,
          message: "User ID là bắt buộc",
          statusCode: 400,
        };
      }

      // Calculate date range
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(toDate.getDate() - (days - 1));

      const to = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}-${String(toDate.getDate()).padStart(2, '0')}`;
      const from = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-${String(fromDate.getDate()).padStart(2, '0')}`;

      const result = await dailyMoodRepository.getDailyMoods(userId, from, to);

      if (!result.success) {
        return {
          success: false,
          message: "Lỗi khi lấy lịch sử cảm xúc",
          statusCode: 500,
        };
      }

      // Create a map of existing moods
      const moodMap = {};
      result.data.forEach(mood => {
        moodMap[mood.date] = mood.emotion;
      });

      // Generate array for all days in range with counts
      const history = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(toDate.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        
        const emotion = moodMap[dateStr] || null;
        
        // Convert to count format for chart
        history.push({
          date: dateStr,
          happy: emotion === 'happy' ? 1 : 0,
          neutral: emotion === 'neutral' ? 1 : 0,
          sad: emotion === 'sad' ? 1 : 0,
          angry: emotion === 'angry' ? 1 : 0,
        });
      }

      return {
        success: true,
        message: "Lấy lịch sử cảm xúc thành công",
        data: history,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Service error:", error);
      return {
        success: false,
        message: "Lỗi server",
        statusCode: 500,
      };
    }
  }

  // Get today's mood
  async getTodayMood(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          message: "User ID là bắt buộc",
          statusCode: 400,
        };
      }

      const today = new Date();
      const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const result = await dailyMoodRepository.getTodayMood(userId, date);

      return {
        success: true,
        message: "Lấy cảm xúc hôm nay thành công",
        data: result.data,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Service error:", error);
      return {
        success: false,
        message: "Lỗi server",
        statusCode: 500,
      };
    }
  }
}

module.exports = new DailyMoodService();
