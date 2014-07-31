(function() {

  var Panel = function(container, instrument) {
    var panel = this;

    this.container = container;
    this.instrument = instrument;


    this.canvas = document.createElement("canvas");
    this.layer = this.canvas.getContext("2d");
    this.container.appendChild(this.canvas);

    this.container.appendChild(document.createElement("br"));


    this.pickers = [];

    for (var i = 0; i < 12; i++) {
      var picker = document.createElement("div");

      this.container.appendChild(picker);


      picker.innerHTML = CHIRPTRACKER.names[i];
      picker.style.display = "inline-block";
      picker.style.width = "24px";
      picker.style.height = "24px";
      picker.style.lineHeight = "24px";
      picker.style.background = "#888";
      picker.style.borderRight = "2px solid #fff";

      picker.chirptrackerDrum = i;

      picker.addEventListener("click", function() {
        panel.pick(this.chirptrackerDrum);
      });

      this.pickers.push(picker);
    }

    this.textarea = document.createElement("textarea");
    this.textarea.style.display = "block";
    this.textarea.style.width = "480px";
    this.textarea.style.height = "320px";

    this.container.appendChild(this.textarea);

    setInterval(function() {
      if (!CHIRPTRACKER.engine.playing && panel.container.style.display === "block" && CHIRPTRACKER.lockKeyboard) {
        panel.instrument.play({
          key: panel.index
        });
      }
    }, 500);

    this.instrument.onnote = function(note, key) {
      panel.onnote(note, key);
    };

    this.baseVolumeInput = this.addInput("volume", 0, 1, 0.05, function(value) {
      instrument.volume = value;
      instrument.output.gain.value = value;
    });

    this.pick(0);

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

    onnote: function(note, key) {
      var self = this;
      this.pickers[key].style.background = "#fff";

      setTimeout(function() {
        self.resetPicker(key);
      }, 50)
    },

    resetPicker: function(i) {
      var picker = this.pickers[i];
      if (i === this.index) {
        picker.style.background = "#a00";

      } else {
        picker.style.background = "#888";
      }

    },

    pick: function(i) {
      var panel = this;

      this.index = i;

      var picker = this.pickers[i];

      this.pickers.forEach(function(ui, i) {
        panel.resetPicker(i);
      });

      if (this.instrument.data[i]) {
        var text = JSON.stringify(this.instrument.data[i]);
      } else {
        var text = "[]";
      }

      text = text.replace(/],/g, "],\n  ", true);
      text = text.replace(/,/g, ", ", true);
      text = text.replace(/\[\[/g, "[\n  [", true);
      text = text.replace(/]]/g, "]\n  ]", true);

      this.textarea.value = text;

      this.textarea.addEventListener("keyup", function() {
        panel.queueUpdate();
      });

      this.textarea.addEventListener("focus", function() {
        CHIRPTRACKER.lockKeyboard = true;
      });

      this.textarea.addEventListener("blur", function() {
        CHIRPTRACKER.lockKeyboard = false;
      });

      this.render();
    },

    render: function(data) {
      var width = this.canvas.width;
      var height = this.canvas.height;
      var data = this.instrument.raw[this.index];

      this.layer.fillStyle = "#ac3232";
      this.layer.fillRect(0, 0, width, height);

      var dw = width / data.length;
      var x = 0;
      var h2 = height / 2;

      this.layer.strokeStyle = '#ffffff';
      this.layer.beginPath();
      this.layer.moveTo(x, h2);

      for (var i = 0; i < data.length; ++i) {
        this.layer.lineTo(x, h2 * (1 - data[i]));
        x += dw;
      }
      this.layer.stroke();
    },

    queueUpdate: function() {
      var panel = this;

      this.container.style.background = "#00a";

      if (this.updateTimer) clearTimeout(this.updateTimer);

      this.updateTimer = setTimeout(function() {
        panel.update();
      }, 500);
    },

    onopen: function() {
      this.canvas.width = 480;
      this.canvas.height = 160;

      this.refresh();
    },

    refresh: function() {
      this.render();
      this.baseVolumeInput.value = this.instrument.volume;
    },

    update: function() {
      try {
        this.instrument.data[this.index] = JSON.parse(this.textarea.value || "[]");
        this.instrument.createSample(this.index);
        this.container.style.background = "#000";
      } catch (e) {
        this.container.style.background = "#f00";
      }
      this.render();
    }

  };

  CHIRP.instruments.drumkit.prototype.panel = Panel;
  CHIRP.instruments.drumkit.prototype.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QgXEB84ZrSUxgAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAADxSURBVGjeY7zg5vGfYQgDJoYhDkY9MGg9UHLvDUPJvTcD7kBC7hjyMcCCS6JHSQQeAsh8eoY8MfYO3xggNSb4VvSRZPGniCKKQn7YxAAjqTUxLIRmnVpEVYekmcWRldeGfx5AT+Oz0EIMBkiNEUL6ceWRkRcDpJYu1AIwewnFxMjJA+iA0lKIWqXYaHN61AO0zgOw8praNS+5baWRWwpRWvNSK8RH6wFqxQi5IT4aA8TGCHqPbrQeGPXAqAdGPTDqgVEPjHqAHA/0KInQfWR6tC1ETJtmMMzejOzW6GCJkdH+AL3a/aMV2agHRj0wTD0AABEXTs2XmgVTAAAAAElFTkSuQmCC";
  CHIRP.instruments.drumkit.prototype.name = "Acko Drums";
  CHIRP.instruments.drumkit.prototype.author = "code: Steven Wittens / plugin: Rezoner";
  CHIRP.instruments.drumkit.prototype.desc = "Highly moddable drum synth";
  CHIRP.instruments.drumkit.prototype.color = "#d04648";

})();