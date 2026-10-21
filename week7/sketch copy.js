let pMapper; // mapper instance
let myQuad; // one face
let ballx;
// let bally;
let trail = [];
let trailLength = 20;


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
    bally = myQuad.width/3;

}

function draw() {
    background(0);
    //pass the name of a drawing function into displaySketch()
    myQuad.displaySketch(myDrawing);
}

// p5.mapper passes an offscreen canvas (mySketch) into this function
function myDrawing(mySketch) {
    // anything drawn on this surface needs 'mySketch.' in front of it
    mySketch.background("#2d6a4f");
    mySketch.stroke(0);
    mySketch.strokeWeight(4);
   // mySketch.line(0, 0, 400, 400); // diagonal line across the quad
    mySketch.noStroke();

    trail.push(ballx);
    if (trail.length > trailLength) trail.shift();

    for (let i = 0; i < trail.length; i++) {
        let alpha = map(i, 0, trail.length - 1, 20, 255);
        mySketch.fill(255, 209, 102, alpha);
        mySketch.rect(trail[i], myQuad.height/4, 40);
    }

    mySketch.fill("#ffd166");
    mySketch.ellipse(bally, myQuad.height/8, 10);

    ballx += 10.5;
    if(ballx>myQuad.width+75)ballx=-75;

    /* bally += 1.5;
    if(bally>myQuad.width+75)bally=-75; */
}
function keyPressed() {
    if (key === "c") {
        pMapper.toggleCalibration();
    }
    if (key === "s") {
        pMapper.save("map.json");
    }
    if (key === "l") {
        pMapper.load("maps/map.json");
    }
}