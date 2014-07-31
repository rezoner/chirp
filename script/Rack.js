CHIRPTRACKER.Rack = function(args) {

  CHIRPTRACKER.extend(this, args);

  this.offset = 0;

  this.gui = new CHIRPTRACKER.GUI(this);
  this.gui.chainRender = true;

  this.engine = CHIRPTRACKER.engine;
  this.position = 0;

  this.timeline = new CHIRPTRACKER.RackTimeline({
    rack: this,
    left: this.paddingLeft,
    top: 0,
    width: this.width,
    height: 24
  });

  this.gui.add(this.timeline);

  this.instrumentPicker = new CHIRPTRACKER.RackInstrumentPicker({
    left: 64,
    top: this.timeline.height,
    width: 0,
    height: 48
  });

  this.gui.add(this.instrumentPicker);
  this.views = [];

  this.tracksCount = 0;
  this.height = this.timeline.height + this.instrumentPicker.height;

  for (var i = 0; i < this.engine.tracks.length; i++) {
    this.linkTrack(this.engine.tracks[i]);
  }

  if (this.engine.tracks.length === 0) {
    var trackView = this.addTrack("soundbank");
    trackView.select();
  }

  this.keysOuterShadow = CHIRPTRACKER.assets.image("pianoroll-keys-outer-shadow");

  this.setScale(1);
  this.update();

};

CHIRPTRACKER.Rack.prototype = {
  paddingLeft: 64,
  paddingBottom: 52,

  addTrack: function(plugin) {
    var track = new CHIRP.Track(this.engine, {
      index: this.engine.tracks.length
    });

    track.instrument = new CHIRP.instruments[plugin](this.engine, {

    });

    track.instrument.pluginName = plugin;

    this.engine.tracks.push(track);

    return this.linkTrack(track);
  },

  refreshViews: function() {
    for (var i = 0; i < this.views.length; i++) {
      var top = this.offset + this.timeline.height + i * 64;
      this.views[i].top = top;
      this.views[i].panel.top = top;
    }
    this.instrumentPicker.top = this.height - this.instrumentPicker.height + this.offset;
  },

  scrollToView: function(view) {
    this.offset -= view.top;
    this.offset += this.timeline.height;
    this.refreshViews();
  },

  removeTrack: function(track) {

    track.instrument.stop(true);
    
    track.remove = true;
    track.view.remove = true;
    track.view.panel.remove = true;
    track.view.panel.hidePanel();

    this.height -= 64;

    CHIRPTRACKER.cleanArray(CHIRPTRACKER.engine.tracks, "remove");
    CHIRPTRACKER.cleanArray(this.gui.elements, "remove");
    CHIRPTRACKER.cleanArray(this.views, "remove");
    this.instrumentPicker.top = this.height - this.instrumentPicker.height;

    this.tracksCount--;

    this.refreshViews();
  },

  linkTrack: function(track) {
    var color = ["#888", "#aaa"];

    var lineHeight = 64;

    var view = this.gui.add(new CHIRPTRACKER.TrackView({
      track: track,
      rack: this,
      top: this.timeline.height + this.tracksCount * lineHeight,
      left: this.paddingLeft,
      height: lineHeight,
      width: window.innerWidth,
      color: color[0],
      lighter: color[1]
    }));

    this.views.push(view);
    track.view = view;

    view.panel = this.gui.add(new CHIRPTRACKER.RackInstrumentPanel({
      track: track,
      rack: this,
      top: this.timeline.height + this.tracksCount * lineHeight,
      left: 0,
      height: lineHeight,
      width: this.paddingLeft,
      color: color[0],
      lighter: color[1]
    }));

    this.height += lineHeight;

    this.tracksCount++;

    this.refreshViews();

    track.instrument.output.connect(CHIRPTRACKER.effectsChannels[track.instrument.effectsChannel || 0].input);
    return view;
  },

  onpostrender: function() {
    var layer = CHIRPTRACKER.layer;
    //layer.fillStyle = "#222";
    //layer.fillRect(0, 0, this.timeline.left, 52);

    layer.drawImage(this.keysOuterShadow, 0, 0, this.keysOuterShadow.width, this.keysOuterShadow.height, 64, 24, this.keysOuterShadow.width, this.height - 68);

  },



  setRange: function(start, duration) {

    if (start === false || duration < 0) {
      this.engine.range = false;
      return;
    }

    if (!this.engine.range) this.engine.range = [0, 0];
    else this.engine.range[1] = Math.ceil(duration);

    if (this.engine.range !== false) this.engine.range[0] = start | 0;


  },

  setScale: function(scale) {
    if (scale < 0.25 || scale > 2) return false;
    this.scale = scale;
    this.update();
    return true;
  },

  update: function() {
    this.barWidth = 48 * this.scale;
    this.beatWidth = this.barWidth / 4;

    this.bars = this.width / this.barWidth | 0;
    this.beats = this.barWidth * 4;
  },

  onmousemove: function(x, y) {

    if (x > this.paddingLeft) {
      var px = x - this.paddingLeft;
      this.positionUnderCursor = this.position + px / this.beatWidth;
      this.gridPositionUnderCursor = (this.positionUnderCursor / 4 | 0) * 4;
    }

    if (CHIRPTRACKER.mouseButtonsState[2]) {
      if (!CHIRPTRACKER.pianoRoll.draggingClip) {
        this.position += ((this.lastMouseX - x) || 0) / (this.beatWidth);
        if (this.position < 0) this.position = 0;
      }
    }


    this.lastMouseX = x;
  },

  onmousewheel: function(x, y, delta) {
    if (x < 60) {
      if (delta < 0) {
        this.offset = Math.max(-this.height + 64 * 2 + 8, this.offset - 64);
      } else {
        this.offset = Math.min(0, this.offset + 64);
      }

      this.refreshViews();

    } else {
      if (CHIRPTRACKER.keystate["ctrl"]) {
        var change = delta / 10;
        var beforeBeat = x / this.beatWidth + this.position;

        if (this.setScale(this.scale + change)) {
          var afterBeat = x / this.beatWidth + this.position;
          var s = (x - x * (1 - change));
          this.position += (beforeBeat - afterBeat);
          if (this.position < 0) this.position = 0;
        }
      } else {
        this.position = Math.max(0, this.position - delta * 4);
      }
    }
  }



};