// cleaning the stables | rtwomey@unl.edu | april 25 2023
// code derived from this test sketch
// https://editor.p5js.org/robert.twomey/sketches/o0KbIjeGX

// to view full screen
// https://editor.p5js.org/robert.twomey/full/78R7AgEZp

let simulate = false;

let thismap;
let v1;

// this variable stores the current position
let myposition;
let lastgeoloc = 0;
let locinterval = 500; // 0.5 sec;

let simposition; // simulated position when clicking

// this is used for distance calculations
let closest;
let dist;

let myMap;
let canvas;
let myMapDiv;

const mappa = new Mappa("Leaflet");
// let sounds = [];
let sounds = {};

let locations = {};
// let count = 0;
// let lastHtml = "";
let locDiv;
let simulateCheck;

// for adding new points
let label = "";
let newPoint = false;

let hidePoint = true;

// leaflet map with google earth tiles
// https://stackoverflow.com/questions/9394190/leaflet-map-api-with-google-satellite-layer
// mt0, mt1, mt2, mt3

// rady shell
let options = {
  lat: 32.703993,
  lng: -117.163292,
  zoom: 20.0,
  style: 'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
}
// let mapfile = "radymap2.json";
// let mapfile = "map3.json";

// robert's house
// let options = {
//   lat: 32.782864,
//   lng: -117.151572,
//   zoom: 20.0,
//   style: "http://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
// };
// let mapfile = "housemap.json";

// function preload() {
  // loadMapFile(mapfile);
// }

// function preloadSounds() {
//   count = Object.keys(locations).length;
//   console.log(locations, count);

//   for (let p in locations) {
//     if (locations[p].sounds != undefined) {
//       let thesesounds = [];
//       for (s in locations[p].sounds) {
//         let thissound = locations[p].sounds[s];
//         console.log(thissound);
//         thesesounds.push(loadSound(thissound));
//       }
//       sounds[p] = thesesounds;
//     }
//   }
//   console.log(sounds);
// }

function setupMap() {
  canvas = createCanvas(500, 1000);
  // canvas = createCanvas(380, 700);
  // canvas = createCanvas(800, 800);
  // canvas = createCanvas(400, 600);
  // canvas = createCanvas(300, 450);
  canvas.parent("mapdiv");
  // canvas.hide();

  // to store position
  v1 = createVector(width / 2, height / 2);

  // Create a tile map with the options declared
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas, hideBadge);

  // DOM element to display locations list
  // locDiv = select("#locations");
  getLocation();

  inputDiv= select("#simulate");
  simulateCheck = createCheckbox('simulate', false);
  simulateCheck.changed(toggleSimulate);
  inputDiv.child(simulateCheck);

  textSize(18);
  
  updatePosition();

  hideMap();
}

function hideMap() {
  myMapDiv = select("#mapdiv");
  myMapDiv.hide();
}

function showMap() {
  myMapDiv = select("#mapdiv");
  myMapDiv.show();
}

function draw() {
  background(220);

  clear();
  const radyshell = myMap.latLngToPixel(32.79, -117.16);
  // Using that position, draw an ellipse
  fill(255, 255, 0);
  ellipse(radyshell.x, radyshell.y, 5, 5);

  noStroke();
  if (hidePoint == false) {
    fill(255, 194, 0);
    circle(v1.x, v1.y, 10);

    if (myposition != undefined) {
      const thispxloc = myMap.latLngToPixel(
        myposition.coords.latitude,
        myposition.coords.longitude
      );
      fill(255, 255, 0);
      circle(thispxloc.x, thispxloc.y, 10);
    }
  }
  fill(255, 255, 0);
  circle(mouseX, mouseY, 15);

  if (myposition != undefined && simposition != undefined) {
    fill(255, 255, 0);
    text(
      "geolocation: " +
        myposition.coords.latitude +
        " " +
        myposition.coords.longitude,
      50,
      30
    );
    text("clicked: " + round(simposition.lat, 6) + " " + round(simposition.lng, 6), 50, 50);
    text("distance: "+round(dist, 2), 50, 70)
  }

  for (let p in locations) {
    const thispxloc = myMap.latLngToPixel(locations[p].lat, locations[p].lng);
    if (p == closest) {
      fill(255, 194, 0);
      circle(thispxloc.x, thispxloc.y, 10);
      fill(255, 255, 0);
      text(round(dist, 2), thispxloc.x + 5, thispxloc.y - 15)
      // console.log("closest point: " + locations[closest].label + " " + dist);
    }
    fill(255, 255, 0);
    circle(thispxloc.x, thispxloc.y, 6);
    
    // text(p, thispxloc.x+5, thispxloc.y+5);
    text(p + ": " + locations[p].label, 
         thispxloc.x + 5, 
         thispxloc.y + 5);
  }
  if (millis() - lastgeoloc > locinterval) {
    getLocation();
    lastgeoloc = millis();
  }
}

