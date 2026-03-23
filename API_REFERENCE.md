# 📚 API Reference - Hướng Dẫn Chi Tiết API

## 🔗 Base URL
```
http://localhost:8000
```

## 🔐 Authentication

Tất cả endpoints (ngoại trừ `POST /auth/register` và `POST /auth/login`) cần token:

```
Authorization: Bearer {access_token}
```

Token nhận được từ response của login/register, có thể dùng 30 phút.

---

## 📋 API Endpoints

### 🔓 Endpoints Công Khai (Public)

#### 1. Đăng Ký Tài Khoản

```
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-01-01T10:00:00"
  }
}
```

**Lỗi (400)**:
```json
{
  "detail": "Username or email already registered"
}
```

---

#### 2. Đăng Nhập

```
POST /auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response (200)**: Giống register response

**Lỗi (401)**:
```json
{
  "detail": "Invalid credentials"
}
```

---

### 🔒 Endpoints Có Bảo Vệ (Protected)

#### 3. Lấy Thông Tin User Hiện Tại

```
GET /users/me
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "user",
  "created_at": "2024-01-01T10:00:00"
}
```

---

#### 4. Tải Ảnh Lên

```
POST /photos
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- title: string (required) - Tên ảnh
- description: string (optional) - Mô tả ảnh
- file: file (required) - Tệp ảnh (PNG, JPG, GIF, etc.)
```

**Example cURL**:
```bash
curl -X POST "http://localhost:8000/photos" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=My Photo" \
  -F "description=A beautiful photo" \
  -F "file=@/path/to/image.jpg"
```

**Response (200)**:
```json
{
  "id": 1,
  "title": "My Photo",
  "description": "A beautiful photo",
  "image_url": "/uploads/image_abc123xyz789.jpg",
  "uploaded_at": "2024-01-01T10:00:00",
  "user_id": 1
}
```

**Lỗi (400)**:
```json
{
  "detail": "File must be an image"
}
```

---

#### 5. Lấy Danh Sách Ảnh

```
GET /photos
Authorization: Bearer {token}

Query Parameters:
- search: string (optional) - Tìm kiếm theo tên ảnh
```

**Examples**:
```
GET /photos
GET /photos?search=vacation
GET /photos?search=family+photo
```

**Response (200)**:
```json
[
  {
    "id": 1,
    "title": "My Photo",
    "description": "A beautiful photo",
    "image_url": "/uploads/image_abc123xyz789.jpg",
    "uploaded_at": "2024-01-01T10:00:00",
    "user_id": 1
  },
  {
    "id": 2,
    "title": "Family Picture",
    "description": null,
    "image_url": "/uploads/family_xyz789abc123.png",
    "uploaded_at": "2024-01-01T11:00:00",
    "user_id": 1
  }
]
```

---

#### 6. Lấy Chi Tiết Ảnh

```
GET /photos/{photo_id}
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "id": 1,
  "title": "My Photo",
  "description": "A beautiful photo",
  "image_url": "/uploads/image_abc123xyz789.jpg",
  "uploaded_at": "2024-01-01T10:00:00",
  "user_id": 1
}
```

**Lỗi (404)**:
```json
{
  "detail": "Photo not found"
}
```

**Lỗi (403)**:
```json
{
  "detail": "You don't have permission to view this photo"
}
```

---

#### 7. Cập Nhật Ảnh

```
PUT /photos/{photo_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "New Title",
  "description": "New description"
}
```

**Note**: Cả title và description đều optional, chỉ cần gửi field cần thay đổi.

**Response (200)**:
```json
{
  "id": 1,
  "title": "New Title",
  "description": "New description",
  "image_url": "/uploads/image_abc123xyz789.jpg",
  "uploaded_at": "2024-01-01T10:00:00",
  "user_id": 1
}
```

---

#### 8. Xóa Ảnh

```
DELETE /photos/{photo_id}
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "message": "Photo deleted successfully"
}
```

---

### 👥 User Endpoints (User có thể dùng)

#### 9. Danh Sách Tất Cả Users (Lấy thông tin người khác)

```
GET /users
Authorization: Bearer {token}
```

**Response (200)**:
```json
[
  {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-01-01T10:00:00"
  },
  {
    "id": 2,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "created_at": "2024-01-01T09:00:00"
  }
]
```

---

### 👮 Admin Endpoints (Chỉ dành cho Admin)

#### 10. Xóa User (Admin Only)

```
DELETE /admin/users/{user_id}
Authorization: Bearer {admin_token}
```

**Note**: Xóa user sẽ xóa tất cả ảnh của user đó.

**Response (200)**:
```json
{
  "message": "User deleted successfully"
}
```

**Lỗi (403)**:
```json
{
  "detail": "You don't have permission to perform this action"
}
```

---

#### 11. Cập Nhật Vai Trò User (Admin Only)

```
POST /admin/users/{user_id}/role
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "role": "admin"
}
```

**Values cho role**:
- `"user"` - User thường
- `"admin"` - Admin

**Response (200)**:
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "admin",
  "created_at": "2024-01-01T10:00:00"
}
```

