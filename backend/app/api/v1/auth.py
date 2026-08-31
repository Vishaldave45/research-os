from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    UserRead,
    TokenResponse,
    TokenRefreshRequest,
    AuthResponse,
    OAuthUrlResponse,
    OAuthCallbackRequest,
    OAuthDevConnectRequest,
)
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user
from app.models.user import User

# Top-level auth router (prefix="/auth")
router = APIRouter(prefix="/auth", tags=["Authentication"])


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Set HttpOnly SameSite=Strict cookies for modern browser session security."""
    is_secure = settings.ENVIRONMENT.lower() in ["production", "prod", "staging"]
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=is_secure,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=is_secure,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/",
    )


def _clear_auth_cookies(response: Response) -> None:
    """Clear HttpOnly session cookies."""
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")


# -------------------------------------------------------------
# PUBLIC AUTHENTICATION ENDPOINTS (NO Bearer Token Required)
# -------------------------------------------------------------

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new researcher (Public)",
)
async def register(
    user_in: UserCreate,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Register a new researcher account, issue credentials, and set HttpOnly session cookies."""
    service = AuthService(db)
    user, tokens = await service.register(user_in)
    _set_auth_cookies(response, tokens.access_token, tokens.refresh_token)
    return {
        "user": user,
        "tokens": tokens,
    }


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate researcher (Public)",
)
async def login(
    login_in: UserLogin,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Authenticate with email and password, issue credentials, and set HttpOnly session cookies."""
    service = AuthService(db)
    user, tokens = await service.login(login_in)
    _set_auth_cookies(response, tokens.access_token, tokens.refresh_token)
    return {
        "user": user,
        "tokens": tokens,
    }


# -------------------------------------------------------------
# OAUTH AUTHENTICATION ENDPOINTS (Google & GitHub)
# -------------------------------------------------------------

@router.get(
    "/oauth/{provider}/url",
    response_model=OAuthUrlResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve OAuth provider authorization URL",
)
async def get_oauth_url(
    provider: str,
    redirect_uri: Annotated[str, Query(description="The callback redirect URI")],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Generate the direct OAuth authorization URL for Google or GitHub."""
    service = AuthService(db)
    return await service.get_oauth_url(provider=provider, redirect_uri=redirect_uri)


@router.post(
    "/oauth/{provider}/callback",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Exchange OAuth authorization code for session tokens",
)
async def oauth_callback(
    provider: str,
    callback_in: OAuthCallbackRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Exchange authorization code with provider, provision user/workspace, and issue JWT tokens & cookies."""
    service = AuthService(db)
    user, tokens = await service.handle_oauth_callback(
        provider=provider,
        code=callback_in.code,
        redirect_uri=callback_in.redirect_uri,
    )
    _set_auth_cookies(response, tokens.access_token, tokens.refresh_token)
    return {
        "user": user,
        "tokens": tokens,
    }


@router.post(
    "/oauth/dev-connect",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Development instant connect for Google / GitHub testing",
)
async def oauth_dev_connect(
    dev_in: OAuthDevConnectRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Fast-connect researcher account simulating Google or GitHub OAuth identity (Disabled in Production)."""
    if settings.ENVIRONMENT.lower() in ["production", "prod", "staging"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Development OAuth connector is disabled in production environments.",
        )
    service = AuthService(db)
    user, tokens = await service.handle_oauth_dev_connect(
        provider=dev_in.provider,
        email=dev_in.email,
        full_name=dev_in.full_name,
    )
    _set_auth_cookies(response, tokens.access_token, tokens.refresh_token)
    return {
        "user": user,
        "tokens": tokens,
    }


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token (Public with refresh token body)",
)
async def refresh_tokens(
    refresh_in: TokenRefreshRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Rotate refresh token: revoke consumed token and return new access & refresh token pair & update cookies."""
    service = AuthService(db)
    tokens = await service.refresh_tokens(refresh_in.refresh_token)
    _set_auth_cookies(response, tokens.access_token, tokens.refresh_token)
    return tokens


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke refresh token session (Public with refresh token body)",
)
async def logout(
    refresh_in: TokenRefreshRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Revoke refresh token, terminate server-side session, and clear cookies."""
    service = AuthService(db)
    await service.logout(refresh_in.refresh_token)
    _clear_auth_cookies(response)
    return None


# -------------------------------------------------------------
# PROTECTED AUTHENTICATION ENDPOINTS (Bearer Token Required)
# -------------------------------------------------------------

@router.get(
    "/me",
    response_model=UserRead,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile (Protected: Bearer Token Required)",
)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Retrieve currently authenticated researcher profile."""
    return current_user
