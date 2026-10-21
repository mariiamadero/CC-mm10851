let mySeed = 123;
let layers = [0];     // one entry per click, each holds a rotation angle
let currentAngle = 0;
let segments = 6;    

// the two main squares, positioned relative to the canvas center
let shapes = [
  { x: 70, y: 0,  d: 120, hue: 125, dir: 1 },
  { x: 90, y: 25, d: 110, hue: 215, dir: -1 }
];

function setup() {
  createCanvas(576, 384);
  colorMode(HSB);
  angleMode(DEGREES);
  noiseSeed(123);
  noLoop(); 
}

function bigSq(s, angle) {
  let noiseVal = noise(s.x * 0.008, s.y * 0.008, 0);
  let eDiam = s.d * map(noiseVal, 0, 1, 0.8, 1.2);

  push();
  translate(s.x, s.y);
  rotate(angle * s.dir);
  rectMode(CENTER);
  noFill();
  rect(0, 0, eDiam, eDiam);
  pop();
}

function drawScene() {
  randomSeed(mySeed);
  background(0, 0, 100);

  push();
  translate(width / 2, height / 2);

  for (let k = 0; k < segments; k++) {
    push();
    rotate(k * (360 / segments));

    for (let a of layers) {
      // normal copy
      for (let s of shapes) bigSq(s, a);

      // mirrored copy -> the kaleidoscope reflection
      push();
      scale(1, -.5);
      for (let s of shapes) bigSq(s, a);
      pop();
    }
    pop();
  }
  pop();
}

function draw() {
  drawScene();
}

function mousePressed() {
  currentAngle += 15;
  layers.push(currentAngle);
  redraw();
}

function keyPressed() {
  // lowercase only
  if (key === "x") {
    // redraw the whole composition in a single recorded pass
    beginRecordSvg("myPlot_" + Math.floor(mySeed) + ".svg");
    drawScene();
    endRecordSvg();
  }

  if (key === "r") {
    layers = [0];
    currentAngle = 0;
    redraw();
  }
}