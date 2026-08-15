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
  description: "Tectonian is a visual mind-mapping app I founded and built for ADHD, autistic, and neurodivergent thinkers — a product, not client work, and something I'm growing on its own. It turns overwhelming ideas into structured, unlockable paths with physics-based node layouts: lock branches behind checklists so you're only ever facing what's actually doable right now, use Focus Mode to hide the noise and concentrate on one branch, or let Random Task Focus pick your next move when decision fatigue sets in. Everything's end-to-end encrypted — zero-knowledge, so even Tectonian itself can't read your data.",
  tags: [],
};

// Remaining websites, rendered 2-per-row. Order kept roughly as before;
// re-order freely.
const websites = [
  {
    title: 'Liminal Webs',
    link: 'https://liminalwebs.com/',
    imgSrc: 'webp/liminal-webs.webp',
    repoLink: '',
    iconType: '',
    description: "Founded an online web development and design agency based in California to help support small businesses with affordable prices.",
    tags: ["GSAP", "Firebase", "Cloudflare"],
  },
  {
    title: 'Cosecha Church',
    link: 'https://cosecha-db18b.web.app/',
    imgSrc: 'webp/cosecha-church.webp',
    repoLink: 'https://github.com/dereki16',
    iconType: 'github',
    description: "Volunteered services to help revitalize the online presence of a local Riverside Spanish church.",
    tags: ["Firebase"],
  },
  {
    title: 'Job App Bud',
    link: 'https://jobappbud.com/',
    imgSrc: 'webp/app-buddy.webp',
    repoLink: 'https://github.com/dereki16/application-buddy',
    iconType: 'github',
    description: "Crafted a web app meant to streamline the job application process. Integrated ChatGPT's API and built a chatbot to help users in their job search.",
    tags: ["ChatGPT API"],
  },
  {
    title: 'Transient Ink',
    link: 'https://liminalwebs.com/projects/transient-ink.html',
    imgSrc: 'webp/transient.webp',
    repoLink: '',
    iconType: '',
    description: "Established an online business presence through the Shopify platform, centered around selling temporary tattoos and accessories, with more to come.",
    tags: ["Shopify"],
  },
  {
    title: 'Popper',
    link: 'https://poppers-landing-page.web.app/',
    imgSrc: 'webp/popper.png',
    repoLink: '',
    iconType: '',
    description: "Developed a dynamic landing page for a social media app. Integrated MailerLite and GSAP animations.",
    tags: ["AJAX", "jQuery", "Bootstrap", "MailerLite", "GSAP"],
  },
  {
    title: 'Razor Movies',
    link: 'razor-movies.html',
    imgSrc: 'webp/RazorMovies.webp',
    repoLink: 'https://github.com/dereki16/Razor-Movies-Project',
    iconType: 'github',
    description: "Built a responsive movie site supporting CRUD operations, using The Movie Database API for data. Later taken offline due to ongoing database hosting costs.",
    tags: ["ASP.NET", "TMDb API", "Azure"],
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
      <span class="tag tag-featured">featured project</span>
      <h3 class="feature-title">${p.title}</h3>
      <p class="feature-desc">${p.description}</p>
      <span class="feature-link">Visit tectonian.com ↗</span>
    </div>
  `;
}

function renderWebsites() {
  const container = document.getElementById('website-rows');
  if (!container) return;

  websites.forEach(site => {
    const el = document.createElement('a');
    el.href = site.link;
    el.target = '_blank';
    el.rel = 'noreferrer';
    el.className = 'row-project';

    const tagsHtml = site.tags.length
      ? `<div class="card-tags">${site.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`
      : '';

    const repoHtml = site.repoLink
      ? `<a class="row-repo fa fa-${site.iconType === 'linkedin' ? 'linkedin' : 'github'}" href="${site.repoLink}" target="_blank" rel="noreferrer" aria-label="View repo" onclick="event.stopPropagation()"></a>`
      : '';

    el.innerHTML = `
      <div class="row-media"><img src="${site.imgSrc}" alt="" onerror="this.remove()"></div>
      <div class="row-body">
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
}

document.addEventListener('DOMContentLoaded', () => {
  renderFeaturedWebsite();
  renderWebsites();
});