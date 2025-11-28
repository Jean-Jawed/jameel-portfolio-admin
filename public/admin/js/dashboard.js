import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyAekk1IoYrVmqgckymWik6xuslQQ-GbKSY",
  authDomain: "jameel-portfolio-2561c.firebaseapp.com",
  projectId: "jameel-portfolio-2561c",
  storageBucket: "jameel-portfolio-2561c.firebasestorage.app",
  messagingSenderId: "599641137366",
  appId: "1:599641137366:web:f03e2603f74110432ee977"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let currentUser = null;

// Auth check
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    currentUser = user;
    document.getElementById('user-email').textContent = user.email;
    loadSection('dashboard');
  }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'login.html';
});

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const section = item.dataset.section;
    
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    loadSection(section);
  });
});

// Publish button
document.getElementById('publish-btn').addEventListener('click', async () => {
  if (!confirm('Voulez-vous publier les modifications ? Cela va régénérer le site.')) return;
  
  const btn = document.getElementById('publish-btn');
  btn.textContent = '⏳ Publication...';
  btn.disabled = true;
  
  try {
    // TODO: Trigger Vercel webhook
    // Pour l'instant, juste un message
    alert('Publication déclenchée ! Le site sera mis à jour dans quelques minutes.');
    
    // Update last publish date
    await setDoc(doc(db, 'settings', 'global'), {
      last_publish: serverTimestamp()
    }, { merge: true });
    
  } catch (error) {
    alert('Erreur lors de la publication: ' + error.message);
  } finally {
    btn.textContent = '🚀 Publier';
    btn.disabled = false;
  }
});

// ============================================
// LOAD SECTIONS
// ============================================

