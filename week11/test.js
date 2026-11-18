let soundLayers = [];
let audioReady = false;

let showInterface = true;

let keySelect;
let soundButton;

let selectedKey = "C";
let degree = 1;
let quality = "major";
let octave = 1;

let notes = [];

let arpeggioOn = false;
let timeSignature = 4;
let arpeggioStep = 0;
let arpeggioEvent = null;

let bpm = 80;

let keys = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

let scale = [0, 2, 4, 5, 7, 9, 11];

let sharps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

let flats = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

let guitarChords = {
  major: {
    C: [-1, 48, 52, 55, 60, 64],
    Db: [-1, 49, 53, 56, 61, 65],
    D: [-1, -1, 50, 57, 62, 66],
    Eb: [-1, -1, 51, 58, 63, 67],
    E: [40, 47, 52, 56, 59, 64],
    F: [41, 48, 53, 57, 60, 65],
    Gb: [42, 49, 54, 58, 61, 66],
    G: [43, 47, 50, 55, 59, 67],
    Ab: [44, 51, 56, 60, 63, 68],
    A: [-1, 45, 52, 57, 61, 64],
    Bb: [-1, 46, 53, 58, 62, 65],
    B: [-1, 47, 54, 59, 63, 66],
  },

  minor: {
    C: [-1, 48, 55, 60, 63, 67],
    Db: [-1, 49, 56, 61, 64, 68],
    D: [-1, -1, 50, 57, 62, 65],
    Eb: [-1, -1, 51, 58, 63, 66],
    E: [40, 47, 52, 55, 59, 64],
    F: [41, 48, 53, 56, 60, 65],
    Gb: [42, 49, 54, 57, 61, 66],
    G: [43, 52, 57, 58, 62, 67],
    Ab: [44, 51, 56, 59, 63, 68],
    A: [-1, 45, 52, 57, 60, 64],
    Bb: [-1, 46, 53, 58, 61, 65],
    B: [-1, 47, 54, 59, 62, 66],
  },
};

let majorPalette = [5, 12, 20, 30, 39, 48, 355];
let minorPalette = [185, 199, 212, 226, 240, 254, 268];

let ringTime = 5.5;

function setup() {
  createCanvas(windowWidth, windowHeight);

  colorMode(HSB, 360, 100, 100, 100);
  pixelDensity(1);
  textFont("Arial");

  // key selection
  keySelect = createSelect();

  for (let i = 0; i < keys.length; i++) {
    let keyName = keys[i];
    keySelect.option(keyName + " Major", keyName);
  }

  keySelect.position(30, 30);
  keySelect.selected("C");
  keySelect.changed(changeKey);

  // Sound button
  soundButton = createButton("Enable Sound");
  soundButton.position(190, 30);
  soundButton.mousePressed(startSound);
}

function changeKey() {
  selectedKey = keySelect.value();
}

//---sound midi make---//

async function startSound() {
  if (audioReady === true) {
    return;
  }

  await Tone.start();

  // Compressor
  let compressor = new Tone.Compressor({
    threshold: -18,
    ratio: 2.5,
    attack: 0.01,
    release: 0.3,
  });

  compressor.toDestination();

  // Reverb
  let reverb = new Tone.Reverb({
    decay: 3.8,
    preDelay: 0.025,
    wet: 0.78,
  });

  reverb.connect(compressor);
  await reverb.ready;

  // Filter
  let filter = new Tone.Filter({
    type: "lowpass",
    frequency: 4200,
    rolloff: -12,
  });

  filter.connect(reverb);

  // main sound
  let body = new Tone.PolySynth(Tone.Synth, {
    maxPolyphony: 48,

    oscillator: {
      type: "sine",
    },

    envelope: {
      attack: 0.003,
      decay: 8.4,
      sustain: 0.03,
      release: 5,
    },
  });

  body.volume.value = -5;
  body.connect(filter);

  // metallic sound
  let metal = new Tone.PolySynth(Tone.FMSynth, {
    maxPolyphony: 48,

    harmonicity: 2.7,
    modulationIndex: 0.65,

    oscillator: {
      type: "sine",
    },

    modulation: {
      type: "sine",
    },

    envelope: {
      attack: 0.002,
      decay: 2.2,
      sustain: 0,
      release: 0.8,
    },

    modulationEnvelope: {
      attack: 0.001,
      decay: 0.5,
      sustain: 0,
      release: 0.3,
    },
  });

  metal.volume.value = -5;
  metal.connect(filter);

  // glowwing sound
  let shimmer = new Tone.PolySynth(Tone.Synth, {
    maxPolyphony: 48,

    oscillator: {
      type: "sine",
    },

    envelope: {
      attack: 0.001,
      decay: 1.2,
      sustain: 0,
      release: 0.5,
    },
  });

  shimmer.volume.value = -15;
  shimmer.connect(filter);

  soundLayers = [body, metal, shimmer];

  Tone.Transport.bpm.value = bpm;
  Tone.Transport.timeSignature = timeSignature;

  audioReady = true;
  soundButton.html("Sound On");
}

