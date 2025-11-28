/**
 * IMAGE PICKER - Composant réutilisable pour sélectionner/uploader des images
 */

import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { storage } from './firebase-init.js';

/**
 * Render ImagePicker HTML
 */
export function renderImagePicker(options) {
  const { id, label, currentValue = '' } = options;
  
  return `
    <div class="image-picker" data-picker-id="${id}">
      <label>${label}</label>
      <div class="image-picker-actions">
        <button type="button" class="btn-secondary" onclick="openMediaBrowserFor('${id}')">
          📁 Choisir depuis médias
        </button>
        <button type="button" class="btn-secondary" onclick="uploadImageFor('${id}')">
          ⬆️ Upload nouveau
        </button>
      </div>
      
      <div class="image-preview-container" id="${id}-preview">
        ${currentValue ? `<img src="${currentValue}" class="image-preview" alt="Preview">` : '<div class="no-image">Aucune image</div>'}
      </div>
      
      <input type="hidden" id="${id}" name="${id}" value="${currentValue}">
      
      <small class="image-path">
        ${currentValue ? `📂 ${currentValue}` : 'Aucune image sélectionnée'}
      </small>
      
      <input type="file" id="${id}-upload-input" accept="image/*" style="display:none">
    </div>
  `;
}

/**
 * Initialize ImagePicker handlers
 */
export function initImagePicker() {
  // Handler upload
  window.uploadImageFor = async function(pickerId) {
    const input = document.getElementById(`${pickerId}-upload-input`);
    input.click();
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const btn = document.querySelector(`[onclick="uploadImageFor('${pickerId}')"]`);
      const originalText = btn.textContent;
      btn.textContent = '⏳ Upload...';
      btn.disabled = true;
      
      try {
        // Upload to Storage
        const timestamp = Date.now();
        const filename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const storageRef = ref(storage, `images/${timestamp}_${filename}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        
        // Update picker
        updateImagePicker(pickerId, url);
        
        showToast('✅ Image uploadée');
      } catch (error) {
        console.error('Erreur upload:', error);
        showToast('❌ Erreur lors de l\'upload', 'error');
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    };
  };

  // Handler sélection depuis Media Browser
  window.openMediaBrowserFor = function(pickerId) {
    // Stocker l'ID du picker actif
    window.activeImagePicker = pickerId;
    
    // Ouvrir modal Media Browser en mode sélection
    showMediaBrowserModal();
  };
}

/**
 * Update image picker display
 */
export function updateImagePicker(pickerId, imageUrl) {
  // Update hidden input
  const input = document.getElementById(pickerId);
  if (input) {
    input.value = imageUrl;
  }
  
  // Update preview
  const preview = document.getElementById(`${pickerId}-preview`);
  if (preview) {
    preview.innerHTML = `<img src="${imageUrl}" class="image-preview" alt="Preview">`;
  }
  
  // Update path
  const picker = document.querySelector(`[data-picker-id="${pickerId}"]`);
  if (picker) {
    const path = picker.querySelector('.image-path');
    if (path) {
      path.textContent = `📂 ${imageUrl}`;
    }
  }
}

/**
 * Called when image is selected from Media Browser
 */
window.selectImageFromBrowser = function(imageUrl) {
  if (window.activeImagePicker) {
    updateImagePicker(window.activeImagePicker, imageUrl);
    hideModal();
    showToast('✅ Image sélectionnée');
    window.activeImagePicker = null;
  }
};

/**
 * Show Media Browser modal in selection mode
 */
async function showMediaBrowserModal() {
  const { loadMedia } = await import('./media-browser.js');
  
  const modalContent = `
    <h2>Sélectionner une image</h2>
    <div id="media-browser-selection"></div>
  `;
  
  showModal(modalContent);
  
  // Load media in selection mode
  const container = document.getElementById('media-browser-selection');
  await loadMedia(storage, container, true);
}