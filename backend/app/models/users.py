""" Table User """
import datetime
from ..database.base import Base
# pyright: ignore[reportMissingImports]
from sqlalchemy import DateTime, String
# pyright: ignore[reportMissingImports]
# pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func  # pyright: ignore[reportMissingImports]
from uuid import UUID, uuid4  # pyright: ignore[reportMissingImports]
from datetime import datetime, timezone


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
