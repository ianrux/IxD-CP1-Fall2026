// GARDEN ECOSYSTEM (Soil, Seed, Plant, Bee, Aphid, Weather, Gardener)
// Controls: 1 = seed bag (drops 1 seed), 2 = watering can, 3 = remove plant (X), 4 = bug spray.
// Click the canvas to use the current tool.

let soil, weather;
let seeds = [];
let plants = [];
let bees = [];
let aphids = [];
let puffs = []; // bug spray particles (visual only)
let mode = 1; // 1 seed, 2 water, 3 remove plant, 4 remove bugs

function setup() {
  createCanvas(800, 600).parent('sketch-holder');
  noCursor(); // we draw our own tool cursor
  soil = new Soil(0, height - 140, width, 140); // 4 rows of Xs
  weather = new Weather();
  for (let i = 0; i < 3; i++) {
    seeds.push(new Seed(random(60, width - 60), 0)); // start by dropping a few seeds
  }
}

function draw() {
  background(235, 245, 255);

  weather.update();
  soil.update();
  if (frameCount % 300 === 0) arrivals();

  for (let s of seeds) { s.fall(); s.age(); s.germinate(); }
  plants.sort((a, b) => b.size - a.size); // when water is short, the biggest roots drink first
  for (let p of plants) { p.grow(); p.pollinateProduce(); p.addSeed(); p.age(); p.die(); }
  for (let a of aphids) { a.mobileCrawl(); a.reproduce(); a.age(); }
  for (let b of bees) { b.mobileFly(); b.reproduce(); b.age(); }

  seeds = seeds.filter(s => s.isActive);
  plants = plants.filter(p => p.isAlive);
  aphids = aphids.filter(a => a.isAlive);
  bees = bees.filter(b => b.isAlive);

  soil.show();
  for (let s of seeds) s.show();
  for (let p of plants) p.show();
  for (let a of aphids) a.show();
  for (let b of bees) b.show();
  weather.show();
  drawPuffs();
  drawHUD();
  drawKey();
  drawCursor();
}

// New insects wander in from the edges so a species can recover after a crash,
// but only if there is something for them to live on.
function arrivals() {
  // the wind blows in a stray seed now and then when the garden is thin,
  // so the plants can come back after a drought or an aphid plague
  if (plants.length < 6 && seeds.length < 10 && random() < 0.5) {
    for (let i = 0; i < 3; i++) seeds.push(new Seed(random(60, width - 60), 0));
  }
  let flowers = plants.filter(p => p.stage === 'flower');
  if (flowers.length > 0 && bees.length < 2) {
    bees.push(new Bee(random() < 0.5 ? 0 : width, random(80, soil.y - 80)));
  }
  if (plants.length > 0 && aphids.length < 2 && random() < 0.5) {
    aphids.push(new Aphid(random() < 0.5 ? 0 : width, soil.y - 2));
  }
}

// ---------- GARDENER (direct user control) ----------
function keyPressed() {
  if (key === '1') mode = 1;
  if (key === '2') mode = 2;
  if (key === '3') mode = 3;
  if (key === '4') mode = 4;
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return; // ignore clicks outside the canvas
  if (mode === 1) {
    // addSeed(): drop ONE seed from the bag, it falls and lands on its own
    seeds.push(new Seed(mouseX, min(mouseY, soil.y - 5)));
  } else if (mode === 2) {
    soil.addWater(15); // addWater()
    weather.splash(mouseX + 34, mouseY); // pour from the spout tip
  } else if (mode === 3) {
    removePlant(mouseX, mouseY); // removePlant(): hits flowers AND weeds
  } else if (mode === 4) {
    removeBug(mouseX, mouseY); // removeBug(): sprays aphids near the cursor
  }
}

function removePlant(x, y) {
  let nearest = null;
  let best = 40;
  for (let p of plants) {
    let d = dist(x, y, p.x, p.y - p.size / 2);
    if (d < best) { best = d; nearest = p; }
  }
  if (nearest) nearest.isAlive = false;
}

function removeBug(x, y) {
  for (let a of aphids) {
    if (dist(x, y, a.x, a.y) < 45) a.isAlive = false;
  }
  for (let i = 0; i < 16; i++) {
    puffs.push({
      x: x + random(-10, 10), y: y + random(-10, 10),
      vx: random(-1.5, 1.5), vy: random(-1.5, 1.5), life: 22
    });
  }
}

