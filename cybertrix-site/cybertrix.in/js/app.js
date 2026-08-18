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
  document.getElementById('navLinks')?.classList.toggle('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('nav')) document.getElementById('navLinks')?.classList.remove('open');
}, { passive: true });

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

// Single Page Navigation with URL Hash support
function showPage(id, updateHash = true) {
  const validPages = ['home', 'courses', 'roadmap', 'blogs', 'portfolio', 'contact'];
  if (!validPages.includes(id)) id = 'home';

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById('page-' + id);
  if (pageEl) pageEl.classList.add('active');
  
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.getElementById('nav-' + id)?.classList.add('active');
  
  document.getElementById('navLinks')?.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'instant' });
  
  if (updateHash) {
    history.pushState(null, '', '#' + id);
  }
  
  initReveal();
  if (id === 'home') animateCounters();
}

window.addEventListener('hashchange', () => {
  const pageId = window.location.hash.replace('#', '');
  if (pageId) showPage(pageId, false);
});

// Animated Counters
const SUFFIXES = { 500: '+', 6: '', 15: '+', 98: '%' };
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = SUFFIXES[target] ?? '';
    let count = 0;
    const step = target / 30;
    function tick() {
      count += step;
      if (count < target) { el.textContent = Math.ceil(count) + suffix; requestAnimationFrame(tick); }
      else el.textContent = target + suffix;
    }
    tick();
  });
}

// Dynamic Course Filter & Search Logic
let activeCourseFilter = 'all';

