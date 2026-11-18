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

// Iteration 2: sin() swings between -1 and 1 forever; * 200 = swing 200px each way
  let phase = frameCount * 0.02;
  let sway = sin(phase) * 200;

// Iteration 3: drop down one step every time the grid hits an edge
  let edgeHits = floor((phase + HALF_PI) / PI); // +1 at every edge (left AND right)
  let drop = (edgeHits * 20) % 360;            // 20px per hit, loops back to top


 // center the grid on the canvas
  let gridWidth = cols * (size + gap) - gap;
  let startX = width / 2 - gridWidth / 2 + size / 2;

// Iteration 1: three rows of squares with player triangle at the bottom
  fill(255, 255, 255);
  noStroke();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let x = startX + c * (size + gap) + sway; //this is the horizontal swing of the invaders
      let y = 80 + r * (size + gap) + drop; //this is the invaders lowering each time they hit a wall
      rect(x, y, size, size);
    }
  }

  // player triangle at bottom
  fill(255);
  let px = width / 2;
  let py = height - 50;
  triangle(px - 20, py + 15, px + 20, py + 15, px, py - 20);

}
