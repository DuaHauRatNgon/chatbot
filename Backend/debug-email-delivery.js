// Debug script để kiểm tra chi tiết
require('dotenv').config();
const nodemailer = require('nodemailer');

async function debugEmailDelivery() {
    console.log('🔍 Debug Email Delivery...\n');
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        debug: true, // Enable debug mode
        logger: true // Enable logging
    });
    
    const mailOptions = {
        from: {
            name: 'ChatBot Debug',
            address: process.env.EMAIL_USER
        },
        to: process.env.EMAIL_USER, // Gửi cho chính mình
        subject: 'Debug Test Email - ' + new Date().toISOString(),
        html: `
            <h2>Debug Test Email</h2>
            <p>Time: ${new Date().toLocaleString('vi-VN')}</p>
            <p>This is a debug test email to check delivery.</p>
            <p>If you receive this, the email service is working!</p>
        `,
        text: `Debug Test Email - ${new Date().toLocaleString('vi-VN')}`
    };
    
    try {
        console.log('📤 Sending debug email...');
        const result = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', result.messageId);
        console.log('Response:', result.response);
        console.log('Accepted:', result.accepted);
        console.log('Rejected:', result.rejected);
        
        console.log('\n📋 Next steps:');
        console.log('1. Check Gmail inbox');
        console.log('2. Check Spam folder');
        console.log('3. Check Promotions tab');
        console.log('4. Search for: "Debug Test Email"');
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('Error code:', error.code);
        console.log('Error response:', error.response);
    }
}

debugEmailDelivery().catch(console.error);
