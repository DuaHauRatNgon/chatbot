# AI-Powered Recommendations cho Assessment

## Tổng quan

Đã nâng cấp tính năng assessment từ hardcode recommendations lên **AI-powered recommendations** với khả năng phân tích chi tiết câu trả lời của người dùng và đưa ra khuyến nghị cá nhân hóa.

## Kiến trúc hệ thống

### 1. Luồng xử lý
```
Assessment Complete → Check API Recommendations → AI Analysis → Fallback → Display
```

**Ưu tiên xử lý:**
1. **API Recommendations** (nếu có từ backend)
2. **AI-Generated Recommendations** (phân tích real-time)
3. **Fallback Recommendations** (rule-based backup)

### 2. Files đã thêm/sửa

#### Mới thêm:
- `src/services/aiRecommendations.ts` - Core AI logic
- `src/services/mockAIApi.ts` - Mock AI API cho testing
- `src/components/custom/AssessmentDebug.tsx` - Debug tool

#### Đã sửa:
- `src/components/custom/AssessmentResults.tsx` - UI + AI integration

## Tính năng AI-Powered

### 1. Phân tích thông minh
- **Contextual Analysis**: Phân tích từng câu trả lời dựa trên loại thang đo
- **Severity Detection**: Tự động phát hiện mức độ nghiêm trọng
- **Personalization**: Cá nhân hóa cho thanh thiếu niên

### 2. Khuyến nghị đa dạng
- **Immediate Actions**: Hành động ngay lập tức
- **Daily Practices**: Thực hành hàng ngày
- **Professional Help**: Hỗ trợ chuyên môn (nếu cần)
- **Resources**: Tài nguyên hỗ trợ cụ thể
- **Follow-up**: Kế hoạch theo dõi

### 3. UI/UX cải tiến
- **Loading State**: Hiển thị "AI đang phân tích..."
- **Confidence Score**: Độ tin cậy của AI (0-100%)
- **AI Reasoning**: Giải thích logic phân tích
- **Status Indicators**: Badge cho từng loại recommendations

## Cách sử dụng

### 1. Test với Debug Tool
```typescript
// Import component
import { AssessmentDebug } from '@/components/custom/AssessmentDebug';

// Sử dụng trong app
<AssessmentDebug />
```

### 2. Tích hợp Production

#### Thay thế Mock API bằng Real AI:
```typescript
// Trong aiRecommendations.ts
const aiResponse = await fetch('/api/ai/recommendations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AI_API_KEY}`
  },
  body: JSON.stringify({
    prompt,
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 2000
  })
});
```

#### Cấu hình Environment:
```env
AI_API_KEY=your_openai_api_key
AI_MODEL=gpt-4
AI_ENDPOINT=https://api.openai.com/v1/chat/completions
```

## Prompt Engineering

### Template hiện tại:
```
Bạn là một chuyên gia tâm lý AI chuyên về thanh thiếu niên. 
Hãy phân tích kết quả đánh giá và đưa ra khuyến nghị cá nhân hóa.

THÔNG TIN ĐÁNH GIÁ:
- Thang đo: {scaleType}
- Tổng điểm: {totalScore}
- Kết luận: {interpretation}

CHI TIẾT CÂU TRẢ LỜI:
1. {question1}: {answer1} điểm
2. {question2}: {answer2} điểm
...

YÊU CẦU PHẢN HỒI (JSON format):
{
  "immediateActions": [...],
  "dailyPractices": [...],
  "professionalHelp": {...},
  "resources": [...],
  "followUp": {...},
  "reasoning": "...",
  "confidence": 0.85
}
```

### Tối ưu hóa Prompt:
- **Context-aware**: Thêm thông tin về độ tuổi, giới tính
- **Cultural sensitivity**: Phù hợp với văn hóa Việt Nam
- **Safety guidelines**: Tránh khuyến nghị có hại
- **Professional boundaries**: Không thay thế chẩn đoán y tế

## Monitoring & Analytics

### 1. Metrics cần theo dõi
- **AI Response Time**: Thời gian generate recommendations
- **Confidence Scores**: Phân bố độ tin cậy
- **Fallback Rate**: Tỷ lệ sử dụng fallback
- **User Feedback**: Đánh giá chất lượng khuyến nghị

### 2. Error Handling
- **API Timeout**: Fallback sau 10s
- **Invalid Response**: Parse error handling
- **Rate Limiting**: Queue management
- **Cost Control**: Token usage monitoring

## Roadmap

### Phase 1 (Hiện tại)
- ✅ Mock AI implementation
- ✅ UI/UX integration
- ✅ Debug tools
- ✅ Fallback system

### Phase 2 (Tiếp theo)
- [ ] Real AI API integration
- [ ] User feedback collection
- [ ] A/B testing framework
- [ ] Performance optimization

### Phase 3 (Tương lai)
- [ ] Multi-language support
- [ ] Advanced personalization
- [ ] Predictive analytics
- [ ] Integration với electronic health records

## Bảo mật & Compliance

### 1. Data Privacy
- Không lưu trữ dữ liệu cá nhân trong AI logs
- Encrypt tất cả API calls
- Tuân thủ GDPR/CCPA

### 2. Medical Compliance
- Disclaimer rõ ràng về không thay thế chẩn đoán y tế
- Emergency contact information
- Professional referral guidelines

## Troubleshooting

### Lỗi thường gặp:

1. **AI không response**
   - Check API key và endpoint
   - Verify network connectivity
   - Monitor rate limits

2. **Recommendations không phù hợp**
   - Review prompt template
   - Adjust temperature parameter
   - Update training examples

3. **Performance chậm**
   - Implement caching
   - Optimize prompt length
   - Use faster AI models

## Liên hệ & Support

- **Technical Issues**: [GitHub Issues]
- **AI Model Questions**: [AI Team]
- **Medical Compliance**: [Clinical Team]

---

*Tài liệu này sẽ được cập nhật thường xuyên theo sự phát triển của hệ thống.*
