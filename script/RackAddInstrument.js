CHIRPTRACKER.RackInstrumentPicker = function(args) {
  CHIRPTRACKER.extend(this, args);
  this.engine = CHIRPTRACKER.engine;
};

CHIRPTRACKER.RackInstrumentPicker.prototype = {
  zIndex: 3,

  onrender: function() {
    var layer = CHIRPTRACKER.layer;
    var i = 0;
    for (var key in CHIRP.instruments) {
      layer.drawImage(CHIRPTRACKER.getInstrumentIcon(key), 48 * i, 0);
      i++;
    }
  }
};