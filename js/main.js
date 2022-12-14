import lorenz from './lorenz-easyCam.js';

let p5plot; // global variable

//let container = document.getElementById('container-figure');

p5plot = new p5(lorenz, 'container-figure'); // does not need # in container-figure
// p5plot.loop();

// attach function to the window object waiting for call in button
window.playLorenz = function () {
  p5plot.remove();
  p5plot = new p5(lorenz, 'container-figure');
  p5plot.loop();
};

// if (window.MathJax.Hub) {
//   MathJax.Hub.Typeset();
// }
