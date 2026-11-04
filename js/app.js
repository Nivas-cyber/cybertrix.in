/* ============================================================
   CYBERTRIX.IN — APP & PLATFORM ENGINE (OPTIMIZED)
   ============================================================ */

// Passive, RAF-throttled Nav scroll listener for 60fps performance
let isTicking = false;
window.addEventListener('scroll', () => {
  if (!isTicking) {
    window.requestAnimationFrame(() => {
      document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 30);
      isTicking = false;
    });
    isTicking = true;
  }
}, { passive: true });

// Mobile menu toggle
function toggleMenu() {
  const menu = document.getElementById('navLinks');
  const button = document.getElementById('hamburger');
  const isOpen = menu?.classList.toggle('open') ?? false;
  document.body.classList.toggle('menu-open', isOpen);
  button?.setAttribute('aria-expanded', String(isOpen));
  button?.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  if (isOpen) requestAnimationFrame(() => menu?.querySelector('a[href]')?.focus());
  else button?.focus();
}

function closeMenu(restoreFocus = false) {
  document.getElementById('navLinks')?.classList.remove('open');
  document.body.classList.remove('menu-open');
  document.getElementById('hamburger')?.setAttribute('aria-expanded', 'false');
  document.getElementById('hamburger')?.setAttribute('aria-label', 'Open navigation menu');
  if (restoreFocus) document.getElementById('hamburger')?.focus();
}

document.addEventListener('click', e => {
  if (!e.target.closest('nav')) {
    closeMenu();
  }
}, { passive: true });

document.addEventListener('keydown', e => {
  const activeModal = document.querySelector('.modal-backdrop.active');
  if (activeModal) {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (activeModal.id === 'previewModal') closePdfModal();
      else closeVideoModal();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = [...activeModal.querySelectorAll('a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])')]
        .filter(el => el.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === activeModal)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    return;
  }

  if (e.key === 'Escape') {
    closeMenu(true);
  }
});

// High-performance non-blocking IntersectionObserver
let observer = null;
function initReveal() {
  if (observer) observer.disconnect();
  observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('.reveal:not(.revealed)').forEach(el => observer.observe(el));
}

function setTheme(theme, persist = true) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;

  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  const nextLabel = nextTheme === 'dark' ? 'light' : 'dark';
  if (toggle) toggle.setAttribute('aria-label', `Switch to ${nextLabel} theme`);
  if (toggle) toggle.title = `Switch to ${nextLabel} theme`;
  if (icon) icon.className = `fas ${nextTheme === 'dark' ? 'fa-sun' : 'fa-moon'}`;
  if (label) label.textContent = nextTheme === 'dark' ? 'Light' : 'Dark';

  document.getElementById('themeColor')?.setAttribute('content', nextTheme === 'dark' ? '#0e1218' : '#f5f7fb');
  if (persist) {
    try { localStorage.setItem('cybertrix-theme', nextTheme); } catch (_) {}
  }
}

function initTheme() {
  const fallbackTheme = document.documentElement.dataset.theme || 'light';
  setTheme(fallbackTheme === 'light' || fallbackTheme === 'dark' ? fallbackTheme : 'light', false);
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme;
  setTheme(currentTheme === 'light' ? 'dark' : 'light');
}

// Single Page Navigation with URL Hash support
function showPage(id, updateHash = true) {
  const validPages = ['home', 'courses', 'roadmaps', 'blogs', 'contact'];
  if (!validPages.includes(id)) id = 'home';

  const currentPageId = document.querySelector('.page.active')?.id.replace('page-', '');
  if (updateHash && window.location.hash !== `#${id}`) {
    history.pushState(null, '', '#' + id);
  }
  closeMenu();
  if (currentPageId === id) return;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById('page-' + id);
  if (pageEl) pageEl.classList.add('active');
  
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    a.removeAttribute('aria-current');
  });
  const activeNavLink = document.getElementById('nav-' + id);
  activeNavLink?.classList.add('active');
  activeNavLink?.setAttribute('aria-current', 'page');
  window.scrollTo({ top: 0, behavior: 'auto' });

  initReveal();
  const pageHeading = pageEl?.querySelector('h1');
  if (pageHeading) {
    pageHeading.setAttribute('tabindex', '-1');
    pageHeading.focus({ preventScroll: true });
  }
  if (id === 'home') animateCounters();
}

