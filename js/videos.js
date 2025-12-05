// (function() {
//     var youtube = document.querySelectorAll(".lazy-youtube");

//     for (var i = 0; i < youtube.length; i++) {
//         // Using an immediately-invoked function expression (IIFE) to correctly pass the index 'i'
//         (function(index) {
//             var source = "https://img.youtube.com/vi/" + youtube[index].dataset.embed + "/sddefault.jpg";

//             var image = new Image();
//             image.src = source;
//             image.setAttribute("alt", "Clickable image that will start video.");
//             image.addEventListener("load", function() {
//                 youtube[index].appendChild(this); // 'this' refers to the image itself
//             });

//             youtube[index].addEventListener("click", function() {
//                 var iframe = document.createElement("iframe");
//                 iframe.setAttribute("allow", "autoplay");
//                 iframe.setAttribute("frameborder", "0");
//                 iframe.setAttribute("allowfullscreen", "");
//                 iframe.setAttribute("src", "https://www.youtube.com/embed/" + this.dataset.embed + "?rel=0&showinfo=0&autoplay=1");
//                 this.innerHTML = "";
//                 this.appendChild(iframe);
//             });

//         })(i); // Pass the current index 'i' to the IIFE
//     }
// })();