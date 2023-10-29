// window.onscroll = function() {myFunction()};
// var navbar = document.getElementById("topnav");
// var sticky = navbar.offsetTop;

// function myFunction() {
//   if (window.pageYOffset >= sticky) {
//     navbar.classList.add("sticky")
//   } else {
//     navbar.classList.remove("sticky");
//   }
// }


function closeDropdown() {
    const menuToggle = document.getElementById("menu-toggle");
    if (menuToggle.checked) {
        menuToggle.checked = false;
    }
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeDropdown); 
});
