from uuid import UUID

from app.repositories.travel_plans import TravelPlansRepository
from app.schemas.travel_plans import TravelPlanCreateRequest, TravelPlanResponse


class TravelPlansService:
    """Business logic layer for travel plans."""

    def __init__(self, repository: TravelPlansRepository) -> None:
        self._repository = repository

    def create_travel_plan(
        self,
        *,
        owner_user_id: UUID,
        payload: TravelPlanCreateRequest,
    ) -> TravelPlanResponse:
        travel_plan_data = self._repository.create_travel_plan(
            owner_user_id=str(owner_user_id),
            payload=payload,
        )
        return TravelPlanResponse.model_validate(travel_plan_data)

    def list_travel_plans(self, *, user_id: UUID) -> list[TravelPlanResponse]:
        raw_travel_plans = self._repository.list_travel_plans_for_user(
            user_id=str(user_id)
        )
        return [TravelPlanResponse.model_validate(plan) for plan in raw_travel_plans]
