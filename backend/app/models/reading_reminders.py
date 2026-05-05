""" Table User """
import datetime
from database.base import Base
from typing import List  # pyright: ignore[reportMissingImports]
from typing import Optional  # pyright: ignore[reportMissingImports]
from sqlalchemy import ForeignKey  # pyright: ignore[reportMissingImports]
# pyright: ignore[reportMissingImports]
from sqlalchemy import String, DateTime
# pyright: ignore[reportMissingImports]
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func  # pyright: ignore[reportMissingImports]
from uuid import UUID  # pyright: ignore[reportMissingImports]


class ReadingReminders(Base):
    __tablename__ = "reading_reminders"

    id: Mapped[UUID]
    remind_at: Mapped[datetime.datetime]
    days: Mapped[str]
    is_active: Mapped[bool]
    created_at: Mapped[datetime.datetime]
    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'),default=None)
