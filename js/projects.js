// websites
const projects = [
    {
        title: 'popper.social',
        link: 'https://popper.social/',
        imgSrc: 'webp/PopperSocial.webp',
        repoLink: 'https://www.linkedin.com/company/popper-social/about/',
        iconType: 'linkedin',
        description: "Developed a dynamic landing page integrating MailerLite and GSAP animations. Crafted with HTML, CSS, JS, AJAX, jQuery, and Bootstrap. Hosted and managed through GitHub and Firebase."
    },
    {
        title: 'Razor Movies',
        link: 'https://razormoviesproject.azurewebsites.net/',
        imgSrc: 'webp/RazorMovies.webp',
        repoLink: 'https://github.com/dereki16/Razor-Movies-Project',
        iconType: 'github',
        description: 'Built a responsive movie site supporting CRUD operations, using external APIs for data. Developed using ASP.NET, hosted on Azure and implemented a strategy to counteract cold start delays.'
    },
    {
        title: 'App Buddy',
        link: 'https://application-bud.web.app/',
        imgSrc: 'webp/app-buddy.webp',
        repoLink: 'https://github.com/dereki16/application-buddy',
        iconType: 'github',
        description: "Crafted a web app meant to streamline and simplify the job application process. Built with Bootstrap, HTML, CSS, and JavaScript, this app is hosted on GitHub and Firebase."
    },
    {
        title: 'Portfolio Site',
        link: 'https://derekiniguez.com',
        imgSrc: 'webp/portfolio.png',
        repoLink: 'https://github.com/dereki16/dereki16.github.io',
        iconType: 'github',
        description: 'Designed and developed a portfolio site to display my work, optimized for performance and security using Cloudflare.'
    },
    {
        title: 'Technical Doc',
        link: 'https://tech-doc-rwd.derekiniguez1.repl.co/',
        imgSrc: 'webp/TechDoc.webp',
        repoLink:'https://github.com/dereki16/Technical-Documentation-RWD',
        iconType: 'github',
        description: 'Created a technical documentation on HTML & CSS as part of a Responsive Web Design certification.'
    },
    {
        title: 'Product Landing Page',
        link: 'https://product-landing-page-rwd.derekiniguez1.repl.co/',
        imgSrc: 'webp/ProductPage.webp',
        repoLink: 'https://github.com/dereki16/Product-Landing-Page-RWD',
        iconType: 'github',
        description: 'Designed a sleek product landing page as a key project for my Responsive Web Design certification.'
    },
    // {
    //     title: 'Quote Finder',
    //     link: 'https://quote-finder.derekiniguez1.repl.co/',
    //     imgSrc: 'webp/QuoteFinder.webp',
    //     repoLink: 'https://github.com/dereki16/quote-finder',
    //     iconType: 'github',
    //     description: 'Quote finder using EJS that takes input and finds quotes with input; also includes authors and categories.'
    // },
    {
        title: 'US Quiz',
        link: 'https://geography-quiz.derekiniguez1.repl.co/',
        imgSrc: 'webp/usq.webp',
        repoLink: 'https://github.com/dereki16/us-geo-quiz-asgmt',
        iconType: 'github',
        description: 'Built an interactive US quiz application using HTML, CSS, JavaScript, jQuery, and AJAX. Features real-time grading and keeps a record of user attempts.'
    },
    {
        title: 'ISBN Library',
        link: 'https://isbn-library.derekiniguez1.repl.co/',
        imgSrc: 'webp/OpenLibrary.webp',
        repoLink: 'https://github.com/dereki16/isbn-library',
        iconType: 'github',
        description: 'Developed a custom library interface using AJAX and jQuery to fetch and present data from the openlibrary.org API.'
    },
    {
        title: 'Game Dev Info',
        link: 'https://game-dev-v2.derekiniguez1.repl.co/welcome',
        imgSrc: 'webp/TechLesson.webp',
        repoLink: 'https://github.com/dereki16/gamedev-infov2',
        iconType: 'github',
        description: 'Designed an educational website about game development, incorporating EJS templates and an external API to feature motivational quotes.'
    }
];

