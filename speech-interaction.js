// Derived from this p5 sketch prototype:
// https://editor.p5js.org/robert.twomey/sketches/Q9J1Y1RWQ

// Speech interaction for Cleaning the Stables
// heraklean.us | herakles.roberttwomey.com | rtwomey@unl.edu | 2023

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
    // let newHtml = lastHtml + "<p>" + said + "</p>";
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
    // lastHtml = speechoutput.innerHTML;
  } else {
    // temp result: display in light gray
    // let tempspeechoutput = lastHtml + "<p style='color: gray'>" + said + "</p>";
    // speechoutput.html(tempspeechoutput);
    // speechoutput.innerHTML = tempspeechoutput;
    speechoutput.innerHTML = said;
    speechoutput.style.color = "gray";
  }
};

// synthesis
const speechSynth = window.speechSynthesis;

function processSpeech(said) {
  // said contains the string that was heard
  console.log(thisState, said)
  if (story[thisState].type == "question") {
    console.log("to "+thisState+": "+said);
    stopListening();
    setTimeout(advanceInterface, 5000);
    // advanceInterface();
    return;
  } else {
    for(idx in story[thisState].next) {
      // loop over next possibilities for this storypoint
      let nextidx = story[thisState].next[idx];
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
  sayAndListen(story[thisState].text);
}

// NO LONGER NEEDED saturday april 22
// function doStart() {
//   console.log("starting");
//   bNewStep = true;
//   sayAndListen(story[thisState].text);
// }

function doMicTest() {
  console.log("doing mic test");
  
  bNewStep = true;
  thisState = "mictest";
  
  // sayAndListen(story[thisState].text);
  doListen();
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
    speechoutput.html("(speak now)");
    speechoutput.style("color", "gray");

    // speechRec.addEventListener('end', speechRec.start(false, true));
    // speechRec.start(false, true);
    // speechRec.addEventListener('end', () => speechRec.start(false, true)); 
    speechRec.addEventListener('end', () => stopListening()); 
    speechRec.start(false, true);
  };
  
  speechSynth.speak(utterThis);
}

function doListen() {
  console.log("... now listening ...");
  // toggleRecButton();

  recbtn.style('background-color', 'red');
  speechoutput.html("(speak now)");
  speechoutput.style("color", "gray");

  // speechRec.addEventListener('end', speechRec.start(false, true));
  // speechRec.start(false, true);
  // speechRec.addEventListener('end', () => speechRec.start(false, true)); 
  speechRec.addEventListener('end', () => stopListening()); 
  speechRec.start(false, true);
}
// function sayAndStartRadio(thistext) {
//   const utterThis = new SpeechSynthesisUtterance(thistext);
//   utterThis.onend = (event) => {
//     console.log(
//       `Utterance has finished being spoken after ${event.elapsedTime} seconds.`
//     );
//     // recbtn.style('background-color', 'red');
//     // speechRec.start(false, true);
//     changeoma();  
//   };

//   stopListening();
//   advanceInterface();
//   speechSynth.speak(utterThis);
// }

function stopListening() {
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
    bListening = true;
    recbtn.style('background-color', 'red');
    speechoutput.show();
    speechRec.start(false, true);
  }
}
