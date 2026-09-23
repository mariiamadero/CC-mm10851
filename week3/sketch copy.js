

/* function setup() {
      createCanvas(800, 600);
    // colorMode(HSB);
      noStroke();     
}

function draw() {
    background(220);
    rectMode(CENTER);
    for (let x = 0; x < 10; x++) {
      for(let y=0; y<8; y++) {

        push();
          rect(x*75+25, y*75+25, 50);
        pop();
      }
    }
}
*/

let x = 0;
let incX = 0.01;

let y= 0;
let incY = 0.025;


function setup() {
  createCanvas (800, 600);
  strokeWeight(2);
  noFill();
}

function draw() {
 //  background(220);

  let xPos = ((sin(x)+1)/2)*width;
  let YPos = ((cos(y)+1)/2)*height;
  ellipse(xPos, yPos, 50);

  console.log();
  x+=incX;
  y+=incY;

}
