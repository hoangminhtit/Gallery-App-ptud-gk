"""
Admin endpoints
"""

import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User, Photo
from config import UPLOAD_FOLDER
from schemas import RoleUpdateRequest, UserResponse
from security import get_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
):
    """Delete a user (Admin only)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Delete user's photos
    photos = db.query(Photo).filter(Photo.user_id == user_id).all()
    for photo in photos:
        filename = photo.image_url.replace("/uploads/", "", 1)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")
        db.delete(photo)
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}


@router.post("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    payload: RoleUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
):
    """Update user role (Admin only)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user.role = payload.role
    db.commit()
    db.refresh(user)
    
    return user
