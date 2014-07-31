CHIRPTRACKER.EffectsChannel = function(args) {

  CHIRPTRACKER.extend(this, args);

  this.effects = [];
  //  CHIRPTRACKER.engine.output.

  // this.effects[1] = new CHIRP.effects.trance(CHIRPTRACKER.engine, {});
  // this.effects[0] = new CHIRP.effects.chorus(CHIRPTRACKER.engine, {});
  //this.effects[0] = new CHIRP.effects.environment(CHIRPTRACKER.engine, {});

  this.gain = CHIRPTRACKER.engine.context.createGainNode();
  this.input = CHIRPTRACKER.engine.context.createGainNode();

  this.main = true;

  if (this.main) {
    this.gain.connect(CHIRPTRACKER.engine.output);
  } else {
    this.gain.connect(CHIRPTRACKER.effectsChannels[0].input);
  }

  this.route();
};

CHIRPTRACKER.EffectsChannel.prototype = {

  route: function() {

    this.input.disconnect();

    if (!this.effects.length) {
      this.input.connect(this.gain);
      return;
    }

    this.input.connect(this.effects[this.effects.length - 1].input);

    for (var i = 0; i < this.effects.length; i++) {
      var effect = this.effects[this.effects.length - i - 1];
      var next = this.effects[this.effects.length - i - 2];

      effect.disconnect();

      if (next) {
        effect.connect(next.input);
      }
    }

    effect.connect(this.gain);
  }

};


CHIRP.effects.environment = function(engine, data) {
  this.engine = engine;

  this.input = this.engine.context.createGainNode();
  this.convolver = this.engine.context.createConvolver();

  this.input.connect(this.convolver);
  // this.setImpulse("/impulses/maes.wav");
  this.setImpulse(location.origin + location.pathname + "impulses/stalbans_a_ortf.mp3");

};

CHIRP.effects.environment.prototype = {

  connect: function(destination) {
    this.convolver.connect(destination);
  },

  disconnect: function() {
    this.convolver.disconnect();
  },

  setImpulse: function(url) {
    var plugin = this;
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() {
      plugin.engine.context.decodeAudioData(this.response, function onSuccess(decodedBuffer) {
        plugin.convolver.buffer = decodedBuffer;

      });
    }

    request.send();
  }

};

CHIRP.effects.trance = function(engine, data) {
  this.engine = engine;

  this.input = this.engine.context.createGainNode();

  var plugin = this;
  this.x = false;
  setInterval(function() {

    plugin.x = !plugin.x;

    plugin.input.gain.value = plugin.x ? 0 : 1;

  }, 50);

};

CHIRP.effects.trance.prototype = {

  connect: function(destination) {
    this.input.connect(destination);
  },

  disconnect: function() {
    this.input.disconnect();
  }


};


CHIRP.effects.chorus = function(engine, data) {
  this.engine = engine;

  this.input = this.engine.context.createGainNode();
  this.delay = delay = this.engine.context.createDelayNode(1);
  this.delay.delayTime.value = 0.05;


  var plugin = this;

  setInterval(function() {

    // plugin.input.gain.value = plugin.x ? 0 : 1;

  }, 50);

  this.meterx = this.engine.context.createJavaScriptNode(1024, 1, 1);

  this.meter = this.engine.context.createJavaScriptNode(1024, 1, 1);

  this.meter.onaudioprocess = function(e) {
    var buffer = e.inputBuffer.getChannelData(0);


    var result = false;
    for (var i = 0; i < buffer.length; i++) {
      if (buffer[i]) result = true;
    }

  };
  this.meterx.connect(this.meter);
  this.input.connect(this.meterx);
};

CHIRP.effects.chorus.prototype = {

  connect: function(destination) {
    this.meter.connect(this.engine.context.destination);
  },

  disconnect: function() {
    this.delay.disconnect();
  }

};

