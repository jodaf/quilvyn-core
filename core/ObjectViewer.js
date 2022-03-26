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

/*
 * Returns an object that can be used to format objects for inclusion in a
 * web page as nested tables.
 */
function ObjectViewer() {
  this.elements = [];
}

/*
 * An internal function.  Returns an HTML table that represents the contents of
 * #o#, formatted according to #top# and its sub-elements. Returns an empty
 * string if #top# and its sub-elements select no portion of #o#.  #indent#
 * indicates how deeply nested the returned table is; this is used for some
 * minimal legibility formatting of the returned HTML.
 */
ObjectViewer.prototype._getHtml = function(top, o, indent) {

  var columns = top.columns;
  var format;
  var hasNested;
  var html;
  var memberValue = o[top.name];
  var separator = top.separator;
  var values = [];

  if(top.format != null && top.format.replace(/%N|%V/, '') == top.format)
    return top.format;
  for(var i = 0; i < this.elements.length; i++) {
    var e = this.elements[i];
    if(e.within != top.name)
      continue;
    if((html = this._getHtml(e, o, indent + '  ')) == '')
      continue;
    values[values.length] = html;
  }
  hasNested = values.length > 0;
  if(memberValue != null) {
    if(typeof memberValue != 'object')
      values[values.length] = ('' + memberValue).replace(/\n/g, '<br/>\n');
    else if(memberValue.constructor == Array)
      values = values.concat(memberValue);
    else
      for(var e in memberValue)
        values[values.length] = e + ': ' + memberValue[e];
  }
  if(values.length == 0)
    return '';
  if(!hasNested && values.length == 1) {
    html = values[0];
  } else if(columns == null && separator != null && separator != '\n') {
    html = values.join(separator);
  } else {
    var align = 'center';
    var border = top.borders ? 'border:' + top.borders + 'px solid black' : '';
    var equalColumns = false;
    if(columns == null) {
      columns = separator == '\n' ? 1 : values.length;
    } else if(/[LCRE]+$/.test(columns)) {
      align = columns.indexOf('L') >= 0 ? 'left' :
              columns.indexOf('R') >= 0 ? 'right' : 'center';
      equalColumns = columns.indexOf('E') >= 0;
      columns = columns.replace(/\D+$/, '');
    }
    var rows = Math.ceil(values.length / columns);
    html = indent + '<table id="' + top.name.replaceAll(' ', '') + '" style="' +
           (border ? border +'; ' : '') + 'width:100%">\n';
    if(equalColumns && columns > 1) {
      for(var i = 0; i < columns - 1; i++) {
        html += indent + '<col style="width:' + Math.floor(100 / columns) + '%"/>\n';
      }
      html += indent + '<col style="width:' + Math.ceil(100 / columns) + '%"/>\n';
    }
    html += indent + '<tr style="text-align:' + align + '">\n';
    for(var i = 0; i < rows * columns; i++) {
      var column = i % columns;
      var row = Math.floor(i / columns);
      if(i > 0 && column == 0) {
        html += indent + '</tr><tr style="text-align:' + align + '">\n';
      }
      var index = row + column * rows;
      var value = index >= values.length ? '' : values[index];
      html += indent + '  <td' + (border ? ' style="' + border + '"' : '') + '>' + value + '</td>\n';
    }
    html += indent + '</tr></table>\n';
  }
  format = top.format != null ? top.format :
           memberValue != null ? '<b>%N</b>: %V' : '%V';
  format = format.replace(/%N/g, top.name).replace(/%V/g, html);
  return format;

};

/* Returns JavaScript code that represents the contents of #o#. */
ObjectViewer.toCode = function(o, indent, maxLen) {
  var result;
  var type = typeof o;
  if(indent == null)
    indent = '';
  if(maxLen == null)
    maxLen = 80;
  if(o == null)
    result = 'null';
  else if(type == 'boolean')
    result = o ? 'true' : 'false';
  else if(type == 'number' || (type == 'string' && o.search(/^\d+$/) == 0))
    result = o + '';
  else if(type == 'string')
    result = '"' + o.replace(/\"/g, '\\"').replace(/\r?\n/g,'\\n') + '"';
  else {
    var isArray = o.constructor == Array;
    var bits = [];
    var lineLen = 1; /* Account for opening brace/bracket */
    var indexes = [];
    indent += '  ';
    for(var a in o)
      indexes[indexes.length] = a;
    indexes.sort();
    for(var i = 0; i < indexes.length; i++) {
      var index = indexes[i];
      var element = isArray ? '' : ('"' + index + '":');
      element += ObjectViewer.toCode(o[index], indent, maxLen);
      if(i < indexes.length - 1)
        element += ', ';
      if(element.indexOf('\n') >= 0)
        lineLen = element.length - element.lastIndexOf('\n');
      else if(lineLen + element.length >= maxLen) {
        bits[bits.length] = '\n' + indent;
        lineLen = indent.length;
      } else
        lineLen += element.length;
      bits[bits.length] = element;
    }
    result = bits.join('');
    if(result.indexOf('\n') >= 0)
      result = (isArray ? '[' : '{') + '\n' + indent + result + '\n' +
               indent.substring(2) + (isArray ? ']' : '}');
    else
      result = (isArray ? '[' : '{') + result + (isArray ? ']' : '}');
  }
  return result;
};

ObjectViewer.prototype.addElements = function(element /*, element ... */) {
  for(var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    var e = {};
    for(var a in arg)
      e[a] = arg[a];
    var j = this.elements.length;
    var nextTo = e.after != null ? e.after : e.before != null ? e.before : null;
    if(nextTo != null) {
      for(j = 0;
          j < this.elements.length && this.elements[j].name != nextTo;
          j++)
        ; /* empty */
    }
    if(j >= this.elements.length) {
      this.elements[j] = e;
    } else {
      e.within = this.elements[j].within;
      if(nextTo == e.after)
        j++;
      this.elements =
        this.elements.slice(0, j).concat(e).concat(this.elements.slice(j));
    }
  }
};

/*
 * Returns HTML for a table that shows the contents of the elements of #o#
 * that are contained within element #root#.
 */
ObjectViewer.prototype.getHtml = function(o, root) {
  for(var i = 0; i < this.elements.length; i++) {
    var e = this.elements[i];
    if(e.name == root)
      return this._getHtml(e, o, '');
  }
  return '';
};

ObjectViewer.prototype.removeElements = function(name /*, name ... */) {
  for(var i = 0; i < arguments.length; i++)
    for(var j = this.elements.length - 1; j >= 0; j--)
      if(this.elements[j].name == arguments[i])
        this.elements =
          this.elements.slice(0, j).concat(this.elements.slice(j + 1));
};
