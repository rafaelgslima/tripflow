from datetime import date
from unittest.mock import MagicMock

import pytest
from postgrest.exceptions import APIError

from app.exceptions import SchemaOutOfDateError
from app.repositories.itinerary_items import ItineraryItemsRepository


def _make_supabase_client_that_raises(payload: dict) -> MagicMock:
    query = MagicMock()
    query.select.return_value = query
    query.eq.return_value = query
    query.order.return_value = query
    query.limit.return_value = query
    query.insert.return_value = query
    query.upsert.return_value = query

    query.execute.side_effect = APIError(payload)

    client = MagicMock()
    client.table.return_value = query
    return client


def test_list_itinerary_items_raises_schema_out_of_date_when_sort_order_missing():
    client = _make_supabase_client_that_raises(
        {
            "message": "column itinerary_item.sort_order does not exist",
            "code": "42703",
            "hint": None,
            "details": None,
        }
    )
    repository = ItineraryItemsRepository(client)

    with pytest.raises(SchemaOutOfDateError):
        repository.list_itinerary_items(
            travel_plan_id="22222222-2222-2222-2222-222222222222",
            day=date(2026, 6, 1),
        )


def test_create_itinerary_item_raises_schema_out_of_date_when_sort_order_missing():
    client = _make_supabase_client_that_raises(
        {
            "message": "column itinerary_item.sort_order does not exist",
            "code": "42703",
            "hint": None,
            "details": None,
        }
    )
    repository = ItineraryItemsRepository(client)

    with pytest.raises(SchemaOutOfDateError):
        repository.create_itinerary_item(
            travel_plan_id="22222222-2222-2222-2222-222222222222",
            day=date(2026, 6, 1),
            description="Breakfast",
            created_by_user_id="11111111-1111-1111-1111-111111111111",
        )


def test_update_itinerary_item_sort_orders_uses_two_phase_upsert_to_avoid_collisions():
    query = MagicMock()
    query.update.return_value = query
    query.eq.return_value = query
    query.execute.return_value = MagicMock(data=[])

    client = MagicMock()
    client.table.return_value = query

    repository = ItineraryItemsRepository(client)

    repository.update_itinerary_item_sort_orders(
        item_id_to_sort_order={
            "a": 0,
            "b": 1,
        }
    )

    # Two phases (temp negative, then final) x 2 items.
    assert query.update.call_count == 4
    assert query.eq.call_count == 4

    # First two updates are temporary negative sort orders.
    first_update_payload = query.update.call_args_list[0].args[0]
    second_update_payload = query.update.call_args_list[1].args[0]
    assert {first_update_payload["sort_order"], second_update_payload["sort_order"]} == {
        -1,
        -2,
    }

    # Last two updates are final sort orders.
    third_update_payload = query.update.call_args_list[2].args[0]
    fourth_update_payload = query.update.call_args_list[3].args[0]
    assert {third_update_payload["sort_order"], fourth_update_payload["sort_order"]} == {
        0,
        1,
    }
