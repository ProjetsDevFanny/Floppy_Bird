const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d"); //  On lui donne un contexte en 2D:

// Chargement des images (Méthode1 = découpées dans GIMP)

const birdDown = new Image();
birdDown.src = "./media/bird_down.png";

const birdMiddle = new Image();
birdMiddle.src = "./media/bird_middle.png";

const birdUp = new Image();
birdUp.src = "./media/bird_up.png";

const pipeBottom = new Image();
pipeBottom.src = "./media/pipe_bottom.png";

// Chargement des images (bg et Pipe) avec Méthode2 = spritesheet
const sprite = new Image();
sprite.src = "./media/flappy-bird-set.png";

// Les trois sprites de l'oiseau
const birdSprites = [birdUp, birdMiddle, birdDown];
let birdFrame = 0; // index de l'image actuelle (0, 1 ou 2)

// Position fixe
let birdX = 100; // position X initiale de l'oiseau
let birdY = 150; // position Y initiale de l'oiseau

function draw() {
  // Explications pour méthode sprite :
  // ctx.drawImage(sprite, sx, sy, sw, sh, dx, dy, dw, dh);
  // sprite → l'image complète
  // 0, 0 → sx, sy → coin supérieur gauche de la découpe dans l’image
  // 431, 970 → sw, sh → largeur et hauteur de la découpe
  // 150, 100 → position sur le canvas où tu veux coller l’image
  // 550, 1270 → sw, sh → taille à afficher (identique à la découpe ici)
  // TEST: ctx.drawImage(sprite, 0, 0, 100, 100, 0, 0, 100, 100);

  ctx.clearRect(0, 0, canvas.width, canvas.height); // pour effacer avant de redessiner (sinon, supperposition d'images): clearRect(x, y, largeur, hauteur) : efface une zone rectangulaire du canvas.

  // Background et pipes = méthode "sprite":

  // Background
  ctx.drawImage(sprite, 0, 0, 431, 970, 120, 0, 550, 1270);

  //  Pipes
  ctx.drawImage(sprite, 510, 0, 431, 970, 250, 418, 400, 970); // Pipe down
  ctx.drawImage(sprite, 432, 112, 77, 970, 450, 0, 72, 970); // Pipe up

  // Animation de l'oiseau (à noter : oiseau = méthode image découpée dans GIMP)
  ctx.drawImage(birdSprites[birdFrame], birdX, birdY);
  birdFrame = (birdFrame + 1) % birdSprites.length; // Change d’image pour simuler un battement d’aile

  //   birdFrame + 1 : on passe à l’image suivante
  // % birdSprites.length : le modulo permet de revenir à 0 quand on atteint la fin.

  setTimeout(draw, 300); // Recommence toutes les 200ms
}

// Test:
sprite.onload = () => {
  // console.log("Sprite chargé !");
  draw();
};

// window.addEventListener("load", draw); //Bonne pratique : mettre tout dans une fonsction qui se charge automatiquement

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
