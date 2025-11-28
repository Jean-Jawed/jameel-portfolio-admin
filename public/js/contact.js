// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      const sendingText = submitBtn.getAttribute('data-sending');
      
      // Disable button and show loading
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner"></span> ${sendingText}`;
      
      // Get form data
      const formData = new FormData(this);
      
      try {
        // Send to Formspree
        const response = await fetch(this.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          // Success
          showMessage('success', submitBtn.getAttribute('data-success'));
          this.reset();
        } else {
          // Error
          showMessage('error', submitBtn.getAttribute('data-error'));
        }
      } catch (error) {
        // Network error
        showMessage('error', submitBtn.getAttribute('data-error'));
      } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
  
  function showMessage(type, message) {
    // Remove any existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message-${type}`;
    messageDiv.textContent = message;
    
    // Style the message
    messageDiv.style.padding = '1rem';
    messageDiv.style.marginBottom = '1.5rem';
    messageDiv.style.borderRadius = '0.375rem';
    messageDiv.style.fontSize = '0.875rem';
    messageDiv.style.fontWeight = '500';
    
    if (type === 'success') {
      messageDiv.style.backgroundColor = '#d1fae5';
      messageDiv.style.color = '#065f46';
      messageDiv.style.border = '1px solid #6ee7b7';
    } else {
      messageDiv.style.backgroundColor = '#fee2e2';
      messageDiv.style.color = '#991b1b';
      messageDiv.style.border = '1px solid #fca5a5';
    }
    
    // Insert message
    const form = document.getElementById('contact-form');
    form.insertBefore(messageDiv, form.firstChild);
    
    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      messageDiv.style.transition = 'opacity 0.3s ease';
      messageDiv.style.opacity = '0';
      setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
  }
});
