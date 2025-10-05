const emailService = require('../services/emailService');
const userRepository = require('../repository/userRepository');

class EmailController {
    
    // Gửi email chào mừng cho user mới đăng ký
    async sendWelcomeEmail(req, res) {
        try {
            const { userId } = req.params;
            
            // Lấy thông tin user từ database
            const user = await userRepository.getUserById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            const result = await emailService.sendWelcomeEmail(user.email, user.name);
            
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: 'Email chào mừng đã được gửi thành công',
                    messageId: result.messageId
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi khi gửi email',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error in sendWelcomeEmail controller:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }

    // Gửi email thông báo đăng nhập
    async sendLoginNotification(req, res) {
        try {
            const { userId } = req.params;
            const loginTime = new Date().toLocaleString('vi-VN');
            
            // Lấy thông tin user từ database
            const user = await userRepository.getUserById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            const result = await emailService.sendLoginNotificationEmail(user.email, user.name, loginTime);
            
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: 'Email thông báo đăng nhập đã được gửi thành công',
                    messageId: result.messageId
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi khi gửi email',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error in sendLoginNotification controller:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }

    // Gửi email tùy chỉnh
    async sendCustomEmail(req, res) {
        try {
            const { userId, subject, content } = req.body;
            
            if (!userId || !subject || !content) {
                return res.status(400).json({
                    success: false,
                    message: 'userId, subject và content là bắt buộc'
                });
            }

            // Lấy thông tin user từ database
            const user = await userRepository.getUserById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            const result = await emailService.sendCustomEmail(user.email, subject, content, user.name);
            
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: 'Email tùy chỉnh đã được gửi thành công',
                    messageId: result.messageId
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi khi gửi email',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error in sendCustomEmail controller:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }

    // Gửi email cho nhiều user cùng lúc
    async sendBulkEmail(req, res) {
        try {
            const { userIds, subject, content } = req.body;
            
            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'userIds phải là một mảng không rỗng'
                });
            }

            if (!subject || !content) {
                return res.status(400).json({
                    success: false,
                    message: 'subject và content là bắt buộc'
                });
            }

            const results = [];
            const errors = [];

            // Gửi email cho từng user
            for (const userId of userIds) {
                try {
                    const user = await userRepository.getUserById(userId);
                    if (user) {
                        const result = await emailService.sendCustomEmail(user.email, subject, content, user.name);
                        results.push({
                            userId: userId,
                            email: user.email,
                            success: result.success,
                            messageId: result.messageId,
                            error: result.error
                        });
                    } else {
                        errors.push({
                            userId: userId,
                            error: 'Không tìm thấy user'
                        });
                    }
                } catch (error) {
                    errors.push({
                        userId: userId,
                        error: error.message
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: `Đã xử lý ${userIds.length} email`,
                results: results,
                errors: errors,
                successCount: results.filter(r => r.success).length,
                errorCount: errors.length + results.filter(r => !r.success).length
            });
        } catch (error) {
            console.error('Error in sendBulkEmail controller:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }

    // Kiểm tra trạng thái email service
    async checkEmailService(req, res) {
        try {
            const result = await emailService.verifyConnection();
            
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: 'Email service đang hoạt động bình thường'
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'Email service không hoạt động',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error in checkEmailService controller:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }
}

module.exports = new EmailController();
