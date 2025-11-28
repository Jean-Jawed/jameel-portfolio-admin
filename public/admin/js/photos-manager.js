/**
 * GESTION DES PHOTOS DE GALERIES
 * Module pour upload, édition, suppression de photos
 */

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let currentGalleryPhotos = [];

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
      
      <div class="image-upload-area" onclick="document.getElementById('gallery-photos-input').click()">
        <input type="file" id="gallery-photos-input" multiple accept="image/*" style="display: none;">
        <p style="margin: 0; color: #6c757d;">
          📤 Cliquez pour sélectionner des images<br>
          <small>Formats acceptés : JPG, PNG, GIF</small>
        </p>
      </div>
      
      <div id="photos-preview" class="photos-list">
        ${photos.map((photo, i) => renderPhotoItem(photo, i)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render un item photo
 */
function renderPhotoItem(photo, index) {
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
      const storageRef = ref(storage, `images/galleries/${galleryId}/${filename}`);
      
      try {
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        
        // Ajouter à la preview
        const photoData = {
          image_url: url,
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
