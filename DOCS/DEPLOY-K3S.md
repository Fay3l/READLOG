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
git push main ──► CI (tests, lint) ──► CD ──► images Docker sur ghcr.io
                                         └──► SSH vers le VPS ──► kubectl apply (namespace readlog)
                                                                     ├─ postgres (StatefulSet + disque)
                                                                     ├─ readlog-api (+ migrations avant démarrage)
                                                                     ├─ readlog-web (nginx)
                                                                     ├─ Ingress Traefik + certificat Let's Encrypt
                                                                     └─ sauvegarde chaque nuit
```

| Fichier | Rôle |
|---|---|
| `backend/Dockerfile`, `mobile/Dockerfile` | images de l'API et du site |
| `deploy/k8s/bootstrap/` | appliqué **une fois, par toi** (admin) : namespace, ClusterIssuer, compte de déploiement |
| `deploy/k8s/app/` | appliqué **par GitHub Actions** à chaque déploiement |
| `deploy/create-secrets.sh` | crée les mots de passe (une fois, sur le VPS) |
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

Pendant un déploiement, la nouvelle version de l'API démarre *avant* l'arrêt de l'ancienne (zéro coupure) : prévois ~100 Mo de marge pendant une minute.

> ⚠️ **cert-manager consomme lui-même 100 à 150 Mo** (3 pods). Vérifie qu'il est installé : `kubectl get pods -n cert-manager`. S'il ne l'est pas et que la mémoire est trop juste, Traefik peut obtenir les certificats tout seul (voir « Alternative sans cert-manager » en bas).

---

## Étape 1 — DNS et pare-feu

1. Chez ton registrar, crée un enregistrement **A** : `readlog.ton-domaine.fr` → IP du VPS.
2. Ouvre les ports **80** (validation Let's Encrypt + redirection) et **443** (HTTPS).
3. Vérifie : `dig +short readlog.ton-domaine.fr` doit afficher l'IP du VPS.

## Étape 2 — Bootstrap du cluster (une fois, en admin sur le VPS)

```bash
git clone https://github.com/Fay3l/READLOG.git && cd READLOG

kubectl apply -f deploy/k8s/bootstrap/namespace.yaml

# ClusterIssuer Let's Encrypt : seule info demandée, ton e-mail
ACME_EMAIL=toi@exemple.fr envsubst < deploy/k8s/bootstrap/cluster-issuer.yaml | kubectl apply -f -

# Compte de déploiement limité au namespace readlog (ne peut pas lire les secrets)
kubectl apply -f deploy/k8s/bootstrap/deployer-rbac.yaml
```

`kubectl get clusterissuer` doit afficher `letsencrypt-prod` et `letsencrypt-staging` avec `READY: True`.

## Étape 3 — Les secrets (une fois, sur le VPS)

```bash
bash deploy/create-secrets.sh
```

Le script génère le mot de passe Postgres et la `SECRET_KEY`, puis demande les infos SMTP (Brevo, Resend…). Rien n'est écrit sur le disque ni envoyé à GitHub.

## Étape 4 — L'utilisateur de déploiement (une fois)

GitHub Actions se connecte en SSH avec un utilisateur dédié, qui n'a que les droits du compte `readlog-deployer`.

**Sur ton PC**, crée une paire de clés réservée au déploiement :

```bash
ssh-keygen -t ed25519 -f readlog_deploy -N "" -C "github-actions-readlog"
```

**Sur le VPS** (en admin) :

```bash
sudo useradd --create-home --shell /bin/bash deploy
sudo mkdir -p /home/deploy/.ssh /home/deploy/.kube
# colle le contenu de readlog_deploy.pub :
sudo nano /home/deploy/.ssh/authorized_keys

