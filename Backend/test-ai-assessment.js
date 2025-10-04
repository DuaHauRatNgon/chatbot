const aiAssessmentService = require('./services/aiAssessmentService');

// Test cases cho AI Assessment
const testCases = [
  {
    name: "Lo âu nhẹ",
    messages: [
      { sender: "user", content: "Tôi cảm thấy hơi lo lắng về kỳ thi sắp tới" },
      { sender: "user", content: "Tim tôi đập nhanh khi nghĩ đến việc phải thuyết trình" },
      { sender: "user", content: "Tôi khó ngủ vì cứ suy nghĩ về những điều có thể xảy ra" }
    ]
  },
  {
    name: "Trầm cảm trung bình",
    messages: [
      { sender: "user", content: "Tôi cảm thấy rất buồn và chán nản" },
      { sender: "user", content: "Không có gì khiến tôi vui vẻ nữa" },
      { sender: "user", content: "Tôi mất hứng thú với mọi thứ" },
      { sender: "user", content: "Tôi cảm thấy mệt mỏi và không muốn làm gì" }
    ]
  },
  {
    name: "Stress cao",
    messages: [
      { sender: "user", content: "Tôi đang chịu rất nhiều áp lực từ công việc" },
      { sender: "user", content: "Có quá nhiều việc phải làm và tôi không thể tập trung" },
      { sender: "user", content: "Tôi cảm thấy căng thẳng và quá tải" },
      { sender: "user", content: "Không có thời gian để nghỉ ngơi" }
    ]
  },
  {
    name: "Tình trạng bình thường",
    messages: [
      { sender: "user", content: "Hôm nay tôi cảm thấy khá ổn" },
      { sender: "user", content: "Tôi đã hoàn thành xong bài tập" },
      { sender: "user", content: "Cuối tuần tôi sẽ đi chơi với bạn bè" }
    ]
  }
];

async function runAIAssessmentTests() {
  console.log("=== TESTING AI ASSESSMENT SERVICE ===\n");
  
  for (const testCase of testCases) {
    console.log(`\n--- Test Case: ${testCase.name} ---`);
    
    try {
      const result = await aiAssessmentService.analyzeConversationForAssessment(
        testCase.messages, 
        'test-conversation-id'
      );
      
      console.log("Kết quả phân tích:");
      console.log(`- Should trigger: ${result.shouldTrigger}`);
      console.log(`- Confidence: ${result.confidence}`);
      console.log(`- Primary concern: ${result.primaryConcern}`);
      console.log(`- Severity: ${result.severity}`);
      console.log(`- Recommended scale: ${result.recommendedScale}`);
      console.log(`- Reasoning: ${result.reasoning}`);
      console.log(`- Key indicators: ${result.keyIndicators?.join(', ') || 'None'}`);
      console.log(`- Urgency: ${result.urgency}`);
      
      // Test AI recommendations nếu có trigger
      if (result.shouldTrigger) {
        console.log("\n--- Testing AI Recommendations ---");
        const recommendations = await aiAssessmentService.generatePersonalizedRecommendations({
          scaleType: result.recommendedScale,
          totalScore: 8, // Giả sử điểm số
          interpretation: "Mức độ trung bình",
          primaryConcern: result.primaryConcern,
          severity: result.severity
        }, {
          age: "25",
          gender: "Nam",
          occupation: "Sinh viên"
        });
        
        console.log("AI Recommendations:");
        console.log("- Immediate actions:", recommendations.immediateActions);
        console.log("- Daily practices:", recommendations.dailyPractices);
        console.log("- Professional help needed:", recommendations.professionalHelp.needed);
        console.log("- Resources:", recommendations.resources);
        console.log("- Follow up timeline:", recommendations.followUp.timeline);
      }
      
    } catch (error) {
      console.error(`Lỗi trong test case ${testCase.name}:`, error.message);
    }
    
    console.log("\n" + "=".repeat(50));
  }
}

// Chạy tests
runAIAssessmentTests().catch(console.error);
