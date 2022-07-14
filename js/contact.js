let userName = document.querySelector("#name");
var form = document.getElementById("contact-form");
var tob = document.getElementsByClassName("yenoh");
var text = document.getElementById("tex");


text.style.display = "none";
form.addEventListener('submit', function(event){
    if (tob.length > 0) {
        event.preventDefault();
    }
})