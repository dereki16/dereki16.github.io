
document.querySelectorAll('.myTextarea').forEach(input => {
    input.addEventListener('input', function () {
      if (this.value.length > 0) {
        this.classList.add('has-content');
      } else {
        this.classList.remove('has-content');
      }
    });
  });
  

