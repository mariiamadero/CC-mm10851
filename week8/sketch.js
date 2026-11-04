let video;
let snapshot;
let offsetX;
let offsetY;
let spacing = 6;

// delayed brightness .. slowly catches up
let smoothBright = [];

// small # = very slow motion, big # = fast ,, 1 = no delay at all
let catchUp = 0.08;

// red + green
let colorA = [200, 30, 40];
let colorB = [20, 130, 60];

// each pair is [colorA, colorB]
let palettes = [
  [[200, 30, 40], [20, 130, 60]],   // red + green
  [[30, 80, 200], [120, 60, 180]],  // blue + purple
  [[240, 130, 20], [20, 150, 150]], // orange + teal
  [[230, 60, 140], [200, 160, 20]]  // pink + gold
];

// all the background colors in one list
let bgColors = [
  [255, 255, 255], // white
  [0, 0, 0],       // black
  [250, 215, 225]  // light pink
];

let palette = 0;
let effect = 0;
let bgChoice = 0;
let bgColor = [255, 255, 255];

async function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  video = await createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  // space on the left = (canvas width - video width) divided by 2, same idea for the top
  offsetX = (width - video.width) / 2;
  offsetY = (height - video.height) / 2;
  rectMode(CENTER);
}

function draw() {
  background(bgColor);

  // before you take photo = live video, after still the still photo
  let source = video;
  if (snapshot !== undefined) {
    source = snapshot;
  }

  source.loadPixels();
  noStroke();
  for (let shapeY = 0; shapeY < source.height; shapeY += spacing) {
    for (let shapeX = 0; shapeX < source.width; shapeX += spacing) {
      let loc = (shapeX + shapeY * source.width) * 4;

      // red, green and blue amounts for this spot
      let r = source.pixels[loc];
      let g = source.pixels[loc + 1];
      let b = source.pixels[loc + 2];
      
      let bright = 0.299 * r + 0.587 * g + 0.114 * b;

      // The very first time we see this spot, start the delayed brightness at the real one
      if (smoothBright[loc] === undefined) {
        smoothBright[loc] = bright;
      }
      smoothBright[loc] = smoothBright[loc] + (bright - smoothBright[loc]) * catchUp;

      let shapeSize = map(smoothBright[loc], 0, 255, 9, 1);

      // Switch between the two colors like a checkerboard
      if ((shapeX / spacing + shapeY / spacing) % 2 === 0) {
        fill(colorA);
      } else {
        fill(colorB);
      }

      // Add the offset so the shapes land in the centered frame
      if (effect === 0) {
        // dots
        ellipse(offsetX + shapeX, offsetY + shapeY, shapeSize, shapeSize);
      } else if (effect === 1) {
        // squares
        rect(offsetX + shapeX, offsetY + shapeY, shapeSize, shapeSize);
      } else if (effect === 2) {
        // stripes
        rect(offsetX + shapeX, offsetY + shapeY, spacing, shapeSize / 2);
      }
    }
  }
    // formula for bg change + text
    let bgBright = 0.299 * bgColor[0] + 0.587 * bgColor[1] + 0.114 * bgColor[2];

    // if bg is light, text black , vise versa 
    if (bgBright > 128) {
      fill(0);
    } else {
      fill(255);
    }
  
    // instructions text
    textSize(12);
    textAlign(LEFT, BOTTOM);
  // remember \n
    text("space: take a photo\nshift: back to live video\nenter: change effect\nclick: change colors\nbackspace: change background", 20, height - 20);
}

function keyPressed() {
  // space tks photo
  if (key === ' ') {
    snapshot = video.get();
    // stops pg from scrolling down when you press space
    return false;
  }

  //shift resets
  if (key === 'Shift') {
    snapshot = undefined;
    return false;
  }

  //effect
  if (key === 'Enter') {
    effect = effect + 1;
    // After the last effect, go back to the first one
    if (effect > 2) {
      effect = 0;
    }
    return false;
  }

// backspace bg
  if (key === 'Backspace') {
    // go to the next background, and wrap back to 0 after the last one in the list
    bgChoice = (bgChoice + 1) % bgColors.length;
    bgColor = bgColors[bgChoice];

    // This stops backspace from sending the browser to the previous page
    return false;
  }
}

// click
  function mousePressed() {
  // go to the next palette, and wrap back to 0 after the last one in the list
  palette = (palette + 1) % palettes.length;

  // grab the pair at this palette number
  colorA = palettes[palette][0];
  colorB = palettes[palette][1];
}