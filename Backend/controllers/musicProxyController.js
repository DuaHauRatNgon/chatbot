const axios = require('axios');

/**
 * Music Proxy Controller
 * Proxy audio requests để bypass CORS restrictions
 */
class MusicProxyController {
  /**
   * GET /api/musics/stream/:trackId
   * Proxy stream nhạc từ Jamendo qua backend
   */
  async streamTrack(req, res) {
    try {
      const { trackId } = req.params;
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'Missing audio URL'
        });
      }

      console.log(`🎵 Proxying audio: ${trackId}`);
      console.log(`📡 URL: ${url}`);

      // Fetch audio từ Jamendo
      const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream',
        timeout: 30000, // 30 seconds
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // Set headers cho audio streaming
      res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 year
      
      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');

      if (response.headers['content-length']) {
        res.setHeader('Content-Length', response.headers['content-length']);
      }

      // Pipe audio stream to response
      response.data.pipe(res);

      response.data.on('error', (error) => {
        console.error('❌ Stream error:', error.message);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });

    } catch (error) {
      console.error('❌ Proxy error:', error.message);
      
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: `Lỗi khi stream nhạc: ${error.message}`
        });
      }
    }
  }

  /**
   * OPTIONS /api/musics/stream/:trackId
   * Handle preflight CORS requests
   */
  handleOptions(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
    res.status(200).end();
  }
}

module.exports = new MusicProxyController();
