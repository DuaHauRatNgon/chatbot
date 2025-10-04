const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const {authenticateToken, requirePermission} = require("../middleware/auth");


router.post(
  "/title",
  authenticateToken,
  requirePermission({ roles: ["customer"] }),
  chatController.generateTitle
);

// POST /chat/message
router.post(
  "/message",
  authenticateToken,
  requirePermission({ roles: ["customer"] }),
  chatController.chat
);

module.exports = router;
