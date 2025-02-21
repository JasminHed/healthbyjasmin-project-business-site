document.addEventListener("DOMContentLoaded", () => {

  // Get elements
  const hamburger = document.getElementsByClassName("hamburger")[0]
  const navLinks = document.getElementsByClassName("nav-links")[0]

  //Open menu
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("nav-active")
    hamburger.classList.toggle("toggle")
  })

  //Get Elements
  const closeformButton = document.getElementById("close-button")
  const popupContainer = document.getElementById("popup-container")

  //Popup 
  setTimeout(() => {
    if (popupContainer) {
      popupContainer.classList.add("visible")
    }
  }, 20000) // = 20 seconds

  // Close Popup
  closeformButton.addEventListener("click", () => {
    popupContainer.classList.remove("visible")

  })

})


