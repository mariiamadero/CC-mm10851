let lines = 30;
let rows;
let columns;


function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  strokeWeight(5);
  columns = (width / lines);
  rows = (height / lines);
}

function draw() {
  background(10, 230, 10);
  
  let steep = (mouseX / width) * 4;
  let hueSpeed = (mouseY / height) * 3;

  // if then for xaxis
  for (let col = 0; col < columns; col++) {

    // if then for yaxis
    for (let row = 0; row < rows; row++) {

      let xPos = col * lines + lines / 2;
      let yPos = row * lines + lines / 2;

      // going down + angle change 
      let lineAngle = (row / (rows - 1)) * (PI * steep);
      let changedHue = (row * (20 + hueSpeed * 20)) % 360;
      let d = dist(mouseX, mouseY, xPos, yPos);

      push();
          translate(xPos, yPos);
          rotate(lineAngle);
    
          // if then 
          if (d < lines) {
            stroke(changedHue, 40, 100);
    
            // line highlighed w mouse 
            line(-lines / 1.5, 0, lines / 1.5, 0); 
          } 
          else {
            stroke(changedHue, 80, 90);
            line(-lines / 2.5, 0, lines / 2.5, 0);
          }
      pop();
    }
  }
}