/*
Copyright 2015, James J. Hayes

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
 * The GOODIES array contains a set of miscellaneous goodies' names.  The
 * goodiesRules method knows how to define rules for "Camouflage Ring" (+10
 * Hide skill), "* Of Strength +N", and "* Of Protection +N" (improves AC by N).
 */
CustomExamples.GOODIES = [
  'Camouflage Ring', 'Gauntlets Of Strength +4', 'Medallion Of Protection +4'
];

/*
 * Each entry in the MAGIC_ARMORS array has the form "Armor +N" (improves AC
 * by N) or "Masterwork Armor" (reduces skill check penalty).
 */
CustomExamples.MAGIC_ARMORS = [
  'Chain Shirt +2', 'Leather Armor +2', 'Masterwork Chainmail'
];

/*
 * Each entry in the MAGIC_WEAPONS array has the form "Weapon +N" (improves
 * attack and damage for that weapon by N) or "Masterwork Weapon" (improves
 * attack by 1).
 */
CustomExamples.MAGIC_WEAPONS = [
  'Composite Longbow +2', 'Longsword +2', 'Masterwork Longsword',
  'Short Sword +2'
];

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

/* Defines rules for a specified set of custom miscellaneous goodies. */
CustomExamples.goodiesRules = function(rules, goodies) {
  var matchInfo;
  for(var i = 0; i < goodies.length; i++) {
    var bonus;
    var goodie = goodies[i];
    if(goodie == 'Camouflage Ring') {
      rules.defineRule('skillNotes.goodiesHideAdjustment',
        'goodies.Camouflage Ring', '+=', 'source * 10'
      );
      rules.defineRule
        ('skillModifier.Hide', 'skillNotes.goodiesHideAdjustment', '+', null);
    } else if((matchInfo = goodie.match(/Of Protection ([+-]\d+)/)) != null) {
      bonus = matchInfo[1];
      rules.defineRule('combatNotes.goodiesArmorClassAdjustment',
        'goodies.' + goodie, '+=', 'source * ' + bonus
      );
    } else if((matchInfo = goodie.match(/Of Strength ([+-]\d+)/)) != null) {
      bonus = matchInfo[1];
      rules.defineRule('abilityNotes.goodiesStrengthAdjustment',
        'goodies.' + goodie, '+=', 'source * ' + bonus
      );
      rules.defineRule
        ('strength', 'abilityNotes.goodiesStrengthAdjustment', '+', null);
    } else
      continue;
    rules.defineChoice('goodies', goodie);
  }
};

/* Defines rules for a specified set of custom magic armor goodies. */
CustomExamples.magicArmorRules = function(rules, armors) {
  var matchInfo;
  rules.defineNote
    ('skillNotes.goodiesSkillCheckAdjustment:Reduce armor skill check penalty by 1');
  rules.defineRule
    ('armorClass', 'combatNotes.goodiesArmorClassAdjustment', '+', null);
  rules.defineRule('skillNotes.armorSkillCheckPenalty',
    'skillNotes.goodiesSkillCheckAdjustment', '+', '-1'
  );
  for(var i = 0; i < armors.length; i++) {
    var armor = armors[i];
    if((matchInfo = armor.match(/([+-]\d+)\s*$/)) != null) {
      rules.defineRule('combatNotes.goodiesArmorClassAdjustment',
        'goodies.' + armor, '+=', matchInfo[1]
      );
    }
    rules.defineRule
      ('skillNotes.goodiesSkillCheckAdjustment', 'goodies.' + armor, '=', '1');
    rules.defineChoice('goodies', armor);
  }
};

/* Defines rules for a specified set of custom magic weapon goodies. */
CustomExamples.magicWeaponRules = function(rules, weapons) {
  var matchInfo;
  for(var i = 0; i < weapons.length; i++) {
    var weapon = weapons[i];
    var attackBonus = 0;
    var damageBonus = 0;
    if((matchInfo = weapon.match(/Masterwork\s+(.*)/)) != null) {
      attackBonus = 1;
    } else if((matchInfo = weapon.match(/(.*?)\s+([+-]\d+)\s*$/)) != null) {
      attackBonus = damageBonus = matchInfo[2];
    } else
      continue;
    var baseWeapon = matchInfo[1];
    var baseWeaponNoSpace = baseWeapon.replace(/\s+/g, '');
    // Note: these weaponAttack/Damage rules will affect all weapons of a
    // particular type that the character owns--If the character has, say, two
    // longswords, both get the bonus.  Ignore this bug for now.
    if(attackBonus != 0) {
      rules.defineRule(
        'combatNotes.goodies' + baseWeaponNoSpace + 'AttackAdjustment',
        'goodies.' + weapon, '+=', attackBonus
      );
    }
    if(damageBonus != 0) {
      rules.defineRule(
        'combatNotes.goodies' + baseWeaponNoSpace + 'DamageAdjustment',
        'goodies.' + weapon, '+=', damageBonus
      );
    }
    rules.defineRule('weaponAttackAdjustment.' + baseWeapon,
      'combatNotes.goodies' + baseWeaponNoSpace + 'AttackAdjustment', '+=', null
    );
    rules.defineRule('weaponDamageAdjustment.' + baseWeapon,
      'combatNotes.goodies' + baseWeaponNoSpace + 'DamageAdjustment', '+=', null
    );
    rules.defineChoice('goodies', weapon);
  }
};

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
