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
            // ... other features
        ],
        year: '2022'
    },
    // ... other projects
];

function createProjectElements() {
    const projectContainer = document.querySelector('.containers-container');

    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.classList.add('hidden', 'container');

        let featuresHTML = '';
        project.features.forEach(feature => {
            featuresHTML += `<li>${feature}</li>`;
        })

        projectElement.innerHTML += `
            <div class="game-vitals">
                <div class="title">${project.title}</div>
                <div class="flex-center-link-6">
                    <a href="${project.link}" target="_blank">
                        <i class="fa fa-github fa-2x icon-3d"></i>
                    </a>
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
                    <p>${project.description}</p>
                </div>
                <p class="bold">Features</p>
                <ul>
                    ${featuresHTML}
                </ul>
                <p class="bold">${project.year}</p>
            </div>
        `;

        projectContainer.appendChild(projectElement);
    });
}

document.addEventListener('DOMContentLoaded', createProjectElements);
