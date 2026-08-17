// ============================================================
// websites.js — data + render for the Websites section
// Split out from projects.js per request.
// ============================================================

// Tectonian gets its own featured, full-width row (see index.html /
// renderFeatured below). Copy below is pulled from tectonian.com's real
// content — feel free to adjust tone/voice, but the facts are accurate.
const featuredWebsite = {
  title: 'Tectonian',
  link: 'https://tectonian.com',
  imgSrc: 'webp/tectonian.webp',
  year: '2026',
  description: "Tectonian is a visual mind-mapping app I founded and built for ADHD, autistic, and neurodivergent thinkers — a product, not client work, and something I'm growing on its own. It turns overwhelming ideas into structured, unlockable paths with physics-based node layouts: lock branches behind checklists so you're only ever facing what's actually doable right now, use Focus Mode to hide the noise and concentrate on one branch, or let Random Task Focus pick your next move when decision fatigue sets in. Everything's end-to-end encrypted — zero-knowledge, so even Tectonian itself can't read your data.",
  tags: [],
};

// Tectonian (featured card) + these first 2 = 3 total visible by
// default: Liminal Webs (agency work) and Razor Movies (most
// technically different stack — ASP.NET/C#/Azure vs. everything else
// being JS-based). Everything else collapsed behind "Show more."
// Years: Liminal Webs/Cosecha/Transient Ink pulled from your resume's
// actual employment dates. Razor Movies and Popper are your own calls.
const websites = [
  {
    title: 'Liminal Webs',
    link: 'https://liminalwebs.com/',
    imgSrc: 'webp/liminal-webs.webp',
    repoLink: '',
    iconType: '',
    year: '2024',
    description: "Founded an online web development and design agency based in California to help support small businesses with affordable prices.",
    tags: ["GSAP", "Firebase", "Cloudflare"],
  },
  {
    title: 'Razor Movies',
    link: 'razor-movies.html',
    imgSrc: 'webp/RazorMovies.webp',
    repoLink: 'https://github.com/dereki16/Razor-Movies-Project',
    iconType: 'github',
    year: '2023',
    description: "Built a responsive movie site supporting CRUD operations, using The Movie Database API for data. Later taken offline due to ongoing database hosting costs.",
    tags: ["ASP.NET", "TMDb API", "Azure"],
  },
  {
    title: 'Cosecha Church',
    link: 'https://cosecha-db18b.web.app/',
    imgSrc: 'webp/cosecha-church.webp',
    repoLink: 'https://github.com/dereki16',
    iconType: 'github',
    year: '2023',
    description: "Volunteered services to help revitalize the online presence of a local Riverside Spanish church.",
    tags: ["Firebase"],
  },
  {
    title: 'Job App Bud',
    link: 'https://jobappbud.com/',
    imgSrc: 'webp/app-buddy.webp',
    repoLink: 'https://github.com/dereki16/application-buddy',
    iconType: 'github',
    year: '2024',
    description: "Crafted a web app meant to streamline the job application process. Integrated ChatGPT's API and built a chatbot to help users in their job search.",
    tags: ["ChatGPT API", "Bootstrap"],
  },
  {
    title: 'Transient Ink',
    link: 'https://liminalwebs.com/projects/transient-ink.html',
    imgSrc: 'webp/transient.webp',
    repoLink: '',
    iconType: '',
    year: '2023',
    description: "Established an online business presence through the Shopify platform, centered around selling temporary tattoos and accessories, with more to come.",
    tags: ["Shopify", "Liquid"],
  },
  {
    title: 'Popper',
    link: 'https://poppers-landing-page.web.app/',
    imgSrc: 'webp/popper.png',
    repoLink: '',
    iconType: '',
    year: '2021',
    description: "Developed a dynamic landing page for a social media app. Integrated MailerLite and GSAP animations.",
    tags: ["AJAX", "jQuery", "Bootstrap", "MailerLite", "GSAP"],
  },
];

function renderFeaturedWebsite() {
  const el = document.getElementById('featured-website');
  if (!el) return;
  const p = featuredWebsite;
  el.href = p.link;
  el.target = '_blank';
  el.rel = 'noreferrer';
  el.innerHTML = `
    <div class="feature-media"><img src="${p.imgSrc}" alt="" onerror="this.remove()"></div>
    <div class="feature-body">
      <span class="tag tag-featured">featured project · ${p.year}</span>
      <h3 class="feature-title">${p.title}</h3>
      <p class="feature-desc">${p.description}</p>
      <span class="feature-link">Visit tectonian.com ↗</span>
    </div>
  `;
}

// Tectonian (the featured card above) counts as one of the "3" — so
// only 2 more show here by default: Liminal Webs + Razor Movies.
const COLLAPSE_AFTER = 2;

function renderWebsites() {
  const container = document.getElementById('website-rows');
  if (!container) return;

  websites.forEach((site, index) => {
    const el = document.createElement('a');
    el.href = site.link;
    el.target = '_blank';
    el.rel = 'noreferrer';
    el.className = 'row-project';
    if (index >= COLLAPSE_AFTER) {
      el.classList.add('row-collapsed');
    }

    const tagsHtml = site.tags.length
      ? `<div class="card-tags">${site.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`
      : '';

    const repoHtml = site.repoLink
      ? `<a class="row-repo fa fa-${site.iconType === 'linkedin' ? 'linkedin' : 'github'}" href="${site.repoLink}" target="_blank" rel="noreferrer" aria-label="View repo" onclick="event.stopPropagation()"></a>`
      : '';

    el.innerHTML = `
      <div class="row-media"><img src="${site.imgSrc}" alt="" onerror="this.remove()"></div>
      <div class="row-body">
        ${site.year ? `<span class="tag row-year">${site.year}</span>` : ''}
        <div class="row-title-row">
          <span class="row-title">${site.title}</span>
          ${repoHtml}
        </div>
        <p class="row-desc">${site.description}</p>
        ${tagsHtml}
      </div>
    `;
    container.appendChild(el);
  });

  if (websites.length > COLLAPSE_AFTER) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'row-expand-toggle';
    toggle.textContent = `Show ${websites.length - COLLAPSE_AFTER} more ↓`;
    toggle.addEventListener('click', () => {
      const collapsed = container.classList.toggle('is-expanded');
      toggle.textContent = collapsed
        ? 'Show less ↑'
        : `Show ${websites.length - COLLAPSE_AFTER} more ↓`;
    });
    // Insert right before the "built with" note specifically, rather
    // than container.after() (which landed it below that note instead
    // of above, since the note is the next sibling in the static HTML).
    const builtWithNote = document.getElementById('websitesBuiltWith');
    if (builtWithNote) {
      builtWithNote.before(toggle);
    } else {
      container.after(toggle);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderFeaturedWebsite();
  renderWebsites();
});