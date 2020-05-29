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

/*
 * TODO
 */
QuilvynRules.prototype.addChoice = function(type, name, attrs) {
  if(this.choices[type] == null)
    this.choices[type] = {};
  if(name in this.choices[type] && this.choices[type][name] != attrs)
    console.log('Redefinition of ' + type + ' "' + name + '" from "' + this.choices[type][name] + '" to "' + attrs + '"');
  this.choices[type][name] = attrs;
};

/*
 * TODO
 */
QuilvynRules.prototype.deleteChoice = function(type, name) {
  if(!(type in this.choices[type]))
    console.log('Delete from non-existent type "' + type  + '"');
  else if(!(name in this.choices[type]))
    console.log('Delete from non-existent ' + type  + ' "' + name + '"');
  else
    delete this.choices[type][name];
};

/*
 * TODO
 */
QuilvynRules.getAttrValue = function(attrs, name) {
  return QuilvynRules.getAttrValueArray(attrs, name).pop();
};

/*
 * TODO
 */
QuilvynRules.getAttrValueArray = function(attrs, name) {
  var matchInfo;
  var pat = new RegExp('\\b' + name + '=(\'[^\']*\'|"[^"]*"|[^\\s]*)', 'gi');
  var result = [];
  if((matchInfo = attrs.match(pat))) {
    for(var i = 0; i < matchInfo.length; i++) {
      if(matchInfo[i].endsWith('"') || matchInfo[i].endsWith("'")) {
        result.push(matchInfo[i].substring(name.length + 2, matchInfo[i].length - 1));
      } else {
        result.push(matchInfo[i].substring(name.length + 1));
        if(result[result.length - 1].match(/^\d+$/))
          result[result.length - 1] *= 1; // Convert to number
      }
    }
  }
  return result;
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
 * Add an HTML #format# for including attribute #attr# on the character sheet.
 * #attr# will typically be a new attribute to be included in one of the notes
 * sections of the character sheet.
 */
QuilvynRules.prototype.defineNote = function(note /*, note ... */) {
  var allArgs = QuilvynUtils.flatten(arguments);
  for(var i = 0; i < allArgs.length; i++) {
    this.defineChoice('notes', allArgs[i]);
    var pieces = allArgs[i].split(/:/);
    var attribute = pieces[0];
    var format = pieces[1];
    var matchInfo = attribute.match(/Notes\.(.*)(Domain|Feature|Synergy)$/);
    if(matchInfo != null) {
      var name = matchInfo[1].replace(/([\w\)])(?=[A-Z\(])/g, '$1 ');
      name = name.substring(0, 1).toUpperCase() + name.substring(1);
      var dependsOn = matchInfo[2].toLowerCase() + 's.' + name;
      if(matchInfo[2] == 'Synergy')
        this.defineRule
          (attribute, 'skills.' + name, '=', 'source >= 5 ? 1 : null');
      else if(format.indexOf('%V') < 0)
        this.defineRule(attribute, dependsOn, '=', '1');
      else {
        this.defineRule(attribute, dependsOn, '?', null);
        for(var j = 0; format.indexOf('%' + j) >= 0; j++) {
          this.defineRule(attribute + '.' + j, dependsOn, '?', null);
        }
      }
    }
    if(attribute.match(/^skillNotes\./) && format.match(/^[+-](%[V\d]|\d+)/)) {
      var skills = format.split('/');
      var bump;
      for(var j = 0; j < skills.length; j++) {
        var skill = skills[j];
        var source = attribute;
        if((matchInfo = skill.match(/^([+-](%[\dV]|\d+)) (.*)/)) != null) {
          bump = matchInfo[1];
          skill = matchInfo[3];
          if(bump.charAt(1) == '%') {
            if(bump.charAt(2) != 'V') {
              source = attribute + '.' + bump.charAt(2);
            }
            bump = bump.charAt(0) + 'source';
          }
        }
        if(skill.match(/^[A-Z]\w*( [A-Z]\w*)*( \([A-Z]\w*( [A-Z]\w*)*\))?$/)) {
          this.defineRule('skillModifier.' + skill, source, '+', bump);
        }
      }
    } else if((matchInfo = attribute.match(/^(sanity|validation)Notes\.(.*?)(Class|Feat|Power|Race|SelectableFeature)([A-Z][a-z]+)$/)) != null &&
              !format.match(/[ \(\/][a-z]/)) {
      var group = matchInfo[4] == 'Feats' ? 'features' :
                  matchInfo[4].match(/s$/) ?
                  matchInfo[4].substring(0, 1).toLowerCase() +
                  matchInfo[4].substring(1) : '';
      var requirements = format.replace(/^(Implies|Requires) /, '').split('/');
      var target = matchInfo[3] == 'Class' ? 'Levels' : (matchInfo[3] + 's');
      target = target.substring(0, 1).toLowerCase() + target.substring(1);
      var subtarget = matchInfo[2].replace(/([\w\)])(?=[A-Z\(])/g, '$1 ');
      subtarget = subtarget.substring(0, 1).toUpperCase() + subtarget.substring(1);
      target += '.' + subtarget;
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
          } else if(value.match(/^(\d+|"[^"]*")$/)) {
            expr = 'source ' + op + ' ' + value;
          } else if(value.indexOf(subtarget) >= 0) {
            // Requirement varies with the value of the target. Compute the
            // difference in a temp variable and compare the result to 0.
            this.defineRule('temp' + currentValue + '.' + attribute,
              target, '=', '-Math.floor(' + value.replace(subtarget, 'source') + ')',
              source, '+', null
            );
            source = 'temp' + currentValue + '.' + attribute;
            expr = 'source ' + op + ' 0';
          } else {
            expr = 'source ' + op + ' "' + value + '"';
          }
          expr += ' ? ' + currentValue + ' : null';
          this.defineRule(attribute, source, '+', expr);
        }
        totalValue += currentValue;
        currentValue *= 10;
      }
      if(target.match(/^races./)) {
        this.defineRule(attribute,
          'race', '=',
          'source == "' + target.substring(6) + '" ? -' + totalValue + ' : null'
        );
      } else {
        this.defineRule(attribute, target, '=', '-' + totalValue);
      }
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
