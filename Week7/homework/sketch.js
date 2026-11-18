
// Dome tiling: onion-shaped petals that interlock with thin gold gaps, flowing outward
let N = 24;   // petals per ring (to satisfy symmetry)
let q = 1.2;  // for expanding rings growth: each ring is roughly 20% farther out

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  noLoop();  
}

function petal(L, W) {  // pointed at both ends, drawn along the x-axis
  beginShape();
  for (let i = 0; i <= 12; i++) vertex((i / 12 - 0.5) * L, -W * sq(sin(PI * i / 12))); //spins everything to the right?
  for (let i = 12; i >= 0; i--) vertex((i / 12 - 0.5) * L, W * sq(sin(PI * i / 12))); //keeps contraints of the succulent outer ring
  endShape(CLOSE);
}

function draw() {
  background(42, 70, 95);                        // gold background, seen through gaps in lines
  translate(width / 2, height / 2);              // center point = (0, 0)
  let maxR = dist(0, 0, width, height) / 2;
  let g = min(width, height) * 0.08;             // radius of the center medallion

  for (let k = 0; g * pow(q, k) < maxR * 1.3; k++) {
    let r = g * pow(q, k);                       // geometric growth = perspective
    let t = r / maxR;                            // 0 at center, 1 at edge
    let wave = sin(k * 0.9);                     // swells and shrinks ring by ring
    let L = r * (q - 1 / q) * 0.92;              // length = 2 x ring spacing
    let W = (PI * r / N) * 0.92;                 // half width = half petal spacing
    let hue = map(t, 0, 1, 40, 130, true);       // gold -> sage green outward
    strokeWeight(constrain(r * 0.012, 0.5, 2.5));
    for (let i = 0; i < N; i++) {
      push();
      rotate(TWO_PI / N * i + (k % 2) * PI / N); // alternate rings offset
      translate(r, 0);
      stroke(18, 80, 70); fill(25, 70, 25 + 10 * (k % 2)); // dark/light rings alternate
      petal(L, W);
      noStroke(); fill(hue, 70, 80 + 15 * wave);
      petal(L * 0.5, W * (0.55 + 0.15 * wave));  // inner motif breathes by ring
      if (k % 3 == 0) { fill(40, 80, 95); petal(L * 0.22, W * 0.22); } // gold seed
      pop();
    }
  }

  noStroke(); fill(18, 80, 60);                  // soil pot edge color, scalloped rim
  
  for (let i = 0; i < 24; i++) { //scalloped rim
    push(); rotate(TWO_PI / 24 * i); circle(g * 0.95, 0, g * 0.22); pop();
  }
  
  fill(28, 60, 20); circle(0, 0, g * 1.8);       // soil-brown disc
  
  stroke(2, 85, 75); strokeWeight(0.5);            // red outline of succulent, kept faint like actual plant
  
  for (let layer = 0; layer < 3; layer++) {      // succulent rosette: 8 -> 6 -> 4 petals
    let n = 8 - 2 * layer;
    let L = g * (0.72 - 0.16 * layer);           // inner layers are smaller
    fill(map(layer, 0, 2, 150, 110), 35 + 10 * layer, 70 + 10 * layer); // sage, lighter inward, spoke about in week 10 class
    for (let i = 0; i < n; i++) {
      push();
      rotate(TWO_PI / n * i + layer * PI / n);   // each layer offset half a step
      translate(L / 2, 0);                       // petal base sits at the center
      petal(L, L * 0.3);
      pop();
    }
  }

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
}
