const https = require('https');
const fs = require('fs');
const path = require('path');
const { getStorage, ref, listAll, getDownloadURL } = require('firebase/storage');

/**
 * Télécharge tous les fichiers de Firebase Storage vers dist/images/
 */
async function downloadAllImages(storage, distDir) {
    console.log('📥 Téléchargement des images depuis Firebase Storage...');
    
    const imagesDir = path.join(distDir, 'images');
    fs.mkdirSync(imagesDir, { recursive: true });
    
    const storageRef = ref(storage, 'images');
    await downloadFolder(storage, storageRef, imagesDir);
    
    console.log('✅ Images téléchargées\n');
}

async function downloadFolder(storage, folderRef, localPath) {
    const result = await listAll(folderRef);
    
    // Télécharger les fichiers
    for (const itemRef of result.items) {
        const url = await getDownloadURL(itemRef);
        const filename = itemRef.name;
        const filepath = path.join(localPath, filename);
        
        await downloadFile(url, filepath);
        console.log(`  ✓ ${itemRef.fullPath}`);
    }
    
    // Récursion dans les sous-dossiers
    for (const prefixRef of result.prefixes) {
        const subfolderName = prefixRef.name;
        const subfolderPath = path.join(localPath, subfolderName);
        fs.mkdirSync(subfolderPath, { recursive: true });
        await downloadFolder(storage, prefixRef, subfolderPath);
    }
}

function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

/**
 * Génère un slug depuis un texte
 */
function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever accents
        .replace(/[^\w\s-]/g, '') // Enlever caractères spéciaux
        .replace(/\s+/g, '-') // Espaces → tirets
        .replace(/-+/g, '-') // Tirets multiples → simple
        .trim();
}

module.exports = { downloadAllImages, generateSlug };
