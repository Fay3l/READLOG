import datetime
from pydantic import BaseModel, ConfigDict
from uuid import UUID


class GetReadingReminder(BaseModel):
    model_config =  ConfigDict(from_attributes=True)
    id: UUID
    remind_at: datetime.datetime
    days: str
    is_active: bool
    created_at: datetime.datetime
    user_id: UUID
