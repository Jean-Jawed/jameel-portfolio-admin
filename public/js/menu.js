// Menu Mobile Toggle
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }
  
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', function() {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
  
  // Close menu when clicking on a link
  const mobileLinks = document.querySelectorAll('.mobile-menu .nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
  
  // Header scroll effect
  const header = document.querySelector('header');
  let lastScroll = 0;
  
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      header.classList.add('scrolled');
      header.classList.remove('transparent');
    } else {
      header.classList.remove('scrolled');
      if (document.body.classList.contains('home-page')) {
        header.classList.add('transparent');
      }
    }
    
    lastScroll = currentScroll;
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Scroll down button on hero
  const scrollDownBtn = document.querySelector('.scroll-down');
  if (scrollDownBtn) {
    scrollDownBtn.addEventListener('click', function() {
      const contentSection = document.getElementById('content');
      if (contentSection) {
        contentSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});
