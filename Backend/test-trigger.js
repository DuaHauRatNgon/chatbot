// Test script để kiểm tra logic trigger assessment
console.log("Starting test...");

const messageRepository = {
  async getMessageCount(conversationId) {
    // Mock: trả về 2 tin nhắn để test
    console.log(`Getting message count for conversation: ${conversationId}`);
    return 2;
  }
};

// Copy logic từ shouldTriggerAssessment
async function shouldTriggerAssessment(messageContent, conversationId) {
  try {
    // Đếm số tin nhắn trong cuộc trò chuyện
    const messageCount = await messageRepository.getMessageCount(conversationId);
    console.log(`[DEBUG] Message count: ${messageCount}, Content: "${messageContent}"`);
    
    // Chỉ trigger sau 2 tin nhắn
    if (messageCount < 2) {
      console.log(`[DEBUG] Not enough messages (${messageCount} < 2), skipping trigger`);
      return { trigger: false };
    }
    
    // Phân tích từ khóa để quyết định thang đo
    const content = messageContent.toLowerCase();
    
    const anxietyKeywords = ["lo lắng", "bồn chồn", "sợ hãi", "hồi hộp", "tim đập nhanh", "khó thở", "căng thẳng", "lo sợ"];
    const depressionKeywords = ["buồn", "chán nản", "mất hứng thú", "tuyệt vọng", "mệt mỏi", "không muốn làm gì", "chán", "buồn bã"];
    const stressKeywords = ["căng thẳng", "áp lực", "quá tải", "không thể tập trung", "stress", "căng thẳng", "áp lực công việc", "quá nhiều việc"];
    
    const anxietyScore = anxietyKeywords.filter(keyword => 
      content.includes(keyword)).length;
    const depressionScore = depressionKeywords.filter(keyword => 
      content.includes(keyword)).length;
    const stressScore = stressKeywords.filter(keyword => 
      content.includes(keyword)).length;
    
    console.log(`[DEBUG] Scores - Anxiety: ${anxietyScore}, Depression: ${depressionScore}, Stress: ${stressScore}`);
    
    // Nếu có ít nhất 2 từ khóa → trigger quiz
    if (anxietyScore >= 2) {
      console.log(`[DEBUG] Triggering GAD-7 assessment`);
      return { 
        trigger: true, 
        scale: "GAD-7", 
        reason: "Phát hiện dấu hiệu lo âu" 
      };
    }
    if (depressionScore >= 2) {
      console.log(`[DEBUG] Triggering PHQ-9 assessment`);
      return { 
        trigger: true, 
        scale: "PHQ-9", 
        reason: "Phát hiện dấu hiệu trầm cảm" 
      };
    }
    if (stressScore >= 2) {
      console.log(`[DEBUG] Triggering PSS assessment`);
      return { 
        trigger: true, 
        scale: "PSS", 
        reason: "Phát hiện dấu hiệu stress" 
      };
    }
    
    console.log(`[DEBUG] No assessment triggered`);
    return { trigger: false };
  } catch (error) {
    console.error("Lỗi khi kiểm tra trigger assessment:", error.message);
    return { trigger: false };
  }
}

// Test cases
async function runTests() {
  console.log("=== TESTING TRIGGER LOGIC ===\n");
  
  const testCases = [
    {
      message: "Mình cảm thấy lo lắng và bồn chồn về việc học",
      expected: "GAD-7"
    },
    {
      message: "Tôi rất buồn và chán nản, không muốn làm gì cả",
      expected: "PHQ-9"
    },
    {
      message: "Mình bị căng thẳng và áp lực công việc quá nhiều",
      expected: "PSS"
    },
    {
      message: "Xin chào, hôm nay thời tiết đẹp",
      expected: "none"
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`Testing: "${testCase.message}"`);
    const result = await shouldTriggerAssessment(testCase.message, "test-conversation-id");
    console.log(`Result:`, result);
    console.log(`Expected: ${testCase.expected}`);
    console.log(`Match: ${result.scale === testCase.expected || (testCase.expected === "none" && !result.trigger)}`);
    console.log("---\n");
  }
}

runTests();
