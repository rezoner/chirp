CHIRP.effects.delay = function(engine) {
  this.count = 4;
  this.spacing = 3 / 12;
  this.engine = engine;

};

CHIRP.effects.delay.prototype = {

  connect: function(auxin, auxout) {

    var main = this.engine.context.createGainNode();
    main.gain.value = 1;

    main.connect(auxout);

    for (var i = 0; i < this.count; i++) {
      var volume = this.engine.context.createGainNode();
      volume.connect(main);
      volume.gain.value = 1 - i / this.count;

      var delay = this.engine.context.createDelayNode(this.engine.barDuration * this.count * 2);
      delay.delayTime.value = this.spacing * i * this.engine.barDuration;

      delay.connect(volume);
      auxin.connect(delay);

    }

  }

};