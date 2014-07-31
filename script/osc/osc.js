CHIRP.instruments.osc = function(engine, data) {
  this.preset = 0;

  this.extend(this, {
    pitchLFOLength: 0,
    pitchLFORange: 0,
    arpeggiatorRange: 0,
    arpeggiatorDuration: 0,
    attack: 0,
    release: 0.25,
    wave: 1,
    baseVolume: 0.2
  }, data);

  this.engine = engine;

  this.time = 0;

  this.oscillators = {};
  this.pool = [];

  this.output = this.engine.context.createGainNode();

  this.effectsChannel = 1;

};

CHIRP.instruments.osc.prototype = {

  constructor: CHIRP.instruments.osc,
  types: ["sine", "square", "sawtooth", "triangle"],
  /* any object that you want to receive after the song is saved/loaded */
  save: function() {
    var properties = ["pitchLFOLength", "pitchLFORange", "arpeggiatorRange", "arpeggiatorDuration", "attack", "release", "wave", "baseVolume"];
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

  getNode: function() {
    if (!this.pool.length) {
      for (var i = 0; i < 100; i++) {
        var nodes = [
          this.engine.context.createOscillator(),
          this.engine.context.createGainNode()
        ];

        this.pool.push(nodes);

        nodes[0].connect(nodes[1]);
        nodes[1].connect(this.output);

      }
    }

    return this.pool.pop();
  },


  reset: function(key, freq) {
    if (this.oscillators[key]) this.oscillators[key].stop(0);

    var nodes = this.getNode();

    var oscillator = nodes[0];

    oscillator.type = this.types[this.wave | 0];
    oscillator.time = 0;

    oscillator.baseFrequency = freq || this.engine.frequency(key);
    oscillator.frequency.value = oscillator.baseFrequency;

    oscillator.volumeNode = nodes[1];
    oscillator.volumeNode.gain.value = 0;

    oscillator.connect(oscillator.volumeNode);

    this.oscillators[key] = oscillator;
    oscillator.start(0);
  },

  /* this main loop for your instrument */
  step: function(delta) {

    this.position = this.time / this.engine.bps;

    for (var i in this.oscillators) {
      var oscillator = this.oscillators[i];

      if (!oscillator) continue;

      var key = i | 0;

      /* arpeggiator */
      if (this.arpeggiatorRange > 1) {
        var arpeggiatorDuration = this.arpeggiatorDuration * this.engine.beatDuration;
        var arpeggiator = this.arpeggiatorRange - this.arpeggiatorRange * ((this.engine.superposition % arpeggiatorDuration) / arpeggiatorDuration) | 0;
      }

      if (oscillator.lastArpeggiator !== arpeggiator) {
        var stopTimestamp = oscillator.stopTimestamp;
        var time = oscillator.time;

        this.reset(i, this.engine.frequency(key + arpeggiator * 12));
        oscillator = this.oscillators[i];
        oscillator.lastArpeggiator = arpeggiator;

        oscillator.stopTimestamp = stopTimestamp;
        oscillator.time = time;
      }


      /* pitch LFO */
      if (this.pitchLFORange && this.pitchLFOLength) {
        var pitchLFOLength = this.pitchLFOLength * this.engine.beatDuration;
        var pitchLFO = Math.sin(Math.PI * 2 * ((this.engine.superposition % pitchLFOLength) / pitchLFOLength));
        var pitchFrequency = pitchLFO * this.pitchLFORange;
      } else {
        var pitchFrequency = 0;
      }

      oscillator.frequency.value = oscillator.baseFrequency + pitchFrequency;

      /* envelope */

      if (oscillator.stopTimestamp) {
        if (this.release) {

          /* release */
          var mod = 1 - Math.min(1, (this.engine.superposition - oscillator.stopTimestamp) / this.release);

          oscillator.volumeNode.gain.value = Math.min(this.baseVolume, this.baseVolume * mod);

          if (mod === 0) {
            this.kill(i);
          }
        } else {
          this.kill(i);
        }

      } else {

        /* attack */
        if (oscillator.time < this.attack) {
          oscillator.volumeNode.gain.value = Math.min(this.baseVolume, this.baseVolume * (oscillator.time / this.attack));
        } else {
          oscillator.volumeNode.gain.value = Math.min(this.baseVolume, this.baseVolume);
        }
      }

      oscillator.time += delta;


    }

    this.time += delta;

  },

  play: function(note) {
    this.time = 0;
    this.reset(note.key);
    this.oscillators[note.key].stopTimestamp = 0;
  },

  stop: function(key) {
    if (key === true) {
      for (var i in this.oscillators) {
        this.kill(i);
        // this.stop(i)
      }
    } else if (key === false) {
      for (var i in this.oscillators) {
        this.oscillators[i].stopTimestamp = 0;
      }
    } else {
      if (this.oscillators[key]) {
        this.oscillators[key].stopTimestamp = this.engine.superposition;
      }
    }
  },

  kill: function(i) {
    if (this.oscillators[i]) {
      this.oscillators[i].stop(0);
      this.oscillators[i] = null;
    }
  }
};