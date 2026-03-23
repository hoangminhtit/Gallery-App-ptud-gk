# Setup Guide - Hướng Dẫn Cài Đặt Chi Tiết

## 📋 Bước-Bước Cài Đặt

### Bước 1: Cài Đặt Backend (FastAPI)

#### 1.1 Mở Terminal/Command Prompt

```bash
# Windows: Nhấn Win + R, gõ cmd
# macOS/Linux: Mở Terminal
```

#### 1.2 Di chuyển vào thư mục project

```bash
cd path/to/gallery-app
cd backend
```

#### 1.3 Tạo Virtual Environment

```bash
# Tạo venv
python -m venv venv

# Kích hoạt venv
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate
```

Bạn sẽ thấy tên venv xuất hiện ở đầu terminal: `(venv) C:\path\to\backend>`

#### 1.4 Cài Đặt Dependencies

```bash
pip install -r requirements.txt
```

Quá trình này sẽ cài đặt tất cả các package cần thiết.

#### 1.5 Chạy Backend

```bash
python app.py
```

Bạn sẽ thấy output giống thế này:
```
Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

✅ Backend đang chạy!

**Tài liệu API**: Mở trình duyệt, truy cập http://localhost:8000/docs

---

### Bước 2: Cài Đặt Frontend (React + Vite)

#### 2.1 Mở Terminal/Command Prompt Mới

⚠️ **Rất quan trọng**: Mở terminal mới, không đóng terminal backend!

#### 2.2 Di chuyển vào thư mục frontend

```bash
cd path/to/gallery-app
cd frontend
```

#### 2.3 Cài Đặt Dependencies

```bash
npm install
```

Điều này sẽ cài đặt:
- react
- react-dom
- react-router-dom
- axios

#### 2.4 Chạy Development Server

```bash
npm run dev
```

Bạn sẽ thấy:
```
VITE v4.4.5  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

✅ Frontend đang chạy!

---

### Bước 3: Truy Cập Ứng Dụng

Mở trình duyệt và truy cập: **http://localhost:5173**

---

## 🧪 Kiểm Tra Cài Đặt

### Kiểm Tra Backend

1. Mở trình duyệt: **http://localhost:8000/docs**
2. Bạn sẽ thấy Swagger UI (tài liệu API)
3. Thử click "Try it out" trên endpoint `/` để kiểm tra

### Kiểm Tra Frontend

1. Mở trình duyệt: **http://localhost:5173**
2. Bạn sẽ thấy trang đăng nhập
3. Thử đăng ký một tài khoản

### Kiểm Tra Database

1. Mở File Explorer
2. Điều hướng đến `backend/`
3. Bạn sẽ thấy file `gallery.db` (tạo ra sau lần chạy đầu tiên)

---

## 🔑 Tạo Tài Khoản Admin

### Cách 1: Sử dụng SQLite

```bash
# 1. Cài đặt SQLite tools (nếu chưa có)
# Windows: https://www.sqlite.org/download.html
# macOS: Đã có sẵn
# Linux: sudo apt-get install sqlite3

# 2. Mở database
cd backend
sqlite3 gallery.db

# 3. Chạy SQL commands:
UPDATE users SET role = 'admin' WHERE id = 1;
.quit

# 4. Kiểm tra
sqlite3 gallery.db "SELECT id, username, role FROM users;"
```

### Cách 2: Sử dụng Database GUI

1. Download DB Browser for SQLite: https://sqlitebrowser.org
2. Mở file `backend/gallery.db`
3. Execute SQL:
```sql
UPDATE users SET role = 'admin' WHERE id = 1;
```
4. Nhấn "Write changes"

---

## 🛑 Dừng Ứng Dụng

### Dừng Backend
Trong terminal backend, nhấn: `Ctrl + C`

### Dừng Frontend
Trong terminal frontend, nhấn: `Ctrl + C`

---

## 🚀 Khởi Động Lại

### Lần Tiếp Theo

Bạn không cần cài đặt lại dependencies, chỉ cần:

1. **Backend**:
```bash
cd backend
venv\Scripts\activate  # Windows
# hoặc
source venv/bin/activate  # macOS/Linux

python app.py
```

2. **Frontend** (terminal mới):
```bash
cd frontend
npm run dev
```

---

## 📝 Troubleshooting Thường Gặp

### Backend không chạy được

**Lỗi**: `ModuleNotFoundError: No module named 'fastapi'`

**Giải pháp**:
```bash
# Kiểm tra venv được kích hoạt
# Windows:
venv\Scripts\activate

# Cài đặt lại dependencies
pip install -r requirements.txt
```

**Lỗi**: `Port 8000 is already in use`

**Giải pháp 1** - Tìm process sử dụng port 8000:
```bash
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :8000
kill -9 <PID>
```

**Giải pháp 2** - Thay đổi port:
```bash
python -m uvicorn app:app --port 8001
```

---

### Frontend không chạy được

**Lỗi**: `npm: command not found`

**Giải pháp**: Cài đặt Node.js
- Truy cập: https://nodejs.org
- Download LTS version
- Cài đặt
- Khởi động lại terminal

**Lỗi**: `Module not found`

**Giải pháp**:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

**Lỗi**: `Port 5173 already in use`

**Giải pháp**:
```bash
npm run dev -- --port 5174
```

---

### Frontend không kết nối được Backend

**Triệu chứng**: Lỗi CORS hoặc "Cannot connect to server"

**Giải pháp**:
1. Kiểm tra backend đang chạy: http://localhost:8000/docs
2. Kiểm tra IP address của backend trong `src/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000'; // Phải khớp với backend
```

---

### Ảnh không tải được

**Kiểm tra**:
1. Mở browser DevTools (F12)
2. Vào Network tab
3. Xem request tới `/uploads/...`
4. Nếu 404 - thư mục uploads không tồn tại

**Giải pháp**:
```bash
cd backend
mkdir uploads  # Tạo thư mục uploads
python app.py
```

---

## 📊 Kiểm Tra Hệ Thống

Chạy script này để kiểm tra tất cả:

```bash
# Windows
echo Backend: http://localhost:8000/docs
echo Frontend: http://localhost:5173
echo.
python --version
echo.
node --version
npm --version

# macOS/Linux
echo "Backend: http://localhost:8000/docs"
echo "Frontend: http://localhost:5173"
echo ""
python3 --version
echo ""
node --version
npm --version
```

---

## 💡 Tips

1. **Sử dụng 2 terminals**: Một cho backend, một cho frontend
2. **Kiểm tra port**: Kiểm tra services khác có chạy trên port 8000 hoặc 5173 không
3. **Tắt firewall**: Đôi khi firewall chặn connection
4. **Clear cache**: Ctrl+Shift+Delete trong browser

---

## ✅ Danh Sách Kiểm Tra

- [ ] Python 3.8+ được cài đặt
- [ ] Node.js 14+ được cài đặt
- [ ] Backend dependencies cài đặt (`pip install -r requirements.txt`)
- [ ] Frontend dependencies cài đặt (`npm install`)
- [ ] Backend chạy tại http://localhost:8000
- [ ] Frontend chạy tại http://localhost:5173
- [ ] Có thể đăng ký tài khoản mới
- [ ] Có thể tải ảnh lên
- [ ] Có thể xem danh sách ảnh
- [ ] Có thể tìm kiếm ảnh
- [ ] Có thể chỉnh sửa ảnh
- [ ] Có thể xóa ảnh

---

**Nếu có vấn đề, hãy kiểm tra terminal để xem error messages chi tiết!** 📝
