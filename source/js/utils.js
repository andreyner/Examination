"use strict";

window.util = {
  getRandomColor: function () {
    let r = Math.floor(0.5 * (256));
    let g = Math.floor(Math.random() * (256));
    let b = Math.floor(Math.random() * (256));
    return '#' + r.toString(16) + g.toString(16) + b.toString(16);
  }
}
