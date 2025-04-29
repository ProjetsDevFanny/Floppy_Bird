const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d"); //  On lui donne un contexte en 2D:

// canvas.style.border = "1px solid #000"; // Visualisation des limites pour débugger visuellement

// --------------------------------------------------------------
// Chargement des images
// Méthode 1 = découpe dans GIMP (pour bird)
const birdDown = new Image();
birdDown.src = "./media/bird_down.png";

const birdMiddle = new Image();
birdMiddle.src = "./media/bird_middle.png";

const birdUp = new Image();
birdUp.src = "./media/bird_up.png";

// Méthode2 = spritesheet (Pour bg et pipes )
const sprite = new Image();
sprite.src = "./media/flappy-bird-set.png";
// -------------------------------------------------------------------

// BIRD
// BATTEMENT AILES DE L'OISEAU = 3 images de l'oiseau mises dans un tableau
const birdSprites = [birdUp, birdMiddle, birdDown];
let birdFrame = 0; // index de l'image actuelle (0, 1 ou 2)

// Position fixe de l'oiseau au départ
let birdX = -90; // position X initiale de l'oiseau

let birdY = 100; // position Y initiale de l'oiseau
let frameCount = 0; // Pour animation des battements d'aile de l'oiseau

// Mouvement de rebond de l'oiseau et gravité
let velocity = 0;
let gravity = 0;
let jump = -8;
let gameStartedClick = false;
let gameStartedArrowUp = false;

// COMMENCEMENT DU JEU QUAND ON PRESS SUR LA FLECHE HAUT DU CLAVIER
document.addEventListener("keydown", function (event) {
  if (gameOver) return; // Ne rien faire si le jeu est fini

  if (!gameStartedArrowUp) {
    gameStartedArrowUp = true; // Le jeu démarre à la première touche
  }
  if (event.key === "ArrowUp") {
    velocity = jump; // l'oiseau saute vers le haut
    gravity = 0.5; // on applique ensuite la gravité
  } else if (event.key === "ArrowDown") {
    velocity = -(-2); // l'oiseau tombe
    gravity = 0.5;
  }
});

// Taille du bird
const birdWidth = 42; // Largeur de la hitbox de l'oiseau
const birdHeight = 30; // Hauteur de la hitbox de l'oiseau

// BACKGROUND
// Pour faire défiler le fond
let bgX = 0; // position du fond
const vitesseBg = 2; // Vitesse de défilement du fond
const bgWidth = 550; // Largeur du fond (image d'arrière-plan)
const canvasWidth = canvas.width; // Largeur du canvas (écran)

// PIPES
// Contrôle de la position verticale aléatoire entre 2 tuyaux
const pipeGap = 250; //  Espace entre les tuyaux haut et bas
const totalPipeHeight = 800 + pipeGap + 100; // hauteur pipe haut + gap + pipe bas
const minVisibleY = 0; // bord supérieur du canvas
const maxVisibleY = canvas.height;
// Valeurs limites pour l'offset vertical
const maxOffsetY = minVisibleY;
const minOffsetY = maxVisibleY - totalPipeHeight;

// Valeurs constantes
const pipeWidthUp = 72; // Largeur Pipe Up
const pipeWidthDown = 600; // Largeur du Pipe Down
const pipeSpacing = 400; // Espace horizontal entre 2 groupes
const pipeSpeed = 3; // vitesse de déplacement des pipes
const maxPipeWidth = Math.max(pipeWidthDown, pipeWidthUp); // Largeur maximale des tuyaux pour le recyclage

// Création initiale des 3 groupes de tuyaux avec offsetY aléatoire (espacement aléatoire entre pipeUp et pipeDown)
// pipeGroups est un tableau d'objets, et chaque objet représente un groupe de tuyaux (haut + bas).
// Chaque objet a une propriété x, qui indique où il se trouve sur l'axe horizontal.
const pipeGroups = [
  { x: canvas.width, offsetY: getRandomOffsetY() },
  { x: canvas.width + pipeSpacing, offsetY: getRandomOffsetY() },
  { x: canvas.width + 2 * pipeSpacing, offsetY: getRandomOffsetY() },
];

// Affichage page de gameOver
let gameOver = false;

// Affichage de la page d'accueil ("welcome") ou du jeu "play"
let gameState = "welcome";

// --------FONCTIONS UTILITAIRES--------------------------------

// Fonction pour générer des espacements aléatoire entre 2 tuyaux
function getRandomOffsetY() {
  return Math.floor(Math.random() * (maxOffsetY - minOffsetY + 1)) + minOffsetY;
}

// FONCTIONS SONORES
// Son lors d'un passage entre 2 tuyaux
function ringWin() {
  const audio = new Audio();
  audio.src = "./media/win.mp3";
  audio.play();
}

// Son lors d'un crash sur un tuyau
const ringLoose = new Audio("./media/loose.mp3");
ringLoose.volume = 0.6;

// Son ambiance du jeu
const bgMusic = new Audio("./media/game_sound.mp3");
bgMusic.loop = true; // Pour que la musique tourne en boucle
bgMusic.volume = 0.3; // Volume adapté pour une ambiance

