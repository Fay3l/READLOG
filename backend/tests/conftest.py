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

# ── Fixture user : un utilisateur prêt à l'emploi ─
@pytest.fixture
def sample_user(db):
    user = Users()
    user.id = uuid4()
    user.name="Alice"
    user.email="alice@readlog.app"
    user.password_hash="hashed_pw"
    db.add(user)
    db.commit()
    db.refresh(user)    
    return user