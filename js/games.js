const projects = [
    {
        title: 'VR Survival',
        link: 'projects.html#UNCONTAINED',
        iframeSrc: 'https://www.youtube.com/embed/gKWwObyfFDg',
        overview: 'In this immersive post-apocalyptic world, see if you have what it takes to survive. Uncontained features room unlocking, barricade building, zombie shooting fun.',
        description: 'This is a VR game I developed in Unity with help from Andrew Aguas as the audio editor, and free assets.',
        features: [
            'Object Pooling to create and store multiple game objects.',
            'Navigation and pathfinding so zombies can chase and attack player.',
            'XR plug-in framework to help support VR.',
            'Randomization of goals to help with replayability.',
            'Interactive tutorial to help teach player how they can engage with the world.',
            'Input system in options menu allowing for switching between different styles of orientation and turning speed for preferrential movement.',
            'UI for win case, lose case, main and pause menu.'
        ],
        year: '2022'
    },
    {
        title: 'VATS',
        link: 'https://github.com/dereki16/Uncontained-VR', // You provided this link for VATS, please replace if incorrect
        iframeSrc: 'https://www.youtube.com/embed/mjyU080Pv1o',
        overview: 'Our goal was to create a virtual tank where all sorts of sea life can be viewed with ease. Virtual Aquarium Tank System or VATS was my Capstone project for college - oversaw by professor Drew Clinkenbeard, that I along with Isaac Torres and Lewis Truong completed. We were in talks with the Monterey Bay Aquarium to have this simulation be featured; however, communication fell through due to COVID.',
        description: '', // You didn't provide a distinct "description" apart from the "overview", so I've left it empty.
        features: [
            'Create the Fish Evaluation Vector (FEV) meant to provide in-depth knowledge on sea life.',
            'This was accomplished through the use of JSON files.',
            'Provide responsive UI that swaps through the different models and information.',
            'Lay out a list view that allows for an easier browse through different sea life.',
            'Acquire models and undertake a fair amount of research on each of the sea creatures.',
            'Add post-processing effects to elicit a deeper blue color for the look of the ocean.'
        ],
        year: '2020'
    },
    {
        title: 'Fragmented',
        link: 'https://github.com/dereki16/Fragmented',
        androidLink: 'https://play.google.com/store/apps/details?id=com.DerekIniguez.Fragmented',
        iframeSrc: 'https://i.simmer.io/@dereki/fragmented',
        controls: [
            'Click and hold left mouse button down, then drag to move.',
            'Pause button at top right.',
            '*Note: To stop music go to Options or press outside of game box.*'
        ],
        overview: 'Fragmented is meant to be an endless runner mobile game where the player is hurtling through space in a minefield of colorful debris. Think Picasso meets endless space runner matched with a trap beat for music.',
        year: '2021'
    },
    {
        title: 'O-PONG',
        link: 'https://github.com/dereki16/sign-up-site-asgmt',
        iframeSrc: 'https://i.simmer.io/@dereki/o-pong',
        controls: [
            'P1: WS to move up and down. AD to rotate paddles.',
            'P2: Arrow keys to do the same.',
            'Spacebar to pause.',
            '*Note: If game doesn\'t load properly, please try refreshing. Only playable on PC.*'
        ],
        overview: 'O-Pong was the first original game I completed. I had a great deal of love and respect for the original. Its simple, yet challenging and fun. I was inspired to take a unique spin on the idea by making the playing field ovular. I also made it possible to rotate your paddle to position the ball in a difficult to reach spot, and teleport from one end to another.',
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
            <a href="${project.link}" target="_blank">
                <i class="fa fa-github fa-2x icon-3d game-icon"></i>
            </a>`;
        }
        if (project.androidLink) {
            linkHTML += `
            <a href="${project.androidLink}" target="_blank">
                <i class="fa fa-android fa-2x icon-3d game-icon"></i>
            </a>`;
        }

        projectElement.innerHTML += `
            <div class="game-vitals">
                <div class="title">${project.title}</div>
                <div class="flex-center-link-6">
                    ${linkHTML}
                </div>
                <br>
                <div class="game-video">
                    <iframe src="${project.iframeSrc}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>
            <div class="game-description">
                <p class="bold">Overview</p>
                <div class="con-p">
                    <p>${project.overview}</p>
                </div>
                ${controlsHTML ? `<p class="bold">Controls</p><ul>${controlsHTML}</ul>` : ''}
                ${featuresHTML ? `<p class="bold">Features</p><ul>${featuresHTML}</ul>` : ''}
                <p class="bold">${project.year}</p>
            </div>
        `;

        projectContainer.appendChild(projectElement);
    });
}


document.addEventListener('DOMContentLoaded', createProjectElements);
