document.addEventListener('DOMContentLoaded', () => {
  marked.use({ breaks: true, gfm: true });

  // ── Hamburger menu ──────────────────────────────────────────
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('header nav');
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('is-active');
    menuToggle.classList.toggle('is-active');
  });
  // Close nav on outside click or nav-link click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
      nav.classList.remove('is-active');
      menuToggle.classList.remove('is-active');
    }
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-active');
      menuToggle.classList.remove('is-active');
    });
  });

  // ── Content loading ──────────────────────────────────────────
  const INITIAL_VISIBLE = 6;

  function loadContent(file, containerId, options = {}) {
    fetch('content/' + file)
      .then(r => { if (!r.ok) throw new Error(file); return r.text(); })
      .then(text => {
        const container = document.getElementById(containerId);

        if (options.project) {
          // ── Project cards ────────────────────────────────
          const regex = /<project>([\s\S]*?)<\/project>/g;
          let cards = '';
          let i = 0;
          let match;
          while ((match = regex.exec(text)) !== null) {
            const hidden = i >= INITIAL_VISIBLE ? 'hidden' : '';
            const inner = marked.parse(match[1].trim());
            cards += `<div class="project-card ${hidden}" data-index="${i}">${inner}</div>`;
            i++;
          }
          let html = `<div class="projects-grid">${cards}</div>`;
          if (i > INITIAL_VISIBLE) {
            html += `<button class="show-more-btn" onclick="toggleProjects()">Show More</button>`;
          }
          container.innerHTML = html;

        } else {
          // ── Pub / Exp entries ─────────────────────────────
          let processed = text;
          processed = processed.replace(
            /<pub>([\s\S]*?)<\/pub>/g,
            (_, c) => `<div class="pub">${marked.parse(c.trim())}</div>`
          );
          processed = processed.replace(
            /<exp>([\s\S]*?)<\/exp>/g,
            (_, c) => `<div class="exp">${marked.parse(c.trim())}</div>`
          );
          // Plain markdown fallback (bio, etc.)
          container.innerHTML = (processed === text)
            ? marked.parse(text)
            : processed;
        }
      })
      .catch(() => {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = `<p style="color: #e74c3c;">Error loading ${file}.</p>`;
      });
  }

  // ── Show More / Less ─────────────────────────────────────────
  window.toggleProjects = () => {
    const allCards = document.querySelectorAll('.project-card');
    const btn = document.querySelector('.show-more-btn');
    const hasHidden = document.querySelector('.project-card.hidden');
    if (hasHidden) {
      allCards.forEach(c => c.classList.remove('hidden'));
      btn.textContent = 'Show Less';
    } else {
      allCards.forEach((c, i) => {
        if (i >= INITIAL_VISIBLE) c.classList.add('hidden');
      });
      btn.textContent = 'Show More';
    }
  };

  // ── Preprints toggle ─────────────────────────────────────────
  window.togglePreprints = () => {
    const section = document.getElementById('preprints-section');
    const btn = document.getElementById('preprints-toggle-btn');
    const isHidden = section.classList.contains('hidden');
    section.classList.toggle('hidden', !isHidden);
    btn.textContent = isHidden ? '− Hide Preprints' : '+ Show Preprints';
  };

  // ── Dark mode ────────────────────────────────────────────────
  const themeSwitch = document.getElementById('theme-switch');
  const applyTheme = (isDark) => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeSwitch.checked = isDark;
  };
  themeSwitch.addEventListener('change', () => applyTheme(themeSwitch.checked));
  // Sync checkbox with theme already set by anti-flash script in <head>
  themeSwitch.checked = document.documentElement.classList.contains('dark');

  // ── Load all sections ─────────────────────────────────────────
  loadContent('bio.md',          'bio-content');
  loadContent('experience.md',   'experience-content');
  loadContent('publications.md', 'publications-content');
  loadContent('preprints.md',    'preprints-content');
  loadContent('projects.md',     'projects-content', { project: true });
  loadContent('awards.md',       'awards-content');
});
