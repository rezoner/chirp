(function() {

  /* sound generation - Steven Wittens */
  /* noise formulas - Cody `meenie` Lundquist */
  /* plugin - Me :) */


  var plugin = {};

  var waves = {};

  plugin.sin = function(data, length, mult) {
    mult = mult || 1;
    var step = 2 * Math.PI / length;
    for (var i = 0; i < length; i++) {
      data[i] = Math.sin(i * step * mult);
    }
  };


  plugin.white = function(data, length) {
    for (var i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  };

  plugin.pink = function(data, length) {
    var b0, b1, b2, b3, b4, b5, b6;

    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (var i = 0; i < length; i++) {
      var white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }
  };

  plugin.brown = function(data, length) {
    var lastOut = 0.0;
    for (var i = 0; i < length; i++) {
      var white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
  }


  plugin.add = function(data, sample1, sample2) {
    var data1 = plugin.generateAudioSample(sample1);
    var data2 = plugin.generateAudioSample(sample2);
    var n = Math.min(data1.length, data2.length);
    for (var i = 0; i < n; ++i) {
      data[i] = data1[i] + data2[i];
    }
  }

  plugin.gain = function(data, gain) {
    var n = data.length;
    for (var i = 0; i < n; ++i) {
      data[i] *= gain;
    }
  }

  plugin.sampleRate = function(data, sampleRate) {
    plugin.currentSampleRate = sampleRate;
  }

  plugin.distort = function(data) {
    var n = data.length;
    for (var i = 0; i < n; ++i) {
      data[i] = (Math.abs(data[i]) < 0.3) ? (data[i] * 2) : (data[i] /
        2 + 0.4 * (data[i] > 0 ? 1 : -1));
    }
  }

  plugin.sinDistort = function(data, drive) {
    var n = data.length;
    var s = Math.PI * drive / 2;
    for (var i = 0; i < n; ++i) {
      data[i] = Math.sin(data[i] * s);
    }
  }

  plugin.envelope = function(data, a, d, s, r) {
    var n = data.length;
    a *= n;
    d *= n;
    r *= n;
    var is = 1 - s;
    for (var i = 0; i < a; ++i) {
      data[i] *= i / a;
    }
    for (; i < (a + d); ++i) {
      data[i] *= (1 - (i - a) / d) * is + s;
    }
    for (; i < (n - r); ++i) {
      data[i] *= s;
    }
    for (var j = i; i < n; ++i) {
      data[i] *= s * (1 - (i - j) / r);
    }
  }

  plugin.decay = function(data, f) {
    var n = data.length;
    var s = f * 4;
    for (var i = 0; i < n; ++i) {
      data[i] *= Math.exp(-i / n * s);
    }
  }

  plugin.resonantFilter = function(data, freq, rad_p, rad_z, scale) {
    var n = data.length;
    var theta = freq * 2 / plugin.currentSampleRate * Math.PI;
    var ap = Math.cos(theta) * rad_p,
      bp = Math.sin(theta) * rad_p;
    var az = Math.cos(theta) * rad_z,
      bz = Math.sin(theta) * rad_z;

    var a2 = 1,
      a1 = -2 * ap,
      a0 = rad_p;
    var b2 = 1,
      b1 = -2 * az,
      b0 = rad_z;

    var y1 = 0,
      y2 = 0,
      x1 = 0,
      x2 = 0;
    for (var i = 0; i < n; ++i) {
      var out = (b2 * data[i] + b1 * x1 + b0 * x2 - a1 * y1 - a0 * y2) / a2 * scale;
      x2 = x1;
      x1 = data[i];
      y2 = y1;
      y1 = out;
      data[i] = out;
    }
  }

  plugin.sweep = function(data, length, freq1, freq2) {
    var d1 = Math.PI * 2 * freq1 / plugin.currentSampleRate,
      d2 = Math.PI * 2 * freq2 / plugin.currentSampleRate,
      dd = (d2 - d1) / length,
      dt = d1,
      t = 0;
    for (var i = 0; i < length; ++i) {
      data[i] = Math.sin(t);
      t += dt;
      dt += dd;
    }
  }

  plugin.noise = function(data, length) {
    return plugin.white(data, length);
  }

  var players = {};

  plugin.generateAudioSample = function(sample) {
    var data = [];

    for (var j = 0; j < sample.length; ++j) {
      var func = plugin[sample[j].shift()];
      var args = sample[j];
      args.unshift(data);
      func.apply(this, args);
    }


    return data;
  }

  CHIRP.instruments.drumkit = function(engine, data) {
    this.plugin = data.plugin;
    this.engine = engine;
    this.raw = {};
    this.pool = [];

    this.volume = data.volume || 0.5;

    if (data.samples) {
      this.data = data.samples;
    } else if (CHIRP.instruments.drumkit.presets)
      this.data = CHIRP.instruments.drumkit.presets[0];
    else
      this.data = {};

    this.samples = {};

    this.channels = new Array(8);

    this.currentChannel = 0;

    for (var j = 0; j < 8; j++) {
      this.channels[j] = this.engine.context.createBuffer(1, 44100, 44100);
    }

    this.buffers = [];

    for (var i in this.data) {
      this.createSample(i);
    }

    this.output = this.engine.context.createGainNode();
    this.output.gain.value = this.volume;

  };

  CHIRP.instruments.drumkit.prototype = {

    createSample: function(key) {
      plugin.currentSampleRate = 44100;

      if (!this.data[key]) return;

      var array = JSON.parse(JSON.stringify(this.data[key] || "[]"));

      var raw = plugin.generateAudioSample(array);

      this.raw[key] = raw;
      /* create buffer */
      this.buffers[key] = new Float32Array(44100);

      for (var i = 0; i < raw.length; i++) {
        this.buffers[key][i] = raw[i];
      }

      if (this.onsampleready) this.onsampleready();
    },


    step: function(delta) {
      if (this.lifespan > 0) {
        this.lifespan -= delta;
        if (this.lifespan <= 0) {

        }
      }
    },

    getSoundBuffer: function() {
      if (!this.pool.length) {
        for (var i = 0; i < 100; i++) {
          var node = this.engine.context.createBufferSource();
          this.pool.push(node);
          node.connect(this.output);
        }
      }

      return this.pool.pop();
    },

    noteon: function(key) {
      // copy data
      this.currentChannel = (this.currentChannel + 1) % 8;

      var dbuf = this.channels[this.currentChannel].getChannelData(0);
      var num = 44100;
      var sbuf = this.buffers[key];
      for (var i = 0; i < num; i++) {
        dbuf[i] = sbuf[i];
      }

      var node = this.getSoundBuffer();
      node.buffer = this.channels[this.currentChannel];      
      node.start(0);
    },

    play: function(note) {
      var drum = null;

      var key = note.key % 12;
      var drum = this.samples[key];

      this.noteon(key);
      if (this.onnote) this.onnote(note, key);

    },

    save: function() {
      return {
        volume: this.volume,
        samples: this.data
      };
    },

    stop: function() {

    }

  };

})();