"""
Photo endpoints - CRUD operations
"""

import os
import secrets
import string
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Query, Form
from sqlalchemy.orm import Session

from database import get_db
from models import User, Photo
from schemas import PhotoUpdate, PhotoResponse
from security import get_current_user
from config import UPLOAD_FOLDER, UserRole

router = APIRouter(prefix="/photos", tags=["Photos"])


def generate_filename(filename: str) -> str:
    """Generate a unique filename"""
    name, ext = os.path.splitext(filename)
    random_suffix = ''.join(
        secrets.choice(string.ascii_letters + string.digits) for _ in range(8)
    )
    return f"{name}_{random_suffix}{ext}"


@router.post("", response_model=PhotoResponse)
async def upload_photo(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a photo"""
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image",
        )
    
    # Generate unique filename
    filename = generate_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    
    # Save file
    try:
        with open(file_path, "wb") as f:
            contents = await file.read()
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    
    # Create database record
    db_photo = Photo(
        title=title,
        description=description,
        image_url=f"/uploads/{filename}",
        user_id=current_user.id,
    )
    
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    
    return db_photo


@router.get("", response_model=List[PhotoResponse])
def get_user_photos(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user's photos with optional search"""
    
    query = db.query(Photo).filter(Photo.user_id == current_user.id)
    
    if search:
        query = query.filter(Photo.title.ilike(f"%{search}%"))
    
    photos = query.order_by(Photo.uploaded_at.desc()).all()
    return photos


@router.get("/{photo_id}", response_model=PhotoResponse)
def get_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get photo details"""
    
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found",
        )
    
    if photo.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this photo",
        )
    
    return photo


@router.put("/{photo_id}", response_model=PhotoResponse)
def update_photo(
    photo_id: int,
    photo_update: PhotoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update photo details"""
    
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found",
        )
    
    if photo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own photos",
        )
    
    if photo_update.title:
        photo.title = photo_update.title
    if photo_update.description is not None:
        photo.description = photo_update.description
    
    db.commit()
    db.refresh(photo)
    
    return photo


@router.delete("/{photo_id}")
def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a photo"""
    
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found",
        )
    
    if photo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own photos",
        )
    
    # Delete file from storage
    filename = photo.image_url.replace("/uploads/", "", 1)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Error deleting file: {e}")
    
    # Delete from database
    db.delete(photo)
    db.commit()
    
    return {"message": "Photo deleted successfully"}
