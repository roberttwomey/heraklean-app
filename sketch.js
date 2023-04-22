// NOTE: this app has migrated to: 
// https://github.com/roberttwomey/heraklean-app

// weather radio from here: https://editor.p5js.org/robert.twomey/sketches/edH7FDhyw

// LEFTOVERS
// let title;
// let start, stop;
// let startTime, started = false;
// let timer;
// let samples;
// let table;

// advance through screens
// let screennum = 0;
let nextbutton;
let thisState;

// screen 0
let vid;

// screen 1
let charsel, chartext, seltext;
let characters = [
  'Clio Jones',
  'Dion Nguyen',
  'Hera Ramirez',
  'Leos Lightning',
  'Demeter Greenberg',
  'Misael Maelstrom',
  'Odysseus Mann',
  'Iason Schmerz',
  'Zeus Johnson',
  'Lily Padilla',
  'Hydra Wiliams',
  'Eurydice Chen',
  'Athena Farmer',
  'Icarus O’brien',
  'Aphrodite Sumac',
  'Orion Tillman',
  'Reaper Brown',
  'Ariana Omahan',
  'Atlas Rodriguez',
  'Gaia Solange'
];

// screen 2
let advslider, advtext;
let socslider, soctext;

// screen 3
let audiotext, recbtn;
let speechoutput;
let bListening = false;

// screen 4
let waittext, timertext;
let timeStartExp;

function preload() {
  // vid = createImg("clouds2.gif", "video of clouds", "anonymous", );
  vid = createImg("assets/clouds2.gif");
  vid.show();
  vid.parent("wallpaper");

  // story
  loadStoryFile(storyfile);
}

function setup() {
  noCanvas();

  // NOT USED
  // table = new p5.Table();
  // table.addColumn("time");
  // table.addColumn("value");
  // NOT USED

  // nextbutton button
  nextbutton = createButton("start");
  nextbutton.parent("nextbuttonbtn");
  // nextbutton.style("font-size", "24pt");
  nextbutton.size(120, 40);
  // nextbutton.style("top", "400px");
  nextbutton.style("top", "50vh");
  nextbutton.style("margin", "0 auto");
  nextbutton.mousePressed(advanceInterface);

  // screen 0
  createSplashScreen();
  
  // screen 1
  createCharSelector();  
  
  // screen 2
  createSliders()

  // screen 3
  createMicCheck();
  
  // sreen 4
  setupRadio();

  // startTime = millis();
  thisState = "splash"
}

function mySelectEvent() {
  let item = charsel.value();
  background(200);
  console.log('It is a ' + item + '!');
}

function advanceInterface() {
  // if (thisState == "splash") {screennum += 1;
  // if (screennum > 5) {
  //   screennum = 0;
  //   nextbutton.html('enter');
  // }
  
  stopListening();
  speechSynth.cancel();
  
  let nextState = story[thisState].next[0];
  thisState = nextState;

  console.log("--> moved to "+thisState);
  renderInterface();
}

function renderInterface() {

  // display appropriate interface
  if (thisState == "splash") {
    vid.show(); // shows the html video
  } else if (thisState == "character") {
    vid.hide(); // hides the html video
    nextbutton.html('next');
    chartext.show();
    charsel.show();
  } else if (thisState == "preferences") {
    chartext.hide();
    charsel.hide();
    
    advtext.show();
    advslider.show();
    soctext.show();
    socslider.show();
  } else if (thisState == "mictest") {
    advtext.hide();
    advslider.hide();
    soctext.hide();
    socslider.hide();

    audiotext.show();
    recbtn.show();
    speechoutput.show();
    // toggleRecButton();
    audiotext.html(story["mictest"].text);
    doMicTest();

  } else if (thisState == "waiting") {
    // WAITING
    audiotext.hide();
    recbtn.hide();
    speechoutput.hide();

    nextbutton.hide();

    waittext = createP(story["waiting"].text);
    waittext.style("position", "relative");
    waittext.parent("contents");
    waittext.style("top", "50vh");

    let waittime = 5*1000;
    timertext = createP(Math.round(waittime/1000))
    timertext.parent("wallpaper");
    timertext.style("font-size", "384pt");
    timertext.style("color", "#f0f0f0");
    timertext.show();

    timeStartExp = millis() + waittime;
    waitToStart();

  } else if (thisState == "start") {
    // should just make a hideAll() function
    timertext.hide();  
    waittext.hide();

    // show rec button and speech output
    audiotext.show();
    audiotext.html(charsel.value());
    audiotext.style("top", "45vh");
    recbtn.show();
    recbtn.style("top", "50vh");
    speechoutput.show();
    doStart();
  } else if (thisState == "radio") {  
    timertext.hide();  
    waittext.hide();

    showRadio();
    nextbutton.hide();
    radiotext.show();
    let startthis = sample([changeoma, changelax, changelnk, changemm]);
    startthis();
  }
}

function sample(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function waitToStart() {
  let timeleft = timeStartExp - millis();
  if (timeleft > 0) {
    timertext.html(Math.round(timeleft/1000));
    setTimeout(waitToStart, 100)
  } else {
    advanceInterface();
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

function createMicCheck() {
  // audio text
  audiotext = createP("Test your microphone. Exit when done.");
  audiotext.parent("contents");
  // audiotext.style("font-size", "24pt");
  audiotext.style("top", "100px");
  audiotext.hide();

  // record button
  recbtn = createButton("rec");
  recbtn.parent("contents");
  // recbtn.style("font-size", "24pt");
  recbtn.size(120, 40);
  // recbtn.style("top", "10px");
  recbtn.style("margin", "0 auto");
  recbtn.mousePressed(stopListening);
  recbtn.hide();

  // audio text
  speechoutput = createP("(speak now)");
  speechoutput.parent("contents");
  speechoutput.id("speech");
  // audiotext.style("font-size", "24pt");
  speechoutput.style("top", "140px");
  speechoutput.style("color", "gray");
  speechoutput.hide();  
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
  advslider.style("max-width", "400px");
  advslider.style("top", "120px");
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
  socslider.style("max-width", "400px");
  socslider.style("top", "120px");
  socslider.style("margin", "0 auto");
  socslider.parent("contents");
  socslider.input(updateSoc);
  socslider.hide();
}

function updateSoc() {
  // let thisTime = millis() - startTime;
  let thisValue = socslider.value();

  // data.push([thisTime, thisValue]);
  console.log("sociability: ", thisValue);
  // console.log("sociability: ", thisTime, thisValue);
}

function updateAdv()
{ 
  // let thisTime = millis() - startTime;
  let thisValue = advslider.value();

  // data.push([thisTime, thisValue]);
  console.log("adventure: ", thisValue);
  // console.log("sociability: ", thisTime, thisValue);
}

function loadStoryFile(url) {
  story = loadJSON(url);
}