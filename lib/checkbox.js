/**
 * Module dependencies.
 */
var Emitter = require('emitter')
  , event = require('event');


/**
 * Expose `Checkbox`.
 */

module.exports = Checkbox;

/**
 * Initialize a new `Checkbox` with a `name` and
 * `params`
 *
 * @param {String} name
 * @param {Object} params
 * @api public
 */

function Checkbox(name, params) {
  if (!name) throw Error('No name provided');
  if (!params) throw Error('No parameters provided');
  
  this.view = document.createElement('input');
  this.view.setAttribute('type', 'checkbox');
  
  event.bind(this.view, 'click', this.change.bind(this));
  
  return this;
}

/**
 * Mixin emitter.
 */

Emitter(Checkbox.prototype);


/**
 * Used to emit 'change' event on this when
 * checkbox is clicked
 * 
 * @api private
 */

Checkbox.prototype.change = function() {
  this.emit('change', this.view.value);
}