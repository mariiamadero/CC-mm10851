let fastSpeed = 2.5; 
let slowSpeed = 0.2;     
let easing = 0.08;      
let lineWeight = 1.8;    
let ticksPerSecond = 60; 
let maxTicksPerFrame = 2000; 

let dayBg = [245, 235, 224]; 
let nightBg = [20, 18, 28];  
let dayStartHour = 7;
let nightStartHour = 19;

// night palettes 
let nightPalettes = [
  // white indigo periwinkle yellow oranges
  ["#ffffff", "#3d348b", "#7678ed", "#f7b801", "#f18701", "#f35b04"],
  //white pink orange yellow violet sky blue
  ["#ffffff", "#ff5d8f", "#ff9e00", "#ffd60a", "#c77dff", "#4cc9f0"],
  // white mint teals blues purple
  ["#ffffff", "#80ffdb", "#64dfdf", "#48bfe3", "#5390d9", "#9d4edd"],
  // candy pastel
  ["#ffffff", "#ffc8dd", "#bde0fe", "#a2d2ff", "#cdb4db", "#b9fbc0", "#fff1a8"],
  // emberish
  ["#ffffff", "#ffd166", "#ff9f1c", "#ff5a36", "#e63946", "#ff8fab"],
  // white teal lime yellow coral blue
  ["#ffffff", "#2ec4b6", "#9be564", "#ffe66d", "#ff6b6b", "#4895ef"],
];

// day palettes
let dayPalettes = [
  // indigo periwinkle yellow oranges
  ["#3d348b", "#7678ed", "#f7b801", "#f18701", "#f35b04", "#f25f5c"],
  // earhy 
  ["#6b2d1a", "#b5502e", "#d98a3d", "#7d8f4e", "#3e5c4a", "#2a4a5e"],
  // ocean blues coral 
  ["#03045e", "#0077b6", "#00a6a6", "#48b89f", "#e07a5f", "#a4133c"],
  // berryish col 
  ["#4a0d2e", "#8c1c5a", "#c9376e", "#e8707a", "#f2a65a", "#5b3a8c"],
  // forest typ dark 
  ["#1b3a2a", "#2d6a4f", "#52b788", "#8a9a2b", "#d4a017", "#7b4b2a"],
  // red orange gold teal navy purple
  ["#d62828", "#f77f00", "#e6a700", "#2a9d8f", "#1d4e89", "#6a2c91"],
];

let palettes;  
let bgColor; 

let colors;  
let penX, penY;         
let angle = 0;           
let turn = 0; // pen is turning each tick
let speed = 0.2;
let lineColor; 

let currentSeed = -1; // hour being drawing 
let ticksDone = 0; 

function setup() {
  createCanvas(windowWidth, windowHeight); 
  background();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  startHour(currentSeed);  
}

function draw() {
  let h = hour();
  let m = minute();
  let s = second();

  let now = new Date();
  let ms = now.getMilliseconds();  
  let seed = now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + h;

  // new hr clean canvas 
  if (seed !== currentSeed) {
    startHour(seed);
  }
  let ticksNow = (m * 60 + s) * ticksPerSecond + floor(ms / 1000 * ticksPerSecond);

  let doneThisFrame = 0;
  while (ticksDone < ticksNow && doneThisFrame < maxTicksPerFrame) {
    doTick(ticksDone);
    ticksDone = ticksDone + 1;
    doneThisFrame = doneThisFrame + 1;
  }
}

// set everything back to the start of hour
function startHour(seed) {
  currentSeed = seed;
  randomSeed(seed);  

  // day or night decides both the palette set and  bg
  let h = hour();
  let isNight = h >= nightStartHour || h < dayStartHour;

  if (isNight) {
    palettes = nightPalettes;
    bgColor = nightBg;
  } else {
    palettes = dayPalettes;
    bgColor = dayBg;
  }

  let pick = floor(random(palettes.length)); 
  colors = palettes[pick];
  background(bgColor[0], bgColor[1], bgColor[2]);
  penX = width / 2;
  penY = height / 2;
  angle = 0;
  turn = 0;
  speed = slowSpeed;
  lineColor = color(colors[0]);
  ticksDone = 0;
}

// t = how many ticks since top hour
function doTick(t) {
  let ticksPerMinute = ticksPerSecond * 60;

  // new min new spot new col 
  if (t % ticksPerMinute === 0) {
    let minuteNumber = t / ticksPerMinute;
    penX = random(100, width - 100);
    penY = random(100, height - 100);
    angle = random(TWO_PI);    
    lineColor = color(colors[minuteNumber % colors.length]); // % wraps around the list
  }

  // new sec alter speed change flow 
  if (t % ticksPerSecond === 0) {
    speed = fastSpeed;
  }

  // lerp = move a little of the way from the first # toward the second
  // each tick the speed moves a bit of the way toward slowspeed so it eases down smooth
  speed = lerp(speed, slowSpeed, easing);

  drawStep();
}

// one tiny piece of the squiggle
function drawStep() {
  turn = turn + random(-0.01, 0.01);
  turn = constrain(turn, -0.06, 0.06); 
  // turn pen + shake so it looks drawn
  angle = angle + turn + random(-0.02, 0.02);

  // where the pen will be next 
  let newX = penX + cos(angle) * speed;
  let newY = penY + sin(angle) * speed;

  // old to new spot
  stroke(lineColor);
  strokeWeight(lineWeight);
  line(penX, penY, newX, newY);

  penX = newX;
  penY = newY;
}