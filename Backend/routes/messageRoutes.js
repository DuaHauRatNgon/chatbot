const express = require("express");
const MessageController = require("../controllers/messageController");
const { authenticateToken, requirePermission } = require("../middleware/auth");

const router = express.Router();
// POST /api/messages - Tạo tin nhắn mới
router.post(
  "/",
  authenticateToken,
  requirePermission({ roles: ["customer"] }),
  MessageController.createMessage 
);

// GET /api/messages/conversation/:conversationId - Lấy tin nhắn theo conversation_id
router.get(
  "/conversation/:conversationId",
  authenticateToken,
  requirePermission({ roles: ["customer"] }),
  MessageController.getMessagesByConversationId
);

module.exports = router;
