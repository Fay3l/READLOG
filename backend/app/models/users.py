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


class Users(Base):
    """ User """
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    email: Mapped[str]
    password_hash: Mapped[str]
    name: Mapped[str]
    avatar_url: Mapped[str]
    reading_goal: Mapped[int]
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True)
    )
    userbooks: Mapped[list['UserBooks']] = relationship(
        default_factory=list
    )
    readingreminders: Mapped[list['ReadingReminders']] = relationship(
        default_factory=list
    )
