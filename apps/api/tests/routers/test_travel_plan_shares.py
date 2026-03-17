def test_create_travel_plan_share_returns_201_and_payload(
    test_client,
    fake_travel_plan_shares_service,
):
    travel_plan_id = "22222222-2222-2222-2222-222222222222"

    response = test_client.post(
        f"/v1/travel-plans/{travel_plan_id}/shares",
        json={"invited_email": "friend@example.com"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["travel_plan_id"] == travel_plan_id
    assert body["invited_email"] == "friend@example.com"
    assert body["status"] == "pending"

    assert len(fake_travel_plan_shares_service.create_calls) == 1


def test_create_travel_plan_share_rejects_invalid_email(test_client):
    travel_plan_id = "22222222-2222-2222-2222-222222222222"

    response = test_client.post(
        f"/v1/travel-plans/{travel_plan_id}/shares",
        json={"invited_email": "not-an-email"},
    )

    assert response.status_code == 422


def test_accept_travel_plan_share_returns_200_and_payload(
    test_client,
    fake_travel_plan_shares_service,
):
    response = test_client.post(
        "/v1/travel-plan-shares/accept",
        json={"token": "a" * 32},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["travel_plan_id"] == "22222222-2222-2222-2222-222222222222"
    assert body["status"] == "accepted"

    assert len(fake_travel_plan_shares_service.accept_calls) == 1
