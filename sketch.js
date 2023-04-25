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
let thisState; // current position in story

// user variables

// composition
let storyfile = "story.json";
let jsoncontents;
let story; // structure for story from JSON
let showtimes; 

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
let audioFiles = {};


function preload() {
  // vid = createImg("clouds2.gif", "video of clouds", "anonymous", );
  vid = createImg("assets/clouds2.gif");
  vid.show();
  vid.parent("wallpaper");

  // story
  jsoncontents = loadJSON(storyfile, parseShowData);
}

function setup() {
  noCanvas();

  // NOT USED
  // table = new p5.Table();
  // table.addColumn("time");
  // table.addColumn("value");
  // NOT USED

  // create a unique-ish ID, from https://stackoverflow.com/a/53116778
  
  let uid = getItem('uid');
  if (uid === null) {
    uid = Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9*Math.pow(10, 12)).toString(36);
    storeItem("uid", uid);
  }
  console.log("---", uid);

  // console.log(story);
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
  
  // minimap for debugging
  setupMap();

  thisState = "splash";
}

function charSelectEvent() {
  let myChar = charsel.value();
  background(200);
  console.log('Your character is ' + myChar + '!');
  storeItem('myCharacter', myChar);
}

function advanceInterface() {
  // if (thisState == "splash") loadAudioFiles();
  if (Object.keys(audioFiles).length <= 0) {
    loadAudioFiles();
  }

  // if we have not selected a character
  if (thisState == "character" && charsel.value() == "") {
    // select one randomly
    charsel.selected(sample(characters));
  }

  // stop speaking and listening, just in case
  stopListening();
  speechSynth.cancel();

  if (story[thisState].type == "audio" || story[thisState].type == "question") {
    // if we are into audio story, check location
    let thislatlng = {};
    if (simulate == false) {
      thislatlng.lat = myposition.coords.latitude;
      thislatlng.lng = myposition.coords.longitude;
    } else {
      thislatlng.lat = simposition.lat;
      thislatlng.lng = simposition.lng;
    }

    let results = findClosest(thislatlng);
    closest = results[0];
    closestlabel = locations[closest].label;
    dist = results[1];
    console.log(thislatlng, closest, closestlabel, dist);

    // if we are close to a valid next choice and within distance threshold
    if (story[thisState].next.includes(closestlabel) && dist < story[closestlabel].radius) {
      thisState = closestlabel;
      console.log("--> moved to "+thisState);
    }
  } else {  
    let nextState = story[thisState].next[0];
    thisState = nextState;
    console.log("--> moved to "+thisState);
  }
  renderInterface();
}

function renderInterface() {
  // clear previous layers
  hideAll();

  // display appropriate interface
  if (thisState == "splash") {
    vid.show();
    nextbtn.html("start");
    nextbtn.show();
  } else if (thisState == "character") {
    nextbtn.show();
    nextbtn.html('next');
    chartext.show();
    charsel.show();

  } else if (thisState == "preferences") {
    nextbtn.show();
    // advtext.show();
    // advslider.show();
    // soctext.show();
    // socslider.show();
    showPreferences();

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
    waitToStartScript();

  } else if (thisState == "radio") {  
    showRadio();
    radiotext.show();
    let startRandomStation = sample([changeoma, changelax, changelnk, changemm]);
    startRandomStation();

  } else if (story[thisState].type == "audio") {    
    chartext.show()
    chartext.html(charsel.value());

    // play and advance
    audioFiles[thisState].play();
    audioFiles[thisState].onended(advanceInterface)

    if (thisState == "onboarding") {
      showMap();
    }
  } else if (story[thisState].type == "question") {
    chartext.show()
    chartext.html(charsel.value());
    recbtn.show();
    speechoutput.html("")
    speechoutput.show();

    // play and listen then advance
    audioFiles[thisState].play();
    audioFiles[thisState].onended(listenAndAdvance)
  }
}

function listenAndAdvance() {
    console.log(`file has finished playing`);

    console.log("... now listening ...");
    recbtn.style('background-color', 'red');
    speechoutput.html("(speak now)");
    speechoutput.style("color", "gray");
    speechRec.addEventListener('end', () => stopListening());
    speechRec.start(false, true);
}

function sample(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function waitToStartScript() {
  let timeleft = timeStartExp - millis();
  if (timeleft > 0) {
    timertext.html(Math.round(timeleft/1000));
    setTimeout(waitToStartScript, 100)
  } else {
    advanceInterface();
  }
}

function parseShowData() {
  story = jsoncontents["story"];
  showtimes = jsoncontents["showtimes"];
  // console.log(story);
  // console.log(showtimes);
  // console.log(new Date("Fri, 26 Sep 2014 18:30:00 GMT"));
  let shows = [
    new Date(2023, 3, 27, 16, 30),
    new Date(2023, 3, 27, 17, 30),
    new Date(2023, 3, 27, 18, 30),
  ];
  let nextshow = nearestDate(shows);
  console.log("next show starts: "+shows[nextshow]);

  // load minimap
  parseLocations();
}

function loadAudioFiles() {
  // load audio files
  for(idx in story) {
    // loop over next possibilities for this storypoint
    let thisNode = story[idx];
    if ((thisNode.type == "audio") || (thisNode.type == "question")) {
      audioFiles[idx] = createAudio(thisNode.audio);
      console.log("loaded ", thisNode.audio);
    }
    // audioFile = createAudio(story[thisState].audio);
  }
}

// from https://gist.github.com/miguelmota/28cd8999e8260900140273b0aaa57513
function nearestDate (dates, target) {
  if (!target) {
    target = Date.now()
  } else if (target instanceof Date) {
    target = target.getTime()
  }

  let nearest = Infinity
  let winner = -1

  dates.forEach(function (date, index) {
    if (date instanceof Date) {
      date = date.getTime()
    }
    let distance = Math.abs(date - target)
    if (distance < nearest) {
      nearest = distance
      winner = index
    }
  })

  return winner
}