from uuid import uuid4
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.users import Users
from app.database.base import Base
from app.models.users import Users
from app.models.books import Books
from app.models.user_books import UserBooks
from app.models.reading_reminders import ReadingReminders
from app.models.quotes import Quotes
from app.models.reading_notes import ReadingNotes

# BDD SQLite en mémoire — rapide, jetée après chaque test
TEST_DATABASE_URL = "sqlite:///:memory:"


engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(bind=engine)

# ── Crée toutes les tables avant les tests ────────


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# ── Fixture db : session propre pour chaque test ──


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


# ── Factory pour Users ────────────────────────────
@pytest.fixture
def make_user(db):
    def _make_user(name="Alice", email=None, **kwargs):
        user = Users(
            name=name,
            email=email or f"{name.lower()}@readlog.app",
            password_hash="hashed_pw",
            **kwargs,  # permet de surcharger n'importe quel champ
        )
        user.id = uuid4()
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    return _make_user  # ← on retourne la FONCTION, pas un user

# ── Factory pour Books ────────────────────────────


@pytest.fixture
def make_book(db):
    def _make_book(title="Dune", author="Frank Herbert", **kwargs):
        book = Books(
            id=uuid4(),
            title=title,
            author=author,
            google_books_id=f"gb_{uuid4().hex[:8]}",
            isbn="",
            cover_url="",
            description="",
            publisher="",
            published_year="",
            ** kwargs,
        )
        db.add(book)
        db.commit()
        db.refresh(book)
        return book
    return _make_book

# ── Factory pour UserBooks (relation) ─────────────


@pytest.fixture
def make_user_book(db):
    def _make_user_book(user, book, status="to_read", **kwargs):
        user_book = UserBooks(
            id=uuid4(),
            user_id=user.id,
            book_id=book.id,
            status=status,
            **kwargs,
        )
        db.add(user_book)
        db.commit()
        db.refresh(user_book)
        return user_book
    return _make_user_book

# ── Garde sample_user si tu veux un raccourci simple ──


@pytest.fixture
def sample_user(make_user):
    return make_user()  # utilise la factory avec les valeurs par défaut
