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
 * This module provides a placeholder for a spellPointRules method that defines
 * an alternate approach to learning and casting spells.  To add spell points
 * to a particular rule set, pass the rules to
 * SRD35SpellPoints.spellPointRules in your CustomizeQuilvyn function, e.g.,
 *
 *    SRD35SpellPoints.spellPointRules(SRD35.rules);
 *
 */
function SRD35SpellPoints() {
  // empty
}

/*
 * Defines an alternate approach to learning and casting spells that allocates
 * one spell point for each level of spell that can be cast in a day (i.e., 1
 * point for a first level spell, 2 for a second level spell, etc.)
 */
SRD35SpellPoints.spellPointRules = function(rules) {
  // Define rules to add the spellSlots values to the spellPoints attribute
  var ruleTargets = rules.allTargets();
  for(var j = 0; j < ruleTargets.length; j++) {
    var attr = ruleTargets[j];
    var matchInfo = attr.match(/^spellSlots\.[A-Za-z]+([1-9])/);
    if(matchInfo != null) {
      rules.defineRule('spellPoints', attr, '+=', 'source * ' + matchInfo[1]);
    }
  }
  // Add spell point and remove spells per day from the character sheet.
  rules.defineSheetElement('Spell Points', 'Spell Difficulty Class');
  rules.defineSheetElement('Spell Slots');
};
