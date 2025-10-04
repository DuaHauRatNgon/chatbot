const Document = require("../model/document");

class DocumentRepository {
  async createDocument(documentData) {
    try {
      const newDocument = new Document(documentData);
      const savedDocument = await newDocument.save();
      return {
        success: true,
        message: "Tạo document thành công",
        data: savedDocument,
      };
    } catch (error) {
      return {
        success: false,
        message: "Lỗi khi thêm dữ liệu vào document",
        error: error.message,
      };
    }
  }

  async createDocumentsAdvanced(documentsData, defaultOptions) {
    try {
      const newDocuments = await Document.insertMany(
        documentsData,
        defaultOptions
      );
      return {
        success: true,
        message: `Tạo thành công ${newDocuments.length} documents`,
        data: newDocuments,
        count: newDocuments.length,
      };
    } catch (error) {
      if (error.name === "BulkWriteError") {
        const successCount = error.result.insertedCount || 0;
        const failedCount = error.writeErrors?.length || 0;
        return {
          success: false,
          message: `Tạo được ${successCount} documents, ${failedCount} documents bị lỗi`,
          successCount,
          failedCount,
          errors: error.writeErrors,
        };
      }
      return {
        success: false,
        message: "Lỗi khi tạo nhiều documents",
        error: error.message,
      };
    }
  }
  async getAllDocuments() {
    try {
      const result = await Document.find({}, { text: 1, embedding: 1 });
      if (!result) {
        return {
          success: false,
          message: "Không có dữ liệu",
          data: result,
        };
      }

      return {
        success: true,
        message: "Lấy dữ liệu thành công",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: "Lỗi Server",
        data: null,
      };
    }
  }
}

module.exports = new DocumentRepository();
