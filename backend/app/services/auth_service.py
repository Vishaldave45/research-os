import uuid
import re
import os
import httpx
from urllib.parse import urlencode
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.workspace import Workspace, WorkspaceMembership
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.auth import UserCreate, UserLogin, TokenResponse, UserRead, OAuthUrlResponse
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

    async def get_oauth_url(self, provider: str, redirect_uri: str) -> OAuthUrlResponse:
        """Construct OAuth authorization URL for Google or GitHub."""
        clean_provider = provider.lower().strip()
        
        if clean_provider == "google":
            client_id = settings.GOOGLE_CLIENT_ID or os.getenv("GOOGLE_CLIENT_ID", "")
            configured = bool(client_id)
            params = {
                "client_id": client_id or "GOOGLE_CLIENT_ID_REQUIRED",
                "redirect_uri": redirect_uri,
                "response_type": "code",
                "scope": "openid email profile",
                "access_type": "offline",
                "prompt": "select_account",
            }
            auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
            return OAuthUrlResponse(
                provider="google",
                url=auth_url,
                configured=configured,
                client_id=client_id if configured else None,
                redirect_uri=redirect_uri,
            )

        elif clean_provider == "github":
            client_id = settings.GITHUB_CLIENT_ID or os.getenv("GITHUB_CLIENT_ID", "")
            configured = bool(client_id)
            params = {
                "client_id": client_id or "GITHUB_CLIENT_ID_REQUIRED",
                "redirect_uri": redirect_uri,
                "scope": "read:user user:email",
                "allow_signup": "true",
            }
            auth_url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
            return OAuthUrlResponse(
                provider="github",
                url=auth_url,
                configured=configured,
                client_id=client_id if configured else None,
                redirect_uri=redirect_uri,
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported OAuth provider: '{provider}'. Supported: 'google', 'github'.",
        )

    async def handle_oauth_callback(
        self, provider: str, code: str, redirect_uri: str
    ) -> tuple[UserRead, TokenResponse]:
        """Exchange authorization code with Google/GitHub and establish authenticated session."""
        clean_provider = provider.lower().strip()
        user_info: dict = {}

        if clean_provider == "google":
            client_id = settings.GOOGLE_CLIENT_ID or os.getenv("GOOGLE_CLIENT_ID", "")
            client_secret = settings.GOOGLE_CLIENT_SECRET or os.getenv("GOOGLE_CLIENT_SECRET", "")
            if not client_id or not client_secret:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Google OAuth is not configured with GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
                )

            async with httpx.AsyncClient(timeout=10.0) as client:
                token_res = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "code": code,
                        "client_id": client_id,
                        "client_secret": client_secret,
                        "redirect_uri": redirect_uri,
                        "grant_type": "authorization_code",
                    },
                )
                if token_res.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Google token exchange failed: {token_res.text}",
                    )
                token_json = token_res.json()
                google_access_token = token_json.get("access_token")

                userinfo_res = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {google_access_token}"},
                )
                if userinfo_res.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to retrieve Google user profile.",
                    )
                google_data = userinfo_res.json()
                user_info = {
                    "email": google_data.get("email"),
                    "full_name": google_data.get("name") or google_data.get("given_name") or "Google Researcher",
                }

        elif clean_provider == "github":
            client_id = settings.GITHUB_CLIENT_ID or os.getenv("GITHUB_CLIENT_ID", "")
            client_secret = settings.GITHUB_CLIENT_SECRET or os.getenv("GITHUB_CLIENT_SECRET", "")
            if not client_id or not client_secret:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="GitHub OAuth is not configured with GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.",
                )

            async with httpx.AsyncClient(timeout=10.0) as client:
                token_res = await client.post(
                    "https://github.com/login/oauth/access_token",
                    headers={"Accept": "application/json"},
                    data={
                        "client_id": client_id,
                        "client_secret": client_secret,
                        "code": code,
                        "redirect_uri": redirect_uri,
                    },
                )
                if token_res.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"GitHub token exchange failed: {token_res.text}",
                    )
                token_json = token_res.json()
                github_access_token = token_json.get("access_token")
                if not github_access_token:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=token_json.get("error_description") or "GitHub access token missing.",
                    )

                user_res = await client.get(
                    "https://api.github.com/user",
                    headers={
                        "Authorization": f"Bearer {github_access_token}",
                        "Accept": "application/vnd.github+json",
                    },
                )
                github_user = user_res.json() if user_res.status_code == 200 else {}
                email = github_user.get("email")

                if not email:
                    # Fetch primary verified email from emails API
                    emails_res = await client.get(
                        "https://api.github.com/user/emails",
                        headers={
                            "Authorization": f"Bearer {github_access_token}",
                            "Accept": "application/vnd.github+json",
                        },
                    )
                    if emails_res.status_code == 200:
                        emails_list = emails_res.json()
                        primary_email_obj = next(
                            (e for e in emails_list if e.get("primary") and e.get("verified")),
                            emails_list[0] if emails_list else None,
                        )
                        if primary_email_obj:
                            email = primary_email_obj.get("email")

                user_info = {
                    "email": email or f"{github_user.get('login', 'user')}@users.noreply.github.com",
                    "full_name": github_user.get("name") or github_user.get("login") or "GitHub Researcher",
                }

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported OAuth provider: '{provider}'",
            )

        return await self._get_or_create_oauth_user(user_info["email"], user_info["full_name"])

    async def handle_oauth_dev_connect(
        self, provider: str, email: str | None = None, full_name: str | None = None
    ) -> tuple[UserRead, TokenResponse]:
        """Development & fast testing connect for Google and GitHub OAuth authentication."""
        clean_provider = provider.lower().strip()
        if clean_provider == "google":
            chosen_email = email or "researcher.google@lab.org"
            chosen_name = full_name or "Dr. Google Researcher"
        elif clean_provider == "github":
            chosen_email = email or "researcher.github@lab.org"
            chosen_name = full_name or "GitHub Science Contributor"
        else:
            chosen_email = email or f"researcher.{clean_provider}@lab.org"
            chosen_name = full_name or f"{clean_provider.capitalize()} Researcher"

        return await self._get_or_create_oauth_user(chosen_email, chosen_name)

    async def _get_or_create_oauth_user(self, email: str, full_name: str) -> tuple[UserRead, TokenResponse]:
        """Find existing user by email or register a new one and provision initial workspace."""
        normalized_email = email.lower().strip()
        user = await self.user_repo.get_by_email(normalized_email)

        if not user:
            # Create user entity
            random_pw = uuid.uuid4().hex + "Aa1!"
            user = User(
                email=normalized_email,
                hashed_password=get_password_hash(random_pw),
                full_name=full_name.strip() or "Principal Researcher",
                role="researcher",
                is_active=True,
            )
            user = await self.user_repo.create(user)

            # Auto-provision initial workspace
            if self.db is not None:
                ws_repo = WorkspaceRepository(self.db)
                user_prefix = user.full_name or "Personal"
                clean_slug = re.sub(r"[^a-z0-9]+", "-", f"{user_prefix}-lab".lower()).strip("-")
                slug = f"{clean_slug}-{user.id.hex[:6]}"

                default_ws = Workspace(
                    name=f"{user_prefix}'s Research Lab",
                    slug=slug,
                    description="Default research workspace connected via OAuth",
                    owner_id=user.id,
                )
                created_ws = await ws_repo.create(default_ws)
                await ws_repo.add_member(
                    WorkspaceMembership(
                        workspace_id=created_ws.id,
                        user_id=user.id,
                        role="owner",
                    )
                )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive.",
            )

        tokens = await self._issue_token_pair(user.id)
        return UserRead.model_validate(user), tokens

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
