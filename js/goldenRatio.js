// import Bubble from 'static/js/p5/bubbles'

export default function goldenRatio(p) {
  let totalPoints; // total number of ball per angle

  let c = 8; // parameter to determine size of figure

  let stepSlider = 0.00001;
  let initialAngle = 0.525;

  let angle;
  let figFall = false;
  let stopped = false;
  let angleSlider;
  let button;
  let r0; //   size of the balls
  let bubbles = [];

  let minDist = 1;
  let count = 0;
  let controlToggle = false;

  let inputAngle;
  let angleTexto;
  let angleString;
  let slider;
  let control;
  let msg;
  let currentPath;

  //--------------------------------------
  p.setup = function () {
    makeTitleAndButtons();

    let container = document.getElementById('container-figure');
    let width = container.getBoundingClientRect().width; // save initial values of width,height
    let height = container.getBoundingClientRect().height;

    r0 = 10;
    totalPoints = 650; //Math.min(Math.floor((4 * width) / r0), 600); // max number of bubbles=600

    let cnv = p.createCanvas(width, height);

    cnv.parent('#container-figure'); // canvas is already child of this div
    p.background(21);
    p.angleMode(p.RADIANS);
    p.colorMode(p.HSL);

    // keep initial route
    currentPath = window.location.pathname;

    // controls

    // create controls
    control = p.createButton('Controles');
    button = p.createButton('parar/seguir');
    angleTexto = p.createElement('p', '');
    inputAngle = p.createInput('').attribute('placeholder', 'fração de 2PI');

    slider = p.createSlider(0, p.TWO_PI, initialAngle, stepSlider);

    msg = p.createElement('p', `clique no centro da figura...de novo!`);

    //add parent and classes
    control.parent('#container-figure').addClass('p5Class controles');
    angleTexto.parent('#container-figure'); //.addClass('p5Class angle-paragraph');
    inputAngle.parent('#container-figure').addClass('p5Class p5InputClass');
    button.parent('#container-figure').addClass('p5Class p5ButtonClass');
    slider.parent('#container-figure').addClass('p5Class sliderClass');
    msg.parent('#container-figure').addClass('p5Class');
    angleTexto.style('color: lightgoldenrod;');

    // set relative position in canvas
    function setRelPos(a, b) {
      let x = a * width;
      let y = b * height;
      return [x, y];
    }

    control.position(...setRelPos(0.03, 0.15));
    inputAngle.position(...setRelPos(0.03, 0.2));
    slider.position(...setRelPos(0.03, 0.25));
    angleTexto.position(...setRelPos(0.03, 0.27));
    button.position(...setRelPos(0.03, 0.35));
    msg.position(...setRelPos(0.05, 0.85));

    // all controls are hide at the beginning
    button.hide();
    msg.hide();
    slider.hide();
    inputAngle.hide();
    control.hide();
    angleTexto.hide();

    angle = slider.value(); // set angle inicial in slider

    //make bubbles for the first time

    for (let n = 0; n < totalPoints; n++) {
      let x = Math.sqrt(n) * c * p.cos(n * angle);
      let y = Math.sqrt(n) * c * p.sin(n * angle);

      let hue = (n % 150) + 20;
      let saturation = 100 - 0.167 * n;
      let lightness = 0.08 * n + 40;

      let bubble = new Bubble(x, y, hue, saturation, lightness, r0);

      bubble.target.set(x, y);
      //bubble.target.set(0.1 * Math.sqrt(n) * x, 0.1 * Math.sqrt(n) * y); //set initial targets and velocities

      bubble.vel.set(40 * (Math.random() - 0.5), 40 * (Math.random() - 0.5));
      bubbles.push(bubble);
    }
    p.keyPressed = function () {
      if (p.key === 'c') {
        const capture = P5Capture.getInstance();
        if (capture.state === 'idle') {
          capture.start({
            format: 'gif',
            duration: 200,
          });
        } else {
          capture.stop();
        }
      }
    };
    p.noLoop();
  };

  function makeTitleAndButtons() {
    let container = p.select('#container-figure');

    container.html(`<span style = "color : lightgoldenrodyellow; font-size: 30px;
    position: absolute; left: 50%; top: 60px; 
    background-color: transparent">
    Semana Nacional de Ciência e Tecnologia (2022)
    
    </span>
    <span style ="color : lightgoldenrodyellow; font-size: 40px;
    position: absolute; left: 60%; top: 120px;">
    Sala de Artes
    </span>
    <span style ="color : tomato; font-size: 30px;
    position: absolute; left: 5%; top: 60px;">
    O Número de Ouro
    </span>
    <span style ="color : lightgoldenrodyellow; font-size: 15px;
    position: absolute; left: 5%; bottom: 50px;">
    Clique no centro da figura.....de novo
    </span>
    `);

    // let btnLorenz = p.createButton('Atrator de Lorenz');
    // btnLorenz.parent('container-figure');
    // btnLorenz.style('background-color: lightblue;');
    // btnLorenz.position(p.windowWidth - 100, p.windowHeight - 100);
    // btnLorenz.mousePressed(playLorenz);

    // let btnOuro = p.createButton('O Numero de Ouro');
    // btnOuro.parent('container-figure');
    // btnOuro.style('background-color: lightblue;');
    // btnOuro.position(p.windowWidth - 100, p.windowHeight - 200);
    // btnOuro.mousePressed(playOuro);

    // let btnSpirograph = p.createButton('O Espirografo');
    // btnSpirograph.parent('container-figure');
    // btnSpirograph.style('background-color: lightblue;');
    // btnSpirograph.position(p.windowWidth - 100, p.windowHeight - 300);
    // btnSpirograph.mousePressed(playSpirograph);
  }

  function makeButtons() {
    let btnLorenz = p.createButton('Atrator de Lorenz');
    btnLorenz.parent('container-figure');
    btnLorenz.style('background-color: lightblue;');
    btnLorenz.position(p.windowWidth - 100, p.windowHeight - 100);
    btnLorenz.mousePressed(playLorenz);

    let btnOuro = p.createButton('O Numero de Ouro');
    btnOuro.parent('container-figure');
    btnOuro.style('background-color: lightblue;');
    btnOuro.position(p.windowWidth - 100, p.windowHeight - 200);
    btnOuro.mousePressed(playOuro);
  }

  function updateAngle() {
    stopped = true;
    angle = p.float(inputAngle.value());
    angle = (angle * p.TWO_PI) % p.TWO_PI;
    slider.value(angle);
    return;
    //stopped = false
  }

  function toggleControls() {
    controlToggle = !controlToggle;

    if (controlToggle) {
      button.show();
      slider.show();
      inputAngle.show();
      angleTexto.show();
    } else {
      button.hide();
      slider.hide();
      inputAngle.hide();
      angleTexto.hide();
    }
  }

  function toggleStopAngle() {
    stopped = !stopped;
  }

  function setAngle() {
    angle = slider.value();
    //inputAngle.value(angle.toFixed(6).toString())
  }

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  // waits millis inside the draw loop
  const sleep = (millis) => {
    return new Promise((resolve) => setTimeout(resolve, millis));
  };
  // show bubbles for the first time
  async function startOver() {
    if (count == 0) {
      //p.noLoop();
      let time = 100;
      for (let i = 0; i < totalPoints; i++) {
        bubbles[i].display();
        await sleep(time);
        time -= 0.5;
      }
      count++;
    } else {
      //p.loop();
      return;
    }
  }

  p.draw = async function () {
    p.background(21);

    let route = window.location.pathname;

    if (route !== currentPath) {
      p.noLoop(); /* stop sketch when route change */
      p.remove();
    }

    //p.clear();  // changes background
    p.translate(0.5 * p.width, 0.5 * p.height);

    button.mousePressed(toggleStopAngle);
    control.mousePressed(toggleControls);
    slider.changed(setAngle);
    inputAngle.changed(updateAngle);

    await startOver();

    p.loop();

    if (minDist > 0.1) {
      // bubbles are wandering
      let distances = [];
      bubbles.forEach((bubble) => {
        bubble.behaviors();
        bubble.update();
        let dist = p.createVector(
          bubble.target.x - bubble.pos.x,
          bubble.target.y - bubble.pos.y
        );
        distances.push(dist.mag());
      });

      bubbles.forEach((bubble) => {
        bubble.radium += 0.1;
        bubble.display();
      });
      minDist = Math.max(...distances); // when steering stop
    } else {
      // show control and button stop
      control.show();
      msg.show();

      // callbacks for controls
      button.mousePressed(toggleStopAngle);
      control.mousePressed(toggleControls);
      slider.changed(setAngle);
      inputAngle.changed(updateAngle);

      if (figFall == false) {
        if (minDist > 0.1) {
          // when click second time minDist = 10
          let distances = [];
          bubbles.forEach((bubble) => {
            bubble.behaviors();
            bubble.update();
            let dist = p.createVector(
              //bubble.target.sub(bubble.pos)
              bubble.target.x - bubble.pos.x,
              bubble.target.y - bubble.pos.y
            );
            distances.push(dist.mag());
          });

          bubbles.forEach((bubble) => bubble.display());
          minDist = Math.max(...distances);
          return;
        } else {
          angleSlider = slider.value() % p.TWO_PI;
          angle = angle % p.TWO_PI;

          if (angle != angleSlider) {
            angle = angleSlider;
          }

          // show angle in angleText
          angleString = (angle % p.TWO_PI).toFixed(5).toString();
          angleTexto.html('ângulo (radianos) = ' + angleString);

          if (stopped == false) {
            angle += stepSlider;
            slider.value(angle);
          }
        }

        // update bubbles positions

        bubbles.forEach((bubble, index) => {
          bubble.pos.x = c * Math.sqrt(index) * p.cos(index * angle);
          bubble.pos.y = c * Math.sqrt(index) * p.sin(index * angle);
        });
        //display bubbles
        bubbles.forEach((bubble) => bubble.display());
      } else {
        bubbles.forEach((bubble) => {
          if (stopped == false) {
            bubble.fall();
          }
          bubble.display();
        });
      }
    }
  }; // end draw

  p.mouseOver = function () {
    if (p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2) < 200) {
      over = true;
    } else {
      over = false;
    }
  };

  p.mouseClicked = function () {
    if (p.dist(p.mouseX, p.mouseY, p.width / 2, 200) < 400) {
      if (figFall == true) {
        // clicked by the second time
        bubbles.forEach((bubble) => {
          bubble.vel.set(
            30 * (Math.random() - 0.5),
            30 * (Math.random() - 0.5)
          );
        });
        minDist = 10;
      } else {
        // clicked by the first time
        bubbles.forEach((bubble) => {
          bubble.target.set(bubble.pos);
        });
        minDist = 0; // stop steering behavior...
      }
      figFall = !figFall;
    }
  };

  let Bubble = class {
    constructor(x, y, hue, saturation, lightness, radium) {
      this.lightness = lightness;
      this.hue = hue;
      this.sat = saturation;
      this.r = radium;
      this.maxforce = 0.5;
      this.maxspeed = 8;

      this.pos = p.createVector(x, y);
      this.vel = p.createVector();
      this.acc = p.createVector();
      this.target = p.createVector(x, y);
    }

    update() {
      this.pos.add(this.vel);
      this.vel.add(this.acc);
      this.acc.mult(0);
    }

    applyForce(f) {
      this.acc.add(f);
    }

    behaviors() {
      this.arrive(this.target);
    }

    arrive(target) {
      let newForce = p.createVector(
        target.x - this.pos.x,
        target.y - this.pos.y
      );

      let d = newForce.mag();

      let speed = this.maxspeed;

      if (d < 100) {
        speed = p.map(d, 0, 100, 0, this.maxspeed);
      }

      newForce.setMag(speed);

      let steer = newForce.sub(this.vel);

      steer.limit(this.maxforce);

      this.applyForce(steer);
    }

    display() {
      p.fill(this.hue, this.sat, this.lightness);
      p.ellipse(this.pos.x, this.pos.y, this.r);
    }

    fall() {
      this.pos.add(p.random(-1, 1), 0.05 * this.pos.x);
    }

    wiggle() {
      this.pos.add(p.random(-2, 2), p.random(-2, 2));
    }
  };
}
