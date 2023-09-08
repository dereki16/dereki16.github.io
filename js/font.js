var regularFont = new FontFace("roboto_slabregular", "url('fonts/robotoslab-regular-webfont.woff2')", {
    style: 'normal',
    weight: 'normal'
  });
  
  var boldFont = new FontFace("roboto_slabbold", "url('fonts/robotoslab-bold-webfont.woff2')", {
    style: 'normal',
    weight: 'bold'
  });
  
  // Load regular font
  regularFont.load().then(function(loadedFont) {
    document.fonts.add(loadedFont);
  }).catch(function(error) {
    console.log('Failed to load regular font: ' + error);
  });
  
  // Load bold font
  boldFont.load().then(function(loadedFont) {
    document.fonts.add(loadedFont);
  }).catch(function(error) {
    console.log('Failed to load bold font: ' + error);
  });
  