from __future__ import annotations

from datetime import date, datetime, time, timezone
from enum import Enum
import re
from typing import List, Optional

from pydantic import BaseModel, Field, ValidationError, field_validator


class TaskPriority(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


OBJECT_ID_REGEX = re.compile(r"^[0-9a-fA-F]{24}$")


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority
    deadline: datetime
    completed: bool = False
    label_ids: List[str] = Field(default_factory=list)

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("title must be a non-empty string")
        return v.strip()

    @field_validator("label_ids")
    @classmethod
    def validate_label_ids(cls, v: List[str]) -> List[str]:
        for lid in v:
            if not isinstance(lid, str) or not OBJECT_ID_REGEX.fullmatch(lid):
                raise ValueError("label_ids must be 24-char hex ObjectId strings")
        return v

    @field_validator("deadline", mode="before")
    @classmethod
    def coerce_deadline(cls, v):
        if v is None:
            return v
        if isinstance(v, datetime):
            dt = v
        elif isinstance(v, date):
            dt = datetime.combine(v, time.min)
        elif isinstance(v, str):
            try:
                # Try full datetime first
                dt = datetime.fromisoformat(v)
            except ValueError:
                # Fallback: date string YYYY-MM-DD
                d = date.fromisoformat(v)
                dt = datetime.combine(d, time.min)
        else:
            raise ValueError("deadline must be a date or datetime")
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt


class TaskCreate(TaskBase):
    user_id: str

    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, v: str) -> str:
        if not OBJECT_ID_REGEX.fullmatch(v):
            raise ValueError("user_id must be a 24-char hex ObjectId string")
        return v


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    deadline: Optional[datetime] = None
    completed: Optional[bool] = None
    label_ids: Optional[List[str]] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not v.strip():
            raise ValueError("title must be a non-empty string")
        return v.strip()

    @field_validator("label_ids")
    @classmethod
    def validate_label_ids(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return v
        for lid in v:
            if not isinstance(lid, str) or not OBJECT_ID_REGEX.fullmatch(lid):
                raise ValueError("label_ids must be 24-char hex ObjectId strings")
        return v

    @field_validator("deadline", mode="before")
    @classmethod
    def coerce_deadline_optional(cls, v):
        if v is None:
            return v
        # Reuse TaskBase logic
        if isinstance(v, datetime):
            dt = v
        elif isinstance(v, date):
            dt = datetime.combine(v, time.min)
        elif isinstance(v, str):
            try:
                dt = datetime.fromisoformat(v)
            except ValueError:
                d = date.fromisoformat(v)
                dt = datetime.combine(d, time.min)
        else:
            raise ValueError("deadline must be a date or datetime")
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt


class TaskPublic(TaskBase):
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True


