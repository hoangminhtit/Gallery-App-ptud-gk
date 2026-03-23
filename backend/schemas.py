"""
Pydantic schemas for request/response validation
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from config import UserRole


# ==================== User Schemas ====================

class UserRegister(BaseModel):
    """User registration schema"""
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    """User login schema"""
    username: str
    password: str


class UserResponse(BaseModel):
    """User response schema"""
    id: int
    username: str
    email: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Photo Schemas ====================

class PhotoCreate(BaseModel):
    """Photo creation schema"""
    title: str
    description: Optional[str] = None


class PhotoUpdate(BaseModel):
    """Photo update schema"""
    title: Optional[str] = None
    description: Optional[str] = None


class PhotoResponse(BaseModel):
    """Photo response schema"""
    id: int
    title: str
    description: Optional[str]
    image_url: str
    uploaded_at: datetime
    user_id: int

    class Config:
        from_attributes = True


# ==================== Token Schemas ====================

class Token(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str
    user: UserResponse


class RoleUpdateRequest(BaseModel):
    """Admin role update request schema"""
    role: UserRole