function drawPuffs() {
  noStroke();
  for (let p of puffs) {
    p.x += p.vx; p.y += p.vy; p.life--;
    fill(255, 120, 120, p.life * 8);
    circle(p.x, p.y, 7);
  }
  puffs = puffs.filter(p => p.life > 0);
}

function drawCursor() {
  push();
  translate(mouseX, mouseY);
  rectMode(CENTER);
  if (mode === 1) {
    // seed bag: orange rectangle
    stroke(180, 80, 20);
    strokeWeight(2);
    fill(240, 130, 40);
    rect(0, 0, 22, 30, 3);
  } else if (mode === 2) {
    // watering can: green square with a skinny horizontal spout
    rectMode(CORNER);
    stroke(30, 110, 50);
    strokeWeight(2);
    fill(70, 170, 80);
    rect(-12, -12, 24, 24);
    rect(12, -3, 22, 6);
  } else if (mode === 3) {
    // remove plant: red X
    stroke(220, 30, 30);
    strokeWeight(5);
    strokeCap(ROUND);
    line(-11, -11, 11, 11);
    line(11, -11, -11, 11);
  } else {
    // bug spray: red rectangle with a smaller red square at the top right
    stroke(150, 20, 20);
    strokeWeight(2);
    fill(220, 40, 40);
    rect(0, 0, 18, 30, 3);
    rect(7, -19, 8, 8);
  }
  pop();
}

// ---------- SOIL ----------
class Soil {
  constructor(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.waterLevel = 60;
    this.maxWater = 150; // bigger reservoir
  }

  addWater(amount) {
    this.waterLevel = constrain(this.waterLevel + amount, 0, this.maxWater);
  }

  update() {
    // slow evaporation, even slower when it is not sunny
    let evap = weather.isSunny() ? 0.0015 : 0.0005;
    this.waterLevel = max(0, this.waterLevel - evap);
    // groundwater seeps in slowly: enough to keep a handful of plants alive in a drought
    this.waterLevel = min(this.maxWater, this.waterLevel + 0.012);
  }

  show() {
    let wet = this.waterLevel / this.maxWater;
    let c = lerpColor(color(200, 150, 100), color(90, 50, 25), wet);
    noStroke();
    fill(red(c), green(c), blue(c), 40 + wet * 80);
    rect(this.x, this.y, this.w, this.h);
    stroke(c);
    strokeWeight(3);
    line(this.x, this.y, this.x + this.w, this.y);
    strokeWeight(2);
    for (let row = this.y + 10; row < this.y + this.h - 20; row += 30) {
      for (let x = 10; x < this.w; x += 30) {
        line(x, row, x + 20, row + 20);
        line(x + 20, row, x, row + 20);
      }
    }
  }
}

// ---------- SEED ----------
class Seed {
  constructor(x, y, vx = 0) {
    this.x = x; this.y = y;
    this.vx = vx; // sideways toss when a flower flings it
    this.size = 10;
    this.isActive = true;
    this.life = 0;
    this.vy = 0;
    this.angle = random(TWO_PI);
    this.falling = true;
    this.landY = soil.y + random(12, 100); // how deep it settles
  }

  fall() {
    if (!this.falling) return;
    this.vy += 0.25;
    this.y += this.vy;
    this.vx *= 0.98; // air slows the toss
    this.x = constrain(this.x + this.vx + weather.wind * 0.8, 5, width - 5); // wind carries seeds
    this.angle += 0.1;
    if (this.y >= this.landY) {
      this.y = this.landY;
      this.falling = false;
      this.angle = PI / 8;
    }
  }

  age() {
    if (!this.falling) this.life++;
  }

  germinate() {
    if (this.falling) return;
    // a seed only sprouts if the soil has enough water to share with one more plant
    let waterNeeded = 15 + plants.length * 3;
    if (this.life > 180 && soil.waterLevel > waterNeeded && plants.length < 40) {
      // conditions are good: one roll, 30% sprout, the rest rot in the soil
      if (random() < 0.3) plants.push(new Plant(this.x, soil.y));
      this.isActive = false;
    } else if (this.life > 2400) {
      this.isActive = false; // dried out and died
    }
  }

  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    rectMode(CENTER);
    stroke(180, 80, 20);
    strokeWeight(1);
    fill(240, 130, 40);
    rect(0, 0, this.size, this.size);
    pop();
  }
}

