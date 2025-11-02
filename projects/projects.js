import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';


const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const titleElement = document.querySelector('.projects-title');
if (titleElement) {
  titleElement.textContent = `${projects.length} Projects`;
}

let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year,
);


let data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);

arcs.forEach((arc, idx) => {
  d3.select('svg')
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(idx)) // Fill in the attribute for fill color via indexing the colors variable
})

let legend = d3.select('.legend');
data.forEach((d, idx) => {
  legend
    .append('li')
    .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
});

let query = '';
let selectedIndex = -1;
let searchInput = document.querySelector('.searchBar');


// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
  // re-calculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  // re-calculate data
  let newData = newRolledData.map(([year, count]) => {
    return {value: count, label: year};
  });
  // re-calculate slice generator, arc data, arc, etc.
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let newArcs = newArcData.map((d) => arcGenerator(d));

  let newSVG = d3.select('svg');
  newSVG.selectAll('path').remove();
  legend.selectAll('*').remove();
  // update paths and legends, refer to steps 1.4 and 2.2
  newArcs.forEach((d, idx) => {
    newSVG
      .append('path')
      .attr('d', d)
      .attr('fill', colors(idx))
      .style('cursor', 'pointer')
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;

        newSVG
          .selectAll('path')
          .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''));
        legend
          .selectAll('li')
          .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''));
        legend.selectAll('.swatch')
        .style('background-color', (_, i) =>
          selectedIndex === i ? 'oklch(60% 0% 0)' : colors(i)
        );

        if (selectedIndex === -1) {
          renderProjects(projectsGiven, projectsContainer, 'h2');
        } else {
          const year = newData[selectedIndex].label;
          const filtered = projectsGiven.filter(p => p.year === year);
          renderProjects(filtered, projectsContainer, 'h2');
        }
      });
  });
  newData.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        // Mirror click behavior from pie slice
        selectedIndex = selectedIndex === idx ? -1 : idx;

        newSVG
          .selectAll('path')
          .attr('class', (_, i) => (selectedIndex === i ? 'selected' : ''));

        legend
          .selectAll('li')
          .attr('class', (_, i) => (selectedIndex === i ? 'selected' : ''));

        legend.selectAll('.swatch')
        .style('background-color', (_, i) =>
          selectedIndex === i ? 'oklch(60% 0% 0)' : colors(i)
        );

        if (selectedIndex === -1) {
          renderProjects(projectsGiven, projectsContainer, 'h2');
        } else {
          const year = newData[selectedIndex].label;
          const filtered = projectsGiven.filter((p) => p.year === year);
          renderProjects(filtered, projectsContainer, 'h2');
        }
      });
  });
}

// Call this function on page load
renderPieChart(projects);

function setQuery(newQuery) {
  query = newQuery;
  return projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

searchInput.addEventListener('input', (event) => {
  let filteredProjects = setQuery(event.target.value);
  // re-render legends and pie chart when event triggers
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});