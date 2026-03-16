from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.dependencies import get_authenticated_user, get_travel_plans_service
from app.schemas.common import AuthenticatedUser, ErrorEnvelope
from app.schemas.travel_plans import TravelPlanCreateRequest, TravelPlanResponse
from app.services.travel_plans import TravelPlansService

router = APIRouter(prefix="/v1/travel-plans", tags=["travel-plans"])


@router.get(
    "",
    response_model=list[TravelPlanResponse],
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorEnvelope, "description": "Authentication required"},
        500: {"model": ErrorEnvelope, "description": "Internal server error"},
    },
)
def list_travel_plans(
    current_user: Annotated[AuthenticatedUser, Depends(get_authenticated_user)],
    service: Annotated[TravelPlansService, Depends(get_travel_plans_service)],
) -> list[TravelPlanResponse]:
    return service.list_travel_plans(owner_user_id=current_user.user_id)


@router.post(
    "",
    response_model=TravelPlanResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        401: {"model": ErrorEnvelope, "description": "Authentication required"},
        422: {"model": ErrorEnvelope, "description": "Validation error"},
        500: {"model": ErrorEnvelope, "description": "Internal server error"},
    },
)
def create_travel_plan(
    payload: TravelPlanCreateRequest,
    current_user: Annotated[AuthenticatedUser, Depends(get_authenticated_user)],
    service: Annotated[TravelPlansService, Depends(get_travel_plans_service)],
) -> TravelPlanResponse:
    return service.create_travel_plan(
        owner_user_id=current_user.user_id,
        payload=payload,
    )
