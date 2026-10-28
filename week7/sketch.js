let pMapper; // mapper instance
let myQuad; // one face 
let myQuad2; // one face
let myQuad3; // one face
let myQuad4; // one face
let myQuad5; // one face
let myQuad6; // one face


let ballx;
let bally;
let trail = [];
let trailLength = 20;

let ballx3;
let trail3 = [];

let squareSize = 60; // how big each square is
let rowSpacing = 80; // distance from one row to the next (size + gap)
// one color per row, written as [red, green, blue]
let colors = [
    [255, 89, 94],
    [255, 202, 58],
    [138, 201, 38],
    [25, 130, 196],
    [106, 76, 147]
];

// one grey per row, written as [red, green, blue] (all three the same = grey)
let greys = [
    [240, 240, 240],
    [195, 195, 195],
    [150, 150, 150],
    [105, 105, 105],
    [70, 70, 70]
];


function setup() {
    // p5.mapper needs WEBGL in createCanvas
    createCanvas(windowWidth, windowHeight, WEBGL);
    pMapper = createProjectionMapper(this);
    myQuad = pMapper.createQuadMap(400, 400);
    myQuad2 = pMapper.createQuadMap(400, 400);
    myQuad3 = pMapper.createQuadMap(400, 400);
    myQuad4 = pMapper.createQuadMap(400, 400);
    myQuad5 = pMapper.createQuadMap(400, 400);
    myQuad6 = pMapper.createQuadMap(400, 400);

    ballx = 0
    bally = 0
    ballx3 = 400
    // if you want to position items in your sketch
    // do so with the quad you're targeting
}

function draw() {
    background(0);
    //pass the name of a drawing function into displaySketch()
    myQuad.displaySketch(myDrawing);
    myQuad2.displaySketch(myDrawing2);
    myQuad3.displaySketch(myDrawing3);
    myQuad4.displaySketch(myDrawing4);
    myQuad5.displaySketch(myDrawing4);
    myQuad6.displaySketch(myDrawing4);
  
}

function myDrawing(mySketch) {
    mySketch.background("white");
    mySketch.stroke(0);
   
} 

function myDrawing2(mySketch) {
    mySketch.background("black");
    mySketch.noStroke();

    trail.push(ballx);
    if (trail.length > trailLength) trail.shift();

    // repeat the whole fading trail 5 times, one row below the other
    for (let row = 0; row < 5; row++) {
        let c = colors[row]; // the color for this row
        let y = 10 + row * rowSpacing; // how far down this row sits

        // same fading trail as before
        for (let i = 0; i < trail3.length; i++) {
            let fade = map(i, 0, trail.length - 1, 20, 255);
            mySketch.fill(c[0], c[1], c[2], fade);
            mySketch.rect(trail3[i], y, squareSize);
        }
    }

    ballx += 10.5;
    if (ballx > myQuad2.width + 75) ballx = -75;
}

function myDrawing3(mySketch) {
    // anything drawn on this surface needs 'mySketch.' in front of it
    mySketch.background("black");
    mySketch.noStroke();

    // same idea as quad 2, but using quad 3's own trail
    trail3.push(ballx3);
    if (trail3.length > trailLength) trail3.shift();

    for (let row = 0; row < 5; row++) {
        let c = greys[row];
        let y = 10 + row * rowSpacing;

        for (let i = 0; i < trail3.length; i++) {
            let alpha = map(i, 0, trail3.length - 1, 20, 255);
            mySketch.fill(c[0], c[1], c[2], alpha);
            mySketch.rect(trail3[i], y, squareSize);
        }
    }

    ballx3 -= 10.5; // subtract, so it moves left
    // once it leaves the left side, jump back to the right side
    if (ballx3 < -75) ballx3 = myQuad3.width + 75;
}
   

function myDrawing4(mySketch) {
    // anything drawn on this surface needs 'mySketch.' in front of it

    // gradient: draw 400 thin lines, one per row, each a slightly different color
    for (let y = 0; y < 400; y++) {
        let r = map(y, 0, 400, 200, 255); // red goes from 200 to 255
        let g = map(y, 0, 400, 20, 150);  // green goes from 20 to 150
        let b = map(y, 0, 400, 40, 190);  // blue goes from 40 to 190
        mySketch.stroke(r, g, b);
        mySketch.line(0, y, 400, y);
    }
    mySketch.noStroke();

    // draw 20 holes, each one a little different
    for (let i = 0; i < 20; i++) {
        let x = noise(i * 7.3) * 400;

        let y = 450 - ((frameCount * 0.5 + i * 37) % 500);

        // size: noise() gives each hole its own size, between 20 and 70
        let s = 20 + noise(i * 3.7) * 50;

        // white bubble
        mySketch.fill(255);
        mySketch.ellipse(x, y, s);
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