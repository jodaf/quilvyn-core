/*
Copyright 2021, James J. Hayes

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
 * This module loads the rules from the Players Handbook v3.5. The PHB35
 * function contains methods that load rules for particular parts of the PHB,
 * currently limited to deityRules for deity definitions. Member methods can be
 * called independently in order to use a subset of the PHB v3.5 rules.
 * Similarly, the constant fields of PHB35 (DEITIES) can be manipulated to
 * modify the choices.
 */
function PHB35() {

  if(window.SRD35 == null) {
    alert('The D&D v3.5 module requires use of the D&D v3.5 (SRD only) plugin');
    return;
  }

  var rules = new QuilvynRules('D&D v3.5', PHB35.VERSION);
  PHB35.rules = rules;

  rules.defineChoice('choices', SRD35.CHOICES);
  rules.choiceEditorElements = SRD35.choiceEditorElements;
  rules.choiceRules = SRD35.choiceRules;
  rules.editorElements = SRD35.initialEditorElements();
  rules.getFormats = SRD35.getFormats;
  rules.makeValid = SRD35.makeValid;
  rules.randomizeOneAttribute = SRD35.randomizeOneAttribute;
  rules.defineChoice('random', SRD35.RANDOMIZABLE_ATTRIBUTES);
  rules.ruleNotes = PHB35.ruleNotes;

  SRD35.createViewers(rules, SRD35.VIEWERS);
  rules.defineChoice('extras',
    'feats', 'featCount', 'sanityNotes', 'selectableFeatureCount',
    'validationNotes'
  );
  rules.defineChoice('preset',
    'race:Race,select-one,races', 'levels:Class Levels,bag,levels',
    'prestige:Prestige Levels,bag,prestiges', 'npc:NPC Levels,bag,npcs');

  SRD35.abilityRules(rules);
  SRD35.aideRules(rules, SRD35.ANIMAL_COMPANIONS, SRD35.FAMILIARS);
  SRD35.combatRules(rules, SRD35.ARMORS, SRD35.SHIELDS, SRD35.WEAPONS);
  SRD35.magicRules(rules, SRD35.SCHOOLS, PHB35.SPELLS);
  SRD35.identityRules(
    rules, SRD35.ALIGNMENTS, SRD35.CLASSES, PHB35.DEITIES, SRD35.PATHS,
    SRD35.RACES, SRD35.PRESTIGE_CLASSES, SRD35.NPC_CLASSES
  );
  SRD35.talentRules
    (rules, SRD35.FEATS, SRD35.FEATURES, SRD35.GOODIES, SRD35.LANGUAGES,
     SRD35.SKILLS);

  Quilvyn.addRuleSet(rules);

}

PHB35.VERSION = '2.2.2.0';