function createProjectElements() {
    const gridContainer = document.querySelector('.grid-container');

    projects.forEach(project => {
        const projectElement = document.createElement('a');
        projectElement.href = project.link;
        projectElement.target = '_blank';
        projectElement.classList.add('grid-item');

        let repoHtml = '';
        if (project.repoLink) {
            let iconClass = project.iconType === 'linkedin' ? 'fa-linkedin' : 'fa-github';
            let altText = project.iconType === 'linkedin' ? 'Link to LinkedIn.' : 'Link to GitHub repo.';
            repoHtml = `
            <object alt="${altText}">
                <a href="${project.repoLink}" aria-label="Visit the repo for ${project.title}." class="fa ${iconClass} fa-2x icon-3d" target="_blank"></a>
            </object>`;
        }

        projectElement.innerHTML = `
            <h3 class="grid-title"> ${project.title} </h3>
            <img class="website-prev" src="${project.imgSrc}" alt="Image for website." width="300" height="200">
            ${repoHtml}
            <p class="grid-p">${project.description}</p>
        `;

        gridContainer.appendChild(projectElement);
        if (gridContainer.children.length % 2 !== 0) {
            gridContainer.style.content = '" " " "';  
        }

    });
}

document.addEventListener('DOMContentLoaded', createProjectElements);

const games = [
    {
        title: 'VR Survival',
        link: 'projects.html#UNCONTAINED',
        links: [
            {
                url: 'https://github.com/dereki16/Uncontained-VR',
                alt: 'Link to github repo.',
                icon: 'fa-github'
            }
        ],
        description: 'Immerse yourself into a world overrun by zombies.',
        poster: 'webp/uvr.webp',
        video: 'https://github.com/dereki16/dereki16.github.io/raw/main/vids/uvr(short).mp4'
    },
    {
        title: 'VATS',
        link: 'projects.html#VATS',
        links: [
            {
                url: 'https://github.com/dclinkenbeard/VATS',
                alt: 'Link to github repo.',
                icon: 'fa-github'
            }
        ],
        description: 'Dive deep in this Virtual Aquarium Tank System.',
        poster: 'webp/vats.webp',
        video: 'https://github.com/dereki16/dereki16.github.io/raw/main/vids/vats(short).mp4'
    },
    {
        title: 'Fragmented',
        link: 'projects.html#Fragmented',
        links: [
            {
                url: 'https://github.com/dereki16/Fragmented',
                alt: 'Link to github repo.',
                icon: 'fa-github'
            },
            {
                url: 'https://play.google.com/store/apps/details?id=com.DerekIniguez.Fragmented',
                alt: "Link to my app's google play store page.",
                icon: 'fa-android'
            }
        ],
        description: 'Frustratingly fun game of dodge the colorful debris.',
        poster: 'webp/frag2.webp',
        video: './vids/Fragmented (short).mp4'
    },
    {
        title: 'O-PONG',
        link: 'projects.html#O-PONG',
        links: [
            {
                url: 'https://github.com/dereki16/O-PONG',
                alt: 'Link to github repo.',
                icon: 'fa-github'
            }
        ],
        description: 'An ovular twist on the 1972 classic',
        poster: 'webp/opong2.webp',
        video: './vids/O-Pong (short).mp4'
    }
];

function createGameElements() {
    const gameContainer = document.querySelector('.game-grid-container');

    games.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.classList.add('game-card');
        
        let linksHTML = '';
        game.links.forEach(link => {
            linksHTML += `  
            <a href="${link.url}" aria-label="${link.alt}" target="_blank">
                <i class="game-link fa ${link.icon} fa-2x icon-3d"></i>
            </a>
            `;
        })

        gameElement.innerHTML += `
            <div class="header">  
                <div class="game-item">
                    <h2><a class="projlink" href="${game.link}" aria-label="See more about this game here.">${game.title}</a></h2>
                    <div class="flex-center-link-4">
                        ${linksHTML}
                    </div>
                    <p class="p1">${game.description}</p>
                    <br><br><br>
                    <video muted class="vid" controls poster="${game.poster}" alt="Short clip of my ${game.title} game.">
                        <source src="${game.video}" type="video/mp4">
                    </video>
                    <br>
                </div>
            </div>
        `;

        gameContainer.appendChild(gameElement);
    });
}

document.addEventListener('DOMContentLoaded', createGameElements);



function handleVideoSwitching(appInstanceIndex) {
    const video1 = document.getElementById(`video${appInstanceIndex + 1}-1`);
    const video2 = document.getElementById(`video${appInstanceIndex + 1}-2`);
    const prevBtn = document.getElementById(`prev-btn-${appInstanceIndex}`);
    const nextBtn = document.getElementById(`next-btn-${appInstanceIndex}`);

    let currentVideo = 1;

    function switchVideo() {
        if (currentVideo === 1) {
            video1.style.display = "none";
            video2.style.display = "block";
            currentVideo = 2;
        } else {
            video2.style.display = "none";
            video1.style.display = "block";
            currentVideo = 1;
        }
    }

    prevBtn.addEventListener("click", switchVideo);
    nextBtn.addEventListener("click", switchVideo);
}