# kubeconfig du compte limité, construit à partir de son jeton
TOKEN=$(kubectl -n readlog get secret readlog-deployer-token -o jsonpath='{.data.token}' | base64 -d)
CA=$(kubectl -n readlog get secret readlog-deployer-token -o jsonpath='{.data.ca\.crt}')
sudo tee /home/deploy/.kube/config > /dev/null <<EOF
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
sudo chown -R deploy:deploy /home/deploy/.ssh /home/deploy/.kube
sudo chmod 700 /home/deploy/.ssh /home/deploy/.kube
sudo chmod 600 /home/deploy/.ssh/authorized_keys /home/deploy/.kube/config
```

Test : `sudo -u deploy env KUBECONFIG=/home/deploy/.kube/config kubectl get pods` doit répondre (liste vide), et `... kubectl get secrets` doit être **refusé**.

## Étape 5 — Configurer GitHub

Dans le dépôt : **Settings → Secrets and variables → Actions**.

| Type | Nom | Valeur |
|---|---|---|
| Variable | `READLOG_DOMAIN` | `readlog.ton-domaine.fr` |
| Variable | `APK_URL` | (après l'étape 8) |
| Secret | `VPS_HOST` | IP ou nom du VPS |
| Secret | `VPS_USER` | `deploy` |
| Secret | `VPS_SSH_KEY` | contenu du fichier **privé** `readlog_deploy` |
| Secret | `VPS_KNOWN_HOSTS` | résultat de `ssh-keyscan -t ed25519 <IP du VPS>` |

> `VPS_KNOWN_HOSTS` fixe l'empreinte du serveur : si quelqu'un se faisait passer pour ton VPS, le déploiement refuserait de s'y connecter. Vérifie qu'elle correspond à `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` sur le VPS.

## Étape 6 — Premier déploiement

Fusionne sur `main` (ou onglet **Actions → CD → Run workflow**). Le workflow :

1. attend que la CI soit verte ;
2. construit les images `ghcr.io/<toi>/readlog-api` et `readlog-web` (taggées avec le hash du commit) ;
3. les déploie, puis vérifie que `https://readlog.ton-domaine.fr/api/docs` répond.

**Au premier passage uniquement :** les images publiées sur GHCR peuvent être privées, et k3s ne pourra alors pas les télécharger (`ImagePullBackOff`). Sur GitHub : ton profil → **Packages** → `readlog-api` → *Package settings* → *Change visibility* → **Public**. Pareil pour `readlog-web`, puis relance le workflow.

Suivre le déploiement depuis le VPS :

```bash
kubectl -n readlog get pods -w            # postgres, api, web passent à Running
kubectl -n readlog get certificate        # READY: True quand le certificat HTTPS est prêt (1-2 min)
kubectl -n readlog logs deploy/readlog-api -c migrate   # création du schéma de la base
```

> 💡 Pour un premier essai, remplace `letsencrypt-prod` par `letsencrypt-staging` dans `deploy/k8s/app/ingress.yaml` : en cas d'erreur de config, tu ne risques pas la limite de Let's Encrypt (5 échecs/heure). Le navigateur affichera un avertissement, c'est normal. Remets `prod` ensuite.

## Étape 7 — Vérifier

- `https://readlog.ton-domaine.fr` → page d'accueil ; sur iPhone, le bandeau « Ajoute ReadLog sur ton iPhone » apparaît après 2 s
- `https://readlog.ton-domaine.fr/api/docs` → documentation de l'API
- Inscription → l'e-mail avec le code arrive (sinon : `kubectl -n readlog logs deploy/readlog-api | grep DEV`)

## Étape 8 — APK Android

1. Dans `mobile/`, une fois : `npx eas-cli init` (crée le projet sur expo.dev et ajoute son id dans `app.json`), puis commit.
2. Sur expo.dev → *Account settings* → *Access tokens* → crée un jeton → secret GitHub **`EXPO_TOKEN`**.
3. Onglet **Actions → Release APK → Run workflow** (~15 min). L'APK est publié dans les *Releases* du dépôt.
4. Variable GitHub **`APK_URL`** = `https://github.com/Fay3l/READLOG/releases/latest/download/readlog.apk` (ce lien suit toujours la dernière version), puis relance le CD : le bandeau d'installation du site proposera l'APK aux visiteurs Android.

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
kubectl -n readlog edit secret readlog-api               # changer un secret (puis redémarrer l'API :)
kubectl -n readlog rollout restart deployment/readlog-api
```

## Dépannage

| Symptôme | Cause probable |
|---|---|
| `ImagePullBackOff` | image GHCR privée → la rendre publique (étape 6) |
| `CrashLoopBackOff` sur `migrate` | `DATABASE_URL` fausse, ou Postgres pas encore prêt (il redémarre tout seul) |
| `OOMKilled` | mémoire insuffisante → `kubectl -n readlog top pods`, `free -m` sur le VPS |
| Certificat jamais `READY` | DNS pas encore propagé, port 80 fermé → `kubectl -n readlog describe challenge` |
| Le CD échoue à l'étape SSH | `VPS_KNOWN_HOSTS` ou clé incorrects → tester `ssh -i readlog_deploy deploy@<VPS>` |

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
