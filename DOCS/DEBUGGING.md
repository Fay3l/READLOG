# 🐛 Journal de débogage — ReadLog

> Historique des bugs rencontrés pendant le développement de ReadLog (backend FastAPI + mobile React Native/Expo), avec diagnostic et résolution. Ce document illustre la méthode de debug appliquée tout au long du projet : identifier le symptôme, isoler la cause réelle (souvent différente du symptôme apparent), corriger à la source plutôt que de contourner.

---

## Sommaire

- [Backend — Python / FastAPI / SQLAlchemy](#backend--python--fastapi--sqlalchemy)
- [Authentification & sécurité](#authentification--s%C3%A9curit%C3%A9)
- [Dates & fuseaux horaires](#dates--fuseaux-horaires)
- [Migrations Alembic](#migrations-alembic)
- [Tests — Pytest](#tests--pytest)
- [Intégration API externe — Google Books](#int%C3%A9gration-api-externe--google-books)
- [Mobile — React Native / Expo / Hooks](#mobile--react-native--expo--hooks)
- [Mobile — Thème & design system](#mobile--th%C3%A8me--design-system)
- [Mobile — Gestion d'état (Zustand)](#mobile--gestion-d%C3%A9tat-zustand)
- [Mobile — Réseau & session](#mobile--r%C3%A9seau--session)

---

## Backend — Python / FastAPI / SQLAlchemy

### `filter_by()` vs `filter()` mal utilisés ensemble

**Symptôme** — erreur SQLAlchemy sur une requête simple de recherche d'utilisateur.

**Cause** — mélange de deux syntaxes incompatibles :

```python
# ❌ filter_by() attend des kwargs, pas une expression
db.query(Users).filter_by(Users.name == name).first()
```

**Solution**

```python
# ✅ filter() pour les expressions
db.query(Users).filter(Users.name == name).first()
```

**Leçon** — `filter_by()` n'accepte que des égalités simples sur le modèle principal (`filter_by(name=name)`). `filter()` accepte toute expression (`==`, `!=`, `like()`, `and_()`...) et doit être préféré par défaut.

---

### `TypeError: __init__() got an unexpected keyword argument`

**Symptôme** — erreur à la création d'un objet `Books` ou `Users` avec des champs comme `id`, `isbn`, `description`.

**Cause** — avec le style SQLAlchemy 2.0 (`Mapped` + `mapped_column`), le constructeur généré est de type *dataclass* : tout champ **sans** `default=...` devient **obligatoire**, y compris les colonnes nullable en base.

**Solution** — ajouter un défaut explicite sur chaque champ optionnel :

```python
isbn: Mapped[str | None] = mapped_column(default=None)
cover_url: Mapped[str | None] = mapped_column(default=None)
```

**Leçon** — avec le style déclaratif moderne, un champ `nullable=True` en SQL doit systématiquement avoir son pendant `default=None` côté Python, sinon le constructeur le rend obligatoire.

---

### `coroutine object has no attribute 'id'`

**Symptôme** — crash sur `current_user.id` alors que `current_user` vient de `Depends(get_current_user)`.

**Cause** — un `await` manquant dans une fonction intermédiaire appelée par `get_current_user` :

```python
# ❌ retourne une coroutine, jamais exécutée
user = get_user_by_name(name=username, db=db)
```

**Solution**

```python
user = await get_user_by_name(name=username, db=db)
```

**Leçon** — dès qu'une fonction est `async def`, chacun de ses appels doit être précédé de `await`. Un oubli ne lève pas toujours une erreur immédiate — l'objet coroutine remonte silencieusement jusqu'à l'endroit où on tente d'accéder à un de ses attributs.

---

### Produit cartésien sur une jointure implicite

**Symptôme** — `get_books()` retourne tous les livres de la base, y compris ceux d'autres utilisateurs. Warning SQLAlchemy : *"cartesian product between FROM elements"*.

**Cause** — filtrage sur une table sans jointure explicite :

```python
# ❌ Books et UserBooks ne sont reliés nulle part
db.query(Books).filter(UserBooks.user_id == current_user.id).all()
```

**Solution**

```python
db.query(Books).join(UserBooks, UserBooks.book_id == Books.id)\
  .filter(UserBooks.user_id == current_user.id).all()
```

**Leçon** — filtrer sur une colonne d'une table absente du `FROM` ne produit pas une erreur, mais un croisement silencieux de toutes les lignes. Toujours vérifier la présence du `.join()` quand plusieurs tables sont impliquées.

---

### Validation Pydantic échoue sur des champs ajoutés après coup

**Symptôme**

```
pydantic_core.ValidationError: 2 validation errors for GetBook
status — Field required
current_page — Field required
```

**Cause** — tentative d'assigner des champs à un objet Pydantic *après* sa création :

```python
book_data = GetBook.model_validate(book)  # valide ICI, status manque déjà
book_data.status = status                  # trop tard
```

**Solution** — fournir tous les champs **au moment** de la validation :

```python
book_data = GetBook.model_validate({
    **book.__dict__,
    "status": status,
    "current_page": current_page,
})
```

**Leçon** — `model_validate()` valide immédiatement ; un objet Pydantic ne peut pas être complété a posteriori comme un dict classique.

---

## Authentification & sécurité

### 401 malgré un token "correct" obtenu via Swagger

**Symptôme** — le même token fonctionne dans Swagger UI mais échoue depuis l'app mobile.

**Cause** — `OAuth2PasswordRequestForm` attend des données `application/x-www-form-urlencoded`. Axios envoyait un objet JS sérialisé en JSON malgré le bon header `Content-Type`.

**Solution**

```typescript
const formData = new URLSearchParams();
formData.append('username', email);
formData.append('password', pw);
formData.append('grant_type', 'password');

await axios.post(url, formData.toString(), {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
});
```

**Leçon** — définir le bon `Content-Type` ne suffit pas : le corps de la requête doit être réellement encodé dans ce format, pas juste étiqueté comme tel.

---

### `AttributeError: 'coroutine' object has no attribute 'id'` (hooks d'auth)

Même classe de bug que plus haut, mais côté `get_current_user` : un `await` manquant sur `get_user_by_name` à l'intérieur de la dépendance FastAPI. Corrigé de la même façon.

---

### Simplification de la sérialisation imbriquée avec `model_validate`

**Symptôme** — 40+ lignes de boucles manuelles pour transformer un objet SQLAlchemy avec ses relations (`userbooks`, `quotes`, `reading_notes`...) en schéma Pydantic.

**Solution** — activer `from_attributes=True` sur chaque schéma imbriqué, puis :

```python
return GetUser.model_validate(res)  # une seule ligne, relations suivies en cascade
```

**Leçon** — Pydantic v2 sait traverser les relations SQLAlchemy automatiquement tant que chaque schéma imbriqué déclare aussi `from_attributes=True`. Évite la duplication et les erreurs de recopie manuelle.

---

## Dates & fuseaux horaires

### `TypeError: can't compare offset-naive and offset-aware datetimes`

**Symptôme** — comparaison `datetime.now(timezone.utc) > user.verification_expires` plante.

**Cause** — `verification_expires` était stocké via `datetime.utcnow()` (naïf), comparé à `datetime.now(timezone.utc)` (aware).

**Diagnostic approfondi** — même après harmonisation du code Python, le bug persistait. Le format stocké (`2026-09-28 23:41:19.434749`, sans offset) a révélé que **SQLite ignore silencieusement `DateTime(timezone=True)`**, contrairement à PostgreSQL.

**Solution retenue** — uniformiser tout le projet sur des datetimes **naïfs** en UTC (`datetime.utcnow()` partout), cohérent avec le comportement réel de SQLite en développement. Point de vigilance documenté pour la migration future vers PostgreSQL en production, où `timezone=True` est réellement respecté.

**Leçon** — le comportement d'un type de colonne peut différer d'un moteur SQL à l'autre. Toujours vérifier le format réellement stocké en base plutôt que de se fier à la déclaration du modèle.

---

## Migrations Alembic

### Alembic génère des `DROP TABLE` sur toutes les tables existantes

**Symptôme**

```
Detected removed table 'users'
Detected removed table 'books'
... (toutes les tables)
```

**Cause** — `target_metadata` dans `env.py` ne connaissait aucune table car les modèles SQLAlchemy n'étaient jamais importés dans ce fichier. Alembic compare la base réelle à son `metadata` : vide côté code → il propose de tout supprimer.

**Solution**

```python
# alembic/env.py
from app.models.users import Users
from app.models.books import Books
from app.models.user_books import UserBooks
# ... tous les modèles
target_metadata = Base.metadata
```

**Leçon** — toujours relire une migration autogénérée avant de l'appliquer. Ne jamais exécuter `upgrade head` sur un fichier contenant des `drop_table` imprévus.

---

### `sqlite3.OperationalError: near "ALTER": syntax error`

**Symptôme** — une migration de changement de type de colonne plante sur SQLite.

**Cause** — SQLite ne supporte pas `ALTER COLUMN`. Alembic génère ce SQL par défaut, valide sur PostgreSQL mais pas sur SQLite.

**Solution** — activer le mode batch dans `env.py` :

```python
context.configure(
    connection=connection,
    target_metadata=target_metadata,
    render_as_batch=True,  # recrée la table en coulisses sur SQLite
)
```

**Leçon** — `render_as_batch=True` est sans effet sur PostgreSQL (qui garde `ALTER COLUMN` normalement) mais indispensable pour que les mêmes migrations fonctionnent aussi en dev sur SQLite.

---

## Tests — Pytest

### `fixture 'db' not found`

**Cause** — `conftest.py` absent du bon dossier, ou pytest lancé depuis un répertoire qui ne le détecte pas.

**Solution** — structure correcte :

```
backend/
└── tests/
    ├── conftest.py
    └── test_users.py
```

Et lancement systématique depuis la racine du backend (`cd backend && pytest`).

---

### Données de test dupliquées à chaque fixture

**Problème** — une fixture statique (`sample_user`) ne permet pas de créer plusieurs variantes d'utilisateurs pour des cas de test différents.

**Solution** — pattern **factory fixture**, qui retourne une fonction plutôt qu'un objet :

```python
@pytest.fixture
def make_user(db):
    def _make_user(name="Alice", **kwargs):
        user = Users(name=name, email=f"{name.lower()}@readlog.app", **kwargs)
        db.add(user); db.commit(); db.refresh(user)
        return user
    return _make_user
```

**Leçon** — les factories permettent à chaque test de créer exactement les données dont il a besoin, sans dupliquer de code ni coupler les tests entre eux.

---

## Intégration API externe — Google Books

### `503 Service Unavailable` sur les recherches par ISBN

**Diagnostic** — les recherches `isbn:...` passent par un chemin Google différent (lookup direct) et sont historiquement moins stables que la recherche texte classique.

**Solution** — retry avec backoff progressif sur les erreurs 5xx, sans retry sur les 4xx :

```python
for attempt in range(retries + 1):
    try:
        response = await client.get(...)
        response.raise_for_status()
        return parse(response)
    except httpx.HTTPStatusError as e:
        if e.response.status_code >= 500 and attempt < retries:
            await asyncio.sleep(0.5 * (attempt + 1))
            continue
        raise
```

### `404` sur un ISBN valide

**Diagnostic** — pas un bug : Google Books n'indexe pas tous les ISBN (éditions récentes, ouvrages peu diffusés). Comportement normal à prévoir dans l'UX : proposer une recherche manuelle en secours après un scan infructueux.

**Leçon** — face à une erreur venant d'un service tiers, distinguer un vrai bug (500, timeout) d'une limite fonctionnelle attendue (404 sur une ressource qui n'existe simplement pas côté fournisseur).

---

## Mobile — React Native / Expo / Hooks

### `Rendered fewer hooks than expected`

**Cause** — `useColorScheme()` appelé deux fois dans le même fichier (`useTheme()` et `ThemeProvider`), avec un nombre de hooks exécutés qui varie selon le chemin de rendu.

**Solution** — séparer strictement en deux fichiers : `theme.ts` (zéro hook, uniquement des objets statiques) et `ThemeContext.tsx` (tous les hooks, chacun appelé une seule fois).

---

### `Invalid hook call` dans un `StyleSheet.create()` au niveau module

**Cause** — `useTheme()` appelé en dehors du corps d'un composant, pour construire des styles statiques en haut de fichier.

**Solution** — déplacer la création des styles dans un hook dédié (`useStyles`) appelé à l'intérieur du composant, mémoïsé avec `useMemo` :

```tsx
function useStyles() {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create({ ... }), [theme]);
}
```

---

### Crash `Cannot read property 'name' of null`

**Cause** — condition de garde incorrecte avant le rendu principal :

```tsx
// ❌ faux si isLoading=false ET user=null (état intermédiaire)
if (isLoading && !user) return <Loader />;
```

**Solution**

```tsx
// ✅ couvre tous les cas où user n'est pas encore disponible
if (isLoading || !user) return <Loader />;
```

---

### `useEffect` avec une fonction `async` directe

**Cause** — `useEffect(async () => {...}, [])` n'est pas supporté : un effet doit retourner `undefined` ou une fonction de nettoyage, jamais une `Promise`.

**Solution**

```tsx
useEffect(() => {
  async function run() { await doSomething(); }
  run();
}, []);
```

---

### Import circulaire (*require cycle*) entre intercepteur Axios et contexte d'auth

**Symptôme** — `api.ts` importe une fonction de `ctx.tsx`, qui importe `api` en retour.

**Solution** — extraction dans un troisième fichier neutre, sans dépendance (pattern *event bus*) :

```typescript
// authEvents.ts — zéro import
let listener: (() => void) | null = null;
export function onUnauthorized(cb: () => void) { listener = cb; }
export function emitUnauthorized() { listener?.(); }
```

`api.ts` et `ctx.tsx` importent tous deux `authEvents.ts`, jamais l'un l'autre.

---

### Erreur Axios "Uncaught (in promise)" non catchée

**Cause** — un `try { ... } catch (e) { throw e }` ne sert à rien : ça équivaut à l'absence de gestion d'erreur. L'exception remonte jusqu'au composant appelant, qui doit lui-même avoir un `try/catch`.

**Solution** — choisir une convention cohérente par couche : les fonctions `fetch/*.ts` **absorbent** systématiquement l'erreur (retournent `null`/`[]`, journalisent), plutôt que de la relancer sans valeur ajoutée.

---

### Appel d'un hook Zustand (`useXStore()`) hors composant React

**Symptôme** — une fonction utilitaire exportée (`add_book`, `search_books`...) ne se comporte pas comme attendu, sans erreur explicite.

**Cause**

```typescript
export async function add_book(book: BookResult) {
  const { setUserBooks } = useUserBookStore();  // ❌ hook hors composant
  ...
}
```

**Solution** — utiliser l'accès impératif du store, prévu pour ce cas :

```typescript
useUserBookStore.getState().setUserBooks(data);  // ✅
```

**Leçon** — les hooks Zustand/React ne sont valides que dans le corps d'un composant ou d'un autre hook. Pour toute fonction utilitaire classique, `.getState()` (lecture/écriture ponctuelle) est l'équivalent hors-React.

---

### Composant réutilisé avec deux types de données incompatibles

**Symptôme** — `NaN` affiché dans une barre de progression, crash silencieux sur les écrans de recherche.

**Cause** — un composant `CardBook`, conçu pour des livres de la bibliothèque (`GetBook`, avec `status`/`current_page`), était réutilisé pour afficher des résultats de recherche Google Books (`BookResult`, sans ces champs).

**Solution** — séparer les composants selon le contexte de données (`CardBook` pour la bibliothèque, `SearchResultCard` pour les résultats de recherche), plutôt que de forcer un seul composant à gérer deux formes de données différentes.

---

### Store Zustand mis à jour au mauvais moment (`useEffect` plutôt que `onPress`)

**Cause** — stockage d'un livre sélectionné dans un `useEffect` au montage d'une carte de liste, au lieu d'un événement de clic :

```tsx
// ❌ s'exécute pour CHAQUE carte au montage, écrase le store avec le 1er livre
useEffect(() => { setBook(book) }, []);
```

**Solution**

```tsx
function handlePress() {
  setBook(book);          // ✅ stocke le bon livre, au bon moment
  router.push('/detail');
}
```

**Leçon** — un `useEffect` synchronise un composant avec son cycle de vie ; une action déclenchée par l'utilisateur appartient toujours à un gestionnaire d'événement (`onPress`), jamais à un effet.

---

## Mobile — Thème & design system

### Barre de statut iOS toujours sombre malgré le thème clair

**Cause** — `contentStyle` ne contrôle que le fond du contenu, pas les icônes système (heure, batterie).

**Solution**

```tsx
<StatusBar style={theme.isDark ? 'light' : 'dark'} />
```

### Trait violet entre la tab bar et le contenu

**Cause** — bordure par défaut de React Navigation, non liée à la couleur du thème.

**Solution**

```tsx
tabBarStyle: {
  borderTopColor: theme.colors.border.separator,
  borderTopWidth: 0.5,
}
```

### Animation SVG (SMIL `<animate>`) ne fonctionne pas sur mobile

**Diagnostic** — `react-native-svg` ne supporte pas les animations SMIL natives, contrairement aux navigateurs web.

**Solution retenue** — animer le conteneur avec `react-native-reanimated` (rotation, pulsation) plutôt que de compter sur les balises `<animate>` internes du SVG.

---

## Mobile — Gestion d'état (Zustand)

### `Native module is null, cannot access legacy storage`

**Cause** — middleware `persist` de Zustand configuré avec un mauvais import d'`AsyncStorage`, module natif non disponible dans ce contexte.

**Solution retenue** — suppression du `persist` pour le store utilisateur : les données sensibles (token) restent dans **SecureStore**, et le store Zustand se contente d'un cache mémoire reconstruit à chaque démarrage via un appel `/users/me`.

### `useEffect` avec un tableau de dépendances vide empêchant un rechargement

**Symptôme** — `clearUser()` suivi d'un `router.replace()` ne recharge pas les données utilisateur à jour.

**Cause**

```tsx
useEffect(() => { fetchUser(); }, []); // ne se redéclenche jamais quand "user" change
```

**Solution** — selon le besoin : soit ajouter `user` aux dépendances pour un rechargement réactif, soit mettre à jour le store directement avec la réponse d'un appel API frais plutôt que de compter sur un effet pour se redéclencher.

---

## Mobile — Réseau & session

### Architecture retenue pour la gestion du token

| Donnée | Stockage | Raison |
| --- | --- | --- |
| `token` JWT | `expo-secure-store` | Chiffré, persistant entre sessions |
| `user` | Zustand (mémoire) | Rechargé depuis l'API à chaque démarrage |
| `session` (connecté ?) | `expo-secure-store` | Persiste au redémarrage de l'app |

Un intercepteur Axios centralisé injecte le token sur chaque requête et déclenche une déconnexion automatique sur 401, en passant par le pattern *event bus* décrit plus haut pour éviter tout couplage circulaire.

### Redirection automatique selon l'état du compte

Logique centralisée dans `_layout.tsx`, vérifiée dans l'ordre à chaque chargement de l'utilisateur :

```
email_verified === false      → /verify-email
onboarding_completed === false → /onboarding/goal
sinon                          → accès normal à l'app
```

Garantit qu'un utilisateur interrompu en plein onboarding retombe automatiquement sur la bonne étape à sa prochaine connexion, plutôt que de rester bloqué.

---

## Ce que ce journal illustre

- **Isoler la cause réelle du symptôme** — un crash "ici" vient souvent d'un problème "ailleurs" (hook mal placé, type de données incompatible, await manquant).
- **Comprendre les différences d'environnement** — SQLite vs PostgreSQL, Swagger UI vs client mobile, simulateur vs device physique : chaque divergence peut cacher un bug silencieux.
- **Ne pas contourner, corriger à la source** — préférer réparer le modèle de données ou la logique plutôt que d'ajouter des rustines ponctuelles.
- **Documenter en marchant** — garder une trace des bugs rencontrés accélère la résolution de problèmes similaires plus tard dans le projet.