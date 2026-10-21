let xSq; 
let ySq; 
let fullCanv = 0; 
let mySeed = 123; 
let clickCount = 0; 
let currentAngle = 0; 
let doExport = false;

function setup() { 
    createCanvas(576, 384); 
    colorMode(HSB); 
    angleMode(DEGREES); 
    noiseSeed(123);
    xSq = 95;
    ySq = 100; 
    frameRate(16); 
}

function blueSq(x, y, diam, angle) { 
    push();
    translate (x,y); 
    rotate(angle);

    rectMode(RADIUS); 
    noFill(); 
    stroke(215, 50, 255);
    rect(0, 0, diam, diam);
    pop(); 
}

function smallerSq(x, y, diam, angle) { 
    push();
    translate (x,y); 
    rotate(angle);

    rectMode(CENTER); 
    stroke(125, 125, 65); 
    noFill(); 
    rect(0, 0, diam, diam);
    pop();
}

function keyPressed () {
    if (key === "x" && !doExport) { 
        doExport = true; 
        fullCanv = 0;
        loop();
     }
 } 

function draw(){ 
    if (doExport && fullCanv === 0) { 
        beginRecordSvg("myPlot\_"+Math.floor(mySeed)+".svg")
    }

    randomSeed(mySeed); 
    fullCanv++;
    // seperate x and y into diff for loops
    for (let x = xSq / 2; x < width + xSq; x += xSq) { 
        for (let y = ySq / 2; y < height + ySq; y += ySq) {

            let noiseVal = noise(x * 0.008, y * 0.008, 0);
            let eDiam = map(noiseVal, 0, 1, 0.1 * xSq, 0.8 * xSq);

    // blueSq(x, y, eDiam, eDiam);

  if (fullCanv <= 2) {
   blueSq(x, y, eDiam, currentAngle);
  } else if (fullCanv <= 20) {
    smallerSq(x, y, eDiam, currentAngle);
  }
  else {
    noLoop();
 }
}


} 

if (doExport && fullCanv === 20) { 
    endRecordSvg(); 
    doExport = false;
 }
}

function mousePressed() { 
    if (doExport) return;
    clickCount++;
    currentAngle += 15; 

    
    if (clickCount >= 5) { 
        background(0, 0, 100); 
        clickCount = 0; 
        currentAngle = 0;
    }

  //  mySeed = random(10000);
    fullCanv = 0; 
    loop();
}