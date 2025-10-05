// Test script cho tính năng Daily Quotes
require('dotenv').config();
const mongoose = require('mongoose');
const dailyQuotesService = require('./services/dailyQuotesService');
const schedulerService = require('./services/schedulerService');
const { Quote, UserEmailSettings } = require('./model/quote');

async function testDailyQuotesFeature() {
    try {
        console.log('🧪 Testing Daily Quotes Feature...\n');
        
        // Kết nối database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatbot');
        console.log('📦 Connected to MongoDB\n');
        
        // Test 1: Kiểm tra quotes trong database
        console.log('1️⃣ Testing quotes in database...');
        const quotesCount = await Quote.countDocuments();
        console.log(`📊 Total quotes: ${quotesCount}`);
        
        if (quotesCount === 0) {
            console.log('⚠️ No quotes found. Please run: node seed-quotes.js');
            return;
        }
        
        // Test 2: Lấy quote ngẫu nhiên
        console.log('\n2️⃣ Testing random quote selection...');
        const randomQuote = await dailyQuotesService.getRandomQuote('motivation', 'vi');
        if (randomQuote) {
            console.log(`✅ Random quote: "${randomQuote.content}" - ${randomQuote.author}`);
        } else {
            console.log('❌ No random quote found');
        }
        
        // Test 3: Kiểm tra user email settings
        console.log('\n3️⃣ Testing user email settings...');
        const settingsCount = await UserEmailSettings.countDocuments();
        console.log(`📧 User email settings: ${settingsCount}`);
        
        // Test 4: Test gửi quote cho một user cụ thể
        console.log('\n4️⃣ Testing send quote to specific user...');
        const testEmail = process.env.EMAIL_USER; // Sử dụng email từ .env
        const testUserId = '507f1f77bcf86cd799439011'; // Fake ObjectId for testing
        
        if (testEmail) {
            const result = await dailyQuotesService.sendDailyQuoteToUser(
                testUserId, 
                testEmail, 
                'Test User'
            );
            
            if (result.success) {
                console.log('✅ Quote sent successfully to:', testEmail);
                console.log('📧 Message ID:', result.messageId);
            } else {
                console.log('❌ Failed to send quote:', result.message);
            }
        } else {
            console.log('⚠️ EMAIL_USER not set in .env, skipping email test');
        }
        
        // Test 5: Test scheduler status
        console.log('\n5️⃣ Testing scheduler status...');
        const schedulerStatus = schedulerService.getStatus();
        console.log('🕐 Scheduler running:', schedulerStatus.isRunning);
        console.log('📋 Active jobs:', schedulerStatus.jobs);
        
        // Test 6: Test run job immediately
        console.log('\n6️⃣ Testing immediate job execution...');
        try {
            const jobResult = await schedulerService.runJobNow('dailyQuotes');
            console.log('✅ Job executed successfully');
            console.log('📊 Results:', jobResult);
        } catch (error) {
            console.log('❌ Job execution failed:', error.message);
        }
        
        console.log('\n🎉 Daily Quotes feature testing completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('📦 Disconnected from MongoDB');
    }
}

// Chạy test nếu file được gọi trực tiếp
if (require.main === module) {
    testDailyQuotesFeature().catch(console.error);
}

module.exports = { testDailyQuotesFeature };
