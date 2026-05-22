""" Table User """
from datetime import datetime, timezone
from ..database.base import Base
from typing import List
from typing import Optional
from sqlalchemy import ForeignKey  # pyright: ignore[reportMissingImports]
# pyright: ignore[reportMissingImports]
from sqlalchemy import String, DateTime
# pyright: ignore[reportMissingImports]
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from uuid import UUID


class Books(Base):
    __tablename__ = "books"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    google_books_id: Mapped[str]
    isbn: Mapped[str]
    title: Mapped[str]
    author: Mapped[str]
    cover_url: Mapped[str]
    description: Mapped[str]
    publisher: Mapped[str]
    published_year: Mapped[int]
    genres: Mapped[str] = mapped_column(String, default="")
    page_count: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),default=datetime.now(timezone.utc)
    )
    userbooks: Mapped[list['UserBooks']] = relationship(
        default_factory=list
    )
