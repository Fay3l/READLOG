""" Table User """
import datetime
from database.base import Base
from typing import List  # pyright: ignore[reportMissingImports]
from typing import Optional  # pyright: ignore[reportMissingImports]
from sqlalchemy import ForeignKey  # pyright: ignore[reportMissingImports]
from sqlalchemy import String, DateTime
# pyright: ignore[reportMissingImports]
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func  # pyright: ignore[reportMissingImports]
from uuid import UUID  # pyright: ignore[reportMissingImports]


class ReadingNotes(Base):
    __tablename__ = "reading_notes"

    id: Mapped[UUID]
    content: Mapped[str]
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True)
    )
    user_book_id: Mapped[UUID] = mapped_column(
        ForeignKey('user_books.id'), default=None)
