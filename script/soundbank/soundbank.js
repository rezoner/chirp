CHIRP.instruments.soundbank = function(engine, data) {
  this.preset = 0;

  this.engine = engine;

  this.pool = [];

  this.keys = {};


  this.release = 0.05;
  this.attack = 0.0;
  this.volume = 0.8;

  this.buffers = [];

  this.output = engine.context.createGainNode();
  this.effectsChannel = 1;
  if (data.instrument) {
    this.load(data.instrument);
  } else {
    this.load(CHIRPTRACKER.random(Object.keys(this.instruments)));
  }
};

CHIRP.instruments.soundbank.prototype = {

  constructor: CHIRP.instruments.soundbank,

  instruments: {
    "hispasonic-bright-piano": {

    },

    "tal-acid": {},
    "tal-hard-80s": {},
    "hispasonic-damped-piano": {},
    "tal-chimp-organ": {},
    "tal-shiver-stab": {},
    "hispasonic-light-piano": {},
    "tal-crystal-lead": {
      loop: true,
      loopStart: 0.572,
      loopEnd: 0.807
    },
    "hispasonic-rhodes": {},
    "tal-eager-beaver": {}
  },

  cleanArray: function(array, property) {
    for (var i = 0, len = array.length; i < len; i++) {
      if (array[i] === null || (property && array[i][property])) {
        array.splice(i--, 1);
        len--;
      }
    }
  },

  /* any object that you want to receive after the song is saved/loaded */

  save: function() {
    var properties = ["instrument", "volume"];
    var result = {};

    for (var i in properties) {
      result[properties[i]] = this[properties[i]];
    }

    return result;

  },

  extend: function() {
    for (var i = 1; i < arguments.length; i++) {
      for (var j in arguments[i]) {
        arguments[0][j] = arguments[i][j];
      }
    }

    return arguments[0];
  },

  getSoundBuffer: function() {
    if (!this.pool.length) {
      for (var i = 0; i < 100; i++) {
        var nodes = [
          this.engine.context.createBufferSource(),
          this.engine.context.createGainNode()
        ];

        this.pool.push(nodes);

        nodes[0].connect(nodes[1]);
        nodes[1].connect(this.output);

      }
    }

    return this.pool.pop();
  },


  load: function(instrument) {
    console.log("LOAD", instrument)
    var plugin = this;
    var request = new XMLHttpRequest();
    var url = location.origin + location.pathname + "samples/" + instrument + ".ogg";
    var data = this.instruments[instrument];

    this.instrument = instrument;

    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() {
      plugin.engine.context.decodeAudioData(this.response, function onSuccess(decodedBuffer) {
        CHIRPTRACKER.extend(plugin, {
          attack: 0.0,
          release: 0.05,
          loop: false
        }, data);

        plugin.sample = decodedBuffer;

      });
    }

    request.send();
  },

  /* this main loop for your instrument */

  step: function(delta) {
    for (var i = 0; i < this.buffers.length; i++) {
      var buffer = this.buffers[i];

      buffer.chirpTime += delta;

      if (!buffer.chirpCease) {

        /* attack */

        var mod = Math.min(1, buffer.chirpTime / this.attack);
        var sin = Math.sin(mod * Math.PI / 2);

        buffer.gainNode.gain.value = this.volume * sin;

      } else {

        /* release */

        var mod = buffer.chirpCeaseVolume * Math.max(0, 1 - (buffer.chirpTime - buffer.chirpCeaseTime) / this.release);

        // buffer.gain.value = mod;

        if (!mod) {
          buffer.stop(0);
          buffer.disconnect();
          this.buffers[i] = null;
          this.dirty = true;
        }

      }
    }

    if (this.dirty) {
      this.cleanArray(this.buffers);
    }
  },

  play: function(note) {

    this.ceaseNote(note.key);

    var nodes = this.getSoundBuffer();

    bufferSource = nodes[0];
    bufferSource.gainNode = nodes[1];
    bufferSource.buffer = this.sample;
    bufferSource.playbackRate.value = this.engine.pitch(note.key);

    bufferSource.loop = this.loop;

    if (this.loop) {
      bufferSource.loopStart = this.loopStart;
      bufferSource.loopEnd = this.loopEnd;
    }


    //bufferSource.loopStart = 1.846;
    //bufferSource.loopEnd = 3.692;

    bufferSource.chirpTime = 0;
    bufferSource.gainNode.gain.value = 0;

    bufferSource.start(0);
    bufferSource.chirpKey = note.key;

    this.buffers.push(bufferSource);
  },

  ceaseNote: function(key) {
    for (var i = 0; i < this.buffers.length; i++) {
      var buffer = this.buffers[i];
      if (buffer.chirpKey === key) {
        buffer.chirpCease = true;
        buffer.chirpCeaseTime = buffer.chirpTime;
        buffer.chirpCeaseVolume = buffer.gainNode.gain.value;
      }
    }
  },

  stop: function(key) {
    if (key === true) {
      for (var i = 0; i < this.buffers.length; i++) {
        this.buffers[i].stop(0);
      }
    } else {
      this.ceaseNote(key);
    }
  },

  kill: function(i) {

  }

};
