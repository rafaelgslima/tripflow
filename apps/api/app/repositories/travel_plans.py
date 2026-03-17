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

    def list_travel_plans_for_user(self, *, user_id: str) -> list[dict[str, Any]]:
        owned_response = (
            self._supabase_client.table("travel_plan")
            .select("*")
            .eq("owner_user_id", user_id)
            .order("start_date", desc=False)
            .execute()
        )
        owned_plans: list[dict[str, Any]] = owned_response.data or []

        share_response = (
            self._supabase_client.table("travel_plan_share")
            .select("travel_plan_id")
            .eq("invited_user_id", user_id)
            .eq("status", "accepted")
            .execute()
        )
        shared_ids = [row.get("travel_plan_id") for row in (share_response.data or [])]
        shared_ids = [plan_id for plan_id in shared_ids if plan_id]

        shared_plans: list[dict[str, Any]] = []
        if shared_ids:
            shared_response = (
                self._supabase_client.table("travel_plan")
                .select("*")
                .in_("id", shared_ids)
                .order("start_date", desc=False)
                .execute()
            )
            shared_plans = shared_response.data or []

        merged_by_id: dict[str, dict[str, Any]] = {}
        for plan in shared_plans + owned_plans:
            plan_id = plan.get("id")
            if plan_id:
                merged_by_id[str(plan_id)] = plan

        merged = list(merged_by_id.values())
        merged.sort(key=lambda plan: str(plan.get("start_date", "")))
        return merged

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
