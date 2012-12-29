exports.textbox = '<div class="attribute"><label>{{title}}<input type="text"{{^name}} name="{{name}}"{{/name}}></input></label></div>';

exports.checkbox = '<div class="attribute"><label><input type="checkbox"{{^name}} name="{{name}}"{{/name}}></input>{{title}}</label></div>';

exports.select = '<div class="attribute"><label>{{title}}<select {{^name}} name="{{name}}"{{/name}}></select></label></div>';

exports.object = '<div class="attribute"><label>{{title}}</label><div class="nested"></div></div>';

exports.repeats = '<div class="attribute"><label>{{title}}</label><a class="add" href="#">add</a><div class="repeats"></div></div>';

exports.controls = '<div class="controls"><a class="remove" href="#">remove</a> <a class="add" href="#">add</a></div>';