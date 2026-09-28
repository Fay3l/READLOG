from uuid import uuid4
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from app.schemas.token import GetVerifyUser
from app.schemas.user import GetUser
from app.services.email import generate_code
from ..models.users import Users
from ..schemas.user import UserCreate


async def create_user(db: Session, uc: UserCreate, code: str, expired: datetime) -> bool:
    user = Users()
    user.id = uuid4()
    user.email = uc.email
    user.name = uc.name
    user.password_hash = uc.password
    user.verification_code = code
    user.verification_expires = expired
    db.add(user)
    db.commit()
    return True


async def verify_user(db: Session, name: str, email: str) -> GetVerifyUser | None:
    print("name email: ", name, email)
    result = db.query(Users).filter(
        (Users.name == name) | (Users.email == email)).first()
    print("---",result)
    if result is None:
        return None
    return GetVerifyUser(name=result.name, password_hashed=result.password_hash)


async def get_user_by_name(name: str, db: Session) -> GetUser | None:
    res = db.query(Users).filter(
        (Users.name == name) | (Users.email == name)).first()
    if res is None:
        return None

    return GetUser.model_validate(res)


async def user_resend_code(db: Session, email:str):
    user = db.query(Users).filter(Users.email == email).first()
    if not user or user.email_verified:
       return {}
    code = generate_code()
    user.verification_code = code
    user.verification_expires = datetime.now(
        timezone.utc) + timedelta(minutes=15)
    db.commit()
    return {"code":code,"email":email}

async def verify_user_email(email: str, code: str, db: Session):
    user = db.query(Users).filter(Users.email == email).first()
    if not user:
        return {"code":404,"detail":"Utilisateur introuvable"}
    if user.verification_code != code:
        return {"code":400,"detail":"Code incorrect"}
    if datetime.now(timezone.utc) > user.verification_expires:
        return {"code":400,"detail":"Code expiré"}
    user.email_verified    = True
    user.verification_code = None
    db.commit()
    return {"code":200,"detail":"Email vérifié ✅"}
    
