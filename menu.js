document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  hamburger.addEventListener("click", function () {
    navLinks.classList.toggle("nav-active");

    // Animate hamburger icon to 'X'
    hamburger.classList.toggle("toggle");
  });
});