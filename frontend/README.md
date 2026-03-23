# Gallery App Frontend

Ứng dụng thư viện ảnh cá nhân được xây dựng bằng **React + Vite**.

## Tính Năng

- ✅ Giao diện người dùng hiện đại
- ✅ Đăng ký và đăng nhập
- ✅ Tải ảnh lên
- ✅ Xem danh sách ảnh trong grid layout
- ✅ Xem chi tiết ảnh
- ✅ Chỉnh sửa tên và mô tả ảnh
- ✅ Xóa ảnh
- ✅ Tìm kiếm ảnh theo tên (real-time)
- ✅ Responsive design (hoạt động tốt trên mobile)
- ✅ Authentication với JWT tokens

## Yêu Cầu

- Node.js 14+
- npm hoặc yarn

## Cài Đặt

1. **Di chuyển vào thư mục frontend**
```bash
cd frontend
```

2. **Cài đặt dependencies**
```bash
npm install
```

## Chạy Ứng Dụng (Development)

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## Build cho Production

```bash
npm run build
```

Tệp build sẽ nằm trong thư mục `dist/`.

## Preview Production Build

```bash
npm run preview
```

## Dependency

- **react**: Framework UI
- **react-dom**: React DOM rendering
- **react-router-dom**: Routing
- **axios**: HTTP client

## Cấu Trúc Thư Mục

```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx           # Trang đăng nhập
│   │   ├── Register.jsx        # Trang đăng ký
│   │   ├── Gallery.jsx         # Trang chính (danh sách ảnh)
│   │   ├── PhotoCard.jsx       # Component hiển thị ảnh nhỏ
│   │   ├── PhotoDetailModal.jsx# Modal xem chi tiết ảnh
│   │   ├── UploadModal.jsx     # Modal tải ảnh lên
│   │   └── ProtectedRoute.jsx  # Component bảo vệ route
│   ├── styles/
│   │   ├── AuthForms.css       # Style cho login/register
│   │   ├── Gallery.css         # Style cho gallery
│   │   ├── PhotoCard.css       # Style cho photo card
│   │   └── Modal.css           # Style cho modals
│   ├── AuthContext.jsx         # Context für authentication
│   ├── api.js                  # API client setup
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # App styles
│   ├── index.css               # Global styles
│   ├── main.jsx                # Entry point
│   └── assets/                 # Static assets
├── public/                     # Public files
├── package.json
├── vite.config.js
└── index.html
```

## API Configuration

Ứng dụng mặc định kết nối đến backend tại `http://localhost:8000`.

Để thay đổi URL của API, chỉnh sửa trong `src/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000'; // Thay đổi URL ở đây
```

## Sử Dụng

1. **Đăng Ký Tài Khoản**
   - Truy cập `/register`
   - Nhập tên đăng nhập, email và mật khẩu
   - Nhấn "Đăng Ký"

2. **Đăng Nhập**
   - Truy cập `/login`
   - Nhập tên đăng nhập và mật khẩu
   - Nhấn "Đăng Nhập"

3. **Tải Ảnh Lên**
   - Nhấn nút "+ Tải ảnh lên"
   - Nhập tên ảnh (bắt buộc)
   - Nhập mô tả (tùy chọn)
   - Chọn tệp ảnh
   - Nhấn "Tải ảnh lên"

4. **Xem Danh Sách Ảnh**
   - Ảnh được hiển thị dưới dạng grid
   - Khi hover vào ảnh, sẽ hiện nút xóa

5. **Xem Chi Tiết Ảnh**
   - Nhấn vào ảnh để xem chi tiết
   - Có thể chỉnh sửa tên và mô tả
   - Có thể xóa ảnh từ đây

6. **Tìm Kiếm Ảnh**
   - Sử dụng ô tìm kiếm ở đầu trang
   - Tìm kiếm theo tên ảnh
   - Kết quả cập nhật în real-time

## Style

Ứng dụng sử dụng gradient màu tím (`#667eea` đến `#764ba2`) làm theme chính.

Bạn có thể tùy chỉnh màu sắc bằng cách sửa các giá trị hex trong các file CSS.

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Responsive Design

Ứng dụng hỗ trợ tốt trên các thiết bị:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## Troubleshooting

### Lỗi "Cannot find module"
```bash
npm install
```

### Port 5173 đã được sử dụng
```bash
npm run dev -- --port 5174
```

### Backend không phản hồi
- Đảm bảo backend đang chạy tại `http://localhost:8000`
- Kiểm tra CORS configuration trong backend

### Ảnh không tải
- Kiểm tra đường dẫn API trong `src/api.js`
- Đảm bảo thư mục `uploads` tồn tại trong backend
- Kiểm tra browser console cho lỗi CORS

## Support

Nếu bạn gặp vấn đề:
1. Mở browser DevTools (F12)
2. Kiểm tra Console tab cho lỗi
3. Kiểm tra Network tab xem request/response
