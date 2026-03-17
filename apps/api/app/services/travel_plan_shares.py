from __future__ import annotations

import hashlib
import logging
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

import resend.exceptions

logger = logging.getLogger(__name__)

from app.config import Settings
from app.exceptions import ConflictError, ForbiddenError, NotFoundError, TripFlowError, ValidationError
from app.repositories.travel_plan_shares import TravelPlanSharesRepository
from app.repositories.travel_plans import TravelPlansRepository
from app.services.email import EmailService


class TravelPlanSharesService:
    """Business logic for travel plan shares (invites + acceptance)."""

    def __init__(
        self,
        *,
        repository: TravelPlanSharesRepository,
        travel_plans_repository: TravelPlansRepository,
        settings: Settings,
        email_service: EmailService,
    ) -> None:
        self._repository = repository
        self._travel_plans_repository = travel_plans_repository
        self._settings = settings
        self._email_service = email_service

    def create_share_invite(
        self,
        *,
        user_id: UUID,
        travel_plan_id: UUID,
        invited_email: str,
        invited_by_email: str | None = None,
    ) -> dict[str, str]:
        if not self._travel_plans_repository.user_can_access_travel_plan(
            user_id=str(user_id),
            travel_plan_id=str(travel_plan_id),
        ):
            raise ForbiddenError("You do not have access to this travel plan.")

        if invited_by_email and invited_by_email.strip().lower() == invited_email.lower():
            raise ValidationError("You cannot invite your own email address.")

        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
        now = datetime.now(tz=UTC)
        expires_at = now + timedelta(hours=self._settings.share_invite_ttl_hours)

        share = self._repository.upsert_pending_invite(
            travel_plan_id=str(travel_plan_id),
            invited_email=invited_email,
            invited_by_user_id=str(user_id),
            invite_token_hash=token_hash,
            invite_token_expires_at=expires_at,
        )

        accept_url = (
            f"{self._settings.web_base_url.rstrip('/')}/share/accept"
            f"?token={token}"
        )

        try:
            self._email_service.send_travel_plan_invite(
                to_email=invited_email,
                invited_by_email=invited_by_email,
                accept_url=accept_url,
            )
        except resend.exceptions.ResendError as exc:
            logger.error("Resend error sending invite to=%s: %s", invited_email, exc)
            raise TripFlowError(
                "Failed to send the invitation email. Please try again later."
            ) from exc

        return {
            "travel_plan_id": str(travel_plan_id),
            "invited_email": invited_email,
            "status": str(share.get("status", "pending")),
        }

    def accept_share_invite(
        self,
        *,
        user_id: UUID,
        user_email: str | None,
        token: str,
    ) -> dict[str, str]:
        if not user_email:
            raise UnauthorizedEmailError()

        token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
        share = self._repository.get_by_invite_token_hash(invite_token_hash=token_hash)

        if not share:
            raise NotFoundError("Invite link is invalid.")

        if share.get("invite_token_used_at"):
            raise ConflictError("Invite link has already been used.")

        expires_at = share.get("invite_token_expires_at")
        if expires_at:
            try:
                expires_at_dt = datetime.fromisoformat(str(expires_at))
            except ValueError:
                expires_at_dt = None
            if expires_at_dt and expires_at_dt < datetime.now(tz=UTC):
                raise ValidationError("Invite link has expired.")

        invited_email = str(share.get("invited_email", "")).strip().lower()
        if invited_email and user_email and invited_email != user_email.strip().lower():
            raise ForbiddenError(
                f"This invite was sent to {share.get('invited_email')}. "
                "Please sign in with that email address to accept it."
            )

        accepted_at = datetime.now(tz=UTC)
        updated = self._repository.mark_accepted(
            share_id=str(share["id"]),
            invited_user_id=str(user_id),
            accepted_at=accepted_at,
        )

        return {
            "travel_plan_id": str(updated.get("travel_plan_id")),
            "status": str(updated.get("status", "accepted")),
        }


class UnauthorizedEmailError(ValidationError):
    message = "Your account is missing an email address."
