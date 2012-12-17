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

  for (var name in this.schema) {
    var subSchema = this.schema[name]
      , attribute = new Attribute(name, subSchema, this.model);
      
    this.view.appendChild(attribute.render().view);
  }
  return this;
}