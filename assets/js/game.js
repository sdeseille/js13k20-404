let { init, GameLoop, Text, Grid, initKeys, keyPressed } = kontra

let { canvas,context } = init('game');

let flak_gun;
let flak_gun_base;
let flak_gun_cannon;
let numberOfTicks = 0;

kontra.initKeys();

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

let flak_gun_cannon_img = new Image();
flak_gun_cannon_img.src = 'assets/images/british_flak_gun_v2-cannon.png';

flak_gun_cannon_img.onload = function() {
  flak_gun_cannon = kontra.Sprite({
    x: 50,
    y: canvas.height - 65,
    anchor: {x: 0.25, y: 0.75},
    dt: 0,  // track how much time has passed
    rotation: 0,
    // required for an image sprite
    image: flak_gun_cannon_img,
    update (){
      if (keyPressed('left') && this.rotation >= -0.8){
        this.rotation += kontra.degToRad(-1);
        console.log('Current rotation: ' + this.rotation + 'keyPressed Left');
      } else if (keyPressed('right') && this.rotation <= 0.8){
        this.rotation += kontra.degToRad(1);
        console.log('Current rotation: ' + this.rotation + 'keyPressed Right');
      } else {
        // have to adjust angle because the sprite already have an angle
        const cos = Math.cos(this.rotation - kontra.degToRad(45));
        const sin = Math.sin(this.rotation - kontra.degToRad(45));
        this.ddx = this.ddy = 0;

        // allow the player to fire no more than 1 bullet every 1/4 second
        this.dt += 1/60;
        if (keyPressed('space') && this.dt > 0.25) {
          this.dt = 0;      
          let bullet = kontra.Sprite({
            color: 'white',        // start the bullet at the end of the cannon
            x: this.x + cos * 12,
            y: this.y + sin * 12,
            dx: this.dx + cos * 5,
            dy: this.dy + sin * 5,
            ttl: 150,     // live only 150 frames
            radius: 2,    // bullets are small
            width: 2,
            height: 2
          });
          sprites.push(bullet);
        }
      }
    }
  });
};

let flak_gun_base_img = new Image();
flak_gun_base_img.src = 'assets/images/british_flak_gun_v2-base.png';

flak_gun_base_img.onload = function() {
  flak_gun_base = kontra.Sprite({
    x: 50,
    y: canvas.height - 60,
    anchor: {x: 0.5, y: 0.5},

    // required for an image sprite
    image: flak_gun_base_img
  });
};

let sprites = [];
function createEAircraft() {
  let e_aircraft = kontra.Sprite({
    type: 'e_aircraft',  // we'll use this for collision detection
    x: 100,
    y: 100,
    dx: Math.random() * 4 - 2,
    radius: 4,
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



let loop = GameLoop({  // create the main game loop
  update: function() { // update the game state
    flak_gun_cannon.update();
    sprites.map(sprite => {
      if (sprite.type === 'e_aircraft') {
        console.log("sprite = e_aircraft");
        sprite.y = 100 + ( 50 * Math.sin((sprite.x + sprite.dx * Math.PI)/40) );
        console.log("sprite.y:" + sprite.y);
      }
      sprite.update();

      // aircraft is beyond the left edge
      if (sprite.x < -sprite.radius) {
        sprite.x = canvas.width + sprite.radius;
      }
      // aircraft is beyond the right edge
      else if (sprite.x > canvas.width + sprite.radius) {
        sprite.x = 0 - sprite.radius;
      }
    });

    // collision detection
    for (let i = 0; i < sprites.length; i++) {    // only check for collision against e_aircraft
      if (sprites[i].type === 'e_aircraft') {
        for (let j = 0; j < sprites.length; j++) {        // don't check e_aircraft vs. e_aircraft collisions
          if (sprites[j].type !== 'e_aircraft') {
            let aircraft = sprites[i];
            let sprite = sprites[j];          // circle vs. circle collision detection
            let dx = aircraft.x - sprite.x;
            let dy = aircraft.y - sprite.y;          
            if (Math.hypot(dx, dy) < aircraft.radius + sprite.radius) {
              aircraft.ttl = 0;
              sprite.ttl = 0;
              break;
            }
          }
        }
      }
    }

    sprites = sprites.filter(sprite => sprite.isAlive());
  },
  render: function() { // render the game state
    ground.render();
    sky.render();
    flak_gun_base.render();
    flak_gun_cannon.render();
    sprites.map(sprite => sprite.render());
  }
});

loop.start();    // start the game