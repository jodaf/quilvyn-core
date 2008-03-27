//* $Id: ScribeRules.js,v 1.70 2008/03/27 05:12:23 Jim Exp $ */

/*
Copyright 2008, James J. Hayes

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
 * A Scribe extension to RuleEngine.  Adds an associated name, named choice
 * sets (e.g., classes, weapons), editor elements, and named object viewers.
 */
function ScribeRules(name) {
  this.choices = {};
  this.editorElements = [];
  this.name = name;
  this.viewers = {};
  this.viewerAdditions = [];
}
ScribeRules.prototype = new RuleEngine();

/*
 * Add each #item# to the set of valid selections for choice set #name#.  Each
 * value of #item# may contain data associated with the selection.  See
 * scribedoc.html for details.
 */
ScribeRules.prototype.defineChoice = function(name, item /*, item ... */) {
  if(this.choices[name] == null)
    this.choices[name] = {};
  var o = this.choices[name];
  var allArgs = ScribeUtils.flatten(arguments, 1);
  for(var i = 0; i < allArgs.length; i++) {
    var pieces = allArgs[i].split(/:/);
    var choice = pieces[0];
    var associated = pieces.length < 2 ? '' : pieces[1];
    var existing = o[choice];
    o[choice] = existing != null && existing != '' && existing != associated ?
                existing + '/' + associated : associated;
  }
};

/*
 * Defines an element for the Scribe character editor display.  #name# is the
 * name of the element; #label# is a string label displayed before the element;
 * #type# is one of "bag", "button", "checkbox", "select-one", "set", "text",
 * or "textarea", indicating the type of element; #params# is an array of
 * configuration information, and #before# is the name of an existing editor
 * element that the new one should be placed before.  If #type# is null, an
 * existing element named #name# is removed.
 */
ScribeRules.prototype.defineEditorElement = function
  (name, label, type, params, before) {
  for(var i = this.editorElements.length - 1; i >= 0; i--) {
    if(this.editorElements[i][0] == name) {
      this.editorElements =
        this.editorElements.slice(0, i).concat(this.editorElements.slice(i+1));
    }
  }
  if(type != null) {
    var i = this.editorElements.length;
    if(before != null) {
      for(i = 0; i < this.editorElements.length; i++) {
        if(this.editorElements[i][0] == before) {
          break;
        }
      }
    }
    var element = [name, label, type, params];
    if(i == this.editorElements.length) {
      this.editorElements[i] = element;
    } else {
      this.editorElements = this.editorElements.slice(0, i).
        concat([element]).concat(this.editorElements.slice(i));
    }
  }
};

/*
 * Add an HTML #format# for including attribute #attr# on the character sheet.
 * #attr# will typically be a new attribute to be included in one of the notes
 * sections of the character sheet.
 */
