import { Assessment } from '@/interfaces/interfaces';
import { mockAIApiCall } from './mockAIApi';

// Interface cho AI analysis
interface AIAnalysisRequest {
  scaleType: string;
  questions: string[];
  answers: number[];
  totalScore: number;
  interpretation: string;
  userContext?: {
    age?: number;
    gender?: string;
    previousAssessments?: any[];
  };
}

interface AIRecommendationsResponse {
  immediateActions: string[];
  dailyPractices: string[];
  professionalHelp: {
    needed: boolean;
    urgency: string;
    recommendations: string[];
  };
  resources: string[];
  followUp: {
    timeline: string;
    actions: string[];
  };
  reasoning: string;
  confidence: number;
}

// Mapping câu hỏi cho các thang đo
const SCALE_QUESTIONS = {
  'GAD-7': [
    'Cảm thấy lo lắng, bồn chồn hoặc căng thẳng',
    'Không thể ngừng lo lắng hoặc kiểm soát được sự lo lắng',
    'Lo lắng quá nhiều về những điều khác nhau',
    'Khó thư giãn',
    'Bồn chồn đến mức khó ngồi yên',
    'Dễ bực bội hoặc cáu kỉnh',
    'Cảm thấy sợ hãi như thể điều gì đó khủng khiếp có thể xảy ra'
  ],
  'PHQ-9': [
    'Ít quan tâm hoặc không vui thích khi làm việc',
    'Cảm thấy buồn, chán nản hoặc tuyệt vọng',
    'Khó ngủ, ngủ không sâu hoặc ngủ quá nhiều',
    'Cảm thấy mệt mỏi hoặc ít năng lượng',
    'Ăn ít hoặc ăn quá nhiều',
    'Cảm thấy tệ về bản thân',
    'Khó tập trung vào việc đọc báo hoặc xem TV',
    'Di chuyển hoặc nói chậm hơn bình thường',
    'Nghĩ về việc tự làm hại bản thân'
  ],
  'PSS': [
    'Bạn có bị khó chịu vì điều gì đó xảy ra bất ngờ không?',
    'Bạn có cảm thấy không thể kiểm soát những điều quan trọng trong cuộc sống không?',
    'Bạn có thường xuyên cảm thấy lo lắng và căng thẳng không?',
    'Bạn có tự tin xử lý các vấn đề cá nhân không?',
    'Bạn có cảm thấy mọi thứ đang diễn ra theo ý muốn không?',
    'Bạn có thấy mình không thể đối phó với tất cả những việc phải làm không?',
    'Bạn có thể kiểm soát sự cáu kỉnh trong cuộc sống không?',
    'Bạn có cảm thấy mình đang kiểm soát được mọi thứ không?',
    'Bạn có tức giận vì những việc nằm ngoài tầm kiểm soát không?',
    'Bạn có cảm thấy khó khăn đang chồng chất lên không?'
  ]
};

// Hàm tạo prompt cho AI
const createAIPrompt = (data: AIAnalysisRequest): string => {
  const questions = SCALE_QUESTIONS[data.scaleType as keyof typeof SCALE_QUESTIONS] || [];
  
  let prompt = `Bạn là một chuyên gia tâm lý AI chuyên về thanh thiếu niên. Hãy phân tích kết quả đánh giá và đưa ra khuyến nghị cá nhân hóa.

THÔNG TIN ĐÁNH GIÁ:
- Thang đo: ${data.scaleType}
- Tổng điểm: ${data.totalScore}
- Kết luận: ${data.interpretation}

CHI TIẾT CÂU TRẢ LỜI:`;

  questions.forEach((question, index) => {
    if (data.answers[index] !== undefined) {
      prompt += `\n${index + 1}. ${question}: ${data.answers[index]} điểm`;
    }
  });

  prompt += `

NHIỆM VỤ:
Dựa trên phân tích chi tiết các câu trả lời, hãy đưa ra khuyến nghị cụ thể và cá nhân hóa cho thanh thiếu niên này. 

YÊU CẦU PHẢN HỒI (JSON format):
{
  "immediateActions": ["hành động cụ thể 1", "hành động cụ thể 2", ...],
  "dailyPractices": ["thực hành hàng ngày 1", "thực hành hàng ngày 2", ...],
  "professionalHelp": {
    "needed": true/false,
    "urgency": "Thấp/Trung bình/Cao",
    "recommendations": ["khuyến nghị chuyên môn 1", ...]
  },
  "resources": ["tài nguyên hỗ trợ 1", "tài nguyên hỗ trợ 2", ...],
  "followUp": {
    "timeline": "thời gian theo dõi",
    "actions": ["hành động theo dõi 1", ...]
  },
  "reasoning": "lý do phân tích chi tiết",
  "confidence": 0.85
}

LƯU Ý:
- Tập trung vào các câu trả lời có điểm cao (nghiêm trọng hơn)
- Đưa ra khuyến nghị phù hợp với độ tuổi thanh thiếu niên
- Sử dụng ngôn ngữ thân thiện, không gây lo lắng
- Khuyến nghị phải thực tế và có thể thực hiện được`;

  return prompt;
};