PHB35.DEITIES = {
  'None':'',
  'Corellon Larethian':
    'Alignment=CG ' +
    'Weapon=Longsword ' +
    'Domain=Chaos,Good,Protection,War',
  'Garl Glittergold':
    'Alignment=NG ' +
    'Weapon=Battleaxe ' +
    'Domain=Good,Protection,Trickery',
  'St. Cuthbert':
    'Alignment=LN ' +
    'Weapon="Heavy Mace","Light Mace" ' +
    'Domain=Destruction,Law,Protection,Strength',
  'Wee Jas':
    'Alignment=LN ' +
    'Weapon=Dagger ' +
    'Domain=Death,Law,Magic',
  'Boccob':
    'Alignment=N ' +
    'Weapon=Quarterstaff ' +
    'Domain=Knowledge,Magic,Trickery',
  'Ehlonna':
    'Alignment=NG ' +
    'Weapon=Longbow ' +
    'Domain=Animal,Good,Plant,Sun',
  'Erythnul':
    'Alignment=CE ' +
    'Weapon=Morningstar ' +
    'Domain=Chaos,Evil,Trickery,War',
  'Fharlanghn':
    'Alignment=N ' +
    'Weapon=Quarterstaff ' +
    'Domain=Luck,Protection,Travel',
  'Gruumsh':
    'Alignment=CE ' +
    'Weapon=Spear ' +
    'Domain=Chaos,Evil,Strength,War',
  'Heironeous':
    'Alignment=LG ' +
    'Weapon=Longsword ' +
    'Domain=Good,Law,War',
  'Hextor':
    'Alignment=LE ' +
    'Weapon=Flail ' +
    'Domain=Destruction,Evil,Law,War',
  'Kord':
    'Alignment=CG ' +
    'Weapon=Greatsword ' +
    'Domain=Chaos,Good,Luck,Strength',
  'Moradin':
    'Alignment=LG ' +
    'Weapon=Warhammer ' +
    'Domain=Earth,Good,Law,Protection',
  'Nerull':
    'Alignment=NE ' +
    'Weapon=Scythe ' +
    'Domain=Death,Evil,Trickery',
  'Oba-Hai':
    'Alignment=N ' +
    'Weapon=Quarterstaff ' +
    'Domain=Air,Animal,Earth,Fire,Plant,Water',
  'Olidammara':
    'Alignment=CN ' +
    'Weapon=Rapier ' +
    'Domain=Chaos,Luck,Trickery',
  'Pelor':
    'Alignment=NG ' +
    'Weapon="Heavy Mace","Light Mace" ' +
    'Domain=Good,Healing,Strength,Sun',
  'Vecna':
    'Alignment=NE ' +
    'Weapon=Dagger ' +
    'Domain=Evil,Knowledge,Magic',
  'Yondalla':
    'Alignment=LG ' +
    'Weapon="Short Sword" ' +
    'Domain=Good,Law,Protection'
};
PHB35.SPELL_RENAMES = {
  'Acid Arrow':"Melf's Acid Arrow",
  'Black Tentacles':"Evard's Black Tentacles",
  'Clenched Fist':"Bigby's Clenched Fist",
  'Crushing Hand':"Bigby's Crushing Hand",
  'Floating Disk':"Tenser's Floating Disk",
  'Forceful Hand':"Bigby's Forceful Hand",
  'Freezing Sphere':"Otiluke's Freezing Sphere",
  'Grasping Hand':"Bigby's Grasping Hand",
  'Hideous Laughter':"Tasha's Hideous Laughter",
  'Irresistible Dance':"Otto's Irresistible Dance",
  'Instant Summons':"Drawmij's Instant Summons",
  'Interposing Hand':"Bigby's Interposing Hand",
  "Mage's Disjunction":"Mordenkainen's Disjunction",
  "Mage's Faithful Hound":"Mordenkainen's Faithful Hound",
  "Mage's Lucubration":"Mordenkainen's Lucubration",
  "Mage's Magnificent Mansion":"Mordenkainen's Magnificent Mansion",
  "Mage's Private Sanctum":"Mordenkainen's Private Sanctum",
  "Mage's Sword":"Mordenkainen's Sword",
  'Magic Aura':"Nystul's Magic Aura",
  'Mnemonic Enhancer':"Rary's Mnemonic Enhancer",
  'Phantom Trap':"Leomund's Trap",
  'Resilient Sphere':"Otiluke's Resilient Sphere",
  'Secret Chest':"Leomund's Secret Chest",
  'Secure Shelter':"Leomund's Secure Shelter",
  'Telekinetic Sphere':"Otiluke's Telekinetic Sphere",
  'Telepathic Bond':"Rary's Telepathic Bond",
  'Tiny Hut':"Leomund's Tiny Hut"
};
PHB35.SPELLS = Object.assign({}, SRD35.SPELLS);
for(var s in PHB35.SPELL_RENAMES) {
  PHB35.SPELLS[PHB35.SPELL_RENAMES[s]] = PHB35.SPELLS[s];
  delete PHB35.SPELLS[s];
}

/* Returns an array of plugins upon which this one depends. */
PHB35.getPlugins = function() {
  return ['SRD35'];
};

/* Returns HTML body content for user notes associated with this rule set. */
PHB35.ruleNotes = function() {
  return '' +
    '<h2>D&D v3.5 Quilvyn Plugin Notes</h2>\n' +
    'D&D v3.5 Quilvyn Plugin Version ' + PHB35.VERSION + '\n';
};
