from unittest.mock import AsyncMock, patch
import pytest
from fastapi import HTTPException
from app.repositories.books import create_book, get_books
from app.schemas.book import BookResult


@pytest.mark.asyncio
async def test_create_book_then_listed(db, make_user):
    user = make_user(name="Dora")
    fake = BookResult(google_books_id="gb_test", title="Dune", author="Frank Herbert")
    with patch("app.repositories.books.get_book_by_id", AsyncMock(return_value=fake)):
        await create_book(db, user, "gb_test")
        books = await get_books(db, user)
        assert [b.title for b in books] == ["Dune"]
        # un 2e ajout du même livre doit être refusé proprement (409)
        with pytest.raises(HTTPException) as exc:
            await create_book(db, user, "gb_test")
        assert exc.value.status_code == 409
