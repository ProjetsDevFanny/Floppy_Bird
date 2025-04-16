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

function draw() {
  // Background et pipes = méthode "sprite":
  // ctx.drawImage(sprite, sx, sy, sw, sh, dx, dy, dw, dh);

  ctx.drawImage(sprite, 0, 0, 431, 970, 150, 100, 550, 1270);
  // sprite → l'image complète
  // 0, 0 → sx, sy → coin supérieur gauche de la découpe dans l’image
  // 431, 970 → sw, sh → largeur et hauteur de la découpe
  // 150, 100 → position sur le canvas où tu veux coller l’image
  // 550, 1270 → sw, sh → taille à afficher (identique à la découpe ici)

  // TEST: ctx.drawImage(sprite, 0, 0, 100, 100, 0, 0, 100, 100);

  // Pipe down :
  ctx.drawImage(sprite, 510, 0, 431, 970, 250, 518, 400, 970);

  // Birds = méthode : découpés dans GIMP
  // ctx.drawImage(pipeBottom, 100, 483);

  ctx.drawImage(birdDown, 100, 483); // x = 300, y = 0 (par exemple)
  ctx.drawImage(birdMiddle, 100, 483); // x = 300, y = 0 (par exemple)
  ctx.drawImage(birdUp, 100, 483); // x = 300, y = 0 (par exemple)
}

// Test:
sprite.onload = () => {
  // console.log("Sprite chargé !");
  draw();
};

window.addEventListener("load", draw); //Bonne pratique : mettre tout dans une fonsction qui se charge automatiquement

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