//---play the sound---//
function getRoot() {
  let keyIndex = 0;

  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === selectedKey) {
      keyIndex = i;
    }
  }

  let noteDistance = scale[degree - 1];
  let root = keyIndex + noteDistance;

  if (root >= 12) {
    root = root - 12;
  }

  return root;
}

function getChordName() {
  let root = getRoot();
  let chordName;

  if (selectedKey.includes("b") || selectedKey === "F") {
    chordName = flats[root];
  } else {
    chordName = sharps[root];
  }

  if (quality === "minor") {
    chordName = chordName + "m";
  }

  return chordName;
}

function getChordShape() {
  let root = getRoot();
  let rootName = flats[root];

  let shape;

  if (quality === "major") {
    shape = guitarChords.major[rootName];
  } else {
    shape = guitarChords.minor[rootName];
  }

  return shape;
}

function playNote(index, time) {
  if (audioReady === false) {
    return;
  }

  if (time === undefined) {
    time = Tone.now();
  }

  let shape = getChordShape();
  let midi = shape[index];

  if (midi === -1) {
    return;
  }

  midi = midi + octave * 12;

  let frequency = Tone.Frequency(midi, "midi").toFrequency();

  soundLayers[0].triggerAttackRelease(frequency, 3.5, time, 0.75);
  soundLayers[1].triggerAttackRelease(frequency, 2.3, time, 0.45);
  soundLayers[2].triggerAttackRelease(frequency * 2, 1.3, time, 0.35);

  let palette;

  if (quality === "major") {
    palette = majorPalette;
  } else {
    palette = minorPalette;
  }

  let noteHue = palette[degree - 1];

  let isMinor = false;

  if (quality === "minor") {
    isMinor = true;
  }

  Tone.Draw.schedule(function () {
    let newNote = {
      midi: midi,
      index: index,
      minor: isMinor,
      hue: noteHue,
      phase: random(TWO_PI),
      start: millis() / 1000,
    };

    notes.push(newNote);

    if (notes.length > 18) {
      notes.shift();
    }
  }, time);
}

function getBassString() {
  let shape = getChordShape();

  for (let i = 0; i < 6; i++) {
    if (shape[i] !== -1) {
      return i;
    }
  }

  return -1;
}

function arpeggioTick(time) {
  let bass = getBassString();

  if (bass === -1) {
    return;
  }

  let step = arpeggioStep % timeSignature;

  // 4/4 tempo
  if (timeSignature === 4) {
    if (step === 0) {
      playNote(bass, time);
    }

    if (step === 1) {
      playNote(3, time);
    }

    if (step === 2) {
      playNote(4, time);
    }

    if (step === 3) {
      playNote(5, time);
    }
  }

  // 3/4 tempo
  if (timeSignature === 3) {
    if (step === 0) {
      playNote(bass, time);
    }

    if (step === 1) {
      playNote(3, time);
    }

    if (step === 2) {
      playNote(4, time);
      playNote(5, time);
    }
  }

  arpeggioStep = arpeggioStep + 1;
}

//---appreggio start and stop---//
function startArpeggio() {
  if (audioReady === false) {
    return;
  }

  if (arpeggioOn === true) {
    return;
  }

  arpeggioOn = true;
  arpeggioStep = 0;

  Tone.Transport.stop();
  Tone.Transport.cancel();

  Tone.Transport.bpm.value = bpm;
  Tone.Transport.timeSignature = timeSignature;

  arpeggioEvent = Tone.Transport.scheduleRepeat(arpeggioTick, "8n");

  Tone.Transport.start();
}

