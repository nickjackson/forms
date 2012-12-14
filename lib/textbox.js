/**
 * Module dependencies.
 */
var Emitter = require('emitter')
  , event = require('event');


/**
 * Expose `Textbox`.
 */

module.exports = Textbox;

/**
 * Initialize a new `Textbox` with a `name` and
 * `params`
 *
 * @param {String} name
 * @param {Object} params
 * @api public
 */

function Textbox(name, params) {
  if (!name) throw Error('No name provided');
  if (!params) throw Error('No parameters provided');
  
  this.view = document.createElement('input');
  this.view.setAttribute('type', 'text');
  
  event.bind(this.view, 'keyup', this.change.bind(this));
  
  return this;
}

/**
 * Mixin emitter.
 */

Emitter(Textbox.prototype);


/**
 * Used to emit 'change' event on this when
 * textbox changes
 * 
 * @api private
 */

Textbox.prototype.change = function() {
  this.emit('change', this.view.value);
}