const express = require("express");
const EmotionAnalysisController = require("../controllers/emotionAnalysisController");
const { authenticateToken, requirePermission } = require("../middleware/auth");

const router = express.Router();

// GET /api/emotion-analysis/:userId - Lấy emotion analysis data cho user
router.get(
  "/:userId",
  authenticateToken,
  requirePermission({ roles: ["customer"] }),
  EmotionAnalysisController.getEmotionAnalysis
);

module.exports = router;
