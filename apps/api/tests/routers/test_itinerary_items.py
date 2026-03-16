from datetime import date


def test_create_itinerary_item_returns_201_and_payload(
    test_client,
    fake_itinerary_service,
):
    travel_plan_id = "22222222-2222-2222-2222-222222222222"
    day = date(2026, 6, 1).isoformat()

    response = test_client.post(
        f"/v1/travel-plans/{travel_plan_id}/days/{day}/items",
        json={"description": " Visit museum "},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["travel_plan_id"] == travel_plan_id
    assert body["date"] == day
    assert body["description"] == "Visit museum"

    assert len(fake_itinerary_service.create_calls) == 1


def test_create_itinerary_item_rejects_empty_description(test_client):
    travel_plan_id = "22222222-2222-2222-2222-222222222222"
    day = date(2026, 6, 1).isoformat()

    response = test_client.post(
        f"/v1/travel-plans/{travel_plan_id}/days/{day}/items",
        json={"description": "   "},
    )

    assert response.status_code == 422


def test_list_itinerary_items_returns_items_for_day(
    test_client,
    fake_itinerary_service,
):
    travel_plan_id = "22222222-2222-2222-2222-222222222222"
    day = date(2026, 6, 1).isoformat()

    response = test_client.get(
        f"/v1/travel-plans/{travel_plan_id}/days/{day}/items",
    )

    assert response.status_code == 200
    body = response.json()
    assert isinstance(body, list)
    assert len(body) == 1
    assert body[0]["description"] == "Breakfast"

    assert len(fake_itinerary_service.list_calls) == 1
