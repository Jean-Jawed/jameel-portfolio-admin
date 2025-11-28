/**
 * GESTION DES PHOTOS DE GALERIES
 * Module pour upload, édition, suppression de photos
 */

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { extractStoragePath, pathToUrl } from './storage-helpers.js';
import { storage } from './firebase-init.js';

export let currentGalleryPhotos = [];

/**
 * Charger les photos d'une galerie
 */
export async function loadGalleryPhotos(db, galleryId) {
  currentGalleryPhotos = [];
  
  const photosSnap = await getDocs(collection(db, 'galleries', galleryId, 'photos'));
  photosSnap.docs.forEach(docSnap => {
    currentGalleryPhotos.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });
  
  // Trier par ordre
  currentGalleryPhotos.sort((a, b) => a.order - b.order);
  
  return currentGalleryPhotos;
}

/**
 * Afficher la section photos dans le modal galerie
 */
export function renderPhotosSection(photos = []) {
  return `
    <div class="photos-section" style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e9ecef;">
      <h3 style="margin-bottom: 1rem;">📸 Photos de la galerie</h3>
      
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <button type="button" class="btn btn-primary" style="flex: 1;" onclick="document.getElementById('gallery-photos-input').click()">
          ⬆️ Upload depuis ordinateur
        </button>
        <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="openMediaBrowserForGalleryPhotos()">
          📁 Choisir depuis médias
        </button>
      </div>
      
      <input type="file" id="gallery-photos-input" multiple accept="image/*" style="display: none;">
      
      <div id="photos-preview" class="photos-list">
        ${photos.map((photo, i) => renderPhotoItem(photo, i)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render un item photo
 */
export function renderPhotoItem(photo, index) {
  return `
    <div class="photo-item" data-url="${photo.image_url}" data-id="${photo.id || ''}">
      <div style="display: grid; grid-template-columns: 100px 1fr auto; gap: 15px; align-items: start;">
        <img src="${photo.image_url}" alt="Photo ${index + 1}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 6px;">
        
        <div>
          <div class="form-group" style="margin-bottom: 10px;">
            <label style="font-size: 12px; font-weight: 600;">Légende FR</label>
            <input type="text" class="caption-fr form-input" value="${photo.caption?.fr || ''}" placeholder="Légende en français">
          </div>
          <div class="form-group" style="margin-bottom: 10px;">
            <label style="font-size: 12px; font-weight: 600;">Légende EN</label>
            <input type="text" class="caption-en form-input" value="${photo.caption?.en || ''}" placeholder="Caption in English">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 12px; font-weight: 600;">Légende AR</label>
            <input type="text" class="caption-ar form-input" value="${photo.caption?.ar || ''}" placeholder="التسمية التوضيحية بالعربية" dir="rtl">
          </div>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 5px;">
          <button type="button" class="btn btn-danger btn-small" onclick="removePhoto(this)">🗑️</button>
          <button type="button" class="btn btn-secondary btn-small" onclick="movePhotoUp(this)" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" class="btn btn-secondary btn-small" onclick="movePhotoDown(this)">↓</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialiser les event listeners pour les photos
 */
export function initPhotosHandlers(storage, galleryId) {
  const input = document.getElementById('gallery-photos-input');
  if (!input) return;
  
  input.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    
    const preview = document.getElementById('photos-preview');
    
    for (const file of files) {
      // Upload vers Storage
      const filename = `${Date.now()}_${file.name}`;
      const storagePath = `images/galleries/${galleryId}/${filename}`;
      const storageRef = ref(storage, storagePath);
      
      try {
        await uploadBytes(storageRef, file);
        const fullUrl = await getDownloadURL(storageRef);
        
        // Extraire chemin relatif pour Firestore
        const relativePath = extractStoragePath(fullUrl);
        
        // Ajouter à la preview
        const photoData = {
          image_url: relativePath,  // ← Chemin relatif au lieu de URL complète
          caption: { fr: '', en: '', ar: '' },
          id: `photo_${Date.now()}`
        };
        
        const photoHTML = renderPhotoItem(photoData, preview.children.length);
        preview.insertAdjacentHTML('beforeend', photoHTML);
        
        showToast(`✅ Image "${file.name}" uploadée`);
      } catch (error) {
        showToast(`❌ Erreur upload: ${error.message}`, 'error');
      }
    }
    
    // Reset input
    e.target.value = '';
  });
}

/**
 * Sauvegarder les photos dans Firestore
 */
export async function saveGalleryPhotos(db, galleryId) {
  const photosContainer = document.getElementById('photos-preview');
  if (!photosContainer) return;
  
  const photoItems = photosContainer.querySelectorAll('.photo-item');
  
  // Supprimer toutes les anciennes photos
  const oldPhotosSnap = await getDocs(collection(db, 'galleries', galleryId, 'photos'));
  for (const docSnap of oldPhotosSnap.docs) {
    await deleteDoc(docSnap.ref);
  }
  
  // Sauvegarder les nouvelles
  for (let i = 0; i < photoItems.length; i++) {
    const item = photoItems[i];
    
    const photoData = {
      image_url: item.dataset.url,
      caption: {
        fr: item.querySelector('.caption-fr').value,
        en: item.querySelector('.caption-en').value,
        ar: item.querySelector('.caption-ar').value
      },
      order: i + 1
    };
    
    const photoId = item.dataset.id || `photo_${i}`;
    await setDoc(doc(db, 'galleries', galleryId, 'photos', photoId), photoData);
  }
}

/**
 * Supprimer une photo
 */
