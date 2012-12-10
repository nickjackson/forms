# forms

  create rich forms dynamically by providing a JSON schema

## Installation

    $ component install nickjackson/forms

## Spec
[wiki/Spec](https://github.com/nickjackson/forms/wiki/Spec)


## Todo
* Allow fields to be pre filled with data
* Add Date/Calendar functionality
* Add Repeats
* Add Tests
* Validation

## API

### new Form(schema, data)
Creates new Form object based on schema object
 
### .render()
Renders form
 
### .view
Rendered DOM

### .on('attribute', function(name, params, cb(dom)))
Override a particular attribute by calling the callback with a DOM element

## License

  MIT
