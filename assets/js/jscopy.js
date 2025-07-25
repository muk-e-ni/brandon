'use strict';



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

/** getting projects from github api */
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