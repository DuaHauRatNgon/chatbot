console.log("Test script running...");

// Test từ khóa đơn giản
const message = "Mình cảm thấy lo lắng và bồn chồn về việc học";
const content = message.toLowerCase();

const anxietyKeywords = ["lo lắng", "bồn chồn", "sợ hãi", "hồi hộp"];
const anxietyScore = anxietyKeywords.filter(keyword => content.includes(keyword)).length;

console.log(`Message: ${message}`);
console.log(`Anxiety score: ${anxietyScore}`);
console.log(`Should trigger: ${anxietyScore >= 2}`);

