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


def _login_with_required_role(
    user: UserLogin,
    db: Session,
    required_role: UserRole,
):
    """Login helper that verifies both credentials and role"""
    normalized_username = user.username.strip().lower()

    db_user = db.query(User).filter(func.lower(User.username) == normalized_username).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if db_user.role != required_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This account is not allowed to login as {required_role.value}",
        )

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
    
    # Bootstrap: first account becomes admin so user management is available.
    has_admin = db.query(User).filter(User.role == UserRole.ADMIN).first() is not None
    assigned_role = UserRole.USER if has_admin else UserRole.ADMIN

    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=normalized_username,
        email=normalized_email,
        password=hashed_password,
        role=assigned_role,
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
    """Login by selected role (default user)"""
    required_role = user.role or UserRole.USER
    return _login_with_required_role(user, db, required_role)


@router.post("/login/user", response_model=Token)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    """Login for regular user role"""
    return _login_with_required_role(user, db, UserRole.USER)


@router.post("/login/admin", response_model=Token)
def login_admin(user: UserLogin, db: Session = Depends(get_db)):
    """Login for admin role"""
    return _login_with_required_role(user, db, UserRole.ADMIN)
