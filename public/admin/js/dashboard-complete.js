/**
 * DASHBOARD ADMIN COMPLET
 * Version finale avec CRUD complet + Photos + Media Browser
 */

import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Firebase init partagé
import { auth, db, storage } from './firebase-init.js';

// Modules
import { loadGalleryPhotos, renderPhotosSection, initPhotosHandlers, saveGalleryPhotos } from './photos-manager.js';
import { loadExhibitions, showExhibitionModal, saveExhibition, deleteExhibition, loadPublications, showPublicationModal, savePublication, deletePublication, loadCollaborations, showCollaborationModal, saveCollaboration, deleteCollaboration } from './crud-modules.js';
import { loadMedia, initMediaUpload } from './media-browser.js';

// Check auth
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
  }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'login.html';
});

// Navigation
const navLinks = document.querySelectorAll('.sidebar nav a');
const contentArea = document.getElementById('content-area');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    const section = link.dataset.section;
    loadSection(section);
  });
});

// Load section
async function loadSection(section) {
  switch (section) {
    case 'dashboard':
      await loadDashboard();
      break;
    case 'settings':
      await loadSettings();
      break;
    case 'galleries':
      await loadGalleries();
      break;
    case 'exhibitions':
      await loadExhibitions(db, contentArea);
      break;
    case 'publications':
      await loadPublications(db, contentArea);
      break;
    case 'collaborations':
      await loadCollaborations(db, contentArea);
      break;
    case 'media':
      await loadMedia(storage, contentArea);
      initMediaUpload(storage);
      break;
  }
}

// ============================================
// DASHBOARD
// ============================================

async function loadDashboard() {
  const galleriesSnap = await getDocs(collection(db, 'galleries'));
  const exhibitionsSnap = await getDocs(collection(db, 'exhibitions'));
  const publicationsSnap = await getDocs(collection(db, 'publications'));
  const collabsSnap = await getDocs(collection(db, 'collaborations'));
  
  const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
  const settings = settingsDoc.data();
  
  const lastPublish = settings.last_publish ? new Date(settings.last_publish.seconds * 1000).toLocaleString('fr-FR') : 'Jamais';
  
  contentArea.innerHTML = `
    <div class="section-header">
      <h1>Tableau de bord</h1>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>${galleriesSnap.size}</h3>
        <p>Galeries</p>
      </div>
      <div class="stat-card">
        <h3>${exhibitionsSnap.size}</h3>
        <p>Expositions</p>
      </div>
      <div class="stat-card">
        <h3>${publicationsSnap.size}</h3>
        <p>Publications</p>
      </div>
      <div class="stat-card">
        <h3>${collabsSnap.size}</h3>
        <p>Collaborations</p>
      </div>
    </div>
    
    <div class="card" style="margin-top: 2rem;">
      <h3>Dernière publication</h3>
      <p style="color: #6c757d;">${lastPublish}</p>
    </div>
    
    <div class="card" style="margin-top: 1rem;">
      <h3>Bienvenue !</h3>
      <p>Utilisez le menu de gauche pour gérer votre portfolio.</p>
    </div>
  `;
}

// ============================================
// SETTINGS
// ============================================

