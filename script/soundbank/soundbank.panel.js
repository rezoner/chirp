(function() {

  var Panel = function(container, instrument) {
    var panel = this;

    this.container = container;
    this.instrument = instrument;
    this.container.style.maxWidth = "320px";

    // CHIRPTRACKER.get("samples/noise-maker-hard-70.b64", {}, function(error, response) {});


    function onclick() {
      panel.load(this.innerHTML);
    };

    for (var name in this.instrument.instruments) {
      var button = document.createElement("button");
      button.innerHTML = name;
      button.addEventListener("click", onclick);
      this.container.appendChild(button);
    }

    var instrument = this.instrument;

    this.baseVolumeInput = this.addInput("volume", 0, 1, 0.05, function(value) {
      instrument.volume = value;
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
      this.baseVolumeInput.value = this.instrument.volume;
    },

    load: function(sampleName) {
      this.instrument.load(sampleName);
    },


    onopen: function() {
      this.refresh();
    }
  };


  CHIRP.instruments.soundbank.prototype.panel = Panel;

  CHIRP.instruments.soundbank.prototype.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QkBFCEkfGta2wAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAEuSURBVGje7Vi7EYMwDEW5FAxCmZKGAVghG1BmmpRskBUYgIYyZQZx51S+S4iJLX8wmKc7Gk4gvydbTzLVXSWLHdup2LkBAAAAAACktbPJoWnLpAscB3HwDNgyEdpsM3+cDKx1JriZZgGY+lcx9b/vb4+L1v9+fTqBqLsqXgak/G5eiYjlbzLT/yBkAJC6CnHN9YzYVqOoAJaqk2+V0gKY13fFgA0TOh8fvWjachsZCMGwMwDFoGsPpL7j6gA3fj5VaI5UMfC5l3VtxNJ+9+lex0Fo4+v+m6+QjYPwYlExR0R/H9/40XVgaRFNW4bVgViTmO/8YIqfrw6E0gPoAOaB3OYB7szK9Y8KoO4qVlk0zQOrX6uE0AWcAdcMpL6lPm4GtrbnIWQAAAAAAABB7Q02NXL6oUahdwAAAABJRU5ErkJggg==";
  CHIRP.instruments.soundbank.prototype.name = "Soundbank";
  CHIRP.instruments.soundbank.prototype.author = "Rezoner";
  CHIRP.instruments.soundbank.prototype.desc = "Variety of sampled instruments";
  CHIRP.instruments.soundbank.prototype.color = "#6daa2c";
})();