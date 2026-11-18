let maxStep = 10; // notes up + down from middle
let strip = 140; // height of the clip area at the bottom
let cardW = 160; // width of a clip card
let step = 24; // pixels between notes 
let cMajor = [0, 2, 4, 5, 7, 9, 11]; // C major
let noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

let white = [0, 0, 100];
let lightGrey = [0, 0, 65];
let mediumGrey = [0, 0, 50];
let darkGrey = [0, 0, 12];
let nearBlack = [0, 0, 8];
let brightGreen = [120, 80, 100];
let brightBlue = [210, 80, 100];
let brightRed = [0, 90, 100];
let yellow = [50, 90, 100];

let staffLine = lightGrey; // the five staff lines
let cameraBorder = mediumGrey; // box around the camera picture
let stripBg = darkGrey; // clip area at the bottom

let whiteDim = [0, 0, 100, 40]; // faded note name
let ringDim = [0, 0, 100, 30]; // faint ring around your pointer
let ringBright = [0, 0, 100, 80]; // strong ring while a note plays
let cameraTint = [0, 0, 100, 60]; // slightly see-through camera picture
let buttonBox = [0, 0, 100, 16]; // button box
let buttonHover = [0, 0, 100, 32]; // button box when the mouse is over it
let bgColor = [0, 0, 8, 35]; // near-black, 35 leaves the motion trails

// decay 0 = note holds, parts = layers of pitch multiplier, loudness, detuner
let instruments = [
  {
    name: 'pad',
    type: 'sawtooth',
    volume: 0.2,
    attack: 0.25,
    decay: 0,
    sustain: 1,
    bright: 3,
    parts: [[1, 1, -10], [1, 1, 0], [1, 1, 10]]
  },
  {
    name: 'synth',
    type: 'sawtooth',
    volume: 0.3,
    attack: 0.02,
    decay: 0.35,
    sustain: 0.7,
    bright: 4,
    parts: [[1, 1, -7], [1, 1, 7]]
  }
];

// note played atm
let liveNote = null;
let liveStep = -999;
let liveInst = 0;
let lastX = 0;

// clip being recorded
let recording = false;
let recStart = 0;
let current = [];

let clips = [];
let trails = [];

// button clicks: mousePressed sets clicked, button() checks it during draw()
let clicked = false;
let clickHandled = false; // true if a button used the click

let video;
let hands = [];
let useMouse = true;
let handWasVisible = false;
let pinched = false;
let pointerHand = null;
let pinchHand = null;

// smoothed fingertip position
let fx = 0;
let fy = 0;

let audioCtx;

function setup() {
  createCanvas(windowWidth, windowHeight);
  step = constrain(floor(((height - strip) / 2 - 40) / maxStep), 12, 28);
  colorMode(HSB, 360, 100, 100, 100);
  textFont('monospace');
  noStroke();
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  // hand model loads in the bg
  Promise.resolve(ml5.handPose({ maxHands: 2 })).then(function (model) {
    model.detectStart(video, gotHands);
    useMouse = false;
  });
}

function gotHands(results) {
  hands = results;
}

function centerY() {
  return (height - strip) / 2;
}

// browsers keep sound off until you click or press a key
function wakeAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state !== 'running') {
    audioCtx.resume();
  }
}

function playNote(midi, vol, instIndex) {
  if (!audioCtx || audioCtx.state !== 'running') {
    return { off: function () {} };
  }
  let freq = 440 * pow(2, (midi - 69) / 12); // note number -> pitch in Hz
  let inst = instruments[instIndex];
  let t = audioCtx.currentTime;
  let peak = vol * inst.volume;

  let release = audioCtx.createGain(); // used to end the note
  release.connect(audioCtx.destination);

  let env = audioCtx.createGain(); // how the volume changes over time
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(peak, t + inst.attack);
  if (inst.decay > 0) {
    env.gain.setTargetAtTime(peak * inst.sustain, t + inst.attack, inst.decay);
  }
  env.connect(release);

  let filter = audioCtx.createBiquadFilter(); // darker or brighter sound
  filter.type = 'lowpass';
  filter.frequency.value = constrain(freq * inst.bright, 300, 12000);
  filter.connect(env);

  let oscs = [];
  for (let part of inst.parts) {
    let osc = audioCtx.createOscillator();
    osc.type = inst.type;
    osc.frequency.value = freq * part[0];
    osc.detune.value = part[2];
    let g = audioCtx.createGain();
    g.gain.value = part[1];
    osc.connect(g);
    g.connect(filter);
    osc.start(t);
    osc.stop(t + 60);
    oscs.push(osc);
  }

  return {
    off: function (fade) {
      let now = audioCtx.currentTime;
      release.gain.setTargetAtTime(0, now, fade / 3 + 0.001);
      for (let osc of oscs) {
        osc.stop(now + fade + 0.3);
      }
    }
  };
}

