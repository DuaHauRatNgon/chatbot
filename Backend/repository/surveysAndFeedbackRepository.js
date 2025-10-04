const SurveysAndFeedback = require("../model/surveysAndFeedback");

class SurveysAndFeedbackRepository {
  async getAllSurveysAndFeedbacks() {
    try {
      const result = await SurveysAndFeedback.find();
      return result;
    } catch (error) {
      throw new Error(error.message || "Lỗi khi hiển thị danh sách nhạc");
    }
  }
}

module.exports = new SurveysAndFeedbackRepository();
