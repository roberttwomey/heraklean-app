function createSplashScreen() {
  // vid.show();
  nextbtn = createButton("start");
  nextbtn.parent("nextbtn");
  nextbtn.size(120, 40);
  // nextbtn.style("top", "400px");
  // nextbtn.style("top", "50vh");
  nextbtn.style("margin", "0 auto");
  nextbtn.mousePressed(advanceInterface);
}

function createPauseScreen() {
  pausebutton = createButton("WAIT");
  pausebutton.parent("nextbtn");
  pausebutton.size(120, 40);
  pausebutton.style("bottom", "300px");
  pausebutton.style("margin", "0 auto");
  // nextbtn.style("top", "400px");
  // pausebutton.style("top", "50vh");
  // pausebutton.style("left", "50vw");
  // pausebutton.style("margin", "0 auto");
  pausebutton.mousePressed(advanceInterface);
  pausebutton.hide();
}

function createCharSelector() {
    // character text
  chartext = createP("select your character:");
  chartext.parent("contents");
  chartext.style("top", "80px");

  charbiotext = createP("This is your story.");
  charbiotext.parent("contents");
  charbiotext.style("top", "120px");
  charbiotext.style("font-size", "16pt");
  charbiotext.style("margin-left", "20px");
  charbiotext.style("margin-right", "20px");
  charbiotext.hide();
  
  // character selector
  charsel = createSelect();
  charsel.option("")
  for (thischar in characters) {
    charsel.option(characters[thischar]);
  }
  
  let myCharacter = getItem('myCharacter');
  if (myCharacter === null) {
    charsel.selected("");
   } else {
    charsel.selected(myCharacter);
   }

  // charsel.selected("");
  charsel.changed(charSelectEvent);
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
  audiotext.style("top", "45vh");
  audiotext.hide();

  // record button
  recbtn = createButton("rec");
  recbtn.parent("contents");
  recbtn.size(120, 40);
  recbtn.style("top", "50vh");
  recbtn.style("margin", "0 auto");
  recbtn.mousePressed(toggleListening);
  recbtn.hide();

  // audio text
  speechoutput = createP("(speak now)");
  speechoutput.parent("contents");
  speechoutput.id("speech");
  speechoutput.style("top", "140px");
  speechoutput.style("color", "gray");
  speechoutput.hide();  
}


// PREFERENCES SCREEN 

let prefs = [
  "adventure",
  "sociability",
  "risk",
  "pleasure",
  "humor",
  "optimism",
  "wellbeing",
  "achievement"
]

let prefText = {};
let prefSliders = {};

function createSliders() {

  for (i in prefs) {
    // title text
    let pref = prefs[i];
    prefText[pref] = createP(pref);
    prefText[pref].parent("contents");
    prefText[pref].style("top", "90px");
    prefText[pref].style("line-height", "16pt");
    prefText[pref].hide();

    // slider element
    prefSliders[pref] = createSlider(-5, 5, 0);
    prefSliders[pref].parent("contents");
    prefSliders[pref].style("top", "110px");
    prefSliders[pref].input(() => updateSlider(pref));
    prefSliders[pref].hide();

    // check cached value
    let myval = getItem(pref);
    if (myval === null) {
      prefSliders[pref].value(0);
     } else {
      prefSliders[pref].value(myval);
     }
  }
}

function updateSlider(name) {
  let thisValue = prefSliders[name].value();

  // data.push([thisTime, thisValue]);
  console.log(name, ": ", thisValue);
  storeItem(name, thisValue);
}

function showPreferences() {
  for (i in prefs) {
    let pref = prefs[i];
    prefText[pref].show();
    prefSliders[pref].show();
  }
}

function createWaiting() {
  timertext = createP(Math.round(waittime/1000))
  timertext.parent("countdown");
  timertext.style("position", "relative");
  timertext.style("font-size", "128pt");
  // timertext.style("color", "#f0f0f0");
  timertext.style("color", "#bfe5e5");
  timertext.style("top", "45vh");
  timertext.style("margin", "0 auto");
  timertext.style("line-height", "128pt");
  timertext.hide();

  waittext = createP(story["waiting"].text);
  waittext.style("position", "relative");
  waittext.parent("contents");
  waittext.style("top", "50vh");
  waittext.style("line-height", "24px");
  waittext.hide();
}

function createOffboarding() {
  offboardingtext = createP(story["offboarding"].text);
  offboardingtext.style("position", "relative");
  offboardingtext.parent("contents");
  offboardingtext.style("top", "50vh");
  offboardingtext.style("line-height", "24px");
  offboardingtext.hide();
}

function hideAll() {
  nextbtn.hide();

  vid.hide();
  
  chartext.hide();
  charsel.hide();
  charbiotext.hide();

  // advtext.hide();
  // advslider.hide();
  // soctext.hide();
  // socslider.hide();
  for (i in prefs) {
    let pref = prefs[i];
    prefText[pref].hide();
    prefSliders[pref].hide();
  }

  audiotext.hide();
  recbtn.hide();
  speechoutput.hide();
  
  timertext.hide();  
  waittext.hide();

  optionA.hide();
  optionB.hide();

  offboardingtext.hide();

  pausebutton.hide();
}

function createOptions() {
  optionA = createButton("Option A");
  optionA.parent("contents");
  optionA.size(300, 100);
  optionA.style("top", "100px");
  optionA.style("margin", "0 auto");
  optionA.mousePressed(chooseOptionA);

  optionB = createButton("Option B");
  optionB.parent("contents");
  optionB.size(300, 100);
  optionB.style("margin", "0 auto");
  optionB.style("top", "150px");
  optionB.mousePressed(chooseOptionB);

  optionA.hide();
  optionB.hide();
}

function showOptions() {
  optionA.show();
  optionB.show();
}