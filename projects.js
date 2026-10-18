(() => {
  // Mobile Navigation Drawer (Left-to-Right slide model)
  const toggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  const overlay = document.getElementById('mobile-nav-overlay');
  const closeBtn = document.getElementById('mobile-close-btn');

  function openMobileDrawer() {
    if (navLinks) navLinks.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (navLinks) navLinks.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (toggle) toggle.addEventListener('click', openMobileDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeMobileDrawer);
  if (overlay) overlay.addEventListener('click', closeMobileDrawer);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
      closeMobileDrawer();
    }
  });

  // Close mobile nav when clicking any link inside
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileDrawer();
      });
    });
  }

  // Contact Form Submission Handler
  const contactForm = document.getElementById('project-contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameVal = document.getElementById('contact-name')?.value.trim() || 'Friend';
      
      formFeedback.className = 'form-feedback success';
      formFeedback.textContent = `Thank you, ${nameVal}! Your inquiry has been received. Srikar will get in touch with you shortly.`;
      
      contactForm.reset();

      setTimeout(() => {
        formFeedback.style.display = 'none';
      }, 6000);
    });
  }

  // Projects Filter Logic
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-showcase-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
          }, 20);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // Smooth scroll for internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
})();
