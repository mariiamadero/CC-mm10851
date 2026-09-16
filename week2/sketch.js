let ballX = 80;
let ballY = 345;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(15, 64, 145);
}

function draw() {

    //seat1LEFT
    push();
        noStroke();
        fill(255, 255, 255);
        triangle(width/3, height/2, -600, 600, 0, 0);
    pop();

     //seat2RIGHT
    push();
        noStroke();
        fill(255, 255, 255);
        triangle(width - width/3, height/2, width - (-600), 600, width - 0, 0);
    pop();

    // bg
    push();
        noStroke();
        fill(50, 148, 251);
        translate(width/2, height/2-80);
        rect(0, 0, 900, 700);
        rect(0, 0, -900, 700);
    pop();

    //fence
    push();
        noStroke();
        fill(39, 122, 250);
        translate(width/2, height/2-120);
        rect(0, 0, 900, 50);
        rect(0, 0, -900, 50);
    pop();

    //fenceborder
    push();
        noStroke();
        fill(140, 187, 138);
        translate(width/2, height/2+80);
        rect(0, 0, 900, 400);
        rect(0, 0, -900, 400);
    pop();

    //floor
    push();
        noStroke();
        fill(46, 83, 145);
        translate(width/2, height/2+125);
        rect(0, 0, 600, 900);
        rect(0, 0, -600, 900);
    pop();

    //border
    push();
        stroke(255, 255, 255);
        strokeWeight(10);
        noFill();
        translate(width/2, height/2 + 120);
        rect(0, 0, 700, 900);
        rect(0, 0, -700, 900);
    pop();

    //ball
    push();
       noStroke();
       fill(236, 255, 57);
       ellipse(ballX, ballY, 45, 45);
    pop();

}

function mousePressed() {
    background(15, 64, 145);
    ballX = mouseX;
    ballY = mouseY;
}

