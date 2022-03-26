/*
Copyright 2021, James J. Hayes

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation; either version 2 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program; if not, write to the Free Software Foundation, Inc., 59 Temple
Place, Suite 330, Boston, MA 02111-1307 USA.
*/

/*jshint esversion: 6 */
/* jshint forin: false */
"use strict";

/*=== Convenience functions for the Input pseudo-class. ===*/

/* Returns the array of parameters associated with #input# (see InputHtml). */
function InputGetParams(input) {
  var result = null;
  var type = input.type;
  if(type == 'button') {
    result = [input.value];
  } else if(type == 'checkbox' || type == 'radio') {
    result = input.value ? [input.value] : [];
  } else if(type == 'select-one') {
    var options = input.options;
    result = [];
    for(var i = 0; i < options.length; i++) {
      result[i] = options[i].value;
    }
  } else if(type == 'text') {
    result = [input.size];
  } else if(type == 'textarea') {
    result = [input.cols, input.rows];
  }
  return result;
}

/* Returns the value of #input#. */
function InputGetValue(input) {
  return input.type == 'checkbox' || input.type == 'radio' ? input.checked :
         input.type == 'select-one' ? input.options[input.selectedIndex].value :
         input.value;
}

/*
 * Returns HTML for an Input named #name# of type #type#.  #params# is an array
 * of type-specific attributes--label for button Inputs, options for select
 * Inputs, columns for text Inputs, and columns and rows for textarea Inputs.
 */
function InputHtml(name, type, params) {
  var result;
  if(type == 'button')
    result =
      '<input name="' + name + '" type="button" value="' + params[0] + '"/>';
  else if(type == 'checkbox' || type == 'radio') {
    result =
      '<input name="' + name + '" type="' + type + '"' +
      ' value="' + (params ? params[0] : '') + '"/>';
    if(params)
      result += '<label for="' + name + '">' + params[0] + '</label>';
  }
  else if(type == 'select-one') {
    var opts = [];
    for(var i = 0; i < params.length; i++)
      opts[opts.length] =
        '<option value="' + params[i] + '">' + params[i] + '</option>';
    result =
      '<select name="' + name + '">\n' + opts.join('\n') + '\n</select>';
  }
  else if(type == 'text') {
    result =
      '<input name="' + name + '" type="text" size="' + params[0] + '"';
    if(params.length > 1) {
      var pat = params[1];
      result += ' pattern=".*" ' + // Placeholder used solely as a flag
                ' onchange="if(!this.value.match(/^' + pat + '$/)) {alert(\'Invalid value \' + this.value); this.value = this.lastValue==null ? \'\' : this.lastValue; } else {this.lastValue = this.value; if(this.onvalid) this.onvalid(this);}"';
    }
    result += '/>';
  } else if(type == 'textarea')
    result =
      '<textarea name="' + name + '" rows="' + params[1] + '" cols="' +
      params[0] + '"></textarea>';
  return result;
}

/* Directs #input# to invoke #fn# when it is changed/pressed. */
function InputSetCallback(input, fn) {
  var method = input.type == 'button' ||
               input.type == 'checkbox' ||
               input.type == 'radio' ? 'onclick' : 'onchange';
  if(input.pattern)
    method = 'onvalid';
  input[method] = fn;
}

/* Replaces the options in a select #input# with the array #selections#. */
function InputSetOptions(input, options) {
  var i;
  if(input.options.length > options.length)
    input.options.length = options.length;
  for(i = 0; i < input.options.length; i++) {
    if(input.options[i].text != options[i])
      input.options[i].text = input.options[i].value = options[i];
  }
  for( ; i < options.length; i++) {
    var opt = input.ownerDocument.createElement("OPTION");
    opt.text = opt.value = options[i];
    input.options[i] = opt;
  }
  if(options.length > 0)
    input.selectedIndex = 0;
}

/* Sets the value of #input# to #value#. */
function InputSetValue(input, value) {
  var i;
  if(input.type == 'checkbox' || input.type == 'radio')
    input.checked = value;
  else if(input.type == 'select-one') {
    if(value == null)
      i = 0;
    else
      for(i=0; i < input.options.length && input.options[i].value != value; i++)
        ; /* empty */
    if(i >= input.options.length)
      return false;
    input.selectedIndex = i;
  }
  else if(input.type != 'button')
    input.value = value == null ? '' : value;
  if(input.pattern)
    input.lastValue = value;
  return true;
}