// Hàm gọi AI API để tạo recommendations
export const generateAIRecommendations = async (
  assessment: Assessment,
  totalScore: number,
  interpretation: string
): Promise<AIRecommendationsResponse> => {
  try {
    const analysisData: AIAnalysisRequest = {
      scaleType: assessment.scaleType,
      questions: SCALE_QUESTIONS[assessment.scaleType] || [],
      answers: assessment.answers,
      totalScore,
      interpretation
    };

    const prompt = createAIPrompt(analysisData);

    // Gọi Mock AI API (trong production thay bằng real AI API)
    const aiResponse = await mockAIApiCall({
      prompt,
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 2000
    });
    
    // Parse JSON response từ AI
    let recommendations: AIRecommendationsResponse;
    try {
      recommendations = JSON.parse(aiResponse.content);
    } catch (parseError) {
      console.error('[ERROR] Failed to parse AI response:', parseError);
      console.error('[ERROR] Raw content:', aiResponse.content);
      throw new Error('Invalid AI response format');
    }

    return recommendations;

  } catch (error) {
    // Fallback to rule-based recommendations nếu AI fail
    return getFallbackRecommendations(interpretation, assessment.scaleType);
  }
};

// Fallback recommendations (cải tiến từ hardcode cũ)
const getFallbackRecommendations = (
  interpretation: string, 
  scaleType: string
): AIRecommendationsResponse => {
  const isHighSeverity = interpretation.includes('nặng') || interpretation.includes('cao');
  const isModerateSeverity = interpretation.includes('nhẹ') || interpretation.includes('trung bình');
  
  return {
    immediateActions: isHighSeverity ? [
      'Tìm kiếm sự hỗ trợ từ gia đình và bạn bè ngay lập tức',
      'Liên hệ với chuyên gia tâm lý để được tư vấn',
      'Tránh các quyết định quan trọng khi tâm trạng không ổn định'
    ] : isModerateSeverity ? [
      'Dành thời gian cho bản thân mỗi ngày',
      'Thực hiện các hoạt động thư giãn',
      'Chia sẻ cảm xúc với người tin tưởng'
    ] : [
      'Duy trì lối sống lành mạnh hiện tại',
      'Tiếp tục các hoạt động tích cực'
    ],
    
    dailyPractices: [
      'Thực hiện bài tập thở sâu 5-10 phút mỗi ngày',
      'Duy trì giấc ngủ đủ 7-8 tiếng mỗi đêm',
      'Tập thể dục nhẹ nhàng 20-30 phút',
      'Viết nhật ký cảm xúc',
      'Thực hành chánh niệm (mindfulness)'
    ],
    
    professionalHelp: {
      needed: isHighSeverity,
      urgency: isHighSeverity ? 'Cao' : isModerateSeverity ? 'Trung bình' : 'Thấp',
      recommendations: isHighSeverity ? [
        'Tham khảo ý kiến bác sĩ tâm lý hoặc psychiatrist',
        'Cân nhắc liệu pháp tâm lý (CBT, DBT)',
        'Tham gia nhóm hỗ trợ'
      ] : isModerateSeverity ? [
        'Tư vấn tâm lý ngắn hạn',
        'Tham gia các khóa học quản lý stress'
      ] : []
    },
    
    resources: [
      'Ứng dụng thiền định: Headspace, Calm',
      'Sách: "Tâm lý học tích cực" - Martin Seligman',
      'Đường dây nóng tâm lý: 1900 6013',
      'Website: https://www.who.int/mental_health',
      'Ứng dụng theo dõi tâm trạng: Daylio, Mood Meter'
    ],
    
    followUp: {
      timeline: isHighSeverity ? '1-2 tuần' : isModerateSeverity ? '1 tháng' : '3 tháng',
      actions: [
        'Thực hiện lại bài đánh giá để theo dõi tiến triển',
        'Đánh giá hiệu quả của các biện pháp đã áp dụng',
        'Điều chỉnh kế hoạch chăm sóc nếu cần thiết'
      ]
    },
    
    reasoning: `Khuyến nghị được tạo dựa trên kết quả ${scaleType} với mức độ ${interpretation}. Đây là khuyến nghị tổng quát, nên được cá nhân hóa thêm.`,
    confidence: 0.6
  };
};
