from requests import Session
from app.models.books import Books
from app.models.user_books import UserBooks
from app.models.users import Users


async def get_user_stats(user: Users, db: Session):
    # Récupérer le nombre total de livres
    total_books = db.query(UserBooks).filter(
        UserBooks.user_id == user.id).count()

    # Récupérer le nombre de livres lus
    reading_books = db.query(UserBooks).filter(
        UserBooks.user_id == user.id, UserBooks.status == "reading").count()

    finished_books = db.query(UserBooks).filter(
        UserBooks.user_id == user.id, UserBooks.status == "finished").count()

    # Récupérer le nombre de livres à lire
    to_read_books = db.query(UserBooks).filter(
        UserBooks.user_id == user.id, UserBooks.status == "to_read").count()

    page_reads = db.query(UserBooks).filter(
        UserBooks.user_id == user.id).with_entities(UserBooks.current_page).all()
    page_reads = sum([p[0] for p in page_reads if p[0] is not None])

    reading_goals = db.query(Users).filter(Users.id == user.id).first().reading_goals

    reading_weeks = db.query(UserBooks).filter(
        UserBooks.user_id == user.id, UserBooks.status == "reading").with_entities(UserBooks.start_date, UserBooks.end_date).all()

    return {
        "total_books": total_books,
        "reading_books": reading_books,
        "finished_books": finished_books,
        "to_read_books": to_read_books,
        "page_reads": page_reads,
        "reading_goals": reading_goals,
        "reading_weeks": reading_weeks
    }
