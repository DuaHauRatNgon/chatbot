const podcastService = require("../services/podcastService");

class PodcastController {
  async getAllPodcasts(req, res) {
    try {
      const podcasts = await podcastService.getAllPodcasts();
      return res.status(200).json({
        success: true,
        data: podcasts,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi server khi lấy danh sách nhạc",
      });
    }
  }
}

module.exports = new PodcastController();
