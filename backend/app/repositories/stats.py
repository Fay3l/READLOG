from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.books import Books
from app.models.user_books import UserBooks
from app.schemas.user import GetUser, UserStats


async def get_user_stats(user: GetUser, db: Session, year: int | None = None) -> UserStats:
    """Statistiques de lecture d'un utilisateur pour une année donnée (par défaut : l'année en cours)."""
    year = year or datetime.now(timezone.utc).year

    rows = (
        db.query(UserBooks.status, UserBooks.current_page, UserBooks.finished_at, Books.page_count)
        .join(Books, Books.id == UserBooks.book_id)
        .filter(UserBooks.user_id == user.id)
        .all()
    )

    counts = {"reading": 0, "finished": 0, "to_read": 0}
    books_per_month = [0] * 12
    pages_read = 0

    for status, current_page, finished_at, page_count in rows:
        if status in counts:
            counts[status] += 1

        if status == "finished":
            # un livre terminé compte pour toutes ses pages, même si current_page n'a pas été mis à jour
            pages_read += max(current_page or 0, page_count or 0)
            if finished_at is not None and finished_at.year == year:
                books_per_month[finished_at.month - 1] += 1
        else:
            pages_read += current_page or 0

    return UserStats(
        year=year,
        total_books=len(rows),
        reading_books=counts["reading"],
        finished_books=counts["finished"],
        to_read_books=counts["to_read"],
        pages_read=pages_read,
        reading_goal=user.reading_goal,
        finished_this_year=sum(books_per_month),
        books_per_month=books_per_month,
    )
