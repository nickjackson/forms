/**
 * Module dependencies.
 */
var Emitter = require('emitter');


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

function Field(name, params, data) {
  if (!name) throw Error('No name provided');
  if (!params) throw Error('No parameters provided');

  this.name = name;
  this.params = params;
  this.data = data;
}


/**
 * Mixin emitter.
 */

Emitter(Field.prototype);


/**
 * Creates elements for the particular type of fields
 *
 * @return {Field} self
 * @api public
 */

Field.prototype.render = function() {
  var params = this.params
    , label = document.createElement('label')

  this.view = document.createElement('div');
  this.view.className = 'property';
  
  switch (params.type) {
    case 'Boolean': 
      this.view.appendChild(this.checkbox());
      this.view.appendChild(this.label());
      break;

    case 'Date':
      break;

    case 'Object':
      var Form = require('./index');
      var properties = nestProperties(params.properties, this.name);
      
      var form = new Form(properties, this.data);
      form.render();
      form.view.className = form.view.className + ' nested';

      this.view.appendChild(this.label());
      this.view.appendChild(form.view);
      break;

    case 'Number':
    case 'String':
      this.view.appendChild(this.label());

      if (params.options) {
        this.view.appendChild(this.select());
        break;
      }
      
      this.view.appendChild(this.text());
  }

  return this
}


/**
 * Helper to create `<input />` text field
 *
 * @return {HTMLElement} field
 * @api private
 */

Field.prototype.text = function() {
  var field = document.createElement('input');
  field.setAttribute('type', 'text');
  field.setAttribute('name', this.name);
  field.setAttribute('id', underscore(this.name));
  if (this.data) field.setAttribute('value', this.data);
  return field;
}


/**
 * Helper to create `<label />` field
 *
 *
 * @return {HTMLElement} field
 * @api private
 */

Field.prototype.label = function() {
  var field = document.createElement('label');
  field.innerText = this.params.title
  field.setAttribute('for', underscore(this.name));
  return field;
}


/**
 * Helper to create `<input />` checkbox field
 *
 * @return {HTMLElement} field
 * @api private
 */

Field.prototype.checkbox = function() {
  var field = document.createElement('input');
  field.setAttribute('type', 'checkbox');
  field.setAttribute('name', this.name);
  field.setAttribute('id', underscore(this.name));
  if (this.data) field.setAttribute('value', this.data);
  return field;
}


/**
 * Helper to create `<select />` field with `options`
 *
 * @return {HTMLElement} field
 * @api private
 */

Field.prototype.select = function() {
  var field = document.createElement('select');
  field.setAttribute('name', this.name);
  field.setAttribute('id', underscore(this.name));
  for (var opt in this.params.options) {
    var option = document.createElement('option');
    option.setAttribute('value', opt);
    option.innerText = this.params.options[opt];
    field.appendChild(option);
  }
  return field;
}


/**
 * Helper to wrap square brackets around all keys of
 * `properties` and then prefix with `parent`
 *
 * @param {Object} properties
 * @param {String} parent
 * @return {Object} nested
 * @api private
 */

function nestProperties(properties, parent) {
  var nested = {};
  for (var prop in properties) {
    nested[parent + '[' + prop + ']'] = properties[prop];
  }
  return nested;
}


/**
 * Helper to replace square brackets around `Str`
 * and replace with underscore
 *
 * @param {String} str
 * @return {String} str
 * @api private
 */

function underscore(str) {
  return str.replace('][', '_').replace('[', '_').replace(']', '')
}