// Derived from this p5 sketch prototype:
// https://editor.p5js.org/robert.twomey/sketches/Q9J1Y1RWQ

// Speech interaction for Cleaning the Stables
// heraklean.us | herakles.roberttwomey.com | rtwomey@unl.edu | 2023

// story stuff
let storyfile = "story.json";
let story; // structure for story from JSON
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
    
    // done listening
    bListening = false;
    recbtn.style('background-color', '#f0f0f0');  
    
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
  console.log(thisLabel, said)
  for(idx in story[thisLabel].next) {
    // loop over next possibilities for this storypoint
    let nextidx = story[thisLabel].next[idx];
    for (keyidx in story[nextidx].keywords) {
      // check all the keyphrases for this storypoint
      let phrase = story[nextidx].keywords[keyidx];
      if(said.includes(phrase)) {
        // we found the next step to move to
        thisLabel=nextidx;
        bNewStep=true;
        if(phrase=="done") {
          // sayAndStartRadio(story["waiting"].text);
          stopListening();
          advanceInterface();
          return;
        }
      }
    }
  }
  
  // sayAndListen("I heard " + said);
  // sayAndListen(story[thisLabel].text);
  sayAndListen(story[thisLabel].text);
}

function doStart() {
  console.log("starting");
  
  bNewStep = true;
  thisLabel = "mictest";
  // thisLabel = "start";
  sayAndListen(story[thisLabel].text);
}

function sayAndListen(thistext) {
  const utterThis = new SpeechSynthesisUtterance(thistext);
  utterThis.onend = (event) => {
    console.log(
      `Utterance has finished being spoken after ${event.elapsedTime} seconds.`
    );

    console.log("... now listening ...");
    // toggleRecButton();

    recbtn.style('background-color', 'red');
    speechRec.start(false, true);
  };
  
  speechSynth.speak(utterThis);
}

function sayAndStartRadio(thistext) {
  const utterThis = new SpeechSynthesisUtterance(thistext);
  utterThis.onend = (event) => {
    console.log(
      `Utterance has finished being spoken after ${event.elapsedTime} seconds.`
    );
    // recbtn.style('background-color', 'red');
    // speechRec.start(false, true);
    changeoma();  
  };

  stopListening();
  advanceInterface();
  speechSynth.speak(utterThis);
}

function stopListening() {
  speechRec.stop();
  bListening = false;
  recbtn.style('background-color', '#f0f0f0');  
}

function loadStoryFile(url) {
  story = loadJSON(url);
}