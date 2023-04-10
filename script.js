// Constantes
const replay = document.querySelector("#replaygame");
const gameover = document.querySelector("#gameover");
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

// Variables
let currentscore = document.querySelector("#currentscore");
let bestscore = document.querySelector("#bestscore");
let bestScore = localStorage.getItem("BestScore");
let score = 0;

// Si le meilleur score n'a jamais été enregistré, initialise-le à 0
if (!bestScore) {
  bestScore = 0;
}

// Affiche le meilleur score si il y en a un
bestscore.innerHTML = `${bestScore}`;

// Supprimer les scores
window.addEventListener("load", (e) => {
  deletescore.onclick = function () {
    localStorage.clear();
    bestscore.innerHTML = "0";
  };
});

// Rejouer
window.addEventListener("load", (e) => {
  replay.onclick = function () {
    location.reload(true);
  };
});

// Définit largeur et hauteur du canvas pour correspondre a la taille du navigateur
canvas.width = 1024;
canvas.height = 576;

// Création des étoiles
let stars = [];
const NUM_STARS = 50;
for (let i = 0; i < NUM_STARS; i++) {
  let x = Math.random() * canvas.width;
  let y = Math.random() * canvas.height;
  let size = Math.random() * 3;
  let speed = Math.random() * 10 + 1;
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
      // Ajoute une propriété indiquant que l'image est prête (évite bug)
      this.ready = true;
    };

    // Initialise la propriété à false (évite bug)
    this.ready = false;
  }

  // Dessine le vaisseau sur le canvas avec les propriétes du dessus
  draw() {
    // Vérifie que l'image est prête et que la position est définie (évite bug)
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
    // Vérifie que l'image est prête et que la position est définie (évite bug)
    if (this.ready && this.position) {
      this.draw();
      this.position.x += this.velocity.x;
    }
  }
}

// Crée la classe envahisseur
class Invader {
  constructor({ position }) {
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
      this.ready = true;
    };

    this.ready = false;
  }

  // Dessiner le vaisseau sur le canvas avec les propriétes du dessus
  draw() {
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
          y: 7, // Vitesse tir ennemi
        },
      })
    );
  }
}

// Crée la grille d'ennemi
class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };

    this.velocity = {
      x: 8, // Vitesse deplacement ennemi
      y: 0,
    };

    this.invaders = [];

    // Rangée d'ennemis (aléatoire)
    const columns = Math.floor(Math.random() * 10 + 5);
    const rows = Math.floor(Math.random() * 5 + 2);

    this.width = columns * 30;

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        this.invaders.push(
          new Invader({
            position: {
              x: x * 35,
              y: y * 30,
            },
          })
        );
      }
    }
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

function Niveau(nom, columns, rows, vitesse) {
  this.nom = nom;
  this.columns = columns;
  this.rows = rows;
  this.vitesse = vitesse;

  this.position = {
    x: 0,
    y: 0,
  };

  this.velocity = {
    x: vitesse, // Vitesse avancement ennemi
    y: 0,
  };

  this.invaders = [];

  this.width = columns * 30;

  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      this.invaders.push(
        new Invader({
          position: {
            x: x * 35,
            y: y * 30,
          },
        })
      );
    }
  }

  this.update = function () {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.y = 0;

    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 30;
    }
  };
}

// Tirs du joueur
class projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 4; // Taille du tir joueur
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

// Tirs ennemis
class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 4;
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

// Constantes
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

// Variables
let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);
let game = {
  over: false,
  active: true,
};

// Fonction animate en boucle qui affiche le vaisseau
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

    // Si le joueur se fait toucher (et que la partie prend fin)
    if (
      invaderProjectile.position.y + invaderProjectile.height >=
        player.position.y &&
      invaderProjectile.position.x + invaderProjectile.width >=
        player.position.x &&
      invaderProjectile.position.x <= player.position.x + player.width
    ) {
      // Opacité du joueur à 0
      setTimeout(() => {
        player.opacity = 0;
        game.over = true;
      }, 0);

      // Fin de la partie 800ms après
      setTimeout(() => {
        game.active = false;
      }, 800);

      // Affiche le texte suivant
      gameover.innerHTML = "Game Over";

      // Bouton replay
      replay.innerHTML = `<p class="replay">Rejouer</p>`;

      // Stocke le score actuel et le meilleur score
      localStorage.setItem("Score", currentscore.innerText);

      // Met à jour le meilleur score si le score actuel est supérieur
      if (+currentscore.innerText > +bestScore) {
        localStorage.setItem("BestScore", currentscore.innerText);
        console.log("meilleur score");
      }
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
    // Un tir tout les 1s/100 frames
    // Difficulté variable
    if (frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
        invaderProjectiles
      );
    }

    console.log(frames);

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

    // Score
    enemiesToRemove.forEach((index) => {
      grid.invaders.splice(index, 1);
      score += 100;
      currentscore.innerHTML = score;
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

  // Déplacement du joueur (vitesse et rotation)
  // Q et D sont les touches utilisées
  if (keys.q.pressed && player.position.x >= 0) {
    player.velocity.x = -13; // Vitesse déplacement joueur
    player.rotation = -0.2;
  } else if (
    keys.d.pressed &&
    player.position.x + player.width < canvas.width
  ) {
    player.velocity.x = 13; // Vitesse déplacement joueur
    player.rotation = 0.2;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }

  // Apparition de nouveau monstres
  if (frames % randomInterval === 0) {
    grids.push(new Grid());
    randomInterval = Math.floor(Math.random() * 500 + 500);
    frames = 0;
  }

  frames++;
}

animate();

// Commandes du joueur
addEventListener("keydown", ({ key }) => {
  if (game.over) return;

  switch (key) {
    // Mouvement à gauche
    case "q":
      keys.q.pressed = true;
      break;
    // Mouvement à droite
    case "d":
      keys.d.pressed = true;
      break;
    // Tirs
    case " ":
      projectiles.push(
        new projectile({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y,
          },
          velocity: {
            x: 0,
            y: -10, // Vitesse du tir du joueur
          },
        })
      );
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "q":
      keys.q.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;

      break;
    case " ":
      break;
  }
});
