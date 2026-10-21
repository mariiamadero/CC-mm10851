let s, m, h, d, mo, y;
let ps; 
let ms, fc;


function setup() {
  createCanvas(windowWidth, windowHeight);
  y = year();
  mo = month();
  d = day();
  console.log('year:'+ y +' , month:' + mo + 'day:' + d);
  
}
// millis(); time since sketch start
function draw() {
  background(220);
  ms = millis();
  // console.log(ms);

  fc = frameCount;

  s = second();
  m = minute();
  h = hour();

  if (ps !== s) {
    console.log('hour:' + h + ' , minute:' + m + ' , second:' + s);
  }
  ps = s;

}
