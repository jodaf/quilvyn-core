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
 * This module loads NPC class rules from the System Reference Documents v3.5.
 * Member methods can be called independently in order to use a subset of the
 * rules.  Similarly, the constant fields of SRD35NPC (CLASSES, COMPANIONS)
 * can be thined to limit the user's choices.
 */
function SRD35NPC() {
  if(window.SRD35 == null) {
    alert('The SRD35NPC module requires use of the SRD35 module');
    return;
  }
  SRD35NPC.classRules(SRD35.rules, SRD35NPC.CLASSES);
}

SRD35NPC.CLASSES = ['Adept', 'Aristocrat', 'Commoner', 'Expert', 'Warrior'];

/* Defines the rules related to SRD NPC Classes. */
SRD35NPC.classRules = function(rules, classes) {

  var schools = rules.getChoices('schools');

  for(var i = 0; i < classes.length; i++) {

    var baseAttack, features, hitDie, notes, profArmor, profShield, profWeapon,
        saveFortitude, saveReflex, saveWill, skillPoints, skills, spellAbility,
        spells, spellsKnown, spellsPerDay;
    var klass = classes[i];

    if(klass == 'Adept') {

      baseAttack = SRD35.ATTACK_BONUS_POOR;
      features = ['2:Familiar'];
      hitDie = 6;
      notes = [
        'featureNotes.familiarFeature:Special bond/abilities'
      ];
      profArmor = SRD35.PROFICIENCY_NONE;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon =  SRD35.PROFICIENCY_LIGHT;
      saveFortitude = SRD35.SAVE_BONUS_POOR;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_GOOD;
      skillPoints = 2;
      skills = [
        'Concentration', 'Craft', 'Handle Animal', 'Heal', 'Knowledge',
        'Profession', 'Spellcraft', 'Survival'
      ];
      spellAbility = 'wisdom';
      spells = [
        'AD0:Create Water:Cure Minor Wounds:Detect Magic:Ghost Sound:' +
        'Guidance:Light:Mending:Purify Food And Drink:Read Magic:' +
        'Touch Of Fatigue',
        'AD1:Bless:Burning Hands:Cause Fear:Command:Comprehend Languages:' +
        'Cure Light Wounds:Detect Chaos:Detect Evil:Detect Good:Detect Law:' +
        'Endure Elements:Obscuring Mist:Protection From Chaos:' +
        'Protection From Evil:Protection From Good:Protection From Law:Sleep',
        'AD2:Aid:Animal Trance:Bear\'s Endurance:Bull\'s Strength:' +
        'Cat\'s Grace:Cure Moderate Wounds:Darkness:Delay Poison:' +
        'Invisibility:Mirror Image:Resist Energy:Scorching Ray:' +
        'See Invisibility:Web',
        'AD3:Animate Dead:Bestow Curse:Contagion:Continual Flame:' +
        'Cure Serious Wounds:Daylight:Deeper Darkness:Lightning Bolt:' +
        'Neutralize Poison:Remove Curse:Remove Disease:Tongues',
        'AD4:Cure Critical Wounds:Minor Creation:Polymorph:Restoration:' +
        'Stoneskin:Wall Of Fire',
        'AD5:Baleful Polymorph:Break Enchantment:Commune:Heal:Major Creation:' +
        'Raise Dead:True Seeing:Wall Of Stone'
      ];
      spellsKnown = [
        'AD0:1:"all"', 'AD1:1:"all"', 'AD2:4:"all"', 'AD3:8:"all"',
        'AD4:12:"all"', 'AD5:16:"all"'
      ];
      spellsPerDay = [
        'AD0:1:3',
        'AD1:1:1/3:2/7:3',
        'AD2:4:0/5:1/7:2/11:3',
        'AD3:8:0/9:1/11:2/15:3',
        'AD4:12:0/13:1/15:2/19:3',
        'AD5:16:0/17:1/19:2'
      ];
      rules.defineRule('casterLevels.AD',
        'levels.Adept', '+=', null,
        'magicNotes.casterLevelBonusFeature', '+', null
      );
      rules.defineRule('casterLevelDivine', 'casterLevels.AD', '+=', null);
      rules.defineRule('familiarMasterLevel', 'levels.Adept', '+=', null);

    } else if(klass == 'Aristocrat') {

      baseAttack = SRD35.ATTACK_BONUS_AVERAGE;
      features = null;
      hitDie = 8;
      notes = null;
      profArmor = SRD35.PROFICIENCY_HEAVY;
      profShield = SRD35.PROFICIENCY_TOWER;
      profWeapon =  SRD35.PROFICIENCY_MEDIUM;
      saveFortitude = SRD35.SAVE_BONUS_POOR;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_GOOD;
      skillPoints = 4;
      skills = [
        'Appraise', 'Bluff', 'Diplomacy', 'Disguise', 'Forgery',
        'Gather Information', 'Handle Animal', 'Intimidate', 'Knowledge',
        'Listen', 'Perform', 'Ride', 'Sense Motive', 'Speak Language', 'Spot',
        'Swim', 'Survival'
      ];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;

    } else if(klass == 'Commoner') {

      baseAttack = SRD35.ATTACK_BONUS_POOR;
      features = null;
      hitDie = 4;
      notes = null;
      profArmor = SRD35.PROFICIENCY_NONE;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon =  SRD35.PROFICIENCY_NONE;
      saveFortitude = SRD35.SAVE_BONUS_POOR;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_POOR;
      skillPoints = 2;
      skills = [
        'Climb', 'Craft', 'Handle Animal', 'Jump', 'Listen', 'Profession',
        'Ride', 'Spot', 'Swim', 'Use Rope'
      ];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;
      // Weapon Proficiency feat
      rules.defineRule('featCount.Commoner', 'levels.Commoner', '=', '1');

    } else if(klass == 'Expert') {

      baseAttack = SRD35.ATTACK_BONUS_AVERAGE;
      features = null;
      hitDie = 6;
      notes = null;
      profArmor = SRD35.PROFICIENCY_LIGHT;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon =  SRD35.PROFICIENCY_LIGHT;
      saveFortitude = SRD35.SAVE_BONUS_POOR;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_GOOD;
      skillPoints = 6;
      skills = []; // NOTE: 10 of player's choice
      spells = null;
      spellAbility = null;
      spellsKnown = null;
      spellsPerDay = null;

    } else if(klass == 'Warrior') {

      baseAttack = SRD35.ATTACK_BONUS_GOOD;
      features = null;
      hitDie = 8;
      notes = null;
      profArmor = SRD35.PROFICIENCY_HEAVY;
      profShield = SRD35.PROFICIENCY_TOWER;
      profWeapon =  SRD35.PROFICIENCY_MEDIUM;
      saveFortitude = SRD35.SAVE_BONUS_GOOD;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_POOR;
      skillPoints = 2;
      skills = ['Climb', 'Handle Animal', 'Intimidate', 'Jump', 'Ride', 'Swim'];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;

    } else
      continue;

    SRD35.defineClass
      (rules, klass, hitDie, skillPoints, baseAttack, saveFortitude, saveReflex,
       saveWill, profArmor, profShield, profWeapon, skills, features,
       spellsKnown, spellsPerDay, spellAbility);
    if(notes != null)
      rules.defineNote(notes);
    if(spells != null) {
      for(var j = 0; j < spells.length; j++) {
        var pieces = spells[j].split(':');
        for(var k = 1; k < pieces.length; k++) {
          var spell = pieces[k];
          var school = SRD35.spellsSchools[spell];
          if(school == null) {
            continue;
          }
          spell += '(' + pieces[0] + ' ' +
                    (school == 'Universal' ? 'Univ' : schools[school]) + ')';
          rules.defineChoice('spells', spell);
          SRD35.spellRules(rules, [spell], null);
        }
      }
    }

  }

};
