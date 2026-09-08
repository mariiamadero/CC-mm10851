// change the quotes in this array. Be mindful of the quotation marks!
// this is the only part of the file you need to edit!

const quotes = [
  { text: "a tool for functional problem solving", source: "Ahmad Moussa" },
  { text: "a medium for artistic and personal expression", source: "Laura Valtere" },
  { text: "where programming is used as a tool for art or design", source: "Jack B. Du" },
  { text: "unbound by commercial constraints [and] fueled by curiosity", source: "Patrik Hübner" },
  { text: "based on discovery, variation, and exploration of mostly unexpected results", source: "Tim Rodenbroeker" },
  { text: "expressive, interactive, and dynamic", source: "Okoye Ndidiamaka" },
  { text: "both the creative universe and the logical universe", source: "Jun Wu" },
  { text: "about experimentation, not functionality", source: "Maura Kelly" }
];
// no need to edit anything below this line! 
// if you have made an error, you can check your history to see what might have gone wrong

// a variable that holds the current quote
let current = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Seed with millis() so each page load gives a different quote.
  randomSeed(millis());
  textSize(32);
  fill(236, 213, 188);
  // calls the function to pick a quote
  pickQuote();
}

function pickQuote() {
  // take a random number and use that to identify what quote to use
  current = quotes[floor(random(quotes.length))];
}

function draw() {
  background(0, 141, 136); // set the background color
  drawQuote();  // draw the quote on screen
}

function drawQuote() {   // draw text
  textAlign(CENTER, CENTER);
  text("Creative Coding is.....", width / 2, height / 2 - 48);
  textStyle(BOLD);
  text("'" + current.text + "'", width / 2, height / 2);
  textAlign(RIGHT, CENTER);
  text("-" + current.source, width - 100, height - 100);

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function newQuote() {
  pickQuote();
  redraw();
}

function mousePressed() {
  newQuote();
}