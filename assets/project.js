document.addEventListener('DOMContentLoaded', () => {
  marked.use({ breaks: true, gfm: true });

  // ── Theme toggle ─────────────────────────────────────────────
  const themeSwitch = document.getElementById('theme-switch');
  themeSwitch.checked = document.documentElement.classList.contains('dark');
  themeSwitch.addEventListener('change', () => {
    const isDark = themeSwitch.checked;
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // ── Load project from ?id= param ─────────────────────────────
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');

  if (!projectId) {
    document.getElementById('project-content').innerHTML =
      '<p class="text-red-500">Error: No project ID specified.</p>';
    return;
  }

  fetch(`../content/project-details/${projectId}.md`)
    .then(r => {
      if (!r.ok) throw new Error(`Project not found: ${projectId}`);
      return r.text();
    })
    .then(markdown => {
      const lines = markdown.split('\n');
      let title = 'Project Details';
      let body = markdown;

      if (lines[0].startsWith('# ')) {
        title = lines[0].substring(2).trim();
        body = lines.slice(1).join('\n');
      }

      document.getElementById('page-title').textContent =
        `Tanay Raghunandan Srinivasa — ${title}`;
      document.getElementById('project-title').textContent = title;

      // Protect math blocks from marked: extract them into placeholders
      // before parsing, then re-inject so MathJax sees the original TeX.
      const mathBlocks = [];
      const protect = body
        .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
          mathBlocks.push({ display: true, tex });
          return `@@MATHBLOCK${mathBlocks.length - 1}@@`;
        })
        .replace(/\$([^\n$]+?)\$/g, (_, tex) => {
          mathBlocks.push({ display: false, tex });
          return `@@MATHBLOCK${mathBlocks.length - 1}@@`;
        });

      let html = marked.parse(protect);
      html = html.replace(/@@MATHBLOCK(\d+)@@/g, (_, i) => {
        const { display, tex } = mathBlocks[+i];
        return display ? `$$${tex}$$` : `$${tex}$`;
      });

      document.getElementById('project-content').innerHTML = html;

      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([document.getElementById('project-content')])
          .catch(err => console.error('MathJax typeset failed:', err));
      }
    })
    .catch(err => {
      document.getElementById('project-content').innerHTML =
        `<p class="text-red-500">Error: ${err.message}</p>`;
    });
});
