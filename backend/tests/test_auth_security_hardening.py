import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings

@pytest.mark.asyncio
async def test_auth_security_hardening_lifecycle():
    """
    Exhaustive Security Hardening Test Suite:
    1. Refresh token rotation & single-use replay prevention
    2. Replay attack rejection (reusing old rotated refresh token)
    3. Logout / Token revocation verification
    4. Production guard on dev-connect endpoint
    5. Rejection of malformed/tampered JWT tokens
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        uid = uuid.uuid4().hex[:8]
        user_email = f"security_auditor_{uid}@lab.org"
        user_password = "StrongPassword#2026!"

        # 1. Register
        reg_res = await client.post(
            "/api/v1/auth/register",
            json={"email": user_email, "password": user_password, "full_name": f"Security Auditor {uid}"},
        )
        assert reg_res.status_code == 201
        tokens_1 = reg_res.json()["tokens"]
        access_token_1 = tokens_1["access_token"]
        refresh_token_1 = tokens_1["refresh_token"]

        # 2. Refresh Token Rotation
        ref_res_1 = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token_1})
        assert ref_res_1.status_code == 200
        tokens_2 = ref_res_1.json()
        access_token_2 = tokens_2["access_token"]
        refresh_token_2 = tokens_2["refresh_token"]
        assert refresh_token_2 != refresh_token_1

        # 3. Refresh Replay Attack Defense (Attempting to use old refresh_token_1 again)
        replay_res = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token_1})
        assert replay_res.status_code == 401

        # 4. Logout / Token Revocation
        logout_res = await client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token_2})
        assert logout_res.status_code == 204

        # 5. Refresh after Logout must be rejected
        revoked_refresh = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token_2})
        assert revoked_refresh.status_code == 401

        # 6. Malformed/Tampered JWT Token Rejection
        tampered_token = access_token_2[:-6] + "xxxxxx"
        tampered_res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tampered_token}"})
        assert tampered_res.status_code == 401

        # 7. Dev-Connect Production Environment Guard
        original_env = settings.ENVIRONMENT
        try:
            settings.ENVIRONMENT = "production"
            dev_conn_prod = await client.post(
                "/api/v1/auth/oauth/dev-connect",
                json={"provider": "google", "email": f"prod_test_{uid}@lab.org"},
            )
            assert dev_conn_prod.status_code == 403
            err_data = dev_conn_prod.json()
            err_msg = err_data.get("error", {}).get("message", "") or err_data.get("detail", "")
            assert "disabled in production" in err_msg
        finally:
            settings.ENVIRONMENT = original_env
