/* $Id: ScribeRules.js,v 1.1 2005/02/01 07:39:02 Jim Exp $ */

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

function ScribeCustomClass
  (name, hitDie, prerequisites, classSkills, features) {
  var i;
  ScribeCustomChoices('classes', name, hitDie);
  for(i = 0; i < prerequisites.length; i++)
    DndCharacter.validityTests =
      DndCharacter.validityTests.concat(['levels.' + name, prerequisites[i]]);
  for(i = 0; i < classSkills.length; i++)
    rules.AddRules('classSkills.' + classSkills[i], 'levels.' + name, '=', '1');
  var code = '';
  var note = 'featNotes.' + name + 'Features';
  DndCharacter.LoadClassFeatureRules
    (rules, name, 'featNotes.' + name + 'Features', features);
}

function ScribeCustomRules
  (target, source, type, expr /*, source, type, expr ... */) {
  for(var i = 3; i < arguments.length; i += 3)
    rules.AddRules(target, arguments[i - 2], arguments[i - 1], arguments[i]);
}

function ScribeCustomSheet(name, within, before, format) {
  viewer.addElements(
    {name: SheetName(name), within: within, before: before, format: format}
  );
}
