/* $Id: ScribeRules.js,v 1.42 2006/09/26 15:17:46 Jim Exp $ */

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

/* Placeholder for functions that define Scribe rule sets. */
function ScribeRules() {
}

/*
 * Add each #item# to the set of valid selections for #name#.  Each value of
 * #name# may contain data associated with the selection.  See scribedoc.html
 * for details.
 */
ScribeRules.defineChoices = function(name, item /*, item ... */) {
  if(Scribe[name] == null)
    Scribe[name] = {};
  var o = Scribe[name];
  var allArgs = [];
  for(var i = 1; i < arguments.length; i++)
    allArgs = allArgs.concat(arguments[i]);
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
 * compute the attack and saving throw bonuses the character acumulates each
 * class level; #armorProficiencyLevel#, #shieldProficiencyLevel# and
 * #weaponProficiencyLevel# indicate any proficiency in these categories that
 * characters of the class gain; #classSkills# is an array of skills that are
 * class (not cross-class) skills for the class, #features# an array of
 * level/feature name pairs indicating features that the class acquires when
 * advancing levels, and #prerequisites# an array of validity tests that must
 * be passed in order to qualify for the class.
 */
ScribeRules.defineClass = function
  (name, hitDice, skillPoints, baseAttackBonus, saveFortitudeBonus,
   saveReflexBonus, saveWillBonus, armorProficiencyLevel,
   shieldProficiencyLevel, weaponProficiencyLevel, classSkills, features,
   prerequisites) {

  var classLevel = 'levels.' + name;
  ScribeRules.defineChoices('classes', name + ':' + hitDice);
  if(skillPoints != null)
    ScribeRules.defineRule
      ('skillPoints', classLevel, '+', '(source + 3) * ' + skillPoints);
  if(baseAttackBonus != null)
    ScribeRules.defineRule('baseAttack', classLevel, '+', baseAttackBonus);
  if(saveFortitudeBonus != null)
    ScribeRules.defineRule
      ('save.Fortitude', classLevel, '+', saveFortitudeBonus);
  if(saveReflexBonus != null)
    ScribeRules.defineRule('save.Reflex', classLevel, '+', saveReflexBonus);
  if(saveWillBonus != null)
    ScribeRules.defineRule('save.Will', classLevel, '+', saveWillBonus);
  if(armorProficiencyLevel != null)
    ScribeRules.defineRule
      ('armorProficiencyLevel', classLevel, '^', armorProficiencyLevel);
  if(shieldProficiencyLevel != null)
    ScribeRules.defineRule
      ('shieldProficiencyLevel', classLevel, '^', shieldProficiencyLevel);
  if(weaponProficiencyLevel != null)
    ScribeRules.defineRule
      ('weaponProficiencyLevel', classLevel, '^', weaponProficiencyLevel);
  if(prerequisites != null) {
    for(var i = 0; i < prerequisites.length; i++)
      Scribe.tests[Scribe.tests.length] =
        '{' + classLevel + '} == null || ' + prerequisites[i];
  }
  if(classSkills != null)
    for(var i = 0; i < classSkills.length; i++)
      ScribeRules.defineRule
        ('classSkills.' + classSkills[i], classLevel, '=', '1');
  if(features != null) {
    var prefix =
      name.substring(0, 1).toLowerCase() + name.substring(1).replace(/ /g, '');
    for(var i = 0; i < features.length; i++) {
      var levelAndFeature = features[i].split(/:/);
      var feature = levelAndFeature[levelAndFeature.length == 1 ? 0 : 1];
      var level = levelAndFeature.length == 1 ? 1 : levelAndFeature[0];
      ScribeRules.defineRule(prefix + 'Features.' + feature,
        'levels.' + name, '=', 'source >= ' + level + ' ? 1 : null'
      );
      ScribeRules.defineRule
        ('features.' + feature, prefix + 'Features.' + feature, '+=', null);
    }
    ScribeRules.defineSheetElement
      (name + ' Features', 'FeaturesAndSkills', null, 'Feats', ' * ');
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
ScribeRules.defineEditorElement = function(name, label, type, params, before) {
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
ScribeRules.defineNotes = function(note /*, note ... */) {
  var allArgs = [];
  for(var i = 0; i < arguments.length; i++)
    allArgs = allArgs.concat(arguments[i]);
  for(var i = 0; i < allArgs.length; i++) {
    ScribeRules.defineChoices('notes', allArgs[i]);
    var pieces = allArgs[i].split(/:/);
    var attribute = pieces[0];
    var format = pieces[1];
    var matchInfo =
      attribute.match(/^(\w+)Notes\.(\w)(.*)(Domain|Feature|Synergy)$/);
    if(matchInfo != null) {
      var name = matchInfo[2].toUpperCase() +
                 matchInfo[3].replace(/([a-z\)])([A-Z\(])/g, '$1 $2');
      if(matchInfo[4] == 'Synergy')
        ScribeRules.defineRule
          (attribute, 'skills.' + name, '=', 'source >= 5 ? 1 : null');
      else if(format.indexOf('%V') < 0)
        ScribeRules.defineRule
          (attribute, matchInfo[4].toLowerCase() + 's.' + name, '=', '1');
      else
        ScribeRules.defineRule
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
          j<affected.length &&
          affected[j].match(/^[A-Z][a-z]*( [A-Z][a-z]*)*( \([A-Z][a-z]*\))?$/) != null;
          j++)
        ; /* empty */
      if(j == affected.length)
        for(j = 0; j < affected.length; j++)
          ScribeRules.defineRule('skills.' + affected[j], attribute, '+', bump);
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
ScribeRules.defineRace = function(name, abilityAdjustment, features) {
  ScribeRules.defineChoices('races', name);
  var prefix =
    name.substring(0, 1).toLowerCase() + name.substring(1).replace(/ /g, '');
  if(abilityAdjustment != null) {
    var abilityNote = 'abilityNotes.' + prefix + 'AbilityAdjustment';
    ScribeRules.defineNotes(abilityNote + ':' + abilityAdjustment);
    var adjustments = abilityAdjustment.split(/\//);
    for(var i = 0; i < adjustments.length; i++) {
      var amountAndAbility = adjustments[i].split(/ +/);
      ScribeRules.defineRule
        (amountAndAbility[1], abilityNote, '+', amountAndAbility[0]);
    }
    ScribeRules.defineRule
      (abilityNote, 'race', '=', 'source == "' + name + '" ? 1 : null');
  }
  if(features != null) {
    for(var i = 0; i < features.length; i++) {
      var levelAndFeature = features[i].split(/:/);
      var feature = levelAndFeature[levelAndFeature.length == 1 ? 0 : 1];
      var level = levelAndFeature.length == 1 ? 1 : levelAndFeature[0];
      ScribeRules.defineRule(prefix + 'Features.' + feature,
        'race', '?', 'source == "' + name + '"',
        'level', '=', 'source >= ' + level
      );
      ScribeRules.defineRule
        ('features.' + feature, prefix + 'Features.' + feature, '+=', null);
    }
    ScribeRules.defineSheetElement
      (name + ' Features', 'FeaturesAndSkills', null, 'Feats', ' * ');
  }
};

/* Add the function #fn# as a randomizer for each of the listed attributes. */
ScribeRules.defineRandomizer = function(fn, attr /*, attr ... */) {
  for(var i = 1; i < arguments.length; i++)
    Scribe.randomizers[arguments[i]] = fn;
}

/*
 * Add a rule indicating the effect that the value of the attribute #source#
 * has on the attribute #target#.  #type# indicates how #source# affects
 * #target#--'=' for assignment, '+' for increment, '^' for minimum, 'v' for
 * maximum, and '?' for a prerequisite.  The optional JavaScript #expr#
 * computes the amount for the assignment, increment, etc; if it is null, the
 * value of #source# is used.
 */
ScribeRules.defineRule = function
  (target, source, type, expr /*, source, type, expr ... */) {
  for(var i = 3; i < arguments.length; i += 3)
    rules.AddRules(target, arguments[i - 2], arguments[i - 1], arguments[i]);
};

/*
 * Include attribute #name# on the character sheet in section #within# before
 * attribute #before# (or at the end of the section if #before# is null).  The
 * optional HTML #format# may be supplied to indicate how #name# should be
 * formatted on the sheet.  #separator# is a bit of HTML used to separate
 * elements for items that have multiple values.
 */
ScribeRules.defineSheetElement = function
  (name, within, format, before, separator) {
  viewer.removeElements(name);
  if(within != null) {
    viewer.addElements(
      {name: name, within: within, before: before, format: format, separator: separator}
    );
  }
}

/* Adds each #test# to the checks Scribe uses when validating a character. */
ScribeRules.defineTest = function(test /*, test ... */) {
  for(var i = 0; i < arguments.length; i++)
    Scribe.tests = Scribe.tests.concat(arguments[i]);
};
