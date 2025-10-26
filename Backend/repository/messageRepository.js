const Message = require('../model/message'); // Adjust path as needed

class MessageRepository {
  // Tạo tin nhắn mới
  async createMessage(messageData) {
    try {
      console.log(`[DEBUG Repository] Input messageData:`, messageData);
      
      const message = new Message(messageData);
      console.log(`[DEBUG Repository] Before save - emotion: ${message.emotion}`);
      
      const savedMessage = await message.save();
      console.log(`[DEBUG Repository] After save - emotion: ${savedMessage.emotion}`);
      console.log(`[DEBUG Repository] Saved message ID: ${savedMessage._id}`);
      
      return {
        success: true,
        message: "Thêm dữ liệu message thành công",
        data: savedMessage
      };
    } catch (error) {
      console.error(`[ERROR Repository] Error saving message:`, error);
      return {
        success: false,
        message: `Lỗi khi thêm dữ liệu vào message: ${error.message}`,
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

  // Lấy tin nhắn gần đây nhất theo conversation_id
  async getLastMessagesByConversationId(conversationId, limit = 3) {
    try {
      if (!conversationId) {
        return [];
      }
      const messages = await Message.find({ conversation_id: conversationId })
        .sort({ timestamp: -1 })
        .limit(limit);
      return messages.reverse(); // Đảo ngược để có thứ tự thời gian tăng dần
    } catch (error) {
      console.error('Lỗi khi lấy tin nhắn gần đây:', error.message);
      return [];
    }
  }
}

module.exports = new MessageRepository();