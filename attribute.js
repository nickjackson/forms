/**
 * Module dependencies.
 */
var Emitter = require('emitter')
  , event = require('event')
  , toFunction = require('to-function')
  , Textbox = require('./lib/textbox')
  , Checkbox = require('./lib/checkbox')
  , Select = require('./lib/select')
  , Label = require('./lib/label')


/**
 * Expose `Attribute`.
 */

module.exports = Attribute;


/**
 * Initialize a new `Attribute` with a `name` and
 * `properties`
 *
 * @param {String} name
 * @param {Object} properties
 * @api public
 */

function Attribute(name, params, model) {
  if (!name) throw Error('No name provided');
  if (!params) throw Error('No parameters provided');

  this.name = name;
  this.params = params;
  this.model = model;
  
}


/**
 * Mixin emitter.
 */

Emitter(Attribute.prototype);


/**
 * Creates elements for the particular type of fields
 *
 * @return {Attribute} self
 * @api public
 */

Attribute.prototype.render = function() {
  
  this.view = document.createElement('div');
  this.view.className = 'property';
  
  this.id = this.name.replace('.', '_')
  
  switch (this.params.type) {
    case 'Date':
    case 'Number':
    case 'String':
      this.String();
      break;

    case 'Boolean': 
      this.Boolean();
      break;

    case 'Object':
      this.Object();
      break;
  }
  
  return this
}

/**
 * Method to deal with String Attributes
 *
 * @api private
 */

Attribute.prototype.String = function() {
  var params = this.params
    , label = new Label(params.title, this.id)
    , control = new Textbox(this.name, params);
  
  if (params.options) {
    control = new Select(this.name, params);
  }
  
  this.view.appendChild(label.view)
  this.view.appendChild(control.view);
}

/**
 * Method to deal with Boolean Attributes
 *
 * @api private
 */

Attribute.prototype.Boolean = function() {
  var checkbox = new Checkbox(this.name, this.params)
    , label = new Label(this.params.title, this.id);
  
  this.view.appendChild(checkbox.view);
  this.view.appendChild(label.view);
}


/**
 * Method to deal with Object Attributes
 *
 * @api private
 */

Attribute.prototype.Object = function() {
  var params = this.params
    , object = document.createElement('div')
    , label = new Label(params.title);

  for (var prop in params.properties) {
    var property = params.properties[prop];
    var nested = this.name + '.' + prop;
    var attribute = new Attribute(nested, property);
    object.appendChild(attribute.render().view);
  }
  
  
  this.view.className = 'nested';
  this.view.appendChild(label.view);
  this.view.appendChild(object);
}