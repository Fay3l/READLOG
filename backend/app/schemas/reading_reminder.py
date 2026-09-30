from datetime import datetime, time
from pydantic import BaseModel, ConfigDict
from uuid import UUID


class GetReadingReminder(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    remind_at: time
    days: list[str]
    is_active: bool
    created_at: datetime
    user_id: UUID
