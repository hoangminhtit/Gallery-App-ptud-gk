"""
Configuration settings for the Gallery App API
"""

from enum import Enum
from pathlib import Path

# Database
DATABASE_URL = "sqlite:///./gallery.db"

# Security
SECRET_KEY = "your-secret-key-change-this-in-production-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# File Upload
UPLOAD_FOLDER = "uploads"
Path(UPLOAD_FOLDER).mkdir(exist_ok=True)

# CORS
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
]

# Allow localhost/127.0.0.1 on any dev port (Vite can auto-switch ports)
ALLOWED_ORIGIN_REGEX = r"^https?://(localhost|127\.0\.0\.1):\d+$"


class UserRole(str, Enum):
    """User roles in the system"""
    USER = "user"
    ADMIN = "admin"
