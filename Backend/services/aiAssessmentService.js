const axios = require('axios');

class AIAssessmentService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  /**
   * Phân tích toàn bộ cuộc trò chuyện để đánh giá tình trạng tâm lý
   * @param {Array} messages - Mảng tin nhắn trong cuộc trò chuyện
   * @param {string} conversationId - ID cuộc trò chuyện
   * @returns {Object} Kết quả phân tích AI
   */
  async analyzeConversationForAssessment(messages, conversationId) {
    try {
      console.log(`[AI DEBUG] Starting analysis for conversation ${conversationId}`);
      console.log(`[AI DEBUG] Total messages: ${messages.length}`);
      
      // Lấy tin nhắn của user (bỏ qua tin nhắn bot)
      const userMessages = messages
        .filter(msg => msg.sender === 'user' || msg.role === 'user')
        .map(msg => msg.content || msg.message)
        .join('\n');

      console.log(`[AI DEBUG] User messages length: ${userMessages.length}`);
      console.log(`[AI DEBUG] User messages preview: ${userMessages.substring(0, 200)}...`);

      if (userMessages.length < 30) {
        console.log(`[AI DEBUG] Not enough user content (${userMessages.length} < 30)`);
        return { 
          shouldTrigger: false, 
          reason: "Chưa đủ thông tin để đánh giá" 
        };
      }

      const analysisPrompt = this.buildAnalysisPrompt(userMessages);
      console.log(`[AI DEBUG] Analysis prompt length: ${analysisPrompt.length}`);
      
      const aiResponse = await this.callOpenAI(analysisPrompt);
      console.log(`[AI DEBUG] AI Response: ${aiResponse.substring(0, 500)}...`);
      
      const result = this.parseAIResponse(aiResponse);
      console.log(`[AI DEBUG] Parsed result:`, result);
      
      return result;
    } catch (error) {
      console.error('Lỗi AI analysis:', error);
      console.error('Stack trace:', error.stack);
      return { 
        shouldTrigger: false, 
        reason: "Lỗi phân tích AI: " + error.message 
      };
    }
  }

  /**
   * Xây dựng prompt cho AI phân tích
   */
  buildAnalysisPrompt(userMessages) {
    return `Bạn là một chuyên gia tâm lý học có kinh nghiệm. Hãy phân tích đoạn hội thoại sau để đánh giá tình trạng tâm lý của người dùng.

ĐOẠN HỘI THOẠI:
${userMessages}

Hãy phân tích và trả về kết quả theo format JSON sau:
{
  "shouldTriggerAssessment": true/false,
  "confidence": 0.0-1.0,
  "primaryConcern": "anxiety|depression|stress|mixed|none",
  "severity": "mild|moderate|severe",
  "reasoning": "Lý do chi tiết cho quyết định",
  "recommendedScale": "GAD-7|PHQ-9|PSS|none",
  "keyIndicators": ["dấu hiệu 1", "dấu hiệu 2", ...],
  "urgency": "low|medium|high"
}

Các tiêu chí đánh giá:
1. ANXIETY (Lo âu): Lo lắng quá mức, bồn chồn, sợ hãi, khó thư giãn
2. DEPRESSION (Trầm cảm): Buồn bã, mất hứng thú, tuyệt vọng, mệt mỏi
3. STRESS (Căng thẳng): Áp lực, quá tải, khó tập trung, căng thẳng

Chỉ trigger assessment khi:
- Confidence >= 0.7
- Có ít nhất 3 key indicators
- Severity >= mild
- Urgency >= medium

Trả về JSON hợp lệ:`;
  }

  /**
   * Gọi OpenAI API
   */
  async callOpenAI(prompt) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "Bạn là chuyên gia tâm lý học. Trả về kết quả phân tích dưới dạng JSON hợp lệ."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Parse response từ AI
   */
  parseAIResponse(aiResponse) {
    try {
      // Tìm JSON trong response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Không tìm thấy JSON trong response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        shouldTrigger: parsed.shouldTriggerAssessment && parsed.confidence >= 0.7,
        confidence: parsed.confidence || 0,
        primaryConcern: parsed.primaryConcern || 'none',
        severity: parsed.severity || 'mild',
        reasoning: parsed.reasoning || '',
        recommendedScale: parsed.recommendedScale || 'none',
        keyIndicators: parsed.keyIndicators || [],
        urgency: parsed.urgency || 'low'
      };
    } catch (error) {
      console.error('Lỗi parse AI response:', error);
      return {
        shouldTrigger: false,
        reason: "Lỗi phân tích response AI"
      };
    }
  }

  /**
   * Tạo khuyến nghị cá nhân hóa dựa trên AI
   */
  async generatePersonalizedRecommendations(assessmentResult, userProfile = {}) {
    try {
      const prompt = this.buildRecommendationPrompt(assessmentResult, userProfile);
      const aiResponse = await this.callOpenAI(prompt);
      
      return this.parseRecommendationResponse(aiResponse);
    } catch (error) {
      console.error('Lỗi tạo khuyến nghị:', error);
      return this.getFallbackRecommendations(assessmentResult);
    }
  }

  buildRecommendationPrompt(assessmentResult, userProfile) {
    return `Bạn là chuyên gia tâm lý học. Hãy tạo khuyến nghị cá nhân hóa dựa trên kết quả assessment.

THÔNG TIN ASSESSMENT:
- Thang đo: ${assessmentResult.scaleType}
- Điểm số: ${assessmentResult.totalScore}
- Mức độ: ${assessmentResult.interpretation}
- Lo ngại chính: ${assessmentResult.primaryConcern || 'Không xác định'}
- Mức độ nghiêm trọng: ${assessmentResult.severity || 'mild'}

THÔNG TIN NGƯỜI DÙNG:
- Tuổi: ${userProfile.age || 'Không xác định'}
- Giới tính: ${userProfile.gender || 'Không xác định'}
- Nghề nghiệp: ${userProfile.occupation || 'Không xác định'}

Hãy tạo khuyến nghị theo format JSON:
{
  "immediateActions": ["hành động ngay lập tức 1", "hành động ngay lập tức 2"],
  "dailyPractices": ["thực hành hàng ngày 1", "thực hành hàng ngày 2"],
  "professionalHelp": {
    "needed": true/false,
    "urgency": "low|medium|high",
    "recommendations": ["khuyến nghị chuyên môn 1", "khuyến nghị chuyên môn 2"]
  },
  "resources": ["tài nguyên 1", "tài nguyên 2"],
  "followUp": {
    "timeline": "1 tuần|2 tuần|1 tháng",
    "actions": ["hành động theo dõi 1", "hành động theo dõi 2"]
  }
}

Trả về JSON hợp lệ:`;
  }

  parseRecommendationResponse(aiResponse) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Không tìm thấy JSON trong response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Lỗi parse recommendation:', error);
      return this.getFallbackRecommendations();
    }
  }

  getFallbackRecommendations(assessmentResult = {}) {
    return {
      immediateActions: [
        "Thực hành hít thở sâu 5-10 phút",
        "Tìm một hoạt động thư giãn yêu thích"
      ],
      dailyPractices: [
        "Duy trì thời gian biểu đều đặn",
        "Tập thể dục nhẹ nhàng 30 phút/ngày"
      ],
      professionalHelp: {
        needed: assessmentResult.severity === 'severe',
        urgency: assessmentResult.severity === 'severe' ? 'high' : 'medium',
        recommendations: ["Tham khảo ý kiến chuyên gia tâm lý"]
      },
      resources: [
        "Đường dây nóng tâm lý: 1900 599 978",
        "Tài liệu tự giúp đỡ về sức khỏe tâm lý"
      ],
      followUp: {
        timeline: "1 tuần",
        actions: ["Theo dõi tình trạng và đánh giá lại"]
      }
    };
  }

  /**
   * Phân tích xu hướng theo thời gian
   */
  async analyzeTrends(userId) {
    // TODO: Implement trend analysis
    // Phân tích các assessment trước đó để xem xu hướng cải thiện/xấu đi
    return {
      trend: 'stable', // improving, declining, stable
      confidence: 0.8,
      insights: ['Xu hướng ổn định trong 3 tháng qua']
    };
  }
}

module.exports = new AIAssessmentService();
