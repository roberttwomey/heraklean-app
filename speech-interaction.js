// Derived from this p5 sketch prototype:
// https://editor.p5js.org/robert.twomey/sketches/Q9J1Y1RWQ

// Speech interaction for Cleaning the Stables
// heraklean.us | herakles.roberttwomey.com | rtwomey@unl.edu | 2023

// story stuff
let storyfile = "story.json";
let storypoints; // structure for story from JSON
let thisLabel; // label for current point in narrative

// interaction stuff
let bNewStep = false;

// "Continuous recognition" (as opposed to one time only)
let continuous = false;
let interimResults = true;

// DOM sections for speech
let lastHtml = "";
let count = 0;

// recognition
// let speechRec = new p5.SpeechRec("en-US", gotSpeech);
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || window.webkitSpeechGrammarList;
var SpeechRecognitionEvent =
  SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var speechRec = new SpeechRecognition();
speechRec.continuous = false;
speechRec.lang = "en-US";
speechRec.interimResults = true;
speechRec.maxAlternatives = 1;
// speechRec.onresult = gotSpeech();

speechRec.onresult = (event) => {
  // DOM element to display results
  console.log(event);
  let speechoutput = document.getElementById("speech");
  console.log(speechoutput, lastHtml);
  let said = event.results[0][0].transcript;
  // console.log(said);
  if (event.results[0].isFinal == true) {
    // final, add to html
    // let newHtml = lastHtml + `<p> ${said} </p>`;
    let newHtml = lastHtml + "<p>" + said + "</p>";
    console.log(newHtml);
    // speechoutput.innerHTML = newHtml;
    speechoutput.innerHTML = said;
    // speechoutput.SetHTML(newHtml);
    // display what was said
    // speechSynth.speak(said);

    processSpeech(said);
    
    bNewStep = true;
    count += 1;
    lastHtml = speechoutput.innerHTML;
  } else {
    // temp, add in light gray
    let tempspeechoutput = lastHtml + "<p style='color: gray'>" + said + "</p>";
    // speechoutput.html(tempspeechoutput);
    speechoutput.innerHTML = tempspeechoutput;
  }

  // const color = event.results[0][0].transcript;
  // diagnostic.textContent = `Result received: ${color}.`;
  // bg.style.backgroundColor = color;
};

// synthesis
const speechSynth = window.speechSynthesis;

function processSpeech(said) {
  // said contains the string that was heard
  
  
  sayAndListen("I heard " + said);
}

// let next, w, h;
// function setup() {
//   noCanvas();
  
//   w = 300;//displayWidth;
//   h = 200;//displayHeight;
  
//   // next button
//   next = createButton("start");
//   // next.style("color", "green");
//   next.style("font-size", "24pt");
//   next.size(120, 40);
//   next.position(w/2, h-100);
//   next.mousePressed(doStart);
// }

function doStart() {
  console.log("starting");
  
  bNewStep = true;
  thisLabel = "start";
  // thisLabel = "start";
  sayAndListen(storypoints[thisLabel].text);
}

function sayAndListen(thistext) {
  const utterThis = new SpeechSynthesisUtterance(thistext);
  utterThis.onend = (event) => {
    console.log(
      `Utterance has finished being spoken after ${event.elapsedTime} seconds.`
    );

    console.log("... now listening ...");
    toggleRecButton();
    speechRec.start(false, true);
  };
  
  speechSynth.speak(utterThis);
}

function loadStoryFile(url) {
  storypoints = loadJSON(url);
}

// start when clicked on app

// document.onclick = function () {
//   bNewStep = true;
//   thisLabel = "2";
//   // thisLabel = "start";
//   sayAndListen(storypoints[thisLabel].text);
// };
