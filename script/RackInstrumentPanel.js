CHIRPTRACKER.RackInstrumentPanel = function(args) {

  var panel = this;

  CHIRPTRACKER.extend(this, args);

  this.engine = CHIRPTRACKER.engine;

  this.instrumentName = this.track.instrument.pluginName;
  this.instrument = this.track.instrument;
  this.icon = CHIRPTRACKER.getInstrumentIcon(this.instrument.pluginName, this.track.view.color);
  // assets.image("instruments/" + this.track.instrument.pluginName);

  this.layer = CHIRPTRACKER.layer;

  /* */

  this.$wrapper = document.createElement("div");
  this.$wrapper.style.position = "absolute";
  this.$wrapper.style.zIndex = 255;
  this.$wrapper.style.top = 0;
  this.$wrapper.style.left = 0;
  this.$wrapper.style.display = "none";
  this.$wrapper.style.background = "#222";
  this.$wrapper.style.border = "2px solid #fff";
  this.$wrapper.style.padding = "16px";

  // this.$wrapper.setAttr("draggable", true);


  document.body.appendChild(this.$wrapper);

  this.$close = document.createElement("div");
  this.$close.style.height = "24px";
  this.$close.style.lineHeight = "24px";

  this.$close.style.background = "#0066ff";
  this.$close.style.marginBottom = "16px";
  this.$close.style.width = "50%";
  this.$close.style.display = "inline-block";

  this.$close.innerHTML = "CLOSE";



  this.$close.addEventListener("click", function() {
    panel.hidePanel();
  });

  this.$wrapper.appendChild(this.$close);


  this.$remove = document.createElement("div");
  this.$remove.style.height = "24px";
  this.$remove.style.lineHeight = "24px";
  this.$remove.style.width = "50%";
  this.$remove.style.display = "inline-block";

  this.$remove.style.background = "#aa0000";
  this.$remove.style.marginBottom = "16px";

  this.$remove.innerHTML = "remove";

  this.$remove.addEventListener("click", function() {    
    if (confirm("I am afraid of doing that Dave. Are you sure you want me to?")) {
      CHIRPTRACKER.rack.removeTrack(panel.track);
    }
  });

  this.$wrapper.appendChild(this.$remove);
  
  var p = document.createElement("p");
  p.innerHTML = this.instrument.name + " / " + this.instrument.author;

  this.$wrapper.appendChild(p);



  if (this.instrument.panel) {
    this.panel = new this.instrument.panel(this.$wrapper, this.track.instrument);
  }

};

CHIRPTRACKER.RackInstrumentPanel.prototype = {
  zIndex: 3,

  onrender: function() {
    var layer = CHIRPTRACKER.layer;
    layer.fillStyle = this.track.view.color;
    layer.fillRect(0, 0, this.width, this.height + 4);
//    layer.fillStyle = "#c40";
//    layer.fillRect(this.width, 0, 2, this.height + 4);
  //  layer.fillStyle = "rgba(0,0,0,0.25)";
    //  layer.fillRect(this.width + 2, 0, 4, this.height + 4);
    layer.drawImage(this.icon, 8, 10);
  },

  onmousedown: function() {
    this.track.view.select();
    this.showPanel();
  },

  showPanel: function() {

    for (var i = 0; i < CHIRPTRACKER.rack.gui.elements.length; i++) {
      var ui = CHIRPTRACKER.rack.gui.elements[i];

      if (ui instanceof CHIRPTRACKER.RackInstrumentPanel) {
        ui.hidePanel();
      }

    }

    this.$wrapper.style.display = "block";

    this.$wrapper.style.left = (window.innerWidth / 2 - this.$wrapper.offsetWidth / 2 | 0) + "px";
    this.$wrapper.style.top = (window.innerHeight / 2 - this.$wrapper.offsetHeight / 2 | 0) + "px";

    if (this.panel.onopen) this.panel.onopen();


  },

  hidePanel: function() {
    this.$wrapper.style.display = "none";
  }
};