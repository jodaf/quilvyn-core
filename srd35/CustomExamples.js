/* $Id: CustomExamples.js,v 1.12 2014/04/06 18:02:11 jhayes Exp $ */

/*
Copyright 2011, James J. Hayes

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
 * This module provides a placeholder for some examples of custom rules.  The
 * CustomExamples function contains member methods that can be called
 * independently to apply that function's rules to a particular rule set.
 * Similarly, the constant fields of CustomExamples (DEITIES, GOODIES, etc.)
 * can be modified to change the user's choices.  For example, adding this line
 * to your CustomizeScribe function will add rules for the items found in
 * CustomExamples.MAGIC_WEAPONS to the SRD35 rul set:
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
 * Each entry in the DEITY array as the form "Name (Alignment):Favored Weapon:
 * Domains".  The deityRules method uses this to define rules for clerics of
 * the deity.
 */
CustomExamples.DEITIES = [
  'Draum (CG Elf Dreams):Quarterstaff:Air/Chaos/Good/Luck',
  'Glennor (NG Healing):Quarterstaff:Air/Animal/Healing',
  'Theldon (LN Law):Longsword:Earth/Law/Protection/Strength',
  'Volhalnor (LN Dwarf Earth):Warhammer:Earth/Law/Protection'
];

/*
 * The GOODIES array contains a set of miscellaneous goodies' names.  The
 * goodiesRules method knows how to define rules for "Camouflage Ring" (+10
 * Hide skill) and "* Of Protection +N" (improves AC by N).
 */
CustomExamples.GOODIES = [
  'Camouflage Ring', 'Medallion Of Protection +4'
];

/*
 * Each entry in the MAGIC_ARMORS array has the form "Armor +N" (improves AC
 * by N).
 */
CustomExamples.MAGIC_ARMORS = [
  'Chain Shirt +2', 'Leather Armor +2'
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

/* Defines rules for a clerics of a specified set of custom deities. */
CustomExamples.deityRules = function(rules, deities) {
  CustomExamples.deitiesFavoredWeapons = {};
  for(var i = 0; i < deities.length; i++) {
    var pieces = deities[i].split(':');
    if(pieces.length < 3)
      continue;
    var deity = pieces[0];
    var domains = pieces[2];
    var weapon = pieces[1];
    rules.defineChoice('deities', deity + ':' + domains);
    CustomExamples.deitiesFavoredWeapons[deity] = weapon;
    if(domains.indexOf('War') >= 0) {
      var focusFeature = 'Weapon Focus (' + weapon + ')';
      var proficiencyFeature = 'Weapon Proficiency (' + weapon + ')';
      SRD35.featRules
        (rules, [focusFeature + ':', proficiencyFeature + ':'], {});
      rules.defineRule('clericFeatures.' + focusFeature,
        'domains.War', '?', null,
        'deity', '=',
        'CustomExamples.deitiesFavoredWeapons[source] == "' + weapon + 
        '" ? 1 : null'
      );
      rules.defineRule('clericFeatures.' + proficiencyFeature,
        'domains.War', '?', null,
        'deity', '=',
        'CustomExamples.deitiesFavoredWeapons[source] == "' + weapon + 
        '" ? 1 : null'
      );
      rules.defineRule('features.' + focusFeature,
        'clericFeatures.' + focusFeature, '=', null
      );
      rules.defineRule('features.' + proficiencyFeature,
        'clericFeatures.' + proficiencyFeature, '=', null
      );
    }
  }
};

/* Defines rules for a specified set of custom miscellaneous goodies. */
CustomExamples.goodiesRules = function(rules, goodies) {
  var matchInfo;
  for(var i = 0; i < goodies.length; i++) {
    var goodie = goodies[i];
    if(goodie == 'Camouflage Ring') {
      rules.defineRule('skillNotes.goodiesHideAdjustment',
        'goodies.Camouflage Ring', '+=', 'source * 10'
      );
      rules.defineRule
        ('skillModifier.Hide', 'skillNotes.goodiesHideAdjustment', '+', null);
    } else if((matchInfo = goodie.match(/Of Protection ([+-]\d+)/)) != null) {
      var bonus = matchInfo[1];
      rules.defineRule('combatNotes.goodiesArmorClassAdjustment',
        'goodies.' + goodie, '+=', 'source * ' + bonus
      );
    } else
      continue;
    rules.defineChoice('goodies', goodie);
  }
};

/* Defines rules for a specified set of custom magic armor goodies. */
CustomExamples.magicArmorRules = function(rules, armors) {
  var matchInfo;
  for(var i = 0; i < armors.length; i++) {
    var armor = armors[i];
    if((matchInfo = armor.match(/([+-]\d+)\s*$/)) == null)
      continue;
    rules.defineRule
      ('armorClass', 'combatNotes.goodiesArmorClassAdjustment', '+', null);
    rules.defineRule('combatNotes.goodiesArmorClassAdjustment',
      'goodies.' + armor, '+=', matchInfo[1]
    );
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
    // Define the skill, with associated ability and trained/untrained setting.
    rules.defineChoice
      ('skills', skill + ':' + ability.substring(0, 3) + '/' + trained);
    // Define the rules to compute the skill modifier.
    rules.defineRule('skillModifier.' + skill,
      'skills.' + skill, '=', 'source / 2',
      'classSkills.' + skill, '*', '2',
      ability + 'Modifier', '+', null
    );
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
