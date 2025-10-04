// Portfolio projects data -
const projects = [
  {
      title: "Unga Allergiker",
      image: "assets/UA.png",
      description: "Updated and developed WordPress website focusing on accessibility, performance, and SEO. As well as making the site responsive. Visual identity and images were outside project scope.",
      tech: "WordPress, CSS, JavaScript",
      link: "https://www.ungaallergiker.se/",
       linkText: "Visit Unga Allergiker"
  },
  {
      title: "Kodcentrum",
      image: "assets/kodc.png",
      description: "Updated and developed Squarespace website focusing on accessibility, SEO, and site structure as well as making the site responsive.",
      tech: "Squarespace, CSS, JavaScript",
      link: "https://kodcentrum.se/",
       linkText: "Visit Kodcentrum"
  },
  {
      title: "Zikki Website",
      image: "assets/Zikki.png",
      description: "Built and developed business website in Squarespace using custom code. Worked with existing visual identity and images. Created content, structure, and design in collaboration with the company. Also added accessibility, responsiveness and SEO features.",
      tech: "Squarespace, CSS, JavaScript, E-commerce",
      link: "https://zikkidesign.com",
       linkText: "Visit Zikki Design"
  },
  {
    title: "Cyberarena",
    image: "assets/Cyber.png",
    description: "Developed and updated Squarespace website for Kodcentrum's Cyberarena. Designed color scheme, site structure, and all content including images and text. Built with custom code, focusing on accessibility, responsiveness and SEO optimization.",
    tech: "Squarespace, CSS, JavaScript",
    link: "https://zikkidesign.com",
     linkText: "Visit Cyberarena"
}
];

// Render projects
function renderProjects() {
  const grid = document.querySelector('.projects-grid');
  if (!grid) return;

  grid.innerHTML = projects.map(project => `
      <div class="project-card">
      <img src="${project.image}" alt="${project.title} preview" class="project-image">
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <p class="tech">${project.tech}</p>
         <a href="${project.link}" target="_blank" rel="noopener noreferrer">${project.linkText}</a>
      </div>
  `).join('');
}
// Run when DOM is loaded
if (document.querySelector('.portfolio-projects')) {
  renderProjects();
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
});




  