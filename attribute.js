/**
 * Module dependencies.
 */
var Emitter = require('emitter')
  , event = require('event')
  , domify = require('domify')
  , templates = require('./template');

/**
 * Expose `Attribute`.
 */

module.exports = Attribute;


/**
 * Initialize a new `Attribute` with a `name` and
 * `properties`
 *
 * @param {String} name
 * @param {Object} obj
 * @api public
 */

function Attribute(name, obj, model) {
  if (!name) throw Error('No name provided');
  if (!obj) throw Error('No parameters provided');

  this.name = name;
  this.obj = obj;
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
  var view;

  if (this.obj.repeat) {
    this.view = this.repeats();
    return this;
  }

  switch (this.obj.type) {
    case 'Date':
    case 'Number':
    case 'String':
      this.view = this.obj.options
        ? this.select()
        : this.textbox();
      break;

    case 'Boolean':
      this.view = this.checkbox();
      break;

    case 'Object':
      this.view = this.object();
      break;
  }

  return this;
}


/**
 * Render `self` as a textbox
 *
 * @return {Element} attribute
 * @api private
 */

Attribute.prototype.textbox = function() {
  var obj = this.obj
    , attribute = domify(templates.textbox)[0]
    , span = attribute.querySelector('span')
    , textbox = attribute.querySelector('input');

  span.innerText = obj.title;
  textbox.setAttribute('name', this.name);
  this.setRepeatNode(textbox);
  this.setField(textbox);
  return attribute;
}


/**
 * Render `self` as a select box
 *
 * @return {Element} attribute
 * @api private
 */

Attribute.prototype.select = function() {
  var obj = this.obj
    , attribute = domify(templates.select)[0]
    , span = attribute.querySelector('span')
    , select = attribute.querySelector('select');

  for (var option in obj.options) {
    var view = document.createElement('option')
    view.setAttribute('value', option);
    view.innerText = obj.options[option];
    select.appendChild(view);
  }

  span.innerText = obj.title;
  select.setAttribute('name', this.name);
  this.setRepeatNode(select);
  this.setField(select);
  return attribute;
};


/**
 * Render `self` as a checkbox
 *
 * @return {Element} attribute
 * @api private
 */

Attribute.prototype.checkbox = function() {
  var obj = this.obj
    , attribute = domify(templates.checkbox)[0]
    , span = attribute.querySelector('span')
    , input = attribute.querySelector('input');

  span.innerText = obj.title;
  input.setAttribute('name', this.name);
  this.setRepeatNode(input);
  this.setField(input);
  return attribute;
}


/**
 * Render `self` by iterating sub-properties
 * and rendering their particular dom types
 *
 * @return {Element} attribute
 * @api private
 */

Attribute.prototype.object = function() {
  var obj = this.obj
    , field = {}
    , attribute = domify(templates.object)[0]
    , label = attribute.querySelector('label')
    , nested = attribute.querySelector('.nested');

  for (var property in obj.properties) {
    var subParams = obj.properties[property]
      , subName = this.name + '[' + property + ']'
      , subAttribute = new Attribute(subName, subParams);

    nested.appendChild(subAttribute.render().view);
    field[property] = subAttribute.field;
  }

  label.innerText = obj.title;
  this.setRepeatNode(nested);
  this.setField(field);
  return attribute;
}


/**
 * Sets the element to repeat
 *
 * @param {Element} node
 * @return {Attribute} self
 * @api private
 */

Attribute.prototype.setRepeatNode = function(node){
  if (!node) throw Error('Must specify dom node to repeat');
  this.repeat = node;
  return this;
}

/**
 * Sets the main field
 *
 * @param {Element} node
 * @return {Attribute} self
 * @api private
 */

Attribute.prototype.setField = function(node){
  if (!node) throw Error('Must specify dom node');
  this.field = node;
  return this;
}


/**
 * Enables repeating of a certain attribute
 *
 * @return {Element} attribute
 * @api private
 */

Attribute.prototype.repeats = function() {
  // set name to array
  this.name = this.name + '[]';

  // set this.field to array
  this.field = [];

  // call the attribute render function
  var attribute = this.repeatAttribute();

  // set the container to append new repeats too
  this.repeatContainer = document.createElement('div');
  this.repeatContainer.className = 'repeats';

  // parent of repeat
  var parent = attribute.repeat.parentNode;
  // remove default repeat node
  parent.removeChild(attribute.repeat);

  // if parent is a Label set to label parent
  if (parent.nodeName.toLowerCase() == 'label'){
    parent = parent.parentNode;
  }

  // append repeats to parent of label
  parent.appendChild(this.repeatContainer);

  // set repeat count
  this.repeatCount = 0;

  // set repeat max by checking repeat param
  // for Boolean or else Integer
  if (this.obj.repeat !== true) {
    this.repeatMax = parseInt(this.obj.repeat);
  }

  // append new node with repeat controls
  this.addRepeat();

  return attribute.view;
}


/**
 * Adds another field if multiples is enabled
 *
 * @return {Attribute} self
 * @api private
 */

Attribute.prototype.addRepeat = function(){
  var attribute = this.repeatAttribute()
    , repeat = attribute.repeat
    , controls = domify(templates.controls)[0]
    , add = controls.querySelector('.add')
    , remove = controls.querySelector('.remove');

  // only add repeat if within maximum
  if (this.repeatMax) {
    if (this.repeatCount >= this.repeatMax) return;
  }

  // adjust repeat count
  this.repeatCount++;

  // add to field
  this.field.push(attribute.field);

  // create repeat container and append
  // repeat clone and controls
  var container = document.createElement('div');
  container.className = 'repeat';
  container.appendChild(repeat);
  container.appendChild(controls);

  // append container to repeatContainer
  this.repeatContainer.appendChild(container);

  // bind click events
  event.bind(add, 'click', this.addRepeat.bind(this));
  event.bind(remove, 'click', this.removeRepeat.bind(this, container, this.repeatCount - 1));

  return this;
}


/**
 * Removes `node` if multiples is enabled
 *
 * @param {Element} node
 * @return {Attribute} self
 * @api private
 */

Attribute.prototype.removeRepeat = function(node, id){
  var parent = node.parentNode;
  parent.removeChild(node);
  this.repeatCount--;

  this.field.splice(id, 1);

  if (this.repeatCount == 0) this.addRepeat();
  return self;
}