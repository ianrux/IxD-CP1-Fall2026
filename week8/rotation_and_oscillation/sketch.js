
let angle = 0.01
function setup() {
    createCanvas(800, 600)
}

function draw() {
    background(220)
    
    push() //creates temporary memory for transforamtions and drawing styles
    translate(width*0.5, height*0.5) //Now at center of the screen but redraws grid rom here and not just roates from here AudioListener.
    
    //rotate(QUARTER_PI) //since angles are measured in radiants for p5 not degrees, quarter pi would be what we observe as 45 degrees
    //createGrid(10)
    
    rotate(sin(millis()*0.1) * 0.05) //since millisecond scales very fast multiplying by a hundreth to scale the rate down of implemenations. When adding sin it begins to oscilalte like a sin wave form.
    rect(-100, -75, 200, 150)
    pop()

    //angle += 0.01 //increase angles by 0.01 each frame? Called bac angle from line 2. Helps to check in intervals of 10 as well.
}


        // for(where it starts, whats going to happen, iterations?)
function createGrid(gridResolution = 10){
    for(let i = -gridResolution*0.5; i <= gridResolution*0.5; i++){
        let x = i * width/gridResolution //so when x is 0 still 0 but when x is 1 line will be drawn at 80, then 160, etc
        stroke(0)
        line(x, -height*0.5, x, height*0.5)
    }
    for(let i = -gridResolution*0.5; i <= gridResolution*0.5; i++){
        let y = i * height/gridResolution
        stroke(0)
        line(-width*0.5, y, width*0.5, y)

    }
}
