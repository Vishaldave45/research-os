import pytest
import uuid
from datetime import datetime, timezone
from pydantic import ValidationError
from httpx import AsyncClient, ASGITransport
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    generate_refresh_token,
    hash_token,
    decode_jwt_token,
)
from app.schemas.auth import UserCreate, UserLogin, UserRead
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.services.auth_service import AuthService
from app.repositories import user_repository
from app.core.database import get_db
from app.main import app
from fastapi import HTTPException


# ==========================================
# 1. SECURITY & UTILITY TESTS
# ==========================================

def test_password_hashing_and_verification():
    password = "ResearchOS#Secure2026"
    hashed = get_password_hash(password)
    
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword123", hashed) is False
    assert verify_password("", hashed) is False


def test_jwt_access_token_lifecycle():
    user_id = str(uuid.uuid4())
    token = create_access_token(subject=user_id, extra_claims={"role": "researcher"})
    payload = decode_jwt_token(token)
    
    assert payload is not None
    assert payload.get("sub") == user_id
    assert payload.get("type") == "access"
    assert payload.get("role") == "researcher"
    assert "exp" in payload
    assert "iat" in payload


def test_invalid_jwt_token_decoding():
    assert decode_jwt_token("invalid.token.structure") is None
    assert decode_jwt_token("") is None


def test_refresh_token_cryptography():
    token_1 = generate_refresh_token()
    token_2 = generate_refresh_token()
    
    assert token_1 != token_2
    assert len(token_1) >= 40
    
    hash_1 = hash_token(token_1)
    hash_2 = hash_token(token_1)
    assert hash_1 == hash_2
    assert hash_1 != token_1


# ==========================================
# 2. SCHEMA VALIDATION TESTS
# ==========================================

def test_user_create_schema_valid():
    valid_data = {
        "email": "  LEAD.INVESTIGATOR@ResearchOS.org  ",
        "full_name": "  Dr. Sarah Chen  ",
        "password": "StrongPassword123!",
    }
    user_in = UserCreate(**valid_data)
    # Email should be normalized to lowercase and trimmed
    assert user_in.email == "lead.investigator@researchos.org"
    assert user_in.full_name == "  Dr. Sarah Chen  "
    assert user_in.password == "StrongPassword123!"


def test_user_create_schema_weak_password():
    with pytest.raises(ValidationError):
        UserCreate(
            email="researcher@example.com",
            full_name="Researcher",
            password="short",  # < 8 chars
        )


