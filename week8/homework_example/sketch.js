let pColor

function setup() {
    createCanvas(800, 600);
    colorMode(HSB, TWO_PI, 1, 1, 1)

    pColor = color(0, 0.8, 0.8)

    setInterval(colorChange, 2000)
}

function draw() {
    background(0);

    push()
    translate(width*0.5, 0)
    
    rotate(cos (millis() * 0.00314) * 0.5) //using 314 makes it sync with the color change 
    stroke(pColor)
    line(0, 0, 0, 200)
    fill(pColor)
    circle(0, 200, 50)
    pop()
}

function colorChange(){
    pColor = color(random(TWO_PI), 0.8, 0.8)


}