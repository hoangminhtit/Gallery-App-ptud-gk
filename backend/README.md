# Gallery App Backend

Ứng dụng thư viện ảnh cá nhân được xây dựng bằng **FastAPI**.

## Tính Năng

- ✅ Đăng ký và đăng nhập người dùng
- ✅ Tải ảnh lên và lưu trữ
- ✅ Xem danh sách ảnh của người dùng
- ✅ Xem chi tiết ảnh
- ✅ Chỉnh sửa thông tin ảnh (tên, mô tả)
- ✅ Xóa ảnh
- ✅ Tìm kiếm ảnh theo tên
- ✅ Hệ thống role (User và Admin)
- ✅ Quản lý người dùng (Admin only)

## Yêu Cầu

- Python 3.8+
- pip (Python package manager)

## Cài Đặt

1. **Di chuyển vào thư mục backend**
```bash
cd backend
```

2. **Tạo virtual environment** (tùy chọn nhưng khuyến khích)
```bash
python -m venv venv

# Trên Windows:
venv\Scripts\activate

# Trên macOS/Linux:
source venv/bin/activate
```

3. **Cài đặt dependencies**
```bash
pip install -r requirements.txt
```

## Chạy Ứng Dụng

```bash
python app.py
```

Ứng dụng sẽ chạy tại `http://localhost:8000`

### Xem API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Cấu Trúc Cơ Sở Dữ Liệu

### User (Người Dùng)
- `id`: Mã người dùng (Integer, Primary Key)
- `username`: Tên đăng nhập (String, Unique)
- `email`: Email (String, Unique)
- `password`: Mật khẩu (String, hashed)
- `role`: Vai trò (Enum: 'user' hoặc 'admin')
- `created_at`: Thời gian tạo tài khoản (DateTime)

### Photo (Ảnh)
- `id`: Mã ảnh (Integer, Primary Key)
- `title`: Tên ảnh (String)
- `description`: Mô tả ảnh (String, Optional)
- `image_url`: Đường dẫn lưu trữ ảnh (String)
- `uploaded_at`: Thời gian tải lên (DateTime)
- `user_id`: Mã người dùng (Integer, Foreign Key)

## API Endpoints

### Authentication (Xác Thực)

#### Đăng Ký
```
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Đăng Nhập
```
POST /auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword"
}
```

### Users (Người Dùng)

#### Lấy Thông Tin Người Dùng Hiện Tại
```
GET /users/me
Authorization: Bearer {token}
```

#### Danh Sách Tất Cả Người Dùng (Admin Only)
```
GET /users
Authorization: Bearer {token}
```

### Photos (Ảnh)

#### Tải Ảnh Lên
```
POST /photos
Authorization: Bearer {token}
Content-Type: multipart/form-data

- title (required): Tên ảnh
- description (optional): Mô tả ảnh
- file (required): Tệp ảnh
```

#### Lấy Danh Sách Ảnh (Có Tìm Kiếm)
```
GET /photos?search=tên+ảnh
Authorization: Bearer {token}
```

#### Lấy Chi Tiết Ảnh
```
GET /photos/{photo_id}
Authorization: Bearer {token}
```

#### Cập Nhật Ảnh
```
PUT /photos/{photo_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Tên ảnh mới",
  "description": "Mô tả mới"
}
```

#### Xóa Ảnh
```
DELETE /photos/{photo_id}
Authorization: Bearer {token}
```

### Admin Endpoints

#### Xóa Người Dùng (Admin Only)
```
DELETE /admin/users/{user_id}
Authorization: Bearer {token}
```

#### Cập Nhật Vai Trò Người Dùng (Admin Only)
```
POST /admin/users/{user_id}/role
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "admin"
}
```

## Biến Môi Trường

Bạn có thể tạo file `.env` để cấu hình (tùy chọn):

```
SECRET_KEY=your-secret-key-change-in-production
DATABASE_URL=sqlite:///./gallery.db
UPLOAD_FOLDER=uploads
```

## Ghi Chú Bảo Mật

⚠️ **QUAN TRỌNG**: Trước khi deploy vào production:
1. Thay đổi `SECRET_KEY` thành một chuỗi ngẫu nhiên an toàn
2. Sử dụng cơ sở dữ liệu PostgreSQL thay vì SQLite
3. Bật HTTPS
4. Thiết lập CORS đúng cách cho domain của bạn

## Cấu Trúc Thư Mục

```
backend/
├── app.py              # File chính của ứng dụng
├── requirements.txt    # Danh sách dependencies
├── uploads/            # Thư mục lưu trữ ảnh
└── gallery.db          # Database SQLite (tự động tạo)
```

## Lỗi Thường Gặp

### Port 8000 đã được sử dụng
```bash
python -m uvicorn app:app --port 8001
```

### Lỗi Import
Đảm bảo đã cài đặt tất cả dependencies:
```bash
pip install -r requirements.txt
```

### Lỗi Permission khi lưu ảnh
Đảm bảo thư mục `uploads` tồn tại và có quyền ghi.

## Support

Nếu bạn gặp vấn đề, vui lòng kiểm tra:
- Log của ứng dụng
- Cơ sở dữ liệu có phải là SQLite hỗ trợ không
- Quyền truy cập thư mục
