// tests/chatWithGPTService.test.js
const ChatGPTService = require("../service/chatWithGPTService");
const documentRepository = require("../repository/documentRepository");

// Mock OpenAI
jest.mock("openai", () => {
  return {
    OpenAI: jest.fn(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
      embeddings: {
        create: jest.fn(),
      },
    })),
  };
});

// Mock document repository
jest.mock("../repository/documentRepository", () => ({
  getAllDocuments: jest.fn(),
}));

// Mock cosine similarity
jest.mock("../utils/cosineSimilarityUtil", () => jest.fn(() => 0.8));

describe("ChatGPTService", () => {
  let mockOpenAI;

  beforeEach(() => {
    const { OpenAI } = require("openai");
    mockOpenAI = new OpenAI();
    jest.clearAllMocks();
  });

  describe("generateTitleAndMoodBefore", () => {
    it("should generate title and mood successfully", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '{"title": "Test Title", "mood_before": 7}',
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await ChatGPTService.generateTitleAndMoodBefore(
        "Test message"
      );

      expect(result).toEqual({
        title: "Test Title",
        mood_before: 7,
      });
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: expect.stringContaining(
              "Bạn là một trợ lý tạo tiêu đề về tâm lý"
            ),
          },
          {
            role: "user",
            content:
              'Nội dung tin nhắn: "Test message". Tạo tiêu đề cho cuộc trò chuyện.',
          },
        ],
      });
    });

    it("should truncate title if longer than 200 characters", async () => {
      const longTitle = "A".repeat(250);
      const mockResponse = {
        choices: [
          {
            message: {
              content: `{"title": "${longTitle}", "mood_before": 7}`,
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await ChatGPTService.generateTitleAndMoodBefore(
        "Test message"
      );

      expect(result.title).toHaveLength(200);
      expect(result.title).toBe("A".repeat(200));
    });

    it("should handle API error gracefully", async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error("API Error")
      );

      const result = await ChatGPTService.generateTitleAndMoodBefore(
        "Test message"
      );

      expect(result).toEqual({
        title: "Cuộc trò chuyện không có tiêu đề",
        mood_before: null,
      });
    });

    it("should handle invalid JSON response", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: "Invalid JSON",
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await ChatGPTService.generateTitleAndMoodBefore(
        "Test message"
      );

      expect(result).toEqual({
        title: "Cuộc trò chuyện không có tiêu đề",
        mood_before: null,
      });
    });
  });

  describe("chatWithGPT", () => {
    beforeEach(() => {
      documentRepository.getAllDocuments.mockResolvedValue([
        {
          text: "Document 1 content",
          embedding: [0.1, 0.2, 0.3],
        },
        {
          text: "Document 2 content",
          embedding: [0.4, 0.5, 0.6],
        },
      ]);
    });

    it("should chat with GPT successfully", async () => {
      const mockEmbeddingResponse = {
        data: [
          {
            embedding: [0.7, 0.8, 0.9],
          },
        ],
      };

      const mockChatResponse = {
        choices: [
          {
            message: {
              content: '{"content": "Test response", "emotion": "happy"}',
            },
          },
        ],
      };

      mockOpenAI.embeddings.create.mockResolvedValue(mockEmbeddingResponse);
      mockOpenAI.chat.completions.create.mockResolvedValue(mockChatResponse);

      const result = await ChatGPTService.chatWithGPT("Test message");

      expect(result).toEqual({
        success: true,
        message: '{"content": "Test response", "emotion": "happy"}',
      });

      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: "text-embedding-3-small",
        input: "Test message",
      });

      expect(documentRepository.getAllDocuments).toHaveBeenCalled();
    });

    it("should handle embedding API error", async () => {
      mockOpenAI.embeddings.create.mockRejectedValue(
        new Error("Embedding API Error")
      );

      const result = await ChatGPTService.chatWithGPT("Test message");

      expect(result).toEqual({
        success: false,
        message: "Lỗi khi gọi API OpenAI: Embedding API Error",
      });
    });

    it("should handle chat completion API error", async () => {
      const mockEmbeddingResponse = {
        data: [
          {
            embedding: [0.7, 0.8, 0.9],
          },
        ],
      };

      mockOpenAI.embeddings.create.mockResolvedValue(mockEmbeddingResponse);
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error("Chat API Error")
      );

      const result = await ChatGPTService.chatWithGPT("Test message");

      expect(result).toEqual({
        success: false,
        message: "Lỗi khi gọi API OpenAI: Chat API Error",
      });
    });

    it("should handle empty documents", async () => {
      documentRepository.getAllDocuments.mockResolvedValue([]);

      const mockEmbeddingResponse = {
        data: [
          {
            embedding: [0.7, 0.8, 0.9],
          },
        ],
      };

      const mockChatResponse = {
        choices: [
          {
            message: {
              content: '{"content": "Test response", "emotion": "neutral"}',
            },
          },
        ],
      };

      mockOpenAI.embeddings.create.mockResolvedValue(mockEmbeddingResponse);
      mockOpenAI.chat.completions.create.mockResolvedValue(mockChatResponse);

      const result = await ChatGPTService.chatWithGPT("Test message");

      expect(result.success).toBe(true);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: expect.stringContaining("Tài liệu tham khảo:\n"),
          },
          {
            role: "user",
            content: "Test message",
          },
        ],
      });
    });
  });
});