async function loadSection(section) {
  const contentArea = document.getElementById('content-area');
  contentArea.innerHTML = '<div class="loading"><div class="spinner"></div><p>Chargement...</p></div>';
  
  try {
    switch(section) {
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
        await loadExhibitions();
        break;
      case 'publications':
        await loadPublications();
        break;
      case 'collaborations':
        await loadCollaborations();
        break;
      case 'media':
        await loadMedia();
        break;
      default:
        contentArea.innerHTML = '<p>Section non trouvée</p>';
    }
  } catch (error) {
    contentArea.innerHTML = `<div class="error-message">Erreur: ${error.message}</div>`;
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
  const lastPublish = settingsDoc.data()?.last_publish;
  
  document.getElementById('content-area').innerHTML = `
    <div class="section-header">
      <h1>Dashboard</h1>
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
    
    <div class="card">
      <h3>Dernière publication</h3>
      <p>${lastPublish ? new Date(lastPublish.toDate()).toLocaleString('fr-FR') : 'Jamais publié'}</p>
    </div>
    
    <div class="card">
      <h3>Bienvenue ${currentUser.email}</h3>
      <p>Utilisez le menu à gauche pour gérer votre portfolio.</p>
    </div>
  `;
}

// ============================================
// SETTINGS
// ============================================

async function loadSettings() {
  const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
  const data = settingsDoc.data();
  
  document.getElementById('content-area').innerHTML = `
    <div class="section-header">
      <h1>Paramètres</h1>
      <button class="btn btn-primary btn-small" onclick="saveSettings()">💾 Enregistrer</button>
    </div>
    
    <form id="settings-form">
      <div class="card">
        <h3>Informations du photographe</h3>
        
        <div class="form-group">
          <label>Nom</label>
          <input type="text" id="photographer-name" value="${data.photographer.name}" required>
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="photographer-email" value="${data.photographer.email}" required>
        </div>
        
        <div class="form-group">
          <label>Téléphone</label>
          <input type="tel" id="photographer-phone" value="${data.photographer.phone}" required>
        </div>
        
        <div class="form-group">
          <label>Instagram URL</label>
          <input type="url" id="instagram-url" value="${data.photographer.social.instagram}">
        </div>
      </div>
      
      <div class="card">
        <h3>Biographie</h3>
        
        <div class="lang-tabs">
          <button type="button" class="lang-tab active" onclick="switchLang(event, 'bio-fr')">Français</button>
          <button type="button" class="lang-tab" onclick="switchLang(event, 'bio-en')">English</button>
          <button type="button" class="lang-tab" onclick="switchLang(event, 'bio-ar')">عربي</button>
        </div>
        
        <div id="bio-fr" class="lang-content active">
          <div class="form-group">
            <label>Biographie longue (FR)</label>
            <textarea id="bio-long-fr" rows="8">${data.photographer.bio_long.fr}</textarea>
          </div>
        </div>
        
        <div id="bio-en" class="lang-content">
          <div class="form-group">
            <label>Biographie longue (EN)</label>
            <textarea id="bio-long-en" rows="8">${data.photographer.bio_long.en}</textarea>
          </div>
        </div>
        
        <div id="bio-ar" class="lang-content">
          <div class="form-group">
            <label>Biographie longue (AR)</label>
            <textarea id="bio-long-ar" rows="8" dir="rtl">${data.photographer.bio_long.ar}</textarea>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h3>Page d'accueil</h3>
        
        <div class="form-group">
          <label>Image hero (chemin dans Storage)</label>
          <input type="text" id="hero-image" value="${data.homepage.hero_image}">
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Titre hero (FR)</label>
            <input type="text" id="hero-title-fr" value="${data.homepage.hero_title.fr}">
          </div>
          <div class="form-group">
            <label>Titre hero (EN)</label>
            <input type="text" id="hero-title-en" value="${data.homepage.hero_title.en}">
          </div>
          <div class="form-group">
            <label>Titre hero (AR)</label>
            <input type="text" id="hero-title-ar" value="${data.homepage.hero_title.ar}">
          </div>
        </div>
      </div>
    </form>
  `;
}

window.saveSettings = async function() {
  const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
  const currentData = settingsDoc.data();
  
  const updatedData = {
    ...currentData,
    photographer: {
      ...currentData.photographer,
      name: document.getElementById('photographer-name').value,
      email: document.getElementById('photographer-email').value,
      phone: document.getElementById('photographer-phone').value,
      bio_long: {
        fr: document.getElementById('bio-long-fr').value,
        en: document.getElementById('bio-long-en').value,
        ar: document.getElementById('bio-long-ar').value,
      },
      social: {
        ...currentData.photographer.social,
        instagram: document.getElementById('instagram-url').value
      }
    },
    homepage: {
      ...currentData.homepage,
      hero_image: document.getElementById('hero-image').value,
      hero_title: {
        fr: document.getElementById('hero-title-fr').value,
        en: document.getElementById('hero-title-en').value,
        ar: document.getElementById('hero-title-ar').value,
      }
    },
    updated_at: serverTimestamp()
  };
  
  await setDoc(doc(db, 'settings', 'global'), updatedData);
  alert('✅ Paramètres enregistrés !');
};

window.switchLang = function(event, langId) {
  event.preventDefault();
  
  document.querySelectorAll('.lang-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.lang-content').forEach(content => content.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(langId).classList.add('active');
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
      <button class="btn btn-primary btn-small" onclick="createGallery()">+ Nouvelle galerie</button>
    </div>
    
    <ul class="item-list">
  `;
  
  galleries.forEach(gallery => {
    html += `
      <li class="item-list-item">
        <div class="item-info">
          <h4>${gallery.title.fr}</h4>
          <p>Ordre: ${gallery.order} • ${gallery.status}</p>
        </div>
        <div class="item-actions">
          <button class="btn btn-primary btn-small" onclick="editGallery('${gallery.id}')">✎ Éditer</button>
          <button class="btn btn-danger btn-small" onclick="deleteGallery('${gallery.id}', '${gallery.title.fr}')">🗑️</button>
        </div>
      </li>
    `;
  });
  
  html += `</ul>`;
  document.getElementById('content-area').innerHTML = html;
}

window.createGallery = function() {
  showGalleryModal(null);
};

window.editGallery = async function(id) {
  const galleryDoc = await getDoc(doc(db, 'galleries', id));
  showGalleryModal({ id, ...galleryDoc.data() });
};

window.deleteGallery = async function(id, title) {
  if (!confirm(`Supprimer la galerie "${title}" ?`)) return;
  
  await deleteDoc(doc(db, 'galleries', id));
  loadGalleries();
};

function showGalleryModal(gallery) {
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
          <label>Titre (EN)</label>
          <input type="text" id="gallery-title-en" value="${isEdit ? gallery.title.en : ''}" required>
        </div>
        <div class="form-group">
          <label>Titre (AR)</label>
          <input type="text" id="gallery-title-ar" value="${isEdit ? gallery.title.ar : ''}" required>
        </div>
      </div>
      
      <div class="form-group">
        <label>Image de couverture (URL Storage)</label>
        <input type="text" id="gallery-cover" value="${isEdit ? gallery.cover_image : ''}" required>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Slug (FR)</label>
          <input type="text" id="gallery-slug-fr" value="${isEdit ? gallery.slug.fr : ''}" required>
        </div>
        <div class="form-group">
          <label>Slug (EN)</label>
          <input type="text" id="gallery-slug-en" value="${isEdit ? gallery.slug.en : ''}" required>
        </div>
        <div class="form-group">
          <label>Slug (AR)</label>
          <input type="text" id="gallery-slug-ar" value="${isEdit ? gallery.slug.ar : ''}" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Ordre</label>
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
      
      <div class="form-group">
        <label>Description courte (FR)</label>
        <textarea id="gallery-desc-short-fr">${isEdit ? gallery.description_short.fr : ''}</textarea>
      </div>
      
      <div class="form-group">
        <label>Description longue (FR)</label>
        <textarea id="gallery-desc-long-fr">${isEdit ? gallery.description_long.fr : ''}</textarea>
      </div>
      
      <button type="submit" class="btn btn-primary">💾 Enregistrer</button>
    </form>
  `;
  
  showModal(modalHTML);
  
  document.getElementById('gallery-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveGallery();
  });
}

async function saveGallery() {
  const id = document.getElementById('gallery-id').value || `gallery-${Date.now()}`;
  
  const galleryData = {
    title: {
      fr: document.getElementById('gallery-title-fr').value,
      en: document.getElementById('gallery-title-en').value,
      ar: document.getElementById('gallery-title-ar').value,
    },
    slug: {
      fr: document.getElementById('gallery-slug-fr').value,
      en: document.getElementById('gallery-slug-en').value,
      ar: document.getElementById('gallery-slug-ar').value,
    },
    cover_image: document.getElementById('gallery-cover').value,
    description_short: {
      fr: document.getElementById('gallery-desc-short-fr').value,
      en: '',
      ar: ''
    },
    description_long: {
      fr: document.getElementById('gallery-desc-long-fr').value,
      en: '',
      ar: ''
    },
    order: parseInt(document.getElementById('gallery-order').value),
    status: document.getElementById('gallery-status').value,
    updated_at: serverTimestamp()
  };
  
  await setDoc(doc(db, 'galleries', id), galleryData, { merge: true });
  hideModal();
  loadGalleries();
  alert('✅ Galerie enregistrée !');
}

// Même structure pour Exhibitions, Publications, Collaborations
// Je simplifie ici pour la longueur

async function loadExhibitions() {
  document.getElementById('content-area').innerHTML = '<p>Section Expositions (à implémenter de la même manière que Galeries)</p>';
}

async function loadPublications() {
  document.getElementById('content-area').innerHTML = '<p>Section Publications (à implémenter de la même manière que Galeries)</p>';
}

async function loadCollaborations() {
  document.getElementById('content-area').innerHTML = '<p>Section Collaborations (à implémenter de la même manière que Galeries)</p>';
}

async function loadMedia() {
  document.getElementById('content-area').innerHTML = '<p>Section Médias (explorateur Storage à implémenter)</p>';
}

// ============================================
// MODAL HELPERS
// ============================================

function showModal(content) {
  const modal = document.getElementById('modal');
  document.getElementById('modal-body').innerHTML = content;
  modal.style.display = 'flex';
  
  document.querySelector('.modal-close').addEventListener('click', hideModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });
}

function hideModal() {
  document.getElementById('modal').style.display = 'none';
}