// ---------- PLANT ----------
class Plant {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.size = 4;
    this.maxSize = random(60, 95);
    this.life = 0;
    this.isAlive = true;
    this.isHungry = false;
    this.hunger = 0;
    this.stage = 'sprout'; // sprout -> flower or weed
    this.isWanted = true;
    this.petalColor = color(random(150, 255), random(60, 200), random(120, 255));
    this.pollenAmount = 0;   // pollen available on this flower
    this.isPollinated = false;
    this.seedTimer = 0;
    this.droughtTolerance = random(350, 900); // frames it can survive without water
    this.lifespan = random(3000, 5000);       // old age varies plant to plant
  }

  grow() {
    if (soil.waterLevel > 0.5) {
      soil.waterLevel -= 0.0018; // drinks from soil
      this.isHungry = false;
      this.hunger = max(0, this.hunger - 1);
      if (this.size < this.maxSize) {
        this.size += weather.isSunny() ? 0.12 : 0.05; // sun speeds growth
      }
    } else {
      this.isHungry = true;
      this.hunger++;
    }
    if (this.stage === 'sprout' && this.size >= this.maxSize) {
      this.isWanted = random() < 0.6; // 60% flower, 40% weed
      this.stage = this.isWanted ? 'flower' : 'weed';
      if (this.isWanted) this.pollenAmount = 3; // new flowers start with some pollen
    }
  }

  // flowers make pollen steadily while they are getting water
  pollinateProduce() {
    if (this.stage !== 'flower' || this.isHungry) return;
    if (frameCount % 90 === 0 && this.pollenAmount < 8) this.pollenAmount++;
  }

  // a bee brought pollen from a different flower
  pollinateReceive() {
    this.isPollinated = true;
    this.seedTimer = 120;
  }

  // once pollinated, the flower drops 3 seeds
  addSeed() {
    if (!this.isPollinated) return;
    this.seedTimer--;
    if (this.seedTimer <= 0 && seeds.length < 150) {
      for (let i = 0; i < 3; i++) {
        // flung outward so seeds land roughly 40-120 px away instead of piling at the stem
        let toss = random(2, 4) * (random() < 0.5 ? -1 : 1);
        seeds.push(new Seed(this.x + random(-10, 10), this.y - this.size, toss));
      }
      this.isPollinated = false;
    }
  }

  age() { this.life++; }

  die() {
    if (this.hunger > this.droughtTolerance || this.life > this.lifespan) this.isAlive = false;
  }

  show() {
    let w = this.size * 0.35;
    let tint = this.isHungry ? color(150, 160, 90) : color(80, 170, 80);
    fill(tint);
    stroke(50, 120, 50);
    strokeWeight(1);

    if (this.stage === 'weed') {
      stroke(tint);
      strokeWeight(5);
      line(this.x, this.y, this.x, this.y - this.size * 0.6);
      line(this.x, this.y - this.size * 0.5, this.x - this.size * 0.25, this.y - this.size);
      line(this.x, this.y - this.size * 0.5, this.x + this.size * 0.25, this.y - this.size);
      line(this.x, this.y - this.size * 0.5, this.x, this.y - this.size * 1.05);
      return;
    }

    triangle(this.x - w / 2, this.y, this.x + w / 2, this.y, this.x, this.y - this.size);

    if (this.stage === 'flower') {
      let fy = this.y - this.size - 6;
      push();
      rectMode(CENTER);
      stroke(100);
      strokeWeight(1);
      fill(this.petalColor);
      rect(this.x, fy, 18, 18);
      noStroke();
      // center turns gold once pollinated
      if (this.isPollinated) fill(255, 200, 0); else fill(60, 160, 60);
      circle(this.x, fy, 7);
      // pollen: pale squares stacked above the petals (up to 8)
      rectMode(CORNER);
      stroke(210, 190, 80);
      strokeWeight(0.5);
      fill(255, 245, 150);
      for (let i = 0; i < this.pollenAmount; i++) {
        let col = i % 4;
        let row = floor(i / 4);
        rect(this.x - 14 + col * 8, fy - 20 - row * 7, 5, 5);
      }
      pop();
    }
  }
}

