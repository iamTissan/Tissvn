/* ============================================
   TISSAN PORTFOLIO — main.js
   ============================================ */

/* ---- CURSOR ---- */
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');

let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});

function animateRing() {
  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, button, [onclick], .theme-toggle, .search-btn, .c-toggle, .c-btn, .c-tooltip-trigger').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* ---- THEME ---- */
function toggleTheme() {
  const html = document.documentElement;
  const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
  html.dataset.theme = next;
  localStorage.setItem('tissan-theme', next);
}

(function initTheme() {
  const saved = localStorage.getItem('tissan-theme');
  if (saved) document.documentElement.dataset.theme = saved;
})();

/* ---- PAGE SWITCHING ---- */
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + name);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Re-observe fade-ups on components page
  if (name === 'components') observeFadeUps();
}

/* ---- SEARCH ---- */
const searchData = [
  { label: 'About / Hero', section: 'main', anchor: '#', icon: '◉', group: 'Main' },
  { label: 'My Stack', section: 'main', anchor: '#stack', icon: '◈', group: 'Main' },
  { label: 'Projects', section: 'main', anchor: '#projects', icon: '⬡', group: 'Main' },
  { label: 'Experience', section: 'main', anchor: '#experience', icon: '◎', group: 'Main' },
  { label: 'Open Source', section: 'main', anchor: '#opensource', icon: '⌥', group: 'Main' },
  { label: 'GitHub Contributions', section: 'main', anchor: '#github', icon: '⬡', group: 'Main' },
  { label: 'Spotify', section: 'main', anchor: '#spotify', icon: '♫', group: 'Main' },
  { label: 'Contact', section: 'main', anchor: '#contact', icon: '✉', group: 'Main' },
  { label: 'Components', section: 'components', anchor: '#', icon: '◈', group: 'Pages' },
  { label: 'Button Variants', section: 'components', anchor: '#', icon: '→', group: 'Components' },
  { label: 'Status Badges', section: 'components', anchor: '#', icon: '→', group: 'Components' },
  { label: 'Info Card', section: 'components', anchor: '#', icon: '→', group: 'Components' },
  { label: 'Text Input', section: 'components', anchor: '#', icon: '→', group: 'Components' },
  { label: 'Tooltip', section: 'components', anchor: '#', icon: '→', group: 'Components' },
  { label: 'Avatar Group', section: 'components', anchor: '#', icon: '→', group: 'Components' },
  { label: 'Toggle Switch', section: 'components', anchor: '#', icon: '→', group: 'Components' },
  { label: 'GitHub — iamTissan', section: 'main', anchor: '#github', icon: '⬡', group: 'External' },
  { label: 'Drips Network Profile', section: 'main', anchor: '#opensource', icon: '⌥', group: 'External' },
];

function openSearch() {
  document.getElementById('searchOverlay').classList.add('open');
  document.getElementById('searchInput').value = '';
  document.getElementById('searchInput').focus();
  renderSearch('');
}

function closeSearch() {
  document.getElementById('searchOverlay').classList.remove('open');
}

function renderSearch(q) {
  const el = document.getElementById('searchResults');
  const filtered = q.trim()
    ? searchData.filter(d => d.label.toLowerCase().includes(q.toLowerCase()))
    : searchData;

  if (!filtered.length) {
    el.innerHTML = '<div class="search-empty">No results for "' + q + '"</div>';
    return;
  }

  // Group results
  const groups = {};
  filtered.forEach(d => {
    if (!groups[d.group]) groups[d.group] = [];
    groups[d.group].push(d);
  });

  let html = '';
  for (const [group, items] of Object.entries(groups)) {
    html += `<div class="search-section-label">${group}</div>`;
    items.forEach(d => {
      html += `<a class="search-result" href="${d.anchor}"
        onclick="showPage('${d.section}'); closeSearch(); ${d.anchor !== '#' ? `setTimeout(()=>{ const t=document.querySelector('${d.anchor}'); if(t) t.scrollIntoView({behavior:'smooth'}); },200);` : ''}return false;">
        <span class="search-result-icon">${d.icon}</span>
        <span>${d.label}</span>
      </a>`;
    });
  }
  el.innerHTML = html;
}

document.getElementById('searchInput').addEventListener('input', e => renderSearch(e.target.value));

document.getElementById('searchOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeSearch();
});

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); openSearch(); }
  if (e.key === 'Escape') closeSearch();
});

/* ---- SCROLL ANIMATIONS ---- */
function observeFadeUps() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.fade-up').forEach(el => {
    if (!el.classList.contains('visible')) observer.observe(el);
  });
}

observeFadeUps();

/* ---- TOGGLE COMPONENT ---- */
document.querySelectorAll('.c-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('on');
    toggle.classList.toggle('off');
  });
});
