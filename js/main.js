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
  
//   import React from 'react';

// function MyComponent() {
//   return (
//     <div>
//       <h1>Hello, world!</h1>
//       <p>This is my React component.</p>
//     </div>
//   );
// }

// export default MyComponent;



// Originally used for screenshots
// var slideIndex = [1,3];
// var slideId = ["mySlides1", "mySlides2", "mySlides3", "mySlides4"]
// showDivs(1, 0);
// showDivs(1, 1);
// showDivs(1, 2);
// showDivs(1, 3);

// function plusDivs(n, no) {
//     showDivs(slideIndex[no] += n, no);
// }

// function showDivs(n, no) {
//     var i;
//     var x = document.getElementsByClassName(slideId[no]);
//     if (n > x.length) {slideIndex[no] = 1}
//     if (n < 2) {slideIndex[no] = x.length}
//     for (i = 0; i < x.length; i++) {
//         x[i].style.display = "none";  
//     }
//     x[slideIndex[no]-1].style.display = "block";  
// }