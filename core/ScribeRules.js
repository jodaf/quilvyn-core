/* $Id: ScribeRules.js,v 1.33 2006/06/12 06:00:26 Jim Exp $ */

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
 * Add each #item# to the set of valid selections for #name#.  Each value of
 * #name# may contain data associated with the selection.  See scribedoc.html
 * for details.
 */
function ScribeCustomChoices(name, item /*, item ... */) {
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
  ScribeCustomChoices('classes', name + ':' + hitDice);
  if(skillPoints != null)
    ScribeCustomRules
      ('skillPoints', classLevel, '+', '(source + 3) * ' + skillPoints);
  if(baseAttackBonus != null)
    ScribeCustomRules('baseAttack', classLevel, '+', baseAttackBonus);
  if(saveFortitudeBonus != null)
    ScribeCustomRules('saveFortitude', classLevel, '+', saveFortitudeBonus);
  if(saveReflexBonus != null)
    ScribeCustomRules('saveReflex', classLevel, '+', saveReflexBonus);
  if(saveWillBonus != null)
    ScribeCustomRules('saveWill', classLevel, '+', saveWillBonus);
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
      Scribe.tests[Scribe.tests.length] =
        '{' + classLevel + '} == null || ' + prerequisites[i];
  }
  if(classSkills != null)
    for(var i = 0; i < classSkills.length; i++)
      ScribeCustomRules('classSkills.' + classSkills[i], classLevel, '=', '1');
  if(features != null) {
    var note = name.substring(0, 1).toLowerCase() + name.substring(1);
    note = note.replace(/ /g, '');
    note = 'featureNotes.' + note + 'Features';
    ScribeCustomFeatures('levels.' + name, note, features);
  }

}

/*
 * TODO Comment
 */
function ScribeCustomEditor(name, label, type, params, before) {
  if(type == null) {
    for(var i = Scribe.editorElements.length - 1; i >= 0; i--) {
      if(Scribe.editorElements[i][0] == name) {
        Scribe.editorElements = Scribe.editorElements.slice(0, i).
          concat(Scribe.editorElements.slice(i + 1));
      }
    }
  } else {
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
}

/*
 * TODO Comment
 */
function ScribeCustomFeatures(levelName, noteName, features) {
  var code = '';
  var initial = [];
  var lowestLevel = 100;
  for(var i = 1; i < features.length; i += 2) {
    var feature = features[i];
    var level = features[i - 1];
    if(level < lowestLevel) {
      lowestLevel = level;
    }
    if(level <= 1)
      initial[initial.length] = '"' + feature + '"';
    else
      code += '.concat(source >= ' + level + ' ? ["' + feature + '"] : [])';
    if(noteName.indexOf('featureNotes.') == 0) {
      ScribeCustomRules('features.' + feature,
        noteName, '=', 'source.indexOf("' + feature + '") >= 0 ? 1 : null'
      );
    }
  }
  ScribeCustomRules(noteName,
    levelName, '=',
    'source < ' + lowestLevel + ' ? null : ' +
    '[' + initial.join(',') + ']' + code + '.sort().join("/")'
  );
}

/*
 * Add an HTML #format# for including attribute #attr# on the character sheet.
 * #attr# will typically be a new attribute to be included in one of the notes
 * sections of the character sheet.
 */
function ScribeCustomNotes(note /*, note ... */) {
  var allArgs = [];
  for(var i = 0; i < arguments.length; i++)
    allArgs = allArgs.concat(arguments[i]);
  for(var i = 0; i < allArgs.length; i++) {
    ScribeCustomChoices('notes', allArgs[i]);
    var pieces = allArgs[i].split(/:/);
    var attribute = pieces[0];
    var format = pieces[1];
    var matchInfo =
      attribute.match(/^(\w+)Notes\.(\w)(.*)(Domain|Feature|Synergy)$/);
    if(matchInfo != null) {
      var name = matchInfo[2].toUpperCase() +
                 matchInfo[3].replace(/([a-z\)])([A-Z\(])/g, '$1 $2');
      if(matchInfo[4] == 'Synergy')
        ScribeCustomRules
          (attribute, 'skills.' + name, '=', 'source >= 5 ? 1 : null');
      else if(format.indexOf('%V') < 0)
        ScribeCustomRules
          (attribute, matchInfo[4].toLowerCase() + 's.' + name, '=', '1');
      else
        ScribeCustomRules
          (attribute, matchInfo[4].toLowerCase() + 's.' + name, '?', null);
    }
    if(attribute.match(/^skillNotes\./) &&
       (matchInfo = format.match(/^([+-]\d+) (.+)$/)) != null) {
      var affected = matchInfo[2].split('/');
      var bump = matchInfo[1];
      var j;
      for(j = 0;
          j<affected.length &&
          affected[j].match(/^[A-Z][a-z]*( [A-Z][a-z]*)*( \([A-Z][a-z]*\))?$/) != null;
          j++)
        ; /* empty */
      if(j == affected.length)
        for(j = 0; j < affected.length; j++)
          ScribeCustomRules('skills.' + affected[j], attribute, '+', bump);
    }
  }
}

/*
 * TODO Comment
 */
function ScribeCustomRace(name, abilityAdjustment, features) {
  ScribeCustomChoices('races', name);
  var prefix = name.substring(0, 1).toLowerCase() + name.substring(1);
  prefix = prefix.replace(/ /g, '');
  if(abilityAdjustment != null) {
    var abilityNote = 'abilityNotes.' + prefix + 'AbilityAdjustment';
    ScribeCustomNotes(abilityNote + ':' + abilityAdjustment);
    var adjustments = abilityAdjustment.split(/\//);
    for(var i = 0; i < adjustments.length; i++) {
      var amountAndAbility = adjustments[i].split(/ +/);
      ScribeCustomRules
        (amountAndAbility[1], abilityNote, '+', amountAndAbility[0]);
    }
    ScribeCustomRules
      (abilityNote, 'race', '=', 'source == "' + name + '" ? 1 : null');
  }
  if(features != null) {
    var featureNote = 'featureNotes.' + prefix + 'Features';
    ScribeCustomFeatures('level', featureNote, features);
    ScribeCustomRules(featureNote, 'race', '?', 'source == "' + name + '"');
  }
}

/*
 * TODO Comment
 */
function ScribeCustomRandomizers(fn, attr /*, attr ... */) {
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
    Scribe.tests = Scribe.tests.concat(arguments[i]);
}
