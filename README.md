# Gallery App - Ứng Dụng Thư Viện Ảnh Cá Nhân

Ứng dụng web cho phép người dùng tải ảnh lên, xem ảnh và quản lý ảnh của mình. Ứng dụng giống như một thư viện ảnh cá nhân đơn giản.

## 📋 Tính Năng

### Người Dùng Thường (User)
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập vào tài khoản
- ✅ Tải ảnh lên thư viện (với tên và mô tả)
- ✅ Xem danh sách toàn bộ ảnh của mình
- ✅ Xem chi tiết ảnh (tên, mô tả, thời gian tải)
- ✅ Chỉnh sửa tên hoặc mô tả ảnh
- ✅ Xóa ảnh khỏi thư viện
- ✅ Tìm kiếm ảnh theo tên (real-time search)

### Quản Trị Viên (Admin)
- ✅ Tất cả quyền của User
- ✅ Xem danh sách tất cả người dùng trong hệ thống
- ✅ Xóa người dùng (và tất cả ảnh của họ)
- ✅ Cập nhật vai trò của người dùng

## 🛠️ Công Nghệ Sử Dụng

| Thành Phần | Công Nghệ |
|-----------|-----------|
| **Backend** | FastAPI (Python) |
| **Frontend** | React.js + Vite |
| **Database** | SQLite |
| **Authentication** | JWT (JSON Web Tokens) |
| **HTTP Client** | Axios |

## 📦 Cấu Trúc Dự Án

```
gallery-app/
├── backend/              # FastAPI Backend
│   ├── app.py           # Ứng dụng chính
│   ├── requirements.txt  # Python dependencies
│   ├── uploads/         # Thư mục lưu trữ ảnh
│   └── gallery.db       # Cơ sở dữ liệu SQLite
│
├── frontend/             # React Frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── styles/      # CSS styles
│   │   ├── api.js       # API client
│   │   ├── AuthContext.jsx  # Authentication context
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
└── README.md            # File này
```

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu
- **Python 3.8+** (cho backend)
- **Node.js 14+** (cho frontend)
- **npm hoặc yarn**

### 1. Clone hoặc Download Dự Án
```bash
# Nếu sử dụng git
git clone <repository_url>
cd gallery-app
```

### 2. Cài Đặt Backend

```bash
cd backend

# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy ứng dụng
python app.py
```

Backend sẽ chạy tại: **http://localhost:8000**

**Tài liệu API**: http://localhost:8000/docs

### 3. Cài Đặt Frontend

Mở terminal mới (giữ backend đang chạy)

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy ứng dụng development
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

## 📖 Cách Sử Dụng

### Lần Đầu Tiên

1. Mở trình duyệt và truy cập: **http://localhost:5173**
2. Nhấn "Đăng Ký" để tạo tài khoản mới
3. Nhập thông tin:
   - Tên đăng nhập (username)
   - Email
   - Mật khẩu (ít nhất 6 ký tự)
4. Nhấn "Đăng Ký"

### Sau Khi Đăng Ký

1. **Tải Ảnh Lên**: Nhấn nút "+ Tải ảnh lên"
   - Nhập tên ảnh
   - Thêm mô tả (tùy chọn)
   - Chọn file ảnh từ máy
   - Nhấn "Tải ảnh lên"

2. **Xem Ảnh**: Ảnh sẽ hiển thị dưới dạng grid
   - Hover vào ảnh để thấy nút xóa
   - Nhấn vào ảnh để xem chi tiết

3. **Chỉnh Sửa Ảnh**: 
   - Nhấn vào ảnh để xem chi tiết
   - Nhấn "Chỉnh sửa"
   - Thay đổi tên hoặc mô tả
   - Nhấn "Lưu"

4. **Tìm Kiếm**:
   - Sử dụng ô tìm kiếm ở đầu trang
   - Kết quả cập nhật trong khi bạn gõ

## 🗄️ Cấu Trúc Dữ Liệu

### User (Người Dùng)
```
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "user",  // "user" hoặc "admin"
  "created_at": "2024-01-01T10:00:00"
}
```

### Photo (Ảnh)
```
{
  "id": 1,
  "title": "Ảnh gia đình",
  "description": "Ảnh chụp tại công viên",
  "image_url": "/uploads/photo_abc123.jpg",
  "uploaded_at": "2024-01-01T10:00:00",
  "user_id": 1
}
```

## 🔐 Bảo Mật

- ✅ Mật khẩu được hash bằng bcrypt
- ✅ Authentication sử dụng JWT token
- ✅ Token hết hạn sau 30 phút
- ✅ Người dùng chỉ có thể xem/sửa/xóa ảnh của mình
- ✅ CORS được cấu hình untuk communication an toàn

## 🐛 Troubleshooting

### Backend

**Lỗi**: Port 8000 đã được sử dụng
```bash
python -m uvicorn app:app --port 8001
```

**Lỗi**: Module not found
```bash
pip install -r requirements.txt
```

**Lỗi**: Database locked
- Đóng tất cả tab đang truy cập ứng dụng
- Xóa file `gallery.db` nếu cần (sẽ tạo lại)

### Frontend

**Lỗi**: npm ERR! 404 Not Found
```bash
npm cache clean --force
npm install
```

**Lỗi**: Port 5173 đã được sử dụng
```bash
npm run dev -- --port 5174
```

**Lỗi**: Backend không phản hồi
- Kiểm tra xem backend đang chạy: http://localhost:8000/docs
- Kiểm tra browser console (F12) cho lỗi CORS

## 📚 API Documentation

Sau khi chạy backend, bạn có thể xem tài liệu API đầy đủ tại:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🎨 Tùy Chỉnh

### Thay Đổi Màu
Chỉnh sửa các giá trị hex trong `frontend/src/styles/`:
```css
/* Thay đổi từ */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Thành */
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

### Thay Đổi Port Backend
Chỉnh sửa trong `frontend/src/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000'; // Thay đổi port ở đây
```

## 📱 Responsive Design

Ứng dụng hỗ trợ hoàn toàn các kích thước màn hình:
- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: < 768px

## 🔄 Build cho Production

### Backend
```bash
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run build
# Tệp build sẽ nằm trong thư mục 'dist/'
# Deploy thư mục này lên server
```

## 📝 Ghi Chú

- Ảnh được lưu trong thư mục `backend/uploads/`
- Database SQLite được lưu tại `backend/gallery.db`
- Tokens tự động lưu trong localStorage
- Ứng dụng sẽ tự động đăng xuất khi token hết hạn

## 🤝 Contribute

Nếu bạn muốn cải thiện ứng dụng:
1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -am 'Add improvement'`)
4. Push lên branch (`git push origin feature/improvement`)
5. Tạo Pull Request

## 📄 License

Dự án này được cấp phép theo MIT License.

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi:
1. Kiểm tra phần Troubleshooting
2. Xem chi tiết lỗi trong browser console (F12)
3. Kiểm tra logs của backend

---

**Chúc bạn sử dụng ứng dụng vui vẻ! 📸**
