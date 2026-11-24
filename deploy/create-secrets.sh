#!/usr/bin/env bash
# Crée les Secrets Kubernetes de ReadLog. À lancer UNE fois sur le VPS (en administrateur) :
#   bash deploy/create-secrets.sh
#
# Les mots de passe sont générés aléatoirement et envoyés directement à Kubernetes :
# ils ne sont écrits dans aucun fichier et ne passent jamais par GitHub.
# Relancer le script ne change rien (il refuse d'écraser des secrets existants).
set -euo pipefail

NS=readlog
KUBECTL="${KUBECTL:-kubectl}"

if $KUBECTL -n "$NS" get secret readlog-db >/dev/null 2>&1; then
  echo "Les secrets existent déjà. Pour en changer un : $KUBECTL -n $NS edit secret readlog-api"
  exit 0
fi

random() { openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c "$1"; }

DB_PASSWORD=$(random 32)
SECRET_KEY=$(random 64)

echo "Configuration SMTP (laisser vide = codes de vérification visibles seulement dans les logs) :"
read -rp "  MAIL_SERVER (ex : smtp-relay.brevo.com) : " MAIL_SERVER
read -rp "  MAIL_USERNAME : " MAIL_USERNAME
read -rsp "  MAIL_PASSWORD (masqué) : " MAIL_PASSWORD; echo
read -rp "  MAIL_FROM (adresse d'expédition) : " MAIL_FROM
read -rsp "Clé Google Books (optionnel, masquée) : " GOOGLE_BOOKS_API_KEY; echo

$KUBECTL -n "$NS" create secret generic readlog-db \
  --from-literal=password="$DB_PASSWORD"

$KUBECTL -n "$NS" create secret generic readlog-api \
  --from-literal=DATABASE_URL="postgresql://readlog:${DB_PASSWORD}@postgres:5432/readlog" \
  --from-literal=SECRET_KEY="$SECRET_KEY" \
  --from-literal=MAIL_SERVER="$MAIL_SERVER" \
  --from-literal=MAIL_USERNAME="$MAIL_USERNAME" \
  --from-literal=MAIL_PASSWORD="$MAIL_PASSWORD" \
  --from-literal=MAIL_FROM="$MAIL_FROM" \
  --from-literal=GOOGLE_BOOKS_API_KEY="$GOOGLE_BOOKS_API_KEY"

echo "✅ Secrets readlog-db et readlog-api créés dans le namespace $NS"
