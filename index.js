/**
 * Module dependencies.
 */

var Field = require('./field')
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
    
    var field = new Field(name, attribute);
    view.appendChild(field.render().view);
  }
  
  return this;
}