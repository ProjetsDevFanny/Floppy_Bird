const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d"); //  On lui donne un contexte en 2D:

// Chargement des images (Méthode1 = découpées dans GIMP)
const bg = new Image();
bg.src = "./media/background.png";

const bird = new Image();
bird.src = "./media/bird_down.png";

const pipeTop = new Image();
pipeTop.src = "./media/pipe_top.png";

const pipeBottom = new Image();
pipeBottom.src = "./media/pipe_bottom.png";

// Chargement de l’image (ground) avec Méthode2 = spritesheet
const sprite = new Image();
sprite.src = "./media/flappy-bird-set.png";

function draw() {
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height); // drawImage(image, dx, dy)
  // ctx.drawImage(bird, 100, 150);

  ctx.drawImage(
    sprite,
    665,
    458, // sx, sy : position du ground dans l’image
    432,
    309, // sw, sh : taille du ground
    0,
    canvas.height - 112, // dx, dy : position en bas du canvas
    224,
    112 // dw, dh : taille à l'affichage
  );
}

window.addEventListener("load", draw); //Bonne pratique : mettre tout dans une fonsction qui se charge automatiquement

// Récupérer les coordonnées de l'image découpée dans "Page Ruler Redux":
// const data = {};
// document.querySelectorAll('.prr-control input').forEach(input => {
//   data[input.placeholder] = input.value;
// });
// console.log(data);
