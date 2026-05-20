from uuid import uuid4
import pytest
from app.repositories.users import get_user_by_name


# ── Test 1 : cas nominal ──────────────────────────
@pytest.mark.asyncio
async def test_get_user_by_name_found(db, sample_user):
    # ARRANGE — sample_user existe déjà grâce à la fixture

    # ACT
    result = await get_user_by_name("Alice", db)

    # ASSERT
    assert result is not None
    assert result.name == "Alice"
    assert result.email == "alice@readlog.app"

# ── Test 2 : utilisateur inexistant ───────────────
@pytest.mark.asyncio
async def test_get_user_by_name_not_found(db):
    # ACT
    result = await get_user_by_name("Inconnu", db)
    
    # ASSERT
    assert result is None 

# ── Test 3 : casse sensible ───────────────────────
@pytest.mark.asyncio
async def test_get_user_by_name_case_sensitive(db, sample_user):
    # "alice" (minuscule) ≠ "Alice" → ne doit pas trouver
    result = await get_user_by_name("alice", db)


    assert result is None

# ── Test 4 : nom vide ─────────────────────────────
@pytest.mark.asyncio
async def test_get_user_by_name_empty_string(db):
    result = await get_user_by_name("", db)

    assert result is None

# ── Test 5 : plusieurs users, bon retourné ────────
@pytest.mark.asyncio
async def test_get_user_by_name_returns_correct_one(db, sample_user):
    from app.models.users import Users
    # Ajoute un deuxième user dans ce test
    bob = Users()
    bob.id = uuid4()
    bob.name="Bob"
    bob.email="bob@readlog.app"
    bob.password_hash="x"
    db.add(bob)
    db.commit()

    result = await get_user_by_name("Bob", db)


    assert result.name == "Bob"
    assert result.email == "bob@readlog.app" 