// Fonction AFFICHAGE DU SCORE HAUT DE PAGE
let score = 0;
let bestScore = 0; // Nouvelle variable pour stocker le meilleur score
function scoreDisplay() {
  document.getElementById("bestScore").textContent = `Meilleur = ${bestScore}`;
  document.getElementById("currentScore").textContent = `Actuel = ${score}`;
}

// EVENT: Lors du clic, démarre le jeu
document.addEventListener("click", () => {
  if (gameState === "welcome") {
    gameState = "play";
    gameStartedClick = true;
    gameStartedArrowUp = false; // Réinitialiser pour permettre de redémarrer avec la flèche
    gameOver = false; // Réinitialiser l'état de gameOver
    score = 0; // Réinitialiser le score
    scoreDisplay(); // Mettre à jour l'affichage du score
    // Position initiale de l'oiseau au démarrage du jeu
    birdX = -150;
    birdY = 30;
    bgMusic.play().catch((err) => {
      console.warn("Impossible de lancer la musique :", err);
    });
    console.log("jeu lancé!");
  }
});

// FONCTION D'ANIMATION DES ELEMENTS DU JEU
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // BACKGROUND qui défile
  ctx.drawImage(sprite, 0, 50, 431, 970, bgX, 0, bgWidth, 1270);
  ctx.drawImage(sprite, 0, 50, 431, 970, bgX + bgWidth, 0, bgWidth, 1270);
  bgX -= vitesseBg;
  if (bgX <= -bgWidth) {
    bgX = 0;
  }

  if (gameState === "welcome") {
    // BATTEMENT DES AILES DU BIRD:
    if (frameCount % 2 === 0) {
      birdFrame = (birdFrame + 1) % birdSprites.length;
    }
    ctx.drawImage(birdSprites[birdFrame], birdX, birdY);

    // POSITIONNEMENT CENTRAL DE L'OISEAU
    birdY = 20;
    birdX = -15;

    // DESSIN DU TEXTE
    ctx.font = "1.2rem 'Press Start 2P', cursive";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(
      `Meilleur score = ${bestScore}`,
      canvas.width / 2,
      canvas.height / 2 - 150
    );
    ctx.fillText(
      "Cliquez pour jouer",
      canvas.width / 2,
      canvas.height / 2 + 100
    );
  } else if (gameState === "play") {
    // DESSIN des PIPES et collision
    pipeGroups.forEach((group) => {
      const offset = group.offsetY;
      const pipeX = group.x;
      const birdHitboxX = birdX + 272; // TEST RECTANGLES POUR LA COLLISION
      const birdHitboxY = birdY + 369; // TEST RECTANGLES POUR LA COLLISION

      if (!gameOver) {
        // Collision avec pipe du haut
        const collisionTop =
          birdHitboxX + birdWidth > pipeX &&
          birdHitboxX < pipeX + pipeWidthUp &&
          birdHitboxY < -4 + offset + 490;

        // Collision avec pipe du bas
        const collisionBottom =
          birdHitboxX + birdWidth > pipeX &&
          birdHitboxX < pipeX + (pipeWidthDown - 527) &&
          birdHitboxY + birdHeight > 417 + offset + pipeGap;

        // QUAND ON RENTRE EN COLLISION
        if (collisionTop || collisionBottom) {
          ringLoose.play();
          gameOver = true;
          velocity = 0;
          gravity = 0;

          // Mise à jour du meilleur score
          if (score > bestScore) {
            bestScore = score;
          }

          // Réinitialisation pour retourner à la page d'accueil
          gameStartedClick = false;
          gameStartedArrowUp = false;
          gameState = "welcome";
          // score = 0;
          scoreDisplay();

          // Réinitialisation des tuyaux
          pipeGroups.forEach((group, index) => {
            group.x = canvas.width + index * pipeSpacing;
            group.offsetY = getRandomOffsetY();
            group.passed = false;
          });

          // Réinitialisation de la position de l'oiseau
          birdY = 20;
          birdX = -15;
          velocity = 0;
          gravity = 0;
        }

        // === DEBUG LIGNE DE FRANCHISSEMENT DES TUYAUX ===
        //  ctx.beginPath();
        //  ctx.moveTo(group.x + pipeWidthUp, 0); // en haut de l'écran
        //  ctx.lineTo(group.x + pipeWidthUp, canvas.height); // en bas
        //  ctx.strokeStyle = "purple";
        //  ctx.lineWidth = 1;
        //  ctx.stroke();

        // GESTION DU SCORE LORS DU PASSAGE DE L'OISEAU
        if (
          !group.passed &&
          birdX + 272 + birdWidth > group.x + pipeWidthUp &&
          !gameOver
        ) {
          score++;
          group.passed = true;
          scoreDisplay();
          ringWin();
        }
      }

      // Efface les tuyaux à l'affichage de la page gameOver
      if (!gameOver) {
        // Pipe Up
        ctx.drawImage(
          sprite,
          432,
          100,
          77,
          1070,
          group.x,
          -2 + offset,
          pipeWidthUp,
          1070
        );

        // Pipe Down
        ctx.drawImage(
          sprite,
          510,
          -10,
          631,
          970,
          group.x,
          300 + offset + pipeGap,
          pipeWidthDown,
          970
        );
        // //  === DEBUG RECTANGLES POUR LES TUYAUX ===
        // ctx.strokeStyle = "red"; // Tuyau du haut
        // ctx.strokeRect(group.x, -4 + offset, pipeWidthUp, 490);
        // ctx.strokeStyle = "black"; // Tuyau du bas
        // ctx.strokeRect(
        //   group.x,
        //   417 + offset + pipeGap,
        //   pipeWidthDown - 527,
        //   950
        // );
      }

      // Déplacement vers la gauche
      group.x -= pipeSpeed;

      // Recyclage du groupe des tuyaux
      if (group.x <= -maxPipeWidth) {
        const maxX = Math.max(...pipeGroups.map((g) => g.x));
        group.x = maxX + pipeSpacing;
        group.offsetY = getRandomOffsetY();
        group.passed = false;
      }
    });

    // BIRD:
    // Animation battement d'aile : toutes les 10 frames environ (~6 battements par seconde)
    if (frameCount % 2 === 0) {
      birdFrame = (birdFrame + 1) % birdSprites.length;
    }
    ctx.drawImage(birdSprites[birdFrame], birdX, birdY);

    // === DEBUG RECTANGLE POUR L'OISEAU (position exacte) ===
    // ctx.strokeStyle = "green";
    // ctx.strokeRect(birdX, birdY, 42, 30);

    // Gestion du mouvement de l'oiseau au keypress (du rebond et de la gravité)
    if (gameStartedArrowUp) {
      velocity += gravity;
      birdY += velocity;
    }
    // === DEBUG RECTANGLE POUR L'OISEAU ===
    ctx.strokeStyle = "blue";
    // ctx.strokeRect(birdX + 272, birdY + 369, birdWidth, birdHeight);
    ctx.strokeRect(birdX + 272, birdY + 369, 42, 30); // Dimensions ajustées pour correspondre à la taille visuelle de l'oiseau

    // Si l'oiseau tombe
    if (birdY > canvas.height - 50) {
      birdY = canvas.height - 50;
      velocity = 0;
      gameOver = true;

      // Mise à jour du meilleur score
      if (score > bestScore) {
        bestScore = score;
      }

      // Réinitialisation pour retourner à la page d'accueil
      gameStartedClick = false;
      gameStartedArrowUp = false;
      gameState = "welcome";
      // score = 0;
      scoreDisplay();

      // Réinitialisation des tuyaux
      pipeGroups.forEach((group, index) => {
        group.x = canvas.width + index * pipeSpacing;
        group.offsetY = getRandomOffsetY();
        group.passed = false;
      });

      // Réinitialisation de la position de l'oiseau
      birdY = 20;
      birdX = -15;
      velocity = 0;
      gravity = 0;
    }

    // Text explication pour commencer à jouer
    if (!gameStartedArrowUp) {
      ctx.font = "1.2rem 'Press Start 2P', cursive";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.font = "0.6rem 'Press Start 2P', cursive";
      ctx.fillText(
        "Pressez sur ↑ ou ↓ pour faire voler l'oiseau.",
        canvas.width / 2,
        canvas.height / 2 + 100
      );
    }
  }

  frameCount++;
  requestAnimationFrame(animate);
}

