"""
Pydantic schemas for request/response validation
"""

from datetime import datetime
from typing import Optional, List
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
    role: Optional[UserRole] = UserRole.USER


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


class PhotoUrlCreate(BaseModel):
    """Photo upload via URL schema"""
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None


class PhotoUpdate(BaseModel):
    """Photo update schema"""
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = None


class PhotoResponse(BaseModel):
    """Photo response schema"""
    id: int
    title: str
    description: Optional[str]
    image_url: str
    tags: List[str] = []
    is_favorite: bool = False
    deleted_at: Optional[datetime] = None
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
