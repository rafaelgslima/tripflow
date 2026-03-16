import os
from datetime import UTC, date, datetime
from uuid import UUID

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "anon-key")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "service-role-key")
os.environ.setdefault("SUPABASE_JWT_SECRET", "jwt-secret")

from app.dependencies import get_authenticated_user, get_travel_plans_service
from app.main import create_app
from app.schemas.common import AuthenticatedUser
from app.schemas.travel_plans import TravelPlanCreateRequest, TravelPlanResponse


class FakeTravelPlansService:
    def __init__(self) -> None:
        self.calls: list[tuple[UUID, TravelPlanCreateRequest]] = []
        self.list_calls: list[UUID] = []
        self.travel_plans = [
            TravelPlanResponse(
                id=UUID("22222222-2222-2222-2222-222222222222"),
                owner_user_id=UUID("00000000-0000-0000-0000-000000000001"),
                destination_city="Rome",
                start_date=date(2026, 6, 1),
                end_date=date(2026, 6, 5),
                created_at=datetime(2026, 3, 16, 0, 0, 0, tzinfo=UTC),
                updated_at=datetime(2026, 3, 16, 0, 0, 0, tzinfo=UTC),
            ),
        ]

    def create_travel_plan(
        self,
        *,
        owner_user_id: UUID,
        payload: TravelPlanCreateRequest,
    ) -> TravelPlanResponse:
        self.calls.append((owner_user_id, payload))
        return TravelPlanResponse(
            id=UUID("11111111-1111-1111-1111-111111111111"),
            owner_user_id=owner_user_id,
            destination_city=payload.destination_city,
            start_date=payload.start_date,
            end_date=payload.end_date,
            created_at=datetime(2026, 3, 16, 0, 0, 0, tzinfo=UTC),
            updated_at=datetime(2026, 3, 16, 0, 0, 0, tzinfo=UTC),
        )

    def list_travel_plans(
        self,
        *,
        owner_user_id: UUID,
    ) -> list[TravelPlanResponse]:
        self.list_calls.append(owner_user_id)
        return self.travel_plans


@pytest.fixture
def fake_service() -> FakeTravelPlansService:
    return FakeTravelPlansService()


@pytest.fixture
def test_client(fake_service: FakeTravelPlansService) -> TestClient:
    app = create_app()

    def override_user() -> AuthenticatedUser:
        return AuthenticatedUser(
            user_id=UUID("00000000-0000-0000-0000-000000000001"),
            email="user@example.com",
        )

    def override_service() -> FakeTravelPlansService:
        return fake_service

    app.dependency_overrides[get_authenticated_user] = override_user
    app.dependency_overrides[get_travel_plans_service] = override_service

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()


@pytest.fixture
def valid_payload() -> dict[str, str]:
    return {
        "destination_city": "Paris",
        "start_date": date(2026, 5, 1).isoformat(),
        "end_date": date(2026, 5, 5).isoformat(),
    }
