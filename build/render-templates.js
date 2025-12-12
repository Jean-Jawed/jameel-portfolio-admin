const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '../src/templates');
const PARTIALS_DIR = path.join(__dirname, '../src/partials');
const TRANSLATIONS_FILE = path.join(__dirname, '../src/data/translations.json');

// Charger les traductions
const translations = JSON.parse(fs.readFileSync(TRANSLATIONS_FILE, 'utf8'));

function t(key, lang) {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
        value = value[k];
        if (!value) return key; // Fallback si clé inexistante
    }
    return value[lang] || value['fr']; // Fallback FR si langue manquante
}

function getLangLinks(currentLang, pageName, gallerySlug = null) {
    const langs = ['fr', 'en', 'ar'];
    const links = {};
    
    if (gallerySlug) {
        // Page détail galerie - utiliser les slugs multilingues
        langs.forEach(lang => {
            links[lang] = `../../${lang}/galeries/${gallerySlug[lang]}.html`;
        });
    } else if (pageName === 'index') {
        // Page d'accueil
        langs.forEach(lang => {
            links[lang] = `../${lang}/`;
        });
    } else {
        // Pages normales
        const pageNames = {
            'galeries': { fr: 'galeries', en: 'galeries', ar: 'galeries' },
            'a-propos': { fr: 'a-propos', en: 'a-propos', ar: 'a-propos' },
            'contact': { fr: 'contact', en: 'contact', ar: 'contact' }
        };
        
        langs.forEach(lang => {
            const page = pageNames[pageName] ? pageNames[pageName][lang] : pageName;
            links[lang] = `../${lang}/${page}.html`;
        });
    }
    
    return links;
}

function renderTemplates(data, distDir) {
    const languages = ['fr', 'en', 'ar'];

    // Charger les partials
    const header = fs.readFileSync(path.join(PARTIALS_DIR, 'header.html'), 'utf8');
    const footer = fs.readFileSync(path.join(PARTIALS_DIR, 'footer.html'), 'utf8');
    const mobileMenu = fs.readFileSync(path.join(PARTIALS_DIR, 'mobile-menu.html'), 'utf8');

    languages.forEach(lang => {
        const langDir = path.join(distDir, lang);
        fs.mkdirSync(langDir, { recursive: true });
        fs.mkdirSync(path.join(langDir, 'galeries'), { recursive: true });

        // Page d'accueil
        renderHome(lang, data, langDir, { header, footer, mobileMenu });

        // Page galeries
        renderGalleries(lang, data, langDir, { header, footer, mobileMenu });

        // Pages détail galeries
        data.galleries.forEach(gallery => {
            renderGalleryDetail(lang, gallery, data, langDir, { header, footer, mobileMenu });
        });

        // Page à propos
        renderAbout(lang, data, langDir, { header, footer, mobileMenu });

        // Page contact
        renderContact(lang, data, langDir, { header, footer, mobileMenu });
    });
}

