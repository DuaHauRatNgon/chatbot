// Mock AI API để test tính năng AI recommendations
// Trong production, thay thế bằng real AI API call

interface MockAIRequest {
  prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
}

interface MockAIResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Simulate AI response dựa trên prompt
export const mockAIApiCall = async (request: MockAIRequest): Promise<MockAIResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Parse prompt để extract thông tin assessment
  const prompt = request.prompt;
  const isHighSeverity = prompt.includes('nặng') || prompt.includes('cao') || prompt.includes('15') || prompt.includes('16') || prompt.includes('17') || prompt.includes('18') || prompt.includes('19') || prompt.includes('20') || prompt.includes('21');
  const isModerateSeverity = prompt.includes('nhẹ') || prompt.includes('trung bình') || prompt.includes('10') || prompt.includes('11') || prompt.includes('12') || prompt.includes('13') || prompt.includes('14');
  const isGAD7 = prompt.includes('GAD-7');
  const isPHQ9 = prompt.includes('PHQ-9');
  const isPSS = prompt.includes('PSS');

  // Generate contextual recommendations based on assessment type and severity
  let mockResponse = {};

  if (isHighSeverity) {
    mockResponse = {
      immediateActions: [
        isGAD7 ? "Thực hành kỹ thuật thở 4-7-8 để giảm lo âu ngay lập tức" : 
        isPHQ9 ? "Liên hệ với người thân tin tưởng để chia sẻ cảm xúc" :
        "Tạm dừng các hoạt động gây stress và nghỉ ngơi",
        "Tìm kiếm sự hỗ trợ chuyên nghiệp trong vòng 1-2 tuần",
        isGAD7 ? "Tránh caffeine và các chất kích thích" :
        isPHQ9 ? "Duy trì thói quen sinh hoạt cơ bản hàng ngày" :
        "Áp dụng kỹ thuật quản lý stress ngay lập tức"
      ],
      dailyPractices: [
        isGAD7 ? "Thực hành thiền chánh niệm 10-15 phút mỗi sáng" :
        isPHQ9 ? "Viết nhật ký cảm xúc và 3 điều tích cực mỗi ngày" :
        "Lập kế hoạch quản lý thời gian và ưu tiên công việc",
        "Tập thể dục nhẹ 20-30 phút (đi bộ, yoga)",
        "Duy trì giấc ngủ đều đặn 7-8 tiếng",
        isGAD7 ? "Hạn chế tiếp xúc với tin tức tiêu cực" :
        isPHQ9 ? "Tham gia ít nhất 1 hoạt động xã hội mỗi tuần" :
        "Thực hành kỹ thuật thư giãn cơ bắp"
      ],
      professionalHelp: {
        needed: true,
        urgency: "Cao - nên tìm kiếm hỗ trợ trong vòng 1-2 tuần",
        recommendations: [
          isGAD7 ? "Tham khảo liệu pháp CBT (Cognitive Behavioral Therapy) cho lo âu" :
          isPHQ9 ? "Cân nhắc tham khảo bác sĩ tâm lý về liệu pháp trầm cảm" :
          "Tư vấn với chuyên gia về quản lý stress",
          "Tham gia nhóm hỗ trợ đồng trang lứa",
          "Đánh giá nhu cầu can thiệp y tế nếu cần"
        ]
      },
      resources: [
        isGAD7 ? "Ứng dụng Calm - bài tập thở cho lo âu" :
        isPHQ9 ? "Ứng dụng Daylio - theo dõi tâm trạng hàng ngày" :
        "Ứng dụng Headspace - quản lý stress",
        "Sách: 'Vượt qua lo âu' - Edmund Bourne",
        "Đường dây nóng tâm lý: 1900 6013",
        "Website hỗ trợ tâm lý thanh thiếu niên: mentalhealth.gov"
      ],
      followUp: {
        timeline: "1-2 tuần",
        actions: [
          "Thực hiện lại bài đánh giá để theo dõi tiến triển",
          "Đánh giá hiệu quả của các kỹ thuật đã áp dụng",
          "Điều chỉnh kế hoạch chăm sóc dựa trên phản hồi"
        ]
      },
      reasoning: `Dựa trên phân tích chi tiết các câu trả lời, tôi nhận thấy mức độ ${isGAD7 ? 'lo âu' : isPHQ9 ? 'trầm cảm' : 'stress'} ở mức cao. Các khuyến nghị được cá nhân hóa dựa trên các triệu chứng cụ thể được phát hiện trong bài đánh giá, đặc biệt chú ý đến các câu trả lời có điểm số cao nhất.`,
      confidence: 0.87
    };
  } else if (isModerateSeverity) {
    mockResponse = {
      immediateActions: [
        "Dành 15-20 phút mỗi ngày cho hoạt động thư giãn",
        "Chia sẻ cảm xúc với bạn bè hoặc gia đình",
        "Tạo thói quen tích cực để cải thiện tâm trạng"
      ],
      dailyPractices: [
        isGAD7 ? "Thực hành kỹ thuật thở sâu khi cảm thấy lo lắng" :
        isPHQ9 ? "Tham gia các hoạt động mang lại niềm vui" :
        "Áp dụng kỹ thuật quản lý thời gian hiệu quả",
        "Tập thể dục đều đặn 3-4 lần/tuần",
        "Duy trì chế độ ăn uống lành mạnh",
        "Giới hạn thời gian sử dụng mạng xã hội"
      ],
      professionalHelp: {
        needed: false,
        urgency: "Trung bình - có thể cân nhắc tư vấn",
        recommendations: [
          "Tham gia các khóa học kỹ năng sống",
          "Cân nhắc tư vấn tâm lý ngắn hạn nếu tình trạng không cải thiện"
        ]
      },
      resources: [
        "Ứng dụng Insight Timer - thiền định miễn phí",
        "Podcast về sức khỏe tâm lý thanh thiếu niên",
        "Sách: 'Hạnh phúc từ bên trong' - Thích Nhất Hạnh"
      ],
      followUp: {
        timeline: "1 tháng",
        actions: [
          "Theo dõi tâm trạng hàng ngày",
          "Đánh giá lại sau 4 tuần"
        ]
      },
      reasoning: `Kết quả cho thấy mức độ ${isGAD7 ? 'lo âu' : isPHQ9 ? 'trầm cảm' : 'stress'} ở mức trung bình. Các khuyến nghị tập trung vào việc xây dựng thói quen tích cực và kỹ năng tự chăm sóc.`,
      confidence: 0.78
    };
  } else {
    mockResponse = {
      immediateActions: [
        "Tiếp tục duy trì lối sống lành mạnh hiện tại",
        "Tăng cường các hoạt động tích cực"
      ],
      dailyPractices: [
        "Duy trì thói quen tập thể dục",
        "Thực hành biết ơn hàng ngày",
        "Kết nối với bạn bè và gia đình"
      ],
      professionalHelp: {
        needed: false,
        urgency: "Thấp",
        recommendations: []
      },
      resources: [
        "Sách về phát triển bản thân",
        "Các hoạt động ngoại khóa tích cực"
      ],
      followUp: {
        timeline: "3 tháng",
        actions: [
          "Đánh giá định kỳ để duy trì sức khỏe tâm lý"
        ]
      },
      reasoning: "Kết quả cho thấy tình trạng tâm lý ổn định. Khuyến nghị tập trung vào việc duy trì và tăng cường các yếu tố tích cực.",
      confidence: 0.92
    };
  }

  const response = {
    content: JSON.stringify(mockResponse),
    usage: {
      prompt_tokens: 500,
      completion_tokens: 300,
      total_tokens: 800
    }
  };
  
  return response;
};
