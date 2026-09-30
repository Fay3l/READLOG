""" Table User """
import datetime
from typing import Annotated
from ..database.base import Base # pyright: ignore[reportMissingImports]
from sqlalchemy import DateTime, String
# pyright: ignore[reportMissingImports]
# pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func  # pyright: ignore[reportMissingImports]
from uuid import UUID, uuid4  # pyright: ignore[reportMissingImports]
from datetime import datetime, timezone
from sqlalchemy import JSON


class Users(Base):
    """ User """
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, init=False)
    email: Mapped[str] = mapped_column(String, default="")
    password_hash: Mapped[str] = mapped_column(String, default="")
    name: Mapped[str] = mapped_column(String, default="")
    avatar_url: Mapped[str] = mapped_column(String, default="")
    reading_goal: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now(timezone.utc)
    )
    email_verified:       Mapped[bool] = mapped_column(default=False)
    verification_code:    Mapped[str | None] = mapped_column(default=None)
    verification_expires: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    onboarding_completed: Mapped[bool] = mapped_column(default=False)
    reading_goal:         Mapped[int] = mapped_column(default=4)
    preferred_genres:     Mapped[list[str]] = mapped_column(JSON,default_factory=list)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc)
    )
    userbooks: Mapped[list['UserBooks']] = relationship(
        default_factory=list
    )
    readingreminders: Mapped[list['ReadingReminders']] = relationship(
        default_factory=list
    )