function stopArpeggio() {
  arpeggioOn = false;

  Tone.Transport.stop();

  if (arpeggioEvent !== null) {
    Tone.Transport.clear(arpeggioEvent);
    arpeggioEvent = null;
  }

  arpeggioStep = 0;
}

function changeTimeSignature(newSignature) {
  timeSignature = newSignature;

  if (audioReady === true) {
    Tone.Transport.timeSignature = timeSignature;
  }

  if (arpeggioOn === true) {
    stopArpeggio();
    startArpeggio();
  }
}

//ketboard//
function keyPressed() {
  // Major chords
  if (key === "1") {
    degree = 1;
    quality = "major";
  } else if (key === "2") {
    degree = 2;
    quality = "major";
  } else if (key === "3") {
    degree = 3;
    quality = "major";
  } else if (key === "4") {
    degree = 4;
    quality = "major";
  } else if (key === "5") {
    degree = 5;
    quality = "major";
  } else if (key === "6") {
    degree = 6;
    quality = "major";
  } else if (key === "7") {
    degree = 7;
    quality = "major";
  }

  // Minor chords
  else if (key === "q" || key === "Q") {
    degree = 1;
    quality = "minor";
  } else if (key === "w" || key === "W") {
    degree = 2;
    quality = "minor";
  } else if (key === "e" || key === "E") {
    degree = 3;
    quality = "minor";
  } else if (key === "r" || key === "R") {
    degree = 4;
    quality = "minor";
  } else if (key === "t" || key === "T") {
    degree = 5;
    quality = "minor";
  } else if (key === "y" || key === "Y") {
    degree = 6;
    quality = "minor";
  } else if (key === "U" && keyIsDown(SHIFT)) {
    degree = 7;
    quality = "minor";
  }

  //strings
  else if (key === " ") {
    playNote(0);
  } else if (key === "b" || key === "B") {
    playNote(1);
  } else if (key === "h" || key === "H") {
    playNote(2);
  } else if (key === "u" || key === "U") {
    playNote(3);
  } else if (key === "i" || key === "I") {
    playNote(4);
  } else if (key === "o" || key === "O") {
    playNote(5);
  }

  // appeggio
  else if (key === "p" || key === "P") {
    if (arpeggioOn === false) {
      startArpeggio();
    } else {
      stopArpeggio();
    }
  }

  // Time signature
  else if (key === "8") {
    changeTimeSignature(4);
  } else if (key === "9") {
    changeTimeSignature(3);
  }

  //ovtace
  else if (key === "+" || key === "=") {
    octave = octave + 1;

    if (octave > 4) {
      octave = 4;
    }
  } else if (key === "-") {
    octave = octave - 1;

    if (octave < -1) {
      octave = -1;
    }
  }

  // Fullscreen
  else if (key === "f" || key === "F") {
    fullscreen(!fullscreen());
  }

  //toggle interface
  if (key === "z" || key === "Z") {
    if (showInterface === true) {
      showInterface = false;
    } else {
      showInterface = true;
    }
  }

  return false;
}

//---drawVisuals---//
function draw() {
  let time = millis() / 1000;

  if (quality === "major") {
    background(20, 25, 7);
  } else {
    background(225, 35, 7);
  }

  //kill old notes
  for (let i = notes.length - 1; i >= 0; i--) {
    let age = time - notes[i].start;

    if (age > ringTime) {
      notes.splice(i, 1);
    }
  }

  blendMode(ADD);

  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];

    let age = time - note.start;
    let energy = 1 - age / ringTime;
    energy = max(0, energy);
    energy = pow(energy, 1.7);
    let angle = -0.56 + note.index * 0.22;
    let bend = height * 0.18;

    if (note.minor === true) {
      bend = height * -0.18;
    }

    for (let j = 0; j < 4; j++) {
      let lineAngle = angle + j * 0.012;
      let linePhase = note.phase + j * 0.16;
      let lineHue = (note.hue + j * 5) % 360;

      let amplitude = 3 + energy * 24;
      let waves = 4;

      // glowwing lines
      drawThread(
        lineAngle,
        linePhase,
        waves,
        amplitude,
        bend,
        lineHue,
        energy * 12,
        12,
        time
      );

      drawThread(
        lineAngle,
        linePhase,
        waves,
        amplitude,
        bend,
        lineHue,
        energy * 60,
        3,
        time
      );
    }
  }

  blendMode(BLEND);

  if (showInterface === true) {
    drawInterface();
  }
}

