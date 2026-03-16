from datetime import UTC, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ErrorEnvelope(BaseModel):
    """Consistent machine-readable API error response."""

    code: str = Field(description="Stable machine-readable error code")
    message: str = Field(description="Human-readable error message")


class AuthenticatedUser(BaseModel):
    """Authenticated user extracted from Supabase JWT."""

    user_id: UUID
    email: str | None = None


class CreatedAuditFields(BaseModel):
    """Standard created timestamp fields for API responses."""

    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class UpdatedAuditFields(BaseModel):
    """Standard updated timestamp fields for API responses."""

    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
