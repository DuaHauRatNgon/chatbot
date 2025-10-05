const mongoose = require("mongoose");

// Schema cho bảng quotes
const quoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Nội dung quote là bắt buộc"],
    trim: true,
    maxlength: [500, "Quote không được quá 500 ký tự"],
  },
  author: {
    type: String,
    required: [true, "Tác giả là bắt buộc"],
    trim: true,
    maxlength: [100, "Tên tác giả không được quá 100 ký tự"],
  },
  category: {
    type: String,
    enum: ["motivation", "success", "life", "love", "wisdom", "inspiration"],
    default: "motivation",
  },
  language: {
    type: String,
    enum: ["vi", "en"],
    default: "vi",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Schema cho cài đặt email hàng ngày của user
const userEmailSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  isDailyQuotesEnabled: {
    type: Boolean,
    default: true,
  },
  preferredTime: {
    type: String,
    default: "08:00", // Giờ gửi email mặc định (24h format)
  },
  preferredLanguage: {
    type: String,
    enum: ["vi", "en"],
    default: "vi",
  },
  preferredCategories: [{
    type: String,
    enum: ["motivation", "success", "life", "love", "wisdom", "inspiration"],
  }],
  lastSentDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Schema cho lịch sử gửi email
const emailHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  quoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote',
    required: true,
  },
  emailType: {
    type: String,
    enum: ["daily_quote", "welcome", "custom"],
    default: "daily_quote",
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["sent", "failed", "pending"],
    default: "sent",
  },
  messageId: {
    type: String,
    default: null,
  },
});

// Chỉ tạo model nếu chưa được định nghĩa
const Quote = mongoose.models.Quote || mongoose.model("Quote", quoteSchema);
const UserEmailSettings = mongoose.models.UserEmailSettings || mongoose.model("UserEmailSettings", userEmailSettingsSchema);
const EmailHistory = mongoose.models.EmailHistory || mongoose.model("EmailHistory", emailHistorySchema);

module.exports = { Quote, UserEmailSettings, EmailHistory };
