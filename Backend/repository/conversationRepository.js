const Conversation = require("../model/conversation");

class ConversationRepository {
  async getConversationByUserId(userId) {
    try {
      const conversations = await Conversation.find({ user_id: userId })
        .select("title _id")
        .sort({ created_at: -1 })
        .limit(10); // Sắp xếp theo thời gian tạo mới nhất

      if (!conversations || conversations.length === 0) {
        return {
          success: false,
          message: "Không có dữ liệu conversation cho user này",
        };
      }

      return {
        success: true,
        message: "Lấy dữ liệu conversations thành công",
        conversations,
      };
    } catch (error) {
      console.error("Repository error:", error);
      return {
        success: false,
        message: "Lỗi lấy dữ liệu conversations từ database",
      };
    }
  }

  async createConversation(data) {
    try {
      const { user_id, title, mood_before, mood_after } = data; // Sửa lỗi typo từ mod_before

      // Validate data trước khi tạo
      if (!user_id || !title || mood_before === undefined) {
        return {
          success: false,
          message: "Thiếu thông tin bắt buộc để tạo conversation",
        };
      }

      const newConversation = new Conversation({
        user_id,
        title: title.trim(),
        mood_before,
        mood_after,
      });

      const result = await newConversation.save(); // Thêm await

      return {
        success: true,
        message: "Thêm conversation vào database thành công",
        result,
      };
    } catch (error) {
      console.error("Repository error:", error);
      // Xử lý các loại lỗi cụ thể
      if (error.name === "ValidationError") {
        return {
          success: false,
          message: "Dữ liệu không hợp lệ: " + error.message,
        };
      }
      if (error.code === 11000) {
        return {
          success: false,
          message: "Conversation đã tồn tại",
        };
      }
      return {
        success: false,
        message: "Lỗi khi thêm conversation vào database",
      };
    }
  }

  // // Thêm method để lấy conversation theo ID
  // async getConversationById(conversationId) {
  //     try {
  //         const conversation = await Conversation.findById(conversationId)
  //             .populate('user_id', 'name email');

  //         if (!conversation) {
  //             return {
  //                 success: false,
  //                 message: 'Không tìm thấy conversation',
  //             }
  //         }

  //         return {
  //             success: true,
  //             message: 'Lấy dữ liệu conversation thành công',
  //             conversation
  //         }

  //     } catch (error) {
  //         console.error('Repository error:', error);
  //         return {
  //             success: false,
  //             message: 'Lỗi lấy dữ liệu conversation từ database',
  //         };
  //     }
  // }

  // // Thêm method để xóa conversation
  // async deleteConversation(conversationId) {
  //     try {
  //         const result = await Conversation.findByIdAndDelete(conversationId);

  //         if (!result) {
  //             return {
  //                 success: false,
  //                 message: 'Không tìm thấy conversation để xóa',
  //             }
  //         }

  //         return {
  //             success: true,
  //             message: 'Xóa conversation thành công',
  //             result
  //         }

  //     } catch (error) {
  //         console.error('Repository error:', error);
  //         return {
  //             success: false,
  //             message: 'Lỗi khi xóa conversation từ database',
  //         };
  //     }
  // }

  // // Thêm method để cập nhật conversation
  // async updateConversation(conversationId, updateData) {
  //     try {
  //         const result = await Conversation.findByIdAndUpdate(
  //             conversationId,
  //             updateData,
  //             { new: true, runValidators: true }
  //         ).populate('user_id', 'name email');

  //         if (!result) {
  //             return {
  //                 success: false,
  //                 message: 'Không tìm thấy conversation để cập nhật',
  //             }
  //         }

  //         return {
  //             success: true,
  //             message: 'Cập nhật conversation thành công',
  //             result
  //         }

  //     } catch (error) {
  //         console.error('Repository error:', error);

  //         if (error.name === 'ValidationError') {
  //             return {
  //                 success: false,
  //                 message: 'Dữ liệu cập nhật không hợp lệ: ' + error.message,
  //             };
  //         }

  //         return {
  //             success: false,
  //             message: 'Lỗi khi cập nhật conversation trong database',
  //         };
  //     }
  // }

  // // Thêm method để lấy tất cả conversations (cho admin)
  // async getAllConversations(page = 1, limit = 10) {
  //     try {
  //         const skip = (page - 1) * limit;

  //         const conversations = await Conversation.find()
  //             .populate('user_id', 'name email')
  //             .sort({ created_at: -1 })
  //             .skip(skip)
  //             .limit(limit);

  //         const total = await Conversation.countDocuments();

  //         return {
  //             success: true,
  //             message: 'Lấy danh sách conversations thành công',
  //             conversations,
  //             pagination: {
  //                 current_page: page,
  //                 total_pages: Math.ceil(total / limit),
  //                 total_items: total,
  //                 items_per_page: limit
  //             }
  //         }

  //     } catch (error) {
  //         console.error('Repository error:', error);
  //         return {
  //             success: false,
  //             message: 'Lỗi lấy danh sách conversations từ database',
  //         };
  //     }
  // }
}

module.exports = new ConversationRepository();
