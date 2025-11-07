console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact Me'},
    { url: 'resume/', title: 'Resume'},
    { url: 'meta/', title: 'Meta'},
    { url: 'https://github.com/henrylliu', title: 'GitHub'},
];

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/portfolio/";         // GitHub Pages 

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    url = !url.startsWith('http') ? BASE_PATH + url : url;

    // Create link
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    // open external links in new tab
    if (a.host !== location.host) {
        a.target = '_blank';
    }

    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname,
    );
    nav.append(a);
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select id="color-scheme">
            <option value="light dark">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
      </label>`,
);
const select = document.querySelector('.color-scheme select');

select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
});

export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  // Your code will go here
  containerElement.innerHTML = '';


  // Validate headings
  const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!validHeadings.includes(headingLevel)) {
    console.warn(`Invalid heading level "${headingLevel}" — using <h2> instead.`);
    headingLevel = 'h2';
  }

  // Loop through ALL project objects in your JSON
  projects.forEach(project => {
    const article = document.createElement('article');

    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <div class="project-info">
        <p class="project-description">${project.description}</p>
        <p class="project-year">${project.year}</p>
      </div>
      `;
    containerElement.appendChild(article);
  });
  if (projects.length === 0) {
    containerElement.innerHTML = '<p>No projects found.</p>';
  }

}

export async function fetchGitHubData(username) {
  // return statement here
  return fetchJSON(`https://api.github.com/users/${username}`);
}