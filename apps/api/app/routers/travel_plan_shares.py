from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.dependencies import get_authenticated_user, get_travel_plan_shares_service
from app.schemas.common import AuthenticatedUser, ErrorEnvelope
from app.schemas.travel_plan_shares import (
    TravelPlanShareAcceptRequest,
    TravelPlanShareAcceptResponse,
)
from app.services.travel_plan_shares import TravelPlanSharesService

router = APIRouter(prefix="/v1/travel-plan-shares", tags=["travel-plan-shares"])


@router.post(
    "/accept",
    response_model=TravelPlanShareAcceptResponse,
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorEnvelope, "description": "Authentication required"},
        403: {"model": ErrorEnvelope, "description": "Forbidden"},
        404: {"model": ErrorEnvelope, "description": "Invite not found"},
        409: {"model": ErrorEnvelope, "description": "Invite already used"},
        422: {"model": ErrorEnvelope, "description": "Validation error"},
        500: {"model": ErrorEnvelope, "description": "Internal server error"},
    },
)
def accept_travel_plan_share(
    payload: TravelPlanShareAcceptRequest,
    current_user: Annotated[AuthenticatedUser, Depends(get_authenticated_user)],
    service: Annotated[
        TravelPlanSharesService,
        Depends(get_travel_plan_shares_service),
    ],
) -> TravelPlanShareAcceptResponse:
    result = service.accept_share_invite(
        user_id=current_user.user_id,
        user_email=current_user.email,
        token=payload.token,
    )
    return TravelPlanShareAcceptResponse.model_validate(result)
