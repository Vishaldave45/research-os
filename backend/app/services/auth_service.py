import uuid
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.schemas.auth import UserCreate, UserLogin, TokenResponse, UserRead
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
        normalized_email = user_in.email.lower().strip()
        
        # Check if email is already registered
        existing_user = await self.user_repo.get_by_email(normalized_email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email address already exists.",
            )

        # Create user entity with securely hashed password
        user = User(
            email=normalized_email,
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name.strip(),
            role="researcher",
            is_active=True,
        )
        created_user = await self.user_repo.create(user)

        # Auto-provision initial workspace
        if self.db is not None:
            import re
            from app.models.workspace import Workspace, WorkspaceMembership
            from app.repositories.workspace_repository import WorkspaceRepository
            
            ws_repo = WorkspaceRepository(self.db)
            user_prefix = created_user.full_name or "Personal"
            clean_slug = re.sub(r"[^a-z0-9]+", "-", f"{user_prefix}-lab".lower()).strip("-")
            slug = f"{clean_slug}-{created_user.id.hex[:6]}"

            default_ws = Workspace(
                name=f"{user_prefix}'s Research Lab",
                slug=slug,
                description="Default research workspace",
                owner_id=created_user.id,
            )
            created_ws = await ws_repo.create(default_ws)
            await ws_repo.add_member(
                WorkspaceMembership(
                    workspace_id=created_ws.id,
                    user_id=created_user.id,
                    role="owner",
                )
            )
        
        # Issue initial token pair
        tokens = await self._issue_token_pair(created_user.id)
        return UserRead.model_validate(created_user), tokens

    async def login(self, login_in: UserLogin) -> tuple[UserRead, TokenResponse]:
        normalized_email = login_in.email.lower().strip()
        user = await self.user_repo.get_by_email(normalized_email)
        
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
