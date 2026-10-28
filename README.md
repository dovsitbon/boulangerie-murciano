# Boulangerie Murciano — site vitrine

Site one-page de la Boulangerie Murciano, boulangerie-pâtisserie cachère du Marais (16 rue des Rosiers, Paris 4e).
HTML / CSS / JavaScript sans dépendance ni étape de build : il suffit d'héberger le dossier tel quel.

## Arborescence

```
index.html             Page principale (textes FR, SEO, données structurées)
mentions-legales.html  Mentions légales (à compléter)
css/style.css          Styles : couleurs et polices en haut du fichier (:root)
js/config.js           Téléphone, horaires, e-mail, Formspree  ← à modifier en priorité
js/i18n.js             Traductions anglaises + petits textes du script
js/main.js             Interactions (carrousel, menu, filtres, formulaire…)
images/                Toutes les photos (noms explicites, faciles à remplacer)
robots.txt, sitemap.xml, llms.txt, vercel.json
```

## Modifier les contenus

| Je veux changer… | Où |
|---|---|
| Les **horaires** | `js/config.js` (tableau, footer et badge « Ouvert / Fermé » se mettent à jour), puis le bloc `openingHoursSpecification` en haut de `index.html` (pour Google) |
| Le **téléphone** | `js/config.js` + les liens `tel:` / textes dans `index.html` |
| Un **texte** | le français dans `index.html`, l'anglais dans `js/i18n.js` (même clé `data-i18n`) |
| Une **photo** | remplacer le fichier dans `images/` en gardant le même nom (format JPG, ~1600 px de large pour le hero, ~900 px pour le reste) |
| Un **produit** | dupliquer un bloc `<li class="card">` dans la section « Nos produits » ; `data-cat` = catégorie du filtre, `data-price` = prix (vide = « Prix en boutique ») |
| Les **beignets de Hanouka** | section `#hanouka` dans `index.html` (prix dans le `<dl class="pricelist">`) ; ajouter l'attribut `hidden` sur l'`<article>` hors saison |
| La **note Google** | section « Ils parlent de nous » dans `index.html` (note, nombre d'avis, `--rating`) |
| Les **couleurs / polices** | variables en haut de `css/style.css` |

Tous les points à faire valider sont repérés dans le code par `À CONFIRMER`, `À COMPLÉTER` ou `À REMPLACER` :

```bash
grep -rn "À CONFIRMER\|À COMPLÉTER\|À REMPLACER\|À CONFIGURER\|À VALIDER\|À METTRE À JOUR" --include=*.html --include=*.js .
```

## Formulaire de commande

Par défaut, le formulaire fonctionne en **mode démonstration** (rien n'est envoyé, et le message le dit clairement).
Pour le brancher, dans `js/config.js` :

1. **Formspree (recommandé)** : créer un formulaire gratuit sur [formspree.io](https://formspree.io), copier l'URL `https://formspree.io/f/xxxxxx` dans `formspreeEndpoint`.
2. **Ou e-mail** : renseigner `email` ; le formulaire ouvrira la messagerie du visiteur avec la demande pré-remplie.

## Version anglaise

Bouton FR / EN dans le header. Le choix est mémorisé, et `?lang=en` force l'anglais (lien partageable aux touristes).

## Lancer en local

```bash
python -m http.server 5181
```

puis ouvrir http://localhost:5181.

## Déployer sur Vercel

Le dépôt GitHub est relié à Vercel : **chaque `git push` sur `main` redéploie automatiquement** le site en production.

Première mise en ligne (déjà faite) :

```bash
npx vercel@latest link
npx vercel@latest git connect https://github.com/dovsitbon/boulangerie-murciano
git push
```

Pas de build : Vercel sert les fichiers statiques. En-têtes de cache dans `vercel.json`.
**Nom de domaine** : une fois le domaine du client acheté, l'ajouter dans Vercel (Settings → Domains) puis remplacer `boulangerie-murciano.vercel.app` dans `index.html`, `sitemap.xml`, `robots.txt` et `llms.txt`.

## Crédits photos

Photos d'illustration [Unsplash](https://unsplash.com) (licence Unsplash, usage commercial autorisé), à remplacer par les vraies photos de la boutique.
La vidéo provient de la chaîne YouTube « Alloj Le Live » (chargée seulement au clic, via youtube-nocookie.com).
Le logo est recréé en texte (police Pinyon Script) d'après l'étiquette de la boutique : remplacer par le fichier vectoriel officiel s'il existe.