// ---------- BEE ----------
class Bee {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.isAlive = true;
    this.life = 0;
    this.isGrounded = false;
    this.foodLevel = 60;
    this.maxFood = 100;
    this.holdPollen = 0;
    this.maxPollen = 3;
    this.pollenSource = null; // flower the carried pollen came from
    this.target = null;
    this.lastFlower = null;
    this.visitTimer = 0;
    this.reproCooldown = 600;
    this.wobble = random(1000);
    this.facing = 1;
    this.prevX = x;
  }

  get isHungry() { return this.foodLevel < 60; }

  age() {
    this.life++;
    this.foodLevel -= 0.035; // burns food even when grounded
    this.reproCooldown--;
    if (this.foodLevel <= 0 || this.life > 6000) this.isAlive = false;
  }

  mobileFly() {
    // no sun or strong wind = bees are grounded (gray spiral)
    this.isGrounded = !weather.isSunny() || weather.isGusty();
    if (this.isGrounded) {
      let floor = soil.y - 8;
      if (this.y < floor) this.y += 1.5;
      return;
    }
    if (this.visitTimer > 0) { this.visitTimer--; return; }

    if (!this.target || !this.target.isAlive || this.target.stage !== 'flower') {
      this.target = this.pickFlower();
    }

    if (this.target) {
      let tx = this.target.x;
      let ty = this.target.y - this.target.size - 6;
      let d = dist(this.x, this.y, tx, ty);
      if (d < 12) {
        this.visit(this.target);
      } else {
        this.x += (tx - this.x) / d * 2.2;
        this.y += (ty - this.y) / d * 2.2 + sin(frameCount * 0.2 + this.wobble) * 0.6;
      }
    } else {
      // nothing to visit: wander
      let a = noise(this.wobble + frameCount * 0.01) * TWO_PI * 2;
      this.x += cos(a) * 1.2;
      this.y += sin(a) * 1.2;
    }
    this.x += weather.wind * 0.8; // breeze pushes bees sideways
    this.x = constrain(this.x, 8, width - 8);
    this.y = constrain(this.y, 20, soil.y - 8);
    if (abs(this.x - this.prevX) > 0.2) this.facing = this.x > this.prevX ? 1 : -1;
    this.prevX = this.x;
  }

  pickFlower() {
    let flowers = plants.filter(p => p.stage === 'flower' && p.isAlive);
    if (flowers.length === 0) return null;
    let candidates = flowers.filter(f => f !== this.lastFlower);
    if (candidates.length === 0) candidates = flowers;

    if (this.holdPollen > 0) {
      // carrying pollen: look for a different flower that still needs it
      let needy = candidates.filter(f => !f.isPollinated && f !== this.pollenSource);
      if (needy.length > 0) candidates = needy;
    } else {
      let stocked = candidates.filter(f => f.pollenAmount > 0);
      if (stocked.length > 0) candidates = stocked;
    }
    return random(candidates);
  }

  visit(flower) {
    // eat(): bees eat pollen up to their food cap
    if (this.foodLevel < this.maxFood && flower.pollenAmount > 0) {
      flower.pollenAmount--;
      this.foodLevel = min(this.maxFood, this.foodLevel + 35);
    }
    // pollinateTransport(): hand carried pollen to a different flower
    if (this.holdPollen > 0 && flower !== this.pollenSource && !flower.isPollinated) {
      flower.pollinateReceive();
      this.holdPollen--;
    }
    // pick up whatever pollen is left, up to maxPollen
    if (this.holdPollen < this.maxPollen && flower.pollenAmount > 0) {
      flower.pollenAmount--;
      this.holdPollen++;
      this.pollenSource = flower;
    }
    this.lastFlower = flower;
    this.target = null;
    this.visitTimer = 45;
  }

  reproduce() {
    if (this.foodLevel >= 90 && this.reproCooldown <= 0 && bees.length < 40) {
      bees.push(new Bee(this.x, this.y));
      this.foodLevel -= 40;
      this.reproCooldown = 900;
    }
  }

  show() {
    push();
    translate(this.x, this.y);
    if (this.isGrounded) {
      drawSpiral(0, 0, 9, 110); // gray spiral = can't fly
    } else {
      // yellow circle + black circle side by side, facing the way it flies
      push();
      scale(this.facing, 1);
      stroke(200, 150, 0);
      strokeWeight(1.5);
      fill(255, 215, 40);
      circle(-3, 0, 14);
      stroke(0);
      strokeWeight(1);
      fill(30);
      circle(6, 0, 9);
      pop();
    }
    // carried pollen
    stroke(210, 190, 80);
    strokeWeight(0.5);
    fill(255, 245, 150);
    for (let i = 0; i < this.holdPollen; i++) rect(-5 + i * 5, 10, 4, 4);
    pop();
  }
}

