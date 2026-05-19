from uuid import UUID
from pydantic import BaseModel


class BookResult(BaseModel):
    id: UUID
    google_books_id: str
    isbn: str
    title: str
    author: str
    cover_url: str
    description: str
    publisher: str
    published_year: int
    genres: str
    page_count: int
