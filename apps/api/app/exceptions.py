from http import HTTPStatus


class TripFlowError(Exception):
    """Base error class for all domain errors."""

    status_code: int = HTTPStatus.INTERNAL_SERVER_ERROR
    error_code: str = "internal_error"
    message: str = "An unexpected error occurred."

    def __init__(self, message: str | None = None) -> None:
        self.message = message or self.__class__.message
        super().__init__(self.message)


class UnauthorizedError(TripFlowError):
    """Raised when a request is not authenticated."""

    status_code = HTTPStatus.UNAUTHORIZED
    error_code = "unauthorized"
    message = "Authentication required."


class ForbiddenError(TripFlowError):
    """Raised when the authenticated user lacks permission."""

    status_code = HTTPStatus.FORBIDDEN
    error_code = "forbidden"
    message = "You do not have permission to perform this action."


class NotFoundError(TripFlowError):
    """Raised when a requested resource does not exist."""

    status_code = HTTPStatus.NOT_FOUND
    error_code = "not_found"
    message = "The requested resource was not found."


class ConflictError(TripFlowError):
    """Raised on uniqueness constraint violations."""

    status_code = HTTPStatus.CONFLICT
    error_code = "conflict"
    message = "A resource with this identifier already exists."


class ValidationError(TripFlowError):
    """Raised when domain-level validation fails (beyond Pydantic)."""

    status_code = HTTPStatus.UNPROCESSABLE_ENTITY
    error_code = "validation_error"
    message = "The request data failed domain validation."


class SchemaOutOfDateError(TripFlowError):
    """Raised when the database schema is missing required migrations."""

    status_code = HTTPStatus.INTERNAL_SERVER_ERROR
    error_code = "schema_out_of_date"
    message = "Database schema is out of date."
