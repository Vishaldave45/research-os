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
    """Validate bearer token strictly; raise 401 UNAUTHORIZED if missing, invalid, or expired."""
    user_repo = UserRepository(db)

    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_jwt_token(token)
    if not payload or payload.get("type") != "access" or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = uuid.UUID(payload.get("sub"))
        user = await user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account not found or inactive.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
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
