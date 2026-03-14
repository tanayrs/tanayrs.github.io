# tanayrs.github.io — Portfolio Site

Personal academic portfolio for [Tanay Raghunandan Srinivasa](https://tanayrs.com).
Built with vanilla HTML, vanilla CSS, and vanilla JavaScript. No build step, no npm, no framework required.

---

## File Structure

```
index.html                    ← Main page
CNAME                         ← Custom domain (tanayrs.com)
assets/
  style.css                   ← All CSS (vanilla — no Tailwind)
  script.js                   ← Homepage logic
  project.js                  ← Project detail page logic
  marked.min.js               ← Local Markdown parser
content/
  bio.md                      ← Biography (plain Markdown)
  experience.md               ← Experience entries (<exp> blocks)
  publications.md             ← Publications (<pub> blocks)
  preprints.md                ← Preprints (<pub> blocks, hidden by default)
  projects.md                 ← Project cards (<project> blocks)
  awards.md                   ← Awards (<pub> blocks)
  project-details/
    <slug>.md                 ← One file per project detail page
projects/
  project-template.html       ← Universal project detail template (?id=<slug>)
docs/
  cv.pdf                      ← CV file linked in the header
```

---

## Updating Content

All site content lives in the `content/` directory as Markdown files.
Edit the relevant file and push — no build step needed.

### Bio

Edit `content/bio.md` — plain Markdown, no special tags needed.

```markdown
Tanay Raghunandan Srinivasa is a B.Tech graduate majoring in **Robotics and Autonomous Systems**...
```

### Experience

Edit `content/experience.md`. Wrap each entry in `<exp>` tags, newest first.

```markdown
<exp>
**Job Title** | Organisation (Month Year – Month Year)

One-line description of the role.
</exp>
```

### Publications

Edit `content/publications.md`. Wrap each entry in `<pub>` tags.

```markdown
<pub>
Author, A., **Srinivasa, T.R.** (2025). "Title." *Venue*. [DOI link text](https://doi.org/10.xxx/xxx)
</pub>
```

> **Important:** Always write DOIs as `[text](url)` Markdown links — never as raw text.
> Raw URLs containing underscores will be misread by the Markdown parser.

### Preprints

Edit `content/preprints.md` — same `<pub>` format as publications.
The Preprints section is hidden by default behind a "+ Show Preprints" toggle on the main page.

### Projects (cards on main page)

Edit `content/projects.md`. Wrap each project in `<project>` tags.
The first 6 cards are shown; a "Show More" button reveals the rest.

```markdown
<project>
**Project Title**

One or two sentence description of the project.

[View Details](projects/project-template.html?id=your-slug) · [GitHub](https://github.com/...)
</project>
```

Available link types per card (use whichever apply):
- `[View Details](projects/project-template.html?id=slug)` — links to the detail page
- `[GitHub](url)` — links to the repo
- `[Paper](url)` / `[arXiv](url)` / `[Poster](url)`

### Awards

Edit `content/awards.md` — same `<pub>` format.

```markdown
<pub>
**Award Name** | Year
Brief description of the recognition.
</pub>
```

### CV

Replace `docs/cv.pdf` with your updated CV. The filename must stay `cv.pdf`.

---

## Adding a New Project Detail Page

Each project can have a dedicated detail page powered by a single Markdown file.

### Step 1 — Create the Markdown file

Create `content/project-details/<slug>.md` where `<slug>` is a short, lowercase, hyphenated identifier.

**The first line must be a level-1 heading** — it becomes the page title and browser tab title.

```markdown
# Full Project Title

## Overview

Describe the motivation and goals...

## Approach

Explain the technical approach...

## Results

- Key finding 1
- Key finding 2

![Figure caption](https://github.com/user-attachments/assets/...)

[Paper](https://doi.org/10.xxx/xxx) · [GitHub](https://github.com/...)
```

### Step 2 — Add a card in projects.md

In `content/projects.md`, add or update the `<project>` block so that "View Details" points to your new slug:

```markdown
<project>
**My Project**

One-line description.

[View Details](projects/project-template.html?id=my-project)
</project>
```

The detail page is then live at:
`https://tanayrs.com/projects/project-template.html?id=my-project`

---

## Adding a New Section

To add a section like "Teaching" or "Talks":

**1. Create `content/teaching.md`** with `<exp>` or `<pub>` blocks, or plain Markdown.

**2. Add the section to `index.html`** before `</main>`:

```html
<section id="teaching-section">
  <h2>Teaching</h2>
  <div id="teaching-content"></div>
</section>
```

**3. Add a `loadContent` call in `assets/script.js`** at the bottom of the load block:

```js
loadContent('teaching.md', 'teaching-content');
```

---

## Local Development

No dev server is strictly required — the site is static HTML with no build step.
Because content is loaded via `fetch()`, a local server prevents CORS errors:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

---

## Deployment

The site deploys automatically via GitHub Pages on every push to `main`.
`CNAME` points GitHub Pages to `tanayrs.com`.

To update the site: edit a content file, commit, and push. Done.

---

## Styling

All styling is vanilla CSS in `assets/style.css`. No Tailwind, no build step.

### Design system

CSS variables are defined in `:root` and overridden in `html.dark`:

| Token group | Variables |
|---|---|
| Backgrounds | `--bg-primary`, `--bg-secondary`, `--card-bg` |
| Text | `--text-primary`, `--text-secondary`, `--text-muted` |
| Accent | `--accent`, `--accent-hover`, `--accent-dim` |
| Borders | `--border-subtle`, `--border-medium` |
| Fonts | `--font-sans` (Inter), `--font-serif` (Merriweather) |
| Type scale | `--text-xs` → `--text-3xl` |
| Spacing scale | `--space-xs` → `--space-3xl` |
| Shadows | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |

### Dark mode

Toggled by adding/removing the `dark` class on `<html>`. State is persisted to `localStorage` under the key `"theme"`. An anti-flash inline script in each `<head>` applies the class before first paint to prevent flicker.

### Project detail page layout

The project template (`projects/project-template.html`) uses a two-part layout:
- `.proj-topbar` — sticky top bar containing the back link and theme toggle
- `main.project-detail` — centred content area with `.proj-title` (h1) and `.project-body` (rendered Markdown)

The title and navigation controls are in separate elements and never share a flex/grid container.
