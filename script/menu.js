CHIRPTRACKER.menu = {

  create: function() {
    this.$menu = document.querySelector("#menu");

    this.$meta = this.$menu.querySelector(".meta");

    this.$save = this.$menu.querySelector(".save");
    this.$save.addEventListener("click", this.save.bind(this));

    this.$share = this.$menu.querySelector(".share");
    this.$edit = this.$menu.querySelector(".edit");
    this.$zip = this.$menu.querySelector(".zip");


    this.$saveready = this.$menu.querySelector(".saveready");

    this.$close = this.$menu.querySelector(".close");
    this.$close.addEventListener("click", this.hide.bind(this));

    this.$record = this.$menu.querySelector(".record");
    this.$record.addEventListener("click", function() {
      CHIRPTRACKER.recorderPanel.show();
      CHIRPTRACKER.menu.hide();
    });

    this.$bpm = this.$menu.querySelector(".bpm");

    this.$bpm.addEventListener("click", function() {
      var bpm = prompt("BPM", CHIRPTRACKER.engine.bpm);
      if (bpm) CHIRPTRACKER.engine.setTempo(bpm | 0);
    });

  },

  center: function() {
    this.$menu.style.left = (window.innerWidth / 2 - this.$menu.offsetWidth / 2 | 0) + "px";
    this.$menu.style.top = (window.innerHeight / 2 - this.$menu.offsetHeight / 2 | 0) + "px";
  },

  show: function() {
    this.$menu.style.display = "block";
    this.$meta.value = JSON.stringify(CHIRPTRACKER.engine.meta, null, "  ");
    this.center();
  },

  hide: function() {
    this.$menu.style.display = "none";
  },

  save: function() {
    var panel = this;

    var song = CHIRPTRACKER.save();

    this.$saveready.style.display = "none";

    try {
      var meta = JSON.parse(this.$meta.value);
    } catch (e) {
      alert("Your JSON is not really valid")
      return;
    }

    song.meta = meta;

    if (!CHIRPTRACKER.pass) CHIRPTRACKER.id = 0;

    CHIRPTRACKER.post("save", {
      song: song,
      id: CHIRPTRACKER.id,
      pass: CHIRPTRACKER.pass
    }, function(error, respsonse) {

      var body = JSON.parse(respsonse);

      if (body.error) {
        alert("error: " + body.message);
      } else {
        CHIRPTRACKER.id = body.id;
        CHIRPTRACKER.pass = body.pass;

        var shareUrl = window.location.origin + "/player/" + CHIRPTRACKER.id;
        panel.$share.setAttribute("href", shareUrl);
        // panel.$share.innerHTML = shareUrl;

        var editUrl = window.location.origin + "/composer/#open=" + CHIRPTRACKER.id + "," + CHIRPTRACKER.pass;
        panel.$edit.setAttribute("href", editUrl);
        // panel.$edit.innerHTML = editUrl;

        var zipUrl = window.location.origin + "/zip/" + CHIRPTRACKER.id + ".zip";
        panel.$zip.setAttribute("href", zipUrl);

        location.hash = "#open=" + CHIRPTRACKER.id + "," + CHIRPTRACKER.pass;

        panel.$saveready.style.display = "block";
      }

    });

  }

};

CHIRPTRACKER.menu.create();