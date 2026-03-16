from datetime import date
from uuid import UUID

from app.exceptions import NotFoundError, ValidationError
from app.repositories.itinerary_items import ItineraryItemsRepository
from app.repositories.travel_plans import TravelPlansRepository
from app.schemas.itinerary_items import (
    ItineraryItemCreateRequest,
    ItineraryItemReorderRequest,
    ItineraryItemResponse,
    ItineraryItemUpdateRequest,
)


class ItineraryItemsService:
    """Business logic layer for itinerary items."""

    def __init__(
        self,
        *,
        repository: ItineraryItemsRepository,
        travel_plans_repository: TravelPlansRepository,
    ) -> None:
        self._repository = repository
        self._travel_plans_repository = travel_plans_repository

    def create_itinerary_item(
        self,
        *,
        user_id: UUID,
        travel_plan_id: UUID,
        day: date,
        payload: ItineraryItemCreateRequest,
    ) -> ItineraryItemResponse:
        if not self._travel_plans_repository.user_can_access_travel_plan(
            user_id=str(user_id),
            travel_plan_id=str(travel_plan_id),
        ):
            raise NotFoundError("Travel plan not found.")

        raw_item = self._repository.create_itinerary_item(
            travel_plan_id=str(travel_plan_id),
            day=day,
            description=payload.description,
            created_by_user_id=str(user_id),
        )

        return ItineraryItemResponse.model_validate(raw_item)

    def list_itinerary_items(
        self,
        *,
        user_id: UUID,
        travel_plan_id: UUID,
        day: date,
    ) -> list[ItineraryItemResponse]:
        if not self._travel_plans_repository.user_can_access_travel_plan(
            user_id=str(user_id),
            travel_plan_id=str(travel_plan_id),
        ):
            raise NotFoundError("Travel plan not found.")

        raw_items = self._repository.list_itinerary_items(
            travel_plan_id=str(travel_plan_id),
            day=day,
        )
        return [ItineraryItemResponse.model_validate(item) for item in raw_items]

    def update_itinerary_item(
        self,
        *,
        user_id: UUID,
        travel_plan_id: UUID,
        day: date,
        item_id: UUID,
        payload: ItineraryItemUpdateRequest,
    ) -> ItineraryItemResponse:
        if not self._travel_plans_repository.user_can_access_travel_plan(
            user_id=str(user_id),
            travel_plan_id=str(travel_plan_id),
        ):
            raise NotFoundError("Travel plan not found.")

        existing_item = self._repository.get_itinerary_item(item_id=str(item_id))
        if not existing_item:
            raise NotFoundError("Itinerary item not found.")

        if str(existing_item.get("travel_plan_id")) != str(travel_plan_id):
            raise NotFoundError("Itinerary item not found.")

        if str(existing_item.get("date")) != day.isoformat():
            raise NotFoundError("Itinerary item not found.")

        updated_item = self._repository.update_itinerary_item_description(
            item_id=str(item_id),
            description=payload.description,
        )

        return ItineraryItemResponse.model_validate(updated_item)

    def delete_itinerary_item(
        self,
        *,
        user_id: UUID,
        travel_plan_id: UUID,
        day: date,
        item_id: UUID,
    ) -> None:
        if not self._travel_plans_repository.user_can_access_travel_plan(
            user_id=str(user_id),
            travel_plan_id=str(travel_plan_id),
        ):
            raise NotFoundError("Travel plan not found.")

        existing_item = self._repository.get_itinerary_item(item_id=str(item_id))
        if not existing_item:
            raise NotFoundError("Itinerary item not found.")

        if str(existing_item.get("travel_plan_id")) != str(travel_plan_id):
            raise NotFoundError("Itinerary item not found.")

        if str(existing_item.get("date")) != day.isoformat():
            raise NotFoundError("Itinerary item not found.")

        self._repository.delete_itinerary_item(item_id=str(item_id))

    def reorder_itinerary_items(
        self,
        *,
        user_id: UUID,
        travel_plan_id: UUID,
        day: date,
        payload: ItineraryItemReorderRequest,
    ) -> None:
        if not self._travel_plans_repository.user_can_access_travel_plan(
            user_id=str(user_id),
            travel_plan_id=str(travel_plan_id),
        ):
            raise NotFoundError("Travel plan not found.")

        existing_items = self._repository.list_itinerary_items(
            travel_plan_id=str(travel_plan_id),
            day=day,
        )
        existing_ids = {str(item.get("id")) for item in existing_items}
        desired_ids = {str(item_id) for item_id in payload.item_ids_in_order}

        if existing_ids != desired_ids:
            raise ValidationError(
                "Item IDs must include exactly all itinerary items for this day."
            )

        id_to_sort_order = {
            str(item_id): index
            for index, item_id in enumerate(payload.item_ids_in_order)
        }
        self._repository.update_itinerary_item_sort_orders(
            item_id_to_sort_order=id_to_sort_order,
        )
