document.addEventListener("DOMContentLoaded", () => {

  // Hamburger Menu
  const hamburger = document.querySelector(".hamburger")
  const navLinks = document.querySelector(".nav-links")

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("nav-active")
    hamburger.classList.toggle("toggle")
  })

  const navItems = document.querySelectorAll(".nav-links li a")
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navLinks.classList.remove("nav-active")
      hamburger.classList.remove("toggle")
    })
  })

  // Elements
  const openformButton = document.querySelector(".open-button")
  const closeformButton = document.querySelector(".close-button")
  const popupContainer = document.getElementById("popup-container")

  // Open Popup
  openformButton.addEventListener("click", () => {
    popupContainer.classList.add("visible")
  })

  // Close Popup
  closeformButton.addEventListener("click", () => {
    popupContainer.classList.remove("visible")

  })

})


