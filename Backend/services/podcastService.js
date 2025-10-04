const podcastRepository = require("../repository/podcastRepository");
require("dotenv").config();

class PodcastService {
  async getAllPodcasts() {
    try {
      const baseUrl = process.env.BASE_URL || "http://localhost:5000";

      const podcasts = await podcastRepository.getAllPodcasts();

      // Clean và transform data - chỉ lấy những field cần thiết
      const transformedData = podcasts.map((item) => {
        // Lấy data từ _doc hoặc trực tiếp từ item
        const docData = item._doc || item;

        return {
          _id: docData._id,
          title: docData.title,
          duration: docData.duration,
          description: docData.description,
          file_url: `${baseUrl}/podcast/${docData.file_url}`,
        };
      });

      return {
        transformedData,
      };
    } catch (error) {
      throw new Error(error.message || "Lỗi khi lấy danh sách nhạc từ service");
    }
  }
}

module.exports = new PodcastService();
