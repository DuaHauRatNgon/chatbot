// tests/conversationService.test.js
const ConversationService = require("../../services/conversationService");
const conversationRepository = require("../../repository/conversationRepository");

// Mock conversation repository
jest.mock("../../repository/conversationRepository", () => ({
  getConversationByUserId: jest.fn(),
  createConversation: jest.fn(),
}));

describe("ConversationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getConversationsByUserId", () => {
    it("should get conversations successfully", async () => {
      const mockConversations = [
        {
          _id: "507f1f77bcf86cd799439011",
          user_id: "507f1f77bcf86cd799439012",
          title: "Test Conversation",
          mood_before: 5,
          mood_after: 8,
          created_at: new Date(),
        },
      ];

      conversationRepository.getConversationByUserId.mockResolvedValue({
        success: true,
        message: "Success",
        conversations: mockConversations,
      });

      const result = await ConversationService.getConversationsByUserId(
        "507f1f77bcf86cd799439012"
      );

      expect(result).toEqual({
        success: true,
        message: "Success",
        data: mockConversations,
        statusCode: 200,
      });
      expect(
        conversationRepository.getConversationByUserId
      ).toHaveBeenCalledWith("507f1f77bcf86cd799439012");
    });

    it("should return error when userId is missing", async () => {
      const result = await ConversationService.getConversationsByUserId(null);

      expect(result).toEqual({
        success: false,
        message: "User ID là bắt buộc",
        statusCode: 400,
      });
      expect(
        conversationRepository.getConversationByUserId
      ).not.toHaveBeenCalled();
    });

    it("should handle repository error", async () => {
      conversationRepository.getConversationByUserId.mockResolvedValue({
        success: false,
        message: "Database error",
      });

      const result = await ConversationService.getConversationsByUserId(
        "507f1f77bcf86cd799439012"
      );

      expect(result).toEqual({
        success: false,
        message: "Database error",
        statusCode: 404,
      });
    });

    it("should handle service exception", async () => {
      conversationRepository.getConversationByUserId.mockRejectedValue(
        new Error("Service error")
      );

      const result = await ConversationService.getConversationsByUserId(
        "507f1f77bcf86cd799439012"
      );

      expect(result).toEqual({
        success: false,
        message: "Lỗi server khi lấy dữ liệu conversations",
        statusCode: 500,
      });
    });
  });

  describe("createConversation", () => {
    const validConversationData = {
      user_id: "507f1f77bcf86cd799439012",
      title: "Test Conversation",
      mood_before: 5,
      mood_after: 8,
    };

    it("should create conversation successfully", async () => {
      const mockCreatedConversation = {
        _id: "507f1f77bcf86cd799439011",
        ...validConversationData,
        created_at: new Date(),
      };

      conversationRepository.createConversation.mockResolvedValue({
        success: true,
        message: "Created successfully",
        result: mockCreatedConversation,
      });

      const result = await ConversationService.createConversation(
        validConversationData
      );

      expect(result).toEqual({
        success: true,
        message: "Created successfully",
        data: mockCreatedConversation,
        statusCode: 201,
      });
      expect(conversationRepository.createConversation).toHaveBeenCalledWith({
        user_id: validConversationData.user_id,
        title: validConversationData.title.trim(),
        mood_before: validConversationData.mood_before,
        mood_after: validConversationData.mood_after,
      });
    });

    it("should validate required fields", async () => {
      const invalidData = {
        user_id: "507f1f77bcf86cd799439012",
        title: "Test Conversation",
        // missing mood_before and mood_after
      };

      const result = await ConversationService.createConversation(invalidData);

      expect(result).toEqual({
        success: false,
        message:
          "Thiếu thông tin bắt buộc (user_id, title, mood_before, mood_after)",
        statusCode: 400,
      });
      expect(conversationRepository.createConversation).not.toHaveBeenCalled();
    });

    it("should validate mood values range", async () => {
      const invalidMoodData = {
        ...validConversationData,
        mood_before: 0, // Invalid: should be 1-10
        mood_after: 11, // Invalid: should be 1-10
      };

      const result = await ConversationService.createConversation(
        invalidMoodData
      );

      expect(result).toEqual({
        success: false,
        message: "Giá trị tâm trạng phải từ 1 đến 10",
        statusCode: 400,
      });
    });

    it("should validate title length", async () => {
      const longTitleData = {
        ...validConversationData,
        title: "A".repeat(201), // Too long
      };

      const result = await ConversationService.createConversation(
        longTitleData
      );

      expect(result).toEqual({
        success: false,
        message: "Tiêu đề không được dài quá 200 ký tự",
        statusCode: 400,
      });
    });

    it("should trim title whitespace", async () => {
      const dataWithSpaces = {
        ...validConversationData,
        title: "  Test Conversation  ",
      };

      conversationRepository.createConversation.mockResolvedValue({
        success: true,
        message: "Created successfully",
        result: { ...dataWithSpaces, title: "Test Conversation" },
      });

      await ConversationService.createConversation(dataWithSpaces);

      expect(conversationRepository.createConversation).toHaveBeenCalledWith({
        ...dataWithSpaces,
        title: "Test Conversation",
      });
    });

    it("should handle repository error", async () => {
      conversationRepository.createConversation.mockResolvedValue({
        success: false,
        message: "Database error",
      });

      const result = await ConversationService.createConversation(
        validConversationData
      );

      expect(result).toEqual({
        success: false,
        message: "Database error",
        statusCode: 500,
      });
    });

    it("should handle service exception", async () => {
      conversationRepository.createConversation.mockRejectedValue(
        new Error("Service error")
      );

      const result = await ConversationService.createConversation(
        validConversationData
      );

      expect(result).toEqual({
        success: false,
        message: "Lỗi server khi tạo conversation",
        statusCode: 500,
      });
    });
  });

  describe("getMoodStatistics", () => {
    it("should calculate mood statistics successfully", async () => {
      const mockConversations = [
        { mood_before: 4, mood_after: 7 },
        { mood_before: 6, mood_after: 8 },
        { mood_before: 3, mood_after: 5 },
        { mood_before: 5, mood_after: 9 },
        { mood_before: 7, mood_after: 6 },
      ];

      conversationRepository.getConversationByUserId.mockResolvedValue({
        success: true,
        conversations: mockConversations,
      });

      const result = await ConversationService.getMoodStatistics(
        "507f1f77bcf86cd799439012"
      );

      expect(result.success).toBe(true);
      expect(result.data.total_conversations).toBe(5);
      expect(result.data.average_mood_before).toBe(5); // (4+6+3+5+7)/5 = 5
      expect(result.data.average_mood_after).toBe(7); // (7+8+5+9+6)/5 = 7
      expect(result.data.improvement_rate).toBe(80); // 4 out of 5 improved
      expect(result.statusCode).toBe(200);
    });

    it("should return error when userId is missing", async () => {
      const result = await ConversationService.getMoodStatistics(null);

      expect(result).toEqual({
        success: false,
        message: "User ID là bắt buộc",
        statusCode: 400,
      });
    });

    it("should handle no conversations data", async () => {
      conversationRepository.getConversationByUserId.mockResolvedValue({
        success: false,
        conversations: [],
      });

      const result = await ConversationService.getMoodStatistics(
        "507f1f77bcf86cd799439012"
      );

      expect(result).toEqual({
        success: false,
        message: "Không có dữ liệu để thống kê",
        statusCode: 404,
      });
    });

    it("should include latest conversations in result", async () => {
      const mockConversations = Array.from({ length: 10 }, (_, i) => ({
        _id: `id_${i}`,
        mood_before: 5,
        mood_after: 7,
        created_at: new Date(Date.now() - i * 1000),
      }));

      conversationRepository.getConversationByUserId.mockResolvedValue({
        success: true,
        conversations: mockConversations,
      });

      const result = await ConversationService.getMoodStatistics(
        "507f1f77bcf86cd799439012"
      );

      expect(result.data.latest_conversations).toHaveLength(5);
      expect(result.data.latest_conversations[0]._id).toBe("id_9"); // Most recent first
    });

    it("should handle service exception", async () => {
      conversationRepository.getConversationByUserId.mockRejectedValue(
        new Error("Service error")
      );

      const result = await ConversationService.getMoodStatistics(
        "507f1f77bcf86cd799439012"
      );

      expect(result).toEqual({
        success: false,
        message: "Lỗi server khi lấy thống kê",
        statusCode: 500,
      });
    });
  });
});
