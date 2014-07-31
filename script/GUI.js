CHIRPTRACKER.GUI = function(container) {

  this.elements = [];
  this.hoveredElement = null;
  this.left = 0;
  this.top = 0;
  this.chainRender = true;

  this.container = container;
};

CHIRPTRACKER.GUI.prototype = {

  add: function(e) {
    this.elements.push(e);

    this.update();
    return e;
  },

  update: function() {
    this.elements.sort(function(a, b) {
      if (a.zIndex != b.zIndex) {
        return (a.zIndex | 0) - (b.zIndex | 0);
      } else {
        return (a.index - b.index) | 0;
      }
    });
  },

  onstep: function(delta) {
    for (var i = 0; i < this.elements.length; i++) {
      var element = this.elements[i];
      if (element.onstep) element.onstep(delta);

      if (element.gui) element.gui.onstep(delta);
    }

  },


  onrender: function(delta) {
    for (var i = 0; i < this.elements.length; i++) {
      var element = this.elements[i];

      CHIRPTRACKER.layer.save();
      CHIRPTRACKER.layer.translate(this.container.left + element.left, this.container.top + element.top);
      if (element.onrender) element.onrender(delta);
      if (element.gui && element.gui.chainRender) element.gui.onrender(delta);
      if (element.onpostrender) element.onpostrender(delta);

      CHIRPTRACKER.layer.restore();
    }
  },

  whatIsUnderCursor: function(x, y) {
    for (var i = this.elements.length - 1; i >= 0; i--) {
      var element = this.elements[i];
      if (x > element.left && y > element.top && x < element.left + element.width && y < element.top + element.height) {
        return element;
      }
    }

    return null;
  },

  onmousemove: function(x, y) {

    var element = this.whatIsUnderCursor(x, y);

    if (element && element.onmousemove) {
      if (element.onmousemove) element.onmousemove(x - element.left, y - element.top);
    }

    if (this.hoveredElement != element) {
      if (this.hoveredElement) {
        if (this.hoveredElement.onmouseout) this.hoveredElement.onmouseout();
        this.hoveredElement.mouseover = false;
      }
      this.hoveredElement = element;
      if (this.hoveredElement) {
        if (this.hoveredElement.onmouseover) this.hoveredElement.onmouseover();
        this.hoveredElement.mouseover = true;
      }
    }

    if (element && element.gui) element.gui.onmousemove(x - element.left, y - element.top);

  },

  onmousedown: function(x, y, button) {

    var element = this.whatIsUnderCursor(x, y);

    if (element && element.onmousedown) {
      if (element.onmousedown) element.onmousedown(x - element.left, y - element.top, button);
    }

    if (element && element.gui) element.gui.onmousedown(x - element.left, y - element.top, button);

  },

  onmouseup: function(x, y, button) {

    var element = this.whatIsUnderCursor(x, y);

    if (element && element.onmouseup) {
      if (element.onmouseup) element.onmouseup(x - element.left, y - element.top, button);
    }

    if (element && element.gui) element.gui.onmouseup(x - element.left, y - element.top, button);

  },

  onmousewheel: function(x, y, delta) {

    var element = this.whatIsUnderCursor(x, y);

    if (element && element.onmousewheel) {
      if (element.onmousewheel) element.onmousewheel(x, y, delta);
    }

    if (element && element.gui) element.gui.onmousewheel(x - element.left, y - element.top, delta);

  }

};