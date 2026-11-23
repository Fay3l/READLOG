import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class GetQuote(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    content: str
    page_number: int
    created_at: datetime.datetime
    user_book_id: UUID
