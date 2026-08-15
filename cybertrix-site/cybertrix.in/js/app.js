/* ============================================================
   CYBERTRIX.IN — APP & PLATFORM ENGINE
   ============================================================ */

// Nav scroll listener
window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile menu toggle
function toggleMenu() {
  document.getElementById('navLinks')?.classList.toggle('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('nav')) document.getElementById('navLinks')?.classList.remove('open');
});

// Scroll reveal observer
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
  }, { threshold: 0.06 });

  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('revealed');
      else observer.observe(el);
    });
  }, 100);
}

// Single Page Navigation with URL Hash support
function showPage(id, updateHash = true) {
  const validPages = ['home', 'courses', 'books', 'roadmap', 'blogs', 'portfolio', 'contact'];
  if (!validPages.includes(id)) id = 'home';

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById('page-' + id);
  if (pageEl) pageEl.classList.add('active');
  
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.getElementById('nav-' + id)?.classList.add('active');
  
  document.getElementById('navLinks')?.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
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
    const step = target / 60;
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

  // Dynamically update counts on filter badges
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

// Book Search Logic
function searchBooks() {
  const query = document.getElementById('bookSearch')?.value.toLowerCase().trim() || '';
  const cards = document.querySelectorAll('.books-grid .book-card');

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    if (!query || text.includes(query)) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

// Secure Reusable PDF Modal Launcher (DOM API - XSS Safe)
function openPdfModal(pdfUrl, title) {
  const backdrop = document.getElementById('previewModal');
  const titleEl  = document.getElementById('modalTitle');
  const bodyEl   = document.getElementById('modalBody');

  if (!backdrop || !bodyEl) return;

  titleEl.textContent = title || 'Document Preview';
  bodyEl.innerHTML = '';

  const iframe = document.createElement('iframe');
  iframe.className = 'modal-iframe';
  iframe.src = pdfUrl + '#toolbar=1';
  iframe.title = title || 'PDF Document';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');

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

// Fixed Contact Form Handler (Captures Name, Email, Phone, Course, and Message)
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
  const arg = parts.slice(1).join(' ');

  switch (cmd) {
    case 'help':
      appendLine("Cybertrix Quick CLI Commands:");
      appendLine("  courses     — Navigate to courses page");
      appendLine("  books       — Navigate to free eBooks library");
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

    case 'books':
      showPage('books');
      appendLine(`[+] Navigated to Free eBooks section.`, 'success');
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
  setTimeout(animateCounters, 500);
  applyCourseFilters();
});
