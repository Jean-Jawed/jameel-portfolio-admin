/**
 * Système de messages toast
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ffc107';
  
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${bgColor};
    color: white;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    font-weight: 500;
    animation: slideInRight 0.3s ease-out;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Ajouter les animations CSS si pas déjà présentes
if (!document.getElementById('toast-animations')) {
  const style = document.createElement('style');
  style.id = 'toast-animations';
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Helpers loading states
function setLoading(button, loading, text = 'Chargement...') {
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = `<span class="spinner"></span> ${text}`;
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Enregistrer';
  }
}
