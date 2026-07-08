from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
from jose import jwt
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.schemas.auth import GoogleAuthRequest, TokenResponse, UserResponse
from app.config import settings
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


def create_access_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


@router.post("/google", response_model=TokenResponse)
async def google_auth(request: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """Verify Google ID token and return JWT."""
    try:
        idinfo = id_token.verify_oauth2_token(
            request.token,
            grequests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )

    google_id = idinfo["sub"]
    email = idinfo.get("email", "")
    name = idinfo.get("name", "")
    avatar_url = idinfo.get("picture")

    # Get or create user
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            google_id=google_id,
            email=email,
            name=name,
            avatar_url=avatar_url,
        )
        db.add(user)
    else:
        user.last_login = datetime.utcnow()
        user.avatar_url = avatar_url

    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/logout")
async def logout():
    """Client-side logout — just return success."""
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
