"""Table des rappels de lecture"""

from datetime import datetime, time
from uuid import UUID

from sqlalchemy import (
    JSON,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.utils import utcnow


class ReadingReminders(Base):
    __tablename__ = "reading_reminders"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    remind_at: Mapped[time]
    days: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default_factory=list,
    )
    is_active: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default_factory=utcnow)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), default=None)
