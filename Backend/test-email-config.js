// Test script để kiểm tra email configuration
require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmailConfig() {
    console.log('🔍 Testing Email Configuration...\n');
    
    // Kiểm tra environment variables
    console.log('📧 Email Configuration:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET' : '❌ NOT SET');
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ NOT SET');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('\n❌ Email configuration is incomplete!');
        console.log('Please check your .env file and ensure:');
        console.log('1. EMAIL_USER is set to your Gmail address');
        console.log('2. EMAIL_PASSWORD is set to your Gmail App Password');
        return;
    }
    
    console.log('\n🔗 Testing email connection...');
    
    try {
        const connectionResult = await emailService.verifyConnection();
        if (connectionResult.success) {
            console.log('✅ Email service connection successful!');
            
            // Test gửi email (thay đổi email test)
            console.log('\n📨 Testing welcome email...');
            const testEmail = 'your-test-email@gmail.com'; // Thay đổi email này
            const welcomeResult = await emailService.sendWelcomeEmail(testEmail, 'Test User');
            
            if (welcomeResult.success) {
                console.log('✅ Welcome email sent successfully!');
                console.log('Message ID:', welcomeResult.messageId);
            } else {
                console.log('❌ Failed to send welcome email:', welcomeResult.error);
            }
        } else {
            console.log('❌ Email service connection failed:', connectionResult.error);
        }
    } catch (error) {
        console.log('❌ Error testing email service:', error.message);
    }
}

// Chạy test
testEmailConfig().catch(console.error);
