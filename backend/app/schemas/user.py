from pydantic import BaseModel, ConfigDict
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
    reminder_time:    str | None = None
    onboarding_completed: bool
    userbooks: list[GetUserBook]
    readingreminders: list[GetReadingReminder]


class OnboardingSchema(BaseModel):
    reading_goal:     int
    preferred_genres: list[str]
    reminder_time:    str | None = None   # ex: "21:00"
    reminder_days:    list[str] | None = None  # ex: ["mon","wed","fri"]