async function loadSettings() {
  const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
  const data = settingsDoc.data();
  
  const galleriesSnap = await getDocs(collection(db, 'galleries'));
  const allGalleries = galleriesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const featured = data.homepage.featured_galleries || [];
  
  contentArea.innerHTML = `
    <div class="section-header">
      <h1>Paramètres</h1>
      <button class="btn btn-primary btn-small" id="save-settings-btn">💾 Enregistrer</button>
    </div>
    
    <div class="card">
      <h3>Informations photographe</h3>
      
      <div class="form-row">
        <div class="form-group">
          <label>Nom</label>
          <input type="text" id="photographer-name" value="${data.photographer.name}">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="photographer-email" value="${data.photographer.email}">
        </div>
        <div class="form-group">
          <label>Téléphone</label>
          <input type="tel" id="photographer-phone" value="${data.photographer.phone}">
        </div>
      </div>
      
      <div class="form-group">
        <label>Photo de profil</label>
        <input type="file" id="profile-image-input" accept="image/*">
        ${data.photographer.profile_image ? `<img src="${data.photographer.profile_image}" style="max-width: 200px; margin-top: 10px; border-radius: 6px;">` : ''}
      </div>
      
      <div class="form-group">
        <label>Instagram URL</label>
        <input type="url" id="photographer-instagram" value="${data.photographer.social.instagram}">
      </div>
      
      <div class="form-group">
        <label>URL vidéo interview (YouTube embed)</label>
        <input type="url" id="interview-video-url" value="${data.photographer.interview_video_url || ''}">
        <small style="color: #6c757d;">Format: https://www.youtube.com/embed/VIDEO_ID</small>
      </div>
      
      <h4 style="margin-top: 2rem; margin-bottom: 1rem;">Biographie</h4>
      
      <div class="lang-tabs">
        <button class="lang-tab active" onclick="switchLangTab(event, 'bio-fr')">FR</button>
        <button class="lang-tab" onclick="switchLangTab(event, 'bio-en')">EN</button>
        <button class="lang-tab" onclick="switchLangTab(event, 'bio-ar')">AR</button>
      </div>
      
      <div id="bio-fr" class="lang-content active">
        <div class="form-group">
          <label>Biographie courte (FR)</label>
          <textarea id="bio-short-fr" rows="3">${data.photographer.bio_short.fr}</textarea>
        </div>
        <div class="form-group">
          <label>Biographie longue (FR)</label>
          <textarea id="bio-long-fr" rows="6">${data.photographer.bio_long.fr}</textarea>
        </div>
      </div>
      
      <div id="bio-en" class="lang-content">
        <div class="form-group">
          <label>Biographie courte (EN)</label>
          <textarea id="bio-short-en" rows="3">${data.photographer.bio_short.en}</textarea>
        </div>
        <div class="form-group">
          <label>Biographie longue (EN)</label>
          <textarea id="bio-long-en" rows="6">${data.photographer.bio_long.en}</textarea>
        </div>
      </div>
      
      <div id="bio-ar" class="lang-content">
        <div class="form-group">
          <label>Biographie courte (AR)</label>
          <textarea id="bio-short-ar" rows="3" dir="rtl">${data.photographer.bio_short.ar}</textarea>
        </div>
        <div class="form-group">
          <label>Biographie longue (AR)</label>
          <textarea id="bio-long-ar" rows="6" dir="rtl">${data.photographer.bio_long.ar}</textarea>
        </div>
      </div>
    </div>
    
    <div class="card" style="margin-top: 2rem;">
      <h3>Page d'accueil</h3>
      
      <div class="form-group">
        <label>Image hero</label>
        <input type="text" id="hero-image" value="${data.homepage.hero_image}">
      </div>
      
      <div class="lang-tabs">
        <button class="lang-tab active" onclick="switchLangTab(event, 'hero-fr')">FR</button>
        <button class="lang-tab" onclick="switchLangTab(event, 'hero-en')">EN</button>
        <button class="lang-tab" onclick="switchLangTab(event, 'hero-ar')">AR</button>
      </div>
      
      <div id="hero-fr" class="lang-content active">
        <div class="form-group">
          <label>Titre hero (FR)</label>
          <input type="text" id="hero-title-fr" value="${data.homepage.hero_title.fr}">
        </div>
        <div class="form-group">
          <label>Sous-titre hero (FR)</label>
          <input type="text" id="hero-subtitle-fr" value="${data.homepage.hero_subtitle.fr}">
        </div>
      </div>
      
      <div id="hero-en" class="lang-content">
        <div class="form-group">
          <label>Titre hero (EN)</label>
          <input type="text" id="hero-title-en" value="${data.homepage.hero_title.en}">
        </div>
        <div class="form-group">
          <label>Sous-titre hero (EN)</label>
          <input type="text" id="hero-subtitle-en" value="${data.homepage.hero_subtitle.en}">
        </div>
      </div>
      
      <div id="hero-ar" class="lang-content">
        <div class="form-group">
          <label>Titre hero (AR)</label>
          <input type="text" id="hero-title-ar" value="${data.homepage.hero_title.ar}" dir="rtl">
        </div>
        <div class="form-group">
          <label>Sous-titre hero (AR)</label>
          <input type="text" id="hero-subtitle-ar" value="${data.homepage.hero_subtitle.ar}" dir="rtl">
        </div>
      </div>
      
      <h4 style="margin-top: 2rem;">Galeries mises en avant</h4>
      <div style="display: grid; gap: 10px;">
        ${allGalleries.map(g => `
          <label style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" name="featured" value="${g.id}" ${featured.includes(g.id) ? 'checked' : ''}>
            <span>${g.title.fr}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;
  
  // Event listeners
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
  document.getElementById('profile-image-input').addEventListener('change', handleProfileImageUpload);
}

