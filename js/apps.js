// ============================================================
// apps.js — data + render for the Apps section
//
// Changes this round:
// - Title+tag ABOVE the card is now apps-page-only. On the homepage,
//   title+tag are back where they started: under the image, inside
//   the card's own body.
// - Auto-height media (.feature-media--auto, no more letterboxing) and
//   the hover "view larger" + lightbox now apply on BOTH pages, not
//   just the full apps page.
// - Only the extra-wide card breakout (.feature-card--wide, 1480px
//   cap) and the widened description/highlights max-width stay
//   apps-page-only — that's the one exception that needs the extra
//   horizontal room the homepage doesn't have to spare.
// - Added a small hover-only "view larger" button + lightbox on the
//   SS screenshot. Hidden on touch/mobile.
// - Featured slot is now Sound Simulation (Python/QSS desktop app,
//   github.com/dereki16/audio_metadata_editor) — no video yet, so this
//   uses an image. TODO: add the screenshot to webp/ and confirm the
//   filename below; swap for a video once you've got a recording.
// - Fragmented removed from Apps entirely — it's already covered on the
//   Games page, no need for it in both places.
// - iTag reverted to the same shape as every other app: one row, one
//   video each, no more multi-video grid. Its two clips are now two
//   separate rows, styled identically to Flixter/Tweeter/Parstagram —
//   this is what "back to how the rest of the apps work" means in data
//   terms. Simpler, and stops the layout fighting itself every round.
// ============================================================

// descriptionHome vs the Overview/Highlights pair below: index.html and
// apps.html were rendering the exact same wording since both call
// renderFeaturedApp() against the same object. descriptionHome stays a
// short, hooky teaser for the homepage; the apps page gets a proper
// Overview + Technical Highlights breakdown instead of one dense
// paragraph — structured content people will actually skim and read,
// not a wall of text. (See renderFeaturedApp() below for how the split
// is decided — by whether document.body has the page-apps class.)
const featuredApp = {
  title: 'Sound Simulation',
  link: 'https://github.com/dereki16/audio_metadata_editor',
  // Screenshot confirmed at webp/ss.webp
  imgSrc: 'webp/ss.webp',
  year: '2025',
  descriptionHome: "<span id=\"ss\" class=\"feature-bold\">Managing a large audio library sucks.</span> I may not call myself an audiophile, but I do love music and can be particular about some things... like unnecessarily long outros and miscategorized file tags.",
  overviewFull: "Sound Simulation is a desktop audio management and metadata editor built in Python, designed to make the tedious parts of maintaining a large audio library faster — especially cleaning up inconsistent metadata across multiple files. It supports individual and bulk metadata editing, cover-art management, filename cleanup, waveform visualization, and audio trimming.",
  highlightsFull: [
    "Bulk editing and cleanup of metadata and filenames across an entire library",
    "ID3-style metadata management — title, artist, album, genre, composer, year, and disc number",
    "Waveform visualization with adjustable smoothing",
    "Audio trimming and cropping",
    "Cover-art management",
    "Custom desktop interface styled with QSS",
  ],
  credits: "Built as a personal tool for managing and cleaning up my own music library.",
  tags: ["Python", "Pyside6", "QSS", "Mutagen", "Pydub", "PyQtGraph"],
};

// TODO: years below are a placeholder guess tied to your CodePath iOS
// Development cert timing (May 2020) on your resume, not confirmed dates —
// swap in the real ones per app.
const apps = [
  {
    title: 'iTag',
    videos: [
      { src: 'vids/itagvid1.mp4', alt: 'Augmented reality demonstration-1.' },
      { src: 'vids/itagvid2.mp4', alt: 'Video 2' },
    ],
    repoLink: 'https://github.com/dereki16/iTag',
    description: 'Collaboratively developed "iTag," an augmented reality game app, enabling players to sign up and engage in virtual tag matches.',
    year: '2020',
  },
  {
    title: 'Flixter',
    video: 'vids/flixtervid.mp4',
    repoLink: 'https://github.com/dereki16/flixter',
    description: 'Created a movie browsing application, akin to Netflix, allowing users to select movies and delve into detailed overviews.',
    year: '2020',
  },
  {
    title: 'Tweeter',
    video: 'vids/tweetervid.mp4',
    repoLink: 'https://github.com/dereki16/tweeter',
    description: 'Engineered a Twitter replica, showcasing tweets complete with user profile pics, usernames, and content.',
    year: '2020',
  },
  {
    title: 'Parstagram',
    video: 'vids/parstagramvid.mp4',
    repoLink: 'https://github.com/dereki16/Parstagram',
    description: 'Constructed an Instagram-inspired platform with a tailored Parse backend, facilitating photo posting and a global feed viewing.',
    year: '2020',
  },
  // {
  //     title: 'Tippy',
  //     video: 'vids/tippyvid.mp4',
  //     repoLink: 'https://github.com/dereki16/big-tipper',
  //     description: 'Designed an iOS calculator app that recommends tip amounts based on the entered bill value.'
  // }
];

