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
  SRD35NPC.identityRules(SRD35.rules, SRD35NPC.CLASSES);
}

SRD35NPC.CLASSES = {
  'Adept':
    'HitDie=d6 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Weapon Proficiency (Simple)",2:Familiar ' +
    'Skills=' +
      'Concentration,Craft,"Handle Animal",Heal,Knowledge,Profession,' +
      'Spellcraft,Survival ' +
    'SpellAbility=wisdom ' +
    'SpellsPerDay=' +
      'AD0:1=3,' +
      'AD1:1=1;3=2;7=3,' +
      'AD2:4=0;5=1;7=2;11=3,' +
      'AD3:8=0;9=1;11=2;15=3,' +
      'AD4:12=0;13=1;15=2;19=3,' +
      'AD5:16=0;17=1;19=2',
  'Aristocrat':
    'HitDie=d8 Attack=3/4 SkillPoints=4 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Armor Proficiency (Heavy)","1:Shield Proficiency (Tower)",' +
      '"1:Weapon Proficiency (Martial)" ' +
    'Skills=' +
      'Appraise,Bluff,Diplomacy,Disguise,Forgery,"Gather Information",' +
      '"Handle Animal",Intimidate,Knowledge,Listen,Perform,Ride,' +
      '"Sense Motive","Speak Language",Spot,Swim,Survival',
  'Commoner':
    'HitDie=d4 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/3 ' +
    'Features=' +
      '"1:Commoner Weapon Proficiency" ' +
    'Skills' +
      'Climb,Craft,"Handle Animal",Jump,Listen,Profession,Ride,Spot,Swim,' +
      'Use Rope',
  'Expert':
    'HitDie=d6 Attack=3/4 SkillPoints=6 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Armor Proficiency (Light)","1:Weapon Proficiency (Light)"',
    // 10 skills of players choice
  'Warrior':
    'HitDie=d8 Attack=1 SkillPoints=2 Fortitude=1/2 Reflex=1/3 Will=1/3 ' +
    'Features=' +
      '"1:Armor Proficiency (Heavy)","1:Shield Proficiency (Tower)",' +
      '"1:Weapon Proficiency (Martial)" ' +
    'Skills=' +
      'Climb,"Handle Animal",Intimidate,Jump,Ride,Swim'
};

/* Defines the rules related to SRDv3.5 NPC Classes. */
SRD35NPC.identityRules = function(rules, classes) {
  for(var klass in classes) {
    console.log(klass);
    var attrs = classes[klass];
    rules.addChoice('levels', klass, classes[klass]);
    SRD35.classRules(rules, klass,
      QuilvynRules.getAttrValueArray(attrs, 'Require'),
      QuilvynRules.getAttrValueArray(attrs, 'Imply'),
      QuilvynRules.getAttrValue(attrs, 'HitDie'),
      QuilvynRules.getAttrValue(attrs, 'Attack'),
      QuilvynRules.getAttrValue(attrs, 'SkillPoints'),
      QuilvynRules.getAttrValue(attrs, 'Fortitude'),
      QuilvynRules.getAttrValue(attrs, 'Reflex'),
      QuilvynRules.getAttrValue(attrs, 'Will'),
      QuilvynRules.getAttrValueArray(attrs, 'Skills'),
      QuilvynRules.getAttrValueArray(attrs, 'Features'),
      QuilvynRules.getAttrValueArray(attrs, 'Selectables'),
      QuilvynRules.getAttrValue(attrs, 'SpellAbility'),
      QuilvynRules.getAttrValueArray(attrs, 'SpellsPerDay')
    );
    SRD35NPC.classRules(rules, klass);
  }
};

/* Defines the rules related to SRD NPC Classes. */
SRD35NPC.classRules = function(rules, name) {

  var spells = null;

  if(name == 'Adept') {

    var spells = [
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
    rules.defineRule('casterLevels.AD',
      'levels.Adept', '=', null,
      'magicNotes.casterLevelBonusFeature', '+', null
    );
    rules.defineRule('casterLevelDivine', 'casterLevels.AD', '+=', null);
    rules.defineRule('familiarMasterLevel', 'levels.Adept', '+=', null);

  } else if(name == 'Commoner') {

    SRD35.featureRules
      (rules, 'Commoner Weapon Proficiency', 'feature:+1 Feat');

  }

  if(spells != null) {
    for(var j = 0; j < spells.length; j++) {
      var pieces = spells[j].split(':');
      var casterGroupAndLevel = pieces[0];
      for(var k = 1; k < pieces.length; k++) {
        var spell = pieces[k];
        if(SRD35.SPELLS[spell] == null) {
          console.log('Unknown spell name "' + spell + '"');
          continue;
        }
        var attrs = SRD35.SPELLS[spell];
        var school = QuilvynRules.getAttrValue(attrs, 'School');
        if(school == null) {
          console.log('Unknown school for spell "' + spell + '"');
          continue;
        }
        spell += '(' + casterGroupAndLevel + ' ' + school.substring(0, 4) + ')';
        SRD35.spellRules(rules, spell,
          school,
          casterGroupAndLevel.substring(0, casterGroupAndLevel.length - 1),
          casterGroupAndLevel.substring(casterGroupAndLevel.length - 1),
          QuilvynRules.getAttrValue(attrs, 'Description')
        );
      }
    }
  }

};
