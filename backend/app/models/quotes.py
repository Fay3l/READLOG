""" Table User """
import datetime
from database.base import Base
from typing import List # pyright: ignore[reportMissingImports]
from typing import Optional # pyright: ignore[reportMissingImports]
from sqlalchemy import ForeignKey # pyright: ignore[reportMissingImports]
from sqlalchemy import String, DateTime # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship # pyright: ignore[reportMissingImports]
from sqlalchemy.sql import func # pyright: ignore[reportMissingImports]
from uuid import UUID # pyright: ignore[reportMissingImports] 

class Quotes(Base):
    __tablename__="quotes"

    id:Mapped[UUID] = mapped_column(primary_key=True)
    content: Mapped[str]
    page_number: Mapped[int]
    created_at: Mapped[datetime.datetime]
    user_book_id: Mapped[UUID] = mapped_column(ForeignKey('user_books.id'),default=None)