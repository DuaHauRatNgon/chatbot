const mongoose = require("mongoose");

// Schema cho bảng users
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Tên là bắt buộc"],
    trim: true,
    maxlength: [100, "Tên không được quá 100 ký tự"],
  },
  email: {
    type: String,
    required: [true, "Email là bắt buộc"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Email không hợp lệ",
    ],
  },
  hashedPassword: {
    type: String,
    required: [true, "Mật khẩu là bắt buộc"],
    minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    default: "male",
  },
  role: {
    type: String,
    enum: ["admin", "customer"],
    default: "customer",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});
// Chỉ tạo model nếu chưa được định nghĩa
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
