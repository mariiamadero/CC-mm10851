let infoUrl = "https://gbfs.citibikenyc.com/gbfs/en/station_information.json";
let statusUrl = "https://gbfs.citibikenyc.com/gbfs/en/station_status.json";
// union sq
let myLat = 40.7359;
let myLon = -73.9906;

// colors
let fullColor = "#3A9BEA"; // station w MOST open docks: lightest blue
let lowColor = "#0A2F60"; // station w FEWEST open docks: darkest blue
let darkColor = "#051F40"; // bg and buttons
let lightColor = "#FFFFFF"; 
let dockLightColor = "#5CFF7A"; // glowing light for OPEN dock 
let brokenLightColor = "#FF4D4D"; // glowing light OUT OF SERVICE 

let howMany = 5; // how many stations 
let nearby = []; // closest stations 
let boxes = []; // one box ps
let leftCount = 2; // how many boxes go in big left column


// particles
let stamp; 
let stampH = 240;
let stampW = 720;
let step = 8; // smaller = more particles
let spring = 0.06; // how hard particles are pulled back
let damping = 0.82; // friction
let pushRadius = 150; // how far from cursor particles get pushed
let pushStrength = 5; // how hard they get pushed

// sound
let audioCtx = null;
let scaleSteps = [0, 2, 4, 7, 9]; 
let hintH = 28; // height of instructions 

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Bitcount Single"); 
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  stamp = createGraphics(stampW, stampH);
  stamp.pixelDensity(1);

  loadJSON(infoUrl, gotInfo);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotInfo(data) {
  let stations = data.data.stations;

  for (let i = 0; i < stations.length; i++) {
    stations[i].distance = dist(stations[i].lat, stations[i].lon, myLat, myLon);
  }
  stations.sort(function (a, b) {
    return a.distance - b.distance;
  });
  nearby = stations.slice(0, howMany);

  loadStatus();
  setInterval(loadStatus, 60000);
}

function loadStatus() {
  loadJSON(statusUrl, gotStatus);
}

function gotStatus(data) {
  let statuses = data.data.stations;
  let newBoxes = [];

  for (let i = 0; i < nearby.length; i++) {
    let status = findStatus(nearby[i].station_id, statuses);
    if (status === null) {
      continue;
    }

    // feed splits into 3 - open (empty and working, green light), OfS (red light), dock w bike (no light)
    let open = status.num_docks_available;
    let disabled = status.num_docks_disabled || 0;   // || 0 in case feed leaves it out

    let box = {
      name: nearby[i].name,
      docks: open, // big #: how many docks are open
      open: open,
      disabled: disabled,
      // one block per dock, so the grid shows the station's TOTAL docks
      blocks: max(1, nearby[i].capacity, open + disabled),
      formed: false, // false = grid of blocks, true = number
      formAmount: 0, // eases from 0 to 1 so change is smooth
      x: 0, y: 0, w: 0, h: 0,
      particles: []
    };

    let old = findBox(box.name);
    if (old !== null) {
      box.formed = old.formed;
      box.formAmount = old.formAmount;
    }

    makeParticles(box, old);
    newBoxes.push(box);
  }

  // most open docks first
  newBoxes.sort(function (a, b) {
    return b.docks - a.docks;
  });
  boxes = newBoxes;

  for (let i = 0; i < boxes.length; i++) {
    if (boxes.length > 1) {
      boxes[i].shade = 1 - i / (boxes.length - 1);
    } else {
      boxes[i].shade = 1;
    }
  }
}

function findStatus(id, statuses) {
  for (let i = 0; i < statuses.length; i++) {
    if (statuses[i].station_id === id) {
      return statuses[i];
    }
  }
  return null;
}

function findBox(name) {
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].name === name) {
      return boxes[i];
    }
  }
  return null;
}

function makeParticles(box, old) {
  let spots = getNumberSpots(box.docks);
  let base = spots.length;

  for (let j = base; j < box.blocks * 3; j++) {
    spots.push(spots[j % base]);
  }
  let total = spots.length;

  for (let j = 0; j < total; j++) {
    let p = { x: random(width), y: random(height), vx: 0, vy: 0 };

    // if station existed before, start where old particle was
    if (old !== null && old.particles[j]) {
      p.x = old.particles[j].x;
      p.y = old.particles[j].y;
    }
    p.ox = spots[j].ox;
    p.oy = spots[j].oy;

    p.block = j % box.blocks;
    let stripsInBlock = ceil((total - p.block) / box.blocks);
    p.stripY = (floor(j / box.blocks) + 0.5) / stripsInBlock; // where the strip sits (0 to 1)
    p.stripH = 1 / stripsInBlock; // how tall it is (0 to 1)

    box.particles.push(p);
  }
}

