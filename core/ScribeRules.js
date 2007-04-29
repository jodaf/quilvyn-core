/* $Id: ScribeRules.js,v 1.60 2007/04/29 20:05:59 Jim Exp $ */

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
 * A Scribe extension to RuleEngine.  Adds an associated name, named choice
 * sets (e.g., classes, weapons), and named object viewers.
 */
function ScribeRules(name) {
  this.choices = {};
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
  for(var i = Scribe.editorElements.length - 1; i >= 0; i--) {
    if(Scribe.editorElements[i][0] == name) {
      Scribe.editorElements = Scribe.editorElements.slice(0, i).
        concat(Scribe.editorElements.slice(i + 1));
    }
  }
  if(type != null) {
    var i = Scribe.editorElements.length;
    if(before != null) {
      for(i = 0; i < Scribe.editorElements.length; i++) {
        if(Scribe.editorElements[i][0] == before) {
          break;
        }
      }
    }
    var element = [name, label, type, params];
    if(i == Scribe.editorElements.length) {
      Scribe.editorElements[i] = element;
    } else {
      Scribe.editorElements = Scribe.editorElements.slice(0, i).
        concat([element]).concat(Scribe.editorElements.slice(i));
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
    var matchInfo =
      attribute.match(/^(\w+)Notes\.(\w)(.*)(Domain|Feature|Synergy)$/);
    if(matchInfo != null) {
      var name = matchInfo[2].toUpperCase() +
                 matchInfo[3].replace(/([a-z\)])([A-Z\(])/g, '$1 $2');
      if(matchInfo[4] == 'Synergy')
        this.defineRule
          (attribute, 'skills.' + name, '=', 'source >= 5 ? 1 : null');
      else if(format.indexOf('%V') < 0)
        this.defineRule
          (attribute, matchInfo[4].toLowerCase() + 's.' + name, '=', '1');
      else
        this.defineRule
          (attribute, matchInfo[4].toLowerCase() + 's.' + name, '?', null);
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
      if(j == affected.length)
        for(j = 0; j < affected.length; j++)
          this.defineRule('skills.' + affected[j], attribute, '+', bump);
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
 * Include attribute #name# on the character sheet before attribute #before#
 * (or at the end of section #within# if #before# is null) in all viewers
 * associated with this ScribeRules.  The optional HTML #format# may be
 * supplied to indicate how #name# should be formatted on the sheet.
 * #separator# is a bit of HTML used to separate elements for items that have
 * multiple values.
 */
ScribeRules.prototype.defineSheetElement = function
  (name, before, within, format, separator) {
  var element = {
    name: name, before: before, within: within, format: format,
    separator: separator
  };
  for(var a in this.viewers) {
    viewer = this.viewers[a];
    viewer.removeElements(name);
    if(before != null || within != null)
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
 * Returns a character with randomized settings for all randomizable attributes
 * except for those in #fixedAttributes#, which are copied to the result.
 */
ScribeRules.prototype.randomizeAllAttributes = function(fixedAttributes) {
  var result = { };
  for(var a in fixedAttributes) {
    result[a] = fixedAttributes[a];
  }
  var attributes = this.getChoices('random');
  for(var a in attributes) {
    if(a == 'levels') {
      var totalLevels = ScribeUtils.sumMatching(result, /^levels\./);
      if(totalLevels == 0) {
        this.randomizeOneAttribute(result, a);
      }
      totalLevels = ScribeUtils.sumMatching(result, /^levels\./);
      result.experience = totalLevels * (totalLevels - 1) * 1000 / 2;
    } else if(result[a] == null) {
      this.randomizeOneAttribute(result, a);
    }
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
