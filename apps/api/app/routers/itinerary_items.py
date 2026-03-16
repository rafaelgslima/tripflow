from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.dependencies import get_authenticated_user, get_itinerary_items_service
from app.schemas.common import AuthenticatedUser, ErrorEnvelope
from app.schemas.itinerary_items import (
    ItineraryItemCreateRequest,
    ItineraryItemResponse,
    ItineraryItemUpdateRequest,
)
from app.services.itinerary_items import ItineraryItemsService

router = APIRouter(prefix="/v1/travel-plans", tags=["itinerary-items"])


@router.get(
    "/{travel_plan_id}/days/{day}/items",
    response_model=list[ItineraryItemResponse],
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorEnvelope, "description": "Authentication required"},
        404: {"model": ErrorEnvelope, "description": "Not found"},
        500: {"model": ErrorEnvelope, "description": "Internal server error"},
    },
)
def list_itinerary_items(
    travel_plan_id: UUID,
    day: date,
    current_user: Annotated[AuthenticatedUser, Depends(get_authenticated_user)],
    service: Annotated[ItineraryItemsService, Depends(get_itinerary_items_service)],
) -> list[ItineraryItemResponse]:
    return service.list_itinerary_items(
        user_id=current_user.user_id,
        travel_plan_id=travel_plan_id,
        day=day,
    )


@router.post(
    "/{travel_plan_id}/days/{day}/items",
    response_model=ItineraryItemResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        401: {"model": ErrorEnvelope, "description": "Authentication required"},
        404: {"model": ErrorEnvelope, "description": "Not found"},
        422: {"model": ErrorEnvelope, "description": "Validation error"},
        500: {"model": ErrorEnvelope, "description": "Internal server error"},
    },
)
def create_itinerary_item(
    travel_plan_id: UUID,
    day: date,
    payload: ItineraryItemCreateRequest,
    current_user: Annotated[AuthenticatedUser, Depends(get_authenticated_user)],
    service: Annotated[ItineraryItemsService, Depends(get_itinerary_items_service)],
) -> ItineraryItemResponse:
    return service.create_itinerary_item(
        user_id=current_user.user_id,
        travel_plan_id=travel_plan_id,
        day=day,
        payload=payload,
    )


@router.put(
    "/{travel_plan_id}/days/{day}/items/{item_id}",
    response_model=ItineraryItemResponse,
    status_code=status.HTTP_200_OK,
    responses={
        401: {"model": ErrorEnvelope, "description": "Authentication required"},
        404: {"model": ErrorEnvelope, "description": "Not found"},
        422: {"model": ErrorEnvelope, "description": "Validation error"},
        500: {"model": ErrorEnvelope, "description": "Internal server error"},
    },
)
def update_itinerary_item(
    travel_plan_id: UUID,
    day: date,
    item_id: UUID,
    payload: ItineraryItemUpdateRequest,
    current_user: Annotated[AuthenticatedUser, Depends(get_authenticated_user)],
    service: Annotated[ItineraryItemsService, Depends(get_itinerary_items_service)],
) -> ItineraryItemResponse:
    return service.update_itinerary_item(
        user_id=current_user.user_id,
        travel_plan_id=travel_plan_id,
        day=day,
        item_id=item_id,
        payload=payload,
    )
