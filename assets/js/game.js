let { init, GameLoop, Text, Grid } = kontra

let { canvas,context } = init('game');

let flak_gun;

let sky = kontra.Sprite({
  type: 'sky',
  render(){
    var gradient = this.context.createLinearGradient(0,0,0,200);
    gradient.addColorStop(0,"blue");
    gradient.addColorStop(0.5,"white");
    gradient.addColorStop(1,"darkblue");
    this.context.fillStyle = gradient;
    this.context.fillRect(0,0,canvas.width,canvas.height-50);
  }
})

let ground = kontra.Sprite({
  type: 'ground',
  render() {
    this.context.fillStyle = 'forestgreen';
    this.context.fillRect(0, canvas.height, canvas.width, -50);
  }
});

let flak_gun_img = new Image();
flak_gun_img.src = 'assets/images/british_flak_gun_minis.png';

flak_gun_img.onload = function() {
  flak_gun = kontra.Sprite({
    x: 50,
    y: canvas.height - 70,
    anchor: {x: 0.5, y: 0.5},

    // required for an image sprite
    image: flak_gun_img
  });
};

let sprites = [];
function createEAircraft() {
  let e_aircraft = kontra.Sprite({
    type: 'e_aircraft',  // we'll use this for collision detection
    x: 100,
    y: 100,
    dx: Math.random() * 4 - 2,
    radius: 6,
    render() {
      //console.log(Math.sign(this.dx));
      if (Math.sign(this.dx) < 0){
        // draw a left-facing triangle
        this.context.strokeStyle = 'white';
        this.context.fillStyle = 'red';
        this.context.beginPath();
        this.context.moveTo(-3, -5);
        this.context.lineTo(12, -10);
        this.context.lineTo(12, 0);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
      }
      else{
        // draw a right-facing triangle
        this.context.strokeStyle = 'white';
        this.context.fillStyle = 'navy';
        this.context.beginPath();
        this.context.moveTo(-3, -5);
        this.context.lineTo(12, 0);
        this.context.lineTo(-3, 5);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
      }
    }
  });
  sprites.push(e_aircraft);
}

for (let i = 0; i < 4; i++) {
  createEAircraft();
}


// let sprite = Sprite({
//   x: 100,        // starting x,y position of the sprite
//   y: 80,
//   color: 'gray',  // fill color of the sprite rectangle
//   width: 40,     // width and height of the sprite rectangle
//   height: 20,
//   dx: 0.5          // move the sprite 2px to the right every frame
// });



let loop = GameLoop({  // create the main game loop
  update: function() { // update the game state
    sprites.map(sprite => {
      sprite.update();
      // asteroid is beyond the left edge
      if (sprite.x < -sprite.radius) {
        sprite.x = canvas.width + sprite.radius;
      }
      // sprite is beyond the right edge
      else if (sprite.x > canvas.width + sprite.radius) {
        sprite.x = 0 - sprite.radius;
      }
    });

  },
  render: function() { // render the game state
    ground.render();
    sky.render();
    flak_gun.render();
    sprites.map(sprite => sprite.render());
  }
});

loop.start();    // start the game