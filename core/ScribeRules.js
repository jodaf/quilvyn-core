/* $Id: ScribeRules.js,v 1.52 2006/12/12 02:43:21 Jim Exp $ */

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

/* TODO */
function ScribeRules(name) {
  this.choices = {};
  this.name = name;
  this.tests = [];
  this.viewers = {};
}
ScribeRules.prototype = new RuleEngine();

/*
 * Add each #item# to the set of valid selections for #name#.  Each value of
 * #name# may contain data associated with the selection.  See scribedoc.html
 * for details.
 */
ScribeRules.prototype.defineChoice = function(name, item /*, item ... */) {
  if(this.choices[name] == null)
    this.choices[name] = {};
  var o = this.choices[name];
  var allArgs = ScribeUtils.flatten(arguments, 1);
  for(var i = 0; i < allArgs.length; i++) {
    var pieces = allArgs[i].split(/:/);
    o[pieces[0]] = pieces.length < 2 ? '' : pieces[1];
  }
};

/*
 * Add #name# to the list of valid classes.  Characters of class #name# roll
 * #hitDice# ([Nd]S, where N is the number of dice and S the number of sides)
 * more hit points at each level.  The other parameters are optional.
 * #skillPoints# is the number of skill points a character of the class
 * receives each level; #baseAttackBonus#, #saveFortitudeBonus#,
 * #saveReflexBonus# and #saveWillBonus# are JavaScript expressions that
 * compute the attack and saving throw bonuses the character accumulates each
 * class level; #armorProficiencyLevel#, #shieldProficiencyLevel# and
 * #weaponProficiencyLevel# indicate any proficiency in these categories that
 * characters of the class gain; #classSkills# is an array of skills that are
 * class (not cross-class) skills for the class, #features# an array of
 * level/feature name pairs indicating features that the class acquires when
 * advancing levels, #prerequisites# an array of validity tests that must be
 * be passed in order to qualify for the class, #spellsKnown# an array of
 * information about the type, number, and level of spells known at each
 * class level, #spellsPerDay# an array of information about the type, number,
 * and level of spells castable per day at each class level, and 
 * #spellsPerDayAbility# the attribute that, if sufficiently high, gives bonus
 * spells per day for the class.
 */
