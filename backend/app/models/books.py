"""Table des livres (métadonnées Google Books, partagées entre utilisateurs)"""

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import (
    DateTime,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.utils import utcnow

if TYPE_CHECKING:  # imports lus seulement par les outils d'analyse : évite les imports circulaires
    from app.models.user_books import UserBooks


class Books(Base):
    __tablename__ = "books"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    google_books_id: Mapped[str]
    isbn: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    title: Mapped[str] = mapped_column(String, default="")
    author: Mapped[str] = mapped_column(String, default="")
    cover_url: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    description: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    publisher: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    published_year: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    genres: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    page_count: Mapped[int | None] = mapped_column(Integer, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default_factory=utcnow)
    userbooks: Mapped[list["UserBooks"]] = relationship(default_factory=list)
