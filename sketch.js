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
let nextbtn;
let thisState;

// user variables

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
let waittime = 5*1000;

// soundfiles
let currSound;

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

  // screen 0
  createSplashScreen();
  
  // screen 1
  createCharSelector();  
  
  // screen 2
  createSliders()

  // screen 3
  createMicCheck();
  
  // screen 4
  createWaiting();

  // screen 5
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
  //   nextbtn.html('enter');
  // }

  // if we have not selected a character
  if (thisState == "character" && charsel.value() == "") {
    charsel.selected(sample(characters));
  }
  stopListening();
  speechSynth.cancel();
  
  let nextState = story[thisState].next[0];
  thisState = nextState;

  console.log("--> moved to "+thisState);
  renderInterface();
}

function renderInterface() {
  hideAll();

  // display appropriate interface
  if (thisState == "splash") {
    vid.show(); // shows the html video
    nextbtn.html("start");
    nextbtn.show();
  } else if (thisState == "character") {
    nextbtn.show();
    nextbtn.html('next');
    chartext.show();
    charsel.show();
  } else if (thisState == "preferences") {
    nextbtn.show();
    advtext.show();
    advslider.show();
    soctext.show();
    socslider.show();
  } else if (thisState == "mictest") {    
    nextbtn.show();
    audiotext.show();
    recbtn.show();
    speechoutput.show();
    speechoutput.html("");

    audiotext.html(story["mictest"].text);
    doMicTest();
  } else if (thisState == "waiting") {
    waittext.html(story["waiting"].text)
    waittext.show();

    // TODO fix this formatting code. really ugly.
    timertext.show();

    timeStartExp = millis() + waittime;
    waitToStart();

  // } else if (thisState == "start") {
  //   // should just make a hideAll() function
  //   // timertext.hide();  
  //   // waittext.hide();

  //   // show rec button and speech output
  //   audiotext.show();
  //   audiotext.html(charsel.value());
  //   audiotext.style("top", "45vh");
  //   recbtn.show();
  //   recbtn.style("top", "50vh");
  //   speechoutput.show();
  //   doStart();
  } else if (thisState == "radio") {  

    showRadio();
    radiotext.show();
    let startthis = sample([changeoma, changelax, changelnk, changemm]);
    startthis();
  } else if (story[thisState].type == "audio") {    
    chartext.show()
    chartext.html(charsel.value());

    audioFile = createAudio(story[thisState].audio);
    audioFile.autoplay(true);
    audioFile.onended(advanceInterface);
    // garbage collection of file that just stopped
  } else if (story[thisState].type == "question") {
    hideAll();
    chartext.show()
    chartext.html(charsel.value());
    recbtn.show();
    speechoutput.html("")
    speechoutput.show();

    // playAndListen
    audioFile = createAudio(story[thisState].audio);
    audioFile.autoplay(true);
    audioFile.onended(listenAndAdvance)
  }
}

function listenAndAdvance() {
    console.log(`file has finished playing`);

    console.log("... now listening ...");
    recbtn.style('background-color', 'red');
    speechoutput.html("(speak now)");
    speechoutput.style("color", "gray");
    speechRec.start(false, true);
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

function loadStoryFile(url) {
  story = loadJSON(url);
}