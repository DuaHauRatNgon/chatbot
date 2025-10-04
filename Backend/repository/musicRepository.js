const Music = require("../model/music");

class MusicRepository {
  async getAllMusics() {
    try {
      const result = await Music.find();
      return result;
    } catch (error) {
      throw new Error(error.message || "Lỗi khi hiển thị danh sách nhạc");
    }
  }
}

module.exports = new MusicRepository();
