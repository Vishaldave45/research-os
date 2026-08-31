import logging
import uuid
from typing import Annotated
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_jwt_token
from app.models.user import User
from app.repositories.user_repository import UserRepository

logger = logging.getLogger("app.auth")
bearer_scheme = HTTPBearer(auto_error=False)


def format_request_headers_for_log(request: Request) -> dict[str, str]:
    """Extract and format request headers for diagnostic auth logs."""
    headers_dict = dict(request.headers)
    formatted = {}
    for key, val in headers_dict.items():
        lower_key = key.lower()
        if lower_key == "authorization":
            if val.startswith("Bearer "):
                token_part = val[7:]
                if len(token_part) > 12:
                    formatted[key] = f"Bearer {token_part[:6]}...{token_part[-4:]} (length={len(token_part)})"
                else:
                    formatted[key] = f"Bearer {token_part} (length={len(token_part)})"
            else:
                formatted[key] = f"{val[:10]}... (length={len(val)}, non-bearer format)"
        elif lower_key == "cookie":
            formatted[key] = f"[Cookie present, length={len(val)}]"
        else:
            formatted[key] = val
    return formatted


async def get_current_user(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Validate bearer token if provided; otherwise fallback to default development researcher user."""
    user_repo = UserRepository(db)

    # 1. If valid credentials provided, validate JWT
    if credentials and credentials.credentials:
        token = credentials.credentials
        payload = decode_jwt_token(token)
        if payload and payload.get("type") == "access" and payload.get("sub"):
            try:
                user_id = uuid.UUID(payload.get("sub"))
                user = await user_repo.get_by_id(user_id)
                if user and user.is_active:
                    return user
            except Exception:
                pass

    # 2. Development / No-Auth Mode: Retrieve or create default active researcher
    dev_email = "lead.researcher@lab.org"
    dev_user = await user_repo.get_by_email(dev_email)
    if not dev_user:
        try:
            from app.core.security import get_password_hash
            from app.models.user import User
            new_dev_user = User(
                email=dev_email,
                hashed_password=get_password_hash("Researcher#123"),
                full_name="Dr. Lead Researcher",
                role="researcher",
            )
            dev_user = await user_repo.create(new_dev_user)
            # Create default workspace for dev user if none exists
            from app.repositories.workspace_repository import WorkspaceRepository
            ws_repo = WorkspaceRepository(db)
            workspaces = await ws_repo.list_for_user(dev_user.id)
            if not workspaces:
                ws = await ws_repo.create(
                    name="Deep Learning Laboratory",
                    slug="deep-learning-lab",
                    description="Primary research workspace for model compression & biomedical AI.",
                    owner_id=dev_user.id,
                )
                from app.services.seed_service import SeedService
                seed_service = SeedService(db)
                await seed_service.seed_wce_dataset(ws.id, dev_user.id)
        except Exception as e:
            logger.warning("Could not auto-seed dev user/workspace: %s", str(e))
            # Fallback query again if created concurrently
            dev_user = await user_repo.get_by_email(dev_email)

    if dev_user:
        return dev_user

    # Fallback to any existing user in DB
    if db is not None:
        try:
            from sqlalchemy import select
            res = await db.execute(select(User).limit(1))
            first_user = res.scalars().first()
            if first_user:
                return first_user
        except Exception:
            pass

    # Emergency fallback User instance
    return User(
        id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
        email="lead.researcher@lab.org",
        hashed_password="hash",
        full_name="Dr. Lead Researcher",
        role="researcher",
        is_active=True,
    )


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Ensure currently authenticated user is active."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account.",
        )
    return current_user
