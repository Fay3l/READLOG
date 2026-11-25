# 🚀 Déployer ReadLog sur un VPS avec k3s

Tout tourne sur ton VPS, derrière **un seul sous-domaine** :

```
https://readlog.ton-domaine.fr/        → site web (PWA, installable sur iPhone / Android / PC)
https://readlog.ton-domaine.fr/api/... → API FastAPI
                                         PostgreSQL : interne au cluster, jamais exposé
```

Le web et l'API partagent la même origine : **pas de configuration CORS** à gérer.

## Vue d'ensemble

```
git push main ──► CI (tests, lint) ──► CD ─► build sur les runners GitHub ─► images sur ghcr.io
                                         └─► runner auto-hébergé sur le VPS
                                               ├─ ClusterIssuer (créé s'il manque)
                                               ├─ Secrets k8s (depuis les GitHub Secrets)
                                               └─ kubectl apply (namespace readlog)
                                                                     ├─ postgres (StatefulSet + disque)
                                                                     ├─ readlog-api (+ migrations avant démarrage)
                                                                     ├─ readlog-web (nginx)
                                                                     ├─ Ingress Traefik + certificat Let's Encrypt
                                                                     └─ sauvegarde chaque nuit
```

| Fichier | Rôle |
|---|---|
| `backend/Dockerfile`, `mobile/Dockerfile` | images de l'API et du site |
| `deploy/k8s/setup/` | ClusterIssuer Let's Encrypt, **partagé par tous les sites du cluster** (créé par le CD s'il manque) |
| `deploy/k8s/bootstrap/` | appliqué **une fois, par toi** (admin) : namespace et compte de déploiement de ReadLog |
| `deploy/k8s/app/` | appliqué **par GitHub Actions** à chaque déploiement |
| `.github/workflows/cd.yml` | build + déploiement automatique |
| `.github/workflows/release-apk.yml` | APK Android publié dans les Releases GitHub |

## Budget mémoire (300 – 500 Mo disponibles)

Mesuré avec les images réelles :

| Pod | Réservé (request) | Plafond (limit) | Mesuré |
|---|---|---|---|
| postgres | 64 Mi | 192 Mi | ~60 Mo (réglé pour un petit VPS) |
| readlog-api | 96 Mi | 192 Mi | ~94 Mo après 3 connexions simultanées |
| readlog-web | 16 Mi | 48 Mi | ~5 Mo |
| sauvegarde (la nuit, quelques secondes) | 32 Mi | 96 Mi | |
| **Total permanent** | **~176 Mi** | | **~160 Mo** |
| runner GitHub (pendant un déploiement) | | | ~100 Mo |

Pendant un déploiement, la nouvelle version de l'API démarre *avant* l'arrêt de l'ancienne (zéro coupure) : prévois ~100 Mo de marge pendant une minute.

> ⚠️ **cert-manager consomme lui-même 100 à 150 Mo** (3 pods). Vérifie qu'il est installé : `kubectl get pods -n cert-manager`. S'il ne l'est pas et que la mémoire est trop juste, Traefik peut obtenir les certificats tout seul (voir « Alternative sans cert-manager » en bas).

---

## Étape 1 — DNS et pare-feu

