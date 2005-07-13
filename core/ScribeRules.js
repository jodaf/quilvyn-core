/* $Id: ScribeRules.js,v 1.13 2005/07/13 04:21:20 Jim Exp $ */

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
 * Add each #item# to the set of valid selections for #name#.  For some values
 * of #name# (e.g., 'weapons'), data associated with each item is interspersed
 * in the parameter list.  See help.html for details.
 */
function ScribeCustomChoices(name, item /*, item ... */) {
  var nameObjects = {
    'armors':'armorsArmorClassBonuses', 'classes':'classesHitDie',
    'deities':'deitiesDomains', 'skills': 'skillsAbility',
    'spells':'spellsLevels', 'weapons': 'weaponsDamage'
  };
  if(nameObjects[name] != null)
    name = nameObjects[name];
  var o = DndCharacter[name];
  if(o == null)
    return;
  if(o == DndCharacter.spellsLevels) {
    for(var i = 2; i < arguments.length; i += 2) {
      var spell = arguments[i - 1];
      var levels = arguments[i];
      var existingLevels = DndCharacter.spellsLevels[spell];
      if(existingLevels != null) {
        var newLevels = levels.split('/');
        var oldLevels = existingLevels.split('/');
        newLevels = newLevels.concat(oldLevels);
        newLevels.sort();
        levels = newLevels.join('/');
        /* TODO Replacement of existing levels */
      }
      DndCharacter.spellsLevels[spell] = levels;
    }
  }
  else if(o.constructor == Array) {
    var allArgs = [];
    for(var i = 1; i < arguments.length; i++)
      allArgs = allArgs.concat(arguments[i]);
    o = DndCharacter[name] = o.concat(allArgs);
    o.sort();
    if(o == DndCharacter.feats) {
      for(var i = 0; i < allArgs.length; i++)
        rules.AddRules
          ('features.' + allArgs[i], 'feats.' + allArgs[i], '=', '1');
    }
  }
  else
    for(var i = 2; i < arguments.length; i += 2)
      o[arguments[i - 1]] = arguments[i];
}

/*
 * Add #name# to the list of valid classes.  Characters of class #name# roll
 * #hitDice# ([N[d]]S, where N is the number of dice and S the number of sides)
 * more hit points at each level.  The other parameters are optional.
 * #skillPointsBonus#, #baseAttackBonus#, #saveFortitudeBonus#,
 * #saveReflexBonus# and #saveWillBonus# are JavaScript expressions that
 * compute the amount of additional skill points and attack and saving throw
 * bonuses the character acumulates each class level; #armorProficiencyLevel#,
 * #shieldProficiencyLevel# and #weaponProficiencyLevel# indicate any
 * proficiency in these categories that characters of the class gain;
 * #classSkills# is an array of skills that are class (not cross-class) skills
 * for the class, #features# an array of level/feature name pairs indicating
 * features that the class acquires when advancing levels, and #prerequisites#
 * an array of validity tests that must be passed in order to qualify for the
 * class.
 */
function ScribeCustomClass
  (name, hitDice, skillPointsBonus, baseAttackBonus, saveFortitudeBonus,
   saveReflexBonus, saveWillBonus, armorProficiencyLevel,
   shieldProficiencyLevel, weaponProficiencyLevel, classSkills, features,
   prerequisites) {
  var classLevel = 'levels.' + name;
  ScribeCustomChoices('classes', name, hitDice + '' /* Convert int to str */);
  if(skillPointsBonus != null)
    ScribeCustomRules('skillPoints', classLevel, '+', skillPointsBonus);
  if(baseAttackBonus != null)
    ScribeCustomRules('baseAttack', classLevel, '+', baseAttackBonus);
  if(saveFortitudeBonus != null)
    ScribeCustomRules('saveFortitude', classLevel, '^', saveFortitudeBonus);
  if(saveReflexBonus != null)
    ScribeCustomRules('saveReflex', classLevel, '^', saveReflexBonus);
  if(saveWillBonus != null)
    ScribeCustomRules('saveWill', classLevel, '^', saveWillBonus);
  if(armorProficiencyLevel != null)
    ScribeCustomRules
      ('armorProficiencyLevel', classLevel, '^', armorProficiencyLevel);
  if(shieldProficiencyLevel != null)
    ScribeCustomRules
      ('shieldProficiencyLevel', classLevel, '^', shieldProficiencyLevel);
  if(weaponProficiencyLevel != null)
    ScribeCustomRules
      ('weaponProficiencyLevel', classLevel, '^', weaponProficiencyLevel);
  if(prerequisites != null) {
    for(var i = 0; i < prerequisites.length; i++)
      DndCharacter.validityTests[DndCharacter.validityTests.length] =
        '{' + classLevel + '} == null || ' + prerequisites[i];
  }
  if(classSkills != null)
    for(var i = 0; i < classSkills.length; i++)
      rules.AddRules('classSkills.' + classSkills[i], classLevel, '=', '1');
  if(features != null) {
    var noteName = name.substring(0, 1).toLowerCase() + name.substring(1);
    noteName = noteName.replace(/ /g, '');
    DndCharacter.LoadClassFeatureRules
      (rules, name, 'featNotes.' + noteName + 'Features', features);
  }
}

/*
 * Add an HTML #format# for including attribute #attr# on the character sheet.
 * #attr# will typically be a new attribute to be included in one of the notes
 * sections of the character sheet.
 */
function ScribeCustomNotes(attr, format /*, attr, format ... */) {
  var o = {};
  for(var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if(typeof(arg) == 'object' && arg.constructor == Array)
      for(var j = 1; j < arg.length; j += 2)
        o[arg[j - 1]] = arg[j];
    else
      o[arg] = arguments[++i];
  }
  DndCharacter.LoadRulesFromNotes(rules, o);
}

/*
 * Add a rule indicating the effect that the value of the attribute #source#
 * has on the attribute #target#.  #type# indicates how #source# affects
 * #target#--'=' for assignment, '+' for increment, '^' for minimum, 'v' for
 * maximum, and '?' for a prerequisite.  The optional JavaScript #expr#
 * computes the amount for the assignment, increment, etc; if it is null, the
 * value of #source# is used.
 */
function ScribeCustomRules
  (target, source, type, expr /*, source, type, expr ... */) {
  for(var i = 3; i < arguments.length; i += 3)
    rules.AddRules(target, arguments[i - 2], arguments[i - 1], arguments[i]);
}

/*
 * Include attribute #name# on the character sheet in section #within# before
 * attribute #before# (or at the end of the section if #before# is null).  The
 * optional HTML #format# may be supplied to indicate how #name# should be
 * formatted on the sheet.
 */
function ScribeCustomSheet(name, within, before, format) {
  name = name.replace(/([a-z])([A-Z])/g, '$1 $2');
  name = name.substring(0, 1).toUpperCase() + name.substring(1);
  viewer.addElements(
    {name: name, within: within, before: before, format: format}
  );
}

/* Adds each #test# to the checks Scribe uses when validating a character. */
function ScribeCustomTests(test /*, test ... */) {
  for(var i = 0; i < arguments.length; i++)
    DndCharacter.validityTests[DndCharacter.validityTests.length] =
      arguments[i];
}
