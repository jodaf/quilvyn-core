/* $Id: ObjectViewer.js,v 1.2 2004/05/11 19:54:28 Jim Exp $ */

/*
Copyright 2004, James J. Hayes

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
 * Returns an object that can be used to format an object for inclusion in a
 * web page as a formatted table.
 */
function ObjectViewer() {
  this.names = {};
  this.elements = null;
}

/*
 * An internal function.  Returns an HTML table that represents the contents of
 * #o#, formatted according to #element# and its sub-elements. Returns an empty
 * string if #element# and its sub-elements select no portion of #o#.  #indent#
 * indicates how deeply nested the returned table is; this is used for some
 * minimal legibility formatting of the returned HTML.  #isTd# indicates
 * whether or not the returned HTML should be enclosed in a <td></td> pair.
 */
ObjectViewer._getHtml =
  function(element, o, indent, isTd) {

  if(element == null)
    return '';

  var e;
  var elementHtml = '';
  var format;
  var nestedIndent = element.compact ? '' : (indent + '  ');
  var memberValue = element.name == null ? null : o[element.name];

  if(element.elements != null) {
    var newRow = true;
    var piece;
    var pieces = [];
    for(e = element.elements; e != null; e = e.next) {
      if(e.format == '\n') {
        if(!newRow)
          pieces.push(element.compact ? '<br/>' : '</tr></table></td></tr>')
        newRow = true;
        continue;
      }
      if((piece=ObjectViewer._getHtml(e,o,nestedIndent,!element.compact)) == '')
        continue;
      if(!element.compact && newRow)
        pieces.push('<tr><td><table width="100%"><tr align="center">');
      pieces.push(piece);
      newRow = false;
    }
    if(!element.compact && !newRow)
      pieces.push('</tr></table></td></tr>')
    elementHtml =
      pieces.length == 0 ? '' : element.compact ? pieces.join('') :
      ('<table' + (element.borders ? ' border="1"' : '') + ' width="100%">' +
       (element.title != null? '<tr><th>' + element.title + '</th></tr>' : '') +
       pieces.join('') +
       '</table>');
  }

  if(memberValue != null) {
    if(typeof memberValue == 'object') {
      var all = [];
      for(e in memberValue)
        all.push(e + ': ' + value[e]);
      memberValue = all.join(' * ');
    }
    elementHtml = ('' + memberValue).replace(/\n/g, '<br/>');
  }

  if(elementHtml == '')
    return '';
  format = element.format != null ? element.format :
           memberValue != null ? '<b>%N</b>: %V' : '%V';
  format = format.replace(/%N/g, element.name).replace(/%V/g, elementHtml);
  return isTd ? ('\n' + indent + '<td>' + format + '</td>') : (indent + format);

}

/* Returns JavaScript code that represents the contents of #o#. */
ObjectViewer.toCode =
  function(o) {
  var result = '';
  var lineLength = 0;
  for(var a in o) {
    var value = o[a];
    value = typeof value == 'object' ? ObjectViewer.toCode(value) :
      ('"'+value.toString().replace(/\"/g, '\\"').replace(/\n/g, '\\n')+'"');
    var image = '"' + a + '":' + value + ',';
    if(lineLength + image.length >= 80) {
      /* Minimal pretty-printing for legibility. */
      result += '\n';
      lineLength = 0;
    }
    result += image;
    lineLength += image.length;
  }
  result = result.substring(0, result.length - 1); /* Drop trailing comma. */
  if(result.length >= 80)
    result = '\n' + result + '\n';
  return '{' + result + '}';
};

ObjectViewer.prototype.addElements =
  function(element /* ... */) {
  for(var i = 0; i < arguments.length; i++) {
    var e = arguments[i];
    var parent = e.within == null ? null : this.names[e.within];
    var sib;
    var next = e.before == null ? null : this.names[e.before];
    this.names[e.name] = e;
    if(parent == null)
      parent = this;
    if(parent.elements == null || parent.elements == next) {
      e.next = parent.elements;
      parent.elements = e;
    }
    else {
      for(sib=parent.elements; sib.next!=null && sib.next!=next; sib=sib.next)
        ; /* empty */
      e.next = sib.next;
      sib.next = e;
    }
  }
};

/* Returns HTML for a table that shows the contents of #o#. */
ObjectViewer.prototype.getHtml =
  function(o) {
  return ObjectViewer._getHtml(this.elements, o, '', false);
};
