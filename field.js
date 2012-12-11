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
 * `properties`
 *
 * @param {String} name
 * @param {Object} properties
 * @api public
 */

function Field(name, params) {
  if (!name) throw Error('No name provided');
  if (!params) throw Error('No parameters provided');

  this.name = name;
  this.params = params;
  this.form = form;
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
  
  this.id = this.name + Math.random().toString().substr(3, 10)
  
  switch (params.type) {
    case 'Boolean': 
      this.view.appendChild(this.checkbox());
      this.view.appendChild(this.label());
      break;

    case 'Date':
      break;

    case 'Object':
      var Form = require('./index');
      var form = new Form(params.properties);
      form.render()
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
 * Helper to create `<label />` field
 *
 *
 * @return {HTMLElement} field
 * @api private
 */

Field.prototype.label = function() {
  var field = document.createElement('label');
  field.innerText = this.params.title
  field.setAttribute('for', this.id);
  return field;
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
  field.setAttribute('id', this.id);
  
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
  field.setAttribute('id', this.id);
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
  field.setAttribute('id', this.id);
  for (var opt in this.params.options) {
    var option = document.createElement('option');
    var text = this.params.options[opt];
    option.setAttribute('value', opt);
    option.innerText = text;
    field.appendChild(option);
  }
  return field;
}