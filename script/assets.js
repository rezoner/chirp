var ENGINE = { };

ENGINE.Assets = function(loader) {

  this.loader = loader;

  this.paths = {
    audio: "audio/",
    images: "images/",
    animations: "animations/"
  };

  this.data = {
    audio: {},
    images: {},
    animations: {}
  };

  var canPlayOgg = (new Audio).canPlayType('audio/ogg; codecs="vorbis"');
  var canPlayMp3 = (new Audio).canPlayType("audio/mp3");

  if (canPlayOgg) this.audioFormat = "ogg";
  else this.audioFormat = "mp3";
};

ENGINE.Assets.prototype = {

  /* get/set image */
  image: function(key, value) {
    if (value) {
      this.data.images[key] = value;
    } else {
      return this.data.images[key];
    }
  },

  /* add many images */
  addImages: function(filenames) {
    if (arguments.length > 1) {
      for (var i = 0; i < arguments.length; i++) {
        this.addImage(arguments[i]);
      }
    } else {
      for (var i = 0; i < filenames.length; i++) {
        this.addImage(filenames[i]);
      }
    }
  },

  /* add one image */
  addImage: function(filename) {
    var image = new Image;

    /* pass the image to the loader */
    this.loader.image(image);

    /* we gonna rip off extension */
    var key = filename.match(/(.*)\..*/)[1];

    /* add image to the assets */
    this.data.images[key] = image;

    /* lets search for image in defined path */
    image.src = this.paths.images + filename;
  },

  /* get image */
  animation: function(key) {
    return this.data.animations[key];
  },

  /* add many images */
  addAnimations: function(filenames) {
    for (var i = 0; i < filenames.length; i++) {
      this.addAnimation(filenames[i]);
    }
  },

  /* add one image */
  addAnimation: function(filename) {
    var assets = this;

    var animation = {};

    var image = new Image;

    /* load image */

    this.loader.image(image);

    var key = filename.match(/(.*)\..*/)[1];

    this.data.animations[key] = animation;

    image.src = this.paths.animations + filename;

    animation.image = image;

    /* load animation data */

    this.loader.add();

    utils.xhr(this.paths.animations + key + ".json", {}, function(error, response) {
      var data = JSON.parse(response);

      animation.frames = [];

      for (var i = 0; i < data.frames.length; i++) {
        var frame = data.frames[i];

        animation.frames.push({
          source: [frame.frame.x, frame.frame.y, frame.frame.w, frame.frame.h],
          offset: [frame.spriteSourceSize.x, frame.spriteSourceSize.y]
        });
      }

      assets.loader.onItemReady();
    });
  },

  audio: function(key) {
    return this.data.audio[key];
  },

  addAudio: function(filename) {
    if (arguments.length > 1) {
      var result = [];
      for (var i = 0; i < arguments.length; i++) {
        result.push(this.addAudio(arguments[i]));
      }

      return result;
    } else {

      var audio = new Audio;

      //    var key = filename.match(/(.*)\..*/)[1];

      this.loader.audio(audio);

      this.data.audio[filename] = audio;

      audio.src = this.paths.audio + filename + "." + this.audioFormat;

      audio.load();

      return audio;
    }

  }
};