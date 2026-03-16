from typing import Any

from supabase import Client

from app.schemas.travel_plans import TravelPlanCreateRequest


class TravelPlansRepository:
    """Repository for travel plan persistence operations."""

    def __init__(self, supabase_client: Client) -> None:
        self._supabase_client = supabase_client

    def create_travel_plan(
        self,
        *,
        owner_user_id: str,
        payload: TravelPlanCreateRequest,
    ) -> dict[str, Any]:
        response = (
            self._supabase_client.table("travel_plan")
            .insert(
                {
                    "owner_user_id": owner_user_id,
                    "destination_city": payload.destination_city,
                    "start_date": payload.start_date.isoformat(),
                    "end_date": payload.end_date.isoformat(),
                }
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Supabase returned empty response for travel plan creation."
            )

        return response.data[0]

    def list_travel_plans(self, *, owner_user_id: str) -> list[dict[str, Any]]:
        response = (
            self._supabase_client.table("travel_plan")
            .select("*")
            .eq("owner_user_id", owner_user_id)
            .order("start_date", desc=False)
            .execute()
        )

        return response.data or []

    def user_can_access_travel_plan(
        self,
        *,
        user_id: str,
        travel_plan_id: str,
    ) -> bool:
        owner_response = (
            self._supabase_client.table("travel_plan")
            .select("id")
            .eq("id", travel_plan_id)
            .eq("owner_user_id", user_id)
            .limit(1)
            .execute()
        )

        if owner_response.data:
            return True

        share_response = (
            self._supabase_client.table("travel_plan_share")
            .select("id")
            .eq("travel_plan_id", travel_plan_id)
            .eq("invited_user_id", user_id)
            .eq("status", "accepted")
            .limit(1)
            .execute()
        )

        return bool(share_response.data)

    def user_can_access_travel_plan(
        self,
        *,
        user_id: str,
        travel_plan_id: str,
    ) -> bool:
        owner_match = (
            self._supabase_client.table("travel_plan")
            .select("id")
            .eq("id", travel_plan_id)
            .eq("owner_user_id", user_id)
            .limit(1)
            .execute()
        )

        if owner_match.data:
            return True

        collaborator_match = (
            self._supabase_client.table("travel_plan_share")
            .select("id")
            .eq("travel_plan_id", travel_plan_id)
            .eq("invited_user_id", user_id)
            .eq("status", "accepted")
            .limit(1)
            .execute()
        )

        return bool(collaborator_match.data)
