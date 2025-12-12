#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');
const { fetchData } = require('./fetch-data');
const { renderTemplates } = require('./render-templates');
const { downloadAllImages } = require('./helpers');
const firebaseConfig = require('../firebase-config');

const DIST_DIR = path.join(__dirname, '../dist');

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function build() {
    console.log('🚀 Début du build...\n');

    try {
        // 1. Nettoyer dist/
        console.log('🧹 Nettoyage du dossier dist/...');
        if (fs.existsSync(DIST_DIR)) {
            fs.rmSync(DIST_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(DIST_DIR, { recursive: true });
        console.log('✅ Dossier dist/ nettoyé\n');

        // 2. Télécharger images Storage
        await downloadAllImages(storage, DIST_DIR);

        // 3. Récupérer les données Firestore
        console.log('📡 Récupération des données Firestore...');
        const data = await fetchData();
        console.log('✅ Données récupérées\n');

        // 4. Copier les assets statiques
        console.log('📋 Copie des assets statiques...');
        copyDirectory(path.join(__dirname, '../public/css'), path.join(DIST_DIR, 'css'));
        copyDirectory(path.join(__dirname, '../public/js'), path.join(DIST_DIR, 'js'));
        copyDirectory(path.join(__dirname, '../public/admin'), path.join(DIST_DIR, 'admin'));
        
        // Copier les fichiers SVG à la racine de public
        const publicDir = path.join(__dirname, '../public');
        const iconFiles = fs.readdirSync(publicDir).filter(file => 
            file.endsWith('.svg') || file.endsWith('.ico') || file.endsWith('.png')
        );
        iconFiles.forEach(file => {
            fs.copyFileSync(path.join(publicDir, file), path.join(DIST_DIR, file));
        });
        console.log('✅ Assets copiés\n');

        // 5. Générer les pages HTML
        console.log('🎨 Génération des pages HTML...');
        await renderTemplates(data, DIST_DIR);
        console.log('✅ Pages générées\n');

        // 6. Créer index.html de redirection
        console.log('🔗 Création de la redirection...');
        const redirectHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=fr/index.html">
  <script>window.location.href = 'fr/index.html';</script>
</head>
<body>
  <p>Redirection vers <a href="fr/index.html">Jameel Subay Portfolio</a>...</p>
</body>
</html>`;
        fs.writeFileSync(path.join(DIST_DIR, 'index.html'), redirectHTML);
        console.log('✅ Redirection créée\n');

        console.log('🎉 BUILD TERMINÉ AVEC SUCCÈS!\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur durant le build:', error);
        process.exit(1);
    }
}

function copyDirectory(src, dest) {
    if (!fs.existsSync(src)) return;
    
    fs.mkdirSync(dest, { recursive: true });
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

build();