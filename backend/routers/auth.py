"""
Authentication endpoints - Register and Login
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserRegister, UserLogin, Token
from config import ACCESS_TOKEN_EXPIRE_MINUTES, UserRole
from security import (
    get_password_hash,
    verify_password,
    create_access_token,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
def register(user: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    normalized_username = user.username.strip().lower()
    normalized_email = user.email.strip().lower()
    
    if not normalized_username or not normalized_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and email are required",
        )
    
    # Check if user already exists
    db_user = db.query(User).filter(
        (func.lower(User.username) == normalized_username)
        | (func.lower(User.email) == normalized_email)
    ).first()
    
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=normalized_username,
        email=normalized_email,
        password=hashed_password,
        role=UserRole.USER,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.username},
        expires_delta=access_token_expires,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user,
    }


@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    normalized_username = user.username.strip().lower()
    
    db_user = db.query(User).filter(func.lower(User.username) == normalized_username).first()
    
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username},
        expires_delta=access_token_expires,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user,
    }
