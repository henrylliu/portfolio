console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact Me'},
    { url: 'resume/', title: 'Resume'},
    { url: 'https://github.com/henrylliu', title: 'GitHub'},
];

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/website/";         // GitHub Pages 

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    
    // next step: create link and add it to nav
    url = !url.startsWith('http') ? BASE_PATH + url : url;
    nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
}

let navLinks = $$("nav a");

let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname,
);
currentLink?.classList.add('current');