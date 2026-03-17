from datetime import date
from uuid import UUID

from app.exceptions import NotFoundError


def test_create_travel_plan_returns_201_and_payload(
    test_client,
    fake_service,
    valid_payload,
):
    response = test_client.post("/v1/travel-plans", json=valid_payload)

    assert response.status_code == 201
    body = response.json()
    assert body["destination_city"] == "Paris"
    assert body["owner_user_id"] == "00000000-0000-0000-0000-000000000001"
    assert body["start_date"] == valid_payload["start_date"]
    assert body["end_date"] == valid_payload["end_date"]

    assert len(fake_service.calls) == 1
    owner_user_id, payload = fake_service.calls[0]
    assert str(owner_user_id) == "00000000-0000-0000-0000-000000000001"
    assert payload.destination_city == "Paris"
    assert payload.start_date == date(2026, 5, 1)


def test_create_travel_plan_rejects_invalid_date_range(test_client, valid_payload):
    invalid_payload = {
        **valid_payload,
        "start_date": "2026-05-10",
        "end_date": "2026-05-01",
    }

    response = test_client.post("/v1/travel-plans", json=invalid_payload)

    assert response.status_code == 422


def test_create_travel_plan_rejects_empty_destination(test_client, valid_payload):
    invalid_payload = {**valid_payload, "destination_city": "   "}

    response = test_client.post("/v1/travel-plans", json=invalid_payload)

    assert response.status_code == 422


def test_list_travel_plans_returns_owner_plans(test_client, fake_service):
    response = test_client.get("/v1/travel-plans")

    assert response.status_code == 200
    body = response.json()
    assert isinstance(body, list) and len(body) == 1
    assert body[0]["destination_city"] == "Rome"
    assert len(fake_service.list_calls) == 1


def test_delete_travel_plan_returns_204(test_client, fake_service):
    travel_plan_id = "22222222-2222-2222-2222-222222222222"

    response = test_client.delete(f"/v1/travel-plans/{travel_plan_id}")

    assert response.status_code == 204
    assert response.content == b""
    assert len(fake_service.delete_calls) == 1
    user_id, plan_id = fake_service.delete_calls[0]
    assert str(user_id) == "00000000-0000-0000-0000-000000000001"
    assert str(plan_id) == travel_plan_id


def test_delete_travel_plan_returns_404_when_not_found(test_client, fake_service):
    fake_service.delete_travel_plan = lambda *, user_id, travel_plan_id: (_ for _ in ()).throw(
        NotFoundError("Travel plan not found.")
    )

    response = test_client.delete(
        "/v1/travel-plans/99999999-9999-9999-9999-999999999999"
    )

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"
