"""Table des utilisateurs"""

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import JSON, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.utils import utcnow

if TYPE_CHECKING:  # imports lus seulement par les outils d'analyse : évite les imports circulaires
    from app.models.reading_reminders import ReadingReminders
    from app.models.user_books import UserBooks


class Users(Base):
    """Compte utilisateur."""

    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, init=False)
    email: Mapped[str] = mapped_column(String, default="")
    password_hash: Mapped[str] = mapped_column(String, default="")
    name: Mapped[str] = mapped_column(String, default="")
    avatar_url: Mapped[str] = mapped_column(String, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default_factory=utcnow)
    email_verified: Mapped[bool] = mapped_column(default=False)
    verification_code: Mapped[str | None] = mapped_column(default=None)
    verification_expires: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    onboarding_completed: Mapped[bool] = mapped_column(default=False)
    reading_goal: Mapped[int] = mapped_column(default=4)
    preferred_genres: Mapped[list[str]] = mapped_column(JSON, default_factory=list)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default_factory=utcnow, onupdate=utcnow)
    userbooks: Mapped[list["UserBooks"]] = relationship(default_factory=list)
    readingreminders: Mapped[list["ReadingReminders"]] = relationship(default_factory=list)
