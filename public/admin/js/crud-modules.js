/**
 * CRUD COMPLET - Exhibitions, Publications, Collaborations
 */

import { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ============================================
// EXHIBITIONS
// ============================================

export async function loadExhibitions(db, contentArea) {
  const exhibitionsSnap = await getDocs(collection(db, 'exhibitions'));
  const exhibitions = exhibitionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  exhibitions.sort((a, b) => a.order - b.order);
  
  const past = exhibitions.filter(e => e.type === 'past');
  const upcoming = exhibitions.filter(e => e.type === 'upcoming');
  
  let html = `
    <div class="section-header">
      <h1>Expositions</h1>
      <button class="btn btn-primary btn-small" onclick="window.createExhibition()">+ Nouvelle exposition</button>
    </div>
    
    <h2 style="margin-top: 2rem; margin-bottom: 1rem;">À venir (${upcoming.length})</h2>
    <ul class="item-list">
      ${upcoming.map(expo => renderExhibitionItem(expo)).join('')}
    </ul>
    
    <h2 style="margin-top: 2rem; margin-bottom: 1rem;">Passées (${past.length})</h2>
    <ul class="item-list">
      ${past.map(expo => renderExhibitionItem(expo)).join('')}
    </ul>
  `;
  
  contentArea.innerHTML = html;
}

function renderExhibitionItem(expo) {
  return `
    <li class="item-list-item">
      <div class="item-info">
        <h4>${expo.title.fr}</h4>
        <p>${expo.location.fr} • ${expo.year} • Ordre: ${expo.order}</p>
      </div>
      <div class="item-actions">
        <button class="btn btn-primary btn-small" onclick="window.editExhibition('${expo.id}')">✎ Éditer</button>
        <button class="btn btn-danger btn-small" onclick="window.deleteExhibition('${expo.id}', '${expo.title.fr}')">🗑️</button>
      </div>
    </li>
  `;
}

export async function showExhibitionModal(db, exhibition) {
  const isEdit = !!exhibition;
  
  const modalHTML = `
    <h2>${isEdit ? 'Éditer' : 'Créer'} une exposition</h2>
    <form id="exhibition-form">
      <input type="hidden" id="exhibition-id" value="${isEdit ? exhibition.id : ''}">
      
      <div class="form-row">
        <div class="form-group">
          <label>Type</label>
          <select id="exhibition-type">
            <option value="upcoming" ${isEdit && exhibition.type === 'upcoming' ? 'selected' : ''}>À venir</option>
            <option value="past" ${isEdit && exhibition.type === 'past' ? 'selected' : ''}>Passée</option>
          </select>
        </div>
        <div class="form-group">
          <label>Année</label>
          <input type="text" id="exhibition-year" value="${isEdit ? exhibition.year : ''}" required>
        </div>
        <div class="form-group">
          <label>Ordre d'affichage</label>
          <input type="number" id="exhibition-order" value="${isEdit ? exhibition.order : 1}" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Titre (FR)</label>
          <input type="text" id="exhibition-title-fr" value="${isEdit ? exhibition.title.fr : ''}" required>
        </div>
        <div class="form-group">
          <label>Titre (EN)</label>
          <input type="text" id="exhibition-title-en" value="${isEdit ? exhibition.title.en : ''}" required>
        </div>
        <div class="form-group">
          <label>Titre (AR)</label>
          <input type="text" id="exhibition-title-ar" value="${isEdit ? exhibition.title.ar : ''}" dir="rtl">
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Lieu (FR)</label>
          <input type="text" id="exhibition-location-fr" value="${isEdit ? exhibition.location.fr : ''}" required>
        </div>
        <div class="form-group">
          <label>Lieu (EN)</label>
          <input type="text" id="exhibition-location-en" value="${isEdit ? exhibition.location.en : ''}" required>
        </div>
        <div class="form-group">
          <label>Lieu (AR)</label>
          <input type="text" id="exhibition-location-ar" value="${isEdit ? exhibition.location.ar : ''}" dir="rtl">
        </div>
      </div>
      
      <div class="form-group">
        <label>Description (FR)</label>
        <textarea id="exhibition-description-fr" rows="3">${isEdit ? exhibition.description.fr : ''}</textarea>
      </div>
      
      <div class="form-group">
        <label>Description (EN)</label>
        <textarea id="exhibition-description-en" rows="3">${isEdit ? exhibition.description.en : ''}</textarea>
      </div>
      
      <div class="form-group">
        <label>Description (AR)</label>
        <textarea id="exhibition-description-ar" rows="3" dir="rtl">${isEdit ? exhibition.description.ar : ''}</textarea>
      </div>
      
      <div class="form-group">
        <label>Image (URL Storage)</label>
        <input type="text" id="exhibition-image" value="${isEdit ? exhibition.image : ''}" required>
        <small style="color: #6c757d;">Utilisez le navigateur de médias pour copier l'URL</small>
      </div>
      
      <button type="submit" class="btn btn-primary">💾 Enregistrer</button>
    </form>
  `;
  
  return modalHTML;
}

export async function saveExhibition(db) {
  const id = document.getElementById('exhibition-id').value || `exhibition-${Date.now()}`;
  
  const exhibitionData = {
    type: document.getElementById('exhibition-type').value,
    title: {
      fr: document.getElementById('exhibition-title-fr').value,
      en: document.getElementById('exhibition-title-en').value,
      ar: document.getElementById('exhibition-title-ar').value
    },
    location: {
      fr: document.getElementById('exhibition-location-fr').value,
      en: document.getElementById('exhibition-location-en').value,
      ar: document.getElementById('exhibition-location-ar').value
    },
    year: document.getElementById('exhibition-year').value,
    description: {
      fr: document.getElementById('exhibition-description-fr').value,
      en: document.getElementById('exhibition-description-en').value,
      ar: document.getElementById('exhibition-description-ar').value
    },
    image: document.getElementById('exhibition-image').value,
    order: parseInt(document.getElementById('exhibition-order').value),
    created_at: serverTimestamp()
  };
  
  await setDoc(doc(db, 'exhibitions', id), exhibitionData, { merge: true });
  showToast('✅ Exposition enregistrée !');
  
  return true;
}

export async function deleteExhibition(db, id, title) {
  if (!confirm(`Supprimer l'exposition "${title}" ?`)) return false;
  
  await deleteDoc(doc(db, 'exhibitions', id));
  showToast('✅ Exposition supprimée !');
  
  return true;
}

// ============================================
// PUBLICATIONS
// ============================================

export async function loadPublications(db, contentArea) {
  const publicationsSnap = await getDocs(collection(db, 'publications'));
  const publications = publicationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  publications.sort((a, b) => a.order - b.order);
  
  let html = `
    <div class="section-header">
      <h1>Publications</h1>
      <button class="btn btn-primary btn-small" onclick="window.createPublication()">+ Nouvelle publication</button>
    </div>
    
    <ul class="item-list">
      ${publications.map(pub => `
        <li class="item-list-item">
          <div class="item-info">
            <h4>${pub.title.fr}</h4>
            <p>${pub.publisher} • ${pub.year} • Ordre: ${pub.order}</p>
          </div>
          <div class="item-actions">
            <button class="btn btn-primary btn-small" onclick="window.editPublication('${pub.id}')">✎ Éditer</button>
            <button class="btn btn-danger btn-small" onclick="window.deletePublication('${pub.id}', '${pub.title.fr}')">🗑️</button>
          </div>
        </li>
      `).join('')}
    </ul>
  `;
  
  contentArea.innerHTML = html;
}

export async function showPublicationModal(db, publication) {
  const isEdit = !!publication;
  
  const modalHTML = `
    <h2>${isEdit ? 'Éditer' : 'Créer'} une publication</h2>
    <form id="publication-form">
      <input type="hidden" id="publication-id" value="${isEdit ? publication.id : ''}">
      
      <div class="form-row">
        <div class="form-group">
          <label>Éditeur/Média</label>
          <input type="text" id="publication-publisher" value="${isEdit ? publication.publisher : ''}" required>
        </div>
        <div class="form-group">
          <label>Année</label>
          <input type="text" id="publication-year" value="${isEdit ? publication.year : ''}" required>
        </div>
        <div class="form-group">
          <label>Ordre</label>
          <input type="number" id="publication-order" value="${isEdit ? publication.order : 1}" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Titre (FR)</label>
          <input type="text" id="publication-title-fr" value="${isEdit ? publication.title.fr : ''}" required>
        </div>
        <div class="form-group">
          <label>Titre (EN)</label>
          <input type="text" id="publication-title-en" value="${isEdit ? publication.title.en : ''}" required>
        </div>
        <div class="form-group">
          <label>Titre (AR)</label>
          <input type="text" id="publication-title-ar" value="${isEdit ? publication.title.ar : ''}" dir="rtl">
        </div>
      </div>
      
      <div class="form-group">
        <label>Description (FR)</label>
        <textarea id="publication-description-fr" rows="3">${isEdit ? publication.description.fr : ''}</textarea>
      </div>
      
      <div class="form-group">
        <label>Description (EN)</label>
        <textarea id="publication-description-en" rows="3">${isEdit ? publication.description.en : ''}</textarea>
      </div>
      
      <div class="form-group">
        <label>Description (AR)</label>
        <textarea id="publication-description-ar" rows="3" dir="rtl">${isEdit ? publication.description.ar : ''}</textarea>
      </div>
      
      <div class="form-group">
        <label>Image couverture (URL Storage)</label>
        <input type="text" id="publication-cover" value="${isEdit ? publication.cover_image : ''}" required>
      </div>
      
      <div class="form-group">
        <label>Lien externe</label>
        <input type="url" id="publication-url" value="${isEdit ? publication.external_url : ''}" required>
      </div>
      
      <button type="submit" class="btn btn-primary">💾 Enregistrer</button>
    </form>
  `;
  
  return modalHTML;
}

export async function savePublication(db) {
  const id = document.getElementById('publication-id').value || `publication-${Date.now()}`;
  
  const publicationData = {
    title: {
      fr: document.getElementById('publication-title-fr').value,
      en: document.getElementById('publication-title-en').value,
      ar: document.getElementById('publication-title-ar').value
    },
    publisher: document.getElementById('publication-publisher').value,
    year: document.getElementById('publication-year').value,
    description: {
      fr: document.getElementById('publication-description-fr').value,
      en: document.getElementById('publication-description-en').value,
      ar: document.getElementById('publication-description-ar').value
    },
    cover_image: document.getElementById('publication-cover').value,
    external_url: document.getElementById('publication-url').value,
    order: parseInt(document.getElementById('publication-order').value),
    created_at: serverTimestamp()
  };
  
  await setDoc(doc(db, 'publications', id), publicationData, { merge: true });
  showToast('✅ Publication enregistrée !');
  
  return true;
}

export async function deletePublication(db, id, title) {
  if (!confirm(`Supprimer la publication "${title}" ?`)) return false;
  
  await deleteDoc(doc(db, 'publications', id));
  showToast('✅ Publication supprimée !');
  
  return true;
}

// ============================================
// COLLABORATIONS
// ============================================

export async function loadCollaborations(db, contentArea) {
  const collabsSnap = await getDocs(collection(db, 'collaborations'));
  const collaborations = collabsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  collaborations.sort((a, b) => a.order - b.order);
  
  let html = `
    <div class="section-header">
      <h1>Collaborations</h1>
      <button class="btn btn-primary btn-small" onclick="window.createCollaboration()">+ Nouvelle collaboration</button>
    </div>
    
    <ul class="item-list">
      ${collaborations.map(collab => `
        <li class="item-list-item">
          <div class="item-info">
            <h4>${collab.organization}</h4>
            <p>${collab.role.fr} • Ordre: ${collab.order}</p>
          </div>
          <div class="item-actions">
            <button class="btn btn-primary btn-small" onclick="window.editCollaboration('${collab.id}')">✎ Éditer</button>
            <button class="btn btn-danger btn-small" onclick="window.deleteCollaboration('${collab.id}', '${collab.organization}')">🗑️</button>
          </div>
        </li>
      `).join('')}
    </ul>
  `;
  
  contentArea.innerHTML = html;
}

export async function showCollaborationModal(db, collaboration) {
  const isEdit = !!collaboration;
  
  const modalHTML = `
    <h2>${isEdit ? 'Éditer' : 'Créer'} une collaboration</h2>
    <form id="collaboration-form">
      <input type="hidden" id="collaboration-id" value="${isEdit ? collaboration.id : ''}">
      
      <div class="form-row">
        <div class="form-group">
          <label>Organisation</label>
          <input type="text" id="collaboration-org" value="${isEdit ? collaboration.organization : ''}" required>
        </div>
        <div class="form-group">
          <label>Ordre</label>
          <input type="number" id="collaboration-order" value="${isEdit ? collaboration.order : 1}" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Rôle (FR)</label>
          <input type="text" id="collaboration-role-fr" value="${isEdit ? collaboration.role.fr : ''}" required>
        </div>
        <div class="form-group">
          <label>Rôle (EN)</label>
          <input type="text" id="collaboration-role-en" value="${isEdit ? collaboration.role.en : ''}" required>
        </div>
        <div class="form-group">
          <label>Rôle (AR)</label>
          <input type="text" id="collaboration-role-ar" value="${isEdit ? collaboration.role.ar : ''}" dir="rtl">
        </div>
      </div>
      
      <div class="form-group">
        <label>Description (FR)</label>
        <textarea id="collaboration-description-fr" rows="3">${isEdit ? collaboration.description.fr : ''}</textarea>
      </div>
      
      <div class="form-group">
        <label>Description (EN)</label>
        <textarea id="collaboration-description-en" rows="3">${isEdit ? collaboration.description.en : ''}</textarea>
      </div>
      
      <div class="form-group">
        <label>Description (AR)</label>
        <textarea id="collaboration-description-ar" rows="3" dir="rtl">${isEdit ? collaboration.description.ar : ''}</textarea>
      </div>
      
      <div class="form-group">
        <label>Logo (URL Storage)</label>
        <input type="text" id="collaboration-logo" value="${isEdit ? collaboration.logo_image : ''}" required>
      </div>
      
      <button type="submit" class="btn btn-primary">💾 Enregistrer</button>
    </form>
  `;
  
  return modalHTML;
}

export async function saveCollaboration(db) {
  const id = document.getElementById('collaboration-id').value || `collaboration-${Date.now()}`;
  
  const collaborationData = {
    organization: document.getElementById('collaboration-org').value,
    role: {
      fr: document.getElementById('collaboration-role-fr').value,
      en: document.getElementById('collaboration-role-en').value,
      ar: document.getElementById('collaboration-role-ar').value
    },
    description: {
      fr: document.getElementById('collaboration-description-fr').value,
      en: document.getElementById('collaboration-description-en').value,
      ar: document.getElementById('collaboration-description-ar').value
    },
    logo_image: document.getElementById('collaboration-logo').value,
    order: parseInt(document.getElementById('collaboration-order').value),
    created_at: serverTimestamp()
  };
  
  await setDoc(doc(db, 'collaborations', id), collaborationData, { merge: true });
  showToast('✅ Collaboration enregistrée !');
  
  return true;
}

export async function deleteCollaboration(db, id, org) {
  if (!confirm(`Supprimer la collaboration avec "${org}" ?`)) return false;
  
  await deleteDoc(doc(db, 'collaborations', id));
  showToast('✅ Collaboration supprimée !');
  
  return true;
}
