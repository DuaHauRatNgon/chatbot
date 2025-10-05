const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Cấu hình transporter - sử dụng Gmail SMTP
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASSWORD || 'your-app-password'
            }
        });
    }

    // Gửi email chào mừng khi đăng ký
    async sendWelcomeEmail(userEmail, userName) {
        try {
            const mailOptions = {
                from: {
                    name: 'ChatBot Team',
                    address: process.env.EMAIL_USER || 'your-email@gmail.com'
                },
                to: userEmail,
                subject: 'Chào mừng bạn đến với ChatBot! ',
                html: this.getWelcomeEmailTemplate(userName),
                text: `Chào mừng ${userName}! Cảm ơn bạn đã đăng ký tài khoản ChatBot.`,
                headers: {
                    'X-Priority': '3',
                    'X-MSMail-Priority': 'Normal',
                    'Importance': 'Normal'
                }
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Welcome email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending welcome email:', error);
            return { success: false, error: error.message };
        }
    }

    // Gửi email thông báo đăng nhập
    async sendLoginNotificationEmail(userEmail, userName, loginTime) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: userEmail,
                subject: 'Thông báo đăng nhập vào ChatBot',
                html: this.getLoginNotificationTemplate(userName, loginTime)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Login notification email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending login notification email:', error);
            return { success: false, error: error.message };
        }
    }

    // Gửi email tùy chỉnh
    async sendCustomEmail(userEmail, subject, content, userName = '') {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: userEmail,
                subject: subject,
                html: this.getCustomEmailTemplate(userName, content)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Custom email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending custom email:', error);
            return { success: false, error: error.message };
        }
    }

    // Gửi email quote hàng ngày
    async sendDailyQuoteEmail(userEmail, userName, quoteContent, quoteAuthor, category) {
        try {
            const mailOptions = {
                from: {
                    name: 'ChatBot Daily Quotes',
                    address: process.env.EMAIL_USER || 'your-email@gmail.com'
                },
                to: userEmail,
                subject: `Quote of the Day - ${this.getCategoryName(category)}`,
                html: this.getDailyQuoteTemplate(userName, quoteContent, quoteAuthor, category),
                text: `Quote of the Day\n\n"${quoteContent}"\n- ${quoteAuthor}\n\nHave a great day!\nChatBot Team`
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Daily quote email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending daily quote email:', error);
            return { success: false, error: error.message };
        }
    }

    // Template email chào mừng
    getWelcomeEmailTemplate(userName) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Chào mừng đến với ChatBot</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    background-color: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 32px;
                    font-weight: bold;
                    color: #4CAF50;
                    margin-bottom: 10px;
                }
                .welcome-text {
                    font-size: 24px;
                    color: #2c3e50;
                    margin-bottom: 20px;
                }
                .content {
                    font-size: 16px;
                    margin-bottom: 20px;
                }
                .features {
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .feature-item {
                    margin: 10px 0;
                    padding-left: 20px;
                    position: relative;
                }
                .feature-item::before {
                    content: "✓";
                    position: absolute;
                    left: 0;
                    color: #4CAF50;
                    font-weight: bold;
                }
                .cta-button {
                    display: inline-block;
                    background-color: #4CAF50;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="welcome-text">Chào mừng ${userName}!</div>
                </div>
                
                <div class="content">
                    <p>Cảm ơn bạn đã đăng ký tài khoản tại ChatBot! Chúng tôi rất vui được chào đón bạn.</p>
                    
                    <div class="features">
                        <h3>Với tài khoản ChatBot, bạn có thể:</h3>
                        <div class="feature-item">Trò chuyện với AI thông minh</div>
                        <div class="feature-item">Tải lên và phân tích tài liệu</div>
                        <div class="feature-item">Nghe nhạc và podcast</div>
                        <div class="feature-item">Tham gia các bài đánh giá và khảo sát</div>
                        <div class="feature-item">Lưu trữ lịch sử cuộc trò chuyện</div>
                    </div>
                    
                    <p>Hãy bắt đầu khám phá những tính năng tuyệt vời của ChatBot ngay hôm nay!</p>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="cta-button">
                            Bắt đầu sử dụng ChatBot
                        </a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.</p>
                    <p>© 2025 Nguyen Thi Ngoc Huyen 's Product</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Template email thông báo đăng nhập
    getLoginNotificationTemplate(userName, loginTime) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thông báo đăng nhập</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    background-color: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 32px;
                    font-weight: bold;
                    color: #2196F3;
                    margin-bottom: 10px;
                }
                .alert-icon {
                    font-size: 48px;
                    margin-bottom: 10px;
                }
                .content {
                    font-size: 16px;
                    margin-bottom: 20px;
                }
                .login-info {
                    background-color: #e3f2fd;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #2196F3;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="alert-icon">🔐</div>
                    <div class="logo">ChatBot</div>
                </div>
                
                <div class="content">
                    <h2>Thông báo đăng nhập</h2>
                    <p>Xin chào ${userName},</p>
                    
                    <div class="login-info">
                        <h3>Thông tin đăng nhập:</h3>
                        <p><strong>Thời gian:</strong> ${loginTime}</p>
                        <p><strong>Tài khoản:</strong> ${userName}</p>
                    </div>
                    
                    <p>Nếu đây không phải là bạn, vui lòng:</p>
                    <ul>
                        <li>Thay đổi mật khẩu ngay lập tức</li>
                        <li>Liên hệ với chúng tôi để được hỗ trợ</li>
                        <li>Kiểm tra các hoạt động đăng nhập khác</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p>Đây là email tự động từ hệ thống ChatBot.</p>
                    <p>© 2025 Nguyen Thi Ngoc Huyen 's Product</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Template email tùy chỉnh
    getCustomEmailTemplate(userName, content) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thông báo từ ChatBot</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    background-color: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 32px;
                    font-weight: bold;
                    color: #4CAF50;
                    margin-bottom: 10px;
                }
                .content {
                    font-size: 16px;
                    margin-bottom: 20px;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🤖 ChatBot</div>
                </div>
                
                <div class="content">
                    ${userName ? `<p>Xin chào ${userName},</p>` : ''}
                    ${content}
                </div>
                
                <div class="footer">
                    <p>© 2025 Nguyen Thi Ngoc Huyen 's Product</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Template email quote hàng ngày
    getDailyQuoteTemplate(userName, quoteContent, quoteAuthor, category) {
        const categoryName = this.getCategoryName(category);
        const today = new Date().toLocaleDateString('vi-VN');
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Quote of the Day</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .container {
                    background-color: white;
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #667eea;
                    margin-bottom: 10px;
                }
                .date {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 20px;
                }
                .category-badge {
                    display: inline-block;
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    margin-bottom: 30px;
                }
                .quote-content {
                    font-size: 24px;
                    font-style: italic;
                    text-align: center;
                    margin: 30px 0;
                    padding: 30px;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    border-radius: 10px;
                    border-left: 5px solid #667eea;
                    position: relative;
                }
                .quote-content::before {
                    content: '"';
                    font-size: 60px;
                    color: #667eea;
                    position: absolute;
                    top: -10px;
                    left: 20px;
                    opacity: 0.3;
                }
                .quote-content::after {
                    content: '"';
                    font-size: 60px;
                    color: #667eea;
                    position: absolute;
                    bottom: -20px;
                    right: 20px;
                    opacity: 0.3;
                }
                .quote-author {
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                    color: #667eea;
                    margin: 20px 0;
                }
                .greeting {
                    text-align: center;
                    font-size: 16px;
                    margin: 30px 0;
                    color: #555;
                }
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 14px;
                }
                .unsubscribe {
                    margin-top: 20px;
                    font-size: 12px;
                }
                .unsubscribe a {
                    color: #667eea;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">💭 Daily Quotes</div>
                    <div class="date">${today}</div>
                    <div class="category-badge">${categoryName}</div>
                </div>
                
                <div class="quote-content">
                    ${quoteContent}
                </div>
                
                <div class="quote-author">
                    — ${quoteAuthor}
                </div>
                
                <div class="greeting">
                    <p>Chúc ${userName} một ngày tuyệt vời và đầy cảm hứng! 🌟</p>
                </div>
                
                <div class="footer">
                    <p>Được gửi từ ChatBot Daily Quotes</p>
                    <div class="unsubscribe">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe">Tắt nhận email hàng ngày</a>
                    </div>
                    <p>© 2025 Nguyen Thi Ngoc Huyen 's Product</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Kiểm tra kết nối email
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service connection verified successfully');
            return { success: true, message: 'Email service is ready' };
        } catch (error) {
            console.error('Email service connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Helper method để lấy tên category
    getCategoryName(category) {
        const categoryNames = {
            'motivation': 'Động lực',
            'success': 'Thành công',
            'life': 'Cuộc sống',
            'love': 'Tình yêu',
            'wisdom': 'Trí tuệ',
            'inspiration': 'Cảm hứng'
        };
        return categoryNames[category] || 'Động lực';
    }
}

module.exports = new EmailService();
