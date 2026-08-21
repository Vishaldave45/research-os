import pytest
import uuid
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    generate_refresh_token,
    hash_token,
    decode_jwt_token,
)
from app.schemas.user import UserCreate, UserLogin


def test_password_hashing():
    password = "ResearchOS#Secure2026"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword123", hashed) is False


def test_jwt_token_generation_and_decoding():
    user_id = str(uuid.uuid4())
    token = create_access_token(subject=user_id, extra_claims={"role": "researcher"})
    payload = decode_jwt_token(token)
    
    assert payload is not None
    assert payload.get("sub") == user_id
    assert payload.get("type") == "access"
    assert payload.get("role") == "researcher"


def test_refresh_token_hashing():
    raw_token = generate_refresh_token()
    assert len(raw_token) > 40
    hash_1 = hash_token(raw_token)
    hash_2 = hash_token(raw_token)
    assert hash_1 == hash_2
    assert hash_1 != raw_token


def test_user_schemas():
    valid_data = {
        "email": "lead.investigator@researchos.org",
        "full_name": "Dr. Sarah Chen",
        "password": "StrongPassword123!",
    }
    user_create = UserCreate(**valid_data)
    assert user_create.email == "lead.investigator@researchos.org"
    assert user_create.full_name == "Dr. Sarah Chen"
