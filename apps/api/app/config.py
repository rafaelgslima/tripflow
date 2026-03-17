from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str | None = None

    # API
    api_cors_origins: list[str] = ["http://localhost:3000"]

    # Web
    web_base_url: str = "http://localhost:3000"

    # Sharing
    share_invite_ttl_hours: int = 48

    # Email backend — "gmail" (default) or "resend"
    # TODO: Switch to EMAIL_BACKEND=resend once a domain is verified at
    #       https://resend.com/domains and EMAIL_FROM is updated.
    email_backend: str = "gmail"

    # Gmail SMTP (used when EMAIL_BACKEND=gmail)
    # How to create an App Password: https://support.google.com/accounts/answer/185833
    gmail_user: str | None = None
    gmail_app_password: str | None = None

    # Resend (used when EMAIL_BACKEND=resend — requires a verified domain)
    resend_api_key: str | None = None
    email_from: str = "onboarding@resend.dev"


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()  # type: ignore[call-arg]
