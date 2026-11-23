"""Tests de bout en bout de l'authentification, via de vraies requêtes HTTP sur l'API.

Chaque test vérifie une règle de sécurité précise.
"""

import logging
import re
from uuid import uuid4

PASSWORD = "motdepasse-solide"


def _signup(client, caplog, name=None, email=None):
    """Inscrit un compte et récupère le code dans les logs (mode dev, sans SMTP)."""
    name = name or f"user{uuid4().hex[:6]}"
    email = email or f"{name}@readlog.app"
    with caplog.at_level(logging.WARNING):
        res = client.post("/api/signup", json={"name": name, "email": email, "password": PASSWORD})
    match = re.search(r"code de vérification pour \S+ : (\d{6})", caplog.text)
    caplog.clear()
    return res, email, match.group(1) if match else None


def _login(client, login, password=PASSWORD):
    return client.post("/api/login", data={"username": login, "password": password})


def test_signup_does_not_leak_verification_code(client, caplog):
    res, _, code = _signup(client, caplog)
    assert res.status_code == 201
    assert code is not None  # le code est bien généré (dans les logs serveur)
    assert code not in res.text  # ... mais JAMAIS renvoyé au client
    assert "code" not in res.json()


def test_signup_validates_input(client):
    res = client.post("/api/signup", json={"name": "Bob", "email": "pas-un-email", "password": "court"})
    assert res.status_code == 422


def test_signup_rejects_duplicate_email(client, caplog):
    _, email, _ = _signup(client, caplog)
    res, _, _ = _signup(client, caplog, email=email.upper())  # casse différente : même e-mail
    assert res.status_code == 409


def test_full_flow_signup_verify_login_me(client, caplog):
    _, email, code = _signup(client, caplog)

    # pas de connexion tant que l'e-mail n'est pas vérifié
    assert _login(client, email).status_code == 403

    res = client.post("/api/verify-email", params={"email": email, "code": code})
    assert res.status_code == 200
    token = res.json()["access_token"]

    me = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200 and me.json()["email"] == email

    login = _login(client, email)
    assert login.status_code == 200 and "access_token" in login.json()


def test_login_errors_are_identical(client, caplog):
    _, email, code = _signup(client, caplog)
    client.post("/api/verify-email", params={"email": email, "code": code})

    wrong_password = _login(client, email, "mauvais-mot-de-passe")
    unknown_account = _login(client, "inconnu@readlog.app")
    # même code HTTP et même message : impossible de savoir si le compte existe
    assert wrong_password.status_code == unknown_account.status_code == 401
    assert wrong_password.json() == unknown_account.json()


def test_wrong_code_is_rejected(client, caplog):
    _, email, code = _signup(client, caplog)
    wrong = "000000" if code != "000000" else "111111"
    res = client.post("/api/verify-email", params={"email": email, "code": wrong})
    assert res.status_code == 400


def test_resend_code_is_generic_and_works_after_resend(client, caplog):
    _, email, _ = _signup(client, caplog)
    with caplog.at_level(logging.WARNING):
        known = client.post("/api/resend-code", params={"email": email})
    new_code = re.search(r"(\d{6})", caplog.text).group(1)
    unknown = client.post("/api/resend-code", params={"email": "inconnu@readlog.app"})
    # même réponse : pas d'énumération des comptes
    assert known.status_code == unknown.status_code == 200
    assert known.json() == unknown.json()
    # avant : comparer une date naïve et une date avec fuseau faisait planter /verify-email
    assert client.post("/api/verify-email", params={"email": email, "code": new_code}).status_code == 200


def test_login_is_rate_limited(client):
    statuses = [_login(client, "inconnu@readlog.app", "x").status_code for _ in range(11)]
    assert statuses[:10] == [401] * 10
    assert statuses[10] == 429


def test_invalid_token_is_rejected(client):
    res = client.get("/api/users/me", headers={"Authorization": "Bearer pas-un-jeton"})
    assert res.status_code == 401


def test_search_requires_authentication(client):
    assert client.get("/api/books/search", params={"q": "dune"}).status_code == 401


def test_malformed_book_id_returns_422(client, caplog):
    _, email, code = _signup(client, caplog)
    token = client.post("/api/verify-email", params={"email": email, "code": code}).json()["access_token"]
    res = client.delete("/api/users/book/pas-un-uuid", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 422  # avant : UUID(hex=...) levait une erreur 500


def test_postgres_url_is_normalized():
    from app.database.utils import normalize_database_url

    assert normalize_database_url("postgres://u:p@h/db") == "postgresql://u:p@h/db"
    assert normalize_database_url("postgresql://u:p@h/db") == "postgresql://u:p@h/db"


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}
