/* writing plugins will be very easy 
   it is chiptunish for now because of young age of Web Audio API
   and its horrible performance, but there is nothing that 
   forces you to sound like some rusty commodore
*/

CHIRP.instruments.pollywog = function(engine, data) {


  this.preset = 0;

  CHIRP.extend(this, {
    wave: 1,
    baseVolume: 0.2
  }, data);

  this.engine = engine;

  this.time = 0;

  this.volumeNode = engine.context.createGainNode();
  this.volumeNode.connect(this.engine.output);
};

CHIRP.instruments.pollywog.prototype = {

  /* any object that you want to receive after the song is saved/loaded */
  save: function() {
    var properties = ["wave", "baseVolume"];
    var result = {};

    for (var i in properties) {
      result[properties[i]] = this[properties[i]];
    }

    return result;
  },

  reset: function() {
    if (this.oscillator) this.oscillator.stop(0);

    this.oscillator = this.engine.context.createOscillator();

    this.oscillator.frequency.value = 0;
    this.oscillator.type = this.wave | 0;
    this.oscillator.connect(this.volumeNode);
  },

  /* this main loop for your instrument */
  step: function(delta) {
    if (!this.oscillator) return;


    this.oscillator.frequency.value = this.baseFrequency;


    /* envelope */

    if (this.stopTimestamp) {

      if (this.release) {

        /* release */
        var mod = 1 - Math.min(1, (this.engine.superposition - this.stopTimestamp) / this.release);

        this.volumeNode.gain.value = this.baseVolume * mod;

        if (mod === 0) this.kill();
      } else {
        this.kill();
      }

    } else {

      /* attack */
      var attackDuration = this.attack * this.engine.beatDuration;
      if (this.engine.superposition < attackDuration) {
        this.volumeNode.gain.value = this.baseVolume * (this.engine.superposition / attackDuration);
      } else {
        this.volumeNode.gain.value = this.baseVolume;
      }
    }

    this.time += delta;

    if (this.lifespan > 0) {
      this.lifespan -= delta;
      if (this.lifespan <= 0) {
        this.oscillator.stop(0);
        this.oscillator = null;
      }
    }

  },

  play: function(notes) {
    this.time = 0;
    this.one(notes[0]);
    this.stopTimestamp = 0;
  },


  stop: function(force) {
    if (this.oscillator) {
      this.stopTimestamp = this.engine.superposition;
    }

    if (force) {
      this.kill();
    }
  },

  kill: function() {
    if (this.oscillator) {
      this.oscillator.stop(0);
      this.oscillator = null;
    }
  },

  one: function(note) {
    this.lifespan = this.end;

    this.reset();
    this.note = note;

    this.baseFrequency = this.engine.frequency(note.key + this.engine.shift);
    this.oscillator.frequency.value = this.baseFrequency;
    this.oscillator.start(0);
  }

};


CHIRP.instruments.pollywog.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAIAAADYYG7QAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QgXECIe3lFZhQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAACBSURBVFjDYzQwyWUYTICJYZCBUQeNOmjUQbQGLLgkbPti4ew3u1lIMlTE9Q9Bvde3zx+NslEHjQwHMY7W9qMOGnXQQNVlmp6JBOspZEBqfTdal406aLQuGw2hUQeNOoiedRkx/Sxiaj1kvaN12aiDRuuy0RAaddCog0YdNOqgQQIA/doap+Ga38QAAAAASUVORK5CYII=";
CHIRP.instruments.pollywog.name = "Pollywog";
CHIRP.instruments.pollywog.author = "Rezoner";
CHIRP.instruments.pollywog.desc = "Very simple but polyphonic oscillator";
CHIRP.instruments.pollywog.color = "#597dce";