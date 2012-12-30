/**
 * Module dependencies.
 */
var Emitter = require('emitter')
  , event = require('event')
  , domify = require('domify')
  , templates = require('./template')
  , type = require('type')
  , minstache = require('minstache')
  , val = require('val');

/**
 * Expose `Attribute`.
 */

module.exports = Attribute;



/**
 * safe options for the attribute schema
 */

var safe = ['options', 'type', 'title', 'repeat', 'properties'];



/**
 * Initialize a new `Attribute` with a `name` and
 * `properties`
 *
 * @param {String} name
 * @param {Object} obj
 * @api public
 */

function Attribute(name, schema) {
  if (!name) throw Error('No name provided');
  if (!schema) throw Error('No parameters provided');

  for (var opt in schema) {
    if (safe.indexOf(opt) == -1) continue;
    this[opt] = schema[opt];
  }

  this.name = name;
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
  // check to see if repeats are enabled and then
  // run .repeats()
  if (this.repeat == "false") this.repeat = false;
  if (this.repeat) {
    this.view = this.repeats();
    return this;
  }

  // check field types and run their associated render fns.
  switch (this.type) {
    case 'Date':
    case 'Number':
    case 'String':
      // checks for specified options
      this.view = this.options
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
 * Render `self` as a textbox and return dom
 *
 * @return {Element} dom
 * @api private
 */

Attribute.prototype.textbox = function() {
  var dom = domify(minstache(templates.textbox, this))[0]
    , textbox = dom.querySelector('input');

  this.repeatNode = textbox;
  this.value = val.bind(this, textbox);
  return dom;
}



/**
 * Render `self` as a select box and return dom
 *
 * @return {Element} dom
 * @api private
 */

Attribute.prototype.select = function() {
  var dom = domify(minstache(templates.select, this))[0]
    , select = dom.querySelector('select');

  for (var option in this.options) {
    var view = document.createElement('option')
    view.setAttribute('value', option);
    view.innerText = this.options[option];
    select.appendChild(view);
  }

  this.repeatNode = select;
  this.value = val.bind(this, select);
  return dom;
};



/**
 * Render `self` as a checkbox and return dom
 *
 * @return {Element} dom
 * @api private
 */

Attribute.prototype.checkbox = function() {
  var dom = domify(minstache(templates.checkbox, this))[0]
    , input = dom.querySelector('input');

  this.repeatNode = input;
  this.value = val.bind(this, input);
  return dom;
}



/**
 * Render `self` by iterating sub-properties
 * and rendering their particular dom types
 *
 * @return {Element} dom
 * @api private
 */

Attribute.prototype.object = function() {
  var dom = domify(minstache(templates.object, this))[0]
    , nested = dom.querySelector('.nested');

  this.attributes = {};

  for (var property in this.properties) {
    var subParams = this.properties[property]
      , subName = this.name + '.' + property
      , subAttribute = new Attribute(subName, subParams);

    nested.appendChild(subAttribute.render().view);
    this.attributes[property] = subAttribute;
  }

  this.repeatNode = nested;
  this.value = objectValue.bind(this);
  return dom;
}



/**
 * Return new Attribute without repeat enabled
 *
 * @return {Attribute} attribute
 * @api private
 */

Attribute.prototype.repeatAttribute = function(){
  var name = this.name + this.repeatCount;
  var attribute = new Attribute(name, this);
  attribute.repeat = false;
  return attribute.render();
}



/**
 * Enables repeating of a certain attribute
 *
 * @return {Element} dom
 * @api private
 */

Attribute.prototype.repeats = function() {

  // set this.el to array
  this.attributes = [];
  this.value = arrayValue.bind(this);

  // render array dom
  var dom = domify(minstache(templates.repeats, this))[0];

  // set container for repeats
  this.repeatContainer = dom.querySelector('.repeats');

  // bind click events
  var add = dom.querySelector('.add');
  event.bind(add, 'click', this.addRepeat.bind(this));

  // set repeat count
  this.repeatCount = 0;

  // set repeat max by checking if Integer
  if (max = parseInt(this.repeat)) {
    this.repeatMax = max;
  }

  return dom;
}



/**
 * Adds another field if multiples is enabled
 *
 * @return {Attribute} self
 * @api private
 */

Attribute.prototype.addRepeat = function(){
  var attribute = this.repeatAttribute()
    , controls = domify(templates.controls)[0]
    , add = controls.querySelector('.add')
    , remove = controls.querySelector('.remove');

  // only add repeat if within maximum
  if (this.repeatMax) {
    if (this.repeatCount >= this.repeatMax) return;
  }

  // adjust repeat count
  this.repeatCount++;

  // add nested attribute
  this.attributes.push(attribute);

  // create repeat container and append
  // repeat clone and controls
  var container = document.createElement('div');
  container.className = 'repeat';
  container.appendChild(attribute.repeatNode);
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
 * @param {Integer} id
 * @return {Attribute} self
 * @api private
 */

Attribute.prototype.removeRepeat = function(node, id){
  var add = node.querySelector('.add')
    , remove = node.querySelector('.remove');

  event.unbind(add);
  event.unbind(remove);
  this.repeatContainer.removeChild(node);
  this.repeatCount--;
  this.attributes.splice(id, 1);

  return this;
}



/**
 * Reset repeats by deleting dom and stuff
 *
 * @return {Attribute} self
 * @api private
 */

Attribute.prototype.resetRepeats = function(){
  this.repeatContainer.innerHTML = '';
  this.repeatCount = 0;
  this.attributes = [];

  return this;
}



/**
 * set and return value of nested attributes in object
 *
 * @return {Object} value
 * @api private
 */

function objectValue(data){
  value = {};
  for (var attr in this.attributes) {
    var attribute = this.attributes[attr];
    if (data && data[attr]) {
      value[attr] = attribute.value(data[attr]);
    } else {
      value[attr] = attribute.value();
    }
  }
  return value;
}



/**
 * set and return value of nested attributes in array
 *
 * @return {Array} value
 * @api private
 */

function arrayValue(data){
  // make sure enough repeated rows in place.
  if (data && type(data) == 'array') {
    this.resetRepeats();
    for (var i = this.repeatCount; i < data.length; i++) {
      this.addRepeat();
    }
  }

  return this.attributes.map(function(attribute, index){
    if (data && data[index]) {
      return attribute.value(data[index]);
    } else {
      return attribute.value();
    }
  });
}