function syncPageFromUrl() {
  const pageId = window.location.hash.slice(1) || 'home';
  showPage(pageId, false);
}

window.addEventListener('hashchange', syncPageFromUrl);
window.addEventListener('popstate', syncPageFromUrl);

// Animated Counters
let counterAnimationFrame = 0;
function animateCounters() {
  if (counterAnimationFrame) cancelAnimationFrame(counterAnimationFrame);
  const counters = [...document.querySelectorAll('.stat-num')];
  const targets = counters.map(el => parseInt(el.getAttribute('data-count'), 10));

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    counters.forEach((el, index) => { el.textContent = targets[index]; });
    counterAnimationFrame = 0;
    return;
  }

  const startTime = performance.now();
  const duration = 850;
  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    counters.forEach((el, index) => {
      el.textContent = Math.floor(targets[index] * progress);
    });
    if (progress < 1) counterAnimationFrame = requestAnimationFrame(tick);
    else {
      counters.forEach((el, index) => { el.textContent = targets[index]; });
      counterAnimationFrame = 0;
    }
  }
  counterAnimationFrame = requestAnimationFrame(tick);
}

// Dynamic Course Filter & Search Logic
let activeCourseFilter = 'all';

function filterCourses(type, btnElement) {
  activeCourseFilter = type;
  if (btnElement) {
    document.querySelectorAll('.filter-tabs .filter-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    btnElement.classList.add('active');
    btnElement.setAttribute('aria-pressed', 'true');
  }
  applyCourseFilters();
}

function applyCourseFilters() {
  const query = document.getElementById('courseSearch')?.value.toLowerCase().trim() || '';
  const cards = document.querySelectorAll('.courses-grid .course-card');

  let allMatches = 0;
  let freeVisible = 0;
  let paidVisible = 0;

  cards.forEach(card => {
    const isFree = card.getAttribute('data-type') === 'free';
    const isPaid = card.getAttribute('data-type') === 'paid';
    const text = card.textContent.toLowerCase();

    const matchesSearch = !query || text.includes(query);
    if (matchesSearch) allMatches++;
    if (matchesSearch && isFree) freeVisible++;
    if (matchesSearch && isPaid) paidVisible++;
    const matchesFilter = activeCourseFilter === 'all' ||
                          (activeCourseFilter === 'free' && isFree) ||
                          (activeCourseFilter === 'paid' && isPaid);

    if (matchesFilter && matchesSearch) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });

  const emptyState = document.getElementById('courseNoResults');
  if (emptyState) emptyState.hidden = allMatches > 0;

  const filterBtns = document.querySelectorAll('.filter-tabs .filter-btn');
  if (filterBtns.length >= 3) {
    const countAll = filterBtns[0].querySelector('.filter-count');
    const countFree = filterBtns[1].querySelector('.filter-count');
    const countPaid = filterBtns[2].querySelector('.filter-count');
    if (countAll) countAll.textContent = allMatches;
    if (countFree) countFree.textContent = freeVisible;
    if (countPaid) countPaid.textContent = paidVisible;
  }
}

let modalReturnFocus = null;
let previousBodyOverflow = '';
let pdfPreviewRequest = 0;

function activateModal(backdrop) {
  if (!document.querySelector('.modal-backdrop.active')) {
    modalReturnFocus = document.activeElement;
    previousBodyOverflow = document.body.style.overflow;
  }
  backdrop.inert = false;
  backdrop.setAttribute('aria-hidden', 'false');
  backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => backdrop.querySelector('.modal-close')?.focus());
}

