from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class TravelPlanCreateRequest(BaseModel):
    """Request body for creating a travel plan."""

    destination_city: str = Field(min_length=1, max_length=255)
    start_date: date
    end_date: date

    @field_validator("destination_city")
    @classmethod
    def validate_destination_city(cls, value: str) -> str:
        normalized_value = value.strip()
        if not normalized_value:
            raise ValueError("Destination city cannot be empty.")
        return normalized_value

    @field_validator("end_date")
    @classmethod
    def validate_date_range(cls, end_date: date, info) -> date:
        start_date = info.data.get("start_date")
        if start_date and end_date < start_date:
            raise ValueError("End date must be on or after start date.")
        return end_date


class TravelPlanResponse(BaseModel):
    """Travel plan response payload."""

    id: UUID
    owner_user_id: UUID
    destination_city: str
    start_date: date
    end_date: date
    created_at: datetime
    updated_at: datetime