// ---------- APHID ----------
class Aphid {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.isAlive = true;
    this.life = 0;
    this.foodLevel = 20; // no max: aphids never stop eating
    this.starve = 0;
    this.target = null;
    this.retarget = 0;
    this.isGrounded = false;
  }

  age() {
    this.life++;
    this.starve++;
    if (this.starve > 900 || this.life > 5000) this.isAlive = false;
    // rain washes some aphids away, strong gusts blow a few off
    if (weather.state === 'rain' && random() < 0.001) this.isAlive = false;
    if (weather.isGusty() && random() < 0.0005) this.isAlive = false;
  }

  mobileCrawl() {
    this.isGrounded = weather.state === 'rain'; // rain pins them down
    if (this.isGrounded) return;

    this.retarget--;
    if (!this.target || !this.target.isAlive || this.retarget <= 0) {
      this.target = this.pickPlant();
      this.retarget = 120;
    }

    if (this.target) {
      let tx = this.target.x;
      let ty = this.target.y - this.target.size * 0.4;
      let d = dist(this.x, this.y, tx, ty);
      if (d > 5) {
        this.x += (tx - this.x) / d * 0.6;
        this.y += (ty - this.y) / d * 0.6;
      } else {
        this.eat(this.target);
      }
    } else {
      this.x = constrain(this.x + random(-0.6, 0.6), 5, width - 5);
      this.y = soil.y - 2;
    }
  }

  pickPlant() {
    let best = null;
    let bestD = Infinity;
    for (let p of plants) {
      let d = dist(this.x, this.y, p.x, p.y);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best;
  }

  eat(plant) {
    plant.size -= 0.035;
    this.foodLevel += 0.15;
    this.starve = 0;
    if (plant.size < 3) plant.isAlive = false;
  }

  reproduce() {
    // colonies only grow while there are enough plants to feed them (about 2 aphids per plant)
    if (this.foodLevel >= 100 && aphids.length < min(60, plants.length * 2)) {
      aphids.push(new Aphid(this.x + random(-3, 3), this.y));
      this.foodLevel -= 60;
    }
  }

  show() {
    noStroke();
    fill(220, 30, 30); // red = danger
    circle(this.x, this.y, 6);
  }
}

// ---------- WEATHER (indirect control) ----------
class Weather {
  constructor() {
    this.state = 'sun'; // sun, cloud, rain
    this.timer = 0;
    this.duration = 900; // first sunny stretch is long
    this.wind = 0;      // -1 (blowing left) to 1 (blowing right)
    this.drops = [];
    this.streaks = [];
  }

  isSunny() { return this.state === 'sun'; }
  isGusty() { return abs(this.wind) > 0.8; }

  update() {
    this.timer++;
    if (this.timer > this.duration) this.changeSun();

    this.changeWind();

    if (this.state === 'rain') {
      soil.addWater(random(0.15, 0.35)); // addWater(): random, unbounded source
      if (frameCount % 2 === 0) this.drops.push({ x: random(width), y: 0, v: random(6, 10) });
    }
    for (let d of this.drops) { d.y += d.v; d.x += this.wind * 1.5; }
    this.drops = this.drops.filter(d => d.y < soil.y);

    // wind streaks (visual)
    if (abs(this.wind) > 0.15 && random() < abs(this.wind) * 0.3) {
      this.streaks.push({
        x: this.wind > 0 ? 0 : width,
        y: random(40, soil.y - 20),
        len: random(20, 45)
      });
    }
    for (let s of this.streaks) s.x += this.wind * 6;
    this.streaks = this.streaks.filter(s => s.x > -60 && s.x < width + 60);
  }

