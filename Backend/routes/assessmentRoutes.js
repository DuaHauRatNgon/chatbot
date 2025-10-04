const express = require('express');
const router = express.Router();
const assessmentService = require('../services/assessmentService');

// POST /assessments/start - Bắt đầu assessment
router.post('/start', async (req, res) => {
  try {
    const { scaleType, userId, conversationId } = req.body;
    
    if (!scaleType || !userId || !conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: scaleType, userId, conversationId'
      });
    }

    const result = await assessmentService.startAssessment(scaleType, userId, conversationId);
    
    res.json({
      success: true,
      data: result,
      message: 'Bắt đầu assessment thành công'
    });
  } catch (error) {
    console.error('Lỗi khi bắt đầu assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi bắt đầu assessment: ' + error.message
    });
  }
});

// POST /assessments/:assessmentId/answer - Gửi câu trả lời
router.post('/:assessmentId/answer', async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { answer, aiContext } = req.body;
    
    if (answer === undefined || answer < 0) {
      return res.status(400).json({
        success: false,
        message: 'Câu trả lời không hợp lệ'
      });
    }

    const result = await assessmentService.submitAnswer(assessmentId, answer, aiContext || {});
    
    res.json({
      success: true,
      data: result,
      message: result.completed ? 'Assessment hoàn thành' : 'Câu trả lời đã được ghi nhận'
    });
  } catch (error) {
    console.error('Lỗi khi gửi câu trả lời:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi câu trả lời: ' + error.message
    });
  }
});

// GET /assessments/:assessmentId - Lấy thông tin assessment
router.get('/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    const assessment = await assessmentService.getAssessment(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment không tồn tại'
      });
    }

    res.json({
      success: true,
      data: assessment,
      message: 'Lấy thông tin assessment thành công'
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin assessment: ' + error.message
    });
  }
});

// GET /assessments/user/:userId - Lấy tất cả assessment của user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const assessments = await assessmentService.getUserAssessments(userId);
    
    res.json({
      success: true,
      data: assessments,
      message: 'Lấy danh sách assessment thành công'
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách assessment: ' + error.message
    });
  }
});

module.exports = router;
