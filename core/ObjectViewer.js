/* $Id: ObjectViewer.js,v 1.12 2005/09/28 23:58:30 Jim Exp $ */

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

  var format;
  var html;
  var inner = [];
  var memberValue = o[top.name];
  var prefix = '';
  var separator = top.separator;
  var suffix = '';

  for(var i = 0; i < this.elements.length; i++) {
    var e = this.elements[i];
    if(e.within != top.name)
      continue;
    if((html = this._getHtml(e, o, indent + '  ')) == '')
      continue;
    inner[inner.length] = html;
  }
  if(memberValue != null) {
    if(typeof memberValue != 'object')
      inner[inner.length] = ('' + memberValue).replace(/\n/g, '<br/>\n');
    else if(memberValue.constructor == Array)
      inner = inner.concat(memberValue);
    else
      for(var e in memberValue)
        inner[inner.length] = e + ': ' + memberValue[e];
  }
  if(inner.length == 0)
    return '';
  if(inner.length > 1 && (separator == null || separator == '\n')) {
    var align = 'align="' + 'center' + '"';
    prefix = '<table id="' + top.name + '"' +
             (top.borders != null ? ' border="' + top.borders + '"' : '') +
             ' width="100%"><tr ' + align + '>\n' + indent + '  <td>';
    separator = '</td>' + (separator == '\n' ? '\n' + indent +
                           '</tr><tr ' + align + '>' : '') + '\n' + indent + '  <td>';
    suffix = '</td>\n' + indent + '</tr></table>';
  }
  html = inner.join(separator);
  format = top.format != null ? top.format :
           memberValue != null ? '<b>%N</b>: %V' : '%V';
  format = format.replace(/%N/g, top.name).replace(/%V/g, html);
  return prefix + format + suffix;

}

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
    var e = arguments[i];
    var j = this.elements.length;
    if(e.before != null) {
      for(j = 0;
          j < this.elements.length && this.elements[j].name != e.before;
          j++)
        ; /* empty */
    }
    if(j >= this.elements.length)
      this.elements[j] = e;
    else
      this.elements =
       this.elements.slice(0, j).concat(e).concat(this.elements.slice(j));
  }
};

/* Returns HTML for a table that shows the contents of #o#. */
ObjectViewer.prototype.getHtml = function(o) {
  var result = '';
  for(var i = 0; i < this.elements.length; i++) {
    var e = this.elements[i];
    if(e.within == null)
      result += this._getHtml(e, o, '');
  }
  return result;
};

ObjectViewer.prototype.removeElements = function(name /*, name ... */) {
  for(var i = 0; i < arguments.length; i++)
    for(var j = this.elements.length - 1; j >= 0; j--)
      if(this.elements[j].name == arguments[i])
        this.elements =
          this.elements.slice(0, j).concat(this.elements.slice(j + 1));
}
