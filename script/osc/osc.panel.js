(function() {

  var Panel = function(container, instrument) {
    var panel = this;

    this.container = container;
    this.instrument = instrument;

    this.waveInput = this.addInput("wave type", 0, 3, 1, function(value) {
      instrument.wave = parseFloat(value);
    });

    this.pitchLFOLengthInput = this.addInput("pitch LFO Length", 0, 4, 0.05, function(value) {
      instrument.pitchLFOLength = parseFloat(value);
    });

    this.pitchLFORangeInput = this.addInput("pitch LFO Range", 0, 64, 0.5, function(value) {
      instrument.pitchLFORange = parseFloat(value);
    });

    this.arpeggiatorDurationInput = this.addInput("arpeggiator Duration", 0, 2, 0.125, function(value) {
      instrument.arpeggiatorDuration = parseFloat(value);
    });

    this.arpeggiatorRangeInput = this.addInput("arpeggiator Range", 0, 4, 1, function(value) {
      instrument.arpeggiatorRange = parseFloat(value);
    });

    this.attackInput = this.addInput("attack", 0, 1, 0.125, function(value) {
      instrument.attack = parseFloat(value);
    });

    this.releaseInput = this.addInput("release", 0, 2, 0.125, function(value) {
      instrument.release = parseFloat(value);
    });

    this.baseVolumeInput = this.addInput("volume", 0, 1, 0.05, function(value) {
      instrument.baseVolume = parseFloat(value);
    });

  };

  Panel.prototype = {
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

    refresh: function() {
      this.baseVolumeInput.value = this.instrument.baseVolume;
      this.pitchLFORangeInput.value = this.instrument.pitchLFORange;
      this.pitchLFOLengthInput.value = this.instrument.pitchLFOLength;
      this.arpeggiatorRangeInput.value = this.instrument.arpeggiatorRange;
      this.arpeggiatorDurationInput.value = this.instrument.arpeggiatorDuration;
      this.waveInput.value = this.instrument.wave;
      this.attackInput.value = this.instrument.attack;
      this.releaseInput.value = this.instrument.release;
    },

    onopen: function() {      
      this.refresh();
    }
  };


  CHIRP.instruments.osc.prototype.panel = Panel;
  CHIRP.instruments.osc.prototype.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAIAAADYYG7QAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QgXEB8pDAS0NAAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAC+SURBVFjD7ZixDYAwDAQJomAQRqDJAIzClAzASpQUNJGstyKBI5u8S7DC/8mxbNK6L4OnGAdnQUEUREHWMaEXeZtNP3weV3BCuo83obOPRujbeqrhzWtPQf106vY92jehstM8DpAP+VzvUmX+kxmTkHQsfejMJCeUr3NyRyjJvUz3Wk8CVad+QoQaQj7QbUI1gfLR+XFqiPNQnaC8zUaLh34yxw8K6nNitNhf/0LI+h9IZEIt64bXnoIoqGtBN78ZSqkSJKvAAAAAAElFTkSuQmCC";
  CHIRP.instruments.osc.prototype.name = "Simple oscillator";
  CHIRP.instruments.osc.prototype.author = "Rezoner";
  CHIRP.instruments.osc.prototype.desc = "Simple oscillator";
  CHIRP.instruments.osc.prototype.color = "#6daa2c";
})();