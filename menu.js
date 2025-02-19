document.addEventListener("DOMContentLoaded", function () {
  // Hamburger Menu
  const hamburger = document.querySelector(".hamburger")
  const navLinks = document.querySelector(".nav-links")

  hamburger.addEventListener("click", function () {
    navLinks.classList.toggle("nav-active")
    hamburger.classList.toggle("toggle")
  })

  // Elements
  const openformButton = document.querySelector(".open-button")
  const closeformButton = document.querySelector(".close-button")
  const popupContainer = document.getElementById("popup-container")

  // Button clicked, form pops up
  openformButton.addEventListener("click", () => {
    popupContainer.style.display = "block"
  })


  // Button clicked, form close
  closeformButton.addEventListener("click", () => {
    popupContainer.style.display = "none"
  })

})


