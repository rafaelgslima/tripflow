from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.dependencies import (
    get_authenticated_user,
    get_travel_plan_shares_service,
    get_travel_plans_service,
)
from app.schemas.common import AuthenticatedUser, ErrorEnvelope
from app.schemas.travel_plan_shares import (
    TravelPlanShareCreateRequest,
    TravelPlanShareCreateResponse,
)
from app.schemas.travel_plans import TravelPlanCreateRequest, TravelPlanResponse
from app.services.travel_plan_shares import TravelPlanSharesService
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
    return service.list_travel_plans(user_id=current_user.user_id)


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


@router.post(
    "/{travel_plan_id}/shares",
    response_model=TravelPlanShareCreateResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        401: {"model": ErrorEnvelope, "description": "Authentication required"},
        403: {"model": ErrorEnvelope, "description": "Forbidden"},
        422: {"model": ErrorEnvelope, "description": "Validation error"},
        500: {"model": ErrorEnvelope, "description": "Internal server error"},
    },
)
def create_travel_plan_share(
    travel_plan_id: str,
    payload: TravelPlanShareCreateRequest,
    current_user: Annotated[AuthenticatedUser, Depends(get_authenticated_user)],
    service: Annotated[
        TravelPlanSharesService,
        Depends(get_travel_plan_shares_service),
    ],
) -> TravelPlanShareCreateResponse:
    result = service.create_share_invite(
        user_id=current_user.user_id,
        travel_plan_id=UUID(travel_plan_id),
        invited_email=str(payload.invited_email),
        invited_by_email=current_user.email,
    )
    return TravelPlanShareCreateResponse.model_validate(result)


@router.delete(
    "/{travel_plan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        401: {"model": ErrorEnvelope, "description": "Authentication required"},
        404: {"model": ErrorEnvelope, "description": "Travel plan not found"},
        500: {"model": ErrorEnvelope, "description": "Internal server error"},
    },
)
def delete_travel_plan(
    travel_plan_id: str,
    current_user: Annotated[AuthenticatedUser, Depends(get_authenticated_user)],
    service: Annotated[TravelPlansService, Depends(get_travel_plans_service)],
) -> None:
    service.delete_travel_plan(
        user_id=current_user.user_id,
        travel_plan_id=UUID(travel_plan_id),
    )
