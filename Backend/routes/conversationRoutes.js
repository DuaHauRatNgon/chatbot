const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversationController");
const { authenticateToken, requirePermission } = require("../middleware/auth");

// Routes
router.post(
  "/",
  authenticateToken,
  requirePermission({ roles: ["customer"] }),
  conversationController.createConversation
);

// GET /api/conversations/user/:userId - Lấy tất cả conversations của user
router.get(
  "/user/:userId",
  authenticateToken,
  requirePermission({ roles: ["customer"] }),
  conversationController.getConversationsByUserId
);

// GET /api/conversations/mood-history - Lịch sử cảm xúc của user đăng nhập
router.get(
  "/mood-history",
  authenticateToken,
  requirePermission({ roles: ["customer"] }),
  conversationController.getMoodHistory
);

module.exports = router;
