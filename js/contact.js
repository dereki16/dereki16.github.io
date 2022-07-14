let userName = document.querySelector("#name");
var form = document.getElementById("contact-form");
var tob = document.getElementById("yenoh");
var text = document.getElementById("tex");


text.style.display = "none";
form.addEventListener('submit', function(event){
    if (tob.value.length > 0) {
        event.preventDefault();
    }
    else {
        document.getElementById("contact-form").submit();
    }
})