async function handleProfileImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const storageRef = ref(storage, `images/profile_${Date.now()}.jpg`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  
  showToast('✅ Photo de profil uploadée');
  
  // Mettre à jour l'affichage
  const preview = document.querySelector('#profile-image-input + img');
  if (preview) {
    preview.src = url;
  } else {
    e.target.insertAdjacentHTML('afterend', `<img src="${url}" style="max-width: 200px; margin-top: 10px; border-radius: 6px;">`);
  }
}

async function saveSettings() {
  const btn = document.getElementById('save-settings-btn');
  setLoading(btn, true, 'Enregistrement...');
  
  // Récupérer l'URL de la photo de profil
  const profileImg = document.querySelector('#profile-image-input + img');
  const profileImageUrl = profileImg ? profileImg.src : '';
  
  // Récupérer les galeries featured
  const featuredCheckboxes = document.querySelectorAll('input[name="featured"]:checked');
  const featured = Array.from(featuredCheckboxes).map(cb => cb.value);
  
  const settingsData = {
    photographer: {
      name: document.getElementById('photographer-name').value,
      email: document.getElementById('photographer-email').value,
      phone: document.getElementById('photographer-phone').value,
      profile_image: profileImageUrl,
      interview_video_url: document.getElementById('interview-video-url').value,
      bio_short: {
        fr: document.getElementById('bio-short-fr').value,
        en: document.getElementById('bio-short-en').value,
        ar: document.getElementById('bio-short-ar').value
      },
      bio_long: {
        fr: document.getElementById('bio-long-fr').value,
        en: document.getElementById('bio-long-en').value,
        ar: document.getElementById('bio-long-ar').value
      },
      social: {
        instagram: document.getElementById('photographer-instagram').value,
        facebook: '',
        twitter: ''
      }
    },
    homepage: {
      hero_image: document.getElementById('hero-image').value,
      hero_title: {
        fr: document.getElementById('hero-title-fr').value,
        en: document.getElementById('hero-title-en').value,
        ar: document.getElementById('hero-title-ar').value
      },
      hero_subtitle: {
        fr: document.getElementById('hero-subtitle-fr').value,
        en: document.getElementById('hero-subtitle-en').value,
        ar: document.getElementById('hero-subtitle-ar').value
      },
      hero_cta: { fr: 'Découvrir', en: 'Discover', ar: 'اكتشف' },
      carousel: [],
      featured_galleries: featured
    },
    contact: {
      intro_text: { fr: '', en: '', ar: '' },
      formspree_endpoint: 'https://formspree.io/f/YOUR_FORM_ID'
    },
    updated_at: serverTimestamp()
  };
  
  await setDoc(doc(db, 'settings', 'global'), settingsData, { merge: true });
  
  setLoading(btn, false);
  showToast('✅ Paramètres enregistrés !');
}

