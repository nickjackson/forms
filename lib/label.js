/**
 * Module dependencies.
 */

/**
 * Expose `Label`.
 */

module.exports = Label;

/**
 * Initialize a new `Label` with a `title` and `id`
 *
 * @param {String} title
 * @param {String} id
 * @api public
 */

function Label(title, id) {
  if (!title) throw Error('No title provided');
  
  var label = document.createElement('label');
  label.innerText = title;
  
  if (id) {
    label.setAttribute('for', id);
  }
  
  this.view = document.createElement('span')
  this.view.appendChild(label)
  return this;
}
