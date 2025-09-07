document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('header nav');

  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('is-active');
    menuToggle.classList.toggle('is-active');
  });

  const markdownToHtml = (text) => {
    let html = text;
    // Links - process first to avoid conflicts with other formatting
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italics
    html = html.replace(/__(.*?)__/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return html;
  };

  const loadContent = (file, containerId, isProject = false) => {
    fetch(`content/${file}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok for ${file}`);
        }
        return response.text();
      })
      .then(text => {
        const container = document.getElementById(containerId);
        let html;

        if (isProject) {
          const projectRegex = /<project>([\s\S]*?)<\/project>/g;
          let projectsHtml = '<div class="projects-grid">';
          let match;
          let projectIndex = 0;
          while ((match = projectRegex.exec(text)) !== null) {
            const hiddenClass = projectIndex >= 6 ? ' hidden' : '';
            projectsHtml += `<div class="project-card${hiddenClass}" data-index="${projectIndex}">${markdownToHtml(match[1])}</div>`;
            projectIndex++;
          }
          projectsHtml += '</div>';

          // Add show more button if there are more than 6 projects
          if (projectIndex > 6) {
            projectsHtml += '<button class="show-more-btn" onclick="toggleProjects()">Show More</button>';
          }
          
          html = projectsHtml;
        } else {
          let processedText = text;
          processedText = processedText.replace(/<pub>([\s\S]*?)<\/pub>/g, (match, content) => `<div class="pub">${markdownToHtml(content)}</div>`);
          processedText = processedText.replace(/<exp>([\s\S]*?)<\/exp>/g, (match, content) => `<div class="exp">${markdownToHtml(content)}</div>`);
          
          // For files without custom tags like bio.md
          if (text === processedText) {
            html = markdownToHtml(text);
          } else {
            html = processedText;
          }
        }
        
        container.innerHTML = html;
      })
      .catch(error => {
        console.error(`Error fetching or parsing content for ${file}:`, error);
        const container = document.getElementById(containerId);
        if(container) container.innerHTML = `<p>Error loading content from ${file}.</p>`;
      });
  };

  // Global function for toggling projects
  window.toggleProjects = () => {
    const hiddenProjects = document.querySelectorAll('.project-card.hidden');
    const visibleProjects = document.querySelectorAll('.project-card:not(.hidden)');
    const button = document.querySelector('.show-more-btn');
    
    if (hiddenProjects.length > 0) {
      // Show hidden projects
      hiddenProjects.forEach(project => {
        project.classList.remove('hidden');
      });
      button.textContent = 'Show Less';
    } else {
      // Hide projects beyond the first 4
      const allProjects = document.querySelectorAll('.project-card');
      allProjects.forEach((project, index) => {
        if (index >= 4) {
          project.classList.add('hidden');
        }
      });
      button.textContent = 'Show More';
    }
  };

  loadContent('bio.md', 'bio-content');
  loadContent('experience.md', 'experience-content');
  loadContent('publications.md', 'publications-content');
  loadContent('projects.md', 'projects-content', true);
  loadContent('awards.md', 'awards-content');


  // Dark mode toggle
  const themeSwitch = document.getElementById('theme-switch');
  themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  });

  // Apply saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark') {
      themeSwitch.checked = true;
    }
  }
});
