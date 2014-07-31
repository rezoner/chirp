ENGINE.ShuffleBag = function(items) {

  if (items instanceof Array) {
    this.items = {};
    for (var i = 0; i < items.length; i++) {
      var name = items[i];
      this.items[name] = 1;
    }
  } else {
    this.items = items;
  }

  this.reset();
};

ENGINE.ShuffleBag.prototype = {

  shuffle: function(array) {
    var counter = array.length,
      temp, index;

    // While there are elements in the array
    while (counter > 0) {
      // Pick a random index
      index = Math.floor(Math.random() * counter);

      // Decrease counter by 1
      counter--;

      // And swap the last element with it
      temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
    }

    return array;
  },

  reset: function() {
    this.pool = [];

    for (var key in this.items) {
      var count = this.items[key];

      for (var j = 0; j < count; j++) {
        this.pool.push(key);
      }
    }

    this.shuffle(this.pool);
  },

  pull: function() {
    var result = this.pool.pop();

    if (this.pool.length === 0) this.reset();

    return result;
  }
};