""" Table User Books """
import datetime
from database.base import Base
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

    id: Mapped[UUID]
    started_at: Mapped[datetime.datetime]
    finished_at: Mapped[datetime.datetime]
    status: Mapped[str]
    cover_url: Mapped[str]
    personal_note: Mapped[str]
    rating: Mapped[int]
    current_page: Mapped[int]
    updated_at: Mapped[datetime.datetime]
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True)
    )
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"),default=None)
    book_id: Mapped[UUID] = mapped_column(ForeignKey("books.id"),default=None)
    quotes: Mapped[list['Quotes']] = relationship(default_factory=list)
    quotes: Mapped[list['ReadingNotes']] = relationship(default_factory=list)