let randVal;
let randRange;

function setup() {
    createCanvas(800, 600);
    // random produces different results each time the sketch is run
    // default vaules are between 0.0 to 1.0
    randVal = random();
    // a ranged set of arguments gives a val in that space
    randRange = random(0, width);
}
    // ***** floor : rounds down !!!

function draw() {
    background(220);
    textSize(32);
    text("random: " + randVal, 100, 100);
    text("random range: " + randRange, 100, 200);
    noLoop();
}