1. Chez ton registrar, crée un enregistrement **A** : `readlog.ton-domaine.fr` → IP du VPS.
2. Ouvre les ports **80** (validation Let's Encrypt + redirection) et **443** (HTTPS).
3. Vérifie : `dig +short readlog.ton-domaine.fr` doit afficher l'IP du VPS.

## Étape 2 — Bootstrap (une fois, en admin sur le VPS)

Pas besoin de cloner le projet : `kubectl` lit les fichiers directement depuis GitHub.

```bash
BASE=https://raw.githubusercontent.com/Fay3l/READLOG/main/deploy/k8s/bootstrap
kubectl apply -f $BASE/namespace.yaml
# Compte de déploiement : limité au namespace readlog (+ créer le ClusterIssuer s'il manque)
kubectl apply -f $BASE/deployer-rbac.yaml
```

Le ClusterIssuer (`deploy/k8s/setup/`) n'est pas à appliquer à la main : le CD le crée s'il n'existe pas, et ne touche jamais à celui de tes autres sites.

## Étape 3 — Le runner GitHub sur le VPS (une fois)

Le runner est un petit programme qui attend les jobs de GitHub et les exécute sur ton VPS. Il tourne avec un **utilisateur dédié, sans sudo et sans Docker**, qui n'a que les droits du compte `readlog-deployer`.

```bash
sudo useradd --create-home --shell /bin/bash github-runner
sudo mkdir -p /home/github-runner/.kube

# kubeconfig du compte limité, construit à partir de son jeton
TOKEN=$(kubectl -n readlog get secret readlog-deployer-token -o jsonpath='{.data.token}' | base64 -d)
CA=$(kubectl -n readlog get secret readlog-deployer-token -o jsonpath='{.data.ca\.crt}')
sudo tee /home/github-runner/.kube/config > /dev/null <<EOF
apiVersion: v1
kind: Config
clusters:
- name: k3s
  cluster: { server: "https://127.0.0.1:6443", certificate-authority-data: "$CA" }
users:
- name: readlog-deployer
  user: { token: "$TOKEN" }
contexts:
- name: readlog
  context: { cluster: k3s, user: readlog-deployer, namespace: readlog }
current-context: readlog
EOF
sudo chown -R github-runner:github-runner /home/github-runner/.kube
sudo chmod 700 /home/github-runner/.kube && sudo chmod 600 /home/github-runner/.kube/config
```

Installation du runner : sur GitHub, **Settings → Actions → Runners → New self-hosted runner** (Linux, x64). Exécute les commandes affichées **en tant que `github-runner`** (`sudo -iu github-runner`). À l'étape `./config.sh`, ajoute l'étiquette utilisée par le workflow :

```bash
./config.sh --url https://github.com/Fay3l/READLOG --token <jeton affiché par GitHub> --labels readlog-vps
```

Puis, de retour avec ton utilisateur admin, installe-le comme service (il redémarrera avec le VPS) :

```bash
cd /home/github-runner/actions-runner
sudo ./svc.sh install github-runner
sudo ./svc.sh start
```

Test : `sudo -u github-runner env KUBECONFIG=/home/github-runner/.kube/config kubectl get pods` doit répondre (liste vide), et `... kubectl delete ns readlog` doit être **refusé**.

### ⚠️ Sécurité : dépôt public + runner auto-hébergé

N'importe qui peut ouvrir une pull request sur un dépôt public. Si un workflow lancé par cette PR s'exécutait sur ton runner, le code d'un inconnu tournerait sur ton VPS. Trois protections, toutes nécessaires :

1. **Le workflow CD ne se déclenche jamais sur `pull_request`**, seulement sur `main` ou à la main. Garde-le ainsi, et n'utilise jamais `runs-on: self-hosted` dans un workflow déclenché par une PR.
2. **Settings → Environments → New environment `production`** → *Deployment branches and tags* → *Selected branches* → `main`. Les secrets de production ne sont alors utilisables que depuis `main`.
3. **Settings → Actions → General → Fork pull request workflows** → *Require approval for all external contributors*.

## Étape 4 — Configurer GitHub

Dans **Settings → Environments → production** (créé à l'étape 3), mets les secrets dans l'environnement plutôt qu'au niveau du dépôt : ils ne seront accessibles qu'au job de déploiement, depuis `main`.

| Type | Nom | Valeur |
|---|---|---|
| Variable | `READLOG_DOMAIN` | `readlog.ton-domaine.fr` |
| Variable | `APK_URL` | (après l'étape 7) |
| Secret | `DB_PASSWORD` | mot de passe Postgres (généré, voir ci-dessous) |
| Secret | `SECRET_KEY` | clé JWT, 32 caractères minimum (générée) |
| Secret | `MAIL_SERVER`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM` | ton SMTP (Brevo, Resend…) |
| Secret | `GOOGLE_BOOKS_API_KEY` | ta clé Google Books (optionnel) |

`READLOG_DOMAIN` et `APK_URL` sont des **variables** et non des secrets : elles se retrouvent dans le JavaScript public du site.

> ⚠️ Le job `build` (sur les runners GitHub) lit aussi `READLOG_DOMAIN` et `APK_URL`. S'il n'est pas rattaché à l'environnement `production`, mets ces **deux variables au niveau du dépôt** (Settings → Secrets and variables → Actions → Variables). Les secrets, eux, restent dans l'environnement.

Pour générer les deux valeurs aléatoires (sur ton PC) :

```bash
openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 32; echo   # DB_PASSWORD
openssl rand -base64 64 | tr -dc 'A-Za-z0-9' | head -c 64; echo   # SECRET_KEY
```

> 🔐 **Copie-les aussi dans ton gestionnaire de mots de passe.** GitHub ne permet pas de relire un secret une fois enregistré : ce sera ta seule copie.

> ⚠️ **Ne change pas `DB_PASSWORD` après le premier déploiement.** Postgres ne lit son mot de passe qu'à la création de la base. Changer le secret mettrait à jour l'API mais pas Postgres, et l'API ne pourrait plus se connecter. Pour le changer quand même : d'abord dans Postgres (`kubectl -n readlog exec -it postgres-0 -- psql -U readlog -c "ALTER USER readlog PASSWORD '...'"`), ensuite dans GitHub, puis redéployer.
>
> Les autres secrets peuvent changer quand tu veux : au déploiement suivant, l'API redémarre automatiquement avec les nouvelles valeurs (l'empreinte des secrets fait partie du pod).

## Étape 5 — Premier déploiement

Fusionne sur `main` (ou onglet **Actions → CD → Run workflow**). Le workflow :

1. attend que la CI soit verte ;
2. construit les images `ghcr.io/<toi>/readlog-api` et `readlog-web` sur les runners de GitHub (taggées avec le hash du commit) ;
3. sur ton VPS : crée le ClusterIssuer s'il manque, crée ou met à jour les Secrets, applique les manifests ;
4. vérifie que `https://readlog.ton-domaine.fr/api/docs` répond.

**Au premier passage uniquement :** les images publiées sur GHCR peuvent être privées, et k3s ne pourra alors pas les télécharger (`ImagePullBackOff`). Sur GitHub : ton profil → **Packages** → `readlog-api` → *Package settings* → *Change visibility* → **Public**. Pareil pour `readlog-web`, puis relance le workflow.

Suivre le déploiement depuis le VPS :

```bash
kubectl -n readlog get pods -w            # postgres, api, web passent à Running
kubectl -n readlog get certificate        # READY: True quand le certificat HTTPS est prêt (1-2 min)
kubectl -n readlog logs deploy/readlog-api -c migrate   # création du schéma de la base
```

> 💡 Let's Encrypt limite les échecs à 5 par heure et par domaine. Si le certificat n'arrive pas, corrige la cause (DNS, port 80) avant de réessayer en boucle : `kubectl -n readlog describe challenge`.

## Étape 6 — Vérifier

- `https://readlog.ton-domaine.fr` → page d'accueil ; sur iPhone, le bandeau « Ajoute ReadLog sur ton iPhone » apparaît après 2 s
- `https://readlog.ton-domaine.fr/api/docs` → documentation de l'API
- Inscription → l'e-mail avec le code arrive (sinon : `kubectl -n readlog logs deploy/readlog-api | grep DEV`)

## Étape 7 — APK Android

1. Dans `mobile/`, une fois : `npx eas-cli init` (crée le projet sur expo.dev et ajoute son id dans `app.json`), puis commit.
2. Sur expo.dev → *Account settings* → *Access tokens* → crée un jeton → secret GitHub **`EXPO_TOKEN`**.
3. Onglet **Actions → Release APK → Run workflow** (~15 min). L'APK est publié dans les *Releases* du dépôt.
4. Variable **`APK_URL`** (environnement production) = `https://github.com/Fay3l/READLOG/releases/latest/download/readlog.apk` (ce lien suit toujours la dernière version), puis relance le CD : le bandeau d'installation du site proposera l'APK aux visiteurs Android.

## Sauvegardes

Chaque nuit à 3 h, un `pg_dump` compressé est rangé dans le volume `readlog-backups` (7 jours d'historique).

```bash
# où sont les fichiers sur le VPS
sudo ls /var/lib/rancher/k3s/storage/ | grep readlog-backups
# les copier ailleurs (depuis ton PC) — à faire régulièrement : ils sont sur le même disque que la base !
scp root@<VPS>:/var/lib/rancher/k3s/storage/<dossier-readlog-backups>/readlog-*.sql.gz .

# lancer une sauvegarde tout de suite
kubectl -n readlog create job --from=cronjob/readlog-backup backup-manuelle

# restaurer
gunzip -c readlog-AAAA-MM-JJ.sql.gz | kubectl -n readlog exec -i postgres-0 -- psql -U readlog readlog
```

## Opérations courantes

```bash
kubectl -n readlog top pods                              # consommation mémoire / CPU
kubectl -n readlog logs -f deploy/readlog-api            # logs de l'API
kubectl -n readlog rollout undo deployment/readlog-api   # revenir à la version précédente
kubectl -n readlog rollout restart deployment/readlog-api # redémarrer l'API
# Changer un secret : dans GitHub (environnement production), puis relancer le CD
```

## Dépannage

| Symptôme | Cause probable |
|---|---|
| `ImagePullBackOff` | image GHCR privée → la rendre publique (étape 5) |
| `CrashLoopBackOff` sur `migrate` | `DATABASE_URL` fausse, ou Postgres pas encore prêt (il redémarre tout seul) |
| `OOMKilled` | mémoire insuffisante → `kubectl -n readlog top pods`, `free -m` sur le VPS |
| Certificat jamais `READY` | DNS pas encore propagé, port 80 fermé → `kubectl -n readlog describe challenge` |
| Le job `deploy` reste « Queued » | runner arrêté → `sudo ./svc.sh status` dans `/home/github-runner/actions-runner` |
| `Forbidden` dans les logs du CD | kubeconfig du runner incorrect, ou `deployer-rbac.yaml` pas à jour → refaire l'étape 2 |
| L'API ne se connecte plus à Postgres | `DB_PASSWORD` changé après coup (voir étape 4) |

## Alternative sans cert-manager (si la mémoire manque)

Traefik, déjà présent dans k3s, sait obtenir lui-même les certificats Let's Encrypt, sans pod supplémentaire. Sur le VPS, crée `/var/lib/rancher/k3s/server/manifests/traefik-config.yaml` :

```yaml
apiVersion: helm.cattle.io/v1
kind: HelmChartConfig
metadata:
  name: traefik
  namespace: kube-system
spec:
  valuesContent: |-
    additionalArguments:
      - "--certificatesresolvers.le.acme.email=toi@exemple.fr"
      - "--certificatesresolvers.le.acme.storage=/data/acme.json"
      - "--certificatesresolvers.le.acme.httpchallenge.entrypoint=web"
    persistence:
      enabled: true
```

Puis dans `deploy/k8s/app/ingress.yaml`, remplace l'annotation `cert-manager.io/cluster-issuer` par `traefik.ingress.kubernetes.io/router.tls.certresolver: le` et retire le `secretName` du bloc `tls`.
