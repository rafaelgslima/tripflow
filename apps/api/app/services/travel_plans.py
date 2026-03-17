from uuid import UUID

from app.exceptions import ForbiddenError, NotFoundError
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

    def delete_travel_plan(self, *, user_id: UUID, travel_plan_id: UUID) -> None:
        """Delete a travel plan for the requesting user.

        - If the user is the owner, the plan and all its data are permanently deleted
          for everyone (owner + all collaborators).
        - If the user is an accepted collaborator, only their share record is removed;
          the plan remains intact for the owner and other collaborators.
        - If the user has no access at all, raises NotFoundError (avoids leaking existence).
        """
        user_id_str = str(user_id)
        travel_plan_id_str = str(travel_plan_id)

        if self._repository.user_is_owner(
            user_id=user_id_str,
            travel_plan_id=travel_plan_id_str,
        ):
            self._repository.delete_travel_plan(travel_plan_id=travel_plan_id_str)
            return

        # Check if user is an accepted collaborator
        is_collaborator = self._repository.user_can_access_travel_plan(
            user_id=user_id_str,
            travel_plan_id=travel_plan_id_str,
        )
        if is_collaborator:
            self._repository.remove_share_for_user(
                user_id=user_id_str,
                travel_plan_id=travel_plan_id_str,
            )
            return

        raise NotFoundError("Travel plan not found.")
