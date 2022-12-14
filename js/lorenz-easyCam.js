//import VideoRecorder from './p5.recorder.js';

export default function lorenz(p) {
  const maxIterations = 3000; // numero total de iteracoes antes de mudar ponto inicial
  const angleCam = p.PI / 3;
  const dt = 0.004; // increment to calculate new points of trajectory. Ending in periodic orbits?....

  const a = 10;
  const b = 99.96; // parameters of Lorenz
  const c = 8.0 / 3.0;

  let videoRecorder;
  let bgColor;
  window.toggleMusic = false;

  let easyCam;
  let gravando; // paragraph indicating when is recording

  let count = 0;
  let trajectory;

  let currentPoint;
  let lorenzPoints = [];
  let trajectoryFall = false;
  let trajectoryWiggle = false;
  let showTrajectory = true;
  let music;

  // p.preload = function () {
  //   // p.soundFormats('mp3', 'ogg');
  //   music = p.loadSound('./Lorenz-music.mp3');
  // };

  p.setup = function () {
    makeTitleAndButtons();

    p.frameRate(30);
    p.setAttributes({ alpha: true, antialias: false }); // set WEBGL attribute before myCanvas....alpha channel for transparency. THIS SHOULD BE SET BEFORE THE CANVAS IS CREATED!

    gravando = p // paragraph showing if it is recording
      .createP('...gravando...')
      .style('color: red; display: none; font-size: 30px;')
      .position(50, 30)
      .parent('container-figure');

    // let container = document.getElementById('container-figure');
    // let width = container.getBoundingClientRect().width; // save initial values of width,height
    // let height = container.getBoundingClientRect().height;
    // console.log('container2= ', container2);
    let container = p.select('#container-figure');

    let myCanvas = p.createCanvas(container.width, container.height, p.WEBGL);
    myCanvas.parent('container-figure');

    //---video recorder-------

    videoRecorder = new p5.VideoRecorder(myCanvas);
    videoRecorder.onFileReady = showAndSaveVideo;

    // set camera---------------
    let container2 = document.getElementById('container-figure');
    container2.oncontextmenu = function () {
      return false;
    };

    let cameraState = {
      distance: 300,
      center: [0, 0, 100],
      rotation: [angleCam, angleCam, 0, 0], // rotation around x axis
    };
    easyCam = p.createEasyCam();
    easyCam.setState(cameraState, 3000);
    // console.log('up vector=', easyCam.getUpVector());

    p.angleMode(p.RADIANS); // p.angleMode(p.DEGREES);

    p.colorMode(p.HSB, 100); // color mode hue, saturation, bright

    bgColor = p.color(100);
    bgColor.setAlpha(0); // set transparency color
    p.background(bgColor); // transparent background

    currentPoint = initial_random(); // initial point of trajectory
    lorenzPoints.push(currentPoint);
    trajectory = new Trajectory(lorenzPoints);

    //p.noLoop();
  };

  //-----draw() --------

  p.draw = function () {
    p.scale(1, -1, 1); // invert y axis to get the right hand rule....

    //p.clear();

    p.background(bgColor);
    // p.ambientLight(128, 128, 128);

    easyCam.rotateY(0.01); // y axis is up position of camera, camera rotates around this up position
    easyCam.pushResetState(); // double click reset camera position to actual position and call p.doubleClicked function

    //p.orbitControl();  // not really working.....

    count++;

    if (trajectoryWiggle) {
      trajectory.wiggle();
      trajectory.show();
    }

    //p.clear();

    //-------faz o titulo como testura sobre um plano------
    // titlebox.texture(tela_textura);
    // titlebox.plane(400, 100);
    //---------------------------------------------------
    //acelera plot
    let rate = Math.floor(p.map(count, 0, maxIterations, 1, 6));

    if (showTrajectory) {
      let [x, y, z] = [currentPoint.x, currentPoint.y, currentPoint.z];
      // if showTrajectory is true add next point
      for (let i = 0; i < rate; i++) {
        let dx = a * (y - x) * dt; //  Equations of Lorenz
        let dy = (x * (b - z) - y) * dt;
        let dz = (x * y - c * z) * dt;
        x = x + dx;
        y = y + dy;
        z = z + dz;
        currentPoint = new p5.Vector(x, y, z); // new current position
        lorenzPoints.push(currentPoint);
      }
    }

    if (count > 2000 && count % 5 == 0) {
      lorenzPoints.shift(); // after 2000 points we remove a point every 5 counts
    }

    drawAxes(70, 1); // coloca os eixos comprim=70, asas das setas = 6
    drawfloorplane(70);

    if (count > maxIterations) {
      reshowTrajectory();
    }

    for (let i = 0; i < lorenzPoints.length; i += 200) {
      // change color every 200 points
      trajectory.points = lorenzPoints.slice(i); // take 200 points each time and draw in random color
      p.push();
      p.stroke(i % 360, 100, 100);
      p.strokeWeight(0.6);

      if (trajectoryFall) {
        trajectory.fall();
      }
      trajectory.show();

      let long = trajectory.points.length - 1;
      let pfinal = trajectory.points[long];
      p.translate(pfinal);
      p.stroke('blue');
      p.sphere(2); // plot blue sphere at the end
      p.pop();
    }
  }; //  ------end Draw()----------------------

  function makeTitleAndButtons() {
    let figura = p.select('#container-figure');

    figura.html(`<span style = "color : tomato; font-size: 40px; 
        position: absolute; left: 68%; top: 100px; 
        background-color: transparent">
        Sala de Artes
        </span>
        <span style ="color : black; font-size: 20px;
        position: absolute; left: 68%; top: 150px;">
        Semana Nacional de Ciência e Tecnologia (2022) 
        </span>`);

    let btnRecord = p
      .createButton('Gravar Video')
      .parent('container-figure')
      .style('background-color: lightblue;')
      .position(0.9 * figura.width, 0.9 * figura.height);

    btnRecord.mousePressed(recording);

    let btnStop = p
      .createButton('Parar Video')
      .parent('container-figure')
      .style('background-color: lightblue;')
      .position(0.9 * figura.width, 0.8 * figura.height);

    btnStop.mousePressed(stopVideo);

    //----------playMusic button------

    // let playMusic = p
    //   .createButton('Musica')
    //   .parent('container-figure')
    //   .style('background-color: lightblue;')
    //   .position(0.9 * figura.width, 0.7 * figura.height);

    // playMusic.mousePressed(() => {
    //   toggleMusic = !toggleMusic;
    //   if (toggleMusic) {
    //     music.play();
    //   } else {
    //     music.stop();
    //   }

    //p.loop();
    //};
  }

  function recording() {
    console.log('%c....GRAVANDO....', 'color: red; font-size: 30px;');
    videoRecorder.start();
    gravando.style('display: inline-block');
    //p.loop();
  }

  function stopVideo() {
    videoRecorder.stop();
    gravando.style('display: none');
    //p.noLoop();
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
      trajectoryWiggle = true;
    } else {
      trajectoryWiggle = false;
    }
  };

  p.doubleClicked = function () {
    trajectoryFall = !trajectoryFall;
    showTrajectory = !showTrajectory;

    if (showTrajectory) {
      reshowTrajectory();
    }

    // if (p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2) < 200) {
    //     trajectoryFall = !trajectoryFall;
    // } //else {trajectoryFall = false}
  };

  //----------------REACTIVITY----------------------------------------;

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    easyCam.setViewport([0, 0, p.windowWidth, p.windowHeight]);
  };

  //---------------------------END REACTIVITY -----------------------------;

  class Trajectory {
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
          v.z -= 0.6;
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
  } // end trajectory

  function drawAxes(L, radius) {
    // made the axes

    //p.normalMaterial();
    // yaxis-----------
    //yaxis by definition points downwards as positive, like 2D myCanvas
    p.stroke('lightgreen'); // coloring axis to see them better
    p.push();
    p.translate(0, L / 2, 0);
    p.cylinder(radius, L);
    //p.translate(0, -L / 2, 0);
    p.pop();

    p.push();
    p.translate(0, L, 0);
    //p.rotateZ(p.PI);
    p.cone(3 * radius, L / 5);
    //p.translate(0, -L, 0); // not necessary bc of push(), pop()
    p.pop();

    //xaxis -------------
    p.stroke('lightblue');
    p.push();
    p.translate(L / 2, 0, 0);
    p.rotateZ(-p.PI / 2);
    p.cylinder(radius, L);
    p.pop();

    p.push();
    p.translate(L, 0, 0);
    p.rotateZ(-p.PI / 2);
    p.cone(3 * radius, L / 5);
    p.pop();

    //  zaxis ----------
    //p.ambientMaterial(128, 128, 128);
    //p.stroke('lightpink');
    p.push();
    p.normalMaterial();
    p.translate(0, 0, L / 2);
    p.rotateX(p.PI / 2);
    p.cylinder(radius, L);
    p.pop();

    p.push();
    p.translate(0, 0, L);
    p.rotateX(p.PI / 2);
    p.cone(3 * radius, L / 5);
    p.pop();
  }

  function drawfloorplane(L) {
    //p.normalMaterial();
    p.push();
    p.translate(0, 0, -1.5);
    p.fill('#666');
    p.noStroke();
    p.plane(2 * L + (2 * L) / 5, 2 * L + (2 * L) / 5); // chão plano xy
    p.pop();
  }

  function reshowTrajectory() {
    lorenzPoints = []; // reinicia points

    let currentPoint = initial_random();
    lorenzPoints.push(currentPoint);
    count = 0; // reinicia countador
  }
}
