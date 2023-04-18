// NOTE: this app has migrated to: 
// https://github.com/roberttwomey/heraklean-app

let title;

let slider;
let start, stop;
let startTime,
  started = false;
let timer;
let samples;

let table;

// advance through screens
let screennum = 0;
let next;

// screen 0
let vid;

// screen 1
let charsel, chartext, seltext;
let characters = [
  
  'Ariana Omahan',
  'Leo Lightning',
  'Misael Maelstrom',
  'Eurydice Diaz',
  'Gaia Solange',
  'Icarus O’brien',
  'Hector Hailstorm',
  'Jason Schwartz',
  'Orion Tillman',
  'Lily Padilla',
  'Clio Jones',
  'Atlas Rodriguez'
];

// screen 2
let advslider, advtext;
let socslider, soctext;

// screen 3
let audiotext, audiobtn;
let bRecording = false;

function preload() {
  // vid = createImg("clouds2.gif", "video of clouds", "anonymous", );
  vid = createImg("clouds2.gif");
  vid.show();
  vid.parent("wallpaper");
}

function setup() {
  noCanvas();

  table = new p5.Table();
  table.addColumn("time");
  table.addColumn("value");

  // screen 0
  createSplashScreen();
  
  // screen 1
  createCharSelector();  
  
  // next button
  next = createButton("start");
  next.parent("nextbtn");
  // next.style("font-size", "24pt");
  next.size(120, 40);
  next.elt.style.marginTop='400px';
  next.mousePressed(advanceInterface);
  
  // screen 2
  createSliders()

  // screen 3
  createAudioCheck();
  
  startTime = millis();

}

function mySelectEvent() {
  let item = charsel.value();
  background(200);
  console.log('It is a ' + item + '!');
}

function advanceInterface() {
  screennum += 1;
  if (screennum > 4) {
    screennum = 0;
    next.html('next');
  }
  console.log("+: "+screennum);
  renderInterface();
}

function renderInterface() {
  // next.position(windowWidth/2, windowHeight-100);
  if (screennum == 0) {
    vid.show(); // hides the html video loader
  } else if (screennum == 1) {
    vid.hide(); // hides the html video loader
    next.html('next');
    chartext.show();
    charsel.show();
  } else if (screennum == 2) {
    chartext.hide();
    charsel.hide();
    
    advtext.show();
    advslider.show();
    soctext.show();
    socslider.show();
  } else if (screennum == 3) {
    advtext.hide();
    advslider.hide();
    soctext.hide();
    socslider.hide();
    
    audiotext.show();
    audiobtn.show();
  } else if (screennum == 4) {
    audiotext.hide();
    audiobtn.hide();
    
    next.html('begin...');
  }
}


function createSplashScreen() {
  // vid.show();
}

function createCharSelector() {
    // character text
  chartext = createP("select your character:");
  chartext.parent("contents");
  // chartext.style("font-size", "24pt");
  chartext.style("top", "80px");
  
  // character selector
  charsel = createSelect();
  // charsel.position(50, 180);
  charsel.option("")
  for (thischar in characters) {
    charsel.option(characters[thischar]);
  }
  charsel.selected("");
  charsel.changed(mySelectEvent);
  // charsel.style("font-size", "24pt");
  charsel.style("top", "120px");
  charsel.style("margin", "0 auto");
  charsel.parent("contents");
  
  chartext.hide();
  charsel.hide();
}

function createAudioCheck() {
  // audio text
  audiotext = createP("test your microphone.<br>speak now:");
  audiotext.parent("contents");
  // audiotext.style("font-size", "24pt");
  audiotext.style("top", "100px");
  audiotext.hide();
  
  // record button
  audiobtn = createButton("record");
  audiobtn.parent("contents");
  // audiobtn.style("font-size", "24pt");
  audiobtn.size(120, 40);
  audiobtn.style("top", "120px");
  audiobtn.style("margin", "0 auto");
  audiobtn.mousePressed(toggleRecording);
  audiobtn.hide();

}

function createSliders() {
  // title
  advtext = createP("adventure");
  advtext.parent("contents");
  // advtext.style("font-size", "24pt");
  advtext.style("top", "100px");
  advtext.hide();

  // adventure slider
  advslider = createSlider(-5, 5, 0);
  advslider.style("width", "90%");
  advslider.style("top", "140px");
  advslider.style("margin", "0 auto");
  advslider.parent("contents");
  advslider.input(updateAdv);
  advslider.hide();
  
  // sociability
  soctext = createP("sociability");
  soctext.style("font-size", "24pt");
  soctext.parent("contents");
  soctext.style("top", "100px");
  soctext.hide();
  
  // sociability slider
  socslider = createSlider(-5, 5, 0);
  socslider.style("width", "90%");
  socslider.style("top", "140px");
  socslider.style("margin", "0 auto");
  socslider.parent("contents");
  socslider.input(updateSoc);
  socslider.hide();
}

function updateSoc() {
  let thisTime = millis() - startTime;
  let thisValue = socslider.value();

  // data.push([thisTime, thisValue]);
  console.log("sociability: ", thisValue);
  // console.log("sociability: ", thisTime, thisValue);
}

function updateAdv()
{ 
  let thisTime = millis() - startTime;
  let thisValue = advslider.value();

  // data.push([thisTime, thisValue]);
  console.log("adventure: ", thisValue);
  // console.log("sociability: ", thisTime, thisValue);
}

function toggleRecording() {
  if (bRecording) {
    bRecording = false;
    audiobtn.style('background-color', '#f0f0f0');
  } else {
    bRecording = true;
    audiobtn.style('background-color', 'red');
  }
}
