const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      console.log(entry);
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  });
  
  const hiddenElements = document.querySelectorAll('.hidden');
  hiddenElements.forEach((el) => observer.observe(el));


  function copyToClipboard() {
    const textToCopy = document.getElementById("verticalText").textContent;
    const textarea = document.createElement("textarea");
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    alert("Email successfully copied!");
  }


  

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