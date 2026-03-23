"""
SQLAlchemy database models
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from config import UserRole
from database import Base


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(SQLEnum(UserRole), default=UserRole.USER)
    created_at = Column(DateTime, default=datetime.utcnow)

    photos = relationship("Photo", back_populates="owner", cascade="all, delete-orphan")


class Photo(Base):
    """Photo model"""
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    image_url = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    owner = relationship("User", back_populates="photos")