// threads vibration

function drawThread(
  angle,
  phase,
  waves,
  amplitude,
  bend,
  hue,
  alpha,
  weight,
  time
) {
  push();

  translate(width / 2, height / 2);
  rotate(angle);
  stroke(hue, 60, 100, alpha);
  strokeWeight(weight);
  noFill();

  let lineLength = min(width * 1.08, height * 1.8);

  beginShape();

  // drawlines
  for (let u = 0; u <= 1; u += 0.012) {
    let fade = sin(PI * u);
    let x = (u - 0.5) * lineLength;
    let curve = sin((u - 0.5) * 3.8 + phase + time * 0.13);
    curve = curve * bend * fade;
    let vibration = sin(u * TWO_PI * waves - time * 2 + phase);

    vibration = vibration * amplitude * fade;
    let y = curve + vibration;

    vertex(x, y);
  }

  endShape();

  pop();
}

function drawInterface() {
  if (showInterface === false) {
    return;
  }

  noStroke();
  textAlign(LEFT);

  // Current chord
  fill(0, 0, 100);
  textSize(64);
  textStyle(BOLD);
  text(getChordName(), 30, 150);
  textStyle(NORMAL);

  let panelW = 230;
  let panelH = 385;
  let panelX = width - panelW - 25;
  let panelY = 25;

  fill(225, 20, 6, 85);
  rect(panelX, panelY, panelW, panelH, 12);

  let leftX = panelX + 18;
  let rightX = panelX + panelW - 18;
  let topY = panelY + 28;

  textSize(13);

  // arpeggio on/off
  textAlign(LEFT);
  fill(0, 0, 65);
  text("ARPEGGIO", leftX, topY);

  textAlign(RIGHT);

  if (arpeggioOn === true) {
    fill(120, 65, 100);
    text("ON", rightX, topY);
  } else {
    fill(0, 0, 65);
    text("OFF", rightX, topY);
  }

  // Key
  textAlign(LEFT);
  fill(0, 0, 65);
  text("KEY", leftX, topY + 30);

  textAlign(RIGHT);
  fill(0, 0, 100);
  text(selectedKey, rightX, topY + 30);

  // BPM
  textAlign(LEFT);
  fill(0, 0, 65);
  text("BPM", leftX, topY + 60);

  textAlign(RIGHT);
  fill(0, 0, 100);
  text(bpm, rightX, topY + 60);

  // time signature
  textAlign(LEFT);
  fill(0, 0, 65);
  text("TIME", leftX, topY + 90);

  textAlign(RIGHT);
  fill(0, 0, 100);
  text(timeSignature + "/4", rightX, topY + 90);

  // --------//
  stroke(0, 0, 50);
  line(leftX, topY + 110, rightX, topY + 110);
  noStroke();

  // play gudelines
  textAlign(LEFT);
  fill(0, 0, 100);
  textStyle(BOLD);
  textSize(14);
  text("HOW TO PLAY", leftX, topY + 135);
  textStyle(NORMAL);

  textSize(12);

  fill(0, 0, 65);
  text("Major Chords", leftX, topY + 160);
  text("Minor Chords", leftX, topY + 182);
  text("7 minor", leftX, topY + 204);
  text("Strings", leftX, topY + 226);
  text("Arpeggio", leftX, topY + 248);
  text("Time Signature", leftX, topY + 270);
  text("Octave", leftX, topY + 292);
  text("Fullscreen", leftX, topY + 314);
  text("Hide UI", leftX, topY + 336);

  textAlign(RIGHT);
  fill(0, 0, 100);

  text("1 - 7", rightX, topY + 160);
  text("Q W E R T Y", rightX, topY + 182);
  text("Shift + U", rightX, topY + 204);
  text("Space B H U I O", rightX, topY + 226);
  text("P", rightX, topY + 248);
  text("8 / 9", rightX, topY + 270);
  text("- / +", rightX, topY + 292);
  text("F", rightX, topY + 314);
  text("Z", rightX, topY + 336);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
