const Message = require("../model/message");
const Conversation = require("../model/conversation");

// Mapping emotion từ database sang valence/arousal coordinates - SPREAD OUT VERSION
// valence: -1 (tiêu cực) đến +1 (tích cực)
// arousal: 0 (yếu) đến 1 (mạnh)
const EMOTION_COORDINATES = {
  // Positive emotions - Spread across positive quadrant
  happy: { valence: 0.65, arousal: 0.45, color: '#8BC34A', group: 'Positive', intensity: 70 },
  excited: { valence: 0.8, arousal: 0.8, color: '#FF6B35', group: 'Positive', intensity: 90 },
  love: { valence: 0.75, arousal: 0.35, color: '#E91E63', group: 'Positive', intensity: 75 },
  surprise: { valence: 0.55, arousal: 0.65, color: '#03A9F4', group: 'Positive', intensity: 65 },
  
  // Negative emotions - Low arousal - Spread vertically
  sad: { valence: -0.55, arousal: 0.25, color: '#4A90E2', group: 'Negative', intensity: 60 },
  ennui: { valence: -0.35, arousal: 0.15, color: '#78909C', group: 'Negative', intensity: 50 },
  depression: { valence: -0.8, arousal: 0.4, color: '#1E3A8A', group: 'Negative', intensity: 85 },
  disgust: { valence: -0.65, arousal: 0.35, color: '#2E7D32', group: 'Negative', intensity: 65 },
  embarrassment: { valence: -0.4, arousal: 0.3, color: '#D84315', group: 'Negative', intensity: 55 },
  
  // Negative emotions - High arousal - Spread both axes
  anxiety: { valence: -0.45, arousal: 0.7, color: '#9C27B0', group: 'Negative', intensity: 75 },
  fear: { valence: -0.6, arousal: 0.8, color: '#6A1B9A', group: 'Negative', intensity: 80 },
  angry: { valence: -0.75, arousal: 0.75, color: '#E74C3C', group: 'Negative', intensity: 85 },
  
  // Neutral - Center-left, low arousal
  neutral: { valence: -0.05, arousal: 0.2, color: '#9E9E9E', group: 'Neutral', intensity: 30 },
};

// Thêm jitter ngẫu nhiên lớn để giãn các điểm ra nhiều hơn
const addJitter = (value, range = 0.1) => {
  return value + (Math.random() - 0.5) * range;
};

// Seeded random dựa trên message ID để giữ consistent
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

class EmotionAnalysisService {
  async getEmotionAnalysis(userId) {
    try {
      // 1. Tìm tất cả conversations của user
      const conversations = await Conversation.find({ user_id: userId });
      const conversationIds = conversations.map(conv => conv._id);

      if (conversationIds.length === 0) {
        return {
          success: true,
          data: {
            emotions: [],
            stats: {
              totalMessages: 0,
              positivePercent: 0,
              negativePercent: 0,
              neutralPercent: 0,
              avgIntensity: 0,
            },
          },
        };
      }

      // 2. Fetch TẤT CẢ messages từ user có emotion (bao gồm cả neutral)
      console.log('Fetching messages for conversations:', conversationIds.length);
      
      const messages = await Message.find({
        conversation_id: { $in: conversationIds },
        sender: 'user',
      })
      .sort({ timestamp: -1 });
      
      console.log('Total messages found:', messages.length);

      // 4. Map messages sang emotion points cho biểu đồ với jitter lớn
      const emotionPoints = messages.map((msg, index) => {
        const emotionData = EMOTION_COORDINATES[msg.emotion] || EMOTION_COORDINATES.neutral;
        
        // Sử dụng seeded random dựa trên message ID để consistent
        const seed = parseInt(msg._id.toString().substring(0, 8), 16);
        const jitterX = (seededRandom(seed) - 0.5) * 0.35; // Range: -0.175 to +0.175
        const jitterY = (seededRandom(seed + 1000) - 0.5) * 0.25; // Range: -0.125 to +0.125
        
        return {
          id: msg._id.toString(),
          emotion: msg.emotion,
          name: this.getEmotionName(msg.emotion),
          message: msg.content.substring(0, 200),
          timestamp: msg.timestamp,
          // Thêm jitter lớn để giãn các điểm ra nhiều
          x: Math.max(-0.98, Math.min(0.98, emotionData.valence + jitterX)),
          y: Math.max(0.05, Math.min(0.95, emotionData.arousal + jitterY)),
          valence: emotionData.valence,
          arousal: emotionData.arousal,
          color: emotionData.color,
          group: emotionData.group,
          intensity: emotionData.intensity,
        };
      });

      // 5. Tính toán statistics
      const stats = this.calculateStats(emotionPoints);

      return {
        success: true,
        data: {
          emotions: emotionPoints,
          stats,
        },
      };

    } catch (error) {
      console.error("Error in getEmotionAnalysis service:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy emotion analysis",
      };
    }
  }

  // Helper: Lấy tên tiếng Việt của emotion
  getEmotionName(emotion) {
    const names = {
      happy: 'Vui vẻ',
      excited: 'Phấn khích',
      love: 'Yêu thương',
      sad: 'Buồn bã',
      depression: 'Trầm cảm',
      ennui: 'Chán nản',
      anxiety: 'Lo âu',
      fear: 'Sợ hãi',
      angry: 'Tức giận',
      disgust: 'Ghê tởm',
      embarrassment: 'Xấu hổ',
      surprise: 'Ngạc nhiên',
      neutral: 'Bình thường',
    };
    return names[emotion] || emotion;
  }

  // Helper: Tính toán thống kê
  calculateStats(emotionPoints) {
    if (emotionPoints.length === 0) {
      return {
        totalMessages: 0,
        positivePercent: 0,
        negativePercent: 0,
        neutralPercent: 0,
        avgIntensity: 0,
      };
    }

    const positive = emotionPoints.filter(e => e.group === 'Positive').length;
    const negative = emotionPoints.filter(e => e.group === 'Negative').length;
    const neutral = emotionPoints.filter(e => e.group === 'Neutral').length;
    const total = emotionPoints.length;

    const avgIntensity = emotionPoints.reduce((sum, e) => sum + e.intensity, 0) / total;

    return {
      totalMessages: total,
      positivePercent: Math.round((positive / total) * 100),
      negativePercent: Math.round((negative / total) * 100),
      neutralPercent: Math.round((neutral / total) * 100),
      avgIntensity: Math.round(avgIntensity),
    };
  }
}

module.exports = new EmotionAnalysisService();
