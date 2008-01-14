/* $Id: CustomExamples.js,v 1.1 2008/01/14 04:31:50 Jim Exp $ */

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
 * This module gives some examples of loading custom rules.  The CustomExamples
 * function loads the sample customizations into the SRD35 rule set; it
 * contains member methods that can be called independently to apply the rules
 * to a different rule set.  Similarly, the constant fields of CustomExamples
 * (DEITIES, GOODIES, etc.) can be modified to change the user's choices.
 */
function CustomExamples() {
  if(window.SRD35 == null) {
    alert('The CustomGoodies module requires use of the SRD35 module');
    return;
  }
  CustomExamples.deityRules(SRD35.rules, CustomExamples.DEITIES);
  CustomExamples.featRules(SRD35.rules, CustomExamples.FEATS);
  CustomExamples.domainRules(SRD35.rules, CustomExamples.DOMAINS);
  CustomExamples.goodiesRules(SRD35.rules, CustomExamples.GOODIES);
  CustomExamples.languageRules(SRD35.rules, CustomExamples.LANGUAGES);
  CustomExamples.magicArmorRules(SRD35.rules, CustomExamples.MAGIC_ARMORS);
  CustomExamples.magicWeaponRules(SRD35.rules, CustomExamples.MAGIC_WEAPONS);
  CustomExamples.skillRules(SRD35.rules, CustomExamples.SKILLS);
  CustomExamples.spellRules(SRD35.rules, CustomExamples.SPELLS);
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
 * TODO
 */
CustomExamples.DOMAINS = [
];

/*
 * TODO
 */
CustomExamples.FEATS = [
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
 * TODO
 */
CustomExamples.LANGUAGES = [
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
 * attack and damage for that weapon by N).
 */
CustomExamples.MAGIC_WEAPONS = [
  'Composite Longbow +2', 'Longsword +2', 'Short Sword +2'
];

/*
 * Each entry in the SKILLS array has the form "Name:Ability:Classes", giving
 * the skill name, the related ability, and the list of classes for which the
 * skill is a class skill.  "all" for the class list means that the skill is a
 * class skill for every class.
 */
CustomExamples.SKILLS = [
  'Herbalism:intelligence/untrained/Druid/Ranger',
  'Knowledge (Plants):intelligence/trained/Druid/Ranger/Wizard',
  'Knowledge (Undead):intelligence/trained/Cleric/Wizard',
  'Linguistics:intelligence/trained/all'
];

/*
 * TODO
 */
CustomExamples.SPELLS = [
];

/* Defines rules for a specified set of custom domains. */
CustomExamples.domainRules = function(rules, domains) {
};

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
      var weaponFocusFeat = 'Weapon Focus (' + weapon + ')';
      SRD35.featRules(rules, [weaponFocusFeat], {});
      rules.defineRule('domainFeatures.' + weaponFocusFeat,
        'domains.War', '?', null,
        'deity', '=',
        'CustomJim.deitiesFavoredWeapons[source] == "' + weapon + '" ? 1 : null'
      );
      rules.defineRule('features.' + weaponFocusFeat,
        'domainFeatures.' + weaponFocusFeat, '=', null
      );
    }
  }
};

/* Defines rules for a specified set of custom feats. */
CustomExamples.featRules = function(rules, feats) {
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

/* Defines rules for a specified set of custom languages. */
CustomExamples.languageRules = function(rules, languages) {
  rules.defineChoice('languages', languages);
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
    if((matchInfo = weapon.match(/(.*?)\s+([+-]\d+)\s*$/)) == null)
      continue;
    var baseWeapon = matchInfo[1];
    var baseWeaponNoSpace = baseWeapon.replace(/\s+/g, '');
    var bonus = matchInfo[2];
    // Note: these weaponAttack/Damage rules will affect all weapons of a
    // particular type that the character owns--If the character has, say, two
    // longswords, both get the bonus.  Ignore this bug for now.
    rules.defineRule(
      'combatNotes.goodies' + baseWeaponNoSpace + 'AttackAdjustment',
      'goodies.' + weapon, '+=', '2'
    );
    rules.defineRule(
      'combatNotes.goodies' + baseWeaponNoSpace + 'DamageAdjustment',
      'goodies.' + weapon, '+=', '2'
    );
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
    var pieces = skills[i].split(':', 2);
    var skill = pieces[0];
    pieces = pieces[1].split('/', 3);
    var ability = pieces[0];
    var classes = pieces[2];
    var trained = pieces[1];
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

/* Defines rules for a specified set of custom spells. */
CustomExamples.spellRules = function(rules, spells) {
  rules.defineChoice('spells', spells);
};
