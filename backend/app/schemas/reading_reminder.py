from datetime import datetime, time
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class GetReadingReminder(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    remind_at: time
    days: list[str]
    is_active: bool
    created_at: datetime
    user_id: UUID
