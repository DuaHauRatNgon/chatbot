const express = require("express");
const router = express.Router();
const quotesController = require('../controllers/quotesController');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// Routes cho quotes (chỉ admin mới có thể quản lý)
router.get('/', quotesController.getAllQuotes);
router.post('/', authenticateToken, requirePermission({ roles: ['admin'] }), quotesController.createQuote);
router.put('/:id', authenticateToken, requirePermission({ roles: ['admin'] }), quotesController.updateQuote);
router.delete('/:id', authenticateToken, requirePermission({ roles: ['admin'] }), quotesController.deleteQuote);

// Routes cho gửi quotes hàng ngày (chỉ admin)
router.post('/send-daily', authenticateToken, requirePermission({ roles: ['admin'] }), quotesController.sendDailyQuotes);

// Routes cho cài đặt email của user
router.get('/user/:userId/settings', authenticateToken, quotesController.getUserEmailSettings);
router.put('/user/:userId/settings', authenticateToken, quotesController.updateUserEmailSettings);
router.get('/user/:userId/history', authenticateToken, quotesController.getUserEmailHistory);

// Routes cho thống kê (chỉ admin)
router.get('/stats', authenticateToken, requirePermission({ roles: ['admin'] }), quotesController.getQuotesStats);

module.exports = router;
