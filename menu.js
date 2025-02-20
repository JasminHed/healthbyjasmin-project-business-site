document.addEventListener("DOMContentLoaded", function () {
  // Hamburger Menu
  const hamburger = document.querySelector(".hamburger")
  const navLinks = document.querySelector(".nav-links")

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("nav-active")
    hamburger.classList.toggle("toggle")
  })

  // Elements
  const openformButton = document.querySelector(".open-button")
  const closeformButton = document.querySelector(".close-button")
  const popupContainer = document.getElementById("popup-container")

  // Open Popup
  openformButton.addEventListener("click", () => {
    popupContainer.classList.add("visible");
  });

  // Close Popup
  closeformButton.addEventListener("click", () => {
    popupContainer.classList.remove("visible");
  });

})