function getPointer() {
  if (useMouse) {
    let overStaff = mouseY < height - strip;
    return { x: mouseX, step: stepFromY(mouseY), on: overStaff, gate: overStaff };
  }

  if (hands.length === 0) {
    handWasVisible = false;
    pointerHand = null;
    pinchHand = null;
    pinched = false;
    return { x: 0, step: 0, on: false, gate: false };
  }

  // the camera is mirrored.. hand with smaller cam x is on the right
  pointerHand = hands[0];
  pinchHand = null;
  if (hands.length > 1) {
    if (hands[1].keypoints[0].x < hands[0].keypoints[0].x) {
      pointerHand = hands[1];
      pinchHand = hands[0];
    } else {
      pinchHand = hands[1];
    }
  }

  // pointing hand
  let tip = pointerHand.keypoints[8];
  let tx = width - (tip.x / video.width) * width;
  let ty = (tip.y / video.height) * height;
  if (!handWasVisible) {
    fx = tx;
    fy = ty;
  }
  fx = lerp(fx, tx, 0.5); // smoothing
  fy = lerp(fy, ty, 0.5);
  handWasVisible = true;

  if (pinchHand) {
    let k = pinchHand.keypoints;
    let handSize = dist(k[0].x, k[0].y, k[9].x, k[9].y) + 0.0001;
    let ratio = dist(k[4].x, k[4].y, k[8].x, k[8].y) / handSize;
    if (ratio < 0.35) {
      pinched = true;
    } else if (ratio > 0.6) { // two limits so it doesn't flicker
      pinched = false;
    }
  } else {
    pinched = false;
  }
  return { x: fx, step: stepFromY(fy), on: true, gate: pinched };
}

function draw() {
  background(bgColor); // motion trails
  drawStaff();

  let p = getPointer();
  if (p.on) {
    lastX = p.x;
  }
  handleLive(p);
  for (let c of clips) {
    updateClip(c);
  }
  drawTrails();
  drawStrip();
  drawCameraPreview();

  if (p.on) {
    let textColor = whiteDim;
    let ringColor = ringDim;
    if (p.gate) {
      textColor = white;
      ringColor = ringBright;
    }
    fill(textColor);
    textSize(14);
    textAlign(LEFT, CENTER);
    text(noteName(midiFromStep(p.step)), p.x + 20, yFromStep(p.step));
    noFill();
    stroke(ringColor);
    strokeWeight(2);
    ellipse(p.x, yFromStep(p.step), 24);
    noStroke();
  }
  drawHud();

  // a click that no button used, above the clip area, starts recording
  if (clicked && !clickHandled && mouseY < height - strip && !recording) {
    recording = true;
    recStart = millis();
    current = [];
    if (liveNote !== null) {
      current.push({ t: 0, type: 'on', step: liveStep, x: lastX });
    }
  }
  clicked = false;
  clickHandled = false;
}

function handleLive(p) {
  if (p.gate) {
    if (liveNote === null || p.step !== liveStep) {
      if (liveNote !== null) {
        liveNote.off(0.25); // old note fades out
      }
      liveNote = playNote(midiFromStep(p.step), 0.22, liveInst);
      liveStep = p.step;
      burst(p.x, yFromStep(p.step), 0, 0);
      if (recording) {
        current.push({ t: millis() - recStart, type: 'on', step: p.step, x: p.x });
      }
    }
    addTrail(p.x, yFromStep(p.step), 0, 0);
  } else if (liveNote !== null) {
    liveNote.off(0.1); // fingers opened = note ends
    liveNote = null;
    liveStep = -999;
    if (recording) {
      current.push({ t: millis() - recStart, type: 'off' });
    }
  }
}