---

## 📊 Status Codes

| Code | Ý Nghĩa |
|------|---------|
| 200 | OK - Request thành công |
| 201 | Created - Tài nguyên được tạo |
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Cần đăng nhập |
| 403 | Forbidden - Không có quyền |
| 404 | Not Found - Không tìm thấy tài nguyên |
| 500 | Server Error - Lỗi server |

---

## 🧪 Test API bằng Swagger

1. Mở: `http://localhost:8000/docs`
2. Click vào endpoint muốn test
3. Click "Try it out"
4. Fill các parameter
5. Click "Execute"

---

## 🧪 Test API bằng cURL

### Đăng Ký
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Đăng Nhập
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Lấy User Info
```bash
curl -X GET "http://localhost:8000/users/me" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Lấy Danh Sách Ảnh
```bash
curl -X GET "http://localhost:8000/photos" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Tạo Ảnh
```bash
curl -X POST "http://localhost:8000/photos" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=My Photo" \
  -F "file=@/path/to/image.jpg"
```

---

## 🧪 Test API bằng JavaScript/Axios

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8000';
const token = localStorage.getItem('access_token');

// Tải ảnh
const uploadPhoto = async () => {
  const formData = new FormData();
  formData.append('title', 'My Photo');
  formData.append('description', 'A nice photo');
  formData.append('file', fileInput.files[0]);

  const response = await axios.post(`${API_URL}/photos`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });

  console.log(response.data);
};

// Lấy ảnh
const getPhotos = async (search = '') => {
  const response = await axios.get(`${API_URL}/photos`, {
    params: { search },
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log(response.data);
};

// Update ảnh
const updatePhoto = async (photoId, title, description) => {
  const response = await axios.put(
    `${API_URL}/photos/${photoId}`,
    { title, description },
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  console.log(response.data);
};

// Xóa ảnh
const deletePhoto = async (photoId) => {
  const response = await axios.delete(
    `${API_URL}/photos/${photoId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  console.log(response.data);
};
```

---

## 🔒 Rate Limiting

Hiện tại API không có rate limiting. Trong production, nên thêm rate limiting!

---

## 📝 Ghi Chú

1. **Token Expiration**: Token hết hạn sau 30 phút, cần đăng nhập lại
2. **CORS**: Chỉ cho phép requests từ `http://localhost:5173`
3. **File Size**: Không có giới hạn kích thước file (tùy server config)
4. **Image Types**: Hỗ trợ tất cả image types (JPG, PNG, GIF, WebP, etc.)

---

## 🆘 Common Errors

| Error | Nguyên Nhân | Giải Pháp |
|-------|-----------|----------|
| 401 Unauthorized | Token không hợp lệ/hết hạn | Đăng nhập lại |
| 403 Forbidden | Không có quyền | Kiểm tra role/ownership |
| 404 Not Found | Resource không tồn tại | Kiểm tra ID |
| 400 Bad Request | Dữ liệu sai | Kiểm tra request body |

---

**Xem thêm chi tiết tại**: `http://localhost:8000/docs`
