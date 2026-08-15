(function () {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  // Touch device fallback: disable custom cursor on touch screens for seamless native interaction
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia("(max-width: 768px)").matches;
  if (isTouchDevice) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    return;
  }

  let mx = -200, my = -200, rx = -200, ry = -200;
  const LERP = 0.2;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
  });

  (function loop() {
    rx += (mx - rx - 14) * LERP;
    ry += (my - ry - 14) * LERP;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();

  const bindHoverEvents = () => {
    document.querySelectorAll('a, button, input, select, textarea, .course-card, .teach-item, .blog-card, .cert-card, .skill-chip, .roadmap-domain, .contact-row, .why-item, .btn-cli-trigger').forEach(el => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = 'true';
      el.addEventListener('mouseenter', () => {
        ring.style.width = '44px'; ring.style.height = '44px';
        ring.style.borderColor = 'rgba(6, 182, 212, 0.8)';
      });
      el.addEventListener('mouseleave', () => {
        ring.style.width = '28px'; ring.style.height = '28px';
        ring.style.borderColor = 'rgba(6, 182, 212, 0.4)';
      });
    });
  };

  bindHoverEvents();
  document.addEventListener('DOMContentLoaded', bindHoverEvents);

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();
