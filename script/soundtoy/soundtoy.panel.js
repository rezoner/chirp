(function() {

  var presets = {
    piano: "/* by Inigo Quilez */\ny = 0.6*sin(1.0*w*t)*exp(-0.0008*w*t);\n y += 0.3*sin(2.0*w*t)*exp(-0.0010*w*t);\n y += 0.1*sin(4.0*w*t)*exp(-0.0015*w*t);\n y += 0.2*y*y*y;\n y *= 0.9 + 0.1*cos(70.0*t);\n y = 2.0*y*exp(-22.0*t) + y;",
    piano2: "/* by Inigo Quilez */\n \n t = t + .00015*noise(12*t);\n \n rt = t;\n \n r = t*w*.16;\n r = fmod(r,1);\n a = 0.15 + 0.6*(rt);\n b = 0.65 - 0.5*(rt);\n y = 50*r*(r-1)*(r-.2)*(r-a)*(r-b);\n \n \n r = t*w*.32;\n r = fmod(r,1);\n a = 0.12 + 0.65*(rt);\n b = 0.67 - 0.55*(rt);\n y2 = 50*r*(r-1)*(r-.4)*(r-a)*(r-b);\n r = t*w*.399;\n r = fmod(r,1);\n a = 0.14 + 0.55*(rt);\n b = 0.66 - 0.65*(rt);\n y3 = 50*r*(r-1)*(r-.8)*(r-a)*(r-b);\n \n y += .02*noise(1000*t);\n \n y  /= (t*w*.0015+.1);\n y2 /= (t*w*.0020+.1);\n y3 /= (t*w*.0025+.1);\n \n y = (y+y2+y3)/3;\n",
    basslinePluck: "/* by Rezoner */\n var pluck = 20;\n var energy = 100;\n var vibrato = 30;\n \n /* keep between 0 - 1 */\n var wave = 0.95; \n \n y  = 1.0*(saw((1.00)*0.08*w*t,wave)-0.5);\n y *= 1 +0.5*cos(vibrato * t);\n y *= energy*t*exp(-max(10, pluck) * t);\n",
    sawPluck: "/* by Rezoner */\n y = -1 + 2 * saw(1.6 * w * t / 20, t / 2);\n y *= (1-t);\n",
    spacePiano: "/* Space Piano' by Diego F Goberna, aka Interface (2011)\n http://feiss.be/ */\n \n tt= 1-t;\n a= sin(t*w*.5)*log(t+0.3)*tt;\n b= sin(t*w)*t*.4;\n c= fmod(tt,.075)*cos(pow(tt,3)*w)*t*2;\n y= (a+b+c)*tt;",
    guitar: "/* by Inigo Quilez */\n f = cos(2 * 0.251*w*t);\n y  = 0.5*cos(1.0*w*t+3.14*f)*exp(-0.0007*w*t);\n y += 0.2*cos(2.0*w*t+3.14*f)*exp(-0.0009*w*t);\n y += 0.2*cos(4.0*w*t+3.14*f)*exp(-0.0016*w*t);\n y += 0.1*cos(8.0*w*t+3.14*f)*exp(-0.0020*w*t);\n y *= 0.9 + 0.1*cos(70.0*t);\n y = 2.0*y*exp(-22.0*t) + y;",
    organ: "/* by Inigo Quilez */\n y  = .4*cos(w*t)*exp(-4*t);\n y += .4*cos(2*w*t)*exp(-3*t);\n y += .01*cos(4*w*t)*exp(-1*t);\n y = y*y*y + y*y*y*y*y + y*y;\n a = .5+.5*cos(8*t); y = sin(y*a*3.14);\n y *= 20*t*exp(-.1*t);\n",
    keyboard: "/* by Inigo Quilez */\n\n a1 = .5+.5*cos(0+t*12);\n a2 = .5+.5*cos(1+t*8);\n a3 = .5+.5*cos(2+t*4);\n y  = saw(.2500*w*t*1.28,a1)*exp(-2*t);\n y += saw(.1250*w*t*1.28,a2)*exp(-3*t);\n y += saw(.0625*w*t*1.28,a3)*exp(-4*t);\n y *= .8+.2*cos(64*t);\n",
    synth: "/* by Inigo Quilez */\n f = fmod(t,6.2831/w)*w/6.2831;\n a = .7+.3*cos(6.2831*t);\n y = -1.0+2*saw(f,a);\n y = y*y*y;\n y = 15*y*t*exp(-5*t);\n",
    synth2: "/* by Inigo Quilez */ \n var f = 0.001*(cos(5*t));\n y  = 1.0*(saw((1.00+f)*0.1*w*t*0.8,1)-0.5);\n y += 0.7*(saw((2.01+f)*0.1*w*t*0.8,1)-0.5);\n y += 0.5*(saw((4.02+f)*0.1*w*t*0.8,1)-0.5);\n y += 0.2*(saw((8.02+f)*0.1*w*t*0.8,1)-0.5);\n y *= 20*t*exp(-4*t);\n y *= 0.9+0.1*cos(40*t);\n",
    woodblocks: "/* by Rezoner */\n \n y = sin(w * t) * exp(-2 * t);\n y /= t * 8;\n"
  };



  var Panel = function(container, instrument) {
    var panel = this;

    this.container = container;
    this.instrument = instrument;

    this.canvas = document.createElement("canvas");
    this.layer = this.canvas.getContext("2d");
    this.container.appendChild(this.canvas);


    this.container.appendChild(document.createElement("br"));
    this.presets = document.createElement("select");

    for (var i in presets) {
      this.presets.options[this.presets.options.length] = new Option(i, i);
    }

    this.presets.addEventListener("change", this.changePreset.bind(this));

    this.container.appendChild(this.presets);

    this.container.appendChild(document.createElement("br"));

    this.textarea = document.createElement("textarea");
    this.textarea.style.display = "block";
    this.textarea.style.width = "480px";
    this.textarea.style.height = "320px";
    this.container.appendChild(this.textarea);

    this.baseVolumeInput = this.addInput("volume", 0, 1, 0.05, function(value) {
      instrument.volume = value;
      instrument.output.gain.value = value;
    });

    this.textarea.addEventListener("keyup", function() {
      panel.queueUpdate();
    });

    this.textarea.addEventListener("focus", function() {
      CHIRPTRACKER.lockKeyboard = true;
    });

    this.textarea.addEventListener("blur", function() {
      CHIRPTRACKER.lockKeyboard = false;
    });

    setInterval(function() {
      if (!CHIRPTRACKER.engine.playing && panel.container.style.display === "block" && CHIRPTRACKER.lockKeyboard) {
        panel.instrument.play({
          key: 32 + Math.random() * 32 | 0
        });

        panel.render();

      }
    }, 500);


    this.container.appendChild(document.createElement("br"));

    var $help = document.createElement("a");
    $help.innerHTML = "help";
    $help.setAttribute("href", "http://iquilezles.org/apps/soundtoy/help.html");
    $help.setAttribute("target", "_blank");
    this.container.appendChild($help);

    this.instrument.onfirstavailable = this.refresh.bind(this);
    this.instrument.onready = this.onready.bind(this);

  };

  Panel.prototype = {
    changePreset: function() {
      this.textarea.value = presets[this.presets.value];
      this.update();
      this.queueUpdate();
    },

    addInput: function(title, min, max, step, callback) {

      var label = document.createElement("label");
      label.innerHTML = title;
      label.style.display = "block";
      this.container.appendChild(label);

      var input = document.createElement("input");
      input.type = "range";
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = min;

      input.addEventListener("change", function() {
        callback(this.value)
      });

      this.container.appendChild(input);

      return input;
    },
    onready: function() {
      this.container.style.background = "#000";

    },
    render: function(data) {
      var ctx = this.layer;

      var xres = this.canvas.width;
      var yres = this.canvas.height;

      ctx.fillStyle = '#3f3f74';
      ctx.fillRect(0, 0, xres, yres);

      ctx.strokeStyle = '#639bff';
      ctx.lineWidth = 1.5;

      ctx.beginPath();

      for (var i = 0; i < this.instrument.mSLen; i += 24) {
        var x = xres * i / this.instrument.mSLen;
        var y = this.instrument.sample[i];

        var j = yres * (0.5 + 0.5 * y);

        ctx.lineTo(x, j);
      }

      ctx.stroke();
      ctx.closePath();

    },

    queueUpdate: function() {
      var panel = this;

      if (this.updateTimer) clearTimeout(this.updateTimer);

      this.updateTimer = setTimeout(function() {
        panel.update();
      }, 500);
    },


    update: function() {
      this.container.style.background = "#00a";

      this.compiling = true;
      try {
        this.instrument.compile(this.textarea.value);
      } catch (e) {
        this.container.style.background = "#f00";
      }
    },

    refresh: function() {
      this.baseVolumeInput.value = this.instrument.volume;
      this.render();
    },

    onopen: function() {
      this.textarea.value = this.instrument.formula;

      this.canvas.width = 480;
      this.canvas.height = 160;

      this.refresh();
    }


  };


  CHIRP.instruments.soundtoy.prototype.panel = Panel;
  CHIRP.instruments.soundtoy.prototype.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QkFDQwLawUyxQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAEMSURBVGje7ZgxEoMgEEUxY+EdkrGyNTlQPEJMxykscwUu5KS1SSaHSJdUzMAOCBh1IP5tQJbZ9aG7C2Tn6+PDEpYdS1wAAAAAJC65abCoy+he9H1/+gMMgkcHcDi1iAEArBbEqlRNp8WG6Zm2pvkyrkLtzfIFBsE1Yy7DVG8CCbH3M0DVdNpKLS0hvnKf1VfTmMzHU1tbX7bS3/54mQfAlH/pmC1Hq/pXf/Py4bJFJTMdaMacoZChDgAggUq8Zs5fZDtN87/MSrRPs1ao3nfu2II660BRl4z1lr6UqXrPuQhiAADgjwGsm7mYasEgODZzAADA5u6FYrwf9QYIPVjjFwIAAAAAAAAAYKsAXw65oPXpcPmaAAAAAElFTkSuQmCC";
  CHIRP.instruments.soundtoy.prototype.name = "Soundtoy";
  CHIRP.instruments.soundtoy.prototype.author = "code: Inigo Quilez / plugin: Rezoner";
  CHIRP.instruments.soundtoy.prototype.desc = "Flexible sound compiler";
  CHIRP.instruments.soundtoy.prototype.color = "#5b6ee1";
})();


/* by Rezoner */
/* 
y  = sin(t * 3.14 * 256);
y *= saw(t * 64, 2);
y /= t * 10;
*/