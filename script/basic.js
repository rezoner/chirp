/* example plugin */

CHIRP.instruments.basic = function(engine, data) {

  this.engine = engine;

  this.waveType = data.wave || 0;

  /* which track is it? */
  this.index = data.index;

  /* create some gain node so we can
     control the volume */
  this.volumeNode = engine.context.createGainNode();

  /* push the output to the soundcard */
  this.volumeNode.connect(this.engine.output);
};

CHIRP.instruments.basic.prototype = {

  /* this main loop for your instrument */
  step: function(delta) {

  },

  /* this is called whenever a group of notes is being played */
  play: function(notes) {

    /* get first note */
    var note = notes[0];

    /* in web audio api you have to create
       new oscillator each time you play a note */

    this.reset();

    /* this little function can get exact frequency for any key
       it can also be used as frequency(key, octave)
    */
    this.oscillator.frequency.value = this.engine.frequency(note.key);
    this.oscillator.start(0);
  },

  reset: function() {
    if (this.oscillator) this.oscillator.stop(0);

    this.oscillator = this.engine.context.createOscillator();
    this.oscillator.frequency.value = 0;

    this.oscillator.type = this.wave || 0;
    this.oscillator.connect(this.volumeNode);
  },

  /* this is called whenever some note shall be stopped - 
     for now it is mono */
  stop: function() {
    if (this.oscillator) {
      this.oscillator.stop(0);
    }
  },

    /* any data that you want to receive next time */
  save: function() {
    var result = {
      wave: this.waveType
    };

    return result;
  },


};