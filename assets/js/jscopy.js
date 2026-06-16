'use strict';

document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedProjects();
    loadFeaturedWriteups();
    setupSmoothScrolling();
});

/**
 * add event on element
 */
const addEventOnElem = function (elem, type, callback) {
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
}

/**
 * navbar toggle
 */
const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("active");
}

addEventOnElem(navTogglers, "click", toggleNavbar);

const closeNavbar = function () {
  navbar.classList.remove("active");
  overlay.classList.remove("active");
  document.body.classList.remove("active");
}

addEventOnElem(navbarLinks, "click", closeNavbar);

/**
 * active header & back top btn when window scroll down to 100px
 */
const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

const activeElemOnScroll = function () {
  if (window.scrollY > 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
}

addEventOnElem(window, "scroll", activeElemOnScroll);

/** 
 * getting projects from github api 
 */
const username = 'muk-e-ni';
const projectsContainer = document.getElementById('projects');

if (projectsContainer) {
  // Check if we are on the index page (show only 2 projects)
  const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '/brandon-main/' || window.location.pathname === '/brandon-main/index.html';
  fetch(`https://api.github.com/users/${username}/repos?sort=updated`)
    .then(response => response.json())
    .then(repos => {
      projectsContainer.innerHTML = '';
      // Show only 2 on index, all on projects page
      const displayRepos = isIndex ? repos.slice(0, 2) : repos;
      displayRepos.forEach(repo => {
        const projectCard = document.createElement('div');
        projectCard.className = 'feature-card has-before has-after img-holder';
        projectCard.style = '--width: 370; --height: 100; background:#f9f9f9; margin-bottom:20px;';

        projectCard.innerHTML = `
          <h3 class="h3">
            <a href="${repo.html_url}" target="_blank" class="card-title">${repo.name}</a>
          </h3>
          <p>${repo.description || 'No description provided.'}</p>
          <a href="${repo.html_url}" target="_blank" class="card-btn">
            <ion-icon name="arrow-forward" aria-hidden="true"></ion-icon>
          </a>
        `;
        projectsContainer.appendChild(projectCard);
      });
    })
    .catch(error => {
      projectsContainer.innerHTML = '<p>Failed to load GitHub projects.</p>';
      console.error(error);
    });
} else {
  console.error('No element with id="projects" found.');
}

/**
 * Load featured writeups from JSON file
 */
function loadFeaturedWriteups() {
    const writeupsContainer = document.getElementById('featured-writeups');
    if (!writeupsContainer) return;

    // Load writeups from the JSON file
    fetch('posts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(writeups => {
            // Only show 2 writeups on the index page
            const displayWriteups = writeups.slice(0, 2);
            
            writeupsContainer.innerHTML = displayWriteups.map(writeup => `
                <div class="flight-card">
                    <div class="card-banner">
                        <img src="${writeup.image}" width="263" height="80" loading="lazy" alt="${writeup.title}" class="w-100">
                        <div class="card-badge">CTF Writeup</div>
                        <div class="hover-preview">${writeup.preview}</div>
                    </div>
                    <div class="card-content">
                        <div class="card-meta">
                            <span class="difficulty medium">Challenge</span>
                            <span class="date">${writeup.date}</span>
                        </div>
                        <h3 class="card-title">${writeup.title}</h3>
                        <p class="writeup-excerpt">${writeup.excerpt}</p>
                        <p class="read-time">${writeup.preview}</p>
                        <a href="${writeup.url}" class="btn btn-secondary">Read Writeup</a>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading writeups:', error);
            writeupsContainer.innerHTML = '<p>Failed to load writeups. Please check back later.</p>';
        });
}

/**
 * Load featured projects (hardcoded fallback)
 */
function loadFeaturedProjects() {
    const projectsContainer = document.getElementById('projects');
    if (!projectsContainer) return;

    // This is your fallback if GitHub API fails
    const featuredProjects = [
        {
            title: "Network Security Scanner",
            description: "Python-based tool for network vulnerability assessment and port scanning",
            tags: ["Python", "Networking", "Security"],
            link: "/templates/projects.html#network-scanner"
        },
        {
            title: "Blockchain Voting System",
            description: "Secure voting platform built on Ethereum blockchain with smart contracts",
            tags: ["Solidity", "Web3", "React"],
            link: "/templates/projects.html#blockchain-voting"
        }
    ];

    // Only use fallback if no GitHub projects were loaded
    if (projectsContainer.children.length === 0) {
        projectsContainer.innerHTML = featuredProjects.map(project => `
            <div class="feature-card">
                <h3 class="card-title">${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                </div>
                <a href="${project.link}" class="card-btn" aria-label="View ${project.title}">
                    <ion-icon name="arrow-forward-outline"></ion-icon>
                </a>
            </div>
        `).join('');
    }
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add CSS for new elements
const additionalStyles = `
.project-tags {
    display: flex;
    gap: 8px;
    margin: 15px 0;
    flex-wrap: wrap;
}

.project-tag {
    background: var(--accent-primary);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
}

.card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.difficulty {
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
}

.difficulty.easy { background: #d4edda; color: #155724; }
.difficulty.medium { background: #fff3cd; color: #856404; }
.difficulty.hard { background: #f8d7da; color: #721c24; }

.read-time {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin: 10px 0;
}

.date {
    color: var(--text-muted);
    font-size: 0.8rem;
}

.writeup-excerpt {
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 10px 0;
    font-size:1.3rem;
}

/* Card Badge */
.card-badge {
    position: absolute;
    top: 15px;
    left: 15px;
    background: var(--accent-primary);
    color: white;
    padding: 5px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
}

.card-banner {
    position: relative;
}

/* Blog container layout for 2 writeups */
.blog-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .blog-container {
        grid-template-columns: 1fr;
    }
}

/* Animation for cards */
.flight-card {
    transition: all 0.3s ease;
}

.flight-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px var(--shadow-color);
}
`;

// Form submit 

(function () {
    const form = document.getElementById("subscribe-form");
    const btn = document.getElementById("subscribe-btn");
    const status = document.getElementById("subscribe-status");
    const input = document.getElementById("subscribe-email");

    if (!form) return;

    form.addEventListener("submit", async function (e){
        e.preventDefault();

        const email = input.value.trim();

        if (!email) return;

        // loading state

        btn.disabled = true;
        btn.textContent = "Subscribing...";
        status.style.display = "none";

        try {
            const res = await fetch("/.netlify/functions/subscribe", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email}),
            });

            const data = await res.json();
            if (res.ok && data.success){
                //successful submission
                status.textContent = "✓ You're subscribed! Check your inbox. Thank you!";
                status.style.color = "var(--accent-clr, #0d9488";
                status.style.display = "block"
                form.reset();
            } else{
                // Unssuccessful
                status.textContent = data.error || "Something went wrong. Please try again.";
                status.style.color = "#ef4444";
                status.style.display = "block";

            }}
            catch (err) {
                status.textContent = "Network erro. Please try again.";
                status.style.color = "#ef4444";
                status.style.display = "block";
                
            }
            finally{
                btn.disabled = false;
                btn.innerHTML = 'Subscribe <ion-icon name="mail" aria-hidden= "true"></ion-icon>';
            }
            });
        
    })();

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

document.addEventListener("DOMContentLoaded", function(){
    var yrElement = document.getElementById("cp-yr");
    if (yrElement) {
        var currentYr = new Date().getFullYear();
        yrElement.textContent = currentYr.toString();
    }
})

