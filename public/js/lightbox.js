/**
 * LIGHTBOX - Visualiseur plein écran pour galeries
 * Utilise Swiper pour navigation
 */

let lightboxSwiper = null;
let galleryPhotos = [];

/**
 * Initialiser la lightbox avec les photos de la galerie
 */
function initLightbox() {
  // Récupérer toutes les photos de la galerie
  const photoElements = document.querySelectorAll('.gallery-image-item img');
  galleryPhotos = Array.from(photoElements).map((img, index) => ({
    src: img.src,
    alt: img.alt,
    caption: img.nextElementSibling?.textContent || '',
    index: index
  }));
  
  // Ajouter event listeners sur chaque image
  photoElements.forEach((img, index) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => openLightbox(index));
  });
  
  // Event listener clavier
  document.addEventListener('keydown', handleKeyboard);
}

/**
 * Ouvrir la lightbox à un index spécifique
 */
function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  
  // Construire les slides
  const slidesHTML = galleryPhotos.map(photo => `
    <div class="swiper-slide">
      <div class="lightbox-image-container">
        <img src="${photo.src}" alt="${photo.alt}">
      </div>
    </div>
  `).join('');
  
  // Injecter dans le wrapper
  const wrapper = lightbox.querySelector('.swiper-wrapper');
  wrapper.innerHTML = slidesHTML;
  
  // Afficher la lightbox
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // Bloquer scroll page
  
  // Initialiser Swiper
  lightboxSwiper = new Swiper('.lightbox-swiper', {
    initialSlide: index,
    loop: false,
    keyboard: {
      enabled: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    on: {
      slideChange: function() {
        updateLightboxInfo(this.activeIndex);
      }
    }
  });
  
  // Afficher info initiale
  updateLightboxInfo(index);
}

/**
 * Fermer la lightbox
 */
function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  
  lightbox.classList.remove('active');
  document.body.style.overflow = ''; // Restaurer scroll
  
  // Détruire Swiper
  if (lightboxSwiper) {
    lightboxSwiper.destroy(true, true);
    lightboxSwiper = null;
  }
}

/**
 * Mettre à jour compteur et légende
 */
function updateLightboxInfo(index) {
  const photo = galleryPhotos[index];
  if (!photo) return;
  
  // Compteur
  const counter = document.querySelector('.lightbox-counter');
  if (counter) {
    counter.textContent = `${index + 1} / ${galleryPhotos.length}`;
  }
  
  // Légende
  const caption = document.querySelector('.lightbox-caption');
  if (caption) {
    caption.textContent = photo.caption || '';
  }
}

/**
 * Gestion clavier
 */
function handleKeyboard(e) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || !lightbox.classList.contains('active')) return;
  
  switch(e.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      if (lightboxSwiper) lightboxSwiper.slidePrev();
      break;
    case 'ArrowRight':
      if (lightboxSwiper) lightboxSwiper.slideNext();
      break;
  }
}

// Initialiser au chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLightbox);
} else {
  initLightbox();
}
