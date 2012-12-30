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
  this.el = textbox;
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
  this.el = select;
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
  this.el = input;
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

  this.el = {};

  for (var property in this.properties) {
    var subParams = this.properties[property]
      , subName = this.name + '[' + property + ']'
      , subAttribute = new Attribute(subName, subParams);

    nested.appendChild(subAttribute.render().view);
    this.el[property] = subAttribute.el;
  }

  this.repeatNode = nested;
  return dom;
}



/**
 * Return new Attribute without repeat enabled
 *
 * @return {Attribute} attribute
 * @api private
 */

Attribute.prototype.repeatAttribute = function(){
  var attribute = new Attribute(this.name, this);
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
  // set name tag to array
  this.name = this.name + '[]';

  // set this.el to array
  this.el = [];

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

  // add to field
  this.el.push(attribute.el);

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
  this.el.splice(id, 1);

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
  this.el = [];

  return this;
}


/**
 * Gets the value of the current field
 *
 * @return {Multiple} value
 * @api private
 */

Attribute.prototype.getValue = function(){
  return getSetValue(this.el);
}


/**
 * Sets the value of the current field
 *
 * @params {Multiple} value
 * @returns {Attribute} self
 * @api private
 */

Attribute.prototype.setValue = function(value){
  if (type(value) == 'array') {
    this.resetRepeats();
    for (var i = this.repeatCount; i < value.length; i++) {
      this.addRepeat();
    }
  }
  getSetValue(this.el, value);
  return this;
}


/**
 * functions used to itterate fields and
 * get/set their values.
 *
 * @api private
 */


function getSetValue(field, data) {
  if (field.nodeType) return elementValue(field, data);
  if (type(field) == 'object') return objectValue(field, data);
  if (type(field) == 'array') return arrayValue(field, data);
}


function elementValue(field, value){
  return val(field, value);
}


function objectValue(fields, data){
  var value = {};
  for (var field in fields) {
    if (data && data[field]) {
      value[field] = getSetValue(fields[field], data[field]);
    } else {
      value[field] = getSetValue(fields[field]);
    }
  }
  return value;
}


function arrayValue(fields, data){
  var value = [];
  fields.forEach(function(field, index){
    if (data && data[index]) {
      value.push(getSetValue(field, data[index]));
    } else {
      value.push(getSetValue(field));
    }

  });
  return value;
}