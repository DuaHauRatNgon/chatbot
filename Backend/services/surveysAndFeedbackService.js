const surveysAndFeedbackRepository = require("../repository/surveysAndFeedbackRepository");

class SurveysAndFeedbackService {
  async getAllSurveysAndFeedbacks() {
    try {

      const SurveysAndFeedbacks = await surveysAndFeedbackRepository.getAllSurveysAndFeedbacks();
      return SurveysAndFeedbacks;
    } catch (error) {
      throw new Error(error.message || "Lỗi khi lấy danh sách nhạc từ service");
    }
  }
}

module.exports = new SurveysAndFeedbackService();
