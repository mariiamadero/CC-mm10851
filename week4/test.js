/* notes from readings 
- for standard dev : one way to pick val for standard dev is to take whatever we would like to bve the largest value returned by randomGaussian() function and divide it by 3 ...
    -  e.g., we want our ellipses to have a max diameter of width, so our standard dev should b 1/3 that value (so most ellipses fall within the canvas)


  a general way to pick SD when using randomGaussian() is ø = max-mean/3.


*/

/* let xSq;
let ySq;

function setup() {
  createCanvas(576, 384);
  colorMode(HSB);
  xSq = 65
  ySq = 65  
}

function blueSq() {
  rectMode(RADIUS);
  noFill();
  stroke(215, 50, 255);
  strokeWeight(2);
  rect(xSq, ySq, 30, 25);
}

function smallerSq() {
    rectMode(CENTER);
    stroke(25, 95, 255);
    strokeWeight(2);
    noFill();
    rect(xSq * 2, ySq, 95, 65);
}

function draw() {
  
   for (let x = xSq / 2; x < width + xSq; x += xSq) {
    for (let y = ySq / 2; y < height + ySq; y += xSq) {

      let eDiam = random(0.2 * xSq, 0.8 * xSq);
      rect(x, y, eDiam, eDiam);

    }
  }
} */

/* orage sqs 
let xSq;
let ySq;
let fullCanv; 0

function setup() {
  createCanvas(576, 384);
  colorMode(HSB);
  xSq = 65
  ySq = 65  
  frameRate(40);
}

function blueSq(x, y, diam) {
  rectMode(RADIUS);
  noFill();
  stroke(215, 50, 255);
  strokeWeight(2);
  rect(x, y, diam, diam);
}

function smallerSq(x, y, diam) {
  rectMode(CENTER);
  stroke(25, 95, 255);
  strokeWeight(2);
  noFill();
  rect(x, y, diam, diam);
}

function draw(){
  fullCanv++;
   for (let x = xSq / 2; x < width + xSq; x += xSq) {
    for (let y = ySq / 2; y < height + ySq; y += xSq) {

   let eDiam = random(0.2 * xSq, 0.8 * xSq);
    // blueSq(x, y, eDiam, eDiam); 

      if (fullCanv < 190) {
       blueSq(x, y, eDiam);
      } else {
        smallerSq(x, y, eDiam);
    }
    }
   }
}
*/
  
let xSq;
let ySq;
let fullCanv = 0;

function setup() {
  createCanvas(576, 384);
  colorMode(HSB);
  xSq = 95
  ySq = 100  
  frameRate(10);
}

function blueSq(x, y, diam) {
  rectMode(RADIUS);
  noFill();
  stroke(215, 50, 255);
  rect(x, y, diam, diam);
}

function smallerSq(x, y, diam) {
  rectMode(CENTER);
  stroke(125, 125, 65);
  noFill();
  rect(x, y, diam, diam);
}

function draw(){
  fullCanv++;
   for (let x = xSq / 2; x < width + xSq; x += xSq) {
    for (let y = ySq / 2; y < height + ySq; y += xSq) {

   let eDiam = random(0.1 * xSq, 0.8 * xSq);
    // blueSq(x, y, eDiam, eDiam); 

      if (fullCanv <= 2) {
       blueSq(x, y, eDiam);
      } else if (fullCanv <= 20) { 
        smallerSq(x, y, eDiam); } 
      else { noLoop();
     }
    }
   }
}