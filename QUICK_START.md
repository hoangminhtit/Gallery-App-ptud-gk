# 🚀 Quick Start - Khởi Động Nhanh

## ⚡ 5 Phút Để Chạy Ứng Dụng

### Yêu Cầu Triển Khai
- ✅ Python 3.8+
- ✅ Node.js 14+

### Terminal 1 - Backend (FastAPI)

```bash
cd backend

# Windows
venv\Scripts\activate
python app.py

# macOS/Linux
source venv/bin/activate
python app.py
```

**Chờ đến khi thấy:**
```
Uvicorn running on http://127.0.0.1:8000
```

---

### Terminal 2 - Frontend (React)

Mở **terminal mới**, vào folder frontend:

```bash
cd frontend
npm install  # Chỉ cần first time
npm run dev
```

**Chờ đến khi thấy:**
```
Local:   http://localhost:5173/
```

---

### 🎉 Xong!

Mở trình duyệt: **http://localhost:5173**

---

## 📸 Các Bước Đầu Tiên

1. ✏️ **Đăng Ký**: Tạo tài khoản mới (tên đăng nhập, email, password)
2. 📤 **Tải Ảnh**: Nhấn "+ Tải ảnh lên" → chọn ảnh → nhập tên
3. 🖼️ **Xem Ảnh**: Nhấn vào ảnh để xem chi tiết
4. ✏️ **Chỉnh Sửa**: Click "Chỉnh sửa" → thay đổi tên/mô tả → "Lưu"
5. 🔍 **Tìm Kiếm**: Gõ tên ảnh vào ô tìm kiếm
6. 🗑️ **Xóa**: Hover vào ảnh → click nút thùng rác

---

## 🆘 Nếu Có Lỗi

| Lỗi | Giải Pháp |
|-----|----------|
| `ModuleNotFoundError: No module named 'fastapi'` | `pip install -r requirements.txt` |
| `npm: command not found` | Cài Node.js lại từ nodejs.org |
| Port 8000/5173 đã dùng | Đóng app khác hoặc thay port |
| Frontend không nối backend | Kiểm tra `http://localhost:8000/docs` |
| Ảnh không hiển thị | Kiểm tra thư mục `backend/uploads/` tồn tại |

---

## 📖 Tài Liệu Đầy Đủ

- **Backend Details**: `backend/README.md`
- **Frontend Details**: `frontend/README.md`
- **Setup Chi Tiết**: `SETUP_GUIDE.md`
- **Tổng Quan Dự Án**: `README.md`

---

## 🔑 Admin Account

Muốn làm admin user đầu tiên? (sau khi đăng ký)

Cách dễ nhất:
1. Download DB Browser: https://sqlitebrowser.org
2. Mở file `backend/gallery.db`
3. Execute SQL:
```sql
UPDATE users SET role = 'admin' WHERE id = 1;
```
4. Save

---

## 💻 Các Lệnh Hay Dùng

```bash
# Tất cả Python
python --version
pip install -r requirements.txt
python app.py

# Tất cả Frontend
node --version
npm --version
npm install
npm run dev
npm run build
npm run preview

# Database
sqlite3 backend/gallery.db
```

---

**Vui lòng kiểm tra SETUP_GUIDE.md nếu gặp vấn đề chi tiết hơn!** 📚
