from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..auth import hash_password, create_access_token
from ..database import get_db
from ..models import User
from ..schemas import UserRegister, TokenResponse

from ..auth import verify_password
from ..schemas import UserLogin

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", response_model=TokenResponse)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        or_(
            User.email == user_data.email,
            User.username == user_data.username
        )
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already exists"
        )

    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="author",
        status="active"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=TokenResponse)
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if user.status != "active":
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }