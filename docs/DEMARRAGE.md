# 🚀 DÉMARRAGE RAPIDE

## 1. Installation

```bash
npm install firebase
```

## 2. Initialiser Firestore

```bash
node init-firebase.js
```

✅ Crée toutes les données initiales dans Firestore

## 3. Upload des images

Uploadez manuellement les images dans Firebase Storage `/images/` :
- main.JPG
- caroussel1.JPG, caroussel2.JPG, caroussel3.JPG
- Jameel.jpg
- CorneCover.JPG
- Printemps.JPG
- Juives.JPG
- ParisMatch.png

## 4. Build initial

```bash
npm run build
```

✅ Génère le site dans `/dist`

## 5. Test local

```bash
npm run dev
```

Ouvrez http://localhost:3000

## 6. Admin

Accédez à http://localhost:3000/admin
- Email: (votre email Firebase Auth)
- Password: (votre mot de passe)

## 7. Déploiement Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

## Structure des fichiers

```
jameel-portfolio/
├── build/              # Scripts de build
├── src/
│   ├── templates/      # Templates HTML
│   └── partials/       # Header, footer, menu
├── public/
│   ├── admin/          # Interface admin
│   ├── css/            # Styles statiques
│   └── js/             # Scripts statiques
├── dist/               # Site généré (auto)
├── firebase-config.js
├── init-firebase.js
└── package.json
```

## Workflow

1. **Modifier le contenu** → Interface admin (`/admin`)
2. **Publier** → Clic sur bouton "🚀 Publier"
3. **Build auto** → Webhook Vercel (à configurer)
4. **Site mis à jour** → En production

## Webhook Vercel (optionnel)

Pour build automatique au clic sur "Publier" :

1. Vercel Dashboard → Settings → Git → Deploy Hooks
2. Créer un hook → Copier l'URL
3. Dans `dashboard.js`, remplacer le TODO par:
   ```js
   await fetch('VOTRE_WEBHOOK_URL', { method: 'POST' });
   ```

## Règles Firestore (à modifier après tests)

Actuellement : `allow read, write: if true;`

Pour production, changez en :
```
allow read: if true;
allow write: if request.auth != null;
```

✅ **PROJET PRÊT !**
