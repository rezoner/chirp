CHIRPTRACKER.RackInstrumentPicker = function(args) {
  CHIRPTRACKER.extend(this, args);
  this.engine = CHIRPTRACKER.engine;
  this.paddingLeft = 4;

  this.items = Object.keys(CHIRP.instruments);
  this.itemsCount = this.items.length;
  this.width = this.itemsCount * 52;

};

CHIRPTRACKER.RackInstrumentPicker.prototype = {
  zIndex: 3,

  onrender: function() {
    var layer = CHIRPTRACKER.layer;

    layer.drawImage(CHIRPTRACKER.getImage("addTrack"), -52, 0);

    var i = 0;
    for (var key in CHIRP.instruments) {
      var x = 24 + 52 * i;

      layer.save();
      layer.translate(x, 24);

      if (this.itemIndex > -1) {
        var scale = 1 - 0.5 * Math.min(1, Math.abs(this.lastMouseX - x) / 48);
      } else scale = 0.5;

      layer.scale(scale, scale);
      var icon = CHIRPTRACKER.assets.image("instruments/" + key);
      layer.drawImage(icon, -24, -24);
      layer.restore();
      i++;
    }
  },

  onmousemove: function(x, y) {
    this.itemIndex = x / 52 | 0;
    this.lastMouseX = x;
  },

  onmouseout: function(x, y) {
    this.itemIndex = -1;
  },

  onmousedown: function() {
    if (this.itemIndex > -1 && this.itemIndex < this.itemsCount) {
      var key = this.items[this.itemIndex];
      CHIRPTRACKER.rack.addTrack(key);
      CHIRPTRACKER.engine.tracks[CHIRPTRACKER.engine.tracks.length - 1].view.select();
    }
  }
};