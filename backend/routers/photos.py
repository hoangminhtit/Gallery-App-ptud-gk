"""
Photo endpoints - CRUD operations
"""

import os
import secrets
import string
import mimetypes
import urllib.parse
import urllib.request
from datetime import datetime, date, time
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Query, Form, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db
from models import User, Photo
from schemas import PhotoUpdate, PhotoResponse, PhotoUrlCreate
from security import get_current_user
from config import UPLOAD_FOLDER, UserRole, FEATURE_FLAGS

router = APIRouter(prefix="/photos", tags=["Photos"])


def _sanitize_filename(filename: str) -> str:
    safe_name = os.path.basename(filename or "")
    safe_name = safe_name.replace("..", "").replace("/", "").replace("\\", "")
    return safe_name or "upload"


def _parse_tags(raw_tags: Optional[str]) -> List[str]:
    if not raw_tags:
        return []
    tags = [tag.strip() for tag in raw_tags.split(",")]
    return [tag for tag in tags if tag]


def generate_filename(filename: str) -> str:
    """Generate a unique filename"""
    safe_filename = _sanitize_filename(filename)
    name, ext = os.path.splitext(safe_filename)
    random_suffix = ''.join(
        secrets.choice(string.ascii_letters + string.digits) for _ in range(8)
    )
    return f"{name}_{random_suffix}{ext}"


def _resolve_extension(filename: str, content_type: str) -> str:
    ext = os.path.splitext(filename)[1]
    if ext:
        return ext
    guessed = mimetypes.guess_extension(content_type or "")
    return guessed or ".jpg"


def _download_image(url: str) -> tuple[bytes, str, str]:
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="URL must be http or https")

    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            content_type = response.info().get_content_type()
            if not content_type.startswith("image/"):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="URL must point to an image")
            data = response.read()
            filename = os.path.basename(parsed.path) or "upload"
            return data, filename, content_type
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


def _normalize_photo(photo: Photo) -> Photo:
    if photo.tags is None:
        photo.tags = []
    if photo.is_favorite is None:
        photo.is_favorite = False
    return photo


@router.post("", response_model=PhotoResponse)
async def upload_photo(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
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
        tags=_parse_tags(tags) if FEATURE_FLAGS.get("tags") else [],
        user_id=current_user.id,
    )
    
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    
    return db_photo


