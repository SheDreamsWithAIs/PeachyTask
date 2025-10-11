import pytest
from datetime import date

from app.schemas.task import TaskCreate, TaskUpdate, TaskPriority


def test_task_create_validates_required_fields_and_enums():
    payload = {
        "title": "Write tests",
        "description": "Add unit tests",
        "priority": "high",
        "deadline": date.today().isoformat(),
        "completed": False,
        "label_ids": [],
        "user_id": "64b64b64b64b64b64b64b64b",
    }
    task = TaskCreate.model_validate(payload)
    assert task.priority == TaskPriority.high


def test_task_create_rejects_blank_title():
    payload = {
        "title": "   ",
        "priority": "low",
        "deadline": date.today().isoformat(),
        "user_id": "64b64b64b64b64b64b64b64b",
    }
    with pytest.raises(Exception):
        TaskCreate.model_validate(payload)


def test_task_update_validates_optional_fields():
    upd = TaskUpdate.model_validate({
        "title": "  Normalize  ",
        "priority": "medium",
    })
    assert upd.title == "Normalize"
    assert upd.priority == TaskPriority.medium


