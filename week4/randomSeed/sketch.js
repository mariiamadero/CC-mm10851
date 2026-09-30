let randVal;
let randRange;
let seed;

function setup() {
    createCanvas(800, 600);
    // a random seed fixes the randomness so it returns the 
    // same results each time
    seed = 2344;
    randomSeed(seed);
    randVal = random();
    randRange = random(0, width);
}

function draw() {
    background(220);
    textSize(32);
    text("random: " + randVal, 100, 100);
    text("random range: " + randRange, 100, 200);
    randRange = random(0, width);
    text("another random range: " + randRange, 100, 300);
    noLoop();
}