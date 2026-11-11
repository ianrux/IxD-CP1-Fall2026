let numRings = 10;
let radius;
let strWeight = 20;

function setup() {
    createCanvas(800, 800)

    colorMode(HSB, TWO_PI, 1, 1, 1)

    radius = width * 0.1
    strokeCap(SQUARE) // the end of the lines, how they appear rounded, squared etc.
}

function draw() {
    background(0);

    noFill()
    strokeWeight(strWeight)
         
    //for( let i begin at 0 long as i is less than the number of rings and add 1?)
    for(let i = 0; i < numRings; i++){
        let thisDiam = radius*2 + (i*strWeight*2);
        stroke((TWO_PI/numRings)*i, 0.8, 0.8)
        
        push()
        translate(width*0.5, height*0.5)
        rotate( sin( millis()*0.001) * (i * 0.1 + 1)) // have plus 1 so when its 0 still have movement on the inner most string
        arc(0, 0, thisDiam, thisDiam, PI*0.75, TWO_PI+QUARTER_PI)
        pop()

    }
 
}
 