function updateClip(c) {
  if (!c.playing) {
    return;
  }
  let now = ((millis() - c.start) * c.speed) % c.duration; // where we are in clip
  let looped = now < c.lastT; // went back to start since last frame
  for (let e of c.events) {
    let fire = e.t > c.lastT && e.t <= now;
    if (looped) {
      fire = e.t > c.lastT || e.t <= now;
    }
    if (fire) {
      fireEvent(c, e);
    }
  }
  c.lastT = now;
  if (c.dot !== null) {
    addTrail(c.dot.x, yFromStep(c.dot.step), c.hue, 80);
  }
}

// plays one recorded event
function fireEvent(c, e) {
  if (e.type === 'on') {
    if (c.note !== null) {
      c.note.off(0.25);
    }
    let s = e.step + c.shift; // the sound can go past the staff...
    let shown = constrain(s, -maxStep, maxStep); // ...but dot stays on screen
    c.note = playNote(midiFromStep(s), 0.18, c.inst);
    c.dot = { x: e.x, step: shown };
    burst(e.x, yFromStep(shown), c.hue, 80);
  } else {
    stopClipSound(c);
  }
}

function stopClipSound(c) {
  if (c.note !== null) {
    c.note.off(0.1);
  }
  c.note = null;
  c.dot = null;
}

function saveClip() {
  recording = false;
  let duration = millis() - recStart;
  if (liveNote !== null) {
    current.push({ t: duration, type: 'off' }); // end a held note
  }
  if (current.length < 2 || duration < 300) {
    return; // nothing played
  }
  clips.push({
    events: current,
    duration: duration,
    note: null,
    dot: null,
    lastT: -1,
    hue: (clips.length * 67 + 180) % 360,
    playing: true,
    start: millis(),
    speed: 1,
    shift: 0,
    inst: liveInst
  });
}

function toggleClip(i) {
  let c = clips[i];
  if (c.playing) {
    c.playing = false;
    stopClipSound(c);
  } else {
    c.playing = true;
    c.start = millis();
    c.lastT = -1;
  }
}

function deleteClip(i) {
  stopClipSound(clips[i]);
  clips.splice(i, 1);
}

function changePitch(c, amount) {
  c.shift = constrain(c.shift + amount, -14, 14);
}

// change speed without the clip jumping to a different spot
function setSpeed(c, newSpeed) {
  newSpeed = constrain(newSpeed, 0.25, 4);
  let pos = ((millis() - c.start) * c.speed) % c.duration;
  c.speed = newSpeed;
  c.start = millis() - pos / newSpeed;
}

function nextInstrument(i) {
  return (i + 1) % instruments.length;
}

function stepFromY(y) {
  return constrain(round((centerY() - y) / step), -maxStep, maxStep);
}

function yFromStep(s) {
  return centerY() - s * step;
}

function midiFromStep(s) {
  let d = 34 + s; // which note of the scale, counting from the lowest C
  return 12 * (floor(d / 7) + 1) + cMajor[d % 7];
}

function noteName(m) {
  return noteNames[m % 12] + (floor(m / 12) - 1);
}

function drawStaff() {
  stroke(staffLine); // five staff lines
  strokeWeight(2);
  for (let i = -2; i <= 2; i++) {
    line(40, centerY() + i * step * 2, width - 40, centerY() + i * step * 2);
  }
  noStroke();
}

function addTrail(x, y, h, sat) {
  trails.push({ x: x, y: y, h: h, s: sat, life: 100 });
  if (trails.length > 600) {
    trails.splice(0, 1); // remove the oldest dot
  }
}

// a little pop of dots when a note starts
function burst(x, y, h, sat) {
  for (let i = 0; i < 5; i++) {
    addTrail(x + random(-14, 14), y + random(-14, 14), h, sat);
  }
}

function drawTrails() {
  for (let i = trails.length - 1; i >= 0; i--) {
    let p = trails[i];
    fill(p.h, p.s, 100, p.life * 0.6);
    ellipse(p.x, p.y, 8 + (p.x / width) * 30 * (p.life / 100)); // right side = bigger
    p.life = p.life - 3;
    if (p.life <= 0) {
      trails.splice(i, 1);
    }
  }
}

// small mirrored camera picture in the top-right corner
function drawCameraPreview() {
  push();
  translate(width - 20, 20);
  scale(-1, 1);
  tint(cameraTint);
  image(video, 0, 0, 200, 150);
  pop();
  noTint();

  noFill();
  stroke(cameraBorder);
  strokeWeight(1);
  rect(width - 220, 20, 200, 150);
  noStroke();
}

