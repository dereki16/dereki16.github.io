// ============================================================
// games-page.js — data + render for projects.html (the full games list)
//
// Changes this round:
// - Uncontained's tag split into separate "VR" and "Oculus / Meta" pills
// - O-PONG now has a real playable embed (itch.io)
// - Fragmented now has a real `video` field (vids/Fragmented (short).mp4,
//   URL-encoded for the src attribute)
// - Media panels are taller (`row-media--tall`) and the page's container
//   is wider than the tabbar (see .wrap-wide in projects.html)
// ============================================================

const gamesList = [
  {
    id: 'UNCONTAINED',
    title: 'Uncontained',
    link: 'https://github.com/dereki16/Uncontained-VR',
    video: 'https://github.com/dereki16/dereki16.github.io/raw/main/vids/uvrvid.mp4',
    overview: 'In this immersive post-apocalyptic world, see if you have what it takes to survive. Uncontained features room unlocking, barricade building, zombie shooting fun.',
    credits: 'Developed in Unity and Oculus/Meta, with Andrew Aguas handling audio and the incorporation of free assets.',
    features: [
      'Efficient object pooling for dynamic game elements.',
      'Zombie navigation & pathfinding for immersive engagement.',
      'XR plug-in integration for robust VR support.',
      'Random goal generation to boost replay value.',
      'Interactive tutorial for player acclimatization.',
      'Customizable input system for varied movement styles.',
      'Comprehensive UI for game scenarios and navigation.',
    ],
    tags: ['Unity', 'C#', 'VR', 'Oculus / Meta'],
    year: '2022',
  },
  {
    id: 'VATS',
    title: 'VATS',
    link: 'https://github.com/dclinkenbeard/VATS',
    video: 'https://github.com/dereki16/dereki16.github.io/raw/main/vids/vats(short).mp4',
    overview: "Virtual Aquarium Tank System, or VATS, was my college capstone project — a virtual deep dive into marine life. We were in talks with the Monterey Bay Aquarium for a potential collaboration, disrupted by the COVID pandemic.",
    credits: 'Overseen by professor Drew Clinkenbeard, completed alongside Isaac Torres and Lewis Truong.',
    features: [
      'Introduced the Fish Evaluation Vector (FEV) for marine life insights.',
      'Efficient data management using JSON files.',
      'Responsive UI for smooth navigation of sea-life models and data.',
      'Streamlined list view for effortless marine species browsing.',
      'Comprehensive research and model acquisition for each marine creature.',
      'Deep oceanic visual feel through post-processing effects.',
    ],
    tags: ['Unity', 'C#', 'Capstone'],
    year: '2020',
  },
  {
    id: 'Fragmented',
    title: 'Fragmented',
    link: 'https://github.com/dereki16/Fragmented',
    video: 'vids/Fragmented%20(short).mp4',
    overview: 'Navigate space in "Fragmented," an endless runner set in a vivid minefield of cosmic debris — envision a Picasso-inspired cosmos synced to pulsing trap beats.',
    controls: [
      'Drag with the left mouse button to maneuver.',
      'Pause with the button on the top right.',
      'To mute music, navigate to Options or click outside the game window.',
    ],
    tags: ['Unity', 'C#', 'Mobile'],
    year: '2021',
    note: 'Previously published to Google Play; later removed due to inactivity.',
  },
  {
    id: 'O-PONG',
    title: 'O-PONG',
    link: 'https://github.com/dereki16/o-pong',
    video: 'vids/opong.mp4',
    overview: '"O-Pong," my first original game, reimagines classic Pong within an ovular arena. Players can rotate paddles, strategically position balls, and teleport for a twist on the iconic challenge.',
    controls: [
      'P1: WS to move up and down. AD to rotate paddles.',
      'P2: Arrow keys to do the same.',
      'Spacebar to pause.',
    ],
    tags: ['Unity', 'C#'],
    year: '2021',
  },
];

function renderGamesList() {
  const container = document.getElementById('games-list');
  if (!container) return;

  gamesList.forEach(game => {
    const el = document.createElement('div');
    el.className = 'row-project';
    el.id = game.id;
    el.style.scrollMarginTop = '76px';

    let mediaHtml;
    if (game.iframeSrc) {
      mediaHtml = `<div class="row-media row-media--tall"><iframe src="${game.iframeSrc}" style="width:100%; height:100%; border:0;" allowfullscreen></iframe></div>`;
    } else if (game.video) {
      mediaHtml = `<div class="row-media row-media--tall"><video src="${game.video}" autoplay muted loop playsinline controls></video></div>`;
    } else if (game.comingSoon) {
      mediaHtml = `
        <div class="row-media row-media--tall" style="display:flex; align-items:center; justify-content:center; position:relative;">
          <img src="${game.img}" alt="" style="filter:grayscale(100%); opacity:0.35;" onerror="this.remove()">
          <span class="tag tag-featured" style="position:absolute;">playable demo coming soon</span>
        </div>`;
    } else {
      mediaHtml = `<div class="row-media row-media--tall"><img src="${game.img}" alt="" onerror="this.remove()"></div>`;
    }

    const featuresHtml = game.features
      ? `<p class="feature-credits" style="font-style: normal; color: var(--fg-dim);"><strong style="color: var(--fg);">Features</strong><br>${game.features.join('<br>')}</p>`
      : '';
    const controlsHtml = game.controls
      ? `<p class="feature-credits" style="font-style: normal; color: var(--fg-dim);"><strong style="color: var(--fg);">Controls</strong><br>${game.controls.join('<br>')}</p>`
      : '';
    const creditsHtml = game.credits ? `<p class="feature-credits">${game.credits}</p>` : '';
    const noteHtml = game.note ? `<p class="feature-credits">${game.note}</p>` : '';

    let linksHtml = `<a class="btn btn-ghost" href="${game.link}" target="_blank" rel="noreferrer">View repo ↗</a>`;
    if (game.androidLink) {
      linksHtml += ` <a class="btn btn-ghost" href="${game.androidLink}" target="_blank" rel="noreferrer">Google Play ↗</a>`;
    }

    el.innerHTML = `
      ${mediaHtml}
      <div class="row-body">
        <span class="tag tag-featured">${game.year}</span>
        <h3 class="row-title">${game.title}</h3>
        <p class="row-desc">${game.overview}</p>
        ${creditsHtml}
        ${noteHtml}
        ${featuresHtml}
        ${controlsHtml}
        <div class="card-tags">${game.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <div class="feature-actions">${linksHtml}</div>
      </div>
    `;
    container.appendChild(el);
  });
}

document.addEventListener('DOMContentLoaded', renderGamesList);