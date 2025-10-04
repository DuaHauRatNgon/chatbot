const chatService = require("../services/chatWithGPTService");

const generateTitle = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Thiếu message" });
    }
    const result = await chatService.generateTitleAndMoodBefore(message);
    return res.json(result);
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server không xác định",
    });
  }
};

const chat = async (req, res) => {
  const { message, conversation_id } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Thiếu message" });
  }
  if (!conversation_id) {
    return res.status(400).json({ error: "Thiếu conversationId" });
  }

  const result = await chatService.chatWithGPT(message, conversation_id);
  return res.json(result);
};

module.exports = {
  generateTitle,
  chat,
};
