CHIRPTRACKER.GUI.Button = function(args) {

  CHIRPTRACKER.extend(this, {
    background: "#eee",
    color: "#333"
  }, args);

  var layer = CHIRPTRACKER.layer;

};

CHIRPTRACKER.GUI.Button.prototype = {
  zIndex: 4,

  onrender: function() {
    var layer = CHIRPTRACKER.layer;

    layer.fillStyle = this.background;
    layer.fillRect(0, 0, this.width, this.height);
    layer.fillStyle = this.color;
    layer.font = "20px pixel";
    this.textWidth = layer.measureText(this.text).width;
    layer.fillText(this.text, this.width / 2 - this.textWidth / 2, 16);

  },

  onmousedown: function() {
    if (this.onclick) this.onclick();
  }

};