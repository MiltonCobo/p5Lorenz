export default function spirograph(p) {
  let hue = 0,
    i = 0;
  let currentPoint, nextPoint;
  let width, height;
  // var w = window.innerWidth;
  // var h = window.innerHeight;

  // Sliders defaults
  let R = 224; // R: base radius
  let r = 35; // r: second radius
  let l = 93; // l: length of the pen
  let slider_R, slider_r, slider_l;

  p.setup = function () {
    makeTitle(); // title should be first because it putrs html in the tag

    let container = document.getElementById('container-figure');
    width = container.getBoundingClientRect().width; // save initial values of width,height
    height = container.getBoundingClientRect().height;
    let cnv = p.createCanvas(width, height); //(p.windowWidth, p.windowHeight);
    p.background(14);
    cnv.parent('#container-figure');

    p.colorMode(p.HSB);

    slider_R = p
      .createSlider(10, 400, R)
      .position(10, p.windowHeight - 200)
      .style('width: 400px; height: 40px; background-color: lightgrey;')
      .mouseReleased(startOver);
    slider_r = p
      .createSlider(10, 400, r)
      .position(10, p.windowHeight - 140)
      .style('width: 400px; height: 40px; background-color: lightgrey;')
      .mouseReleased(startOver);
    slider_l = p
      .createSlider(10, 200, l)
      .position(10, p.windowHeight - 80)
      .style('width: 400px; height: 40px; background-color: lightgrey;')
      .mouseReleased(startOver);

    currentPoint = [
      width / 2 + (R - r) * p.cos(i) + l * p.cos(i * (1 - r / R)),
      height / 2 + (R - r) * p.sin(i) - l * p.sin(i * (1 - r / R)),
    ];
    nextPoint = null;

    p.createDiv(
      `$ x(t)  =  \\left( (R - r) \\cos(t) + l\\, \\cos(t (1 - r / R)) \\right)  $ </br></br>
      $  y(t) = \\left((R - r) \\sin(t) - l\\, \\sin(t (1 - r / R)) \\right) $`
    )
      .position(10, p.windowHeight - 600)
      .style('color: tomato; z-index: 20; width: 600px; height: 30px;')
      .addClass('formula'); //font-size: 16px;

    MathJax.Hub.Typeset();

    p.keyPressed = function () {
      if (p.key === 'c') {
        const capture = P5Capture.getInstance();
        if (capture.state === 'idle') {
          capture.start({
            format: 'gif',
            duration: 100,
          });
        } else {
          capture.stop();
        }
      }
    };

    // p.keyPressed = function () {
    //   // this will download the first 5 seconds of the animation!
    //   if (p.key === 's') {
    //     p.saveGif('mySketch', 6, { delay: 20, units: 'seconds' });
    //   }
    // };
  };

  p.draw = function () {
    //////////////////////// The sliders
    //p.fill(255);
    p.noStroke();
    // p.rect(0, 0, 450, 90);
    R = slider_R.value();
    r = slider_r.value();
    l = slider_l.value();
    p.textSize(25);
    // p.stroke(255);
    // p.strokeWeight(0.2);
    p.fill(255);
    p.text('R = ' + R, 420, p.windowHeight - 180);
    p.text('r = ' + r, 420, p.windowHeight - 120);
    p.text('l = ' + l, 420, p.windowHeight - 60);

    //////////////////////// The spirograph
    p.noFill();
    p.strokeWeight(2);

    i += p.PI / 20;
    nextPoint = [
      width / 2 + (R - r) * p.cos(i) + l * p.cos(i * (1 - r / R)),
      height / 2 + (R - r) * p.sin(i) - l * p.sin(i * (1 - r / R)),
    ];
    p.stroke(hue, 255, 80);
    hue += 1;
    if (hue >= 360) hue = 0;
    p.line(currentPoint[0], currentPoint[1], nextPoint[0], nextPoint[1]);
    currentPoint = nextPoint;
  };

  let startOver = function () {
    p.background(14);
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background(14);
  };

  function makeTitle() {
    let container = p.select('#container-figure');
    // background-color: transparent
    container.html(`<span style = "color : lightgoldenrodyellow; font-size: 25px;
        position: absolute; left: 50%; top: 60px; ">
        Semana Nacional de Ciência e Tecnologia (2022)
        
        </span>
        <span style ="color : lightgoldenrodyellow; font-size: 35px;
        position: absolute; left: 60%; top: 120px;">
        Sala de Artes
        </span>
        <span style ="color : tomato; font-size: 30px;
        position: absolute; left: 5%; top: 60px;">
        O Espirografo
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

    MathJax.Hub.Typeset();
  }
}
