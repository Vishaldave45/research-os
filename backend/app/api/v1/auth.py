from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    UserRead,
    TokenResponse,
    TokenRefreshRequest,
    AuthResponse,
)
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Register a new researcher user and issue initial token pair."""
    service = AuthService(db)
    user, tokens = await service.register(user_in)
    return {
        "user": user,
        "tokens": tokens,
    }


@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def login(
    login_in: UserLogin,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Authenticate researcher and return user profile + access/refresh token pair."""
    service = AuthService(db)
    user, tokens = await service.login(login_in)
    return {
        "user": user,
        "tokens": tokens,
    }


@router.post("/refresh", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def refresh_tokens(
    refresh_in: TokenRefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Rotate refresh token: revoke consumed token and return new access & refresh token pair."""
    service = AuthService(db)
    return await service.refresh_tokens(refresh_in.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    refresh_in: TokenRefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Revoke refresh token and terminate server-side session."""
    service = AuthService(db)
    await service.logout(refresh_in.refresh_token)
    return None


@router.get("/me", response_model=UserRead, status_code=status.HTTP_200_OK)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Retrieve currently authenticated user profile."""
    return current_user
