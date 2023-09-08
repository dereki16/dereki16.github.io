// websites
const projects = [
    {
        title: 'popper.social',
        link: 'https://popper.social/',
        imgSrc: 'webp/PopperSocial.webp',
        repoLink: 'https://www.linkedin.com/company/popper-social/about/',
        iconType: 'linkedin',
        description: "Crafted a dynamic landing page using HTML, CSS, JS, AJAX, jQuery, Bootstrap, integrating MailerLite, and animating with GSAP's ScrollTrigger. Utilized GitHub and Firebase for seamless tech synergy."
    },
    {
        title: 'Razor Movies',
        link: 'https://razormoviesproject.azurewebsites.net/',
        imgSrc: 'webp/RazorMovies.webp',
        repoLink: 'https://github.com/dereki16/Razor-Movies-Project',
        iconType: 'github',
        description: 'Movie site with CRUD movie list, accesses info from an API. Developed in ASP.NET with Bootstrap and published through Azure.'
    },
    {
        title: 'Technical Doc',
        link: 'https://tech-doc-rwd.derekiniguez1.repl.co/',
        imgSrc: 'webp/TechDoc.webp',
        repoLink:'https://github.com/dereki16/Technical-Documentation-RWD',
        iconType: 'github',
        description: 'Designed a technical documentation for HTML & CSS for a certificate in Responsive Web Design.'
    },
    {
        title: 'Product Landing Page',
        link: 'https://product-landing-page-rwd.derekiniguez1.repl.co/',
        imgSrc: 'webp/ProductPage.webp',
        repoLink: 'https://github.com/dereki16/Product-Landing-Page-RWD',
        iconType: 'github',
        description: 'A product landing page designed for a certificate in Responsive Web Design.'
    },
    {
        title: 'Quote Finder',
        link: 'https://quote-finder.derekiniguez1.repl.co/',
        imgSrc: 'webp/QuoteFinder.webp',
        repoLink: 'https://github.com/dereki16/quote-finder',
        iconType: 'github',
        description: 'Quote finder using EJS that takes input and finds quotes with input; also includes authors and categories.'
    },
    {
        title: 'US Quiz',
        link: 'https://geography-quiz.derekiniguez1.repl.co/',
        imgSrc: 'webp/usq.webp',
        repoLink: 'https://github.com/dereki16/us-geo-quiz-asgmt',
        iconType: 'github',
        description: 'Developed a US quiz utilizing HTML, CSS, JavaScript, jQuery and AJAX that grades you and keeps track of attempts.'
    },
    {
        title: 'ISBN Library',
        link: 'https://isbn-library.derekiniguez1.repl.co/',
        imgSrc: 'webp/OpenLibrary.webp',
        repoLink: 'https://github.com/dereki16/isbn-library',
        iconType: 'github',
        description: 'Used AJAX, jQuery and an API to retrieve info from openlibrary.org and display it on my own open library.'
    },
    {
        title: 'Game Dev Info',
        link: 'https://game-dev-v2.derekiniguez1.repl.co/welcome',
        imgSrc: 'webp/TechLesson.webp',
        repoLink: 'https://github.com/dereki16/gamedev-infov2',
        iconType: 'github',
        description: 'Created an informational website on game development that uses EJS and an API for motivational quotes.'
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
                <a href="${project.repoLink}" class="fa ${iconClass} fa-2x icon-3d" target="_blank"></a>
            </object>`;
        }

        projectElement.innerHTML = `
            <h3 class="grid-title"> ${project.title} </h3>
            <img class="website-prev" src="${project.imgSrc}">
            ${repoHtml}
            <p class="grid-p">${project.description}</p>
        `;

        gridContainer.appendChild(projectElement);
    });
}

// Call the function when the DOM is fully loaded
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
        video: './vids/O-Pong (short).mp4'
    }
    // ... other games
];

function createGameElements() {
    const gameContainer = document.querySelector('.game-grid-container');

    games.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.classList.add('game-card');
        
        let linksHTML = '';
        game.links.forEach(link => {
            linksHTML += `  
            <a href="${link.url}" alt="${link.alt}" target="_blank">
                <i class="game-link fa ${link.icon} fa-2x icon-3d"></i>
            </a>
            `;
        })

        gameElement.innerHTML += `
            <div class="header">  
                <div class="game-item">
                    <h2><a class="projlink" href="${game.link}">${game.title}</a></h2>
                    <div class="flex-center-link-4">
                        ${linksHTML}
                    </div>
                    <p class="p1">${game.description}</p>
                    <br><br><br>
                    <video muted class="vid" controls alt="Short clip of my ${game.title} game.">
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
        description: 'iTag, a group project, is an augmented reality tag game application where players can sign up and join.'
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
        description: 'Movie browsing app like Netflix where users can tap a cell to see more details about a particular movie.'
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
        description: 'Twitter mockup where a user can view tweets with user profile pic, username, and tweet text.'
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
        description: 'Instagram clone with a custom Parse backend that allows a user to post photos and view a global photos feed.'
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
        description: 'A calculating application for IOS where users can enter a bill amount and get recommended tip value.'
    }
];

function createAppElements() {
    const appContainer = document.querySelector('.app-container');

   

    // create for loop for each app instance
    apps.forEach(app => {
    // create div for app
    const appElement = document.createElement('div');

    // add any necessary classes
    appElement.classList.add('app');
    // add let for nested data structure
    let videosHTML = '';

        // If the app is iTag, handle its unique video setup
        if (app.title === 'iTag') {
            app.video.forEach((video, index) => {
                videosHTML += `
                <video width="280" height="515" class="video" id="video${index + 1}" src="${video.src}" alt="${video.alt}" ${index === 1 ? 'style="display: none;"' : ''} loop="true" autoplay="autoplay" playsinline muted></video>
                `;
            });
            videosHTML = `
            <div class="app-layout video-container">
                ${videosHTML}
            </div>
            <div class="button-container">
                <button id="prev-btn" class="gradient-button blue-gradient">prev</button>
                <button id="next-btn" class="gradient-button blue-gradient">next</button>
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
        <object alt="Link to github repo."><a href="${app.repoLink}" class="fa fa-github fa-2x icon-3d" target="_blank"></a></object>
        <div id="app-flixter"></div>
        <p>${app.description}</p>
        `;

        appContainer.appendChild(appElement);
    });
}

document.addEventListener('DOMContentLoaded', createAppElements);