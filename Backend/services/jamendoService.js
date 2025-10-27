const axios = require('axios');

/**
 * Jamendo Music API Service
 * Tích hợp API âm nhạc miễn phí từ Jamendo
 * 
 * Docs: https://developer.jamendo.com/v3.0
 * Free tier: 100,000 requests/month
 */

class JamendoService {
  constructor() {
    // Free API client ID - đăng ký tại: https://devportal.jamendo.com/
    this.clientId = process.env.JAMENDO_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
    this.baseUrl = 'https://api.jamendo.com/v3.0';
    
    // Thể loại phù hợp cho tham vấn tâm lý
    this.relaxingGenres = [
      'ambient',
      'chillout', 
      'meditation',
      'relaxation',
      'classical',
      'instrumental',
      'piano',
      'acoustic'
    ];
  }

  /**
   * Lấy danh sách nhạc thư giãn từ Jamendo
   * @param {Object} options - Tùy chọn query
   * @returns {Promise<Array>} Danh sách tracks
   */
  async getRelaxingTracks(options = {}) {
    try {
      const {
        limit = 30, // Fetch nhiều hơn vì sẽ filter out một số tracks
        tags = 'relaxation',  // relaxation, meditation, calm, peaceful
        offset = 0,
        include = 'musicinfo',
        imagesize = 200
      } = options;

      const params = {
        client_id: this.clientId,
        format: 'json',
        limit,
        tags,
        offset,
        include,
        imagesize,
        audioformat: 'mp32', // MP3 128kbps
        audiodlformat: 'mp32',
        audiodownload: 1, // Enable download URLs (permanent, không hết hạn)
        order: 'popularity_total' // Sắp xếp theo độ phổ biến
      };

      const response = await axios.get(`${this.baseUrl}/tracks/`, { params });
      
      if (!response.data || !response.data.results) {
        throw new Error('Invalid response from Jamendo API');
      }

      // Transform data sang format của app
      return this.transformTracks(response.data.results);
    } catch (error) {
      console.error('Jamendo API Error:', error.message);
      
      // Fallback với playlist mặc định
      if (error.response?.status === 401) {
        throw new Error('Jamendo API key không hợp lệ. Vui lòng cập nhật JAMENDO_CLIENT_ID trong .env');
      }
      
      throw new Error(`Lỗi khi tải nhạc từ Jamendo: ${error.message}`);
    }
  }

  /**
   * Lấy nhạc theo playlist ID
   * @param {string} playlistId - ID của playlist
   * @returns {Promise<Array>} Danh sách tracks
   */
  async getPlaylist(playlistId) {
    try {
      const params = {
        client_id: this.clientId,
        format: 'json',
        id: playlistId,
        include: 'tracks',
        audioformat: 'mp32'
      };

      const response = await axios.get(`${this.baseUrl}/playlists/tracks/`, { params });
      
      if (!response.data || !response.data.results) {
        throw new Error('Playlist không tồn tại');
      }

      return this.transformTracks(response.data.results);
    } catch (error) {
      console.error('Jamendo Playlist Error:', error.message);
      throw new Error(`Lỗi khi tải playlist: ${error.message}`);
    }
  }

  /**
   * Search tracks theo từ khóa
   * @param {string} query - Từ khóa tìm kiếm
   * @param {number} limit - Số lượng kết quả
   * @returns {Promise<Array>} Danh sách tracks
   */
  async searchTracks(query, limit = 20) {
    try {
      const params = {
        client_id: this.clientId,
        format: 'json',
        namesearch: query,
        limit,
        audioformat: 'mp32',
        imagesize: 200
      };

      const response = await axios.get(`${this.baseUrl}/tracks/`, { params });
      
      if (!response.data || !response.data.results) {
        return [];
      }

      return this.transformTracks(response.data.results);
    } catch (error) {
      console.error('Jamendo Search Error:', error.message);
      return [];
    }
  }

  /**
   * Transform Jamendo track data sang format của app
   * @param {Array} tracks - Danh sách tracks từ Jamendo
   * @returns {Array} Transformed tracks
   */
  transformTracks(tracks) {
    const validTracks = [];
    
    for (const track of tracks) {
      // Priority: audiodownload > audiodownload_allowed
      // CHỈ LẤY tracks có download URL (permanent, không hết hạn)
      const audioUrl = track.audiodownload || track.audiodownload_allowed;
      
      // Skip tracks không có download URL (những track có license không cho download)
      if (!audioUrl || audioUrl.includes('?trackid=') || audioUrl.includes('&from=')) {
        console.log(`⏭️  Skip track ${track.id}: ${track.name} (no download URL)`);
        continue;
      }
      
      console.log(`✅ Track ${track.id}: ${track.name}`);
      console.log(`   Audio URL: ${audioUrl}`);
      
      validTracks.push({
        _id: `jamendo_${track.id}`,
        title: track.name,
        artist: track.artist_name,
        duration: this.formatDuration(track.duration),
        file_url: audioUrl,
        stream_url: audioUrl,
        image: track.image || track.album_image,
        album: track.album_name,
        license: track.license_ccurl,
        source: 'jamendo',
        // Metadata bổ sung
        popularity: track.popularity,
        releasedate: track.releasedate,
        tags: track.musicinfo?.tags?.genres?.join(', ') || ''
      });
    }
    
    return validTracks;
  }

  /**
   * Format duration từ seconds sang mm:ss
   * @param {number} seconds - Thời lượng (giây)
   * @returns {string} Format mm:ss
   */
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Lấy các playlist thư giãn được đề xuất
   * @returns {Array} Danh sách playlist IDs
   */
  getRecommendedPlaylists() {
    return [
      // Các playlist public phổ biến cho thư giãn
      // Cần test và cập nhật playlist IDs thực tế
      {
        id: '500042562',
        name: 'Relaxation & Meditation',
        description: 'Nhạc thư giãn và thiền định'
      },
      {
        id: '500042563', 
        name: 'Peaceful Piano',
        description: 'Piano êm dịu'
      }
    ];
  }

  /**
   * Get curated relaxation playlist
   * @returns {Promise<Array>} Danh sách tracks (ít nhất 20 tracks hợp lệ)
   */
  async getCuratedRelaxationPlaylist() {
    try {
      // Lấy tracks với tags phù hợp cho tham vấn tâm lý
      const tags = ['relaxation', 'meditation', 'calm', 'peaceful'];
      const randomTag = tags[Math.floor(Math.random() * tags.length)];
      
      // Fetch 40 tracks để đảm bảo có ít nhất 20 tracks hợp lệ sau khi filter
      const tracks = await this.getRelaxingTracks({
        limit: 40,
        tags: randomTag
      });
      
      console.log(`📊 Got ${tracks.length} valid tracks (after filtering)`);
      
      // Return tối đa 20 tracks
      return tracks.slice(0, 20);
    } catch (error) {
      console.error('Error getting curated playlist:', error);
      throw error;
    }
  }
}

module.exports = new JamendoService();
