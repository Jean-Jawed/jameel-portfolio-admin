import { signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { auth } from './firebase-init.js';

// Login page
if (window.location.pathname.includes('login.html')) {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = 'index.html';
    } catch (error) {
      errorMessage.textContent = 'Email ou mot de passe incorrect';
      errorMessage.style.display = 'block';
    }
  });
}

// Dashboard - check auth
if (!window.location.pathname.includes('login.html')) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = 'login.html';
    }
  });
}

export { auth };