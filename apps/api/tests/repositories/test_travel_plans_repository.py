from unittest.mock import MagicMock

from app.repositories.travel_plans import TravelPlansRepository


def _make_query_mock(*, data):
    query = MagicMock()
    query.select.return_value = query
    query.eq.return_value = query
    query.order.return_value = query
    query.limit.return_value = query
    query.in_.return_value = query
    query.execute.return_value = MagicMock(data=data)
    return query


def test_list_travel_plans_for_user_includes_owned_and_shared_plans():
    owned_plans = [
        {
            "id": "owned",
            "owner_user_id": "user",
            "destination_city": "Rome",
            "start_date": "2026-06-10",
            "end_date": "2026-06-12",
        },
    ]
    share_rows = [
        {
            "travel_plan_id": "shared",
        }
    ]
    shared_plans = [
        {
            "id": "shared",
            "owner_user_id": "other",
            "destination_city": "Paris",
            "start_date": "2026-06-01",
            "end_date": "2026-06-05",
        },
    ]

    owned_query = _make_query_mock(data=owned_plans)
    shares_query = _make_query_mock(data=share_rows)
    shared_query = _make_query_mock(data=shared_plans)

    client = MagicMock()
    client.table.side_effect = [
        owned_query,  # travel_plan owned
        shares_query,  # travel_plan_share accepted
        shared_query,  # travel_plan by ids
    ]

    repository = TravelPlansRepository(client)

    result = repository.list_travel_plans_for_user(user_id="user")

    assert [plan["id"] for plan in result] == ["shared", "owned"]
    assert client.table.call_args_list[0].args[0] == "travel_plan"
    assert client.table.call_args_list[1].args[0] == "travel_plan_share"
    assert client.table.call_args_list[2].args[0] == "travel_plan"
