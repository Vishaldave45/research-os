import uuid
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserRead
from app.repositories.user_repository import UserRepository
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    generate_refresh_token,
    hash_token,
)
from app.core.config import settings


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.token_repo = RefreshTokenRepository(db)

    async def register(self, user_in: UserCreate) -> tuple[UserRead, TokenResponse]:
        # Check if email is already registered
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email address already exists.",
            )

        # Create user entity
        user = User(
            email=user_in.email.lower().strip(),
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name.strip(),
            role="researcher",
            is_active=True,
        )
        created_user = await self.user_repo.create(user)
        
        # Issue initial token pair
        tokens = await self._issue_token_pair(created_user.id)
        return UserRead.model_validate(created_user), tokens

    async def login(self, login_in: UserLogin) -> tuple[UserRead, TokenResponse]:
        user = await self.user_repo.get_by_email(login_in.email)
        if not user or not verify_password(login_in.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive.",
            )

        tokens = await self._issue_token_pair(user.id)
        return UserRead.model_validate(user), tokens

    async def refresh_tokens(self, raw_refresh_token: str) -> TokenResponse:
        token_hash = hash_token(raw_refresh_token)
        stored_token = await self.token_repo.get_valid_token(token_hash)
        
        if not stored_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid, expired, or revoked refresh token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Single-use rotation: revoke the consumed refresh token immediately
        await self.token_repo.revoke_token(stored_token.id)

        # Issue new token pair
        return await self._issue_token_pair(stored_token.user_id)

    async def logout(self, raw_refresh_token: str) -> None:
        token_hash = hash_token(raw_refresh_token)
        stored_token = await self.token_repo.get_valid_token(token_hash)
        if stored_token:
            await self.token_repo.revoke_token(stored_token.id)

    async def _issue_token_pair(self, user_id: uuid.UUID) -> TokenResponse:
        access_token = create_access_token(subject=str(user_id))
        raw_refresh_token = generate_refresh_token()
        token_hash = hash_token(raw_refresh_token)

        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_entity = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            is_revoked=False,
        )
        await self.token_repo.create(refresh_entity)

        return TokenResponse(
            access_token=access_token,
            refresh_token=raw_refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