// Switch lang tabs
window.switchLangTab = function(event, contentId) {
  const tabs = event.target.parentElement.querySelectorAll('.lang-tab');
  const contents = event.target.parentElement.parentElement.querySelectorAll('.lang-content');
  
  tabs.forEach(t => t.classList.remove('active'));
  contents.forEach(c => c.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(contentId).classList.add('active');
};

// ============================================
// GALLERIES
// ============================================

async function loadGalleries() {
  const galleriesSnap = await getDocs(collection(db, 'galleries'));
  const galleries = galleriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  galleries.sort((a, b) => a.order - b.order);
  
  let html = `
    <div class="section-header">
      <h1>Galeries</h1>
      <button class="btn btn-primary btn-small" onclick="window.createGallery()">+ Nouvelle galerie</button>
    </div>
    
    <ul class="item-list" id="galleries-list">
      ${galleries.map(gallery => `
        <li class="item-list-item" data-id="${gallery.id}">
          <div class="item-info">
            <h4>${gallery.title.fr}</h4>
            <p>Ordre: ${gallery.order} • Statut: ${gallery.status === 'published' ? '✅ Publié' : '⏸️ Brouillon'}</p>
          </div>
          <div class="item-actions">
            <button class="btn btn-primary btn-small" onclick="window.editGallery('${gallery.id}')">✎ Éditer</button>
            <button class="btn btn-danger btn-small" onclick="window.deleteGallery('${gallery.id}', '${gallery.title.fr}')">🗑️</button>
          </div>
        </li>
      `).join('')}
    </ul>
  `;
  
  contentArea.innerHTML = html;
}

window.createGallery = function() {
  showGalleryModal(null);
};

window.editGallery = async function(id) {
  const galleryDoc = await getDoc(doc(db, 'galleries', id));
  const gallery = { id, ...galleryDoc.data() };
  
  // Charger les photos
  const photos = await loadGalleryPhotos(db, id);
  gallery.photos = photos;
  
  showGalleryModal(gallery);
};

async function showGalleryModal(gallery) {
  const isEdit = !!gallery;
  
  const modalHTML = `
    <h2>${isEdit ? 'Éditer' : 'Créer'} une galerie</h2>
    <form id="gallery-form">
      <input type="hidden" id="gallery-id" value="${isEdit ? gallery.id : ''}">
      
      <div class="form-row">
        <div class="form-group">
          <label>Titre (FR)</label>
          <input type="text" id="gallery-title-fr" value="${isEdit ? gallery.title.fr : ''}" required>
        </div>
        <div class="form-group">
          <label>Slug FR</label>
          <input type="text" id="gallery-slug-fr" value="${isEdit ? gallery.slug.fr : ''}" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Titre (EN)</label>
          <input type="text" id="gallery-title-en" value="${isEdit ? gallery.title.en : ''}" required>
        </div>
        <div class="form-group">
          <label>Slug EN</label>
          <input type="text" id="gallery-slug-en" value="${isEdit ? gallery.slug.en : ''}" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Titre (AR)</label>
          <input type="text" id="gallery-title-ar" value="${isEdit ? gallery.title.ar : ''}" dir="rtl">
        </div>
        <div class="form-group">
          <label>Slug AR</label>
          <input type="text" id="gallery-slug-ar" value="${isEdit ? gallery.slug.ar : ''}" dir="rtl">
        </div>
      </div>
      
      <div class="form-group">
        <label>Image de couverture (URL Storage)</label>
        <input type="text" id="gallery-cover" value="${isEdit ? gallery.cover_image : ''}" required>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Ordre d'affichage</label>
          <input type="number" id="gallery-order" value="${isEdit ? gallery.order : 1}" required>
        </div>
        <div class="form-group">
          <label>Statut</label>
          <select id="gallery-status">
            <option value="published" ${isEdit && gallery.status === 'published' ? 'selected' : ''}>Publié</option>
            <option value="draft" ${isEdit && gallery.status === 'draft' ? 'selected' : ''}>Brouillon</option>
          </select>
        </div>
      </div>
      
      <h3 style="margin-top: 2rem; margin-bottom: 1rem;">Descriptions</h3>
      
      <div class="lang-tabs">
        <button type="button" class="lang-tab active" onclick="switchLangTab(event, 'desc-fr')">FR</button>
        <button type="button" class="lang-tab" onclick="switchLangTab(event, 'desc-en')">EN</button>
        <button type="button" class="lang-tab" onclick="switchLangTab(event, 'desc-ar')">AR</button>
      </div>
      
      <div id="desc-fr" class="lang-content active">
        <div class="form-group">
          <label>Description courte (FR)</label>
          <textarea id="gallery-desc-short-fr" rows="2">${isEdit ? gallery.description_short.fr : ''}</textarea>
        </div>
        <div class="form-group">
          <label>Description longue (FR)</label>
          <textarea id="gallery-desc-long-fr" rows="4">${isEdit && gallery.description_long ? gallery.description_long.fr : ''}</textarea>
        </div>
      </div>
      
      <div id="desc-en" class="lang-content">
        <div class="form-group">
          <label>Description courte (EN)</label>
          <textarea id="gallery-desc-short-en" rows="2">${isEdit ? gallery.description_short.en : ''}</textarea>
        </div>
        <div class="form-group">
          <label>Description longue (EN)</label>
          <textarea id="gallery-desc-long-en" rows="4">${isEdit && gallery.description_long ? gallery.description_long.en : ''}</textarea>
        </div>
      </div>
      
      <div id="desc-ar" class="lang-content">
        <div class="form-group">
          <label>Description courte (AR)</label>
          <textarea id="gallery-desc-short-ar" rows="2" dir="rtl">${isEdit ? gallery.description_short.ar : ''}</textarea>
        </div>
        <div class="form-group">
          <label>Description longue (AR)</label>
          <textarea id="gallery-desc-long-ar" rows="4" dir="rtl">${isEdit && gallery.description_long ? gallery.description_long.ar : ''}</textarea>
        </div>
      </div>
      
      <h3 style="margin-top: 2rem; margin-bottom: 1rem;">Options</h3>
      
      <div class="form-group">
        <label style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" id="gallery-show-video" ${isEdit && gallery.show_video ? 'checked' : ''}>
          <span>Afficher une vidéo</span>
        </label>
      </div>
      
      <div class="form-group">
        <label>URL vidéo YouTube (embed)</label>
        <input type="url" id="gallery-video-url" value="${isEdit && gallery.video_url ? gallery.video_url : ''}">
      </div>
      
      <div class="form-group">
        <label style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" id="gallery-show-map" ${isEdit && gallery.show_map ? 'checked' : ''}>
          <span>Afficher une carte</span>
        </label>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Latitude</label>
          <input type="text" id="gallery-map-lat" value="${isEdit && gallery.map_location ? gallery.map_location.latitude : ''}">
        </div>
        <div class="form-group">
          <label>Longitude</label>
          <input type="text" id="gallery-map-lng" value="${isEdit && gallery.map_location ? gallery.map_location.longitude : ''}">
        </div>
      </div>
      
      ${renderPhotosSection(isEdit ? gallery.photos : [])}
      
      <button type="submit" class="btn btn-primary">💾 Enregistrer</button>
    </form>
  `;
  
  showModal(modalHTML);
  
  // Init handlers
  const galleryId = isEdit ? gallery.id : `gallery-${Date.now()}`;
  initPhotosHandlers(storage, galleryId);
  
  // Auto-generate slugs
  document.getElementById('gallery-title-fr').addEventListener('input', (e) => {
    const slug = generateSlug(e.target.value);
    document.getElementById('gallery-slug-fr').value = slug;
  });
  
  document.getElementById('gallery-title-en').addEventListener('input', (e) => {
    const slug = generateSlug(e.target.value);
    document.getElementById('gallery-slug-en').value = slug;
  });
  
  // Form submit
  document.getElementById('gallery-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveGallery(galleryId);
  });
}

