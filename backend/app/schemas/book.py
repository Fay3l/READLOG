import re
from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator

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


Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
OptionalText = Annotated[str, StringConstraints(strip_whitespace=True, max_length=200)] | None


class BookCreate(BaseModel):
    """Livre saisi à la main quand Google Books ne le connaît pas."""

    title: Text
    author: Text
    isbn: str | None = None
    page_count: int | None = Field(default=None, ge=1, le=20000)
    published_year: Annotated[str, StringConstraints(pattern=r"^\d{4}$")] | None = None
    publisher: OptionalText = None
    genre: OptionalText = None
    description: Annotated[str, StringConstraints(strip_whitespace=True, max_length=5000)] | None = None
    status: Literal["to_read", "reading", "finished"] = "to_read"

    @field_validator("isbn")
    @classmethod
    def normalize_isbn(cls, value: str | None) -> str | None:
        # On garde seulement les chiffres (et le X final des ISBN-10) : "978-2-07-036822-8" → "9782070368228"
        if value is None or not value.strip():
            return None
        isbn = re.sub(r"[^0-9Xx]", "", value).upper()
        if len(isbn) not in (10, 13):
            raise ValueError("L'ISBN doit contenir 10 ou 13 chiffres")
        return isbn

    @field_validator("publisher", "genre", "description")
    @classmethod
    def empty_to_none(cls, value: str | None) -> str | None:
        return value or None


class GetUserBook(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    started_at: datetime | None
    finished_at: datetime | None
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
    isbn: str | None
    title: str
    author: str
    cover_url: str | None
    status: str | None
    current_page: int | None
    description: str | None
    publisher: str | None
    published_year: str | None
    genres: str | None
    page_count: int | None
    created_at: datetime
