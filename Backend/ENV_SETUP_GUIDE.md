# 🔧 Hướng dẫn Setup Environment Variables

## 1. Thêm vào file `.env`

Mở file `Backend/.env` và thêm:

```env
# ====================================
# JAMENDO MUSIC API
# ====================================
# Đăng ký miễn phí tại: https://devportal.jamendo.com/
JAMENDO_CLIENT_ID=your_actual_client_id_here

# Bật/tắt Jamendo API (true = dùng API, false = dùng local files)
USE_JAMENDO_API=true
```

## 2. Ví dụ Client ID

Client ID sẽ có dạng: `a1b2c3d4` (8 ký tự hexadecimal)

## 3. Test với Client ID mẫu (Limited)

Nếu chưa đăng ký, có thể test với client ID public (giới hạn):
```env
JAMENDO_CLIENT_ID=56d30c95
```

⚠️ **Lưu ý**: Client ID này là public, có thể bị rate limit. Nên đăng ký để có API key riêng.

## 4. Fallback Mode

Nếu không muốn dùng Jamendo API, set:
```env
USE_JAMENDO_API=false
```
Hệ thống sẽ tự động dùng local files trong `uploadMusic/`.

## 5. Kiểm tra cấu hình

Sau khi thêm, restart server:
```bash
cd Backend
npm start
```

Xem console log:
- ✅ `🎵 Fetching music from Jamendo API...` → Đang dùng API
- ✅ `🎵 Using local music files...` → Đang dùng local
- ⚠️ `Jamendo API error, falling back...` → API lỗi, chuyển sang local
