// NOTE: this app has migrated to: 
// https://github.com/roberttwomey/heraklean-app

// weather radio from here: https://editor.p5js.org/robert.twomey/sketches/edH7FDhyw

// advance through screens
let nextbtn;
let thisState; // current position in story

// composition
let storyfile = "story.json";
let jsoncontents;
let story; // structure for story from JSON
let showtimes; 

// screen 0
let vid;

// screen 1
let charsel, seltext;
let chartext, charbiotext;

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
let timeStoryClock;
let clockTimeStoryStarted; // Date

let audioCueTime = 0;

let bStartedStory = false;

// soundfiles
let currSound;
let audioFiles = {};

// options
let optionA, optionB;
let bOptions = false;

// offboarding
let offboardingtext;

function preload() {
  // vid = createImg("clouds2.gif", "video of clouds", "anonymous", );
  vid = createImg("assets/clouds2.gif");
  vid.show();
  vid.parent("wallpaper");

  // read story file
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
    console.log("new uid");
    storeItem("uid", uid);
  }
  console.log("---", uid);

  thisState = "splash";
  
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

  // options
  createOptions();
  
  // minimap for debugging
  setupMap();

  // options
  createOffboarding();

  // check last time and get started
  // check last state position
  let lastState = getItem("state");
  // console.log("last state", lastState);
  if (lastState in story) {
    // check previous starttime, are we resuming? and if so, at what point?
    let tempTime = Date.parse(getItem("timestarted"));
    if (!isNaN(tempTime)) {
      console.log("clockTimeStarted", tempTime);
      clockTimeStoryStarted = tempTime;
      let currtime = new Date();
      storyTimeElapsed = currtime - tempTime;
      console.log("on startup \'"+lastState+"\': story time elapsed", storyTimeElapsed/1000.0);
      fastForwardStory(lastState, storyTimeElapsed);

      story["splash"].next = [thisState];
      thisState = "splash";
    
    }
  } else {
    thisState = "splash";
  }
  
  // renderInterface();
}

function fastForwardStory(resumeState, elapsedTime) {
  // if (story[lastState].tim
  let elapsedTimeSeconds = elapsedTime / 1000.0;
  console.log("fastForward() from", resumeState, "with", elapsedTimeSeconds, "seconds elapsed");
  thisState = resumeState;

  let done = false;
  while (!done) {
    let storytime = story[thisState].starttime + story[thisState].duration;
    console.log("storytime at end of",thisState, ":", storytime);
    if (storytime < elapsedTimeSeconds) {
      thisState = story[thisState].next[0]; // change to geoloc, instaed of choosing first option
    } else {
      done = true;
    }
  }
  if (thisState == "offboarding") {
    thisState = "splash";
  } else {
    audioCueTime = elapsedTimeSeconds - story[thisState].starttime;
    console.log("stopping at", thisState,"at", audioCueTime,"seconds in");
  }
}

function charSelectEvent() {
  let myChar = charsel.value();
  background(200);
  console.log('Your character is ' + myChar + '!');
  storeItem('myCharacter', myChar);
}

