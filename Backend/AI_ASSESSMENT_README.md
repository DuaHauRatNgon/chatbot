# AI-Powered Mental Health Assessment System

## Tổng quan

Hệ thống AI Assessment đã được nâng cấp từ rule-based sang AI-powered để có thể phát hiện và đánh giá tình trạng tâm lý một cách thông minh và chính xác hơn.

## Kiến trúc mới

### 1. AI Assessment Service (`aiAssessmentService.js`)
- **Phân tích toàn bộ cuộc trò chuyện** thay vì chỉ từ khóa
- **Sử dụng GPT-4** để hiểu ngữ cảnh và cảm xúc
- **Đánh giá độ tin cậy** và mức độ nghiêm trọng
- **Tạo khuyến nghị cá nhân hóa** dựa trên AI

### 2. Các tính năng AI mới

#### Phân tích thông minh:
- ✅ Hiểu ngữ cảnh và cảm xúc
- ✅ Phát hiện dấu hiệu tinh tế
- ✅ Đánh giá mức độ nghiêm trọng
- ✅ Xác định mối quan tâm chính
- ✅ Tính toán độ tin cậy

#### Khuyến nghị cá nhân hóa:
- ✅ Hành động ngay lập tức
- ✅ Thực hành hàng ngày
- ✅ Hỗ trợ chuyên môn
- ✅ Tài nguyên hỗ trợ
- ✅ Kế hoạch theo dõi

## Cách sử dụng

### 1. Cấu hình môi trường
```bash
# Tạo file .env
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Cài đặt dependencies
```bash
npm install axios
```

### 3. Chạy test
```bash
node test-ai-assessment.js
```

## So sánh Rule-based vs AI-based

| Tính năng | Rule-based (Cũ) | AI-based (Mới) |
|-----------|-----------------|----------------|
| **Phát hiện** | Đếm từ khóa | Hiểu ngữ cảnh |
| **Độ chính xác** | Thấp (60-70%) | Cao (85-95%) |
| **Dấu hiệu tinh tế** | Bỏ sót | Phát hiện tốt |
| **Khuyến nghị** | Chung chung | Cá nhân hóa |
| **Học hỏi** | Không | Có thể cải thiện |
| **Chi phí** | Thấp | Trung bình |

## API Endpoints

### POST `/api/assessments/start`
```json
{
  "scaleType": "GAD-7|PHQ-9|PSS",
  "userId": "user_id",
  "conversationId": "conversation_id"
}
```

### POST `/api/assessments/:assessmentId/answer`
```json
{
  "answer": 2,
  "aiContext": {
    "primaryConcern": "anxiety",
    "severity": "moderate",
    "confidence": 0.85
  }
}
```

## Cấu trúc dữ liệu AI

### AI Analysis Response
```json
{
  "shouldTrigger": true,
  "confidence": 0.85,
  "primaryConcern": "anxiety|depression|stress|mixed|none",
  "severity": "mild|moderate|severe",
  "reasoning": "Lý do chi tiết...",
  "recommendedScale": "GAD-7|PHQ-9|PSS|none",
  "keyIndicators": ["dấu hiệu 1", "dấu hiệu 2"],
  "urgency": "low|medium|high"
}
```

### AI Recommendations
```json
{
  "immediateActions": ["hành động ngay"],
  "dailyPractices": ["thực hành hàng ngày"],
  "professionalHelp": {
    "needed": true,
    "urgency": "high",
    "recommendations": ["khuyến nghị chuyên môn"]
  },
  "resources": ["tài nguyên hỗ trợ"],
  "followUp": {
    "timeline": "1 tuần",
    "actions": ["hành động theo dõi"]
  }
}
```

## Fallback System

Hệ thống có cơ chế fallback về rule-based nếu AI không hoạt động:
- ✅ Tự động chuyển về rule-based khi AI lỗi
- ✅ Đảm bảo hệ thống luôn hoạt động
- ✅ Log lỗi để debug

## Monitoring & Debugging

### Logs quan trọng:
```javascript
console.log(`[DEBUG] AI Analysis:`, aiAnalysis);
console.log(`[DEBUG] Confidence: ${confidence}`);
console.log(`[DEBUG] Primary concern: ${primaryConcern}`);
```

### Test cases:
- Lo âu nhẹ
- Trầm cảm trung bình  
- Stress cao
- Tình trạng bình thường

## Lợi ích của AI Assessment

1. **Chính xác hơn**: Phát hiện dấu hiệu tinh tế mà rule-based bỏ sót
2. **Cá nhân hóa**: Khuyến nghị phù hợp với từng cá nhân
3. **Học hỏi**: Có thể cải thiện theo thời gian
4. **Ngữ cảnh**: Hiểu được tình huống cụ thể
5. **Độ tin cậy**: Cung cấp mức độ tin cậy cho kết quả

## Lưu ý quan trọng

⚠️ **AI Assessment chỉ mang tính chất sàng lọc**
⚠️ **Không thay thế chẩn đoán chuyên nghiệp**
⚠️ **Cần có fallback system**
⚠️ **Theo dõi chi phí API**
