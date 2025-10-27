// Quick test script to check emotion data in database
require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./model/message');
const Conversation = require('./model/conversation');
const User = require('./model/user');

const db = require('./config/db');

async function testEmotionData() {
  try {
    // Connect to database
    await db();
    
    console.log('\n=== TESTING EMOTION DATA ===\n');
    
    // 1. Check total users
    const totalUsers = await User.countDocuments();
    console.log('1. Total users:', totalUsers);
    
    // 2. Check total conversations
    const totalConversations = await Conversation.countDocuments();
    console.log('2. Total conversations:', totalConversations);
    
    // 3. Check total messages
    const totalMessages = await Message.countDocuments();
    console.log('3. Total messages:', totalMessages);
    
    // 4. Check user messages with emotions
    const userMessages = await Message.countDocuments({ sender: 'user' });
    console.log('4. Total USER messages:', userMessages);
    
    // 5. Sample user messages with emotions
    const sampleMessages = await Message.find({ sender: 'user' })
      .limit(10)
      .select('emotion content timestamp');
    
    console.log('\n5. Sample user messages:');
    sampleMessages.forEach((msg, idx) => {
      console.log(`   ${idx + 1}. Emotion: ${msg.emotion} | Content: "${msg.content.substring(0, 50)}..."`);
    });
    
    // 6. Emotion distribution
    const emotionStats = await Message.aggregate([
      { $match: { sender: 'user' } },
      { $group: { _id: '$emotion', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n6. Emotion distribution:');
    emotionStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} messages`);
    });
    
    // 7. Find users with conversations
    console.log('\n7. Finding users with conversations:');
    const allUsers = await User.find();
    
    for (const user of allUsers) {
      const userConvs = await Conversation.find({ user_id: user._id });
      if (userConvs.length > 0) {
        console.log(`\n   User: ${user.email || user.name}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Conversations: ${userConvs.length}`);
        
        const conversationIds = userConvs.map(c => c._id);
        const userMsgs = await Message.find({
          conversation_id: { $in: conversationIds },
          sender: 'user'
        });
        console.log(`   User messages: ${userMsgs.length}`);
        
        if (userMsgs.length > 0) {
          console.log('   Latest 3 messages:');
          userMsgs.slice(0, 3).forEach((msg, idx) => {
            console.log(`     ${idx + 1}. ${msg.emotion}: "${msg.content.substring(0, 50)}..."`);
          });
        }
        
        // Chỉ show 2 users đầu tiên có data
        if (allUsers.indexOf(user) >= 1) break;
      }
    }
    
    console.log('\n=== TEST COMPLETE ===\n');
    process.exit(0);
    
  } catch (error) {
    console.error('Error testing emotion data:', error);
    process.exit(1);
  }
}

testEmotionData();
