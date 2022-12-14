let goldenRatio = function (p) {
  let total_points = 1500; // total number of ball per angle
  let c = 7;
  let escala = 1;
  let bubbles = [];
  let rate = 0.00004;

  let angle;
  let figFall = false;
  let stopped = false;
  let over = false;
  let slider;
  let angleSlider;
  let button;

  p.setup = function () {
    let cnv = p.createCanvas(p.windowWidth, p.windowHeight);
    cnv.parent('#container');

    p.angleMode(p.RADIANS);
    p.colorMode(p.HSL);

    inputAngle = p.createInput('ângulo');
    inputAngle.style('width', '60');
    inputAngle.parent('container');
    inputAngle.position(p.width - 0.9 * p.width, p.height - 0.01 * p.height);

    slider = p.createSlider(0, 2 * p.PI, 1 / p.PI, rate);

    slider.style('width', '300px');
    slider.parent('container');
    slider.position(p.width - 0.7 * p.width, p.height - 0.01 * p.height);
    //slider.style('height: 60px;')

    angle = slider.value(); // set angle inicial in slider

    button = p.createButton('Parar/Seguir');
    button.parent('container');
    button.position(p.width - 0.4 * p.width, p.height - 0.01 * p.height);

    button.style(
      'background-color: black; width: 200px; height: 60px; color:lightgoldenrodyellow'
    );
    button.style('font-size', '18px');

    makeButtons();
  };

  function makeButtons() {
    let btnLorenz = p.createButton('Atrator de Lorenz');
    btnLorenz.parent('container');
    btnLorenz.style('background-color: lightblue;');
    btnLorenz.position(p.windowWidth - 100, p.windowHeight - 100);
    btnLorenz.mousePressed(playLorenz);

    let btnOuro = p.createButton('O Numero de Ouro');
    btnOuro.parent('container');
    btnOuro.style('background-color: lightblue;');
    btnOuro.position(p.windowWidth - 100, p.windowHeight - 200);
    btnOuro.mousePressed(playOuro);
  }

  updateAngle = function () {
    angle = (float(inputAngle.value()) * p.TWO_PI) % p.TWO_PI;
    slider.value(angle);
    //angle = float(inputAngle.value());
    stopped = true;
  };

  function toggleStopAngle() {
    stopped = !stopped;
  }

  p.draw = function () {
    slider.changed(setAngle);
    inputAngle.changed(updateAngle);

    button.mousePressed(toggleStopAngle);

    p.background(0);
    p.push();
    p.translate(0.5 * p.width, 0.5 * p.height); // translate to center
    p.mouseOver();
    p.scale(escala);
    let hue, sat;
    angleSlider = slider.value();
    if (angle != angleSlider) {
      angle = angleSlider;
    }

    if (figFall == false) {
      bubbles = [];
      if (stopped == false) {
        angle += rate;
        slider.value(angle);
      }
      for (let n = 0; n < total_points; n++) {
        let x = c * Math.sqrt(n) * p.cos(n * angle);
        let y = c * Math.sqrt(n) * p.sin(n * angle);
        hue = n % 267; //(n%93) + 60 ;//80 + 123*Math.sqrt(n)/Math.sqrt(total_points);
        sat = 70;
        let L = 47;

        let bubble = new Bubble(x, y, hue, sat, L);
        bubbles.push(bubble);
        if (over == true) {
          bubble.wiggle();
        }
        bubble.display();
      }
    } else {
      for (let bubble of bubbles) {
        if (stopped == false) {
          bubble.fall();
        }
        bubble.display();
      }
    }
    p.pop();
  }; // end draw

  setAngle = function () {
    angle = slider.value();
  };

  p.mouseOver = function () {
    if (p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2) < 300) {
      over = true;
    } else {
      over = false;
    }
  };

  p.mouseClicked = function () {
    if (p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2) < 300) {
      figFall = !figFall;
    }
  };

  class Bubble {
    constructor(x, y, hue, sat, L) {
      this.x = x;
      this.y = y;
      this.L = L;
      this.hue = hue;
      this.sat = sat;
    }

    display() {
      p.stroke(100);
      p.fill(this.hue, this.sat, this.L);
      p.ellipse(this.x, this.y, 10);
    }
    fall() {
      this.x = this.x + p.random(-1, 1);
      this.y = this.y + 0.05 * this.x;
    }
    wiggle() {
      this.x = this.x + p.random(-2, 2);
      this.y = this.y + p.random(-2, 2);
    }
  }
};
