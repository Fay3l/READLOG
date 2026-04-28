<style>
    .grid {
        display:grid;
        grid-template-columns: 1fr 6fr 6fr ;
    }
    .essentiel {
        border: solid 1px;
        border-radius:50px;
        text-align: center;
        border: solid 1px #ECECEC;
        color: #515050 ;
        background-color: #ECECEC;
    }
    .utile {
        border: solid 1px #99cb9e;
        border-radius:50px;
        text-align: center;
        color: #0e6117 ;
        background-color: #99cb9e;
    }
    .bonus {
        border: solid 1px;
        border-radius:50px;
        text-align: center;
        border: solid 1px #96BEC9;
        color: #19343b ;
        background-color: #96BEC9;
    }
</style>
## Authentification

### Inscription / Connexion
Email + mot de passe, avec token JWT. Base de tout le reste.
<div class="grid">
    <p class="essentiel">Essentiel</p>
</div>


### Connexion sociale
OAuth Google / Apple pour simplifier l'onboarding mobile.
<div class="grid">
    <p class="utile">Utile</p>
</div>



### Profil utilisateur
Nom, avatar, préférences de genres littéraires.
<div class="grid">
    <p class="utile">Utile</p>
</div>

## Bibliothèque personnelle

### Scan de code-barres
Ajout instantané via la caméra. Recherche dans l'API Open Library / Google Books.
<div class="grid">
    <p class="essentiel">Essentiel</p>
</div>

### Recherche manuelle
Par titre, auteur ou ISBN. Affiche les résultats avec couverture.
<div class="grid">
    <p class="essentiel">Essentiel</p>
</div>

### Statut de lecture
À lire · En cours · Terminé · Abandonné. Filtrable dans la liste.
<div class="grid">
    <p class="essentiel">Essentiel</p>
</div>


### Note & avis
Note de 1 à 5 étoiles + zone de texte libre pour son ressenti.
<div class="grid">
    <p class="essentiel">Essentiel</p>
</div>

### Collections / listes
Regrouper des livres dans des listes nommées (ex : "Cadeaux", "SF favorites").
<div class="grid">
    <p class="utile">Utile</p>
</div>

## Notes & citations

### Citations sauvegardées
Ajouter un extrait de texte avec numéro de page. Retrouvable par livre.
<div class="grid">
    <p class="essentiel">Essentiel</p>
</div>

### Notes de lecture
Notes longues et libres, liées à un livre. Formatage Markdown simple.
<div class="grid">
    <p class="utile">Utile</p>
</div>

### Partage d'une citation
Génère une image stylisée de la citation à partager sur les réseaux.
<div class="grid">
    <p class="bonus">Bonus</p>
</div>


### Export des notes
Exporter toutes les notes / citations d'un livre en PDF ou Markdown.
Bonus

## Objectif & progression

### Objectif annuel
Définir un nombre de livres à lire dans l'année. Barre de progression visuelle.
<div class="grid">
    <p class="essentiel">Essentiel</p>
</div>

### Statistiques personnelles
Nombre de livres lus, pages totales, genres préférés, auteurs les plus lus.
<div class="grid">
    <p class="essentiel">Essentiel</p>
</div>

### Rappel de lecture
Notification push configurable ("Rappelle-moi de lire à 21h").
<div class="grid">
    <p class="utile">Utile</p>
</div>

### Badges & jalons
Récompenses pour 10, 25, 50 livres lus. Moteur de gamification simple.
Bonus

## Découverte

### Recommandations
Suggestions basées sur les genres et auteurs déjà lus (via l'API Open Library).
<div class="grid">
    <p class="utile">Utile</p>
</div>

### Page détail du livre
Résumé, auteur, date, genre, couverture HD. Données enrichies depuis une API.
<div class="grid">
    <p class="essentiel">Essentiel</p>
</div>


### Profil public partageable
Lien vers sa bibliothèque publique (livres lus + notes visibles).
Bonus