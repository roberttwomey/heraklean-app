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
  let speechoutput = document.getElementById("speech");
  let said = event.results[0][0].transcript;
  
  if (event.results[0].isFinal == true) {
    // final result: add to html
    // let newHtml = lastHtml + `<p> ${said} </p>`;
    let newHtml = lastHtml + "<p>" + said + "</p>";
    speechoutput.innerHTML = said;
    speechoutput.style.color = 'black';
    
    // display what was said
    // speechSynth.speak(said);

    processSpeech(said);
    
    // advance and liston
    bNewStep = true;
    count += 1;
    lastHtml = speechoutput.innerHTML;
  } else {
    // temp result: display in light gray
    let tempspeechoutput = lastHtml + "<p style='color: gray'>" + said + "</p>";
    // speechoutput.html(tempspeechoutput);
    speechoutput.innerHTML = tempspeechoutput;
  }
};

// synthesis
const speechSynth = window.speechSynthesis;

function processSpeech(said) {
  // said contains the string that was heard
  
  
  sayAndListen("I heard " + said);
}

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
