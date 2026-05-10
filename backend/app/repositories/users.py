from uuid import uuid4 
from sqlalchemy.orm import Session 
from sqlalchemy import select 
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


async def verify_user(db: Session, name: str, email: str) :
    result = db.execute(
        select(Users.password_hash).where((Users.email == email)
                                          | (Users.name == name))
    ).scalar_one_or_none()
    return result
    
