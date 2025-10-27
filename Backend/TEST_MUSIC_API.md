# 🧪 Test Music API Endpoints

## Chuẩn bị

1. Đảm bảo Backend đang chạy:
```bash
cd Backend
npm start
```

2. Server khởi động ở: http://localhost:5000

---

## Test Case 1: Lấy tất cả nhạc thư giãn

### Request
```bash
GET http://localhost:5000/api/musics
```

### Sử dụng curl:
```bash
curl http://localhost:5000/api/musics
```

### Sử dụng browser:
Mở trình duyệt: http://localhost:5000/api/musics

### Expected Response (Jamendo API):
```json
{
  "success": true,
  "source": "jamendo",
  "message": "Nhạc từ Jamendo API",
  "data": [
    {
      "_id": "jamendo_12345",
      "title": "Peaceful Morning",
      "artist": "Artist Name",
      "duration": "3:45",
      "file_url": "https://mp3d.jamendo.com/...",
      "stream_url": "https://mp3d.jamendo.com/...",
      "image": "https://usercontent.jamendo.com/...",
      "album": "Album Name",
      "source": "jamendo",
      "tags": "relaxation, meditation"
    },
    // ... 19 tracks more
  ]
}
```

### Expected Response (Local Files):
```json
{
  "success": true,
  "source": "local",
  "message": "Nhạc từ thư viện local",
  "data": [
    {
      "_id": "mongodb_object_id",
      "title": "Adam Simons - No Time",
      "artist": "Local Artist",
      "duration": "3:25",
      "file_url": "http://localhost:5000/music/Adam Simons - No Time.mp3",
      "stream_url": "http://localhost:5000/music/Adam Simons - No Time.mp3",
      "source": "local"
    }
  ]
}
```

---

## Test Case 2: Tìm kiếm nhạc

### Request
```bash
GET http://localhost:5000/api/musics/search?q=piano&limit=10
```

### Curl:
```bash
curl "http://localhost:5000/api/musics/search?q=piano&limit=10"
```

### Expected Response:
```json
{
  "success": true,
  "source": "jamendo",
  "query": "piano",
  "data": [
    {
      "_id": "jamendo_67890",
      "title": "Piano Dreams",
      "artist": "Piano Artist",
      "duration": "4:12",
      "file_url": "...",
      "tags": "piano, instrumental"
    }
  ]
}
```

---

## Test Case 3: Nhạc theo tâm trạng

### Request
```bash
GET http://localhost:5000/api/musics/mood/meditation?limit=15
```

### Available Moods:
- `relaxation` - Thư giãn
- `meditation` - Thiền định
- `calm` - Bình tĩnh
- `peaceful` - Yên bình
- `energetic` - Năng động
- `focus` - Tập trung
- `sleep` - Ngủ ngon

### Curl:
```bash
curl "http://localhost:5000/api/musics/mood/meditation?limit=15"
```

### Expected Response:
```json
{
  "success": true,
  "source": "jamendo",
  "mood": "meditation",
  "message": "Nhạc phù hợp với tâm trạng: meditation",
  "data": [...]
}
```

---

## Troubleshooting

### ❌ Lỗi: "Jamendo API key không hợp lệ"
**Giải pháp:**
1. Kiểm tra `JAMENDO_CLIENT_ID` trong `.env`
2. Đảm bảo đã restart server sau khi sửa `.env`
3. Thử Client ID public: `56d30c95`

### ❌ Lỗi: "Jamendo API error, falling back to local files"
**Nguyên nhân:**
- API key hết quota
- Mất kết nối internet
- Jamendo service down

**Giải pháp:**
- Hệ thống tự động fallback về local files → OK!
- Hoặc set `USE_JAMENDO_API=false` trong `.env`

### ❌ Lỗi: "data: []" - Không có nhạc
**Giải pháp Local Files:**
1. Kiểm tra MongoDB có dữ liệu chưa:
```bash
# Kết nối MongoDB
mongo
use your_database_name
db.musics.find()
```

2. Nếu collection rỗng, cần seed data hoặc dùng Jamendo API

### ✅ Cách kiểm tra nhanh
```bash
# Test với Postman, Insomnia, hoặc curl
curl -i http://localhost:5000/api/musics

# Xem response header
# Status: 200 OK → Thành công
# Status: 500 → Lỗi server (check console logs)
```

---

## Console Logs mong đợi

### ✅ Thành công với Jamendo API:
```
Example app listening at http://localhost:5000
🎵 Fetching music from Jamendo API...
```

### ✅ Thành công với Local Files:
```
Example app listening at http://localhost:5000
🎵 Fetching music from Jamendo API...
⚠️ Jamendo API error, falling back to local files: ...
🎵 Using local music files...
```

### ❌ Lỗi cần fix:
```
❌ Error: Jamendo API key không hợp lệ...
```

---

## Test với Postman (Recommended)

1. **Import Collection**: Tạo collection "Music API"
2. **Endpoint 1**: GET `{{base_url}}/api/musics`
3. **Endpoint 2**: GET `{{base_url}}/api/musics/search?q=piano`
4. **Endpoint 3**: GET `{{base_url}}/api/musics/mood/meditation`
5. **Variable**: `base_url = http://localhost:5000`

---

## Next Steps sau khi test thành công

1. ✅ Backend API hoạt động
2. ⏭️ Cập nhật Frontend Music component
3. ⏭️ Test integration Frontend + Backend
4. ⏭️ Deploy production
