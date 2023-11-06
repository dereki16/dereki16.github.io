document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault(); 
  
      var targetID = this.getAttribute('href').substring(1);
      var targetElement = document.getElementById(targetID);
  
      if (targetElement) {
        var targetPosition = targetElement.getBoundingClientRect().top;
        var currentPosition = window.pageYOffset;
        var offsetPosition = currentPosition + targetPosition - 90;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth' // Optional: add smooth scrolling
        });
      }
    });
  });
  