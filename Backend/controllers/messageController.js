const MessageService = require("../services/messageService");

class MessageController {
  // POST /api/messages - Tạo tin nhắn mới
  async createMessage(req, res) {
    try {
      const messageData = req.body;
      const result = await MessageService.createMessage(messageData);
      if (result.success) {
        return res.status(201).json({
          success: true,
          message: result.message,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Lỗi trong createMessage controller:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server nội bộ",
      });
    }
  }

  // GET /api/messages/conversation/:conversationId - Lấy tin nhắn theo conversation_id
  async getMessagesByConversationId(req, res) {
    try {
      const { conversationId } = req.params;
      const result = await MessageService.getMessagesByConversationId(
        conversationId
      );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Lấy tin nhắn thành công",
          data: result.messages,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
          data: null,
        });
      }
    } catch (error) {
      console.error("Lỗi trong getMessagesByConversationId controller:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server nội bộ",
        data: null,
      });
    }
  }
}

module.exports = new MessageController();
