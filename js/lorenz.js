// import Recorder from './p5.recorder.js';

export default function lorenz(p) {
  let maxIterations = 3000;
  let videoRecorder;
  let bgColor;
  // numero total de iteracoes antes de mudar ponto inicial

  let count = 0;
  let attractor;
  let rate = 1;
  let angleRate = 0.006;
  let dt = 0.0035;

  let x, y, z;
  //let scala = 1;

  let points = [];

  let angle = 0.2;
  let R = 220;

  let attractorFall = false;
  let attractorWiggle = false;

  const a = 10;
  const b = 99.96; // parameters of Lorenz
  const c = 8.0 / 3.0;

  let drawAttractor = true;

  p.setup = function () {
    makeTitleAndButtons();

    let container = document.getElementById('container-figure');
    let width = container.getBoundingClientRect().width; // save initial values of width,height
    let height = container.getBoundingClientRect().height;

    p.setAttributes({ alpha: true, antialias: true }); // set WEBGL attribute before canvas....

    let cnv = p.createCanvas(width, height, p.WEBGL);
    cnv.parent('#container-figure');
    p.colorMode(p.HSB, 100);
    bgColor = p.color(200, 255, 255);
    bgColor.setAlpha(0); // set transparency color

    p.background(bgColor);

    let ip = initial_random();
    x = ip.x;
    y = ip.y;
    z = ip.z; // initial point

    points.push(ip);

    p.angleMode(p.radians);
    p.colorMode(p.HSB); // color mode hue, saturation, bright

    attractor = new Attractor(points);

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

    videoRecorder = new p5.VideoRecorder(cnv);
    videoRecorder.onFileReady = showAndSaveVideo;

    p.noLoop();
  };

  function makeTitleAndButtons() {
    let figura = p.select('#container-figure');
    // lightgoldenrodyellow
    figura.html(`<span style = "color : red; font-size: 40px; 
        position: absolute; left: 68%; top: 100px; 
        background-color: transparent">
        Sala de Artes
        </span>
        <span style ="color : lightgoldenrodyellow; font-size: 20px;
        position: absolute; left: 68%; top: 150px;">
        Semana Nacional de Ciência e Tecnologia (2022) 
        </span>`);

    // let btnLorenz = p.createButton('Atrator de Lorenz');
    // btnLorenz.parent('container-figure');
    // btnLorenz.style('background-color: lightblue;');
    // btnLorenz.position(p.windowWidth - 100, p.windowHeight - 100);
    // btnLorenz.mousePressed(playLorenz);

    let btnOuro = p.createButton('Gravar Video');
    btnOuro.parent('#container-figure');
    btnOuro.style('background-color: lightblue;');
    btnOuro.position(p.windowWidth - 100, p.windowHeight - 200);
    btnOuro.mousePressed(recording);

    let btnSpirograph = p.createButton('Parar Video');
    btnSpirograph.parent('#container-figure');
    btnSpirograph.style('background-color: lightblue;');
    btnSpirograph.position(p.windowWidth - 100, p.windowHeight - 300);
    btnSpirograph.mousePressed(stopVideo);
  }

  function recording() {
    videoRecorder.start();
    p.loop();
  }

  function stopVideo() {
    videoRecorder.stop();
  }

  function showAndSaveVideo() {
    //  Get url of recorded video
    let videoURL = videoRecorder.url;
    //  Create video player element with recording as source
    let vid = p.createVideo(videoURL);
    vid.size(800, 800);
    vid.showControls();
    //  Download the recording
    videoRecorder.save('myVideo');
  }

  function initial_random() {
    let px, py, pz;
    let r = p.random([0, 1]); //Math.floor(Math.random()*2); // random number in {0,1}
    px = p.random(-50, 50);
    py = p.random(-50, 50);
    if (r == 0) {
      pz = p.random(200, 280);
    } else {
      pz = p.random(0, 30);
    }
    return new p5.Vector(px, py, pz);
  }

  p.mouseOver = function () {
    if (p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2) < 200) {
      attractorWiggle = true;
    } else {
      attractorWiggle = false;
    }
  };
  p.doubleClicked = function () {
    attractorFall = !attractorFall;
    drawAttractor = !drawAttractor;

    if (drawAttractor) {
      redrawAttractor();
    }

    // if (p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2) < 200) {
    //     attractorFall = !attractorFall;
    // } //else {attractorFall = false}
  };

  p.draw = function () {
    //p.clear();
    p.background(bgColor);
    // p.background('rgba(0, 0, 0, 0)');
    //p.mouseOver();

    count++;

    if (attractorWiggle) {
      attractor.wiggle();
      attractor.show();
    }

    //p.clear();

    // rotacao da camera -------------------

    angle += angleRate;
    R += 0.02; // camera se afasta lentamente
    // if (count > maxIterations / 2) {
    //   R += 0.1;
    // }

    let x0 = R * p.cos(angle);
    let z0 = R * p.sin(angle);
    p.camera(x0, z0, 60, 0, 0, 90, 0, 0, -1);
    //-----------------------------

    //-------faz o titulo como testura sobre um plano------
    // titlebox.texture(tela_textura);
    // titlebox.plane(400, 100);
    //---------------------------------------------------
    //acelera plot
    rate = Math.floor(p.map(count, 0, maxIterations, 1, 6));
    // console.log(rate);

    if (drawAttractor) {
      // if drawAttractor is true create new points
      for (let i = 0; i < rate; i++) {
        let dx = a * (y - x) * dt; //  Equations of Lorenz
        let dy = (x * (b - z) - y) * dt;
        let dz = (x * y - c * z) * dt;
        x = x + dx;
        y = y + dy;
        z = z + dz;
        let newpoint = new p5.Vector(x, y, z);
        points.push(newpoint);
      }
    }
    // console.log('count=', count);

    if (count > 2000 && count % 5 == 0) {
      points.shift();
    }

    //p.scale(scala); // scale the figure

    drawAxes(70, 1); // coloca os eixos comprim=70, asas das setas = 6
    drawfloorplane(70);

    if (count > maxIterations) {
      redrawAttractor();
    }

    let bright = 60;
    for (let i = 0; i < points.length; i += 200) {
      // change color every 200 points
      attractor.points = points.slice(i); // take 200 points each time and draw in random color
      p.push();
      // if (i < 200) { bright = 100 }
      // else { }
      p.stroke(i % 360, 100, bright);
      p.strokeWeight(0.6);

      if (attractorFall) {
        attractor.fall();
      }
      attractor.show();

      let long = attractor.points.length - 1;
      let pfinal = attractor.points[long];
      p.translate(pfinal);
      p.stroke('white');
      p.sphere(1.5); // plot white sphere at the end
      p.pop();
    }
  }; //  ------end Draw()----------------------

  //----------------REACTIVITY----------------------------------------------------;

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  //---------------------------------END REACTIVITY ----------------------------------------------

  class Attractor {
    constructor(points) {
      this.points = points;
    }

    show() {
      p.noFill();
      //p.fill(bgColor); // mostra atrator principal
      p.beginShape();
      for (let v of this.points) {
        p.vertex(v.x, v.y, v.z);
        // let offset = p5.Vector.random3D();
        // offset.mult(0.1);
        // v.add(offset);
      }
      p.endShape();
    }

    fall() {
      // faz cair o Atrator
      p.push();
      p.stroke('yellow');
      p.strokeWeight(0.3);

      for (let v of this.points) {
        if (v.z > 0) {
          v.z -= 0.3;
          // v.x +=random(-0.05,0.05);
          // v.y +=random(-0.05,0.05)
        } else {
          v.z = 0;
        }
      }
      p.pop();
    }

    wiggle() {
      //
      p.push();
      for (let v of this.points) {
        v.x += p.random(-0.3, 0.3);
        v.y += p.random(-0.3, 0.3);
      }
      p.pop();
    }
  } // end attractor

  function drawAxes(L, radius) {
    // made the axes
    let l = L / 7;
    p.normalMaterial();
    // yaxis-----------

    // p.stroke('lightgreen');
    p.push();
    p.translate(0, L / 2, 0);
    p.cylinder(radius, L);
    p.translate(0, -L / 2, 0);
    p.pop();

    p.push();
    p.translate(0, L, 0);
    p.cone(3 * radius, L / 5);
    p.translate(0, -L, 0);
    p.pop();

    //xaxis -------------

    p.push();
    // p.stroke('lightgreen');
    p.rotateZ(-p.PI / 2);
    p.translate(0, L / 2, 0);
    p.cylinder(radius, L);
    p.translate(0, -L / 2, 0);
    p.rotateZ(p.PI / 2);
    p.pop();

    p.push();
    p.rotateZ(-p.PI / 2);
    p.translate(0, L, 0);
    p.cone(3 * radius, L / 5);
    p.translate(0, -L, 0);
    p.rotateZ(p.PI / 2);
    p.pop();

    //  zaxis ----------
    // p.stroke('lightpink');
    p.push();
    p.rotateX(p.PI / 2);
    p.translate(0, L / 2, 0);
    p.cylinder(radius, L);
    p.translate(0, -L / 2, 0);
    p.rotateX(-p.PI / 2);
    p.pop();

    p.push();
    p.rotateX(p.PI / 2);
    p.translate(0, L, 0);
    p.cone(3 * radius, L / 5);
    p.translate(0, -L, 0);
    p.rotateX(-p.PI / 2);
    p.pop();
  }

  // drawAxes2 = function (L, l) {
  //   // made the axes
  //   p.push(); // guarda colores, posições....
  //   p.strokeWeight(2); // x axes red color
  //   p.stroke('red');

  //   p.stroke('red');
  //   p.line(0, 0, 0, L, 0, 0);
  //   p.line(L, 0, 0, L - l, l, 0);
  //   p.line(L, 0, 0, L - l, -l, 0);

  //   p.stroke('yellow'); // y axes yellow color
  //   p.line(0, 0, 0, 0, L, 0);
  //   p.line(0, L, 0, l, L - l, 0);
  //   p.line(0, L, 0, -l, L - l, 0);

  //   p.stroke('blue'); // z axes blue color
  //   p.line(0, 0, 0, 0, 0, L);
  //   p.line(0, 0, L, -l * 0.7, l * 0.7, L - l * 0.9);
  //   p.line(0, 0, L, l * 0.7, -l * 0.7, L - l * 0.9);
  //   p.p.pop(); // volta posições, colores...
  // };

  function drawfloorplane(L) {
    p.push();
    p.translate(0, 0, -1.5);
    p.fill('#111');
    p.noStroke();
    p.plane(2 * L + (2 * L) / 5, 2 * L + (2 * L) / 5); // chão plano xy
    p.translate(0, 0, 1.5);
    p.pop();
  }

  function redrawAttractor() {
    points = []; // reinicia points
    R = 220;
    angleRate = 0.006;

    let ip = initial_random();
    x = ip.x;
    y = ip.y;
    z = ip.z;
    points.push(ip);

    count = 0; // reinicia countador
  }
}
