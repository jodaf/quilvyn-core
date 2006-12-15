/* $Id: Input.js,v 1.5 2006/12/15 06:01:42 Jim Exp $ */

/*
Copyright 2005, James J. Hayes

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

/*=== Convenience functions for the Input pseudo-class. ===*/

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
      '<input name="' + name + '" type="button" value="' + params[0] + '"/>'
  else if(type == 'checkbox' || type == 'radio') {
    result = '<input name="' + name + '" type="' + type + '"/>';
    if(params != null)
      result += params[0];
  }
  else if(type == 'select-one') {
    var opts = new Array();
    for(var i = 0; i < params.length; i++)
      opts[opts.length] =
        '<option value="' + params[i] + '">' + params[i] + '</option>';
    result =
      '<select name="' + name + '">\n' + opts.join('\n') + '\n</select>';
  }
  else if(type == 'text')
    result =
      '<input name="' + name + '" type="text" size="' + params[0] + '"/>';
  else if(type == 'textarea')
    result =
      '<textarea name="' + name + '" rows="' + params[1] + '" cols="' +
      params[0] + '"/></textarea>';
  return result;
};

/* Directs #input# to invoke #fn# when it is changed/pressed. */
function InputSetCallback(input, fn) {
  var method = input.type == 'button' ||
               input.type == 'checkbox' ||
               input.type == 'radio' ? 'onclick' : 'onchange';
  input[method] = fn;
}

/* Replaces the options in a select #input# with the array #selections#. */
function InputSetOptions(input, options) {
  var i;
  if(input.options.length > options.length)
    input.options.length = options.length;
  for(i = 0; i < input.options.length; i++)
    input.options[i].text = input.options[i].value = options[i];
  for( ; i < options.length; i++)
    input.options[i] = new Option(options[i], options[i], 0, 0);
  input.selectedIndex = 0;
};

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
  return true;
}
