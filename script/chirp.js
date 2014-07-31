/* rezoner 2013  */

var CHIRP = {

  frequencies: [16.35, 17.32, 18.35, 19.45, 20.60, 21.83, 23.12, 24.50, 25.96, 27.50, 29.14, 30.87],

  effects: {},
  instruments: {},

  extend: function() {
    for (var i = 1; i < arguments.length; i++) {
      for (var j in arguments[i]) {
        arguments[0][j] = arguments[i][j];
      }
    }

    return arguments[0];
  }

};

CHIRP.Engine = function() {

  this.setTempo(130);
  this.tracks = [];
  this.instruments = [];

  this.position = 0;
  this.length = 0;

  this.playing = false;

  this.range = 0;

  this.shift = 0;
  this.volume = 0.5;


  this.supertime = 0;

};

CHIRP.Engine.prototype = {

  setTempo: function(bpm) {
    this.bpm = bpm;
    this.bps = this.bpm / 60;
    this.beatDuration = (60 / this.bpm);
    this.barDuration = this.beatDuration * 4;
  },

  setImpulse: function(url) {
    var engine = this;
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() {
      engine.convolver.buffer = engine.context.createBuffer(request.response, false);

    }
    request.send();
  },

  start: function() {
    var engine = this;

    var audioContext = window.AudioContext || window.webkitAudioContext;

    if (!audioContext) return false;

    if (audioContext) {
      this.context = new audioContext();
      
      if(!this.context.createGainNode) this.context.createGainNode = this.context.createGain;
      if(!this.context.createJavaScriptNode) this.context.createJavaScriptNode = this.context.createScriptProcessor;

      //this.convolver = this.context.createConvolver();
      // this.convolver.connect(this.context.destination);

      this.output = this.context.createGainNode();
      this.output.gain.value = this.volume;
      this.output.connect(this.context.destination);

      // var delay = new CHIRP.effects.delay(this);
      // delay.connect(this.output, this.convolver);



      this.lastTick = Date.now();

      this._step = this.step.bind(this);

      requestAnimationFrame(this._step);

      this.length = 4;


      document.addEventListener("webkitvisibilitychange", function() {
        if (document.webkitHidden) {
          engine.output.gain.value = 0;
          if (engine.playing) {
            engine.playing = false;
            engine.paused = true;
          }
        } else {
          engine.output.gain.value = engine.volume;
          if (engine.paused) {
            engine.playing = true;
            engine.paused = false;
          }
        }
      }, false);


      return true;
    } else {
      return false;
    }

  },

  frequency: function(index, octave) {
    if (typeof octave === "undefined") {
      var octave = index / CHIRP.frequencies.length | 0;
      var note = index % CHIRP.frequencies.length;
      return CHIRP.frequencies[note] * Math.pow(2, octave);
    } else {
      return CHIRP.frequencies[index] * Math.pow(2, octave);
    }
  },

  pitch: function(index, octave) {

    if (typeof octave === "undefined") {
      var octave = index / CHIRP.frequencies.length | 0;
      var note = index % CHIRP.frequencies.length;
    } else {
      var note = index;
    }

    var octaveRate = 0.0625 * Math.pow(2, octave);

    var result = octaveRate + octaveRate * (CHIRP.frequencies[note] - 16.35) / (32.7 - 16.35);

    return result;
  },

  play: function() {
    this.playing = true;
  },

  pause: function() {
    this.playing = false;

    for (var i = 0; i < this.tracks.length; i++) {
      this.tracks[i].instrument.stop(true);
    }
  },

  step: function() {

    requestAnimationFrame(this._step);

    var tick = Date.now();
    var delta = (tick - this.lastTick) / 1000;
    this.lastTick = tick;

    if (delta > 0.05) return;

    for (var i = 0; i < this.tracks.length; i++) {

      var track = this.tracks[i];

      track.step(delta);

      if (track.instrument && track.instrument.step) track.instrument.step(delta);
    }

    if (this.playing) {
      this.position += this.bps * delta;
    }

    if (this.position >= (this.length) || (this.range && this.position > this.range[0] + this.range[1])) {
      this.restart();
    }

    this.supertime += delta;

    if (this.playing) {
      this.superposition = this.position;
    } else {
      this.superposition = this.supertime / this.beatDuration;
    }

  },

  seek: function(position) {
    this.nextIndex = 0;

    this.position = position;

    for (var i = 0; i < this.tracks.length; i++) {
      this.tracks[i].seek(position);
    }
  },

  restart: function() {
    if (this.onrestart) this.onrestart();
    this.seek(this.range ? this.range[0] : 0, true);
  }

};


CHIRP.Track = function(engine, data) {
  this.engine = engine;

  this.notes = [];
  this.clips = [];
  this.queue = [];

  this.instrument = data.instrument;
  this.index = data.index;

  this.seek(0);
};

CHIRP.Track.prototype = {

  step: function(delta) {
    if (this.engine.playing) {

      for (var i = this.lastIndex; i < this.notes.length; i++) {
        var note = this.notes[i];

        if (note.start > this.position) {
          continue;
        } else {

          if (!note.played) {

            note.played = true;

            this.instrument.play(note);

            if (note.start + note.duration > this.maxPosition) {
              this.maxPosition = note.start + note.duration;
            }
          } else if (!note.finished && note.start + note.duration < this.position) {
            note.finished = true;
            this.instrument.stop(note.key);
            if (note.start + note.duration <= this.maxPosition) {
              // this.lastIndex = i;
            }
          }

        }
      }

      this.position += this.engine.bps * delta;
    }
  },

  seek: function(position, smooth) {
    this.lastIndex = 0;
    this.position = position;

    if (this.instrument) this.instrument.stop(!smooth);

    this.maxPosition = 0;

    for (var i = 0; i < this.notes.length; i++) {
      var note = this.notes[i];
      note.played = note.start < this.position;
      note.finished = note.start + note.duration < this.position;
    }
  }

};

CHIRP.Engine.prototype.open = function(data) {
  this.tracks = [];
  this.meta = data.meta || {};

  for (var i = 0; i < data.tracks.length; i++) {

    var trackData = data.tracks[i];

    var instrument = new CHIRP.instruments[trackData.instrumentPlugin](this, trackData.instrumentData);

    var track = new CHIRP.Track(this, {
      index: i,
      instrument: instrument
    });

    instrument.pluginName = trackData.instrumentPlugin;

    track.notes = trackData.notes;
    track.clips = trackData.clips;

    this.tracks.push(track);
  }

  this.length = data.length || 16;
  this.setTempo(data.bpm);
  this.seek(0);
};