// Lancement de la page d'accueil
function loadWelcomePage() {
  sprite.onload = () => {
    // Démarre l'animation de la page d'accueil
    requestAnimationFrame(animate);
  };
}

// Lancer la page d'accueil
loadWelcomePage();

// Fonction de lancement du jeu
function startGame() {
  // Initialisation et démarrage du jeu
  // console.log("Démarrage du jeu..."); // TEST
  sprite.onload = () => {
    console.log("Image sprite chargée, lancement de l'animation.");
    requestAnimationFrame(animate); // Démarre l'animation du jeu
  };

  // Vérification du chargement de l'image
  if (sprite.complete) {
    console.log("Image sprite déjà chargée");
    requestAnimationFrame(animate);
  } else {
    console.log("En attente du chargement de l'image sprite");
  }
}

// -------------------------------------------------------------------------------------------------
// CODE pour récupérer les coordonnées de l'image découpée dans "Page Ruler Redux":
// (à copier dans la console directement):

// const box = document.querySelector('.rulermode-rectangle');
// if (box) {
//   const style = window.getComputedStyle(box);
//   const data = {
//     sy: parseInt(style.top),
//     sx: parseInt(style.left),
//     sw: parseInt(style.width),
//     sh: parseInt(style.height)
//   };
//   console.log('Coordonnées :', data);
//   copy(data); // Copie dans le presse-papiers (Chrome uniquement)
// } else {
//   console.log('Aucune sélection trouvée.');
// }

// ----------------------------------------------------------------------------------------------------
