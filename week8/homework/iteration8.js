let rows = 4;
let cols = 10;
let size = 30; // square size
let gap = 20;  // space between squares
let bullets = []; //every shot currently on screen
let nextShotTime = 0; // the millis() time when the next shot fires
let alive = []; //alive[row][col] true or false
let lastDrop = 0; //used to spot when the grid loops back to the top
let playerX; // Iteration 6: player's horizontal position
let gameWon = false // Iteration 7: true once every invader is gone
let startFrame = 0 // Iteration 7: lets R restart the swing from the beginning
let phase = 0; // Iteration 8: running total, so speed can change smoothly

function setup() {
  createCanvas(800, 600);
  rectMode(CENTER);
  nextShotTime = millis()+ random(0, 5000); //Shots randomly between 1-5 seconds
  resetInvaders()
  playerX = width / 2; // Starts player in the middle
}                               

// Iteration 5: Revive Invaders
function resetInvaders() {
  alive = [];
  for (let r = 0; r < rows; r++) {
    alive[r] = [];
    for (let c = 0; c < cols; c++) {
      alive[r][c] = true;
    }
  }
}

function draw() {
  background(0);

// Iteration 7: win screen
  if (gameWon) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(48);
    text("YOU WIN!", width / 2, height / 2 - 20);
    textSize(20);
    text("Press R to restart", width / 2, height / 2 + 30);
    return; // stop here so nothing else moves
  }
  
  // Iteration 2: sin() swings between -1 and 1 forever; * 150 = swing 150px each way
  // Iteration 8: invaders speed up as fewer are left
  let left = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (alive[r][c]) left++;
    }
  }
  let speed = map(left, 40, 1, 0.005, 0.03); // 40 left = slow, 1 left = 4x faster
  phase += speed;
  let sway = sin(phase) * 150

// Iteration 3: drop down one step every time the grid hits an edge
  let edgeHits = floor((phase + HALF_PI) / PI); // +1 at every edge (left AND right)
  let drop = (edgeHits * 20) % 300;            // 20px per hit, loops back to top
  if (drop < lastDrop) {
    resetInvaders();
  }
  lastDrop = drop;

 // Center the grid on the canvas
  let gridWidth = cols * (size + gap) - gap;
  let startX = width / 2 - gridWidth / 2 + size / 2;

// Iteration 1: three rows of squares with player triangle at the bottom
  fill(255, 255, 255);
  noStroke();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let x = startX + c * (size + gap) + sway; //this is the horizontal swing of the invaders
      let y = 80 + r * (size + gap) + drop; //this is the invaders lowering each time they hit a wall
      y += (noise(c * 0.3, r * 0.3, frameCount * 0.005) - 0.1) * 20; // organic wobble
      if(alive[r][c]){
         rect(x, y, size, size)
      }
    }
  }                                 

  fill(32, 255, 32);
// Move player triangle with with arrow keys or A/D
  if (keyIsDown(LEFT_ARROW) || keyIsDown('a')) {  // Use left arrow or A key to move player left
    playerX -= 6;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown('d')) { // Use right arrow or D key to move player right
    playerX += 6;
  }
  playerX = constrain(playerX, 20, width - 20);  // stay on screen
  let px = playerX;
  
// Locked player triangle height/y-axis  
  let py = height - 50;
  triangle(px - 20, py + 15, px + 20, py + 15, px, py - 20);

//Iteration 4: fire  shot after a random wait between 1-5 seconds
  if (millis() > nextShotTime) {
    bullets.push({ x: px, y: py - 20 });           // new shot at the triangle's tip
    nextShotTime = millis() + random(200, 1200);  // pick the next random wait
  }

  // move and draw every shot
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= 8;                    // travel up 8px per frame
    rect(bullets[i].x, bullets[i].y, 4, 14);

// Iteration 5: check this shot against every living invader
    let hit = false;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!alive[r][c] || hit) continue;
        let x = startX + c * (size + gap) + sway;
        let y = 80 + r * (size + gap) + drop;
        y += (noise(c * 0.3, r * 0.3, frameCount * 0.005) - 0.1) * 20; // organic wobble
        // do the shot and the invader overlap?
        if (abs(bullets[i].x - x) < size / 2 + 2 && abs(bullets[i].y - y) < size / 2 + 7) {
          alive[r][c] = false; // invader disappears
          hit = true;
        }
      }
    }

    if (hit || bullets[i].y < -20) {
      bullets.splice(i, 1);               // remove the shot if it hit or left the screen
    }
  }

//Directions for Controls
fill(255);
textSize(8);
textAlign(LEFT, BOTTOM); //Used to place on bottom left of canvas
text("Controls: ← → or A / D to move", 10, height - 10)

//Countdown for invaders left
  let remaining = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (alive[r][c]) remaining++;
    }
  }
  textAlign(LEFT, TOP);
  textSize(18);
  text("Invaders: " + remaining, 10, 10);

  if (remaining === 0) {
    gameWon = true; // next frame shows the win screen
  }
}

// Iteration 7: press R to restart
function keyPressed() {
  if (key === 'r' || key === 'R') {
    resetInvaders();
    bullets = [];
    playerX = width / 2;
    startFrame = frameCount; // swing and drop start over from the top
    lastDrop = 0;
    gameWon = false;
    phase = 0;
  }
}