setTimeout(function() {

  var get = function(url, callback) {

    var xhr = new XMLHttpRequest();

    xhr.open('GET', location.origin + "/" + url, true);

    xhr.onload = function() {
      callback(false, this.responseText);
    };
    xhr.onerror = function() {
      callback(true);
    };

    xhr.send("");
  };

  var params = {};

  if (location.hash) {

    var args = location.hash.substr(1).split(";");

    for (var i in args) {
      var pair = args[i].split("=");

      if (pair.length === 2) {
        params[pair[0]] = pair[1];
      }
    }
  }

  var chirp = new CHIRP.Engine;

  if (!chirp.start()) {
    alert("I am sorry Dave, but for now it works only in chrome.");
  }

  if (params.open) {

    var info = params.open.split(",");

    get("raw/" + info[0], function(err, response) {
      var data = JSON.parse(response);
      chirp.open(data.song.data);
      CHIRPTRACKER.id = info[0];
      CHIRPTRACKER.pass = info[1];
      CHIRPTRACKER.boot(chirp);

      if (!info[1]) {
        CHIRPTRACKER.engine.meta.public = false;
      }
    });
  } else {
    CHIRPTRACKER.boot(chirp);
  }



}, 1);