function deactivateModal(backdrop, bodyEl) {
  if (backdrop) {
    backdrop.classList.remove('active');
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.inert = true;
  }
  if (bodyEl) bodyEl.replaceChildren();
  if (!document.querySelector('.modal-backdrop.active')) {
    document.body.style.overflow = previousBodyOverflow;
    if (modalReturnFocus instanceof HTMLElement && modalReturnFocus.isConnected) modalReturnFocus.focus();
    modalReturnFocus = null;
  }
}

function isAllowedPdfPath(pdfUrl) {
  return typeof pdfUrl === 'string' && /^assets\/(courses|roadmaps)\/[a-z0-9._-]+\.pdf$/i.test(pdfUrl);
}

function showPdfStatus(bodyEl, headingText, messageText) {
  const panel = document.createElement('div');
  panel.className = 'document-unavailable';
  const icon = document.createElement('i');
  icon.className = 'fas fa-file-circle-exclamation';
  icon.setAttribute('aria-hidden', 'true');
  const heading = document.createElement('h3');
  heading.textContent = headingText;
  const message = document.createElement('p');
  message.textContent = messageText;
  panel.append(icon, heading, message);
  bodyEl.replaceChildren(panel);
}

function showPdfChecking(bodyEl) {
  const panel = document.createElement('div');
  panel.className = 'document-unavailable';
  const icon = document.createElement('i');
  icon.className = 'fas fa-circle-notch fa-spin';
  icon.setAttribute('aria-hidden', 'true');
  const heading = document.createElement('h3');
  heading.textContent = 'Checking document';
  const message = document.createElement('p');
  message.textContent = 'Please wait while we check that this PDF is available.';
  panel.append(icon, heading, message);
  bodyEl.replaceChildren(panel);
}

// Reusable PDF Modal Launcher
async function openPdfModal(pdfUrl, title) {
  if (!isAllowedPdfPath(pdfUrl)) return;
  const requestId = ++pdfPreviewRequest;

  const backdrop = document.getElementById('previewModal');
  const titleEl  = document.getElementById('modalTitle');
  const bodyEl   = document.getElementById('modalBody');
  const openBtn  = document.getElementById('modalPdfOpenBtn');

  if (!backdrop || !bodyEl) return;

  if (titleEl) titleEl.textContent = title || 'Document Preview';
  if (openBtn) {
    openBtn.href = pdfUrl;
    openBtn.hidden = window.location.protocol !== 'file:';
  }
  bodyEl.replaceChildren();

  const iframe = document.createElement('iframe');
  iframe.className = 'modal-iframe';
  iframe.src = pdfUrl;
  iframe.title = title || 'PDF Document';
  iframe.setAttribute('referrerpolicy', 'no-referrer');

  activateModal(backdrop);

  // HEAD checks keep missing PDFs from appearing as a broken embedded document.
  // Local file previews cannot use fetch, so their iframe remains the fallback.
  if (window.location.protocol === 'file:') {
    bodyEl.replaceChildren(iframe);
    return;
  }

  showPdfChecking(bodyEl);
  try {
    const response = await fetch(pdfUrl, { method: 'HEAD', cache: 'no-store', credentials: 'same-origin', redirect: 'error' });
    if (requestId !== pdfPreviewRequest || !backdrop.classList.contains('active')) return;
    if (response.ok) {
      if (openBtn) openBtn.hidden = false;
      bodyEl.replaceChildren(iframe);
    } else if (response.status === 404 || response.status === 410) {
      showPdfStatus(bodyEl, 'PDF not uploaded yet', `Add the PDF at ${pdfUrl} to make this document available.`);
    } else {
      showPdfStatus(bodyEl, 'Unable to open this PDF', 'The document server returned an error. Please try again later.');
    }
  } catch (_) {
    if (requestId === pdfPreviewRequest && backdrop.classList.contains('active')) {
      showPdfStatus(bodyEl, 'Unable to check this PDF', 'Check your connection and try again.');
    }
  }
}

function closePdfModal() {
  pdfPreviewRequest++;
  const backdrop = document.getElementById('previewModal');
  const bodyEl   = document.getElementById('modalBody');
  deactivateModal(backdrop, bodyEl);
}

