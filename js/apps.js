// ============================================================
// apps.js — data + render for the Apps section
//
// Changes this round:
// - Google Play link for Fragmented removed — it's dead now
// - Fragmented now uses `video` instead of a static image (TODO: confirm
//   the guessed path below — same one used in games-page.js)
// - All app rows use `row-media--contain` so vertical/mobile recordings
//   show in full instead of getting cropped
// ============================================================

const featuredApp = {
  title: 'Fragmented',
  link: 'https://github.com/dereki16/Fragmented',
  video: 'vids/Fragmented%20(short).mp4',
  description: "An endless runner set in a vivid minefield of cosmic debris — envision a Picasso-inspired cosmos synced to pulsing trap beats. Previously published to Google Play; later removed due to inactivity.",
  tags: ["Unity", "C#"],
  year: '2021',
};

const apps = [
  {
    title: 'iTag',
    video: [
      { alt: 'Augmented reality demonstration-1.', src: 'vids/itagvid1.mp4' },
      { alt: 'Video 2', src: 'vids/itagvid2.mp4' },
    ],
    repoLink: 'https://github.com/dereki16/iTag',
    description: 'Collaboratively developed "iTag," an augmented reality game app, enabling players to sign up and engage in virtual tag matches.',
  },
  {
    title: 'Flixter',
    video: [
      { alt: 'Netflix mockup mobile application demonstration.', src: 'vids/flixtervid.mp4' },
    ],
    repoLink: 'https://github.com/dereki16/flixter',
    description: 'Created a movie browsing application, akin to Netflix, allowing users to select movies and delve into detailed overviews.',
  },
  {
    title: 'Tweeter',
    video: [
      { alt: 'Twitter mockup showing app functionalities.', src: 'vids/tweetervid.mp4' },
    ],
    repoLink: 'https://github.com/dereki16/tweeter',
    description: 'Engineered a Twitter replica, showcasing tweets complete with user profile pics, usernames, and content.',
  },
  {
    title: 'Parstagram',
    video: [
      { alt: 'Instagram clone displaying likes, posts, and sign-in/sign-out.', src: 'vids/parstagramvid.mp4' },
    ],
    repoLink: 'https://github.com/dereki16/Parstagram',
    description: 'Constructed an Instagram-inspired platform with a tailored Parse backend, facilitating photo posting and a global feed viewing.',
  },
  // {
  //     title: 'Tippy',
  //     video: [{ alt: 'Tipping application that helps users tip 15%, 18%, and 20%.', src: 'vids/tippyvid.mp4' }],
  //     repoLink: 'https://github.com/dereki16/big-tipper',
  //     description: 'Designed an iOS calculator app that recommends tip amounts based on the entered bill value.'
  // }
];

function renderFeaturedApp() {
  const el = document.getElementById('featured-app');
  if (!el) return;
  const a = featuredApp;
  el.innerHTML = `
    <div class="feature-media feature-media--tall">
      <video src="${a.video}" autoplay muted loop playsinline controls></video>
    </div>
    <div class="feature-body">
      <span class="tag tag-featured">featured app</span>
      <h3 class="feature-title">${a.title}</h3>
      <p class="feature-desc">${a.description}</p>
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
    el.id = app.title;
    el.style.scrollMarginTop = '76px';

    const mediaHtml = app.video.length > 1
      ? `<div class="row-media row-media--contain row-media-multi">${app.video.map(v => `<video src="${v.src}" alt="${v.alt}" autoplay muted loop playsinline controls></video>`).join('')}</div>`
      : `<div class="row-media row-media--contain"><video src="${app.video[0].src}" alt="${app.video[0].alt}" autoplay muted loop playsinline controls></video></div>`;

    el.innerHTML = `
      ${mediaHtml}
      <div class="row-body">
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