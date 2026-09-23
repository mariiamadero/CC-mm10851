let cells = 50;
let columns;
let rows;
let baseHue = 200; // blueish

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  columns = width / cells;
  rows = height / cells;
}

function draw() {
  background(192, 283, 10);
  let grow = (mouseY / height) * 30;

  // if then for x
  for (let col = 0; col < columns; col++) {

    // if then for y
    for (let row = 0; row < rows; row++) {

      let xPos = col * cells + cells / 2;
      let yPos = row * cells + cells / 2;

      let shapeS = 4 + (row / rows) * grow;
      let lightCol = 40 + (row / (rows - 1)) * 60;

      let d = dist(mouseX, mouseY, xPos, yPos);

      push();
        translate(xPos, yPos);

          if (d < cells / 2) {
            noStroke();
            fill(baseHue, 80, lightCol);
            ellipse(0, 0, shapeS, shapeS);
          } // will remove the stroke effect others have
          
          else {
            noFill();
            stroke(baseHue, 80, lightCol);
            strokeWeight(2);
            ellipse(0, 0, shapeS * 1.8, shapeS * 1.8);
            ellipse(0, 0, shapeS * 0.8, shapeS * 0.8);
        }

      pop();
    }
  }
}