async function saveGallery(galleryId) {
  const btn = document.querySelector('#gallery-form button[type="submit"]');
  setLoading(btn, true, 'Enregistrement...');
  
  const galleryData = {
    title: {
      fr: document.getElementById('gallery-title-fr').value,
      en: document.getElementById('gallery-title-en').value,
      ar: document.getElementById('gallery-title-ar').value
    },
    slug: {
      fr: document.getElementById('gallery-slug-fr').value,
      en: document.getElementById('gallery-slug-en').value,
      ar: document.getElementById('gallery-slug-ar').value
    },
    description_short: {
      fr: document.getElementById('gallery-desc-short-fr').value,
      en: document.getElementById('gallery-desc-short-en').value,
      ar: document.getElementById('gallery-desc-short-ar').value
    },
    description_long: {
      fr: document.getElementById('gallery-desc-long-fr').value,
      en: document.getElementById('gallery-desc-long-en').value,
      ar: document.getElementById('gallery-desc-long-ar').value
    },
    cover_image: document.getElementById('gallery-cover').value,
    order: parseInt(document.getElementById('gallery-order').value),
    status: document.getElementById('gallery-status').value,
    show_video: document.getElementById('gallery-show-video').checked,
    video_url: document.getElementById('gallery-video-url').value,
    show_map: document.getElementById('gallery-show-map').checked,
    map_location: {
      latitude: document.getElementById('gallery-map-lat').value,
      longitude: document.getElementById('gallery-map-lng').value,
      place_name: { fr: '', en: '', ar: '' }
    },
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  };
  
  // Sauvegarder galerie
  await setDoc(doc(db, 'galleries', galleryId), galleryData, { merge: true });
  
  // Sauvegarder photos
  await saveGalleryPhotos(db, galleryId);
  
  setLoading(btn, false);
  showToast('✅ Galerie enregistrée !');
  hideModal();
  loadGalleries();
}

