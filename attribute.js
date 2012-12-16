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
  var view;

  switch (this.params.type) {
    case 'Date':
    case 'Number':
    case 'String':
      this.fn = this.params.options
        ? this.select
        : this.textbox;
      break;

    case 'Boolean':
      this.fn = this.checkbox;
      break;

    case 'Object':
      this.fn = this.object;
      break;
  }

  this.view = this.params.repeat
    ? this.repeats()
    : this.fn();

  return this
}

/**
 * Render `self` as a textbox
 *
 * @return {Element} attribute
 * @api private
 */

Attribute.prototype.textbox = function() {
  var params = this.params
    , attribute = domify(templates.textbox)[0]
    , span = attribute.querySelector('span')
    , textbox = attribute.querySelector('input');

  span.innerText = params.title;
  this.setRepeatNode(textbox);
  return attribute;
}

/**
 * Render `self` as a select box
 *
 * @return {Element} attribute
 * @api private
 */

Attribute.prototype.select = function() {
  var params = this.params
    , attribute = domify(templates.select)[0]
    , span = attribute.querySelector('span')
    , select = attribute.querySelector('select');

  for (var option in params.options) {
    var view = document.createElement('option')
    view.setAttribute('value', option);
    view.innerText = params.options[option];
    select.appendChild(view);
  }

  span.innerText = params.title;
  this.setRepeatNode(select);
  return attribute;
};

/**
 * Render `self` as a checkbox
 *
 * @return {Element} attribute
 * @api private
 */

Attribute.prototype.checkbox = function() {
  var params = this.params
    , attribute = domify(templates.checkbox)[0]
    , span = attribute.querySelector('span')
    , input = attribute.querySelector('input')

  span.innerText = params.title;
  this.setRepeatNode(input);
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
  var params = this.params
    , attribute = domify(templates.object)[0]
    , label = attribute.querySelector('label')
    , nested = attribute.querySelector('.nested')

  for (var property in params.properties) {
    var subParams = params.properties[property];
    var subName = this.name + '.' + property;
    var subAttribute = new Attribute(subName, subParams);
    nested.appendChild(subAttribute.render().view);
  }

  label.innerText = params.title;
  this.setRepeatNode(nested);
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
  if (!node) throw Error('Must specify dom node to repeat')
  this.repeat = node;
  return this;
}


/**
 * Enables repeating of a certain attribute
 *
 * @return {Element} attribute
 * @api private
 */

Attribute.prototype.repeats = function() {
  // call the attribute render function
  var attribute = this.fn();

  // set the container to append new repeats too
  this.repeatContainer = document.createElement('div');
  this.repeatContainer.className = 'repeats';

  // parent for repeats
  var parent = this.repeat.parentNode;

  // remove default repeat node
  parent.removeChild(this.repeat);

  // if parent is a Label set to label parent
  var pConstructor = parent.constructor.toString();
  if (pConstructor.indexOf('HTMLLabelElement') != -1){
    parent = parent.parentNode;
  }

  // append repeats to parent of label
  parent.appendChild(this.repeatContainer);

  // set repeat count
  this.repeatCount = 0;

  // set repeat max by checking repeat param
  // for Boolean or else Integer
  if (this.params.repeat !== true) {
    this.repeatMax = parseInt(this.params.repeat);
  }

  // append new node with repeat controls
  this.addRepeat();

  return attribute;
}


/**
 * Adds another field if multiples is enabled
 *
 * @return {Attribute} self
 * @api private
 */

Attribute.prototype.addRepeat = function(){
  var repeat = this.repeat.cloneNode(true)
    , controls = domify(templates.controls)[0]
    , add = controls.querySelector('.add')
    , remove = controls.querySelector('.remove');

  // only add repeat if within maximum
  if (this.repeatMax) {
    if (this.repeatCount >= this.repeatMax) return;
  }

  // adjust repeat count
  this.repeatCount++;

  // create repeat container and append
  // repeat clone and controls
  var container = document.createElement('div')
  container.className = 'repeat';
  container.appendChild(repeat);
  container.appendChild(controls);

  // append container to repeatContainer
  this.repeatContainer.appendChild(container);

  // bind click events
  event.bind(add, 'click', this.addRepeat.bind(this));
  event.bind(remove, 'click', this.removeRepeat.bind(this, container));

  return this;
}


/**
 * Removes `field` if multiples is enabled
 *
 * @param {Node} field
 * @return {Attribute} self
 * @api private
 */

Attribute.prototype.removeRepeat = function(node){
  var parent = node.parentNode;
  parent.removeChild(node);
  this.repeatCount--;
  if (this.repeatCount == 0) this.addRepeat();
  return self;
}