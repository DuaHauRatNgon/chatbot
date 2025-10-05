const express = require("express");
const router = express.Router();
const emailController = require('../controllers/emailController');
const { authenticateToken } = require('../middleware/auth'); // Middleware xác thực

// Route gửi email chào mừng cho user mới đăng ký
router.post('/welcome/:userId', authenticateToken, emailController.sendWelcomeEmail);

// Route gửi email thông báo đăng nhập
router.post('/login-notification/:userId', authenticateToken, emailController.sendLoginNotification);

// Route gửi email tùy chỉnh cho một user
router.post('/custom', authenticateToken, emailController.sendCustomEmail);

// Route gửi email hàng loạt cho nhiều user
router.post('/bulk', authenticateToken, emailController.sendBulkEmail);

// Route kiểm tra trạng thái email service
router.get('/status', authenticateToken, emailController.checkEmailService);

module.exports = router;
