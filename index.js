/**
 * Module dependencies.
 */

var Attribute = require('./attribute')
  , Emitter = require('emitter');


/**
 * Expose `Form`.
 */

module.exports = Form;


/**
 * Initialize a new `Form` with a `schema` object
 *
 * @param {Object} schema
 * @api public
 */

function Form(schema) {
  if (!schema) throw Error('No schema provided');
  this.schema = schema;
}


/**
 * Mixin emitter.
 */

Emitter(Form.prototype);


/**
 * Iterates through all attributes in `this.schema`
 * and renders fields.
 *
 * @return {Form} self
 * @api public
 */

Form.prototype.render = function() {
  this.view = document.createElement('div');
  this.view.className = 'form';
  this.attributes = {};

  for (var name in this.schema) {
    var subSchema = this.schema[name]
      , attribute = new Attribute(name, subSchema);

    this.view.appendChild(attribute.render().view);
    this.attributes[name] = attribute;
  }
  return this;
}


/**
 * Iterates through all attributes in and
 * gets their values;
 *
 * @return {Object} values
 * @api public
 */

Form.prototype.getValue = function(){
  var values = {}
  for (var attr in this.attributes) {
    var attribute = this.attributes[attr]
    values[attr] = attribute.getValue();
  }
  return values;
}