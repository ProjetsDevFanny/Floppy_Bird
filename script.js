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
let birdY = 100; // position Y initiale de l'oiseau

// Pour animation des battements d'aile de l'oiseau
let frameCount = 0;

// BACKGROUND
// Pour faire défiler le fond
let bgX = 0; // position du fond
const vitesseBg = 2;
const bgWidth = 550; // Largeur du fond (image d'arrière-plan)
const canvasWidth = canvas.width; // Largeur du canvas (écran)

// PIPES
// Contrôle de l'espacement entre 2 tuyaux Up et Down
const pipeGap = 350; //  Espace entre les tuyaux haut et bas
const totalPipeHeight = 800 + pipeGap + 100; // hauteur pipe haut + gap + pipe bas
const minVisibleY = 0; // bord supérieur du canvas
const maxVisibleY = canvas.height;
// Valeurs limites pour l’offset vertical
const maxOffsetY = minVisibleY;
const minOffsetY = maxVisibleY - totalPipeHeight;

// Fonction pour générer des espacements aléatoire entre 2 tuyaux
function getRandomOffsetY() {
  return Math.floor(Math.random() * (maxOffsetY - minOffsetY + 1)) + minOffsetY;
}

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
  ctx.drawImage(sprite, 0, 0, 431, 970, bgX, 0, bgWidth, 1270); // première image
  ctx.drawImage(sprite, 0, 0, 431, 970, bgX + bgWidth, 0, bgWidth, 1270); // deuxième image

  // Mise à jour de la position du fond
  bgX -= vitesseBg; // déplace le fond vers la gauche
  if (bgX <= -bgWidth) {
    bgX = 0; // réinitialisation de la position à 0 lorsque la première image est complètement sortie
  }

  // PIPES
  pipeGroups.forEach((group) => {
    const offset = group.offsetY;

    // Pipe Up (haut)
    ctx.drawImage(
      sprite,
      432,
      100,
      77,
      1070,
      group.x,
      0 + offset,
      pipeWidthUp,
      1070
    );

    // Pipe Down (bas) — on ajoute pipeGap pour créer l’espace
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

  frameCount++;

  requestAnimationFrame(animate); // on recommence l'animation = remplace setTimeout pour une animation plus fluide
}

// Quand l’image sprite est prête, on lance l’animation
sprite.onload = () => {
  requestAnimationFrame(animate);
};

// Contrôle de l'oiseau (attention, il faut lui changer ses coordonnées: c'est un élément dans un canva et non un élément du DOM):

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowUp") {
    birdY -= 10;
  } else if (event.key === "ArrowDown") {
    event.preventDefault(); // empêche la console de remonter l’historique
    birdY += 10;
  }
  draw(); // redessine après chaque mouvement
});

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
