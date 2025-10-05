const conversationRepository = require("../repository/conversationRepository");
const mongoose = require("mongoose");
const Message = require("../model/message");
const Conversation = require("../model/conversation");

class ConversationService {
  // Lấy tất cả conversations của user
  async getConversationsByUserId(userId) {
    try {
      // Validate userId
      if (!userId) {
        return {
          success: false,
          message: "User ID là bắt buộc",
          statusCode: 400,
        };
      }

      const result = await conversationRepository.getConversationByUserId(
        userId
      );

      if (!result.success) {
        return {
          success: false,
          message: result.message,
          statusCode: 404,
        };
      }

      return {
        success: true,
        message: result.message,
        data: result.conversations,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Service error:", error);
      return {
        success: false,
        message: "Lỗi server khi lấy dữ liệu conversations",
        statusCode: 500,
      };
    }
  }

  // Tạo conversation mới
  async createConversation(conversationData) {
    try {
      // Validate dữ liệu đầu vào
      const { user_id, title, mood_before } = conversationData;
      if (!user_id || !title || !mood_before) {
        return {
          success: false,
          message: "Thiếu thông tin bắt buộc (user_id, title, mood_before)",
          statusCode: 400,
        };
      }

      // Validate mood values
      if (mood_before < 1 || mood_before > 10) {
        return {
          success: false,
          message: "Giá trị tâm trạng phải từ 1 đến 10",
          statusCode: 400,
        };
      }

      // Validate title length
      if (title.length > 200) {
        return {
          success: false,
          message: "Tiêu đề không được dài quá 200 ký tự",
          statusCode: 400,
        };
      }

      const result = await conversationRepository.createConversation({
        user_id,
        title: title.trim(),
        mood_before,
      });

      if (!result.success) {
        return {
          success: false,
          message: result.message,
          statusCode: 500,
        };
      }
      return {
        success: true,
        message: result.message,
        data: result.result,
        statusCode: 201,
      };
    } catch (error) {
      console.error("Service error:", error);
      return {
        success: false,
        message: "Lỗi server khi tạo conversation",
        statusCode: 500,
      };
    }
  }

  // Thống kê tâm trạng của user
  async getMoodStatistics(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          message: "User ID là bắt buộc",
          statusCode: 400,
        };
      }

      const result = await conversationRepository.getConversationByUserId(
        userId
      );

      if (!result.success || !result.conversations.length) {
        return {
          success: false,
          message: "Không có dữ liệu để thống kê",
          statusCode: 404,
        };
      }

      const conversations = result.conversations;
      const totalConversations = conversations.length;

      // Tính toán thống kê
      const avgMoodBefore =
        conversations.reduce((sum, conv) => sum + conv.mood_before, 0) /
        totalConversations;
      const avgMoodAfter =
        conversations.reduce((sum, conv) => sum + conv.mood_after, 0) /
        totalConversations;
      const improvementRate =
        conversations.filter((conv) => conv.mood_after > conv.mood_before)
          .length / totalConversations;

      return {
        success: true,
        message: "Lấy thống kê thành công",
        data: {
          total_conversations: totalConversations,
          average_mood_before: Math.round(avgMoodBefore * 100) / 100,
          average_mood_after: Math.round(avgMoodAfter * 100) / 100,
          improvement_rate: Math.round(improvementRate * 100 * 100) / 100, // Percentage
          latest_conversations: conversations.slice(-5).reverse(), // 5 conversations gần nhất
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Service error:", error);
      return {
        success: false,
        message: "Lỗi server khi lấy thống kê",
        statusCode: 500,
      };
    }
  }

  // Lịch sử cảm xúc theo thời gian (dựa trên tin nhắn của user)
  async getMoodHistory(userId, options = {}) {
    try {
      if (!userId) {
        return {
          success: false,
          message: "User ID là bắt buộc",
          statusCode: 400,
        };
      }

      const { from, to } = options;

      const matchDate = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate.getTime())) matchDate.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate.getTime())) matchDate.$lte = toDate;
      }

      const dateFilterStage = Object.keys(matchDate).length
        ? { timestamp: matchDate }
        : {};

      // Aggregate messages -> join conversations -> filter by user -> only sender=user -> group by day
      const pipeline = [
        {
          $lookup: {
            from: Conversation.collection.name,
            localField: "conversation_id",
            foreignField: "_id",
            as: "conversation",
          },
        },
        { $unwind: "$conversation" },
        {
          $match: {
            "conversation.user_id": new mongoose.Types.ObjectId(userId),
            sender: "user",
            ...dateFilterStage,
          },
        },
        {
          $project: {
            emotion: 1,
            timestamp: 1,
            day: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
            },
          },
        },
        {
          $group: {
            _id: "$day",
            total: { $sum: 1 },
            happy: {
              $sum: { $cond: [{ $eq: ["$emotion", "happy"] }, 1, 0] },
            },
            sad: {
              $sum: { $cond: [{ $eq: ["$emotion", "sad"] }, 1, 0] },
            },
            angry: {
              $sum: { $cond: [{ $eq: ["$emotion", "angry"] }, 1, 0] },
            },
            neutral: {
              $sum: { $cond: [{ $eq: ["$emotion", "neutral"] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            date: "$_id",
            total: 1,
            happy: 1,
            sad: 1,
            angry: 1,
            neutral: 1,
          },
        },
      ];

      const data = await Message.aggregate(pipeline).exec();

      return {
        success: true,
        message: "Lấy lịch sử cảm xúc thành công",
        data,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Service error:", error);
      return {
        success: false,
        message: "Lỗi server khi lấy lịch sử cảm xúc",
        statusCode: 500,
      };
    }
  }
}

module.exports = new ConversationService();
