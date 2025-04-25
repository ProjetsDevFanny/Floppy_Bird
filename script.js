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
// Les trois sprites de l'oiseau  : dans un tableau
const birdSprites = [birdUp, birdMiddle, birdDown];
let birdFrame = 0; // index de l'image actuelle (0, 1 ou 2)

// Position fixe de l'oiseau au départ
let birdX = -190; // position X initiale de l'oiseau

// Pour animation des battements d'aile de l'oiseau
let frameCount = 0;

// Mouvement de rebond de l'oiseau et gravité
let birdY = 100; // position Y initiale de l'oiseau
let velocity = 0;
let gravity = 0.5;
let jump = -8;
let gameStarted = false;

// Contrôle de l'oiseau (attention, il faut lui changer ses coordonnées: c'est un élément dans un canva et non un élément du DOM):
document.addEventListener("keydown", function (event) {
  if (gameOver) return; // Ne rien faire si le jeu est fini

  if (!gameStarted) {
    gameStarted = true; // Le jeu démarre à la première touche
  }
  if (event.key === "ArrowUp") {
    velocity = jump; // l’oiseau saute vers le haut
  }
});

// Gestion de la collision bird/pipe
const birdWidth = 40;
const birdHeight = 34;

// BACKGROUND
// Pour faire défiler le fond
let bgX = 0; // position du fond
const vitesseBg = 2;
const bgWidth = 550; // Largeur du fond (image d'arrière-plan)
const canvasWidth = canvas.width; // Largeur du canvas (écran)

// PIPES
// Contrôle de la position verticale aléatoire entre 2 tuyaux
const pipeGap = 250; //  Espace entre les tuyaux haut et bas
const totalPipeHeight = 800 + pipeGap + 100; // hauteur pipe haut + gap + pipe bas
const minVisibleY = 0; // bord supérieur du canvas
const maxVisibleY = canvas.height;
// Valeurs limites pour l’offset vertical
const maxOffsetY = minVisibleY;
const minOffsetY = maxVisibleY - totalPipeHeight;

// Valeurs constantes
const pipeWidthUp = 72; // Largeur Pipe Up
const pipeWidthDown = 600; // Largeur du Pipe Down
const pipeSpacing = 400; // Espace horizontal entre 2 groupes
const pipeSpeed = 3; // vitesse de déplacement des pipes
const maxPipeWidth = Math.max(pipeWidthDown, pipeWidthUp);

// Création initiale des 3 groupes de tuyaux avec offsetY aléatoire (espacement aléatoire entre pipeUp et pipeDown)
// pipeGroups est un tableau d’objets, et chaque objet représente un groupe de tuyaux (haut + bas).
// Chaque objet a une propriété x, qui indique où il se trouve sur l’axe horizontal.
const pipeGroups = [
  { x: canvas.width, offsetY: getRandomOffsetY() },
  { x: canvas.width + pipeSpacing, offsetY: getRandomOffsetY() },
  { x: canvas.width + 2 * pipeSpacing, offsetY: getRandomOffsetY() },
];

// Affichage page de gameOver
let gameOver = false;

// --------FONCTIONS UTILITAIRES--------------------------------

// Fonction pour générer des espacements aléatoire entre 2 tuyaux
function getRandomOffsetY() {
  return Math.floor(Math.random() * (maxOffsetY - minOffsetY + 1)) + minOffsetY;
}

