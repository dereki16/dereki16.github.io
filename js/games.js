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
        iframeSrc: 'https://www.youtube.com/embed/gKWwObyfFDg',
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
        iframeSrc: 'https://www.youtube.com/embed/mjyU080Pv1o',
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
    const projectContainer = document.querySelector('.containers-container');

    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.classList.add('container');

        let featuresHTML = '';
        if (project.features) {
            project.features.forEach(feature => {
                featuresHTML += `<li>${feature}</li>`;
            });
        }

        let controlsHTML = '';
        if (project.controls) {
            project.controls.forEach(control => {
                controlsHTML += `<li>${control}</li>`;
            });
        }

        let linkHTML = '';
        if (project.link) {
            linkHTML += `
            <a href="${project.link}" aria-label="Visit the Github repo for${project.title}." target="_blank">
                <i class="fa fa-github fa-2x icon-3d game-icon"></i>
            </a>`;
        }
        if (project.androidLink) {
            linkHTML += `
            <a href="${project.androidLink}" aria-label="Visit the Google Play Store page." target="_blank">
                <i class="fa fa-android fa-2x icon-3d game-icon android-link"></i>
            </a>`;
        }
        let placeholderHTML = '';
        if (project.img) {
            placeholderHTML = `<img src="${project.img}" alt="Poster img for ${project.title} Placeholder" class="game-placeholder"/>`;
        } else {
            placeholderHTML = '<div class="game-placeholder"></div>';  
        }

        let iframeHTML = '';
        if (project.srcType == 'video') {
            iframeHTML += `
            <div class="game-video video-box-padding">
                <iframe src="${project.iframeSrc}"border="none" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>`;
        }
        if (project.srcType == 'game') {        
            iframeHTML += `
            <div class="game-video">
                <div class="game-wrapper">
                    ${placeholderHTML}
                    <iframe data-src="${project.iframeSrc}" controls muted border="none" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>`;
        }
        

        let creditsHTML ='';
        if (project.credits) {
            creditsHTML += `
            <p class="bold">Credits</p>
            <div class="con-p">
                <p>${project.credits}</p>
            </div>`;
        }
        // container class
        projectElement.innerHTML += ` 
            <div class="project-nav" id="${project.id}"</div>
            <div class="game-vitals">
                <div class="header">
                    <div class="title">${project.title}</div>
                    <div class="flex-center-link-6">
                        ${linkHTML}
                    </div>
                </div>
                ${iframeHTML}
            </div>
            <div class="game-description">
                <p class="bold">Overview</p>
                <div class="con-p">
                    <p>${project.overview}</p>
                </div>
                ${creditsHTML}
                ${controlsHTML ? `<p class="bold">Controls</p><ul>${controlsHTML}</ul>` : ''}
                ${featuresHTML ? `<p class="bold">Features</p><ul>${featuresHTML}</ul>` : ''}
                <p class="bold">${project.year}</p>
            </div>
        `;

        projectContainer.appendChild(projectElement);
    });
}

function addIframeEventListeners() {
    document.querySelectorAll('.game-placeholder').forEach(placeholder => {
        placeholder.addEventListener('click', function() {
            const iframe = placeholder.nextElementSibling;

            placeholder.style.display = 'none';
            iframe.style.display = 'block';

            if (!iframe.src) {
                iframe.src = iframe.dataset.src;
                console.log(`Loading iframe with src: ${iframe.src}`);
            } else if (iframe.src != iframe.dataset.src) {
                console.log(`Iframe already has src: ${iframe.src}`);
                iframe.src = iframe.dataset.src;
            }

            document.querySelectorAll('.game-video').forEach(gameVideo => {
                gameVideo.classList.remove('game-box-padding');
            });

            iframe.closest('.game-video').classList.add('game-box-padding');

            document.querySelectorAll('.game-wrapper iframe').forEach(otherIframe => {
                if (otherIframe !== iframe) {
                    otherIframe.style.display = 'none';
                    otherIframe.previousElementSibling.style.display = 'block';
                    otherIframe.src = ''; 
                }
            });
        });
    });
}

createProjectElements();
addIframeEventListeners();

console.log("Please ignore the 3rd party logs. Thanks!");