  // sunny most of the time: 60% sun, 20% cloud, 20% rain
  changeSun() {
    let r = random();
    this.state = r < 0.6 ? 'sun' : r < 0.8 ? 'cloud' : 'rain';
    this.duration = this.state === 'sun' ? 700 : 400;
    this.timer = 0;
  }

  // wind drifts smoothly with noise; occasional strong gusts
  changeWind() {
    this.wind = constrain(map(noise(frameCount * 0.004), 0, 1, -1.6, 1.6), -1, 1);
  }

  splash(x, y) {
    // drops pour out of the watering can spout
    for (let i = 0; i < 8; i++) {
      this.drops.push({ x: x + random(-4, 4), y: y + random(0, 30), v: random(5, 8) });
    }
  }

  show() {
    noStroke();
    if (this.state === 'sun') fill(255, 220, 0, 30);
    else fill(110, 110, 120, 70);
    rect(0, 0, width, height);

    stroke(255, 255, 255, 170);
    strokeWeight(2);
    for (let s of this.streaks) line(s.x, s.y, s.x - Math.sign(this.wind) * s.len, s.y);

    stroke(40, 100, 220);
    strokeWeight(2);
    for (let d of this.drops) line(d.x, d.y, d.x - this.wind * 4, d.y + 10);
  }
}

// ---------- HUD + KEY ----------
function drawHUD() {
  noStroke();
  fill(0, 150);
  rect(8, 8, 230, 140, 6);
  fill(255);
  textSize(13);
  textAlign(LEFT, TOP);
  let names = { 1: 'Seed bag', 2: 'Watering can', 3: 'Remove plant', 4: 'Bug spray' };
  let w = abs(weather.wind);
  let windLabel = w < 0.25 ? 'calm' : w < 0.8 ? 'breezy' : 'gusty';
  let windDir = w < 0.25 ? '' : (weather.wind > 0 ? ' (right)' : ' (left)');
  text('Tool: ' + names[mode] + '  (keys 1-4)', 18, 16);
  text('Weather: ' + weather.state, 18, 36);
  text('Wind: ' + windLabel + windDir, 18, 56);
  text('Soil water: ' + nf(soil.waterLevel, 1, 0) + ' / ' + soil.maxWater, 18, 76);
  text('Plants: ' + plants.length + '  Seeds: ' + seeds.length, 18, 96);
  text('Bees: ' + bees.length + '  Aphids: ' + aphids.length, 18, 116);
}

function drawKey() {
  let x = width - 190;
  let y = 8;
  noStroke();
  fill(0, 150);
  rect(x, y, 182, 140, 6);

  textSize(13);
  textAlign(LEFT, CENTER);
  let rowY = y + 22;
  let step = 25;

  // bee
  stroke(200, 150, 0); strokeWeight(1.5); fill(255, 215, 40);
  circle(x + 17, rowY, 14);
  stroke(0); strokeWeight(1); fill(30);
  circle(x + 26, rowY, 9);
  noStroke(); fill(255); text('Bee', x + 44, rowY);

  // grounded bee
  rowY += step;
  drawSpiral(x + 22, rowY, 9, 170);
  noStroke(); fill(255); text('Bee (grounded)', x + 44, rowY);

  // aphid
  rowY += step;
  noStroke(); fill(220, 30, 30); circle(x + 20, rowY, 8);
  fill(255); text('Aphid', x + 40, rowY);

  // pollen
  rowY += step;
  stroke(210, 190, 80); strokeWeight(0.5); fill(255, 245, 150);
  rect(x + 16, rowY - 4, 8, 8);
  noStroke(); fill(255); text('Pollen', x + 40, rowY);

  // seed
  rowY += step;
  push();
  translate(x + 20, rowY);
  rotate(PI / 8);
  rectMode(CENTER);
  stroke(180, 80, 20); strokeWeight(1); fill(240, 130, 40);
  rect(0, 0, 10, 10);
  pop();
  noStroke(); fill(255); text('Seed', x + 40, rowY);
}

// small spiral used for grounded bees (and the key)
function drawSpiral(cx, cy, maxR, gray) {
  noFill();
  stroke(gray);
  strokeWeight(1.5);
  beginShape();
  let turns = TWO_PI * 2.5;
  for (let t = 0; t <= turns; t += 0.3) {
    let r = map(t, 0, turns, 1, maxR);
    vertex(cx + cos(t) * r, cy + sin(t) * r);
  }
  endShape();
}
