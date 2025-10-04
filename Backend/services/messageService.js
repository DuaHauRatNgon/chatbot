const MessageRepository = require('../repository/messageRepository');

class MessageService {
  // Tạo tin nhắn mới
  async createMessage(messageData) {
    try {
      // Validate dữ liệu đầu vào
      if (!messageData.conversation_id) {
        return {
          success: false,
          message: "conversation_id là bắt buộc"
        };
      }

      if (!messageData.content || messageData.content.trim() === '') {
        return {
          success: false,
          message: "Nội dung tin nhắn không được để trống"
        };
      }

      if (!messageData.sender || !['user', 'bot'].includes(messageData.sender)) {
        return {
          success: false,
          message: "Sender phải là 'user' hoặc 'bot'"
        };
      }

      // Validate emotion nếu có
      if (messageData.emotion && !['happy', 'sad', 'angry', 'neutral'].includes(messageData.emotion)) {
        return {
          success: false,
          message: "Emotion phải là một trong: happy, sad, angry, neutral"
        };
      }

      const result = await MessageRepository.createMessage(messageData);
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Lỗi trong service: ${error.message}`
      };
    }
  }

  // Lấy tin nhắn theo conversation_id
  async getMessagesByConversationId(conversationId) {
    try {
      if (!conversationId) {
        return {
          success: false,
          message: "conversation_id là bắt buộc"
        };
      }

      const result = await MessageRepository.findByConversationId(conversationId);
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Lỗi khi lấy tin nhắn: ${error.message}`
      };
    }
  }

}

module.exports = new MessageService();