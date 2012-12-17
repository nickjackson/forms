/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(this, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || require.aliases[index];
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj){
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("component-emitter/index.js", function(module, exports, require){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 * 
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off = function(event, fn){
  this._callbacks = this._callbacks || {};
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = callbacks.indexOf(fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter} 
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};


});
require.register("component-event/index.js", function(module, exports, require){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture);
  } else {
    el.attachEvent('on' + type, fn);
  }
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture);
  } else {
    el.detachEvent('on' + type, fn);
  }
};
});
require.register("component-domify/index.js", function(module, exports, require){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');
  
  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];
  
  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return [el.removeChild(el.lastChild)];
  }
  
  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  return orphan(el.children);
}

/**
 * Orphan `els` and return an array.
 *
 * @param {NodeList} els
 * @return {Array}
 * @api private
 */

function orphan(els) {
  var ret = [];

  while (els.length) {
    ret.push(els[0].parentNode.removeChild(els[0]));
  }

  return ret;
}

});
require.register("nickjackson-forms/index.js", function(module, exports, require){
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
  this.view = document.createElement('div');
  this.view.className = 'form';

  for (var name in this.schema) {
    var subSchema = this.schema[name]
      , attribute = new Attribute(name, subSchema, this.model);
      
    this.view.appendChild(attribute.render().view);
  }
  return this;
}
});
require.register("nickjackson-forms/attribute.js", function(module, exports, require){
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
    , input = attribute.querySelector('input');

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
    , nested = attribute.querySelector('.nested');

  for (var property in params.properties) {
    var subParams = params.properties[property]
      , subName = this.name + '.' + property
      , subAttribute = new Attribute(subName, subParams);

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
  if (!node) throw Error('Must specify dom node to repeat');
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
  var container = document.createElement('div');
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
 * Removes `node` if multiples is enabled
 *
 * @param {Element} node
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
});
require.register("nickjackson-forms/template.js", function(module, exports, require){
exports.textbox = '<div class="attribute"><label><span></span><input type="text"></input></label></div>'

exports.checkbox = '<div class="attribute"><label><input type="checkbox"><span></span></input></label></div>'

exports.select = '<div class="attribute"><label><span></span><select></select></label></div>'

exports.object = '<div class="attribute"><label></label><div class="nested"></div></div>'

exports.controls = '<div class="controls"><a class="remove">remove</a> <a class="add">add</a></div>'
});
require.alias("nickjackson-forms/index.js", "forms-example/deps/forms/index.js");
require.alias("nickjackson-forms/attribute.js", "forms-example/deps/forms/attribute.js");
require.alias("nickjackson-forms/template.js", "forms-example/deps/forms/template.js");
require.alias("component-emitter/index.js", "nickjackson-forms/deps/emitter/index.js");

require.alias("component-event/index.js", "nickjackson-forms/deps/event/index.js");

require.alias("component-domify/index.js", "nickjackson-forms/deps/domify/index.js");
