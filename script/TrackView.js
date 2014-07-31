CHIRPTRACKER.TrackView = function(args) {

  CHIRPTRACKER.extend(this, args);

  this.color = CHIRPTRACKER.tracksColorsBag.pull();

  this.lighter = "#" + (("0x" + this.color.substr(1) | 0) + 0x111111).toString(16);

  this.layer = CHIRPTRACKER.layer;

  this.innerWidth = this.width;
  this.innerHeight = this.height - this.paddingTop;

  this.update();
  CHIRPTRACKER.updateTrack(this.track);


  this.background = cq.color(this.color).blendOn(CHIRPTRACKER.palette.workspace, "dodge", 0.5).toHex();
  this.background = cq.color("#fff").blendOn(CHIRPTRACKER.palette.workspace, "normal", 0.1).toHex();

  this.darker = cq.color(this.color).shiftHsl(0, 0, -0.05).toHex();
};

CHIRPTRACKER.TrackView.prototype = {
  paddingTop: 20,

  /* snap to bar */
  grid: function(value) {
    return (value / 4 | 0) * 4;
  },

  canDropClip: function(position, duration, ignore) {

    for (var i = this.track.clips.length - 1; i >= 0; i--) {
      var clip = this.track.clips[i];

      if (i === ignore) continue;

      if (!(position + duration <= clip.start || position >= clip.start + clip.duration)) {
        return false;
        break;
      }
    };

    return true;
  },

  moveClip: function(clipIndex, position) {
    var clip = this.track.clips[clipIndex];

    if (this.canDropClip(position, clip.duration, clipIndex)) {

      var notes = this.copyNotes(clip.start, clip.duration);

      this.clearNotes(clip.start, clip.duration);

      this.insertNotes(position, notes);
      this.track.clips[clipIndex].start = position;

      CHIRPTRACKER.updateTrack(this.track);

      this.update();
    }
  },

  removeClip: function(clipIndex) {
    var clip = this.track.clips[clipIndex];

    this.track.clips.splice(clipIndex, 1);

    this.clearNotes(clip.start, clip.duration);
  },

  unclipNotes: function(clipIndex) {
    var clip = this.track.clips[clipIndex];

    this.track.clips.splice(clipIndex, 1);

    // this.clearNotes(clip.start, clip.duration);
  },

  insertNotes: function(position, notes) {
    for (var i = 0; i < notes.length; i++) {
      var note = notes[i];
      CHIRPTRACKER.addNote(this.track, position + note[0], note[1], note[2]);
    }
  },

  copyNotes: function(position, duration) {
    var a = position;
    var b = a + duration
    var track = this.track;
    var notes = [];

    for (var i = 0; i < track.notes.length; i++) {
      var note = track.notes[i];

      if (note.start >= a && note.start < b) notes.push([
        note.start - a,
        note.duration,
        note.key
      ]);
    }

    return notes;
  },

  clearNotes: function(position, duration) {
    var a = position;
    var b = a + duration
    var track = this.track;

    for (var i = 0; i < track.notes.length; i++) {
      var note = track.notes[i];

      if (note.start >= a && note.start < b) track.notes[i] = null;
    }

    CHIRPTRACKER.cleanArray(track.notes);

    CHIRPTRACKER.updateTrack(track);

  },

  cloneClip: function(clipIndex, position) {
    var clip = this.track.clips[clipIndex];

    if (this.canDropClip(position, clip.duration, clipIndex)) {

      var notes = this.copyNotes(clip.start, clip.duration);

      this.clearNotes(position, clip.duration);
      CHIRPTRACKER.addClip(this.track, position, clip.duration, clip.name, notes);
      CHIRPTRACKER.updateTrack(this.track);

      this.update();
    }
  },

  freeClipName: function() {
    var max = 0;
    for (var i = 0; i < this.track.clips.length; i++) {
      var val = this.track.clips[i].name | 0;
      if (val > max) max = val;
    }

    return max + 1;
  },

  dropClip: function() {
    var notes = [];
    var a = CHIRPTRACKER.pianoRoll.range[0];
    var b = a + CHIRPTRACKER.pianoRoll.range[1]
    var track = CHIRPTRACKER.pianoRoll.track;

    for (var i = 0; i < track.notes.length; i++) {
      var note = track.notes[i];

      if (note.start >= a && note.start < b) notes.push([
        note.start - a,
        note.duration,
        note.key
      ]);
    }

    CHIRPTRACKER.addClip(this.track, this.rack.gridPositionUnderCursor, b - a, this.freeClipName(), notes);
    this.track.update();
  },

  update: function() {
    this.up = 0;
    this.down = 256;

    for (var j = 0; j < this.track.notes.length; j++) {
      var note = this.track.notes[j];
      if (note.key > this.up) this.up = note.key;
      if (note.key < this.down) this.down = note.key;
    }

    this.up++;
    this.down--;

    if (this.track.notes.length)
      this.diff = Math.abs(this.up - this.down) + 1;
    else
      this.diff = 1;

    this.noteHeight = (this.innerHeight) / (this.diff);

    for (var j = 0; j < this.track.clips.length; j++) {
      var clip = this.track.clips[j];
      if (clip.start + clip.duration > CHIRPTRACKER.engine.length) {
        CHIRPTRACKER.engine.length = clip.start + clip.duration;
      }
    }
  },

  onstep: function() {

  },

  onrender: function() {

    this.layer.save();
    this.layer.font = "20px pixel";
    this.layer.translate(0, this.paddingTop);

    if (this.playingNote) {
      if (this.playingNoteIndex > -1) {
        this.track.notes[this.playingNoteIndex].duration = (CHIRPTRACKER.time - this.playingNoteTimestamp) / CHIRPTRACKER.engine.beatDuration;
        this.track.notes[this.playingNoteIndex].timestamp = CHIRPTRACKER.time;
      }
    }

    this.layer.textBaseline = "top";

    var o = -(this.rack.position * this.rack.beatWidth) % this.rack.beatWidth | 0;
    var o4 = -(this.rack.position * this.rack.beatWidth) % (this.rack.beatWidth * 8) | 0;
    var oBar = -(this.rack.position * this.rack.beatWidth) % this.rack.barWidth * 2 | 0;

    /* draw bars */
    this.layer.fillStyle = this.background;
    this.layer.fillRect(0, 0, this.innerWidth, this.innerHeight);

    for (var j = 0; j <= this.rack.bars + 1; j++) {
      this.layer.fillStyle = j % 2 ? CHIRPTRACKER.palette.background2 : CHIRPTRACKER.palette.background;
      //this.layer.fillRect(o4 + j * this.rack.barWidth, 0, this.rack.barWidth, this.innerHeight);
    }

    /* draw clips */

    for (var j = 0; j < this.track.clips.length; j++) {
      var clip = this.track.clips[j];

      var x = (clip.start - this.rack.position) * this.rack.beatWidth | 0;
      var width = clip.duration * this.rack.beatWidth | 0;
      var height = this.innerHeight + this.paddingTop;

      var mod = Math.min(1, (CHIRPTRACKER.time - (clip.timestamp || 0)) / 0.5);

      //this.layer.globalAlpha = 0.5;
      this.layer.fillStyle = this.color;

      if (mod < 1) {
        var elastic = CHIRPTRACKER.easeOutBounce(mod, 0, 1, 1);


        //this.layer.fillStyle = "#fff";
        this.layer.save();
        this.layer.translate(x + width / 2, this.innerHeight / 2)

        this.layer.scale(0.6 + 0.4 * elastic, elastic);
        //this.layer.fillRect(-width / 2, -this.innerHeight / 2, width, this.innerHeight);
        this.layer.fillRect(-width / 2, -this.innerHeight / 2, width, this.innerHeight);

        //this.layer.fillRect(x, -this.paddingTop, width, this.innerHeight + this.paddingTop);

        this.layer.restore();

        var elastic = 1 - CHIRPTRACKER.easeOutBounce(mod, 0, 1, 1);

        this.layer.save();
        this.layer.translate(x + width / 2, this.innerHeight / 2)
        this.layer.fillStyle = "#fff";

        this.layer.scale(1 - 0.25 * elastic, elastic);
        this.layer.fillRect(-width / 2, -this.innerHeight / 2, width, this.innerHeight);
        this.layer.restore();



      } else {
        this.layer.fillRect(x, -this.paddingTop, width, this.innerHeight + this.paddingTop);
      }


      this.layer.fillStyle = this.darker;
      this.layer.fillRect(x, -this.paddingTop, width, this.paddingTop);

      if (width > 24) {
        this.layer.fillStyle = "#fff";
        this.layer.fillText(clip.name, x + 6, -this.paddingTop);
      }

      this.layer.globalAlpha = 1.0;
      // this.layer.fillStyle = this.lighter;
      // this.layer.fillRect(x + width - 2, -this.paddingTop, 2, this.innerHeight + this.paddingTop);



    }

        /* draw steps */

    this.layer.fillStyle = CHIRPTRACKER.palette.workspace;

    for (var j = 1; j <= this.rack.bars; j++) {
      this.layer.fillRect(o4 + j * this.rack.barWidth - 2, 0, 2, this.innerHeight);
    }


    /* draw piano roll view */

    if (CHIRPTRACKER.pianoRoll.track === this.track) {
      this.layer.fillStyle = "rgba(0,0,0,0.25)";

      this.layer.fillRect((CHIRPTRACKER.pianoRoll.position - this.rack.position) * this.rack.beatWidth | 0,
        0,
        CHIRPTRACKER.pianoRoll.beats * this.rack.beatWidth | 0, this.innerHeight);

      this.layer.fillStyle = "#222";

      //      this.layer.fillRect((CHIRPTRACKER.pianoRoll.position - this.rack.position) * this.rack.beatWidth | 0, -4,
      // CHIRPTRACKER.pianoRoll.beats * this.rack.beatWidth | 0, 4);

      this.layer.fillRect((CHIRPTRACKER.pianoRoll.position - this.rack.position) * this.rack.beatWidth | 0,
        this.innerHeight,
        CHIRPTRACKER.pianoRoll.beats * this.rack.beatWidth | 0, 4);
    }

    /* clip clonning feedback */

    if (this.action == "clone-clip") {
      var canDrop = this.canDropClip(this.rack.positionUnderCursor, this.draggedClip.duration);
      this.layer.fillStyle = canDrop ? "#fff" : "#a00";
      this.layer.fillRect((this.grid(this.rack.positionUnderCursor - this.rack.position)) * this.rack.beatWidth, 0, this.draggedClip.duration * this.rack.beatWidth, this.innerHeight);
    }

    if (this.action == "creating-clip") {
      if (this.clipStart <= this.rack.gridPositionUnderCursor) {
        this.layer.fillStyle = "#fff";
        this.layer.fillRect((this.clipStart - this.rack.position) * this.rack.beatWidth, 0, (this.rack.gridPositionUnderCursor + 4 - this.clipStart) * this.rack.beatWidth, this.innerHeight);
      }
    }

    /* draw notes */

    for (var j = 0; j < this.track.notes.length; j++) {
      var note = this.track.notes[j];


      var noteHeight = this.noteHeight;

      var offset = note.key % 12;
      var octave = note.key / 12 | 0;
      var name = CHIRPTRACKER.names[offset];

      var x = (note.start - this.rack.position) * this.rack.beatWidth | 0;
      var y = (this.up - note.key) * this.noteHeight | 0;
      var width = Math.max(2, note.duration * this.rack.beatWidth | 0);

      this.layer.fillStyle = "#fff";
      this.color;
      this.layer.fillRect(x, y, width - 1 | 0, noteHeight);

    }

    this.layer.restore();

  },

  whatIsUnderCursor: function() {

    var result = {
      clip: false
    };

    for (var i = this.track.clips.length - 1; i >= 0; i--) {
      var clip = this.track.clips[i];

      if (this.rack.positionUnderCursor > clip.start && this.rack.positionUnderCursor < clip.start + clip.duration) {
        result.clip = clip;
        result.clipIndex = i;
        break;
      }

    };


    return result;
  },

  select: function() {
    CHIRPTRACKER.pianoRoll.track = this.track;
    CHIRPTRACKER.pianoRoll.trackView = this;
    CHIRPTRACKER.pianoRoll.position = this.rack.gridPositionUnderCursor || 0;
    CHIRPTRACKER.pianoRoll.update();
  },

  onmousedown: function(x, y, button) {
    this.cursor = this.whatIsUnderCursor();

    switch (button) {
      case 1:

        this.select();

        if (this.cursor.clip && y < this.paddingTop) {
          this.draggedClip = this.cursor.clip;
          this.draggedClipIndex = this.cursor.clipIndex;

          this.lastClipPosition = this.grid(this.cursor.clip.start);

          if (CHIRPTRACKER.keystate.shift) {
            this.action = "clone-clip";
          } else {
            this.action = "move-clip";
          }
        }

        break;
      case 3:
        if (!this.cursor.clip) {
          this.action = "creating-clip";
          this.clipStart = this.rack.gridPositionUnderCursor;
        }
        break;
    }
  },

  onmouseup: function(x, y, button) {
    if (CHIRPTRACKER.pianoRoll.draggingClip && this.canDrop) {
      this.dropClip();
    }

    switch (button) {

      /* left button */

      case 1:

        switch (this.action) {
          case "clone-clip":
            this.cloneClip(this.draggedClipIndex, this.rack.gridPositionUnderCursor);
            break;
        }

        break;

        /* right button */

      case 3:
        switch (this.action) {

          case "creating-clip":

            if (this.clipStart <= this.rack.gridPositionUnderCursor) {
              CHIRPTRACKER.addClip(this.track, this.clipStart, this.rack.gridPositionUnderCursor + 4 - this.clipStart, this.freeClipName(), []);
              CHIRPTRACKER.updateTrack(this.track);
              this.update();
            }
            break;
          default:
            if (this.cursor.clip) {
              if (y < 24) {
                this.unclipNotes(this.cursor.clipIndex);
              } else {
                this.removeClip(this.cursor.clipIndex);
              }
            }
            break;
        }

        break;
    }

    this.action = "none";
  },

  onmousemove: function(x, y) {

    this.cursor = this.whatIsUnderCursor();

    if (CHIRPTRACKER.mouseButtonsState[1]) {
      CHIRPTRACKER.pianoRoll.position = this.rack.gridPositionUnderCursor;
    }

    switch (this.action) {
      case "move-clip":
        this.moveClip(this.draggedClipIndex, this.rack.gridPositionUnderCursor);

        break;
      default:

        break;
    }

  }
};