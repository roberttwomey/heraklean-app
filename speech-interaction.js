// Derived from this p5 sketch prototype:
// https://editor.p5js.org/robert.twomey/sketches/Q9J1Y1RWQ

// Speech interaction for Cleaning the Stables
// heraklean.us | herakles.roberttwomey.com | rtwomey@unl.edu | 2023

// interaction stuff
let bNewStep = false;

// "Continuous speechRec" (as opposed to one time only)
let continuous = false;
let interimResults = true;
let bRecognizing = false;

// DOM sections for speech
let lastHtml = "";
let count = 0;

// speechRec
// let speechRec = new p5.speechRec("en-US", gotSpeech);
var speechRecognition = speechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || window.webkitSpeechGrammarList;
var speechRecognitionEvent =
  speechRecognitionEvent || webkitSpeechRecognitionEvent;

var speechRec = new speechRecognition();
speechRec.continuous = false;
speechRec.lang = "en-US";
speechRec.interimResults = true;
speechRec.maxAlternatives = 1;

speechRec.onresult = (event) => {
  // DOM element to display results
  let speechoutput = document.getElementById("speech");
  let said = event.results[0][0].transcript;
  
  if (event.results[0].isFinal == true) {
    // final result
    speechoutput.innerHTML = said;
    speechoutput.style.color = 'black';
    console.log("final result");

    // done listening
    bListening = false;
    recbtn.style('background-color', '#f0f0f0');
    speechRec.stop();
    bListening = false;  
    // stopListening();

    // speak what was said
    // speechSynth.speak(said);
    // setTimeout(processSpeech(said), 3000);
    processSpeech(said);
    
  } else {
    // temp result: display in light gray
    speechoutput.innerHTML = said;
    speechoutput.style.color =  "gray";
  }
};

// synthesis
const speechSynth = window.speechSynthesis;

function processSpeech(said) {
  // stopListening();
  // said contains the string that was heard
  console.log(thisState, said)
  if (story[thisState].type == "question") {
    console.log("to "+thisState+": "+said);
    stopListening();
    advanceInterface();
    // advanceInterface();
    return;
  } else {
    // COMMENT OUT, DON"T NEED 
    // loop over next possibilities for this storypoint
    for (idx in story[thisState].next) {
      console.log("processSpeech(): curr idx is "+idx);
      let nextidx = story[thisState].next[0];
      console.log("processSpeech(): next idx is "+nextidx);
      for (keyidx in story[nextidx].keywords) {
        // check all the keyphrases for this storypoint
        let phrase = story[nextidx].keywords[keyidx];
        if(said.includes(phrase)) {
          // we found the next step to move to
          thisState=nextidx;
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
  }  
  // sayAndListen("I heard " + said);
  // sayAndListen(story[thisState].text);
  // sayAndListen(story[thisState].text);
  
  console.log("processSpeech(): finished listening... starting again")
  setTimeout(startListening, 2000);
  // startListening();
}

// NO LONGER NEEDED saturday april 22
// function doStart() {
//   console.log("starting");
//   bNewStep = true;
//   sayAndListen(story[thisState].text);
// }

function doMicTest() {
  console.log("doing mic test");
  startListening();
}

// function sayAndListen(thistext) {
//   const utterThis = new SpeechSynthesisUtterance(thistext);
//   utterThis.onend = (event) => {
//     console.log(
//       `Utterance has finished being spoken after ${event.elapsedTime} seconds.`
//     );

//     console.log("... now listening ...");

//     recbtn.style('background-color', 'red');
//     speechoutput.html("(speak now)");
//     speechoutput.style("color", "gray");

//     // speechRec.addEventListener('end', speechRec.start(false, true));
//     // speechRec.start(false, true);
//     // speechRec.addEventListener('end', () => speechRec.start(false, true)); 
//     // speechRec.addEventListener('end', () => stopListening()); 
//     speechRec.start(false, true);
//   };
  
//   speechSynth.speak(utterThis);
// }

function startListening() {
  console.log("... now listening ...");
  // toggleRecButton();

  bListening = true;
  recbtn.style('background-color', 'red');
  speechoutput.html("(speak now)");
  speechoutput.style("color", "gray");
  speechoutput.show();

  // speechRec.addEventListener('end', speechRec.start(false, true));
  // speechRec.start(false, true);
  // speechRec.addEventListener('end', () => speechRec.start(false, true)); 
  speechRec.addEventListener('end', () => stopListening()); 
  speechRec.start(false, true);
}

function stopListening() {
  console.log("stopListening()");
  speechRec.stop();
  bListening = false;
  recbtn.style('background-color', '#f0f0f0');
  speechoutput.hide();  
}

function toggleListening() {
  if (bListening==true) {
    speechSynth.cancel();
    stopListening();
  } else {
    startListening();
  }
}

speechRec.onstart = function () {
  bRecognizing = true;
};

speechRec.onend = function () {
  bRecognizing = false;
};

speechRec.onerror = function (event) {
  bRecognizing = false;
};