function toggleSimulate() {
  simulate = simulateCheck.checked();  
}

function getLocation() {
  if (navigator.geolocation) {
    // get position and process with callback
    navigator.geolocation.getCurrentPosition(processGeoloc, showError, geooptions);
  } else {
    console.log("Geolocation is not supported by this browser.");
    exit();
  }
}

// see high accuracy here: 
// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition

const geooptions = {
  enableHighAccuracy: true,
  timeout: locinterval,
  maximumAge: 0
};

function processGeoloc(position) {
  if (position != undefined) {
    myposition = position;
    // console.log("processGeoloc() from gelocation.navigator: ", myposition);

    // if (simulate == false) {
    //   let thislatlng = {};
    //   thislatlng.lat = myposition.coords.latitude;
    //   thislatlng.lng = myposition.coords.longitude;
      
    //   let results = findClosest(thislatlng);
    //   closest = results[0];
    //   dist = results[1];
      
    //   // playClosestAndVol(closest, dist);
    // }
  }
}

// function error(err) {
//   console.warn(`ERROR(${err.code}): ${err.message}`);
// }

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      console.log("GEOLOC ERROR: User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      console.log("GEOLOC ERROR: Location information is unavailable.");
      break;
    case error.TIMEOUT:
      console.log("GEOLOC ERROR: The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      console.log("GEOLOC ERROR: An unknown error occurred.");
      break;
  }
}

function mouseClicked() {
  updatePosition();
}

function updatePosition() {
  hidePoint = false;
  getLocation();

  // screen location for simulation
  v1.x = mouseX;
  v1.y = mouseY;
  simposition = myMap.pixelToLatLng(v1.x, v1.y);
  
  if (simulate == true) {
    let results = findClosest(simposition);
    closest = results[0];
    dist = results[1];
    
    // console.log("updatePosition(): closest point is ", closest, dist, locations[closest]);
    // playClosestAndVol(closest, dist);
  }
}

function playClosestAndVol(closest, dist) {
  let maxd = 40; //soundmaxdist;  //40.0;
  let mind = 25; //soundmindist; //15.0

  // mute all sounds
  Object.keys(sounds).forEach(function (key) {
    let thesesounds = sounds[key];
    for (i in thesesounds) {
      let s = thesesounds[i];
      s.setVolume(0);
    }
  });

  // print(locations[closest]);
  if (dist < maxd) {
    for (i in sounds[closest]) {
      s = sounds[closest][i];
      if (s.isPlaying() == false) {
        s.loop();
      }
      // set amplitude
      let capdist = constrain(maxd - dist, 0, mind);
      let vol = (capdist * capdist) / (mind * mind);
      s.setVolume(vol);
    }
  } else {
    for (i in sounds[closest]) {
      s = sounds[closest][i];
      s.pause();
    }
  }
}

function findClosest(thislatlng) {
  let mindist = 5000000.0; // too large in feet
  let closestKey;

  for (let p in locations) {
    // let thisdist = dist(locations[p].lat, locations[p].lng, simposition.lat, simposition.lng);
    let thisdist = latLngDist(
      locations[p].lat,
      locations[p].lng,
      thislatlng.lat,
      thislatlng.lng
    );
    if (thisdist < mindist) {
      closestKey = p;
      mindist = thisdist;
    }
    // console.log(thislatlng, locations[p]);
  }

  return [closestKey, mindist];
}

function latLngDist(lat1, lon1, lat2, lon2) {
  // calc distance between two lat/long coords in feet
  
  lon1 = (lon1 * PI) / 180;
  lon2 = (lon2 * PI) / 180;
  lat1 = (lat1 * PI) / 180;
  lat2 = (lat2 * PI) / 180;

  // Haversine formula
  let dlon = lon2 - lon1;
  let dlat = lat2 - lat1;
  let a = pow(sin(dlat / 2), 2) + cos(lat1) * cos(lat2) * pow(sin(dlon / 2), 2);

  let c = 2 * asin(sqrt(a));

  // Radius of earth in kilometers. Use 3956
  // for miles
  let r = 3956; // 6371;

  // calculate the result
  return c * r * 5280; // in feet
}

// function loadMapFile(url) {
//   locations = loadJSON(url, preloadSounds);
// }

function hideBadge() {
  myMapDiv = select("#mapdiv");
  myMapDiv.child(myMap.map.getContainer());

  let badge = selectAll(".leaflet-control-attribution")[0];
  badge.hide();
}

function parseStoryLocations() {
  let j = 1;
  for (node in story) {
    if ("lat" in story[node]) {
      // console.log("location node: ", node);
      locations[j] = {
        "lat": story[node].lat,
        "lng": story[node].lng,
        "label": node
      }
      j = j+1;
    }
  }
}
