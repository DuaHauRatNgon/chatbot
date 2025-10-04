const { coverageDirectory } = require("../config/jest.config");
const conversationService = require("../services/conversationService");

class ConversationController {
  // GET /api/conversations/user/:userId
  async getConversationsByUserId(req, res) {
    try {
      const userId = req.params.userId;

      const result = await conversationService.getConversationsByUserId(userId);

      return res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data || null,
      });
    } catch (error) {
      console.error("Controller error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server không xác định",
        data: null,
      });
    }
  }

  // POST /api/conversations
  async createConversation(req, res) {
    try {
      const conversationData = req.body;
      conversationData.user_id = req.userId;
      const result = await conversationService.createConversation(
        conversationData
      );

      return res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data || null,
      });
    } catch (error) {
      console.error("Controller error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server không xác định",
        data: null,
      });
    }
  }

  // GET /api/conversations/statistics/:userId
  // async getMoodStatistics(req, res) {
  //     try {
  //         const { userId } = req.params;

  //         const result = await conversationService.getMoodStatistics(userId);

  //         return res.status(result.statusCode).json({
  //             success: result.success,
  //             message: result.message,
  //             data: result.data || null
  //         });

  //     } catch (error) {
  //         console.error('Controller error:', error);
  //         return res.status(500).json({
  //             success: false,
  //             message: 'Lỗi server không xác định',
  //             data: null
  //         });
  //     }
  // }

  // // DELETE /api/conversations/:id (xóa conversation - có thể cần sau)
  // async deleteConversation(req, res) {
  //     try {
  //         const { id } = req.params;

  //         // Logic xóa conversation có thể implement sau
  //         return res.status(501).json({
  //             success: false,
  //             message: 'Chức năng chưa được triển khai',
  //             data: null
  //         });

  //     } catch (error) {
  //         console.error('Controller error:', error);
  //         return res.status(500).json({
  //             success: false,
  //             message: 'Lỗi server không xác định',
  //             data: null
  //         });
  //     }
  // }

  // // PUT /api/conversations/:id (cập nhật conversation - có thể cần sau)
  // async updateConversation(req, res) {
  //     try {
  //         const { id } = req.params;
  //         const updateData = req.body;

  //         // Logic cập nhật conversation có thể implement sau
  //         return res.status(501).json({
  //             success: false,
  //             message: 'Chức năng chưa được triển khai',
  //             data: null
  //         });

  //     } catch (error) {
  //         console.error('Controller error:', error);
  //         return res.status(500).json({
  //             success: false,
  //             message: 'Lỗi server không xác định',
  //             data: null
  //         });
  //     }
  // }
}

module.exports = new ConversationController();
