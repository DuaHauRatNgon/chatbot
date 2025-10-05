// Test với email khác
require('dotenv').config();
const emailService = require('./services/emailService');

async function testWithDifferentEmail() {
    // Thay đổi email này thành email khác của bạn
    const testEmails = [
        'your-other-email@outlook.com',
        'your-other-email@yahoo.com',
        'your-other-email@hotmail.com'
    ];
    
    for (const email of testEmails) {
        console.log(`\n📧 Testing with: ${email}`);
        
        try {
            const result = await emailService.sendWelcomeEmail(email, 'Test User');
            if (result.success) {
                console.log(`✅ Email sent to ${email}`);
                console.log(`Message ID: ${result.messageId}`);
            } else {
                console.log(`❌ Failed to send to ${email}: ${result.error}`);
            }
        } catch (error) {
            console.log(`❌ Error sending to ${email}: ${error.message}`);
        }
    }
}

testWithDifferentEmail().catch(console.error);
