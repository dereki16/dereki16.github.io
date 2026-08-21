// ============================================================
// apps.js — data + render for the Apps section
//
// Changes this round:
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

// descriptionHome vs descriptionFull: index.html and apps.html were
// rendering the exact same wording since both call renderFeaturedApp()
// against the same object. Split so each context gets its own voice —
// shorter/hookier for the homepage teaser, the fuller technical rundown
// for people who've already clicked through to the dedicated apps page.
const featuredApp = {
  title: 'Sound Simulation',
  link: 'https://github.com/dereki16/audio_metadata_editor',
  // Screenshot confirmed at webp/ss.webp
  imgSrc: 'webp/ss.webp',
  year: '2025',
  descriptionHome: "<span id=\"ss\" class=\"feature-bold\">Managing a large audio library sucks.</span> I may not call myself an audiophile, but I do love music and can be particular about some things... like unnecessarily long outros and miscategorized file tags.",
  descriptionFull: "A desktop audio metadata editor built in Python with QSS styling. Browse a folder of audio files, edit ID3-style tags (title, artist, album, year, genre, composer, disc number), manage cover art, visualize waveforms with adjustable smoothing, and trim/crop audio options — plus bulk clean metadata and filenames across a whole library at once.",
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

function renderFeaturedApp() {
  const el = document.getElementById('featured-app');
  if (!el) return;
  const a = featuredApp;
  const isFullPage = document.body.classList.contains('page-apps');
  const description = isFullPage ? a.descriptionFull : a.descriptionHome;
  const mediaHtml = a.video
    ? `<video src="${a.video}" autoplay muted loop playsinline controls></video>`
    : `<img src="${a.imgSrc}" alt="" onerror="this.remove()">`;
  el.innerHTML = `
    <div class="feature-media feature-media--tall${a.video ? '' : ' feature-media--contain'}">
      ${mediaHtml}
    </div>
    <div class="feature-body">
      <span class="tag tag-featured">featured app · ${a.year}</span>
      <h3 class="feature-title">${a.title}</h3>
      <p class="feature-desc">${description}</p>
      <p class="feature-credits">${a.credits}</p>
      <div class="card-tags">${a.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="feature-actions">
        <a class="btn btn-ghost" href="${a.link}" target="_blank" rel="noreferrer">View repo ↗</a>
      </div>
    </div>
  `;
}

function renderAppRows() {
  const container = document.getElementById('apps-rows');
  if (!container) return;

  apps.forEach(app => {
    const el = document.createElement('div');
    el.className = 'row-project';
    el.id = app.title.replace(/\s+/g, '-');
    el.style.scrollMarginTop = '76px';

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