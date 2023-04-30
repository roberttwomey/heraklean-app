// NOTE: this app has migrated to: 
// https://github.com/roberttwomey/heraklean-app

// weather radio from here: https://editor.p5js.org/robert.twomey/sketches/edH7FDhyw

// advance through screens
let nextbtn;

// story state
let thisState; // current position in story
let timeDoneWaiting;
let waittime = 20000;
let timeStoryClock = 0;
let clockTimeStoryStarted; // Date
let resulttime;

let bContinueSession = false;
let lastState;
let lastTimeStart;

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

let audioCueTime = 0;

let bStartedStory = false;
let bResuming = false;

// reset button
let resetbtn;

// soundfiles
let audioFiles = {};

// options
let optionA, optionB;
let bOptions = false;

// pause
let pausebutton;
let pausetext;

// offboarding
let offboardingtext;

function preload() {
  // vid = createImg("clouds2.gif", "video of clouds", "anonymous", );
  vid = createImg("assets/clouds2.gif");
  vid.show();
  vid.parent("wallpaper");

  // read story file and parse data
  jsoncontents = loadJSON(storyfile, parseStoryData);
}

function setup() {
  noCanvas();

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
  
  // screen 3.5
  createPauseScreen();

  // screen 4
  createWaiting();

  // screen 5
  // setupRadio();

  // options
  createOptions();
  
  // minimap for debugging
  // setupMap();

  // options
  createOffboarding();

  // check our stored data from last session

  // check last state position
  lastState = getItem("state");
  console.log("stored state:", lastState);
  if (lastState in story) {
    if (story[lastState].type == "audio") {
      // // check previous starttime, are we resuming? and if so, at what point?
      lastTimeStart = Date.parse(getItem("timestarted"));
      if (!isNaN(lastTimeStart)) {
        fastForwardStory(lastState, lastTimeStart);
        bStarted = true;
        nextbtn.html("resume");
        nextbtn.style("left", "20px");
        nextbtn.style("bottom", "0px");
        nextbtn.style("position", "absolute");
        resetbtn.show();
        bResuming = true;
        // story["splash"].next = [thisState];
        // thisState = "splash";
      } else {
        
      }
    }
  } else {
    thisState = "splash";
  }

  // thisState = "splash";
  
  // renderInterface();
}

function resetStorage() {
  clearStorage();
  console.log("resetStorage(): cleared resume data from storage...");
  resetbtn.hide();
  resetNextStyle();

  thisState = "splash";
  bResuming = false;
  bContinueSession = false;
  
  location.reload();
  // renderInterface();
}

function fastForwardStory(resumeState, storedTime) {
  // if (story[lastState].tim
  console.log("fastForwardStory(): stored timestarted", storedTime);
  clockTimeStoryStarted = storedTime;
  let currtime = new Date();
  elapsedTime = currtime - storedTime;
  console.log("on setup(): state=", resumeState,", story time elapsed", elapsedTime/1000.0);

  let elapsedTimeSeconds = elapsedTime / 1000.0;
  console.log("fastForward() from", resumeState, "with", elapsedTimeSeconds, "seconds elapsed");
  thisState = resumeState;

  let done = false;
  while (!done) {
    let endofsegment = story[thisState].starttime + story[thisState].duration;
    console.log("storytime at beg of",thisState, ":", story[thisState].starttime);
    console.log("storytime at end of",thisState, ":", endofsegment);
    if (elapsedTimeSeconds > endofsegment) {
      thisState = story[thisState].next[0]; // change to geoloc, instead of choosing first option
    } else {
      done = true;
    }
  }
  if (thisState == "offboarding") {
    thisState = "splash";
    console.log("fastForwarded() to end. Restarting at ", thisState);
  } else {
    audioCueTime = elapsedTimeSeconds - story[thisState].starttime;
    console.log("calculating audio cue for", thisState,"file", story[thisState].audio, "at", audioCueTime,"seconds in");
    let storedchar = getItem('myCharacter');
    console.log("stored character:", storedchar);
    if (characters.includes(storedchar)) {
      console.log("character is in characters");
      charsel.value(storedchar);
    } else {
      console.log("character not in characters");
      console.log(characters);
      charsel.value(sample(characters));
    }
    chartext.html(charsel.value());
    charbiotext.html(backstories[charsel.value()]);
  }
  bContinueSession = true;
}

