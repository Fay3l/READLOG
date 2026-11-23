import os

# ⚠️ Avant tout import de l'app : app/core/config.py exige ces variables au chargement
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only-0123456789")

from uuid import uuid4  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.core.rate_limit import ALL_LIMITERS  # noqa: E402
from app.database.base import Base  # noqa: E402
from app.database.session import get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models.books import Books  # noqa: E402
from app.models.user_books import UserBooks  # noqa: E402
from app.models.users import Users  # noqa: E402

# BDD SQLite en mémoire — rapide, jetée à la fin des tests.
# StaticPool : une seule connexion partagée, sinon chaque connexion (et le TestClient,
# qui tourne dans un autre thread) verrait sa propre base vide.
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(bind=engine)


@pytest.fixture
def client():
    """Client HTTP sur l'API complète, branchée sur la base de test."""
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    for limiter in ALL_LIMITERS:  # chaque test repart avec des compteurs à zéro
        limiter.reset()
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


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
        fields = dict(
            id=uuid4(),
            title=title,
            author=author,
            google_books_id=f"gb_{uuid4().hex[:8]}",
            isbn="",
            cover_url="",
            description="",
            publisher="",
            published_year="2000",
        )
        fields.update(kwargs)  # permet de surcharger n'importe quel champ
        book = Books(**fields)
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
