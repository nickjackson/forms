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
 * and prefill with `data` obj
 *
 * @param {Object} schema
 * @param {Object} data
 * @api public
 */

function Form(schema, data) {
  if (!schema) throw Error('No schema provided');
  this.schema = schema;
  this.data = data;
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
  
  for (var name in this.schema) {
    
    var attribute = this.schema[name]
      , data = null
      , overide = false;
    
    if (this.data) data = this.data[name];
      
    this.emit('attribute', name, attribute, function(dom){
      view.appendChild(dom);
      overide = true;
    })
    
    if (overide) continue;
    
    var field = new Field(name, attribute, data);
    view.appendChild(field.render().view);
  }
  
  return this;
}