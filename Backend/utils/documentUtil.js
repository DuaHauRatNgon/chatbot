const fs = require("fs");
const pdfParse = require("pdf-parse");

class DocumentUtil {
  async readPdfChunks(filePath, maxChunkSize = 500) {
    if (!fs.existsSync(filePath)) {
      throw new Error("File không tồn tại");
    }

    if (!filePath.toLowerCase().endsWith(".pdf")) {
      throw new Error("Chỉ hỗ trợ định dạng PDF");
    }

    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const rawText = data.text;

    if (!rawText || rawText.trim().length < 10) {
      throw new Error("Không thể đọc được nội dung từ file PDF");
    }

    // B1: Chuẩn hóa văn bản
    const cleanText = this.cleanText(rawText);

    // B2: Chia đoạn thông minh theo câu
    const chunks = this.smartChunk(cleanText, maxChunkSize);

    return chunks;
  }

  cleanText(text) {
    return text
      .replace(/[•▪️·]/g, "-") // bullet thành dấu gạch
      .replace(/\n{2,}/g, "\n") // nhiều dòng trắng → 1
      .replace(/[ \t]{2,}/g, " ") // khoảng trắng dư
      .replace(/\n/g, " ") // loại bỏ xuống dòng lẻ
      .replace(/\s{2,}/g, " ") // khoảng trắng > 2
      .trim();
  }

  smartChunk(text, maxLen = 500) {
    const sentences = text.split(/(?<=[.?!])\s+/); // tách theo câu
    const chunks = [];
    let current = "";

    for (const sentence of sentences) {
      if ((current + sentence).length <= maxLen) {
        current += sentence + " ";
      } else {
        if (current.trim()) chunks.push(current.trim());
        current = sentence + " ";
      }
    }

    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }
}

module.exports = new DocumentUtil();
