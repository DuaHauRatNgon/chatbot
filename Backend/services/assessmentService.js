const mongoose = require('mongoose');

// Schema cho Assessment (tạm thời, có thể tạo model riêng sau)
const assessmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  conversationId: { type: String, required: true },
  scaleType: { type: String, required: true, enum: ['GAD-7', 'PHQ-9', 'PSS'] },
  answers: [Number],
  totalScore: Number,
  interpretation: String,
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  currentQuestion: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  suggestedBy: { type: String, default: 'bot' }
});

// Tạm thời lưu trong memory (có thể thay bằng database sau)
let assessments = [];

class AssessmentService {
  constructor() {
    this.scales = {
      "GAD-7": {
        name: "Generalized Anxiety Disorder 7-item",
        description: "Đánh giá mức độ lo âu",
        questions: [
          "Trong 2 tuần qua, bạn cảm thấy lo lắng, bồn chồn hay căng thẳng bao nhiêu?",
          "Trong 2 tuần qua, bạn có thể ngừng hoặc kiểm soát việc lo lắng bao nhiêu?",
          "Trong 2 tuần qua, bạn lo lắng quá mức về nhiều thứ khác nhau bao nhiêu?",
          "Trong 2 tuần qua, bạn gặp khó khăn trong việc thư giãn bao nhiêu?",
          "Trong 2 tuần qua, bạn cảm thấy bồn chồn đến mức không thể ngồi yên bao nhiêu?",
          "Trong 2 tuần qua, bạn dễ bị khó chịu hoặc cáu kỉnh bao nhiêu?",
          "Trong 2 tuần qua, bạn cảm thấy sợ hãi như thể có điều gì đó khủng khiếp sắp xảy ra bao nhiêu?"
        ],
        options: [
          "Không có",
          "Vài ngày", 
          "Hơn một nửa số ngày",
          "Gần như mỗi ngày"
        ],
        scoring: [0, 1, 2, 3],
        interpretation: {
          "0-4": "Lo âu tối thiểu",
          "5-9": "Lo âu nhẹ - Có thể cần theo dõi",
          "10-14": "Lo âu trung bình - Nên tham khảo ý kiến chuyên gia",
          "15-21": "Lo âu nặng - Cần được đánh giá và điều trị"
        }
      },
      "PHQ-9": {
        name: "Patient Health Questionnaire-9",
        description: "Đánh giá mức độ trầm cảm",
        questions: [
          "Trong 2 tuần qua, bạn có cảm thấy buồn, chán nản hoặc tuyệt vọng không?",
          "Trong 2 tuần qua, bạn có cảm thấy ít hứng thú hoặc ít vui khi làm các hoạt động không?",
          "Trong 2 tuần qua, bạn có gặp khó khăn khi ngủ (ngủ quá ít, quá nhiều, hoặc ngủ không ngon) không?",
          "Trong 2 tuần qua, bạn có cảm thấy mệt mỏi hoặc ít năng lượng không?",
          "Trong 2 tuần qua, bạn có cảm thấy chán ăn hoặc ăn quá nhiều không?",
          "Trong 2 tuần qua, bạn có cảm thấy không hài lòng với bản thân hoặc cảm thấy mình đã thất bại không?",
          "Trong 2 tuần qua, bạn có gặp khó khăn khi tập trung vào các việc như đọc sách hoặc xem TV không?",
          "Trong 2 tuần qua, bạn có nói chậm hoặc di chuyển chậm đến mức người khác có thể nhận thấy không?",
          "Trong 2 tuần qua, bạn có nghĩ rằng tốt hơn là chết hoặc muốn làm tổn thương bản thân không?"
        ],
        options: [
          "Không có",
          "Vài ngày",
          "Hơn một nửa số ngày", 
          "Gần như mỗi ngày"
        ],
        scoring: [0, 1, 2, 3],
        interpretation: {
          "0-4": "Trầm cảm tối thiểu",
          "5-9": "Trầm cảm nhẹ - Có thể cần theo dõi",
          "10-14": "Trầm cảm trung bình - Nên tham khảo ý kiến chuyên gia",
          "15-19": "Trầm cảm trung bình-nặng - Cần được đánh giá và điều trị",
          "20-27": "Trầm cảm nặng - Cần điều trị ngay lập tức"
        }
      },
      "PSS": {
        name: "Perceived Stress Scale",
        description: "Đánh giá mức độ stress",
        questions: [
          "Trong tháng qua, bạn cảm thấy khó khăn trong việc kiểm soát những điều quan trọng trong cuộc sống như thế nào?",
          "Trong tháng qua, bạn cảm thấy tự tin về khả năng xử lý những vấn đề cá nhân như thế nào?",
          "Trong tháng qua, bạn cảm thấy mọi thứ đang diễn ra theo đúng cách như thế nào?",
          "Trong tháng qua, bạn cảm thấy khó khăn trong việc xử lý những điều không thể thay đổi như thế nào?",
          "Trong tháng qua, bạn cảm thấy có thể xử lý tốt những thay đổi trong cuộc sống như thế nào?",
          "Trong tháng qua, bạn cảm thấy khó khăn trong việc kiểm soát những điều trong cuộc sống như thế nào?",
          "Trong tháng qua, bạn cảm thấy có thể xử lý tốt những vấn đề cá nhân như thế nào?",
          "Trong tháng qua, bạn cảm thấy mọi thứ đang theo đúng kế hoạch như thế nào?",
          "Trong tháng qua, bạn cảm thấy khó khăn trong việc xử lý những điều cần phải làm như thế nào?",
          "Trong tháng qua, bạn cảm thấy có thể kiểm soát những khó khăn trong cuộc sống như thế nào?"
        ],
        options: [
          "Không bao giờ",
          "Hầu như không bao giờ",
          "Thỉnh thoảng",
          "Khá thường xuyên",
          "Rất thường xuyên"
        ],
        scoring: [0, 1, 2, 3, 4], // PSS có 5 options
        interpretation: {
          "0-13": "Stress thấp",
          "14-26": "Stress trung bình",
          "27-40": "Stress cao"
        }
      }
    };
  }
  
