from uuid import uuid4
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.schemas.book import GetUserBook
from app.schemas.quote import GetQuote
from app.schemas.reading_note import GetReadingNote
from app.schemas.reading_reminder import GetReadingReminder
from app.schemas.user import GetUser
from ..models.users import Users


async def create_user(db: Session, email: str, name: str, password: str) -> bool:
    user = Users()
    user.id = uuid4()
    user.email = email
    user.name = name
    user.password_hash = password
    db.add(user)
    db.commit()
    return True


async def verify_user(db: Session, name: str, email: str):
    result = db.execute(
        select(Users.password_hash).where((Users.email == email)
                                          | (Users.name == name))
    ).scalar_one_or_none()
    return result


async def get_user_by_name(name: str, db: Session):
    res = db.query(Users).filter(Users.name == name | Users.email == name).first()
    if res is None:
        return None

    return GetUser.model_validate(res)
