from datetime import UTC, datetime

import pytest

from app.repositories.books import update_user_book
from app.repositories.stats import get_user_stats


@pytest.mark.asyncio
async def test_stats_counts_and_monthly(db, make_user, make_book, make_user_book):
    user = make_user(name="Eve", reading_goal=10)
    make_user_book(
        user, make_book(title="A", page_count=300), status="finished", finished_at=datetime(2026, 3, 5, tzinfo=UTC)
    )
    make_user_book(
        user, make_book(title="B", page_count=200), status="finished", finished_at=datetime(2026, 3, 20, tzinfo=UTC)
    )
    make_user_book(
        user, make_book(title="C", page_count=100), status="finished", finished_at=datetime(2025, 12, 1, tzinfo=UTC)
    )  # autre année
    make_user_book(user, make_book(title="D", page_count=400), status="reading", current_page=50)
    make_user_book(user, make_book(title="E"), status="to_read")

    stats = await get_user_stats(user, db, year=2026)

    assert (stats.total_books, stats.finished_books, stats.reading_books, stats.to_read_books) == (5, 3, 1, 1)
    assert stats.pages_read == 300 + 200 + 100 + 50
    assert stats.finished_this_year == 2
    assert stats.books_per_month[2] == 2 and sum(stats.books_per_month) == 2
    assert stats.reading_goal == 10


@pytest.mark.asyncio
async def test_update_user_book_sets_dates(db, make_user, make_book, make_user_book):
    user = make_user(name="Finn")
    book = make_book(title="Dune", page_count=412)
    make_user_book(user, book, status="to_read")

    ub = await update_user_book(db, str(book.id), str(user.id), status="reading", current_page=500)
    assert ub.status == "reading" and ub.started_at is not None
    assert ub.current_page == 412  # bornée au nombre de pages
    assert ub.finished_at is None

    ub = await update_user_book(db, str(book.id), str(user.id), status="finished", current_page=None)
    assert ub.finished_at is not None

    stats = await get_user_stats(user, db)
    assert stats.finished_this_year == 1


@pytest.mark.asyncio
async def test_update_user_book_unknown(db, make_user, make_book):
    user = make_user(name="Gus")
    book = make_book(title="X")
    assert await update_user_book(db, str(book.id), str(user.id), status="reading", current_page=None) is None
