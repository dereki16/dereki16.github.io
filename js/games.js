window.addEventListener('load', function(e) {
    let hash = sessionStorage.getItem('scrollTo');
    
    if (!hash) {
        hash = window.location.hash.substring(1); // remove the '#' at the start
    }
    
    if (hash) {
        const targetElement = document.querySelector('#' + hash);

        if (targetElement) {
            e.preventDefault();
            const topOffset = 110;
            const elementPosition = targetElement.offsetTop;
            const scrollToPosition = elementPosition - topOffset;
            
            window.scrollTo({
                top: scrollToPosition,
                behavior: 'smooth'
            });

            sessionStorage.removeItem('scrollTo');
        }
    }
});

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", function(e) {
        if (this.getAttribute('href').startsWith('#')) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();

                const topOffset = 110;
                const yPos = targetElement.getBoundingClientRect().top + window.pageYOffset - topOffset;

                window.scrollTo({
                    top: yPos,
                    behavior: 'smooth'
                });
            }
        }
    });
});

const projects = [
    {
        id: 'UNCONTAINED',
        title: 'VR Survival',
        link: 'https://github.com/dereki16/Uncontained-VR',
        srcType: 'video',
        videoSrc: 'vids/uvrvid.mp4',
        overview: 'In this immersive post-apocalyptic world, see if you have what it takes to survive. Uncontained features room unlocking, barricade building, zombie shooting fun.',
        credits: 'Developed in Unity and Oculus/Meta with Andrew Aguas handling audio and the incorporation of free assets.',
        features: [
            'Efficient object pooling for dynamic game elements.',
            'Zombie navigation & pathfinding for immersive engagement.',
            'XR plug-in integration for robust VR support.',
            'Random goal generation to boost replay value.',
            'Interactive tutorial for player acclimatization.',
            'Customizable input system for varied movement styles.',
            'Comprehensive UI for game scenarios and navigation.'
        ],
        year: '2022'
    },
    {
        id: 'VATS',
        title: 'VATS',
        link: 'https://github.com/dclinkenbeard/VATS', 
        srcType: 'video',
        videoSrc: 'vids/vats.mp4',
        overview: 'Virtual Aquarium Tank System or VATS was my college capstone project that offers a virtual deep dive into marine life. We were engaged with the Monterey Bay Aquarium for potential collaboration but were disrupted by the COVID pandemic.',
        credits: 'Oversaw by <a href="https://www.linkedin.com/in/dr-drew-c/" aria-label="Visit porfessor C\'s LinkedIn." target="_blank">professor Drew Clinkenbeard</a>, I along with <a href="https://www.linkedin.com/in/isaac-torres-628532182/" aria-label="Visit Isaac\'s LinkedIn." target="_blank">Isaac Torres</a> and <a href="https://www.linkedin.com/in/lewis-truong-a50b40195/" aria-label="Visit Lewis\' LinkedIn." target="_blank">Lewis Truong</a> completed this project.',
        features: [
            'Introduced the Fish Evaluation Vector (FEV) for marine life insights.',
            'Efficient data management using JSON files.',
            'Responsive UI for smooth navigation of sea-life models and data.',
            'Streamlined a list view for effortless marine species browsing.',
            'Conducted comprehensive research and model acquisition for each marine creature.',
            'Provided a deep oceanic visual feel through post-processing effects.'
        ],
        year: '2020'
    },
    {
        id: 'Fragmented',
        title: 'Fragmented',
        link: 'https://github.com/dereki16/Fragmented',
        img: 'webp/fragmented.webp',
        androidLink: 'https://play.google.com/store/apps/details?id=com.DerekIniguez.Fragmented',
        srcType: 'game',
        iframeSrc: 'https://i.simmer.io/@dereki/fragmentedv2',
        controls: [
            'Drag with the left mouse button to maneuver.',
            'Pause with the button on the top right.',
            '*Note: To mute music, navigate to Options or click outside the game window.*'
        ],
        overview: 'Navigate space in "Fragmented," an endless runner set in a vivid minefield of cosmic debris—envision a Picasso-inspired cosmos synced to pulsing trap beats.',
        year: '2021'
    },
    {
        id: 'O-PONG',
        title: 'O-PONG',
        link: 'https://github.com/dereki16/o-pong',
        img: 'webp/opong.webp',
        srcType: 'game',
        iframeSrc: 'https://i.simmer.io/@dereki/o-pong',
        controls: [
            'P1: WS to move up and down. AD to rotate paddles.',
            'P2: Arrow keys to do the same.',
            'Spacebar to pause.',
            '*Note: Please refresh if there\'s issues loading. Only playable on PC.*'
        ], 
        overview: '"O-Pong," my first original game, reimagines classic Pong within an ovular arena. Players can rotate paddles, strategically position balls, and teleport for a twist on the iconic challenge.',
        year: '2021'
        
    }
];

function createProjectElements() {
  const container = document.querySelector('.containers-container');

  projects.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'container';

    const gitLink = proj.link 
      ? `<a href="${proj.link}" target="_blank"><i class="fa fa-github fa-2x icon-3d game-icon"></i></a>`
      : '';

    let mediaHTML = '';

    if (proj.srcType === 'video') {
      mediaHTML = `
        <div class="game-video">
          <video controls muted playsinline">
            <source src="${proj.videoSrc}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>`;
    } else {
      mediaHTML = `
        <div class="game-video">
          <div class="game-wrapper">
            <img src="${proj.img}" class="game-placeholder">
            <iframe data-src="${proj.iframeSrc}" frameborder="0" allowfullscreen style="width:100%;height:500px;display:none;"></iframe>
          </div>
        </div>`;
    }

    card.innerHTML = `
      <div class="project-nav" id="${proj.id}"></div>
      <div class="game-vitals">
        <div class="header">
          <div class="title">${proj.title}</div>
          <div class="flex-center-link-6">${gitLink}</div>
        </div>
        ${mediaHTML}
      </div>

      <div class="game-description">
        <p class="bold">Overview</p>
        <div class="con-p"><p>${proj.overview}</p></div>

        ${proj.credits ? `<p class="bold">Credits</p><div class="con-p"><p>${proj.credits}</p></div>` : ''}
        ${proj.controls ? `<p class="bold">Controls</p><ul>${proj.controls.map(c => `<li>${c}</li>`).join('')}</ul>` : ''}
        ${proj.features ? `<p class="bold">Features</p><ul>${proj.features.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}

        <p class="bold">${proj.year}</p>
      </div>
    `;

    container.appendChild(card);
  });
}

function addIframeLoadOnClick() {
  document.querySelectorAll('.game-placeholder').forEach(placeholder => {
    placeholder.addEventListener('click', () => {
      
      const iframe = placeholder.nextElementSibling;

      // Hide placeholder
      placeholder.classList.add('hidden-game');
      placeholder.classList.remove('visible-game');

      // Show iframe
      iframe.classList.remove('hidden-game');
      iframe.classList.add('visible-game');

      // Load game iframe
      iframe.src = iframe.dataset.src;

      // Hide all other games
      document.querySelectorAll('.game-wrapper iframe').forEach(other => {
        if (other !== iframe) {
          other.src = '';
          other.classList.add('hidden-game');
          other.classList.remove('visible-game');
          other.previousElementSibling.classList.remove('hidden-game');
          other.previousElementSibling.classList.add('visible-game');
        }
      });
    });
  });
}

createProjectElements();
addIframeLoadOnClick();

console.log("Please ignore the 3rd party logs. Thanks!");
