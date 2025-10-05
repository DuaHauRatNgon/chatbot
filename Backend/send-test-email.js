// Test script để gửi email đến chính bạn
require('dotenv').config();
const emailService = require('./services/emailService');

async function sendTestEmailToYourself() {
    console.log('📧 Sending test email to yourself...\n');
    
    const yourEmail = process.env.EMAIL_USER; // Sử dụng email từ .env
    const yourName = 'Test User';
    
    console.log(`Sending email to: ${yourEmail}`);
    
    try {
        // Test 1: Welcome email
        console.log('\n1. Sending welcome email...');
        const welcomeResult = await emailService.sendWelcomeEmail(yourEmail, yourName);
        
        if (welcomeResult.success) {
            console.log('✅ Welcome email sent successfully!');
            console.log('Message ID:', welcomeResult.messageId);
        } else {
            console.log('❌ Failed to send welcome email:', welcomeResult.error);
        }
        
        // Test 2: Simple text email
        console.log('\n2. Sending simple test email...');
        const simpleResult = await emailService.sendCustomEmail(
            yourEmail,
            'Test Email - Simple Text',
            '<h2>Test Email</h2><p>This is a simple test email to check if emails are being delivered.</p><p>If you receive this email, the email service is working correctly!</p>',
            yourName
        );
        
        if (simpleResult.success) {
            console.log('✅ Simple test email sent successfully!');
            console.log('Message ID:', simpleResult.messageId);
        } else {
            console.log('❌ Failed to send simple test email:', simpleResult.error);
        }
        
        console.log('\n📋 Instructions:');
        console.log('1. Check your Gmail inbox');
        console.log('2. Check Spam/Junk folder');
        console.log('3. Check Promotions tab');
        console.log('4. Search for emails from:', yourEmail);
        console.log('5. Search for subject: "Chào mừng" or "Test Email"');
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

// Chạy test
sendTestEmailToYourself().catch(console.error);
