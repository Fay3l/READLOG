from typing import Literal
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from app.schemas.book import GetUserBook
from app.schemas.reading_reminder import GetReadingReminder
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class GetUser(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    email: str
    avatar_url: str
    reading_goal: int
    preferred_genres: list[str]
    email_verified: bool
    onboarding_completed: bool
    userbooks: list[GetUserBook]
    readingreminders: list[GetReadingReminder]


class OnboardingSchema(BaseModel):
    reading_goal:     int
    preferred_genres: list[str]
    reminder_time:    str | None = None   # ex: "21:00"
    reminder_days:    list[str] | None = None  # ex: ["mon","wed","fri"]


class UserStats(BaseModel):
    year: int
    total_books: int
    reading_books: int
    finished_books: int
    to_read_books: int
    pages_read: int
    reading_goal: int
    finished_this_year: int
    books_per_month: list[int]  # 12 valeurs : janvier → décembre


class UpdateUserBook(BaseModel):
    status: Literal["to_read", "reading", "finished"] | None = None
    current_page: int | None = Field(default=None, ge=0)