from datetime import date


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