// FONCTION D'ANIMATION DES ELEMENTS DU JEU
function animate() {
  // -------------------------------------------------------------
  // Explications pour méthode sprite :
  // ctx.drawImage(sprite, sx, sy, sw, sh, dx, dy, dw, dh);
  // sprite → l'image complète
  // 0, 0 → sx, sy → coin supérieur gauche de la découpe dans l’image
  // 431, 970 → sw, sh → largeur et hauteur de la découpe
  // 150, 100 → position sur le canvas où tu veux coller l’image
  // 550, 1270 → sw, sh → taille à afficher (identique à la découpe ici)
  // TEST: ctx.drawImage(sprite, 0, 0, 100, 100, 0, 0, 100, 100);
  // --------------------------------------------------------------

  ctx.clearRect(0, 0, canvas.width, canvas.height); // pour effacer avant de redessiner (sinon, supperposition d'images): clearRect(x, y, largeur, hauteur) : efface une zone rectangulaire du canvas.

  // BACKGROUND
  // ctx.drawImage(sprite, 0, 0, 431, 970, 120, 0, 550, 1270);

  // BG qui défile : on dessine 2 fois l'image pour qu’elle boucle proprement
  ctx.drawImage(sprite, 0, 50, 431, 970, bgX, 0, bgWidth, 1270); // première image
  ctx.drawImage(sprite, 0, 50, 431, 970, bgX + bgWidth, 0, bgWidth, 1270); // deuxième image

  // Mise à jour de la position du fond
  bgX -= vitesseBg; // déplace le fond vers la gauche
  if (bgX <= -bgWidth) {
    bgX = 0; // réinitialisation de la position à 0 lorsque la première image est complètement sortie
  }

  // PIPES
  pipeGroups.forEach((group) => {
    const offset = group.offsetY;
    const pipeX = group.x;
    const birdHitboxX = birdX + 272;
    const birdHitboxY = birdY + 369;

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

      if (collisionTop || collisionBottom) {
        console.log("Collision !");
        gameOver = true;
        birdY = 50; // replacer l'oiseau au centre
        birdX = -15; // replacer l'oiseau au centre
        velocity = 0; // stoppe la gravité
        gravity = 0;
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
      // === DEBUG RECTANGLES POUR LES TUYAUX ===
      // ctx.strokeStyle = "red"; // Tuyau du haut
      // ctx.strokeRect(group.x, -4 + offset, pipeWidthUp, 490);
      // ctx.strokeStyle = "black"; // Tuyau du bas
      // ctx.strokeRect(group.x, 417 + offset + pipeGap, pipeWidthDown - 527, 950);
    }

    // Déplacement vers la gauche
    group.x -= pipeSpeed;

    // Recyclage du groupe de tuyaux
    if (group.x <= -maxPipeWidth) {
      const maxX = Math.max(...pipeGroups.map((g) => g.x));
      group.x = maxX + pipeSpacing;
      group.offsetY = getRandomOffsetY(); // Nouvelle hauteur SEULEMENT lors du recyclage
    }
  });

  // BIRD:
  // Animation battement d’aile : toutes les 10 frames environ (~6 battements par seconde)(= pour ralentir les battements, sinon le navigateur (norme = 60 frames/ secondes) fait battre trop vite
  if (frameCount % 2 === 0) {
    birdFrame = (birdFrame + 1) % birdSprites.length; // Change d’image pour simuler un battement d’aile
    // Explications:
    // birdFrame + 1 : on passe à l’image suivante
    // % birdSprites.length : le modulo permet de revenir à 0 quand on atteint la fin.
  }
  ctx.drawImage(birdSprites[birdFrame], birdX, birdY);
  // console.log(birdX, birdY, birdWidth, birdHeight); // Test

  // === DEBUG RECTANGLE POUR L'OISEAU ===
  // ctx.strokeStyle = "blue";
  // ctx.strokeRect(birdX + 272, birdY + 369, birdWidth, birdHeight);

  frameCount++;

  // Gestion du mouvement de l'oiseau au keypress (du rebond et de la gravité)
  if (gameStarted) {
    velocity += gravity;
    birdY += velocity;
  }
  if (birdY > canvas.height - 50) {
    console.log("tombé !");

    // Il est tombé on le remet au centre
    // birdY = 200; //Position, verticale de départ
    gameOver = true;
    birdY = 50; // replacer l'oiseau au centre
    birdX = -15; // replacer l'oiseau au centre
    velocity = 0; //Réinitialisation de la vitesse
    gameStarted = false; // On met le jeu en pause
  }

  requestAnimationFrame(animate); // on recommence l'animation = remplace setTimeout pour une animation plus fluide
}

// Quand l’image sprite est prête, on lance l’animation
sprite.onload = () => {
  requestAnimationFrame(animate);
};

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
