import { useState, useEffect, useMemo } from 'react';
import { ApiMessage } from '@/services/type';

// Emotion types theo message.js schema
export type EmotionType = 
  | 'happy' | 'excited' | 'love'        // Positive
  | 'sad' | 'depression' | 'ennui'       // Sadness/Fatigue
  | 'anxiety' | 'fear'                   // Anxiety/Fear
  | 'angry'                              // Anger
  | 'disgust'                            // Disgust
  | 'embarrassment'                      // Embarrassment
  | 'surprise' | 'neutral';              // Other

// Mapping emotion sang background image (chỉ Emotion-themed)
const EMOTION_BACKGROUND_MAP: Record<string, string> = {
  // Positive emotions
  'happy': '/src/assets/backgrounds/Io_Joy_standard2.png',
  'excited': '/src/assets/backgrounds/Io_Joy_standard2.png',
  'love': '/src/assets/backgrounds/Io_Joy_standard2.png',
  
  // Sadness/Fatigue
  'sad': '/src/assets/backgrounds/Io_Sadness_standard2.png',
  'depression': '/src/assets/backgrounds/Io_Sadness_standard2.png',
  'ennui': '/src/assets/backgrounds/Io_Ennui_standard2.png',
  
  // Anxiety/Fear
  'anxiety': '/src/assets/backgrounds/Io_Anxiety_standard2.png',
  'fear': '/src/assets/backgrounds/Io_Fear_standard2.png',
  
  // Anger
  'angry': '/src/assets/backgrounds/Io_Anger_standard2.png',
  
  // Disgust
  'disgust': '/src/assets/backgrounds/Io_Disgust_standard2.png',
  
  // Embarrassment
  'embarrassment': '/src/assets/backgrounds/Io_Embarrassment_standard2.png',
  
  // Neutral/Surprise
  'surprise': '/src/assets/backgrounds/Io_Embarrassment_standard2.png',
  'neutral': '/src/assets/backgrounds/Io_Ennui_standard2.png',
};

// Emotion weights để tính emotion chủ đạo
const EMOTION_WEIGHTS: Record<string, number> = {
  'depression': 5,    // Trầm cảm nghiêm trọng (cao nhất)
  'anxiety': 4,       // Lo âu
  'ennui': 3.5,       // Chán nản, mệt mỏi (trung bình-cao)
  'angry': 3,         // Tức giận
  'fear': 3,          // Sợ hãi
  'sad': 2,           // Buồn
  'disgust': 2,       // Ghê tởm
  'embarrassment': 2, // Xấu hổ
  'love': 1,          // Yêu thương
  'excited': 1,       // Phấn khích
  'happy': 1,         // Vui vẻ
  'surprise': 1,      // Ngạc nhiên
  'neutral': 0.5,     // Trung tính (trọng số thấp)
};

/**
 * Hook để phân tích cảm xúc chủ đạo và trả về background tương ứng
 * @param messages - Danh sách tin nhắn trong conversation
 * @param recentMessageCount - Số tin nhắn gần đây để phân tích (mặc định: 5)
 * @returns Background image URL và emotion chủ đạo
 */
export function useEmotionBackground(
  messages: ApiMessage[], 
  recentMessageCount: number = 5
) {
  const [dominantEmotion, setDominantEmotion] = useState<string>('neutral');
  const [backgroundImage, setBackgroundImage] = useState<string>(
    EMOTION_BACKGROUND_MAP['neutral']
  );

  // Tính emotion chủ đạo từ tin nhắn của user
  const analyzeDominantEmotion = useMemo(() => {
    if (!messages || messages.length === 0) {
      return 'neutral';
    }

    // Lọc chỉ lấy tin nhắn của user (không tính bot)
    const userMessages = messages
      .filter(msg => msg.sender === 'user')
      .slice(-recentMessageCount); // Lấy N tin nhắn gần nhất

    if (userMessages.length === 0) {
      return 'neutral';
    }

    // Đếm tần suất và tính trọng số của từng emotion
    const emotionScores: Record<string, number> = {};
    
    userMessages.forEach(msg => {
      const emotion = msg.emotion || 'neutral';
      const weight = EMOTION_WEIGHTS[emotion] || 1;
      
      emotionScores[emotion] = (emotionScores[emotion] || 0) + weight;
    });

    // Tìm emotion có điểm cao nhất
    let maxScore = 0;
    let dominant = 'neutral';
    
    Object.entries(emotionScores).forEach(([emotion, score]) => {
      if (score > maxScore) {
        maxScore = score;
        dominant = emotion;
      }
    });

    return dominant;
  }, [messages, recentMessageCount]);

  // Update dominant emotion và background khi messages thay đổi
  useEffect(() => {
    const newDominantEmotion = analyzeDominantEmotion;
    
    if (newDominantEmotion !== dominantEmotion) {
      setDominantEmotion(newDominantEmotion);
      
      const newBackground = EMOTION_BACKGROUND_MAP[newDominantEmotion] 
        || EMOTION_BACKGROUND_MAP['neutral'];
      
      setBackgroundImage(newBackground);
    }
  }, [analyzeDominantEmotion, dominantEmotion]);

  return {
    dominantEmotion,
    backgroundImage,
    emotionScores: useMemo(() => {
      // Tính emotion scores để có thể hiển thị chi tiết nếu cần
      const userMessages = messages
        .filter(msg => msg.sender === 'user')
        .slice(-recentMessageCount);
      
      const scores: Record<string, number> = {};
      userMessages.forEach(msg => {
        const emotion = msg.emotion || 'neutral';
        scores[emotion] = (scores[emotion] || 0) + 1;
      });
      
      return scores;
    }, [messages, recentMessageCount])
  };
}

/**
 * Utility function để lấy background URL từ emotion
 */
export function getBackgroundByEmotion(emotion: string): string {
  return EMOTION_BACKGROUND_MAP[emotion] || EMOTION_BACKGROUND_MAP['neutral'];
}

/**
 * Utility function để lấy màu theme từ emotion (dùng cho fallback)
 */
export function getThemeColorByEmotion(emotion: string): string {
  const colorMap: Record<string, string> = {
    'happy': '#FFD700',      // Vàng vui vẻ
    'excited': '#FF6B6B',    // Đỏ phấn khích
    'love': '#FF69B4',       // Hồng yêu thương
    'sad': '#4A5568',        // Xám buồn
    'depression': '#2D3748', // Xám đậm trầm cảm
    'anxiety': '#ED8936',    // Cam lo âu
    'fear': '#805AD5',       // Tím sợ hãi
    'angry': '#E53E3E',      // Đỏ tức giận
    'disgust': '#38A169',    // Xanh lá ghê tởm
    'surprise': '#D69E2E',   // Vàng ngạc nhiên
    'neutral': '#CBD5E0',    // Xám nhạt trung tính
  };
  
  return colorMap[emotion] || colorMap['neutral'];
}
