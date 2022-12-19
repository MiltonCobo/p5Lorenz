//import VideoRecorder from './p5.recorder.js';

export default function lorenz(p) {
  const maxIterations = 5000; // numero total de iteracoes antes de mudar ponto inicial
  const angleCam = p.PI / 3;
  const dt = 0.003; // increment to calculate new points of trajectory. Ending in periodic orbits?....
  const chunkSize = 60;

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

  let trajectoryFall = false;
  let wiggleTrajectory = false;
  let trajectory_restarted = false;
  let audio;
  let mic;

  p.preload = function () {
    p.soundFormats('mp3', 'ogg');
    // audio = p.loadSound('http://localhost:5500/sound/aSerene.mp3');
    /* To play the music, it was necessary to use http://localhost:5500 as prefix */
    audio = p.loadSound(
      './sound/aSerene.mp3', //http://192.168.15.15:5500
      () => audio.loop() // callback. Play the music in localhost but in remote machine it is not playing
    );

    // this address is working on the web, but in the local machine should use localhost:5500
  };

  p.setup = function () {
    makeTitleAndButtons();

    mic = new p5.AudioIn(); // microphone object
    // audio.loop();

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
    let container = p.select('#container-figure');

    let myCanvas = p.createCanvas(container.width, container.height, p.WEBGL);
    myCanvas.parent('container-figure');

    //---video recorder-------

    videoRecorder = new p5.VideoRecorder([
      mic.output,
      myCanvas.elt,
      audio.output,
    ]);
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

    // color mode hue, saturation, bright

    bgColor = p.color(240, 248, 255); // background color, alice blue in RGB
    bgColor.setAlpha(0); // set transparency color....no background color
    p.background(bgColor); // transparent background

    let currentPoint = initial_random();
    trajectory = new Trajectory([currentPoint]);

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

    if (wiggleTrajectory) {
      trajectory.wiggle();
      trajectory.show();
    }

    //-------faz o titulo como testura sobre um plano------
    // titlebox.texture(tela_textura);
    // titlebox.plane(400, 100);
    //---------------------------------------------------
    //acelera plot
    let rate = Math.floor(p.map(count, 0, maxIterations, 1, 6));

    for (let i = 0; i < rate; i++) {
      trajectory.nextPoint();
    }

    if (count > maxIterations / 2 && count % 3 == 0) {
      trajectory.shiftPoints(); // after maxIterations/2 points we remove a point every 3 counts
    }

    if (count > maxIterations) {
      trajectory.restart();
    }

    drawAxes(70, 1); // coloca os eixos comprim=70, asas das setas = 6
    drawFloorPlane(70);

    p.colorMode(p.HSB);
    /* H = hue, between 0-360. Red = 0, green =120, blue = 240
    S = Saturation, 0% = grey version of color and 100% = rich version of color
    B = brightness, 0% = black and 100% = white if saturation = 0%, otherwise it is the brightness version of color
    */

    let length = trajectory.points.length;
    let residue = length % chunkSize;
    let numSteps = Math.floor(length / chunkSize);

    for (let i = 0; i <= numSteps; i++) {
      //trajectory.points = lorenzPoints.slice(i);
      p.push();
      p.stroke((i * chunkSize + residue) % 360, 80, 50);
      p.strokeWeight(0.8);

      if (trajectoryFall) {
        trajectory.fall();
      }
      let begin = Math.max(i * chunkSize - 1, 1); // rest 1 to begin at the next point
      let end = Math.min((i + 1) * chunkSize, trajectory.points.length);

      trajectory.show(begin, end); // take chunkSize points each time and draw in random color

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

    let playMusic = p
      .createButton('Musica')
      .parent('container-figure')
      .style('background-color: lightblue;')
      .position(0.9 * figura.width, 0.7 * figura.height);

    playMusic.mousePressed(() => {
      toggleMusic = !toggleMusic;
      if (toggleMusic) {
        audio.loop();
        audio.amp(0.3);
      } else if (videoRecorder.recording) {
        console.error("Recording....music couldn't  stop.....");
      } else {
        audio.stop();
      }

      p.loop();
    });
  }

  function recording() {
    console.log('%c....GRAVANDO....', 'color: red; font-size: 30px;');
    mic.start();
    // audio.loop();
    videoRecorder.start();
    gravando.style('display: inline-block');
    //p.loop();
  }

  function stopVideo() {
    mic.stop();
    // audio.stop();
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
      wiggleTrajectory = true;
    } else {
      wiggleTrajectory = false;
    }
  };

  p.doubleClicked = function () {
    trajectoryFall = !trajectoryFall;
    trajectory_restarted = !trajectory_restarted;

    if (trajectory_restarted) {
      trajectory.restart();
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
    #points;

    constructor(points) {
      this.#points = points;
    }

    get points() {
      return this.#points;
    }

    get currentPoint() {
      return this.#points.slice(-1)[0];
    }

    set currentPoint(point) {
      this.#points.push(point);
    }

    set points(points) {
      this.#points = points;
      return this;
    }

    shiftPoints() {
      this.#points.shift();
      return this;
    }

    show(begin = 0, end = -1) {
      let points = this.#points.slice(begin, end);

      //p.normalMaterial();
      p.noFill(); // mostra atrator principal

      p.beginShape();
      for (let v of points) {
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

      for (let v of this.#points) {
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
      for (let v of this.#points) {
        v.x += p.random(-0.3, 0.3);
        v.y += p.random(-0.3, 0.3);
      }
      p.pop();
    }

    restart() {
      p.noLoop();
      let currentPoint = initial_random();
      count = 0; // reinicia countador
      this.#points = [currentPoint]; // reinicia points
      p.loop();
    }

    nextPoint() {
      let currentPoint = this.#points.slice(-1)[0]; // get the last element of this.#points

      let [x, y, z] = [currentPoint.x, currentPoint.y, currentPoint.z];

      let dx = a * (y - x) * dt; //  Equations of Lorenz
      let dy = (x * (b - z) - y) * dt;
      let dz = (x * y - c * z) * dt;
      x = x + dx;
      y = y + dy;
      z = z + dz;
      let nextPoint = new p5.Vector(x, y, z); // new current position
      this.#points.push(nextPoint);
      count++;
    }
  } // end trajectory

  function drawAxes(L, radius) {
    // made the axes

    p.normalMaterial();
    // yaxis-----------
    //yaxis by definition points downwards as positive, like 2D myCanvas
    //p.stroke('lightgreen'); // coloring axis to see them better
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
    //p.stroke('lightblue');
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
    // p.normalMaterial();
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

  function drawFloorPlane(L) {
    let floorColor = p.color(120, 20, 50);
    floorColor.setAlpha(0.8);
    //p.normalMaterial();
    p.push();
    p.translate(0, 0, -1);
    p.fill(floorColor);
    p.noStroke();
    p.plane(2 * L + (2 * L) / 5, 2 * L + (2 * L) / 5); // chão plano xy
    p.pop();
  }
}
