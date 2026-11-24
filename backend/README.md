# ReadLog — API

API FastAPI de ReadLog. Installation, variables d'environnement et endpoints : voir le [README principal](../README.md).

```bash
uv sync
cp .env.example .env     # DATABASE_URL, SECRET_KEY...
uv run python -m app.migrate
uv run uvicorn app.main:app --reload
uv run pytest
```

Déploiement : [DOCS/DEPLOY-K3S.md](../DOCS/DEPLOY-K3S.md) (VPS + k3s) ou [DOCS/DEPLOY.md](../DOCS/DEPLOY.md) (Render).
