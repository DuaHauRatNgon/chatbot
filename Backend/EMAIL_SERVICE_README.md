# Email Service Documentation

## Tổng quan
Tính năng Email Service cho phép gửi email tự động và thủ công cho người dùng đã đăng ký trong hệ thống ChatBot.

## Cấu hình Email

### 1. Cấu hình Gmail SMTP
Để sử dụng tính năng email, bạn cần cấu hình Gmail SMTP trong file `.env`:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

### 2. Tạo App Password cho Gmail
1. Đăng nhập vào Gmail
2. Vào Settings > Security > 2-Step Verification
3. Tạo App Password cho ứng dụng
4. Sử dụng App Password này trong EMAIL_PASSWORD

## API Endpoints

### 1. Gửi Email Chào Mừng
```
POST /api/emails/welcome/:userId
Authorization: Bearer <token>
```
Gửi email chào mừng cho user mới đăng ký.

### 2. Gửi Email Thông Báo Đăng Nhập
```
POST /api/emails/login-notification/:userId
Authorization: Bearer <token>
```
Gửi email thông báo khi user đăng nhập.

### 3. Gửi Email Tùy Chỉnh
```
POST /api/emails/custom
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id_here",
  "subject": "Tiêu đề email",
  "content": "Nội dung email"
}
```

### 4. Gửi Email Hàng Loạt
```
POST /api/emails/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "userIds": ["user_id_1", "user_id_2", "user_id_3"],
  "subject": "Tiêu đề email",
  "content": "Nội dung email"
}
```

### 5. Kiểm Tra Trạng Thái Email Service
```
GET /api/emails/status
Authorization: Bearer <token>
```

## Tính Năng Tự Động

### Email Chào Mừng Tự Động
Khi user đăng ký thành công, hệ thống sẽ tự động gửi email chào mừng với:
- Template HTML đẹp mắt
- Thông tin về các tính năng của ChatBot
- Link đến ứng dụng
- Thông tin liên hệ

## Email Templates

### 1. Welcome Email Template
- Header với logo ChatBot
- Chào mừng người dùng
- Danh sách tính năng
- Call-to-action button
- Footer với thông tin liên hệ

### 2. Login Notification Template
- Thông báo đăng nhập
- Thời gian đăng nhập
- Cảnh báo bảo mật
- Hướng dẫn nếu không phải là bạn

### 3. Custom Email Template
- Template linh hoạt cho nội dung tùy chỉnh
- Responsive design
- Branding nhất quán

## Cấu Trúc Code

### Services
- `emailService.js`: Xử lý logic gửi email và templates
- `userService.js`: Tích hợp email vào quá trình đăng ký

### Controllers
- `emailController.js`: Xử lý các API endpoints cho email

### Routes
- `emailRoutes.js`: Định nghĩa các routes cho email

### Repository
- `userRepository.js`: Thêm method getUserById và getAllUsers

## Lỗi Thường Gặp

### 1. Email không gửi được
- Kiểm tra EMAIL_USER và EMAIL_PASSWORD trong .env
- Đảm bảo đã bật 2-Step Verification và tạo App Password
- Kiểm tra kết nối internet

### 2. Template không hiển thị đúng
- Kiểm tra FRONTEND_URL trong .env
- Đảm bảo HTML template hợp lệ

### 3. Authentication Error
- Kiểm tra JWT token
- Đảm bảo user có quyền truy cập

## Testing

### Test Email Service
```bash
# Kiểm tra trạng thái email service
curl -X GET http://localhost:5000/api/emails/status \
  -H "Authorization: Bearer <your-token>"
```

### Test Gửi Email Chào Mừng
```bash
curl -X POST http://localhost:5000/api/emails/welcome/<user-id> \
  -H "Authorization: Bearer <your-token>"
```

## Bảo Mật

1. **App Password**: Sử dụng App Password thay vì mật khẩu chính
2. **Environment Variables**: Không commit thông tin email vào code
3. **Authentication**: Tất cả endpoints đều yêu cầu authentication
4. **Rate Limiting**: Có thể thêm rate limiting để tránh spam

## Mở Rộng

### Thêm Email Provider Khác
Có thể dễ dàng thêm các email provider khác như:
- SendGrid
- Mailgun
- AWS SES
- Outlook/Hotmail

### Thêm Template Mới
Tạo method mới trong EmailService với template tương ứng.

### Thêm Tính Năng
- Email scheduling
- Email tracking
- Unsubscribe functionality
- Email analytics
