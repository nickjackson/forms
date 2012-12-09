/**
 * Module dependencies.
 */
var Emitter = require('emitter')
  , Form = require('./index')

/**
 * Expose `Field`.
 */

module.exports = Field;

/**
 * Initialize a new `Field` with a `name` and
 * `properties` and prefill with `data` obj
 *
 * @param {String} name
 * @param {Object} properties
 * @param {Mixed} data
 * @api public
 */

function Field(name, properties, data) {
  if (!name) throw Error('No name provided');
  if (!properties) throw Error('No properties provided');
  
  this.name = name;
  this.properties = properties;
  this.data = data;
}

/**
 * Mixin emitter.
 */

Emitter(Field.prototype);

/**
 *
 *
 *
 * @return {Field} self
 * @api public
 */

Field.prototype.render = function() {
  var props = this.properties
    , label = document.createElement('label');
  
  this.view = document.createElement('div');
  
  if (props.type == "Boolean") {
    field = document.createElement('input');
    field.setAttribute('type', 'checkbox');
    this.view.appendChild(field);
    
    
  } else if (props.type == "Date") {
    
  } else if (props.type == "Object") {
    
  } else if (props.options) {
    
  } else {
    
  }
  
}