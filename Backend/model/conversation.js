const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Liên kết với bảng users
    required: true,
  },
  title: {
    type: String,
    required: [true, "Tiêu đề cuộc trò chuyện là bắt buộc"],
    maxlength: [200, "Tiêu đề không được dài quá 200 ký tự"],
    trim: true,
  },
  // tâm trạng trước và sau (1=rất tệ, 10=rất tốt)
  mood_before: {
    type: Number,
    min: [1, "Giá trị tâm trạng phải từ 1 đến 10"],
    max: [10, "Giá trị tâm trạng phải từ 1 đến 10"],
    required: [true, "Tâm trạng trước khi chat là bắt buộc"],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Conversation", conversationSchema);
