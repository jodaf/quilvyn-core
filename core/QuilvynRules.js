/*
Copyright 2020, James J. Hayes

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

"use strict";

/*
 * A Quilvyn extension to RuleEngine.  Adds an associated name and version,
 * named choice sets (e.g., classes, weapons), editor elements, and named
 * object viewers.
 */
function QuilvynRules(name, version) {
  this.choices = {};
  this.editorElements = [];
  this.name = name;
  this.version = version;
  this.viewers = {};
  this.viewerAdditions = [];
}
QuilvynRules.prototype = new RuleEngine();

/* Adds #name# and associate attributes #attrs# to the set of #type# choices. */
QuilvynRules.prototype.addChoice = function(type, name, attrs) {
  if(this.choices[type] == null)
    this.choices[type] = {};
  if(name in this.choices[type] && this.choices[type][name] != attrs)
    console.log('Redefinition of ' + type + ' "' + name + '" from "' + this.choices[type][name] + '" to "' + attrs + '"');
  this.choices[type][name] = attrs;
};

/* Removes #name from the set of #type# choices. */
QuilvynRules.prototype.deleteChoice = function(type, name) {
  if(!(type in this.choices))
    console.log('Delete from non-existent type "' + type  + '"');
  else if(!(name in this.choices[type]))
    console.log('Delete of non-existent ' + type  + ' "' + name + '"');
  else
    delete this.choices[type][name];
};

/*
 * Add each #item# to the set of valid selections for choice set #name#.  Each
 * value of #item# may contain data associated with the selection.  See
 * quilvyndoc.html for details.
 */
QuilvynRules.prototype.defineChoice = function(name, item /*, item ... */) {
  var allArgs = QuilvynUtils.flatten(arguments, 1);
  for(var i = 0; i < allArgs.length; i++) {
    var pieces = allArgs[i].split(/:/);
    var choice = pieces[0];
    var associated = pieces.length < 2 ? '' : pieces[1];
    this.addChoice(name, choice, associated);
  }
};

/*
 * Defines an element for the Quilvyn character editor display.  #name# is the
 * name of the element; #label# is a string label displayed before the element;
 * #type# is one of "bag", "button", "checkbox", "select-one", "set", "text",
 * or "textarea", indicating the type of element; #params# is an array of
 * configuration information, and #before# is the name of an existing editor
 * element that the new one should be placed before.  If #type# is null, an
 * existing element named #name# is removed.
 */
QuilvynRules.prototype.defineEditorElement = function
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
 * Add a rule indicating the effect that the value of the attribute #source#
 * has on the attribute #target#.  #type# indicates how #source# affects
 * #target#--'=' for assignment, '+' for increment, '^' for minimum, 'v' for
 * maximum, and '?' for a prerequisite.  The optional JavaScript #expr#
 * computes the amount for the assignment, increment, etc; if it is null, the
 * value of #source# is used.
 */
QuilvynRules.prototype.defineRule = function
  (target, source, type, expr /*, source, type, expr ... */) {
  for(var i = 3; i < arguments.length; i += 3)
    this.addRules(target, arguments[i - 2], arguments[i - 1], arguments[i]);
};

/*
 * Include attribute #name# on the character sheet before attribute #position#
 * (or at the end of section #position# if it ends with '/') in all viewers
 * associated with this QuilvynRules.  The optional HTML #format# may be
 * supplied to indicate how #name# should be formatted on the sheet.
 * #separator# is a bit of HTML used to separate elements for items that have
 * multiple values.
 */
QuilvynRules.prototype.defineSheetElement = function
  (name, position, format, separator) {
  var element = {name: name, format: format, separator: separator};
  if(position != null && position.match(/\/$/)) {
    element.within = position.substring(0, position.length - 1);
  } else if(position != null && position.match(/\+$/)) {
    element.after = position.substring(0, position.length - 1);
  } else {
    element.before = position;
  }
  for(var a in this.viewers) {
    var viewer = this.viewers[a];
    viewer.removeElements(name);
    if(position != null)
      viewer.addElements(element);
  }
  this.viewerAdditions[this.viewerAdditions.length] = element;
};

/* Associates ObjectViewer #viewer# with name #name# in this QuilvynRules. */
QuilvynRules.prototype.defineViewer = function(name, viewer) {
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
QuilvynRules.prototype.getChoices = function(name) {
  return this.choices[name];
};

/* Returns the array of editor elements associated with this rule set. */
QuilvynRules.prototype.getEditorElements = function() {
  return this.editorElements;
};

/* Returns the name of this rule set. */
QuilvynRules.prototype.getName = function() {
  return this.name;
};

/* Returns the version of this rule set. */
QuilvynRules.prototype.getVersion = function() {
  return this.version;
};

/* Returns the ObjectViewer associated with #name#, null if none. */
QuilvynRules.prototype.getViewer = function(name) {
  if(name == null) {
    name = this.getViewerNames()[0];
  }
  return this.viewers[name];
};

/*
 * Returns an array of all the names associated with ObjectViewers in this
 * QuilvynRules.
 */
QuilvynRules.prototype.getViewerNames = function() {
  return QuilvynUtils.getKeys(this.viewers);
};

/*
 * Fixes as many validation errors in #attributes# as possible.  This stub
 * implementation should be overridden by inheriting classes/instances.
 */
QuilvynRules.prototype.makeValid = function(attributes) {
};

/*
 * Returns a character with randomized settings for all randomizable attributes
 * except for those in #fixedAttributes#, which are copied to the result.
 */
QuilvynRules.prototype.randomizeAllAttributes = function(fixedAttributes) {
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
QuilvynRules.prototype.randomizeOneAttribute = function(attributes, attribute) {
  if(this.getChoices(attribute + 's') != null) {
    attributes[attribute] =
      QuilvynUtils.randomKey(this.getChoices(attribute + 's'));
  }
};

/*
 * Returns HTML body content for user notes associated with this rule set. This
 * stub implementation should be overridden by inheriting classes/instances.
 */
QuilvynRules.prototype.ruleNotes = function() {
  return "No notes for this rule set\n";
};