  async startAssessment(scaleType, userId, conversationId) {
    const scale = this.scales[scaleType];
    if (!scale) {
      throw new Error(`Thang đo ${scaleType} không tồn tại`);
    }
    
    // Tạo assessment mới
    const assessment = {
      _id: Date.now().toString(), // ID tạm thời
      userId,
      conversationId,
      scaleType,
      status: "in_progress",
      currentQuestion: 0,
      answers: [],
      startedAt: new Date(),
      suggestedBy: 'bot'
    };
    
    // Lưu vào memory (có thể thay bằng database sau)
    assessments.push(assessment);
    
    return {
      assessmentId: assessment._id,
      scaleType,
      name: scale.name,
      description: scale.description,
      totalQuestions: scale.questions.length,
      currentQuestion: 0,
      question: scale.questions[0],
      options: scale.options
    };
  }
  
  async submitAnswer(assessmentId, answer) {
    const assessment = assessments.find(a => a._id === assessmentId);
    if (!assessment) {
      throw new Error('Assessment không tồn tại');
    }
    
    const scale = this.scales[assessment.scaleType];
    
    assessment.answers.push(answer);
    assessment.currentQuestion++;
    
    if (assessment.currentQuestion >= scale.questions.length) {
      // Hoàn thành assessment
      const totalScore = this.calculateScore(assessment.answers, scale);
      const interpretation = this.interpretScore(totalScore, scale);
      const recommendations = this.generateRecommendations(scale, totalScore);
      
      assessment.status = "completed";
      assessment.totalScore = totalScore;
      assessment.interpretation = interpretation;
      assessment.completedAt = new Date();
      
      return {
        completed: true,
        totalScore,
        interpretation,
        recommendations,
        assessment
      };
    } else {
      // Tiếp tục câu hỏi tiếp theo
      return {
        completed: false,
        assessmentId,
        currentQuestion: assessment.currentQuestion,
        question: scale.questions[assessment.currentQuestion],
        options: scale.options,
        progress: Math.round((assessment.currentQuestion / scale.questions.length) * 100)
      };
    }
  }
  
  calculateScore(answers, scale) {
    return answers.reduce((total, answer) => total + scale.scoring[answer], 0);
  }
  
  interpretScore(score, scale) {
    for (const [range, interpretation] of Object.entries(scale.interpretation)) {
      const [min, max] = range.split('-').map(Number);
      if (score >= min && score <= max) {
        return interpretation;
      }
    }
    return "Không xác định";
  }
  
