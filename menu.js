document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fullu loaded and parsed")

  // Hamburger Menu
  const hamburger = document.querySelector(".hamburger")
  const navLinks = document.querySelector(".nav-links")

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("nav-active")
    hamburger.classList.toggle("toggle")
  })
  // Click on a link + menu disappears
  const navItems = document.querySelectorAll(".nav-links li a")
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navLinks.classList.remove("nav-active")
      hamburger.classList.remove("toggle")
    })
  })

  // Select Elements
  const closeformButton = document.querySelector(".close-button")
  const popupContainer = document.getElementById("popup-container")

  //Popup 
  setTimeout(() => {
    if (popupContainer) {
      popupContainer.classList.add("visible")
    }
  }, 10000) // = 10 seconds

  // Close Popup
  closeformButton.addEventListener("click", () => {
    popupContainer.classList.remove("visible")

  })

})


