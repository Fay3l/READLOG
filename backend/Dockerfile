# Image de l'API ReadLog.
# Construite par GitHub Actions (jamais sur le VPS : la compilation demande de la RAM).
FROM python:3.11-slim

# Pas de fichiers .pyc (système de fichiers en lecture seule dans k8s) ; logs affichés immédiatement
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# 1. Les dépendances d'abord : cette couche reste en cache tant que requirements.txt ne change pas,
#    donc modifier le code ne réinstalle pas tout.
COPY requirements.txt .
RUN pip install -r requirements.txt

# 2. Le code
COPY alembic.ini ./
COPY alembic ./alembic
COPY app ./app

# 3. Jamais root dans le conteneur : si l'app est compromise, l'attaquant a le moins de droits possible
RUN useradd --uid 10001 --no-create-home --shell /usr/sbin/nologin readlog
USER 10001

EXPOSE 8000
# --proxy-headers : l'IP réelle du visiteur (transmise par Traefik) est utilisée pour le rate limiting
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
