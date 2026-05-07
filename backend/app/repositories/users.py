from uuid import uuid4 # type: ignore
from sqlalchemy.orm import Session # type: ignore
from ..models.users import Users

async def create_user(db: Session, email: str, name: str, password: str) -> bool:
    user = Users()
    user.id= uuid4()
    user.email = email
    user.name = name
    user.password_hash = password
    db.add(user)
    db.commit()
    return True