CHIRPTRACKER.PianoRoll = function(args) {

  CHIRPTRACKER.extend(this, args);

  this.track = new CHIRP.Track(this.engine, {
    index: 0
  });

  this.noteHeight = 20;
  this.playingNoteIndex = -1;


  this.canvas = document.createElement("canvas")
  this.layer = this.canvas.getContext("2d");

  this.position = 0;

  this.scale = 4;
  this.step = 0.25;

  this.setOrientation(false);
  this.setScale(this.scale);
  this.setStep(this.step);

  this.range = [1, 4];
  this.paddingLeft = 128;

  this.pressedNotes = {};

  this.up = 64;
  this.topShadow = CHIRPTRACKER.assets.image("pianoroll-top-shadow");
  this.keysShadow = CHIRPTRACKER.assets.image("pianoroll-keys-shadow");
  this.keysOuterShadow = CHIRPTRACKER.assets.image("pianoroll-keys-outer-shadow");

  this.fullscreen = false;

  this.selection = [];
};

CHIRPTRACKER.PianoRoll.prototype = {
  zIndex: 1,

  colors: ["#d44c28", "#fb7829", "#f9ce20", "#177679", "#2190a4", "#2eb9d2", "#5c761d", "#6f8832", "#87a935", "#551c63", "#7d3ca7", "#be3ce3"],

  keysColors: [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0],

  grid: function(value) {
    return (value / this.step | 0) * this.step;
  },


  toggleFullscreen: function() {

    this.fullscreen = !this.fullscreen;

    if (this.fullscreen) {
      this.preFullScreenTop = this.top;
      this.preFullScreenRackOffset = this.trackView.rack.offset;
      this.preFullScreenHeight = this.height;
      this.top = 96;
      this.height = window.innerHeight - this.top;
      this.trackView.rack.scrollToView(this.trackView);
    } else {
      this.top = this.preFullScreenTop;
      this.trackView.rack.offset = this.preFullScreenRackOffset;
      this.height = this.preFullScreenHeight;

    }
    this.setOrientation(false);
    this.update();
    this.trackView.rack.refreshViews();

  },

  setScale: function(scale) {
    if (scale < 0.25 || scale > 4) return false;
    this.scale = scale;
    this.update();
    return true;
  },

  setOrientation: function(vertical) {

    this.orientation = vertical;

    if (!this.orientation) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    } else {
      this.canvas.width = this.height;
      this.canvas.height = this.width;
    }

    this.update();
  },

  update: function() {
    // this.up = 0;
    // this.down = 256;

    this.beatWidth = 48 * this.scale;

    this.sheetWidth = this.canvas.width - this.paddingLeft;

    /*
    for (var j = 0; j < this.track.notes.length; j++) {
      var note = this.track.notes[j];
      if (note.key > this.up) this.up = note.key;
      if (note.key < this.down) this.down = note.key;
    }

    this.up++;
    this.down--;
    */

    this.diff = this.canvas.height / this.noteHeight | 0;

    this.down = this.up - this.diff;

    this.refresh();

    this.bars = this.sheetWidth / (this.beatWidth * 4) | 0;
    this.beats = this.sheetWidth / (this.beatWidth) | 0;
    this.steps = this.sheetWidth / (this.beatWidth * this.step) | 0;
  },

  refresh: function() {

  },

  shiftRight: function() {
    var first = this.hoveredNoteIndex > -1 ? this.hoveredNoteIndex : 0;

    for (var j = first; j < this.track.notes.length; j++) {
      var note = this.track.notes[j];
      note.start += this.step;
    }
  },

  shiftLeft: function() {
    var first = this.hoveredNoteIndex > -1 ? this.hoveredNoteIndex : 0;

    for (var j = first; j < this.track.notes.length; j++) {
      var note = this.track.notes[j];
      note.start -= this.step;
    }
  },

  setStep: function(step) {
    this.step = step;
    this.update();
  },

  quantize: function(up) {
    for (var j = 0; j < this.track.notes.length; j++) {
      var note = this.track.notes[j];

      note.start = ((note.start + (up || 0) * this.step * 0.5) / this.step | 0) * this.step;
    }

    this.update();
  },

  onstep: function(delta) {
    // this.track.step(delta);
  },

  onrender: function() {
    // if (CHIRPTRACKER.engine.playing && this.track.position > this.position + (this.beats - 4)) this.position = this.track.position - (this.beats - 4);

    if (this.position < 0) this.position = 0;


    if (this.playingNote) {
      if (this.playingNoteIndex > -1) {
        this.track.notes[this.playingNoteIndex].duration = (CHIRPTRACKER.time - this.playingNoteTimestamp) / CHIRPTRACKER.engine.beatDuration;
        this.track.notes[this.playingNoteIndex].timestamp = CHIRPTRACKER.time;
      }
    }

    this.layer.fillStyle = CHIRPTRACKER.palette.background;
    this.layer.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.layer.font = "20px pixel";

    this.layer.save();
    this.layer.translate(this.paddingLeft, 0);
    this.layer.textBaseline = "top";

    var o = -(this.position * this.beatWidth) % this.beatWidth | 0;
    var o4 = -(this.position * this.beatWidth) % (this.beatWidth * 8) | 0;


    /*
    for (var j = 0; j <= this.beats + 2; j++) {
      if ((j + this.position | 0) % 2) continue;
      this.layer.fillRect(o + j * this.beatWidth, 0, this.beatWidth, this.canvas.height);
    }
    */

    this.layer.fillStyle = CHIRPTRACKER.palette.line2;

    /* render steps */

    for (var j = 0; j <= this.steps + 2; j++) {
      this.layer.fillRect(o + j * this.beatWidth * this.step, 0, 2, this.canvas.height);
    }

    for (var j = 0; j < this.diff; j++) {
      this.layer.fillRect(0, j * this.noteHeight, this.canvas.width, 1);
    }

    /* render beats */

    this.layer.fillStyle = CHIRPTRACKER.palette.line1;

    for (var j = 0; j <= this.beats + 2; j++) {
      this.layer.fillRect(o + j * this.beatWidth, 0, 2, this.canvas.height);
    }

    /* render notes */

    for (var i in CHIRPTRACKER.pressedNotes) {
      var note = CHIRPTRACKER.pressedNotes[i];

      if (note) {
        var y = (this.up - (i | 0)) * this.noteHeight;
        this.layer.fillStyle = "rgba(255, 255, 255, 0.1)";
        this.layer.fillRect(0, y, this.canvas.width, this.noteHeight);
      }
    }


    if (CHIRPTRACKER.mouseButtonsState[1]) {
      var x = (((this.positionUnderCursor) / this.step | 0) * this.step - this.position) * this.beatWidth;
      this.layer.fillStyle = "rgba(255, 255, 255, 0.1)";
      this.layer.fillRect(x, 0, this.beatWidth * this.step, this.canvas.height);
    }

    this.layer.fillStyle = "#fff";
    this.layer.fillRect(this.beatWidth * (this.engine.position - this.position), 0, 2, this.canvas.height);


    for (var j = 0; j < this.track.notes.length; j++) {
      var note = this.track.notes[j];

      var noteHeight = this.noteHeight;

      var offset = note.key % 12;
      var octave = note.key / 12 | 0;
      var name = CHIRPTRACKER.names[offset];

      if (!this.engine.playing || this.engine.position < note.start || this.engine.position > note.start + note.duration) {
        var chaos = 0;
      } else {
        var chaos = 3;
      }

      var x = chaos + (note.start - this.position) * this.beatWidth | 0;
      var y = chaos + (this.up - note.key) * this.noteHeight | 0;

      var width = note.duration * this.beatWidth | 0;
      var black = this.keysColors[note.key % 12];

      this.layer.fillStyle = black ? CHIRPTRACKER.palette.blackNote : CHIRPTRACKER.palette.whiteNote;

      if (this.selection.indexOf(note) > -1) {
        this.layer.fillStyle = CHIRPTRACKER.palette.select;

      }

      this.layer.fillRect(x, y, width | 0, noteHeight);

      if (width > 24) {
        this.layer.fillStyle = CHIRPTRACKER.palette.background;
        this.layer.fillText(name + octave, x + 6, y + noteHeight / 2 - 10 | 0);
      }

      if (this.hoveredNote && this.hoveredNote.index === j) {
        this.layer.lineWidth = 2;
        this.layer.strokeStyle = "#fff";
        this.layer.strokeRect(x - 2, y - 2, 4 + width | 0, 4 + noteHeight);
      }


    }


    /* hilight current bar */
    // this.layer.fillStyle = "rgba(255,255,255,0.5)";
    // this.layer.fillRect(((this.track.position | 0) - this.position) * this.beatWidth, 0, this.beatWidth, this.height - this.paddingTop);


    /*render bars */

    this.layer.fillStyle = CHIRPTRACKER.palette.line0;
    for (var j = 0; j <= this.bars + 2; j++) {
      // if (j % 2) continue;
      // this.layer.fillRect(o4 + j * 4 * this.beatWidth, 0, 4 * this.beatWidth, this.height - this.paddingTop);
      this.layer.fillRect(o4 + j * this.beatWidth * 4, 0, 2, this.canvas.height);
    }

    /* draw select box */

    if (this.mousemoveAction === "drawSelectBox") {
      this.layer.fillStyle = CHIRPTRACKER.palette.selectBackground;
      this.layer.fillRect(this.selectBox[0], this.selectBox[1], this.selectBox[2] - this.selectBox[0], this.selectBox[3] - this.selectBox[1]);
      this.layer.strokeStyle = CHIRPTRACKER.palette.select;
      this.layer.strokeRect(this.selectBox[0], this.selectBox[1], this.selectBox[2] - this.selectBox[0], this.selectBox[3] - this.selectBox[1]);
    }


    this.layer.restore();

    /* render range */

    /*
    this.layer.fillStyle = CHIRPTRACKER.palette.select;
    this.layer.fillRect((this.range[0] - this.position) * this.beatWidth, 0, this.range[1] * this.beatWidth, this.paddingTop);
    this.layer.fillRect((this.range[0] - this.position) * this.beatWidth, 0, 3, this.height);
    this.layer.fillRect((this.range[1] + this.range[0] - this.position) * this.beatWidth, 0, 3, this.height);
    */


    /* render keys */

    for (var j = 0; j < this.diff; j++) {

      var key = this.up - j;

      var black = this.keysColors[key % 12];

      this.layer.fillStyle = black ? CHIRPTRACKER.palette.blackKey : CHIRPTRACKER.palette.whiteKey;

      if (this.pressedNotes[key]) this.layer.fillStyle = "#f80";

      this.layer.fillRect(0, j * this.noteHeight, 128, this.noteHeight);
      //this.layer.fillStyle = "rgba(0,0,0,0.25)";
      //this.layer.fillRect(0, j * this.noteHeight + this.noteHeight - 2, 126, 2);

      this.layer.fillStyle = CHIRPTRACKER.palette.line0;
      if (key % 12 == 11) this.layer.fillRect(this.paddingLeft, j * this.noteHeight, this.width, 2);

    }


    /* draw doohickeys */

    this.layer.fillStyle = "#c40";
    this.layer.fillRect(this.paddingLeft, 0, 2, this.height);
    this.layer.fillStyle = "rgba(255,255,255,0.5)";
    //this.layer.fillRect(this.paddingLeft - 2, 0, 2, this.height);
    this.layer.drawImage(this.topShadow, 0, 0, this.topShadow.width, this.topShadow.height, this.paddingLeft, 0, this.width, this.topShadow.height);
    this.layer.drawImage(this.keysShadow, 0, 0, this.keysShadow.width, this.keysShadow.height, 0, 0, this.keysShadow.width, this.height);
    this.layer.drawImage(this.keysOuterShadow, 0, 0, this.keysOuterShadow.width, this.keysOuterShadow.height, this.paddingLeft, 0, this.keysOuterShadow.width, this.height);


    this.layer.fillStyle = "rgba(0,0,0,0.15)";
    this.layer.lineWidth = 4;
    this.layer.fillRect(0, 0, this.canvas.width, 2);


    if (this.orientation) {
      CHIRPTRACKER.layer.save();
      CHIRPTRACKER.layer.rotate(-Math.PI / 2);
      CHIRPTRACKER.layer.scale(1, -1);
      CHIRPTRACKER.layer.translate(-this.height, -this.width);
    }

    CHIRPTRACKER.layer.drawImage(this.canvas, 0, 0);

    CHIRPTRACKER.layer.fillStyle = "rgba(255,255,255,0.15)";
    CHIRPTRACKER.layer.fillRect(0, -1, this.canvas.width, 1);

    if (this.orientation) {
      CHIRPTRACKER.layer.restore();
    }



  },

  setRange: function(start, duration) {
    if (start !== false) this.range[0] = (start / this.step | 0) * this.step;
    this.range[1] = Math.ceil(duration / this.step) * this.step;
  },

  hoverNote: function(x, y, note) {
    var noteStart = (note.start - this.position) * this.beatWidth;
    var noteLength = note.duration * this.beatWidth;

    this.hoveredNoteInsideOffset = (x - noteStart) / noteLength;

    this.hoveredNote = note;
    this.lastHoveredX = x;
    this.lastHoveredY = y;
  },

  getNoteUnderCursor: function(x, y) {
    for (var j = 0; j < this.track.notes.length; j++) {
      var note = this.track.notes[j];
      var noteX = (note.start - this.position) * this.beatWidth;
      var noteY = (this.up - note.key) * this.noteHeight;
      var noteWidth = note.duration * this.beatWidth;

      if (x > noteX && x < noteX + noteWidth && y > noteY && y < noteY + this.noteHeight) {
        return j;
      }
    }

    return -1;
  },

  getClipForPosition: function(position) {
    for (var i = this.track.clips.length - 1; i >= 0; i--) {
      var clip = this.track.clips[i];

      if (position >= clip.start && position < clip.start + clip.duration) {
        return clip;
      }
    };

    return null;
  },

  getSimilarNotes: function(note) {
    var result = [];
    var noteClip = this.getClipForPosition(note.start);
    if (noteClip) {
      for (var i = this.track.clips.length - 1; i >= 0; i--) {
        var clip = this.track.clips[i];

        if (clip.name === noteClip.name) {

          for (var j = 0; j < this.track.notes.length; j++) {
            var tempNote = this.track.notes[j];

            if (tempNote.start - clip.start === note.start - noteClip.start && tempNote.key === note.key) {
              result.push(tempNote);
            }
          }
        }
      }
    } else {
      result.push(note);
    }

    return result;
  },

  addNotes: function() {
    for (var i in CHIRPTRACKER.pressedNotes) {
      var note = CHIRPTRACKER.pressedNotes[i];

      if (note) {
        this.addNote((this.positionUnderCursor / this.step | 0) * this.step, this.step, i | 0);
        this.trackView.update();
      }
    }
  },

  addNote: function(position, duration, note) {

    var noteClip = this.getClipForPosition(position);
    var result = false;

    if (noteClip) {
      for (var i = this.track.clips.length - 1; i >= 0; i--) {
        var clip = this.track.clips[i];

        if (clip.name === noteClip.name) {
          var n = CHIRPTRACKER.addNote(this.track, clip.start + position - noteClip.start, duration, note);
          if (!result) result = n;
        }
      }
      CHIRPTRACKER.updateTrack(this.track);
      this.trackView.update();

      return result;
    } else {
      result = CHIRPTRACKER.addNote(this.track, position, duration, note);
      CHIRPTRACKER.updateTrack(this.track);
      this.trackView.update();
      return result;
    }


  },

  clearSelection: function() {
    this.selection = [];
  },

  boxToSelection: function() {
    var box = this.selectBox;

    if (box[0] > box[2]) box[0] = box[2] + (box[2] = box[0], 0);
    if (box[1] > box[3]) box[1] = box[3] + (box[3] = box[1], 0);

    var result = [];

    for (var j = 0; j < this.track.notes.length; j++) {
      var note = this.track.notes[j];
      var noteX = (note.start - this.position) * this.beatWidth;
      var noteY = (this.up - note.key) * this.noteHeight;
      var noteW = note.duration * this.beatWidth;
      var noteH = note.duration * this.noteHeight;

      if (CHIRPTRACKER.rectInRect(box[0], box[1], box[2] - box[0], box[3] - box[1], noteX, noteY, noteW, noteH)) {
        result.push(note);
      }
    }

    this.selection = result;
  },

  removeNote: function(note) {
    var notes = this.getSimilarNotes(note);

    for (var i = 0; i < notes.length; i++) {
      notes[i].remove = true;
    }

    CHIRPTRACKER.cleanArray(this.track.notes, "remove");

    this.update();
    this.trackView.update();
    CHIRPTRACKER.updateTrack(this.track);
  },

  setNoteKey: function(note, key) {
    var notes = this.getSimilarNotes(note);

    for (var i = 0; i < notes.length; i++) {
      notes[i].key = key;
    }

    this.update();
    this.trackView.update();
  },

  changeNoteDuration: function(note, duration) {
    var notes = this.getSimilarNotes(note);

    for (var i = 0; i < notes.length; i++) {
      notes[i].duration = duration;
    }

    this.update();
    this.trackView.update();
    CHIRPTRACKER.updateTrack(this.track);

  },

  shiftSelectionPosition: function(before, after) {

    before = this.grid(before);
    after = this.grid(after);

    if (after - before) {
      for (var i = 0; i < this.selection.length; i++) {
        var note = this.selection[i];

        this.changeNotePosition(note, note.start + (after - before));
      }

      CHIRPTRACKER.updateTrack(this.track);
      this.update();
      this.trackView.update();
    }

  },

  shiftSelectionKey: function(before, after) {

    before = this.grid(before);
    after = this.grid(after);

    if (after - before) {
      for (var i = 0; i < this.selection.length; i++) {
        var note = this.selection[i];

        this.setNoteKey(note, note.key + (after - before));
      }

      CHIRPTRACKER.updateTrack(this.track);
      this.update();
      this.trackView.update();
    }

  },

  changeNotePosition: function(note, position) {

    if (position < 0) return;
    var delta = position - note.start;
    var clip = this.getClipForPosition(note.start);
    var destinationClip = this.getClipForPosition(position);

    if (clip && (position < clip.start || position >= clip.start + clip.duration)) return;

    if (!clip && destinationClip) return;

    var notes = this.getSimilarNotes(note);

    for (var i = 0; i < notes.length; i++) {
      notes[i].start += delta;
    }
  },

  onnoterelease: function(key, octave, absolute) {
    this.playingNote = false;
    this.playingNoteIndex = -1;
    this.track.instrument.stop(absolute);
    this.pressedNotes[absolute] = false;

  },

  onmouseover: function() {
    this.mouseIn = true;
  },

  onmouseout: function() {
    this.mouseIn = false;
  },

  playSingleNote: function(absolute) {
    this.stopSingleNote();

    this.lastNote = absolute;

    this.track.instrument.play({
      key: absolute,
      duration: 0
    });

    this.pressedNotes[absolute] = true;

  },

  stopSingleNote: function() {
    if (this.lastNote) {
      this.track.instrument.stop(this.lastNote);
      this.pressedNotes[this.lastNote] = false;

    }
  },

  onnotepress: function(key, octave, absolute) {
    this.pressedNotes[absolute] = true;

    this.track.instrument.play({
      key: absolute,
      duration: 0
    });

    this.playingNote = true;
    this.playingNoteTimestamp = CHIRPTRACKER.time;



    if (CHIRPTRACKER.engine.playing) {
      // this.playingNoteIndex = this.track.addNote((this.track.position / 0.1 | 0) * 0.1, 0.1, absolute);
    }

    if (this.playingNoteIndex > -1) {
      this.track.notes[this.playingNoteIndex].timestamp = this.time;
    }


  },



  onmousedown: function(x, y, button) {

    x -= this.paddingLeft;

    if (x < 0) {

      return;
    }

    this.mouseStart = {
      x: x,
      y: y,
      position: this.positionUnderCursor,
      key: this.mousePianoKey
    };

    switch (button) {
      case 1:
        /* change note duration */

        /* select box */
        if (CHIRPTRACKER.keystate["ctrl"]) {
          this.mousemoveAction = "drawSelectBox";
          this.selectBox = [x, y, x, y];
        } else {

          if (this.hoveredNote) {
            if (this.selection.length === 0 || this.selection.indexOf(this.hoveredNote) === -1) this.selection = [this.hoveredNote];
            if (this.hoveredNoteInsideOffset > 0.8) {
              this.mousemoveAction = "changeNoteLength";
            } else {
              this.mousemoveAction = "changeNotePosition";
            }
          } else {
            this.clearSelection();
            var note = this.addNote((this.positionUnderCursor / this.step | 0) * this.step, this.step, this.mousePianoKey);
            if (!this.engine.playing) this.playSingleNote(this.mousePianoKey);
            this.mousemoveAction = "changeNotePosition";
            this.hoverNote(x, y, note);
            this.selection = [note];
          }
        }
        break;

      case 2:
        this.scrollStartUp = this.up;
        break;
      case 3:
        if (this.hoveredNote) {
          this.removeNote(this.hoveredNote);
          this.hoveredNote = null;
          this.clearSelection();

        }
        break;
    }


  },

  onmousemove: function(x, y) {

    if (this.orientation) {
      var t = y;
      y = this.canvas.height - x;
      x = this.canvas.width - t;
    }

    this.mouseX = x;
    this.mouseY = y;

    x -= this.paddingLeft;

    this.positionUnderCursor = this.position + x / this.beatWidth;
    this.gridPositionUnderCursor = this.grid(this.positionUnderCursor);
    this.mousePianoKey = this.up - y / this.noteHeight + 1 | 0;


    /* scrolling */

    if (CHIRPTRACKER.mouseButtonsState[2]) {
      this.position += ((this.lastMouseX - x) || 0) / (this.beatWidth);
      this.scrollStartUp -= ((this.lastMouseY - y) || 0) / (this.noteHeight);
      this.up = this.scrollStartUp | 0;
      this.update();
    }

    switch (this.mousemoveAction) {
      case "drawSelectBox":
        this.selectBox[2] = x;
        this.selectBox[3] = y;
        break;
      case "changeNoteLength":
        var duration = this.grid(this.positionUnderCursor - this.hoveredNote.start);
        if (duration > 0)
          this.changeNoteDuration(this.hoveredNote, duration)

        break;

      case "changeNotePosition":

        //this.changeNotePosition(this.hoveredNote, this.grid(this.positionUnderCursor));
        this.shiftSelectionPosition(this.mouseStart.position, this.grid(this.positionUnderCursor));
        this.shiftSelectionKey(this.mouseStart.key, this.mousePianoKey);

        this.mouseStart.position = this.positionUnderCursor;
        this.mouseStart.key = this.mousePianoKey;


        if (!this.engine.playing && this.mousePianoKey !== this.lastNote && this.selection.length === 1) this.playSingleNote(this.mousePianoKey);

        break;

      default:

        var noteIndex = this.getNoteUnderCursor(x, y);
        var note = this.track.notes[noteIndex];

        if (note) {

          if (CHIRPTRACKER.mouseButtonsState[3]) {

            /* remove note */

            this.removeNote(note);
            this.clearSelection();
          } else {

            /* just update hovered note */
            this.hoverNote(x, y, note);
          }
        } else {

          /* unset hovered note */

          if (CHIRPTRACKER.distance(x, y, this.lastHoveredX, this.lastHoveredY) > 6) {
            this.hoveredNote = null;
          }
        }
        break;
    }

    this.mouseNoteHelperKey = (y / this.noteHeight | 0);

    this.lastMouseX = x;
    this.lastMouseY = y;
  },

  onmouseup: function() {
    switch (this.mousemoveAction) {
      case "drawSelectBox":
        this.boxToSelection();
        break;
    }

    this.draggingClip = false;
    this.mousemoveAction = "none";
    this.stopSingleNote();
  },

  onmousewheel: function(x, y, delta) {
    if (CHIRPTRACKER.keystate["shift"]) {
      this.position -= delta / 2;
    } else if (CHIRPTRACKER.keystate["alt"]) {
      var change = delta / 10;
      var beforeBeat = x / this.beatWidth + this.position;

      if (this.setScale(this.scale + change)) {
        var afterBeat = x / this.beatWidth + this.position;
        var s = (x - x * (1 - change));
        this.position += (beforeBeat - afterBeat);
      }
    } else {
      this.up += delta;
      this.update();
    }
  }
};