function charSelectEvent() {
  let myChar = charsel.value();
  // background(200);
  console.log('Your character is ' + myChar + '!');
  storeItem('myCharacter', myChar);
}

function advanceInterface() {
  console.log("advanceInterface()");
  // if (Object.keys(audioFiles).length <= 0) {
  //   loadAudioFiles();
  // }
  if (!bContinueSession && timeStoryClock == 0 && !bResuming) {
    // timeStoryClock = millis();
    // clockTimeStoryStarted = new Date();
    // storeItem("timestarted", clockTimeStoryStarted);
    // console.log(" -----> CLOCK TIME STORY STARTED", clockTimeStoryStarted);
    console.log("advanceInterface():", thisState, "not continuing, not resuming");
    startClock();
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
  if (bContinueSession) {
    console.log("going with", thisState);
  } else if (story[thisState].type == "audio" || story[thisState].type == "question") {
    // DISABLE LOCATION FOR WALKTHROUGH
    // waitForNextLoc();

    // if (bGeolocStarted == false) {
    //   bGeolocStarted = true;
    //   console.log("started geoloc: ", thisState);
    // }

    if (story[thisState].next.length > 1) {
      let nextState = sample(story[thisState].next);
      thisState = nextState;
      storeItem("state", thisState);
      console.log("--> moved to ",thisState, "stored");
    } else {
      let nextState = story[thisState].next[0];
      thisState = nextState;
      storeItem("state", thisState);
      console.log("--> moved to ", thisState, "stored");
    }


    // REMOVED THIS LOGIC FOR FIRST DAY OF SHOW APRIL 27
    // if (story[thisState].next.length > 1) {
    // } else {
    //   let nextState = story[thisState].next[0];
    //   thisState = nextState;
    //   storeItem("state", thisState);
    //   console.log("--> moved to "+thisState, "stored");
    // }
  } else {  
    if (story[thisState].next.length > 1) {
      let nextState = sample(story[thisState].next);
      thisState = nextState;
      storeItem("state", thisState);
      console.log("--> moved to ", thisState, "stored");
    } else {
      let nextState = story[thisState].next[0];
      thisState = nextState;
      storeItem("state", thisState);
      console.log("--> moved to ",thisState);
    }
  }
  renderInterface();
}

function renderInterface() {
  // clear previous layers
  hideAll();
  console.log("renderInterface()");
  // display appropriate interface
  if (thisState == "splash") {
    vid.show();
    nextbtn.html("start");
    nextbtn.show();
  } else if (thisState == "character") {
    nextbtn.show();
    nextbtn.html('next');
    // if (bResuming) nextbtn.html("resume");
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
    timeDoneWaiting = millis() + waittime;
    waitForStart();
    // waitToStartSchedule();

  } else if (thisState == "pause") {
    pausebutton.show();
    pausetext.show();
  }
  else if (thisState == "offboarding") {
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
    
    // calc updated time
    if(bContinueSession) { 
      fastForwardStory(lastState, lastTimeStart);
      bContinueSession = false;
    }

    if (story[thisState].next.length > 1) {
      // showOptions();
      // presentOptions();
      bOptions = true;
      audioFiles[thisState].onended(presentOptions);
      
      // time diff between now and time it should start
      let timeelapsed = millis() - timeStoryClock;
      let timediff = (story[thisState].timestart*1000) - timeelapsed;
      console.log("renderInterface():", timediff, timeStoryClock);
      if (timediff > 0) {
        console.log("*** we are early, starting", thisState, "audio in", timediff/1000, "seconds");
        setTimeout(audioFiles[thisState].play(), timediff);
      } else if (audioCueTime > 0) {
          audioFiles[thisState].time(audioCueTime);
          console.log("*** seeking to", audioCueTime, "==", audioFiles[thisState].time());
          audioFiles[thisState].play();
        // setTimeout(audioFiles[thisState].play, 200);
        // audioFiles[thisState].play().time(audioCueTime);
      } else {
        console.log("*** starting", thisState, "audio");//, audioFiles);
        audioFiles[thisState].play();
      }
    } else {
      // play and advance
      console.log("renderInterface(): playing file", audioFiles[thisState].elt.currentSrc );
      audioFiles[thisState].play();
      if (audioCueTime > 0) {
        setTimeout(() => {
          resulttime = audioFiles[thisState].time(audioCueTime);
          console.log("renderInterface() seek: delayed for 2 seconds.");
          console.log("renderInterface(): seeking file", audioFiles[thisState].elt.currentSrc, "to", audioCueTime, " ",audioFiles[thisState].elt.currentTime);
        }, "2000");
        // console.log("renderInterface(): seeking file", audioFiles[thisState].elt.currentSrc, "to", audioCueTime, " ",resulttime);
      }
      audioFiles[thisState].onended(advanceInterface)
    }
    // if (thisState == "onboarding") {
    //   showMap();
    // } else {
    //   hideMap();
    // }
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
  //  setTimeout(presentOptions, 2000);
  } else {
    // optionA.hide();
    // optionB.hide();
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

function waitForStart() {
  let timeleft = timeDoneWaiting-millis();
  if (timeleft > 0) {
    timertext.html(round(timeleft/1000));
    setTimeout(waitForStart, 1000)
  } else {
    startClockAndAdvance();
  }
}

function startClock() {
  timeStoryClock = millis();
  clockTimeStoryStarted = new Date();
  storeItem("timestarted", clockTimeStoryStarted);
  console.log(" -----> CLOCK TIME STORY STARTED", clockTimeStoryStarted);
}
function startClockAndAdvance() {
  startClock();
  advanceInterface();
}

function waitToStartSchedule() {
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
    setTimeout(waitToStartSchedule, 500)
  } else {
    advanceInterface();
  }
}

function parseStoryData() {
  story = jsoncontents["story"];
  showtimes = jsoncontents["showtimes"];
  
  // nextshow = nearestFutureShow();
  // nextshowtime = arrToDate(showtimes[nextshow]);
  // console.log("next show starts: "+nextshowtime.toLocaleString());

  // load minimap GEOLOC stuff
  // parseLocations();
  parseStoryLocations();

  if (Object.keys(audioFiles).length <= 0) {
    loadAudioFiles();
  }
}

// function timeToStart() {
//   let currtime = new Date();
//   let diff =(nextshowtime.getTime() - currtime.getTime()) / 1000;
//   let seconds = round(diff);
//   let result = divmod(seconds, 60);
//   let result2 = divmod(result[0], 60);
//   // console.log(result2[0], ":", result2[1], ":", result[1], " ", seconds);
//   return [result2[0], result2[1], result[1], seconds];
// }

// const divmod = (x, y) => [Math.floor(x / y), x % y];

// // from https://gist.github.com/miguelmota/28cd8999e8260900140273b0aaa57513
// function nearestFutureShow () {
//   let currtime = new Date();
//   console.log(currtime.toLocaleString());
//   let min;
//   for (i in showtimes) {
//     // console.log(i);
//     let tt = showtimes[i];
//     let show = arrToDate(tt);
//     // console.log(i, show.toLocaleString());
//     let diff = currtime - show;
//     if (min == undefined) {
//       min = diff;
//       minidx = i;
//     } else if (diff < min && min > 0) {
//       min = diff;
//       minidx = i;
//     }
//   }
//   // console.log(minidx, min);
//   return minidx;
// }

// function arrToDate(tt) {
//   return new Date(tt[0], tt[1], tt[2], tt[3], tt[4]);
// }

function loadAudioFiles() {
  // audio nodes
  for(idx in story) {
    // load audio files for this node
    let thisNode = story[idx];
    if ((thisNode.type == "audio") || (thisNode.type == "question")) {
      audioFiles[idx] = createAudio(thisNode.audio);
      console.log("loaded ", thisNode.audio, thisNode.audio.duration);
      audioFiles[idx].stop();
    }
  }
}