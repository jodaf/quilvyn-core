/* $Id: ScribeRules.js,v 1.8 2005/04/01 07:15:02 Jim Exp $ */

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
    'classes':'classesHitDie', 'deities':'deitiesDomains',
    'skills': 'skillsAbility', 'spells':'spellsLevels',
    'weapons': 'weaponsDamage'
  };
  if(nameObjects[name] != null)
    name = nameObjects[name];
  var o = DndCharacter[name];
  if(o == null)
    return;
  if(o.constructor == Array) {
    for(var i = 1; i < arguments.length; i++)
      o[o.length] = arguments[i];
    o.sort();
  }
  else
    for(var i = 2; i < arguments.length; i += 2)
      o[arguments[i - 1]] = arguments[i];
};

/*
 * Add #name# to the list of valid classes.  Characters of class #name# roll
 * #hitDice# (either a number of sides or NdS, where N is the number of dice
 * and S the number of sides) more hit points each level.  #prerequisites# is
 * an array of validity tests that must be passed in order to qualify for the
 * class, #classSkills# an array of skills that are class skills (as oppsed to
 * cross-class) for the class, and #features# an array of level/feature name
 * pairs indicating features that the class acquires when advancing levels.
 */
function ScribeCustomClass
  (name, hitDice, prerequisites, classSkills, features) {
  var i;
  ScribeCustomChoices('classes', name, hitDice + '' /* Convert int to str */);
  if(prerequisites != null) {
    for(i = 0; i < prerequisites.length; i++)
      DndCharacter.validityTests[DndCharacter.validityTests.length] =
        '{levels.' + name + '} == null || ' + prerequisites[i];
  }
  if(classSkills != null)
    for(i = 0; i < classSkills.length; i++)
      rules.AddRules('classSkills.'+classSkills[i], 'levels.'+name, '=', '1');
  if(features != null)
    DndCharacter.LoadClassFeatureRules
      (rules, name, 'featNotes.' + name.toLowerCase() + 'Features', features);
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
  viewer.addElements(
    {name: SheetName(name), within: within, before: before, format: format}
  );
}

/*
 * Adds each #test# to the checks Scribe performs when validating a character.
 */
function ScribeCustomTests(test /*, test ... */) {
  for(var i = 0; i < arguments.length; i++)
    DndCharacter.validityTests[DndCharacter.validityTests.length] =
      arguments[i];
}
