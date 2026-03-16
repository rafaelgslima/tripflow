from datetime import date
from typing import Any

from supabase import Client


class ItineraryItemsRepository:
    """Repository for itinerary item persistence operations."""

    def __init__(self, supabase_client: Client) -> None:
        self._supabase_client = supabase_client

    def create_itinerary_item(
        self,
        *,
        travel_plan_id: str,
        day: date,
        description: str,
        created_by_user_id: str,
    ) -> dict[str, Any]:
        response = (
            self._supabase_client.table("itinerary_item")
            .insert(
                {
                    "travel_plan_id": travel_plan_id,
                    "date": day.isoformat(),
                    "description": description,
                    "created_by_user_id": created_by_user_id,
                }
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError("Supabase returned empty response for itinerary item.")

        return response.data[0]

    def list_itinerary_items(
        self,
        *,
        travel_plan_id: str,
        day: date,
    ) -> list[dict[str, Any]]:
        response = (
            self._supabase_client.table("itinerary_item")
            .select("*")
            .eq("travel_plan_id", travel_plan_id)
            .eq("date", day.isoformat())
            .order("created_at", desc=False)
            .execute()
        )

        return response.data or []
