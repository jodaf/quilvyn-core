/*
Copyright 2020, James J. Hayes

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

/*jshint esversion: 6 */
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
  SRD35NPC.magicRules(SRD35.rules, SRD35NPC.SPELLS);
  SRD35NPC.talentRules(SRD35.rules, SRD35NPC.FEATURES);
}

SRD35NPC.CLASSES = {
  'Adept':
    'HitDie=d6 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Weapon Proficiency (Simple)",2:Familiar ' +
    'Skills=' +
      'Concentration,Craft,"Handle Animal",Heal,Knowledge,Profession,' +
      'Spellcraft,Survival ' +
    'CasterLevelDivine=Level ' +
    'SpellAbility=wisdom ' +
    'SpellSlots=' +
      'Adept0:1=3,' +
      'Adept1:1=1;3=2;7=3,' +
      'Adept2:4=0;5=1;7=2;11=3,' +
      'Adept3:8=0;9=1;11=2;15=3,' +
      'Adept4:12=0;13=1;15=2;19=3,' +
      'Adept5:16=0;17=1;19=2',
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
    'Skills=' +
      'Climb,Craft,"Handle Animal",Jump,Listen,Profession,Ride,Spot,Swim,' +
      '"Use Rope"',
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
SRD35NPC.FEATURES = {
  'Commoner Weapon Proficiency':'Section=feature Note="+1 Fighter Feat"'
};
SRD35NPC.SPELLS = {
  "Bear's Endurance":'Level=Adept2',
  "Bull's Strength":'Level=Adept2',
  "Cat's Grace":'Level=Adept2',
  'Aid':'Level=Adept2',
  'Animal Trance':'Level=Adept2',
  'Animate Dead':'Level=Adept3',
  'Baleful Polymorph':'Level=Adept5',
  'Bestow Curse':'Level=Adept3',
  'Bless':'Level=Adept1',
  'Break Enchantment':'Level=Adept5',
  'Burning Hands':'Level=Adept1',
  'Cause Fear':'Level=Adept1',
  'Command':'Level=Adept1',
  'Commune':'Level=Adept5',
  'Comprehend Languages':'Level=Adept1',
  'Contagion':'Level=Adept3',
  'Continual Flame':'Level=Adept3',
  'Create Water':'Level=Adept0',
  'Cure Critical Wounds':'Level=Adept4',
  'Cure Light Wounds':'Level=Adept1',
  'Cure Minor Wounds':'Level=Adept0',
  'Cure Moderate Wounds':'Level=Adept2',
  'Cure Serious Wounds':'Level=Adept3',
  'Darkness':'Level=Adept2',
  'Daylight':'Level=Adept3',
  'Deeper Darkness':'Level=Adept3',
  'Delay Poison':'Level=Adept2',
  'Detect Chaos':'Level=Adept1',
  'Detect Evil':'Level=Adept1',
  'Detect Good':'Level=Adept1',
  'Detect Law':'Level=Adept1',
  'Detect Magic':'Level=Adept0',
  'Endure Elements':'Level=Adept1',
  'Ghost Sound':'Level=Adept0',
  'Guidance':'Level=Adept0',
  'Heal':'Level=Adept5',
  'Invisibility':'Level=Adept2',
  'Light':'Level=Adept0',
  'Lightning Bolt':'Level=Adept3',
  'Major Creation':'Level=Adept5',
  'Mending':'Level=Adept0',
  'Minor Creation':'Level=Adept4',
  'Mirror Image':'Level=Adept2',
  'Neutralize Poison':'Level=Adept3',
  'Obscuring Mist':'Level=Adept1',
  'Polymorph':'Level=Adept4',
  'Protection From Chaos':'Level=Adept1',
  'Protection From Evil':'Level=Adept1',
  'Protection From Good':'Level=Adept1',
  'Protection From Law':'Level=Adept1',
  'Purify Food And Drink':'Level=Adept0',
  'Raise Dead':'Level=Adept5',
  'Read Magic':'Level=Adept0',
  'Remove Curse':'Level=Adept3',
  'Remove Disease':'Level=Adept3',
  'Resist Energy':'Level=Adept2',
  'Restoration':'Level=Adept4',
  'Scorching Ray':'Level=Adept2',
  'See Invisibility':'Level=Adept2',
  'Sleep':'Level=Adept1',
  'Stoneskin':'Level=Adept4',
  'Tongues':'Level=Adept3',
  'Touch Of Fatigue':'Level=Adept0',
  'True Seeing':'Level=Adept5',
  'Wall Of Fire':'Level=Adept4',
  'Wall Of Stone':'Level=Adept5',
  'Web':'Level=Adept2'
};

/* Defines rules related to basic character identity. */
SRD35NPC.identityRules = function(rules, classes) {
  QuilvynUtils.checkAttrTable
    (classes, ['Require', 'HitDie', 'Attack', 'SkillPoints', 'Fortitude', 'Reflex', 'Will', 'Skills', 'Features', 'Selectables', 'Languages', 'CasterLevelArcane', 'CasterLevelDivine', 'SpellAbility', 'SpellSlots']);
  for(var clas in classes) {
    rules.choiceRules(rules, 'Class', clas, classes[clas]);
    SRD35NPC.classRulesExtra(rules, clas);
  }
};

/* Defines rules related to magic use. */
SRD35NPC.magicRules = function(rules, spells) {
  QuilvynUtils.checkAttrTable(spells, ['School', 'Level', 'Description']);
  for(var s in spells) {
    rules.choiceRules(rules, 'Spell', s, SRD35.SPELLS[s] + ' ' + spells[s]);
  }
};

/* Defines rules related to character aptitudes. */
SRD35NPC.talentRules = function(rules, features) {
  QuilvynUtils.checkAttrTable(features, ['Section', 'Note']);
  for(var feature in features) {
    rules.choiceRules(rules, 'Feature', feature, features[feature]);
  }
};

/*
 * Defines in #rules# the rules associated with class #name# that cannot be
 * derived directly from the attributes passed to classRules.
 */
SRD35NPC.classRulesExtra = function(rules, name) {
  if(name == 'Adept') {
    rules.defineRule('familiarMasterLevel', 'levels.Adept', '+=', null);
  }
};