function advanceInterface() {
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

  // location based advancement
  if (story[thisState].type == "audio" || story[thisState].type == "question") {
    // DISABLE LOCATION FOR WALKTHROUGH
    // waitForNextLoc();

    // if (bGeolocStarted == false) {
    //   bGeolocStarted = true;
    //   console.log("started geoloc: ", thisState);
    // }

    if (story[thisState].next.length > 1) {
    } else {
      let nextState = story[thisState].next[0];
      thisState = nextState;
      storeItem("state", thisState);
      console.log("--> moved to "+thisState, "stored");
    }
  } else {  
    let nextState = story[thisState].next[0];
    thisState = nextState;
    storeItem("state", thisState);
    console.log("--> moved to"+thisState);
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
    let waittime = 5000;
    timeStartExp = millis() + waittime;
    fakeWait();
    // waitToStartScript();

  } else if (thisState == "offboarding") {
    offboardingtext.show();
    setTimeout(renderInterface, 5000);

  }else if (thisState == "radio") {  
    showRadio();
    radiotext.show();
    let startRandomStation = sample([changeoma, changelax, changelnk, changemm]);
    startRandomStation();

  } else if (story[thisState].type == "audio") {    
    chartext.html(charsel.value());
    chartext.show()
    charbiotext.html(backstories[charsel.value()]);
    charbiotext.show();

    if (story[thisState].next.length > 1) {
      // showOptions();
      // presentOptions();
      bOptions = true;
      audioFiles[thisState].onended(presentOptions);
      
      // time diff between now and time it should start
      let timeelapsed = millis() - timeStoryClock;
      let timediff = (story[thisState].timestart*1000) - timeelapsed;
      if (timediff > 0) {
        console.log("*** we are early, starting", thisState, "audio in", timediff/1000, "seconds");
        setTimeout(audioFiles[thisState].play(), timediff);
      } else {
        console.log("*** starting", thisState, "audio", audioFiles);
        if (audioCueTime > 0) {
          audioFiles[thisState].currentTime = audioCueTime;
          console.log("*** seeking to", audioCueTime, "==", audioFiles[thisState].currentTime);
        }
        setTimeout(audioFiles[thisState].play, 200);
      }
    } else {
      // play and advance
      audioFiles[thisState].play();
      if (audioCueTime > 0) {
        audioFiles[thisState].currentTime = audioCueTime;
      }
      audioFiles[thisState].onended(advanceInterface)
    }
    if (thisState == "onboarding") {
      showMap();
    } else {
      hideMap();
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

function presentOptions() {
  if (bOptions == true) {
    // display options as buttons with callbacks that advance status
    console.log("presenting options for ", thisState);
    optionA.html(story[thisState].nexttext[0]);
    optionB.html(story[thisState].nexttext[1]);
    showOptions();
   setTimeout(presentOptions, 2000);
  }
}

function chooseOptionA() {
  let nextState = story[thisState].next[0];
  thisState = nextState;
  storeItem("state", thisState);
  console.log("--> moved to "+thisState);
  bOptions = false;
  setTimeout(renderInterface, 200);
}

function chooseOptionB() {
  let nextState = story[thisState].next[1];
  thisState = nextState;
  storeItem("state", thisState);
  console.log("--> moved to "+thisState);
  bOptions = false;
  setTimeout(renderInterface, 200);
}

function waitForNextLoc() {
  let thislatlng = {};
  if (simulate == false && myposition != undefined) {
    thislatlng.lat = myposition.coords.latitude;
    thislatlng.lng = myposition.coords.longitude;
  } else {
    thislatlng.lat = simposition.lat;
    thislatlng.lng = simposition.lng;
  }

  let results = findClosestInList(thislatlng, story[thisState].next);
  closestlabel = results[0]
  // closestlabel = locations[closest].label;
  dist = results[1];
  if (closestlabel != undefined && dist < 5000000) {
    if (dist < story[closestlabel].radius) {
      thisState = closestlabel;
      console.log("--> moved to "+thisState);
      renderInterface();
    }

  }
  setTimeout(waitForNextLoc, 500);
}

function listenAndAdvance() {
    console.log(`file has finished playing`);

    console.log("... now listening ...");
    doListen();
    // recbtn.style('background-color', 'red');
    // speechoutput.html("(speak now)");
    // speechoutput.style("color", "gray");
    // speechRec.addEventListener('end', () => stopListening());
    // speechRec.start(false, true);
}

function sample(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function fakeWait() {
  let timeleft = timeStartExp-millis();
  if (timeleft > 0) {
    timertext.html(round(timeleft/1000));
    setTimeout(fakeWait, 1000)
  } else {
    timeStoryClock = millis();
    clockTimeStoryStarted = new Date();
    storeItem("timestarted", clockTimeStoryStarted);
    console.log(" -----> CLOCK TIME STORY STARTED", clockTimeStoryStarted);
    advanceInterface();
  }
}

function waitToStartScript() {
  let remaining = timeToStart();
  let hours = remaining[0];
  let mins = remaining[1];
  let seconds = remaining[2];
  let timeleft = remaining[3];
  if (timeleft > 0) {
    hours = String(hours).padStart(2, '0');
    mins = String(mins).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');
    timertext.html(hours+":"+mins+":"+seconds);
    setTimeout(waitToStartScript, 500)
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
  // let shows = [
  //   new Date(2023, 3, 27, 16, 30),
  //   new Date(2023, 3, 27, 17, 30),
  //   new Date(2023, 3, 27, 18, 30),
  // ];
  nextshow = nearestFutureShow();
  nextshowtime = arrToDate(showtimes[nextshow]);
  console.log("next show starts: "+nextshowtime.toLocaleString());

  // load minimap
  // parseLocations();
  parseStoryLocations();
}

function timeToStart() {
  let currtime = new Date();
  let diff =(nextshowtime.getTime() - currtime.getTime()) / 1000;
  let seconds = round(diff);
  let result = divmod(seconds, 60);
  let result2 = divmod(result[0], 60);
  // console.log(result2[0], ":", result2[1], ":", result[1], " ", seconds);
  return [result2[0], result2[1], result[1], seconds];
}

const divmod = (x, y) => [Math.floor(x / y), x % y];

// from https://gist.github.com/miguelmota/28cd8999e8260900140273b0aaa57513
function nearestFutureShow () {
  let currtime = new Date();
  console.log(currtime.toLocaleString());
  let min;
  for (i in showtimes) {
    // console.log(i);
    let tt = showtimes[i];
    let show = arrToDate(tt);
    // console.log(i, show.toLocaleString());
    let diff = currtime - show;
    if (min == undefined) {
      min = diff;
      minidx = i;
    } else if (diff < min && min > 0) {
      min = diff;
      minidx = i;
    }
  }
  // console.log(minidx, min);
  return minidx;
}

function arrToDate(tt) {
  return new Date(tt[0], tt[1], tt[2], tt[3], tt[4]);
}

function loadAudioFiles() {
  // load audio files
  for(idx in story) {
    // loop over next possibilities for this storypoint
    let thisNode = story[idx];
    if ((thisNode.type == "audio") || (thisNode.type == "question")) {
      audioFiles[idx] = createAudio(thisNode.audio);
      console.log("loaded ", thisNode.audio, thisNode.audio.duration);
    }
    // audioFile = createAudio(story[thisState].audio);
  }
}