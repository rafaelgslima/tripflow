from datetime import date
from typing import Any

from postgrest.exceptions import APIError
from supabase import Client

from app.exceptions import SchemaOutOfDateError


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
        try:
            next_sort_order = self._get_next_sort_order(
                travel_plan_id=travel_plan_id,
                day=day,
            )

            response = (
                self._supabase_client.table("itinerary_item")
                .insert(
                    {
                        "travel_plan_id": travel_plan_id,
                        "date": day.isoformat(),
                        "description": description,
                        "created_by_user_id": created_by_user_id,
                        "sort_order": next_sort_order,
                    }
                )
                .execute()
            )
        except APIError as error:
            self._raise_if_missing_sort_order(error)
            raise

        if not response.data:
            raise RuntimeError("Supabase returned empty response for itinerary item.")

        return response.data[0]

    def list_itinerary_items(
        self,
        *,
        travel_plan_id: str,
        day: date,
    ) -> list[dict[str, Any]]:
        try:
            response = (
                self._supabase_client.table("itinerary_item")
                .select("*")
                .eq("travel_plan_id", travel_plan_id)
                .eq("date", day.isoformat())
                .order("sort_order", desc=False)
                .order("created_at", desc=False)
                .execute()
            )
        except APIError as error:
            self._raise_if_missing_sort_order(error)
            raise

        return response.data or []

    def get_itinerary_item(self, *, item_id: str) -> dict[str, Any] | None:
        response = (
            self._supabase_client.table("itinerary_item")
            .select("*")
            .eq("id", item_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    def update_itinerary_item_description(
        self,
        *,
        item_id: str,
        description: str,
    ) -> dict[str, Any]:
        response = (
            self._supabase_client.table("itinerary_item")
            .update({"description": description})
            .eq("id", item_id)
            .execute()
        )

        if not response.data:
            raise RuntimeError("Supabase returned empty response for itinerary update.")

        return response.data[0]

    def delete_itinerary_item(self, *, item_id: str) -> None:
        self._supabase_client.table("itinerary_item").delete().eq("id", item_id).execute()

    def update_itinerary_item_sort_orders(
        self,
        *,
        item_id_to_sort_order: dict[str, int],
    ) -> None:
        if not item_id_to_sort_order:
            return

        # Reordering under a UNIQUE(travel_plan_id, date, sort_order) constraint can fail
        # when two rows swap sort_order values in a single statement. Avoid transient
        # collisions by first moving all rows to unique negative values, then applying
        # the final non-negative ordering.
        temp_updates = {
            item_id: -(sort_order + 1)
            for item_id, sort_order in item_id_to_sort_order.items()
        }

        try:
            for item_id, sort_order in temp_updates.items():
                self._supabase_client.table("itinerary_item").update(
                    {"sort_order": sort_order}
                ).eq("id", item_id).execute()

            for item_id, sort_order in item_id_to_sort_order.items():
                self._supabase_client.table("itinerary_item").update(
                    {"sort_order": sort_order}
                ).eq("id", item_id).execute()
        except APIError as error:
            self._raise_if_missing_sort_order(error)
            raise

    def _get_next_sort_order(self, *, travel_plan_id: str, day: date) -> int:
        try:
            response = (
                self._supabase_client.table("itinerary_item")
                .select("sort_order")
                .eq("travel_plan_id", travel_plan_id)
                .eq("date", day.isoformat())
                .order("sort_order", desc=True)
                .limit(1)
                .execute()
            )
        except APIError as error:
            self._raise_if_missing_sort_order(error)
            raise

        if not response.data:
            return 0

        max_sort_order = response.data[0].get("sort_order")
        if max_sort_order is None:
            return 0

        return int(max_sort_order) + 1

    @staticmethod
    def _raise_if_missing_sort_order(error: APIError) -> None:
        code = getattr(error, "code", None)
        message = str(getattr(error, "message", "") or "")

        if str(code) != "42703":
            return

        if "itinerary_item.sort_order" not in message and "sort_order" not in message:
            return

        raise SchemaOutOfDateError(
            "Database schema is out of date (missing itinerary_item.sort_order). "
            "Apply the latest Supabase migrations and try again."
        )
