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
  this.model = {};
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
  var self = this
    , view = document.createElement('div');

  this.view = view;
  view.className = 'form'

  for (var name in this.schema) {

    var attribute = this.schema[name]
      , overide = false

    this.emit('attribute', name, attribute, function(dom){
      view.appendChild(dom);
      overide = true;
    })

    if (overide) continue;

    this.model[name] = null;
    var attribute = new Attribute(name, attribute, this.model);
    view.appendChild(attribute.render().view);
  }

  return this;
}