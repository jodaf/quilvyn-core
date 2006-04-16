/* $Id: ScribeRules.js,v 1.23 2006/04/16 06:08:32 Jim Exp $ */

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
 * in the parameter list.  See scribedoc.html for details.
 */
function ScribeCustomChoices(name, item /*, item ... */) {
  var o = DndCharacter[name];
  if(o == null)
    return;
  if(o == DndCharacter.spells) {
    for(var i = 2; i < arguments.length; i += 2) {
      var spell = arguments[i - 1];
      var levels = arguments[i];
      var existingLevels = DndCharacter.spells[spell];
      if(existingLevels != null) {
        var newLevels = levels.split('/');
        var oldLevels = existingLevels.split('/');
        newLevels = newLevels.concat(oldLevels);
        newLevels.sort();
        levels = newLevels.join('/');
        /* TODO Replacement of existing levels */
      }
      DndCharacter.spells[spell] = levels;
    }
  }
  else if(o.constructor == Array) {
    var allArgs = [];
    for(var i = 1; i < arguments.length; i++)
      allArgs = allArgs.concat(arguments[i]);
    o = DndCharacter[name] = o.concat(allArgs);
    o.sort();
  }
  else
    for(var i = 2; i < arguments.length; i += 2)
      o[arguments[i - 1]] = arguments[i];
}

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
function ScribeCustomClass
  (name, hitDice, skillPoints, baseAttackBonus, saveFortitudeBonus,
   saveReflexBonus, saveWillBonus, armorProficiencyLevel,
   shieldProficiencyLevel, weaponProficiencyLevel, classSkills, features,
   prerequisites) {

  var classLevel = 'levels.' + name;
  ScribeCustomChoices('classes', name, hitDice + '' /* Convert int to str */);
  if(skillPoints != null)
    ScribeCustomRules
      ('skillPoints', classLevel, '+', '(source + 3) * ' + skillPoints);
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
      DndCharacter.tests[DndCharacter.tests.length] =
        '{' + classLevel + '} == null || ' + prerequisites[i];
  }
  if(classSkills != null)
    for(var i = 0; i < classSkills.length; i++)
      ScribeCustomRules('classSkills.' + classSkills[i], classLevel, '=', '1');
  if(features != null) {
    var code = '';
    var initial = [];
    var note = name.substring(0, 1).toLowerCase() + name.substring(1);
    note = note.replace(/ /g, '');
    note = 'featureNotes.' + note + 'Features';
    for(var i = 1; i < features.length; i += 2) {
      var feature = features[i];
      var level = features[i - 1];
      if(level <= 1)
        initial[initial.length] = '"' + feature + '"';
      else
        code += '.concat(source >= ' + level + ' ? ["' + feature + '"] : [])';
      ScribeCustomRules('features.' + feature,
        note, '=', 'source.indexOf("' + feature + '") >= 0 ? 1 : null'
      );
    }
    ScribeCustomRules(note, 'levels.' + name, '=',
      '[' + initial.join(',') + ']' + code + '.sort().join("/")'
    );
  }

}

/*
 * Add an HTML #format# for including attribute #attr# on the character sheet.
 * #attr# will typically be a new attribute to be included in one of the notes
 * sections of the character sheet.
 */
function ScribeCustomNotes(attr, format /*, attr, format ... */) {
  var notes = {};
  for(var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if(typeof(arg) == 'object' && arg.constructor == Array)
      for(var j = 1; j < arg.length; j += 2)
        notes[arg[j - 1]] = arg[j];
    else
      notes[arg] = arguments[++i];
  }
  for(var a in notes) {
    var matchInfo;
    var note = notes[a];
    DndCharacter.notes[a] = note;
    if((matchInfo =
          a.match(/^(\w+)Notes\.(\w)(.*)(Domain|Feature|Synergy)$/)) != null) {
      var name = matchInfo[2].toUpperCase() +
                 matchInfo[3].replace(/([a-z\)])([A-Z\(])/g, '$1 $2');
      if(matchInfo[4] == 'Synergy')
        ScribeCustomRules(a, 'skills.' + name, '=', 'source >= 5 ? 1 : null');
      else if(note.indexOf('%V') < 0)
        ScribeCustomRules
          (a, matchInfo[4].toLowerCase() + 's.' + name, '=', '1');
      else
        ScribeCustomRules
          (a, matchInfo[4].toLowerCase() + 's.' + name, '?', null);
    }
    if(a.match(/^skillNotes\./) &&
       (matchInfo = note.match(/^\+(\d+) (.+)$/)) != null) {
      var affected = matchInfo[2].split('/');
      var bump = matchInfo[1];
      var i;
      for(i = 0;
          i<affected.length && DndCharacter.skills[affected[i]]!=null;
          i++)
        ; /* empty */
      if(i == affected.length)
        for(i = 0; i < affected.length; i++)
          ScribeCustomRules('skills.' + affected[i], a, '+', bump);
    }
  }
}

function ScribeCustomRace(name, features) {
  ScribeCustomChoices('races', name);
  if(features != null) {
    var code = '';
    var initial = [];
    var note = name.substring(0, 1).toLowerCase() + name.substring(1);
    note = note.replace(/ /g, '');
    note = 'featureNotes.' + note + 'Features';
    for(var i = 1; i < features.length; i += 2) {
      var feature = features[i];
      var level = features[i - 1];
      if(level <= 1)
        initial[initial.length] = '"' + feature + '"';
      else
        code += '.concat(source >= ' + level + ' ? ["' + feature + '"] : [])';
      ScribeCustomRules('features.' + feature,
        note, '=', 'source.indexOf("' + feature + '") >= 0 ? 1 : null'
      );
    }
    ScribeCustomRules(note,
      'race', '?', 'source == "' + name + '"',
      'level', '=', '[' + initial.join(',') + ']' + code + '.sort().join("/")'
    );
  }
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
 * formatted on the sheet.  #separator# is a bit of HTML used to separate
 * elements for items that have multiple values.
 */
function ScribeCustomSheet(name, within, format, before, separator) {
  viewer.removeElements(name);
  viewer.addElements(
    {name: name, within: within, before: before, format: format, separator: separator}
  );
}

/* Adds each #test# to the checks Scribe uses when validating a character. */
function ScribeCustomTests(test /*, test ... */) {
  for(var i = 0; i < arguments.length; i++)
    DndCharacter.tests = DndCharacter.tests.concat(arguments[i]);
}
