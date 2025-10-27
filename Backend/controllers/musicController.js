const musicService = require("../services/musicService");

class MusicController {
  /**
   * GET /api/musics - Lấy tất cả nhạc thư giãn
   */
  async getAllMusics(req, res) {
    try {
      const musics = await musicService.getAllMusics();
      return res.status(200).json({
        success: true,
        data: musics.data,
        source: musics.source,
        message: musics.message
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi server khi lấy danh sách nhạc",
      });
    }
  }

  /**
   * GET /api/musics/search?q=keyword - Tìm kiếm nhạc
   */
  async searchMusic(req, res) {
    try {
      const { q, limit = 20 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Thiếu từ khóa tìm kiếm (query parameter 'q')"
        });
      }

      const result = await musicService.searchMusic(q, parseInt(limit));
      return res.status(200).json({
        success: true,
        data: result.data,
        source: result.source,
        query: result.query
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi tìm kiếm nhạc",
      });
    }
  }

  /**
   * GET /api/musics/mood/:mood - Lấy nhạc theo tâm trạng
   * Mood: relaxation, meditation, calm, peaceful, energetic, focus, sleep
   */
  async getMusicByMood(req, res) {
    try {
      const { mood } = req.params;
      const { limit = 20 } = req.query;

      const result = await musicService.getMusicByMood(mood, parseInt(limit));
      return res.status(200).json({
        success: true,
        data: result.data,
        source: result.source,
        mood: result.mood,
        message: result.message
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi lấy nhạc theo mood",
      });
    }
  }
}

module.exports = new MusicController();
