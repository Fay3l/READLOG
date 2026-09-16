from pydantic import BaseModel, ConfigDict

from app.schemas.book import GetUserBook
from app.schemas.reading_reminder import GetReadingReminder


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class GetUser(BaseModel):
    model_config =  ConfigDict(from_attributes=True)
    name: str
    email: str
    avatar_url: str
    reading_goal: int
    userbooks: list[GetUserBook]
    readingreminders: list[GetReadingReminder]
