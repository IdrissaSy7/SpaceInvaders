// Constantes qui selectionne l'element canvas et obtient
// son contexte en 2D qui permet de dessiner des formes
const scoreEl = document.querySelector("#scoreEl");
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

// Définit largeur et hauteur du canvas pour correspondre
// a la taille du navigateur
canvas.width = 600;
canvas.height = window.innerHeight;

// Création des étoiles
let stars = [];
const NUM_STARS = 30;
for (let i = 0; i < NUM_STARS; i++) {
  let x = Math.random() * canvas.width;
  let y = Math.random() * canvas.height;
  let size = Math.random() * 3;
  let speed = Math.random() * 3 + 1;
  stars.push({ x, y, size, speed });
}

// Fonction de dessin des étoiles
function drawStars() {
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = "white";
  stars.forEach((star) => {
    c.beginPath();
    c.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    c.fill();
    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = 0;
    }
  });
  requestAnimationFrame(drawStars);
}

drawStars();

// Création de la classe player

class Player {
  constructor() {
    // Vitesse
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.rotation = 0;
    this.opacity = 1;

    // Constante image qui permet d'importer sa propre image
    const image = new Image();
    image.src = "./img/spaceship.png";

    // Une fois l'image chargée définit largeur, hauteur et position
    // Scale permet de modifier la taille du player
    image.onload = () => {
      const scale = 0.15;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 30,
      };
      // ajouter une propriété indiquant que l'image est prête
      this.ready = true;
    };

    // initialiser la propriété à false
    this.ready = false;
  }

  // Dessiner le vaisseau sur le canvas avec les propriétes du dessus
  draw() {
    // Vérifier que l'image est prête et que la position est définie
    if (this.ready && this.position) {
      c.save();
      c.globalAlpha = this.opacity;
      c.translate(
        player.position.x + player.width / 2,
        player.position.y + player.height / 2
      );

      c.rotate(this.rotation);

      c.translate(
        -player.position.x - player.width / 2,
        -player.position.y - player.height / 2
      );

      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );

      c.restore();
    }
  }

  update() {
    // Vérifier que l'image est prête et que la position est définie
    if (this.ready && this.position) {
      this.draw();
      this.position.x += this.velocity.x;
    }
  }
}

class Invader {
  constructor({ position }) {
    // Vitesse
    this.velocity = {
      x: 0,
      y: 0,
    };

    // Constante image qui permet d'importer sa propre image
    const image = new Image();
    image.src = "./img/invader.png";

    // Une fois l'image chargée définit largeur, hauteur et position
    // Scale permet de modifier la taille du player
    image.onload = () => {
      const scale = 0.045;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: position.x,
        y: position.y,
      };
      // ajouter une propriété indiquant que l'image est prête
      this.ready = true;
    };

    // initialiser la propriété à false
    this.ready = false;
  }

  // Dessiner le vaisseau sur le canvas avec les propriétes du dessus
  draw() {
    // Vérifier que l'image est prête et que la position est définie
    if (this.ready && this.position) {
      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }
  }

  update({ velocity }) {
    // Vérifier que l'image est prête et que la position est définie
    if (this.ready && this.position) {
      this.draw();
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }

  shoot(invaderProjectiles) {
    invaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },

        velocity: {
          x: 0,
          y: 7,
        },
      })
    );
  }
}

class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };

    this.velocity = {
      x: 3,
      y: 0,
    };

    this.invaders = [];

    const columns = Math.floor(Math.random() * 10 + 5);
    const rows = Math.floor(Math.random() * 5 + 2);

    this.width = columns * 30;

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        this.invaders.push(
          new Invader({
            position: {
              x: x * 30,
              y: y * 30,
            },
          })
        );
      }
    }
    console.log(this.invaders);
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.y = 0;

    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 30;
    }
  }
}

class projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = 4;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "red";
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 3;
    this.height = 10;
  }

  draw() {
    c.fillStyle = "yellow";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

// Initialise le player
const player = new Player();

const projectiles = [];

const grids = [];

const invaderProjectiles = [];

const keys = {
  q: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  space: {
    pressed: false,
  },
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);
let game = {
  over: false,
  active: true,
};

let score = 0;

console.log(randomInterval);

// Fonction animate en boucle qui affiche le vaisseau
// Dessine un rectangle noir sur tout le canvas
function animate() {
  if (!game.active) return;
  requestAnimationFrame(animate);
  player.update();

  invaderProjectiles.forEach((invaderProjectile, index) => {
    if (
      invaderProjectile.position.y + invaderProjectile.height >=
      canvas.height
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
      }, 0);
    } else {
      invaderProjectile.update();
    }

    if (
      invaderProjectile.position.y + invaderProjectile.height >=
        player.position.y &&
      invaderProjectile.position.x + invaderProjectile.width >=
        player.position.x &&
      invaderProjectile.position.x <= player.position.x + player.width
    ) {
      console.log("perdu");

      setTimeout(() => {
        player.opacity = 0;
        game.over = true;
      }, 0);

      setTimeout(() => {
        game.active = false;
      }, 800);
    }
  });

  projectiles.forEach((projectile, index) => {
    if (projectile.position.y + projectile.radius <= 0) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    } else {
      projectile.update();
    }
  });

  grids.forEach((grid, gridIndex) => {
    grid.update();

    // Apparition des projectiles
    if (frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
        invaderProjectiles
      );
    }

    let enemiesToRemove = [];
    let projectilesToRemove = [];

    grid.invaders.forEach((invader, i) => {
      invader.update({ velocity: grid.velocity });

      // Tirs ennemis
      projectiles.forEach((projectile, j) => {
        if (
          projectile.position.y - projectile.radius <=
            invader.position.y + invader.height &&
          projectile.position.x + projectile.radius >= invader.position.x &&
          projectile.position.x - projectile.radius <=
            invader.position.x + invader.width &&
          projectile.position.y + projectile.radius >= invader.position.y
        ) {
          enemiesToRemove.push(i);
          projectilesToRemove.push(j);
        }
      });
    });

    enemiesToRemove.forEach((index) => {
      grid.invaders.splice(index, 1);
      score += 100;
      scoreEl.innerHTML = score;
    });

    projectilesToRemove.forEach((index) => {
      projectiles.splice(index, 1);
    });

    if (grid.invaders.length > 0) {
      const firstInvader = grid.invaders[0];
      const lastInvaders = grid.invaders[grid.invaders.length - 1];

      grid.width =
        lastInvaders.position.x - firstInvader.position.x + lastInvaders.width;
      grid.position.x = firstInvader.position.x;
    } else {
      grids.splice(gridIndex, 1);
    }
  });

  if (keys.q.pressed && player.position.x >= 0) {
    player.velocity.x = -8;
    player.rotation = -0.1;
  } else if (
    keys.d.pressed &&
    player.position.x + player.width < canvas.width
  ) {
    player.velocity.x = 8;
    player.rotation = 0.1;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }

  // Apparition de nouveau monstres
  if (frames % randomInterval === 0) {
    grids.push(new Grid());
    randomInterval = Math.floor(Math.random() * 500 + 500);
    frames = 0;
    console.log(randomInterval);
  }

  frames++;
  // console.log(frames);
}

animate();

// Mouvement du joueur
addEventListener("keydown", ({ key }) => {
  if (game.over) return;

  switch (key) {
    case "q":
      // console.log("left");
      player.velocity.x = -5;
      keys.q.pressed = true;
      break;
    case "d":
      // console.log("right");
      keys.d.pressed = true;

      break;
    case " ":
      // console.log("space");
      projectiles.push(
        new projectile({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y,
          },
          velocity: {
            x: 0,
            y: -10,
          },
        })
      );
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "q":
      // console.log("left");
      // player.velocity.x = -5;
      keys.q.pressed = false;
      break;
    case "d":
      // console.log("right");
      keys.d.pressed = false;

      break;
    case " ":
      // console.log("space");
      break;
  }
});
