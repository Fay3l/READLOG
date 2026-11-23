"""Table d'association utilisateur ↔ livre : statut, progression, dates"""

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.utils import utcnow

if TYPE_CHECKING:  # imports lus seulement par les outils d'analyse : évite les imports circulaires
    from app.models.quotes import Quotes
    from app.models.reading_notes import ReadingNotes


class UserBooks(Base):
    __tablename__ = "user_books"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    started_at: Mapped[datetime | None] = mapped_column(nullable=True, default=None)
    # ✅ renseignée quand le livre passe en "finished" (avant : date de démarrage du serveur pour tous)
    finished_at: Mapped[datetime | None] = mapped_column(nullable=True, default=None)
    status: Mapped[str] = mapped_column(String, default="to_read")  # to_read, reading, read
    cover_url: Mapped[str] = mapped_column(String, default="")
    personal_note: Mapped[str] = mapped_column(String, default="")
    rating: Mapped[int] = mapped_column(default=0)
    current_page: Mapped[int] = mapped_column(default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default_factory=utcnow, onupdate=utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default_factory=utcnow)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), default=None)
    book_id: Mapped[UUID] = mapped_column(ForeignKey("books.id"), default=None)
    quotes: Mapped[list["Quotes"]] = relationship(default_factory=list)
    reading_notes: Mapped[list["ReadingNotes"]] = relationship(default_factory=list)
