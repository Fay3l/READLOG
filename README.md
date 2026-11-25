# 📚 ReadLog — Suivi de lectures

> Application mobile pour suivre ses lectures : scanne un livre, suis ta progression page après page et atteins ton objectif annuel.

![CI](https://github.com/Fay3l/READLOG/actions/workflows/ci.yml/badge.svg)
![Stack](https://img.shields.io/badge/stack-FastAPI%20%7C%20React%20Native%20%7C%20PostgreSQL-informational)
![License](https://img.shields.io/badge/license-MIT-green)

<p align="center">
  <img src="DOCS/screenshots/accueil.png" width="200" alt="Page d'accueil" />
  <img src="DOCS/screenshots/bibliotheque.png" width="200" alt="Bibliothèque" />
  <img src="DOCS/screenshots/fiche-livre.png" width="200" alt="Fiche d'un livre" />
  <img src="DOCS/screenshots/statistiques.png" width="200" alt="Statistiques" />
</p>

<!-- Une fois l'app en ligne (voir DOCS/DEPLOY-K3S.md), remplace par ton domaine :
**Essayer :** [🌐 Version web / iPhone](https://readlog.ton-domaine.fr) · [📱 APK Android](https://github.com/Fay3l/READLOG/releases/latest/download/readlog.apk)
-->

---

## Fonctionnalités

- **Ajout de livres** : scan du code-barres (ISBN) avec la caméra, ou recherche par titre / auteur, via l'API Google Books
- **Livres introuvables** : saisie manuelle ; le livre rejoint la base ReadLog et devient trouvable par tous
- **Version web installable (PWA)** : sur iPhone, Android ou ordinateur, avec un bandeau qui guide l'installation
- **Suivi de lecture** : statut (À lire · En cours · Terminé), page actuelle et pourcentage ; un livre passe en « Terminé » à la dernière page
- **Statistiques** : objectif annuel, livres lus / en cours / à lire, pages lues, histogramme des livres terminés par mois
- **Profil** : badges, objectif, rappel de lecture, thème Auto / Clair / Sombre mémorisé
- **Compte sécurisé** : inscription avec vérification de l'e-mail par code, connexion automatique tant que la session est valide

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Mobile | React Native 0.88 · Expo SDK 58 · expo-router · Zustand |
| Backend | FastAPI · SQLAlchemy 2 · Alembic · Pydantic |
| Base de données | PostgreSQL (SQLite pour les tests) |
| Authentification | JWT (PyJWT) · mots de passe hachés en Argon2 |
| API externe | Google Books |
| Qualité | pytest · ruff · TypeScript strict · ESLint · GitHub Actions |
| Déploiement | Docker · k3s (Kubernetes) · Traefik · cert-manager · GitHub Actions (CI/CD) · GHCR |

## Architecture

```
READLOG/
├── backend/                  API FastAPI
│   ├── app/
│   │   ├── core/             config (variables d'env), sécurité (JWT, Argon2), rate limiting
│   │   ├── database/         moteur SQLAlchemy, une session par requête
│   │   ├── models/           tables : users, books, user_books, reading_reminders…
│   │   ├── schemas/          validation des entrées / sorties (Pydantic)
│   │   ├── repositories/     requêtes en base
│   │   ├── routers/          routes HTTP : auth, users, books
│   │   └── services/         Google Books, envoi d'e-mails
│   ├── alembic/              migrations du schéma
│   └── tests/                tests unitaires + tests de bout en bout de l'API
│
├── mobile/                   App Expo
│   ├── app/                  écrans (routage par fichiers avec expo-router)
│   │   └── (tabs)/           onglets : Bibliothèque, Statistiques, Profil
│   ├── components/           composants réutilisables (cartes, graphique…)
│   ├── auth/                 session, stockage sécurisé du jeton
│   ├── fetch/                appels à l'API
│   └── constants/            thème (couleurs, polices, espacements)
│
├── deploy/k8s/               manifests Kubernetes (bootstrap admin + application)
├── .github/workflows/        CI (tests, lint), CD (build + déploiement k3s), release de l'APK
└── DOCS/                     déploiement, journal de débogage, schéma de la base
```

## Lancer le projet en local

### Backend

Prérequis : Python 3.11+, [uv](https://docs.astral.sh/uv/), PostgreSQL.

```bash
cd backend
uv sync                              # installe les dépendances
cp .env.example .env                 # puis remplis DATABASE_URL et SECRET_KEY
uv run python -m app.migrate         # crée / met à jour le schéma de la base
uv run uvicorn app.main:app --reload
```

API sur `http://localhost:8000`, documentation interactive sur `http://localhost:8000/api/docs`.
Sans SMTP configuré, le code de vérification reçu à l'inscription s'affiche dans les logs du serveur.

### Mobile

Prérequis : Node.js 22+.

```bash
cd mobile
npm install
EXPO_PUBLIC_API_URL=http://<IP-de-ton-PC>:8000/api npx expo start
```

Scanne le QR code avec **Expo Go** (le téléphone et le PC doivent être sur le même réseau Wi-Fi).

## Qualité du code

```bash
# backend
uv run pytest            # 35 tests, dont les parcours d'authentification complets
uv run ruff check app tests && uv run ruff format --check app tests

# mobile
npm run typecheck
npm run lint
```

Ces vérifications tournent automatiquement sur chaque push et pull request ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Sécurité

- Le code de vérification part **uniquement par e-mail**, jamais dans une réponse de l'API
- Mots de passe hachés en **Argon2** ; aucun mot de passe dans les logs
- **Rate limiting** sur la connexion, l'inscription et la vérification (réponse 429)
- Message d'erreur identique pour « compte inconnu » et « mauvais mot de passe », avec un temps de réponse identique
- Validation de toutes les entrées avec Pydantic ; clé JWT d'au moins 32 caractères obligatoire
- Jeton stocké dans le **SecureStore** du téléphone ; déconnexion automatique à son expiration
- Secrets de production **chiffrés avec SOPS + age** dans le dépôt (`deploy/secrets/`), déchiffrés uniquement par le serveur au déploiement ; la CI refuse tout secret commité en clair

## Endpoints principaux

```
POST   /api/signup                 Inscription (envoie un code par e-mail)
POST   /api/verify-email           Vérifie le code, renvoie un JWT
POST   /api/resend-code            Renvoie un code
POST   /api/login                  Connexion (OAuth2 password), renvoie un JWT

GET    /api/users/me               Profil
GET    /api/users/books            Ma bibliothèque
PATCH  /api/users/book/{id}        Statut / page en cours
DELETE /api/users/book/{id}        Retirer un livre
GET    /api/users/stats            Statistiques de l'année
PATCH  /api/users/onboarding       Objectif, genres, rappel

GET    /api/books/search?q=        Recherche (base ReadLog + Google Books)
POST   /api/books/add              Ajouter un livre (Google Books)
POST   /api/books/manual           Ajouter un livre saisi à la main
GET    /health                     État du service
```

## Déploiement

- **[DOCS/DEPLOY-K3S.md](DOCS/DEPLOY-K3S.md)** : tout sur un VPS avec k3s (Postgres, API, PWA sous un seul domaine), déploiement automatique à chaque push sur `main`, APK publié dans les Releases GitHub.
- [DOCS/DEPLOY.md](DOCS/DEPLOY.md) : alternative 100 % gratuite sans serveur (Neon, Render, EAS).

## Roadmap

- [x] Authentification JWT avec vérification de l'e-mail
- [x] Scan de code-barres + Google Books API
- [x] Statuts et progression de lecture
- [x] Statistiques et objectif annuel
- [x] Thème clair / sombre
- [ ] Citations et notes de lecture (tables déjà présentes en base)
- [ ] Notifications de rappel de lecture
- [ ] Notes sur 5 étoiles
- [ ] Connexion Google / Apple

## Pour aller plus loin

- [DOCS/DEBUGGING.md](DOCS/DEBUGGING.md) : journal des bugs rencontrés et de leur résolution

## Licence

MIT — voir [LICENSE](./LICENSE)
