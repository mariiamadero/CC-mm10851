let columns;
let rows;
let cells = 100;  
let sqSize = 80; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  rectMode(CENTER);
  noFill();
  strokeWeight(2);
  columns = width / cells;
  rows = height / cells;
}

function draw() {
  background(0);
  let titly = (mouseX / width) * PI;

  // if then for x
  for (let col = 0; col < columns; col++) {

    // if then for y
    for (let row = 0; row < rows; row++) {
      let xPos = col * cells + cells / 2;
      let yPos = row * cells + cells / 2;

      push();
        translate(xPos, yPos); 
          // the check
          if ((col + row) % 2 === 0) {
            rotate(0);
            stroke(140, 90, 190);
          } else {
            rotate(titly);
            stroke(255);
            fill(140, 90, 190);
          }
        rect(0, 0, sqSize, sqSize);

      pop();
    }
  }
}