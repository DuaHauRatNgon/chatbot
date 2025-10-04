const DocumentService = require("../services/documentService");
const fs = require("fs").promises;

class DocumentController {
  async createDocument(req, res) {
    try {
      const documentData = req.body;
      if (!documentData || Object.keys(documentData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Dữ liệu document không được để trống",
        });
      }

      const result = await DocumentService.createDocument(documentData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }

  async createDocumentsAdvanced(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng upload file PDF",
        });
      }

      const filePath = req.file.path;
      const options = req.body.options ? JSON.parse(req.body.options) : {};

      const result = await DocumentService.createDocumentsAdvanced(
        filePath,
        options
      );

      // Xóa file tạm sau khi xử lý
      await fs.unlink(filePath);

      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      // Xóa file tạm nếu có lỗi
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }
}

module.exports = new DocumentController();