def test_user_read_schema_excludes_password():
    user_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    user_read = UserRead(
        id=user_id,
        email="test@researchos.org",
        full_name="Dr. Test",
        role="researcher",
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    dump = user_read.model_dump()
    assert "password" not in dump
    assert "hashed_password" not in dump
    assert dump["email"] == "test@researchos.org"
    assert dump["id"] == user_id


# ==========================================
# 3. AUTH SERVICE FLOW UNIT MOCK TESTS
# ==========================================

class FakeUserRepo:
    def __init__(self, db=None):
        self.users = {}

    async def get_by_id(self, user_id: uuid.UUID):
        return self.users.get(user_id)

    async def get_by_email(self, email: str):
        for u in self.users.values():
            if u.email.lower() == email.lower():
                return u
        return None

    async def create(self, user: User):
        if not hasattr(user, "id") or user.id is None:
            user.id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        user.created_at = now
        user.updated_at = now
        self.users[user.id] = user
        return user


class FakeRefreshTokenRepo:
    def __init__(self, db=None):
        self.tokens = {}

    async def create(self, refresh_token: RefreshToken):
        if not hasattr(refresh_token, "id") or refresh_token.id is None:
            refresh_token.id = uuid.uuid4()
        self.tokens[refresh_token.id] = refresh_token
        return refresh_token

    async def get_valid_token(self, token_hash: str):
        now = datetime.now(timezone.utc)
        for t in self.tokens.values():
            if t.token_hash == token_hash and not t.is_revoked and t.expires_at > now:
                return t
        return None

    async def revoke_token(self, token_id: uuid.UUID):
        if token_id in self.tokens:
            self.tokens[token_id].is_revoked = True

    async def revoke_all_user_tokens(self, user_id: uuid.UUID):
        for t in self.tokens.values():
            if t.user_id == user_id:
                t.is_revoked = True


@pytest.mark.asyncio
async def test_auth_service_full_lifecycle():
    service = AuthService(db=None)  # type: ignore
    service.user_repo = FakeUserRepo()  # type: ignore
    service.token_repo = FakeRefreshTokenRepo()  # type: ignore

    # 1. Register
    reg_input = UserCreate(
        email="marie.curie@radium.org",
        password="NobelPrizeWinner#1903",
        full_name="Marie Curie",
    )
    user_read, tokens = await service.register(reg_input)
    assert user_read.email == "marie.curie@radium.org"
    assert user_read.full_name == "Marie Curie"
    assert tokens.access_token is not None
    assert tokens.refresh_token is not None

    # 2. Duplicate registration rejected
    with pytest.raises(HTTPException) as exc_info:
        await service.register(reg_input)
    assert exc_info.value.status_code == 409

    # 3. Login success
    login_input = UserLogin(
        email="marie.curie@radium.org",
        password="NobelPrizeWinner#1903",
    )
    logged_user, login_tokens = await service.login(login_input)
    assert logged_user.id == user_read.id
    assert login_tokens.access_token is not None
    assert login_tokens.refresh_token is not None

    # 4. Login wrong password rejected
    with pytest.raises(HTTPException) as exc_info:
        await service.login(UserLogin(email="marie.curie@radium.org", password="WrongPassword!"))
    assert exc_info.value.status_code == 401

    # 5. Login non-existent user rejected
    with pytest.raises(HTTPException) as exc_info:
        await service.login(UserLogin(email="unknown@radium.org", password="Password123!"))
    assert exc_info.value.status_code == 401

    # 6. Refresh token rotation
    old_refresh_token = login_tokens.refresh_token
    new_tokens = await service.refresh_tokens(old_refresh_token)
    assert new_tokens.access_token is not None
    assert new_tokens.refresh_token != old_refresh_token

    # 7. Reusing consumed refresh token fails (rotation protection)
    with pytest.raises(HTTPException) as exc_info:
        await service.refresh_tokens(old_refresh_token)
    assert exc_info.value.status_code == 401

    # 8. Logout revokes token
    await service.logout(new_tokens.refresh_token)
    with pytest.raises(HTTPException) as exc_info:
        await service.refresh_tokens(new_tokens.refresh_token)
    assert exc_info.value.status_code == 401


# ==========================================
# 4. END-TO-END FASTAPI ENDPOINT INTEGRATION
# ==========================================

@pytest.mark.asyncio
async def test_auth_api_endpoints_integration(monkeypatch):
    fake_users = FakeUserRepo()
    fake_tokens = FakeRefreshTokenRepo()

    monkeypatch.setattr(user_repository, "UserRepository", lambda db: fake_users)
    monkeypatch.setattr("app.core.dependencies.UserRepository", lambda db: fake_users)

    def mock_init(self, db):
        self.db = db
        self.user_repo = fake_users
        self.token_repo = fake_tokens

    monkeypatch.setattr(AuthService, "__init__", mock_init)

    async def override_get_db():
        yield None

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register endpoint
        reg_res = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "albert.einstein@princeton.edu",
                "password": "Relativity#1905General",
                "full_name": "Albert Einstein",
            },
        )
        assert reg_res.status_code == 201
        data = reg_res.json()
        assert data["user"]["email"] == "albert.einstein@princeton.edu"
        assert "password" not in data["user"]
        assert "hashed_password" not in data["user"]
        access_token = data["tokens"]["access_token"]
        refresh_token = data["tokens"]["refresh_token"]

        # 2. Duplicate registration endpoint fails with 409
        dup_res = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "albert.einstein@princeton.edu",
                "password": "Relativity#1905General",
                "full_name": "Albert Einstein",
            },
        )
        assert dup_res.status_code == 409

        # 3. Login endpoint
        login_res = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "albert.einstein@princeton.edu",
                "password": "Relativity#1905General",
            },
        )
        assert login_res.status_code == 200
        login_data = login_res.json()
        assert login_data["user"]["email"] == "albert.einstein@princeton.edu"

        # 4. /me endpoint with valid Bearer token
        me_res = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["email"] == "albert.einstein@princeton.edu"
        assert me_data["full_name"] == "Albert Einstein"

        # 5. /me endpoint with missing / invalid token fails with 401 / 403
        unauth_res = await client.get("/api/v1/auth/me")
        assert unauth_res.status_code in [401, 403]

        # 6. Refresh token endpoint
        ref_res = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert ref_res.status_code == 200
        ref_data = ref_res.json()
        new_refresh_token = ref_data["refresh_token"]
        assert new_refresh_token != refresh_token

        # 7. Logout endpoint
        logout_res = await client.post(
            "/api/v1/auth/logout",
            json={"refresh_token": new_refresh_token},
        )
        assert logout_res.status_code == 204

    app.dependency_overrides.clear()
