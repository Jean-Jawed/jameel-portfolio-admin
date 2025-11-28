/**
 * Firebase initialization - Shared across admin
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyAekk1IoYrVmqgckymWik6xuslQQ-GbKSY",
  authDomain: "jameel-portfolio-2561c.firebaseapp.com",
  projectId: "jameel-portfolio-2561c",
  storageBucket: "jameel-portfolio-2561c.firebasestorage.app",
  messagingSenderId: "599641137366",
  appId: "1:599641137366:web:f03e2603f74110432ee977"
};

// Initialize Firebase (singleton)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