  async generateRecommendations(scale, score, aiContext = {}) {
    try {
      // Nếu có AI context, sử dụng AI để tạo khuyến nghị cá nhân hóa
      if (aiContext.primaryConcern && aiContext.severity) {
        const aiAssessmentService = require('./aiAssessmentService');
        const aiRecommendations = await aiAssessmentService.generatePersonalizedRecommendations({
          scaleType: scale.name.split(' ')[0],
          totalScore: score,
          interpretation: this.interpretScore(score, scale),
          primaryConcern: aiContext.primaryConcern,
          severity: aiContext.severity
        }, aiContext.userProfile || {});
        
        return {
          immediateActions: aiRecommendations.immediateActions || [],
          dailyPractices: aiRecommendations.dailyPractices || [],
          professionalHelp: aiRecommendations.professionalHelp || { needed: false },
          resources: aiRecommendations.resources || [],
          followUp: aiRecommendations.followUp || { timeline: "1 tuần" },
          aiGenerated: true
        };
      }
    } catch (error) {
      console.error('Lỗi tạo AI recommendations:', error);
      // Fallback về rule-based nếu AI lỗi
    }

    // Fallback về rule-based recommendations
    const recommendations = {
      "GAD-7": {
        "0-4": [
          "Tiếp tục duy trì lối sống lành mạnh",
          "Thực hành các kỹ thuật thư giãn như hít thở sâu",
          "Theo dõi tình trạng và tìm kiếm sự hỗ trợ nếu cần"
        ],
        "5-9": [
          "Thực hành các kỹ thuật quản lý lo âu",
          "Tăng cường hoạt động thể chất",
          "Cân nhắc tham khảo ý kiến chuyên gia tâm lý"
        ],
        "10-14": [
          "Nên tham khảo ý kiến chuyên gia tâm lý",
          "Cân nhắc liệu pháp nhận thức hành vi (CBT)",
          "Thực hành các kỹ thuật thư giãn hàng ngày"
        ],
        "15-21": [
          "Cần được đánh giá và điều trị chuyên nghiệp ngay lập tức",
          "Liên hệ với bác sĩ tâm thần hoặc chuyên gia tâm lý",
          "Cân nhắc sử dụng thuốc nếu được bác sĩ chỉ định"
        ]
      },
      "PHQ-9": {
        "0-4": [
          "Tiếp tục duy trì lối sống lành mạnh",
          "Thực hành các hoạt động mang lại niềm vui",
          "Giữ kết nối với bạn bè và gia đình"
        ],
        "5-9": [
          "Thực hành các kỹ thuật quản lý tâm trạng",
          "Tăng cường hoạt động thể chất",
          "Cân nhắc tham khảo ý kiến chuyên gia tâm lý"
        ],
        "10-14": [
          "Nên tham khảo ý kiến chuyên gia tâm lý",
          "Cân nhắc liệu pháp tâm lý",
          "Thực hành các kỹ thuật thư giãn và chánh niệm"
        ],
        "15-19": [
          "Cần được đánh giá và điều trị chuyên nghiệp",
          "Liên hệ với bác sĩ tâm thần",
          "Có thể cần điều trị bằng thuốc kết hợp với liệu pháp tâm lý"
        ],
        "20-27": [
          "Cần điều trị ngay lập tức",
          "Liên hệ khẩn cấp với bác sĩ tâm thần",
          "Cân nhắc nhập viện nếu có ý tưởng tự hại"
        ]
      },
      "PSS": {
        "0-13": [
          "Tiếp tục duy trì lối sống cân bằng",
          "Thực hành các kỹ thuật quản lý thời gian",
          "Giữ thái độ tích cực"
        ],
        "14-26": [
          "Thực hành các kỹ thuật quản lý stress",
          "Tăng cường hoạt động thể chất",
          "Cân nhắc tham khảo ý kiến chuyên gia"
        ],
        "27-40": [
          "Nên tham khảo ý kiến chuyên gia tâm lý",
          "Thực hành các kỹ thuật thư giãn sâu",
          "Cân nhắc thay đổi lối sống để giảm stress"
        ]
      }
    };
    
    // Tìm range phù hợp
    const scaleKey = scale.name.split(' ')[0]; // Lấy GAD-7, PHQ-9, PSS
    const scaleRecs = recommendations[scaleKey];
    
    if (scaleRecs) {
      for (const [range, recs] of Object.entries(scaleRecs)) {
        const [min, max] = range.split('-').map(Number);
        if (score >= min && score <= max) {
          return {
            immediateActions: recs.slice(0, 2),
            dailyPractices: recs.slice(2),
            professionalHelp: { needed: score >= 10 },
            resources: ["Đường dây nóng tâm lý: 1900 599 978"],
            followUp: { timeline: "1 tuần" },
            aiGenerated: false
          };
        }
      }
    }
    
    return {
      immediateActions: ["Vui lòng tham khảo ý kiến chuyên gia"],
      dailyPractices: [],
      professionalHelp: { needed: true },
      resources: [],
      followUp: { timeline: "1 tuần" },
      aiGenerated: false
    };
  }

  async getAssessment(assessmentId) {
    return assessments.find(a => a._id === assessmentId);
  }

  async getUserAssessments(userId) {
    return assessments.filter(a => a.userId === userId);
  }
}

module.exports = new AssessmentService();
