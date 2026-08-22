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
    title: 'UNCONTAINED VR',
    link: 'https://github.com/dereki16/Uncontained-VR',
    video: 'https://github.com/dereki16/dereki16.github.io/raw/main/vids/uvrvid.mp4',
    overview: 'A VR survival game built around exploration, progression, and replayability.',
    credits: 'Developed in Unity and Oculus/Meta, with Andrew Aguas handling audio.',
    features: [
      'Enemy AI — Zombie navigation and pathfinding using Unity\'s systems.',
      'Object Pooling — Reused dynamic game objects to optimize performance.',
      'Procedural Objectives — Randomized elements for gameplay replayability.',
      'Input — Customizable movement / interaction controls using Unity\'s XR tooling.',
      'Progression — Room unlocking, barricade mechanics, and key retrieval.',
      'Interactive Tutorial — introduced players to the game\'s VR mechanics.',
      'UI — Built gameplay and navigation interfaces for in-game feedback.',
      // 'Efficient object pooling for dynamic game elements.',
      // 'Zombie navigation & pathfinding for immersive engagement.',
      // 'XR plug-in integration for robust VR support.',
      // 'Random goal generation to boost replay value.',
      // 'Interactive tutorial for player acclimatization.',
      // 'Customizable input system for varied movement styles.',
      // 'Comprehensive UI for game scenarios and navigation.',
    ],
    tags: ['VR', 'Oculus / Meta', 'Unity', 'C#'],
    year: '2022',
  },
  {
    id: 'VATS',
    title: 'VATS',
    link: 'https://github.com/dclinkenbeard/VATS',
    video: 'https://github.com/dereki16/dereki16.github.io/raw/main/vids/vats(short).mp4',
    overview: "Virtual Aquarium Tank System, or VATS, was my college capstone project — a virtual deep dive into marine life. Collaboration with the Monterey Bay Aquarium disrupted by the COVID pandemic.",
    credits: 'Responsible for: FEV, research, data management and its UI. Overseen by professor Drew Clinkenbeard, completed alongside Isaac Torres and Lewis Truong.',
    features: [
      'Fish Evaluation Vector (FEV) system for evaluating marine life.',
      'JSON-based data management for species information.',
      'Search/list interface for browsing marine species.',
      'Interactive UI for viewing models and research data.',
      'Research and acquisition of 3D marine-life models.',
      'Post-processing effects for the deep-ocean environment.',
      // 'Introduced the Fish Evaluation Vector (FEV) for marine life insights.',
      // 'Efficient data management using JSON files.',
      // 'Responsive UI for smooth navigation of sea-life models and data.',
      // 'Streamlined list view for effortless marine species browsing.',
      // 'Comprehensive research and model acquisition for each marine creature.',
      // 'Deep oceanic visual feel through post-processing effects.',
    ],
    tags: ['Capstone', 'JSON', 'Unity', 'C#'],
    year: '2020',
  },
  {
    id: 'Fragmented',
    title: 'Fragmented',
    link: 'https://github.com/dereki16/Fragmented',
    video: 'vids/Fragmented%20(short).mp4',
    overview: 'Navigate space in "Fragmented," an endless runner. Envision a cosmos filled with Picasso-inspired debris you have to dodge.',
    tags: ['Android', 'Mobile','Unity', 'C#'],
    year: '2021',
    note: 'Previously published to Google Play; later removed due to inactivity.',
  },
  {
    id: 'O-PONG',
    title: 'O-PONG',
    link: 'https://github.com/dereki16/o-pong',
    video: 'https://github.com/dereki16/dereki16.github.io/raw/main/vids/opong.mp4',
    overview: 'My first \'original\' game, reimagines Pong within an ovular arena. Players can rotate paddles, strategically reposition balls, and teleport for a twist on the iconic challenge.',
    tags: ['Unity', 'C#'],
    year: '2021',
    note: 'Can play <a href="https://yungchewbacca.itch.io/o-pong" target="_blank" rel="noopener noreferrer">here.</a>'
  },
];

function renderGamesList() {
  const container = document.getElementById('games-list');
  if (!container) return;

  gamesList.forEach(game => {
    const el = document.createElement('div');
    el.className = 'row-project';
    el.id = game.id;
    el.style.scrollMarginTop = '58px'; // matches .tabbar's real rendered height, see style.css

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

    // Bolds the label portion of a "Label — description" bullet (used
    // throughout Uncontained's features) so it reads as term+definition
    // rather than one flat sentence. Bullets without " — " (VATS's, for
    // instance) just render unchanged.
    function formatHighlight(text) {
      const idx = text.indexOf(' — ');
      if (idx === -1) return text;
      return `<strong>${text.slice(0, idx)}</strong>${text.slice(idx)}`;
    }

    const overviewHtml = game.overview
      ? `<h4 class="feature-subhead">Overview</h4><p class="row-desc">${game.overview}</p>`
      : '';
    const featuresHtml = game.features
      ? `<h4 class="feature-subhead">Technical Highlights</h4><ul class="feature-highlights">${game.features.map(f => `<li>${formatHighlight(f)}</li>`).join('')}</ul>`
      : '';
    const controlsHtml = game.controls
      ? `<h4 class="feature-subhead">Controls</h4><ul class="feature-highlights">${game.controls.map(c => `<li>${c}</li>`).join('')}</ul>`
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
        ${overviewHtml}
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