function renderHome(lang, data, langDir, partials) {
    let html = fs.readFileSync(path.join(TEMPLATES_DIR, 'home.html'), 'utf8');

    // Remplacer les partials
    html = html.replace('{{HEADER}}', partials.header);
    html = html.replace('{{FOOTER}}', partials.footer);
    html = html.replace('{{MOBILE_MENU}}', partials.mobileMenu);

    // Variables globales
    html = replaceLangVars(html, lang, data, 'index');

    // Hero
    html = html.replace(/\{\{HERO_IMAGE\}\}/g, data.settings.homepage.hero_image);
    html = html.replace(/\{\{HERO_TITLE\}\}/g, data.settings.homepage.hero_title[lang]);
    html = html.replace(/\{\{HERO_SUBTITLE\}\}/g, data.settings.homepage.hero_subtitle[lang]);
    html = html.replace(/\{\{HERO_CTA\}\}/g, data.settings.homepage.hero_cta[lang]);

    // Carrousel
    let carouselHTML = '';
    data.settings.homepage.carousel.forEach(item => {
        carouselHTML += `
          <div class="swiper-slide">
            <img src="/${item.image}" alt="${item.caption?.[lang] || ''}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>`;
    });
    html = html.replace('{{CAROUSEL_SLIDES}}', carouselHTML);

    // Galeries mises en avant
    let featuredHTML = '';
    const featuredIds = data.settings.homepage.featured_galleries;
    const featuredGalleries = data.galleries.filter(g => featuredIds.includes(g.id));
    
    featuredGalleries.forEach(gallery => {
        featuredHTML += `
        <a href="galeries/${gallery.slug[lang]}.html" class="gallery-card">
          <div class="gallery-card-image">
            <img src="/${gallery.cover_image}" alt="${gallery.title[lang]}">
          </div>
          <div class="gallery-card-overlay">
            <h3 class="gallery-card-title">${gallery.title[lang]}</h3>
            <p class="gallery-card-description">${gallery.description_short[lang]}</p>
            <span class="gallery-card-link">${t('gallery.view_gallery', lang)} →</span>
          </div>
        </a>`;
    });
    html = html.replace('{{FEATURED_GALLERIES}}', featuredHTML);

    fs.writeFileSync(path.join(langDir, 'index.html'), html);
}

function renderGalleries(lang, data, langDir, partials) {
    let html = fs.readFileSync(path.join(TEMPLATES_DIR, 'galleries.html'), 'utf8');

    html = html.replace('{{HEADER}}', partials.header);
    html = html.replace('{{FOOTER}}', partials.footer);
    html = html.replace('{{MOBILE_MENU}}', partials.mobileMenu);
    html = replaceLangVars(html, lang, data, 'galeries');

    let galleriesHTML = '';
    data.galleries.forEach(gallery => {
        galleriesHTML += `
        <a href="galeries/${gallery.slug[lang]}.html" class="gallery-card">
          <div class="gallery-card-image">
            <img src="/${gallery.cover_image}" alt="${gallery.title[lang]}">
          </div>
          <div class="gallery-card-overlay">
            <h3 class="gallery-card-title">${gallery.title[lang]}</h3>
            <p class="gallery-card-description">${gallery.description_short[lang]}</p>
            <span class="gallery-card-link">${t('gallery.view_gallery', lang)} →</span>
          </div>
        </a>`;
    });
    html = html.replace('{{GALLERIES_LIST}}', galleriesHTML);

    fs.writeFileSync(path.join(langDir, 'galeries.html'), html);
}

