

function setup() {
  createCanvas(800, 600);
  colorMode(HSB);
  
}

function draw() {
  background(0,0,85);
  noFill();
  for (let i = 0;  i<50; i++) {
    stroke(360*(i/50), 100, 100);
    ellipse(width/2, height/2, i*10+2);
  }

  for (let i=0; i<50; i++) {
    stroke(360-(360*(i/50)), 100, 100);
    ellipse(mouseX, mouseY, i*10+2);
  }

}

