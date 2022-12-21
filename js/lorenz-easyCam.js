//import VideoRecorder from './p5.recorder.js';

export default function lorenz(p) {
  const maxIterations = 5000; // numero total de iteracoes antes de mudar ponto inicial
  const angleCam = p.PI / 3;
  const dt = 0.003; // increment to calculate new points of trajectory. Ending in periodic orbits?....
  // const chunkSize = 60;

  const a = 10;
  const b = 99.96; // parameters of Lorenz
  const c = 8.0 / 3.0;

  let videoRecorder;
  let bgColor;
  window.toggleMusic = true;

  let easyCam;
  let gravando; // paragraph indicating when is recording
  let caindoReiniciar; // paragraph indicating when is falling

  let count = 0;
  let trajectory, trajectory2;

  let isFalling = false;
  // let wiggleTrajectory = false;
  let trajectory_restarted = true;
  let audio;
  let mic;

  // function playAudio() {
  //   toggleMusic = true;
  //   audio.loop();
  //   audio.amp(0.3);
  // }

  p.preload = function () {
    p.soundFormats('mp3', 'ogg');
    // audio = p.loadSound('http://localhost:5500/sound/aSerene.mp3');
    /* To play the music, it was necessary to use http://localhost:5500 as prefix */
    audio = p.loadSound(
      './sound/aSerene.mp3', //http://192.168.15.15:5500
      () => {
        audio.loop();
        audio.amp(0.3);
      }, // callback. Play the music in localhost but in remote machine it is not playing
      console.error()
    );

    // this address is working on the web, but in the local machine should use localhost:5500
  };

  p.setup = function () {
    makeTitleAndButtons();

    mic = new p5.AudioIn(); // microphone object
    // audio.loop();

    p.frameRate(30);
    p.setAttributes({ alpha: true, antialias: false }); // set WEBGL attribute before canvas....alpha channel for transparency. THIS SHOULD BE SET BEFORE THE CANVAS IS CREATED!

    //   ---make paragraphs ------
    caindoReiniciar = createParagraph({
      title: '...Clique duas vezes...de novo...',
      position: [50, 30],
      display: 'inline-block',
      fontSize: '25px',
    });

    gravando = createParagraph({
      title: '...Gravando...',
      position: [50, 140],
      display: 'none',
    });

    createParagraph({
      title: '...Presione SHIFT para introduzir ruido...',
      position: [50, 100],
      display: 'inline-block',
      fontSize: '16px',
    });
    //---------------
    // let container = document.getElementById('container-figure');
    // let width = container.getBoundingClientRect().width; // save initial values of width,height
    // let height = container.getBoundingClientRect().height;
    let container = p.select('#container-figure');

    let canvas = p.createCanvas(container.width, container.height, p.WEBGL);
    canvas.parent('container-figure');
    //canvas.mouseOver(mouseOver);

    //---video recorder-------

    videoRecorder = new p5.VideoRecorder([
      mic.output,
      canvas.elt,
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

    bgColor = p.color(240, 248, 255); // background color, alice blue in RGB
    bgColor.setAlpha(0); // set transparency color....no background color
    p.background(bgColor); // transparent background

    let currentPoint = initial_random();
    let offset = new p5.Vector(0.2, 0.2, 0);
    let currentPoint2 = p5.Vector.add(currentPoint, offset);

    trajectory = new Trajectory([currentPoint]);
    trajectory2 = new Trajectory([currentPoint2]);

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

    //-------faz o titulo como testura sobre um plano------
    // titlebox.texture(tela_textura);
    // titlebox.plane(400, 100);
    //---------------------------------------------------
    //acelera plot
    let rate = 2; //Math.floor(p.map(count, 0, maxIterations, 2, 4));
    //---calculates 2 points of trajectory every time----
    for (let i = 0; i < rate; i++) {
      trajectory.nextPoint();
      trajectory2.nextPoint();
      count++; // increment counter....
    }

    if (count > maxIterations / 2 && count % 3 == 0) {
      trajectory.shiftPoints(); // after maxIterations/2 points we remove a point every 3 counts
      trajectory2.shiftPoints();
    }

    if (count > maxIterations) {
      count = 0; // reinicia countador
      trajectory.restart();
      trajectory2.restart();
    }

    drawAxes(70, 1); // coloca os eixos comprim=70, asas das setas = 6
    drawFloorPlane(70);

    p.colorMode(p.HSB); // color mode hue, saturation, bright
    /* H = hue, between 0-360. Red = 0, green =120, blue = 240
    S = Saturation, 0% = grey version of color and 100% = rich version of color
    B = brightness, 0% = black and 100% = white if saturation = 0%, otherwise it is the brightness version of color
    */

    p.strokeWeight(0.8);

    p.stroke('olive'); // first trajectory color
    trajectory.show();

    if (isFalling) {
      trajectory.fall(); // only the first attractor falls
    }

    if (p.keyIsDown(p.SHIFT)) {
      trajectory.wiggle(); //  attractor wiggles when SHIFT key is pressed
    }

    let long = trajectory.points.length - 1;
    let pfinal = trajectory.points[long]; // long = count
    p.push();
    p.translate(pfinal);
    p.stroke('mediumblue');
    p.sphere(2); // plot blue sphere at the end
    p.pop();

    p.stroke('purple');

    trajectory2.show(); // plot second trajectory

    long = trajectory2.points.length - 1;
    pfinal = trajectory2.points[long];
    p.push();
    p.translate(pfinal);
    p.stroke('yellowgreen');
    p.sphere(2); // plot blue sphere at the end of 2nd trajectory
    p.pop();
  }; //  ------end Draw()----------------------

  function createParagraph(options) {
    let fontSize = options.fontSize || '30px';

    return p
      .createP(options.title)
      .style(`color: red; font-size: ${fontSize}; display: ${options.display};`)
      .position(...options.position)
      .parent('#container-figure');
  }

  function makeTitleAndButtons() {
    /* p.select is not working properly ?  */

    let container = document.getElementById('container-figure');
    document.getElementById('recording').onclick = () => recording();
    document.getElementById('stopRecord').onclick = () => stopVideo();
    document.getElementById('musica').onclick = () => playMusic();

    container.innerHTML = `<span style = "color : tomato; font-size: 40px; 
        position: absolute; left: 58%; top: 100px; 
        background-color: transparent">
        O Atrator de Lorenz
        </span>
        <span style ="color : black; font-size: 20px;
        position: absolute; left: 58%; top: 150px;">
        Duas trajetórias do fluxo ilustrando o  fenômeno de </br>
        <span style ="font-weight: bold;"> sensibilidade as condições iniciais.
        </span>
        </span>`;

    function playMusic() {
      toggleMusic = !toggleMusic;
      if (toggleMusic) {
        audio.loop();
        audio.amp(0.3);
      } else if (videoRecorder.recording) {
        console.error("Recording....music couldn't stop.....");
      } else {
        audio.stop();
      }
      p.loop();
    }
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

  // function mouseOver() {
  //   console.log('mouse over...');
  //   wiggleTrajectory = true;
  //   // if (
  //   //   p.dist(p.mouseX, p.mouseY, p.windowWidth / 2, p.windowHeight / 2) < 200
  //   // ) {
  //   //   wiggleTrajectory = true;
  //   // } else {
  //   //   wiggleTrajectory = false;
  //   // }

  //   console.log('wiggle toggle =', wiggleTrajectory);
  // }

  p.doubleClicked = function () {
    isFalling = !isFalling;
    trajectory_restarted = !trajectory_restarted;

    if (trajectory_restarted && !isFalling) {
      trajectory.restart();
      return;
    }

    // if (p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2) < 200) {
    //     isFalling = !isFalling;
    // } //else {isFalling = false}
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

    show() {
      let points = this.#points; //.slice(begin, end);
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
      this.points = [currentPoint]; // reinicia points
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
    }
  } // end trajectory

  function drawAxes(L, radius) {
    // made the axes

    p.normalMaterial();
    // yaxis-----------
    //yaxis by definition points downwards as positive, like 2D canvas
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
