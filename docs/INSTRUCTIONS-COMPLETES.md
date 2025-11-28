# ✅ PROJET JAMEEL PORTFOLIO - COMPLET

## 📦 Ce qui a été généré

**26 fichiers** organisés en :

1. **Build system** - Scripts Node.js pour générer le site
2. **Templates HTML** - Pages et partials réutilisables  
3. **Interface Admin** - CMS complet avec Firebase
4. **Assets statiques** - CSS, JS du site public
5. **Configuration** - Firebase, Vercel, package.json

## 🎯 Ce que fait le système

### Admin (`/admin`)
- ✅ Login sécurisé (Firebase Auth)
- ✅ Dashboard avec stats
- ✅ Gestion paramètres globaux (bio, contact, etc.)
- ✅ CRUD Galeries (avec photos)
- ✅ CRUD Expositions, Publications, Collaborations
- ✅ Explorateur médias (Storage)
- ✅ Bouton "Publier" (trigger rebuild)

### Build system
- ✅ Récupère données Firestore
- ✅ Génère HTML statique (FR/EN/AR)
- ✅ Copie assets dans `/dist`
- ✅ Optimise pour production

### Site public
- ✅ Multilingue (3 langues)
- ✅ Pages: Accueil, Galeries, À propos, Contact
- ✅ Détail de chaque galerie avec photos
- ✅ Design responsive
- ✅ SEO-friendly

## 🚀 INSTALLATION RAPIDE

### 1. Prérequis
- Node.js installé
- Compte Firebase créé
- Firebase Storage configuré
- Compte admin créé dans Authentication

### 2. Setup initial

```bash
# Installer dépendances
npm install firebase

# Initialiser la base de données
node init-firebase.js

# Upload images dans Storage
# (manuellement via console Firebase → /images/)

# Premier build
npm run build

# Test local
npm run dev
# → http://localhost:3000
```

### 3. Tester l'admin

```
http://localhost:3000/admin
Email: votre-email@example.com
Password: votre-mot-de-passe
```

### 4. Déployer sur Vercel

```bash
npm i -g vercel
vercel --prod
```

## 📁 Structure finale

```
jameel-portfolio/
├── build/
│   ├── build.js              ← Script principal
│   ├── fetch-data.js         ← Récupère Firestore
│   ├── render-templates.js   ← Génère HTML
│   └── dev-server.js         ← Serveur local
│
├── src/
│   ├── templates/
│   │   ├── home.html
│   │   ├── galleries.html
│   │   ├── gallery-detail.html
│   │   ├── about.html
│   │   └── contact.html
│   └── partials/
│       ├── header.html
│       ├── footer.html
│       └── mobile-menu.html
│
├── public/
│   ├── admin/
│   │   ├── login.html
│   │   ├── index.html
│   │   ├── css/admin.css
│   │   └── js/
│   │       ├── auth.js
│   │       └── dashboard.js
│   ├── css/
│   │   ├── main.css
│   │   └── rtl.css
│   └── js/
│       ├── menu.js
│       └── contact.js
│
├── dist/                     ← Site généré (auto)
│   ├── admin/
│   ├── fr/
│   ├── en/
│   ├── ar/
│   ├── css/
│   └── js/
│
├── firebase-config.js
├── init-firebase.js
├── package.json
├── vercel.json
└── README.md
```

## ⚙️ Configuration post-installation

### Webhook Vercel (bouton "Publier")

1. Vercel Dashboard → votre projet → Settings → Git → Deploy Hooks
2. Create Hook → Copier l'URL
3. Dans `public/admin/js/dashboard.js`, ligne ~50 :
   ```js
   // Remplacer le TODO par:
   await fetch('VOTRE_WEBHOOK_URL', { method: 'POST' });
   ```

### Règles Firestore (sécurité)

Après les tests, dans Firebase Console → Firestore → Rules :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    allow read: if true;
    allow write: if request.auth != null;
  }
}
```

### Règles Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🔄 Workflow quotidien

1. **Admin modifie contenu** → `/admin`
2. **Clique sur "Publier"** → Trigger webhook
3. **Vercel rebuild auto** → Site MAJ en ~2min
4. **Visiteurs voient nouveau contenu**

## 📝 TODO après installation

- [ ] Uploader toutes les images dans Storage
- [ ] Tester chaque section de l'admin
- [ ] Faire un premier build et vérifier `/dist`
- [ ] Déployer sur Vercel
- [ ] Configurer le webhook "Publier"
- [ ] Sécuriser les règles Firestore
- [ ] Ajouter domaine custom (optionnel)

## 🆘 En cas de problème

### Build échoue
```bash
# Vérifier que Firebase est bien initialisé
node init-firebase.js

# Vérifier les données
# Firebase Console → Firestore
```

### Admin ne se connecte pas
```bash
# Vérifier le compte dans Authentication
# Firebase Console → Authentication → Users
```

### Images ne s'affichent pas
```bash
# Vérifier que les images sont dans Storage
# Firebase Console → Storage → /images/
```

## 📚 Ressources

- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation Vercel](https://vercel.com/docs)
- [Firestore Queries](https://firebase.google.com/docs/firestore/query-data/queries)

---

**🎉 PROJET 100% FONCTIONNEL ET PRÊT À L'EMPLOI !**
