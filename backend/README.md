# ReadLog — API

API FastAPI de ReadLog. Installation, variables d'environnement et endpoints : voir le [README principal](../README.md).

```bash
uv sync
cp .env.example .env     # DATABASE_URL, SECRET_KEY...
uv run uvicorn app.main:app --reload
uv run pytest
```

Déploiement sur Render : [DOCS/DEPLOY.md](../DOCS/DEPLOY.md).
