const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Tăng thời gian timeout lên 30 giây
      socketTimeoutMS: 45000, // Tăng thời gian timeout của socket
      connectTimeoutMS: 10000, // Thời gian kết nối tối đa
    });
  } catch (error) {
    process.exit(1); // Kết thúc ứng dụng nếu không kết nối được
  }
};

module.exports = connectDB;
