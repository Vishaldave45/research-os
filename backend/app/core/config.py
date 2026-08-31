import json
from typing import List, Union, Any
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator, model_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "ResearchOS"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(
        default="development",
        description="Application runtime environment (development, test, staging, production)",
    )
    
    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://researchos_user:Dev%40123.@localhost:5435/researchos",
        description="Async PostgreSQL connection URL",
    )
    
    # JWT Authentication & Security
    JWT_SECRET_KEY: str = Field(
        default="yS0Ug/jfKXTcUxzDNWthue/3ugIm0LoZEvoD+cFxzhc=",
        description="Secret key for signing JWTs",
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # OAuth Providers (Google & GitHub)
    GOOGLE_CLIENT_ID: str = Field(default="", description="Google OAuth 2.0 Client ID")
    GOOGLE_CLIENT_SECRET: str = Field(default="", description="Google OAuth 2.0 Client Secret")
    GITHUB_CLIENT_ID: str = Field(default="", description="GitHub OAuth App Client ID")
    GITHUB_CLIENT_SECRET: str = Field(default="", description="GitHub OAuth App Client Secret")
    APP_URL: str = Field(default="", description="Base container URL for OAuth redirects")
    
    # CORS (accepts List[str] or comma-separated string)
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            v_str = v.strip()
            if v_str.startswith("[") and v_str.endswith("]"):
                try:
                    return json.loads(v_str)
                except Exception:
                    pass
            return [i.strip() for i in v_str.split(",") if i.strip()]
        elif isinstance(v, (list, set, tuple)):
            return [str(i) for i in v]
        return ["*"]

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.ENVIRONMENT.lower() == "production":
            insecure_keys = [
                "dev_jwt_secret_key_change_in_production_32chars",
                "secret",
                "changeme",
                "default",
            ]
            if any(insec in self.JWT_SECRET_KEY.lower() for insec in insecure_keys) or len(self.JWT_SECRET_KEY) < 32:
                raise ValueError("JWT_SECRET_KEY must be a secure random string of at least 32 characters in production.")
            if "researchos_secret_password" in self.DATABASE_URL:
                raise ValueError("DATABASE_URL must not use default development credentials in production.")
        return self

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.example"),
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()
