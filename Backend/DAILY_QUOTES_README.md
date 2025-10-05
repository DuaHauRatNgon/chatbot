# Daily Quotes Feature Documentation

## Tổng quan
Tính năng Daily Quotes cho phép gửi quotes ý nghĩa hàng ngày cho người dùng đã đăng ký thông qua email tự động.

## 🏗️ Kiến trúc hệ thống

### **Database Models:**
1. **Quote** - Lưu trữ các quotes
2. **UserEmailSettings** - Cài đặt email của user
3. **EmailHistory** - Lịch sử gửi email

### **Services:**
1. **DailyQuotesService** - Logic gửi quotes hàng ngày
2. **EmailService** - Gửi email với template đẹp
3. **SchedulerService** - Tự động hóa việc gửi email

### **Controllers & Routes:**
1. **QuotesController** - API quản lý quotes
2. **EmailController** - API gửi email
3. **Routes** - Endpoints RESTful

## 📊 Dữ liệu người dùng được lưu trữ

**Database**: MongoDB
**Collection**: `users`
**Location**: `Backend/model/user.js`

**Thông tin được lưu**:
- `name`: Tên người dùng
- `email`: Email (unique) - **Được sử dụng để gửi quotes**
- `hashedPassword`: Mật khẩu đã mã hóa
- `age`: Tuổi
- `gender`: Giới tính
- `role`: Vai trò (admin/customer)
- `created_at`: Ngày tạo tài khoản

## 🚀 Cài đặt và chạy

### **1. Cài đặt dependencies:**
```bash
npm install nodemailer node-cron
```

### **2. Cấu hình email trong `.env`:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

### **3. Seed dữ liệu quotes mẫu:**
```bash
node seed-quotes.js
```

### **4. Chạy server:**
```bash
npm start
```

Scheduler sẽ tự động khởi động và gửi quotes hàng ngày lúc 8:00 AM (Vietnam time).

## 📧 Tính năng Email

### **Tự động gửi:**
- **Email chào mừng**: Khi user đăng ký thành công
- **Daily Quotes**: Mỗi ngày lúc 8:00 AM
- **Backup sending**: Lúc 9:00 AM nếu job đầu thất bại

### **Templates:**
- **Welcome Email**: Template chào mừng đẹp mắt
- **Daily Quote Email**: Template quotes với gradient background
- **Custom Email**: Template linh hoạt

## 🔧 API Endpoints

### **Quotes Management (Admin only):**
```
GET    /api/quotes                    - Lấy tất cả quotes
POST   /api/quotes                    - Tạo quote mới
PUT    /api/quotes/:id                - Cập nhật quote
DELETE /api/quotes/:id                 - Xóa quote
GET    /api/quotes/stats              - Thống kê quotes
```

### **Daily Quotes:**
```
POST   /api/quotes/send-daily         - Gửi quotes cho tất cả user (Admin)
```

### **User Email Settings:**
```
GET    /api/quotes/user/:userId/settings    - Lấy cài đặt email
PUT    /api/quotes/user/:userId/settings    - Cập nhật cài đặt email
GET    /api/quotes/user/:userId/history     - Lịch sử email
```

### **Email Management:**
```
POST   /api/emails/welcome/:userId          - Gửi email chào mừng
POST   /api/emails/custom                   - Gửi email tùy chỉnh
POST   /api/emails/bulk                     - Gửi email hàng loạt
GET    /api/emails/status                   - Kiểm tra trạng thái email
```

## ⚙️ Cài đặt User

### **Cài đặt mặc định khi đăng ký:**
```json
{
  "isDailyQuotesEnabled": true,
  "preferredTime": "08:00",
  "preferredLanguage": "vi",
  "preferredCategories": ["motivation", "success", "life"]
}
```

### **Cập nhật cài đặt:**
```json
PUT /api/quotes/user/:userId/settings
{
  "isDailyQuotesEnabled": true,
  "preferredTime": "09:00",
  "preferredLanguage": "en",
  "preferredCategories": ["wisdom", "inspiration"]
}
```

## 📅 Scheduler

### **Jobs tự động:**
- **8:00 AM**: Gửi quotes hàng ngày
- **9:00 AM**: Backup gửi quotes
- **Chủ nhật 00:00**: Cleanup logs

### **Quản lý scheduler:**
```javascript
// Khởi động
schedulerService.start();

// Dừng
schedulerService.stop();

// Restart
schedulerService.restart();

// Chạy job ngay lập tức
schedulerService.runJobNow('dailyQuotes');
```

## 🧪 Testing

### **Test email service:**
```bash
node test-email-config.js
```

### **Test daily quotes:**
```bash
node test-daily-quotes.js
```

### **Test gửi email:**
```bash
node send-test-email.js
```

## 📊 Categories và Languages

### **Categories:**
- `motivation` - Động lực
- `success` - Thành công  
- `life` - Cuộc sống
- `love` - Tình yêu
- `wisdom` - Trí tuệ
- `inspiration` - Cảm hứng

### **Languages:**
- `vi` - Tiếng Việt
- `en` - English

## 🔒 Bảo mật

### **Authentication:**
- Tất cả endpoints đều yêu cầu JWT token
- Admin-only endpoints được bảo vệ bằng role-based access

### **Email Security:**
- Sử dụng Gmail App Password
- Không lưu mật khẩu trong code
- Rate limiting để tránh spam

## 📈 Monitoring

### **Email History:**
- Lưu trữ lịch sử gửi email
- Tracking status (sent/failed/pending)
- Message ID để debug

### **Logs:**
- Console logs cho mọi hoạt động
- Error tracking và reporting
- Performance monitoring

## 🚀 Mở rộng

### **Thêm email provider:**
- SendGrid
- Mailgun
- AWS SES

### **Thêm tính năng:**
- Email scheduling
- A/B testing templates
- Analytics dashboard
- Unsubscribe management

## 🐛 Troubleshooting

### **Email không gửi được:**
1. Kiểm tra EMAIL_USER và EMAIL_PASSWORD
2. Đảm bảo đã tạo Gmail App Password
3. Kiểm tra kết nối internet

### **Scheduler không chạy:**
1. Kiểm tra timezone settings
2. Restart server
3. Kiểm tra logs

### **Quotes không có:**
1. Chạy `node seed-quotes.js`
2. Kiểm tra database connection
3. Verify quotes are active

## 📝 Example Usage

### **Tạo quote mới:**
```bash
curl -X POST http://localhost:5000/api/quotes \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Thành công là tổng của những nỗ lực nhỏ được lặp lại ngày qua ngày.",
    "author": "Robert Collier",
    "category": "success",
    "language": "vi"
  }'
```

### **Gửi quotes ngay lập tức:**
```bash
curl -X POST http://localhost:5000/api/quotes/send-daily \
  -H "Authorization: Bearer <admin-token>"
```

### **Cập nhật cài đặt user:**
```bash
curl -X PUT http://localhost:5000/api/quotes/user/:userId/settings \
  -H "Authorization: Bearer <user-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "isDailyQuotesEnabled": true,
    "preferredTime": "09:00",
    "preferredCategories": ["motivation", "wisdom"]
  }'
```

---

**Tính năng Daily Quotes đã sẵn sàng sử dụng! 🎉**

Người dùng sẽ nhận được quotes ý nghĩa hàng ngày qua email với template đẹp mắt và có thể tùy chỉnh cài đặt theo sở thích.
