"""Table des citations"""

import datetime
from uuid import UUID

from sqlalchemy import (
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Quotes(Base):
    __tablename__ = "quotes"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    content: Mapped[str]
    page_number: Mapped[int]
    created_at: Mapped[datetime.datetime]
    user_book_id: Mapped[UUID] = mapped_column(ForeignKey("user_books.id"), default=None)
