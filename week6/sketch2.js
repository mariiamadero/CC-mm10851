let photos = [];        // array of photo objects
let lastHour = -1;
let flashStart = -10000;
let devShown = 0;       // smoothed development of the newest photo (0 to 1)
let lastSecond = -1;
let tickStart = 0;      // when the current second began

const camX = 300, camY = 120;       // camera center
const floorTop = 300;               // where the floor starts

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(RADIANS);
}

// how bright the sky is at a given hour: 0 at midnight, 1 at noon
function daylightAt(hr) {
  return (1 - cos(TWO_PI * hr / 24)) / 2;
}

function makePhoto(hr, animate) {
  randomSeed(hr * 97 + 13);         // same hour = same spot, so it doesn't jump around
  return {
    hr: hr,
    x: random(60, width - 60),
    y: random(floorTop + 70, height - 60),
    rot: random(-0.5, 0.5),
    born: animate ? millis() : -10000,   // -10000 = already landed
  };
}

function draw() {
  let h = hour();
  let m = minute();
  let s = second();

  // --- hour changed (or first frame) ---
  if (h !== lastHour) {
    let firstFrame = lastHour === -1;
    if (firstFrame) {
      // rebuild everything that has already happened today
      // pile is 12-hour: it starts over at 12 AM and 12 PM
      photos = [];
      for (let i = h - (h % 12); i <= h; i++) photos.push(makePhoto(i, false));
      devShown = m / 60;
    } else {
      if (h % 12 === 0) photos = [];   // new half-day, clear the floor
      photos.push(makePhoto(h, true));
      flashStart = millis();
      devShown = 0;
    }
    lastHour = h;
  }

  // note the moment each new second starts (drives the red light)
  if (s !== lastSecond) {
    tickStart = millis();
    lastSecond = s;
  }

  // smooth the minute-by-minute development
  devShown = lerp(devShown, m / 60, 0.04);

  background(60, 55, 70);
  drawFloor();

  // photos on the floor, oldest first (so newest ends up on top)
  for (let i = 0; i < photos.length; i++) {
    let p = photos[i];
    let isNewest = i === photos.length - 1;
    let dev = isNewest ? devShown : 1;

    // drop animation: eased fall from the camera slot to its spot
    let t = constrain((millis() - p.born) / 900, 0, 1);
    let ease = t * t;                           // accelerates like gravity
    let px = lerp(camX, p.x, ease);
    let py = lerp(camY + 75, p.y, ease);

    drawPhoto(px, py, p.rot * ease, p.hr, dev);
  }

  drawCamera(s);
  drawFlash();
  drawLabel(h, m, s);
}

function drawFloor() {
  noStroke();
  fill(95, 80, 70);
  rect(0, floorTop, width, height - floorTop);
  // floorboards with a loop
  stroke(80, 66, 58);
  strokeWeight(2);
  for (let y = floorTop + 40; y < height; y += 40) {
    line(0, y, width, y);
  }
}

function drawCamera(s) {
  push();
  translate(camX, camY);

  // body
  noStroke();
  fill(40);
  rect(-110, -55, 220, 120, 14);
  fill(200, 200, 205);
  rect(-110, -55, 220, 30, 14, 14, 0, 0);

  // flash window
  fill(255, 250, 220);
  rect(-90, -48, 40, 16, 3);

  // viewfinder
  fill(25);
  rect(50, -48, 30, 16, 3);

  // print slot
  fill(10);
  rect(-50, 55, 100, 8, 3);

  // lens
  fill(20);
  ellipse(0, 5, 90, 90);
  fill(50, 70, 110);
  ellipse(0, 5, 62, 62);
  fill(255, 255, 255, 70);
  ellipse(-10, -5, 16, 16);

  // seconds light: blinks on at each new second, then fades out
  let since = millis() - tickStart;
  let glow = max(0, 1 - since / 500);
  noStroke();
  fill(255, 40, 40, 40 + 215 * glow);
  ellipse(85, 40, 12, 12);
  fill(255, 40, 40, 60 * glow);
  ellipse(85, 40, 26, 26);

  pop();
}

// one polaroid: dev = 0 (blank) to 1 (fully developed)
function drawPhoto(x, y, rot, hr, dev) {
  push();
  translate(x, y);
  rotate(rot);

  // frame + shadow
  noStroke();
  fill(0, 0, 0, 50);
  rect(-33, -38, 70, 84, 3);
  fill(245);
  rect(-35, -42, 70, 84, 3);

  // the picture: sky for that hour
  let day = daylightAt(hr);
  fill(lerpColor(color(20, 25, 60), color(140, 200, 250), day));
  rect(-28, -35, 56, 56);

  // sun / moon crosses the sky over the day
  let a = TWO_PI * hr / 24;
  let sx = -sin(a) * 20;
  let sy = cos(a) * 20;
  if (day > 0.4) fill(255, 220, 80);
  else fill(235, 235, 220);
  ellipse(sx, sy - 7, 12, 12);

  // ground
  fill(lerpColor(color(15, 40, 25), color(90, 160, 80), day));
  rect(-28, 11, 56, 10);

  // undeveloped film covers the picture, fades as dev rises
  fill(170, 160, 140, 255 * (1 - dev));
  rect(-28, -35, 56, 56);

  // hour written on the white border, like a handwritten note
  let ph = hr % 12;
  if (ph === 0) ph = 12;
  fill(90);
  textAlign(CENTER, CENTER);
  textSize(10);
  text(ph + (hr < 12 ? " AM" : " PM"), 0, 32);

  pop();
}

function drawFlash() {
  let t = (millis() - flashStart) / 900;
  if (t >= 0 && t < 1) {
    noStroke();
    fill(255, 255, 255, 255 * (1 - t));
    rect(0, 0, width, height);
  }
}

function drawLabel(h, m, s) {
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  let ampm = h < 12 ? "AM" : "PM";
  text(h12 + ":" + nf(m, 2) + ":" + nf(s, 2) + " " + ampm, width / 2, 20);
}