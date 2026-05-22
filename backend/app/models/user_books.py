""" Table User Books """
from datetime import datetime, timezone
from ..database.base import Base
from uuid import UUID
from typing import List
from typing import Optional
from sqlalchemy import ForeignKey  # pyright: ignore[reportMissingImports]
# pyright: ignore[reportMissingImports]
from sqlalchemy import String, DateTime
# pyright: ignore[reportMissingImports]
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func  # pyright: ignore[reportMissingImports]


class UserBooks(Base):
    __tablename__ = "user_books"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    started_at: Mapped[datetime] = mapped_column(default=datetime.now(timezone.utc))
    finished_at: Mapped[datetime] = mapped_column(default=datetime.now(timezone.utc),nullable=True)
    status: Mapped[str] = mapped_column(
        String, default="to_read")  # to_read, reading, read
    cover_url: Mapped[str] = mapped_column(String, default="")
    personal_note: Mapped[str] = mapped_column(String, default="")
    rating: Mapped[int] = mapped_column(default=0)
    current_page: Mapped[int] = mapped_column(default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc)
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.now(timezone.utc)
    )
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), default=None)
    book_id: Mapped[UUID] = mapped_column(ForeignKey("books.id"), default=None)
    quotes: Mapped[list['Quotes']] = relationship(default_factory=list)
    quotes: Mapped[list['ReadingNotes']] = relationship(default_factory=list)
