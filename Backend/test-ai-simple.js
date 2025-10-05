// Test đơn giản để kiểm tra AI Assessment
require('dotenv').config();

const aiAssessmentService = require('./services/aiAssessmentService');

async function testAISimple() {
  console.log("=== TESTING AI ASSESSMENT (SIMPLE) ===\n");
  
  // Kiểm tra API key
  if (!process.env.OPENAI_API_KEY) {
    console.log("❌ Không có OPENAI_API_KEY trong .env file");
    console.log("Vui lòng tạo file .env với: OPENAI_API_KEY=your_key_here");
    return;
  }
  
  console.log("✅ OpenAI API Key found");
  
  // Test case đơn giản
  const testMessages = [
    { sender: "user", content: "Tôi cảm thấy rất lo lắng về kỳ thi sắp tới" },
    { sender: "user", content: "Tim tôi đập nhanh và tôi khó ngủ" },
    { sender: "user", content: "Tôi sợ mình sẽ thất bại" }
  ];
  
  try {
    console.log("\n--- Testing AI Analysis ---");
    const result = await aiAssessmentService.analyzeConversationForAssessment(testMessages, 'test-123');
    
    console.log("Kết quả:");
    console.log("- Should trigger:", result.shouldTrigger);
    console.log("- Confidence:", result.confidence);
    console.log("- Primary concern:", result.primaryConcern);
    console.log("- Recommended scale:", result.recommendedScale);
    console.log("- Reasoning:", result.reasoning);
    
    if (result.shouldTrigger) {
      console.log("\n✅ AI Assessment hoạt động bình thường!");
    } else {
      console.log("\n⚠️ AI không trigger assessment (có thể do confidence thấp)");
    }
    
  } catch (error) {
    console.error("❌ Lỗi khi test AI:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

testAISimple().catch(console.error);





