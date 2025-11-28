const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');
const firebaseConfig = require('../firebase-config');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchData() {
    const data = {};

    // Settings
    const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
    data.settings = settingsDoc.data();

    // Galeries
    const galleriesSnap = await getDocs(collection(db, 'galleries'));
    data.galleries = galleriesSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.order - b.order);

    // Photos pour chaque galerie
    for (const gallery of data.galleries) {
        const photosSnap = await getDocs(collection(db, 'galleries', gallery.id, 'photos'));
        gallery.photos = photosSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => a.order - b.order);
    }

    // Expositions
    const exhibitionsSnap = await getDocs(collection(db, 'exhibitions'));
    data.exhibitions = exhibitionsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.order - b.order);

    // Séparer past et upcoming
    data.exhibitions_past = data.exhibitions.filter(e => e.type === 'past');
    data.exhibitions_upcoming = data.exhibitions.filter(e => e.type === 'upcoming');

    // Publications
    const publicationsSnap = await getDocs(collection(db, 'publications'));
    data.publications = publicationsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.order - b.order);

    // Collaborations
    const collaborationsSnap = await getDocs(collection(db, 'collaborations'));
    data.collaborations = collaborationsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.order - b.order);

    return data;
}

module.exports = { fetchData };
