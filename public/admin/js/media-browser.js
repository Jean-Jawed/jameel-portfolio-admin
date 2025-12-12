/**
 * MEDIA BROWSER - Gestion des images Firebase Storage
 */

import { ref, listAll, getDownloadURL, uploadBytes, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Variable globale pour storage (set par initMediaUpload)
let storageInstance = null;

/**
 * Charger et afficher tous les médias
 * @param {boolean} selectionMode - Si true, affiche en mode sélection (cliquable pour choisir)
 */
export async function loadMedia(storage, contentArea, selectionMode = false) {
  storageInstance = storage; // Sauvegarder l'instance
  const imagesRef = ref(storage, 'images');
  
  let html = `
    ${!selectionMode ? `
      <div class="section-header">
        <h1>📁 Bibliothèque de médias</h1>
        <button class="btn btn-primary btn-small" onclick="window.uploadMedia()">⬆️ Upload</button>
      </div>
    ` : ''}
    
    <div class="media-grid" id="media-grid">
      <div class="loading">Chargement des images...</div>
    </div>
    
    ${!selectionMode ? '<input type="file" id="media-upload-input" multiple accept="image/*" style="display: none;">' : ''}
  `;
  
  contentArea.innerHTML = html;
  
  // Charger les images de manière récursive
  const mediaGrid = document.getElementById('media-grid');
  mediaGrid.innerHTML = '';
  
  await loadMediaRecursive(storage, imagesRef, mediaGrid, '', selectionMode);
  
  if (mediaGrid.children.length === 0) {
    mediaGrid.innerHTML = '<p style="color: #6c757d; text-align: center; padding: 2rem;">Aucune image pour le moment</p>';
  }
}

/**
 * Charger médias de manière récursive
 */
async function loadMediaRecursive(storage, folderRef, container, path, selectionMode = false) {
  try {
    const result = await listAll(folderRef);
    
    // Afficher les fichiers
    for (const itemRef of result.items) {
      const url = await getDownloadURL(itemRef);
      const mediaItem = createMediaItem(url, itemRef.name, itemRef.fullPath, selectionMode);
      container.insertAdjacentHTML('beforeend', mediaItem);
    }
    
    // Parcourir les sous-dossiers
    for (const prefixRef of result.prefixes) {
      const folderName = prefixRef.name;
      
      // Ajouter un séparateur de dossier
      container.insertAdjacentHTML('beforeend', `
        <div class="media-folder-separator" style="grid-column: 1 / -1; margin: 1rem 0; padding: 0.5rem; background: #f8f9fa; border-radius: 6px;">
          <strong>📁 ${path ? path + '/' : ''}${folderName}</strong>
        </div>
      `);
      
      await loadMediaRecursive(storage, prefixRef, container, path ? `${path}/${folderName}` : folderName, selectionMode);
    }
  } catch (error) {
    console.error('Erreur chargement médias:', error);
    showToast('❌ Erreur chargement médias', 'error');
  }
}

/**
 * Créer un item média
 */
function createMediaItem(url, name, fullPath, selectionMode = false) {
  if (selectionMode) {
    // Vérifier si on est en mode sélection multiple (galerie) ou carrousel ou simple (ImagePicker)
    const isMultipleMode = typeof window.galleryPhotosSelectionMode !== 'undefined' && window.galleryPhotosSelectionMode;
    const isCarouselMode = typeof window.carouselSelectionMode !== 'undefined' && window.carouselSelectionMode;
    
    if (isMultipleMode) {
      // Mode sélection multiple pour galerie
      return `
        <div class="media-item media-item-selectable" onclick="toggleGalleryPhotoSelection('${url}')" style="cursor: pointer;">
          <div class="media-item-image">
            <img src="${url}" alt="${name}" loading="lazy">
          </div>
          <div class="media-item-info">
            <p class="media-item-name" title="${name}">${name.length > 20 ? name.substring(0, 17) + '...' : name}</p>
            <small style="color: #28a745;">Cliquer pour sélectionner</small>
          </div>
        </div>
      `;
    } else if (isCarouselMode) {
      // Mode sélection pour carrousel
      return `
        <div class="media-item media-item-selectable" onclick="selectImageForCarousel('${url}')" style="cursor: pointer;">
          <div class="media-item-image">
            <img src="${url}" alt="${name}" loading="lazy">
          </div>
          <div class="media-item-info">
            <p class="media-item-name" title="${name}">${name.length > 20 ? name.substring(0, 17) + '...' : name}</p>
            <small style="color: #28a745;">Cliquer pour ajouter au carrousel</small>
          </div>
        </div>
      `;
    } else {
      // Mode sélection simple pour ImagePicker
      return `
        <div class="media-item media-item-selectable" onclick="selectImageFromBrowser('${url}')" style="cursor: pointer;">
          <div class="media-item-image">
            <img src="${url}" alt="${name}" loading="lazy">
          </div>
          <div class="media-item-info">
            <p class="media-item-name" title="${name}">${name.length > 20 ? name.substring(0, 17) + '...' : name}</p>
            <small style="color: #28a745;">Cliquer pour sélectionner</small>
          </div>
        </div>
      `;
    }
  } else {
    // Mode normal : avec actions
    return `
      <div class="media-item">
        <div class="media-item-image">
          <img src="${url}" alt="${name}" loading="lazy">
        </div>
        <div class="media-item-info">
          <p class="media-item-name" title="${name}">${name.length > 20 ? name.substring(0, 17) + '...' : name}</p>
          <div class="media-item-actions">
            <button class="btn btn-secondary btn-tiny" onclick="window.copyMediaURL('${url}')" title="Copier URL">
              📋
            </button>
            <button class="btn btn-danger btn-tiny" onclick="window.deleteMedia('${fullPath}', '${name}')" title="Supprimer">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Upload média
 */
export function initMediaUpload(storage) {
  window.uploadMedia = function() {
    document.getElementById('media-upload-input').click();
  };
  
  const input = document.getElementById('media-upload-input');
  if (!input) return;
  
  input.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    
    const uploadBtn = document.querySelector('.section-header .btn-primary');
    if (uploadBtn) {
      setLoading(uploadBtn, true, 'Upload...');
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      try {
        const filename = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `images/${filename}`);
        
        await uploadBytes(storageRef, file);
        successCount++;
      } catch (error) {
        console.error('Erreur upload:', error);
        errorCount++;
      }
    }
    
    if (uploadBtn) {
      setLoading(uploadBtn, false);
    }
    
    if (successCount > 0) {
      showToast(`✅ ${successCount} image(s) uploadée(s)`);
      // Recharger la grille
      const contentArea = document.getElementById('content-area');
      await loadMedia(storage, contentArea);
    }
    
    if (errorCount > 0) {
      showToast(`❌ ${errorCount} erreur(s)`, 'error');
    }
    
    // Reset input
    e.target.value = '';
  });
}

/**
 * Copier URL média
 */
window.copyMediaURL = function(url) {
  navigator.clipboard.writeText(url).then(() => {
    showToast('📋 URL copiée dans le presse-papier !');
  }).catch(err => {
    console.error('Erreur copie:', err);
    showToast('❌ Erreur lors de la copie', 'error');
  });
};

/**
 * Supprimer média
 */
window.deleteMedia = async function(fullPath, name) {
  if (!confirm(`Supprimer l'image "${name}" ?\n\n⚠️ Cette action est irréversible !`)) {
    return;
  }
  
  try {
    const storageRef = ref(storageInstance, fullPath);
    await deleteObject(storageRef);
    
    showToast('✅ Image supprimée');
    
    // Recharger la grille
    const contentArea = document.getElementById('content-area');
    await loadMedia(storageInstance, contentArea);
  } catch (error) {
    console.error('Erreur suppression:', error);
    showToast('❌ Erreur lors de la suppression', 'error');
  }
};