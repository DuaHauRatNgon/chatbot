const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  embedding: {
    type: String,
    required: true,
  },
  metadata: {
    sourceFile: String, // tên hoặc đường dẫn file
    chunkSize: Number, // độ dài đoạn text
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
});

module.exports = mongoose.model("Document", DocumentSchema);
