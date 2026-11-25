#!/usr/bin/env bash
# Vérifie qu'aucun secret n'est commité EN CLAIR : chaque fichier deploy/secrets/*.env doit
# être chiffré par SOPS (valeurs "ENC[...]" + métadonnées "sops_..."). Lancé par la CI.
# Le modèle *.env.example est ignoré (il ne contient pas de vraies valeurs).
set -euo pipefail
status=0
shopt -s nullglob
for f in deploy/secrets/*.env; do
  if ! grep -q '^sops_version=' "$f"; then
    echo "::error file=$f::Fichier NON chiffré par SOPS. Lance : sops encrypt --in-place $f"
    status=1
    continue
  fi
  # toute ligne "CLE=valeur" (hors commentaires et métadonnées sops_) doit avoir une valeur
  # chiffrée. Les valeurs VIDES sont acceptées : sops les laisse telles quelles (rien à cacher).
  if grep -nEv '^(#|$|sops_)' "$f" | grep -vE '=(ENC\[.*|)$' ; then
    echo "::error file=$f::Valeur(s) en clair ci-dessus. Rechiffre le fichier avec sops."
    status=1
  fi
done
[ "$status" -eq 0 ] && echo "✅ Secrets : tous chiffrés"
exit "$status"
