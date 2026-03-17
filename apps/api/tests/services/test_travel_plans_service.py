from unittest.mock import MagicMock
from uuid import UUID

import pytest

from app.exceptions import NotFoundError
from app.services.travel_plans import TravelPlansService

USER_ID = UUID("00000000-0000-0000-0000-000000000001")
PLAN_ID = UUID("22222222-2222-2222-2222-222222222222")


def _make_service(*, is_owner: bool, is_collaborator: bool) -> tuple[TravelPlansService, MagicMock]:
    repository = MagicMock()
    repository.user_is_owner.return_value = is_owner
    repository.user_can_access_travel_plan.return_value = is_collaborator
    service = TravelPlansService(repository=repository)
    return service, repository


def test_delete_travel_plan_owner_hard_deletes():
    service, repository = _make_service(is_owner=True, is_collaborator=False)

    service.delete_travel_plan(user_id=USER_ID, travel_plan_id=PLAN_ID)

    repository.delete_travel_plan.assert_called_once_with(travel_plan_id=str(PLAN_ID))
    repository.remove_share_for_user.assert_not_called()


def test_delete_travel_plan_collaborator_removes_share():
    service, repository = _make_service(is_owner=False, is_collaborator=True)

    service.delete_travel_plan(user_id=USER_ID, travel_plan_id=PLAN_ID)

    repository.remove_share_for_user.assert_called_once_with(
        user_id=str(USER_ID),
        travel_plan_id=str(PLAN_ID),
    )
    repository.delete_travel_plan.assert_not_called()


def test_delete_travel_plan_no_access_raises_not_found():
    service, repository = _make_service(is_owner=False, is_collaborator=False)

    with pytest.raises(NotFoundError):
        service.delete_travel_plan(user_id=USER_ID, travel_plan_id=PLAN_ID)

    repository.delete_travel_plan.assert_not_called()
    repository.remove_share_for_user.assert_not_called()
