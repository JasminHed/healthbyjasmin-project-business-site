document.addEventListener("DOMContentLoaded", () => {

  // Get elements
  const hamburger = document.getElementsByClassName("hamburger")[0]
  const navLinks = document.getElementsByClassName("nav-links")[0]

  //Open menu
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("nav-active")
    hamburger.classList.toggle("toggle")
  })

  //Get elements
  const closeformButton = document.getElementById("close-button")
  const popupContainer = document.getElementById("popup-container")

  //Popup 
  setTimeout(() => {
    if (popupContainer) {
      popupContainer.classList.add("visible")
    }
  }, 80000) // = 80 seconds

  // Close popup
  closeformButton.addEventListener("click", () => {
    popupContainer.classList.remove("visible")

  })

})