window.removePhoto = function(button) {
  if (!confirm('Supprimer cette photo ?')) return;
  
  const photoItem = button.closest('.photo-item');
  photoItem.remove();
  
  showToast('Photo supprimée (sera effective après enregistrement)');
};

/**
 * Déplacer une photo vers le haut
 */
window.movePhotoUp = function(button) {
  const photoItem = button.closest('.photo-item');
  const previous = photoItem.previousElementSibling;
  
  if (previous) {
    photoItem.parentNode.insertBefore(photoItem, previous);
  }
};

/**
 * Déplacer une photo vers le bas
 */
window.movePhotoDown = function(button) {
  const photoItem = button.closest('.photo-item');
  const next = photoItem.nextElementSibling;
  
  if (next) {
    photoItem.parentNode.insertBefore(next, photoItem);
  }
};


/**
 * Ouvrir Media Browser pour sélectionner des photos de galerie
 */
window.openMediaBrowserForGalleryPhotos = async function() {
  // Importer loadMedia dynamiquement
  const { loadMedia } = await import('./media-browser.js');
  const { storage } = await import('./firebase-init.js');
  
  // Stocker qu'on est en mode sélection multiple galerie
  window.galleryPhotosSelectionMode = true;
  window.selectedGalleryPhotos = [];
  
  const modalContent = `
    <h2>Sélectionner des photos pour la galerie</h2>
    <p style="color: #6c757d; margin-bottom: 1rem;">
      Cliquez sur une ou plusieurs images pour les sélectionner
    </p>
    <div id="selected-count" style="margin-bottom: 1rem; padding: 0.5rem; background: #e7f3ff; border-radius: 4px; display: none;">
      <strong>0 image(s) sélectionnée(s)</strong>
    </div>
    <div style="margin-bottom: 1rem;">
      <button class="btn btn-primary" onclick="confirmGalleryPhotosSelection()">✅ Ajouter les photos sélectionnées</button>
      <button class="btn btn-secondary" onclick="window.hideMediaModal()">Annuler</button>
    </div>
    <div id="media-browser-selection"></div>
  `;
  
  window.showMediaModal(modalContent);  // ← Utiliser modal dédiée
  
  // Load media in selection mode
  const container = document.getElementById('media-browser-selection');
  await loadMedia(storage, container, true);
};

/**
 * Toggle sélection d'une photo pour galerie
 */
window.toggleGalleryPhotoSelection = function(url) {
  if (!window.selectedGalleryPhotos) {
    window.selectedGalleryPhotos = [];
  }
  
  const index = window.selectedGalleryPhotos.indexOf(url);
  if (index > -1) {
    window.selectedGalleryPhotos.splice(index, 1);
  } else {
    window.selectedGalleryPhotos.push(url);
  }
  
  // Update counter
  const counter = document.getElementById('selected-count');
  if (counter) {
    const count = window.selectedGalleryPhotos.length;
    counter.innerHTML = `<strong>${count} image(s) sélectionnée(s)</strong>`;
    counter.style.display = count > 0 ? 'block' : 'none';
  }
  
  // Update visual feedback on items
  updateGalleryPhotoSelectionUI();
};

/**
 * Update UI pour montrer les photos sélectionnées
 */
function updateGalleryPhotoSelectionUI() {
  const items = document.querySelectorAll('.media-item-selectable');
  items.forEach(item => {
    const img = item.querySelector('img');
    if (img && window.selectedGalleryPhotos.includes(img.src)) {
      item.style.border = '3px solid #28a745';
      item.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
    } else {
      item.style.border = '';
      item.style.boxShadow = '';
    }
  });
}

/**
 * Confirmer la sélection et ajouter aux photos
 */
window.confirmGalleryPhotosSelection = function() {
  if (!window.selectedGalleryPhotos || window.selectedGalleryPhotos.length === 0) {
    showToast('⚠️ Aucune image sélectionnée', 'warning');
    return;
  }
  
  const count = window.selectedGalleryPhotos.length;
  
  // Import currentGalleryPhotos depuis le module
  import('./photos-manager.js').then(async module => {
    const photos = module.currentGalleryPhotos;
    const { extractStoragePath } = await import('./storage-helpers.js');
    
    // Ajouter chaque photo sélectionnée
    window.selectedGalleryPhotos.forEach(url => {
      const timestamp = Date.now();
      const relativePath = extractStoragePath(url);  // ← Extraire chemin relatif
      const newPhoto = {
        image_url: relativePath,  // ← Stocker chemin relatif
        caption: { fr: '', en: '', ar: '' },
        order: photos.length,
        tempId: `temp-${timestamp}-${Math.random()}`
      };
      photos.push(newPhoto);
    });
    
    // Refresh preview
    const preview = document.getElementById('photos-preview');
    if (preview) {
      preview.innerHTML = photos.map((photo, i) => module.renderPhotoItem(photo, i)).join('');
    }
    
    // Close modal Media Browser SEULEMENT
    window.hideMediaModal();  // ← Ne ferme QUE la modal Media Browser
    
    // Reset selection
    window.selectedGalleryPhotos = [];
    window.galleryPhotosSelectionMode = false;
    
    showToast(`✅ ${count} photo(s) ajoutée(s)`);
  });
};


/**
 * Charger les previews des photos (convertir chemins en URLs)
 */
export async function loadPhotosPreviews() {
  const photoItems = document.querySelectorAll('.photo-item img');
  
  for (const img of photoItems) {
    const src = img.getAttribute('src');
    
    // Si c'est un chemin relatif (pas http), convertir en URL Firebase
    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
      try {
        const url = await pathToUrl(src, storage);
        img.src = url;
      } catch (error) {
        console.error('Erreur chargement preview photo:', src, error);
      }
    }
  }
}