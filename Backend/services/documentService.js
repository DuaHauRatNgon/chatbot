const DocumentRepository = require("../repository/documentRepository");
const DocumentUtil = require("../utils/documentUtil");
require("dotenv").config();

const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class DocumentService {
  async createDocument(documentData) {
    try {
      if (
        !documentData ||
        typeof documentData !== "object" ||
        typeof documentData.text !== "string"
      ) {
        return {
          success: false,
          message: "Dữ liệu document không hợp lệ. Cần có trường 'text'.",
        };
      }

      // Tạo embedding từ đoạn text
      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: documentData.text,
      });

      // Tạo object để lưu
      const docToSave = {
        text: documentData.text,
        embedding: embeddingRes.data[0].embedding,
        metadata: {
          sourceFile: "text_input",
          chunkSize: documentData.text.length,
          createdAt: new Date(),
        },
      };

      const result = await DocumentRepository.createDocument(docToSave);
      return result;
    } catch (error) {
      return {
        success: false,
        message: "Lỗi server khi tạo document",
        error: error.message,
      };
    }
  }

  async createDocumentsAdvanced(fileDocument, options = {}) {
    try {
      if (!fileDocument || typeof fileDocument !== "string") {
        return {
          success: false,
          message: "Đường dẫn file PDF không hợp lệ",
        };
      }

      // Đọc và chia PDF thành chunks
      const chunks = await DocumentUtil.readPdfChunks(fileDocument, 500);
      if (!chunks.length) {
        return {
          success: false,
          message: "Không thể trích xuất nội dung từ PDF",
        };
      }

      // Ánh xạ chunks thành documents
      // Tạo embeddings đồng thời cho từng chunk
      const documentsData = await Promise.all(
        chunks.map(async (chunk) => {
          const embeddingRes = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: chunk,
          });

          return {
            text: chunk,
            embedding: embeddingRes.data[0].embedding,
            metadata: {
              sourceFile: fileDocument,
              chunkSize: chunk.length,
              createdAt: new Date(),
            },
          };
        })
      );
      // Các options mặc định
      const defaultOptions = {
        ordered: false,
        validateBeforeSave: true,
        ...options,
      };

      const result = await DocumentRepository.createDocumentsAdvanced(
        documentsData,
        defaultOptions
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: "Lỗi khi xử lý file PDF",
        error: error.message,
      };
    }
  }
}

module.exports = new DocumentService();
