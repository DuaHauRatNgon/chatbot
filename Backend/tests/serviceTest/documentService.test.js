const DocumentService = require("../../service/documentService");
const DocumentRepository = require("../../repository/documentRepository");
const DocumentUtil = require("../../utils/documentUtil");
const { OpenAI } = require("openai");
const jest = require("../../config/jest.config")

// Mock các dependencies
jest.mock("../../repository/documentRepository");
jest.mock("../../utils/documentUtil");
jest.mock("openai");

describe("DocumentService", () => {
  let mockOpenAI;

  beforeEach(() => {
    // Reset all mocks trước mỗi test
    jest.clearAllMocks();

    // Mock OpenAI
    mockOpenAI = {
      embeddings: {
        create: jest.fn(),
      },
    };
    OpenAI.mockImplementation(() => mockOpenAI);
  });

  describe("createDocument", () => {
    it("should create document successfully with valid data", async () => {
      // Arrange
      const mockDocumentData = {
        text: "This is a test document content",
      };

      const mockEmbeddingResponse = {
        data: [
          {
            embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
          },
        ],
      };

      const mockRepositoryResponse = {
        success: true,
        message: "Tạo document thành công",
        data: { id: "123", text: mockDocumentData.text },
      };

      mockOpenAI.embeddings.create.mockResolvedValue(mockEmbeddingResponse);
      DocumentRepository.createDocument.mockResolvedValue(
        mockRepositoryResponse
      );

      // Act
      const result = await DocumentService.createDocument(mockDocumentData);

      // Assert
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: "text-embedding-3-small",
        input: mockDocumentData.text,
      });

      expect(DocumentRepository.createDocument).toHaveBeenCalledWith({
        text: mockDocumentData.text,
        embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
        metadata: {
          sourceFile: "text_input",
          chunkSize: mockDocumentData.text.length,
          createdAt: expect.any(Date),
        },
      });

      expect(result).toEqual(mockRepositoryResponse);
    });

    it("should return error when documentData is null", async () => {
      // Act
      const result = await DocumentService.createDocument(null);

      // Assert
      expect(result).toEqual({
        success: false,
        message: "Dữ liệu document không hợp lệ. Cần có trường 'text'.",
      });

      expect(mockOpenAI.embeddings.create).not.toHaveBeenCalled();
      expect(DocumentRepository.createDocument).not.toHaveBeenCalled();
    });

    it("should return error when documentData is not an object", async () => {
      // Act
      const result = await DocumentService.createDocument("invalid data");

      // Assert
      expect(result).toEqual({
        success: false,
        message: "Dữ liệu document không hợp lệ. Cần có trường 'text'.",
      });
    });

    it("should return error when text field is missing", async () => {
      // Act
      const result = await DocumentService.createDocument({ title: "Test" });

      // Assert
      expect(result).toEqual({
        success: false,
        message: "Dữ liệu document không hợp lệ. Cần có trường 'text'.",
      });
    });

    it("should return error when text field is not a string", async () => {
      // Act
      const result = await DocumentService.createDocument({ text: 123 });

      // Assert
      expect(result).toEqual({
        success: false,
        message: "Dữ liệu document không hợp lệ. Cần có trường 'text'.",
      });
    });

    it("should handle OpenAI API error", async () => {
      // Arrange
      const mockDocumentData = {
        text: "Test content",
      };

      const mockError = new Error("OpenAI API Error");
      mockOpenAI.embeddings.create.mockRejectedValue(mockError);

      // Act
      const result = await DocumentService.createDocument(mockDocumentData);

      // Assert
      expect(result).toEqual({
        success: false,
        message: "Lỗi server khi tạo document",
        error: "OpenAI API Error",
      });
    });

    it("should handle repository error", async () => {
      // Arrange
      const mockDocumentData = {
        text: "Test content",
      };

      const mockEmbeddingResponse = {
        data: [{ embedding: [0.1, 0.2] }],
      };

      const mockRepositoryError = new Error("Database connection error");

      mockOpenAI.embeddings.create.mockResolvedValue(mockEmbeddingResponse);
      DocumentRepository.createDocument.mockRejectedValue(mockRepositoryError);

      // Act
      const result = await DocumentService.createDocument(mockDocumentData);

      // Assert
      expect(result).toEqual({
        success: false,
        message: "Lỗi server khi tạo document",
        error: "Database connection error",
      });
    });
  });

  describe("createDocumentsAdvanced", () => {
    it("should create documents from PDF successfully", async () => {
      // Arrange
      const mockFilePath = "/path/to/test.pdf";
      const mockChunks = [
        "First chunk of text from PDF",
        "Second chunk of text from PDF",
        "Third chunk of text from PDF",
      ];

      const mockEmbeddingResponse = {
        data: [{ embedding: [0.1, 0.2, 0.3] }],
      };

      const mockRepositoryResponse = {
        success: true,
        message: "Tạo thành công 3 documents",
        data: [],
        count: 3,
      };

      DocumentUtil.readPdfChunks.mockResolvedValue(mockChunks);
      mockOpenAI.embeddings.create.mockResolvedValue(mockEmbeddingResponse);
      DocumentRepository.createDocumentsAdvanced.mockResolvedValue(
        mockRepositoryResponse
      );

      // Act
      const result = await DocumentService.createDocumentsAdvanced(
        mockFilePath
      );

      // Assert
      expect(DocumentUtil.readPdfChunks).toHaveBeenCalledWith(
        mockFilePath,
        500
      );
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledTimes(3);
      expect(DocumentRepository.createDocumentsAdvanced).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            text: "First chunk of text from PDF",
            embedding: [0.1, 0.2, 0.3],
            metadata: expect.objectContaining({
              sourceFile: mockFilePath,
              chunkSize: "First chunk of text from PDF".length,
              createdAt: expect.any(Date),
            }),
          }),
        ]),
        {
          ordered: false,
          validateBeforeSave: true,
        }
      );
      expect(result).toEqual(mockRepositoryResponse);
    });

    it("should return error when file path is invalid", async () => {
      // Act
      const result = await DocumentService.createDocumentsAdvanced(null);

      // Assert
      expect(result).toEqual({
        success: false,
        message: "Đường dẫn file PDF không hợp lệ",
      });

      expect(DocumentUtil.readPdfChunks).not.toHaveBeenCalled();
    });

    it("should return error when file path is not a string", async () => {
      // Act
      const result = await DocumentService.createDocumentsAdvanced(123);

      // Assert
      expect(result).toEqual({
        success: false,
        message: "Đường dẫn file PDF không hợp lệ",
      });
    });

    it("should return error when no chunks extracted from PDF", async () => {
      // Arrange
      const mockFilePath = "/path/to/empty.pdf";
      DocumentUtil.readPdfChunks.mockResolvedValue([]);

      // Act
      const result = await DocumentService.createDocumentsAdvanced(
        mockFilePath
      );

      // Assert
      expect(result).toEqual({
        success: false,
        message: "Không thể trích xuất nội dung từ PDF",
      });

      expect(mockOpenAI.embeddings.create).not.toHaveBeenCalled();
    });

    it("should handle DocumentUtil error", async () => {
      // Arrange
      const mockFilePath = "/path/to/invalid.pdf";
      const mockError = new Error("File không tồn tại");

      DocumentUtil.readPdfChunks.mockRejectedValue(mockError);

      // Act
      const result = await DocumentService.createDocumentsAdvanced(
        mockFilePath
      );

      // Assert
      expect(result).toEqual({
        success: false,
        message: "Lỗi khi xử lý file PDF",
        error: "File không tồn tại",
      });
    });

    it("should handle OpenAI embedding error", async () => {
      // Arrange
      const mockFilePath = "/path/to/test.pdf";
      const mockChunks = ["Test chunk"];
      const mockError = new Error("OpenAI quota exceeded");

      DocumentUtil.readPdfChunks.mockResolvedValue(mockChunks);
      mockOpenAI.embeddings.create.mockRejectedValue(mockError);

      // Act
      const result = await DocumentService.createDocumentsAdvanced(
        mockFilePath
      );

      // Assert
      expect(result).toEqual({
        success: false,
        message: "Lỗi khi xử lý file PDF",
        error: "OpenAI quota exceeded",
      });
    });

    it("should handle repository advanced creation error", async () => {
      // Arrange
      const mockFilePath = "/path/to/test.pdf";
      const mockChunks = ["Test chunk"];
      const mockEmbeddingResponse = {
        data: [{ embedding: [0.1, 0.2] }],
      };
      const mockRepositoryError = new Error("Bulk insert failed");

      DocumentUtil.readPdfChunks.mockResolvedValue(mockChunks);
      mockOpenAI.embeddings.create.mockResolvedValue(mockEmbeddingResponse);
      DocumentRepository.createDocumentsAdvanced.mockRejectedValue(
        mockRepositoryError
      );

      // Act
      const result = await DocumentService.createDocumentsAdvanced(
        mockFilePath
      );

      // Assert
      expect(result).toEqual({
        success: false,
        message: "Lỗi khi xử lý file PDF",
        error: "Bulk insert failed",
      });
    });

    it("should use custom options when provided", async () => {
      // Arrange
      const mockFilePath = "/path/to/test.pdf";
      const mockChunks = ["Test chunk"];
      const mockEmbeddingResponse = {
        data: [{ embedding: [0.1, 0.2] }],
      };
      const mockRepositoryResponse = {
        success: true,
        message: "Tạo thành công 1 documents",
        data: [],
        count: 1,
      };
      const customOptions = {
        ordered: true,
        validateBeforeSave: false,
      };

      DocumentUtil.readPdfChunks.mockResolvedValue(mockChunks);
      mockOpenAI.embeddings.create.mockResolvedValue(mockEmbeddingResponse);
      DocumentRepository.createDocumentsAdvanced.mockResolvedValue(
        mockRepositoryResponse
      );

      // Act
      const result = await DocumentService.createDocumentsAdvanced(
        mockFilePath,
        customOptions
      );

      // Assert
      expect(DocumentRepository.createDocumentsAdvanced).toHaveBeenCalledWith(
        expect.any(Array),
        {
          ordered: true,
          validateBeforeSave: false,
        }
      );
      expect(result).toEqual(mockRepositoryResponse);
    });

    it("should handle multiple chunks with different embedding responses", async () => {
      // Arrange
      const mockFilePath = "/path/to/test.pdf";
      const mockChunks = ["Chunk 1", "Chunk 2"];

      // Mock different embedding responses for each chunk
      mockOpenAI.embeddings.create
        .mockResolvedValueOnce({ data: [{ embedding: [0.1, 0.2] }] })
        .mockResolvedValueOnce({ data: [{ embedding: [0.3, 0.4] }] });

      const mockRepositoryResponse = {
        success: true,
        message: "Tạo thành công 2 documents",
        data: [],
        count: 2,
      };

      DocumentUtil.readPdfChunks.mockResolvedValue(mockChunks);
      DocumentRepository.createDocumentsAdvanced.mockResolvedValue(
        mockRepositoryResponse
      );

      // Act
      const result = await DocumentService.createDocumentsAdvanced(
        mockFilePath
      );

      // Assert
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledTimes(2);
      expect(DocumentRepository.createDocumentsAdvanced).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            text: "Chunk 1",
            embedding: [0.1, 0.2],
          }),
          expect.objectContaining({
            text: "Chunk 2",
            embedding: [0.3, 0.4],
          }),
        ]),
        expect.any(Object)
      );
      expect(result).toEqual(mockRepositoryResponse);
    });
  });
});
