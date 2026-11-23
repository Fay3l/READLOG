# 🚀 Mettre ReadLog en ligne

Ce guide met en ligne les trois briques du projet, **gratuitement** :

```
Postgres (Neon)  ←  API FastAPI (Render)  ←  App Android (APK via EAS)
                                          ←  Version web (EAS Hosting)
```

Ordre à respecter : la base, puis l'API, puis l'app. L'app a besoin de l'URL de l'API au moment du build.

---

## 1. La base de données — Neon

1. Crée un compte sur [neon.tech](https://neon.tech), puis un projet `readlog` (région Europe).
2. Copie la **connection string** : `postgresql://utilisateur:motdepasse@ep-xxx.eu-central-1.aws.neon.tech/readlog?sslmode=require`.

> Garde-la pour toi : c'est un mot de passe. Elle ne doit jamais être commitée.

## 2. L'envoi d'e-mails — Brevo (ou Resend)

Sans SMTP, les codes de vérification ne s'affichent que dans les logs du serveur : personne d'autre que toi ne pourrait s'inscrire.

1. Crée un compte sur [brevo.com](https://www.brevo.com) (300 e-mails/jour gratuits).
2. *SMTP & API* → crée une clé SMTP. Tu obtiens `MAIL_SERVER` (`smtp-relay.brevo.com`), `MAIL_USERNAME` et `MAIL_PASSWORD`.
3. Valide une adresse d'expéditeur : ce sera `MAIL_FROM`.

## 3. L'API — Render

Le fichier [`render.yaml`](../render.yaml) décrit déjà le service.

1. Sur [render.com](https://render.com) : *New* → *Blueprint* → choisis le dépôt `READLOG`.
2. Render demande les variables marquées `sync: false` :

   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | la connection string Neon |
   | `CORS_ORIGINS` | l'URL de la version web (étape 5), ex. `https://readlog.expo.app` |
   | `GOOGLE_BOOKS_API_KEY` | ta clé Google Books |
   | `MAIL_*` | les valeurs Brevo |

   `SECRET_KEY` est générée automatiquement par Render.
3. Au premier démarrage, l'API crée les tables. Marque ensuite les migrations Alembic comme appliquées, une seule fois (onglet *Shell* du service) :
   ```bash
   alembic stamp head
   ```
   Pour les migrations suivantes : `alembic upgrade head`.
4. Vérifie : `https://readlog-api.onrender.com/health` doit répondre `{"status":"ok"}`, et `/docs` affiche la documentation interactive.

> ⚠️ Plan gratuit : le service s'endort après 15 min sans requête. La première requête suivante prend ~50 s. Pour une démo, ouvre `/health` quelques minutes avant.

## 4. L'app Android — APK avec EAS Build

EAS est le service de build d'Expo : il compile l'app dans le cloud, pas besoin d'Android Studio.

```bash
npm install -g eas-cli
eas login            # compte gratuit sur expo.dev
cd mobile
eas init             # relie le projet à ton compte (ajoute un projectId dans app.json)
```

Dans [`mobile/eas.json`](../mobile/eas.json), remplace `https://REMPLACE-MOI.onrender.com/api` par l'URL de ton API, puis :

```bash
eas build -p android --profile preview
```

Le profil `preview` produit un **APK** : à la fin, EAS donne un lien et un QR code. N'importe qui peut télécharger l'APK et l'installer, après avoir autorisé les « sources inconnues ». C'est le lien à mettre dans le README.

## 5. La version web — EAS Hosting

```bash
cd mobile
EXPO_PUBLIC_API_URL=https://readlog-api.onrender.com/api npx expo export -p web
eas deploy --prod
```

Tu obtiens une URL du type `https://readlog.expo.app`. Ajoute-la dans `CORS_ORIGINS` sur Render, sinon le navigateur bloquera les appels à l'API.

> Sur le web, le scan de code-barres n'est pas disponible : la recherche par titre, elle, fonctionne.

## 6. Plus tard : les stores

| Store | Coût | À savoir |
|---|---|---|
| Google Play | 25 $ une fois | `eas build -p android --profile production` produit un `.aab`. Un nouveau compte personnel doit faire tester l'app par 12 personnes pendant 14 jours (test fermé) avant de pouvoir publier. |
| App Store | 99 $/an | `eas build -p ios` puis `eas submit -p ios` ; TestFlight permet un lien de test public. |

## Checklist avant de partager le lien

- [ ] `/health` répond, `/docs` s'affiche
- [ ] Inscription → l'e-mail avec le code arrive bien
- [ ] Connexion, ajout d'un livre, page stats OK sur l'APK
- [ ] Version web : connexion OK (sinon vérifier `CORS_ORIGINS`)
- [ ] Un compte de démo créé, avec quelques livres, pour les visiteurs pressés