ScribeRules.prototype.defineClass = function
  (name, hitDice, skillPoints, baseAttackBonus, saveFortitudeBonus,
   saveReflexBonus, saveWillBonus, armorProficiencyLevel,
   shieldProficiencyLevel, weaponProficiencyLevel, classSkills, features,
   prerequisites, spellsKnown, spellsPerDay, spellsPerDayAbility) {

  var classLevel = 'levels.' + name;
  this.defineChoice('classes', name + ':' + hitDice);
  if(skillPoints != null)
    this.defineRule
      ('skillPoints', classLevel, '+', '(source + 3) * ' + skillPoints);
  if(baseAttackBonus != null)
    this.defineRule('baseAttack', classLevel, '+', baseAttackBonus);
  if(saveFortitudeBonus != null)
    this.defineRule('save.Fortitude', classLevel, '+', saveFortitudeBonus);
  if(saveReflexBonus != null)
    this.defineRule('save.Reflex', classLevel, '+', saveReflexBonus);
  if(saveWillBonus != null)
    this.defineRule('save.Will', classLevel, '+', saveWillBonus);
  if(armorProficiencyLevel != null)
    this.defineRule
      ('armorProficiencyLevel', classLevel, '^', armorProficiencyLevel);
  if(shieldProficiencyLevel != null)
    this.defineRule
      ('shieldProficiencyLevel', classLevel, '^', shieldProficiencyLevel);
  if(weaponProficiencyLevel != null)
    this.defineRule
      ('weaponProficiencyLevel', classLevel, '^', weaponProficiencyLevel);
  if(prerequisites != null) {
    for(var i = 0; i < prerequisites.length; i++) {
      this.defineTest('{' + classLevel + '} == null || ' + prerequisites[i]);
    }
  }
  if(classSkills != null) {
    for(var i = 0; i < classSkills.length; i++) {
      this.defineRule('classSkills.' + classSkills[i], classLevel, '=', '1');
    }
  }
  if(features != null) {
    var prefix =
      name.substring(0, 1).toLowerCase() + name.substring(1).replace(/ /g, '');
    for(var i = 0; i < features.length; i++) {
      var levelAndFeature = features[i].split(/:/);
      var feature = levelAndFeature[levelAndFeature.length == 1 ? 0 : 1];
      var level = levelAndFeature.length == 1 ? 1 : levelAndFeature[0];
      this.defineRule(prefix + 'Features.' + feature,
        'levels.' + name, '=', 'source >= ' + level + ' ? 1 : null'
      );
      this.defineRule
        ('features.' + feature, prefix + 'Features.' + feature, '+=', null);
    }
    this.defineSheetElement
      (name + ' Features', 'FeaturesAndSkills', null, 'Feats', ' * ');
  }
  if(spellsKnown != null) {
    for(var j = 0; j < spellsKnown.length; j++) {
      var typeAndLevel = spellsKnown[j].split(/:/)[0];
      var code = spellsKnown[j].substring(typeAndLevel.length + 1).
                 split(/\//).reverse().join('source >= ');
      code = code.replace(/:/g, ' ? ').replace(/source/g, ' : source');
      code = 'source >= ' + code + ' : null';
      if(code.indexOf('source >= 1 ?') >= 0) {
        code = code.replace(/source >= 1 ./, '').replace(/ : null/, '');
      }
      this.defineRule
        ('spellsKnown.' + typeAndLevel, 'levels.' + name, '=', code);
    }
  }
  if(spellsPerDay != null) {
    for(var j = 0; j < spellsPerDay.length; j++) {
      var typeAndLevel = spellsPerDay[j].split(/:/)[0];
      var level = typeAndLevel.replace(/[A-Z]*/, '');
      var code = spellsPerDay[j].substring(typeAndLevel.length + 1).
                 split(/\//).reverse().join('source >= ');
      code = code.replace(/:/g, ' ? ').replace(/source/g, ' : source');
      code = 'source >= ' + code + ' : null';
      if(code.indexOf('source >= 1 ?') >= 0) {
        code = code.replace(/source >= 1 ./, '').replace(/ : null/, '');
      }
      this.defineRule
        ('spellsPerDay.' + typeAndLevel, 'levels.' + name, '=', code);
      this.defineRule('spellDifficultyClass.' + typeAndLevel,
        'spellsPerDay.' + typeAndLevel, '?', null,
        null, '=', 10 + (level - 0)
      );
      if(spellsPerDayAbility != null) {
        var spellsPerDayModifier = spellsPerDayAbility + 'Modifier';
        var level = typeAndLevel.replace(/[A-Za-z]*/g, '');
        if(level > 0) {
          code = 'source >= ' + level +
                 ' ? 1 + Math.floor((source - ' + level + ') / 4) : null';
          this.defineRule
            ('spellsPerDay.' + typeAndLevel, spellsPerDayModifier, '+', code);
        }
        this.defineRule('spellDifficultyClass.' + typeAndLevel,
          spellsPerDayModifier, '+', null
        );
      }
    }
    this.defineRule
      ('spellsPerDayLevels.' + name, 'levels.' + name, '=', null);
  }

};

/*
 * Defines an element for the scribe character editor display.  #name# is the
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
 * Add #name# to the list of valid races.  #abilityAdjustment# is either null
 * or a note of the form "[+-]n Ability[/[+-]n Ability]*", indicating ability
 * adjustments for the race.  #features# is either null or an array of strings
 * of the form "[level:]Feature", indicating a list of features associated with
 * the race and the character levels at which they're acquired.  If no level is
 * include with a feature, the feature is acquired at level 1.
 */
ScribeRules.prototype.defineRace = function(name, abilityAdjustment, features) {
  this.defineChoice('races', name);
  var prefix =
    name.substring(0, 1).toLowerCase() + name.substring(1).replace(/ /g, '');
  if(abilityAdjustment != null) {
    var abilityNote = 'abilityNotes.' + prefix + 'AbilityAdjustment';
    this.defineNote(abilityNote + ':' + abilityAdjustment);
    var adjustments = abilityAdjustment.split(/\//);
    for(var i = 0; i < adjustments.length; i++) {
      var amountAndAbility = adjustments[i].split(/ +/);
      this.defineRule
        (amountAndAbility[1], abilityNote, '+', amountAndAbility[0]);
    }
    this.defineRule
      (abilityNote, 'race', '=', 'source == "' + name + '" ? 1 : null');
  }
  if(features != null) {
    for(var i = 0; i < features.length; i++) {
      var levelAndFeature = features[i].split(/:/);
      var feature = levelAndFeature[levelAndFeature.length == 1 ? 0 : 1];
      var level = levelAndFeature.length == 1 ? 1 : levelAndFeature[0];
      this.defineRule(prefix + 'Features.' + feature,
        'race', '?', 'source == "' + name + '"',
        'level', '=', 'source >= ' + level + ' ? 1 : null'
      );
      this.defineRule
        ('features.' + feature, prefix + 'Features.' + feature, '+=', null);
    }
    this.defineSheetElement
      (name + ' Features', 'FeaturesAndSkills', null, 'Feats', ' * ');
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
 * Include attribute #name# on the character sheet in section #within# before
 * attribute #before# (or at the end of the section if #before# is null).  The
 * optional HTML #format# may be supplied to indicate how #name# should be
 * formatted on the sheet.  #separator# is a bit of HTML used to separate
 * elements for items that have multiple values.
 */
ScribeRules.prototype.defineSheetElement = function
  (name, within, format, before, separator) {
  for(var a in this.viewers) {
    viewer = this.viewers[a];
    viewer.removeElements(name);
    if(within != null) {
      viewer.addElements(
        {name: name, within: within, before: before, format: format, separator: separator}
      );
    }
  }
};

/* Adds each #test# to the checks Scribe uses when validating a character. */
ScribeRules.prototype.defineTest = function(test /*, test ... */) {
  for(var i = 0; i < arguments.length; i++)
    this.tests = this.tests.concat(arguments[i]);
};

ScribeRules.prototype.defineViewer = function(name, viewer) {
  this.viewers[name] = viewer;
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

/*
 * Returns an array that contains all the rules previously defined for this
 * rule set via addRule.
 */
ScribeRules.prototype.getTests = function() {
  return this.tests;
};

ScribeRules.prototype.getViewer = function(name) {
  if(name == null) {
    name = this.getViewerNames()[0];
  }
  return this.viewers[name];
};

ScribeRules.prototype.getViewerNames = function() {
  return ScribeUtils.getKeys(this.viewers);
};
