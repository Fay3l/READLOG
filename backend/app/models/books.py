""" Table User """
from datetime import datetime, timezone
from ..database.base import Base
from typing import List
from typing import Optional
from sqlalchemy import ForeignKey  # pyright: ignore[reportMissingImports]
# pyright: ignore[reportMissingImports]
from sqlalchemy import String, DateTime, Integer
# pyright: ignore[reportMissingImports]
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from uuid import UUID


class Books(Base):
    __tablename__ = "books"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    google_books_id: Mapped[str]
    isbn: Mapped[str | None ] = mapped_column(String,nullable=True, default=None)
    title: Mapped[str] = mapped_column(String, default="")
    author: Mapped[str] = mapped_column(String, default="")
    cover_url: Mapped[str | None ] = mapped_column(String,nullable=True, default=None)
    description: Mapped[str | None ] = mapped_column(String,nullable=True, default=None)
    publisher: Mapped[str | None ] = mapped_column(String,nullable=True, default=None)
    published_year: Mapped[str | None ] = mapped_column(String,nullable=True, default=None)
    genres: Mapped[str | None ] = mapped_column(String,nullable=True, default=None)
    page_count: Mapped[int | None ] = mapped_column(Integer,nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),default=datetime.now(timezone.utc)
    )
    userbooks: Mapped[list['UserBooks']] = relationship(
        default_factory=list
    )
