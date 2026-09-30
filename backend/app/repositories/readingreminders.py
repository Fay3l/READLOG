from datetime import datetime
from uuid import uuid4
from sqlalchemy.orm import Session
from app.models.reading_reminders import ReadingReminders
from app.models.users import Users
from app.schemas.user import GetUser, OnboardingSchema


async def create_reading_reminders(data: OnboardingSchema, user: GetUser, db: Session):
    # ✅ "user" doit être l'objet SQLAlchemy réel (récupéré via current_user dans la route),
    #    pas le schéma Pydantic GetUser
    u = db.query(Users).filter(Users.id == user.id).first()
    if u:
        u.reading_goal = data.reading_goal
        u.preferred_genres = data.preferred_genres
        u.onboarding_completed = True
    # ✅ pas besoin de db.merge() si "user" est déjà attaché à la session (cas normal avec Depends)

    if data.reminder_time:
        remind_at = datetime.strptime(data.reminder_time, "%H:%M").time()
        days = data.reminder_days or []

        existing = db.query(ReadingReminders).filter(ReadingReminders.user_id == user.id).first()

        if existing:
            # ✅ met à jour le reminder existant
            existing.remind_at = remind_at
            existing.days = days
        else:
            # ✅ crée un nouveau reminder
            reminder = ReadingReminders(
                id=uuid4(),
                user_id=user.id,
                remind_at=remind_at,
                days=days,
                is_active=True,
            )
            db.add(reminder)
    db.commit()
