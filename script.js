(() => {
  const canvas = document.getElementById('animation-canvas');
  const ctx = canvas.getContext('2d');

  const FRAME_COUNT = 160;
  const LERP_FACTOR = 0.09;

  const images = new Array(FRAME_COUNT);
  const loaded = new Array(FRAME_COUNT).fill(false);

  let currentFrame = 0;
  let targetFrame = 0;
  let lastRenderedFrame = -1;
  let isRunning = false;

  const getFrameSrc = (index) => {
    const padded = String(index).padStart(3, '0');
    return `ezgif-80a0dd8bfa59e652-jpg/ezgif-frame-${padded}.jpg`;
  };

  function updateTargetFrame() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0;
    targetFrame = progress * (FRAME_COUNT - 1);

    if (!isRunning) {
      isRunning = true;
      requestAnimationFrame(renderLoop);
    }
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    const newWidth = Math.round(displayWidth * dpr);
    const newHeight = Math.round(displayHeight * dpr);

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
      lastRenderedFrame = -1;
      draw(Math.round(currentFrame));
    }
    updateTargetFrame();
  }

  function getBestAvailableFrame(index) {
    if (loaded[index]) return images[index];

    // Search outwards for closest available loaded frame to prevent any flicker
    for (let offset = 1; offset < FRAME_COUNT; offset++) {
      const prev = index - offset;
      if (prev >= 0 && loaded[prev]) return images[prev];
      const next = index + offset;
      if (next < FRAME_COUNT && loaded[next]) return images[next];
    }
    return null;
  }

  function draw(frameIndex) {
    const img = getBestAvailableFrame(frameIndex);
    if (!img) return;

    const canvasW = canvas.width;
    const canvasH = canvas.height;
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    if (!imgW || !imgH) return;

    // Cover aspect ratio calculation (fill viewport crisply without distortion)
    const ratio = Math.max(canvasW / imgW, canvasH / imgH);
    const renderW = imgW * ratio;
    const renderH = imgH * ratio;
    const renderX = (canvasW - renderW) / 2;
    const renderY = (canvasH - renderH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, renderX, renderY, renderW, renderH);

    lastRenderedFrame = frameIndex;
  }

  function renderLoop() {
    const diff = targetFrame - currentFrame;

    if (Math.abs(diff) > 0.001) {
      currentFrame += diff * LERP_FACTOR;
    } else {
      currentFrame = targetFrame;
    }

    const roundedIndex = Math.min(Math.max(Math.round(currentFrame), 0), FRAME_COUNT - 1);

    if (roundedIndex !== lastRenderedFrame) {
      draw(roundedIndex);
    }

    if (Math.abs(targetFrame - currentFrame) > 0.001) {
      requestAnimationFrame(renderLoop);
    } else {
      isRunning = false;
    }
  }

  function preloadImages() {
    // 1. Immediately prioritize and display frame 1
    const firstImg = new Image();
    firstImg.src = getFrameSrc(1);
    images[0] = firstImg;

    firstImg.onload = () => {
      loaded[0] = true;
      resizeCanvas();
      updateTargetFrame();
      draw(0);
    };

    // 2. Preload remaining frames in parallel
    for (let i = 1; i <= FRAME_COUNT; i++) {
      if (i === 1) continue;
      const frameIdx = i - 1;
      const img = new Image();
      img.src = getFrameSrc(i);
      images[frameIdx] = img;

      if (img.decode) {
        img.decode()
          .then(() => {
            loaded[frameIdx] = true;
            if (Math.round(currentFrame) === frameIdx) {
              draw(frameIdx);
            }
          })
          .catch(() => {
            img.onload = () => {
              loaded[frameIdx] = true;
              if (Math.round(currentFrame) === frameIdx) {
                draw(frameIdx);
              }
            };
          });
      } else {
        img.onload = () => {
          loaded[frameIdx] = true;
          if (Math.round(currentFrame) === frameIdx) {
            draw(frameIdx);
          }
        };
      }
    }
  }

  // =================================================================
  // UI INTERACTIONS & NAVIGATION
  // =================================================================
  function setupUI() {
    // Mobile navigation drawer (Left-to-Right slide model)
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

    // Smooth scroll for all internal anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId.length > 1) {
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

    // Active nav link indicator on scroll
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-link');

    function updateActiveNavLink() {
      const scrollPos = window.scrollY + 200;

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          navItems.forEach(item => {
            if (item.getAttribute('href') === `#${id}`) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', updateActiveNavLink, { passive: true });

    // Portfolio filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  }

  // Event Listeners
  window.addEventListener('scroll', updateTargetFrame, { passive: true });
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // Initialize
  resizeCanvas();
  preloadImages();
  updateTargetFrame();
  setupUI();
})();
