let userName = document.querySelector("#name");
var form = document.getElementById("contact-form");
var tob = document.getElementById("yenoh");
var text = document.getElementById("tex");

form.addEventListener('submit', function(event){
    if (tob.value.length > 0) {
        event.preventDefault();
    }
    else {
        document.getElementById("contact-form").submit();
    }
})

document.querySelectorAll('.myTextarea').forEach(input => {
    input.addEventListener('input', function () {
      if (this.value.length > 0) {
        this.classList.add('has-content');
      } else {
        this.classList.remove('has-content');
      }
    });
  });
  

  

  document.addEventListener("DOMContentLoaded", function () {
    const video1 = document.getElementById("video1");
    const video2 = document.getElementById("video2");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
  
    let currentVideo = 1;
  
    prevBtn.addEventListener("click", function () {
      if (currentVideo === 1) {
        video1.style.display = "none";
        video2.style.display = "block";
        currentVideo = 2;
      } else {
        video2.style.display = "none";
        video1.style.display = "block";
        currentVideo = 1;
      }
    });
  
    nextBtn.addEventListener("click", function () {
      if (currentVideo === 1) {
        video1.style.display = "none";
        video2.style.display = "block";
        currentVideo = 2;
      } else {
        video2.style.display = "none";
        video1.style.display = "block";
        currentVideo = 1;
      }
    });
  });


  function closeDropdown() {
    document.getElementById('nav-checkbox').checked = false;
  }