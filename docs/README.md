# Jameel Subay Portfolio

Portfolio photographique avec CMS admin Firebase et build statique.

## Installation

```bash
npm install
```

## Initialisation Firebase

```bash
node init-firebase.js
```

## Build

```bash
npm run build
```

## Admin

Accès: `/admin`
- Login avec compte Firebase Auth
- Gestion complète du contenu
- Bouton "Publier" pour rebuild

## Déploiement Vercel

```bash
vercel --prod
```

## Structure

- `src/templates/` - Templates HTML
- `public/` - Assets statiques + Admin
- `build/` - Scripts de build
- `dist/` - Site généré (auto)
