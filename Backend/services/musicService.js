const musicRepository = require("../repository/musicRepository");
require("dotenv").config();

class MusicService {
  async getAllMusics() {
    try {
      const baseUrl = process.env.BASE_URL || "http://localhost:5000";

      const musics = await musicRepository.getAllMusics();

      // Clean và transform data - chỉ lấy những field cần thiết
      const transformedData = musics.map((item) => {
        // Lấy data từ _doc hoặc trực tiếp từ item
        const docData = item._doc || item;

        return {
          _id: docData._id,
          title: docData.title,
          duration: docData.duration,
          file_url: `${baseUrl}/music/${docData.file_url}`,
        };
      });

      return {
        data: transformedData,
      };
    } catch (error) {
      throw new Error(error.message || "Lỗi khi lấy danh sách nhạc từ service");
    }
  }
}

module.exports = new MusicService();
