const { Quote, UserEmailSettings, EmailHistory } = require('../model/quote');
const emailService = require('./emailService');

class DailyQuotesService {
    
    // Lấy quote ngẫu nhiên theo category và ngôn ngữ
    async getRandomQuote(category = null, language = 'vi') {
        try {
            let query = { isActive: true, language: language };
            if (category) {
                query.category = category;
            }
            
            const quotes = await Quote.find(query);
            if (quotes.length === 0) {
                return null;
            }
            
            const randomIndex = Math.floor(Math.random() * quotes.length);
            return quotes[randomIndex];
        } catch (error) {
            console.error('Error getting random quote:', error);
            return null;
        }
    }
    
    // Gửi quote hàng ngày cho một user
    async sendDailyQuoteToUser(userId, userEmail, userName) {
        try {
            // Lấy cài đặt email của user
            let emailSettings = await UserEmailSettings.findOne({ userId });
            
            // Nếu chưa có cài đặt, tạo mặc định
            if (!emailSettings) {
                emailSettings = new UserEmailSettings({
                    userId,
                    email: userEmail,
                    isDailyQuotesEnabled: true,
                    preferredTime: "08:00",
                    preferredLanguage: "vi",
                    preferredCategories: ["motivation", "success", "life"]
                });
                await emailSettings.save();
            }
            
            // Kiểm tra xem user có muốn nhận quotes không
            if (!emailSettings.isDailyQuotesEnabled) {
                return { success: false, message: 'User has disabled daily quotes' };
            }
            
            // Kiểm tra xem đã gửi quote hôm nay chưa
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (emailSettings.lastSentDate && 
                new Date(emailSettings.lastSentDate).setHours(0, 0, 0, 0) >= today.getTime()) {
                return { success: false, message: 'Daily quote already sent today' };
            }
            
            // Lấy quote ngẫu nhiên
            const randomCategory = emailSettings.preferredCategories.length > 0 
                ? emailSettings.preferredCategories[Math.floor(Math.random() * emailSettings.preferredCategories.length)]
                : null;
                
            const quote = await this.getRandomQuote(randomCategory, emailSettings.preferredLanguage);
            
            if (!quote) {
                return { success: false, message: 'No quotes available' };
            }
            
            // Gửi email
            const emailResult = await emailService.sendDailyQuoteEmail(
                userEmail, 
                userName, 
                quote.content, 
                quote.author,
                quote.category
            );
            
            if (emailResult.success) {
                // Cập nhật lastSentDate
                emailSettings.lastSentDate = new Date();
                await emailSettings.save();
                
                // Lưu lịch sử email
                const emailHistory = new EmailHistory({
                    userId,
                    email: userEmail,
                    quoteId: quote._id,
                    emailType: 'daily_quote',
                    status: 'sent',
                    messageId: emailResult.messageId
                });
                await emailHistory.save();
                
                return { 
                    success: true, 
                    message: 'Daily quote sent successfully',
                    quote: quote,
                    messageId: emailResult.messageId
                };
            } else {
                // Lưu lịch sử email thất bại
                const emailHistory = new EmailHistory({
                    userId,
                    email: userEmail,
                    quoteId: quote._id,
                    emailType: 'daily_quote',
                    status: 'failed'
                });
                await emailHistory.save();
                
                return { success: false, message: 'Failed to send email', error: emailResult.error };
            }
            
        } catch (error) {
            console.error('Error sending daily quote to user:', error);
            return { success: false, message: 'Internal server error', error: error.message };
        }
    }
    
    // Gửi quotes hàng ngày cho tất cả user
    async sendDailyQuotesToAllUsers() {
        try {
            console.log('Starting daily quotes sending process...');
            
            // Lấy tất cả user có cài đặt nhận quotes
            const usersWithSettings = await UserEmailSettings.find({ 
                isDailyQuotesEnabled: true 
            }).populate('userId');
            
            const results = {
                total: usersWithSettings.length,
                success: 0,
                failed: 0,
                skipped: 0,
                details: []
            };
            
            for (const settings of usersWithSettings) {
                try {
                    const user = settings.userId;
                    if (!user) {
                        results.failed++;
                        results.details.push({
                            email: settings.email,
                            status: 'failed',
                            message: 'User not found'
                        });
                        continue;
                    }
                    
                    const result = await this.sendDailyQuoteToUser(
                        user._id, 
                        settings.email, 
                        user.name
                    );
                    
                    if (result.success) {
                        results.success++;
                        results.details.push({
                            email: settings.email,
                            status: 'success',
                            message: 'Quote sent successfully'
                        });
                    } else if (result.message === 'Daily quote already sent today') {
                        results.skipped++;
                        results.details.push({
                            email: settings.email,
                            status: 'skipped',
                            message: 'Already sent today'
                        });
                    } else {
                        results.failed++;
                        results.details.push({
                            email: settings.email,
                            status: 'failed',
                            message: result.message
                        });
                    }
                    
                } catch (error) {
                    results.failed++;
                    results.details.push({
                        email: settings.email,
                        status: 'failed',
                        message: error.message
                    });
                }
            }
            
            console.log('Daily quotes sending completed:', results);
            return results;
            
        } catch (error) {
            console.error('Error in sendDailyQuotesToAllUsers:', error);
            return { success: false, message: 'Internal server error', error: error.message };
        }
    }
    
    // Cập nhật cài đặt email của user
    async updateUserEmailSettings(userId, settings) {
        try {
            const emailSettings = await UserEmailSettings.findOneAndUpdate(
                { userId },
                { 
                    ...settings, 
                    updatedAt: new Date() 
                },
                { upsert: true, new: true }
            );
            
            return { success: true, settings: emailSettings };
        } catch (error) {
            console.error('Error updating user email settings:', error);
            return { success: false, message: 'Failed to update settings', error: error.message };
        }
    }
    
    // Lấy lịch sử email của user
    async getUserEmailHistory(userId, limit = 10) {
        try {
            const history = await EmailHistory.find({ userId })
                .populate('quoteId')
                .sort({ sentAt: -1 })
                .limit(limit);
                
            return { success: true, history };
        } catch (error) {
            console.error('Error getting user email history:', error);
            return { success: false, message: 'Failed to get history', error: error.message };
        }
    }
}

module.exports = new DailyQuotesService();