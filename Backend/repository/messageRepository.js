const Message = require('../model/message'); // Adjust path as needed

class MessageRepository {
  // Tạo tin nhắn mới
  async createMessage(messageData) {
    try {
      const message = new Message(messageData);
      await message.save();
      return {
        success: true,
        message: "Thêm dữ liệu message thành công",
      };
    } catch (error) {
      return {
        success: false,
        message: "Lỗi khi thêm dữ liệu vào message",
      };
    }
  }

  // Lấy tất cả tin nhắn theo conversation_id
  async findByConversationId(conversationId) {
    try {
      const messages = await Message.find({ conversation_id: conversationId });
      return {
        success: true,
        messages,
      };
    } catch (error) {
      throw new Error(
        `Lỗi khi lấy tin nhắn theo cuộc hội thoại: ${error.message}`
      );
    }
  }
  async findMessageLateBotByConversationId(conversationId) {
    try {
      const message = await Message.findOne({
        conversation_id: conversationId,
        sender: "bot",
      }).sort({ timestamp: -1 });
      return message;
    } catch (error) {
      throw new Error(
        `Lỗi khi lấy tin nhắn muộn của bot theo cuộc hội thoại: ${error.message}`
      );
    }
  }
  async getfiveMessagesByConversationId(conversationId) {
    try {
      if (!conversationId) {
        return {
          success: false,
          message: "conversation_id là bắt buộc",
        };
      }
      const result = await Message.find({ conversation_id: conversationId })
        .sort({ timestamp: -1 })
        .limit(5);
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Lỗi khi lấy tin nhắn: ${error.message}`,
      };
    }
  }

  // Đếm số tin nhắn trong cuộc trò chuyện
  async getMessageCount(conversationId) {
    try {
      if (!conversationId) {
        return 0;
      }
      const count = await Message.countDocuments({ conversation_id: conversationId });
      return count;
    } catch (error) {
      console.error('Lỗi khi đếm tin nhắn:', error.message);
      return 0;
    }
  }
}

module.exports = new MessageRepository();