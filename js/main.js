/**
 * Crebit - Personal Account & Money Manager (PAM)
 * Official Landing Page Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeManager();
  initNavbarScroll();
  initScrollAnimations();
  initFeatureTabs();
  initFaqAccordion();
  initCounterStats();
  initMobileNav();
});

/* ===================================================================
   1. Theme Management (System, Light, Dark)
   =================================================================== */
function initThemeManager() {
  const THEME_KEY = 'crebit_web_theme';
  const themeButtons = document.querySelectorAll('.theme-btn');
  const htmlEl = document.documentElement;
  
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  function getSavedTheme() {
    return localStorage.getItem(THEME_KEY) || 'system';
  }

  function updateThemeScreenshots(effectiveTheme) {
    const isLight = effectiveTheme === 'light';
    
    // Explicit inline display toggles (100% resilient against stale CSS caching)
    const lightScreenshots = document.querySelectorAll('.theme-screenshot-light');
    const darkScreenshots = document.querySelectorAll('.theme-screenshot-dark');

    lightScreenshots.forEach(img => {
      img.style.setProperty('display', isLight ? 'block' : 'none', 'important');
    });

    darkScreenshots.forEach(img => {
      img.style.setProperty('display', isLight ? 'none' : 'block', 'important');
    });

    // Also update any single images using data-light-src / data-dark-src
    document.querySelectorAll('img[data-light-src][data-dark-src]').forEach(img => {
      const target = isLight ? img.getAttribute('data-light-src') : img.getAttribute('data-dark-src');
      if (img.getAttribute('src') !== target) {
        img.src = target;
      }
    });
  }

  function applyTheme(themeChoice) {
    let effectiveTheme = themeChoice;
    if (themeChoice === 'system') {
      effectiveTheme = systemPrefersDark.matches ? 'dark' : 'light';
    }
    
    htmlEl.setAttribute('data-theme', effectiveTheme);

    // Update active state on buttons
    themeButtons.forEach(btn => {
      const mode = btn.getAttribute('data-theme-choice');
      btn.classList.toggle('active', mode === themeChoice);
    });

    // Explicitly update all theme screenshot images
    updateThemeScreenshots(effectiveTheme);
  }

  // Bind click handlers to theme switcher buttons
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const choice = btn.getAttribute('data-theme-choice');
      localStorage.setItem(THEME_KEY, choice);
      applyTheme(choice);
    });
  });

  // Listen for OS system theme changes
  systemPrefersDark.addEventListener('change', () => {
    if (getSavedTheme() === 'system') {
      applyTheme('system');
    }
  });

  // Initial application
  applyTheme(getSavedTheme());
}

/* ===================================================================
   2. Sticky Navbar Glass Elevation on Scroll
   =================================================================== */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ===================================================================
   3. Scroll-triggered Reveal Animations (IntersectionObserver)
   =================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  // Immediately activate elements already in or near viewport
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= windowHeight + 100) {
      el.classList.add('active');
    }
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target); // Reveal once
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px 100px 0px'
  });

  revealElements.forEach(el => {
    if (!el.classList.contains('active')) {
      observer.observe(el);
    }
  });
}

/* ===================================================================
   4. Interactive Feature Tabs Switcher
   =================================================================== */
function initFeatureTabs() {
  const tabButtons = document.querySelectorAll('.tab-nav-btn');
  const tabPanels = document.querySelectorAll('.tab-content-panel');

  if (!tabButtons.length || !tabPanels.length) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab-target');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePanel = document.getElementById(targetId);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });
}

/* ===================================================================
   5. Interactive FAQ Accordion
   =================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('open')) {
          otherItem.classList.remove('open');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ===================================================================
   6. Dynamic Counter Stats Animation
   =================================================================== */
function initCounterStats() {
  const counters = document.querySelectorAll('.stat-count');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetVal = parseFloat(el.getAttribute('data-target') || '0');
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1200; // ms
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const currentVal = (targetVal * easeProgress).toFixed(targetVal % 1 === 0 ? 0 : 1);

          el.textContent = `${prefix}${currentVal}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.textContent = `${prefix}${targetVal}${suffix}`;
          }
        }

        requestAnimationFrame(updateCounter);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ===================================================================
   7. Mobile Navigation Toggle & Drawer
   =================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggleBtn || !navLinks) return;

  function toggleDrawer() {
    const isOpen = navLinks.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
    toggleBtn.textContent = isOpen ? '✕' : '☰';
  }

  function closeDrawer() {
    navLinks.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.textContent = '☰';
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDrawer();
  });

  // Close mobile nav when clicking any link inside it
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Close drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
      closeDrawer();
    }
  });

  // Reset drawer state when resizing to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && navLinks.classList.contains('open')) {
      closeDrawer();
    }
  });
}

