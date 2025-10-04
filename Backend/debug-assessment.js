// Script debug để kiểm tra assessment trigger
require('dotenv').config();

const chatWithGPTService = require('./services/chatWithGPTService');

async function debugAssessment() {
  console.log("=== DEBUG ASSESSMENT TRIGGER ===\n");
  
  // Test cases
  const testCases = [
    {
      name: "Lo âu rõ ràng",
      message: "Tôi cảm thấy rất lo lắng về kỳ thi sắp tới, tim đập nhanh và khó ngủ",
      conversationId: "test-conv-1"
    },
    {
      name: "Trầm cảm rõ ràng", 
      message: "Tôi cảm thấy buồn bã, chán nản và mất hứng thú với mọi thứ",
      conversationId: "test-conv-2"
    },
    {
      name: "Stress rõ ràng",
      message: "Tôi đang chịu áp lực rất lớn từ công việc, căng thẳng và quá tải",
      conversationId: "test-conv-3"
    },
    {
      name: "Tin nhắn bình thường",
      message: "Hôm nay trời đẹp quá, tôi đi dạo với bạn",
      conversationId: "test-conv-4"
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- Test: ${testCase.name} ---`);
    console.log(`Message: "${testCase.message}"`);
    
    try {
      const result = await chatWithGPTService.shouldTriggerAssessment(
        testCase.message, 
        testCase.conversationId
      );
      
      console.log("Result:", JSON.stringify(result, null, 2));
      
      if (result.trigger) {
        console.log(`✅ TRIGGERED: ${result.scale} - ${result.reason}`);
      } else {
        console.log("❌ NOT TRIGGERED");
      }
      
    } catch (error) {
      console.error("❌ Error:", error.message);
    }
    
    console.log("-".repeat(50));
  }
}

debugAssessment().catch(console.error);

