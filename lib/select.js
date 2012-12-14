/**
 * Module dependencies.
 */
var Emitter = require('emitter')
  , event = require('event');


/**
 * Expose `Select`.
 */

module.exports = Select;

/**
 * Initialize a new `Select` with a `name` and
 * `params`
 *
 * @param {String} name
 * @param {Object} params
 * @api public
 */

function Select(name, params) {
  if (!name) throw Error('No name provided');
  if (!params) throw Error('No parameters provided');
  
  this.view = document.createElement('select');
  this.view.setAttribute('type', 'checkbox');
  
  for (var opt in params.options) {
    var option = document.createElement('option');
    var text = params.options[opt];
    option.setAttribute('value', opt);
    option.innerText = text;
    this.view.appendChild(option);
  }
  
  event.bind(this.view, 'change', this.change.bind(this));
  
  return this;
}

/**
 * Mixin emitter.
 */

Emitter(Select.prototype);


/**
 * Used to emit 'change' event on this when
 * Select is changed
 * 
 * @api private
 */

Select.prototype.change = function() {
  var value = this.view.options[this.view.selectedIndex].value
  this.emit('change', value);
}