window.deleteGallery = async function(id, title) {
  if (!confirm(`Supprimer la galerie "${title}" ?`)) return;
  
  await deleteDoc(doc(db, 'galleries', id));
  showToast('✅ Galerie supprimée !');
  loadGalleries();
};

function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ============================================
// EXHIBITIONS - Window functions
// ============================================

window.createExhibition = function() {
  showExhibitionModal(db, null).then(html => {
    showModal(html);
    document.getElementById('exhibition-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const success = await saveExhibition(db);
      if (success) {
        hideModal();
        loadExhibitions(db, contentArea);
      }
    });
  });
};

window.editExhibition = async function(id) {
  const exhibitionDoc = await getDoc(doc(db, 'exhibitions', id));
  const exhibition = { id, ...exhibitionDoc.data() };
  
  const html = await showExhibitionModal(db, exhibition);
  showModal(html);
  document.getElementById('exhibition-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const success = await saveExhibition(db);
    if (success) {
      hideModal();
      loadExhibitions(db, contentArea);
    }
  });
};

window.deleteExhibition = async function(id, title) {
  const success = await deleteExhibition(db, id, title);
  if (success) {
    loadExhibitions(db, contentArea);
  }
};

// ============================================
// PUBLICATIONS - Window functions
// ============================================

window.createPublication = function() {
  showPublicationModal(db, null).then(html => {
    showModal(html);
    document.getElementById('publication-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const success = await savePublication(db);
      if (success) {
        hideModal();
        loadPublications(db, contentArea);
      }
    });
  });
};

window.editPublication = async function(id) {
  const publicationDoc = await getDoc(doc(db, 'publications', id));
  const publication = { id, ...publicationDoc.data() };
  
  const html = await showPublicationModal(db, publication);
  showModal(html);
  document.getElementById('publication-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const success = await savePublication(db);
    if (success) {
      hideModal();
      loadPublications(db, contentArea);
    }
  });
};

window.deletePublication = async function(id, title) {
  const success = await deletePublication(db, id, title);
  if (success) {
    loadPublications(db, contentArea);
  }
};

// ============================================
// COLLABORATIONS - Window functions
// ============================================

window.createCollaboration = function() {
  showCollaborationModal(db, null).then(html => {
    showModal(html);
    document.getElementById('collaboration-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const success = await saveCollaboration(db);
      if (success) {
        hideModal();
        loadCollaborations(db, contentArea);
      }
    });
  });
};

window.editCollaboration = async function(id) {
  const collabDoc = await getDoc(doc(db, 'collaborations', id));
  const collaboration = { id, ...collabDoc.data() };
  
  const html = await showCollaborationModal(db, collaboration);
  showModal(html);
  document.getElementById('collaboration-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const success = await saveCollaboration(db);
    if (success) {
      hideModal();
      loadCollaborations(db, contentArea);
    }
  });
};

window.deleteCollaboration = async function(id, org) {
  const success = await deleteCollaboration(db, id, org);
  if (success) {
    loadCollaborations(db, contentArea);
  }
};

// ============================================
// MODAL
// ============================================

function showModal(content) {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-content');
  
  modalContent.innerHTML = content;
  modal.classList.add('active');
}

window.hideModal = function() {
  document.getElementById('modal').classList.remove('active');
};

// ============================================
// PUBLISH
// ============================================

document.getElementById('publish-btn').addEventListener('click', async () => {
  const btn = document.getElementById('publish-btn');
  setLoading(btn, true, 'Publication...');
  
  // TODO: Trigger Vercel webhook
  // await fetch('VOTRE_WEBHOOK_URL', { method: 'POST' });
  
  await setDoc(doc(db, 'settings', 'global'), {
    last_publish: serverTimestamp()
  }, { merge: true });
  
  setLoading(btn, false);
  showToast('✅ Site publié ! (webhook à configurer)');
});

// Load dashboard au démarrage
loadDashboard();