// draws a button, and gives back true if it was just clicked
// boxed = draw a box around it (false = just the text)
function button(label, x, y, w, boxed) {
  let hover = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + 22;
  if (boxed) {
    if (hover) {
      fill(buttonHover);
    } else {
      fill(buttonBox);
    }
    rect(x, y, w, 22, 6);
  }
  fill(white);
  textSize(12);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + 11);

  if (hover && clicked) {
    clickHandled = true;
    return true;
  }
  return false;
}

function drawStrip() {
  fill(stripBg);
  rect(0, height - strip, width, strip);
  for (let i = 0; i < clips.length; i++) {
    let c = clips[i];
    let x = 20 + i * (cardW + 10);
    let y = height - strip + 10;

    if (c.playing) { // darker when paused
      fill(c.hue, 60, 55);
    } else {
      fill(c.hue, 60, 22);
    }
    rect(x, y, cardW, strip - 20, 10);

    let title = (i + 1) + '  ■ paused';
    if (c.playing) {
      title = (i + 1) + '  ▶ playing';
    }

    let pitchText = 'pitch ' + c.shift;
    if (c.shift >= 0) {
      pitchText = 'pitch +' + c.shift;
    }

    if (button(title, x, y + 4, cardW - 30, false)) {
      toggleClip(i);
    }
    if (button('×', x + cardW - 28, y + 4, 22, true)) {
      deleteClip(i);
      break; // stop here, the list of clips just changed
    }
    if (button('♪ ' + instruments[c.inst].name, x + 6, y + 29, cardW - 12, true)) {
      c.inst = nextInstrument(c.inst);
    }

    if (button('−', x + 6, y + 54, 26, true)) {
      changePitch(c, -1);
    }
    button(pitchText, x + 36, y + 54, cardW - 72, false);
    if (button('+', x + cardW - 32, y + 54, 26, true)) {
      changePitch(c, 1);
    }

    if (button('−', x + 6, y + 79, 26, true)) {
      setSpeed(c, c.speed / 1.25);
    }
    button('speed x' + c.speed.toFixed(2), x + 36, y + 79, cardW - 72, false);
    if (button('+', x + cardW - 32, y + 79, 26, true)) {
      setSpeed(c, c.speed * 1.25);
    }
  }
}

function drawHud() {
  fill(white);
  textSize(13);
  textAlign(LEFT, TOP);
  if (recording) {
    fill(brightRed);
    ellipse(30, 30, 16);
    fill(white);
    text('REC ' + ((millis() - recStart) / 1000).toFixed(1) + 's   (SPACE to save)', 48, 22);
  } else {
    text('CLICK record   SPACE save   I live sound   M hand/mouse   / reset', 20, 20);
  }

  let mode = 'HAND - pinch with your other hand to play a note';
  if (useMouse) {
    mode = 'MOUSE (press M for hand)';
  } else if (hands.length === 0) {
    mode = 'HAND - show your hand to the camera';
  } else if (pinchHand === null) {
    mode = 'HAND - pointing hand tracked (show your other hand to pinch)';
  } else if (pinched) {
    mode = 'HAND - PINCHED (playing)';
  }
  text('control: ' + mode, 20, 42);

  if (button('♪ live sound: ' + instruments[liveInst].name + '  (I)', 20, 60, 230, true)) {
    liveInst = nextInstrument(liveInst);
  }

  textAlign(LEFT, TOP);
  fill(yellow);
  if (!audioCtx || audioCtx.state !== 'running') {
    text('click once (or press any key) to turn the sound on', 20, 92);
  }
}

function mousePressed() {
  wakeAudio();
  clicked = true; // button() and draw() react to this
  return false;
}

function keyPressed() {
  wakeAudio();
  if (key === ' ') {
    if (recording) {
      saveClip();
    }
  } else if (key === 'm' || key === 'M') {
    useMouse = !useMouse;
  } else if (key === 'i' || key === 'I') {
    liveInst = nextInstrument(liveInst);
  } else if (key === '/') { // reset everything
    for (let c of clips) {
      stopClipSound(c);
    }
    clips = [];
    recording = false;
    current = [];
    trails = [];
  }
  return false;
}