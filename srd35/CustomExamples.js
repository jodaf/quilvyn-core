/*
Copyright 2019, James J. Hayes

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
 * This module provides a placeholder for some examples of custom rules.  The
 * CustomExamples function contains member methods that can be called
 * independently to apply that function's rules to a particular rule set.
 * Similarly, the constant fields of CustomExamples (DEITIES, GOODIES, etc.)
 * can be modified to change the user's choices.  For example, adding this line
 * to your CustomizeScribe function will add rules for the items found in
 * CustomExamples.MAGIC_WEAPONS to the SRD35 rule set:
 *
 *    CustomExamples.goodiesRules(SRD35.rules, CustomExamples.MAGIC_WEAPONS);
 *
 */
function CustomExamples() {
  if(window.SRD35 == null) {
    alert('The CustomExamples module requires use of the SRD35 module');
    return;
  }
}

/*
 * Each entry in the SKILLS array has the form "Name:Ability:Trained:Classes",
 * giving the skill name, the related ability, trained or untrained, and the
 * list of classes for which the skill is a class skill.  "all" for the class
 * list means that the skill is a class skill for every class.
 */
CustomExamples.SKILLS = [
  'Herbalism:intelligence:untrained:Druid/Ranger',
  'Knowledge (Plants):intelligence:trained:Druid/Ranger/Wizard',
  'Knowledge (Undead):intelligence:trained:Cleric/Wizard'
];

/* Defines rules for a specified set of custom skills. */
CustomExamples.skillRules = function(rules, skills) {
  for(var i = 0; i < skills.length; i++) {
    var pieces = skills[i].split(':', 4);
    if(pieces.length != 4)
      continue;
    var skill = pieces[0];
    var ability = pieces[1];
    var trained = pieces[2];
    var classes = pieces[3];
    SRD35.skillRules
      (rules, [skill + ':' + ability.substring(0, 3) + '/' + trained], {}, {});
    // Define the rule(s) to determine class/cross-class skill.
    if(classes == 'all') {
      rules.defineRule('classSkills.' + skill, 'level', '=', '1');
    } else {
      classes = classes.split('/');
      for(var j = 0; j < classes.length; j++)
        rules.defineRule
          ('classSkills.' + skill, 'levels.' + classes[j], '=', '1');
    }
    if(skill == 'Knowledge (Undead)') {
      // Non-skill synergy: 5 ranks adds 1 to turning level.
      rules.defineNote
        ('skillNotes.knowledge(Undead)Synergy:+1 undead turning Level');
      rules.defineRule
        ('turnUndead.level', 'skillNotes.knowledge(Undead)Synergy', '+', '1');
    }
  }
};
