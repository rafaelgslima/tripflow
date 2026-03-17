import os
from datetime import UTC, date, datetime
from uuid import UUID

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "anon-key")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "service-role-key")
os.environ.setdefault("SUPABASE_JWT_SECRET", "jwt-secret")

from app.dependencies import (
    get_authenticated_user,
    get_itinerary_items_service,
    get_travel_plan_shares_service,
    get_travel_plans_service,
)
from app.main import create_app
from app.schemas.common import AuthenticatedUser
from app.schemas.itinerary_items import (
    ItineraryItemCreateRequest,
    ItineraryItemReorderRequest,
    ItineraryItemResponse,
    ItineraryItemUpdateRequest,
)
from app.schemas.travel_plans import TravelPlanCreateRequest, TravelPlanResponse


class FakeTravelPlanSharesService:
    def __init__(self) -> None:
        self.create_calls: list[tuple[UUID, UUID, str]] = []
        self.accept_calls: list[tuple[UUID, str]] = []

    def create_share_invite(
        self,
        *,
        user_id: UUID,
        travel_plan_id: UUID,
        invited_email: str,
        invited_by_email: str | None = None,
    ) -> dict[str, str]:
        self.create_calls.append((user_id, travel_plan_id, invited_email))
        return {
            "travel_plan_id": str(travel_plan_id),
            "invited_email": invited_email,
            "status": "pending",
        }

    def accept_share_invite(
        self,
        *,
        user_id: UUID,
        user_email: str | None = None,
        token: str,
    ) -> dict[str, str]:
        self.accept_calls.append((user_id, token))
        return {
            "travel_plan_id": "22222222-2222-2222-2222-222222222222",
            "status": "accepted",
        }


class FakeTravelPlansService:
    def __init__(self) -> None:
        self.calls: list[tuple[UUID, TravelPlanCreateRequest]] = []
        self.list_calls: list[UUID] = []
        self.delete_calls: list[tuple[UUID, UUID]] = []
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
        user_id: UUID,
    ) -> list[TravelPlanResponse]:
        self.list_calls.append(user_id)
        return self.travel_plans

    def delete_travel_plan(self, *, user_id: UUID, travel_plan_id: UUID) -> None:
        self.delete_calls.append((user_id, travel_plan_id))


class FakeItineraryItemsService:
    def __init__(self) -> None:
        self.create_calls: list[tuple[UUID, UUID, date, ItineraryItemCreateRequest]] = []
        self.list_calls: list[tuple[UUID, UUID, date]] = []
        self.update_calls: list[
            tuple[UUID, UUID, date, UUID, ItineraryItemUpdateRequest]
        ] = []
        self.delete_calls: list[tuple[UUID, UUID, date, UUID]] = []
        self.reorder_calls: list[tuple[UUID, UUID, date, ItineraryItemReorderRequest]] = []
        self.items: list[ItineraryItemResponse] = [
            ItineraryItemResponse(
                id=UUID("33333333-3333-3333-3333-333333333333"),
                travel_plan_id=UUID("22222222-2222-2222-2222-222222222222"),
                date=date(2026, 6, 1),
                time=None,
                description="Breakfast",
                created_by_user_id=UUID("00000000-0000-0000-0000-000000000001"),
                created_at=datetime(2026, 3, 16, 0, 0, 0, tzinfo=UTC),
                updated_at=datetime(2026, 3, 16, 0, 0, 0, tzinfo=UTC),
            )
        ]

    def create_itinerary_item(
        self,
        *,
        user_id: UUID,
        travel_plan_id: UUID,
        day: date,
        payload: ItineraryItemCreateRequest,
    ) -> ItineraryItemResponse:
        self.create_calls.append((user_id, travel_plan_id, day, payload))
        return ItineraryItemResponse(
            id=UUID("44444444-4444-4444-4444-444444444444"),
            travel_plan_id=travel_plan_id,
            date=day,
            time=None,
            description=payload.description.strip(),
            created_by_user_id=user_id,
            created_at=datetime(2026, 3, 16, 0, 0, 0, tzinfo=UTC),
            updated_at=datetime(2026, 3, 16, 0, 0, 0, tzinfo=UTC),
        )

    def list_itinerary_items(
        self,
        *,
        user_id: UUID,
        travel_plan_id: UUID,
        day: date,
    ) -> list[ItineraryItemResponse]:
        self.list_calls.append((user_id, travel_plan_id, day))
        return [
            item
            for item in self.items
            if item.travel_plan_id == travel_plan_id and item.date == day
        ]

    def update_itinerary_item(
        self,
        *,
        user_id: UUID,
        travel_plan_id: UUID,
        day: date,
        item_id: UUID,
        payload: ItineraryItemUpdateRequest,
    ) -> ItineraryItemResponse:
        self.update_calls.append((user_id, travel_plan_id, day, item_id, payload))
        return ItineraryItemResponse(
            id=item_id,
            travel_plan_id=travel_plan_id,
            date=day,
            time=None,
            description=payload.description.strip(),
            created_by_user_id=user_id,
            created_at=datetime(2026, 3, 16, 0, 0, 0, tzinfo=UTC),
            updated_at=datetime(2026, 3, 16, 0, 0, 0, tzinfo=UTC),
        )

    def delete_itinerary_item(
        self,
        *,
        user_id: UUID,
        travel_plan_id: UUID,
        day: date,
        item_id: UUID,
    ) -> None:
        self.delete_calls.append((user_id, travel_plan_id, day, item_id))

    def reorder_itinerary_items(
        self,
        *,
        user_id: UUID,
        travel_plan_id: UUID,
        day: date,
        payload: ItineraryItemReorderRequest,
    ) -> None:
        self.reorder_calls.append((user_id, travel_plan_id, day, payload))


@pytest.fixture
def fake_service() -> FakeTravelPlansService:
    return FakeTravelPlansService()


@pytest.fixture
def fake_itinerary_service() -> FakeItineraryItemsService:
    return FakeItineraryItemsService()


@pytest.fixture
def fake_travel_plan_shares_service() -> FakeTravelPlanSharesService:
    return FakeTravelPlanSharesService()


@pytest.fixture
def test_client(
    fake_service: FakeTravelPlansService,
    fake_itinerary_service: FakeItineraryItemsService,
    fake_travel_plan_shares_service: FakeTravelPlanSharesService,
) -> TestClient:
    app = create_app()

    def override_user() -> AuthenticatedUser:
        return AuthenticatedUser(
            user_id=UUID("00000000-0000-0000-0000-000000000001"),
            email="user@example.com",
        )

    def override_service() -> FakeTravelPlansService:
        return fake_service

    def override_itinerary_service() -> FakeItineraryItemsService:
        return fake_itinerary_service

    def override_travel_plan_shares_service() -> FakeTravelPlanSharesService:
        return fake_travel_plan_shares_service

    app.dependency_overrides[get_authenticated_user] = override_user
    app.dependency_overrides[get_travel_plans_service] = override_service
    app.dependency_overrides[get_itinerary_items_service] = override_itinerary_service
    app.dependency_overrides[get_travel_plan_shares_service] = (
        override_travel_plan_shares_service
    )

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
