from uuid import uuid4
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.schemas.token import GetVerifyUser
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


async def verify_user(db: Session, name: str, email: str) -> GetVerifyUser | None:
    print("name email: ", name, email)
    result = db.query(Users).filter(
        (Users.name == name) | (Users.email == email)).first()
    if result is None:
        return None
    return GetVerifyUser(name=result.name,password_hashed=result.password_hash)


async def get_user_by_name(name: str, db: Session) -> GetUser | None:
    res = db.query(Users).filter(
        Users.name == name | Users.email == name).first()
    if res is None:
        return None

    return GetUser.model_validate(res)
