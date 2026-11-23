from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints

from app.schemas.book import GetUserBook
from app.schemas.reading_reminder import GetReadingReminder


class UserCreate(BaseModel):
    # La validation se fait ici, avant même d'entrer dans la route : FastAPI répond 422 sinon
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=30)]
    email: EmailStr
    password: Annotated[str, StringConstraints(min_length=8, max_length=128)]


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
    reading_goal: int = Field(ge=1, le=365)
    preferred_genres: list[Annotated[str, StringConstraints(max_length=50)]] = Field(max_length=20)
    # "HH:MM" vérifié ici : avant, une valeur mal formée faisait planter strptime (erreur 500)
    reminder_time: Annotated[str, StringConstraints(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")] | None = None
    reminder_days: list[Literal["mon", "tue", "wed", "thu", "fri", "sat", "sun"]] | None = None


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
