# pyright: ignore[reportMissingImports]
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from datetime import datetime
from app.models.reading_reminders import ReadingReminders
from ..database.session import get_db
from app.routers.auth import get_current_user, require_verified_email
from app.schemas.user import GetUser, OnboardingSchema
from sqlalchemy.orm import Session
from uuid import uuid4
router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/", )
async def read():
    return [{"username": "Rick"}, {"username": "Morty"}]


@router.get("/me")
async def read_user_me(current_user: Annotated[GetUser, Depends(get_current_user)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not current_user:
        raise credentials_exception
    return current_user


@router.get("/{username}")
async def read_user(username: str):
    return {"username": username}


@router.patch("/onboarding")
async def complete_onboarding(
    data: OnboardingSchema,
    current_user: Annotated[GetUser, Depends(require_verified_email)],
    db: Session = Depends(get_db)
):
    current_user.reading_goal = data.reading_goal
    current_user.preferred_genres = data.preferred_genres
    current_user.onboarding_completed = True

    if data.reminder_time:
        remind_at = datetime.strptime(
            data.reminder_time,
            "%H:%M"
        ).time()

        reminder = ReadingReminders(
            id=uuid4(),
            user_id=current_user.id,
            remind_at=remind_at,
            days=data.reminder_days or [],
            is_active=True,
        )

        db.add(reminder)

    db.commit()
    return {"message": "Onboarding terminé ✅"}
