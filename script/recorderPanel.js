CHIRPTRACKER.recorderPanel = {

  create: function() {
    var panel = this;

    this.$panel = document.querySelector("#recorder");

    this.$panel.querySelector(".record").addEventListener("click", function() {
      panel.record();
    });

    this.$panel.querySelector(".record-loop").addEventListener("click", function() {
      panel.recordLoop();
    });

    this.$panel.querySelector(".close").addEventListener("click", function() {
      panel.hide();
    });

  },

  record: function() {
    var panel = this;

    CHIRPTRACKER.engine.range = false;
    CHIRPTRACKER.engine.seek(0);


    setTimeout(function() {
      CHIRPTRACKER.layer.fillStyle = "#a00";
      CHIRPTRACKER.layer.fillRect(0, 0, CHIRPTRACKER.canvas.width, CHIRPTRACKER.canvas.height);

      CHIRPTRACKER.startRecording();
      CHIRPTRACKER.engine.play();
    }, 1000);

    CHIRPTRACKER.engine.onrestart = function() {

      CHIRPTRACKER.engine.pause();
      CHIRPTRACKER.engine.onrestart = null;

      setTimeout(function() {
        CHIRPTRACKER.stopRecording();
      }, 2000);

    };

  },


  recordLoop: function() {
    var panel = this;



    CHIRPTRACKER.engine.range = false;
    CHIRPTRACKER.engine.seek(0);

    var padding = 4;

    // var duration = CHIRPTRACKER.engine.length * 60000 / CHIRPTRACKER.engine.bpm | 0;
    // var paddingDuration = padding * 60000 / CHIRPTRACKER.engine.bpm | 0;

    CHIRPTRACKER.engine.seek(CHIRPTRACKER.engine.length - padding);

    setTimeout(function() {
      CHIRPTRACKER.engine.play();
    }, 1000);


    CHIRPTRACKER.engine.onrestart = function() {

      CHIRPTRACKER.layer.fillStyle = "#a00";
      CHIRPTRACKER.layer.fillRect(0, 0, CHIRPTRACKER.canvas.width, CHIRPTRACKER.canvas.height);

      CHIRPTRACKER.startRecording();


      CHIRPTRACKER.engine.onrestart = function() {
        CHIRPTRACKER.engine.pause();
        CHIRPTRACKER.engine.onrestart = null;
        CHIRPTRACKER.stopRecording();        
      };

    };

  },

  show: function() {
    this.$panel.style.display = "block";
  },

  hide: function() {
    this.$panel.style.display = "none";
  },


};

CHIRPTRACKER.recorderPanel.create();