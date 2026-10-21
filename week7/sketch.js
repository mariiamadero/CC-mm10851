let pMapper; // mapper instance
let myQuad; // one face
let ballx;
let bally;

function setup() {
    // p5.mapper needs WEBGL in createCanvas
    createCanvas(windowWidth, windowHeight, WEBGL);
    // create the mapper
    pMapper = createProjectionMapper(this);
    // create one quad surface
    myQuad = pMapper.createQuadMap(400, 400);
    // if you want to position items in your sketch
    // do so with the quad you're targeting
    ballx = myQuad.width/2;
    bally = random(myQuad.height);
}

function draw() {
    background(0);
    //pass the name of a drawing function into displaySketch()
    myQuad.displaySketch(myDrawing);
}

// p5.mapper passes an offscreen canvas (mySketch) into this function
function myDrawing(mySketch) {
    // anything drawn on this surface needs 'mySketch.' in front of it
    mySketch.background("#3e5c4a");
    mySketch.stroke("#1b3a2a");
    mySketch.strokeWeight(6);
    for (let y = -70; y < 400; y += 30) {
      mySketch.strokeWeight(y / 40);
      mySketch.line(0, y, 400, y + 70);
  }
    mySketch.noStroke();
    mySketch.fill(255);
    mySketch.ellipse(ballx, bally, 40);
    ballx += 7.5;
    if(ballx>myQuad.width+75){
        ballx=-75;
        bally = random(myQuad.height);
    }
}
function keyPressed() {
    switch (key) {
        case "c":
            pMapper.toggleCalibration();
            break;
        case "f":
            let fs = fullscreen();
            fullscreen(!fs);
            break;
        case "l":
            pMapper.load("maps/map.json");
            break;
        case "s":
            pMapper.save("map.json");
            break;
    }
}