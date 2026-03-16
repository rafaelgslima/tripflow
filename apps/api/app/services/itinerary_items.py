from datetime import date
from uuid import UUID

from app.exceptions import NotFoundError
from app.repositories.itinerary_items import ItineraryItemsRepository
from app.repositories.travel_plans import TravelPlansRepository
from app.schemas.itinerary_items import ItineraryItemCreateRequest, ItineraryItemResponse


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
