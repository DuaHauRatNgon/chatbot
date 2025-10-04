const musicService = require("../services/musicService");

class MusicController {
  async getAllMusics(req, res) {
    try {
      const musics = await musicService.getAllMusics();
      return res.status(200).json({
        success: true,
        data: musics,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi server khi lấy danh sách nhạc",
      });
    }
  }
}

module.exports = new MusicController();