@router.post("/from-url", response_model=PhotoResponse)
def upload_photo_from_url(
    payload: PhotoUrlCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not FEATURE_FLAGS.get("upload_from_url"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    data, original_name, content_type = _download_image(payload.url)
    safe_name = _sanitize_filename(payload.title or original_name)
    ext = _resolve_extension(safe_name, content_type)
    filename = generate_filename(f"{safe_name}{ext}")
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    try:
        with open(file_path, "wb") as f:
            f.write(data)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    db_photo = Photo(
        title=payload.title or os.path.splitext(safe_name)[0] or "Untitled",
        description=payload.description,
        image_url=f"/uploads/{filename}",
        tags=payload.tags if FEATURE_FLAGS.get("tags") and payload.tags is not None else [],
        user_id=current_user.id,
    )

    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)

    return _normalize_photo(db_photo)


@router.get("", response_model=List[PhotoResponse])
def get_user_photos(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    sort_by: Optional[str] = Query(None),
    sort_order: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    tags: Optional[str] = Query(None),
    favorite_only: bool = Query(False),
    include_deleted: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    response: Response = None,
):
    """Get user's photos with optional search"""

    query = db.query(Photo).filter(Photo.user_id == current_user.id)

    if FEATURE_FLAGS.get("soft_delete") and not include_deleted:
        query = query.filter(Photo.deleted_at.is_(None))
    
    if search:
        query = query.filter(Photo.title.ilike(f"%{search}%"))

    if FEATURE_FLAGS.get("filter_by_date"):
        if start_date:
            start_dt = datetime.combine(start_date, time.min)
            query = query.filter(Photo.uploaded_at >= start_dt)
        if end_date:
            end_dt = datetime.combine(end_date, time.max)
            query = query.filter(Photo.uploaded_at <= end_dt)

    if FEATURE_FLAGS.get("favorites") and favorite_only:
        query = query.filter(Photo.is_favorite.is_(True))

    if FEATURE_FLAGS.get("sort_photos"):
        sort_key = (sort_by or "uploaded_at").lower()
        sort_dir = (sort_order or "desc").lower()
        if sort_key == "title":
            order_col = Photo.title
        else:
            order_col = Photo.uploaded_at
        if sort_dir == "asc":
            query = query.order_by(order_col.asc())
        else:
            query = query.order_by(order_col.desc())
    else:
        query = query.order_by(Photo.uploaded_at.desc())

    total = None
    if FEATURE_FLAGS.get("pagination"):
        total = query.count()
        query = query.offset((page - 1) * limit).limit(limit)
    
    photos = query.all()

    if FEATURE_FLAGS.get("tags") and tags:
        tags_list = _parse_tags(tags)
        if tags_list:
            photos = [photo for photo in photos if set(tags_list).issubset(set(photo.tags or []))]

    if FEATURE_FLAGS.get("pagination") and response is not None:
        response.headers["X-Total-Count"] = str(total or 0)

    return [_normalize_photo(photo) for photo in photos]


@router.get("/{photo_id}", response_model=PhotoResponse)
def get_photo(
    photo_id: int,
    include_deleted: bool = Query(False),
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

    if FEATURE_FLAGS.get("soft_delete") and photo.deleted_at and not include_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found",
        )
    
    if photo.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this photo",
        )
    
    return _normalize_photo(photo)


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
    if FEATURE_FLAGS.get("tags") and photo_update.tags is not None:
        photo.tags = photo_update.tags
    if FEATURE_FLAGS.get("favorites") and photo_update.is_favorite is not None:
        photo.is_favorite = photo_update.is_favorite
    
    db.commit()
    db.refresh(photo)
    
    return _normalize_photo(photo)


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
    
    if FEATURE_FLAGS.get("soft_delete"):
        photo.deleted_at = datetime.utcnow()
        db.commit()
        db.refresh(photo)
        return {"message": "Photo moved to trash"}

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


@router.post("/{photo_id}/restore", response_model=PhotoResponse)
def restore_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not FEATURE_FLAGS.get("soft_delete"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")

    if photo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only restore your own photos")

    photo.deleted_at = None
    db.commit()
    db.refresh(photo)
    return _normalize_photo(photo)


@router.put("/{photo_id}/favorite", response_model=PhotoResponse)
def set_favorite(
    photo_id: int,
    payload: PhotoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not FEATURE_FLAGS.get("favorites"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")

    if photo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own photos")

    if payload.is_favorite is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="is_favorite is required")

    photo.is_favorite = payload.is_favorite
    db.commit()
    db.refresh(photo)
    return _normalize_photo(photo)


@router.get("/{photo_id}/download")
def download_photo(
    photo_id: int,
    include_deleted: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not FEATURE_FLAGS.get("download"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")

    if FEATURE_FLAGS.get("soft_delete") and photo.deleted_at and not include_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")

    if photo.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't have permission to download this photo")

    filename = photo.image_url.replace("/uploads/", "", 1)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    return FileResponse(path=file_path, filename=filename)


@router.post("/batch", response_model=List[PhotoResponse])
async def upload_photos_batch(
    files: List[UploadFile] = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not FEATURE_FLAGS.get("multi_upload"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    created_photos = []
    tags_list = _parse_tags(tags) if FEATURE_FLAGS.get("tags") else []

    for file in files:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image")

        filename = generate_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        try:
            with open(file_path, "wb") as f:
                contents = await file.read()
                f.write(contents)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

        resolved_title = os.path.splitext(_sanitize_filename(file.filename))[0] or "Untitled"
        if title and len(files) == 1:
            resolved_title = title
        db_photo = Photo(
            title=resolved_title,
            description=description,
            image_url=f"/uploads/{filename}",
            tags=tags_list,
            user_id=current_user.id,
        )
        db.add(db_photo)
        created_photos.append(db_photo)

    db.commit()
    for photo in created_photos:
        db.refresh(photo)

    return [_normalize_photo(photo) for photo in created_photos]
