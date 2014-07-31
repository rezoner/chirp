ENGINE.Loader = function() {

  /* all items to load */
  this.total = 0;

  /* items in queue */
  this.count = 0;

  /* convenient progress from 0 to 1 */
  this.progress = 0;

  /* all functions fired when the loading is over */
  this.callbacks = []

  this.loading = false;
};

ENGINE.Loader.prototype = {

  /* tell the loader that we are adding some item (for manual use only) */
  add: function() {
    this.loading = true;
    this.count++;
    this.total++;
  },

  audio: function(audio) {
    var loader = this;

    audio.addEventListener("canplay", function() {
      loader.onItemReady();
    });

    audio.addEventListener("error", function() {
      loader.onItemError(this.src);
    });

    this.add();
  },

  image: function(image) {
    var loader = this;

    /* listen to when the image is ready */
    image.addEventListener("load", function() {
      loader.onItemReady();
    });

    image.addEventListener("error", function() {
      loader.onItemError(this.src);
    });

    this.add();
  },

  /* sometimes it is convinient to simulate loading by using timeout */
  foo: function(duration) {
    var loader = this;

    this.add();

    setTimeout(function() {
      loader.onItemReady();
    }, duration);
  },

  /* what should happen when the loading is done */
  ready: function(callback) {
    if (!this.loading) {

      /* if nothing to load just fire the callback */
      callback();
    } else {

      /* if loading add the callback for later execution */
      this.callbacks.push(callback);
    }

  },

  /* called when one item finished loading */
  onItemReady: function() {
    this.count--;
    this.progress = (this.total - this.count) / this.total;

    if (this.count <= 0) {
      this.loading = false;

      /* run all the callbacks */
      for (var i = 0; i < this.callbacks.length; i++) {
        this.callbacks[i]();
      }

      this.callbacks = [];
      this.total = 0;
    }
  },

  /* called when some item failed */
  onItemError: function(source) {
    console.log("unable to load ", source);
  }
};
