from datetime import date, datetime, time as dt_time
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class ItineraryItemCreateRequest(BaseModel):
    """Request body for creating an itinerary item."""

    description: str = Field(min_length=1, max_length=2000)

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        normalized_value = value.strip()
        if not normalized_value:
            raise ValueError("Description cannot be empty.")
        return normalized_value


class ItineraryItemResponse(BaseModel):
    """Itinerary item response payload."""

    id: UUID
    travel_plan_id: UUID
    date: date
    time: dt_time | None = None
    description: str
    created_by_user_id: UUID
    created_at: datetime
    updated_at: datetime
