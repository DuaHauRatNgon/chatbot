const dailyQuotesService = require('../services/dailyQuotesService');
const { Quote, UserEmailSettings, EmailHistory } = require('../model/quote');

class QuotesController {
    
    // Lấy tất cả quotes
    async getAllQuotes(req, res) {
        try {
            const { page = 1, limit = 10, category, language } = req.query;
            const skip = (page - 1) * limit;
            
            let query = { isActive: true };
            if (category) query.category = category;
            if (language) query.language = language;
            
            const quotes = await Quote.find(query)
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(parseInt(limit));
                
            const total = await Quote.countDocuments(query);
            
            return res.status(200).json({
                success: true,
                data: quotes,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting quotes:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }
    
    // Tạo quote mới
    async createQuote(req, res) {
        try {
            const { content, author, category, language } = req.body;
            
            if (!content || !author) {
                return res.status(400).json({
                    success: false,
                    message: 'Nội dung và tác giả là bắt buộc'
                });
            }
            
            const quote = new Quote({
                content,
                author,
                category: category || 'motivation',
                language: language || 'vi'
            });
            
            const savedQuote = await quote.save();
            
            return res.status(201).json({
                success: true,
                message: 'Quote đã được tạo thành công',
                data: savedQuote
            });
        } catch (error) {
            console.error('Error creating quote:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }
    
    // Cập nhật quote
    async updateQuote(req, res) {
        try {
            const { id } = req.params;
            const { content, author, category, language, isActive } = req.body;
            
            const quote = await Quote.findByIdAndUpdate(
                id,
                { 
                    content, 
                    author, 
                    category, 
                    language, 
                    isActive,
                    updated_at: new Date()
                },
                { new: true }
            );
            
            if (!quote) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy quote'
                });
            }
            
            return res.status(200).json({
                success: true,
                message: 'Quote đã được cập nhật thành công',
                data: quote
            });
        } catch (error) {
            console.error('Error updating quote:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }
    
    // Xóa quote
    async deleteQuote(req, res) {
        try {
            const { id } = req.params;
            
            const quote = await Quote.findByIdAndDelete(id);
            
            if (!quote) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy quote'
                });
            }
            
            return res.status(200).json({
                success: true,
                message: 'Quote đã được xóa thành công'
            });
        } catch (error) {
            console.error('Error deleting quote:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }
    
    // Gửi quote hàng ngày cho tất cả user
    async sendDailyQuotes(req, res) {
        try {
            const result = await dailyQuotesService.sendDailyQuotesToAllUsers();
            
            return res.status(200).json({
                success: true,
                message: 'Đã gửi quotes hàng ngày',
                data: result
            });
        } catch (error) {
            console.error('Error sending daily quotes:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }
    
    // Cập nhật cài đặt email của user
    async updateUserEmailSettings(req, res) {
        try {
            const { userId } = req.params;
            const settings = req.body;
            
            const result = await dailyQuotesService.updateUserEmailSettings(userId, settings);
            
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: 'Cài đặt email đã được cập nhật',
                    data: result.settings
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }
        } catch (error) {
            console.error('Error updating user email settings:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }
    
    // Lấy cài đặt email của user
    async getUserEmailSettings(req, res) {
        try {
            const { userId } = req.params;
            
            const settings = await UserEmailSettings.findOne({ userId });
            
            if (!settings) {
                return res.status(404).json({
                    success: false,
                    message: 'Chưa có cài đặt email'
                });
            }
            
            return res.status(200).json({
                success: true,
                data: settings
            });
        } catch (error) {
            console.error('Error getting user email settings:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }
    
    // Lấy lịch sử email của user
    async getUserEmailHistory(req, res) {
        try {
            const { userId } = req.params;
            const { limit = 10 } = req.query;
            
            const result = await dailyQuotesService.getUserEmailHistory(userId, parseInt(limit));
            
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.history
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }
        } catch (error) {
            console.error('Error getting user email history:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }
    
    // Lấy thống kê quotes
    async getQuotesStats(req, res) {
        try {
            const totalQuotes = await Quote.countDocuments();
            const activeQuotes = await Quote.countDocuments({ isActive: true });
            const quotesByCategory = await Quote.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ]);
            const quotesByLanguage = await Quote.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$language', count: { $sum: 1 } } }
            ]);
            
            return res.status(200).json({
                success: true,
                data: {
                    totalQuotes,
                    activeQuotes,
                    quotesByCategory,
                    quotesByLanguage
                }
            });
        } catch (error) {
            console.error('Error getting quotes stats:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server nội bộ'
            });
        }
    }
}

module.exports = new QuotesController();
