import datetime
from pydantic import BaseModel, ConfigDict
from uuid import UUID

class GetReadingNote(BaseModel):
    model_config =  ConfigDict(from_attributes=True)
    id: UUID
    content: str
    created_at: datetime.datetime 
    updated_at: datetime.datetime 
    user_book_id: UUID
