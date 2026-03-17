from __future__ import annotations

from datetime import datetime
from typing import Any

from supabase import Client


class TravelPlanSharesRepository:
    """Repository for travel plan share / invite persistence."""

    def __init__(self, supabase_client: Client) -> None:
        self._supabase_client = supabase_client

    def get_by_plan_and_email(
        self,
        *,
        travel_plan_id: str,
        invited_email: str,
    ) -> dict[str, Any] | None:
        response = (
            self._supabase_client.table("travel_plan_share")
            .select("*")
            .eq("travel_plan_id", travel_plan_id)
            .eq("invited_email", invited_email)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    def upsert_pending_invite(
        self,
        *,
        travel_plan_id: str,
        invited_email: str,
        invited_by_user_id: str,
        invite_token_hash: str,
        invite_token_expires_at: datetime,
    ) -> dict[str, Any]:
        payload = {
            "travel_plan_id": travel_plan_id,
            "invited_email": invited_email,
            "invited_user_id": None,
            "invited_by_user_id": invited_by_user_id,
            "status": "pending",
            "invite_token_hash": invite_token_hash,
            "invite_token_expires_at": invite_token_expires_at.isoformat(),
            "invite_token_used_at": None,
            "accepted_at": None,
        }

        response = (
            self._supabase_client.table("travel_plan_share")
            .upsert(payload, on_conflict="travel_plan_id,invited_email")
            .execute()
        )

        if not response.data:
            raise RuntimeError("Supabase returned empty response for share upsert.")

        return response.data[0]

    def get_by_invite_token_hash(
        self,
        *,
        invite_token_hash: str,
    ) -> dict[str, Any] | None:
        response = (
            self._supabase_client.table("travel_plan_share")
            .select("*")
            .eq("invite_token_hash", invite_token_hash)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    def mark_accepted(
        self,
        *,
        share_id: str,
        invited_user_id: str,
        accepted_at: datetime,
    ) -> dict[str, Any]:
        response = (
            self._supabase_client.table("travel_plan_share")
            .update(
                {
                    "status": "accepted",
                    "invited_user_id": invited_user_id,
                    "accepted_at": accepted_at.isoformat(),
                    "invite_token_used_at": accepted_at.isoformat(),
                }
            )
            .eq("id", share_id)
            .execute()
        )

        if not response.data:
            raise RuntimeError("Supabase returned empty response for share accept.")

        return response.data[0]