// apps
const apps = [
    {
        title: 'iTag',
        video: [
            {
                alt: 'Augmented reality demonstration-1.',
                src: 'vids/itagvid1.mp4'
            },
            {
                alt: 'Video 2',
                src: 'vids/itagvid2.mp4'
            }
        ],
        repoLink: 'https://github.com/dereki16/iTag',
        description: 'Collaboratively developed "iTag," an augmented reality game app, enabling players to sign up and engage in virtual tag matches.'
    },
    {
        title: 'Flixter',
        video: [
            {
                alt: 'Netflix mockup mobile application demonstration.',
                src: 'vids/flixtervid.mp4'
            }
        ],
        repoLink: 'https://github.com/dereki16/flixter',
        description: 'Created a movie browsing application, akin to Netflix, allowing users to select movies and delve into detailed overviews.'
    },
    {
        title: 'Tweeter',
        video: [
            {
                alt: 'Twitter mockup showing app functionalities.',
                src: 'vids/tweetervid.mp4'
            }
        ],
        repoLink: 'https://github.com/dereki16/tweeter',
        description: 'Engineered a Twitter replica, showcasing tweets complete with user profile pics, usernames, and content.'
    },
    {
        title: 'Parstagram',
        video: [
            {
                alt: 'Instagram clone displaying likes, posts, and sigin/signout.',
                src: 'vids/parstagramvid.mp4'
            }
        ],
        repoLink: 'https://github.com/dereki16/Parstagram',
        description: 'Constructed an Instagram-inspired platform with a tailored Parse backend, facilitating photo posting and a global feed viewing.'
    },
    {
        title: 'Tippy',
        video: [
            {
                alt: 'Tipping application that helps users tip 15%, 18%, and 20%.',
                src: 'vids/tippyvid.mp4'
            }
        ],
        repoLink: 'https://github.com/dereki16/big-tipper',
        description: 'Designed an iOS calculator app that recommends tip amounts based on the entered bill value.'
    }
];

function createAppElements() {
    const appContainer = document.querySelector('.app-container');

    apps.forEach((app, appIndex) => {
        const appElement = document.createElement('div');
        appElement.classList.add('app');
        let videosHTML = '';

        if (app.title === 'iTag') {
            app.video.forEach((video, index) => {
                videosHTML += `
                <video width="280" height="515" class="video" id="video${appIndex + 1}-${index + 1}" src="${video.src}" alt="${video.alt}" ${index === 1 ? 'style="display: none;"' : ''} loop="true" autoplay="autoplay" playsinline muted></video>
                `;
            });
            videosHTML = `
            <div class="app-layout video-container">
                ${videosHTML}
            </div>
            <div class="button-container">
                <button id="prev-btn-${appIndex}" class="gradient-button blue-gradient">prev</button>
                <button id="next-btn-${appIndex}" class="gradient-button blue-gradient">next</button>
            </div>
            `;
        } else {
            app.video.forEach(video => {
                videosHTML += `
                <div class="app-layout video-container">
                    <video width="280" height="515" class="video" src="${video.src}" alt="${video.alt}" loop="true" autoplay="autoplay" playsinline muted></video>
                </div>
                `;
            });
        }

        appElement.innerHTML = `
        <h3>${app.title}</h3>
        ${videosHTML}
        <object alt="Link to github repo."><a href="${app.repoLink}" aria-label="Visit the repo for${app.title}." class="fa fa-github fa-2x icon-3d" target="_blank"></a></object>
        <div id="app-flixter"></div>
        <p>${app.description}</p>
        `;

        appContainer.appendChild(appElement);

        if (app.title === 'iTag') {
            handleVideoSwitching(appIndex);
        }
    });
}

document.addEventListener('DOMContentLoaded', createAppElements);

document.addEventListener('DOMContentLoaded', () => {
    function handleIntersect(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) { 
                const videos = entry.target.querySelectorAll('.video');
                videos.forEach(video => {
                    video.play();
                });
            } else {
                const videos = entry.target.querySelectorAll('.video');
                videos.forEach(video => {
                    video.pause();
                });
            }
        });
    }

    const options = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(handleIntersect, options);
    const appsDiv = document.querySelector('#apps');
    observer.observe(appsDiv);
});

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll(".projlink").forEach(link => {
        link.addEventListener("click", function(e) {
            const hrefValue = this.getAttribute('href');
            const hash = hrefValue.split('#')[1];

            if (hash) {
                window.location.href = hrefValue; 
                sessionStorage.setItem('scrollTo', hash); 
            }
        });
    });
});