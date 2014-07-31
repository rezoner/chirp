CHIRPTRACKER.RackTimeline = function(args) {
  CHIRPTRACKER.extend(this, args);
  this.engine = CHIRPTRACKER.engine;
};

CHIRPTRACKER.RackTimeline.prototype = {
  zIndex: 2,

onrender: function() {
    var x;
    var layer = CHIRPTRACKER.layer;

    layer.fillStyle = CHIRPTRACKER.palette.line0;
    layer.fillRect(0, 0, this.width, this.height);

    /* render range */
    if (this.engine.range) {
      layer.fillStyle = CHIRPTRACKER.palette.selectBackground;
      layer.fillRect((this.engine.range[0] - this.rack.position) * this.rack.beatWidth, 0, this.engine.range[1] * this.rack.beatWidth, this.rack.height - this.rack.paddingBottom + 8);

      /*
      layer.fillRect((this.engine.range[0] - this.rack.position) * this.rack.beatWidth, 0, this.engine.range[1] * this.rack.beatWidth, this.height);
      layer.fillRect((this.engine.range[0] - this.rack.position) * this.rack.beatWidth, 0, 3, this.rack.height - this.rack.paddingBottom);
      layer.fillRect((this.engine.range[1] + this.engine.range[0] - this.rack.position) * this.rack.beatWidth, 0, 3, this.rack.height - this.rack.paddingBottom);
      */
    }

    /* draw steps */

    layer.fillStyle = "#ccc";
    layer.font = "10px pixel";
    var s = this.rack.position * 0.25 | 0;

    for (var j = s; j <= s + this.rack.bars; j++) {
      layer.fillText(j, this.rack.barWidth * (j + 0.5) - this.rack.position * 0.25 * this.rack.barWidth | 0, 15);
    }

    /* draw current song position */

    layer.fillStyle = "rgba(255,255,255,0.3)";
    layer.fillRect(((this.engine.position | 0) - this.rack.position) * this.rack.beatWidth, 0, this.rack.beatWidth, this.rack.height - this.rack.paddingBottom + 8);
    layer.drawImage(CHIRPTRACKER.assets.image("arrow-markers"), 0, 0, 13, 30, (this.engine.position - this.rack.position) * this.rack.beatWidth - 7, 0, 13, 30);

    /* draw mouse grid helper */

    //layer.fillStyle = "rgba(0,0,0,0.6)";
    //layer.fillRect(((this.rack.gridPositionUnderCursor) - this.rack.position) * this.rack.beatWidth, 0, 2, this.rack.height - this.rack.paddingBottom);

    /* draw song end */
    x = (this.engine.length - this.rack.position) * this.rack.beatWidth - 6;
    layer.fillStyle = "#9f56e1";
    layer.fillRect(x + 6, 0, 2, this.rack.height - this.rack.paddingBottom + 8);
    layer.drawImage(CHIRPTRACKER.assets.image("arrow-markers"), 13, 0, 13, 30, x, 0, 13, 30);


  },



  onmousemove: function(x, y) {

    this.positionUnderCursor = this.rack.position + (x / this.rack.beatWidth);

    if (CHIRPTRACKER.mouseButtonsState[3]) {
      this.rack.setRange(this.engine.range[0], this.rack.gridPositionUnderCursor - this.engine.range[0] || 0);
    } else {

    }

    this.lastMouseX = x;
  },

  onmousedown: function(x, y, button) {
    switch (button) {
      case 1:
        CHIRPTRACKER.engine.seek(this.rack.gridPositionUnderCursor);
        console.log(this.rack.gridPositionUnderCursor);
        break;
      case 3:
        this.rack.setRange(this.rack.gridPositionUnderCursor, 0);
        break;
    }
  },

  onmouseup: function(x, y, button) {
    switch (button) {
      case 3:
        if (CHIRPTRACKER.engine.range[1] <= 0) {
          this.rack.setRange(false);
        } else
          CHIRPTRACKER.engine.seek(CHIRPTRACKER.engine.range[0])
        break;
    }
  }
};