function filterCourses(type, btnElement) {
  activeCourseFilter = type;
  if (btnElement) {
    document.querySelectorAll('.filter-tabs .filter-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
  }
  applyCourseFilters();
}

function applyCourseFilters() {
  const query = document.getElementById('courseSearch')?.value.toLowerCase().trim() || '';
  const cards = document.querySelectorAll('.courses-grid .course-card');

  let totalVisible = 0;
  let freeVisible = 0;
  let paidVisible = 0;

  cards.forEach(card => {
    const isFree = card.getAttribute('data-type') === 'free';
    const isPaid = card.getAttribute('data-type') === 'paid';
    const text = card.textContent.toLowerCase();

    const matchesFilter = (activeCourseFilter === 'all') || 
                          (activeCourseFilter === 'free' && isFree) || 
                          (activeCourseFilter === 'paid' && isPaid);
                          
    const matchesSearch = !query || text.includes(query);

    if (matchesFilter && matchesSearch) {
      card.classList.remove('hidden');
      totalVisible++;
      if (isFree) freeVisible++;
      if (isPaid) paidVisible++;
    } else {
      card.classList.add('hidden');
    }
  });

  const filterBtns = document.querySelectorAll('.filter-tabs .filter-btn');
  if (filterBtns.length >= 3) {
    const countAll = filterBtns[0].querySelector('.filter-count');
    const countFree = filterBtns[1].querySelector('.filter-count');
    const countPaid = filterBtns[2].querySelector('.filter-count');
    if (countAll) countAll.textContent = query ? totalVisible : cards.length;
    if (countFree) countFree.textContent = freeVisible;
    if (countPaid) countPaid.textContent = paidVisible;
  }
}

// Secure Reusable PDF Modal Launcher
function openPdfModal(pdfUrl, title) {
  const backdrop = document.getElementById('previewModal');
  const titleEl  = document.getElementById('modalTitle');
  const bodyEl   = document.getElementById('modalBody');
  const openBtn  = document.getElementById('modalPdfOpenBtn');

  if (!backdrop || !bodyEl) return;

  titleEl.textContent = title || 'Document Preview';
  if (openBtn) {
    openBtn.href = pdfUrl;
  }
  bodyEl.innerHTML = '';

  const iframe = document.createElement('iframe');
  iframe.className = 'modal-iframe';
  iframe.src = pdfUrl;
  iframe.title = title || 'PDF Document';

  bodyEl.appendChild(iframe);
  
  backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePdfModal() {
  const backdrop = document.getElementById('previewModal');
  const bodyEl   = document.getElementById('modalBody');
  if (backdrop) backdrop.classList.remove('active');
  if (bodyEl) bodyEl.innerHTML = '';
  document.body.style.overflow = '';
}

// Free Video Course Launcher (Plays YouTube inline on site)
function openVideoModal(videoUrl, title) {
  const backdrop = document.getElementById('videoModal');
  const titleEl  = document.getElementById('videoModalTitle');
  const bodyEl   = document.getElementById('videoModalBody');

  if (!backdrop || !bodyEl) return;

  titleEl.textContent = title || 'Course Video';
  bodyEl.innerHTML = '';

  if (!videoUrl || videoUrl === 'YOUR_YOUTUBE_LINK_HERE') {
    bodyEl.innerHTML = `
      <div style="padding:60px 24px;text-align:center;color:#94a3b8;font-family:var(--font-body);">
        <i class="fab fa-youtube" style="font-size:3.5rem;color:#ef4444;margin-bottom:16px;display:block;"></i>
        <h3 style="color:#fff;margin-bottom:8px;font-size:1.2rem;font-weight:700;">Free YouTube Course Video Coming Soon</h3>
        <p style="max-width:440px;margin:0 auto;line-height:1.6;font-size:0.9rem;">
          This free course video is being uploaded to YouTube. To add your video link, replace <code>YOUR_YOUTUBE_LINK_HERE</code> in <code>index.html</code> with your YouTube URL!
        </p>
      </div>
    `;
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    return;
  }

  let embedUrl = videoUrl;
  if (embedUrl.includes('youtube.com/watch?v=')) {
    const vId = embedUrl.split('v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${vId}?autoplay=1`;
  } else if (embedUrl.includes('youtu.be/')) {
    const vId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${vId}?autoplay=1`;
  }

  const iframe = document.createElement('iframe');
  iframe.className = 'video-iframe';
  iframe.src = embedUrl;
  iframe.title = title || 'Course Video';
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.setAttribute('allowfullscreen', 'true');

  bodyEl.appendChild(iframe);
  
  backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
  const backdrop = document.getElementById('videoModal');
  const bodyEl   = document.getElementById('videoModalBody');
  if (backdrop) backdrop.classList.remove('active');
  if (bodyEl) bodyEl.innerHTML = '';
  document.body.style.overflow = '';
}

// Contact Form Handler
function handleContactSubmit() {
  const nameVal   = document.getElementById('contactName')?.value.trim() || 'Visitor';
  const emailVal  = document.getElementById('contactEmail')?.value.trim() || 'Not provided';
  const phoneVal  = document.getElementById('contactPhone')?.value.trim() || 'Not provided';
  const courseVal = document.getElementById('contactCourse')?.value || 'General Inquiry';
  const msgVal    = document.getElementById('contactMessage')?.value.trim() || 'No message attached.';

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

// Hacker CLI Helper Drawer Logic
function toggleTerminal() {
  const drawer = document.getElementById('terminalOverlay');
  if (!drawer) return;
  drawer.classList.toggle('open');
  if (drawer.classList.contains('open')) {
    document.getElementById('terminalInput')?.focus();
  }
}

function handleTerminalKeyDown(e) {
  if (e.key === 'Enter') {
    const inputEl = document.getElementById('terminalInput');
    const cmd = inputEl.value.trim();
    if (!cmd) return;
    inputEl.value = '';
    executeTerminalCmd(cmd);
  }
}

function executeTerminalCmd(rawCmd) {
  const outputEl = document.getElementById('terminalBody');
  if (!outputEl) return;

  const appendLine = (text, className = '') => {
    const line = document.createElement('div');
    line.className = 'term-line ' + className;
    line.textContent = text;
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
  };

  appendLine(`shell@cybertrix:~$ ${rawCmd}`, 'term-cmd-echo');

  const parts = rawCmd.split(' ');
  const cmd = parts[0].toLowerCase();

  switch (cmd) {
    case 'help':
      appendLine("Cybertrix Quick CLI Commands:");
      appendLine("  courses     — Navigate to courses page");
      appendLine("  roadmap     — Open cybersecurity roadmap");
      appendLine("  contact     — Navigate to contact form");
      appendLine("  whoami      — Display platform status");
      appendLine("  clear       — Clear terminal screen");
      break;

    case 'clear':
      outputEl.innerHTML = '';
      break;

    case 'whoami':
      appendLine(`[+] USER: Cybersecurity Candidate`);
      appendLine(`[+] PLATFORM: Cybertrix.in Academy v4.2`);
      break;

    case 'courses':
      showPage('courses');
      appendLine(`[+] Navigated to Courses page.`, 'success');
      break;

    case 'roadmap':
      showPage('roadmap');
      appendLine(`[+] Navigated to Roadmap.`, 'success');
      break;

    case 'contact':
      showPage('contact');
      appendLine(`[+] Navigated to Contact section.`, 'success');
      break;

    default:
      appendLine(`[-] Unknown command: '${cmd}'. Type 'help' for command list.`, 'warn');
      break;
  }
}

// Pro Precision Cursor Tracker (Instant 1:1 Direct Tracking)
function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

  window.addEventListener('mousemove', e => {
    window.requestAnimationFrame(() => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    });
  }, { passive: true });

  // Hover detection for interactive targets
  document.addEventListener('mouseover', e => {
    const clickable = e.target.closest('a, button, input, select, textarea, .course-card, .teach-item, .roadmap-domain, .blog-card, .contact-row, .skill-chip, .btn');
    if (clickable) {
      document.body.classList.add('cursor-hover');
    }
  }, { passive: true });

  document.addEventListener('mouseout', e => {
    const clickable = e.target.closest('a, button, input, select, textarea, .course-card, .teach-item, .roadmap-domain, .blog-card, .contact-row, .skill-chip, .btn');
    if (clickable) {
      document.body.classList.remove('cursor-hover');
    }
  }, { passive: true });

  document.addEventListener('mousedown', () => document.body.classList.add('cursor-active'), { passive: true });
  document.addEventListener('mouseup', () => document.body.classList.remove('cursor-active'), { passive: true });
}

// Global Keypress listener for Terminal (~ or ` key)
document.addEventListener('keydown', (e) => {
  if (e.key === '`' || e.key === '~') {
    const inputTag = document.activeElement.tagName;
    if (inputTag !== 'INPUT' && inputTag !== 'TEXTAREA') {
      e.preventDefault();
      toggleTerminal();
    }
  }
});

// Boot
document.addEventListener('DOMContentLoaded', () => {
  const initialPage = window.location.hash.replace('#', '') || 'home';
  showPage(initialPage, false);
  
  initReveal();
  initCustomCursor();
  setTimeout(animateCounters, 300);
  applyCourseFilters();
});
