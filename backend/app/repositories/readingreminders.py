from app.models.reading_reminders import ReadingReminders
from app.schemas.user import OnboardingSchema


def create_reading_reminders(boarding:OnboardingSchema):
    reminder = ReadingReminders(
        remind_at= boarding.reminder_time,
        days= boarding.reminder_days or [],
        is_active= True
    )
    