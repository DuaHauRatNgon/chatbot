const Podcast = require("../model/podcast");

class PodcastRepository {
  async getAllPodcasts() {
    try {
      const result = await Podcast.find();
      return result;
    } catch (error) {
      throw new Error(error.message || "Lỗi khi hiển thị danh sách nhạc");
    }
  }
}

module.exports = new PodcastRepository();
