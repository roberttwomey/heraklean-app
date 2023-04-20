// NOTE: this app has migrated to: 
// https://github.com/roberttwomey/heraklean-app

// weather radio from here: https://editor.p5js.org/robert.twomey/sketches/edH7FDhyw

/*
 stream a EWR radio station NOAA
 LNK https://wxradio.org/NE-Lincoln-WXM20-alt1
 https://radio.weatherusa.net/NWR/WXM20.mp3
 LAX https://radio.weatherusa.net/NWR/KWO37.mp3
 
 */
 let song;
 let lnkaudio, laxaudio, omaaudio;
 let lnkbutton, laxbutton, omabutton;
 let audioCtx;
 let audioIn;
 let bIsPlaying = false;
 let cnv;

 function setupRadio() {
  cnv = createCanvas(200, 110);
  cnv.parent("contents");
  cnv.style("margin", "0 auto")
  background(255, 0, 0);
  textAlign(CENTER);
  cnv.hide();

   // grab p5.sound audio context
   audioCtx = getAudioContext();
   
   lnkaudio = createAndConnect("https://wxradio.org/NE-Lincoln-WXM20-alt1");
   omaaudio = createAndConnect("https://wxradio.org/NE-Omaha-KIH61");
   laxaudio = createAndConnect("https://wxradio.org/CA-LosAngeles-KWO37");
   mmaudio = createAndConnect("https://wxradio.org/CA-MontereyMarine-WWF64")
   
   lnkbutton = createButton('WXM20 - LNK');
   lnkbutton.parent("contents");
   lnkbutton.style("top", "40px");
   lnkbutton.style("margin", "0 auto");
   // lnkbutton.position(0, 200);
   
   omabutton = createButton('KIH61 - OMA');
   omabutton.parent("contents");
   omabutton.style("top", "60px");
   omabutton.style("margin", "0 auto");
   // omabutton.position(0, 225);
   
   laxbutton = createButton('KWO37 - LAX');
   laxbutton.parent("contents");
   laxbutton.style("top", "80px");
   laxbutton.style("margin", "0 auto");
   // laxbutton.position(0, 250);
   
   mmbutton = createButton("WWF64 - MMAR");
   mmbutton.parent("contents");
   mmbutton.style("top", "100px");
   mmbutton.style("margin", "0 auto");
   // mmbutton.position(0, 275);
   
   lnkbutton.mousePressed(changelnk);
   omabutton.mousePressed(changeoma);
   laxbutton.mousePressed(changelax);
   mmbutton.mousePressed(changemm);

   hideRadio();
 }

 function hideRadio() {
  cnv.hide();
  lnkbutton.hide();
  omabutton.hide();
  laxbutton.hide();
  mmbutton.hide();
 }

 function showRadio() {
  cnv.show();
  lnkbutton.show();
  omabutton.show();
  laxbutton.show();
  mmbutton.show();
 }

 function createAndConnect(thisurl) {
   
   // create and load audio element from URL
   let thisaudio = new Audio();
   thisaudio.src = thisurl;
   thisaudio.crossOrigin = "anonymous";
   thisaudio.load();
   
   // connect to sound out
   let thissource = audioCtx.createMediaElementSource(thisaudio);
   thissource.connect(p5.soundOut);
   
   return thisaudio;
 }
 
 function draw() {
   background(255, 0, 0);
   if (lnkaudio.paused && laxaudio.paused && omaaudio.paused && mmaudio.paused) {
     background(128);
     text('click below to start audio', width/2, height/2);
   } else {
     background(0, 255, 0);
     text('audio is enabled', width/2, height/2);
   }
 }
 
 function changelnk() {
   if (!bIsPlaying) {
     audioCtx.resume();
     if (lnkaudio.paused) {
       lnkaudio.play();
       lnkbutton.style('background-color', 'lightgreen');
     }
     bIsPlaying = true;
   } else {
     lnkaudio.pause(); 
     lnkbutton.style('background-color', '#f0f0f0');
     bIsPlaying = false;
   }
 }
 
 function changeoma() {
   if (!bIsPlaying) {
     audioCtx.resume();
     if (omaaudio.paused) {
       omaaudio.play();
       omabutton.style('background-color', 'lightgreen');
     }
     bIsPlaying = true;
   } else {
     omaaudio.pause(); 
     omabutton.style('background-color', '#f0f0f0');
     bIsPlaying = false;
   }
 }
 
 function changelax() {
   if (!bIsPlaying) {
     audioCtx.resume();
     if (laxaudio.paused) {
       laxaudio.play();
       laxbutton.style('background-color', 'lightgreen');
     }
     bIsPlaying = true;
   } else {
     laxaudio.pause(); 
     laxbutton.style('background-color', '#f0f0f0');
     bIsPlaying = false;
   }
 }
 
 function changemm() {
   if (!bIsPlaying) {
     audioCtx.resume();
     if (mmaudio.paused) {
       mmaudio.play();
       mmbutton.style('background-color', 'lightgreen');
     }
     bIsPlaying = true;
   } else {
     mmaudio.pause(); 
     mmbutton.style('background-color', '#f0f0f0');
     bIsPlaying = false;
   }
 }
 