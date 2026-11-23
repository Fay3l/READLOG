"""Table des notes de lecture"""

from datetime import datetime
from uuid import UUID

from sqlalchemy import (
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.utils import utcnow


class ReadingNotes(Base):
    __tablename__ = "reading_notes"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    content: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default_factory=utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default_factory=utcnow,
    )
    user_book_id: Mapped[UUID] = mapped_column(ForeignKey("user_books.id"), default=None)