function getYouTubeVideoId(videoUrl) {
  try {
    const url = new URL(videoUrl);
    if (url.protocol !== 'https:') return null;

    let videoId = null;
    if (url.hostname === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0];
    } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
      if (url.pathname === '/watch') videoId = url.searchParams.get('v');
      else if (url.pathname.startsWith('/embed/')) videoId = url.pathname.split('/')[2];
    }

    return videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId) ? videoId : null;
  } catch (_) {
    return null;
  }
}

function showVideoMessage(bodyEl, headingText, messageText) {
  const panel = document.createElement('div');
  panel.className = 'video-coming-soon';
  const icon = document.createElement('i');
  icon.className = 'fab fa-youtube';
  icon.setAttribute('aria-hidden', 'true');
  const heading = document.createElement('h3');
  heading.textContent = headingText;
  const message = document.createElement('p');
  message.textContent = messageText;
  panel.append(icon, heading, message);
  bodyEl.replaceChildren(panel);
}

// Free Video Course Launcher (only allows valid YouTube video IDs)
function openVideoModal(videoUrl, title) {
  pdfPreviewRequest++;
  const backdrop = document.getElementById('videoModal');
  const titleEl  = document.getElementById('videoModalTitle');
  const bodyEl   = document.getElementById('videoModalBody');

  if (!backdrop || !bodyEl) return;

  if (titleEl) titleEl.textContent = title || 'Course Video';
  bodyEl.replaceChildren();

  if (!videoUrl || videoUrl === 'YOUR_YOUTUBE_LINK_HERE') {
    showVideoMessage(bodyEl, 'Free course video coming soon', 'This lesson is being prepared. Please check back soon.');
    activateModal(backdrop);
    return;
  }

  const videoId = getYouTubeVideoId(videoUrl);
  if (!videoId) {
    showVideoMessage(bodyEl, 'Video unavailable', 'This video link is not valid or is not supported.');
    activateModal(backdrop);
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.className = 'video-iframe';
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
  iframe.title = title || 'Course Video';
  iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

  bodyEl.appendChild(iframe);
  activateModal(backdrop);
}

function closeVideoModal() {
  pdfPreviewRequest++;
  const backdrop = document.getElementById('videoModal');
  const bodyEl   = document.getElementById('videoModalBody');
  deactivateModal(backdrop, bodyEl);
}

// Contact Form Handler
function handleContactSubmit(event) {
  event?.preventDefault();
  const form = document.getElementById('contactForm');
  if (!form) return;
  ['contactName', 'contactEmail', 'contactCourse', 'contactMessage'].forEach(id => {
    const field = document.getElementById(id);
    field.setCustomValidity(field.value.trim() ? '' : 'Please complete this field.');
  });
  if (!form?.reportValidity()) return;

  const nameVal   = document.getElementById('contactName').value.trim();
  const emailVal  = document.getElementById('contactEmail').value.trim();
  const phoneVal  = document.getElementById('contactPhone').value.trim() || 'Not provided';
  const courseVal = document.getElementById('contactCourse').value;
  const msgVal    = document.getElementById('contactMessage').value.trim();
  if (!nameVal || !emailVal || !courseVal || !msgVal) return;

  const formattedMessage = 
`Hi Cybertrix Team!

I'm reaching out from your website.

*Name:* ${nameVal}
*Email:* ${emailVal}
*Phone:* ${phoneVal}
*Course Interest:* ${courseVal}

*Message:*
${msgVal}`;

  const encodedUrl = `https://wa.me/916305847394?text=${encodeURIComponent(formattedMessage)}`;
  window.open(encodedUrl, '_blank', 'noopener,noreferrer');
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  const initialPage = window.location.hash.replace('#', '') || 'home';
  showPage(initialPage, false);
  
  initReveal();
  initTheme();
  if (document.querySelector('.page.active')?.id === 'page-home') animateCounters();
  applyCourseFilters();
});