// # on canv
function getNumberSpots(n) {
  stamp.background(0);
  stamp.noStroke();
  stamp.fill(255);
  stamp.textAlign(CENTER, CENTER);
  stamp.textFont("sans-serif"); // neutral font 
  stamp.textStyle(BOLD);
  stamp.textSize(stampH * 1.5);
  stamp.text(n, stampW / 2, stampH / 2);
  stamp.loadPixels();

  let spots = [];
  for (let y = 0; y < stampH; y += step) {
    for (let x = 0; x < stampW; x += step) {
      let index = 4 * (y * stampW + x); 
      if (stamp.pixels[index] > 128) { 
        spots.push({
          ox: (x - stampW / 2) / stampH,
          oy: (y - stampH / 2) / stampH
        });
      }
    }
  }
  return spots;
}

function draw() {
  background(darkColor);
  noStroke();

  if (boxes.length === 0) {
    fill(lightColor);
    textSize(24);
    text("loading...", width / 2, height / 2);
    return;
  }

  // left column's width depends on how many docks its stations have
  let leftWidth = width * sumWeights(0, leftCount) / sumWeights(0, boxes.length);
  drawColumn(0, leftCount, 0, leftWidth);
  drawColumn(leftCount, boxes.length, leftWidth, width - leftWidth);

  drawControls();
}

// station with the most open docks get biggest box 
function getWeight(box) {
  return max(1, box.docks);
}

function sumWeights(first, last) {
  let total = 0;
  for (let i = first; i < last; i++) {
    total = total + getWeight(boxes[i]);
  }
  return total;
}

function drawColumn(first, last, x, columnWidth) {
  let columnWeight = sumWeights(first, last);
  let y = 0;

  for (let i = first; i < last; i++) {
    // more docks = a taller box
    let boxHeight = height * getWeight(boxes[i]) / columnWeight;
    drawBox(boxes[i], x, y, columnWidth, boxHeight);
    y = y + boxHeight;
  }
}

function drawBox(box, x, y, boxWidth, boxHeight) {
  box.x = x;
  box.y = y;
  box.w = boxWidth;
  box.h = boxHeight;

  let boxColor = lerpColor(color(lowColor), color(fullColor), box.shade);

  let particleColor = lerpColor(boxColor, color(darkColor), 0.3);

  let faintColor = lerpColor(boxColor, particleColor, 0.35);
  let occupiedColor = lerpColor(faintColor, particleColor, box.formAmount);

  fill(boxColor);
  rect(x, y, boxWidth, boxHeight);

  updateParticles(box);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(x, y, boxWidth, boxHeight);
  drawingContext.clip();

  // order
  let greenCount = box.open;
  let litDocks = box.open + box.disabled;

  // prticles
  let numberSize = boxHeight * step / stampH * 0.85;
  for (let i = 0; i < box.particles.length; i++) {
    let p = box.particles[i];

    if (p.block < litDocks) {
      fill(particleColor);
    } else {
      fill(occupiedColor);
    }

    let w = lerp(box.blockSize + 1, numberSize, box.formAmount);
    let h = lerp(p.stripH * box.blockSize + 1, numberSize, box.formAmount);
    rect(p.x - w / 2, p.y - h / 2, w, h);
  }

  // dock lights
  let lightAlpha = 1 - box.formAmount;
  if (lightAlpha > 0.02) {
    let greenGlow = color(dockLightColor);
    let redGlow = color(brokenLightColor);
    let lightSize = box.blockSize * 0.2;

    for (let b = 0; b < litDocks && b < box.particles.length; b++) {
      let p = box.particles[b];
      let lightY = p.y + box.blockSize * 0.15; // nudge it down so it's inside block

      let glow = greenGlow;
      if (b >= greenCount) {
        glow = redGlow;
      }

      let pulse = 0.65 + 0.35 * sin(frameCount * 0.05 + b * 1.7);

      glow.setAlpha(70 * pulse * lightAlpha);
      fill(glow);
      circle(p.x, lightY, lightSize * 2.4);

      glow.setAlpha(255 * pulse * lightAlpha);
      fill(glow);
      circle(p.x, lightY, lightSize);
    }
  }

  drawingContext.restore();
  let textBase = min(boxWidth, boxHeight);
  fill(lightColor);
  textSize(textBase * 0.08);
  text("open docks", x + boxWidth / 2, y + boxHeight * 0.88);
  textSize(textBase * 0.09);
  text(box.name, x + boxWidth * 0.1, y + boxHeight * 0.05, boxWidth * 0.8, boxHeight * 0.2);
}

