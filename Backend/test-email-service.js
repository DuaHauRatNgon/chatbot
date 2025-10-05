const emailService = require('./services/emailService');

// Test function để kiểm tra email service
async function testEmailService() {
    console.log('Testing Email Service...');
    
    // Test 1: Kiểm tra kết nối
    console.log('\n1. Testing email connection...');
    const connectionResult = await emailService.verifyConnection();
    console.log('Connection result:', connectionResult);
    
    // Test 2: Gửi email chào mừng (thay đổi email test)
    console.log('\n2. Testing welcome email...');
    const welcomeResult = await emailService.sendWelcomeEmail(
        'test@example.com', // Thay đổi email này
        'Test User'
    );
    console.log('Welcome email result:', welcomeResult);
    
    // Test 3: Gửi email thông báo đăng nhập
    console.log('\n3. Testing login notification email...');
    const loginResult = await emailService.sendLoginNotificationEmail(
        'test@example.com', // Thay đổi email này
        'Test User',
        new Date().toLocaleString('vi-VN')
    );
    console.log('Login notification result:', loginResult);
    
    // Test 4: Gửi email tùy chỉnh
    console.log('\n4. Testing custom email...');
    const customResult = await emailService.sendCustomEmail(
        'test@example.com', // Thay đổi email này
        'Test Custom Email',
        '<h2>Đây là email test tùy chỉnh</h2><p>Nội dung email test...</p>',
        'Test User'
    );
    console.log('Custom email result:', customResult);
    
    console.log('\nEmail service test completed!');
}

// Chạy test nếu file được gọi trực tiếp
if (require.main === module) {
    testEmailService().catch(console.error);
}

module.exports = { testEmailService };
