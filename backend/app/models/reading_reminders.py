""" Table User """
from datetime import datetime, timezone, time
from ..database.base import Base
from typing import List  # pyright: ignore[reportMissingImports]
from typing import Optional  # pyright: ignore[reportMissingImports]
from sqlalchemy import ForeignKey  # pyright: ignore[reportMissingImports]
# pyright: ignore[reportMissingImports]
from sqlalchemy import String, DateTime, Time
# pyright: ignore[reportMissingImports]
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func  # pyright: ignore[reportMissingImports]
from uuid import UUID  # pyright: ignore[reportMissingImports]
from sqlalchemy import JSON

class ReadingReminders(Base):
    __tablename__ = "reading_reminders"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    remind_at: Mapped[time]
    days: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )
    is_active: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now(timezone.utc))
    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'), default=None)
