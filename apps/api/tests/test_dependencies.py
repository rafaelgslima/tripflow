from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock

import jwt

from app import dependencies


def test_get_jwk_client_uses_certifi_bundle(monkeypatch):
    dependencies._get_jwk_client.cache_clear()

    cert_path = "/tmp/cert.pem"
    monkeypatch.setattr(
        dependencies,
        "certifi",
        SimpleNamespace(where=lambda: cert_path),
        raising=False,
    )

    create_context = MagicMock(return_value="ssl-context")
    monkeypatch.setattr(
        dependencies,
        "ssl",
        SimpleNamespace(create_default_context=create_context),
        raising=False,
    )

    jwk_client_cls = MagicMock()
    monkeypatch.setattr(dependencies, "PyJWKClient", jwk_client_cls)

    try:
        result = dependencies._get_jwk_client("https://example.com/jwks.json")
    finally:
        dependencies._get_jwk_client.cache_clear()

    create_context.assert_called_once_with(cafile=cert_path)
    jwk_client_cls.assert_called_once_with(
        "https://example.com/jwks.json",
        ssl_context="ssl-context",
    )
    assert result is jwk_client_cls.return_value


def test_decode_supabase_jwt_allows_missing_nbf():
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "d8f9b9c0-1234-4bcd-87ef-aaaaaaaaaaaa",
        "aud": "authenticated",
        "iss": "https://project.supabase.co/auth/v1",
        "exp": int((now + timedelta(minutes=5)).timestamp()),
        "iat": int(now.timestamp()),
        "email": "user@example.com",
    }

    settings = SimpleNamespace(
        supabase_url="https://project.supabase.co",
        supabase_jwt_secret="shh-secret",
    )

    token = jwt.encode(payload, settings.supabase_jwt_secret, algorithm="HS256")

    decoded_payload = dependencies._decode_supabase_jwt(token, settings)

    assert decoded_payload["email"] == "user@example.com"
