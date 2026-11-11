let video;
let handPose;
let hands = [];
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipped: false };


async function setup() {
  createCanvas(640, 480);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handPose = await ml5.handPose();
  handPose.detectStart(video, gotHands);
  // Make sure to add "async" before "function setup()".
  
  faceMesh = await ml5.faceMesh(options);
  faceMesh.detectStart(video, gotFaces);

  
}

function draw() {
  background(220);

  // NEW: start mirroring (move to the right edge, then flip left-right)
  push();
  translate(width, 0);
  scale(-1, 1);

  image(video, 0, 0);

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }
  }

  // Draw all the tracked face points

  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    for (let j = 0; j < face.keypoints.length; j++) {
      let keypoint = face.keypoints[j];
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 5);
    }
  }

  // NEW: stop mirroring
  pop();
}

function gotHands(results) {
  hands = results;
}

// Callback function for when faceMesh outputs data

function gotFaces(results) {
  
  // Save the output to the faces variable
  
    faces = results;
  }