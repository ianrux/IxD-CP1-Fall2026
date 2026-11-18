// Iteration 1: static layout. Three rows of squares, triangle at the bottom

let rows = 3;
let cols = 8;
let size = 30; // square size
let gap = 20;  // space between squares

function setup() {
  createCanvas(800, 600);
  rectMode(CENTER);
}

function draw() {
  background(0);

  // center the grid on the canvas
  let gridWidth = cols * (size + gap) - gap;
  let startX = width / 2 - gridWidth / 2 + size / 2;

  // squares
  fill(255, 255, 255);
  noStroke();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let x = startX + c * (size + gap);
      let y = 80 + r * (size + gap);
      rect(x, y, size, size);
    }
  }

  // player triangle at bottom
  fill(255);
  let px = width / 2;
  let py = height - 50;
  triangle(px - 20, py + 15, px + 20, py + 15, px, py - 20);
}
