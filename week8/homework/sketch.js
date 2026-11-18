let gridRes = 5


function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100, 100) 
  let blendModes = [
    BLEND,
    ADD,
    DARKEST,
    LIGHTEST,
    EXCLUSION,
    MULTIPLY,
    SCREEN,
    REPLACE,
    REMOVE,
    DIFFERENCE,  //2D only
    OVERLAY,     //2D only
    HARD_LIGHT,  //2D only
    SOFT_LIGHT,  //2D only
    DODGE,       //2D only
    BURN,        //2D only
    SUBTRACT     //2D only
  ]
  blendMode(blendModes[1])
  
  background(8)
  
    for(let i = 0; i <= gridRes; i++){
      let x = i * width/gridRes
      let rightX = (i+1)*width/gridRes
      
      line(x, 0, x, height)
      for(let j = 0; j <= gridRes; j++){
        let y = j * height/gridRes
        let bottomY = (j+1) * height/gridRes
        line(x, y, rightX, y)
        // done wih the grid
  
        fill(270, 100/(i+1), 80)
        rect(x+20, y+10, 30*(j+1), 20*(j+.5))
        
        fill(360/(j+1), 80, 80, 80)
        circle(x + (width/gridRes)*0.5, y + (height/gridRes)*0.5, 30*(i+0.4))
  
        fill(random(360), random(100), random(100))
        triangle(random(x, rightX), random(y, bottomY), random(x, rightX), random(y, bottomY),random(x, rightX), random(y, bottomY))

    }
  }
}