// spring pulls ,  mouse pushes
function updateParticles(box) {
  let centerX = box.x + box.w / 2;
  let centerY = box.y + box.h / 2;
  let target = 0;

  if (box.formed) {
    target = 1;
  }
  box.formAmount = lerp(box.formAmount, target, 0.1);

  // block grid
  let cols = max(1, round(sqrt(box.blocks * box.w / box.h)));
  let rows = ceil(box.blocks / cols);
  let cell = min(box.w / cols, box.h / rows);
  let gridX = box.x + (box.w - cols * cell) / 2; // center grid in box
  let gridY = box.y + (box.h - rows * cell) / 2;
  box.blockSize = cell * 0.84; // the rest is the gap between blocks

  for (let i = 0; i < box.particles.length; i++) {
    let p = box.particles[i];
    let homeX;
    let homeY;

    if (box.formed) {
      homeX = centerX + p.ox * box.h;
      homeY = centerY + p.oy * box.h;
    } else {
      let col = p.block % cols;
      let row = floor(p.block / cols);

      // last row may not be full so centering
      let inThisRow = cols;
      if (row === rows - 1) {
        inThisRow = box.blocks - row * cols;
      }
      let shift = (cols - inThisRow) * cell / 2;

      let blockX = gridX + col * cell + shift + cell * 0.08;
      let blockY = gridY + row * cell + cell * 0.08;
      homeX = blockX + box.blockSize / 2;
      homeY = blockY + p.stripY * box.blockSize;
    }

    p.vx += (homeX - p.x) * spring;
    p.vy += (homeY - p.y) * spring;

    let dx = p.x - mouseX;
    let dy = p.y - mouseY;
    let d = sqrt(dx * dx + dy * dy);
    if (d < pushRadius && d > 0.1) {
      let force = (1 - d / pushRadius) * pushStrength;
      p.vx += (dx / d) * force;
      p.vy += (dy / d) * force;
    }

    // friction
    p.vx *= damping;
    p.vy *= damping;
    p.x += p.vx;
    p.y += p.vy;
  }
}

// random shove
function kickParticles(box, power) {
  for (let i = 0; i < box.particles.length; i++) {
    box.particles[i].vx += random(-power, power);
    box.particles[i].vy += random(-power, power);
  }
}

// sounds
function docksToFrequency(docks) {
  let stepNumber = floor(map(constrain(docks, 0, 60), 0, 60, 0, 14));   // 3 octaves of 5 notes
  let midi = 48 + 12 * floor(stepNumber / 5) + scaleSteps[stepNumber % 5];
  return 440 * pow(2, (midi - 69) / 12);
}

// softer note
function playNote(docks) {
  if (audioCtx === null) {
    return;
  }

  let now = audioCtx.currentTime;
  let osc = audioCtx.createOscillator();
  let gain = audioCtx.createGain();

  osc.type = "triangle";
  osc.frequency.value = docksToFrequency(docks);
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // fade out 

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 1.5);
}


function drawControls() {
  textFont("sans-serif");  
  let hint = "green = open  ·  red = out of service";
  textSize(11);
  let hintW = textWidth(hint) + 24;
  let x = width - 20 - hintW;
  let y = height - 20 - hintH;

  let overPill = mouseX > x && mouseX < x + hintW && mouseY > y && mouseY < y + hintH;

  let pillColor = color(darkColor);
  pillColor.setAlpha(overPill ? 30 : 90);
  fill(pillColor);
  rect(x, y, hintW, hintH, hintH / 2);

  let textColor = color(lightColor);
  textColor.setAlpha(overPill ? 80 : 200);
  fill(textColor);
  text(hint, x + hintW / 2, y + hintH / 2);

  textFont("Bitcount Single"); 
}

// clicking effect
function mousePressed() {
  if (audioCtx === null) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  for (let i = 0; i < boxes.length; i++) {
    let b = boxes[i];
    if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) {
      b.formed = !b.formed;
      playNote(b.docks);
      kickParticles(b, 6);
    }
  }
}

// space btn
function keyPressed() {
  if (key !== " ") {
    return;
  }

  if (audioCtx === null) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  for (let i = 0; i < boxes.length; i++) {
    // waits 120 ms ps so they don't all hit at once
    setTimeout(function () {
      playNote(boxes[i].docks);
      kickParticles(boxes[i], 18);
    }, i * 120);
  }

  return false; 
}