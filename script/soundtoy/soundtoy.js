CHIRP.instruments.soundtoy = function(engine, data) {

  this.engine = engine;

  this.mCreated = false;

  this.mSampleRate = 44100;
  this.mNumNotes = 7 * 12;
  this.mSLen = this.mSampleRate;
  this.mOctave = 0;
  this.volume = data.volume || 0.3;

  this.mAudioContext = engine.context;

  this.sample = new Float32Array(this.mSLen);


  this.mId = 0;

  //--------------------
  var def = "a1 = .5+.5*cos(0+t*12); a2 = .5+.5*cos(1+t*8); a3 = .5+.5*cos(2+t*4); y  = saw(.2500*w*t,a1)*exp(-2*t); y += saw(.1250*w*t,a2)*exp(-3*t); y += saw(.0625*w*t,a3)*exp(-4*t); y *= .8+.2*cos(64*t);";
  def = def.replace(/;/g, ";\n");
  this.compile(data.formula || def);

  //--------------------

  this.mCreated = true;

  this.pool = [ ];

  this.output = engine.context.createGainNode();

  this.output.gain.value = this.volume;

  this.effectsChannel = 1;
}

CHIRP.instruments.soundtoy.prototype = {

  constructor: CHIRP.instruments.soundtoy,

  save: function() {

    var result = {
      volume: this.volume,
      formula: this.formula
    };

    return result;
  },

      getSoundBuffer: function() {
      if (!this.pool.length) {
        for (var i = 0; i < 100; i++) {
          var node = this.engine.context.createBufferSource();
          this.pool.push(node);
          node.connect(this.output);
        }
      }

      return this.pool.pop();
    },

  compile: function(formula) {

    this.formula = formula;

    try {

      var f2 = new String(formula);

      f2 = f2.replace(/sin/gi, "Math.sin");
      f2 = f2.replace(/cos/gi, "Math.cos");
      f2 = f2.replace(/tan/gi, "Math.tan");
      f2 = f2.replace(/asin/gi, "Math.asin");
      f2 = f2.replace(/acos/gi, "Math.acos");
      f2 = f2.replace(/exp/gi, "Math.exp");
      f2 = f2.replace(/pow/gi, "Math.pow");
      f2 = f2.replace(/sqrt/gi, "Math.sqrt");
      f2 = f2.replace(/log/gi, "Math.log");
      f2 = f2.replace(/abs/gi, "Math.abs");
      f2 = f2.replace(/min/gi, "Math.min");
      f2 = f2.replace(/max/gi, "Math.max");
      f2 = f2.replace(/round/gi, "Math.round");
      f2 = f2.replace(/floor/gi, "Math.floor");
      f2 = f2.replace(/ceil/gi, "Math.ceil");
      f2 = f2.replace(/random/gi, "Math.random");

      var func = new Function("w", "num", "buf", "var _start = Date.now(); var isr = 1.0/44100.0; for(var i=0; i<num; i++ ) { var t = i*isr; var y=0.0; " + f2 + "; buf[i] = y; if(Date.now() - _start > 3000) { throw('timeout'); break; } }");

      var sid = 4 * 12;
      var me = this;

      var f = me.engine.frequency(sid);
      var w = 2.0 * Math.PI * f;

      func(w, me.mSLen, me.sample);
      this.buffer = this.mAudioContext.createBuffer(1, this.mSLen, this.mSampleRate);

      var dbuf = this.buffer.getChannelData(0);
      var num = this.mSLen;

      for (var i = 0; i < num; i++) {
        dbuf[i] = this.sample[i];
      }

      if (me.onfirstavailable) me.onfirstavailable();
      if (me.onready) me.onready();

    } catch (e) {
      console.log(e.message);
    }
  },

  play: function(note) {
    this.noteOn(note.key);
  },

  stop: function(note) {

  },

  noteOn: function(note) {
    var id = this.mId;

    note += this.mOctave * 12;

    this.mId = (this.mId + 1) % 8;

    // copy data

    var node = this.getSoundBuffer();
    node.buffer = this.buffer;    
    node.playbackRate.value = this.engine.pitch(note);
    node.start(0);
  },

  stn: function(n) {
    var o = Math.floor(n / 12);
    n = n % 12;

    if (n > 4) n += 1;
    return 7 * o + (n / 2);
  }
};

function fmod(x, y) {
  return x % y;
}

function sign(x) {
  if (x > 0.0) x = 1.0;
  else x = -1.0;
  return x;
}

function smoothstep(a, b, x) {
  if (x < a) return 0.0;
  if (x > b) return 1.0;
  var y = (x - a) / (b - a);
  return y * y * (3.0 - 2.0 * y);
}

function clamp(x, a, b) {
  if (x < a) return a;
  if (x > b) return b;
  return x;
}

function step(a, x) {
  if (x < a) return 0.0;
  else return 1.0;
}

function mix(a, b, x) {
  return a + (b - a) * Math.min(Math.max(x, 0.0), 1.0);
}

function over(x, y) {
  return 1.0 - (1.0 - x) * (1.0 - y);
}

function tri(a, x) {
  x = x / (2.0 * Math.PI);
  x = x % 1.0;
  if (x < 0.0) x = 1.0 + x;
  if (x < a) x = x / a;
  else x = 1.0 - (x - a) / (1.0 - a);
  return -1.0 + 2.0 * x;
}

function saw(x, a) {
  var f = x % 1.0;

  if (f < a)
    f = f / a;
  else
    f = 1.0 - (f - a) / (1.0 - a);
  return f;
}

function sqr(a, x) {
  if (Math.sin(x) > a) x = 1.0;
  else x = -1.0;
  return x;
}

function grad(n, x) {
  n = (n << 13) ^ n;
  n = (n * (n * n * 15731 + 789221) + 1376312589);
  var res = x;
  if (n & 0x20000000) res = -x;
  return res;
}

function noise(x) {
  var i = Math.floor(x);
  var f = x - i;
  var w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  var a = grad(i + 0, f + 0.0);
  var b = grad(i + 1, f - 1.0);
  return a + (b - a) * w;
}

function cellnoise(x) {
  var n = Math.floor(x);
  n = (n << 13) ^ n;
  n = (n * (n * n * 15731 + 789221) + 1376312589);
  n = (n >> 14) & 65535;
  return n / 65535.0;
}

function frac(x) {
  //    return x - Math.floor(x);
  return x % 1.0;
}