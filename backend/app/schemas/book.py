from uuid import UUID
from pydantic import BaseModel


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
