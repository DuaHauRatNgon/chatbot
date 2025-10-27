const musicRepository = require("../repository/musicRepository");
const jamendoService = require("./jamendoService");
require("dotenv").config();

class MusicService {
  /**
   * Lấy danh sách nhạc - Sử dụng Jamendo API thay vì local files
   * Fallback về local files nếu API không khả dụng
   */
  async getAllMusics() {
    try {
      // Option 1: Sử dụng Jamendo API (mặc định)
      if (process.env.USE_JAMENDO_API !== 'false') {
        try {
          console.log('🎵 Fetching music from Jamendo API...');
          const tracks = await jamendoService.getCuratedRelaxationPlaylist();
          
          // Jamendo blocks hotlinking - use proxy endpoint
          const baseUrl = process.env.BASE_URL || "http://localhost:5000";
          const tracksWithProxy = tracks.map(track => {
            // Extract track ID from download URL
            const trackId = track._id.replace('jamendo_', '');
            const originalUrl = encodeURIComponent(track.file_url);
            
            return {
              ...track,
              file_url: `${baseUrl}/api/musics/stream/${trackId}?url=${originalUrl}`,
              stream_url: `${baseUrl}/api/musics/stream/${trackId}?url=${originalUrl}`,
              original_url: track.file_url
            };
          });
          
          console.log(`✅ Loaded ${tracksWithProxy.length} tracks from Jamendo (via proxy)`);
          
          return {
            data: tracksWithProxy,
            source: 'jamendo',
            message: 'Nhạc từ Jamendo API (via proxy)'
          };
        } catch (apiError) {
          console.warn('⚠️ Jamendo API error, falling back to local files:', apiError.message);
          // Fall through to local files
        }
      }

      // Option 2: Fallback - Sử dụng local files
      console.log('🎵 Using local music files...');
      const baseUrl = process.env.BASE_URL || "http://localhost:5000";
      const musics = await musicRepository.getAllMusics();

      // Clean và transform data - chỉ lấy những field cần thiết
      const transformedData = musics.map((item) => {
        // Lấy data từ _doc hoặc trực tiếp từ item
        const docData = item._doc || item;

        return {
          _id: docData._id,
          title: docData.title,
          artist: 'Local Artist', // Thêm artist field
          duration: docData.duration,
          file_url: `${baseUrl}/music/${docData.file_url}`,
          stream_url: `${baseUrl}/music/${docData.file_url}`,
          source: 'local'
        };
      });

      return {
        data: transformedData,
        source: 'local',
        message: 'Nhạc từ thư viện local'
      };
    } catch (error) {
      throw new Error(error.message || "Lỗi khi lấy danh sách nhạc từ service");
    }
  }

  /**
   * Tìm kiếm nhạc theo từ khóa (chỉ hoạt động với Jamendo API)
   */
  async searchMusic(query, limit = 20) {
    try {
      if (process.env.USE_JAMENDO_API === 'false') {
        throw new Error('Search không khả dụng với local files');
      }

      const tracks = await jamendoService.searchTracks(query, limit);
      return {
        data: tracks,
        source: 'jamendo',
        query
      };
    } catch (error) {
      throw new Error(`Lỗi khi tìm kiếm nhạc: ${error.message}`);
    }
  }

  /**
   * Lấy nhạc theo tags/mood (Jamendo API)
   */
  async getMusicByMood(mood = 'relaxation', limit = 20) {
    try {
      if (process.env.USE_JAMENDO_API === 'false') {
        // Fallback về getAllMusics cho local
        return await this.getAllMusics();
      }

      const moodTags = {
        relaxation: 'relaxation',
        meditation: 'meditation',
        calm: 'calm',
        peaceful: 'peaceful',
        energetic: 'energetic',
        focus: 'concentration',
        sleep: 'sleep'
      };

      const tag = moodTags[mood] || 'relaxation';
      const tracks = await jamendoService.getRelaxingTracks({ tags: tag, limit });
      
      return {
        data: tracks,
        source: 'jamendo',
        mood,
        message: `Nhạc phù hợp với tâm trạng: ${mood}`
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy nhạc theo mood: ${error.message}`);
    }
  }
}

module.exports = new MusicService();