// Non-obtrusive "view larger" lightbox — used for the SS screenshot on
// the full apps page. Created lazily, once, and appended to <body> so
// it can overlay everything regardless of where it was triggered from.
// This is deliberately just a plain click-to-open/click-to-close view,
// independent of the browser's own pinch/ctrl-scroll zoom — the two
// never interact, so there's no risk of "double zooming."
function ensureLightbox() {
  let lb = document.getElementById('imgLightbox');
  if (lb) return lb;
  lb = document.createElement('div');
  lb.id = 'imgLightbox';
  lb.className = 'img-lightbox';
  lb.innerHTML = `
    <button type="button" class="img-lightbox-close" aria-label="Close">&times;</button>
    <img src="" alt="">
  `;
  document.body.appendChild(lb);
  lb.addEventListener('click', (e) => {
    if (e.target === lb || e.target.classList.contains('img-lightbox-close')) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
  return lb;
}
function openLightbox(src, alt) {
  const lb = ensureLightbox();
  const img = lb.querySelector('img');
  img.src = src;
  img.alt = alt || '';
  lb.classList.add('is-open');
  document.body.classList.add('lightbox-open');
}
function closeLightbox() {
  const lb = document.getElementById('imgLightbox');
  if (!lb) return;
  lb.classList.remove('is-open');
  document.body.classList.remove('lightbox-open');
}

function renderFeaturedApp() {
  const el = document.getElementById('featured-app');
  if (!el) return;
  const a = featuredApp;
  const isFullPage = document.body.classList.contains('page-apps');
  const isImage = !a.video;
  const mediaHtml = a.video
    ? `<video src="${a.video}" autoplay muted loop playsinline controls></video>`
    : `<img src="${a.imgSrc}" alt="" onerror="this.remove()">`;

  const bodyContentHtml = (isFullPage && a.overviewFull)
    ? `
      <h4 class="feature-subhead">Overview</h4>
      <p class="feature-desc">${a.overviewFull}</p>
      ${a.highlightsFull ? `
        <h4 class="feature-subhead">Technical Highlights</h4>
        <ul class="feature-highlights">${a.highlightsFull.map(h => `<li>${h}</li>`).join('')}</ul>
      ` : ''}
    `
    : `<p class="feature-desc">${a.descriptionHome}</p>`;

  // Title + year, on one line. On the full apps page this renders as a
  // header ABOVE the card; on the homepage it stays under the image,
  // inside the card's own body — same spot it always was.
  const titleTagHtml = `<span class="tag tag-featured">featured app · ${a.year}</span><h3 class="feature-title">${a.title}</h3>`;

  if (isFullPage) {
    el.insertAdjacentHTML('beforebegin', `
      <div class="feature-header feature-header--wide">
        <h3 class="feature-title">${a.title}</h3>
        <span class="tag tag-featured">${a.year}</span>
      </div>
    `);
  }
  // Wide breakout is a full-apps-page-only exception — the homepage
  // teaser keeps the normal-size card.
  el.classList.toggle('feature-card--wide', isFullPage);

  // Auto-height media (no letterboxing) and the hover zoom apply on
  // both pages now — any time SS's media is an image.
  const mediaClasses = [
    'feature-media',
    'feature-media--tall',
    isImage ? 'feature-media--contain feature-media--auto zoomable-media' : '',
  ].filter(Boolean).join(' ');
  const zoomBtnHtml = isImage
    ? `<button type="button" class="media-zoom-btn" aria-label="View larger image"><i class="fa fa-search-plus"></i></button>`
    : '';

  el.innerHTML = `
    <div class="${mediaClasses}">
      ${mediaHtml}
      ${zoomBtnHtml}
    </div>
    <div class="feature-body">
      ${isFullPage ? '' : titleTagHtml}
      ${bodyContentHtml}
      <p class="feature-credits">${a.credits}</p>
      <div class="card-tags">${a.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="feature-actions">
        <a class="btn btn-ghost" href="${a.link}" target="_blank" rel="noreferrer">View repo ↗</a>
      </div>
    </div>
  `;

  if (isImage) {
    const zoomBtn = el.querySelector('.media-zoom-btn');
    if (zoomBtn) zoomBtn.addEventListener('click', () => openLightbox(a.imgSrc, a.title));
  }
}

function renderAppRows() {
  const container = document.getElementById('apps-rows');
  if (!container) return;

  apps.forEach(app => {
    const el = document.createElement('div');
    el.className = 'row-project';
    el.id = app.title.replace(/\s+/g, '-');
    el.style.scrollMarginTop = '58px'; // matches .tabbar's real rendered height, see style.css

    const mediaHtml = app.videos
      ? `<div class="row-media row-media-multi">${app.videos.map(v => `<video src="${v.src}" alt="${v.alt}" autoplay muted loop playsinline controls></video>`).join('')}</div>`
      : `<div class="row-media row-media--contain"><video src="${app.video}" autoplay muted loop playsinline controls></video></div>`;

    el.innerHTML = `
      ${mediaHtml}
      <div class="row-body">
        <span class="tag tag-featured">${app.year}</span>
        <div class="row-title-row">
          <span class="row-title">${app.title}</span>
          <a class="row-repo fa fa-github" href="${app.repoLink}" target="_blank" rel="noreferrer" aria-label="View repo"></a>
        </div>
        <p class="row-desc">${app.description}</p>
      </div>
    `;
    container.appendChild(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderFeaturedApp();
  renderAppRows();
});