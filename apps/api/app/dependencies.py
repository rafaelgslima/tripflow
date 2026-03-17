import ssl
from functools import lru_cache
from typing import Annotated, Any
from uuid import UUID

import certifi
from fastapi import Depends, Header
from jwt import (
    DecodeError,
    ExpiredSignatureError,
    InvalidAudienceError,
    InvalidIssuerError,
    InvalidTokenError,
    MissingRequiredClaimError,
    PyJWKClient,
    PyJWKClientError,
    decode,
    get_unverified_header,
)
from supabase import Client, create_client

from app.config import Settings, get_settings
from app.exceptions import UnauthorizedError
from app.repositories.itinerary_items import ItineraryItemsRepository
from app.repositories.travel_plan_shares import TravelPlanSharesRepository
from app.repositories.travel_plans import TravelPlansRepository
from app.schemas.common import AuthenticatedUser
from app.services.email import EmailService
from app.services.itinerary_items import ItineraryItemsService
from app.services.travel_plan_shares import TravelPlanSharesService
from app.services.travel_plans import TravelPlansService

SUPPORTED_ALGORITHMS = {"HS256", "RS256", "ES256"}
JWT_CLOCK_SKEW_SECONDS = 60


def get_supabase_admin_client(
    settings: Annotated[Settings, Depends(get_settings)],
) -> Client:
    """Return Supabase admin client for server-side API operations."""

    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise UnauthorizedError("Missing Authorization header.")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise UnauthorizedError("Invalid Authorization header format.")

    return token


@lru_cache(maxsize=8)
def _get_jwk_client(jwks_url: str) -> PyJWKClient:
    ssl_context = ssl.create_default_context(cafile=certifi.where())
    return PyJWKClient(jwks_url, ssl_context=ssl_context)


def _get_signing_key(token: str, settings: Settings) -> tuple[Any, str]:
    unverified_header = get_unverified_header(token)
    algorithm = str(unverified_header.get("alg", "")).upper()

    if algorithm not in SUPPORTED_ALGORITHMS:
        raise UnauthorizedError("Unsupported token signing algorithm.")

    if algorithm == "HS256":
        if not settings.supabase_jwt_secret:
            raise UnauthorizedError("Server JWT configuration is invalid.")
        return settings.supabase_jwt_secret, algorithm

    issuer = f"{settings.supabase_url.rstrip('/')}/auth/v1"
    jwks_url = f"{issuer}/.well-known/jwks.json"

    try:
        signing_key = _get_jwk_client(jwks_url).get_signing_key_from_jwt(token)
    except PyJWKClientError as error:
        raise UnauthorizedError("Unable to validate token signing key.") from error

    return signing_key.key, algorithm


def _decode_supabase_jwt(token: str, settings: Settings) -> dict[str, Any]:
    issuer = f"{settings.supabase_url.rstrip('/')}/auth/v1"

    try:
        signing_key, algorithm = _get_signing_key(token, settings)
        payload = decode(
            token,
            signing_key,
            algorithms=[algorithm],
            audience="authenticated",
            issuer=issuer,
            leeway=JWT_CLOCK_SKEW_SECONDS,
            options={
                    # Supabase access tokens omit nbf, so keep verification optional.
                    "require": ["exp", "iat", "iss", "aud", "sub"],
            },
        )
    except (
        DecodeError,
        ExpiredSignatureError,
        InvalidAudienceError,
        InvalidIssuerError,
        InvalidTokenError,
        MissingRequiredClaimError,
    ) as error:
        raise UnauthorizedError("Invalid or expired access token.") from error

    return payload


def get_authenticated_user(
    settings: Annotated[Settings, Depends(get_settings)],
    authorization: Annotated[str | None, Header()] = None,
) -> AuthenticatedUser:
    """Validate Supabase JWT from Authorization header and return user context."""

    token = _extract_bearer_token(authorization)
    payload = _decode_supabase_jwt(token, settings)
    sub = payload.get("sub")

    if not sub:
        raise UnauthorizedError("Token is missing required subject claim.")

    return AuthenticatedUser(user_id=UUID(sub), email=payload.get("email"))


def get_travel_plans_repository(
    supabase_client: Annotated[Client, Depends(get_supabase_admin_client)],
) -> TravelPlansRepository:
    return TravelPlansRepository(supabase_client=supabase_client)


def get_travel_plans_service(
    repository: Annotated[
        TravelPlansRepository,
        Depends(get_travel_plans_repository),
    ],
) -> TravelPlansService:
    return TravelPlansService(repository=repository)


def get_itinerary_items_repository(
    supabase_client: Annotated[Client, Depends(get_supabase_admin_client)],
) -> ItineraryItemsRepository:
    return ItineraryItemsRepository(supabase_client=supabase_client)


def get_itinerary_items_service(
    repository: Annotated[
        ItineraryItemsRepository,
        Depends(get_itinerary_items_repository),
    ],
    travel_plans_repository: Annotated[
        TravelPlansRepository,
        Depends(get_travel_plans_repository),
    ],
) -> ItineraryItemsService:
    return ItineraryItemsService(
        repository=repository,
        travel_plans_repository=travel_plans_repository,
    )


def get_travel_plan_shares_repository(
    supabase_client: Annotated[Client, Depends(get_supabase_admin_client)],
) -> TravelPlanSharesRepository:
    return TravelPlanSharesRepository(supabase_client=supabase_client)


def get_email_service() -> EmailService:
    return EmailService()


def get_travel_plan_shares_service(
    repository: Annotated[
        TravelPlanSharesRepository,
        Depends(get_travel_plan_shares_repository),
    ],
    travel_plans_repository: Annotated[
        TravelPlansRepository,
        Depends(get_travel_plans_repository),
    ],
    settings: Annotated[Settings, Depends(get_settings)],
    email_service: Annotated[EmailService, Depends(get_email_service)],
) -> TravelPlanSharesService:
    return TravelPlanSharesService(
        repository=repository,
        travel_plans_repository=travel_plans_repository,
        settings=settings,
        email_service=email_service,
    )
