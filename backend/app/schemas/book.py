from uuid import UUID
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from app.schemas.quote import GetQuote
from app.schemas.reading_note import GetReadingNote


class BookResult(BaseModel):
    google_books_id: str
    title: str
    author: str
    cover_url: str | None = None
    description: str | None = None
    page_count: int | None = None
    isbn: str | None = None
    published_year: str | None = None
    publisher: str | None = None
    genre: str | None = None


class GetUserBook(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    started_at: datetime
    finished_at: datetime
    status: str
    cover_url: str
    personal_note: str
    rating: int
    current_page: int
    user_id: UUID
    book_id: UUID
    quotes: list[GetQuote]
    reading_notes: list[GetReadingNote]


class GetBook(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    google_books_id: str
    isbn: str
    title: str
    author: str
    cover_url: str
    status: str | None
    current_page: int | None
    description: str
    publisher: str
    published_year: int
    genres: str
    page_count: int
    created_at: datetime
