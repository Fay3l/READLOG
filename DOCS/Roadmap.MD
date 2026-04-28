<style>
    .grid {
        display:grid;
        grid-template-columns: 1fr 6fr 6fr ;
    }
    .backend {
        border: solid 1px;
        border-radius:50px;
        text-align: center;
        border: solid 1px #F5E055;
        color: #7b690c ;
        background-color: #F5E055;
    }
    .mobile {
        border: solid 1px #99cb9e;
        border-radius:50px;
        text-align: center;
        color: #0e6117 ;
        background-color: #99cb9e;
    }
    .api {
        border: solid 1px;
        border-radius:50px;
        text-align: center;
        border: solid 1px #96BEC9;
        color: #19343b ;
        background-color: #96BEC9;
    }
</style>
# ROADMAP

## Fondations
Avant de tout coder, la base doit tenir

### Setup du projet
<div class="grid">
    <p class="backend">Backend</p>
</div>
Init repo, API + SQLite,migrations Alembic, structure des dossiers.

### Modèle de données
<div class="grid">
    <p class="backend">Backend</p>
</div>
Tables : users, books, user_books (statut, note, dates). Relations et indexes.

### Inscription / Connexion
<div class="grid">
    <p class="backend">Backend</p>
</div>
Endpoints POST /register et /login, hash bcrypt, token JWT avec expiration.

### Écran auth mobile
<div class="grid">
    <p class="mobile">Mobile</p>
</div>
Formulaire inscription + connexion en React Native. Navigation vers l'accueil.

## Cœur de l'app — ajout et liste de livres
Ce qui rend l'app utilisable au quotidien

### Intégration Google Books
<div class="grid">
    <p class="api">API</p>
</div>
Recherche par titre / auteur / ISBN. Récupération : titre, auteur, couverture, résumé.

### Scan de code-barres
<div class="grid">
    <p class="mobile">Mobile</p>
</div>
Expo Camera + expo-barcode-scanner. Scan ISBN → appel API → résultat instantané.

### Ajouter un livre à sa liste
<div class="grid">
    <p class="backend">Backend</p>
</div>
POST /books/add — associe un livre à l'utilisateur avec statut initial "à lire".

### Ma bibliothèque
<div class="grid">
    <p class="mobile">Mobile</p>
</div>
Liste des livres avec couverture, titre, statut. Filtre par onglets : À lire / En cours / Terminé.

### Changer le statut
<div class="grid">
    <p class="mobile">Mobile</p>
</div>
Appui long ou bouton → changer statut + ajouter une note + note sur 5 étoiles.

## Statistiques & objectifs
Ce qui donne envie de revenir chaque jour

### Endpoint statistiques
<div class="grid">
    <p class="backend">Backend</p>
</div>
GET /stats — livres lus, en cours, à lire. Progression vers l'objectif annuel.

### Page accueil / dashboard
<div class="grid">
    <p class="mobile">Mobile</p>
</div>
Résumé : livre en cours, objectif annuel avec barre de progression, derniers ajouts.

### Objectif annuel
<div class="grid">
    <p class="mobile">Mobile</p>
</div>
Définir le nombre cible dans les réglages. Calcul automatique du % atteint.

## Polish & déploiement
Prêt à montrer à un recruteur

### Citations & notes rapides
<div class="grid">
    <p class="mobile">Mobile</p>
</div>
Ajouter une citation ou une note depuis la fiche d'un livre. Liste affichée sur la fiche.

### Déploiement backend
<div class="grid">
    <p class="backend">Backend</p>
</div>
Railway ou Render (gratuit). Variables d'env, HTTPS, base de données persistante.

### Build Expo + README
<div class="grid">
    <p class="mobile">Mobile</p>
</div>
Build de demo Expo Go partageable. README avec screenshots, stack, instructions.