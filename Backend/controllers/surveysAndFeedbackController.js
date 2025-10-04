const surveysAndFeedbackService = require("../services/surveysAndFeedbackService");

class SurveysAndFeedbackController {
  async getAllSurveysAndFeedbacks(req, res) {
    try {
      const surveysAndFeedbacks = await surveysAndFeedbackService.getAllSurveysAndFeedbacks();
      return res.status(200).json({
        success: true,
        surveysAndFeedbacks,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi server khi lấy danh sách nhạc",
      });
    }
  }
}

module.exports = new SurveysAndFeedbackController();
