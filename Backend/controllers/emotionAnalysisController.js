const EmotionAnalysisService = require("../services/emotionAnalysisService");

class EmotionAnalysisController {
  // GET /api/emotion-analysis/:userId - Lấy dữ liệu emotion analysis cho user
  async getEmotionAnalysis(req, res) {
    try {
      const { userId } = req.params;
      
      console.log('Getting emotion analysis for user:', userId);
      const result = await EmotionAnalysisService.getEmotionAnalysis(userId);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Lấy dữ liệu emotion analysis thành công",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
          data: null,
        });
      }
    } catch (error) {
      console.error("Lỗi trong getEmotionAnalysis controller:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server nội bộ",
        data: null,
      });
    }
  }
}

module.exports = new EmotionAnalysisController();
