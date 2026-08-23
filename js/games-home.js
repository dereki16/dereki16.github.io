// ============================================================
// games-home.js — homepage Games section: featured game + link out
// to the full games page (games.html). This is separate from the
// data file the games page itself uses for its full list.
// ============================================================

// Home-page teaser only — the full games page (js/games-page.js,
// projects.html) has its own separate entry with its own wording, so
// this doesn't need to match it word-for-word. Shorter/hookier here;
// more detail there for people who've already clicked through.
const featuredGame = {
  title: 'UNCONTAINED VR',
  link: 'https://github.com/dereki16/Uncontained-VR',
  video: 'https://github.com/dereki16/dereki16.github.io/raw/main/vids/uvrvid.mp4',
  description: "<span id=\"vr\" class=\"feature-bold\">See if you have what it takes to survive</span> a post-apocalyptic world overrun by zombies. Experience room unlocking, barricade building, zombie-shooting fun.",
  credits: "Developed in Unity and Oculus/Meta, with Andrew Aguas handling audio.",
  tags: ["Unity", "C#", "VR", "Oculus / Meta"],
  year: '2022',
};

function renderFeaturedGame() {
  const el = document.getElementById('featured-game');
  if (!el) return;
  const g = featuredGame;
  el.innerHTML = `
    <div class="feature-media feature-media--tall">
      <video src="${g.video}" autoplay muted loop playsinline controls></video>
    </div>
    <div class="feature-body">
      <span class="tag tag-featured">featured build · 2022</span>
      <h3 class="feature-title">${g.title}</h3>
      <p class="feature-desc">${g.description}</p>
      <p class="feature-credits">${g.credits}</p>
      <div class="card-tags">${g.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="feature-actions">
        <a class="btn btn-ghost" href="${g.link}" target="_blank" rel="noreferrer">View repo ↗</a>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', renderFeaturedGame);