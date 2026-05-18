/* ==== Baghdad Hotel — script.js ==== */

'use strict';


   /*==== 0. Wait for DOM ====*/

document.addEventListener('DOMContentLoaded', () => {

    /*==== 1. LANGUAGE TOGGLE ====*/
  
  let currentLang = localStorage.getItem('baghdad_lang') || 'en';

  function applyTranslations(lang) {
    const t = translations[lang];
    if (!t) return;

    /* Update textContent for all [data-i18n] elements */
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) el.textContent = t[key];
    });

    /* Update placeholder attributes */
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.dataset.i18nPh;
      if (t[key] !== undefined) el.placeholder = t[key];
    });

    /* HTML dir + lang */
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    /* Persist */
    localStorage.setItem('baghdad_lang', lang);
    currentLang = lang;
  }

  /* Wire up the toggle button(s)*/
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = currentLang === 'en' ? 'ar' : 'en';
      applyTranslations(next);
    });
  });

  /* Apply on load */
  applyTranslations(currentLang);


  /* ==== 2. LOADING SCREEN ==== */
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        /* remove from DOM after transition */
        loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      }, 2200);
    });
  }


  /* ==== 3. CUSTOM CURSOR ==== */
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');

  if (cursor && follower && window.matchMedia('(pointer:fine)').matches) {
    let mx = 0, my = 0, fx = 0, fy = 0;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    /* Cursor snaps instantly; follower lerps */
    (function loop() {
      cursor.style.left   = mx + 'px';
      cursor.style.top    = my + 'px';
      fx += (mx - fx) * 0.14;
      fy += (my - fy) * 0.14;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
      requestAnimationFrame(loop);
    })();

    /* Grow on hover over interactive elements */
    document.querySelectorAll('a, button, .gallery-item, .room-card').forEach(el => {
      el.addEventListener('mouseenter', () => follower.classList.add('hover'));
      el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
    });
  }


  /* ==== 4. NAVBAR — scroll behaviour + hamburger ==== */
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');

  /* Scrolled class */
  function handleNavScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* Hamburger toggle */
  function toggleMenu(forceClose) {
    const open = forceClose === true ? false : !hamburger.classList.contains('open');
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  hamburger.addEventListener('click', () => toggleMenu());

  /* Close on link click */
  mobileMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => toggleMenu(true))
  );

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggleMenu(true);
  });


  /* ==== 5. SMOOTH SCROLL for anchor links ==== */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = navbar.offsetHeight;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ==== 6. SCROLL ANIMATIONS (IntersectionObserver) ==== */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); /* animate once */
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));


  /* ==== 7. HERO PARALLAX ==== */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `scale(1.08) translateY(${scrolled * 0.28}px)`;
      }
    }, { passive: true });
  }


  /* ==== 8. GALLERY LIGHTBOX ==== */
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightbox-img');
  const lbClose      = document.querySelector('.lightbox-close');
  const lbPrev       = document.querySelector('.lightbox-prev');
  const lbNext       = document.querySelector('.lightbox-next');
  const galleryItems = [...document.querySelectorAll('.gallery-item')];

  let currentImgIdx = 0;

  function openLightbox(idx) {
    currentImgIdx = idx;
    const src = galleryItems[idx].querySelector('img').src;
    lightboxImg.src = src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showLightboxImg(idx) {
    currentImgIdx = (idx + galleryItems.length) % galleryItems.length;
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
      lightboxImg.src = galleryItems[currentImgIdx].querySelector('img').src;
      lightboxImg.style.opacity = '1';
    }, 180);
  }

  lightboxImg.style.transition = 'opacity 0.18s';

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev)  lbPrev.addEventListener('click',  () => showLightboxImg(currentImgIdx - 1));
  if (lbNext)  lbNext.addEventListener('click',  () => showLightboxImg(currentImgIdx + 1));

  /* Click outside image to close */
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  /* Keyboard navigation */
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   showLightboxImg(currentImgIdx - 1);
    if (e.key === 'ArrowRight')  showLightboxImg(currentImgIdx + 1);
  });


  /* ==== 9. BOOKING FORM ==== */
  const bookingForm = document.getElementById('booking-form');
  const toast       = document.getElementById('toast');
  const toastMsg    = document.getElementById('toast-msg');

  function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5500);
  }

  function validateForm(formEl) {
    let valid = true;
    formEl.querySelectorAll('[required]').forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#c0392b';
        valid = false;
      }
    });

    /* Email format check */
    const emailEl = formEl.querySelector('[type="email"]');
    if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.style.borderColor = '#c0392b';
      valid = false;
    }

    /* Date logic: check-out after check-in */
    const checkin  = formEl.querySelector('#checkin');
    const checkout = formEl.querySelector('#checkout');
    if (checkin && checkout && checkin.value && checkout.value) {
      if (new Date(checkout.value) <= new Date(checkin.value)) {
        checkout.style.borderColor = '#c0392b';
        valid = false;
      }
    }

    return valid;
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateForm(bookingForm)) {
        showToast('Please fill in all required fields correctly.');
        return;
      }
      /* Success */
      const msg = translations[currentLang]?.form_success ||
        'Your reservation request has been received. Our concierge team will contact you within 24 hours.';
      showToast(msg);
      bookingForm.reset();
    });
  }


  /* ==== 10. ACTIVE NAV LINK on scroll (Intersection Observer) ==== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, #mobile-menu a');

  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${entry.target.id}`
            );
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach(s => sectionObserver.observe(s));


  /* ==== 11. COUNTER ANIMATION for stats ==== */
  function animateCounter(el) {
    const raw    = el.textContent.replace(/[^0-9]/g, '');
    const target = parseInt(raw, 10);
    if (isNaN(target) || target === 0) return;

    const prefix  = el.textContent.match(/^[^0-9]*/)?.[0] || '';
    const suffix  = el.textContent.match(/[^0-9]*$/)?.[0] || '';
    const dur     = 1600;
    const start   = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / dur, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
      el.textContent = prefix + Math.round(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* Trigger when stats enter viewport */
  const statNums = document.querySelectorAll('.stat-num');
  const counterObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  statNums.forEach(el => counterObserver.observe(el));


  /* ==== 12. SET MIN DATE for check-in (today) and cascade checkout ==== */
  const checkinEl  = document.getElementById('checkin');
  const checkoutEl = document.getElementById('checkout');

  if (checkinEl && checkoutEl) {
    const today = new Date().toISOString().split('T')[0];
    checkinEl.min = today;

    checkinEl.addEventListener('change', () => {
      checkoutEl.min = checkinEl.value;
      if (checkoutEl.value && checkoutEl.value <= checkinEl.value) {
        checkoutEl.value = '';
      }
    });
  }

}); 
/* end DOMContentLoaded */