ScribeRules.prototype.defineNote = function(note /*, note ... */) {
  var allArgs = ScribeUtils.flatten(arguments);
  for(var i = 0; i < allArgs.length; i++) {
    this.defineChoice('notes', allArgs[i]);
    var pieces = allArgs[i].split(/:/);
    var attribute = pieces[0];
    var format = pieces[1];
    var matchInfo = attribute.match(/Notes\.(\w)(.*)(Domain|Feature|Synergy)$/);
    if(matchInfo != null) {
      var name = matchInfo[1].toUpperCase() +
                 matchInfo[2].replace(/([a-z\)])([A-Z\(])/g, '$1 $2');
      if(matchInfo[3] == 'Synergy')
        this.defineRule
          (attribute, 'skillModifier.' + name, '=', 'source >= 5 ? 1 : null');
      else if(format.indexOf('%V') < 0)
        this.defineRule
          (attribute, matchInfo[3].toLowerCase() + 's.' + name, '=', '1');
      else
        this.defineRule
          (attribute, matchInfo[3].toLowerCase() + 's.' + name, '?', null);
    }
    if(attribute.match(/^skillNotes\./) &&
       (matchInfo = format.match(/^([+-](%V|\d+)) (.+)$/)) != null) {
      var affected = matchInfo[3].split('/');
      var bump = matchInfo[1];
      if(bump == '+%V')
        bump = 'source';
      else if(bump == '-%V')
        bump = '-source';
      var j;
      for(j = 0;
          j < affected.length &&
          affected[j].match(/^[A-Z][a-z]*( [A-Z][a-z]*)*( \([A-Z][a-z]*\))?$/) != null;
          j++)
        ; /* empty */
      if(j == affected.length) {
        for(j = 0; j < affected.length; j++)
          this.defineRule('skillModifier.' + affected[j], attribute, '+', bump);
      }
    } else if((matchInfo = attribute.match(/^(sanity|validation)Notes\.(.*?)(Class|Feat|SelectableFeature)([A-Za-z]+)/)) != null &&
              !format.match(/[ \(/][a-z]/)) {
      var group = matchInfo[4] == 'Feats' ? 'features' :
                  matchInfo[4] == 'Skills' ? 'skillModifier' :
                  matchInfo[4].match(/s$/) ?
                  matchInfo[4].substring(0, 1).toLowerCase() +
                  matchInfo[4].substring(1) : '';
      var requirements = format.replace(/^Requires /, '').split('/');
      var target = matchInfo[3] == 'Class' ? 'Levels' : (matchInfo[3] + 's');
      target = target.substring(0, 1).toLowerCase() + target.substring(1);
      target += '.' + matchInfo[2].substring(0, 1).toUpperCase() +
        matchInfo[2].substring(1).replace(/([a-z\)])([A-Z\(])/g, "$1 $2");
      var currentValue = 1;
      var totalValue = 0;
      for(var j = 0; j < requirements.length; j++) {
        var choices = requirements[j].split(/\|\|/);
        for(var k = 0; k < choices.length; k++) {
          var source = choices[k].replace(/(^\s+)|(\s+$)/g, '');
          var op = '>=';
          var value = '1';
          if((matchInfo=source.match(/^(.*)(<=?|>=?|[!=][=~])(.*)/)) != null) {
            source = matchInfo[1].replace(/\s+$/, '');
            op = matchInfo[2];
            value = matchInfo[3].replace(/^\s+/, '');
          }
          if(group == '') {
            source = source.substring(0, 1).toLowerCase() +
                     source.substring(1).replace(/ /g, '');
          } else if(source.match(/^(Max|Sum)( |$)/)) {
            var summaryAttr =
              source.substring(0, 1).toLowerCase() + source.substring(1, 3);
            var summaryOp = summaryAttr == 'max' ? '^=' : '+=';
            summaryAttr += group + '.' + source.substring(4);
            var re = '^' + group + '.' + source.substring(4);
            this.defineRule(summaryAttr, new RegExp(re), summaryOp, null);
            source = summaryAttr;
          } else {
            source = group + '.' + source;
          }
          var expr;
          if(op.match(/[!=]~/)) {
            expr = (op == '!~' ? '!' : '') + 'source.match(/' + value + '/)';
          } else if(value.match(/^\d+$/)) {
            expr = 'source ' + op + ' ' + value;
          } else {
            expr = 'source ' + op + ' "' + value + '"';
          }
          expr += ' ? ' + currentValue + ' : null';
          this.defineRule(attribute, source, '+', expr);
        }
        totalValue += currentValue;
        currentValue *= 10;
      }
      this.defineRule(attribute, target, '=', '-' + totalValue);
      if(format.indexOf('|') >= 0) {
        this.defineRule(attribute, '', 'v', '0');
      }
    }
  }
};

/*
 * Add a rule indicating the effect that the value of the attribute #source#
 * has on the attribute #target#.  #type# indicates how #source# affects
 * #target#--'=' for assignment, '+' for increment, '^' for minimum, 'v' for
 * maximum, and '?' for a prerequisite.  The optional JavaScript #expr#
 * computes the amount for the assignment, increment, etc; if it is null, the
 * value of #source# is used.
 */
ScribeRules.prototype.defineRule = function
  (target, source, type, expr /*, source, type, expr ... */) {
  for(var i = 3; i < arguments.length; i += 3)
    this.addRules(target, arguments[i - 2], arguments[i - 1], arguments[i]);
};

/*
 * Include attribute #name# on the character sheet before attribute #position#
 * (or at the end of section #position# if it ends with '/') in all viewers
 * associated with this ScribeRules.  The optional HTML #format# may be
 * supplied to indicate how #name# should be formatted on the sheet.
 * #separator# is a bit of HTML used to separate elements for items that have
 * multiple values.
 */
ScribeRules.prototype.defineSheetElement = function
  (name, position, format, separator) {
  var element = {name: name, format: format, separator: separator};
  if(position != null && position.match(/\/$/)) {
    element.within = position.substring(0, position.length - 1);
  } else {
    element.before = position;
  }
  for(var a in this.viewers) {
    viewer = this.viewers[a];
    viewer.removeElements(name);
    if(position != null)
      viewer.addElements(element);
  }
  this.viewerAdditions[this.viewerAdditions.length] = element;
};

/* Associates ObjectViewer #viewer# with name #name# in this ScribeRules. */
ScribeRules.prototype.defineViewer = function(name, viewer) {
  this.viewers[name] = viewer;
  for(var i = 0; i < this.viewerAdditions.length; i++) {
    var element = this.viewerAdditions[i];
    viewer.removeElements(element.name);
    if(element.before != null || element.within != null)
      viewer.addElements(element);
  }
};

/*
 * Returns an object that contains all the choices for #name# previously
 * defined for this rule set via addChoice.
 */
ScribeRules.prototype.getChoices = function(name) {
  return this.choices[name];
};

/* Returns the array of editor elements associated with this rule set. */
ScribeRules.prototype.getEditorElements = function() {
  return this.editorElements;
};

/* Returns the name of this rule set. */
ScribeRules.prototype.getName = function() {
  return this.name;
};

/* Returns the ObjectViewer associated with #name#, null if none. */
ScribeRules.prototype.getViewer = function(name) {
  if(name == null) {
    name = this.getViewerNames()[0];
  }
  return this.viewers[name];
};

/*
 * Returns an array of all the names associated with ObjectViewers in this
 * ScribeRules.
 */
ScribeRules.prototype.getViewerNames = function() {
  return ScribeUtils.getKeys(this.viewers);
};

/*
 * Fixes as many validation errors in #attributes# as possible.  This null
 * implementation should be replaced by inheriting classes/instances.
 */
ScribeRules.prototype.makeValid = function(attributes) {
};

/*
 * Returns a character with randomized settings for all randomizable attributes
 * except for those in #fixedAttributes#, which are copied to the result.
 */
ScribeRules.prototype.randomizeAllAttributes = function(fixedAttributes) {
  var result = { };
  var timings = [];
  for(var a in fixedAttributes) {
    result[a] = fixedAttributes[a];
  }
  var attributes = this.getChoices('random');
  for(var a in attributes) {
    if(result[a] == null) {
      var before = new Date().getTime();
      this.randomizeOneAttribute(result, a);
      timings[timings.length] =
        'Randomize ' + a + ': ' + (new Date().getTime() - before);
    }
  }
  var before = new Date().getTime();
  this.makeValid(result);
  timings[timings.length] = 'makeValid: ' + (new Date().getTime() - before);
  if(window.DEBUG) {
    result.notes =
      (result.notes != null ? result.notes + '\n' : '') + timings.join('\n');
  }
  return result;
};

/* Sets #attributes#'s #attribute# attribute to a random value. */
ScribeRules.prototype.randomizeOneAttribute = function(attributes, attribute) {
  if(this.getChoices(attribute + 's') != null) {
    attributes[attribute] =
      ScribeUtils.randomKey(this.getChoices(attribute + 's'));
  }
};
