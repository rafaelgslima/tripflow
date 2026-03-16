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
