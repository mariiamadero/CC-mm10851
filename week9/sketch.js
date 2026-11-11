let video;
let handPose;
let hands = [];
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipped: false };
let liquors = ["tequila", "vodka", "wine"];
let drinks = [
  ["margarita", "paloma", "tequila sunrise"],   // tequila drinks
  ["moscow mule", "cosmopolitan", "espresso martini"], // vodka drinks
  ["red wine", "white wine", "sparkling wine"]   // wine
];
let drinkColors = [
  [[200, 230, 80], [255, 130, 120], [255, 150, 40]],  // margarita, paloma, tequila sunrise
  [[230, 210, 120], [220, 40, 90], [60, 35, 25]],     // moscow mule, cosmopolitan, espresso martini
  [[130, 20, 40], [240, 230, 150], [250, 235, 170]]   // red wine, white wine, sparkling wine
];

let stage = 0;          // 0 = pick a liquor, 1 = pick a drink, 2 = drink it
let chosenLiquor = 0;   
let chosenDrink = 0;    
let lastChoice = -1;    // which menu box you were pointing at last frame
let dwellTimer = 0;     // counts frames you hold still on one box
let level = 100;        // how full the glass is (100 = full, 0 = empty)
let waveAmount = 0;     // how wavy  screen is
let cnv;

async function setup() {
  cnv = createCanvas(640, 480);
  centerCanvas();
  textFont("Press Start 2P");

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handPose = await ml5.handPose();
  handPose.detectStart(video, gotHands);

  faceMesh = await ml5.faceMesh(options);
  faceMesh.detectStart(video, gotFaces);
}

function draw() {
  background(220);

  let gesture = "none";
  let pointX = 0;      // where your index finger is (flipped to match the mirror)
  let pointY = 0;
  let handX = 0;       // the middle of your hand
  let handY = 0;

  if (hands.length > 0) {
    let h = hands[0];

    // check which fingers are up (true or false for each)
    let indexUp = fingerIsUp(h.index_finger_tip, h.index_finger_pip, h.wrist);
    let middleUp = fingerIsUp(h.middle_finger_tip, h.middle_finger_pip, h.wrist);

    if (!indexUp && !middleUp) {
      gesture = "fist";
    } else if (indexUp && !middleUp) {
      gesture = "point";
    }

    pointX = width - h.index_finger_tip.x;
    pointY = h.index_finger_tip.y;
    handX = h.middle_finger_mcp.x;
    handY = h.middle_finger_mcp.y;
  }
  

  // fist = holding drink
  let holding = (stage == 2 && gesture == "fist");

  // point at top menu and hold to pick
  if (stage < 2 && gesture == "point" && pointY < 150) {
    let choice = floor(pointX / (width / 3));
    choice = constrain(choice, 0, 2);

    if (choice == lastChoice) {
      dwellTimer = dwellTimer + 1;  // still on the same box
    } else {
      dwellTimer = 0;               // moved to a new box, start over
      lastChoice = choice;
    }

// locks decision
    if (dwellTimer > 40) {
      if (stage == 0) {
        chosenLiquor = choice;
        stage = 1;
      } else {
        chosenDrink = choice;
        stage = 2;
        level = 100;
      }
      dwellTimer = 0;
      lastChoice = -1;
    }
  } else {
    dwellTimer = 0;
    lastChoice = -1;
  }

  // drink clsoe to mouth
  let drinking = false;
  if (holding && faces.length > 0) {
    let mouth = faces[0].keypoints[13]; // point 13 is the middle of the lips
    if (dist(handX, handY, mouth.x, mouth.y) < 120) {
      drinking = true;
    }
  }

  // glass empties waves pop in
  if (drinking) {
    level = level - 0.5;
    waveAmount = min(waveAmount + 0.3, 40);
    // empty glass = go back to menu
    if (level <= 0) {
      stage = 0;
      level = 100;
    }
  }

  // waves calm down
  waveAmount = waveAmount * 0.99;
  // start mirroring (move to the right edge, then flip left-right)
  push();
  translate(width, 0);
  scale(-1, 1);

  // sin() = smooth back and forth # so strips make waves
  for (let y = 0; y < height; y = y + 4) {
    let offset = sin(y * 0.05 + frameCount * 0.1) * waveAmount;
    image(video, offset, y, 640, 4, 0, y, 640, 4);
  }
  if (holding) {
    drawGlass(handX, handY);
  }
  // stop mirroring
  pop();

  if (stage == 0) {
    drawMenu(liquors);
  } else if (stage == 1) {
    drawMenu(drinks[chosenLiquor]);
  }

  fill(255);
  textAlign(CENTER);
  if (stage == 0) {
    text("point at a liquor and hold still", width / 2, 450);
  } else if (stage == 1) {
    text("pick a drink", width / 2, 450);
  } else if (!holding) {
    text("make a fist to hold your " + drinks[chosenLiquor][chosenDrink], width / 2, 450);
  } else {
    text("bring it to your mouth ...", width / 2, 450);
  }
  textAlign(LEFT);
}
function drawMenu(names) {
  for (let i = 0; i < 3; i++) {
    let boxX = i * (width / 3);

    // box
    fill(30, 30, 30, 200);
    stroke(255);
    strokeWeight(2);
    rect(boxX + 5, 10, width / 3 - 10, 120, 10);

    // name
    fill(255);
    noStroke();
    textSize(10);
    textAlign(CENTER);
    text(names[i], boxX + width / 6, 78);
    textAlign(LEFT);
  }
}

function drawGlass(x, y) {
  let c = drinkColors[chosenLiquor][chosenDrink];

  // gets shorter as level goes down)
  let liquidHeight = 60 * (level / 100);
  noStroke();
  fill(c[0], c[1], c[2]);
  rect(x - 20, y + 30 - liquidHeight, 40, liquidHeight);

  // glass outline
  noFill();
  stroke(255);
  strokeWeight(3);
  rect(x - 20, y - 30, 40, 60);
}

// returns true if finger is stretched out
// finger that's up has its tip farther from the wrist than its middle joint.
function fingerIsUp(tip, joint, wrist) {
  return dist(tip.x, tip.y, wrist.x, wrist.y) > dist(joint.x, joint.y, wrist.x, wrist.y);
}
function centerCanvas() {
  cnv.position((windowWidth - width) / 2, (windowHeight - height) / 2);
}
function windowResized() {
  centerCanvas();
}
function gotHands(results) {
  hands = results;
}
function gotFaces(results) {
  faces = results;
}