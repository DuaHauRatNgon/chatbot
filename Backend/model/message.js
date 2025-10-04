const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation", // Tham chiếu tới bảng conversations
    required: true,
  },
  content: {
    type: String,
    required: [true, "Nội dung tin nhắn là bắt buộc"],
    trim: true,
  },
  sender: {
    type: String,
    enum: ["user", "bot"],
    required: [true, "Người gửi là bắt buộc"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  emotion: {
    type: String,
    enum: ["happy", "sad", "angry", "neutral"],
    default: "neutral",
  },
});

module.exports = mongoose.model("Message", messageSchema);
