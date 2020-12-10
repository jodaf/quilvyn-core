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
    var arg = allArgs[i];
    var colonPos = arg.indexOf(':');
    if(colonPos < 0)
      this.addChoice(name, arg, '');
    else
      this.addChoice
        (name, arg.substring(0, colonPos), arg.substring(colonPos + 1));
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

/* Returns an array of plugins upon which this one depends. */
QuilvynRules.prototype.getPlugins = function() {
  return [];
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

/*
 * Defines in #rules# the rules associated with with the list #features#, each
 * element of which has the format "[condition ?] [level:]name".. Rules add
 * each feature to #setName# if the value of #levelAttr# is at least equal to
 * the level required for the feature. If #selectable# is true, the user is
 * allowed to select these features for the character, rather than having them
 * assigned automatically.
 */
QuilvynRules.featureListRules = function(
  rules, features, setName, levelAttr, selectable
) {

  var prefix = setName.charAt(0).toLowerCase() +
               setName.slice(1).replace(/\s/g, '') + 'Features';

  for(var i = 0; i < features.length; i++) {

    var pieces = features[i].split(':');
    var feature = pieces.length == 2 ? pieces[1] : pieces[0];
    var featureAttr = prefix + '.' + feature;
    var level = pieces.length == 2 ? pieces[0] : '1';
    var conditions = [];
    var matchInfo;

    pieces = level.split(/\s*\?\s*/);
    if(pieces.length == 2) {
      conditions = pieces[0].split('/');
      level = pieces[1];
    }

    if(selectable) {
      var choice = setName + ' - ' + feature;
      rules.defineChoice
        ('selectableFeatures', choice + ':Type="' + setName + '"');
      rules.defineRule(featureAttr, 'selectableFeatures.' + choice, '=', null);
      conditions.push(levelAttr + ' >= ' + level);
      QuilvynRules.prerequisiteRules
        (rules, 'validation', choice.charAt(0).toLowerCase() + choice.slice(1).replace(/ /g, '') + 'SelectableFeature',
         'selectableFeatures.' + choice, conditions);
    } else {
      if(conditions.length > 0) {
        QuilvynRules.prerequisiteRules
          (rules, 'test', featureAttr, levelAttr, conditions);
        rules.defineRule(featureAttr,
         'testNotes.' + featureAttr, '?', 'source == 0 ? 1 : null'
        );
      }
      if(level == '1') {
        rules.defineRule(featureAttr, levelAttr, '=', '1');
      } else {
        rules.defineRule
          (featureAttr, levelAttr, '=', 'source >= ' + level + ' ? 1 : null');
      }
    }

    rules.defineRule('features.' + feature, featureAttr, '+=', null);

    if((matchInfo = feature.match(/^([A-Z]\w+\s(Familiarity|Proficiency))\s\((.*\/.*)\)$/)) != null) {
      // Set corresponding feature for each individual item.
      var items = matchInfo[3].split('/');
      for(var j = 0; j < items.length; j++) {
        rules.defineRule('features.' + matchInfo[1]+' (' + items[j] + ')',
          'features.' + feature, '=', '1'
        );
      }
    }
  }

};

/*
 * Defines in #rules# the rules needed to check, when #attr# is defined, if the
 * list of prerequisites #tests# are met. The results of the tests are computed
 * in the #section# note #noteName#--zero if successful, non-zero otherwise.
 */
QuilvynRules.prerequisiteRules = function(
  rules, section, noteName, attr, tests
) {

  var matchInfo;
  var note = section + 'Notes.' + noteName;
  var verb = section == 'validation' ? 'Requires' : 'Implies';
  var subnote = 0;
  var zeroTestCount = 0;

  if(typeof(tests) == 'string')
    tests = [tests];

  rules.defineChoice('notes', note + ':' + verb + ' ' + tests.join('/'));

  for(var i = 0; i < tests.length; i++) {

    var alternatives = tests[i].split(/\s*\|\|\s*/);
    var target = note;

    if(alternatives.length > 1) {
      target = note + 'Alt.' + i;
      rules.defineRule(target, '', '=', '0');
      rules.defineRule(note, target, '+', 'source > 0 ? 1 : null');
    }

    for(var j = 0; j < alternatives.length; j++) {

      var test = alternatives[j];
      var matchInfo = test.match(/^(.*\S)\s*(<=|>=|==|!=|<|>|=~|!~)\s*(\S.*)$/);

      if(!matchInfo) {
        rules.defineRule(target, test, '+', '1');
      } else {
        var operand1 = matchInfo[1];
        var operand2 = matchInfo[3];
        var operator = matchInfo[2];
        if((matchInfo = operand1.match(/^(Max|Sum)\s+(.*)$/)) != null) {
          var pat = matchInfo[2].replace(/^["']|['"]$/g, '');
          operand1 = matchInfo[1] + pat;
          rules.defineRule(operand1,
            new RegExp(pat + '.*\\D$'), matchInfo[1]=='Max' ? '^=' : '+=', null
          );
        }
        if(operator == '==' && operand2 == '0') {
          rules.defineRule(target, operand1, '+', 'source != 0 ? -1 : null');
          zeroTestCount++;
        } else if(operator == '!~') {
          rules.defineRule(target,
            operand1, '+', 'source.match(' + operand2 + ') ? null : 1'
          );
        } else if(operator == '=~') {
          rules.defineRule(target,
            operand1, '+', 'source.match(' + operand2 + ') ? 1 : null'
          );
        } else if(operand2.match(/^[a-z]/)) {
          subnote++;
          rules.defineRule(note + '.' + subnote,
            operand1, '=', null,
            operand2, '+', '-source'
          );
          rules.defineRule(target,
            note + '.' + subnote, '+', 'source ' + operator + ' 0 ? 1 : null'
          );
        } else {
          rules.defineRule(target,
            operand1, '+', 'source ' + operator + ' ' + operand2 + ' ? 1 : null'
          );
        }
      }
    }

  }

  rules.defineRule
    (note, attr, '=', 'source ? ' + (-tests.length+zeroTestCount) + ' : null');

};

/*
 * Defines in #rules# each spell in the list #spells#, each element of which
 * has the format "groupLevel:name[;name...]". #spellDict# is the dictionary of
 * all spells used to look up individual spell attributes.
 */
QuilvynRules.spellListRules = function(rules, spells, spellDict) {

  for(var i = 0; i < spells.length; i++) {

    var pieces = spells[i].split(':');
    if(pieces.length != 2) {
      console.log('Bad format for spell list "' + spells[i] + '"');
      break;
    }

    var groupAndLevel = pieces[0];
    var spellList = pieces[1];
    var matchInfo = groupAndLevel.match(/^(\w+)(\d)$/);
    if(!matchInfo) {
      console.log('Bad format for spell list "' + spells[i] + '"');
      break;
    }

    var group = matchInfo[1];
    var level = matchInfo[2];
    var spellNames = spellList.split(';');
    for(var j = 0; j < spellNames.length; j++) {
      var spellName = spellNames[j];
      if(spellDict[spellName] == null) {
        console.log('Unknown spell "' + spellName + '"');
        continue;
      }
      var school = QuilvynUtils.getAttrValue(spellDict[spellName], 'School');
      if(school == null) {
        console.log('No school given for spell ' + spellName);
        continue;
      }
      var fullSpell =
        spellName + '(' + group + level + ' ' + school.substring(0, 4) + ')';
      rules.choiceRules
        (rules, 'Spell', fullSpell,
         spellDict[spellName] + ' Group=' + group + ' Level=' + level);
    }

  }

};

/*
 * Defines in #rules# the rules required to allocate the list of spell slots
 * #spellSlots# to the character. #levelAttr# is the name of the attribute that
 * holds the character's level for acquiring these spells.
 */
QuilvynRules.spellSlotRules = function(rules, levelAttr, spellSlots) {
  for(var i = 0; i < spellSlots.length; i++) {
    var spellTypeAndLevel = spellSlots[i].split(/:/)[0];
    var spellType = spellTypeAndLevel.replace(/\d+/, '');
    var spellLevel = spellTypeAndLevel.replace(/[A-Z]*/, '');
    var code = spellSlots[i].substring(spellTypeAndLevel.length + 1).
               replace(/\=/g, ' ? ').
               split(/;/).reverse().join(' : source >= ');
    code = 'source >= ' + code + ' : null';
    if(code.indexOf('source >= 1 ?') >= 0) {
      code = code.replace(/source\s>=\s1\s./, '').replace(/\s:\snull/, '');
    }
    rules.defineRule('spellSlots.' + spellTypeAndLevel, levelAttr, '+=', code);
  }
};

/*
 * Defines in #rules# the rules necessary to check that the values of the
 * attributes #available# and #allocated# are equal. Results are stored in
 * the attribute validationNotes.#name#Allocation.
 */
QuilvynRules.validAllocationRules = function(
  rules, name, available, allocated
) {
  var note = 'validationNotes.' + name + 'Allocation';
  rules.defineChoice('notes', note + ':%1 available vs. %2 allocated');
  if(available.startsWith('Sum '))
    available = new RegExp(available.replace(/^Sum *["']|['"]$/g, ''));
  rules.defineRule(note + '.1',
    '', '=', '0',
    available, '+', null
  );
  if(allocated.startsWith('Sum '))
    allocated = new RegExp(allocated.replace(/^Sum *["']|['"]$/g, ''));
  rules.defineRule(note + '.2',
    '', '=', '0',
    allocated, '+', null
  );
  rules.defineRule(note,
    note + '.1', '=', '-source',
    note + '.2', '+=', null
  );
};