function renderGalleryDetail(lang, gallery, data, langDir, partials) {
    let html = fs.readFileSync(path.join(TEMPLATES_DIR, 'gallery-detail.html'), 'utf8');

    html = html.replace('{{HEADER}}', partials.header);
    html = html.replace('{{FOOTER}}', partials.footer);
    html = html.replace('{{MOBILE_MENU}}', partials.mobileMenu);
    html = replaceLangVars(html, lang, data, 'gallery-detail', gallery.slug);

    html = html.replace(/\{\{GALLERY_TITLE\}\}/g, gallery.title[lang]);
    html = html.replace(/\{\{GALLERY_COVER\}\}/g, gallery.cover_image);
    html = html.replace(/\{\{GALLERY_DESCRIPTION\}\}/g, gallery.description_long?.[lang] || gallery.description_short[lang]);

    // Photos
    let photosHTML = '';
    if (gallery.photos && gallery.photos.length > 0) {
        gallery.photos.forEach(photo => {
            photosHTML += `
            <figure class="gallery-image-item">
              <img src="/${photo.image_url}" alt="${photo.caption?.[lang] || ''}">
              <figcaption class="gallery-image-caption">${photo.caption?.[lang] || ''}</figcaption>
            </figure>`;
        });
    }
    html = html.replace('{{GALLERY_PHOTOS}}', photosHTML);

    // Vidéo si présente ET show_video = true
    let videoHTML = '';
    if (gallery.show_video && gallery.video_url) {
        videoHTML = `
        <div style="margin-top: 4rem;">
          <h3 style="font-size: 1.5rem; margin-bottom: 1.5rem;">${t('gallery.documentary', lang)}</h3>
          <div class="video-container">
            <iframe src="${gallery.video_url}" allowfullscreen></iframe>
          </div>
        </div>`;
    }
    html = html.replace('{{GALLERY_VIDEO}}', videoHTML);

    // Map si présente ET show_map = true
    let mapHTML = '';
    if (gallery.show_map && gallery.map_location && gallery.map_location.latitude) {
        const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d${gallery.map_location.latitude}!2d${gallery.map_location.longitude}`;
        mapHTML = `
        <div style="margin-top: 4rem;">
          <h3 style="font-size: 1.5rem; margin-bottom: 1.5rem;">${gallery.map_location.place_name?.[lang] || t('gallery.location', lang)}</h3>
          <div class="video-container">
            <iframe src="${mapUrl}" allowfullscreen loading="lazy"></iframe>
          </div>
        </div>`;
    }
    html = html.replace('{{GALLERY_MAP}}', mapHTML);

    const filename = gallery.slug[lang] + '.html';
    fs.writeFileSync(path.join(langDir, 'galeries', filename), html);
}

function renderAbout(lang, data, langDir, partials) {
    let html = fs.readFileSync(path.join(TEMPLATES_DIR, 'about.html'), 'utf8');

    html = html.replace('{{HEADER}}', partials.header);
    html = html.replace('{{FOOTER}}', partials.footer);
    html = html.replace('{{MOBILE_MENU}}', partials.mobileMenu);
    html = replaceLangVars(html, lang, data, 'a-propos');

    html = html.replace(/\{\{BIO_LONG\}\}/g, data.settings.photographer.bio_long[lang].replace(/\n/g, '</p><p>'));
    html = html.replace(/\{\{PROFILE_IMAGE\}\}/g, data.settings.photographer.profile_image);
    html = html.replace(/\{\{INTERVIEW_VIDEO\}\}/g, data.settings.photographer.interview_video_url);

    // Expositions passées
    let pastExpoHTML = '';
    data.exhibitions_past.forEach(expo => {
        pastExpoHTML += `
        <div class="card">
          <img src="${expo.image}" alt="${expo.title[lang]}" class="card-image">
          <div class="card-content">
            <h3 class="card-title">${expo.title[lang]}</h3>
            <p class="card-meta">${expo.location[lang]} • ${expo.year}</p>
            <p class="card-description">${expo.description[lang]}</p>
          </div>
        </div>`;
    });
    html = html.replace('{{PAST_EXHIBITIONS}}', pastExpoHTML);

    // Expositions à venir
    let upcomingExpoHTML = '';
    data.exhibitions_upcoming.forEach(expo => {
        upcomingExpoHTML += `
        <div class="card">
          <img src="${expo.image}" alt="${expo.title[lang]}" class="card-image">
          <div class="card-content">
            <span class="card-badge">${expo.year}</span>
            <h3 class="card-title">${expo.title[lang]}</h3>
            <p class="card-meta">${expo.location[lang]}</p>
            <p class="card-description">${expo.description[lang]}</p>
          </div>
        </div>`;
    });
    html = html.replace('{{UPCOMING_EXHIBITIONS}}', upcomingExpoHTML);

    // Publications
    let publicationsHTML = '';
    data.publications.forEach(pub => {
        publicationsHTML += `
        <div class="card" style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; align-items: center;">
          <img src="${pub.cover_image}" alt="${pub.title[lang]}" style="width: 100%; height: auto; border-radius: 0.5rem;">
          <div>
            <h3 class="card-title">${pub.title[lang]}</h3>
            <p class="card-meta">${pub.publisher} • ${pub.year}</p>
            <p class="card-description">${pub.description[lang]}</p>
            <a href="${pub.external_url}" target="_blank" class="card-link">
              ${t('about.view_publication', lang)}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>
        </div>`;
    });
    html = html.replace('{{PUBLICATIONS}}', publicationsHTML);

    // Collaborations
    let collabsHTML = '';
    data.collaborations.forEach(collab => {
        collabsHTML += `
        <div class="card">
          <img src="${collab.logo_image}" alt="${collab.organization}" class="card-image">
          <div class="card-content">
            <h3 class="card-title">${collab.organization}</h3>
            <p class="card-meta" style="font-weight: 600; color: #1a1a1a;">${collab.role[lang]}</p>
            <p class="card-description">${collab.description[lang]}</p>
          </div>
        </div>`;
    });
    html = html.replace('{{COLLABORATIONS}}', collabsHTML);

    fs.writeFileSync(path.join(langDir, 'a-propos.html'), html);
}

function renderContact(lang, data, langDir, partials) {
    let html = fs.readFileSync(path.join(TEMPLATES_DIR, 'contact.html'), 'utf8');

    html = html.replace('{{HEADER}}', partials.header);
    html = html.replace('{{FOOTER}}', partials.footer);
    html = html.replace('{{MOBILE_MENU}}', partials.mobileMenu);
    html = replaceLangVars(html, lang, data, 'contact');

    html = html.replace(/\{\{CONTACT_INTRO\}\}/g, data.settings.contact.intro_text[lang]);
    html = html.replace(/\{\{FORMSPREE_ENDPOINT\}\}/g, data.settings.contact.formspree_endpoint);

    fs.writeFileSync(path.join(langDir, 'contact.html'), html);
}

function replaceLangVars(html, lang, data, pageName = 'index', gallerySlug = null) {
    // Variables globales
    html = html.replace(/\{\{LANG\}\}/g, lang);
    html = html.replace(/\{\{PHOTOGRAPHER_NAME\}\}/g, data.settings.photographer.name);
    html = html.replace(/\{\{PHOTOGRAPHER_EMAIL\}\}/g, data.settings.photographer.email);
    html = html.replace(/\{\{PHOTOGRAPHER_PHONE\}\}/g, data.settings.photographer.phone);
    html = html.replace(/\{\{INSTAGRAM_URL\}\}/g, data.settings.photographer.social.instagram);
    html = html.replace(/\{\{FACEBOOK_URL\}\}/g, data.settings.photographer.social.facebook || '#');
    html = html.replace(/\{\{TWITTER_URL\}\}/g, data.settings.photographer.social.twitter || '#');
    
    // Liens de changement de langue
    const langLinks = getLangLinks(lang, pageName, gallerySlug);
    html = html.replace(/\{\{LANG_LINK_FR\}\}/g, langLinks.fr);
    html = html.replace(/\{\{LANG_LINK_EN\}\}/g, langLinks.en);
    html = html.replace(/\{\{LANG_LINK_AR\}\}/g, langLinks.ar);
    
    // Traductions UI
    html = html.replace(/\{\{TRAD_NAV_GALLERIES\}\}/g, t('nav.galleries', lang));
    html = html.replace(/\{\{TRAD_NAV_ABOUT\}\}/g, t('nav.about', lang));
    html = html.replace(/\{\{TRAD_NAV_CONTACT\}\}/g, t('nav.contact', lang));
    html = html.replace(/\{\{TRAD_HOME_LATEST_WORK\}\}/g, t('home.latest_work', lang));
    html = html.replace(/\{\{TRAD_HOME_VIEW_ALL\}\}/g, t('home.view_all_galleries', lang));
    html = html.replace(/\{\{TRAD_GALLERY_BACK\}\}/g, t('gallery.back_to_galleries', lang));
    html = html.replace(/\{\{TRAD_GALLERY_VIEW\}\}/g, t('gallery.view_gallery', lang));
    html = html.replace(/\{\{TRAD_GALLERY_DOCUMENTARY\}\}/g, t('gallery.documentary', lang));
    html = html.replace(/\{\{TRAD_GALLERY_LOCATION\}\}/g, t('gallery.location', lang));
    html = html.replace(/\{\{TRAD_ABOUT_TITLE\}\}/g, t('about.title', lang));
    html = html.replace(/\{\{TRAD_ABOUT_BIOGRAPHY\}\}/g, t('about.biography', lang));
    html = html.replace(/\{\{TRAD_ABOUT_INTERVIEW\}\}/g, t('about.interview', lang));
    html = html.replace(/\{\{TRAD_ABOUT_PAST_EXHIBITIONS\}\}/g, t('about.past_exhibitions', lang));
    html = html.replace(/\{\{TRAD_ABOUT_UPCOMING\}\}/g, t('about.upcoming_exhibitions', lang));
    html = html.replace(/\{\{TRAD_ABOUT_PRESS\}\}/g, t('about.press_publications', lang));
    html = html.replace(/\{\{TRAD_ABOUT_COLLABORATIONS\}\}/g, t('about.collaborations', lang));
    html = html.replace(/\{\{TRAD_ABOUT_VIEW_PUB\}\}/g, t('about.view_publication', lang));
    html = html.replace(/\{\{TRAD_CONTACT_TITLE\}\}/g, t('contact.title', lang));
    html = html.replace(/\{\{TRAD_CONTACT_SEND_MESSAGE\}\}/g, t('contact.send_message', lang));
    html = html.replace(/\{\{TRAD_CONTACT_PROFESSIONAL\}\}/g, t('contact.professional_info', lang));
    html = html.replace(/\{\{TRAD_CONTACT_NAME\}\}/g, t('contact.name', lang));
    html = html.replace(/\{\{TRAD_CONTACT_EMAIL\}\}/g, t('contact.email', lang));
    html = html.replace(/\{\{TRAD_CONTACT_SUBJECT\}\}/g, t('contact.subject', lang));
    html = html.replace(/\{\{TRAD_CONTACT_MESSAGE\}\}/g, t('contact.message', lang));
    html = html.replace(/\{\{TRAD_CONTACT_SEND\}\}/g, t('contact.send', lang));
    html = html.replace(/\{\{TRAD_CONTACT_PHONE\}\}/g, t('contact.phone', lang));
    html = html.replace(/\{\{TRAD_CONTACT_FOLLOW\}\}/g, t('contact.follow_me', lang));
    html = html.replace(/\{\{TRAD_CONTACT_SENDING\}\}/g, t('contact.sending', lang));
    html = html.replace(/\{\{TRAD_CONTACT_SUCCESS\}\}/g, t('contact.success', lang));
    html = html.replace(/\{\{TRAD_CONTACT_ERROR\}\}/g, t('contact.error', lang));
    html = html.replace(/\{\{TRAD_FOOTER_RIGHTS\}\}/g, t('footer.all_rights_reserved', lang));
    html = html.replace(/\{\{TRAD_FOOTER_NAV\}\}/g, t('footer.navigation', lang));
    html = html.replace(/\{\{TRAD_FOOTER_FOLLOW\}\}/g, t('footer.follow_me', lang));
    html = html.replace(/\{\{TRAD_FOOTER_HOME\}\}/g, t('footer.home', lang));
    html = html.replace(/\{\{TRAD_FOOTER_COPYRIGHT\}\}/g, t('footer.copyright', lang));
    html = html.replace(/\{\{TRAD_FOOTER_DESIGN_DEV\}\}/g, t('footer.design_dev', lang));
    
    return html;
}

module.exports = { renderTemplates };