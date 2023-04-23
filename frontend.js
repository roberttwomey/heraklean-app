function createSplashScreen() {
  // vid.show();
  nextbtn = createButton("start");
  nextbtn.parent("contents");
  nextbtn.size(120, 40);
  // nextbtn.style("top", "400px");
  nextbtn.style("top", "50vh");
  nextbtn.style("margin", "0 auto");
  nextbtn.mousePressed(advanceInterface);
}

function createCharSelector() {
    // character text
  chartext = createP("select your character:");
  chartext.parent("contents");
  chartext.style("top", "80px");
  
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

function createSliders() {
  // title
  advtext = createP("adventure");
  advtext.parent("contents");
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

  let myval = getItem('adventure');
  if (myval === null) {
    advslider.value(0);
   } else {
    advslider.value(myval);
   }

  
  // sociability
  soctext = createP("sociability");
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

  myval = getItem('sociability');
  if (myval === null) {
    socslider.value(0);
   } else {
    socslider.value(myval);
   }
}

function createWaiting() {
  timertext = createP(Math.round(waittime/1000))
  timertext.parent("countdown");
  timertext.style("position", "relative");
  timertext.style("font-size", "384pt");
  timertext.style("color", "#f0f0f0");
  timertext.style("top", "50vh");
  timertext.style("margin", "0 auto");
  timertext.style("line-height", "90px");
  timertext.hide();

  waittext = createP(story["waiting"].text);
  waittext.style("position", "relative");
  waittext.parent("contents");
  waittext.style("top", "50vh");
  waittext.style("line-height", "24px");
  waittext.hide();
}

function updateSoc() {
  let thisValue = socslider.value();

  // data.push([thisTime, thisValue]);
  console.log("sociability: ", thisValue);
  storeItem("sociability", thisValue);
}

function updateAdv()
{ 
  let thisValue = advslider.value();

  // data.push([thisTime, thisValue]);
  console.log("adventure: ", thisValue);
  storeItem("adventure", thisValue);
}

function hideAll() {
  nextbtn.hide();

  vid.hide();
  
  chartext.hide();
  charsel.hide();

  advtext.hide();
  advslider.hide();
  soctext.hide();
  socslider.hide();

  audiotext.hide();
  recbtn.hide();
  speechoutput.hide();
  
  timertext.hide();  
  waittext.hide();
}