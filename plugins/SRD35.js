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
/* jshint forin: false */
/* globals ObjectViewer, Quilvyn, QuilvynRules, QuilvynUtils */
"use strict";

/*
 * This module loads the rules from the System Reference Documents v3.5. The
 * SRD35 function contains methods that load rules for particular parts of the
 * SRD; raceRules for character races, shieldRules for shields, etc. These
 * member methods can be called independently in order to use a subset of the
 * SRD v3.5 rules.  Similarly, the constant fields of SRD35 (ALIGNMENTS, FEATS,
 * etc.) can be manipulated to modify the choices.
 */
function SRD35() {

  var rules = new QuilvynRules('SRD v3.5', SRD35.VERSION);
  SRD35.rules = rules;

  rules.defineChoice('choices', SRD35.CHOICES);
  rules.choiceEditorElements = SRD35.choiceEditorElements;
  rules.choiceRules = SRD35.choiceRules;
  rules.editorElements = SRD35.initialEditorElements();
  rules.getFormats = SRD35.getFormats;
  rules.makeValid = SRD35.makeValid;
  rules.randomizeOneAttribute = SRD35.randomizeOneAttribute;
  rules.defineChoice('random', SRD35.RANDOMIZABLE_ATTRIBUTES);
  rules.ruleNotes = SRD35.ruleNotes;

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
  SRD35.magicRules(rules, SRD35.SCHOOLS, SRD35.SPELLS);
  SRD35.identityRules(
    rules, SRD35.ALIGNMENTS, SRD35.CLASSES, SRD35.DEITIES, SRD35.PATHS,
    SRD35.RACES, SRD35.PRESTIGE_CLASSES, SRD35.NPC_CLASSES
  );
  SRD35.talentRules
    (rules, SRD35.FEATS, SRD35.FEATURES, SRD35.GOODIES, SRD35.LANGUAGES,
     SRD35.SKILLS);

  Quilvyn.addRuleSet(rules);

}

SRD35.VERSION = '2.3.1.1';

/* List of items handled by choiceRules method. */
SRD35.CHOICES = [
  'Alignment', 'Animal Companion', 'Armor', 'Class', 'Deity', 'Familiar',
  'Feat', 'Feature', 'Goody', 'Language', 'Npc', 'Path', 'Prestige', 'Race',
  'School', 'Shield', 'Skill', 'Spell', 'Weapon'
];
/*
 * List of items handled by randomizeOneAttribute method. The order handles
 * dependencies among attributes when generating random characters.
 */
SRD35.RANDOMIZABLE_ATTRIBUTES = [
  'abilities',
  'charisma', 'constitution', 'dexterity', 'intelligence', 'strength', 'wisdom',
  'name', 'race', 'gender', 'alignment', 'deity', 'levels',
  'selectableFeatures', 'feats', 'skills', 'languages', 'hitPoints', 'armor',
  'shield', 'weapons', 'spells', 'companion'
];
SRD35.VIEWERS = ['Collected Notes', 'Compact', 'Standard'];

SRD35.ABILITIES = {
  'Charisma':'',
  'Constitution':'',
  'Dexterity':'',
  'Intelligence':'',
  'Strength':'',
  'Wisdom':''
};
SRD35.ALIGNMENTS = {
  'Chaotic Evil':'',
  'Chaotic Good':'',
  'Chaotic Neutral':'',
  'Neutral Evil':'',
  'Neutral Good':'',
  'Neutral':'',
  'Lawful Evil':'',
  'Lawful Good':'',
  'Lawful Neutral':''
};
SRD35.ANIMAL_COMPANIONS = {

  // Attack, Dam, AC include all modifiers
  'Badger':
    'Str=8 Dex=17 Con=15 Int=2 Wis=12 Cha=6 HD=1 AC=15 Attack=4 ' +
    'Dam=2@1d2-1,1d3-1 Size=S',
  'Camel':
    'Str=18 Dex=16 Con=14 Int=2 Wis=11 Cha=4 HD=3 AC=13 Attack=0 Dam=1d4+2 ' +
    'Size=L',
  'Dire Rat':
    'Str=10 Dex=17 Con=12 Int=1 Wis=12 Cha=4 HD=1 AC=15 Attack=4 Dam=1d4 ' +
    'Size=S',
  'Dog':
    'Str=13 Dex=17 Con=15 Int=2 Wis=12 Cha=6 HD=1 AC=15 Attack=2 Dam=1d4+1 ' +
    'Size=S',
  'Eagle':
    'Str=10 Dex=15 Con=12 Int=2 Wis=14 Cha=6 HD=1 AC=14 Attack=3 ' +
    'Dam=2@1d4,1d4 Size=S',
  'Hawk':
    'Str=6 Dex=17 Con=10 Int=2 Wis=14 Cha=6 HD=1 AC=17 Attack=5 ' +
    'Dam=1d4-2 Size=T',
  'Heavy Horse':
    'Str=16 Dex=13 Con=15 Int=2 Wis=12 Cha=6 HD=3 AC=13 Attack=-1 Dam=1d6+1 ' +
    'Size=L',
  'Light Horse':
    'Str=14 Dex=13 Con=15 Int=2 Wis=12 Cha=6 HD=3 AC=13 Attack=-2 Dam=1d4+1 ' +
    'Size=L',
  'Medium Shark':
    'Str=13 Dex=15 Con=13 Int=1 Wis=12 Cha=2 HD=3 AC=15 Attack=4 Dam=1d6+1 ' +
    'Size=M',
  'Medium Viper':
    'Str=8 Dex=17 Con=11 Int=1 Wis=12 Cha=2 HD=2 AC=16 Attack=4 Dam=1d4-1 ' +
    'Size=M',
  'Owl':
    'Str=4 Dex=17 Con=10 Int=2 Wis=14 Cha=4 HD=1 AC=17 Attack=5 Dam=1d4-3 ' +
    'Size=T',
  'Pony':
    'Str=13 Dex=13 Con=12 Int=2 Wis=11 Cha=4 HD=2 AC=13 Attack=-3 Dam=1d3 ' +
    'Size=M',
  'Porpoise':
    'Str=11 Dex=17 Con=13 Int=2 Wis=12 Cha=6 HD=2 AC=15 Attack=4 Dam=2d4 ' +
    'Size=M',
  'Riding Dog':
    'Str=15 Dex=15 Con=15 Int=2 Wis=12 Cha=6 HD=2 AC=16 Attack=3 Dam=1d6+3 ' +
    'Size=M',
  'Small Viper':
    'Str=6 Dex=17 Con=11 Int=1 Wis=12 Cha=2 HD=1 AC=17 Attack=4 Dam=1d2-2 ' +
    'Size=S',
  'Squid':
    'Str=14 Dex=17 Con=11 Int=1 Wis=12 Cha=2 HD=3 AC=16 Attack=4 Dam=0,1d6+1 ' +
    'Size=M',
  'Wolf':
    'Str=13 Dex=15 Con=15 Int=2 Wis=12 Cha=6 HD=2 AC=14 Attack=3 Dam=1d6+1 ' +
    'Size=M',

  'Ape':
    'Str=21 Dex=15 Con=14 Int=2 Wis=12 Cha=7 HD=4 AC=14 Attack=7 ' +
    'Dam=1d6+5,1d6+2 Size=L Level=4',
  'Bison':
    'Str=22 Dex=10 Con=16 Int=2 Wis=11 Cha=4 HD=5 AC=13 Attack=8 Dam=1d8+9 ' +
    'Size=L Level=4',
  'Black Bear':
    'Str=19 Dex=13 Con=15 Int=2 Wis=12 Cha=6 HD=3 AC=13 Attack=6 ' +
    'Dam=2@1d4+4,1d6+2 Size=M Level=4',
  'Boar':
    'Str=15 Dex=10 Con=17 Int=2 Wis=13 Cha=4 HD=3 AC=16 Attack=4 Dam=1d8+3 ' +
    'Size=M Level=4',
  'Cheetah':
    'Str=16 Dex=19 Con=15 Int=2 Wis=12 Cha=6 HD=3 AC=15 Attack=6 ' +
    'Dam=2@1d2+1,1d6+3 Size=M Level=4',
  'Constrictor':
    'Str=17 Dex=17 Con=13 Int=1 Wis=12 Cha=2 HD=3 AC=15 Attack=5 Dam=1d3+4 ' +
    'Size=M Level=4',
  'Crocodile':
    'Str=19 Dex=12 Con=17 Int=1 Wis=12 Cha=2 HD=3 AC=15 Attack=6 ' +
    'Dam=1d8+6,1d12+6 Size=M Level=4',
  'Dire Badger':
    'Str=14 Dex=17 Con=19 Int=2 Wis=12 Cha=10 HD=3 AC=16 Attack=4 ' +
    'Dam=2@1d4+2,1d6+1 Size=M Level=4',
  'Dire Bat':
    'Str=17 Dex=22 Con=17 Int=2 Wis=14 Cha=6 HD=4 AC=20 Attack=5 Dam=1d8+4 ' +
    'Size=M Level=4',
  'Dire Weasel':
    'Str=14 Dex=19 Con=10 Int=2 Wis=12 Cha=11 HD=3 AC=16 Attack=6 Dam=1d6+3 ' +
    'Size=M Level=4',
  'Large Shark':
    'Str=17 Dex=15 Con=13 Int=1 Wis=12 Cha=2 HD=7 AC=15 Attack=7 Dam=1d8+4 ' +
    'Size=L Level=4',
  'Large Viper':
    'Str=10 Dex=17 Con=11 Int=1 Wis=12 Cha=2 HD=3 AC=15 Attack=4 Dam=1d4 ' +
    'Size=L Level=4',
  'Leopard':
    'Str=16 Dex=19 Con=15 Int=2 Wis=12 Cha=6 HD=3 AC=15 Attack=6 ' +
    'Size=M Dam=2@1d3+1,1d6+3 Level=4',
  'Monitor Lizard':
    'Str=17 Dex=15 Con=17 Int=1 Wis=12 Cha=2 HD=3 AC=15 Attack=5 Dam=1d8+4 ' +
    'Size=M Level=4',
  'Wolverine':
    'Str=14 Dex=15 Con=19 Int=2 Wis=12 Cha=10 HD=3 AC=14 Attack=4 ' +
    'Dam=2@1d4+2,1d6+1 Size=M Level=4',

  'Brown Bear':
    'Str=27 Dex=13 Con=19 Int=2 Wis=12 Cha=6 HD=6 AC=15 Attack=11 ' +
    'Dam=2@1d8+8,2d6+4 Size=L Level=7',
  'Deinonychus':
    'Str=19 Dex=15 Con=19 Int=2 Wis=12 Cha=10 HD=4 AC=17 Attack=7 ' +
    'Dam=1d8+4,2@1d3+2,2d4+2 Size=M Level=7',
  'Dire Ape':
    'Str=22 Dex=15 Con=14 Int=2 Wis=12 Cha=7 HD=5 AC=15 Attack=8 ' +
    'Dam=2@1d6+6,1d8+3 Size=L Level=7',
  'Dire Boar':
    'Str=27 Dex=10 Con=17 Int=2 Wis=13 Cha=8 HD=7 AC=15 Attack=12 Dam=1d8+12 ' +
    'Size=L Level=7',
  'Dire Wolf':
    'Str=25 Dex=15 Con=17 Int=2 Wis=12 Cha=10 HD=6 AC=14 Attack=11 ' +
    'Size=L Dam=1d8+10 Level=7',
  'Dire Wolverine':
    'Str=22 Dex=17 Con=19 Int=2 Wis=12 Cha=10 HD=5 AC=16 Attack=8 ' +
    'Dam=2@1d6+6,1d8+3 Size=L Level=7',
  'Elasmosaurus':
    'Str=26 Dex=14 Con=22 Int=2 Wis=13 Cha=9 HD=10 AC=13 Attack=13 ' +
    'Dam=2d8+12 Size=H Level=7',
  'Giant Crocodile':
    'Str=27 Dex=12 Con=19 Int=1 Wis=12 Cha=2 HD=7 AC=16 Attack=11 ' +
    'Dam=2d8+12,1d12+12 Size=H Level=7',
  'Huge Viper':
    'Str=16 Dex=15 Con=13 Int=1 Wis=12 Cha=2 HD=6 AC=15 Attack=6 Dam=1d6+4 ' +
    'Size=H Level=7',
  'Lion':
    'Str=21 Dex=17 Con=15 Int=2 Wis=12 Cha=6 HD=5 AC=15 Attack=7 ' +
    'Dam=2@1d4+5,1d8+2 Size=L Level=7',
  'Rhinoceros':
    'Str=26 Dex=10 Con=21 Int=2 Wis=13 Cha=2 HD=8 AC=16 Attack=13 Dam=2d6+12 ' +
    'Size=L Level=7',
  'Tiger':
    'Str=23 Dex=15 Con=17 Int=2 Wis=12 Cha=6 HD=6 AC=14 Attack=9 ' +
    'Dam=2@1d8+6,2d6+3 Size=L Level=7',

  'Dire Lion':
    'Str=25 Dex=15 Con=17 Int=2 Wis=12 Cha=10 HD=8 AC=13 Attack=15 ' +
    'Dam=2@1d6+7,1d8+3 Size=L Level=10',
  'Giant Constrictor':
    'Str=25 Dex=17 Con=13 Int=1 Wis=12 Cha=2 HD=11 AC=12 Attack=15 ' +
    'Dam=1d8+10 Size=H Level=10',
  'Huge Shark':
    'Str=21 Dex=15 Con=15 Int=1 Wis=12 Cha=2 HD=10 AC=15 Attack=10 Dam=2d6+7 ' +
    'Size=H Level=10',
  'Megaraptor':
    'Str=21 Dex=15 Con=21 Int=2 Wis=15 Cha=10 HD=8 AC=17 Attack=10 ' +
    'Dam=2d6+5,2@1d4+2,1d8+2 Size=L Level=10',
  'Orca':
    'Str=27 Dex=15 Con=21 Int=2 Wis=14 Cha=6 HD=9 AC=16 Attack=12 Dam=2d6+12 ' +
    'Size=H Level=10',
  'Polar Bear':
    'Str=27 Dex=13 Con=19 Int=2 Wis=12 Cha=6 HD=8 AC=15 Attack=13 ' +
    'Dam=2@1d8+8,2d6+4 Size=L Level=10',

  'Dire Bear':
    'Str=31 Dex=13 Con=19 Int=2 Wis=12 Cha=10 HD=12 AC=17 Attack=19 ' +
    'Size=L Dam=2@2d4+10,2d8+5 Level=13',
  'Elephant':
    'Str=30 Dex=10 Con=21 Int=2 Wis=13 Cha=7 HD=11 AC=15 Attack=16 ' +
    'Dam=2d6+10,2@2d6+5 Size=H Level=13',
  'Giant Octopus':
    'Str=20 Dex=15 Con=13 Int=2 Wis=12 Cha=3 HD=8 AC=18 Attack=10 ' +
    'Dam=8@1d4+5,1d8+2 Size=L Level=13',

  'Dire Shark':
    'Str=23 Dex=15 Con=17 Int=1 Wis=12 Cha=10 HD=18 AC=17 Attack=18 ' +
    'Dam=2d8+9 Size=H Level=16',
  'Dire Tiger':
    'Str=27 Dex=15 Con=17 Int=2 Wis=12 Cha=10 HD=16 AC=17 Attack=20 ' +
    'Dam=2@2d4+8,2d6+4 Size=L Level=16',
  'Giant Squid':
    'Str=26 Dex=17 Con=13 Int=1 Wis=12 Cha=2 HD=12 AC=17 Attack=15 ' +
    'Dam=10@1d6+8,2d8+4 Size=H Level=16',
  'Triceratops':
    'Str=30 Dex=9 Con=25 Int=1 Wis=12 Cha=7 HD=16 AC=18 Attack=20 Dam=2d8+15 ' +
    'Size=H Level=16',
  'Tyrannosaurus':
    'Str=28 Dex=12 Con=21 Int=2 Wis=15 Cha=10 HD=18 AC=14 Attack=20 ' +
    'Dam=3d6+13 Size=H Level=16'

};
SRD35.ARMORS = {
  'None':'AC=0 Weight=0 Dex=10 Skill=0 Spell=0',
  'Padded':'AC=1 Weight=1 Dex=8 Skill=0 Spell=5',
  'Leather':'AC=2 Weight=1 Dex=6 Skill=0 Spell=10',
  'Studded Leather':'AC=3 Weight=1 Dex=5 Skill=1 Spell=15',
  'Chain Shirt':'AC=4 Weight=1 Dex=4 Skill=2 Spell=20',
  'Hide':'AC=3 Weight=2 Dex=4 Skill=3 Spell=20',
  'Scale Mail':'AC=4 Weight=2 Dex=3 Skill=4 Spell=25',
  'Chainmail':'AC=5 Weight=2 Dex=2 Skill=5 Spell=30',
  'Breastplate':'AC=5 Weight=2 Dex=3 Skill=4 Spell=25',
  'Splint Mail':'AC=6 Weight=3 Dex=0 Skill=7 Spell=40',
  'Banded Mail':'AC=6 Weight=3 Dex=1 Skill=6 Spell=35',
  'Half Plate':'AC=7 Weight=3 Dex=0 Skill=7 Spell=40',
  'Full Plate':'AC=8 Weight=3 Dex=1 Skill=6 Spell=35'
};
SRD35.FAMILIARS = {

  // Attack, Dam, AC include all modifiers
  'Bat':
    'Str=1 Dex=15 Con=10 Int=2 Wis=14 Cha=4 HD=1 AC=16 Attack=0 Dam=0 Size=D',
  'Cat':
    'Str=3 Dex=15 Con=10 Int=2 Wis=12 Cha=7 HD=1 AC=14 Attack=4 ' +
    'Dam=2@1d2-4,1d3-4 Size=T',
  'Hawk':
    'Str=6 Dex=17 Con=10 Int=2 Wis=14 Cha=6 HD=1 AC=17 Attack=5 Dam=1d4-2 ' +
    'Size=T',
  'Lizard':
    'Str=3 Dex=15 Con=10 Int=1 Wis=12 Cha=2 HD=1 AC=14 Attack=4 Dam=1d4-4 ' +
    'Size=T',
  'Owl':
    'Str=4 Dex=17 Con=10 Int=2 Wis=14 Cha=4 HD=1 AC=17 Attack=5 Dam=1d4-3 ' +
    'Size=T',
  'Rat':
    'Str=2 Dex=15 Con=10 Int=2 Wis=12 Cha=2 HD=1 AC=14 Attack=4 Dam=1d3-4 ' +
    'Size=T',
  'Raven':
    'Str=1 Dex=15 Con=10 Int=2 Wis=14 Cha=6 HD=1 AC=14 Attack=4 Dam=1d2-5 ' +
    'Size=T',
  'Tiny Viper':
    'Str=4 Dex=17 Con=11 Int=1 Wis=12 Cha=2 HD=1 AC=17 Attack=5 Dam=1 Size=T',
  'Toad':
    'Str=1 Dex=12 Con=11 Int=1 Wis=14 Cha=4 HD=1 AC=15 Attack=0 Dam=0 Size=D',
  'Weasel':
    'Str=3 Dex=15 Con=10 Int=2 Wis=12 Cha=5 HD=1 AC=14 Dam=1d3-4 Attack=4 ' +
    'Size=T',

  'Air Elemental':
    'Str=10 Dex=17 Con=10 Int=4 Wis=11 Cha=11 HD=2 AC=17 Attack=5 Dam=1d4 ' +
    'Size=S Level=5',
  'Air Mephit':
    'Str=10 Dex=17 Con=10 Int=6 Wis=11 Cha=15 HD=3 AC=17 Attack=4 Dam=2@1d3 ' +
    'Size=S Level=7',
  'Dust Mephit':
    'Str=10 Dex=17 Con=10 Int=6 Wis=11 Cha=15 HD=3 AC=17 Attack=4 Dam=2@1d3 ' +
    'Size=S Level=7',
  'Earth Elemental':
    'Str=17 Dex=8 Con=13 Int=4 Wis=11 Cha=11 HD=2 AC=17 Attack=5 Dam=1d6+4 ' +
    'Size=S Level=5',
  'Earth Mephit':
    'Str=17 Dex=8 Con=13 Int=6 Wis=11 Cha=15 HD=3 AC=16 Attack=7 Dam=2@1d3+3 ' +
    'Size=S Level=7',
  'Fire Elemental':
    'Str=10 Dex=13 Con=10 Int=4 Wis=11 Cha=11 HD=2 AC=15 Attack=3 ' +
    'Dam=1d4,1d4 Size=S Level=5',
  'Fire Mephit':
    'Str=10 Dex=13 Con=10 Int=6 Wis=11 Cha=15 HD=3 AC=16 Attack=4 ' +
    'Dam=2@1d3,1d4 Size=S Level=7',
  'Formian Worker':
    'Str=13 Dex=14 Con=13 Int=6 Wis=10 Cha=9 HD=1 AC=17 Attack=3 Dam=1d4+1 ' +
    'Size=S Level=7',
  'Homunculus':
    'Str=8 Dex=15 Con=0 Int=10 Wis=12 Cha=7 HD=2 AC=14 Attack=2 Dam=1d4-1 ' +
    'Size=T Level=7',
  'Ice Mephit':
    'Str=10 Dex=17 Con=10 Int=6 Wis=11 Cha=15 HD=3 AC=18 Attack=4 ' +
    'Dam=2@1d3,1d4 Size=S Level=7',
  'Imp':
    'Str=10 Dex=20 Con=10 Int=10 Wis=12 Cha=14 HD=3 AC=20 Attack=8 Dam=1d4 ' +
    'Size=T Level=7',
  'Magma Mephit':
    'Str=10 Dex=13 Con=10 Int=6 Wis=11 Cha=15 HD=3 AC=16 Attack=4 ' +
    'Dam=2@1d3,1d4 Size=S Level=7',
  'Ooze Mephit':
    'Str=14 Dex=10 Con=13 Int=6 Wis=11 Cha=15 HD=3 AC=16 Attack=6 ' +
    'Dam=2@1d3+2 Size=S Level=7',
  'Pseudodragon':
    'Str=6 Dex=15 Con=13 Int=10 Wis=12 Cha=10 HD=2 AC=18 Attack=6 Dam=1d3-2 ' +
    'Size=T Level=7',
  'Quasit':
    'Str=8 Dex=17 Con=10 Int=10 Wis=12 Cha=10 HD=3 AC=18 Attack=8 ' +
    'Dam=1d3-1,1d4-1 Size=T Level=7',
  'Salt Mephit':
    'Str=17 Dex=8 Con=13 Int=6 Wis=11 Cha=15 HD=3 AC=16 Attack=7 Dam=2@1d3+3 ' +
    'Size=S Level=7',
  'Shocker Lizard':
    'Str=10 Dex=15 Con=13 Int=2 Wis=12 Cha=6 HD=2 AC=16 Attack=3 Dam=1d4 ' +
    'Size=S Level=5',
  'Steam Mephit':
    'Str=10 Dex=13 Con=10 Int=6 Wis=11 Cha=15 HD=3 AC=16 Attack=4 ' +
    'Dam=2@1d3,1d4 Size=S Level=7',
  'Stirge':
    'Str=3 Dex=19 Con=10 Int=1 Wis=12 Cha=6 HD=1 AC=16 Attack=7 Dam=0 Size=T ' +
    'Level=5',
  'Water Elemental':
    'Str=14 Dex=10 Con=13 Int=4 Wis=11 Cha=11 HD=2 AC=17 Attack=4 Dam=1d6+3 ' +
    'Size=S Level=5',
  'Water Mephit':
    'Str=14 Dex=10 Con=13 Int=6 Wis=11 Cha=15 HD=3 AC=16 Attack=6 ' +
    'Dam=2@1d3+2 Size=S Level=7'

};
SRD35.FEATS = {
  'Acrobatic':'Type=General',
  'Agile':'Type=General',
  'Alertness':'Type=General',
  'Animal Affinity':'Type=General',
  'Armor Proficiency (Heavy)':
    'Type=General Require="features.Armor Proficiency (Medium)"',
  'Armor Proficiency (Light)':'Type=General',
  'Armor Proficiency (Medium)':
    'Type=General Require="features.Armor Proficiency (Light)"',
  'Athletic':'Type=General',
  'Augment Summoning':
    'Type=General Require="features.Spell Focus (Conjuration)"',
  'Blind-Fight':'Type=Fighter',
  'Brew Potion':'Type="Item Creation",Wizard Require="casterLevel >= 3"',
  'Cleave':'Type=Fighter Require="features.Power Attack","strength >= 13"',
  'Combat Casting':'Type=General Imply="casterLevel >= 1"',
  'Combat Expertise':'Type=Fighter Require="intelligence >= 13"',
  'Combat Reflexes':'Type=Fighter',
  'Craft Magic Arms And Armor':
    'Type="Item Creation",Wizard Require="casterLevel >= 5"',
  'Craft Rod':'Type="Item Creation",Wizard Require="casterLevel >= 9"',
  'Craft Staff':'Type="Item Creation",Wizard Require="casterLevel >= 12"',
  'Craft Wand':'Type="Item Creation",Wizard Require="casterLevel >= 5"',
  'Craft Wondrous Item':
    'Type="Item Creation",Wizard Require="casterLevel >= 3"',
  'Deceitful':'Type=General',
  'Deflect Arrows':
    'Type=Fighter Require="dexterity >= 13","features.Improved Unarmed Strike"',
  'Deft Hands':'Type=General',
  'Diehard':'Type=General Require="features.Endurance"',
  'Diligent':'Type=General',
  'Dodge':'Type=Fighter Require="dexterity >= 13"',
  'Empower Spell':'Type=Metamagic,Wizard Imply="casterLevel >= 1"',
  'Endurance':'Type=General',
  'Enlarge Spell':'Type=Metamagic,Wizard Imply="casterLevel >= 1"',
  'Eschew Materials':'Type=General Imply="casterLevel >= 1"',
  'Exotic Weapon Proficiency (%exoticWeapon)':
    'Type=General Require="baseAttack >= 1" Imply="weapons.%exoticWeapon"',
  'Extend Spell':'Type=Metamagic,Wizard Imply="casterLevel >= 1"',
  'Extra Turning':'Type=General Require="turningLevel >= 1"',
  'Far Shot':'Type=Fighter Require="features.Point-Blank Shot"',
  'Forge Ring':'Type="Item Creation",Wizard Require="casterLevel >= 12"',
  'Great Cleave':
    'Type=Fighter Require="strength >= 13","baseAttack >= 4","features.Cleave","features.Power Attack"',
  'Great Fortitude':'Type=General',
  'Greater Spell Focus (%school)':
    'Type=General Require="features.Spell Focus (%school)"',
  'Greater Spell Penetration':
    'Type=General Imply="casterLevel >= 1" Require="features.Spell Penetration"',
  'Greater Two-Weapon Fighting':
    'Type=Fighter Require="dexterity >= 12","baseAttack >= 11","features.Two-Weapon Fighting","features.Improved Two-Weapon Fighting"',
  'Greater Weapon Focus (%weapon)':
    'Type=Fighter Require="features.Weapon Focus (%weapon)","levels.Fighter >= 8" Imply="weapons.%weapon"',
  'Greater Weapon Specialization (%weapon)':
    'Type=Fighter Require="features.Weapon Focus (%weapon)","features.Greater Weapon Focus (%weapon)","features.Weapon Specialization (%weapon)","levels.Fighter >= 12" Imply="weapons.%weapon"',
  'Heighten Spell':'Type=Metamagic,Wizard Imply="casterLevel >= 1"',
  'Improved Bull Rush':
    'Type=Fighter Require="strength >= 13","features.Power Attack"',
  'Improved Counterspell':'Type=General Imply="casterLevel >= 1"',
  'Improved Critical (%weapon)':
    'Type=Fighter Require="baseAttack >= 8" Imply="weapons.%weapon"',
  'Improved Disarm':
    'Type=Fighter Require="intelligence >= 13","features.Combat Expertise"',
  'Improved Familiar':'Type=General Require="features.Summon Familiar"',
  'Improved Feint':
    'Type=Fighter Require="intelligence >= 13","features.Combat Expertise"',
  'Improved Grapple':
    'Type=Fighter Require="dexterity >= 13","features.Improved Unarmed Strike"',
  'Improved Initiative':'Type=Fighter',
  'Improved Overrun':
    'Type=Fighter Require="strength >= 13","features.Power Attack"',
  'Improved Precise Shot':
    'Type=Fighter Require="dexterity >= 13","baseAttack >= 11","features.Point-Blank Shot","features.Precise Shot"',
  'Improved Shield Bash':
    'Type=Fighter Require="features.Shield Proficiency"',
  'Improved Sunder':
    'Type=Fighter Require="strength >= 13","features.Power Attack"',
  'Improved Trip':
    'Type=Fighter Require="intelligence >= 13","features.Combat Expertise"',
  'Improved Turning':'Type=General Require="turningLevel >= 1"',
  'Improved Two-Weapon Fighting':
    'Type=Fighter Require="dexterity >= 13","baseAttack >= 6","features.Two-Weapon Fighting"',
  'Improved Unarmed Strike':'Type=Fighter',
  'Investigator':'Type=General',
  'Iron Will':'Type=General',
  'Leadership':'Type=General Require="level >= 6"',
  'Lightning Reflexes':'Type=General',
  'Magical Aptitude':'Type=General',
  'Manyshot':
    'Type=Fighter Require="dexterity >= 17","baseAttack >= 6","features.Point-Blank Shot","features.Rapid Shot"',
  'Martial Weapon Proficiency (%martialWeapon)':
    'Type=General Imply="weapons.%martialWeapon"',
  'Maximize Spell':'Type=Metamagic,Wizard Imply="casterLevel >= 1"',
  'Mobility':'Type=Fighter Require="dexterity >= 13",features.Dodge',
  'Mounted Archery':
    'Type=Fighter Require="features.Mounted Combat",skills.Ride',
  'Mounted Combat':'Type=Fighter Require=skills.Ride',
  'Natural Spell':'Type=General Require="wisdom >= 13","features.Wild Shape"',
  'Negotiator':'Type=General',
  'Nimble Fingers':'Type=General',
  'Persuasive':'Type=General',
  'Point-Blank Shot':'Type=Fighter',
  'Power Attack':'Type=Fighter Require="strength >= 13"',
  'Precise Shot':'Type=Fighter Require="features.Point-Blank Shot"',
  'Quick Draw':'Type=Fighter Require="baseAttack >= 1"',
  'Quicken Spell':'Type=Metamagic,Wizard Imply="casterLevel >= 1"',
  'Rapid Reload (Hand)':'Type=Fighter Imply="weapons.Hand Crossbow"',
  'Rapid Reload (Heavy)':'Type=Fighter Imply="weapons.Heavy Crossbow"',
  'Rapid Reload (Light)':'Type=Fighter Imply="weapons.Light Crossbow"',
  'Rapid Shot':
    'Type=Fighter Require="dexterity >= 13","features.Point-Blank Shot"',
  'Ride-By Attack':'Type=Fighter Require="features.Mounted Combat",skills.Ride',
  'Run':'Type=General',
  'Scribe Scroll':'Type="Item Creation",Wizard Require="casterLevel >= 1"',
  'Self-Sufficient':'Type=General',
  'Shield Proficiency':'Type=General',
  'Shot On The Run':
    'Type=Fighter Require="dexterity >= 13","baseAttack >= 4",features.Dodge,features.Mobility,"features.Point-Blank Shot"',
  'Silent Spell':'Type=Metamagic,Wizard Imply="casterLevel >= 1"',
  'Simple Weapon Proficiency':'Type=General',
  'Skill Focus (%skill)':'Type=General',
  'Snatch Arrows':
    'Type=Fighter Require="dexterity >= 15","features.Deflect Arrows","features.Improved Unarmed Strike"',
  'Spell Focus (%school)':'Type=General Imply="casterLevel >= 1"',
  'Spell Mastery':
    'Type=Wizard Imply="intelligenceModifier > 0" Require="levels.Wizard >= 1"',
  'Spell Penetration':'Type=General Imply="casterLevel >= 1"',
  'Spirited Charge':
    'Type=Fighter Require="features.Mounted Combat","features.Ride-By Attack",skills.Ride',
  'Spring Attack':
    'Type=Fighter Require="dexterity >= 13","baseAttack >= 4",features.Dodge,features.Mobility',
  'Stealthy':'Type=General',
  'Still Spell':'Type=Metamagic,Wizard Imply="casterLevel >= 1"',
  'Stunning Fist':
    'Type=Fighter Require="dexterity >= 13","wisdom >= 13","baseAttack >= 8","features.Improved Unarmed Strike"',
  'Toughness':'Type=General',
  'Tower Shield Proficiency':
    'Require="features.Shield Proficiency" Type=General',
  'Track':'Type=General Imply=skills.Survival',
  'Trample':'Type=Fighter Require="features.Mounted Combat",skills.Ride',
  'Two-Weapon Defense':
    'Type=Fighter Require="dexterity >= 15","features.Two-Weapon Fighting"',
  'Two-Weapon Fighting':'Type=Fighter Require="dexterity >= 15"',
  'Weapon Finesse':
    'Type=Fighter Require="baseAttack >= 1" Imply="dexterityModifier > strengthModifier"',
  'Weapon Focus (%weapon)':
    'Type=Fighter Require="baseAttack >= 1" Imply="weapons.%weapon"',
  'Weapon Specialization (%weapon)':
    'Type=Fighter Require="features.Weapon Focus (%weapon)","levels.Fighter >= 4" Imply="weapons.%weapon"',
  'Whirlwind Attack':
    'Type=Fighter Require="dexterity >= 13","intelligence >= 13","baseAttack >= 4","features.Combat Expertise",features.Dodge,features.Mobility,"features.Spring Attack"',
  'Widen Spell':'Type=Metamagic,Wizard Imply="casterLevel >= 1"'
};
SRD35.FEATURES = {
  'A Thousand Faces':'Section=magic Note="<i>Disguise Self</i> at will"',
  'Abundant Step':
    'Section=magic Note="Teleport self %{levels.Monk//2*40+400}\' 1/dy"',
  'Accurate':'Section=combat Note="+1 attack with slings and thrown"',
  'Acrobatic':'Section=skill Note="+2 Jump/+2 Tumble"',
  'Agile':'Section=skill Note="+2 Balance/+2 Escape Artist"',
  'Air Turning':'Section=combat Note="Turn Earth, rebuke Air"',
  'Alert Senses':'Section=skill Note="+1 Listen/+1 Search/+1 Spot"',
  'Alertness':'Section=skill Note="+2 Listen/+2 Spot"',
  'All-Knowing':'Section=skill Note="All Knowledge is a class skill"',
  'Animal Affinity':'Section=skill Note="+2 Handle Animal/+2 Ride"',
  'Animal Companion':'Section=feature Note="Special bond and abilities"',
  'Animal Talk':'Section=magic Note="<i>Speak With Animals</i> 1/dy"',
  'Arcane Adept':
    'Section=magic ' +
    'Note="Use magic device as W%{levels.Cleric//2>?1 + (levels.Wizard||0)}"',
  'Armor Class Bonus':'Section=combat Note="+%V AC"',
  'Athletic':'Section=skill Note="+2 Climb/+2 Swim"',
  'Augment Summoning':'Section=magic Note="Summoned creatures +4 Str, +4 Con"',
  'Aura':
    'Section=magic ' +
    'Note="Visible to <i>Detect Chaos/Evil/Good/Law</i> based on deity alignment"',
  'Aura Of Courage':'Section=save Note="Immune fear, R10\' +4 to allies"',
  'Bardic Knowledge':
    'Section=skill ' +
    'Note="+%V check for knowledge of notable people, items, places"',
  'Bardic Music':'Section=feature Note="Bardic music effect %V/dy"',
  'Blind-Fight':
    'Section=combat ' +
    'Note="Reroll concealed miss, no melee bonus to invisible foe, half penalty for impaired vision"',
  'Brew Potion':'Section=magic Note="Create potion for up to 3rd level spell"',
  'Camouflage':'Section=skill Note="Hide in any natural terrain"',
  'Celestial Familiar':
    'Section=companion ' +
    'Note="Smite Evil (+%{familiarStats.HD} HP) 1/dy, 60\' darkvision, resistance %{((familiarStats.HD+7)//8)*5} to acid, cold, and electricity, DR %{familiarStats.HD<4 ? 0 : 10}/magic"',
  'Cleave':'Section=combat Note="Extra attack when foe drops 1/rd"',
  'Combat Casting':
    'Section=skill ' +
    'Note="+4 Concentration to cast spell while on defensive or grappling"',
  'Combat Expertise':
    'Section=combat ' +
    'Note="Trade up to -%{baseAttack <? 5} attack for equal AC bonus"',
  'Combat Reflexes':
    'Section=combat Note="Flatfooted AOO, %{dexterityModifier+1} AOO/rd"',
  'Command Like Creatures':
    'Section=companion ' +
    'Note="DC %{levels.Paladin//2 + charismaModifier + 10} <i>Command</i> vs. similar creatures %{levels.Paladin//2}/dy"',
  'Command Undead':'section=combat Note="Turn Undead as level %V Cleric"',
  'Companion Alertness':
    'Section=skill Note="+2 Listen and Spot when companion in reach"',
  'Companion Evasion':
    'Section=companion Note="Reflex save yields no damage instead of half"',
  'Companion Improved Evasion':
    'Section=companion Note="Failed save yields half damage"',
  'Countersong':
    'Section=magic ' +
    'Note="R30\' Perform check vs. sonic magic while performing for 10 rd"',
  'Craft Magic Arms And Armor':
    'Section=magic Note="Create and mend magic weapons, armor, and shields"',
  'Craft Rod':'Section=magic Note="Create magic rod"',
  'Craft Staff':'Section=magic Note="Create magic staff"',
  'Craft Wand':'Section=magic Note="Create wand for up to 4th level spell"',
  'Craft Wondrous Item':
    'Section=magic Note="Create and mend miscellaneous magic items"',
  'Crippling Strike':
    'Section=combat Note="2 points Str damage from sneak attack"',
  'Damage Reduction':'Section=combat Note="DR %V/-"',
  'Darkvision':'Section=feature Note="60\' b/w vision in darkness"',
  'Deadly Touch':
    'Section=magic ' +
    'Note="Touch kills target w/up to %{deathDomainLevel}d6 HP 1/dy"',
  'Deceitful':'Section=skill Note="+2 Disguise/+2 Forgery"',
  'Deceptive Knowledge':
    'Section=skill ' +
    'Note="Bluff is a class skill/' +
          'Disguise is a class skill/' +
          'Hide is a class skill"',
  'Defensive Roll':
    'Section=combat ' +
    'Note="DC damage Reflex save vs. lethal blow for half damage"',
  'Deflect Arrows':'Section=combat Note="No damage from ranged hit 1/rd"',
  'Deft Hands':'Section=skill Note="+2 Sleight Of Hand/+2 Use Rope"',
  'Deliver Touch Spells':
    'Section=companion ' +
    'Note="Deliver touch spells if in contact w/master when cast"',
  'Destroy Undead':'Section=combat Note="Destroy turned undead 1/dy"',
  'Detect Evil':'Section=magic Note="<i>Detect Evil</i> at will"',
  'Devotion':'Section=companion Note="+4 Will vs. enchantment"',
  'Diamond Body':'Section=save Note="Immune to poison"',
  'Diamond Soul':'Section=save Note="Spell resistance %V"',
  'Diehard':
    'Section=combat ' +
    'Note="Remain conscious, stable, and able to act with negative HP"',
  'Diligent':'Section=skill Note="+2 Appraise/+2 Decipher Script"',
  'Divine Grace':'Section=save Note="+%V Fortitude/+%V Reflex/+%V Will"',
  'Divine Health':'Section=save Note="Immune to disease"',
  'Dodge Giants':'Section=combat Note="+4 AC vs. giant creatures"',
  'Dodge':'Section=combat Note="+1 AC"',
  'Dwarf Ability Adjustment':
    'Section=ability Note="+2 Constitution/-2 Charisma"',
  'Dwarf Enmity':'Section=combat Note="+1 attack vs. goblinoid and orc"',
  'Earth Turning':'Section=combat Note="Turn Air, rebuke Earth"',
  'Elemental Shape':
    'Section=magic Note="Wild Shape to elemental %{(levels.Druid-14)//2}/dy"',
  'Elf Ability Adjustment':
    'Section=ability Note="+2 Dexterity/-2 Constitution"',
  'Elven Blood':'Section=feature Note="Elf for racial effects"',
  'Empathic Link':'Section=companion Note="Share emotions w/in 1 mile"',
  'Empower Spell':
    'Section=magic ' +
    'Note="x1.5 chosen spell variable effects uses +2 spell slot"',
  'Empowered Chaos':'Section=magic Note="+1 caster level on Chaos spells"',
  'Empowered Evil':'Section=magic Note="+1 caster level on Evil spells"',
  'Empowered Good':'Section=magic Note="+1 caster level on Good spells"',
  'Empowered Healing':'Section=magic Note="+1 caster level on Heal spells"',
  'Empowered Knowledge':
    'Section=magic Note="+1 caster level on Divination spells"',
  'Empowered Law':'Section=magic Note="+1 caster level on Law spells"',
  'Empty Body':'Section=magic Note="Self ethereal %{levels.Monk} rd/dy"',
  'Endurance':'Section=save Note="+4 extended physical action"',
  'Enlarge Spell':
    'Section=magic Note="x2 chosen spell range uses +1 spell slot"',
  'Eschew Materials':'Section=magic Note="Cast spells w/out materials"',
  'Evasion':'Section=save Note="Reflex save yields no damage instead of half"',
  'Extend Spell':
    'Section=magic Note="x2 chosen spell duration uses +1 spell slot"',
  'Extra Turning':'Section=combat Note="+%V turnings/dy"',
  'Familiar Bat':'Section=skill Note="+3 Listen"',
  'Familiar Cat':'Section=skill Note="+3 Move Silently"',
  'Familiar Hawk':'Section=skill Note="+3 Spot in bright light"',
  'Familiar Lizard':'Section=skill Note="+3 Climb"',
  'Familiar Owl':'Section=skill Note="+3 Spot in shadows and darkness"',
  'Familiar Rat':'Section=save Note="+2 Fortitude"',
  'Familiar Raven':'Section=skill Note="+3 Appraise"',
  'Familiar Tiny Viper':'Section=skill Note="+3 Bluff"',
  'Familiar Toad':'Section=combat Note="+3 Hit Points"',
  'Familiar Weasel':'Section=save Note="+2 Reflex"',
  'Far Shot':'Section=combat Note="x1.5 projectile range, x2 thrown"',
  'Fascinate':
    'Section=magic ' +
    'Note="R90\' Hold %{(levels.Bard+2)//3} creatures spellbound while performing for %{levels.Bard} rd (DC Perform Will neg)"',
  'Fast Movement':'Section=ability Note="+10 Speed"',
  'Favored Enemy':
    'Section=combat,skill ' +
    'Note="+2 or more damage vs. %V chosen creature type",' +
         '"+2 or more Bluff, Listen, Sense Motive, Spot and Survival vs. %V chosen creature type"',
  'Feat Bonus':'Section=feature Note="+1 General Feat"',
  'Fiendish Familiar':
    'Section=companion ' +
    'Note="Smite Good (+%{familiarStats.HD} HP) 1/dy, 60\' darkvision, resistance %{((familiarStats.HD+7)//8)*5} to acid, cold, and electricity, DR %{familiarStats.HD<4 ? 0 : 10}/magic"',
  'Fighter Feat Bonus':'Section=feature Note="+1 Fighter Feat"',
  'Fire Turning':'Section=combat Note="Turn Water, rebuke Fire"',
  'Flurry Of Blows':
     'Section=combat ' +
     'Note="Trade -%{levels.Monk<5?2:levels.Monk<9?1:0} attack for %{levels.Monk<11?1:2} extra attack"',
  'Forge Ring':'Section=magic Note="Create and mend magic rings"',
  'Fortunate':'Section=save Note="+1 Fortitude/+1 Reflex/+1 Will"',
  'Gnome Ability Adjustment':
    'Section=ability Note="+2 Constitution/-2 Strength"',
  'Gnome Enmity':'Section=combat Note="+1 attack vs. goblinoid and kobold"',
  'Good Fortune':'Section=feature Note="Reroll 1/dy"',
  'Great Cleave':'Section=combat Note="Cleave w/out limit"',
  'Great Fortitude':'Section=save Note="+2 Fortitude"',
  'Greater Rage':'Section=combat Note="+6 Str, +6 Con, +3 Will during rage"',
  'Greater Spell Focus (%school)':'Section=magic Note="+1 Spell DC (%school)"',
  'Greater Spell Penetration':
    'Section=magic Note="+2 checks to overcome spell resistance"',
  'Greater Two-Weapon Fighting':
    'Section=combat Note="Third off-hand -10 attack"',
  'Greater Weapon Focus (%weapon)':
    'Section=combat Note="+1 %weapon Attack Modifier"',
  'Greater Weapon Specialization (%weapon)':
    'Section=combat Note="+2 %weapon Damage Modifier"',
  'Half-Orc Ability Adjustment':
    'Section=ability Note="+2 Strength/-2 Intelligence/-2 Charisma"',
  'Halfling Ability Adjustment':
    'Section=ability Note="+2 Dexterity/-2 Strength"',
  'Heighten Spell':'Section=magic Note="Increase chosen spell level"',
  'Hide In Plain Sight':'Section=skill Note="Hide even when observed"',
  'Human Feat Bonus':'Section=feature Note="+1 General Feat"',
  'Human Skill Bonus':'Section=skill Note="+%V Skill Points"',
  'Illiteracy':
    'Section=skill Note="Must spend 2 skill points to read and write"',
  'Improved Bull Rush':
    'Section=combat Note="No AOO on Bull Rush, +4 Str check"',
  'Improved Counterspell':
    'Section=magic Note="Counter using higher-level spell from same school"',
  'Improved Critical (%weapon)':
    'Section=combat Note="x2 %weapon Threat Range"',
  'Improved Disarm':'Section=combat Note="No AOO on Disarm, +4 attack"',
  'Improved Evasion':'Section=save Note="Failed save yields half damage"',
  'Improved Familiar':'Section=feature Note="Expanded familiar choices"',
  'Improved Feint':'Section=combat Note="Bluff check to Feint as move action"',
  'Improved Grapple':'Section=combat Note="No AOO on Grapple, +4 Grapple"',
  'Improved Initiative':'Section=combat Note="+4 Initiative"',
  'Improved Overrun':'Section=combat Note="Foe cannot avoid, +4 Str check"',
  'Improved Precise Shot':
    'Section=combat ' +
    'Note="No foe AC bonus for partial cover, attack grappling target"',
  'Improved Shield Bash':'Section=combat Note="No AC penalty on Shield Bash"',
  'Improved Speed':'Section=companion Note="+10 companion Speed"',
  'Improved Sunder':'Section=combat Note="No AOO on Sunder, +4 attack"',
  'Improved Trip':
    'Section=combat Note="No AOO on Trip, +4 Str check, attack after trip"',
  'Improved Turning':'Section=combat Note="+1 Turning Level"',
  'Improved Two-Weapon Fighting':
    'Section=combat Note="Second off-hand -5 attack"',
  'Improved Unarmed Strike':
    'Section=combat Note="No AOO on Unarmed attack, may deal lethal damage"',
  'Improved Uncanny Dodge':
    'Section=combat ' +
    'Note="Cannot be flanked, sneak attack only by rogue level %V+"',
  'Increased Unarmed Damage':'Section=combat Note="%V"',
  'Indomitable Will':'Section=save Note="+4 Will vs. enchantment during rage"',
  'Inspire Competence':
    'Section=magic Note="R30\' Allies +2 skill checks while performing for 2 min"',
  'Inspire Courage':
    'Section=magic ' +
    'Note="Allies +%{(levels.Bard+4)//6 >? 1} attack, damage, charm and fear saves while performing + 5 rd"',
  'Inspire Greatness':
    'Section=magic ' +
    'Note="R30\' %{(levels.Bard-6)//3} allies +2d10 HP, +2 attack, +1 Fortitude while performing + 5 rd"',
  'Inspire Heroics':
    'Section=magic ' +
    'Note="R30\' %{(levels.Bard-12)//3} allies +4 AC and saves while performing + 5 rd"',
  'Investigator':'Section=skill Note="+2 Gather Information/+2 Search"',
  'Iron Will':'Section=save Note="+2 Will"',
  'Keen Ears':'Section=skill Note="+2 Listen"',
  'Keen Nose':'Section=skill Note="+2 Craft (Alchemy)"',
  'Keen Senses':'Section=skill Note="+2 Listen/+2 Search/+2 Spot"',
  'Ki Strike':
    'Section=combat ' +
    'Note="Unarmed attack is magic%{levels.Monk>15 ? \', lawful, and adamantine\' : levels.Monk>9 ? \' and lawful\' : \'\'}"',
  'Know Depth':'Section=feature Note="Intuit approximate depth underground"',
  'Large':
    'Section=ability,combat,skill ' +
    'Note="x2 Load Max",' +
         '"-1 AC/-1 Melee Attack/-1 Ranged Attack/+4 special attacks",' +
         '"-4 Hide/+4 Intimidate"',
  'Lay On Hands':
    'Section=magic ' +
    'Note="Harm undead or heal %{levels.Paladin * charismaModifier} HP/dy"',
  'Leadership':'Section=feature Note="Attract followers"',
  'Lightning Reflexes':'Section=save Note="+2 Reflex"',
  'Link':
    'Section=skill ' +
    'Note="+4 Handle Animal (companion)/+4 Wild Empathy (companion)"',
  'Low-Light Vision':'Section=feature Note="x2 normal distance in poor light"',
  'Magical Aptitude':'Section=skill Note="+2 Spellcraft/+2 Use Magic Device"',
  'Manyshot':
    'Section=combat ' +
    'Note="R30\' Fire up to %{(baseAttack+4)//5} arrows simultaneously at -2 attack/arrow"',
  'Mass Suggestion':
    'Section=magic ' +
    'Note="<i>Suggestion</i> to all fascinated creatures (DC %{10+levels.Bard//2+charismaModifier} Will neg)"',
  'Maximize Spell':
    'Section=magic ' +
    'Note="Maximize all chosen spell variable effects uses +3 spell slot"',
  'Mighty Rage':'Section=combat Note="+8 Str, +8 Con, +4 Will during rage"',
  'Mobility':'Section=combat Note="+4 AC vs. movement AOO"',
  'Fast Monk Movement':'Section=ability Note="+%V Speed"',
  'Mounted Archery':'Section=combat Note="Half mounted ranged penalty"',
  'Mounted Combat':
    'Section=combat Note="Ride skill save vs. mount damage 1/rd"',
  'Multiattack':
    'Section=companion ' +
    'Note="Reduce additional attack penalty to -2 or second attack at -5"',
  'Natural Illusionist':'Section=magic Note="+1 Spell DC (Illusion)"',
  'Natural Smith':
    'Section=skill ' +
    'Note="+2 Appraise (stone or metal)/+2 Craft (stone or metal)"',
  'Natural Spell':'Section=magic Note="Cast spell during Wild Shape"',
  'Nature Knowledge':'Section=skill Note="Knowledge (Nature) is a class skill"',
  'Nature Sense':'Section=skill Note="+2 Knowledge (Nature)/+2 Survival"',
  'Negotiator':'Section=skill Note="+2 Diplomacy/+2 Sense Motive"',
  'Nimble Fingers':'Section=skill Note="+2 Disable Device/+2 Open Lock"',
  'Opportunist':'Section=combat Note="AOO vs. foe struck by ally"',
  'Orc Blood':'Section=feature Note="Orc for racial effects"',
  'Outdoors Knowledge':'Section=skill Note="Survival is a class skill"',
  'Perfect Self':
    'Section=combat,save ' +
    'Note="DR 10/magic","Treat as outsider for magic saves"',
  'Persuasive':'Section=skill Note="+2 Bluff/+2 Intimidate"',
  'Plant Turning':'Section=combat Note="Turn Plant, rebuke Plant"',
  'Point-Blank Shot':
    'Section=combat Note="+1 ranged attack and damage w/in 30\'"',
  'Power Attack':
    'Section=combat ' +
    'Note="Trade up to -%{baseAttack} attack for equal damage bonus"',
  'Precise Shot':'Section=combat Note="No penalty on shot into melee"',
  'Protective Touch':
    'Section=magic ' +
    'Note="Touched +%{protectionDomainLevel} on next save w/in 1 hour 1/dy"',
  'Purity Of Body':'Section=save Note="Immune to normal disease"',
  'Quick Draw':'Section=combat Note="Draw weapon as free action"',
  'Quicken Spell':
    'Section=magic Note="Free action casting 1/rd uses +4 spell slot"',
  'Quivering Palm':
    'Section=combat ' +
    'Note="Struck foe dies 1/wk (DC %{10+levels.Monk//2+wisdomModifier} Fort neg)"',
  'Rage':'Section=combat Note="+4 Str, +4 Con, +2 Will, -2 AC for %V rd %1/dy"',
  'Rapid Reload (Hand)':
    'Section=combat Note="Reload Hand Crossbow as free action"',
  'Rapid Reload (Heavy)':
    'Section=combat Note="Reload Heavy Crossbow as move action"',
  'Rapid Reload (Light)':
    'Section=combat Note="Reload Light Crossbow as free action"',
  'Rapid Shot':'Section=combat Note="Normal and extra ranged -2 attacks"',
  'Remove Disease':
    'Section=magic Note="<i>Remove Disease</i> %{(levels.Paladin-3)//3}/week"',
  'Resist Enchantment':'Section=save Note="+2 vs. enchantment"',
  'Resist Fear':'Section=save Note="+2 vs. fear"',
  'Resist Illusion':'Section=save Note="+2 vs. illusions"',
  "Resist Nature's Lure":'Section=save Note="+4 vs. spells of feys"',
  'Resist Poison':'Section=save Note="+2 vs. Poison"',
  'Resist Spells':'Section=save Note="+2 vs. Spells"',
  'Ride-By Attack':
    'Section=combat Note="Move before, after mounted attack w/out AOO"',
  'Run':
    'Section=ability,combat,skill ' +
    'Note="+1 Run Speed Multiplier",' +
         '"Retain dex bonus to AC while running",' +
         '"+4 running Jump"',
  'School Opposition (%school)':
    'Section=magic Note="Cannot learn or cast %school spells"',
  'School Specialization (%school)':
    'Section=magic,skill ' +
    'Note="Extra %school spell/dy each spell level",' +
         '"+2 Spellcraft (%school effects)"',
  'Scribe Scroll':'Section=magic Note="Create scroll of any known spell"',
  'Scry On Familiar':'Section=companion Note="Master views companion 1/dy"',
  'Self-Sufficient':'Section=skill Note="+2 Heal/+2 Survival"',
  'Sense Secret Doors':'Section=feature Note="Automatic Search w/in 5\'"',
  'Share Saving Throws':'Section=companion Note="+%1 Fort/+%2 Ref/+%3 Will"',
  'Share Spells':
    'Section=companion Note="R5\' Master share self spell w/companion"',
  'Shot On The Run':'Section=combat Note="Move before, after ranged attack"',
  'Silent Spell':
    'Section=magic Note="Cast spell w/out speech uses +1 spell slot"',
  'Simple Somatics':
    'Section=magic Note="No arcane spell failure in light armor"',
  'Skill Focus (%skill)':'Section=skill Note="+3 %skill"',
  'Skill Mastery':
    'Section=skill Note="Take 10 despite distraction on %V chosen skills"',
  'Sleep Immunity':'Section=save Note="Immune <i>Sleep</i>"',
  'Slippery Mind':'Section=save Note="Second save vs. enchantment"',
  'Slow Fall':
    'Section=save Note="Subtract %{levels.Monk<20 ? levels.Monk//2*10 : \'all\'}\' from falling damage distance when near wall"',
  'Slow':'Section=ability Note="-10 Speed"',
  'Small':
    'Section=ability,combat,skill ' +
    'Note="x0.75 Load Max",' +
          '"+1 AC/+1 Melee Attack/+1 Ranged Attack/-4 special attacks",' +
          '"+4 Hide/-4 Intimidate"',
  'Smite':
    'Section=combat Note="+4 attack, +%{destructionDomainLevel} damage 1/dy"',
  'Smite Evil':'Section=combat Note="+%1 attack/+%2 damage vs. evil foe %V/dy"',
  'Snatch Arrows':'Section=combat Note="Catch ranged weapons"',
  'Sneak Attack':
    'Section=combat Note="Hit +%Vd6 HP when surprising or flanking"',
  'Song Of Freedom':
    'Section=magic Note="R30\' <i>Break Enchantment</i> via 1 min Perform"',
  'Speak With Like Animals':'Section=companion Note="Talk w/similar creatures"',
  'Speak With Master':
    'Section=companion Note="Talk w/master in secret language"',
  'Special Mount':'Section=feature Note="Magical mount w/special abilities"',
  'Spell Focus (%school)':'Section=magic Note="+1 Spell DC (%school)"',
  'Spell Mastery':
    'Section=magic ' +
    'Note="Prepare %{intelligenceModifier} spells w/out spellbook"',
  'Spell Penetration':
    'Section=magic Note="+2 checks to overcome spell resistance"',
  'Spirited Charge':
    'Section=combat Note="x2 damage (x3 lance) on mounted charge"',
  'Spontaneous Cleric Spell':
    'Section=magic ' +
    'Note="Cast <i>Cure</i> or <i>Inflict</i> in place of known spell"',
  'Spontaneous Druid Spell':
    'Section=magic ' +
    'Note="Cast <i>Summon Nature\'s Ally</i> in place of known spell"',
  'Spring Attack':
    'Section=combat Note="Move before, after melee attack w/out AOO"',
  'Spry':'Section=skill Note="+2 Climb/+2 Jump/+2 Move Silently"',
  'Stability':'Section=combat Note="+4 vs. Bull Rush and Trip"',
  'Steady':
    'Section=ability Note="No speed penalty in heavy armor or with heavy load"',
  'Stealthy':'Section=skill Note="+2 Hide/+2 Move Silently"',
  'Still Mind':'Section=save Note="+2 vs. enchantment"',
  'Still Spell':
    'Section=magic Note="Cast spell w/out movement uses +1 spell slot"',
  'Stonecunning':
    'Section=skill Note="+2 Search (stone), automatic check w/in 10\'"',
  'Strength Burst':
    'Section=ability Note="+%{strengthDomainLevel} Strength for 1 rd/dy"',
  'Stunning Fist':
    'Section=combat ' +
    'Note="Struck foe stunned for 1 rd %{(levels.Monk||0)>?level//4}/dy (DC %{10+level//2+wisdomModifier} Fort neg)"',
  'Suggestion':
    'Section=magic ' +
    'Note="<i>Suggestion</i> to 1 fascinated creature (DC %{10+levels.Bard//2+charismaModifier} Will neg)"',
  'Summon Familiar':'Section=feature Note="Special bond and abilities"',
  'Swift Tracker':'Section=skill Note="Track at full speed"',
  'Timeless Body':'Section=feature Note="No aging penalties"',
  'Tireless Rage':'Section=combat Note="Not fatigued after rage"',
  'Tolerance':'Section=skill Note="+2 Diplomacy/+2 Gather Information"',
  'Tongue Of The Sun And Moon':
    'Section=feature Note="Speak w/any living creature"',
  'Toughness':'Section=combat Note="+%V HP"',
  'Track':'Section=skill Note="Survival to follow creatures\' trails"',
  'Trackless Step':'Section=feature Note="Untrackable outdoors"',
  'Trample':
    'Section=combat Note="Mounted overrun unavoidable, bonus hoof attack"',
  'Trap Sense':'Section=save Note="+%V Reflex and AC vs. traps"',
  'Trapfinding':
    'Section=skill ' +
    'Note="Use Search and Disable Device to find and remove DC 20+ traps"',
  'Turn Undead':
    'Section=combat ' +
    'Note="R60\' Turn (good) or rebuke (evil) 2d6+%1 HD of undead creatures of up to (d20+%2)/3 HD %3/dy"',
  'Two-Weapon Defense':
    'Section=combat ' +
    'Note="+1 AC wielding two weapons (+2 fighting defensively)"',
  'Two-Weapon Fighting':
    'Section=combat Note="Reduce on-hand penalty by 2, off-hand by 6"',
  'Uncanny Dodge':'Section=combat Note="Always adds Dex modifier to AC"',
  'Unhindered':
    'Section=magic ' +
    'Note="<i>Freedom Of Movement</i> %{travelDomainLevel} rd/dy"',
  'Venom Immunity':'Section=save Note="Immune to poisons"',
  'Water Turning':'Section=combat Note="Turn Fire, rebuke Water"',
  'Weapon Finesse':
    'Section=combat ' +
    'Note="+%{dexterityModifier-strengthModifier} light melee weapon attack (dex instead of str)"',
  'Weapon Focus (%weapon)':'Section=combat Note="+1 %weapon Attack Modifier"',
  'Weapon Of War':
    'Section=feature ' +
    'Note="Weapon Proficiency (%{deityFavoredWeapons})/Weapon Focus (%{deityFavoredWeapons})"',
  'Weapon Specialization (%weapon)':
    'Section=combat Note="+2 %weapon Damage Modifier"',
  'Whirlwind Attack':'Section=combat Note="Attack all foes in reach"',
  'Wholeness Of Body':
    'Section=magic Note="Heal %{levels.Monk*2} HP to self/dy"',
  'Widen Spell':'Section=magic Note="x2 area of affect uses +3 spell slot"',
  'Wild Empathy':'Section=skill Note="+%V Diplomacy (animals)"',
  'Wild Shape':
    'Section=magic Note="Change into creature of size %V %1 hr %2/dy"',
  'Woodland Stride':
    'Section=feature Note="Normal movement through undergrowth"',
  // Prestige Classes
  'Acrobatic Charge':'Section=combat Note="May charge in difficult terrain"',
  'Applicable Knowledge':'Section=feature Note="+1 General Feat"',
  'Arcane Fire':
    'Section=magic ' +
    'Note="R%1\' Convert arcane spell into a ranged touch %Vd6 + 1d6 x spell level bolt of fire"',
  'Arcane Reach':'Section=magic Note="R30\' Ranged touch with touch spell"',
  'Arrow Of Death':
    'Section=combat Note="Special arrow kills foe (DC 20 Fort neg)"',
  'Aura Of Despair':'Section=combat Note="R10\' Foes -2 all saves"',
  'Aura Of Evil':'Section=magic Note="Visible to <i>Detect Evil</i>"',
  'Bite Attack':'Section=combat Note="Attack with bite"',
  'Blackguard Hands':'Section=magic Note="Heal %V HP/dy to self or servant"',
  'Blast Infidel':
    'Section=magic ' +
    'Note="Negative energy spells vs. opposed-alignment foe have max effect"',
  'Blindsense':
    'Section=feature ' +
    'Note="R%V\' Other senses allow detection of unseen objects"',
  'Blood Bond':
    'Section=companion ' +
    'Note="+2 attack, checks, and saves when seeing master threatened"',
  'Bonus Language':'Section=feature Note="+%V Language Count"',
  'Bonus Spells':'Section=magic Note="%V"',
  'Breath Weapon':'Section=combat Note="Breathe %Vd8 HP (DC %1 Ref half) 1/dy"',
  'Canny Defense':'Section=combat Note="+%V AC when unarmored"',
  'Caster Level Bonus':
    'Section=magic ' +
    'Note="+%V base class level for spells known and spells per day"',
  'Claw Attack':'Section=combat Note="Attack with claws"',
  'Constitution Boost':'Section=ability Note="+2 Constitution"',
  'Contingent Conjuration':
    'Section=magic Note="<i>Contingency</i> on summoning spell"',
  'Dark Blessing':'Section=save Note="+%V Fortitude/+%V Reflex/+%V Will"',
  'Death Attack':
    'Section=combat ' +
    'Note="Sneak attack after 3 rd of study causes death or paralysis for 1d6+%{levels.Assassin} rd (DC %{levels.Assassin+intelligenceModifier+10} Fort neg)"',
  'Defender Armor Class Bonus':'Section=combat Note="+%V AC"',
  'Defensive Stance':
     'Section=feature ' +
    'Note="+2 Str, +4 Con, +2 saves, +4 AC while unmoving %V rd %1/dy"',
  'Detect Good':'Section=magic Note="<i>Detect Good</i> at will"',
  'Divine Reach':'Section=magic Note="R30\' Ranged touch with touch spell"',
  'Dodge Trick':'Section=combat Note="+1 AC"',
  'Dragon Apotheosis':
    'Section=ability,feature,save ' +
    'Note="+4 Strength/+2 Charisma",' +
         '"Darkvision and Low-Light Vision",' +
         '"Immune sleep, paralysis, and breath weapon energy"',
  'Elaborate Parry':'Section=combat Note="+%{levels.Duelist} AC when fighting defensively"',
  'Enhance Arrow':'Section=combat Note="Arrows treated as +%V magic weapons"',
  'Enhanced Mobility':
    'Section=combat Note="+4 AC vs. movement AOO when unarmored"',
  'Extended Summoning':'Section=magic Note="x2 summoning spell duration"',
  'Faith Healing':
    'Section=magic ' +
    'Note="Healing spells on same-aligned creature have max effect"',
  'Fiendish Servant':
    'Section=feature Note="Animal servant w/special abilities"',
  'Fiendish Summoning':
    'Section=magic Note="<i>Summon Monster I</i> as level %{levels.Blackguard*2} caster 1/dy"',
  'Gift Of The Divine':
    'Section=feature ' +
    'Note="Transfer some daily uses of turn or rebuke undead to another for 1-7 dy"',
  'Grace':'Section=save Note="+2 Reflex when unarmored"',
  'Greater Lore':'Section=magic Note="<i>Identify</i> at will"',
  'Hail Of Arrows':
    'Section=combat Note="Simultaneously fire arrows at %V targets 1/dy"',
  'High Arcana':'Section=feature Note="%V selections"',
  'Imbue Arrow':'Section=magic Note="Center spell where arrow lands"',
  'Impromptu Sneak Attack':
    'Section=combat Note="Declare any attack a sneak attack %V/dy"',
  'Improved Ally':
    'Section=skill ' +
    'Note="Diplomacy check for planar ally service at half usual cost"',
  'Improved Arcane Reach':'Section=magic Note="R60\' Arcane Reach"',
  'Improved Divine Reach':'Section=magic Note="R60\' Divine Reach"',
  'Improved Reaction':'Section=combat Note="+%V Initiative"',
  'Instant Mastery':'Section=skill Note="4 ranks in an untrained skill"',
  'Intelligence Boost':'Section=ability Note="+2 Intelligence"',
  'Lore':'Section=skill Note="+%{levels.Loremaster+intelligenceModifier} Knowledge (local history)"',
  'Mastery Of Counterspelling':
    'Section=magic Note="Counterspell turns effect back on caster"',
  'Mastery Of Elements':'Section=magic Note="Change energy type of spell"',
  'Mastery Of Energy':
    'Section=combat Note="+4 undead turning checks and damage"',
  'Mastery Of Shaping':'Section=magic Note="Create holes in spell effect area"',
  'Metamagic Feat':'Section=feature Note="+1 General Feat (Metamagic)"',
  'Mobile Defense':
    'Section=combat Note="Allowed 5\' step during Defensive Stance"',
  'More Newfound Arcana':'Section=magic Note="Bonus level 2 spell"',
  'Natural Armor':'Section=combat Note="+%V AC"',
  'Newfound Arcana':'Section=magic Note="Bonus level 1 spell"',
  'Phase Arrow':
    'Section=combat Note="Arrow passes through normal obstacles 1/dy"',
  'Planar Cohort':
    'Section=magic Note="Summoned creature serves as loyal assistant"',
  'Poison Save Bonus':'Section=save Note="+%{levels.Assassin//2} vs. poison"',
  'Poison Use':
    'Section=feature Note="No chance of self-poisoning when applying to blade"',
  'Power Of Nature':
    'Section=feature Note="Transfer druid feature to another for 1-7 days"',
  'Precise Strike':
    'Section=combat ' +
    'Note="+%{levels.Duelist//5}d6 HP damage with light or one-handed piercing weapon"',
  'Ranged Legerdemain':
    'Section=combat ' +
    'Note="R30\' Disable Device, Open Lock, Sleight Of Hand at +5 DC %V/dy"',
  'Secrets':'Section=feature Note="%V selections"',
  'Secret Health':'Section=combat Note="+3 HP"',
  'Secret Knowledge Of Avoidance':'Section=save Note="+2 Reflex"',
  'Secrets Of Inner Strength':'Section=save Note="+2 Will"',
  'Seeker Arrow':'Section=combat Note="Arrow maneuvers to target 1/dy"',
  'Shadow Illusion':
    'Section=magic ' +
    'Note="R%{levels.Shadowdancer*40+400}\' %{levels.Shadowdancer*10+40}\' cu image (DC %{11+charismaModifier} Will disbelieve) for conc 1/dy"',
  'Shadow Jump':'Section=magic Note="Teleport between shadows %V\'/dy"',
  'Smite Good':'Section=combat Note="+%V attack/+%1 damage vs. good foe %2/dy"',
  'Spell Power':'Section=magic Note="+1 caster level for spell effects"',
  'Spell-Like Ability':
    'Section=magic Note="Allows using spell as ability 2+/dy"',
  'Strength Boost':'Section=ability Note="+%V Strength"',
  'Summon Shadow':
    'Section=magic Note="Summon unturnable %{levels.Shadowdancer//3*2+1} HD Shadow companion"',
  'Terrain Mastery (Aligned)':
    'Section=feature Note="Mimic dominant alignment of any plane"',
  'Terrain Mastery (Aquatic)':
    'Section=ability,combat,skill ' +
    'Note="+10 swim Speed",' +
         '"+1 attack and damage vs. aquatic creatures",' +
         '"+4 Swim"',
  'Terrain Mastery (Cavernous)':'Section=feature Note="Tremorsense"',
  'Terrain Mastery (Cold)':
    'Section=combat,save ' +
    'Note="+1 attack and damage vs. cold elementals and outsiders",' +
         '"Resistance 20 to cold"',
  'Terrain Mastery (Desert)':
    'Section=combat,save ' +
     'Note="+1 attack and damage vs. desert creatures",' +
          '"Immune fatigue, resist exhaustion"',
  'Terrain Mastery (Fiery)':
    'Section=combat,save ' +
    'Note="+1 attack and damage vs. fire elementals and fire outsiders",' +
         '"Resistance 20 to fire"',
  'Terrain Mastery (Forest)':
    'Section=combat,skill ' +
    'Note="+1 attack and damage vs. forest creatures",' +
         '"+4 Hide"',
  'Terrain Mastery (Hills)':
    'Section=combat,skill ' +
    'Note="+1 attack and damage vs. hill creatures",' +
         '"+4 Listen"',
  'Terrain Mastery (Marsh)':
    'Section=combat,skill ' +
    'Note="+1 attack and damage vs. marsh creatures",' +
         '"+4 Move Silently"',
  'Terrain Mastery (Mountains)':
    'Section=ability,combat,skill ' +
    'Note="+10 climb Speed","+1 attack and damage vs. mountain creatures",' +
         '"+4 Climb"',
  'Terrain Mastery (Plains)':
    'Section=combat,skill ' +
    'Note="+1 attack and damage vs. plain creatures",' +
         '"+4 Spot"',
  'Terrain Mastery (Shifting)':
    'Section=combat,magic ' +
    'Note="+1 attack and damage vs. shifting plane elementals and outsiders",' +
         '"<i>Dimension Door</i> every 1d4 rd"',
  'Terrain Mastery (Underground)':
    'Section=combat,feature ' +
    'Note="+1 attack and damage vs. underground creatures",' +
         '"+60\' Darkvision"',
  'Terrain Mastery (Weightless)':
     'Section=ability,combat ' +
    'Note="+30\' fly speed on planes lacking gravity",' +
         '"+1 attack and damage vs. astral, elemental air, and ethereal creatures"',
  'The Lore Of True Stamina':'Section=save Note="+2 Fortitude"',
  'Tremorsense':
    'Section=feature Note="R30\' Detect creatures in contact w/ground"',
  'True Lore':
    'Section=magic Note="<i>Legend Lore</i> or <i>Analyze Dweomer</i> 1/dy"',
  'Undead Companion':
    'Section=feature ' +
    'Note="Unturnable undead servant w/fiendish servant abilities"',
  'Weapon Trick':'Section=combat Note="+1 Melee Attack/+1 Ranged Attack"',
  'Wings':'Section=ability Note="%{speed} Fly speed"'
};
SRD35.GOODIES = {
  'Armor':
    'Pattern="([-+]\\d).*(?:armor(?:\\s+class)?|AC)|(?:armor(?:\\s+class)?|AC)\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=armorClass ' +
    'Section=combat Note="%V Armor Class"',
  'Charisma':
    'Pattern="([-+]\\d)\\s+cha(?:risma)?|cha(?:risma)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=charisma ' +
    'Section=ability Note="%V Charisma"',
  'Constitution':
    'Pattern="([-+]\\d)\\s+con(?:stitution)?|con(?:stitution)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=constitution ' +
    'Section=ability Note="%V Constitution"',
  'Dexterity':
    'Pattern="([-+]\\d)\\s+dex(?:terity)?|dex(?:terity)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=dexterity ' +
    'Section=ability Note="%V Dexterity"',
  'Fighter Feat Count':
    'Pattern="([-+]\\d)\\s+fighter\\s+feat|fighter\\s+feat\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=featCount.Fighter ' +
    'Section=feature Note="%V Fighter Feat"',
  'Fortitude':
    'Pattern="([-+]\\d)\\s+fortitude\\s+save|fortitude\\s+save\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=save.Fortitude ' +
    'Section=save Note="%V Fortitude"',
  'General Feat Count':
    'Pattern="([-+]\\d)\\s+general\\s+feat|general\\s+feat\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=featCount.General ' +
    'Section=feature Note="%V General Feat"',
  'Initiative':
    'Pattern="([-+]\\d)\\s+initiative|initiative\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=initiative ' +
    'Section=combat Note="%V Initiative"',
  'Intelligence':
    'Pattern="([-+]\\d)\\s+int(?:elligence)?|int(?:elligence)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=intelligence ' +
    'Section=ability Note="%V Intelligence"',
  'Masterwork Armor':
    'Pattern="masterwork.*\\s+armor|[-+]\\d.*armor|armor\\s+[-+]\\d" ' +
    'Effect=add ' +
    'Value=-1 ' +
    'Attribute=skillNotes.armorSkillCheckPenalty ' +
    'Section=skill Note="Reduce skill check penalty by 1"',
  'Masterwork Shield':
    'Pattern="masterwork.*\\s+shield|[-+]\\d.*shield|shield\\s+[-+]\\d" ' +
    'Effect=add ' +
    'Value=-1 ' +
    'Attribute=skillNotes.armorSkillCheckPenalty ' +
    'Section=skill Note="Reduce skill check penalty by 1"',
  'Protection':
    'Pattern="([-+]\\d).*protection|protection\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=armorClass ' +
    'Section=combat Note="%V Armor Class"',
  'Reflex':
    'Pattern="([-+]\\d)\\s+reflex\\s+save|reflex\\s+save\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=save.Reflex ' +
    'Section=save Note="%V Reflex"',
  'Shield':
    'Pattern="([-+]\\d).*\\s+shield|shield\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=armorClass ' +
    'Section=combat Note="%V Armor Class"',
  'Speed':
    'Pattern="([-+]\\d).*\\s+speed|speed\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=speed ' +
    'Section=ability Note="%V Speed"',
  'Strength':
    'Pattern="([-+]\\d)\\s+str(?:ength)?|str(?:ength)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=strength ' +
    'Section=ability Note="%V Strength"',
  'Will':
    'Pattern="([-+]\\d)\\s+will\\s+save|will\\s+save\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=save.Will ' +
    'Section=save Note="%V Will"',
  'Wisdom':
    'Pattern="([-+]\\d)\\s+wis(?:dom)?|wis(?:dom)?\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=wisdom ' +
    'Section=ability Note="%V Wisdom"',
  'Wizard Feat Count':
    'Pattern="([-+]\\d)\\s+wizard\\s+feat|wizard\\s+feat\\s+([-+]\\d)" ' +
    'Effect=add ' +
    'Value="$1 || $2" ' +
    'Attribute=featCount.Wizard ' +
    'Section=feature Note="%V Wizard Feat"'
};
SRD35.LANGUAGES = {
  'Abyssal':'',
  'Aquan':'',
  'Auran':'',
  'Celestial':'',
  'Common':'',
  'Draconic':'',
  'Druidic':'',
  'Dwarven':'',
  'Elven':'',
  'Giant':'',
  'Gnoll':'',
  'Gnome':'',
  'Goblin':'',
  'Halfling':'',
  'Ignan':'',
  'Infernal':'',
  'Orc':'',
  'Sylvan':'',
  'Terran':'',
  'Undercommon':''
};
SRD35.PATHS = {
  'Air Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Air Turning"',
  'Animal Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Animal Talk","1:Nature Knowledge"',
  'Chaos Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Empowered Chaos"',
  'Death Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Deadly Touch"',
  'Destruction Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '1:Smite',
  'Earth Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Earth Turning"',
  'Evil Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Empowered Evil"',
  'Fire Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Fire Turning"',
  'Good Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Empowered Good"',
  'Healing Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Empowered Healing"',
  'Knowledge Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '1:All-Knowing,"1:Empowered Knowledge"',
  'Law Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Empowered Law"',
  'Luck Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Good Fortune"',
  'Magic Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Arcane Adept"',
  'Plant Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Nature Knowledge","1:Plant Turning"',
  'Protection Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Protective Touch"',
  'Strength Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Strength Burst"',
  'Sun Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Destroy Undead"',
  'Travel Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Outdoors Knowledge",1:Unhindered',
  'Trickery Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Deceptive Knowledge"',
  'War Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Weapon Of War"',
  'Water Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Water Turning"'
};
SRD35.RACES = {
  'Dwarf':
    'Features=' +
      '"Dwarf Ability Adjustment",' +
      '"Weapon Familiarity (Dwarven Urgosh/Dwarven Waraxe)",' +
      'Darkvision,"Dodge Giants","Dwarf Enmity","Know Depth","Natural Smith",' +
      '"Resist Poison","Resist Spells",Slow,Stability,Steady,Stonecunning ' +
    'Languages=Common,Dwarven',
  'Elf':
    'Features=' +
      '"Elf Ability Adjustment",' +
      '"Weapon Proficiency (Composite Longbow/Composite Shortbow/Longsword/Rapier/Longbow/Shortbow)",' +
      '"Keen Senses","Low-Light Vision","Resist Enchantment",' +
      '"Sense Secret Doors","Sleep Immunity" ' +
    'Languages=Common,Elven',
  'Gnome':
    'Features=' +
      '"Gnome Ability Adjustment",' +
      '"Weapon Familiarity (Gnome Hooked Hammer)",' +
      '"Dodge Giants","Gnome Enmity","Keen Ears","Keen Nose",' +
      '"Low-Light Vision","Natural Illusionist","Resist Illusion",Slow,Small ' +
    'Languages=Common,Gnome ' +
    'SpellAbility=charisma ' +
    'SpellSlots=' +
      '"Gnomish0:1=3",' +
      '"Gnomish1:1=1"',
  'Half-Elf':
    'Features=' +
      '"Alert Senses","Elven Blood","Low-Light Vision","Resist Enchantment",' +
      '"Sleep Immunity",Tolerance ' +
    'Languages=Common,Elven',
  'Half-Orc':
    'Features=' +
       '"Half-Orc Ability Adjustment",' +
       'Darkvision,"Orc Blood" ' +
    'Languages=Common,Orc',
  'Halfling':
    'Features=' +
      '"Halfling Ability Adjustment",' +
      'Accurate,Fortunate,"Keen Ears","Resist Fear",Slow,Small,Spry ' +
    'Languages=Common,Halfling',
  'Human':
    'Features=' +
      '"Human Feat Bonus","Human Skill Bonus" ' +
    'Languages=Common,any'
};
SRD35.SCHOOLS = {
  'Abjuration':'',
  'Conjuration':'',
  'Divination':'',
  'Enchantment':'',
  'Evocation':'',
  'Illusion':'',
  'Necromancy':'',
  'Transmutation':''
};
SRD35.SHIELDS = {
  'Buckler':'AC=1 Weight=1 Skill=1 Spell=5',
  'Heavy Steel':'AC=2 Weight=3 Skill=2 Spell=15',
  'Heavy Wooden':'AC=2 Weight=3 Skill=2 Spell=15',
  'Light Steel':'AC=1 Weight=1 Skill=1 Spell=5',
  'Light Wooden':'AC=1 Weight=1 Skill=1 Spell=5',
  'None':'AC=0 Weight=0 Skill=0 Spell=0',
  'Tower':'AC=4 Weight=4 Skill=10 Spell=50'
};
SRD35.SKILLS = {
  'Appraise':'Ability=intelligence Class=Bard,Rogue',
  'Balance':'Ability=dexterity Class=Bard,Monk,Rogue',
  'Bluff':
    'Ability=charisma Class=Bard,Rogue,Sorcerer ' +
    'Synergy=Diplomacy,"Disguise (acting)",Intimidate,"Sleight Of Hand"',
  'Climb':'Ability=strength Class=Barbarian,Bard,Fighter,Monk,Ranger,Rogue',
  'Concentration':
    'Ability=constitution ' +
    'Class=Bard,Cleric,Druid,Monk,Paladin,Ranger,Sorcerer,Wizard',
  'Craft (Alchemy)':
    'Ability=intelligence ' +
    'Class=Barbarian,Bard,Cleric,Druid,Fighter,Monk,Paladin,Ranger,Rogue,Sorcerer,Wizard ' +
    'Synergy="Appraise (related)"',
  'Craft (Armor)':
    'Ability=intelligence ' +
    'Class=Barbarian,Bard,Cleric,Druid,Fighter,Monk,Paladin,Ranger,Rogue,Sorcerer,Wizard ' +
    'Synergy="Appraise (related)"',
  'Craft (Bows)':
    'Ability=intelligence ' +
    'Class=Barbarian,Bard,Cleric,Druid,Fighter,Monk,Paladin,Ranger,Rogue,Sorcerer,Wizard ' +
    'Synergy="Appraise (related)"',
  'Craft (Traps)':
    'Ability=intelligence ' +
    'Class=Barbarian,Bard,Cleric,Druid,Fighter,Monk,Paladin,Ranger,Rogue,Sorcerer,Wizard ' +
    'Synergy="Appraise (related)"',
  'Craft (Weapons)':
    'Ability=intelligence ' +
    'Class=Barbarian,Bard,Cleric,Druid,Fighter,Monk,Paladin,Ranger,Rogue,Sorcerer,Wizard ' +
    'Synergy="Appraise (related)"',
  'Decipher Script':
    'Ability=intelligence Untrained=n ' +
    'Class=Bard,Rogue,Wizard Synergy="Use Magic Device (scrolls)"',
  'Diplomacy':'Ability=charisma Class=Bard,Cleric,Druid,Monk,Paladin,Rogue',
  'Disable Device':'Ability=intelligence Untrained=n Class=Rogue',
  'Disguise':'Ability=charisma Class=Bard,Rogue',
  'Escape Artist':
    'Ability=dexterity Class=Bard,Monk,Rogue Synergy="Use Rope (bindings)"',
  'Forgery':'Ability=intelligence Class=Rogue',
  'Gather Information':'Ability=charisma Class=Bard,Rogue',
  'Handle Animal':
    'Ability=charisma Class=Barbarian,Druid,Fighter,Paladin,Ranger '+
    'Untrained=n Synergy="Diplomacy (animals)",Ride',
  'Heal':'Ability=wisdom Class=Cleric,Druid,Paladin,Ranger',
  'Hide':'Ability=dexterity Class=Bard,Monk,Ranger,Rogue',
  'Intimidate':'Ability=charisma Class=Barbarian,Fighter,Rogue',
  'Jump':
    'Ability=strength Class=Barbarian,Bard,Fighter,Monk,Ranger,Rogue ' +
    'Synergy=Tumble',
  'Knowledge (Arcana)':
    'Ability=intelligence untrained=n ' +
    'Class=Bard,Cleric,Monk,Sorcerer,Wizard Synergy=Spellcraft',
  'Knowledge (Dungeoneering)':
    'Ability=intelligence untrained=n ' +
    'Class=Bard,Ranger,Wizard Synergy="Survival (underground)"',
  'Knowledge (Engineering)':
    'Ability=intelligence untrained=n ' +
    'Class=Bard,Wizard Synergy="Search (secret doors)"',
  'Knowledge (Geography)':
    'Ability=intelligence untrained=n ' +
    'Class=Bard,Ranger,Wizard Synergy="Survival (lost and hazards)"',
  'Knowledge (History)':
    'Ability=intelligence untrained=n ' +
    'Class=Bard,Cleric,Wizard Synergy="Bardic knowledge"',
  'Knowledge (Local)':
    'Ability=intelligence untrained=n ' +
    'Class=Bard,Rogue,Wizard Synergy="Gather Information"',
  'Knowledge (Nature)':
    'Ability=intelligence untrained=n ' +
    'Class=Bard,Druid,Ranger,Wizard Synergy="Survival (outdoors)"',
  'Knowledge (Nobility)':
    'Ability=intelligence untrained=n ' +
    'Class=Bard,Paladin,Wizard Synergy=Diplomacy',
  'Knowledge (Planes)':
    'Ability=intelligence untrained=n ' +
    'Class=Bard,Cleric,Wizard Synergy="Survival (other planes)"',
  'Knowledge (Religion)':
    'Ability=intelligence untrained=n ' +
    'Class=Bard,Cleric,Monk,Paladin,Wizard Synergy="Undead turning check"',
  'Listen':'Ability=wisdom Class=Barbarian,Bard,Druid,Monk,Ranger,Rogue',
  'Move Silently':'Ability=dexterity Class=Bard,Monk,Ranger,Rogue',
  'Open Lock':'Ability=dexterity Untrained=n Class=Rogue',
  'Perform (Act)':'Ability=charisma Class=Bard,Monk,Rogue',
  'Perform (Comedy)':'Ability=charisma Class=Bard,Monk,Rogue',
  'Perform (Dance)':'Ability=charisma Class=Bard,Monk,Rogue',
  'Perform (Keyboard)':'Ability=charisma Class=Bard,Monk,Rogue',
  'Perform (Oratory)':'Ability=charisma Class=Bard,Monk,Rogue',
  'Perform (Percussion)':'Ability=charisma Class=Bard,Monk,Rogue',
  'Perform (Sing)':'Ability=charisma Class=Bard,Monk,Rogue',
  'Perform (String)':'Ability=charisma Class=Bard,Monk,Rogue',
  'Perform (Wind)':'Ability=charisma Class=Bard,Monk,Rogue',
  'Profession (Tanner)':
    'Ability=wisdom Untrained=n ' +
    'Class=Bard,Cleric,Druid,Monk,Paladin,Ranger,Rogue,Sorcerer,Wizard',
  'Ride':'Ability=dexterity Class=Barbarian,Druid,Fighter,Paladin,Ranger',
  'Search':
    'Ability=intelligence Class=Ranger,Rogue Synergy="Survival (tracking)"',
  'Sense Motive':
    'Ability=wisdom Class=Bard,Monk,Paladin,Rogue Synergy=Diplomacy',
  'Sleight Of Hand':'Ability=dexterity Untrained=n Class=Bard,Rogue',
  'Speak Language':'Untrained=n Class=Bard',
  'Spellcraft':
    'Ability=intelligence Untrained=n Class=Bard,Cleric,Druid,Sorcerer,Wizard '+
    'Synergy="Use Magic Device (scroll)"',
  'Spot':'Ability=wisdom Class=Druid,Monk,Ranger,Rogue',
  'Survival':
    'Ability=wisdom Class=Barbarian,Druid,Ranger Synergy="Knowledge (Nature)"',
  'Swim':
    'Ability=strength Class=Barbarian,Bard,Druid,Fighter,Monk,Ranger,Rogue',
  'Tumble':
    'Ability=dexterity Untrained=n Class=Bard,Monk,Rogue Synergy=Balance,Jump',
  'Use Magic Device':
    'Ability=charisma Untrained=n Class=Bard,Rogue ' +
    'Synergy="Spellcraft (scroll)"',
  'Use Rope':
    'Ability=dexterity Class=Ranger,Rogue ' +
    'Synergy="Climb (rope)","Escape Artist (rope)"'
};
SRD35.SPELLS = {

  'Acid Arrow':
    'School=Conjuration ' +
    'Level=W2 ' +
    'Description="R$RL\' Ranged touch inflicts 2d4 HP/rd for $Ldiv3plus1 rd"',
  'Acid Fog':
    'School=Conjuration ' +
    'Level=W6,Water7 ' +
    'Description="R$RM\' Fog in 20\' radius obscures vision, slows to 5\'/rd, imposes -2 attack and damage, and inflicts 2d6 HP/rd while moving away 10\'/rd for $L rd"',
  'Acid Splash':
    'School=Conjuration ' +
    'Level=W0 ' +
    'Description="R$RS\' Ranged touch inflicts 1d3 HP"',
  'Aid':
    'School=Enchantment ' +
    'Level=Adept2,C2,Good2,Luck2 ' +
    'Description="Touched gains +1 attack and fear saves and 1d8+$Lmin10 temporary HP for $L min"',
  'Air Walk':
    'School=Transmutation ' +
    'Level=Air4,C4,D4 ' +
    'Description="Touched walks on air for $L10 min"',
  'Alarm':
    'School=Abjuration ' +
    'Level=B1,R1,W1 ' +
    'Description="R$RS\' Entry into 20\' radius triggers audible or mental alarm for $L2 hr"',
  'Align Weapon':
    'School=Transmutation ' +
    'Level=C2 ' +
    'Description="Touched weapon gains alignment for $L min (Will neg)"',
  'Alter Self':
    'School=Transmutation ' +
    'Level=Assassin2,B2,W2 ' +
    'Description="Self becomes creature w/in 1 size category w/up to $Lmin5 HD for $L10 min"',
  'Analyze Dweomer':
    'School=Divination ' +
    'Level=B6,W6 ' +
    'Description="R$RS\' Targets reveal magical aspects for $L rd (Will neg)"',
  'Animal Growth':
    'School=Transmutation ' +
    'Level=D5,R4,W5 ' +
    'Description="R$RM\' $Ldiv2 animal targets in 15\' radius dbl size (+8 Strength, +4 Constitution, +2 AC, DR 10/magic, +4 saves, -2 Dexterity) for $L min (Fort neg)"',
  'Animal Messenger':
    'School=Enchantment ' +
    'Level=B2,D2,R1 ' +
    'Description="R$RS\' Tiny animal target goes to specified place for $L dy"',
  'Animal Shapes':
    'School=Transmutation ' +
    'Level=Animal7,D8 ' +
    'Description="R$RS\' $L willing targets in 15\' radius become chosen animal w/up to $L HD for $L hr"',
  'Animal Trance':
    'School=Enchantment ' +
    'Level=Adept2,B2,D2 ' +
    'Description="R$RS\' 2d6 HD of animals fascinated for conc (Will neg)"',
  'Animate Dead':
    'School=Necromancy ' +
    'Level=Adept3,C3,Death3,W4 ' +
    'Description="Touched corpses become up to $L2 HD of skeletons or zombies, obey self"',
  'Animate Objects':
    'School=Transmutation ' +
    'Level=B6,C6,Chaos6 ' +
    'Description="R$RM\' $L small objects attack foes for $L rd"',
  'Animate Plants':
    'School=Transmutation ' +
    'Level=D7,Plant7 ' +
    'Description="R$RS\' $Ldiv3 plants attack foes for $L rd or entwine for $L hr"',
  'Animate Rope':
    'School=Transmutation ' +
    'Level=B1,W1 ' +
    'Description="R$RM\' $L5plus50\' rope obeys self for $L rd"',
  'Antilife Shell':
    'School=Abjuration ' +
    'Level=Animal6,C6,D6 ' +
    'Description="10\' radius bars living for $L10 min"',
  'Antimagic Field':
    'School=Abjuration ' +
    'Level=C8,Magic6,Protection6,W6 ' +
    'Description="10\' radius suppresses magic for $L10 min"',
  'Antipathy':
    'School=Enchantment ' +
    'Level=D9,W8 ' +
    'Description="R$RS\' Named creature kind or alignment avoids $L 10\' cu for $L2 hr (Will -4 dex)"',
  'Antiplant Shell':
    'School=Abjuration ' +
    'Level=D4 ' +
    'Description="10\' radius bars animate plants for $L10 min"',
  'Arcane Eye':
    'School=Divination ' +
    'Level=W4 ' +
    'Description="Invisible remote eye moves 30\'/rd for $L min"',
  'Arcane Lock':
    'School=Abjuration ' +
    'Level=W2 ' +
    'Description="Magical lock on touched door, portal, or chest imposes +10 DC to open"',
  'Arcane Mark':
    // 'School=Universal ' +
    'Level=W0 ' +
    'Description="Permanent personal rune inscribed on touched"',
  'Arcane Sight':
    'School=Divination ' +
    'Level=W3 ' +
    'Description="R120\' Self sees auras and spell abilities for $L min, DC 15+level Spellcraft to know school"',
  'Greater Arcane Sight':
    'School=Divination ' +
    'Level=W7 ' +
    'Description="R120\' Self sees auras and spell abilities and knows spells for $L min"',
  'Astral Projection':
    'School=Necromancy ' +
    'Level=C9,Travel9,W9 ' +
    'Description="Projects self and $Ldiv2 others to Astral Plane"',
  'Atonement':
    'School=Abjuration ' +
    'Level=C5,D5 ' +
    'Description="Touched recovers alignment and holy powers"',
  'Augury':
    'School=Divination ' +
    'Level=C2 ' +
    'Description="Self has $Lplus70min90% chance to learn weal or woe outcome of act up to 30 min in the future"',
  'Awaken':
    'School=Transmutation ' +
    'Level=D5 ' +
    'Description="Touched animal or tree gains human sentience (Will neg)"',

  'Baleful Polymorph':
    'School=Transmutation ' +
    'Level=Adept5,D5,W5 ' +
    'Description="R$RS\' Target becomes 1 HD creature (Fort neg)"',
  'Bane':
    'School=Enchantment ' +
    'Level=C1 ' +
    'Description="Foes in 50\' radius suffer -1 attack and fear saves for $L min (Will neg)"',
  'Banishment':
    'School=Abjuration ' +
    'Level=C6,W7 ' +
    'Description="R$RS\' $L2 HD extraplanar creatures in 15\' radius banished from plane (Will neg)"',
  'Barkskin':
    'School=Transmutation ' +
    'Level=D2,Plant2,R2 ' +
    'Description="Touched gains +$Lplus3div3min5 natural armor for $L10 min"',
  "Bear's Endurance":
    'School=Transmutation ' +
    'Level=Adept2,C2,D2,R2,W2 ' +
    'Description="Touched gains +4 Constitution for $L min"',
  "Mass Bear's Endurance":
    'School=Transmutation ' +
    'Level=C6,D6,W6 ' +
    'Description="R$RS\' $L targets in 15\' radius gain +4 Constitution for $L min"',
  'Bestow Curse':
    'School=Necromancy ' +
    'Level=Adept3,C3,W4 ' +
    'Description="Touched permanently suffers self choice of -6 ability, -4 attack, saves, and checks, or 50% chance/rd of losing action (Will neg)"',
  'Binding':
    'School=Enchantment ' +
    'Level=W8 ' +
    'Description="R$RS\' Target magically imprisoned (Will neg for $Ldiv2 HD or more)"',
  'Black Tentacles':
    'School=Conjuration ' +
    'Level=W4 ' +
    'Description="R$RM\' Tentacles in 20\' radius grapple (attack +$L, Strength 19) and inflict 1d6+4 HP/rd for $L rd"',
  'Blade Barrier':
    'School=Evocation ' +
    'Level=C6,Good6,War6 ' +
    'Description="R$RM\' $L20\' blade wall inflicts ${Lmin15}d6 HP/rd (Ref half) for $L min"',
  'Blasphemy':
    'School=Evocation ' +
    'Level=C7,Evil7 ' +
    'Description="Nonevil creatures in 40\' radius with equal/-1/-5/-10 HD dazed for 1 rd/suffer -2d6 Strength for 2d4 rd/paralyzed for 1d10 min/killed and banished (Will -4 neg)"',
  'Bless':
    'School=Enchantment ' +
    'Level=Adept1,C1,P1 ' +
    'Description="Allies in 50\' radius gain +1 attack and fear saves for $L min"',
  'Bless Water':
    'School=Transmutation ' +
    'Level=C1,P1 ' +
    'Description="Makes touched 1 pint of water holy (Will neg)"',
  'Bless Weapon':
    'School=Transmutation ' +
    'Level=P1 ' +
    'Description="Touched weapon becomes good aligned and magic, crit vs. evil foes confirmed for $L min"',
  'Blight':
    'School=Necromancy ' +
    'Level=D4,W5 ' +
    'Description="Touched plant suffers ${Lmin15}d6 HP (Fort half)"',
  'Blindness/Deafness':
    'School=Necromancy ' +
    'Level=B2,C3,W2 ' +
    'Description="R$RM\' Target permanently self choice of blind or deaf (Fort neg)"',
  'Blink':
    'School=Transmutation ' +
    'Level=B3,W3 ' +
    'Description="Self becomes ethereal randomly (half damage from area attacks and falling, foes have 50% miss chance) for $L rd"',
  'Blur':
    'School=Illusion ' +
    'Level=B2,W2 ' +
    'Description="Foes attacking touched have 20% miss chance for $L min"',
  'Break Enchantment':
    'School=Abjuration ' +
    'Level=Adept5,B4,C5,Luck5,P4,W5 ' +
    'Description="R$RS\' Self makes +$Lmin15 check to free $L targets in 15\' radius from enchantments, transmutations, and curses"',
  "Bull's Strength":
    'School=Transmutation ' +
    'Level=Adept2,Blackguard2,C2,D2,P2,Strength2,W2 ' +
    'Description="Touched gains +4 Strength for $L min"',
  "Mass Bull's Strength":
    'School=Transmutation ' +
    'Level=C6,D6,W6 ' +
    'Description="R$RS\' $L targets in 15\' radius gain +4 Strength for $L min"',
  'Burning Hands':
    'School=Evocation ' +
    'Level=Adept1,Fire1,W1 ' +
    'Description="R15\' Cone inflicts ${Lmin5}d4 HP (Ref half)"',

  'Call Lightning':
    'School=Evocation ' +
    'Level=D3 ' +
    'Description="R$RM\' 1 bolt/rd inflicts 3d6 HP (Ref half) for $L min or $Lmin10 bolts"',
  'Call Lightning Storm':
    'School=Evocation ' +
    'Level=D5 ' +
    'Description="R$RL\' 1 bolt/rd inflicts 5d6 HP (Ref half) for $L min or $Lmin15 bolts"',
  'Calm Animals':
    'School=Enchantment ' +
    'Level=Animal1,D1,R1 ' +
    'Description="R$RS\' 2d4+$L HD of animals in 15\' radius become docile for $L min (Will neg)"',
  'Calm Emotions':
    'School=Enchantment ' +
    'Level=B2,C2,Law2 ' +
    'Description="R$RM\' Creatures in 20\' radius pacified for conc or $L rd (Will neg)"',
  "Cat's Grace":
    'School=Transmutation ' +
    'Level=Adept2,Assassin2,B2,D2,R2,W2 ' +
    'Description="Touched gains +4 Dexterity for $L min"',
  "Mass Cat's Grace":
    'School=Transmutation ' +
    'Level=B6,D6,W6 ' +
    'Description="R$RS\' $L targets in 15\' radius gain +4 Dexterity for $L min"',
  'Cause Fear':
    'School=Necromancy ' +
    'Level=Adept1,B1,Blackguard1,C1,Death1,W1 ' +
    'Description="R$RS\' Target w/up to 5 HD flees for 1d4 rd (Will shaken for 1 rd)"',
  'Chain Lightning':
    'School=Evocation ' +
    'Level=Air6,W6 ' +
    'Description="R$RL\' Bolt inflicts ${Lmin20}d6 HP to primary target, half HP to $Lmin20 secondary targets in 30\' radius (Ref half)"',
  'Changestaff':
    'School=Transmutation ' +
    'Level=D7 ' +
    'Description="Touched staff becomes treant-like creature for $L hr"',
  'Chaos Hammer':
    'School=Evocation ' +
    'Level=Chaos4 ' +
    'Description="R$RM\' Lawful creatures in 20\' radius suffer ${Ldiv2min5}d8 HP and are slowed (-2 AC, attack, damage, and Reflex) for 1d6 rd, neutral half (Will half)"',
  'Charm Animal':
    'School=Enchantment ' +
    'Level=D1,R1 ' +
    'Description="R$RS\' Target treats self as trusted friend for $L hr (Will neg)"',
  'Charm Monster':
    'School=Enchantment ' +
    'Level=B3,W4 ' +
    'Description="R$RS\' Target treats self as trusted friend for $L dy (Will neg)"',
  'Mass Charm Monster':
    'School=Enchantment ' +
    'Level=B6,W8 ' +
    'Description="R$RS\' $L2 HD targets treat self as trusted friend for $L dy (Will neg)"',
  'Charm Person':
    'School=Enchantment ' +
    'Level=B1,W1 ' +
    'Description="R$RS\' Target treats self as trusted friend for $L hr (Will neg)"',
  'Chill Metal':
    'School=Transmutation ' +
    'Level=D2 ' +
    'Description="R$RS\' Metal on $Ldiv2 creatures in 15\' radius inflicts 0/1d4/2d4/2d4/2d4/1d4/0 HP for 7 rd (Will neg)"',
  'Chill Touch':
    'School=Necromancy ' +
    'Level=W1 ' +
    'Description="$L touched living suffer 1d6 HP and -1 Strength (Fort neg) or undead flee for 1d4+$L rd (Will neg)"',
  'Circle Of Death':
    'School=Necromancy ' +
    'Level=W6 ' +
    'Description="R$RM\' ${Lmin20}d4 HD of creatures w/up to 8 HD in 40\' radius slain (Fort neg)"',
  'Clairaudience/Clairvoyance':
    'School=Divination ' +
    'Level=Assassin4,B3,Knowledge3,W3 ' +
    'Description="$RL\' Self gains choice of remote sight or hearing for $L min"',
  'Clenched Fist':
    'School=Evocation ' +
    'Level=Strength8,W8 ' +
    'Description="R$RM\' 10\' hand (AC 20, %{hitPoints} HP) moves 60\'/rd, gives +4 AC, and performs +15 bull rush and +$Lplus11+mod melee attack that inflicts 1d8+11 HP and stuns for 1 rd (Fort neg) for $L rd"',
  'Cloak Of Chaos':
    'School=Abjuration ' +
    'Level=C8,Chaos8 ' +
    'Description="$L creatures in 20\' radius gain +4 AC and saves and SR 25 (lawful), suppress mental control, and cause 1 rd confusion in successful lawful attacker for $L rd (Will neg)"',
  'Clone':
    'School=Necromancy ' +
    'Level=W8 ' +
    'Description="Soul enters duplicate if original dies"',
  'Cloudkill':
    'School=Conjuration ' +
    'Level=W5 ' +
    'Description="R$RM\' 20\' cylinder moves away 10\'/rd; all within w/1-3 HD slain, w/4-6 HD slain (Fort suffer -1d4 Constitution), w/6+ HD suffer -1d4 Constitution (Fort half) for $L min"',
  'Color Spray':
    'School=Illusion ' +
    'Level=W1 ' +
    'Description="R15\' Cone renders creatures with 2/4/any HD unconscious for 2d4 rd/blind for 1d4 rd/stunned for 1 rd (Will neg)"',
  'Command':
    'School=Enchantment ' +
    'Level=Adept1,C1 ' +
    'Description="R$RS\' Target obeys self commands to approach, drop, fall, flee, or halt for 1 rd (Will neg)"',
  'Greater Command':
    'School=Enchantment ' +
    'Level=C5 ' +
    'Description="R$RS\' $L targets in 15\' radius obey self commands to approach, drop, fall, flee, or halt for $L rd (Will neg)"',
  'Command Plants':
    'School=Transmutation ' +
    'Level=D4,Plant4,R3 ' +
    'Description="R$RS\' $L2 HD plant creatures in 15\' radius obey self for $L dy (Will neg)"',
  'Command Undead':
    'School=Necromancy ' +
    'Level=W2 ' +
    'Description="R$RS\' Undead target obeys self for $L dy (Will neg)"',
  'Commune':
    'School=Divination ' +
    'Level=Adept5,C5 ' +
    'Description="Deity answers $L yes/no questions"',
  'Commune With Nature':
    'School=Divination ' +
    'Level=Animal5,D5,R4 ' +
    'Description="Self learns natural facts for $L mile radius outdoors, $L100\' radius underground"',
  'Comprehend Languages':
    'School=Divination ' +
    'Level=Adept1,B1,C1,W1 ' +
    'Description="Self understands all languages for $L10 min"',
  'Cone Of Cold':
    'School=Evocation ' +
    'Level=W5,Water6 ' +
    'Description="R60\' Cone inflicts ${Lmin15}d6 HP (Ref half)"',
  'Confusion':
    'School=Enchantment ' +
    'Level=B3,Trickery4,W4 ' +
    'Description="R$RM\' Creatures in 15\' radius randomly 10% attack caster/10% act normal/30% babble/20% flee/30% attack nearest for $L rd (Will neg)"',
  'Lesser Confusion':
    'School=Enchantment ' +
    'Level=B1 ' +
    'Description="R$RM\' Target randomly 10% attack caster/10% act normal/30% babble/20% flee/30% attack nearest for 1 rd (Will neg)"',
  'Consecrate':
    'School=Evocation ' +
    'Level=C2 ' +
    'Description="R$RS\' 20\' radius gives +3 turn undead, undead suffer -1 attack, damage, and saves for $L2 hr"',
  'Contact Other Plane':
    'School=Divination ' +
    'Level=W5 ' +
    'Description="Self asks $Ldiv2 questions of extraplanar entity"',
  'Contagion':
    'School=Necromancy ' +
    'Level=Adept3,Blackguard3,C3,D3,Destruction3,W4 ' +
    'Description="Touched contracts random disease (Fort neg)"',
  'Contingency':
    'School=Evocation ' +
    'Level=W6 ' +
    'Description="Sets trigger for level $Ldiv3min6 spell for $L dy"',
  'Continual Flame':
    'School=Evocation ' +
    'Level=Adept3,C3,W2 ' +
    'Description="Touched emits heatless torch flame permanently"',
  'Control Plants':
    'School=Transmutation ' +
    'Level=D8,Plant8 ' +
    'Description="R$RS\' $L2 HD plant creatures in 15\' radius obey self for $L min (Will neg)"',
  'Control Undead':
    'School=Necromancy ' +
    'Level=W7 ' +
    'Description="R$RS\' $L2 HD undead in 15\' radius obey self for $L min (Will neg)"',
  'Control Water':
    'School=Transmutation ' +
    'Level=C4,D4,W6,Water4 ' +
    'Description="R$RL\' Raises or lowers $L 10\'x10\'x2\' of water $L2\' for $L10 min"',
  'Control Weather':
    'School=Transmutation ' +
    'Level=Air7,C7,D7,W7 ' +
    'Description="Modifies seasonal weather in 2 mile radius for 4d12 hr"',
  'Control Winds':
    'School=Transmutation ' +
    'Level=Air5,D5 ' +
    'Description="R$L40\' Changes wind direction and speed $Ldiv3 levels in $L40\'x40\' cylinder for $L10 min"',
  'Corrupt Weapon':
    'School=Transmutation ' +
    'Level=Blackguard1 ' +
    'Description="Weapon evil aligned, +1 vs. good foe DR for $L min"',
  'Create Food And Water':
    'School=Conjuration ' +
    'Level=C3 ' +
    'Description="R$RS\' Creates daily food and water for $L3 humans or $L horses"',
  'Create Greater Undead':
    'School=Necromancy ' +
    'Level=C8,Death8,W8 ' +
    'Description="R$RS\' Creates ${\'shadow\'+(lvl>=16?\', wraith\':\'\')+(lvl>=18?\', spectre\':\'\')+(lvl>=20?\', devourer\':\'\')} from physical remains"',
  'Create Undead':
    'School=Necromancy ' +
    'Level=C6,Death6,Evil6,W6 ' +
    'Description="R$RS\' Creates ${\'ghoul\'+(lvl>=12?\', ghast\':\'\')+(lvl>=15?\', mummy\':\'\')+(lvl>=18?\', mohrg\':\'\')} from physical remains"',
  'Create Water':
    'School=Conjuration ' +
    'Level=Adept0,C0,D0,P1 ' +
    'Description="R$RS\' Creates $L2 gallons of pure water"',
  'Creeping Doom':
    'School=Conjuration ' +
    'Level=D7 ' +
    // NOTE: damage unspecified, using Pathfinder's 4d6
    'Description="R$RS\' $Ldiv2 centipede swarms inflict 4d6 HP, obey self for $L rd"',
  'Crushing Despair':
    'School=Enchantment ' +
    'Level=B3,W4 ' +
    'Description="R30\' Cone imposes -2 attack, damage, saves, and checks for $L min (Will neg)"',
  'Crushing Hand':
    'School=Evocation ' +
    'Level=Strength9,W9 ' +
    'Description="R$RM\' 10\' hand (AC 20, %{hitPoints} HP) moves 60\'/rd, gives +4 AC, and performs +18 bull rush and +$Lplus16+mod grapple that inflicts 2d6+12 HP for $L rd"',
  'Cure Critical Wounds':
    'School=Conjuration ' +
    'Level=Adept4,B4,Blackguard4,C4,D5,Healing4 ' +
    'Description="Touched heals (undead suffers) 4d8+$Lmin20 HP (Will half)"',
  'Mass Cure Critical Wounds':
    'School=Conjuration ' +
    'Level=C8,D9,Healing8 ' +
    'Description="R$RS\' $L targets in 15\' radius heal (undead suffer) 4d8+$Lmin40 HP (Will half)"',
  'Cure Light Wounds':
    'School=Conjuration ' +
    'Level=Adept1,B1,Blackguard1,C1,D1,Healing1,P1,R2 ' +
    'Description="Touched heals (undead suffers) 1d8+$Lmin5 HP (Will half)"',
  'Mass Cure Light Wounds':
    'School=Conjuration ' +
    'Level=B5,C5,D6,Healing5 ' +
    'Description="R$RS\' $L targets in 15\' radius heal (undead suffer) 1d8+$Lmin25 HP (Will half)"',
  'Cure Minor Wounds':
    'School=Conjuration ' +
    'Level=Adept0,C0,D0 ' +
    'Description="Touched heals (undead suffers) 1 HP (Will neg)"',
  'Cure Moderate Wounds':
    'School=Conjuration ' +
    'Level=Adept2,B2,Blackguard2,C2,D3,Healing2,P3,R3 ' +
    'Description="Touched heals (undead suffers) 2d8+$Lmin10 HP (Will half)"',
  'Mass Cure Moderate Wounds':
    'School=Conjuration ' +
    'Level=B6,C6,D7 ' +
    'Description="R$RS\' $L targets in 15\' radius heal (undead suffer) 2d8+$Lmin30 HP (Will half)"',
  'Cure Serious Wounds':
    'School=Conjuration ' +
    'Level=Adept3,B3,Blackguard3,C3,D4,Healing3,P4,R4 ' +
    'Description="Touched heals (undead suffers) 3d8+$Lmin15 HP (Will half)"',
  'Mass Cure Serious Wounds':
    'School=Conjuration ' +
    'Level=C7,D8 ' +
    'Description="R$RS\' $L targets in 15\' radius heal (undead suffers) 3d8+$Lmin35 HP (Will half)"',
  'Curse Water':
    'School=Necromancy ' +
    'Level=C1 ' +
    'Description="Makes touched 1 pint of water unholy (Will neg)"',

  'Dancing Lights':
    'School=Evocation ' +
    'Level=B0,Gnomish0,W0 ' +
    'Description="R$RM\' 4 torch lights in 10\' radius move 100\'/rd for 1 min"',
  'Darkness':
    'School=Evocation ' +
    'Level=Adept2,Assassin2,B2,Blackguard2,C2,W2 ' +
    'Description="Touched radiates dim light in 20\' radius for $L10 min"',
  'Darkvision':
    'School=Transmutation ' +
    'Level=R3,W2 ' +
    'Description="Touched sees 60\' in total darkness for $L hr"',
  'Daylight':
    'School=Evocation ' +
    'Level=Adept3,B3,C3,D3,P3,W3 ' +
    'Description="Touched radiates daylight in 60\' radius for $L10 min"',
  'Daze':
    'School=Enchantment ' +
    'Level=B0,W0 ' +
    'Description="R$RS\' Humanoid target w/up to 4 HD loses next action (Will neg)"',
  'Daze Monster':
    'School=Enchantment ' +
    'Level=B2,W2 ' +
    'Description="R$RM\' Target w/up to 6 HD loses next action (Will neg)"',
  'Death Knell':
    'School=Necromancy ' +
    'Level=Blackguard2,C2,Death2 ' +
    'Description="Touched w/negative HP dies, self gains 1d8 temporary HP, +2 Strength, and +1 caster level for 10*target HD min (Will neg)"',
  'Death Ward':
    'School=Necromancy ' +
    'Level=C4,D5,Death4,P4 ' +
    'Description="Touched becomes immune to death spells, death effects, energy drain, and negative energy effects for $L min"',
  'Deathwatch':
    'School=Necromancy ' +
    'Level=C1 ' +
    'Description="R30\' Cone reveals HP status of targets for $L10 min"',
  'Deep Slumber':
    'School=Enchantment ' +
    'Level=Assassin3,B3,W3 ' +
    'Description="R$RS\' 10 HD creatures in 10\' radius sleep for $L min (Will neg)"',
  'Deeper Darkness':
    'School=Evocation ' +
    'Level=Adept3,Assassin3,Blackguard3,C3 ' +
    'Description="Touched radiates dim light in 60\' radius for $L dy"',
  'Delay Poison':
    'School=Conjuration ' +
    'Level=Adept2,B2,C2,D2,P2,R1 ' +
    'Description="Touched gains immunity to poison for $L hr"',
  'Delayed Blast Fireball':
    'School=Evocation ' +
    'Level=W7 ' +
    'Description="R$RL\' Inflicts ${Lmin20}d6 HP (Ref half) in 20\' radius, may delay up to 5 rd"',
  'Demand':
    'School=Enchantment ' +
    'Level=W8 ' +
    'Description="Self sends 25-word message to target w/<i>Suggestion</i> (Will neg)"',
  'Desecrate':
    'School=Evocation ' +
    'Level=C2,Evil2 ' +
    'Description="R$RS\' 20\' radius imposes -3 turn undead, undead gain +1 attack, damage, saves, and 1 temporary HP/HD for $L2 hr"',
  'Destruction':
    'School=Necromancy ' +
    'Level=C7,Death7 ' +
    'Description="R$RS\' Target slain and consumed (Fort 10d6 HP)"',
  'Detect Animals Or Plants':
    'School=Divination ' +
    'Level=D1,R1 ' +
    'Description="R$RL\' Cone gives self info on animals and plants for conc or $L10 min"',
  'Detect Chaos':
    'School=Divination ' +
    'Level=Adept1,C1 ' +
    'Description="R60\' Cone gives self info on chaotic auras for conc or $L10 min"',
  'Detect Evil':
    'School=Divination ' +
    'Level=Adept1,C1 ' +
    'Description="R60\' Cone gives self info on evil auras for conc or $L10 min"',
  'Detect Good':
    'School=Divination ' +
    'Level=Adept1,Blackguard1,C1 ' +
    'Description="R60\' Cone gives self info on good auras for conc or $L10 min"',
  'Detect Law':
    'School=Divination ' +
    'Level=Adept1,C1 ' +
    'Description="R60\' Cone gives self info on lawful auras for conc or $L10 min"',
  'Detect Magic':
    'School=Divination ' +
    'Level=Adept0,B0,C0,D0,W0 ' +
    'Description="R60\' Cone gives self info on magical auras for conc or $L min"',
  'Detect Poison':
    'School=Divination ' +
    'Level=Assassin1,C0,D0,P1,R1,W0 ' +
    'Description="R$RS\' Self detects poison in target, DC 20 Wis or Alchemy check for type"',
  'Detect Scrying':
    'School=Divination ' +
    'Level=B4,W4 ' +
    'Description="R40\' Self detects scrying and makes opposed caster check to see source for 1 dy"',
  'Detect Secret Doors':
    'School=Divination ' +
    'Level=B1,Knowledge1,W1 ' +
    'Description="R60\' Cone gives self info on secret doors for conc or $L min"',
  'Detect Snares And Pits':
    'School=Divination ' +
    'Level=D1,R1 ' +
    'Description="R60\' Cone gives self info on traps for conc or $L10 min"',
  'Detect Thoughts':
    'School=Divination ' +
    'Level=B2,Knowledge2,W2 ' +
    'Description="R60\' Cone gives self info on thoughts for conc or $L min (Will neg)"',
  'Detect Undead':
    'School=Divination ' +
    'Level=C1,P1,W1 ' +
    'Description="R60\' Cone gives self info on undead auras for conc or $L min"',
  'Dictum':
    'School=Evocation ' +
    'Level=C7,Law7 ' +
    'Description="Nonlawful creatures in 40\' radius with equal/-1/-5/-10 HD deafened for 1d4 rd/slowed for 2d4 rd/staggered for 2d4 rd/paralyzed for 1d10 min/killed and banished (Will -4 neg)"',
  'Dimension Door':
    'School=Conjuration ' +
    'Level=Assassin4,B4,Travel4,W4 ' +
    'Description="Teleports self and touched object or $Ldiv3 willing creatures $RL\'"',
  'Dimensional Anchor':
    'School=Abjuration ' +
    'Level=C4,W4 ' +
    'Description="R$RM\' Ranged touch bars extradimensional travel for $L min"',
  'Dimensional Lock':
    'School=Abjuration ' +
    'Level=C8,W8 ' +
    'Description="R$RM\' Bars extradimensional travel in 20\' radius for $L dy"',
  'Diminish Plants':
    'School=Transmutation ' +
    'Level=D3,R3 ' +
    'Description="Prunes $RL\' or stunts growth 1/2 mile of normal plants"',
  'Discern Lies':
    'School=Divination ' +
    'Level=C4,P3 ' +
    'Description="R$RS\' Self detects lies from $L creatures in 15\' radius for conc or $L rd (Will neg)"',
  'Discern Location':
    'School=Divination ' +
    'Level=C8,Knowledge8,W8 ' +
    'Description="Self knows exact location of creature or object at any distance"',
  'Disguise Self':
    'School=Illusion ' +
    'Level=Assassin1,B1,Trickery1,W1 ' +
    'Description="Self changes appearance and gains +10 Disguise for $L10 min"',
  'Disintegrate':
    'School=Transmutation ' +
    'Level=Destruction7,W6 ' +
    'Description="R$RM\' Ranged touch inflicts ${L2min40}d6 HP (Fort 5d6), dusts if target slain"',
  'Dismissal':
    'School=Abjuration ' +
    'Level=C4,W5 ' +
    'Description="R$RS\' Returns target to native plane (Will + $L - target HD neg)"',
  'Dispel Chaos':
    'School=Abjuration ' +
    'Level=C5,Law5,P4 ' +
    'Description="Self gains +4 AC vs. chaotic and dismisses chaotic creature via touch (Will neg) or spell"',
  'Dispel Evil':
    'School=Abjuration ' +
    'Level=C5,Good5,P4 ' +
    'Description="Self gains +4 AC vs. evil and dismisses evil creature via touch (Will neg) or spell"',
  'Dispel Good':
    'School=Abjuration ' +
    'Level=C5,Evil5 ' +
    'Description="Self gains +4 AC vs. good and dismisses good creature via touch (Will neg) or spell"',
  'Dispel Law':
    'School=Abjuration ' +
    'Level=C5,Chaos5 ' +
    'Description="Self gains +4 AC vs. lawful and dismisses lawful creature via touch (Will neg) or spell"',
  'Dispel Magic':
    'School=Abjuration ' +
    'Level=B3,C3,D4,Magic3,P3,W3 ' +
    'Description="R$RM\' Self d20+$Lmin10 check vs. 11+caster level cancels spells or effects in 20\' radius"',
  'Greater Dispel Magic':
    'School=Abjuration ' +
    'Level=B5,C6,D6,W6 ' +
    'Description="R$RM\' Self d20+$Lmin20 check vs. 11+caster level cancels spells or effects in 20\' radius"',
  'Displacement':
    'School=Illusion ' +
    'Level=B3,W3 ' +
    'Description="Foes attacking touched suffer 50% miss chance for $L rd"',
  'Disrupt Undead':
    'School=Necromancy ' +
    'Level=W0 ' +
    'Description="R$RS\' Ranged touched on undead target inflicts 1d6 HP"',
  'Disrupting Weapon':
    'School=Transmutation ' +
    'Level=C5 ' +
    'Description="Hit w/touched weapon destroys undead up to $L HD for $L rd (Will neg)"',
  'Divination':
    'School=Divination ' +
    'Level=C4,Knowledge4 ' +
    'Description="Self has $Lplus70min90% chance to learn useful advice on act proposed up to 1 week in the future"',
  'Divine Favor':
    'School=Evocation ' +
    'Level=C1,P1 ' +
    'Description="Self gains +$Ldiv3min3max1 attack and damage for 1 min"',
  'Divine Power':
    'School=Evocation ' +
    'Level=C4,War4 ' +
    'Description="Self gains BAB $L, +6 Strength, and $L temporary HP for $L rd"',
  'Dominate Animal':
    'School=Enchantment ' +
    'Level=Animal3,D3 ' +
    'Description="R$RS\' Target animal obeys self thoughts for $L rd (Will neg)"',
  'Dominate Monster':
    'School=Enchantment ' +
    'Level=W9 ' +
    'Description="R$RS\' Target obeys self thoughts for $L dy (Will neg)"',
  'Dominate Person':
    'School=Enchantment ' +
    'Level=B4,W5 ' +
    'Description="R$RS\' Target humanoid obeys self thoughts for $L dy (Will neg)"',
  'Doom':
    'School=Necromancy ' +
    'Level=Blackguard1,C1 ' +
    'Description="R$RM\' Target becomes shaken (-2 attack, damage, saves, and checks) for $L min (Will neg)"',
  'Dream':
    'School=Illusion ' +
    'Level=B5,W5 ' +
    'Description="Touched sends message to sleeping target"',

  "Eagle's Splendor":
    'School=Transmutation ' +
    'Level=B2,Blackguard2,C2,P2,W2 ' +
    'Description="Touched gains +4 Charisma for $L min"',
  "Mass Eagle's Splendor":
    'School=Transmutation ' +
    'Level=B6,C6,W6 ' +
    'Description="R$RS\' $L targets in 15\' radius gain +4 Charisma for $L min"',
  'Earthquake':
    'School=Evocation ' +
    'Level=C8,D8,Destruction8,Earth7 ' +
    'Description="R$RL\' Intense tremor shakes 80\' radius for 1 rd"',
  'Elemental Swarm':
    'School=Conjuration ' +
    'Level=Air9,D9,Earth9,Fire9,Water9 ' +
    'Description="R$RM\' Summons 2d4 large, then 1d4 huge, then 1 greater  elementals for $L10 min"',
  'Endure Elements':
    'School=Abjuration ' +
    'Level=Adept1,C1,D1,P1,R1,Sun1,W1 ' +
    'Description="Touched comfortable between -50F and 140F for 1 dy"',
  'Energy Drain':
    'School=Necromancy ' +
    'Level=C9,W9 ' +
    'Description="R$RS\' Ranged touch inflicts 2d4 negative levels (Fort/level after 1 dy neg, permanent otherwise) (undead gains 2d4x5 HP for 1 hr)"',
  'Enervation':
    'School=Necromancy ' +
    'Level=W4 ' +
    'Description="R$RS\' Ranged touch inflicts 1d4 negative levels for $L hr (undead gains 1d4x5 HP for 1 hr)"',
  'Enlarge Person':
    'School=Transmutation ' +
    'Level=Strength1,W1 ' +
    'Description="R$RS\' Target humanoid dbl size (+2 Strength, -2 Dexterity, -1 attack, -1 AC) for $L min (Fort neg)"',
  'Mass Enlarge Person':
    'School=Transmutation ' +
    'Level=W4 ' +
    'Description="R$RS\' $L target humanoids in 15\' radius dbl size (+2 Strength, -2 Dexterity, -1 attack, -1 AC) for $L min (Fort neg)"',
  'Entangle':
    'School=Transmutation ' +
    'Level=D1,Plant1,R1 ' +
    'Description="R$RL\' Creatures in 40\' radius entangled for $L min (Ref half speed)"',
  'Enthrall':
    'School=Enchantment ' +
    'Level=B2,C2 ' +
    'Description="R$RM\' Listeners become captivated for conc or 1 hr (Will neg)"',
  'Entropic Shield':
    'School=Abjuration ' +
    'Level=C1,Luck1 ' +
    'Description="Ranged attacks on self suffer 20% miss for $L min"',
  'Erase':
    'School=Transmutation ' +
    'Level=B1,W1 ' +
    'Description="R$RS\' Two pages of writing vanish (magical writing DC 15 caster check)"',
  'Ethereal Jaunt':
    'School=Transmutation ' +
    'Level=C7,W7 ' +
    'Description="Self becomes ethereal for $L rd"',
  'Etherealness':
    'School=Transmutation ' +
    'Level=C9,W9 ' +
    'Description="Self and $Ldiv3 others become ethereal for $L min"',
  'Expeditious Retreat':
    'School=Transmutation ' +
    'Level=B1,W1 ' +
    'Description="Self gains +30\' Speed for $L min"',
  'Explosive Runes':
    'School=Abjuration ' +
    'Level=W3 ' +
    'Description="Runes inflict 6d6 HP in 10\' radius when read (Ref half, adjacent no save)"',
  'Eyebite':
    'School=Necromancy ' +
    'Level=B6,W6 ' +
    'Description="R$RS\' Renders 1 target/rd with 1/5/10 HD comatose $L10 min/panicked for 1d4 rd and shaken for $L10 min/sickened for $L10 min for $Ldiv3 rd (Fort neg)"',

  'Fabricate':
    'School=Transmutation ' +
    'Level=W5 ' +
    'Description="R$RS\' Creates $L10\' cu ($L\' cu mineral) of finished items from raw materials"',
  'Faerie Fire':
    'School=Evocation ' +
    'Level=D1 ' +
    'Description="R$RL\' Creatures in 5\' radius glow for $L min"',
  'False Life':
    'School=Necromancy ' +
    'Level=Assassin3,W2 ' +
    'Description="Self gains 1d10+$Lmin10 temporary HP for $L hr"',
  'False Vision':
    'School=Illusion ' +
    'Level=B5,Trickery5,W5 ' +
    'Description="Scrying of touched 40\' radius shows illusion for $L hr"',
  'Fear':
    'School=Necromancy ' +
    'Level=B3,W4 ' +
    'Description="R30\' Cone causes creatures to flee for $L rd (Will shaken for 1 rd)"',
  'Feather Fall':
    'School=Transmutation ' +
    'Level=Assassin1,B1,W1 ' +
    'Description="R$RS\' $L targets in 10\' radius fall 60\'/rd for $L rd (Will neg)"',
  'Feeblemind':
    'School=Enchantment ' +
    'Level=W5 ' +
    'Description="R$RM\' Target Intelligence and Charisma permanently drop to 1 (Will (arcane at -4) neg)"',
  'Find The Path':
    'School=Divination ' +
    'Level=B6,C6,D6,Knowledge6,Travel6 ' +
    'Description="Touched knows most direct route to location for $L10 min"',
  'Find Traps':
    'School=Divination ' +
    'Level=C2 ' +
    'Description="Self gains +$Ldiv2min10 Search to uncover traps for $L min"',
  'Finger Of Death':
    'School=Necromancy ' +
    'Level=D8,W7 ' +
    'Description="R$RS\' Target slain (Fort suffers 3d6+$L HP)"',
  'Fire Seeds':
    'School=Conjuration ' +
    'Level=D6,Fire6,Sun6 ' +
    'Description="Touched 4 acorn grenades inflict ${Lmin20}d6 total or 8 berry bombs detonate on command to inflict 1d8+$L in 5\' radius (Ref half) for $L10 min"',
  'Fire Shield':
    'School=Evocation ' +
    'Level=Fire5,Sun4,W4 ' +
    'Description="Cold or hot flames enveloping self inflict 1d6+$Lmin15 HP upon foe hit, reduce heat or cold damage by half (Ref no HP) for $L rd"',
  'Fire Storm':
    'School=Evocation ' +
    'Level=C8,D7,Fire7 ' +
    'Description="R$RM\' $L2 10\' cu inflicts ${Lmin20}d6 HP (Ref half)"',
  'Fire Trap':
    'School=Abjuration ' +
    'Level=D2,W4 ' +
    'Description="Touched object inflicts 1d4+$Lmin20 HP (Ref half) in 5\' radius when opened"',
  'Fireball':
    'School=Evocation ' +
    'Level=W3 ' +
    'Description="R$RL\' Inflicts ${Lmin10}d6 HP (Ref half) in 20\' radius"',
  'Flame Arrow':
    'School=Transmutation ' +
    'Level=W3 ' +
    'Description="R$RS\' 50 projectiles inflict +1d6 HP for $L10 min"',
  'Flame Blade':
    'School=Evocation ' +
    'Level=D2 ' +
    'Description="Fire melee weapon inflicts 1d8+$Ldiv2min10 HP for $L min"',
  'Flame Strike':
    'School=Evocation ' +
    'Level=C5,D4,Sun5,War5 ' +
    'Description="R$RM\' 10\' radius x 40\' high inflicts ${Lmin15}d6 HP (Ref half)"',
  'Flaming Sphere':
    'School=Evocation ' +
    'Level=D2,W2 ' +
    'Description="R$RM\' 5\' diameter sphere inflicts 2d6 HP (Ref neg), jumps or moves 30\'/rd for $L rd"',
  'Flare':
    'School=Evocation ' +
    'Level=B0,D0,W0 ' +
    'Description="R$RS\' Target dazzled for 1 min (Fort neg)"',
  'Flesh To Stone':
    'School=Transmutation ' +
    'Level=W6 ' +
    'Description="R$RM\' Target becomes statue (Fort neg)"',
  'Floating Disk':
    'School=Evocation ' +
    'Level=W1 ' +
    'Description="R$RS\' 3\'-diameter x 1 inch thick force disk follows, holds $L100 lbs at 3\' for $L hr"',
  'Fly':
    'School=Transmutation ' +
    'Level=Travel3,W3 ' +
    'Description="Touched gains 60\' fly speed for $L min"',
  'Fog Cloud':
    'School=Conjuration ' +
    'Level=D2,W2,Water2 ' +
    'Description="R$RM\' Fog in 20\' radius obscures vision for $L10 min"',
  'Forbiddance':
    'School=Abjuration ' +
    'Level=C6 ' +
    'Description="R$RM\' $L 60\' cu bars planar travel, inflicts 6d6 HP or 12d6 HP on transit if alignment differs in 1 or 2 dimensions"',
  'Forcecage':
    'School=Evocation ' +
    'Level=W7 ' +
    'Description="R$RS\' Traps targets in 20\' cage or 10\' cube for $L2 hr"',
  'Forceful Hand':
    'School=Evocation ' +
    'Level=W6 ' +
    'Description="R$RM\' 10\' hand (AC 20, %{hitPoints} HP) moves 60\'/rd, gives +4 AC, and performs +14 bull rush for $L rd"',
  'Foresight':
    'School=Divination ' +
    'Level=D9,Knowledge9,W9 ' +
    'Description="Self gains +2 AC and Reflex and never surprised or flat-footed for $L10 min"',
  "Fox's Cunning":
    'School=Transmutation ' +
    'Level=Assassin2,B2,W2 ' +
    'Description="Touched gains +4 Intelligence for $L min"',
  "Mass Fox's Cunning":
    'School=Transmutation ' +
    'Level=B6,W6 ' +
    'Description="R$RS\' $L targets in 15\' radius gain +4 Intelligence for $L min"',
  'Freedom':
    'School=Abjuration ' +
    'Level=W9 ' +
    'Description="R$RS\' Target released from movement restrictions"',
  'Freedom Of Movement':
    'School=Abjuration ' +
    'Level=Assassin4,B4,Blackguard4,C4,D4,Luck4,R4,Travel4 ' +
    'Description="Touched moves freely for $L10 min"',
  'Freezing Sphere':
    'School=Evocation ' +
    'Level=W6 ' +
    'Description="R$RL\' 10\' radius inflicts ${Lmin15}d6 HP (Ref half)"',

  'Gaseous Form':
    'School=Transmutation ' +
    'Level=Air3,B3,W3 ' +
    'Description="Touched becomes insubstantial (DR 10/magic, immune to poison and critical hits, unable to use spell components, fly 10\') for $L2 min"',
  'Gate':
    'School=Conjuration ' +
    'Level=C9,W9 ' +
    'Description="R$RM\' 5\' - 20\' disk connects to another plane for conc or $L rd, allows summoning of extraplanar creature"',
  'Geas/Quest':
    'School=Enchantment ' +
    'Level=B6,C6,W6 ' +
    'Description="R$RS\' Target must complete task"',
  'Lesser Geas':
    'School=Enchantment ' +
    'Level=B3,W4 ' +
    'Description="R$RS\' Target w/up to 7 HD must complete task (Will neg)"',
  'Gentle Repose':
    'School=Necromancy ' +
    'Level=C2,W3 ' +
    'Description="Touched corpse preserved $L dy (Will neg)"',
  'Ghost Sound':
    'School=Illusion ' +
    'Level=Adept0,Assassin1,B0,Gnomish0,W0 ' +
    'Description="R$RS\' Produces sound volume of $L4min20 humans (Will disbelieve) for $L rd"',
  'Ghoul Touch':
    'School=Necromancy ' +
    'Level=W2 ' +
    'Description="Touched becomes paralyzed for 1d6+2 rd and stench sickens in 10\' radius (Fort neg)"',
  'Giant Vermin':
    'School=Transmutation ' +
    'Level=C4,D4 ' +
    'Description="R$RS\' 3 centipedes, 2 spiders, or 1 scorpion in 15\' radius become giant and obey self for $L min"',
  'Glibness':
    'School=Transmutation ' +
    'Level=Assassin4,B3 ' +
    'Description="Self gains +30 Bluff, SR $Lplus15 (magical lie detection) for $L10 min"',
  'Glitterdust':
    'School=Conjuration ' +
    'Level=B2,W2 ' +
    'Description="R$RM\' Creatures in 10\' radius outlined and blind for $L rd (Will not blinded)"',
  'Globe Of Invulnerability':
    'School=Abjuration ' +
    'Level=W6 ' +
    'Description="10\' radius bars spell effects up to 4th level for $L rd"',
  'Lesser Globe Of Invulnerability':
    'School=Abjuration ' +
    'Level=W4 ' +
    'Description="10\' radius bars spell effects up to 3rd level for $L rd"',
  'Glyph Of Warding':
    'School=Abjuration ' +
    'Level=C3 ' +
    'Description="Proscribed creatures who transit $L5 sq\' area trigger ${Ldiv2min5}d8 HP blast in 5\' radius (Ref half) or harmful spell up to 3rd level"',
  'Greater Glyph Of Warding':
    'School=Abjuration ' +
    'Level=C6 ' +
    'Description="Proscribed creatures who transit $L5 sq\' area trigger ${Ldiv2min10}d8 HP blast in 5\' radius (Ref half) or harmful spell up to 6th level"',
  'Good Hope':
    'School=Enchantment ' +
    'Level=B3 ' +
    'Description="R$RM\' $L targets in 15\' radius gain +2 attack, damage, saves, and checks for $L min"',
  'Goodberry':
    'School=Transmutation ' +
    'Level=D1 ' +
    'Description="2d4 berries provide a full meal and heal 1 HP for $L dy"',
  'Grasping Hand':
    'School=Evocation ' +
    'Level=Strength7,W7 ' +
    'Description="R$RM\' 10\' hand (AC 20, %{hitPoints} HP) moves 60\'/rd, gives +4 AC, and performs +16 bull rush and +$Lplus14+mod grapple for $L rd"',
  'Grease':
    'School=Conjuration ' +
    'Level=B1,W1 ' +
    'Description="R$RS\' Object or 10\' sq becomes slippery, causing falls (Ref DC 10 Balance for half speed), for $L rd"',
  'Guards And Wards':
    'School=Abjuration ' +
    'Level=W6 ' +
    'Description="Multiple magic effects protect $L200\' sq area for $L2 hr"',
  'Guidance':
    'School=Divination ' +
    'Level=Adept0,C0,D0 ' +
    'Description="Touched gains +1 next attack, save, or skill check for 1 min"',
  'Gust Of Wind':
    'School=Evocation ' +
    'Level=D2,W2 ' +
    'Description="60\' 50 MPH gust affects medium or smaller creatures (Fort neg) for 1 rd"',

  'Hallow':
    'School=Evocation ' +
    'Level=C5,D5 ' +
    'Description="40\' radius from touched gives +2 AC and saves vs. evil, suppresses mental control, bars contact by summoned evil creatures, prevents undead creation, gives +4 turn undead bonus, and evokes boon spell"',
  'Hallucinatory Terrain':
    'School=Illusion ' +
    'Level=B4,W4 ' +
    'Description="R$RL\' Creates $L 30\' cu terrain illusion (Will disbelieve) for $L2 hr"',
  'Halt Undead':
    'School=Necromancy ' +
    'Level=W3 ' +
    'Description="R$RM\' Immobilizes 3 undead in 15\' radius for $L rd (Will neg)"',
  'Harm':
    'School=Necromancy ' +
    'Level=C6,Destruction6 ' +
    'Description="Touched suffers (undead heals) $L10min150 HP (Will half)"',
  'Haste':
    'School=Transmutation ' +
    'Level=B3,W3 ' +
    'Description="R$RS\' $L targets in 15\' radius gain extra attack, +1 attack, AC, and Reflex, and +30\' Speed for $L rd"',
  'Heal':
    'School=Conjuration ' +
    'Level=Adept5,C6,D7,Healing6 ' +
    'Description="Touched heals (undead suffers) $L10min150 HP and removes negative conditions"',
  'Mass Heal':
    'School=Conjuration ' +
    'Level=C9,Healing9 ' +
    'Description="R$RS\' Targets in 15\' radius heal (undead suffer) $L10min150 HP and remove negative conditions"',
  'Heal Mount':
    'School=Conjuration ' +
    'Level=P3 ' +
    'Description="Touched mount regains $L10min150 HP and removes negative conditions"',
  'Heat Metal':
    'School=Transmutation ' +
    'Level=D2,Sun2 ' +
    'Description="R$RS\' Metal on $Ldiv2 creatures in 15\' radius inflicts 0/1d4/2d4/2d4/2d4/1d4/0 HP for 7 rd (Will neg)"',
  'Helping Hand':
    'School=Evocation ' +
    'Level=C3 ' +
    'Description="R5 miles Ghostly hand leads target to self for 4 hr"',
  "Heroes' Feast":
    'School=Conjuration ' +
    'Level=B6,C6 ' +
    'Description="R$RS\' Food for $L creatures cures sickness and disease, gives 1d8+$Ldiv2min10 temporary HP, +1 attack and Will saves and immunity to poison and fear for 12 hr"',
  'Heroism':
    'School=Enchantment ' +
    'Level=B2,W3 ' +
    'Description="Touched gains +2 attack, saves, and skill checks for $L10 min"',
  'Greater Heroism':
    'School=Enchantment ' +
    'Level=B5,W6 ' +
    'Description="Touched gains +4 attack, saves, and skill checks, +$Lmin20 temporary HP, and immunity to fear for $L10 min"',
  'Hide From Animals':
    'School=Abjuration ' +
    'Level=D1,R1 ' +
    'Description="$L touched become imperceptible to animals for $L10 min"',
  'Hide From Undead':
    'School=Abjuration ' +
    'Level=C1 ' +
    'Description="$L touched become imperceptible to undead for $L10 min (Will neg)"',
  'Hideous Laughter':
    'School=Enchantment ' +
    'Level=B1,W2 ' +
    'Description="R$RS\' Target ROFL for $L rd (Will neg)"',
  'Hold Animal':
    'School=Enchantment ' +
    'Level=Animal2,D2,R2 ' +
    'Description="R$RM\' Immobilizes target animal for $L rd (Will neg)"',
  'Hold Monster':
    'School=Enchantment ' +
    'Level=B4,Law6,W5 ' +
    'Description="R$RM\' Immobilizes target for $L rd (Will neg)"',
  'Mass Hold Monster':
    'School=Enchantment ' +
    'Level=W9 ' +
    'Description="R$RM\' Immobilizes targets in 15\' radius for $L rd (Will neg)"',
  'Hold Person':
    'School=Enchantment ' +
    'Level=B2,C2,W3 ' +
    'Description="R$RM\' Immobilizes target humanoid for $L rd (Will neg)"',
  'Mass Hold Person':
    'School=Enchantment ' +
    'Level=W7 ' +
    'Description="R$RM\' Immobilizes targets in 15\' radius for $L rd (Will neg)"',
  'Hold Portal':
    'School=Abjuration ' +
    'Level=W1 ' +
    'Description="R$RM\' Door, gate, or window magically held shut for $L min"',
  'Holy Aura':
    'School=Abjuration ' +
    'Level=C8,Good8 ' +
    'Description="$L creatures in 20\' radius gain +4 AC and saves and SR 25 (evil), suppress mental control, and blind successful evil attacker (Fort neg) for $L rd"',
  'Holy Smite':
    'School=Evocation ' +
    'Level=Good4 ' +
    'Description="R$RM\' Evil creatures in 20\' radius suffer ${Ldiv2min5}d8 HP and blindness for 1 rd, neutral half (Will half)"',
  'Holy Sword':
    'School=Evocation ' +
    'Level=P4 ' +
    'Description="Touched weapon gains +5 attack and damage and +2d6 damage vs. evil, gives +2 AC and saves, suppresses mental control, and bars contact by evil summoned for $L rd"',
  'Holy Word':
    'School=Evocation ' +
    'Level=C7,Good7 ' +
    'Description="Nongood creatures in 40\' radius with equal/-1/-5/-10 HD deafened for 1d4 rd/blinded for 2d4 rd/paralyzed for 1d10 min/killed and banished (Will neg)"',
  'Horrid Wilting':
    'School=Necromancy ' +
    'Level=W8,Water8 ' +
    'Description="R$RL\' Creatures in 30\' radius suffer ${Lmin20}d6 HP (plants or water elementals ${Lmin20}d8 HP) (Fort half)"',
  'Hypnotic Pattern':
    'School=Illusion ' +
    'Level=B2,W2 ' +
    'Description="R$RM\' Fascinates 2d4+$Lmin10 HD of creatures in 10\' radius for conc + 2 rd (Will neg)"',
  'Hypnotism':
    'School=Enchantment ' +
    'Level=B1,W1 ' +
    'Description="R$RS\' Fascinates and makes suggestible 2d4 HD of creatures in 15\' radius for 2d4 rd (Will neg, +2 during combat, -2 single target)"',

  'Ice Storm':
    'School=Evocation ' +
    'Level=D4,W4,Water5 ' +
    'Description="R$RL\' Hail in 20\' radius inflicts 3d6 HP bludgeoning, 2d6 HP cold, -4 Listen for $L rd"',
  'Identify':
    'School=Divination ' +
    'Level=B1,Magic2,W1 ' +
    'Description="Self determines magic properties of touched"',
  'Illusory Script':
    'School=Illusion ' +
    'Level=Assassin2,B3,W3 ' +
    'Description="Touched transmits suggestions (30 min max) to unauthorized readers for $L dy (Will neg)"',
  'Illusory Wall':
    'School=Illusion ' +
    'Level=W4 ' +
    'Description="R$RS\' Creates permanent illusionary 1\'x10\'x10\' surface (Will disbelieve)"',
  'Imbue With Spell Ability':
    'School=Evocation ' +
    'Level=C4,Magic4 ' +
    'Description="Grants to touched with 1/3/5 HD the ability to cast specified 1st/2x1st/2x1st+2nd level spells"',
  'Implosion':
    'School=Evocation ' +
    'Level=C9,Destruction9 ' +
    'Description="R$RS\' Slays 1 target/rd for conc or $Ldiv2 rd (Fort neg)"',
  'Imprisonment':
    'School=Abjuration ' +
    'Level=W9 ' +
    'Description="Entombs touched (Will neg)"',
  'Incendiary Cloud':
    'School=Conjuration ' +
    'Level=Fire8,W8 ' +
    'Description="R$RM\' Fire in 20\' radius inflicts 4d6 HP (Ref half) while moving away 10\'/rd for $L rd"',
  'Inflict Critical Wounds':
    'School=Necromancy ' +
    'Level=Blackguard4,C4,Destruction4 ' +
    'Description="Touched suffer (undead heal) 4d8+$Lmin20 (Will half)"',
  'Mass Inflict Critical Wounds':
    'School=Necromancy ' +
    'Level=C8 ' +
    'Description="R$RS\' $L targets in 15\' radius suffer (undead heal) 4d8+$Lmin40 (Will half)"',
  'Inflict Light Wounds':
    'School=Necromancy ' +
    'Level=Blackguard1,C1,Destruction1 ' +
    'Description="Touched suffer (undead heal) 1d8+$Lmin5 (Will half)"',
  'Mass Inflict Light Wounds':
    'School=Necromancy ' +
    'Level=C5,Destruction5 ' +
    'Description="R$RS\' $L targets in 15\' radius suffer (undead heal) 1d8+$Lmin25 (Will half)"',
  'Inflict Minor Wounds':
    'School=Necromancy ' +
    'Level=C0 ' +
    'Description="Touched suffer (undead heal) 1 HP (Will neg)"',
  'Inflict Moderate Wounds':
    'School=Necromancy ' +
    'Level=Blackguard2,C2 ' +
    'Description="Touched suffer (undead heal) 2d8+$Lmin10 (Will half)"',
  'Mass Inflict Moderate Wounds':
    'School=Necromancy ' +
    'Level=C6 ' +
    'Description="R$RS\' $L targets in 15\' radius suffer (undead heal) 2d8+$Lmin30 (Will half)"',
  'Inflict Serious Wounds':
    'School=Necromancy ' +
    'Level=Blackguard3,C3 ' +
    'Description="Touched suffer (undead heal) 3d8+$Lmin15 (Will half)"',
  'Mass Inflict Serious Wounds':
    'School=Necromancy ' +
    'Level=C7 ' +
    'Description="R$RS\' $L targets in 15\' radius suffer (undead heal) 3d8+$Lmin35 (Will half)"',
  'Insanity':
    'School=Enchantment ' +
    'Level=W7 ' +
    'Description="R$RM\' Target permanently randomly 10% attacks caster/10% acts normal/30% babbles/20% flees/30% attacks nearest (Will neg)"',
  'Insect Plague':
    'School=Conjuration ' +
    'Level=C5,D5 ' +
    'Description="R$RL\' $Ldiv3min6 locust swarms inflict 2d6 HP for $L min"',
  'Instant Summons':
    'School=Conjuration ' +
    'Level=W7 ' +
    'Description="Prepared object appears in self hand"',
  'Interposing Hand':
    'School=Evocation ' +
    'Level=W5 ' +
    'Description="R$RM\' 10\' hand (AC 20, %{hitPoints} HP) gives +4 AC for $L rd"',
  'Invisibility':
    'School=Illusion ' +
    'Level=Adept2,Assassin2,B2,Trickery2,W2 ' +
    'Description="Touched becomes invisible for $L min or until attacks"',
  'Greater Invisibility':
    'School=Illusion ' +
    'Level=Assassin4,B4,W4 ' +
    'Description="Touched becomes invisible for $L rd"',
  'Mass Invisibility':
    'School=Illusion ' +
    'Level=W7 ' +
    'Description="R$RL\' Creatures in 90\' radius become invisible for $L min or until attack"',
  'Invisibility Purge':
    'School=Evocation ' +
    'Level=C3 ' +
    'Description="Invisible in $L5\' radius become visible for $L min"',
  'Invisibility Sphere':
    'School=Illusion ' +
    'Level=B3,W3 ' +
    'Description="Creatures in 10\' radius of touched become invisible for $L min or until attack or leave area"',
  'Iron Body':
    'School=Transmutation ' +
    'Level=Earth8,W8 ' +
    'Description="Self becomes iron (+6 Strength, -6 Dexterity, half Speed, 50% arcane failure, -8 skill, DR 15/adamantine, half damage from acid and fire, immunity to other attacks and effects) for $L min"',
  'Ironwood':
    'School=Transmutation ' +
    'Level=D6 ' +
    'Description="Make $L5 lb wood object as strong as steel or $L5div2 lb object as strong as steel and +1 magic for $L dy"',
  'Irresistible Dance':
    'School=Enchantment ' +
    'Level=B6,W8 ' +
    'Description="Touched dances (-4 AC, -10 Reflex) for d4+1 rd"',

  'Jump':
    'School=Transmutation ' +
    'Level=Assassin1,D1,R1,W1 ' +
    'Description="Touched gains +${lvl<5?10:lvl<9?20:30} Jump for $L min"',

  'Keen Edge':
    'School=Transmutation ' +
    'Level=W3 ' +
    'Description="R$RS\' Target piercing or slashing weapon has dbl threat range for $L10 min"',
  'Knock':
    'School=Transmutation ' +
    'Level=W2 ' +
    'Description="R$RM\' Opens stuck, barred, locked, or magically held door, chest, or shackle"',
  'Know Direction':
    'School=Divination ' +
    'Level=B0,D0 ' +
    'Description="Self learns direction of north"',

  'Legend Lore':
    'School=Divination ' +
    'Level=B4,Knowledge7,W6 ' +
    'Description="Self learns legends about target person, place, or object"',
  'Levitate':
    'School=Transmutation ' +
    'Level=W2 ' +
    'Description="R$RS\' Self moves willing target up and down 20\'/rd for $L min"',
  'Light':
    'School=Evocation ' +
    'Level=Adept0,B0,C0,D0,W0 ' +
    'Description="Touched gives 20\' bright light for $L10 min"',
  'Lightning Bolt':
    'School=Evocation ' +
    'Level=Adept3,W3 ' +
    'Description="120\' bolt inflicts ${Lmin10}d6 HP (Ref half)"',
  'Limited Wish':
    // 'School=Universal ' +
    'Level=W7 ' +
    'Description="Alters reality, within limits"',
  'Liveoak':
    'School=Transmutation ' +
    'Level=D6 ' +
    'Description="Touched oak becomes treant guardian for $L dy"',
  'Locate Creature':
    'School=Divination ' +
    'Level=Assassin4,B4,W4 ' +
    'Description="Self senses direction of creature or kind in $RL\' radius for $L10 min"',
  'Locate Object':
    'School=Divination ' +
    'Level=B2,C3,Travel2,W2 ' +
    'Description="Self senses direction of object or type in $RL\' radius for $L min"',
  'Longstrider':
    'School=Transmutation ' +
    'Level=D1,R1,Travel1 ' +
    'Description="Self gains +10\' Speed for $L hr"',
  'Lullaby':
    'School=Enchantment ' +
    'Level=B0 ' +
    'Description="R$RM\' Creatures in 10\' radius suffer -5 Listen and Spot, -2 Will vs. sleep for conc + $L rd (Will neg)"',

  'Mage Armor':
    'School=Conjuration ' +
    'Level=W1 ' +
    'Description="Touched gains +4 AC for $L hr"',
  'Mage Hand':
    'School=Transmutation ' +
    'Level=B0,W0 ' +
    'Description="R$RS\' Self moves up to 5 lb target 15\'/rd for conc"',
  "Mage's Disjunction":
    'School=Abjuration ' +
    'Level=Magic9,W9 ' +
    'Description="R$RS\' Spells in 40\' radius dispelled, magic items disenchanted, $L% chance to disenchant artifacts or destroy antimagic field (Will neg)"',
  "Mage's Faithful Hound":
    'School=Conjuration ' +
    'Level=W5 ' +
    'Description="R$RS\' Invisible dog barks at intruders w/in 30\', bites (+10 2d6+3) those w/in 5\' for $L hr or until triggered + $L rd"',
  "Mage's Lucubration":
    'School=Transmutation ' +
    'Level=W6 ' +
    'Description="Self recalls spell up to 5th level from past day"',
  "Mage's Magnificent Mansion":
    'School=Conjuration ' +
    'Level=W7 ' +
    'Description="R$RS\' Creates door to extradimensional mansion for $L2 hr"',
  "Mage's Private Sanctum":
    'School=Abjuration ' +
    'Level=W5 ' +
    'Description="R$RS\' Shields $L 30\' cu from scrying, vision, and hearing for 1 dy"',
  "Mage's Sword":
    'School=Evocation ' +
    'Level=W7 ' +
    'Description="R$RS\' Unattended force blade attacks at +$Lplus3+mod and inflicts 4d6+3 HP x2@19 for $L rd"',
  'Magic Aura':
    'School=Illusion ' +
    'Level=B1,Magic1,W1 ' +
    'Description="Alters aura of up to $L5 lb object for $L dy"',
  'Magic Circle Against Chaos':
    'School=Abjuration ' +
    'Level=C3,Law3,P3,W3 ' +
    'Description="10\' radius from touched gives +2 AC and saves, suppresses mental control, bars contact and entry (SR neg) by nonlawful summoned creatures for $L10 min"',
  'Magic Circle Against Evil':
    'School=Abjuration ' +
    'Level=C3,Good3,P3,W3 ' +
    'Description="10\' radius from touched gives +2 AC and saves, suppresses mental control, bars contact and entry (SR neg) by nongood summoned creatures for $L10 min"',
  'Magic Circle Against Good':
    'School=Abjuration ' +
    'Level=Assassin3,C3,Evil3,W3 ' +
    'Description="10\' radius from touched gives +2 AC and saves, suppresses mental control, bars contact and entry (SR neg) by nonevil summoned creatures for $L10 min"',
  'Magic Circle Against Law':
    'School=Abjuration ' +
    'Level=C3,Chaos3,W3 ' +
    'Description="10\' radius from touched gives +2 AC and saves, suppresses mental control, bars contact and entry (SR neg) by nonchaotic summoned creatures for $L10 min"',
  'Magic Fang':
    'School=Transmutation ' +
    'Level=D1,R1 ' +
    'Description="Touched natural weapon gains +1 attack and damage for $L min"',
  'Greater Magic Fang':
    'School=Transmutation ' +
    'Level=D3,R3 ' +
    'Description="R$RS\' target natural weapon gains +$Ldiv4min4 attack and damage for $L hr"',
  'Magic Jar':
    'School=Necromancy ' +
    'Level=W5 ' +
    'Description="R$RM\' Self possesses target for $L hr (Will neg)"',
  'Magic Missile':
    'School=Evocation ' +
    'Level=W1 ' +
    'Description="R$RM\' $Lplus1div2min5 missiles inflict 1d4+1 HP each in 15\' radius"',
  'Magic Mouth':
    'School=Illusion ' +
    'Level=B1,W2 ' +
    'Description="R$RS\' Mouth appears and speaks 25 words upon trigger w/in $L15\' (Will neg)"',
  'Magic Stone':
    'School=Transmutation ' +
    'Level=C1,D1,Earth1 ' +
    'Description="3 touched stones attack at +1 and inflict 1d6+1 HP (2d6+2 HP vs. undead) for 30 min"',
  'Magic Vestment':
    'School=Transmutation ' +
    'Level=C3,Strength3,War3 ' +
    'Description="Touched armor, shield, or clothing gives +$Ldiv4min5 AC for $L hr"',
  'Magic Weapon':
    'School=Transmutation ' +
    'Level=Blackguard1,C1,P1,W1,War1 ' +
    'Description="Touched weapon gains +1 attack and damage for $L min"',
  'Greater Magic Weapon':
    'School=Transmutation ' +
    'Level=C4,P3,W3 ' +
    'Description="R$RS\' target weapon gains +$Ldiv4min4 attack and damage for $L hr"',
  'Major Creation':
    'School=Conjuration ' +
    'Level=Adept5,W5 ' +
    'Description="R$RS\' Creates $L\' cu plant or mineral object for up to $L2 hr"',
  'Major Image':
    'School=Illusion ' +
    'Level=B3,W3 ' +
    'Description="R$RL\' Creates $Lplus4 10\' cu image w/sound, smell, and thermal effects (Will disbelieve) for conc + 3 rd"',
  'Make Whole':
    'School=Transmutation ' +
    'Level=C2 ' +
    'Description="R$RS\' Repairs damage to $L 10\' cu object"',
  'Mark Of Justice':
    'School=Necromancy ' +
    'Level=C5,P4 ' +
    'Description="Touched upon trigger permanently suffers self choice of -6 ability, -4 attack, saves, and checks, or 50% chance/rd of losing action"',
  'Maze':
    'School=Conjuration ' +
    'Level=W8 ' +
    'Description="R$RS\' Target becomes lost in extradimensional maze for 10 min or until DC 20 Int check"',
  'Meld Into Stone':
    'School=Transmutation ' +
    'Level=C3,D3 ' +
    'Description="Self passes into stone for $L10 min"',
  'Mending':
    'School=Transmutation ' +
    'Level=Adept0,B0,C0,D0,W0 ' +
    'Description="R10\' Repairs minor damage to 1 lb object"',
  'Message':
    'School=Transmutation ' +
    'Level=B0,W0 ' +
    'Description="R$RM\' $L targets hold $L10-min whispered dialogue"',
  'Meteor Swarm':
    'School=Evocation ' +
    'Level=W9 ' +
    'Description="R$RL\' 4 spheres inflict 6d6 HP fire in 40\' radius (Ref half), ranged touch +2d6 HP bludgeoning"',
  'Mind Blank':
    'School=Abjuration ' +
    'Level=Protection8,W8 ' +
    'Description="R$RS\' Target gains immunity to divination and mental effects for 1 dy"',
  'Mind Fog':
    'School=Enchantment ' +
    'Level=B5,W5 ' +
    'Description="R$RM\' Fog in 20\' radius imposes -10 Wis and Will checks for 30 min (Will neg)"',
  'Minor Creation':
    'School=Conjuration ' +
    'Level=Adept4,W4 ' +
    'Description="Creates a $L\' cu plant object lasting $L hr"',
  'Minor Image':
    'School=Illusion ' +
    'Level=B2,W2 ' +
    'Description="R$RL\' Creates $Lplus4 10\' cu image w/sound (Will disbelieve) for conc + 2 rd"',
  'Miracle':
    'School=Evocation ' +
    'Level=C9,Luck9 ' +
    'Description="Requests deity intercession"',
  'Mirage Arcana':
    'School=Illusion ' +
    'Level=B5,W5 ' +
    'Description="R$RL\' Creates $L 20\' cu terrain or structure illusion (Will disbelieve) for conc + $L hr"',
  'Mirror Image':
    'School=Illusion ' +
    'Level=Adept2,B2,W2 ' +
    'Description="Creates 1d4+$Ldiv3min8 self copies that mislead attacks for $L min"',
  'Misdirection':
    'School=Illusion ' +
    'Level=Assassin3,B2,W2 ' +
    'Description="R$RS\' Redirects divinations upon target for $L hr"',
  'Mislead':
    'School=Illusion ' +
    'Level=B5,Luck6,Trickery6,W6 ' +
    'Description="R$RS\' Makes self invisible for $L rd and creates false double (Will disbelieve) for conc + 3 rd"',
  'Mnemonic Enhancer':
    'School=Transmutation ' +
    'Level=W4 ' +
    'Description="Self memorizes +3 spell levels or retains just-cast spell up to 3rd level for 1 dy"',
  'Modify Memory':
    'School=Enchantment ' +
    'Level=Assassin4,B4 ' +
    'Description="R$RS\' Changes 5 min of target\'s memory (Will neg)"',
  'Moment Of Prescience':
    'School=Divination ' +
    'Level=Luck8,W8 ' +
    'Description="Self gains +$Lmin25 attack, check, or save once w/in $L hr"',
  'Mount':
    'School=Conjuration ' +
    'Level=W1 ' +
    'Description="R$RS\' Summons riding horse for $L2 hr"',
  'Move Earth':
    'School=Transmutation ' +
    'Level=D6,W6 ' +
    'Description="R$RL\' Slowly digs 7500\' cu dirt"',

  'Neutralize Poison':
    'School=Conjuration ' +
    'Level=Adept3,B4,C4,D3,P4,R3 ' +
    'Description="Touched neutralized $L10 min, immunized, or detoxified"',
  'Nightmare':
    'School=Illusion ' +
    'Level=B5,W5 ' +
    'Description="Target suffers 1d10 HP and fatigue (Will neg (modified for familiarity w/target))"',
  'Nondetection':
    'School=Abjuration ' +
    'Level=Assassin3,R4,Trickery3,W3 ' +
    'Description="Touched gains SR $Lplus11 (divination) (or self gains SR $Lplus15) for $L hr"',

  'Obscure Object':
    'School=Abjuration ' +
    'Level=B1,C3,W2 ' +
    'Description="Touched gains immunity to divination for 8 hr (Will neg)"',
  'Obscuring Mist':
    'School=Conjuration ' +
    'Level=Adept1,Air1,Assassin1,C1,D1,W1,Water1 ' +
    'Description="Fog in 20\' radius obscures vision for $L min"',
  'Open/Close':
    'School=Transmutation ' +
    'Level=B0,W0 ' +
    'Description="R$RS\' Target up to 30 lb opens or closes (Will neg)"',
  "Order's Wrath":
    'School=Evocation ' +
    'Level=Law4 ' +
    'Description="R$RM\' Chaotic in 30\' cu suffer ${Ldiv2min5}d8 HP and are dazed for 1 rd, neutral half (Will half)"',
  'Overland Flight':
    'School=Transmutation ' +
    'Level=W5 ' +
    'Description="Self gains 40\' fly speed for $L hr"',
  "Owl's Wisdom":
    'School=Transmutation ' +
    'Level=C2,D2,P2,R2,W2 ' +
    'Description="Touched gains +4 Wisdom for $L min"',
  "Mass Owl's Wisdom":
    'School=Transmutation ' +
    'Level=C6,D6,W6 ' +
    'Description="R$RS\' $L targets in 15\' radius gain +4 Wisdom for $L min"',

  'Pass Without Trace':
    'School=Transmutation ' +
    'Level=Assassin2,D1,R1 ' +
    'Description="$L touched leave no tracks or scent for $L hr"',
  'Passwall':
    'School=Transmutation ' +
    'Level=W5 ' +
    'Description="Creates 8\'x5\'x$Lminus9max0div3times5plus10\' passage through wood, stone, or plaster for $L hr"',
  'Permanency':
    // 'School=Universal ' +
    'Level=W5 ' +
    'Description="Makes certain spells permanent"',
  'Permanent Image':
    'School=Illusion ' +
    'Level=B6,W6 ' +
    'Description="R$RL\' Creates $Lplus8 10\' cu image w/sound, smell, and thermal effects (Will disbelieve)"',
  'Persistent Image':
    'School=Illusion ' +
    'Level=B5,W5 ' +
    'Description="R$RL\' Creates $Lplus4 10\' cu scripted image w/sound, smell, and thermal effects (Will disbelieve) for $L min"',
  'Phantasmal Killer':
    'School=Illusion ' +
    'Level=W4 ' +
    'Description="R$RM\' Fears of target create creature (Will neg) whose touch kills target (Fort suffers 3d6 HP)"',
  'Phantom Steed':
    'School=Conjuration ' +
    'Level=B3,W3 ' +
    'Description="Creates mount ($Lplus7 HP, AC 18, MV $L20min240\') that only target can ride for $L hr"',
  'Phantom Trap':
    'School=Illusion ' +
    'Level=W2 ' +
    'Description="Touched object appears trapped"',
  'Phase Door':
    'School=Conjuration ' +
    'Level=Travel8,W7 ' +
    'Description="Allows $Ldiv2 passes through 8\'x5\'x$Lminus9max0div3times5plus10\' wood, stone, or plaster; adding another creature uses a pass"',
  'Planar Ally':
    'School=Conjuration ' +
    'Level=C6 ' +
    'Description="Self purchases service from extraplanar creature w/up to 12 HD"',
  'Greater Planar Ally':
    'School=Conjuration ' +
    'Level=C8 ' +
    'Description="Self purchases service from extraplanar creature w/up to 18 HD"',
  'Lesser Planar Ally':
    'School=Conjuration ' +
    'Level=C4 ' +
    'Description="Self purchases service from extraplanar creature w/up to 6 HD"',
  'Planar Binding':
    'School=Conjuration ' +
    'Level=W6 ' +
    'Description="Traps extraplanar creature(s) w/up to 12 HD (Will neg) until they escape (SR, dimensional travel, or %{casterLevel//2+charismaModifier+15} Cha) or perform a task (Opposed Cha neg)"',
  'Greater Planar Binding':
    'School=Conjuration ' +
    'Level=W8 ' +
    'Description="Traps extraplanar creature(s) w/up to 18 HD (Will neg) until they escape (SR, dimensional travel, or %{casterLevel//2+charismaModifier+15} Cha) or perform a task (Opposed Cha neg)"',
  'Lesser Planar Binding':
    'School=Conjuration ' +
    'Level=W5 ' +
    'Description="Traps extraplanar creature(s) w/up to 6 HD (Will neg) until they escape (SR, dimensional travel, or %{casterLevel//2+charismaModifier+15} Cha) or perform a task (Opposed Cha neg)"',
  'Plane Shift':
    'School=Conjuration ' +
    'Level=C5,W7 ' +
    'Description="Touched (Will neg) or 8 willing move to another plane"',
  'Plant Growth':
    'School=Transmutation ' +
    'Level=D3,Plant3,R3 ' +
    'Description="Vegetation in $RL\' radius becomes dense or 1/2 mile radius increases productivity"',
  'Poison':
    'School=Necromancy ' +
    'Level=Assassin4,Blackguard4,C4,D3 ' +
    'Description="Touched suffers -1d10 Constitution immediately and again after 1 min (DC %{10+casterLevel//2+wisdomModifier} Fort neg)"',
  'Polar Ray':
    'School=Evocation ' +
    'Level=W8 ' +
    'Description="R$RS\' Ranged touch inflicts ${Lmin25}d6 HP"',
  'Polymorph':
    'School=Transmutation ' +
    'Level=Adept4,W4 ' +
    'Description="Touched willing target becomes different creature for $L min"',
  'Polymorph Any Object':
    'School=Transmutation ' +
    'Level=Trickery8,W8 ' +
    'Description="R$RS\' Target becomes something else (Fort neg)"',
  'Power Word Blind':
    'School=Enchantment ' +
    'Level=W7,War7 ' +
    'Description="R$RS\' Target w/ 1/51/101/201 HP blinded for ever/1d4+1 min/1d4+1 rd/unaffected"',
  'Power Word Kill':
    'School=Enchantment ' +
    'Level=War9,W9 ' +
    'Description="R$RS\' Slays one creature w/up to 100 HP"',
  'Power Word Stun':
    'School=Enchantment ' +
    'Level=W8,War8 ' +
    'Description="R$RS\' Target w/ 1/51/101/151 HP stunned for 4d4 rd/2d4 rd/1d4 rd/unaffected"',
  'Prayer':
    'School=Enchantment ' +
    'Level=C3,P3 ' +
    'Description="Allies in 40\' radius gain +1 attack, damage, save, and skill, and foes suffer -1, for $L rd"',
  'Prestidigitation':
    // 'School=Universal ' +
    'Level=B0,Gnomish0,W0 ' +
    'Description="R10\' Self performs minor tricks for 1 hr"',
  'Prismatic Sphere':
    'School=Abjuration ' +
    'Level=Protection9,Sun9,W9 ' +
    'Description="10\' sphere blocks attacks and harms attackers, blinds viewers w/in 20\' w/up to 7 HD for 2d4x10 min for $L10 min"',
  'Prismatic Spray':
    'School=Evocation ' +
    'Level=W7 ' +
    'Description="R60\' Cone blinds targets w/up to 8 HD for 2d4 rd, other harmful effects"',
  'Prismatic Wall':
    'School=Abjuration ' +
    'Level=W8 ' +
    'Description="R$RS\' $L4\'x$L2\' wall blocks attacks and harms attackers, blinds viewers w/in 20\' w/up to to 8 HD for 2d4 rd for $L10 min"',
  'Produce Flame':
    'School=Evocation ' +
    'Level=D1,Fire2 ' +
    'Description="Create throwable torch flames that inflict 1d6+$Lmin5 HP for $L min"',
  'Programmed Image':
    'School=Illusion ' +
    'Level=B6,W6 ' +
    'Description="R$RL\' Create $Lplus8 10\' cu image w/sound, smell, and thermal effects (Will disbelieve) for $L rd once triggered"',
  'Project Image':
    'School=Illusion ' +
    'Level=B6,W7 ' +
    'Description="R$RM\' Self sees and casts through illusory double for $L rd (Will disbelieve)"',
  'Protection From Arrows':
    'School=Abjuration ' +
    'Level=W2 ' +
    'Description="Touched gains DR 10/magic vs. ranged for $L hr or $L10min100 HP"',
  'Protection From Chaos':
    'School=Abjuration ' +
    'Level=Adept1,C1,Law1,P1,W1 ' +
    'Description="Touched gains +2 AC and saves, suppresses mental control, and bars contact by nonlawful summoned creatures for $L min"',
  'Protection From Energy':
    'School=Abjuration ' +
    'Level=Blackguard3,C3,D3,Luck3,Protection3,R2,W3 ' +
    'Description="Touched gains resistance $L12min120 to chosen energy for $L10 min"',
  'Protection From Evil':
    'School=Abjuration ' +
    'Level=Adept1,C1,Good1,P1,W1 ' +
    'Description="Touched gains +2 AC and saves, suppresses mental control, and bars contact by nongood summoned creatures for $L min"',
  'Protection From Good':
    'School=Abjuration ' +
    'Level=Adept1,C1,Evil1,W1 ' +
    'Description="Touched gains +2 AC and saves, suppresses mental control, and bars contact by nonevil summoned creatures for $L min"',
  'Protection From Law':
    'School=Abjuration ' +
    'Level=Adept1,C1,Chaos1,W1 ' +
    'Description="Touched gains +2 AC and saves, suppresses mental control, and bars contact by nonchaotic summoned creatures for $L min"',
  'Protection From Spells':
    'School=Abjuration ' +
    'Level=Magic8,W8 ' +
    'Description="Touched gains +8 saves vs. spells for $L10 min"',
  'Prying Eyes':
    'School=Divination ' +
    'Level=W5 ' +
    'Description="1d4+$L floating eyes (AC 18, 1 HP, +16 Hide, +$Lmin15 Spot, Fly 30\') scout 1 mile for $L hr"',
  'Greater Prying Eyes':
    'School=Divination ' +
    'Level=W8 ' +
    'Description="1d4+$L floating eyes (AC 18, 1 HP, +16 Hide, +$Lmin25 Spot, Fly 30\') with True Seeing scout 1 mile for $L hr"',
  'Purify Food And Drink':
    'School=Transmutation ' +
    'Level=Adept0,C0,D0 ' +
    'Description="R10\' Makes $L\' cu food and water safe (Will neg)"',
  'Pyrotechnics':
    'School=Transmutation ' +
    'Level=B2,W2 ' +
    'Description="R$RL\' Target fire becomes fireworks (R120\' blinded for 1d4+1 rd (Will neg)) or choking smoke in 20\' radius (suffer -4 Strength and Dexterity for d4+1 rd (Fort neg)) for $L rd"',

  'Quench':
    'School=Transmutation ' +
    'Level=D3 ' +
    'Description="R$RM\' Extinguishes fire, dispels fire magic, or inflicts ${Lmin10}d6 HP to fire creatures in $L 20\' cu"',

  'Rage':
    'School=Enchantment ' +
    'Level=B2,W3 ' +
    'Description="R$RM\' $Ldiv3 willing targets in 15\' radius gain +2 Strength and Constitution, +1 Will, suffer -2 AC for conc + $L rd"',
  'Rainbow Pattern':
    'School=Illusion ' +
    'Level=B4,W4 ' +
    'Description="R$RM\' Fascinates 24 HD of creatures in 20\' radius for conc + $L rd (Will neg)"',
  'Raise Dead':
    'School=Conjuration ' +
    'Level=Adept5,C5 ' +
    'Description="Restores willing soul, dead up to $L dy, to its touched corpse"',
  'Ray Of Enfeeblement':
    'School=Necromancy ' +
    'Level=W1 ' +
    'Description="R$RS\' Ranged touch inflicts -1d6+$Ldiv2min5 Strength for $L min"',
  'Ray Of Exhaustion':
    'School=Necromancy ' +
    'Level=W3 ' +
    'Description="R$RS\' Ranged touch inflicts exhaustion for $L min (Fort fatigued)"',
  'Ray Of Frost':
    'School=Evocation ' +
    'Level=W0 ' +
    'Description="R$RS\' Ranged touch inflicts 1d3 HP"',
  'Read Magic':
    'School=Divination ' +
    'Level=Adept0,B0,C0,D0,P1,R1,W0 ' +
    'Description="Self reads magical writing for $L10 min"',
  'Reduce Animal':
    'School=Transmutation ' +
    'Level=D2,R3 ' +
    'Description="Touched willing animal becomes half size (-2 Strength, +2 Dexterity, +1 attack, +1 AC) for $L hr"',
  'Reduce Person':
    'School=Transmutation ' +
    'Level=W1 ' +
    'Description="R$RS\' Target humanoid becomes half size (-2 Strength, +2 Dexterity, +1 attack, +1 AC) for $L min (Fort neg)"',
  'Mass Reduce Person':
    'School=Transmutation ' +
    'Level=W4 ' +
    'Description="R$RS\' $L target humanoids in 15\' radius become half size (-2 Strength, +2 Dexterity, +1 attack, +1 AC) for $L min (Fort neg)"',
  'Refuge':
    'School=Conjuration ' +
    'Level=C7,W9 ' +
    'Description="Breaking object transports target to self home"',
  'Regenerate':
    'School=Conjuration ' +
    'Level=C7,D9,Healing7 ' +
    'Description="Touched regrows maims, heals 4d8+$Lmin35 HP, eliminates fatigue, exhaustion, and nonlethal damage"',
  'Reincarnate':
    'School=Transmutation ' +
    'Level=D4 ' +
    'Description="Restores willing soul, dead up to 1 week, to full health in a generated body"',
  'Remove Blindness/Deafness':
    'School=Conjuration ' +
    'Level=C3,P3 ' +
    'Description="Heals touched of blindness or deafness"',
  'Remove Curse':
    'School=Abjuration ' +
    'Level=Adept3,B3,C3,P3,W4 ' +
    'Description="Dispels all curses from touched"',
  'Remove Disease':
    'School=Conjuration ' +
    'Level=Adept3,C3,D3,R3 ' +
    'Description="Cures touched of all diseases"',
  'Remove Fear':
    'School=Abjuration ' +
    'Level=B1,C1 ' +
    'Description="R$RS\' $Ldiv4plus1 targets in 15\' radius gain +4 vs. fear, suppress existing fear for 10 min"',
  'Remove Paralysis':
    'School=Conjuration ' +
    'Level=C2,P2 ' +
    'Description="R$RS\' Frees one target from paralysis or slow, 2/3/4 targets get extra save at +4/+2/+2"',
  'Repel Metal Or Stone':
    'School=Abjuration ' +
    'Level=D8 ' +
    'Description="Repels 60\' line of unanchored metal or stone for $L rd"',
  'Repel Vermin':
    'School=Abjuration ' +
    'Level=B4,C4,D4,R3 ' +
    'Description="10\' radius bars vermin (Will neg for $Ldiv3 HD or more suffers 2d6 HP) for $L10 min"',
  'Repel Wood':
    'School=Transmutation ' +
    'Level=D6,Plant6 ' +
    'Description="Repels 60\' line of unanchored wood for $L min"',
  'Repulsion':
    'School=Abjuration ' +
    'Level=C7,Protection7,W6 ' +
    'Description="Creatures stay $L10\' away for $L rd (Will neg)"',
  'Resilient Sphere':
    'School=Evocation ' +
    'Level=W4 ' +
    'Description="R$RS\' Impassible and immobile $L\'-diameter sphere surrounds target for $L min (Ref neg)"',
  'Resist Energy':
    'School=Abjuration ' +
    'Level=Adept2,C2,D2,Fire3,P2,R1,W2 ' +
    'Description="Touched gains resistance ${lvl>10?30:lvl>6?20:10} to chosen energy for $L10 min"',
  'Resistance':
    'School=Abjuration ' +
    'Level=B0,C0,D0,P1,W0 ' +
    'Description="Touched gains +1 saves for 1 min"',
  'Restoration':
    'School=Conjuration ' +
    'Level=Adept4,C4,P4 ' +
    'Description="Dispels magical ability harm from touched and heals all temporary ability damage, restores 1 drained ability, removes fatigue or exhaustion and temporary negative levels, and restores 1 drained level"',
  'Greater Restoration':
    'School=Conjuration ' +
    'Level=C7 ' +
    'Description="Touch dispels magical ability harm and heals all temporary ability damage, restores all drained abilities, removes fatigue or exhaustion and temporary negative levels, and restores all drained levels"',
  'Lesser Restoration':
    'School=Conjuration ' +
    'Level=C2,D2,P1 ' +
    'Description="Dispels magical ability harm from touched or heals 1d4 temporary ability damage, removes fatigue, and reduces exhaustion"',
  'Resurrection':
    'School=Conjuration ' +
    'Level=C7 ' +
    'Description="Fully restores touched target dead $L10 years w/loss of 1 level"',
  'Reverse Gravity':
    'School=Transmutation ' +
    'Level=D8,W7 ' +
    'Description="R$RM\' Objects in $Ldiv2 10\' cu fall upward for $L rd"',
  'Righteous Might':
    'School=Transmutation ' +
    'Level=C5,Strength5 ' +
    'Description="Self dbl size (+4 Strength, +2 Constitution, +2 AC) and gains DR ${lvl>14?9:lvl>11?6:3}/evil or DR ${lvl>14?9:lvl>11?6:3}/good for $L rd"',
  'Rope Trick':
    'School=Transmutation ' +
    'Level=W2 ' +
    'Description="Rope leads to extradimensional space for 8 creatures for $L hr"',
  'Rusting Grasp':
    'School=Transmutation ' +
    'Level=D4 ' +
    'Description="Touch corrodes iron in 3\' radius"',

  'Sanctuary':
    'School=Abjuration ' +
    'Level=C1,Protection1 ' +
    'Description="Foes cannot attack touched for $L rd or until target attacks (Will neg)"',
  'Scare':
    'School=Necromancy ' +
    'Level=B2,W2 ' +
    'Description="R$RS\' $Ldiv3 targets w/up to 5 HD in 30\' radius flee for $L rd (Will shaken for 1 rd)"',
  'Scintillating Pattern':
    'School=Illusion ' +
    'Level=W8 ' +
    'Description="R$RS\' Renders $Lmin20 HD creatures in 20\' radius w/up to 6/12/20 HD unconscious for 1d4 rd/stunned for 1d4 rd/confused for 1d4 rd for conc + 2 rd"',
  'Scorching Ray':
    'School=Evocation ' +
    'Level=Adept2,W2 ' +
    'Description="R$RS\' Ranged touch w/${lvl>10?3:lvl>6?2:1} rays in 15\' radius inflicts 4d6 HP each"',
  'Screen':
    'School=Illusion ' +
    'Level=Trickery7,W8 ' +
    'Description="R$RS\' Illusion hides $L 30\' cu from vision and scrying (Will disbelieve) for 1 dy"',
  'Scrying':
    'School=Divination ' +
    'Level=B3,C5,D4,W4 ' +
    'Description="Self views target for $L min (Will neg)"',
  'Greater Scrying':
    'School=Divination ' +
    'Level=B6,C7,D7,W7 ' +
    'Description="Self views and casts detection and communication spells on target for $L hr (Will special neg)"',
  'Sculpt Sound':
    'School=Transmutation ' +
    'Level=B3 ' +
    'Description="R$RS\' Sounds of $L targets in 15\' radius changed for $L hr (Will neg)"',
  'Searing Light':
    'School=Evocation ' +
    'Level=C3,Sun3 ' +
    'Description="R$RM\' Ranged touch inflicts ${Ldiv2min5}d8 HP (undead ${Lmin10}d6, object ${Ldiv2min5}d6)"',
  'Secret Chest':
    'School=Conjuration ' +
    'Level=W5 ' +
    'Description="Self can summon $L\' cu ethereal chest at will for 60 dy"',
  'Secret Page':
    'School=Transmutation ' +
    'Level=B3,W3 ' +
    'Description="Hides content of touched page permanently"',
  'Secure Shelter':
    'School=Conjuration ' +
    'Level=B4,W4 ' +
    'Description="R$RS\' Creates 20\'x20\' cottage that lasts $L2 hr"',
  'See Invisibility':
    'School=Divination ' +
    'Level=Adept2,B3,W2 ' +
    'Description="Self sees invisible and ethereal creatures and objects for $L10 min"',
  'Seeming':
    'School=Illusion ' +
    'Level=B5,W5 ' +
    'Description="R$RS\' Appearance of $Ldiv2 targets in 15\' radius changes, gives +10 Disguise for 12 hr (Will disbelieve)"',
  'Sending':
    'School=Evocation ' +
    'Level=C4,W5 ' +
    'Description="Self has two-way, 25-word exchange familiar target"',
  'Sepia Snake Sigil':
    'School=Conjuration ' +
    'Level=B3,W3 ' +
    'Description="Immobilizes reader for 1d4+$L dy (Ref neg)"',
  'Sequester':
    'School=Abjuration ' +
    'Level=W7 ' +
    'Description="Willing touched becomes invisible, unscryable, and comatose for $L dy"',
  'Shades':
    'School=Illusion ' +
    'Level=W9 ' +
    'Description="Mimics conjuration (creation or summoning) spell up to 8th level (Will 80% effect)"',
  'Shadow Conjuration':
    'School=Illusion ' +
    'Level=B4,W4 ' +
    'Description="Mimics conjuration (creation or summoning) spell up to 3rd level (Will 20% effect)"',
  'Greater Shadow Conjuration':
    'School=Illusion ' +
    'Level=W7 ' +
    'Description="Mimics conjuration (creation or summoning) spell up to 6th level (Will 60% effect)"',
  'Shadow Evocation':
    'School=Illusion ' +
    'Level=B5,W5 ' +
    'Description="Mimics evocation spell up to 4th level (Will 20% effect)"',
  'Greater Shadow Evocation':
    'School=Illusion ' +
    'Level=W8 ' +
    'Description="Mimics evocation spell up to 7th level (Will 60% effect)"',
  'Shadow Walk':
    'School=Illusion ' +
    'Level=B5,W6 ' +
    'Description="Self and $L touched travel quickly via Plane of Shadow for $L hr (Will Neg)"',
  'Shambler':
    'School=Conjuration ' +
    'Level=D9,Plant9 ' +
    'Description="R$RM\' Creates 1d4+2 11 HD shambling mounds in 15\' radius that fight for 7 dy or guard for 7 mo"',
  'Shapechange':
    'School=Transmutation ' +
    'Level=Animal9,D9,W9 ' +
    'Description="Self becomes different animal of any size 1/rd for $L10 min"',
  'Shatter':
    'School=Evocation ' +
    'Level=B2,Blackguard2,C2,Chaos2,Destruction2,W2 ' +
    'Description="R$RS\' Breakables in 5\' radius shatter (Will neg), or target object suffers ${Lmin10}d6 HP (Fort half)"',
  'Shield':
    'School=Abjuration ' +
    'Level=W1 ' +
    'Description="Self gains +4 AC and immunity to <i>Magic Missile</i> for $L min"',
  'Shield Of Faith':
    'School=Abjuration ' +
    'Level=C1 ' +
    'Description="Touched gains +$Ldiv6plus2min5 AC for $L min"',
  'Shield Of Law':
    'School=Abjuration ' +
    'Level=C8,Law8 ' +
    'Description="$L creatures in 20\' radius gain +4 AC and saves and SR 25 (chaotic), suppress mental control, and slow successful chaotic attackers for $L rd (Will neg)"',
  'Shield Other':
    'School=Abjuration ' +
    'Level=C2,P2,Protection2 ' +
    'Description="R$RS\' target gains +1 AC and saves, half damage transferred to self for $L hr"',
  'Shillelagh':
    'School=Transmutation ' +
    'Level=D1 ' +
    'Description="S/M/L staff gains +1 attack, 1d8%{strengthModifier>-2?\'+\':\'\'}%{strengthModifier+1}/2d6%{strengthModifier>-2?\'+\':\'\'}%{strengthModifier+1}/3d6%{strengthModifier>-2?\'+\':\'\'}%{strengthModifier+1} damage for $L min (Will neg)"',
  'Shocking Grasp':
    'School=Evocation ' +
    'Level=W1 ' +
    'Description="Touch (+3 vs. metal) inflicts ${Lmin5}d6 HP"',
  'Shout':
    'School=Evocation ' +
    'Level=B4,W4 ' +
    'Description="R30\' Cone inflicts 5d6 HP and deafness for 2d6 rd (Fort half damage, no deafness)"',
  'Greater Shout':
    'School=Evocation ' +
    'Level=B6,W8 ' +
    'Description="R60\' Cone inflicts 10d6 HP, deafness for 4d6 rd, and stunning for 1 rd (Fort half damage and deafness, no stunning)"',
  'Shrink Item':
    'School=Transmutation ' +
    'Level=W3 ' +
    'Description="Touched $L2\' cu object becomes 1/16 size cloth for $L dy (Will neg)"',
  'Silence':
    'School=Illusion ' +
    'Level=B2,C2 ' +
    'Description="R$RL\' Bars sound in 20\' radius for $L min"',
  'Silent Image':
    'School=Illusion ' +
    'Level=B1,W1 ' +
    'Description="R$RL\' Creates $Lplus4 10\' cu visual illusion (Will disbelieve) for conc"',
  'Simulacrum':
    'School=Illusion ' +
    'Level=W7 ' +
    'Description="Creates permanent double of creature w/half original\'s HP and levels"',
  'Slay Living':
    'School=Necromancy ' +
    'Level=C5,Death5 ' +
    'Description="Touched slain (Fort suffers 3d6+$L HP)"',
  'Sleep':
    'School=Enchantment ' +
    'Level=Adept1,Assassin1,B1,W1 ' +
    'Description="R$RM\' 4 HD creatures in 10\' radius sleep for $L min (Will neg)"',
  'Sleet Storm':
    'School=Conjuration ' +
    'Level=D3,W3 ' +
    'Description="R$RL\' Sleet in 40\' radius blinds, requires DC 10 Balance to move for $L rd"',
  'Slow':
    'School=Transmutation ' +
    'Level=B3,W3 ' +
    'Description="R$RS\' $L creatures in 15\' radius take one action per rd, suffer -1 AC, attack, and Reflex, and slowed to half Speed for $L rd (Will neg)"',
  'Snare':
    'School=Transmutation ' +
    'Level=D3,R2 ' +
    'Description="Touched vine, thong, or rope becomes DC 23 trap until triggered"',
  'Soften Earth And Stone':
    'School=Transmutation ' +
    'Level=D2,Earth2 ' +
    'Description="R$RS\' $L 10\'x4\' squares of wet earth/dry earth/natural stone become mud/sand/clay"',
  'Solid Fog':
    'School=Conjuration ' +
    'Level=W4 ' +
    'Description="R$RM\' Fog in 20\' radius obscures vision, slows to 5\'/rd, and imposes -2 attack and damage for $L min"',
  'Song Of Discord':
    'School=Enchantment ' +
    'Level=B5 ' +
    'Description="R$RM\' Creatures in 20\' radius have 50% chance each rd of attacking neighbor for $L rd (Will neg)"',
  'Soul Bind':
    'School=Necromancy ' +
    'Level=C9,W9 ' +
    'Description="R$RS\' Imprisons soul from body dead up to $L rd to prevent resurrection (Will neg)"',
  'Sound Burst':
    'School=Evocation ' +
    'Level=B2,C2 ' +
    'Description="R$RS\' 10\' radius inflicts 1d8 HP and stuns (Fort not stunned)"',
  'Speak With Animals':
    'School=Divination ' +
    'Level=Animal1,B3,D1,Gnomish1,R1 ' +
    'Description="Self converses w/animals for $L min"',
  'Speak With Dead':
    'School=Necromancy ' +
    'Level=C3 ' +
    'Description="R10\' Self receives $Ldiv2 answers from corpse (Will neg)"',
  'Speak With Plants':
    'School=Divination ' +
    'Level=B4,D3,R2 ' +
    'Description="Self converses w/plants for $L min"',
  'Spectral Hand':
    'School=Necromancy ' +
    'Level=W2 ' +
    'Description="R$RM\' Self yields 1d4 HP to glowing hand that delivers touch spells up to 4th level at +2 attack for $L min"',
  'Spell Immunity':
    'School=Abjuration ' +
    'Level=C4,Protection4,Strength4 ' +
    'Description="Touched gains immunity to $Ldiv4 spells up to 4th level for $L10 min"',
  'Greater Spell Immunity':
    'School=Abjuration ' +
    'Level=C8 ' +
    'Description="Touched gains immunity to $Ldiv4 spells up to 8th level for $L10 min"',
  'Spell Resistance':
    'School=Abjuration ' +
    'Level=C5,Magic5,Protection5 ' +
    'Description="Touched gains SR $Lplus12 for $L min"',
  'Spell Turning':
    'School=Abjuration ' +
    'Level=Luck7,Magic7,W7 ' +
    'Description="1d4+6 levels of non-area, non-ranged-touch spells directed at self reflect onto caster for $L10 min"',
  'Spellstaff':
    'School=Transmutation ' +
    'Level=D6 ' +
    'Description="Stores 1 spell in wooden quarterstaff (Will neg)"',
  'Spider Climb':
    'School=Transmutation ' +
    'Level=Assassin2,D2,W2 ' +
    'Description="Touched gains 20\' climb speed and can climb walls and ceilings for $L10 min"',
  'Spike Growth':
    'School=Transmutation ' +
    'Level=D3,R2 ' +
    'Description="R$RM\' Spikes on vegetation in 20\' sq inflict 1d4 HP each 5\' movement and slow to half speed for 1 dy (Ref neg) for $L hr"',
  'Spike Stones':
    'School=Transmutation ' +
    'Level=D4,Earth4 ' +
    'Description="R$RM\' Spikes on stony ground in 20\' sq inflict 1d8 HP each 5\' movement and slow to half speed for 1 dy (Ref neg) for $L hr"',
  'Spiritual Weapon':
    'School=Evocation ' +
    'Level=C2,War2 ' +
    'Description="R$RM\' Force weapon (%{baseAttack+wisdomModifier<0?\'\':\'+\'}%{baseAttack+wisdomModifier} attack, 1d8+$Ldiv3min5 HP damage, crit same as physical weapon) attacks designated foes for $L rd"',
  'Statue':
    'School=Transmutation ' +
    'Level=W7 ' +
    'Description="Touched becomes statue at will for $L hr"',
  'Status':
    'School=Divination ' +
    'Level=C2 ' +
    'Description="Self monitors condition and position of $Ldiv3 touched allies for $L hr"',
  'Stinking Cloud':
    'School=Conjuration ' +
    'Level=W3 ' +
    'Description="R$RM\' Fog in 20\' radius obscures vision and causes nausea for 1d4+1 rd (no attacks or spells) (Fort neg) for $L rd"',
  'Stone Shape':
    'School=Transmutation ' +
    'Level=C3,D3,Earth3,W4 ' +
    'Description="Self reshapes $Lplus10\' cu of stone"',
  'Stone Tell':
    'School=Divination ' +
    'Level=D6 ' +
    'Description="Self speaks w/stone for $L min"',
  'Stone To Flesh':
    'School=Transmutation ' +
    'Level=W6 ' +
    'Description="R$RM\' Restores stoned creature (DC 15 Fort to survive) or makes 10\'x3\' stone cylinder flesh"',
  'Stoneskin':
    'School=Abjuration ' +
    'Level=Adept4,D5,Earth6,Strength6,W4 ' +
    'Description="Touched gains DR 10/adamantine for $L10min150 HP or $L10 min"',
  'Storm Of Vengeance':
    'School=Conjuration ' +
    'Level=C9,D9 ' +
    'Description="R$RL\' 360\' radius storm deafens for 1d4x10 min (Fort neg), then rains acid inflicting 1d6 HP, then generates 6 bolts lightning that inflict 10d6 HP each (Ref half), then hail that inflicts 5d6 HP, then obscures vision for 6 rd"',
  'Suggestion':
    'School=Enchantment ' +
    'Level=B2,W3 ' +
    'Description="R$RS\' Target follows reasonable suggestion for $L hr (Will neg)"',
  'Mass Suggestion':
    'School=Enchantment ' +
    'Level=B5,W6 ' +
    'Description="R$RM\' $L targets in 15\' radius follow reasonable suggestion for $L hr (Will neg)"',
  'Summon Instrument':
    'School=Conjuration ' +
    'Level=B0 ' +
    'Description="Musical instrument appears for $L min"',
  'Summon Monster I':
    'School=Conjuration ' +
    'Level=B1,Blackguard1,C1,W1 ' +
    'Description="R$RS\' 1 1st-level creature appears and fights foes for $L rd"',
  'Summon Monster II':
    'School=Conjuration ' +
    'Level=B2,Blackguard2,C2,W2 ' +
    'Description="R$RS\' 1 2nd- or 1d3 1st-level creatures appear and fight foes for $L rd"',
  'Summon Monster III':
    'School=Conjuration ' +
    'Level=B3,Blackguard3,C3,W3 ' +
    'Description="R$RS\' 1 3rd-, 1d3 2nd-, or 1d4+1 1st-level creatures appear and fight foes for $L rd"',
  'Summon Monster IV':
    'School=Conjuration ' +
    'Level=B4,Blackguard4,C4,W4 ' +
    'Description="R$RS\' 1 4th-, 1d3 3rd-, or 1d4+1 lower-level creatures appear and fight foes for $L rd"',
  'Summon Monster V':
    'School=Conjuration ' +
    'Level=B5,C5,W5 ' +
    'Description="R$RS\' 1 5th-, 1d3 4th-, or 1d4+1 lower-level creatures appear and fight foes for $L rd"',
  'Summon Monster VI':
    'School=Conjuration ' +
    'Level=B6,C6,W6 ' +
    'Description="R$RS\' 1 6th-, 1d3 5th-, or 1d4+1 lower-level creatures appear and fight foes for $L rd"',
  'Summon Monster VII':
    'School=Conjuration ' +
    'Level=C7,W7 ' +
    'Description="R$RS\' 1 7th-, 1d3 6th-, or 1d4+1 lower-level creatures appear and fight foes for $L rd"',
  'Summon Monster VIII':
    'School=Conjuration ' +
    'Level=C8,W8 ' +
    'Description="R$RS\' 1 8th-, 1d3 7th-, or 1d4+1 lower-level creatures appear and fight foes for $L rd"',
  'Summon Monster IX':
    'School=Conjuration ' +
    'Level=C9,Chaos9,Evil9,Good9,Law9,W9 ' +
    'Description="R$RS\' 1 9th-, 1d3 8th-, or 1d4+1 lower-level creatures appear and fight foes for $L rd"',
  "Summon Nature's Ally I":
    'School=Conjuration ' +
    'Level=D1,R1 ' +
    'Description="R$RS\' 1 1st-level creature appears and fights foes for $L rd"',
  "Summon Nature's Ally II":
    'School=Conjuration ' +
    'Level=D2,R2 ' +
    'Description="R$RS\' 1 2nd- or 1d3 1st-level creatures appear and fight foes for $L rd"',
  "Summon Nature's Ally III":
    'School=Conjuration ' +
    'Level=D3,R3 ' +
    'Description="R$RS\' 1 3rd-, 1d3 2nd-, or 1d4+1 1st-level creatures appear and fight foes for $L rd"',
  "Summon Nature's Ally IV":
    'School=Conjuration ' +
    'Level=Animal4,D4,R4 ' +
    'Description="R$RS\' 1 4th-, 1d3 3rd-, or 1d4+1 lower-level creatures appear and fight foes for $L rd"',
  "Summon Nature's Ally V":
    'School=Conjuration ' +
    'Level=D5 ' +
    'Description="R$RS\' 1 5th-, 1d3 4th-, or 1d4+1 lower-level creatures appear and fight foes for $L rd"',
  "Summon Nature's Ally VI":
    'School=Conjuration ' +
    'Level=D6 ' +
    'Description="R$RS\' 1 6th-, 1d3 5th-, or 1d4+1 lower-level creatures appear and fight foes for $L rd"',
  "Summon Nature's Ally VII":
    'School=Conjuration ' +
    'Level=D7 ' +
    'Description="R$RS\' 1 7th-, 1d3 6th-, or 1d4+1 lower-level creatures appear and fight foes for $L rd"',
  "Summon Nature's Ally VIII":
    'School=Conjuration ' +
    'Level=Animal8,D8 ' +
    'Description="R$RS\' 1 8th-, 1d3 7th-, or 1d4+1 lower-level creatures appear and fight foes for $L rd"',
  "Summon Nature's Ally IX":
    'School=Conjuration ' +
    'Level=D9 ' +
    'Description="R$RS\' 1 9th-, 1d3 8th-, or 1d4+1 lower-level creatures appear and fight foes for $L rd"',
  'Summon Swarm':
    'School=Conjuration ' +
    'Level=B2,D2,W2 ' +
    'Description="R$RS\' Swarm of bats, rats, or spiders attacks nearest creature for conc + 2 rd"',
  'Sunbeam':
    'School=Evocation ' +
    'Level=D7,Sun7 ' +
    'Description="$Ldiv3 60\' beams blind and inflict 4d6 HP (undead and oozes ${Lmin20}d6 HP) (Ref half, not blinded) 1/rd for $L rd"',
  'Sunburst':
    'School=Evocation ' +
    'Level=D8,Sun8,W8 ' +
    'Description="R$RL\' 80\' radius blinds and inflicts 6d6 HP (undead and oozes ${Lmin25}d6 HP) (Ref half, not blind)"',
  'Symbol Of Death':
    'School=Necromancy ' +
    'Level=C8,W8 ' +
    'Description="R60\' Rune slays (Fort neg) in 60\' radius when triggered for $L10 min or 150 HP killed"',
  'Symbol Of Fear':
    'School=Necromancy ' +
    'Level=C6,W6 ' +
    'Description="R60\' Rune panics $L rd (Will neg) in 60\' radius when triggered for $L10 min"',
  'Symbol Of Insanity':
    'School=Enchantment ' +
    'Level=C8,W8 ' +
    'Description="R60\' Rune causes insanity (Will neg) in 60\' radius when triggered for $L10 min"',
  'Symbol Of Pain':
    'School=Necromancy ' +
    'Level=C5,W5 ' +
    'Description="R60\' Rune causes pain (-4 attack and skill and ability checks) for 1 hr (Fort neg) in 60\' radius when triggered for $L10 min"',
  'Symbol Of Persuasion':
    'School=Enchantment ' +
    'Level=C6,W6 ' +
    'Description="R60\' Rune charms for $L hrs (Will neg) in 60\' radius when triggered for $L10 min"',
  'Symbol Of Sleep':
    'School=Enchantment ' +
    'Level=C5,W5 ' +
    'Description="R60\' Rune sleeps 10 HD or less for 3d6x10 min (Will neg) in 60\' radius when triggered for $L10 min"',
  'Symbol Of Stunning':
    'School=Enchantment ' +
    'Level=C7,W7 ' +
    'Description="R60\' Rune stuns for 1d6 rd (Will neg) in 60\' radius when triggered for $L10 min"',
  'Symbol Of Weakness':
    'School=Necromancy ' +
    'Level=C7,W7 ' +
    'Description="R60\' Rune inflicts -3d6 Strength (Fort neg) in 60\' radius when triggered for $L10 min"',
  'Sympathetic Vibration':
    'School=Evocation ' +
    'Level=B6 ' +
    'Description="Touched structure suffers 2d10 HP/rd for $L rd"',
  'Sympathy':
    'School=Enchantment ' +
    'Level=D9,W8 ' +
    'Description="R$RS\' Named creature kind or alignment drawn to $L10\' cu for $L2 hr (Will neg)"',

  'Telekinesis':
    'School=Transmutation ' +
    'Level=W5 ' +
    'Description="R$RL\' Self moves $L25min375 lb 20\'/rd for conc or $L rd, performs combat maneuver $L rd, or hurls $Lmin15 objects $L25min375 lbs total (Will neg)"',
  'Telekinetic Sphere':
    'School=Evocation ' +
    'Level=W8 ' +
    'Description="R$RS\' Impassible $L\'-diameter sphere surrounds target, causes weightlessness, and moves 30\'/rd for $L min"',
  'Telepathic Bond':
    'School=Divination ' +
    'Level=W5 ' +
    'Description="R$RS\' Self and/or $Ldiv3 willing targets in 15\' diameter share thoughts for $L10 min"',
  'Teleport':
    'School=Conjuration ' +
    'Level=Travel5,W5 ' +
    'Description="Transports self and $Ldiv3 others $L100 miles w/some error chance"',
  'Greater Teleport':
    'School=Conjuration ' +
    'Level=Travel7,W7 ' +
    'Description="Transports self and $Ldiv3 others anywhere w/no error chance"',
  'Teleport Object':
    'School=Conjuration ' +
    'Level=W7 ' +
    'Description="Transports touched object $L100 miles w/some error chance (Will neg)"',
  'Teleportation Circle':
    'School=Conjuration ' +
    'Level=W9 ' +
    'Description="Transports creatures in 5\' radius anywhere w/no error chance for $L10 min"',
  'Temporal Stasis':
    'School=Transmutation ' +
    'Level=W8 ' +
    'Description="Touched placed in permanent stasis (Fort neg)"',
  'Time Stop':
    'School=Transmutation ' +
    'Level=Trickery9,W9 ' +
    'Description="All but self halt and become invulnerable for 1d4+1 rd"',
  'Tiny Hut':
    'School=Evocation ' +
    'Level=B3,W3 ' +
    'Description="20\' sphere resists elements for $L2 hr"',
  'Tongues':
    'School=Divination ' +
    'Level=Adept3,B2,C4,W3 ' +
    'Description="Touched communicate in any language for $L10 min"',
  'Touch Of Fatigue':
    'School=Necromancy ' +
    'Level=Adept0,W0 ' +
    'Description="Touch attack fatigues target for $L rd (Fort neg)"',
  'Touch Of Idiocy':
    'School=Enchantment ' +
    'Level=W2 ' +
    'Description="Touch attack inflicts -1d6 Intelligence, Wisdom, and Charisma for $L10 min"',
  'Transformation':
    'School=Transmutation ' +
    'Level=W6 ' +
    'Description="Self gains +4 Strength, Dexterity, Constitution, and AC, +5 Fortitude, martial weapon proficiency, and BAB $L, but cannot cast spells for $L rd"',
  'Transmute Metal To Wood':
    'School=Transmutation ' +
    'Level=D7 ' +
    'Description="R$RL\' Metal in 40\' radius becomes wood (-2 attack, damage, AC)"',
  'Transmute Mud To Rock':
    'School=Transmutation ' +
    'Level=D5,W5 ' +
    'Description="R$RM\' $L2 10\' cu of mud becomes rock"',
  'Transmute Rock To Mud':
    'School=Transmutation ' +
    'Level=D5,W5 ' +
    'Description="R$RM\' $L2 10\' cu of natural rock becomes mud"',
  'Transport Via Plants':
    'School=Conjuration ' +
    'Level=D6 ' +
    'Description="Self and $Ldiv3 willing targets teleport via like plants for 1 rd"',
  'Trap The Soul':
    'School=Conjuration ' +
    'Level=W8 ' +
    'Description="R$RS\' Target imprisoned in gem (Will neg)"',
  'Tree Shape':
    'School=Transmutation ' +
    'Level=D2,R3 ' +
    'Description="Self becomes tree for $L hr"',
  'Tree Stride':
    'School=Conjuration ' +
    'Level=D5,R4 ' +
    'Description="Self teleports 3000\' via like trees $L times w/in $L hr"',
  'True Resurrection':
    'School=Conjuration ' +
    'Level=C9 ' +
    'Description="Fully restores target dead up to $L10 yr"',
  'True Seeing':
    'School=Divination ' +
    'Level=Adept5,C5,D7,Knowledge5,W6 ' +
    'Description="Touched sees through 120\' darkness, illusion, and invisibility for $L min"',
  'True Strike':
    'School=Divination ' +
    'Level=Assassin1,W1 ' +
    'Description="Self gains +20 next attack"',

  'Undeath To Death':
    'School=Necromancy ' +
    'Level=C6,W6 ' +
    'Description="R$RM\' Destroys ${Lmin20}d4 HD of undead w/up to 8 HD in 40\' radius (Will neg)"',
  'Undetectable Alignment':
    'School=Abjuration ' +
    'Level=Assassin2,B1,C2,P2 ' +
    'Description="R$RS\' Conceals target alignment for 1 dy (Will neg)"',
  'Unhallow':
    'School=Evocation ' +
    'Level=C5,D5 ' +
    'Description="40\' radius from touched gives +2 AC and saves vs. good, suppresses mental control, bars contact by summoned good creatures, imposes -4 turn undead penalty, gives +4 rebuke undead bonus, and evokes bane spell"',
  'Unholy Aura':
    'School=Abjuration ' +
    'Level=C8,Evil8 ' +
    'Description="$L creatures in 20\' radius gain +4 AC and saves and SR 25 (good), suppress mental control, and inflict -1d6 Strength on successful good attacker (Fort neg) for $L rd"',
  'Unholy Blight':
    'School=Evocation ' +
    'Level=Evil4 ' +
    'Description="R$RM\' Good in 20\' radius suffer ${Ldiv2min5}d8 HP and sicken for 1 rd, neutral half (Will half)"',
  'Unseen Servant':
    'School=Conjuration ' +
    'Level=B1,W1 ' +
    'Description="R$RS\' Invisible servant obeys self for $L hr"',

  'Vampiric Touch':
    'School=Necromancy ' +
    'Level=W3 ' +
    'Description="Touched suffers ${Ldiv2min10}d6 HP, self gains same as temporary HP for 1 hr"',
  'Veil':
    'School=Illusion ' +
    'Level=B6,W6 ' +
    'Description="R$RL\' Creatures in 30\' radius appear to be other creatures for conc + $L hr (Will neg)"',
  'Ventriloquism':
    'School=Illusion ' +
    'Level=B1,W1 ' +
    'Description="R$RS\' Self\'s voice moves for $L min (Will disbelieve)"',
  'Virtue':
    'School=Transmutation ' +
    'Level=C0,D0,P1 ' +
    'Description="Touched gains +1 temporary HP for 1 min"',
  'Vision':
    'School=Divination ' +
    'Level=W7 ' +
    'Description="Self learns answer about target person, place, or object"',

  'Wail Of The Banshee':
    'School=Necromancy ' +
    'Level=Death9,W9 ' +
    'Description="R$RS\' Slays $L targets in 40\' radius (Fort neg)"',
  'Wall Of Fire':
    'School=Evocation ' +
    'Level=Adept4,D5,Fire4,W4 ' +
    'Description="R$RM\' $L20\' wall inflicts 2d4 HP to creatures w/in 10\', 1d4 HP to creatures w/in 20\', 2d6+$L HP when passing through (undead dbl) for conc + $L rd"',
  'Wall Of Force':
    'School=Evocation ' +
    'Level=W5 ' +
    'Description="R$RS\' Creates impassible and immobile $L x 10\' sq wall for $L rd"',
  'Wall Of Ice':
    'School=Evocation ' +
    'Level=W4 ' +
    'Description="R$RM\' Creates $L 10\' x $L inch thick ice wall or $Lplus3\' hemisphere for $L min"',
  'Wall Of Iron':
    'School=Conjuration ' +
    'Level=W6 ' +
    'Description="R$RM\' Creates $L 5\' x $Ldiv4 inch thick permanent iron wall"',
  'Wall Of Stone':
    'School=Conjuration ' +
    'Level=Adept5,C5,D6,Earth5,W5 ' +
    'Description="R$RM\' Creates $L 5\' x $Ldiv4 inch thick permanent stone wall"',
  'Wall Of Thorns':
    'School=Conjuration ' +
    'Level=D5,Plant5 ' +
    'Description="R$RM\' $L 10\' cu thorns inflict (25-AC) HP/rd when passing through for $L10 min"',
  'Warp Wood':
    'School=Transmutation ' +
    'Level=D2 ' +
    'Description="R$RS\' Warps $L wooden objects in 20\' radius (Will neg)"',
  'Water Breathing':
    'School=Transmutation ' +
    'Level=C3,D3,W3,Water3 ' +
    'Description="Touched can breathe underwater for $L2 hrs total"',
  'Water Walk':
    'School=Transmutation ' +
    'Level=C3,R3 ' +
    'Description="$L touched can walk on liquid as if it were a solid surface for $L10 min"',
  'Waves Of Exhaustion':
    'School=Necromancy ' +
    'Level=W7 ' +
    'Description="Creatures in 60\' cone become exhausted"',
  'Waves Of Fatigue':
    'School=Necromancy ' +
    'Level=W5 ' +
    'Description="Creatures in 30\' cone become fatigued"',
  'Web':
    'School=Conjuration ' +
    'Level=Adept2,W2 ' +
    'Description="R$RM\' Webs in 20\' radius entangle (Ref neg, DC 20 Str or DC 25 Escape Artist break), burning inflicts 2d4 HP for $L10 min"',
  'Weird':
    'School=Illusion ' +
    'Level=W9 ' +
    'Description="R$RM\' Fears of targets in 15\' radius create creatures (Will neg) whose touch kills targets (Fort suffer 3d6 HP, -1d4 Str, stunned for 1 rd)"',
  'Whirlwind':
    'School=Evocation ' +
    'Level=Air8,D8 ' +
    'Description="R$RL\' Wind in 10\' radius inflicts 3d6 HP, then 1d8 HP/rd for $L rd (Ref neg)"',
  'Whispering Wind':
    'School=Transmutation ' +
    'Level=B2,W2 ' +
    'Description="R$L miles Self sends 25-word message or sound to 10\' area"',
  'Wind Walk':
    'School=Transmutation ' +
    'Level=C6,D7 ' +
    'Description="Self and $Ldiv3 touched vaporize and move 60 MPH for $L hr"',
  'Wind Wall':
    'School=Evocation ' +
    'Level=Air2,C3,D3,R2,W3 ' +
    'Description="R$RM\' $L10\'x5\' curtain of air scatters objects, deflects arrows and bolts for $L rd"',
  'Wish':
    // 'School=Universal ' +
    'Level=W9 ' +
    'Description="Alters reality, with few limits"',
  'Wood Shape':
    'School=Transmutation ' +
    'Level=D2 ' +
    'Description="Self shapes $Lplus10\' cu of wood (Will neg)"',
  'Word Of Chaos':
    'School=Evocation ' +
    'Level=C7,Chaos7 ' +
    'Description="Nonchaotic creatures in 40\' radius with equal/-1/-5/-10 HD deafened for 1d4 rd/stunned for 1 rd/confused for 1d10 min/killed (Will neg)"',
  'Word Of Recall':
    'School=Conjuration ' +
    'Level=C6,D8 ' +
    'Description="Self and $Ldiv3 willing targets return to designated place"',

  'Zone Of Silence':
    'School=Illusion ' +
    'Level=B4 ' +
    'Description="No sound escapes 5\' radius for $L hr"',
  'Zone Of Truth':
    'School=Enchantment ' +
    'Level=C2,P2 ' +
    'Description="R$RS\' Creatures in 20\' radius cannot lie for $L min (Will neg)"'

};
SRD35.WEAPONS = {
  'Bastard Sword':'Level=3 Category=1h Damage=d10 Threat=19',
  'Battleaxe':'Level=2 Category=1h Damage=d8 Crit=3',
  'Bolas':'Level=3 Category=R Damage=d4 Range=10',
  'Club':'Level=1 Category=1h Damage=d6 Range=10',
  'Composite Longbow':'Level=2 Category=R Damage=d8 Crit=3 Range=110',
  'Composite Shortbow':'Level=2 Category=R Damage=d6 Crit=3 Range=70',
  'Dagger':'Level=1 Category=Li Damage=d4 Threat=19 Range=10',
  'Dart':'Level=1 Category=R Damage=d4 Range=20',
  'Dire Flail':'Level=3 Category=2h Damage=d8/d8',
  'Dwarven Urgosh':'Level=3 Category=2h Damage=d8/d6 Crit=3',
  'Dwarven Waraxe':'Level=3 Category=1h Damage=d10 Crit=3',
  'Falchion':'Level=2 Category=2h Damage=2d4 Threat=18',
  'Flail':'Level=2 Category=1h Damage=d8',
  'Gauntlet':'Level=0 Category=Un Damage=d3',
  'Glaive':'Level=2 Category=2h Damage=d10 Crit=3',
  'Gnome Hooked Hammer':'Level=3 Category=2h Damage=d8/d6 Crit=4',
  'Greataxe':'Level=2 Category=2h Damage=d12 Crit=3',
  'Greatclub':'Level=2 Category=2h Damage=d10',
  'Greatsword':'Level=2 Category=2h Damage=2d6 Threat=19',
  'Guisarme':'Level=2 Category=2h Damage=2d4 Crit=3',
  'Halberd':'Level=2 Category=2h Damage=d10 Crit=3',
  'Hand Crossbow':'Level=3 Category=R Damage=d4 Threat=19 Range=30',
  'Handaxe':'Level=2 Damage=d6 Category=Li Crit=3',
  'Heavy Crossbow':'Level=1 Category=R Damage=d10 Threat=19 Range=120',
  'Heavy Flail':'Level=2 Category=2h Damage=d10 Threat=19',
  'Heavy Mace':'Level=1 Category=1h Damage=d8',
  'Heavy Pick':'Level=2 Category=1h Damage=d6 Crit=4',
  'Heavy Shield':'Level=2 Category=1h Damage=d4',
  'Heavy Spiked Shield':'Level=2 Category=1h Damage=d6',
  'Improvised':'Level=3 Category=R Damage=d4 Range=10',
  'Javelin':'Level=1 Category=R Damage=d6 Range=30',
  'Kama':'Level=3 Category=Li Damage=d6',
  'Kukri':'Level=2 Category=Li Damage=d4 Threat=18',
  'Lance':'Level=2 Category=2h Damage=d8 Crit=3',
  'Light Crossbow':'Level=1 Category=R Damage=d8 Threat=19 Range=80',
  'Light Hammer':'Level=2 Category=Li Damage=d4 Range=20',
  'Light Mace':'Level=1 Category=Li Damage=d6',
  'Light Pick':'Level=2 Category=Li Damage=d4 Crit=4',
  'Light Shield':'Level=2 Category=Li Damage=d3',
  'Light Spiked Shield':'Level=2 Category=Li Damage=d4',
  'Longbow':'Level=2 Category=R Damage=d8 Crit=3 Range=100',
  'Longspear':'Level=1 Category=2h Damage=d8 Crit=3',
  'Longsword':'Level=2 Category=1h Damage=d8 Threat=19',
  'Morningstar':'Level=1 Category=1h Damage=d8',
  'Net':'Level=3 Category=R Damage=d0 Range=10',
  'Nunchaku':'Level=3 Category=Li Damage=d6',
  'Orc Double Axe':'Level=3 Category=2h Damage=d8/d8 Crit=3',
  'Punching Dagger':'Level=1 Category=Li Damage=d4 Crit=3',
  'Quarterstaff':'Level=1 Category=2h Damage=d6/d6',
  'Ranseur':'Level=2 Category=2h Damage=2d4 Crit=3',
  'Rapier':'Level=2 Category=1h Damage=d6 Threat=18',
  'Repeating Heavy Crossbow':
    'Level=3 Category=R Damage=d10 Threat=19 Range=120',
  'Repeating Light Crossbow':'Level=3 Category=R Damage=d8 Threat=19 Range=80',
  'Sai':'Level=3 Category=Li Damage=d4 Range=10',
  'Sap':'Level=2 Category=Li Damage=d6',
  'Scimitar':'Level=2 Category=1h Damage=d6 Threat=18',
  'Scythe':'Level=2 Category=2h Damage=2d4 Crit=4',
  'Short Sword':'Level=2 Category=Li Damage=d6 Threat=19',
  'Shortbow':'Level=2 Category=R Damage=d6 Crit=3 Range=60',
  'Shortspear':'Level=1 Category=1h Damage=d6 Range=20',
  'Shuriken':'Level=3 Category=R Damage=d2 Range=10',
  'Siangham':'Level=3 Category=Li Damage=d6',
  'Sickle':'Level=1 Category=Li Damage=d6',
  'Sling':'Level=1 Category=R Damage=d4 Range=50',
  'Spear':'Level=1 Category=2h Damage=d8 Crit=3 Range=20',
  'Spiked Armor':'Level=2 Category=Li Damage=d6',
  'Spiked Chain':'Level=3 Category=2h Damage=2d4',
  'Spiked Gauntlet':'Level=1 Category=Li Damage=d4',
  'Throwing Axe':'Level=2 Category=Li Damage=d6 Range=10',
  'Trident':'Level=2 Category=1h Damage=d8 Range=10',
  'Two-Bladed Sword':'Level=3 Category=2h Damage=d8/d8 Threat=19',
  'Unarmed':'Level=0 Category=Un Damage=d3',
  'Warhammer':'Level=2 Category=1h Damage=d8 Crit=3',
  'Whip':'Level=3 Category=1h Damage=d3'
};
SRD35.CLASSES = {
  'Barbarian':
    'Require="alignment !~ \'Lawful\'" ' +
    'HitDie=d12 Attack=1 SkillPoints=4 Fortitude=1/2 Reflex=1/3 Will=1/3 ' +
    'Features=' +
      '"1:Armor Proficiency (Medium)","1:Shield Proficiency",' +
      '"1:Weapon Proficiency (Martial)",' +
      '"1:Fast Movement",1:Illiteracy,1:Rage,"2:Uncanny Dodge","3:Trap Sense",'+
      '"5:Improved Uncanny Dodge","7:Damage Reduction","11:Greater Rage",' +
      '"14:Indomitable Will","17:Tireless Rage","20:Mighty Rage"',
  'Bard':
    'Require="alignment !~ \'Lawful\'" ' +
    'HitDie=d6 Attack=3/4 SkillPoints=6 Fortitude=1/3 Reflex=1/2 Will=1/2 ' +
    'Features=' +
      '"1:Armor Proficiency (Light)","1:Shield Proficiency",' +
      '"1:Weapon Proficiency (Simple/Longsword/Rapier/Sap/Short Sword/Shortbow/Whip)",' +
      '"1:Bardic Knowledge","1:Bardic Music","1:Simple Somatics",' +
      '"Max \'^skills.Perform\' >= 3 ? 1:Countersong",' +
      '"Max \'^skills.Perform\' >= 3 ? 1:Fascinate",' +
      '"Max \'^skills.Perform\' >= 3 ? 1:Inspire Courage",' +
      '"Max \'^skills.Perform\' >= 6 ? 3:Inspire Competence",' +
      '"Max \'^skills.Perform\' >= 9 ? 6:Suggestion",' +
      '"Max \'^skills.Perform\' >= 12 ? 9:Inspire Greatness",' +
      '"Max \'^skills.Perform\' >= 15 ? 12:Song Of Freedom",' +
      '"Max \'^skills.Perform\' >= 18 ? 15:Inspire Heroics",' +
      '"Max \'^skills.Perform\' >= 21 ? 18:Mass Suggestion" ' +
    'CasterLevelArcane=levels.Bard ' +
    'SpellAbility=charisma ' +
    'SpellSlots=' +
      'B0:1=2;2=3;14=4,' +
      'B1:2=0;3=1;4=2;5=3;15=4,' +
      'B2:4=0;5=1;6=2;8=3;16=4,' +
      'B3:7=0;8=1;9=2;11=3;17=4,' +
      'B4:10=0;11=1;12=2;14=3;18=4,' +
      'B5:13=0;14=1;15=2;17=3;19=4,' +
      'B6:16=0;17=1;18=2;19=3;20=4',
  'Cleric':
    'HitDie=d8 Attack=3/4 SkillPoints=2 Fortitude=1/2 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Armor Proficiency (Heavy)","1:Shield Proficiency",' +
      '"1:Weapon Proficiency (Simple)",' +
      '1:Aura,"1:Spontaneous Cleric Spell","1:Turn Undead" '+
    'Selectables=' +
      QuilvynUtils.getKeys(SRD35.PATHS).filter(x => x.match(/Domain$/)).map(x => '"deityDomains =~ \'' + x.replace(' Domain', '') + '\' ? 1:' + x + '"').join(',') + ' ' +
    'CasterLevelDivine=levels.Cleric ' +
    'SpellAbility=wisdom ' +
    'SpellSlots=' +
      'C0:1=3;2=4;4=5;7=6,' +
      'C1:1=1;2=2;4=3;7=4;11=5,' +
      'C2:3=1;4=2;6=3;9=4;13=5,' +
      'C3:5=1;6=2;8=3;11=4;15=5,' +
      'C4:7=1;8=2;10=3;13=4;17=5,' +
      'C5:9=1;10=2;12=3;15=4;19=5,' +
      'C6:11=1;12=2;14=3;17=4,' +
      'C7:13=1;14=2;16=3;19=4,' +
      'C8:15=1;16=2;18=3;20=4,' +
      'C9:17=1;18=2;19=3;20=4,' +
      'Domain1:1=1,' +
      'Domain2:3=1,' +
      'Domain3:5=1,' +
      'Domain4:7=1,' +
      'Domain5:9=1,' +
      'Domain6:11=1,' +
      'Domain7:13=1,' +
      'Domain8:15=1,' +
      'Domain9:17=1',
  'Druid':
    'Require=' +
      '"alignment =~ \'Neutral\'",' +
      '"armor =~ \'None|Hide|^Leather|Padded\'",' +
      '"shield =~ \'None|Wooden\'" ' +
    'HitDie=d8 Attack=3/4 SkillPoints=4 Fortitude=1/2 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Armor Proficiency (Medium)","1:Shield Proficiency",' +
      '"1:Weapon Proficiency (Club/Dagger/Dart/Quarterstaff/Scimitar/Sickle/Shortspear/Sling/Spear)",' +
      '"1:Animal Companion","1:Nature Sense","1:Spontaneous Druid Spell",' +
      '"1:Wild Empathy","2:Woodland Stride","3:Trackless Step",' +
      '"4:Resist Nature\'s Lure","5:Wild Shape","9:Venom Immunity",' +
      '"13:A Thousand Faces","15:Timeless Body","16:Elemental Shape" ' +
    'Languages=Druidic ' +
    'CasterLevelDivine=levels.Druid ' +
    'SpellAbility=wisdom ' +
    'SpellSlots=' +
      'D0:1=3;2=4;4=5;7=6,' +
      'D1:1=1;2=2;4=3;7=4;11=5,' +
      'D2:3=1;4=2;6=3;9=4;13=5,' +
      'D3:5=1;6=2;8=3;11=4;15=5,' +
      'D4:7=1;8=2;10=3;13=4;17=5,' +
      'D5:9=1;10=2;12=3;15=4;19=5,' +
      'D6:11=1;12=2;14=3;17=4,' +
      'D7:13=1;14=2;16=3;19=4,' +
      'D8:15=1;16=2;18=3;20=4,' +
      'D9:17=1;18=2;19=3;20=4',
  'Fighter':
    'HitDie=d10 Attack=1 SkillPoints=2 Fortitude=1/2 Reflex=1/3 Will=1/3 ' +
    'Features=' +
      '"1:Armor Proficiency (Heavy)","1:Shield Proficiency",' +
      '"1:Tower Shield Proficiency",' +
      '"1:Weapon Proficiency (Martial)"',
  'Monk':
    'Require="alignment =~ \'Lawful\'" ' +
    'HitDie=d8 Attack=3/4 SkillPoints=4 Fortitude=1/2 Reflex=1/2 Will=1/2 ' +
    'Features=' +
      '"1:Weapon Proficiency (Club/Dagger/Handaxe/Heavy Crossbow/Javelin/Kama/Light Crossbow/Nunchaku/Quarterstaff/Sai/Shuriken/Siangham/Sling)",' +
      '"1:Armor Class Bonus","1:Flurry Of Blows","1:Improved Unarmed Strike",' +
      '"1:Increased Unarmed Damage",2:Evasion,"3:Fast Monk Movement",' +
      '"3:Still Mind","4:Ki Strike","4:Slow Fall","5:Purity Of Body",' +
      '"7:Wholeness Of Body","9:Improved Evasion",' +
      '"11:Diamond Body","12:Abundant Step","13:Diamond Soul",' +
      '"15:Quivering Palm","17:Timeless Body",' +
      '"17:Tongue Of The Sun And Moon","19:Empty Body","20:Perfect Self" ' +
    'Selectables=' +
      '"1:Improved Grapple","1:Stunning Fist","2:Combat Reflexes",' +
      '"2:Deflect Arrows","6:Improved Disarm","6:Improved Trip"',
  'Paladin':
    'Require="alignment == \'Lawful Good\'" ' +
    'HitDie=d10 Attack=1 SkillPoints=2 Fortitude=1/2 Reflex=1/3 Will=1/3 ' +
    'Features=' +
      '"1:Armor Proficiency (Heavy)","1:Shield Proficiency",' +
      '"1:Weapon Proficiency (Martial)",' +
      '1:Aura,"1:Detect Evil","1:Smite Evil","2:Divine Grace",' +
      '"charisma >= 12 ? 2:Lay On Hands","3:Aura Of Courage",' +
      '"3:Divine Health","4:Turn Undead","5:Special Mount","6:Remove Disease" '+
    'CasterLevelDivine="levels.Paladin < 4 ? null : Math.floor(levels.Paladin/2)" ' +
    'SpellAbility=wisdom ' +
    'SpellSlots=' +
      'P1:4=0;6=1;14=2;18=3,' +
      'P2:8=0;10=1;16=2;19=3,' +
      'P3:11=0;12=1;17=2;19=3,' +
      'P4:14=0;15=1;19=2;20=3',
  'Ranger':
    'HitDie=d8 Attack=1 SkillPoints=6 Fortitude=1/2 Reflex=1/2 Will=1/3 ' +
    'Features=' +
      '"1:Armor Proficiency (Light)","1:Shield Proficiency",' +
      '"1:Weapon Proficiency (Martial)",' +
      '"1:Favored Enemy",1:Track,"1:Wild Empathy",3:Endurance,' +
      '"4:Animal Companion","7:Woodland Stride","8:Swift Tracker",9:Evasion,' +
      '13:Camouflage,"17:Hide In Plain Sight",' +
      '"features.Combat Style (Archery) ? 2:Rapid Shot",' +
      '"features.Combat Style (Archery) ? 6:Manyshot",' +
      '"features.Combat Style (Archery) ? 11:Improved Precise Shot",' +
      '"features.Combat Style (Two-Weapon Combat) ? 2:Two-Weapon Fighting",' +
      '"features.Combat Style (Two-Weapon Combat) ? 6:Improved Two-Weapon Fighting",' +
      '"features.Combat Style (Two-Weapon Combat) ? 11:Greater Two-Weapon Fighting" ' +
    'Selectables=' +
      '"2:Combat Style (Archery)","2:Combat Style (Two-Weapon Combat)" ' +
    'CasterLevelDivine="levels.Ranger < 4 ? null : Math.floor(levels.Ranger/2)" ' +
    'SpellAbility=wisdom ' +
    'SpellSlots=' +
      'R1:4=0;6=1;14=2;18=3,' +
      'R2:8=0;10=1;16=2;19=3,' +
      'R3:11=0;12=1;17=2;19=3,' +
      'R4:14=0;15=1;19=2;20=3',
  'Rogue':
    'HitDie=d6 Attack=3/4 SkillPoints=8 Fortitude=1/3 Reflex=1/2 Will=1/3 ' +
    'Features=' +
      '"1:Armor Proficiency (Light)",' +
      '"1:Weapon Proficiency (Simple/Hand Crossbow/Rapier/Sap/Shortbow/Short Sword)",' +
      '"1:Sneak Attack",1:Trapfinding,2:Evasion,"3:Trap Sense",' +
      '"4:Uncanny Dodge","8:Improved Uncanny Dodge" ' +
    'Selectables=' +
      '"10:Crippling Strike","10:Defensive Roll","10:Feat Bonus",' +
      '"10:Improved Evasion",10:Opportunist,"10:Skill Mastery",' +
      '"10:Slippery Mind"',
  'Sorcerer':
    'HitDie=d4 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Weapon Proficiency (Simple)","1:Summon Familiar" ' +
    'CasterLevelArcane=levels.Sorcerer ' +
    'SpellAbility=charisma ' +
    'SpellSlots=' +
      'S0:1=5;2=6,' +
      'S1:1=3;2=4;3=5;4=6,' +
      'S2:4=3;5=4;6=5;7=6,' +
      'S3:6=3;7=4;8=5;9=6,' +
      'S4:8=3;9=4;10=5;11=6,' +
      'S5:10=3;11=4;12=5;13=6,' +
      'S6:12=3;13=4;14=5;15=6,' +
      'S7:14=3;15=4;16=5;17=6,' +
      'S8:16=3;17=4;18=5;19=6,' +
      'S9:18=3;19=4;20=6',
  'Wizard':
    'HitDie=d4 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Weapon Proficiency (Club/Dagger/Heavy Crossbow/Light Crossbow/Quarterstaff)",' +
      '"1:Summon Familiar","1:Scribe Scroll" ' +
    'Selectables=' +
      '"1:School Specialization (None):Specialization",' +
      QuilvynUtils.getKeys(SRD35.SCHOOLS).map(x => '"1:School Specialization (' + x + '):Specialization"').join(',') + ',' +
      QuilvynUtils.getKeys(SRD35.SCHOOLS).filter(x => x != 'Divination').map(x => '"1:School Opposition (' + x + '):Opposition"').join(',') + ' ' +
    'CasterLevelArcane=levels.Wizard ' +
    'SpellAbility=intelligence ' +
    'SpellSlots=' +
      'W0:1=3;2=4,' +
      'W1:1=1;2=2;4=3;7=4,' +
      'W2:3=1;4=2;6=3;9=4,' +
      'W3:5=1;6=2;8=3;11=4,' +
      'W4:7=1;8=2;10=3;13=4,' +
      'W5:9=1;10=2;12=3;15=4,' +
      'W6:11=1;12=2;14=3;17=4,' +
      'W7:13=1;14=2;16=3;19=4,' +
      'W8:15=1;16=2;18=3;20=4,' +
      'W9:17=1;18=2;19=3;20=4'
};
SRD35.NPC_CLASSES = {
  'Adept':
    'HitDie=d6 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Weapon Proficiency (Simple)","2:Summon Familiar" ' +
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
      '"1:Armor Proficiency (Heavy)","1:Shield Proficiency",' +
      '"1:Weapon Proficiency (Martial)" ' +
    'Skills=' +
      'Appraise,Bluff,Diplomacy,Disguise,Forgery,"Gather Information",' +
      '"Handle Animal",Intimidate,Knowledge,Listen,Perform,Ride,' +
      '"Sense Motive","Speak Language",Spot,Swim,Survival',
  'Commoner':
    'HitDie=d4 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/3 ' +
    'Features=' +
      '"1:Weapon Proficiency (Simple)" ' +
    'Skills=' +
      'Climb,Craft,"Handle Animal",Jump,Listen,Profession,Ride,Spot,Swim,' +
      '"Use Rope"',
  'Expert':
    'HitDie=d6 Attack=3/4 SkillPoints=6 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Armor Proficiency (Light)","1:Weapon Proficiency (Simple)"',
    // 10 skills of players choice
  'Warrior':
    'HitDie=d8 Attack=1 SkillPoints=2 Fortitude=1/2 Reflex=1/3 Will=1/3 ' +
    'Features=' +
      '"1:Armor Proficiency (Heavy)","1:Shield Proficiency",' +
      '"1:Weapon Proficiency (Martial)" ' +
    'Skills=' +
      'Climb,"Handle Animal",Intimidate,Jump,Ride,Swim'
};
SRD35.PRESTIGE_CLASSES = {
  'Arcane Archer':
    'Require=' +
      '"baseAttack >= 6","casterLevelArcane >= 1",' +
      '"features.Point-Blank Shot","features.Precise Shot",' +
      '"features.Weapon Focus (Longbow) || features.Weapon Focus (Shortbow)",' +
      '"race =~ \'Elf\'" ' +
    'HitDie=d8 Attack=1 SkillPoints=4 Fortitude=1/2 Reflex=1/2 Will=1/3 ' +
    'Skills=' +
      'Craft,Hide,Listen,"Move Silently",Ride,Spot,Survival,"Use Rope" ' +
    'Features=' +
      '"1:Armor Proficiency (Medium)","1:Shield Proficiency",' +
      '"1:Weapon Proficiency (Martial)",' +
      '"1:Enhance Arrow","2:Imbue Arrow","4:Seeker Arrow","6:Phase Arrow",' +
      '"8:Hail Of Arrows","10:Arrow Of Death"',
  'Arcane Trickster':
    'Require=' +
      '"alignment !~ \'Lawful\'","sneakAttack >= 2",' +
      '"skills.Decipher Script >= 7","skills.Disable Device >= 7",' +
      '"skills.Escape Artist >= 7","skills.Knowledge (Arcana) >= 4",' +
      '"Sum \'^spells\\.Mage Hand\' >= 1",' +
      '"Sum \'^spells\\..*(AS|B|W)3\' >= 1" ' +
    'HitDie=d4 Attack=1/2 SkillPoints=4 Fortitude=1/3 Reflex=1/2 Will=1/2 ' +
    'Skills=' +
      'Appraise,Balance,Bluff,Climb,Concentration,Craft,"Decipher Script",' +
      'Diplomacy,"Disable Device",Disguise,"Escape Artist",' +
      '"Gather Information",Hide,Jump,Knowledge,Listen,"Move Silently",' +
      '"Open Lock",Profession,"Sense Motive",Search,"Sleight Of Hand",' +
      '"Speak Language",Spellcraft,Spot,Swim,Tumble,"Use Rope" ' +
    'Features=' +
       '"1:Ranged Legerdemain","1:Caster Level Bonus","2:Sneak Attack",' +
       '"3:Impromptu Sneak Attack"',
  'Archmage':
    'Require=' +
      '"features.Skill Focus (Spellcraft)",' +
      '"Sum \'^features\\.Spell Focus\' >= 2",' +
      '"skills.Knowledge (Arcana) >= 15","skills.Spellcraft >= 15",' +
      '"spellSlots.S7||spellSlots.W7","level5SpellSchools >= 5" ' +
    'HitDie=d4 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Skills=' +
      'Concentration,"Craft (Alchemy)",Knowledge,Profession,Search,' +
    'Spellcraft ' +
    'Features=' +
      '"1:Caster Level Bonus","1:High Arcana" ' +
    'Selectables=' +
      '"1:Arcane Fire","1:Arcane Reach","1:Improved Arcane Reach",' +
      '"1:Mastery Of Counterspelling","1:Mastery Of Elements",' +
      '"1:Mastery Of Shaping","1:Spell Power","1:Spell-Like Ability"',
  'Assassin':
    'Require=' +
      '"alignment =~ \'Evil\'","skills.Disguise >= 4","skills.Hide >= 8",' +
      '"skills.Move Silently >= 8" ' +
    'HitDie=d6 Attack=3/4 SkillPoints=4 Fortitude=1/3 Reflex=1/2 Will=1/3 ' +
    'Skills=' +
      'Balance,Bluff,Climb,Craft,"Decipher Script",Diplomacy,' +
      '"Disable Device",Disguise,"Escape Artist",Forgery,' +
      '"Gather Information",Hide,Intimidate,Jump,Listen,"Move Silently",' +
      '"Open Lock",Search,"Sense Motive","Sleight Of Hand",Spot,Swim,Tumble,' +
      '"Use Magic Device","Use Rope" ' +
    'Features=' +
      '"1:Armor Proficiency (Light)",' +
      '"1:Weapon Proficiency (Composite Shortbow/Dagger/Dart/Hand Crossbow/Heavy Crossbow/Light Crossbow/Punching Dagger/Rapier/Sap/Shortbow/Short Sword)",' +
      '"1:Death Attack","1:Poison Use","1:Sneak Attack",' +
      '"2:Poison Save Bonus","2:Uncanny Dodge","5:Improved Uncanny Dodge",' +
      '"8:Hide In Plain Sight" ' +
    'CasterLevelArcane=levels.Assassin ' +
    'SpellAbility=intelligence ' +
    'SpellSlots=' +
      'Assassin1:1=0;2=1;3=2;4=3,' +
      'Assassin2:3=0;4=1;5=2;6=3,' +
      'Assassin3:5=0;6=1;7=2;8=3,' +
      'Assassin4:7=0;8=1;9=2;10=3',
  'Blackguard':
    'Require=' +
      '"alignment =~ \'Evil\'","baseAttack >= 6",features.Cleave,' +
      '"features.Improved Sunder","features.Power Attack","skills.Hide >= 5",' +
      '"skills.Knowledge (Religion) >= 2" ' +
    'HitDie=d10 Attack=1 SkillPoints=2 Fortitude=1/2 Reflex=1/3 Will=1/3 ' +
    'Skills=' +
      'Concentration,Craft,Diplomacy,"Handle Animal",Heal,Hide,Intimidate,' +
      '"Knowledge (Religion)",Profession,Ride ' +
    'Features=' +
      '"1:Armor Proficiency (Heavy)","1:Shield Proficiency",' +
      '"1:Weapon Proficiency (Martial)",' +
      '"1:Aura Of Evil","1:Blackguard Hands","1:Detect Good",' +
      '"1:Fiendish Summoning","1:Poison Use","2:Smite Good",' +
      '"2:Dark Blessing","3:Aura Of Despair","3:Command Undead",' +
      '"4:Sneak Attack","5:Fiendish Servant","5:Undead Companion" ' +
    'CasterLevelDivine=levels.Blackguard ' +
    'SpellAbility=wisdom ' +
    'SpellSlots=' +
      'Blackguard1:1=0;2=1;7=2,' +
      'Blackguard2:3=0;4=1;9=2,' +
      'Blackguard3:5=0;6=1;10=2,' +
      'Blackguard4:7=0;8=1',
  'Dragon Disciple':
    'Require=' +
      'languages.Draconic,"race !~ \'Dragon\'",' +
      '"skills.Knowledge (Arcana) >= 8",' +
      '"levels.Bard > 0 || levels.Sorcerer > 0 || levels.Assassin > 0" ' +
      // i.e., Arcane spells w/out prep
    'HitDie=d12 Attack=3/4 SkillPoints=2 Fortitude=1/2 Reflex=1/3 Will=1/2 ' +
    'Skills=' +
      'Concentration,Craft,Diplomacy,"Escape Artist","Gather Information",' +
      'Knowledge,Listen,Profession,Search,"Speak Language",Spellcraft,Spot ' +
    'Features=' +
      '"1:Bonus Spells","1:Natural Armor","2:Bite Attack","2:Claw Attack",' +
      '"2:Strength Boost","3:Breath Weapon","5:Blindsense",' +
      '"6:Constitution Boost","8:Intelligence Boost","9:Wings",' +
      '"10:Darkvision","10:Dragon Apotheosis","10:Low-Light Vision"',
  'Duelist':
    'Require=' +
      '"baseAttack >= 6",features.Dodge,features.Mobility,' +
      '"features.Weapon Finesse","Sum \'^skills\\.Perform\' >= 6",' +
      '"skills.Tumble >= 5" ' +
    'HitDie=d10 Attack=1 SkillPoints=4 Fortitude=1/3 Reflex=1/2 Will=1/3 ' +
    'Skills=' +
      'Balance,Bluff,"Escape Artist",Jump,Listen,Perform,"Sense Motive",' +
      'Spot,Tumble ' +
    'Features=' +
      '"1:Weapon Proficiency (Martial)",' +
      '"1:Canny Defense","2:Improved Reaction","3:Enhanced Mobility",4:Grace,' +
      '"5:Precise Strike","6:Acrobatic Charge","7:Elaborate Parry",' +
      '"9:Deflect Arrows"',
  'Dwarven Defender':
    'Require=' +
      '"alignment =~ \'Lawful\'","baseAttack >= 7",features.Dodge,' +
      'features.Endurance,features.Toughness,"race =~ \'Dwarf\'" ' +
    'HitDie=d12 Attack=1 SkillPoints=2 Fortitude=1/2 Reflex=1/3 Will=1/2 ' +
    'Skills=' +
      'Craft,Listen,"Sense Motive",Spot ' +
    'Features=' +
      '"1:Armor Proficiency (Heavy)","1:Shield Proficiency",' +
      '"1:Weapon Proficiency (Martial)",' +
      '"1:Defender Armor Class Bonus","1:Defensive Stance","2:Uncanny Dodge",' +
      '"4:Trap Sense","6:Damage Reduction","6:Improved Uncanny Dodge",' +
      '"8:Mobile Defense"',
  'Eldritch Knight':
    'Require=' +
      '"features.Weapon Proficiency (Martial)",' +
      '"Sum \'^spells\\..*[BW]3\' >= 1" ' +
    'HitDie=d6 Attack=1 SkillPoints=2 Fortitude=1/2 Reflex=1/3 Will=1/3 ' +
    'Skills=' +
      'Concentration,Craft,"Decipher Script",Jump,"Knowledge (Arcana)",' +
      '"Knowledge (Nobility)",Ride,"Sense Motive",Spellcraft,Swim ' +
    'Features=' +
      '"1:Fighter Feat Bonus","2:Caster Level Bonus"',
  'Hierophant':
    'Require=' +
      '"skills.Knowledge (Religion) >= 15","spellSlots.C7||spellSlots.D7",' +
      '"sumMetamagicFeats > 0" ' +
    'HitDie=d8 Attack=1/2 SkillPoints=2 Fortitude=1/2 Reflex=1/3 Will=1/2 ' +
    'Skills=' +
      'Concentration,Craft,Diplomacy,Heal,"Knowledge (Arcana)",' +
      '"Knowledge (Religion)",Profession,Spellcraft ' +
    'Selectables=' +
      '"1:Blast Infidel","1:Divine Reach","1:Improved Divine Reach",' +
      '"1:Faith Healing","1:Metamagic Feat","1:Spell Power",' +
      '"1:Spell-Like Ability",' +
      '"levels.Cleric > 0 ? 1:Mastery Of Energy",' +
      '"levels.Cleric > 0 ? 1:Gift Of The Divine",' +
      '"levels.Druid > 0 ? 1:Power Of Nature"',
  'Horizon Walker':
    'Require=' +
      'features.Endurance,"skills.Knowledge (Geography) >= 8" ' +
    'HitDie=d8 Attack=1 SkillPoints=4 Fortitude=1/2 Reflex=1/3 Will=1/3 ' +
    'Skills=' +
      'Balance,Climb,Diplomacy,"Handle Animal",Hide,"Knowledge (Geography)",' +
      'Listen,"Move Silently",Profession,Ride,"Speak Language",Spot,Survival ' +
    'Selectables=' +
      '"1:Terrain Mastery (Aquatic)","1:Terrain Mastery (Desert)",' +
      '"1:Terrain Mastery (Forest)","1:Terrain Mastery (Hills)",' +
      '"1:Terrain Mastery (Marsh)","1:Terrain Mastery (Mountains)",' +
      '"1:Terrain Mastery (Plains)","1:Terrain Mastery (Underground)",' +
      '"6:Terrain Mastery (Aligned)","6:Terrain Mastery (Cavernous)",' +
      '"6:Terrain Mastery (Cold)","6:Terrain Mastery (Fiery)",' +
      '"6:Terrain Mastery (Shifting)","6:Terrain Mastery (Weightless)"',
  'Loremaster':
    'Require=' +
      '"Sum \'^features\\.Skill Focus .Knowledge\' >= 1",' +
      '"Sum \'^spells\\..*Divi\' >= 7","Sum \'^spells\\..*3 Divi\' >= 1",' +
      '"Sum \'^skills\\.Knowledge\' >= 20",' +
      '"sumWizardFeats >= 3","countKnowledgeSkillsGe10 >= 2" ' +
    'HitDie=d4 Attack=1/2 SkillPoints=4 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Skills=' +
      'Appraise,Concentration,"Craft (Alchemy)","Decipher Script",' +
      '"Gather Information","Handle Animal",Heal,Knowledge,Perform,' +
      'Profession,"Speak Language",Spellcraft,"Use Magic Device" ' +
    'Features=' +
      '"1:Caster Level Bonus",1:Secrets,2:Lore,"4:Bonus Language",' +
      '"6:Greater Lore","10:True Lore" ' +
    'Selectables=' +
      '"1:Applicable Knowledge","1:Dodge Trick","1:Instant Mastery",' +
      '"1:More Newfound Arcana","1:Newfound Arcana","1:Secret Health",' +
      '"1:Secret Knowledge Of Avoidance","1:Secrets Of Inner Strength",' +
      '"1:The Lore Of True Stamina","1:Weapon Trick"',
  'Mystic Theurge':
    'Require=' +
      '"casterLevelArcane >= 2","casterLevelDivine >= 2",' +
      '"skills.Knowledge (Arcana) >= 6","skills.Knowledge (Religion) >= 6" ' +
    'HitDie=d4 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Skills=' +
      'Concentration,Craft,"Decipher Script","Knowledge (Arcana)",' +
      '"Knowledge (Religion)",Profession,"Sense Motive",Spellcraft ' +
    'Features=' +
      '"1:Caster Level Bonus"',
  'Shadowdancer':
    'Require=' +
      '"features.Combat Reflexes",features.Dodge,features.Mobility,' +
      '"skills.Hide >= 10","skills.Move Silently >= 8",' +
      '"skills.Perform (Dance) >= 5" ' +
    'HitDie=d8 Attack=3/4 SkillPoints=6 Fortitude=1/3 Reflex=1/2 Will=1/3 ' +
    'Skills=' +
      'Balance,Bluff,"Decipher Script",Diplomacy,Disguise,"Escape Artist",' +
      'Hide,Jump,Listen,"Move Silently",Perform,Profession,Search,' +
      '"Sleight Of Hand",Spot,Tumble,"Use Rope" ' +
    'Features=' +
      '"1:Armor Proficiency (Light)",' +
      '"1:Weapon Proficiency (Club/Composite Shortbow/Dagger/Dart/Hand Crossbow/Heavy Crossbow/Light Crossbow/Mace/Morningstar/Punching Dagger/Quarterstaff/Rapier/Sap/Shortbow/Short Sword)",' +
      '"1:Hide In Plain Sight",2:Darkvision,2:Evasion,"2:Uncanny Dodge",' +
      '"3:Shadow Illusion","3:Summon Shadow","4:Shadow Jump",' +
      '"5:Defensive Roll","5:Improved Uncanny Dodge","7:Slippery Mind",' +
      '"10:Improved Evasion"',
  'Thaumaturgist':
    'Require=' +
      '"features.Spell Focus (Conjuration)",' +
      '"Sum \'^spells\\.Lesser Planar Ally\' >= 1" ' +
    'HitDie=d4 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Skills=' +
      'Concentration,Craft,Diplomacy,"Knowledge (Planes)",' +
      '"Knowledge (Religion)",Profession,"Sense Motive","Speak Language",' +
      'Spellcraft ' +
    'Features=' +
      '"1:Improved Ally","1:Caster Level Bonus","2:Augment Summoning",' +
      '"3:Extended Summoning","4:Contingent Conjuration","5:Planar Cohort"'
};
SRD35.DEITIES = {
  // SRD v3.5 defines no deities; they're in the Players Handbook. However,
  // clerics with no deity still get two domains.
  'None':'Domain=' + QuilvynUtils.getKeys(SRD35.PATHS).filter(x => x.match(/Domain$/)).map(x => x.replace(' Domain', '')).join(',')
};

SRD35.SAVE_BONUS_HALF = '2 + Math.floor(source / 2)';
SRD35.SAVE_BONUS_THIRD = 'Math.floor(source / 3)';

SRD35.ARMOR_PROFICIENCY_NAMES = ['None', 'Light', 'Medium', 'Heavy', 'Tower'];
SRD35.WEAPON_PROFICIENCY_NAMES = ['Limited', 'Simple', 'Martial'];
SRD35.STRENGTH_MAX_LOADS = [0,
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 115, 130, 150, 175, 200, 230, 260,
  300, 350, 400, 460, 520, 600, 700, 800, 920, 1040, 1200, 1400
];
// Mapping of medium character damage to large/small characters
SRD35.LARGE_DAMAGE = {
  'd0':'d0', 'd2':'d3', 'd3':'d4', 'd4':'d6', 'd6':'d8', 'd8':'2d6',
  'd10':'2d8', 'd12':'3d6', '2d4':'2d6', '2d6':'3d6', '2d8':'3d8', '2d10':'4d8'
};
SRD35.SMALL_DAMAGE = {
  'd0':'d0', 'd2':'1', 'd3':'d2', 'd4':'d3', 'd6':'d4', 'd8':'d6',
  'd10':'d8', 'd12':'d10', '2d4':'d6', '2d6':'d10', '2d8':'2d6', '2d10':'2d8'
};

// Abbreviations referenced in spell descriptions and feature notes
SRD35.ABBREVIATIONS = {
  'AC':'Armor Class',
  'HP':'Hit Points',
  'RL':'L40plus400',
  'RM':'L10plus100',
  'RS':'Ldiv2times5plus25'
};

/* Defines rules related to character abilities. */
SRD35.abilityRules = function(rules) {

  rules.defineChoice('notes',
    'validationNotes.abilityMinimum:' +
      'Requires charisma >= 14||constitution >= 14||dexterity >= 14||' +
      'intelligence >= 14||strength >= 14||wisdom >= 14',
    'validationNotes.abilityModifierSum:Requires ability modifier sum >= 1'
  );

  for(var ability in SRD35.ABILITIES) {
    ability = ability.toLowerCase();
    rules.defineChoice('notes', ability + ':%V (%1)');
    rules.defineRule
      (ability + 'Modifier', ability, '=', 'Math.floor((source - 10) / 2)');
    rules.defineRule(ability + '.1', ability + 'Modifier', '=', null);
  }
  rules.defineRule('loadLight', 'loadMax', '=', 'Math.floor(source / 3)');
  rules.defineRule
    ('loadMax', 'strength', '=', 'SRD35.STRENGTH_MAX_LOADS[source]');
  rules.defineRule('loadMedium', 'loadMax', '=', 'Math.floor(source * 2 / 3)');
  rules.defineRule('runSpeed',
    'speed', '=', null,
    'runSpeedMultiplier', '*', null
  );
  rules.defineRule('speed',
    '', '=', '30',
    'abilityNotes.armorSpeedAdjustment', '+', null
  );
  rules.defineRule('validationNotes.abilityMinimum',
    'charisma', '=', 'source >= 14 ? 0 : -1',
    'constitution', '^', 'source >= 14 ? 0 : null',
    'dexterity', '^', 'source >= 14 ? 0 : null',
    'intelligence', '^', 'source >= 14 ? 0 : null',
    'strength', '^', 'source >= 14 ? 0 : null',
    'wisdom', '^', 'source >= 14 ? 0 : null'
  );
  rules.defineRule('validationNotes.abilityModifierSum',
    'charismaModifier', '=', 'source - 1',
    'constitutionModifier', '+', null,
    'dexterityModifier', '+', null,
    'intelligenceModifier', '+', null,
    'strengthModifier', '+', null,
    'wisdomModifier', '+', null,
    '', 'v', '0'
  );

};

/* Defines rules related to animal companions and familiars. */
SRD35.aideRules = function(rules, companions, familiars) {

  QuilvynUtils.checkAttrTable
    (companions, ['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha', 'HD', 'AC', 'Attack', 'Dam', 'Size', 'Level']);
  QuilvynUtils.checkAttrTable
    (familiars, ['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha', 'HD', 'AC', 'Attack', 'Dam', 'Size', 'Level']);

  for(var companion in companions) {
    rules.choiceRules
      (rules, 'Animal Companion', companion, companions[companion]);
  }
  for(var familiar in familiars) {
    rules.choiceRules(rules, 'Familiar', familiar, familiars[familiar]);
  }

  rules.defineChoice('notes',
    'animalCompanionStats.Melee:+%V %1%2%3%4',
    'familiarStats.Melee:+%V %1'
  );

  var features = [
    '1:Link', '1:Share Spells', '3:Companion Evasion', '6:Devotion',
    '9:Multiattack', '15:Companion Improved Evasion'
  ];
  QuilvynRules.featureListRules
    (rules, features, 'Animal Companion', 'companionMasterLevel', false);

  rules.defineRule('animalCompanionStats.AC',
    'companionMasterLevel', '+', 'Math.floor(source / 3) * 2',
    'companionACBoosts', '+', 'Math.floor(source)'
  );
  rules.defineRule('animalCompanionStats.Dex',
    'companionMasterLevel', '+', 'Math.floor(source / 3)'
  );
  rules.defineRule('animalCompanionStats.HD',
    'companionMasterLevel', '+', 'Math.floor(source / 3) * 2'
  );
  rules.defineRule
    ('animalCompanionStats.HP', 'companionHP', '=', 'Math.floor(source)');
  rules.defineRule('animalCompanionStats.Initiative',
    'animalCompanionStats.Dex', '=', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule
    ('animalCompanionStats.Melee', 'companionAttack', '=', 'source');
  rules.defineRule('animalCompanionStats.Melee.2',
    'companionDamAdj1', '=', 'source == 0 ? "" : source > 0 ? "+" + source : source'
  );
  // Default no second attack; overridden for specific animal companions
  rules.defineRule('animalCompanionStats.Melee.3',
    'animalCompanionStats.Melee', '?', '1',
    "", '=', '""'
  );
  rules.defineRule('animalCompanionStats.Melee.4',
    'companionDamAdj2', '=', 'source == 0 ? "" : source > 0 ? "+" + source : source',
    'animalCompanionStats.Melee.3', '=', 'source == "" ? "" : null'
  );
  rules.defineRule('animalCompanionStats.Save Fort',
    'animalCompanionStats.HD', '=', SRD35.SAVE_BONUS_HALF,
    'animalCompanionStats.Con', '+', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule('animalCompanionStats.Save Ref',
    'animalCompanionStats.HD', '=', SRD35.SAVE_BONUS_HALF,
    'animalCompanionStats.Dex', '+', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule('animalCompanionStats.Save Will',
    'animalCompanionStats.HD', '=', SRD35.SAVE_BONUS_THIRD,
    'animalCompanionStats.Wis', '+', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule('animalCompanionStats.Str',
    'companionMasterLevel', '+', 'Math.floor(source / 3)'
  );
  rules.defineRule('animalCompanionStats.Tricks',
    'animalCompanionStats.Int', '=', 'source * 3',
    'companionMasterLevel', '+=', 'Math.floor((source + 3) / 3)'
  );
  rules.defineRule('companionACBoosts',
    'companionMasterLevel', '=', 'source / 6',
    'animalCompanionStats.Dex', '+', 'source % 2 == 0 ? 0.5 : 0'
  );
  rules.defineRule('companionAttack',
    'animalCompanionStats.HD', '=', 'Math.floor(source * 3 / 4)',
    'companionAttackBoosts', '+', 'Math.floor(source)'
  );
  rules.defineRule('companionAttackBoosts',
    'companionMasterLevel', '=', 'source / 6',
    'companionMaxDexOrStr', '+', 'source % 2 == 0 ? 0.5 : 0'
  );
  rules.defineRule('companionDamAdj1',
    'animalCompanionStats.Str', '=', 'Math.floor((source - 10) / 2)',
    'companionDamageSingleAttackBonus', '+', null
  );
  rules.defineRule('companionDamAdj2',
    'animalCompanionStats.Str', '=', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule('companionDamageSingleAttackBonus',
    'animalCompanionStats.Melee.3', '?', 'source == ""',
    'animalCompanionStats.Str', '=', 'source<14 ? null : Math.floor((source-10)/4)'
  );
  rules.defineRule('companionHP',
    'animalCompanionStats.Con', '=', '4.5 + Math.floor((source - 10)/2)',
    'animalCompanionStats.HD', '*', null
  );
  rules.defineRule('companionMasterLevel', 'hasCompanion', '?', null);
  rules.defineRule('companionMaxDexOrStr',
    'animalCompanionStats.Dex', '=', null,
    'animalCompanionStats.Str', '^', null
  );

  features = [
    '1:Companion Alertness', '1:Companion Evasion',
    '1:Companion Improved Evasion', '1:Empathic Link', '1:Share Spells',
    '3:Deliver Touch Spells', '5:Speak With Master',
    '7:Speak With Like Animals', '11:Companion Spell Resistance',
    '13:Scry On Familiar'
  ];
  QuilvynRules.featureListRules
    (rules, features, 'Familiar', 'familiarMasterLevel', false);

  rules.defineRule('familiarAttack',
    'familiarMasterLevel', '?', null,
    'baseAttack', '=', null
  );
  rules.defineRule('familiarEnhancement',
    'familiarCelestial', '=', '"Celestial"',
    'familiarFiendish', '=', '"Fiendish"'
  );
  rules.defineRule('familiarMasterLevel', 'hasFamiliar', '?', null);
  rules.defineRule('familiarStats.AC',
    'familiarMasterLevel', '+', 'Math.floor((source + 1) / 2)'
  );
  rules.defineRule('familiarStats.HD',
    'familiarMasterLevel', '?', null,
    'level', '^=', null
  );
  rules.defineRule('familiarStats.HP',
    'familiarMasterLevel', '?', null,
    'hitPoints', '=', 'Math.floor(source / 2)'
  );
  rules.defineRule('familiarStats.Initiative',
    'familiarStats.Dex', '=', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule('familiarStats.Int',
    'familiarMasterLevel', '^', 'Math.floor((source + 11) / 2)'
  );
  rules.defineRule('familiarStats.Melee', 'familiarAttack', '=', null);
  rules.defineRule('familiarStats.Save Fort',
    'familiarMasterLevel', '?', null,
    'classFortitudeBonus', '=', 'Math.max(source, 2)',
    'familiarStats.Con', '+', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule('familiarStats.Save Ref',
    'familiarMasterLevel', '?', null,
    'classReflexBonus', '=', 'Math.max(source, 2)',
    'familiarStats.Dex', '+', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule('familiarStats.Save Will',
    'familiarMasterLevel', '?', null,
    'classWillBonus', '=', 'Math.max(source, 0)',
    'familiarStats.Wis', '+', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule('familiarStats.SR',
    'familiarFeatures.Companion Spell Resistance', '?', null,
    'familiarMasterLevel', '=', 'source + 5'
  );
  rules.defineRule
    ('features.Celestial Familiar', 'familiarCelestial', '=', '1');
  rules.defineRule('features.Fiendish Familiar', 'familiarFiendish', '=', '1');

  QuilvynRules.prerequisiteRules
    (rules, 'validation', 'celestialFamiliar', 'familiarCelestial',
     'familiarMasterLevel >= 3');
  QuilvynRules.prerequisiteRules
    (rules, 'validation', 'fiendishFamiliar', 'familiarFiendish',
     'familiarMasterLevel >= 3');

};

/* Defines rules related to combat. */
SRD35.combatRules = function(rules, armors, shields, weapons) {

  QuilvynUtils.checkAttrTable
    (armors, ['AC', 'Weight', 'Dex', 'Skill', 'Spell']);
  QuilvynUtils.checkAttrTable(shields, ['AC', 'Weight', 'Skill', 'Spell']);
  QuilvynUtils.checkAttrTable(weapons, ['Level', 'Category', 'Damage', 'Threat', 'Crit', 'Range']);

  for(var armor in armors) {
    rules.choiceRules(rules, 'Armor', armor, armors[armor]);
  }
  for(var shield in shields) {
    rules.choiceRules(rules, 'Shield', shield, shields[shield]);
  }
  for(var weapon in weapons) {
    var pattern = weapon.replace(/  */g, '\\s+');
    var prefix =
      weapon.charAt(0).toLowerCase() + weapon.substring(1).replaceAll(' ', '');
    rules.choiceRules(rules, 'Goody', weapon,
      // To avoid triggering additional weapons with a common suffix (e.g.,
      // "* punching dagger +2" also makes regular dagger +2), require that
      // weapon goodies with a trailing value have no preceding word or be
      // enclosed in parentheses.
      'Pattern="([-+]\\d)\\s+' + pattern + '|(?:^\\W*|\\()' + pattern + '\\s+([-+]\\d)" ' +
      'Effect=add ' +
      'Attribute=' + prefix + 'AttackModifier,' + prefix + 'DamageModifier ' +
      'Value="$1 || $2" ' +
      'Section=combat Note="%V Attack and damage"'
    );
    rules.choiceRules(rules, 'Goody', 'Masterwork ' + weapon,
      'Pattern="masterwork\\s+' + pattern + '" ' +
      'Effect=add ' +
      'Attribute=' + prefix + 'AttackModifier ' +
      'Section=combat Note="%V Attack"'
    );
    rules.choiceRules(rules, 'Weapon', weapon, weapons[weapon]);
  }

  rules.defineChoice('notes',
    'combatNotes.nonproficientArmorPenalty:%V attack',
    'combatNotes.nonproficientShieldPenalty:%V attack',
    'damageReduction.-:%V/%N',
    'damageReduction.Magic:%V/%N',
    'magicNotes.arcaneSpellFailure:%V%'
  );

  rules.defineRule('abilityNotes.armorSpeedAdjustment',
    'armorWeight', '=', 'source > 1 ? -10 : null',
    'abilityNotes.slow', '+', '5'
  );
  rules.defineRule
    ('armorClass', 'combatNotes.dexterityArmorClassAdjustment', '+', null);
  rules.defineRule('armorProficiency',
    'armorProficiencyLevel', '=', 'SRD35.ARMOR_PROFICIENCY_NAMES[source]'
  );
  rules.defineRule('armorProficiencyLevel',
    '', '=', '0',
    'features.Armor Proficiency (Heavy)', '^', '3',
    'features.Armor Proficiency (Light)', '^', '1',
    'features.Armor Proficiency (Medium)', '^', '2'
  );
  rules.defineRule('armorProficiencyLevelShortfall',
    'armorWeight', '=', null,
    'armorProficiencyLevel', '+', '-source'
  );
  rules.defineRule('attacksPerRound',
    'baseAttack', '=', 'Math.max(Math.floor((source + 4) / 5), 1)'
  );
  rules.defineRule('baseAttack', '', '=', '0');
  rules.defineRule('combatNotes.constitutionHitPointsAdjustment',
    'constitutionModifier', '=', null,
    'level', '*', null
  );
  rules.defineRule('combatNotes.dexterityArmorClassAdjustment',
    'dexterityModifier', '=', null
  );
  rules.defineRule
    ('combatNotes.dexterityAttackAdjustment', 'dexterityModifier', '=', null);
  rules.defineRule
    ('combatNotes.strengthAttackAdjustment', 'strengthModifier', '=', null);
  rules.defineRule
    ('combatNotes.strengthDamageAdjustment', 'strengthModifier', '=', null);
  rules.defineRule('combatNotes.two-HandedWieldDamageAdjustment',
    'shield', '?', 'source == "None"',
    'combatNotes.strengthDamageAdjustment', '=', 'source < 0 ? null : Math.floor(source * 0.5)'
  );
  rules.defineRule('hitPoints',
    'combatNotes.constitutionHitPointsAdjustment', '+', null,
    'level', '^', null
  );
  rules.defineRule('initiative', 'dexterityModifier', '=', null);
  rules.defineRule('meleeAttack',
    'baseAttack', '=', null,
    'combatNotes.strengthAttackAdjustment', '+', null
  );
  rules.defineRule('rangedAttack',
    'baseAttack', '=', null,
    'combatNotes.dexterityAttackAdjustment', '+', null
  );
  rules.defineRule
    ('runSpeedMultiplier', 'armorWeight', '=', 'source == 3 ? 3 : 4');
  rules.defineRule
    ('save.Fortitude', 'saveNotes.constitutionFortitudeAdjustment', '=', null);
  rules.defineRule
    ('save.Reflex', 'saveNotes.dexterityReflexAdjustment', '=', null);
  rules.defineRule('save.Will', 'saveNotes.wisdomWillAdjustment', '=', null);
  rules.defineRule('saveNotes.constitutionFortitudeAdjustment',
    'constitutionModifier', '=', null
  );
  rules.defineRule
    ('saveNotes.dexterityReflexAdjustment', 'dexterityModifier', '=', null);
  rules.defineRule
    ('saveNotes.wisdomWillAdjustment', 'wisdomModifier', '=', null);
  rules.defineRule('shieldProficiency',
    'shieldProficiencyLevel', '=', 'SRD35.ARMOR_PROFICIENCY_NAMES[source]'
  );
  rules.defineRule('shieldProficiencyLevel',
    '', '=', '0',
    'features.Shield Proficiency', '^', '3',
    'features.Tower Shield Proficiency', '^', '4'
  );
  rules.defineRule('shieldProficiencyLevelShortfall',
    'shieldWeight', '=', null,
    'shieldProficiencyLevel', '+', '-source'
  );
  rules.defineRule('weaponProficiency',
    'weaponProficiencyLevel', '=', 'SRD35.WEAPON_PROFICIENCY_NAMES[source]'
  );
  rules.defineRule('weaponProficiencyLevel',
    '', '=', '0',
    'features.Weapon Proficiency (Martial)', '^', '2',
    'features.Weapon Proficiency (Simple)', '^', '1'
  );
  rules.defineRule('weapons.Unarmed', '', '=', '1');

};

/* Defines rules related to basic character identity. */
SRD35.identityRules = function(
  rules, alignments, classes, deities, paths, races, prestigeClasses,
  npcClasses
) {

  QuilvynUtils.checkAttrTable(alignments, []);
  QuilvynUtils.checkAttrTable
    (classes, ['Require', 'HitDie', 'Attack', 'SkillPoints', 'Fortitude', 'Reflex', 'Will', 'Skills', 'Features', 'Selectables', 'Languages', 'CasterLevelArcane', 'CasterLevelDivine', 'SpellAbility', 'SpellSlots']);
  QuilvynUtils.checkAttrTable(deities, ['Alignment', 'Domain', 'Weapon']);
  QuilvynUtils.checkAttrTable
    (paths, ['Group', 'Level', 'Features', 'Selectables', 'SpellAbility', 'SpellSlots']);
  QuilvynUtils.checkAttrTable(races, ['Require', 'Features', 'Selectables', 'Languages', 'SpellAbility', 'SpellSlots']);

  for(var alignment in alignments) {
    rules.choiceRules(rules, 'Alignment', alignment, alignments[alignment]);
  }
  for(var clas in classes) {
    rules.choiceRules(rules, 'Class', clas, classes[clas]);
  }
  if(prestigeClasses) {
    for(var pc in prestigeClasses) {
      rules.choiceRules(rules, 'Prestige', pc, prestigeClasses[pc]);
      rules.defineRule('levels.' + pc, 'prestige.' + pc, '=', null);
    }
  }
  if(npcClasses) {
    for(var nc in npcClasses) {
      rules.choiceRules(rules, 'Npc', nc, npcClasses[nc]);
      rules.defineRule('levels.' + nc, 'npc.' + nc, '=', null);
    }
  }
  // Process paths before deities for domain definitions
  for(var path in paths) {
    rules.choiceRules(rules, 'Path', path, paths[path]);
  }
  for(var deity in deities) {
    rules.choiceRules(rules, 'Deity', deity, deities[deity]);
  }
  for(var race in races) {
    rules.choiceRules(rules, 'Race', race, races[race]);
  }

  rules.defineRule
    ('experienceNeeded', 'level', '=', '1000 * source * (source + 1) / 2');
  rules.defineRule('level',
    'experience', '=', 'Math.floor((1 + Math.sqrt(1 + source / 125)) / 2)'
  );
  rules.defineRule('casterLevel',
    'casterLevelArcane', '=', null,
    'casterLevelDivine', '+=', null
  );
  QuilvynRules.validAllocationRules
    (rules, 'level', 'level', 'Sum "^levels\\."');

};

/* Defines rules related to magic use. */
SRD35.magicRules = function(rules, schools, spells) {

  QuilvynUtils.checkAttrTable(schools, ['Features']);
  QuilvynUtils.checkAttrTable(spells, ['School', 'Level', 'Description']);

  for(var school in schools) {
    rules.choiceRules(rules, 'School', school, schools[school]);
  }
  for(var spell in spells) {
    rules.choiceRules(rules, 'Spell', spell, spells[spell]);
  }

};

/* Defines rules related to character aptitudes. */
SRD35.talentRules = function(
  rules, feats, features, goodies, languages, skills
) {

  var matchInfo;

  QuilvynUtils.checkAttrTable(feats, ['Require', 'Imply', 'Type']);
  QuilvynUtils.checkAttrTable(features, ['Section', 'Note']);
  QuilvynUtils.checkAttrTable
    (goodies, ['Pattern', 'Effect', 'Value', 'Attribute', 'Section', 'Note']);
  QuilvynUtils.checkAttrTable(languages, []);
  QuilvynUtils.checkAttrTable
    (skills, ['Ability', 'Untrained', 'Class', 'Synergy']);
  QuilvynUtils.checkAttrTable
   (goodies, ['Pattern', 'Effect', 'Value', 'Attribute', 'Section', 'Note']);

  for(var goody in goodies) {
    rules.choiceRules(rules, 'Goody', goody, goodies[goody]);
  }
  for(var language in languages) {
    rules.choiceRules(rules, 'Language', language, languages[language]);
  }
  for(var skill in skills) {
    rules.choiceRules(rules, 'Skill', skill, skills[skill]);
    var pattern = skill.replaceAll('(', '\\(').replaceAll(')', '\\)').replace(/\s+/, '\\b\\s*');
    rules.choiceRules(rules, 'Goody', skill,
      'Pattern="([-+]\\d).*\\s+' + pattern + '\\s+Skill|' + pattern + '\\s+skill\\s+([-+]\\d)"' +
      'Effect=add ' +
      'Value="$1 || $2" ' +
      'Attribute="skillModifier.' + skill + '" ' +
      'Section=skill Note="%V ' + skill + '"'
    );
    rules.choiceRules(rules, 'Goody', skill + ' Class Skill',
      'Pattern="' + pattern + '\\s+(?:is\\s+)?(?:a\\s+)?class\\s+skill" ' +
      'Effect=set ' +
      'Attribute="classSkills.' + skill + '" ' +
      'Section=skill Note="' + skill + ' is a class skill"'
    );
  }
  for(var feat in feats) {
    if((matchInfo = feat.match(/(%(\w+))/)) != null) {
      for(var c in rules.getChoices(matchInfo[2] + 's')) {
        rules.choiceRules
          (rules, 'Feat', feat.replace(matchInfo[1], c), feats[feat].replaceAll(matchInfo[1], c));
      }
    } else {
      rules.choiceRules(rules, 'Feat', feat, feats[feat]);
    }
  }
  for(var feature in features) {
    if((matchInfo = feature.match(/(%(\w+))/)) != null) {
      for(var c in rules.getChoices(matchInfo[2] + 's')) {
        rules.choiceRules
          (rules, 'Feature', feature.replace(matchInfo[1], c), features[feature].replaceAll(matchInfo[1], c));
      }
    } else {
      rules.choiceRules(rules, 'Feature', feature, features[feature]);
    }
  }

  rules.defineChoice('notes',
    'validationNotes.skillMaximum:' +
      'Points allocated to one or more skills exceed maximum'
  );

  rules.defineRule
    ('featCount.General', 'level', '=', '1 + Math.floor(source / 3)');
  rules.defineRule
    ('languageCount', 'skillNotes.intelligenceLanguageAdjustment', '+', null);
  rules.defineRule('maxAllowedSkillAllocation', 'level', '=', 'source + 3');
  rules.defineRule('maxActualSkillAllocation', /^skills\.[^.]*$/, '^=', null);
  rules.defineRule('skillNotes.intelligenceLanguageAdjustment',
    'intelligenceModifier', '=', 'Math.max(source, 0)'
  );
  rules.defineRule('skillNotes.intelligenceSkillPointsAdjustment',
    'intelligenceModifier', '=', null,
    'level', '*', 'source + 3'
  );
  rules.defineRule('skillPoints',
    '', '=', '0',
    'skillNotes.intelligenceSkillPointsAdjustment', '+', null,
    'level', '^', null
  );
  QuilvynRules.validAllocationRules
    (rules, 'feat', 'Sum "^featCount\\."', 'Sum "^feats\\."');
  QuilvynRules.validAllocationRules
    (rules, 'language', 'languageCount', 'Sum "^languages\\."');
  QuilvynRules.validAllocationRules
    (rules, 'selectableFeature', 'Sum "^selectableFeatureCount\\."', 'Sum "^selectableFeatures\\."');
  QuilvynRules.validAllocationRules
    (rules, 'skill', 'skillPoints', 'Sum "^skills\\.[^\\.]*$"');
  rules.defineRule('validationNotes.skillMaximum',
    'maxAllowedSkillAllocation', '=', null,
    'maxActualSkillAllocation', '+', '-source',
    '', 'v', '0'
  );

};

/*
 * Adds #name# as a possible user #type# choice and parses #attrs# to add rules
 * related to selecting that choice.
 */
SRD35.choiceRules = function(rules, type, name, attrs) {
  if(type == 'Alignment')
    SRD35.alignmentRules(rules, name);
  else if(type == 'Animal Companion')
    SRD35.companionRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Str'),
      QuilvynUtils.getAttrValue(attrs, 'Dex'),
      QuilvynUtils.getAttrValue(attrs, 'Con'),
      QuilvynUtils.getAttrValue(attrs, 'Int'),
      QuilvynUtils.getAttrValue(attrs, 'Wis'),
      QuilvynUtils.getAttrValue(attrs, 'Cha'),
      QuilvynUtils.getAttrValue(attrs, 'HD'),
      QuilvynUtils.getAttrValue(attrs, 'AC'),
      QuilvynUtils.getAttrValue(attrs, 'Attack'),
      QuilvynUtils.getAttrValueArray(attrs, 'Dam'),
      QuilvynUtils.getAttrValue(attrs, 'Size'),
      QuilvynUtils.getAttrValue(attrs, 'Level')
    );
  else if(type == 'Armor')
    SRD35.armorRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'AC'),
      QuilvynUtils.getAttrValue(attrs, 'Weight'),
      QuilvynUtils.getAttrValue(attrs, 'Dex'),
      QuilvynUtils.getAttrValue(attrs, 'Skill'),
      QuilvynUtils.getAttrValue(attrs, 'Spell')
    );
  else if(type == 'Class' || type == 'Prestige' || type == 'Npc') {
    SRD35.classRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValue(attrs, 'HitDie'),
      QuilvynUtils.getAttrValue(attrs, 'Attack'),
      QuilvynUtils.getAttrValue(attrs, 'SkillPoints'),
      QuilvynUtils.getAttrValue(attrs, 'Fortitude'),
      QuilvynUtils.getAttrValue(attrs, 'Reflex'),
      QuilvynUtils.getAttrValue(attrs, 'Will'),
      QuilvynUtils.getAttrValueArray(attrs, 'Skills'),
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValueArray(attrs, 'Selectables'),
      QuilvynUtils.getAttrValueArray(attrs, 'Languages'),
      QuilvynUtils.getAttrValue(attrs, 'CasterLevelArcane'),
      QuilvynUtils.getAttrValue(attrs, 'CasterLevelDivine'),
      QuilvynUtils.getAttrValue(attrs, 'SpellAbility'),
      QuilvynUtils.getAttrValueArray(attrs, 'SpellSlots')
    );
    SRD35.classRulesExtra(rules, name);
  } else if(type == 'Deity')
    SRD35.deityRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Alignment'),
      QuilvynUtils.getAttrValueArray(attrs, 'Domain'),
      QuilvynUtils.getAttrValueArray(attrs, 'Weapon')
    );
  else if(type == 'Familiar')
    SRD35.familiarRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Str'),
      QuilvynUtils.getAttrValue(attrs, 'Dex'),
      QuilvynUtils.getAttrValue(attrs, 'Con'),
      QuilvynUtils.getAttrValue(attrs, 'Int'),
      QuilvynUtils.getAttrValue(attrs, 'Wis'),
      QuilvynUtils.getAttrValue(attrs, 'Cha'),
      QuilvynUtils.getAttrValue(attrs, 'HD'),
      QuilvynUtils.getAttrValue(attrs, 'AC'),
      QuilvynUtils.getAttrValue(attrs, 'Attack'),
      QuilvynUtils.getAttrValueArray(attrs, 'Dam'),
      QuilvynUtils.getAttrValue(attrs, 'Size'),
      QuilvynUtils.getAttrValue(attrs, 'Level')
    );
  else if(type == 'Feat') {
    SRD35.featRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValueArray(attrs, 'Imply'),
      QuilvynUtils.getAttrValueArray(attrs, 'Type')
    );
    SRD35.featRulesExtra(rules, name);
  } else if(type == 'Feature')
    SRD35.featureRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Section'),
      QuilvynUtils.getAttrValueArray(attrs, 'Note')
    );
  else if(type == 'Goody')
    SRD35.goodyRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Pattern'),
      QuilvynUtils.getAttrValue(attrs, 'Effect'),
      QuilvynUtils.getAttrValue(attrs, 'Value'),
      QuilvynUtils.getAttrValueArray(attrs, 'Attribute'),
      QuilvynUtils.getAttrValueArray(attrs, 'Section'),
      QuilvynUtils.getAttrValueArray(attrs, 'Note')
    );
  else if(type == 'Language')
    SRD35.languageRules(rules, name);
  else if(type == 'Path')
    SRD35.pathRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Group'),
      QuilvynUtils.getAttrValue(attrs, 'Level'),
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValueArray(attrs, 'Selectables'),
      QuilvynUtils.getAttrValue(attrs, 'SpellAbility'),
      QuilvynUtils.getAttrValueArray(attrs, 'SpellSlots')
    );
  else if(type == 'Race') {
    SRD35.raceRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValueArray(attrs, 'Selectables'),
      QuilvynUtils.getAttrValueArray(attrs, 'Languages'),
      QuilvynUtils.getAttrValue(attrs, 'SpellAbility'),
      QuilvynUtils.getAttrValueArray(attrs, 'SpellSlots')
    );
    SRD35.raceRulesExtra(rules, name);
  } else if(type == 'School')
    SRD35.schoolRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Features')
    );
  else if(type == 'Shield')
    SRD35.shieldRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'AC'),
      QuilvynUtils.getAttrValue(attrs, 'Weight'),
      QuilvynUtils.getAttrValue(attrs, 'Skill'),
      QuilvynUtils.getAttrValue(attrs, 'Spell')
    );
  else if(type == 'Skill') {
    var untrained = QuilvynUtils.getAttrValue(attrs, 'Untrained');
    SRD35.skillRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Ability'),
      untrained != 'n' && untrained != 'N',
      QuilvynUtils.getAttrValueArray(attrs, 'Class'),
      QuilvynUtils.getAttrValueArray(attrs, 'Synergy')
    );
    SRD35.skillRulesExtra(rules, name);
  } else if(type == 'Spell') {
    var description = QuilvynUtils.getAttrValue(attrs, 'Description');
    var groupLevels = QuilvynUtils.getAttrValueArray(attrs, 'Level');
    var school = QuilvynUtils.getAttrValue(attrs, 'School');
    var schoolAbbr = (school || 'Universal').substring(0, 4);
    for(var i = 0; i < groupLevels.length; i++) {
      var matchInfo = (groupLevels[i] + '').match(/^(\D+)(\d+)$/);
      if(!matchInfo) {
        console.log('Bad level "' + groupLevels[i] + '" for spell ' + name);
        continue;
      }
      var group = matchInfo[1];
      var level = matchInfo[2] * 1;
      var fullName = name + '(' + group + level + ' ' + schoolAbbr + ')';
      // TODO indicate domain spells in attributes?
      var domainSpell = SRD35.PATHS[group + ' Domain'] != null;
      SRD35.spellRules
        (rules, fullName, school, group, level, description, domainSpell);
      rules.addChoice('spells', fullName, attrs);
    }
  } else if(type == 'Weapon')
    SRD35.weaponRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Level'),
      QuilvynUtils.getAttrValue(attrs, 'Category'),
      QuilvynUtils.getAttrValue(attrs, 'Damage'),
      QuilvynUtils.getAttrValue(attrs, 'Threat'),
      QuilvynUtils.getAttrValue(attrs, 'Crit'),
      QuilvynUtils.getAttrValue(attrs, 'Range')
    );
  else {
    console.log('Unknown choice type "' + type + '"');
    return;
  }
  if(type != 'Feature' && type != 'Path' && type != 'Spell') {
    type = type == 'Class' ? 'levels' :
    type = type == 'Deity' ? 'deities' :
    (type.charAt(0).toLowerCase() + type.substring(1).replaceAll(' ', '') + 's');
    rules.addChoice(type, name, attrs);
  }
};

/* Defines in #rules# the rules associated with alignment #name#. */
SRD35.alignmentRules = function(rules, name) {
  if(!name) {
    console.log('Empty alignment name');
    return;
  }
  // No rules pertain to alignment
};

/*
 * Defines in #rules# the rules associated with armor #name#, which adds #ac#
 * to the character's armor class, requires a #weight# proficiency level to
 * use effectively, allows a maximum dex bonus to ac of #maxDex#, imposes
 * #skillPenalty# on specific skills and yields a #spellFail# percent chance of
 * arcane spell failure.
 */
SRD35.armorRules = function(
  rules, name, ac, weight, maxDex, skillPenalty, spellFail
) {

  if(!name) {
    console.log('Empty armor name');
    return;
  }
  if(typeof ac != 'number') {
    console.log('Bad ac "' + ac + '" for armor ' + name);
    return;
  }
  if(weight == null ||
     !(weight + '').match(/^([0-3]|none|light|medium|heavy)$/i)) {
    console.log('Bad weight "' + weight + '" for armor ' + name);
    return;
  }
  if(typeof maxDex != 'number') {
    console.log('Bad max dex "' + maxDex + '" for armor ' + name);
    return;
  }
  if(typeof skillPenalty != 'number') {
    console.log('Bad skill penalty "' + skillPenalty + '" for armor ' + name);
    return;
  }
  if(typeof spellFail != 'number') {
    console.log('Bad spell fail "' + spellFail + '" for armor ' + name);
    return;
  }

  if((weight + '').match(/^[0-3]$/))
    ; // empty
  else if(weight.match(/^none$/i))
    weight = 0;
  else if(weight.match(/^light$/i))
    weight = 1;
  else if(weight.match(/^medium$/i))
    weight = 2;
  else if(weight.match(/^heavy$/i))
    weight = 3;

  if(rules.armorStats == null) {
    rules.armorStats = {
      ac:{},
      weight:{},
      dex:{},
      skill:{},
      spell:{}
    };
  }
  rules.armorStats.ac[name] = ac;
  rules.armorStats.weight[name] = weight;
  rules.armorStats.dex[name] = maxDex;
  rules.armorStats.skill[name] = skillPenalty;
  rules.armorStats.spell[name] = spellFail;

  rules.defineRule('armorClass',
    '', '=', '10',
    'armor', '+', QuilvynUtils.dictLit(rules.armorStats.ac) + '[source]'
  );
  rules.defineRule('armorWeight',
    'armor', '=', QuilvynUtils.dictLit(rules.armorStats.weight) + '[source]'
  );
  rules.defineRule('combatNotes.dexterityArmorClassAdjustment',
    'armor', 'v', QuilvynUtils.dictLit(rules.armorStats.dex) + '[source]'
  );
  rules.defineRule('combatNotes.nonproficientArmorPenalty',
    'armorProficiencyLevelShortfall', '?', 'source > 0',
    'armor', '=', '-'+QuilvynUtils.dictLit(rules.armorStats.skill)+'[source]'
  );
  rules.defineRule('magicNotes.arcaneSpellFailure',
    'casterLevelArcane', '?', null,
    'armor', '+=', QuilvynUtils.dictLit(rules.armorStats.spell) + '[source]'
  );
  rules.defineRule('skillNotes.armorSkillCheckPenalty',
    'armor', '=', QuilvynUtils.dictLit(rules.armorStats.skill) + '[source]',
    '', '^', '0'
  );

};

/*
 * Defines in #rules# the rules associated with class #name#, which has the list
 * of hard prerequisites #requires#. The class grants #hitDie# (format [n]'d'n)
 * additional hit points and #skillPoints# additional skill points with each
 * level advance. #attack# is one of '1', '1/2', or '3/4', indicating the base
 * attack progression for the class; similarly, #saveFort#, #saveRef#, and
 * #saveWill# are each one of '1/2' or '1/3', indicating the saving throw
 * progressions. #skills# indicate class skills for the class; see skillRules
 * for an alternate way these can be defined. #features# and #selectables# list
 * the fixed and selectable features acquired as the character advances in
 * class level, and #languages# lists any automatic languages for the class.
 * #casterLevelArcane# and #casterLevelDivine#, if specified, give the
 * Javascript expression for determining the caster level for the class; these
 * can incorporate a class level attribute (e.g., 'levels.Cleric') or the
 * character level attribute 'level'. If the class grants spell slots,
 * #spellAbility# names the ability for computing spell difficulty class, and
 * #spellSlots# lists the number of spells per level per day granted.
 */
SRD35.classRules = function(
  rules, name, requires, hitDie, attack, skillPoints, saveFort, saveRef,
  saveWill, skills, features, selectables, languages, casterLevelArcane,
  casterLevelDivine, spellAbility, spellSlots
) {

  if(!name) {
    console.log('Empty class name');
    return;
  }
  if(!Array.isArray(requires)) {
    console.log('Bad requires list "' + requires + '" for class ' + name);
    return;
  }
  if(!hitDie.match(/^(\d+)?d\d+$/)) {
    console.log('Bad hitDie "' + hitDie + '" for class ' + name);
    return;
  }
  if(!(attack + '').match(/^(1|1\/2|3\/4)$/)) {
    console.log('Bad attack "' + hitDie + '" for class ' + name);
    return;
  }
  if(typeof skillPoints != 'number') {
    console.log('Bad skillPoints "' + skillPoints + '" for class ' + name);
    return;
  }
  if(!(saveFort + '').match(/^(1\/2|1\/3)$/)) {
    console.log('Bad saveFort "' + saveFort + '" for class ' + name);
    return;
  }
  if(!(saveRef + '').match(/^(1\/2|1\/3)$/)) {
    console.log('Bad saveRef "' + saveRef + '" for class ' + name);
    return;
  }
  if(!(saveWill + '').match(/^(1\/2|1\/3)$/)) {
    console.log('Bad saveWill "' + saveWill + '" for class ' + name);
    return;
  }
  if(!Array.isArray(skills)) {
    console.log('Bad skills list "' + skills + '" for class ' + name);
    return;
  }
  if(rules.getChoices('skills')) {
    for(var i = 0; i < skills.length; i++) {
      if(!(skills[i] in rules.getChoices('skills')) &&
         QuilvynUtils.getKeys(rules.getChoices('skills')).filter(skill => skill.startsWith(skills[i] + ' (')).length == 0) {
        console.log('Bad skill "' + skills[i] + '" for class ' + name);
        // Warning only - not critical to definition
      }
    }
  }
  if(!Array.isArray(features)) {
    console.log('Bad features list "' + features + '" for class ' + name);
    return;
  }
  if(!Array.isArray(selectables)) {
    console.log('Bad selectables list "' + selectables + '" for class ' + name);
    return;
  }
  if(!Array.isArray(languages)) {
    console.log('Bad languages list "' + languages + '" for class ' + name);
    return;
  }
  if(rules.getChoices('languages')) {
    for(var i = 0; i < languages.length; i++) {
      if(languages[i] != 'any' &&
         !(languages[i] in rules.getChoices('languages'))) {
        console.log('Bad language "' + languages[i] + '" for class ' + name);
        // Warning only - not critical to definition
      }
    }
  }
  if(spellAbility) {
    spellAbility = spellAbility.toLowerCase();
    if(!(spellAbility.charAt(0).toUpperCase() + spellAbility.substring(1) in SRD35.ABILITIES)) {
      console.log('Bad spellAbility "' + spellAbility + '" for class ' + name);
      return;
    }
  }
  if(!Array.isArray(spellSlots)) {
    console.log('Bad spellSlots list "' + spellSlots + '" for class ' + name);
    return;
  }
 
  var classLevel = 'levels.' + name;
  var prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '');

  if(requires.length > 0)
    QuilvynRules.prerequisiteRules
      (rules, 'validation', prefix + 'Class', classLevel, requires);

  rules.defineRule('baseAttack',
    classLevel, '+', attack == '1/2' ? 'Math.floor(source / 2)' :
                     attack == '3/4' ? 'Math.floor(source * 3 / 4)' :
                     'source'
  );

  var saves = {'Fortitude':saveFort, 'Reflex':saveRef, 'Will':saveWill};
  for(var save in saves) {
    rules.defineRule('class' + save + 'Bonus',
      classLevel, '+=', saves[save] == '1/2' ? SRD35.SAVE_BONUS_HALF :
                        SRD35.SAVE_BONUS_THIRD
    );
    rules.defineRule('save.' + save, 'class' + save + 'Bonus', '+', null);
  }

  rules.defineRule
    ('skillPoints', classLevel, '+', '(source + 3) * ' + skillPoints);

  for(var i = 0; i < skills.length; i++) {
    rules.defineRule('classSkills.' + skills[i], classLevel, '=', '1');
  }

  QuilvynRules.featureListRules(rules, features, name, classLevel, false);
  QuilvynRules.featureListRules(rules, selectables, name, classLevel, true);
  rules.defineSheetElement(name + ' Features', 'Feats+', null, '; ');
  rules.defineChoice('extras', prefix + 'Features');

  if(languages.length > 0) {
    rules.defineRule('languageCount', classLevel, '+', languages.length);
    for(var i = 0; i < languages.length; i++) {
      if(languages[i] != 'any')
        rules.defineRule('languages.' + languages[i], classLevel, '=', '1');
    }
  }

  if(spellSlots.length > 0) {

    var casterLevelExpr = casterLevelArcane || casterLevelDivine || classLevel;
    if(casterLevelExpr.match(new RegExp('\\b' + classLevel + '\\b', 'i'))) {
      rules.defineRule('casterLevels.' + name,
        classLevel, '=', casterLevelExpr.replace(new RegExp('\\b' + classLevel + '\\b', 'gi'), 'source'),
      'magicNotes.casterLevelBonus', '+', null
      );
    } else {
      rules.defineRule('casterLevels.' + name,
        classLevel, '?', null,
        'level', '=', casterLevelExpr.replace(new RegExp('\\blevel\\b', 'gi'), 'source'),
      'magicNotes.casterLevelBonus', '+', null
      );
    }
    if(casterLevelArcane)
      rules.defineRule('casterLevelArcane', 'casterLevels.' + name, '+=', null);
    if(casterLevelDivine)
      rules.defineRule('casterLevelDivine', 'casterLevels.' + name, '+=', null);

    rules.defineRule('spellSlotLevel.' + name,
      classLevel, '=', null,
      'magicNotes.casterLevelBonus', '+', null
    );
    QuilvynRules.spellSlotRules(rules, 'spellSlotLevel.' + name, spellSlots);

    for(var i = 0; i < spellSlots.length; i++) {
      var matchInfo = spellSlots[i].match(/^(\D+)(\d):/);
      if(!matchInfo) {
        console.log('Bad format for spell slot "' + spellSlots[i] + '"');
        continue;
      }
      var spellLevel = matchInfo[2] * 1;
      var spellType = matchInfo[1];
      if(spellType != name)
        rules.defineRule
          ('casterLevels.' + spellType, 'casterLevels.' + name, '^=', null);
      rules.defineRule('spellDifficultyClass.' + spellType,
        'casterLevels.' + spellType, '?', null,
        spellAbility + 'Modifier', '=', '10 + source'
      );
      if(spellLevel > 0 && spellLevel < 5 && spellType != 'Domain') {
        var note = 'magicNotes.' + spellAbility + name + 'SpellSlotBonus';
        rules.defineChoice('notes', note + ':%1');
        rules.defineRule(note,
          spellAbility + 'Modifier', '?', 'source >= 1',
          'spellSlots.' + spellType + '1', '=', '1'
        );
        rules.defineRule(note + '.1',
          note, '?', null,
          spellAbility + 'Modifier', '=',
            'source>=1 ? ["Spell level ' + spellType + '1", "' + spellType + '2", "' + spellType + '3", "' + spellType + '4"].slice(0, source).join(", ") : null'
        );
        rules.defineRule('spellSlots.' + spellType + spellLevel,
          note + '.1', '+', 'source.includes("' + spellType + spellLevel + '") ? 1 : null'
        );
      }
    }
  }

};

/*
 * Defines in #rules# the rules associated with class #name# that cannot be
 * derived directly from the attributes passed to classRules.
 */
SRD35.classRulesExtra = function(rules, name) {

  if(name == 'Barbarian') {

    rules.defineRule('barbarianFeatures.Improved Uncanny Dodge',
      'barbarianFeatures.Uncanny Dodge', '?', null,
      'uncannyDodgeSources', '=', 'source >= 2 ? 1 : null'
    );
    rules.defineRule('combatNotes.damageReduction',
      'levels.Barbarian', '^=', 'Math.floor((source - 4) / 3)'
    );
    rules.defineRule('combatNotes.improvedUncannyDodge',
      'levels.Barbarian', '+=', null,
      '', '+', '4'
    );
    rules.defineRule('combatNotes.rage',
      'constitutionModifier', '=', '5 + source',
      'extraRages', '+', null
    );
    rules.defineRule('combatNotes.rage.1',
      'features.Rage', '?', null,
      'levels.Barbarian', '+=', '1 + Math.floor(source / 4)'
    );
    rules.defineRule
      ('damageReduction.-', 'combatNotes.damageReduction', '^=', null);
    rules.defineRule('extraRages',
      'features.Greater Rage', '+=', '1',
      'features.Mighty Rage', '+=', '1'
    );
    rules.defineRule('saveNotes.trapSense',
      'levels.Barbarian', '+=', 'Math.floor(source / 3)'
    );
    rules.defineRule
      ('uncannyDodgeSources', 'barbarianFeatures.Uncanny Dodge', '+=', '1');

  } else if(name == 'Bard') {

    rules.defineRule('featureNotes.bardicMusic', 'levels.Bard', '=', null);
    rules.defineRule('magicNotes.arcaneSpellFailure',
      'magicNotes.simpleSomatics.1', 'v', '0'
    );
    // Compute in simpleSomatics.1 so that note will show even if character is
    // wearing heavy armor
    rules.defineRule('magicNotes.simpleSomatics.1',
      'magicNotes.simpleSomatics', '?', null,
      'armorWeight', '=', 'source <= 1 ? 1 : null'
    );
    rules.defineRule('skillNotes.bardicKnowledge',
      'levels.Bard', '=', null,
      'intelligenceModifier', '+', null,
      'skillNotes.knowledge(History)Synergy', '+', '2'
    );

  } else if(name == 'Cleric') {

    rules.defineRule('combatNotes.charismaTurningAdjustment',
      'turningLevel', '?', null,
      'charismaModifier', '=', null
    );
    rules.defineRule('combatNotes.turnUndead.1',
      'turningLevel', '=', null,
      'combatNotes.charismaTurningAdjustment', '+', null
    );
    rules.defineRule('combatNotes.turnUndead.2',
      'turningLevel', '=', 'source * 3 - 10',
      'combatNotes.charismaTurningAdjustment', '+', null
    );
    rules.defineRule('combatNotes.turnUndead.3',
      'turningLevel', '=', '3',
      'combatNotes.charismaTurningAdjustment', '+', null
    );
    rules.defineRule
      ('selectableFeatureCount.Cleric', 'levels.Cleric', '=', '2');
    rules.defineRule('turningLevel', 'levels.Cleric', '+=', null);

  } else if(name == 'Druid') {

    rules.defineRule('companionMasterLevel', 'levels.Druid', '^=', null);
    rules.defineRule('magicNotes.wildShape',
      'levels.Druid', '=',
        'source < 5 ? null : ' +
        'source < 8 ? "small-medium" : ' +
        'source < 11 ? "small-large" : ' +
        'source == 11 ? "tiny-large" : ' +
        'source < 15 ? "tiny-large/plant" : "tiny-huge/plant"'
    );
    rules.defineRule('magicNotes.wildShape.1', 'levels.Druid', '=', null);
    rules.defineRule('magicNotes.wildShape.2',
      'levels.Druid', '=',
         'source < 5 ? null : ' +
         'source == 5 ? 1 : ' +
         'source == 6 ? 2 : ' +
         'source < 10 ? 3 : ' +
         'source < 14 ? 4 : ' +
         'source < 18 ? 5 : 6'
    );
    rules.defineRule('skillNotes.wildEmpathy',
      'levels.Druid', '+=', null,
      'charismaModifier', '+', null
    );

  } else if(name == 'Fighter') {

    rules.defineRule('featCount.Fighter',
      'levels.Fighter', '=', '1 + Math.floor(source / 2)'
    );

  } else if(name == 'Monk') {

    rules.defineRule('abilityNotes.fastMonkMovement',
      'armor', '?', 'source == "None"',
      'levels.Monk', '=', 'Math.floor(source / 3) * 10'
    );
    rules.defineRule('combatNotes.armorClassBonus',
      'levels.Monk', '=', 'Math.floor(source / 5)',
      'wisdomModifier', '+', 'source > 0 ? source : null'
    );
    // NOTE Our rule engine doesn't support modifying a value via indexing.
    // Here, we work around this limitation by defining rules that set global
    // values as a side effect, then use these values in our calculations.
    rules.defineRule('combatNotes.increasedUnarmedDamage',
      'levels.Monk', '=',
        'SRD35.SMALL_DAMAGE["monk"] = ' +
        'SRD35.LARGE_DAMAGE["monk"] = ' +
        'source < 12 ? ("d" + (6 + Math.floor(source / 4) * 2)) : ' +
        '              ("2d" + (6 + Math.floor((source - 12) / 4) * 2))',
      'features.Small', '=', 'SRD35.SMALL_DAMAGE[SRD35.SMALL_DAMAGE["monk"]]',
      'features.Large', '=', 'SRD35.LARGE_DAMAGE[SRD35.LARGE_DAMAGE["monk"]]'
    );
    rules.defineRule
      ('damageReduction.Magic', 'combatNotes.perfectSelf', '^=', '10');
    rules.defineRule
      ('saveNotes.diamondSoul', 'levels.Monk', '=', '10 + source');
    rules.defineRule('selectableFeatureCount.Monk',
      'levels.Monk', '=', 'source < 2 ? 1 : source < 6 ? 2 : 3'
    );
    rules.defineRule('spellResistance', 'saveNotes.diamondSoul', '^=', null);

  } else if(name == 'Paladin') {

    rules.defineRule('combatNotes.smiteEvil',
      'levels.Paladin', '+=', '1 + Math.floor(source / 5)'
    );
    rules.defineRule('combatNotes.smiteEvil.1',
      'features.Smite Evil', '?', null,
      'charismaModifier', '=', 'Math.max(source, 0)'
    );
    rules.defineRule('combatNotes.smiteEvil.2',
      'features.Smite Evil', '?', null,
      'levels.Paladin', '+=', null
    );
    rules.defineRule('saveNotes.divineGrace', 'charismaModifier', '=', null);
    rules.defineRule('turningLevel',
      'levels.Paladin', '+=', 'source > 3 ? source - 3 : null'
    );

    // Use animal companion stats and features for Paladin's mount abilities
    var features = [
      '5:Companion Evasion', '5:Companion Improved Evasion', 
      '5:Empathic Link', '5:Share Saving Throws', '5:Share Spells',
      '8:Improved Speed', '11:Command Like Creatures',
      '15:Companion Spell Resistance'
    ];
    QuilvynRules.featureListRules
      (rules, features, 'Animal Companion', 'mountMasterLevel', false);
    rules.defineRule('animalCompanionStats.AC',
      'levels.Paladin', '+', 'source<8 ? 4 : source<11 ? 6 : source<15 ? 8 : 10'
    );
    rules.defineRule('animalCompanionStats.HD',
      'levels.Paladin', '+', 'source<8 ? 2 : source<11 ? 4 : source<15 ? 6 : 8'
    );
    rules.defineRule('animalCompanionStats.Int',
      'levels.Paladin', '^', 'source<8 ? 6 : source<11 ? 7 : source<15 ? 8 : 9'
    );
    rules.defineRule('animalCompanionStats.Save Fort',
      'companionNotes.shareSavingThrows.1', '+', null
    );
    rules.defineRule('animalCompanionStats.Save Ref',
      'companionNotes.shareSavingThrows.2', '+', null
    );
    rules.defineRule('animalCompanionStats.Save Will',
      'companionNotes.shareSavingThrows.3', '+', null
    );
    rules.defineRule('animalCompanionStats.Str',
      'levels.Paladin', '+', 'source<8 ? 1 : source<11 ? 2 : source<15 ? 3 : 4'
    );
    rules.defineRule('animalCompanionStats.SR',
      'levels.Paladin', '=', 'source >= 15 ? source + 5 : null'
    );
    rules.defineRule
      ('companionAttackBoosts', 'levels.Paladin', '=', '(source - 2) / 6');
    rules.defineRule('companionNotes.shareSavingThrows.1',
      // Use base note in calculation so Quilvyn displays it in italics
      'companionNotes.shareSavingThrows', '?', null,
      'classFortitudeBonus', '=', null,
      'animalCompanionStats.HD', '+', '-(' + SRD35.SAVE_BONUS_HALF + ')',
      '', '^', '0'
    );
    rules.defineRule('companionNotes.shareSavingThrows.2',
      'companionNotes.shareSavingThrows', '?', null,
      'classReflexBonus', '=', null,
      'animalCompanionStats.HD', '+', '-(' + SRD35.SAVE_BONUS_HALF + ')',
      '', '^', '0'
    );
    rules.defineRule('companionNotes.shareSavingThrows.3',
      'companionNotes.shareSavingThrows', '?', null,
      'classWillBonus', '=', null,
      'animalCompanionStats.HD', '+', '-(' + SRD35.SAVE_BONUS_THIRD + ')',
      '', '^', '0'
    );
    rules.defineRule('mountMasterLevel',
      'hasCompanion', '?', null,
      'levels.Paladin', '=', null
    );

  } else if(name == 'Ranger') {

    rules.defineRule('companionMasterLevel',
      'levels.Ranger', '^=', 'source < 4 ? null : Math.floor(source / 2)'
    );
    rules.defineRule('combatNotes.favoredEnemy',
      'levels.Ranger', '+=', '1 + Math.floor(source / 5)'
    );
    rules.defineRule('selectableFeatureCount.Ranger',
      'levels.Ranger', '=', 'source >= 2 ? 1 : null'
    );
    rules.defineRule('skillNotes.favoredEnemy',
      'levels.Ranger', '+=', '1 + Math.floor(source / 5)'
    );
    rules.defineRule('skillNotes.wildEmpathy',
      'levels.Ranger', '+=', null,
      'charismaModifier', '+', null
    );

  } else if(name == 'Rogue') {

    rules.defineRule('combatNotes.improvedUncannyDodge',
      'levels.Rogue', '+=', null,
      '', '+', '4'
    );
    rules.defineRule('combatNotes.sneakAttack', 'sneakAttack', '=', null);
    rules.defineRule('saveNotes.trapSense',
      'levels.Rogue', '+=', 'Math.floor(source / 3)'
    );
    rules.defineRule('selectableFeatureCount.Rogue',
      'levels.Rogue', '=', 'source>=10 ? Math.floor((source-7)/3) : null'
    );
    rules.defineRule('skillNotes.skillMastery',
      'intelligenceModifier', '=', 'source + 3',
      'rogueFeatures.Skill Mastery', '*', null
    );
    rules.defineRule('rogueFeatures.Improved Uncanny Dodge',
      'rogueFeatures.Uncanny Dodge', '?', null,
      'uncannyDodgeSources', '=', 'source >= 2 ? 1 : null'
    );
    rules.defineRule
      ('uncannyDodgeSources', 'rogueFeatures.Uncanny Dodge', '+=', '1');
    rules.defineRule('sneakAttack',
      'levels.Rogue', '+=', 'Math.floor((source + 1) / 2)'
    );

  } else if(name == 'Sorcerer') {

    rules.defineRule('familiarMasterLevel', 'levels.Sorcerer', '^=', null);

  } else if(name == 'Wizard') {

    rules.defineRule('familiarMasterLevel', 'levels.Wizard', '^=', null);
    rules.defineRule('featCount.Wizard',
      'levels.Wizard', '=', 'source >= 5 ? Math.floor(source / 5) : null'
    );
    rules.defineRule('selectableFeatureCount.Wizard (Specialization)',
      'levels.Wizard', '=', '1'
    );
    for(var school in rules.getChoices('schools')) {
      rules.defineRule('selectableFeatureCount.Wizard (Opposition)',
        'wizardFeatures.School Specialization (' + school + ')', '=',
          school == 'Divination' ? '1' : '2'
      );
    }

  } else if(name == 'Arcane Archer') {

    rules.defineRule('combatNotes.enhanceArrow',
      'levels.Arcane Archer', '+=', 'Math.floor((source + 1) / 2)'
    );
    rules.defineRule
      ('combatNotes.hailOfArrows', 'levels.Arcane Archer', '+=', null);

  } else if(name == 'Arcane Trickster') {

    rules.defineRule('combatNotes.impromptuSneakAttack',
      'levels.Arcane Trickster', '+=', 'source < 7 ? 1 : 2'
    );
    rules.defineRule('combatNotes.rangedLegerdemain',
      'levels.Arcane Trickster', '+=', 'Math.floor((source + 3) / 4)'
    );
    rules.defineRule('combatNotes.sneakAttack', 'sneakAttack', '=', null);
    rules.defineRule
      ('magicNotes.casterLevelBonus', 'levels.Arcane Trickster', '+=', null);
    rules.defineRule('sneakAttack',
      'levels.Arcane Trickster', '+=', 'Math.floor(source / 2)'
    );

  } else if(name == 'Archmage') {

    var allSpells = rules.getChoices('spells');
    var matchInfo;
    for(var spell in allSpells) {
      if((matchInfo = spell.match(/\(\w+5 (\w+)\)/)) != null) {
        var school = matchInfo[1];
        rules.defineRule
          ('level5' + school + 'Spells', 'spells.' + spell, '+=', '1');
        rules.defineRule
          ('level5SpellSchools', 'level5' + school + 'Spells', '+=', '1');
      }
    }

    rules.defineRule('featureNotes.highArcana', 'levels.Archmage', '=', null);
    rules.defineRule
      ('magicNotes.casterLevelBonus', 'levels.Archmage', '+=', null);
    rules.defineRule
      ('selectableFeatureCount.Archmage', 'featureNotes.highArcana', '+=', null);
    rules.defineRule('magicNotes.arcaneFire', 'levels.Archmage', '=', null);
    rules.defineRule('magicNotes.arcaneFire.1',
      'features.Arcane Fire', '?', null,
      'levels.Archmage', '=', '400 + 40 * source'
    );

    rules.defineRule('spellSlots.S5',
      'archmageFeatures.Spell Power', '+', '-1',
      'archmageFeatures.Spell-Like Ability', '+', '-1'
    );
    rules.defineRule('spellSlots.W5',
      'archmageFeatures.Spell Power', '+', '-1',
      'archmageFeatures.Spell-Like Ability', '+', '-1'
    );
    rules.defineRule
      ('spellSlots.S6', 'archmageFeatures.Mastery Of Shaping', '+', '-1');
    rules.defineRule
      ('spellSlots.W6', 'archmageFeatures.Mastery Of Shaping', '+', '-1');
    rules.defineRule('spellSlots.S7',
      'archmageFeatures.Arcane Reach', '+', '-1',
      'archmageFeatures.Improved Arcane Reach', '+', '-1',
      'archmageFeatures.Mastery Of Counterspelling', '+', '-1'
    );
    rules.defineRule('spellSlots.W7',
      'archmageFeatures.Arcane Reach', '+', '-1',
      'archmageFeatures.Improved Arcane Reach', '+', '-1',
      'archmageFeatures.Mastery Of Counterspelling', '+', '-1'
    );
    rules.defineRule
      ('spellSlots.S8', 'archmageFeatures.Mastery Of Elements', '+', '-1');
    rules.defineRule
      ('spellSlots.W8', 'archmageFeatures.Mastery Of Elements', '+', '-1');
    rules.defineRule
      ('spellSlots.S9', 'archmageFeatures.Arcane Fire', '+', '-1');
    rules.defineRule
      ('spellSlots.W9', 'archmageFeatures.Arcane Fire', '+', '-1');

  } else if(name == 'Assassin') {

    rules.defineRule('combatNotes.sneakAttack', 'sneakAttack', '=', null);
    rules.defineRule('assassinFeatures.Improved Uncanny Dodge',
      'assassinFeatures.Uncanny Dodge', '?', null,
      'uncannyDodgeSources', '=', 'source >= 2 ? 1 : null'
    );
    rules.defineRule('combatNotes.improvedUncannyDodge',
      'levels.Assassin', '+=', 'source >= 2 ? source : null',
      '', '+', '4'
    );
    rules.defineRule('uncannyDodgeSources',
      'levels.Assassin', '+=', 'source >= 2 ? 1 : null'
    );
    rules.defineRule('sneakAttack',
      'levels.Assassin', '+=', 'Math.floor((source + 1) / 2)'
    );

  } else if(name == 'Blackguard') {

    rules.defineRule
      ('combatNotes.commandUndead', 'levels.Blackguard', '=', 'source - 2');
    rules.defineRule('combatNotes.smiteGood',
      'charismaModifier', '=', 'source > 0 ? source : 0'
    );
    rules.defineRule('combatNotes.smiteGood.1', 'levels.Blackguard', '=', null);
    rules.defineRule('combatNotes.smiteGood.2',
      'levels.Blackguard', '+=', 'source<2 ? null : 1 + Math.floor(source/5)'
    );
    rules.defineRule('combatNotes.sneakAttack', 'sneakAttack', '=', null);
    rules.defineRule
      ('features.Turn Undead', 'features.Command Undead', '=', '1');
    rules.defineRule('magicNotes.blackguardHands',
      'level', '+=', null,
      'charismaModifier', '*', null
    );
    rules.defineRule('saveNotes.darkBlessing',
      'charismaModifier', '=', 'source > 0 ? source : null'
    );
    rules.defineRule('turningLevel', 'combatNotes.commandUndead', '+=', null);
    // Fallen paladin features
    rules.defineRule('blackguardFeatures.Blackguard Hands',
      'levels.Paladin', '?', 'source >= 3'
    );
    rules.defineRule('blackguardFeatures.Fiendish Summoning',
      'levels.Paladin', '?', 'source >= 7'
    );
    rules.defineRule('blackguardFeatures.Undead Companion',
      'levels.Paladin', '?', 'source >= 9'
    );
    rules.defineRule('combatNotes.smiteGood',
      'levels.Paladin', '+', 'source >= 9 ? 3 : source >= 5 ? 2 : 1'
    );
    rules.defineRule('sneakAttack',
      'levels.Blackguard', '+=', 'source<4 ? null : Math.floor((source-1)/3)'
    );
    // NOTE: Minor bug: this will also effect the sneak attack feature of
    // some unlikely combinations, e.g., rogue/paladin
    rules.defineRule('sneakAttack',
      'levels.Paladin', '+', 'source >= 5 ? 1 : null'
    );

    // Use animal companion stats and features for fiendish servant abilities
    var features = [
      '5:Companion Evasion', '5:Companion Improved Evasion', 
      '5:Empathic Link', '5:Share Saving Throws', '5:Share Spells',
      '13:Speak With Master', '16:Blood Bond', '19:Companion Spell Resistance'
    ];
    QuilvynRules.featureListRules
      (rules, features, 'Animal Companion', 'fiendishServantMasterLevel', false);
    rules.defineRule('animalCompanionStats.AC',
      'fiendishServantMasterLevel', '+',
      'Math.max(Math.floor((source - 10) / 3) * 2 + 1, 1)'
    );
    rules.defineRule('animalCompanionStats.HD',
      'fiendishServantMasterLevel', '+',
      'Math.max(Math.floor((source - 7) / 3) * 2, 2)'
    );
    rules.defineRule('animalCompanionStats.Int',
      'fiendishServantMasterLevel', '^',
      'Math.max(Math.floor((source - 7) / 3) + 5, 6)'
    );
    rules.defineRule('animalCompanionStats.Str',
      'fiendishServantMasterLevel', '+',
      'Math.max(Math.floor((source - 7) / 3), 1)'
    );
    rules.defineRule('animalCompanionStats.SR',
      'fiendishServantMasterLevel', '=', 'source >= 19 ? source + 5 : null'
    );
    rules.defineRule('fiendishServantMasterLevel',
      'hasCompanion', '?', null,
      'levels.Blackguard', '?', 'source < 5 ? null : source',
      'level', '=', null
    );
    // Add fiendish servants choices not in the standard animal companion list
    rules.choiceRules(rules, 'Animal Companion', 'Bat', SRD35.FAMILIARS.Bat);
    rules.choiceRules(rules, 'Animal Companion', 'Cat', SRD35.FAMILIARS.Cat);
    rules.choiceRules
      (rules, 'Animal Companion', 'Raven', SRD35.FAMILIARS.Raven);
    rules.choiceRules
      (rules, 'Animal Companion', 'Toad', SRD35.FAMILIARS.Toad);

  } else if(name == 'Dragon Disciple') {

    rules.defineRule('abilityNotes.strengthBoost',
      'levels.Dragon Disciple', '+=', 'source>=4 ? 4 : source>=2 ? 2 : null'
    );
    rules.defineRule('combatNotes.breathWeapon',
      'levels.Dragon Disciple', '=', 'source < 7 ? 2 : source < 10 ? 4 : 6'
    );
    rules.defineRule('combatNotes.breathWeapon.1',
      'levels.Dragon Disciple', '=', '10 + source',
      'constitutionModifier', '+', null
    );
    rules.defineRule('combatNotes.naturalArmor',
      'levels.Dragon Disciple', '+=', 'Math.floor((source + 2) / 3)'
    );
    rules.defineRule('featureNotes.blindsense',
      'levels.Dragon Disciple', '+=', 'source<5 ? null : source<10 ? 30 : 60'
    );
    rules.defineRule
      ('features.Darkvision', 'featureNotes.dragonApotheosis', '=', '1');
    rules.defineRule
      ('features.Low-Light Vision', 'featureNotes.dragonApotheosis', '=', '1');
    rules.defineRule('magicNotes.bonusSpells',
      'levels.Dragon Disciple', '+=',
        'source - (source == 10 ? 3 : source >= 7 ? 2 : source >= 3 ? 1 : 0)'
    );
    rules.choiceRules(rules, 'Weapon', 'Bite', 'Level=1 Category=Un Damage=d6');
    rules.choiceRules(rules, 'Weapon', 'Claw', 'Level=1 Category=Un Damage=d4');
    rules.defineRule('weapons.Bite', 'combatNotes.biteAttack', '=', '1');
    rules.defineRule('weapons.Claw', 'combatNotes.clawAttack', '=', '1');

  } else if(name == 'Duelist') {

    rules.defineRule('armorClass', 'combatNotes.cannyDefense.1', '+', null);
    rules.defineRule('combatNotes.cannyDefense',
      'intelligenceModifier', '+=', 'Math.max(source, 0)',
      'levels.Duelist', 'v', null
    );
    rules.defineRule('combatNotes.cannyDefense.1',
      'armor', '?', 'source == "None"',
      'shield', '?', 'source == "None"',
      'combatNotes.cannyDefense', '=', null
    );
    rules.defineRule('combatNotes.improvedReaction',
      'levels.Duelist', '+=', 'source < 2 ? null : source < 8 ? 2 : 4'
    );
    rules.defineRule('saveNotes.grace.1',
      'armor', '?', 'source == "None"',
      'shield', '?', 'source == "None"',
      'saveNotes.grace', '=', '2'
    );
    rules.defineRule('save.Reflex', 'saveNotes.grace.1', '+', null);

  } else if(name == 'Dwarven Defender') {

    rules.defineRule('combatNotes.damageReduction',
      'levels.Dwarven Defender', '^=', 'source<6 ? null : source<10 ? 3 : 6'
    );
    rules.defineRule('combatNotes.defenderArmorClassBonus',
      'levels.Dwarven Defender', '+=', 'Math.floor((source + 2) / 3)'
    );
    rules.defineRule
      ('damageReduction.-', 'combatNotes.damageReduction', '^=', null);
    rules.defineRule('featureNotes.defensiveStance',
      'constitutionModifier', '+=', 'source + 5'
    );
    rules.defineRule('featureNotes.defensiveStance.1',
      'levels.Dwarven Defender', '+=', 'Math.floor((source + 1) / 2)'
    );
    rules.defineRule('saveNotes.trapSense',
      'levels.Dwarven Defender', '+=', 'Math.floor(source / 4)'
    );
    rules.defineRule('dwarvenDefenderFeatures.Improved Uncanny Dodge',
      'dwarvenDefenderFeatures.Uncanny Dodge', '?', null,
      'uncannyDodgeSources', '=', 'source >= 2 ? 1 : null'
    );
    rules.defineRule('combatNotes.improvedUncannyDodge',
      'levels.Dwarven Defender', '+=', 'source >= 2 ? source : null',
      '', '+', '4'
    );
    rules.defineRule('uncannyDodgeSources',
      'levels.Dwarven Defender', '+=', 'source >= 2 ? 1 : null'
    );

  } else if(name == 'Eldritch Knight') {

    rules.defineRule('featCount.Fighter', 'levels.Eldritch Knight', '^=','0');
    rules.defineRule('magicNotes.casterLevelBonus',
      'levels.Eldritch Knight', '+=', 'source - 1'
    );
 
  } else if(name == 'Hierophant') {

    rules.defineRule
      ('selectableFeatureCount.Hierophant', 'levels.Hierophant', '=', null);
    rules.defineRule('combatNotes.turnUndead.1',
      'combatNotes.masteryOfEnergy', '+', '4'
    );
    rules.defineRule('combatNotes.turnUndead.2',
      'combatNotes.masteryOfEnergy', '+', '4'
    );

  } else if(name == 'Horizon Walker') {

    rules.defineRule
      ('resistance.Cold', 'saveNotes.terrainMastery(Cold)', '^=', '20');
    rules.defineRule
      ('resistance.Fire', 'saveNotes.terrainMastery(Fiery)', '^=', '20');
    rules.defineRule('features.Tremorsense',
      'featureNotes.terrainMastery(Cavernous)', '=', '1'
    );
    rules.defineRule('selectableFeatureCount.Horizon Walker',
      'levels.Horizon Walker', '+=', null
    );

  } else if(name == 'Loremaster') {

    rules.defineRule('casterLevelArcane', 'levels.Loremaster', '+=', null);
    rules.defineRule('featureNotes.bonusLanguage',
      'levels.Loremaster', '+=', 'Math.floor(source / 4)'
    );
    rules.defineRule('featureNotes.secrets',
      'levels.Loremaster', '=', 'Math.floor((source + 1) / 2)'
    );
    rules.defineRule
      ('magicNotes.casterLevelBonus', 'levels.Loremaster', '+=', null);
    rules.defineRule
      ('selectableFeatureCount.Loremaster', 'featureNotes.secrets', '+=', null);

  } else if(name == 'Mystic Theurge') {

    rules.defineRule
      ('magicNotes.casterLevelBonus', 'levels.Mystic Theurge', '+=', null);

  } else if(name == 'Shadowdancer') {

    rules.defineRule('magicNotes.shadowJump',
      'levels.Shadowdancer', '=',
         'source < 4 ? null : (10 * Math.pow(2, Math.floor((source-2)/2)))'
    );
    rules.defineRule('shadowdancerFeatures.Improved Uncanny Dodge',
      'shadowdancerFeatures.Uncanny Dodge', '?', null,
      'uncannyDodgeSources', '=', 'source >= 2 ? 1 : null'
    );
    rules.defineRule('combatNotes.improvedUncannyDodge',
      'levels.Shadowdancer', '+=', 'source >= 2 ? source : null',
      '', '+', '4'
    );
    rules.defineRule('uncannyDodgeSources',
      'levels.Shadowdancer', '+=', 'source >= 2 ? 1 : null'
    );

  } else if(name == 'Thaumaturgist') {

    rules.defineRule
      ('magicNotes.casterLevelBonus', 'levels.Thaumaturgist', '+=', null);

  } else if(name == 'Adept') {

    rules.defineRule('familiarMasterLevel', 'levels.Adept', '^=', null);

  }

};

/*
 * Defines in #rules# the rules associated with animal companion #name#, which
 * has abilities #str#, #dex#, #con#, #intel#, #wis#, and #cha#, hit dice #hd#,
 * and armor class #ac#. The companion has attack bonus #attack#, does
 * #damage# damage, and is size #size#. If specified, #level# indicates the
 * minimum master level the character needs to have this animal as a companion.
 */
SRD35.companionRules = function(
  rules, name, str, dex, con, intel, wis, cha, hd, ac, attack, damage, size,
  level
) {

  if(!name) {
    console.log('Empty companion name');
    return;
  }
  if(typeof str != 'number') {
    console.log('Bad str "' + str + '" for companion ' + name);
    return;
  }
  if(typeof dex != 'number') {
    console.log('Bad dex "' + str + '" for companion ' + name);
    return;
  }
  if(typeof con != 'number') {
    console.log('Bad con "' + str + '" for companion ' + name);
    return;
  }
  if(typeof intel != 'number') {
    console.log('Bad intel "' + intel + '" for companion ' + name);
    return;
  }
  if(typeof wis != 'number') {
    console.log('Bad wis "' + wis + '" for companion ' + name);
    return;
  }
  if(typeof cha != 'number') {
    console.log('Bad cha "' + str + '" for companion ' + name);
    return;
  }
  if(typeof hd != 'number') {
    console.log('Bad hd "' + hd + '" for companion ' + name);
    return;
  }
  if(typeof ac != 'number') {
    console.log('Bad ac "' + ac + '" for companion ' + name);
    return;
  }
  if(typeof attack != 'number') {
    console.log('Bad attack "' + ac + '" for companion ' + name);
    return;
  }
  if(!(damage + '').match(/^(\d+@)?(\d+d)?\d+([-+]\d+)?(,(\d+@)?(\d+d)?\d+([-+]\d+)?)*$/)) {
    console.log('Bad damage "' + damage + '" for companion ' + name);
    return;
  }
  if(!(size + '').match(/^[DTSMLH]/)) {
    console.log('Bad size "' + size + '" for companion ' + name);
    return;
  }
  if(size.length > 1)
    size = size.charAt(0);
  if(level && typeof level != 'number') {
    console.log('Bad level "' + ac + '" for companion ' + name);
    return;
  }

  rules.defineRule
    ('animalCompanionStats.Str', 'animalCompanion.' + name, '=', str);
  rules.defineRule
    ('animalCompanionStats.Int', 'animalCompanion.' + name, '=', intel);
  rules.defineRule
    ('animalCompanionStats.Wis', 'animalCompanion.' + name, '=', wis);
  rules.defineRule
    ('animalCompanionStats.Dex', 'animalCompanion.' + name, '=', dex);
  rules.defineRule
    ('animalCompanionStats.Con', 'animalCompanion.' + name, '=', con);
  rules.defineRule
    ('animalCompanionStats.Cha', 'animalCompanion.' + name, '=', cha);
  rules.defineRule
    ('animalCompanionStats.HD', 'animalCompanion.' + name, '=', hd);
  rules.defineRule
    ('animalCompanionStats.AC', 'animalCompanion.' + name, '=', ac);
  rules.defineRule('companionAttack', 'animalCompanion.' + name, '+', attack);
  var matchInfo = (damage[0] + '').match(/([^-+]*)([-+]\d+)?/);
  rules.defineRule('animalCompanionStats.Melee.1',
    'animalCompanion.' + name, '=', '"' + matchInfo[1] + '"'
  );
  if(damage.length > 1) {
    matchInfo = (damage[1] + '').match(/([^-+]*)([-+]\d+)?/);
    rules.defineRule('animalCompanionStats.Melee.3',
      'animalCompanion.' + name, '=', '",' + matchInfo[1] + '"'
    );
  }
  rules.defineRule('animalCompanionStats.Size',
    'animalCompanion.' + name, '=', '"' + size + '"'
  );
  if(level != null && level > 1) {
    rules.defineRule
      ('animalCompanionStats.Level', 'animalCompanion.' + name, '=', level);
    QuilvynRules.prerequisiteRules
      (rules, 'validation', 'animalCompanion', 'animalCompanion.' + name,
       'companionMasterLevel >= animalCompanionStats.Level');
  }
  rules.defineRule('hasCompanion', 'animalCompanion.' + name, '=', '1');

};

/*
 * Defines in #rules# the rules associated with deity #name#. #alignment# gives
 * the deity's alignment, and #domains# and #weapons# list the associated
 * domains and favored weapons.
 */
SRD35.deityRules = function(rules, name, alignment, domains, weapons) {

  var i;

  if(!name) {
    console.log('Empty deity name');
    return;
  }
  if(name != 'None' &&
     !((alignment + '') in SRD35.ALIGNMENTS) &&
     !(alignment + '').match(/^(N|[LNC]G|[LNC]E|[LC]N)$/)) {
    console.log('Bad alignment "' + alignment + '" for deity ' + name);
    return;
  }
  if(alignment && alignment.length > 2)
    alignment = alignment.split(' ').map(x => x.charAt(0)).join('');
  if(!Array.isArray(domains)) {
    console.log('Bad domains list "' + domains + '" for deity ' + name);
    return;
  }
  if(rules.getChoices('selectableFeatures')) {
    for(i = 0; i < domains.length; i++) {
      if(QuilvynUtils.getKeys(rules.getChoices('selectableFeatures'), domains[i] + ' Domain').length == 0) {
        console.log('Bad domain "' + domains[i] + '" for deity ' + name);
        // Warning only - not critical to definition
      }
    }
  }
  if(!Array.isArray(weapons)) {
    console.log('Bad weapons list "' + weapons + '" for deity ' + name);
    return;
  }
  if(rules.getChoices('weapons')) {
    for(i = 0; i < weapons.length; i++) {
      if(!(weapons[i] in rules.getChoices('weapons'))) {
        console.log('Bad weapon "' + weapons[i] + '" for deity ' + name);
        // Warning only - not critical to definition
      }
    }
  }

  if(rules.deityStats == null) {
    rules.deityStats = {
      alignment:{},
      domains:{},
      weapons:{}
    };
  }

  rules.deityStats.alignment[name] = alignment;
  rules.deityStats.domains[name] = domains.join('/');
  rules.deityStats.weapons[name] = weapons.join('/');

  rules.defineRule('deityAlignment',
    'deity', '=', QuilvynUtils.dictLit(rules.deityStats.alignment) + '[source]'
  );
  rules.defineRule('deityDomains',
    'deity', '=', QuilvynUtils.dictLit(rules.deityStats.domains) + '[source]'
  );
  rules.defineRule('deityFavoredWeapons',
    'deity', '=', QuilvynUtils.dictLit(rules.deityStats.weapons) + '[source]'
  );
  for(var i = 0; i < weapons.length; i++) {
    var weapon = weapons[i];
    var focusFeature = 'Weapon Focus (' + weapon + ')';
    var proficiencyFeature = 'Weapon Proficiency (' + weapon + ')';
    rules.defineRule('clericFeatures.' + focusFeature,
      'featureNotes.weaponOfWar', '?', null,
      'deityFavoredWeapons', '=', 'source.indexOf("' + weapon + '") >= 0 ? 1 : null'
    );
    rules.defineRule('clericFeatures.' + proficiencyFeature,
      'featureNotes.weaponOfWar', '?', null,
      'deityFavoredWeapons', '=', 'source.indexOf("' + weapon + '") >= 0 ? 1 : null'
    );
    rules.defineRule
      ('features.' + focusFeature, 'clericFeatures.' + focusFeature, '=', null);
    rules.defineRule('features.' + proficiencyFeature,
      'clericFeatures.' + proficiencyFeature, '=', null
    );
  }

};

/*
 * Defines in #rules# the rules associated with familiar #name#, which has
 * abilities #str#, #dex#, #con#, #intel#, #wis#, and #cha#, hit dice #hd#,
 * and armor class #ac#. The familiar has attack bonus #attack#, does
 * #damage# damage, and is size #size#. If specified, #level# indicates the
 * minimum master level the character needs to have this animal as a familiar.
 */
SRD35.familiarRules = function(
  rules, name, str, dex, con, intel, wis, cha, hd, ac, attack, damage, size,
  level
) {

  if(!name) {
    console.log('Empty familiar name');
    return;
  }
  if(typeof str != 'number') {
    console.log('Bad str "' + str + '" for familiar ' + name);
    return;
  }
  if(typeof dex != 'number') {
    console.log('Bad dex "' + str + '" for familiar ' + name);
    return;
  }
  if(typeof con != 'number') {
    console.log('Bad con "' + str + '" for familiar ' + name);
    return;
  }
  if(typeof intel != 'number') {
    console.log('Bad intel "' + intel + '" for familiar ' + name);
    return;
  }
  if(typeof wis != 'number') {
    console.log('Bad wis "' + wis + '" for familiar "' + name);
    return;
  }
  if(typeof cha != 'number') {
    console.log('Bad cha "' + str + '" for familiar ' + name);
    return;
  }
  if(typeof hd != 'number') {
    console.log('Bad hd "' + hd + '" for familiar ' + name);
    return;
  }
  if(typeof ac != 'number') {
    console.log('Bad ac "' + ac + '" for familiar ' + name);
    return;
  }
  if(typeof attack != 'number') {
    console.log('Bad attack "' + ac + '" for familiar ' + name);
    return;
  }
  if(!(damage + '').match(/^(\d+@)?(\d+d)?\d+([-+]\d+)?(,(\d+@)?(\d+d)?\d+([-+]\d+)?)*$/)) {
    console.log('Bad damage "' + damage + '" for familiar ' + name);
    return;
  }
  if(!(size + '').match(/^[DTSMLH]/)) {
    console.log('Bad size "' + size + '" for familiar ' + name);
    return;
  }
  if(size.length > 1)
    size = size.charAt(0);
  if(level && typeof level != 'number') {
    console.log('Bad level "' + level + '" for familiar ' + name);
    return;
  }

  rules.defineRule('familiarStats.Str', 'familiar.' + name, '=', str);
  rules.defineRule('familiarStats.Int', 'familiar.' + name, '=', intel);
  rules.defineRule('familiarStats.Wis', 'familiar.' + name, '=', wis);
  rules.defineRule('familiarStats.Dex', 'familiar.' + name, '=', dex);
  rules.defineRule('familiarStats.Con', 'familiar.' + name, '=', con);
  rules.defineRule('familiarStats.Cha', 'familiar.' + name, '=', cha);
  rules.defineRule('familiarStats.HD', 'familiar.' + name, '=', hd);
  rules.defineRule('familiarStats.AC', 'familiar.' + name, '=', ac);
  rules.defineRule('familiarAttack', 'familiar.' + name, '+', attack);
  rules.defineRule('familiarStats.Melee.1',
    'familiar.' + name, '=', '"' + damage.join(',') + '"'
  );
  rules.defineRule
    ('familiarStats.Size', 'familiar.' + name, '=', '"' + size + '"');
  rules.defineRule('features.Familiar ' + name, 'familiar.' + name, '=', '1');
  if(level != null && level > 1) {
    rules.defineRule('familiarStats.Level', 'familiar.' + name, '=', level);
    QuilvynRules.prerequisiteRules
      (rules, 'validation', 'familiar', 'familiar.' + name,
       'familiarMasterLevel >= familiarStats.Level');
  }
  rules.defineRule('hasFamiliar', 'familiar.' + name, '=', '1');

};

/*
 * Defines in #rules# the rules associated with feat #name#. #require# and
 * #implies# list any hard and soft prerequisites for the feat, and #types#
 * lists the categories of the feat.
 */
SRD35.featRules = function(rules, name, requires, implies, types) {

  if(!name) {
    console.log('Empty feat name');
    return;
  }
  if(!Array.isArray(requires)) {
    console.log('Bad requires list "' + requires + '" for feat ' + name);
    return;
  }
  if(!Array.isArray(implies)) {
    console.log('Bad implies list "' + implies + '" for feat ' + name);
    return;
  }
  if(!Array.isArray(types)) {
    console.log('Bad types list "' + types + '" for feat ' + name);
    return;
  }

  var prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '');

  if(requires.length > 0)
    QuilvynRules.prerequisiteRules
      (rules, 'validation', prefix + 'Feat', 'feats.' + name, requires);
  if(implies.length > 0)
    QuilvynRules.prerequisiteRules
      (rules, 'sanity', prefix + 'Feat', 'feats.' + name, implies);
  rules.defineRule('features.' + name, 'feats.' + name, '=', null);
  for(var i = 0; i < types.length; i++) {
    if(types[i] != 'General')
      rules.defineRule('sum' + types[i].replaceAll(' ', '') + 'Feats',
        'feats.' + name, '+=', null
      );
  }

};

/*
 * Defines in #rules# the rules associated with feat #name# that cannot be
 * derived directly from the attributes passed to featRules.
 */
SRD35.featRulesExtra = function(rules, name) {

  var matchInfo;

  if(name == 'Extra Turning') {
    rules.defineRule
      ('combatNotes.extraTurning', 'feats.Extra Turning', '=', 'source * 4');
    rules.defineRule
      ('combatNotes.turnUndead.3', 'combatNotes.extraTurning', '+', null);
  } else if(name == 'Toughness') {
    rules.defineRule
      ('combatNotes.toughness', 'feats.Toughness', '=', 'source * 3');
  } else if(name == 'Simple Weapon Proficiency') {
    rules.defineRule('features.Weapon Proficiency (Simple)',
      'features.' + name, '=', '1'
    );
  } else if((matchInfo = name.match(/^(Exotic|Martial)\sWeapon\sProficiency.\((.*)\)$/)) != null) {
    rules.defineRule('features.Weapon Proficiency (' + matchInfo[2] + ')',
      'features.' + name, '=', '1'
    );
  }

};

/*
 * Defines in #rules# the rules associated with feature #name#. #sections# lists
 * the sections of the notes related to the feature and #notes# the note texts;
 * the two must have the same number of elements.
 */
SRD35.featureRules = function(rules, name, sections, notes) {

  if(!name) {
    console.log('Empty feature name');
    return;
  }
  if(!Array.isArray(sections) || sections.length == 0) {
    console.log('Bad sections list "' + sections + '" for feature ' + name);
    return;
  }
  if(!Array.isArray(notes)) {
    console.log('Bad notes list "' + notes + '" for feature ' + name);
    return;
  }
  if(sections.length != notes.length) {
    console.log(sections.length + ' sections, ' + notes.length + ' notes for feature ' + name);
    return;
  }

  var prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '');

  for(var i = 0; i < sections.length; i++) {

    var section = sections[i];
    var effects = notes[i];
    var matchInfo;
    var note = section + 'Notes.' + prefix;
    var skillEffects = 0;
    var uniqueSkillsAffected = [];

    rules.defineChoice('notes', note + ':' + effects);
    rules.defineRule
      (note, 'features.' + name, effects.indexOf('%V') >= 0 ? '?' : '=', null);

    var pieces = effects.split('/');

    for(var j = 0; j < pieces.length; j++) {

      if((matchInfo = pieces[j].match(/^([-+x](\d+(\.\d+)?|%[V1-9]))\s+(.*)$/)) != null) {

        var adjust = matchInfo[1];
        var adjusted = matchInfo[4];
        var adjustor =
          adjust.match(/%\d/) ? note + '.' + adjust.replace(/.*%/, '') : note;
        var op = adjust.startsWith('x') ? '*' : '+';
        if(op == '*')
          adjust = adjust.substring(1);

        if(adjusted in SRD35.ABBREVIATIONS)
          adjusted = SRD35.ABBREVIATIONS[adjusted];
          
        if((matchInfo = adjusted.match(/^(([A-Z][a-z]*)\s)?Feat\b/)) != null) {
          adjusted = 'featCount.' + (matchInfo[2] ? matchInfo[2] : 'General');
        } else if(adjusted == 'Turnings') {
          adjusted = 'combatNotes.turnUndead.2';
        } else if(adjusted.match(/^Spell\sDC\s\(.*\)$/)) {
          adjusted = 'spellDCSchoolBonus.' + adjusted.replace('Spell DC (', '').replace(')', '');
        } else if(section == 'save' && adjusted.match(/^[A-Z]\w*$/)) {
          adjusted = 'save.' + adjusted;
        } else if(section == 'skill' &&
                  adjusted != 'Language Count' &&
                  adjusted != 'Skill Points' &&
                  adjusted.match(/^[A-Z][a-z]*(\s[A-Z][a-z]*)*(\s\([A-Z][a-z]*(\s[A-Z][a-z]*)*\))?$/)) {
          skillEffects++;
          var skillAttr = 'skills.' + adjusted;
          if(uniqueSkillsAffected.indexOf(skillAttr) < 0)
            uniqueSkillsAffected.push(skillAttr);
          adjusted = 'skillModifier.' + adjusted;
        } else if(adjusted.match(/^[A-Z][a-z]*(\s[A-Z][a-z]*)*$/)) {
          adjusted = adjusted.charAt(0).toLowerCase() + adjusted.substring(1).replaceAll(' ', '');
        } else {
          continue;
        }
        rules.defineRule(adjusted,
          adjustor, op, !adjust.includes('%') ? adjust : adjust.startsWith('-') ? '-source' : 'source'
        );

      } else if(section == 'skill' && pieces[j].match(/\sclass\sskill(s)?$/)) {
        var skill =
          pieces[j].replace(/^all\s|\s(is(\sa)?|are)?\sclass\sskill(s)?$/gi, '');
        if(skill.match(/^[A-Z][a-z]*(\s[A-Z][a-z]*)*(\s\([A-Z][a-z]*(\s[A-Z][a-z]*)*\))?$/)) {
          rules.defineRule('classSkills.' + skill, note, '=', '1');
          skillEffects++;
          var skillAttr = 'skills.' + skill;
          if(uniqueSkillsAffected.indexOf(skillAttr) < 0)
            uniqueSkillsAffected.push(skillAttr);
        }
      }

    }

    if(skillEffects == pieces.length && !effects.match(/^-|\/-/)) {
      QuilvynRules.prerequisiteRules
        (rules, 'sanity', prefix, 'features.' + name,
         uniqueSkillsAffected.join(' > 0 || ') + ' > 0');
    }

  }

};

/*
 * Defines in #rules# the rules associated with goody #name#, triggered by
 * a starred line in the character notes that matches #pattern#. #effect#
 * specifies the effect of the goody on each attribute in list #attributes#.
 * This is one of "increment" (adds #value# to the attribute), "set" (replaces
 * the value of the attribute by #value#), "lower" (decreases the value to
 * #value#), or "raise" (increases the value to #value#). #value#, if null,
 * defaults to 1; occurrences of $1, $2, ... in #value# reference capture
 * groups in #pattern#. #sections# and #notes# list the note sections
 * ("attribute", "combat", "companion", "feature", "magic", "save", or "skill")
 * and formats that show the effects of the goody on the character sheet.
 */
SRD35.goodyRules = function(
  rules, name, pattern, effect, value, attributes, sections, notes
) {
  QuilvynRules.goodyRules
    (rules, name, pattern, effect, value, attributes, sections, notes);
};

/* Defines in #rules# the rules associated with language #name#. */
SRD35.languageRules = function(rules, name) {
  if(!name) {
    console.log('Empty language name');
    return;
  }
  // No rules pertain to language
};

/*
 * Defines in #rules# the rules associated with path #name#, which is a
 * selection for characters belonging to #group# and tracks path level via
 * #levelAttr#. The path grants the features listed in #features#. If the path
 * grants spell slots, #spellAbility# names the ability for computing spell
 * difficulty class, and #spellSlots# lists the number of spells per level per
 * day granted.
 */
SRD35.pathRules = function(
  rules, name, group, levelAttr, features, selectables, spellAbility, spellSlots
) {

  if(!name) {
    console.log('Empty path name');
    return;
  }
  if(!group) {
    console.log('Bad group "' + group + '" for path ' + name);
    return;
  }
  if(!(levelAttr + '').startsWith('level')) {
    console.log('Bad level "' + levelAttr + '" for path ' + name);
    return;
  }
  if(!Array.isArray(features)) {
    console.log('Bad features list "' + features + '" for path ' + name);
    return;
  }
  if(!Array.isArray(selectables)) {
    console.log('Bad selectables list "' + selectables + '" for path ' + name);
    return;
  }
  if(spellAbility) {
    spellAbility = spellAbility.toLowerCase();
    if(!(spellAbility.charAt(0).toUpperCase() + spellAbility.substring(1) in SRD35.ABILITIES)) {
      console.log('Bad spell ability "' + spellAbility + '" for path ' + name);
      return;
    }
  }
  if(!Array.isArray(spellSlots)) {
    console.log('Bad spellSlots list "' + spellSlots + '" for path ' + name);
    return;
  }

  var pathLevel =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '') + 'Level';

  rules.defineRule(pathLevel,
    'features.' + name, '?', null,
    levelAttr, '=', null
  );

  QuilvynRules.featureListRules(rules, features, group, pathLevel, false);
  QuilvynRules.featureListRules(rules, selectables, group, pathLevel, true);

  if(spellSlots.length > 0) {

    rules.defineRule('casterLevels.' + name,
      pathLevel, '=', null,
      'magicNotes.casterLevelBonus', '+', null
    );
    rules.defineRule('spellSlotLevel.' + name,
      pathLevel, '=', null,
      'magicNotes.casterLevelBonus', '+', null
    );
    QuilvynRules.spellSlotRules(rules, 'spellSlotLevel.' + name, spellSlots);

    for(var i = 0; i < spellSlots.length; i++) {
      var matchInfo = spellSlots[i].match(/^(\D+)(\d):/);
      if(!matchInfo) {
        console.log('Bad format for spell slot "' + spellSlots[i] + '"');
        continue;
      }
      var spellType = matchInfo[1];
      if(spellType != name)
        rules.defineRule
          ('casterLevels.' + spellType, 'casterLevels.' + name, '^=', null);
      rules.defineRule('spellDifficultyClass.' + spellType,
        'casterLevels.' + spellType, '?', null,
        spellAbility + 'Modifier', '=', '10 + source'
      );
    }
  }

};

/*
 * Defines in #rules# the rules associated with race #name#, which has the list
 * of hard prerequisites #requires#. #features# and #selectables# list
 * associated features and #languages# any automatic languages. If the race
 * grants spell slots, #spellAbility# names the ability for computing spell
 * difficulty class, and #spellSlots# lists the number of spells per level per
 * day granted.
 */
SRD35.raceRules = function(
  rules, name, requires, features, selectables, languages, spellAbility,
  spellSlots
) {

  if(!name) {
    console.log('Empty race name');
    return;
  }
  if(!Array.isArray(requires)) {
    console.log('Bad requires list "' + requires + '" for race ' + name);
    return;
  }
  if(!Array.isArray(features)) {
    console.log('Bad features list "' + features + '" for race ' + name);
    return;
  }
  if(!Array.isArray(selectables)) {
    console.log('Bad selectables list "' + selectables + '" for race ' + name);
    return;
  }
  if(!Array.isArray(languages)) {
    console.log('Bad languages list "' + languages + '" for race ' + name);
    return;
  }
  if(rules.getChoices('languages')) {
    for(var i = 0; i < languages.length; i++) {
      if(languages[i] != 'any' &&
         !(languages[i] in rules.getChoices('languages'))) {
        console.log('Bad language "' + languages[i] + '" for race ' + name);
        // Warning only - not critical to definition
      }
    }
  }
  if(spellAbility) {
    spellAbility = spellAbility.toLowerCase();
    if(!(spellAbility.charAt(0).toUpperCase() + spellAbility.substring(1) in SRD35.ABILITIES)) {
      console.log('Bad spellAbility "' + spellAbility + '" for class ' + name);
      return;
    }
  }
  if(!Array.isArray(spellSlots)) {
    console.log('Bad spellSlots list "' + spellSlots + '" for race ' + name);
    return;
  }

  var matchInfo;
  var prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '');
  var raceLevel = prefix + 'Level';

  rules.defineRule(raceLevel,
    'race', '?', 'source == "' + name + '"',
    'level', '=', null
  );

  if(requires.length > 0)
    QuilvynRules.prerequisiteRules
      (rules, 'validation', prefix + 'Race', raceLevel, requires);

  QuilvynRules.featureListRules(rules, features, name, raceLevel, false);
  QuilvynRules.featureListRules(rules, selectables, name, raceLevel, true);
  rules.defineSheetElement(name + ' Features', 'Feats+', null, '; ');
  rules.defineChoice('extras', prefix + 'Features');

  if(languages.length > 0) {
    rules.defineRule('languageCount', raceLevel, '=', languages.length);
    for(var i = 0; i < languages.length; i++) {
      if(languages[i] != 'any')
        rules.defineRule('languages.' + languages[i], raceLevel, '=', '1');
    }
  }

  if(spellSlots.length > 0) {

    rules.defineRule('casterLevels.' + name, raceLevel, '=', null);
    rules.defineRule('casterLevel', 'casterLevels.' + name, '^=', '1');
    QuilvynRules.spellSlotRules(rules, raceLevel, spellSlots);

    for(var i = 0; i < spellSlots.length; i++) {
      var matchInfo = spellSlots[i].match(/^(\D+)(\d):/);
      if(!matchInfo) {
        console.log('Bad format for spell slot "' + spellSlots[i] + '"');
        continue;
      }
      var spellType = matchInfo[1];
      if(spellType != name)
        rules.defineRule
          ('casterLevels.' + spellType, 'casterLevels.' + name, '^=', null);
      rules.defineRule('spellDifficultyClass.' + spellType,
        'casterLevels.' + spellType, '?', null,
        spellAbility + 'Modifier', '=', '10 + source'
      );
    }

  }

};

/*
 * Defines in #rules# the rules associated with race #name# that cannot be
 * derived directly from the attributes passed to raceRules.
 */
SRD35.raceRulesExtra = function(rules, name) {
  if(name.match(/Gnome/)) {
    rules.defineRule('spellSlots.Gnomish0', 'charisma', '?', 'source >= 10');
  } else if(name.match(/Dwarf/)) {
    rules.defineRule
      ('abilityNotes.armorSpeedAdjustment', 'abilityNotes.steady', '^', '0');
  } else if(name == 'Human') {
    rules.defineRule('skillNotes.humanSkillBonus', 'level', '=', 'source + 3');
  }
};

/*
 * Defines in #rules# the rules associated with magic school #name#, which
 * grants the list of #features#.
 */
SRD35.schoolRules = function(rules, name, features) {

  if(!name) {
    console.log('Empty school name');
    return;
  }
  if(!Array.isArray(features)) {
    console.log('Bad features list "' + features + '" for school ' + name);
    return;
  }

  var prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ','');
  var schoolLevel = prefix + 'Level';

  rules.defineRule(schoolLevel,
    'features.School Specialization (' + name + ')', '?', null,
    'levels.Wizard', '=', null
  );
  rules.defineRule('spellDCSchoolBonus.' + name, 'casterLevel', '=', '0');
  QuilvynRules.featureListRules(rules, features, 'Wizard', schoolLevel, false);

  for(var i = 1; i <= 9; i++) {
    rules.defineRule('spellSlots.W' + i,
      'magicNotes.schoolSpecialization(' + name + ')', '+', '1'
    );
  }

  var note = 'validationNotes.' + prefix + 'SchoolOpposition';
  rules.defineChoice('notes', note + ':Cannot oppose specialized school');
  rules.defineRule(note,
    'features.School Specialization (' + name + ')', '?', null,
    'features.School Opposition (' + name + ')', '=', '1'
  );

};

/*
 * Defines in #rules# the rules associated with shield #name#, which adds #ac#
 * to the character's armor class, requires a #weight# proficiency level to
 * use effectively, imposes #skillPenalty# on specific skills and yields a
 * #spellFail# percent chance of arcane spell failure.
 */
SRD35.shieldRules = function(rules, name, ac, weight, skillFail, spellFail) {

  if(!name) {
    console.log('Empty shield name');
    return;
  }
  if(typeof ac != 'number') {
    console.log('Bad ac "' + ac + '" for shield ' + name);
    return;
  }
  if(weight == null ||
     !(weight + '').match(/^([0-4]|none|light|medium|heavy|tower)$/i)) {
    console.log('Bad weight "' + weight + '" for shield ' + name);
    return;
  }
  if(typeof skillFail != 'number') {
    console.log('Bad skillFail "' + ac + '" for shield ' + name);
    return;
  }
  if(typeof spellFail != 'number') {
    console.log('Bad spellFail "' + ac + '" for shield ' + name);
    return;
  }

  if((weight + '').match(/^[0-4]$/))
    ; // empty
  else if(weight.match(/^none$/i))
    weight = 0;
  else if(weight.match(/^light$/i))
    weight = 1;
  else if(weight.match(/^medium$/i))
    weight = 2;
  else if(weight.match(/^heavy$/i))
    weight = 3;
  else if(weight.match(/^tower$/i))
    weight = 4;

  if(rules.shieldStats == null) {
    rules.shieldStats = {
      ac:{},
      weight:{},
      skill:{},
      spell:{}
    };
  }
  rules.shieldStats.ac[name] = ac;
  rules.shieldStats.weight[name] = weight;
  rules.shieldStats.skill[name] = skillFail;
  rules.shieldStats.spell[name] = spellFail;

  rules.defineRule
    ('armorClass', 'shield', '+', QuilvynUtils.dictLit(rules.shieldStats.ac) + '[source]');
  rules.defineRule('combatNotes.nonproficientShieldPenalty',
    'shieldProficiencyLevelShortfall', '?', 'source > 0',
    'shield', '=', '-' + QuilvynUtils.dictLit(rules.shieldStats.skill) + '[source]'
  );
  rules.defineRule('magicNotes.arcaneSpellFailure',
    'shield', '+=', QuilvynUtils.dictLit(rules.shieldStats.spell) + '[source]'
  );
  rules.defineRule('shieldWeight',
    'shield', '=', QuilvynUtils.dictLit(rules.shieldStats.weight) + '[source]'
  );
  rules.defineRule('skillNotes.armorSkillCheckPenalty',
    'shield', '+', QuilvynUtils.dictLit(rules.shieldStats.skill) + '[source]'
  );

};

/*
 * Defines in #rules# the rules associated with skill #name#, associated with
 * basic ability #ability#. #untrained#, if specified, is a boolean indicating
 * whether or not the skill can be used untrained; the default is true.
 * #classes# lists the classes for which this is a class skill; a value of
 * "all" indicates that this is a class skill for all classes. #synergies#
 * lists any synergies with other skills and abilities granted by high ranks in
 * this skill.
 */
SRD35.skillRules = function(
  rules, name, ability, untrained, classes, synergies
) {

  if(!name) {
    console.log('Empty skill name');
    return;
  }
  if(ability) {
    ability = ability.toLowerCase();
    if(!(ability.charAt(0).toUpperCase() + ability.substring(1) in SRD35.ABILITIES)) {
      console.log('Bad ability "' + ability + '" for skill ' + name);
      return;
    }
  }
  if(untrained != null && typeof untrained != 'boolean') {
    console.log('Bad untrained "' + untrained + '" for skill ' + name);
  }
  if(!Array.isArray(classes)) {
    console.log('Bad classes list "' + classes + '" for skill ' + name);
    return;
  }
  if(rules.getChoices('levels')) {
    for(var i = 0; i < classes.length; i++) {
      if(classes[i] != "all" && !(classes[i] in rules.getChoices('levels'))) {
        console.log('Bad class "' + classes[i] + '" for skill ' + name);
        return;
      }
    }
  }
  if(!Array.isArray(synergies)) {
    console.log('Bad synergies list "' + synergies + '" for skill ' + name);
    return;
  }

  rules.defineChoice('notes', 'skills.' + name + ':(%1%2) %V (%3)');

  if(classes.indexOf("all") >= 0) {
    rules.defineRule('classSkills.' + name, 'level', '=', '1');
  } else {
    for(var i = 0; i < classes.length; i++)
      rules.defineRule('classSkills.' + name, 'levels.' + classes[i], '=', '1');
  }
  if(name.indexOf(' (') >= 0) {
    rules.defineRule('classSkills.' + name,
      'classSkills.' + name.replace(/\s+\(.*/, ''), '=', '1'
    );
  }
  rules.defineRule('skillModifier.' + name,
    'skills.' + name, '=', 'source / 2',
    'classSkills.' + name, '*', 'source > 0 ? 2 : null'
  );
  if(ability) {
    rules.defineRule('skillModifier.' + name, ability + 'Modifier', '+', null);
    rules.defineRule
      ('skills.' + name + '.1', 'skills.' + name, '=', '"' + ability.substring(0,3) + '"');
  } else {
    rules.defineRule('skills.' + name + '.1', 'skills.' + name, '=', '""');
  }
  rules.defineRule('skills.' + name + '.2',
    'skills.' + name, '?', '1',
    '', '=', '";cc"',
    'classSkills.' + name, '=', '""'
  );
  rules.defineRule('skills.' + name + '.3', 'skillModifier.' + name, '=', null);

  if(synergies.length > 0) {
    SRD35.featureRules
      (rules, name + ' Synergy', ['skill'], ['+2 ' + synergies.join('/+2 ')]);
    rules.defineRule('features.' + name + ' Synergy',
      'skills.' + name, '=', 'source >= 5 ? 1 : null'
    );
  }

  if(name.startsWith('Knowledge '))
    rules.defineRule('countKnowledgeSkillsGe10',
      'skills.' + name, '+=', 'source >= 10 ? 1 : null'
    );

};

/*
 * Defines in #rules# the rules associated with skill #name# that cannot be
 * derived directly from the attributes passed to skillRules.
 */
SRD35.skillRulesExtra = function(rules, name) {
  if(name == 'Jump') {
    rules.defineRule('skillNotes.speedJumpModifier',
      'speed', '=',  'Math.floor((source - 30) / 10) * (source > 30 ? 4 : 6)'
    );
    rules.defineRule
      ('skillModifier.Jump', 'skillNotes.speedJumpModifier', '+', null);
  } else if(name == 'Knowledge (Religion)') {
    rules.defineRule('combatNotes.turnUndead.1',
      'skillNotes.knowledge(Religion)Synergy', '+', '2'
    );
  } else if(name == 'Speak Language') {
    rules.defineRule
      ('languageCount', 'skillModifier.Speak Language', '+', null);
  } else if(name == 'Swim') {
    rules.defineChoice('notes', 'skillNotes.armorSwimCheckPenalty:-%V Swim');
    rules.defineRule('skillModifier.Swim',
      'skillNotes.armorSwimCheckPenalty', '+', '-source'
    );
    rules.defineRule('skillNotes.armorSwimCheckPenalty',
      'skillNotes.armorSkillCheckPenalty', '=', 'source * 2'
    );
  } else if(name == 'Tumble') {
    var affected = [
     'Balance', 'Climb', 'Escape Artist', 'Hide', 'Jump', 'Move Silently',
     'Sleight Of Hand', 'Tumble'
    ];
    rules.defineChoice('notes', 'skillNotes.armorSkillCheckPenalty:-%V ' + affected.join('/-%V '));
    for(var i = 0; i < affected.length; i++) {
      rules.defineRule('skillModifier.' + affected[i],
        'skillNotes.armorSkillCheckPenalty', '+', '-source'
      );
    }
  }
};

/*
 * Defines in #rules# the rules associated with spell #name#, which is from
 * magic school #school#. #casterGroup# and #level# are used to compute any
 * saving throw value required by the spell. #description# is a concise
 * description of the spell's effects.
 */
SRD35.spellRules = function(
  rules, name, school, casterGroup, level, description, domainSpell
) {

  if(!name) {
    console.log('Empty spell name');
    return;
  }
  if(school && !(school in rules.getChoices('schools'))) {
    console.log('Bad school "' + school + '" for spell ' + name);
    return;
  }
  if(!casterGroup.match(/^[A-Z][A-Za-z]*$/)) {
    console.log('Bad caster group "' + casterGroup + '" for spell ' + name);
    return;
  }
  if(typeof level != 'number') {
    console.log('Bad level "' + level + '" for spell ' + name);
    return;
  }

  if(description == null)
    description = '';

  var inserts = description.match(/\$(\w+|\{[^}]+\})/g);
  if(inserts != null) {
    for(var i = 0; i < inserts.length; i++) {
      description = description.replace(inserts[i], '%' + (i + 1));
    }
  }

  if(inserts != null) {
    for(var i = 1; i <= inserts.length; i++) {
      var insert = inserts[i - 1];
      var expr = insert[1] == '{' ?
          insert.substring(2, insert.length - 1) : insert.substring(1);
      if(SRD35.ABBREVIATIONS[expr])
        expr = SRD35.ABBREVIATIONS[expr];
      var modifiers = expr.match(/L\d*|(plus|div|min|max|minus|times)\d+/g);
      if(modifiers != null) {
        for(var k = 0; k < modifiers.length; k++) {
          var modifier = modifiers[k];
          if(modifier.startsWith('L')) {
            expr = 'source';
            if(modifier.length > 1)
              expr += ' * ' + modifier.substring(1);
          } else if(modifier.startsWith('plus'))
            expr += ' + ' + modifier.substring(4);
          else if(modifier.startsWith('minus'))
            expr += ' - ' + modifier.substring(5);
          else if(modifier.startsWith('div')) {
            if(expr == 'source')
              expr = 'Math.floor(' + expr + ' / ' + modifier.substring(3) + ')';
            else
              expr = 'Math.floor((' + expr + ') / ' + modifier.substring(3) + ')';
          } else if(modifier.startsWith('times')) {
            if(expr == 'source')
              expr = 'source * ' + modifier.substring(5);
            else
              expr = '(' + expr + ') * ' + modifier.substring(5);
          } else if(modifier.startsWith('min'))
            expr = 'Math.min(' + expr + ', ' + modifier.substring(3) + ')';
          else if(modifier.startsWith('max'))
            expr = 'Math.max(' + expr + ', ' + modifier.substring(3) + ')';
        }
      }
      expr = expr.replace(/lvl|L/g, 'source');
      rules.defineRule('spells.' + name + '.' + i,
        'spells.' + name, '?', null,
        'casterLevels.' + casterGroup, '=', expr
      );
      if(casterGroup == 'W') {
        rules.defineRule('spells.' + name + '.' + i,
          'casterLevels.S', '^=', expr
        );
      }
      if(domainSpell) {
        rules.defineRule
          ('spells.' + name + '.' + i, 'casterLevels.Domain', '^=', expr);
      }
    }

  }

  var dc;
  while((dc = description.match(/\((Fort\s|Ref\s|Will\s)/)) != null) {
    var index = inserts != null ? inserts.length + 1 : 1;
    description = description.replace(dc[0], '(DC %' + index + ' ' + dc[1]);
    var dcRule = 'spells.' + name + '.' + index;
    rules.defineRule(dcRule,
      'spells.' + name, '?', null,
      'spellDifficultyClass.' + casterGroup, '=', 'source + ' + level
    );
    if(casterGroup == 'W') {
      rules.defineRule
        (dcRule, 'spellDifficultyClass.S', '^=', 'source + ' + level);
    }
    if(domainSpell) {
      rules.defineRule
        (dcRule, 'spellDifficultyClass.Domain', '^=', 'source + ' + level);
    }
    if(school)
      rules.defineRule(dcRule, 'spellDCSchoolBonus.' + school, '+', null);
  }

  rules.defineChoice('notes', 'spells.' + name + ':' + description);

};

/*
 * Defines in #rules# the rules associated with weapon #name#, which requires a
 * #profLevel# proficiency level to use effectively and belongs to weapon
 * category #category# (one of '1h', '2h', 'Li', 'R', 'Un' or their spelled-out
 * equivalents). The weapon does #damage# HP on a successful attack and
 * threatens x#critMultiplier# (default 2) damage on a roll of #threat# (default
 * 20). If specified, the weapon can be used as a ranged weapon with a range
 * increment of #range# feet.
 */
SRD35.weaponRules = function(
  rules, name, profLevel, category, damage, threat, critMultiplier, range
) {

  if(!name) {
    console.log('Bad name for weapon  "' + name + '"');
    return;
  }
  if(profLevel == null ||
     !(profLevel + '').match(/^([0-3]|unarmed|simple|martial|exotic)$/i)) {
    console.log('Bad proficiency level "' + profLevel + '" for weapon ' + name);
    return;
  }
  if(category == null ||
     !(category + '').match(/^(1h|2h|Li|R|Un|one-handed|two-handed|light|ranged|unarmed)$/i)) {
    console.log('Bad category "' + category + '" for weapon ' + name);
    return;
  }
  var matchInfo =
    (damage + '').match(/^(((\d*d)?\d+)([-+]\d+)?)(\/(((\d*d)?\d+)([-+]\d+)?))?$/);
  if(!matchInfo) {
    console.log('Bad damage "' + damage + '" for weapon ' + name);
    return;
  }
  if(threat && typeof threat != 'number') {
    console.log('Bad threat "' + threat + '" for weapon ' + name);
  }
  if(critMultiplier && typeof critMultiplier != 'number') {
    console.log('Bad critMultiplier "' + critMultiplier + '" for weapon ' + name);
  }
  if(range && typeof range != 'number') {
    console.log('Bad range "' + range + '" for weapon ' + name);
  }

  if((profLevel + '').match(/^[0-3]$/))
    ; // empty
  else if(profLevel.match(/^unarmed$/i))
    profLevel = 0;
  else if(profLevel.match(/^simple$/i))
    profLevel = 1;
  else if(profLevel.match(/^martial$/i))
    profLevel = 2;
  else if(profLevel.match(/^exotic$/i))
    profLevel = 3;
  if(category.match(/^one-handed$/i))
    category = '1h';
  else if(category.match(/^two-handed$/i))
    category = '2h';
  else if(category.match(/^light$/i))
    category = 'Li';
  else if(category.match(/^ranged$/i))
    category = 'R';
  else if(category.match(/^unarmed$/i))
    category = 'Un';
  if(!threat)
    threat=20;
  if(!critMultiplier)
    critMultiplier = 2;

  var prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '');
  var firstDamage = matchInfo[1];
  var secondDamage = matchInfo[6];
  var weaponName = 'weapons.' + name;
  var attackBase = category == 'R' ? 'rangedAttack' : 'meleeAttack';

  var rangeVar = !range ? null : secondDamage ? 7 : 5;
  var threatVar = secondDamage ? 6 : 4;

  var format = '%V (%1 %2%3';
  if(secondDamage)
    format += '/%4%5';
  format += ' x' + critMultiplier + '@%' + threatVar;
  if(range)
    format += ' R%' + rangeVar + "'";
  format += ')';

  rules.defineChoice('notes', weaponName + ':' + format);

  rules.defineRule(prefix + 'AttackModifier',
    'weapons.' + name, '?', null,
    attackBase, '=', null
  );
  if(name.startsWith('Composite')) {
    rules.defineRule(prefix + 'AttackModifier',
      'strengthModifier', '+', 'source < 0 ? -2 : null'
    );
  }
  rules.defineRule(weaponName + '.1',
    prefix + 'AttackModifier', '=', 'source >= 0 ? "+" + source : source'
  );

  rules.defineRule(prefix + 'DamageModifier', 'weapons.' + name, '?', null);
  if(name.match(/Arquebus|Blowgun|Crossbow|Dartgun|Gun/))
    rules.defineRule(prefix + 'DamageModifier',
      'combatNotes.strengthDamageAdjustment', '=', '0'
    );
  else if(name.match(/Longbow|Shortbow/) && !name.startsWith('Composite'))
    rules.defineRule(prefix + 'DamageModifier',
      'combatNotes.strengthDamageAdjustment', '=', 'source < 0 ? source : 0'
    );
  else if(category.match(/[12]h/))
    rules.defineRule(prefix + 'DamageModifier',
      'combatNotes.strengthDamageAdjustment', '=', null,
      'combatNotes.two-HandedWieldDamageAdjustment', '+', null
    );
  else
    rules.defineRule(prefix + 'DamageModifier',
      'combatNotes.strengthDamageAdjustment', '=', null
    );
  if(firstDamage.match(/[-+]/)) {
    var bump = firstDamage.replace(/^[^-+]*/, '');
    firstDamage = firstDamage.replace(bump, '');
    rules.defineRule(prefix + 'DamageModifier', '', '+', bump);
  }
  rules.defineRule(prefix + 'DamageDice',
    'weapons.' + name, '?', null,
    '', '=', '"' + firstDamage + '"',
    'features.Small', '=', '"' + SRD35.SMALL_DAMAGE[firstDamage] + '"',
    'features.Large', '=', '"' + SRD35.LARGE_DAMAGE[firstDamage] + '"'
  );
  if(name == 'Unarmed')
    rules.defineRule
      ('unarmedDamageDice', 'combatNotes.increasedUnarmedDamage', '=', null);
  rules.defineRule(weaponName + '.2', prefix + 'DamageDice', '=', null);
  rules.defineRule(weaponName + '.3',
    prefix + 'DamageModifier', '=', 'source>0 ? "+" + source : source==0 ? "" : source'
  );

  if(secondDamage) {
    secondDamage = secondDamage.replace(/[-+].*/, '');
    // TODO Ignoring 2nd mod different from 1st, e.g. d6+2/d6
    rules.defineRule(prefix + 'DamageDice2',
      'weapons.' + name, '?', null,
      '', '=', '"' + secondDamage + '"',
      'features.Small', '=', '"'+SRD35.SMALL_DAMAGE[secondDamage]+'"',
      'features.Large', '=', '"'+SRD35.LARGE_DAMAGE[secondDamage]+'"'
    );
    rules.defineRule(weaponName + '.4', prefix + 'DamageDice2', '=', null);
    rules.defineRule(weaponName + '.5',
      prefix + 'DamageModifier', '=', 'source>0 ? "+" + source : source==0 ? "" : source'
    );
  }

  rules.defineRule(prefix + 'ThreatRange', 'weapons.' + name, '=', 21 - threat);
  rules.defineRule
    (weaponName + '.' + threatVar, prefix + 'ThreatRange', '=', '21 - source');

  if(range) {
    rules.defineRule(prefix + 'Range',
      'weapons.' + name, '=', range,
      'features.Far Shot', '*', name.indexOf('bow') < 0 ? '2' : '1.5'
    );
    rules.defineRule(weaponName + '.' + rangeVar, prefix + 'Range', '=', null);
  }

  if(category == 'Li' || category == 'Un' ||
     name.match(/^(rapier|whip|spiked\schain)$/i)) {
    rules.defineRule('finesseAttackBonus',
      'combatNotes.weaponFinesse', '?', null,
      'dexterityModifier', '=', null,
      'strengthModifier', '+', '-source',
      '', '^', '0'
    );
    rules.defineRule
      (prefix + 'AttackModifier', 'finesseAttackBonus', '+=', null);
  }

  rules.defineChoice('notes',
    'combatNotes.nonproficientWeaponPenalty.' + name + ':%V attack'
  );
  rules.defineRule(prefix + 'AttackModifier',
    'weapons.' + name, '?', null,
    'combatNotes.nonproficientArmorPenalty', '+', null,
    'combatNotes.nonproficientShieldPenalty', '+', null,
    'combatNotes.nonproficientWeaponPenalty.' + name, '+', null
  );
  rules.defineRule('weaponProficiencyLevelShortfall.' + name,
    'weapons.' + name, '=', profLevel,
    'features.Weapon Familiarity (' + name + ')', '+', '-1',
    'weaponProficiencyLevel', '+', '-source',
    'features.Weapon Proficiency (' + name + ')', '*', '0'
  );
  rules.defineRule('combatNotes.nonproficientWeaponPenalty.' + name,
    'weapons.' + name, '=', '-4',
    'weaponProficiencyLevelShortfall.' + name, '?', 'source > 0'
  );
  if(category == '2h') {
    rules.defineChoice('notes',
      'combatNotes.two-handedWeaponWithBucklerPenalty:-1 attack and AC'
    );
    rules.defineRule('armorClass',
      'combatNotes.two-handedWeaponWithBucklerPenalty', '+', '-1'
    );
    rules.defineRule('combatNotes.two-handedWeaponWithBucklerPenalty',
      'shield', '?', 'source == "Buckler"',
      'weapons.' + name, '=', '-1'
    );
    rules.defineRule(prefix + 'AttackModifier',
      'combatNotes.two-handedWeaponWithBucklerPenalty', '+', '-1'
    );
    QuilvynRules.prerequisiteRules
      (rules, 'validation', 'two-handedWeapon', 'weapons.' + name,
       'shield =~ \'Buckler|None\'');
  }

  if(profLevel == 2)
    rules.addChoice('martialWeapons', name, '');
  else if(profLevel == 3)
    rules.addChoice('exoticWeapons', name, '');

};

/*
 * Returns the dictionary of attribute formats associated with character sheet
 * format #viewer# in #rules#.
 */
SRD35.getFormats = function(rules, viewer) {
  var format;
  var formats = rules.getChoices('notes');
  var result = {};
  var matchInfo;
  if(viewer == 'Collected Notes') {
    for(format in formats) {
      result[format] = formats[format];
      if((matchInfo = format.match(/Notes\.(.*)$/)) != null) {
        var feature = matchInfo[1];
        feature = feature.charAt(0).toUpperCase() + feature.substring(1).replace(/([A-Z(])/g, ' $1');
        formats['features.' + feature] = formats[format];
      }
    }
  } else if(viewer == 'Compact') {
    for(format in formats) {
      if(!format.startsWith('spells.'))
        result[format] = formats[format];
    }
  } else {
    result = formats;
  }
  return result;
};

/* Returns an ObjectViewer loaded with the available character sheet formats. */
SRD35.createViewers = function(rules, viewers) {
  for(var i = 0; i < viewers.length; i++) {
    var name = viewers[i];
    var viewer = new ObjectViewer();
    if(name == 'Compact') {
      viewer.addElements(
        {name: '_top', separator: '\n'},
          {name: 'Section 1', within: '_top', separator: '; '},
            {name: 'Identity', within: 'Section 1', format: '%V',
             separator: ''},
              {name: 'Name', within: 'Identity', format: '<b>%V</b>'},
              {name: 'Gender', within: 'Identity', format: ' -- <b>%V</b>'},
              {name: 'Race', within: 'Identity', format: ' <b>%V</b>'},
              {name: 'Levels', within: 'Identity', format: ' <b>%V</b>',
               separator: '/'},
            {name: 'Hit Points', within: 'Section 1', format: '<b>HP</b> %V'},
            {name: 'Initiative', within: 'Section 1', format: '<b>Init</b> %V'},
            {name: 'Speeds', within: 'Section 1', format: '%V', separator: ''},
              {name: 'Speed', within: 'Speeds', format: '<b>Speed</b> %V'},
              {name: 'Run Speed', within: 'Speeds', format: '/%V'},
            {name: 'Armor Class', within: 'Section 1', format: '<b>AC</b> %V'},
            {name: 'Damage Reduction', within: 'Section 1',
             format: '<b>DR</b> %V', separator:'; '},
            {name: 'Weapons', within: 'Section 1', format: '<b>%N</b> %V',
             separator: '; '},
            {name: 'Alignment', within: 'Section 1', format: '<b>Ali</b> %V'},
            {name: 'Save', within: 'Section 1', separator: '; '},
            {name: 'Spell Resistance', within: 'Section 1', format:
             '<b>SR</b> %V'},
            {name: 'Resistance', within: 'Section 1', format:
             '<b>ER</b> %V', separator: '; '},
            {name: 'Abilities', within: 'Section 1',
             format: '<b>Str/Int/Wis/Dex/Con/Cha</b> %V', separator: '/'},
              {name: 'Strength', within: 'Abilities', format: '%V'},
              {name: 'Dexterity', within: 'Abilities', format: '%V'},
              {name: 'Constitution', within: 'Abilities', format: '%V'},
              {name: 'Intelligence', within: 'Abilities', format: '%V'},
              {name: 'Wisdom', within: 'Abilities', format: '%V'},
              {name: 'Charisma', within: 'Abilities', format: '%V'},
          {name: 'Section 2', within: '_top', separator: '; '},
            {name: 'Skill Modifier', within: 'Section 2', separator: '; '},
            {name: 'Feats', within: 'Section 2', separator: '; '},
            {name: 'Languages', within: 'Section 2', separator: '; '},
            {name: 'Spells', within: 'Section 2', separator: '; '},
            {name: 'Spell Difficulty Class', within: 'Section 2',
             separator: '; '},
            {name: 'Notes', within: 'Section 2'},
            {name: 'Hidden Notes', within: 'Section 2', format: '%V'}
      );
    } else if(name == 'Collected Notes' || name == 'Standard') {
      var innerSep = null;
      var listSep = '; ';
      var noteSep = listSep;
      noteSep = '\n';
      var outerSep = '\n';
      viewer.addElements(
        {name: '_top', borders: 1, separator: '\n'},
        {name: 'Header', within: '_top', separator: ''},
          {name: 'Image Url', within: 'Header', format: '<img src="%V" alt="No Image" style="height:75px; vertical-align:middle"/>&nbsp;&nbsp;'},
          {name: 'Name', within: 'Header', format: '<b>%V</b> &mdash;'},
          {name: 'Gender', within: 'Header', format: ' <b>%V</b>'},
          {name: 'Race', within: 'Header', format: ' <b>%V</b>'},
          {name: 'Levels', within: 'Header', format: ' <b>%V</b>',
           separator: '/'},
        {name: 'Attributes', within: '_top', separator: outerSep},
          {name: 'Abilities', within: 'Attributes', separator: innerSep},
            {name: 'Strength', within: 'Abilities'},
            {name: 'Dexterity', within: 'Abilities'},
            {name: 'Constitution', within: 'Abilities'},
            {name: 'Intelligence', within: 'Abilities'},
            {name: 'Wisdom', within: 'Abilities'},
            {name: 'Charisma', within: 'Abilities'},
          {name: 'Description', within: 'Attributes', separator: innerSep},
            {name: 'Alignment', within: 'Description'},
            {name: 'DeityInfo', within: 'Description', separator: ''},
              {name: 'Deity', within: 'DeityInfo'},
              {name: 'Deity Alignment', within: 'DeityInfo', format:' (%V)'},
            {name: 'Origin', within: 'Description'},
            {name: 'Player', within: 'Description'},
          {name: 'AbilityStats', within: 'Attributes', separator: innerSep},
            {name: 'ExperienceInfo', within: 'AbilityStats', separator: ''},
              {name: 'Experience', within: 'ExperienceInfo'},
              {name: 'Experience Needed', within: 'ExperienceInfo',
               format: '/%V'},
            {name: 'Level', within: 'AbilityStats'},
            {name: 'SpeedInfo', within: 'AbilityStats', separator: ''},
              {name: 'Speed', within: 'SpeedInfo',
               format: '<b>Speed/Run</b>: %V'},
              {name: 'Run Speed', within: 'SpeedInfo', format: '/%V'},
            {name: 'LoadInfo', within: 'AbilityStats', separator: ''},
              {name: 'Load Light', within: 'LoadInfo',
               format: '<b>Light/Med/Max Load:</b> %V'},
              {name: 'Load Medium', within: 'LoadInfo', format: '/%V'},
              {name: 'Load Max', within: 'LoadInfo', format: '/%V'}
      );
      if(name != 'Collected Notes') {
        viewer.addElements(
          {name: 'Ability Notes', within: 'Attributes', separator: noteSep}
        );
      }
      viewer.addElements(
        {name: 'FeaturesAndSkills', within: '_top', separator: outerSep,
         format: '<b>Features/Skills</b><br/>%V'},
          {name: 'FeaturePart', within: 'FeaturesAndSkills', separator: '\n'},
            {name: 'FeatStats', within: 'FeaturePart', separator: innerSep},
              {name: 'Feat Count', within: 'FeatStats', separator: listSep},
              {name: 'Selectable Feature Count', within: 'FeatStats',
               separator: listSep},
            {name: 'FeatLists', within: 'FeaturePart', separator: innerSep},
              {name: 'Feats', within: 'FeatLists', separator: listSep}
      );
      if(name != 'Collected Notes') {
        viewer.addElements(
            {name: 'Feature Notes', within: 'FeaturePart', separator: noteSep}
        );
      }
      viewer.addElements(
          {name: 'SkillPart', within: 'FeaturesAndSkills', separator: '\n'},
            {name: 'SkillStats', within: 'SkillPart', separator: ''},
              {name: 'Skill Points', within: 'SkillStats', format: '<b>Skills</b> (%V points'},
              {name: 'Max Allowed Skill Allocation', within: 'SkillStats', format: ', max %V each):'},
            {name: 'Skills', within: 'SkillPart', columns: '3LE', format: '%V', separator: null},
            {name: 'Languages', within: 'SkillPart', separator: listSep}
      );
      if(name != 'Collected Notes') {
        viewer.addElements(
            {name: 'Skill Notes', within: 'SkillPart', separator:noteSep}
        );
      }
      viewer.addElements(
        {name: 'Combat', within: '_top', separator: outerSep,
         format: '<b>Combat</b><br/>%V'},
          {name: 'CombatPart', within: 'Combat', separator: '\n'},
            {name: 'CombatStats', within: 'CombatPart', separator: innerSep},
              {name: 'Hit Points', within: 'CombatStats'},
              {name: 'Initiative', within: 'CombatStats'},
              {name: 'Armor Class', within: 'CombatStats'},
              {name: 'Damage Reduction', within: 'CombatStats',
               separator: listSep},
              {name: 'Attacks Per Round', within: 'CombatStats'},
              {name: 'AttackInfo', within: 'CombatStats', separator: ''},
                {name: 'Base Attack', within: 'AttackInfo',
                 format: '<b>Base/Melee/Ranged Attack</b>: %V'},
                {name: 'Melee Attack', within: 'AttackInfo', format: '/%V'},
                {name: 'Ranged Attack', within: 'AttackInfo', format: '/%V'},
            {name: 'Proficiencies', within: 'CombatPart', separator: innerSep},
              {name: 'Armor Proficiency', within: 'Proficiencies'},
              {name: 'Shield Proficiency', within: 'Proficiencies'},
              {name: 'Weapon Proficiency', within: 'Proficiencies'},
            {name: 'Gear', within: 'CombatPart', separator: innerSep},
              {name: 'Armor', within: 'Gear'},
              {name: 'Shield', within: 'Gear'},
              {name: 'Weapons', within: 'Gear', separator: listSep}
      );
      if(name != 'Collected Notes') {
        viewer.addElements(
            {name: 'Combat Notes', within: 'CombatPart', separator: noteSep}
        );
      }
      viewer.addElements(
            {name: 'SavesAndResistance', within: 'CombatPart',
             separator: innerSep},
              {name: 'Save', within: 'SavesAndResistance', separator: listSep},
              {name: 'Spell Resistance', within: 'SavesAndResistance'},
              {name: 'Resistance', within: 'SavesAndResistance',
               separator: listSep}
      );
      if(name != 'Collected Notes') {
        viewer.addElements(
            {name: 'Save Notes', within: 'CombatPart', separator: noteSep}
        );
      }
      viewer.addElements(
        {name: 'Magic', within: '_top', separator: outerSep,
         format: '<b>Magic</b><br/>%V'},
          {name: 'SpellPart', within: 'Magic', separator: '\n'},
            {name: 'SpellStats', within: 'SpellPart', separator: innerSep},
              {name: 'Spell Slots', within: 'SpellStats', separator:listSep},
              {name: 'Spell Points', within: 'SpellStats'},
              {name: 'Spell Difficulty Class', within: 'SpellStats',
               format: '<b>Spell DC</b>: %V', separator: listSep},
          {name: 'Spells', within: 'Magic', columns: '1L', separator: null}
      );
      if(name != 'Collected Notes') {
        viewer.addElements(
          {name: 'Magic Notes', within: 'Magic', separator: noteSep}
        );
      }
      viewer.addElements(
        {name: 'Notes Area', within: '_top', separator: outerSep,
         format: '<b>Notes</b><br/>%V'},
          {name: 'NotesPart', within: 'Notes Area', separator: '\n'}
      );
      if(name == 'Collected Notes') {
        viewer.addElements(
            {name: 'AllNotes', within: 'NotesPart', separator: '\n', columns: "1L"},
              {name: 'Ability Notes', within: 'AllNotes', separator: null, columns: "1L", format: "%V"},
              {name: 'Feature Notes', within: 'AllNotes', separator: null, columns: "1L", format: "%V"},
              {name: 'Skill Notes', within: 'AllNotes', separator: null, columns: "1L", format: "%V"},
              {name: 'Combat Notes', within: 'AllNotes', separator: null, columns: "1L", format: "%V"},
              {name: 'Save Notes', within: 'AllNotes', separator: null, columns: "1L", format: "%V"},
              {name: 'Save Notes', within: 'AllNotes', separator: null, columns: "1L", format: "%V"},
              {name: 'Magic Notes', within: 'AllNotes', separator: null, columns: "1L", format: "%V"}
        );
      }
      viewer.addElements(
            {name: 'CompanionInfo', within: 'NotesPart', separator: ' '},
              {name: 'Animal Companion', within: 'CompanionInfo', separator: ' '},
              {name: 'Animal Companion Name', within: 'CompanionInfo', format: '"%V"'},
            {name: 'Animal Companion Features', within: 'NotesPart', separator: listSep},
            {name: 'Animal Companion Stats', within: 'NotesPart', separator: listSep},
            {name: 'FamiliarInfo', within: 'NotesPart', separator: ' '},
              {name: 'Familiar Enhancement', within: 'FamiliarInfo', format: '<b>%V</b>'},
              {name: 'Familiar', within: 'FamiliarInfo', separator: ' '},
              {name: 'Familiar Name', within: 'FamiliarInfo', format: '"%V"'},
            {name: 'Familiar Features', within: 'NotesPart', separator: listSep},
            {name: 'Familiar Stats', within: 'NotesPart', separator: listSep},
            {name: 'Companion Notes', within: 'NotesPart', separator: noteSep},
            {name: 'Notes', within: 'NotesPart', format: '%V'},
            {name: 'Hidden Notes', within: 'NotesPart', format: '%V'},
          {name: 'ValidationPart', within: 'Notes Area', separator: '\n'},
            {name: 'Sanity Notes', within: 'ValidationPart', separator:noteSep},
            {name: 'Validation Notes', within: 'ValidationPart',
             separator: noteSep}
      );
    } else
      continue;
    rules.defineViewer(name, viewer);
  }
};

/*
 * Returns the list of editing elements needed by #choiceRules# to add a #type#
 * item to #rules#.
 */
SRD35.choiceEditorElements = function(rules, type) {
  var abilities =
    QuilvynUtils.getKeys(SRD35.ABILITIES).map(x => x.toLowerCase());
  var result = [];
  var sections =
    ['ability', 'combat', 'companion', 'feature', 'magic', 'skill'];
  var zeroToTen = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  if(type == 'Alignment')
    result.push(
      // empty
    );
  else if(type == 'Animal Companion' || type == 'Familiar') {
    var minusFiveToTwenty = [
      -5, -4, -3, -2, -1, 0,
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20
    ];
    var oneToThirtyFive = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
      31, 32, 33, 34, 35
    ];
    var oneToTwenty = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20
    ];
    var sizes = ['Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge'];
    result.push(
      ['Str', 'Str', 'select-one', oneToThirtyFive],
      ['Dex', 'Dex', 'select-one', oneToThirtyFive],
      ['Con', 'Con', 'select-one', oneToThirtyFive],
      ['Int', 'Int', 'select-one', oneToThirtyFive],
      ['Wis', 'Wis', 'select-one', oneToThirtyFive],
      ['Cha', 'Cha', 'select-one', oneToThirtyFive],
      ['HD', 'Hit Dice', 'select-one', oneToTwenty],
      ['AC', 'Armor Class', 'select-one', oneToTwenty],
      ['Attack', 'Attack Bonus', 'select-one', minusFiveToTwenty],
      ['Dam', 'Damage', 'text', [10]],
      ['Size', 'Size', 'select-one', sizes],
      ['Level', 'Min Master Level', 'select-one', oneToTwenty]
    );
  } else if(type == 'Armor' || type == 'Shield') {
    var zeroToFifty = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    var weights = ['None', 'Light', 'Medium', 'Heavy'];
    if(type == 'Shield')
      weights.push('Tower');
    result.push(
      ['AC', 'AC Bonus', 'select-one', [0, 1, 2, 3, 4, 5]],
      ['Weight', 'Weight', 'select-one', weights],
      ['Dex', 'Max Dex', 'select-one', zeroToTen],
      ['Skill', 'Skill Penalty', 'select-one', zeroToTen],
      ['Spell', 'Spell Failure', 'select-one', zeroToFifty]
    );
  } else if(type == 'Class') {
    result.push(
      ['Require', 'Prerequisite', 'text', [40]],
      ['HitDie', 'Hit Die', 'select-one', ['d4', 'd6', 'd8', 'd10', 'd12']],
      ['Attack', 'Base Attack', 'select-one', ['1', '3/4', '1/2']],
      ['SkillPoints', 'Skill Points/Level', 'select-one', zeroToTen],
      ['Fortitude', 'Fort Save', 'select-one', ['1/2', '1/3']],
      ['Reflex', 'Ref Save', 'select-one', ['1/2', '1/3']],
      ['Will', 'Will Save', 'select-one', ['1/2', '1/3']],
      ['Skills', 'Class Skills', 'text', [40]],
      ['Features', 'Features', 'text', [40]],
      ['Selectables', 'Selectable Features', 'text', [40]],
      ['Languages', 'Languages', 'text', [30]],
      ['CasterLevelArcane', 'Arcane Level', 'text', [10]],
      ['CasterLevelDivine', 'Divine Level', 'text', [10]],
      ['SpellAbility', 'Spell Ability', 'select-one', abilities],
      ['SpellSlots', 'Spell Slots', 'text', [40]]
    );
  } else if(type == 'Deity')
    result.push(
      ['Alignment', 'Alignment', 'select-one', QuilvynUtils.getKeys(SRD35.ALIGNMENTS)],
      ['Weapon', 'Favored Weapon', 'text', [30]],
      ['Domain', 'Domains', 'text', [30]]
    );
  else if(type == 'Feat')
    result.push(
      ['Type', 'Type', 'text', [20]],
      ['Require', 'Prerequisite', 'text', [40]],
      ['Imply', 'Implies', 'text', [40]]
    );
  else if(type == 'Feature')
    result.push(
      ['Section', 'Section', 'select-one', sections],
      ['Note', 'Note', 'text', [60]]
    );
  else if(type == 'Goody') {
    var effects = ['add', 'lower', 'raise', 'set'];
    result.push(
      ['Pattern', 'Pattern', 'text', [40]],
      ['Effect', 'Effect', 'select-one', effects],
      ['Value', 'Value', 'text', [20]],
      ['Section', 'Section', 'select-one', sections],
      ['Note', 'Note', 'text', [60]]
    );
  } else if(type == 'Language')
    result.push(
      // empty
    );
  else if(type == 'Path')
    result.push(
      ['Group', 'Group', 'text', [15]],
      ['Level', 'Level', 'text', [15]],
      ['Features', 'Features', 'text', [40]],
      ['Selectables', 'Selectable Features', 'text', [40]],
      ['SpellAbility', 'Spell Ability', 'select-one', abilities],
      ['SpellSlots', 'Spell Slots', 'text', [40]]
    );
  else if(type == 'Race')
    result.push(
      ['Require', 'Prerequisite', 'text', [40]],
      ['Features', 'Features', 'text', [40]],
      ['Selectables', 'Selectable Features', 'text', [40]],
      ['Languages', 'Languages', 'text', [30]],
      ['SpellAbility', 'Spell Ability', 'select-one', abilities],
      ['SpellSlots', 'Spell Slots', 'text', [40]]
    );
  else if(type == 'School')
    result.push(
      ['Features', 'Features', 'text', [40]]
    );
  else if(type == 'Skill')
    result.push(
      ['Ability', 'Ability', 'select-one', abilities],
      ['Untrained', 'Untrained', 'select-one', ['Y', 'N']],
      ['Class', 'Class Skill', 'text', [30]],
      ['Synergy', 'Synergy', 'text', [30]]
    );
  else if(type == 'Spell') {
    result.push(
      ['School', 'School', 'select-one', QuilvynUtils.getKeys(rules.getChoices('schools'))],
      ['Level', 'Caster Group and Level', 'text', [15]],
      ['Description', 'Description', 'text', [60]]
    );
  } else if(type == 'Weapon') {
    var twentyToSixteen = [20, 19, 18, 17, 16];
    var twoToFive = [2, 3, 4, 5];
    var zeroToOneFifty =
     [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
    result.push(
      ['Level', 'Group', 'select-one', ['Unarmed', 'Simple', 'Martial', 'Exotic']],
      ['Category', 'Category', 'select-one',
       ['Unarmed', 'Light', 'One-Handed', 'Two-Handed', 'Ranged']],
      ['Damage', 'Damage', 'select-one',
       QuilvynUtils.getKeys(SRD35.LARGE_DAMAGE)],
      ['Threat', 'Threat', 'select-one', twentyToSixteen],
      ['Crit', 'Crit Multiplier', 'select-one', twoToFive],
      ['Range', 'Range in Feet', 'select-one', zeroToOneFifty]
    );
  }
  return result;
};

/* Returns the elements in a basic SRD character editor. */
SRD35.initialEditorElements = function() {
  var abilityChoices = [
    3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
  ];
  var editorElements = [
    ['name', 'Name', 'text', [20]],
    ['imageUrl', 'Image URL', 'text', [20]],
    ['strength', 'Strength', 'select-one', abilityChoices],
    ['dexterity', 'Dexterity', 'select-one', abilityChoices],
    ['constitution', 'Constitution', 'select-one', abilityChoices],
    ['intelligence', 'Intelligence', 'select-one', abilityChoices],
    ['wisdom', 'Wisdom', 'select-one', abilityChoices],
    ['charisma', 'Charisma', 'select-one', abilityChoices],
    ['gender', 'Gender', 'text', [10]],
    ['race', 'Race', 'select-one', 'races'],
    ['levels', 'Class Levels', 'bag', 'levels'],
    ['prestige', 'Prestige Levels', 'bag', 'prestiges'],
    ['npc', 'NPC Levels', 'bag', 'npcs'],
    ['alignment', 'Alignment', 'select-one', 'alignments'],
    ['deity', 'Deity', 'select-one', 'deities'],
    ['origin', 'Origin', 'text', [20]],
    ['player', 'Player', 'text', [20]],
    ['experience', 'Experience', 'text', [8, '(\\+?\\d+)?']],
    ['feats', 'Feats', 'setbag', 'feats'],
    ['selectableFeatures', 'Selectable Features', 'set', 'selectableFeatures'],
    ['skills', 'Skills', 'bag', 'skills'],
    ['languages', 'Languages', 'set', 'languages'],
    ['hitPoints', 'Hit Points', 'text', [4, '(\\+?\\d+)?']],
    ['armor', 'Armor', 'select-one', 'armors'],
    ['shield', 'Shield', 'select-one', 'shields'],
    ['weapons', 'Weapons', 'setbag', 'weapons'],
    ['spells', 'Spells', 'fset', 'spells'],
    ['animalCompanion', 'Animal Companion', 'set', 'animalCompanions'],
    ['animalCompanionName', 'Name', 'text', [20]],
    ['familiar', 'Familiar', 'set', 'familiars'],
    ['familiarCelestial', 'Improved', 'checkbox', ['Celestial']],
    ['familiarFiendish', '', 'checkbox', ['Fiendish']],
    ['familiarName', 'Name', 'text', [20]],
    ['notes', 'Notes', 'textarea', [40,10]],
    ['hiddenNotes', 'Hidden Notes', 'textarea', [40,10]]
  ];
  return editorElements;
};

/* Returns a random name for a character of race #race#. */
SRD35.randomName = function(race) {

  /* Return a random character from #string#. */
  function randomChar(string) {
    return string.charAt(QuilvynUtils.random(0, string.length - 1));
  }

  if(race == null)
    race = 'Human';
  else if(race == 'Half-Elf')
    race = QuilvynUtils.random(0, 99) < 50 ? 'Elf' : 'Human';
  else if(race.match(/Dwarf/))
    race = 'Dwarf';
  else if(race.match(/Elf/))
    race = 'Elf';
  else if(race.match(/Gnome/))
    race = 'Gnome';
  else if(race.match(/Halfling/))
    race = 'Halfling';
  else if(race.match(/Orc/))
    race = 'Orc';
  else
    race = 'Human';

  var clusters = {
    B:'lr', C:'hlr', D:'r', F:'lr', G:'lnr', K:'lnr', P:'lr', S:'chklt', T:'hr',
    W:'h',
    c:'hkt', l:'cfkmnptv', m: 'p', n:'cgkt', r: 'fv', s: 'kpt', t: 'h'
  };
  var consonants =
    {'Dwarf': 'dgkmnprst', 'Elf': 'fhlmnpqswy', 'Gnome': 'bdghjlmnprstw',
     'Halfling': 'bdfghlmnprst', 'Human': 'bcdfghjklmnprstvwz',
     'Orc': 'dgjkprtvxz'}[race];
  var endConsonant = '';
  var leading = 'ghjqvwy';
  var vowels =
    {'Dwarf': 'aeiou', 'Elf': 'aeioy', 'Gnome': 'aeiou',
     'Halfling': 'aeiou', 'Human': 'aeiou', 'Orc': 'aou'}[race];
  var diphthongs = {a:'wy', e:'aei', o: 'aiouy', u: 'ae'};
  var syllables = QuilvynUtils.random(0, 99);
  syllables = syllables < 50 ? 2 :
              syllables < 75 ? 3 :
              syllables < 90 ? 4 :
              syllables < 95 ? 5 :
              syllables < 99 ? 6 : 7;
  var result = '';
  var vowel;

  for(var i = 0; i < syllables; i++) {
    if(QuilvynUtils.random(0, 99) <= 80) {
      endConsonant = randomChar(consonants).toUpperCase();
      if(clusters[endConsonant] != null && QuilvynUtils.random(0, 99) < 15)
        endConsonant += randomChar(clusters[endConsonant]);
      result += endConsonant;
      if(endConsonant == 'Q')
        result += 'u';
    }
    else if(endConsonant.length == 1 && QuilvynUtils.random(0, 99) < 10) {
      result += endConsonant;
      endConsonant += endConsonant;
    }
    vowel = randomChar(vowels);
    if(endConsonant.length > 0 && diphthongs[vowel] != null &&
       QuilvynUtils.random(0, 99) < 15)
      vowel += randomChar(diphthongs[vowel]);
    result += vowel;
    endConsonant = '';
    if(QuilvynUtils.random(0, 99) <= 60) {
      while(leading.indexOf((endConsonant = randomChar(consonants))) >= 0)
        ; /* empty */
      if(clusters[endConsonant] != null && QuilvynUtils.random(0, 99) < 15)
        endConsonant += randomChar(clusters[endConsonant]);
      result += endConsonant;
    }
  }
  return result.charAt(0).toUpperCase() + result.substring(1).toLowerCase();

};

/* Sets #attributes#'s #attribute# attribute to a random value. */
SRD35.randomizeOneAttribute = function(attributes, attribute) {

  /*
   * Randomly selects #howMany# elements of the array #choices#, prepends
   * #prefix# to each, and sets those attributes in #attributes# to #value#.
   */
  function pickAttrs(attributes, prefix, choices, howMany, value) {
    var remaining = [].concat(choices);
    for(var i = 0; i < howMany && remaining.length > 0; i++) {
      var which = QuilvynUtils.random(0, remaining.length - 1);
      attributes[prefix + remaining[which]] = value;
      remaining = remaining.slice(0, which).concat(remaining.slice(which + 1));
    }
  }

  var attr;
  var attrs;
  var choices;
  var howMany;
  var i;
  var matchInfo;

  if(attribute == 'armor') {
    attrs = this.applyRules(attributes);
    var characterProfLevel = attrs.armorProficiencyLevel;
    if(characterProfLevel == null)
      characterProfLevel = '0';
    choices = [];
    var armors = this.getChoices('armors');
    for(attr in armors) {
      var weight = QuilvynUtils.getAttrValue(armors[attr], 'Weight');
      if((weight != null && weight <= characterProfLevel) ||
         attrs['armorProficiency.' + attr] != null) {
        choices.push(attr);
      }
    }
    if(choices.length > 0)
      attributes.armor = choices[QuilvynUtils.random(0, choices.length - 1)];
  } else if(attribute == 'companion') {
    attrs = this.applyRules(attributes);
    var companionAttrs = {
      'features.Animal Companion':'animalCompanion',
      'features.Astirax Companion':'animalCompanion', // LastAge
      'features.Divine Mount':'animalCompanion', // Pathfinder
      'features.Familiar':'familiar', // Pathfinder
      'features.Fiendish Servant':'animalCompanion',
      'features.Special Mount':'animalCompanion',
      'features.Summon Familiar':'familiar'
    };
    for(attr in companionAttrs) {
      if(!(attr in attrs) ||
         QuilvynUtils.sumMatching(attrs, new RegExp('^' + companionAttrs[attr] + '\\.')) > 0)
        continue;
      choices =
        attr == 'features.Divine Mount' ?
          ['features.Small' in attrs ? 'Pony' : 'Horse'] :
        attr == 'features.Fiendish Servant' ?
          ['Bat', 'Cat', 'Dire Rat', 'Raven', 'Toad',
           'features.Small' in attrs ? 'Pony' : 'Heavy Horse'] :
        attr == 'features.Special Mount' ?
          ['features.Small' in attrs ? 'Pony' : 'Heavy Horse'] :
        attr == 'features.Summon Familiar' || attr == 'features.Familiar' ?
          QuilvynUtils.getKeys(this.getChoices('familiars')) :
        QuilvynUtils.getKeys(this.getChoices('animalCompanions'));
      while(true) {
        pickAttrs(attributes, companionAttrs[attr] + '.', choices, 1, 1);
        attrs = this.applyRules(attributes);
        if(attrs['validationNotes.animalCompanion'] == null &&
           attrs['validationNotes.familiar'] == null)
          break;
        for(var a in attributes) {
          if(a.startsWith(companionAttrs[attr] + '.'))
            delete attributes[a];
        }
      }
      attributes[companionAttrs[attr] + 'Name'] = SRD35.randomName(null);
    }
  } else if(attribute == 'deity') {
    /* Pick a deity that's no more than one alignment position removed. */
    var aliInfo = attributes.alignment.match(/^([CLN])\S+\s([GEN])/);
    var aliPat;
    if(aliInfo == null) /* Neutral character */
      aliPat = 'N[EG]?|[CL]N';
    else if(aliInfo[1] == 'N') /* NG or NE */
      aliPat = 'N|[CLN]' + aliInfo[2];
    else if(aliInfo[2] == 'N') /* CN or LN */
      aliPat = 'N|' + aliInfo[1] + '[GNE]';
    else /* [LC]G or [LC]E */
      aliPat = aliInfo[1] + '[N' + aliInfo[2] + ']|N' + aliInfo[2];
    choices = [];
    var deities = this.getChoices('deities');
    for(attr in deities) {
      var deityAlignment =
        QuilvynUtils.getAttrValue(deities[attr], 'Alignment');
      if(!deityAlignment ||
         deityAlignment.replace(/(\w)\w+\s(\w)\w+/, '$1$2').match(aliPat))
        choices.push(attr);
    }
    if(choices.length > 0)
      attributes.deity = choices[QuilvynUtils.random(0, choices.length - 1)];
  } else if(attribute == 'feats' || attribute == 'selectableFeatures') {
    var debug = [];
    attribute = attribute == 'feats' ? 'feat' : 'selectableFeature';
    var countPrefix = attribute + 'Count.';
    var prefix = attribute + 's';
    var toAllocateByType = {};
    attrs = this.applyRules(attributes);
    for(attr in attrs) {
      if(attr.startsWith(countPrefix)) {
        toAllocateByType[attr.replace(countPrefix, '')] = attrs[attr];
      }
    }
    var availableChoices = {};
    var allChoices = this.getChoices(prefix);
    for(attr in allChoices) {
      var types = QuilvynUtils.getAttrValueArray(allChoices[attr], 'Type');
      if(types.indexOf('General') < 0)
        types.push('General');
      if(attrs[prefix + '.' + attr] != null) {
        for(i = 0; i < types.length; i++) {
          var t = types[i];
          if(toAllocateByType[t] != null && toAllocateByType[t] > 0) {
            debug.push(prefix + '.' + attr + ' reduces ' + t + ' feats from ' + toAllocateByType[t]);
            toAllocateByType[t]--;
            break;
          }
        }
      } else if(attrs['features.' + attr] == null) {
        availableChoices[attr] = types;
      }
    }
    for(attr in toAllocateByType) {
      var availableChoicesInType = {};
      for(var a in availableChoices) {
        if(attr == 'General' || availableChoices[a].includes(attr))
          availableChoicesInType[a] = '';
      }
      howMany = toAllocateByType[attr];
      debug[debug.length] = 'Choose ' + howMany + ' ' + attr + ' ' + prefix;
      while(howMany > 0 &&
            (choices=QuilvynUtils.getKeys(availableChoicesInType)).length > 0) {
        debug[debug.length] =
          'Pick ' + howMany + ' from ' +
          QuilvynUtils.getKeys(availableChoicesInType).length;
        var pick;
        var picks = {};
        pickAttrs(picks, '', choices, howMany, 1);
        debug[debug.length] =
          'From ' + QuilvynUtils.getKeys(picks).join(", ") + ' reject';
        for(pick in picks) {
          attributes[prefix + '.' + pick] = 1;
          delete availableChoicesInType[pick];
        }
        var validate = this.applyRules(attributes);
        for(pick in picks) {
          var name = pick.charAt(0).toLowerCase() +
                     pick.substring(1).replaceAll(' ', '').
                     replace(/\(/g, '\\(').replace(/\)/g, '\\)');
          if(QuilvynUtils.sumMatching
               (validate,
                new RegExp('^(sanity|validation)Notes.' + name + '.*\\D$')) != 0) {
            delete attributes[prefix + '.' + pick];
            debug[debug.length - 1] += ' ' + name;
          } else {
            howMany--;
            delete availableChoices[pick];
          }
        }
      }
      debug[debug.length] = 'xxxxxxx';
    }
    if(window.DEBUG) {
      var notes = attributes.notes;
      attributes.notes =
        (notes != null ? attributes.notes + '\n' : '') + debug.join('\n');
    }
  } else if(attribute == 'gender') {
    attributes['gender'] = QuilvynUtils.random(0, 99) < 50 ? 'Female' : 'Male';
  } else if(attribute == 'hitPoints') {
    var allClasses = Object.assign({}, this.getChoices('levels'), this.getChoices('prestiges'), this.getChoices('npcs'));
    attrs = this.applyRules(attributes);
    attributes.hitPoints = 0;
    for(var clas in allClasses) {
      if((attr = attrs['levels.' + clas]) == null)
        continue;
      matchInfo = QuilvynUtils.getAttrValue(allClasses[clas], 'HitDie').match(/^((\d+)?d)?(\d+)$/);
      var number = matchInfo == null || matchInfo[2] == null ||
                   matchInfo[2] == '' ? 1 : matchInfo[2];
      var sides = matchInfo == null ? 6 : matchInfo[3];
      attributes.hitPoints += number * sides;
      while(--attr > 0)
        attributes.hitPoints += QuilvynUtils.random(number, number * sides);
    }
  } else if(attribute == 'languages') {
    attrs = this.applyRules(attributes);
    choices = [];
    howMany = attrs.languageCount;
    for(attr in this.getChoices('languages')) {
      if(attrs['languages.' + attr] == null) {
        choices[choices.length] = attr;
      } else {
        howMany--;
      }
    }
    if(howMany > 0)
      pickAttrs(attributes, 'languages.', choices, howMany, 1);
  } else if(attribute == 'levels') {
    var assignedLevels =
      QuilvynUtils.sumMatching(attributes, /^levels\./) +
      QuilvynUtils.sumMatching(attributes, /^npc\./) +
      QuilvynUtils.sumMatching(attributes, /^prestige\./);
    if(!attributes.level) {
      if(assignedLevels > 0)
        attributes.level = assignedLevels;
      else if(attributes.experience)
        attributes.level =
          Math.floor((1 + Math.sqrt(1 + attributes.experience/125)) / 2);
      else
        // Random 1..8 with each value half as likely as the previous one.
        attributes.level =
          9 - Math.floor(Math.log(QuilvynUtils.random(2, 511)) / Math.log(2));
    }
    var max = attributes.level * (attributes.level + 1) * 1000 / 2 - 1;
    var min = attributes.level * (attributes.level - 1) * 1000 / 2;
    var which;
    if(!attributes.experience || attributes.experience < min)
      attributes.experience = QuilvynUtils.random(min, max);
    choices = QuilvynUtils.getKeys(this.getChoices('levels'));
    if(assignedLevels == 0) {
      var classesToChoose =
        attributes.level == 1 || QuilvynUtils.random(1,10) < 9 ? 1 : 2;
      while(classesToChoose > 0) {
        which = 'levels.' + choices[QuilvynUtils.random(0, choices.length - 1)];
        attributes[which] = 1;
        assignedLevels++;
        classesToChoose--;
      }
    }
    while(assignedLevels < attributes.level) {
      which = 'levels.' + choices[QuilvynUtils.random(0,choices.length - 1 )];
      while(!attributes[which]) {
        which = 'levels.' + choices[QuilvynUtils.random(0, choices.length - 1)];
      }
      attributes[which]++;
      assignedLevels++;
    }
    delete attributes.level;
  } else if(attribute == 'name') {
    attributes.name = SRD35.randomName(attributes.race);
  } else if(attribute == 'shield') {
    attrs = this.applyRules(attributes);
    var characterProfLevel = attrs.shieldProficiencyLevel;
    if(characterProfLevel == null) {
      characterProfLevel = '0';
    }
    choices = [];
    var shields = this.getChoices('shields');
    for(attr in shields) {
      var weight = QuilvynUtils.getAttrValue(shields[attr], 'Weight');
      if((weight != null && weight <= characterProfLevel) ||
         attrs['shieldProficiency.' + attr] != null) {
        choices[choices.length] = attr;
      }
    }
    if(choices.length > 0)
      attributes.shield = choices[QuilvynUtils.random(0, choices.length - 1)];
  } else if(attribute == 'skills') {
    attrs = this.applyRules(attributes);
    var maxPoints = attrs.maxAllowedSkillAllocation;
    howMany =
      attrs.skillPoints - QuilvynUtils.sumMatching(attributes, '^skills\\.');
    choices = QuilvynUtils.getKeys(this.getChoices('skills'));
    while(howMany > 0 && choices.length > 0) {
      var pickClassSkill = QuilvynUtils.random(0, 99) >= 15;
      i = QuilvynUtils.random(0, choices.length - 1);
      var skill = choices[i];
      if((attrs['classSkills.' + skill] != null) != pickClassSkill)
        continue;
      attr = 'skills.' + skill;
      var current = attributes[attr];
      if(current == null) {
        current = attributes[attr] = 0;
      } else if(current >= maxPoints) {
        choices = choices.slice(0, i).concat(choices.slice(i + 1));
        continue;
      }
      var toAssign =
        QuilvynUtils.random(0, 99) >= 66 ? maxPoints :
        QuilvynUtils.random(0, 99) >= 50 ? Math.floor(maxPoints / 2) : 2;
      if(toAssign > howMany)
        toAssign = howMany;
      if(toAssign == 0)
        toAssign = 1;
      if(current + toAssign > maxPoints)
        toAssign = maxPoints - current;
      attributes[attr] += toAssign;
      howMany -= toAssign;
      // Select only one of a set of subskills (Craft, Perform, etc.)
      if((i = skill.indexOf(' (')) >= 0) {
        skill = skill.substring(0, i);
        for(i = choices.length - 1; i >= 0; i--)
          if(choices[i].startsWith(skill))
            choices = choices.slice(0, i).concat(choices.slice(i + 1));
      }
    }
  } else if(attribute == 'spells') {
    var availableSpellsByLevel = {};
    var groupAndLevel;
    var prohibitPat = ' (xxxx';
    var schools = this.getChoices('schools');
    attrs = this.applyRules(attributes);
    for(attr in schools) {
      if(attrs['features.School Opposition (' + attr + ')'])
         prohibitPat += '|' + attr.substring(0, 4);
    }
    prohibitPat += ')\\)';
    for(attr in this.getChoices('spells')) {
      if(attrs['spells.' + attr] != null || attr.match(prohibitPat))
        continue;
      groupAndLevel = attr.split('(')[1].split(' ')[0];
      if(availableSpellsByLevel[groupAndLevel] == null)
        availableSpellsByLevel[groupAndLevel] = [];
      availableSpellsByLevel[groupAndLevel].push(attr);
    }
    for(attr in attrs) {
      if((matchInfo = attr.match(/^spellSlots\.(.*)/)) == null)
        continue;
      howMany = attrs[attr];
      groupAndLevel = matchInfo[1].replace(/^S(\d)/, 'W$1');
      choices = [];
      if(groupAndLevel.startsWith('Domain')) {
        for(var x in attrs) {
          if((matchInfo = x.match(/features.(.*)\sDomain$/)) != null) {
            groupAndLevel = groupAndLevel.replace(/^\D+/, matchInfo[1]);
            if(groupAndLevel in availableSpellsByLevel)
              choices = choices.concat(availableSpellsByLevel[groupAndLevel]);
            howMany -=
              QuilvynUtils.sumMatching(attributes, '^spells.*' + groupAndLevel);
          }
        }
      } else {
        if(groupAndLevel in availableSpellsByLevel)
          choices = availableSpellsByLevel[groupAndLevel];
        howMany -=
          QuilvynUtils.sumMatching(attributes, '^spells.*' + groupAndLevel);
      }
      pickAttrs(attributes, 'spells.', choices, howMany, 1);
    }
  } else if(attribute == 'weapons') {
    attrs = this.applyRules(attributes);
    var characterProfLevel = attrs.weaponProficiencyLevel;
    if(characterProfLevel == null) {
      characterProfLevel = '0';
    }
    choices = [];
    var weapons = this.getChoices('weapons');
    for(attr in weapons) {
      matchInfo = weapons[attr].match(/Level=(\d)/);
      var requiredProfLevel = matchInfo ? matchInfo[1] : '3';
      if(requiredProfLevel <= characterProfLevel ||
         attrs['features.Weapon Proficiency (' + attr + ')'] != null) {
        choices[choices.length] = attr;
      }
    }
    pickAttrs(attributes, 'weapons.', choices,
              3 - QuilvynUtils.sumMatching(attributes, /^weapons\./), 1);
  } else if(attribute == 'abilities' ||
            attribute.charAt(0).toUpperCase() + attribute.substring(1) in SRD35.ABILITIES) {
    for(attr in SRD35.ABILITIES) {
      attr = attr.toLowerCase();
      if(attr != attribute && attribute != 'abilities')
        continue;
      var rolls = [];
      for(i = 0; i < 4; i++)
        rolls.push(QuilvynUtils.random(1, 6));
      rolls.sort();
      attributes[attr] = rolls[1] + rolls[2] + rolls[3];
    }
  } else if(this.getChoices(attribute + 's') != null) {
    attributes[attribute] =
      QuilvynUtils.randomKey(this.getChoices(attribute + 's'));
  }

};

/* Fixes as many validation errors in #attributes# as possible. */
SRD35.makeValid = function(attributes) {

  var attributesChanged = {};
  var debug = [];
  var notes = this.getChoices('notes');

  // If 8 passes don't get rid of all repairable problems, give up
  for(var pass = 0; pass < 8; pass++) {

    var applied = this.applyRules(attributes);
    var fixedThisPass = 0;

    // Try to fix each sanity and validation note w/a non-zero value
    for(var attr in applied) {

      if(!attr.match(/^(sanity|validation)Notes/) || !applied[attr] ||
         notes[attr] == null)
        continue;

      var currentValue = null;
      var groupChoices = null;
      var index = null;
      var matchInfo = null;
      var problemGroup = null;
      var targetAttr = null;
      var targetChoices = null;
      var targetValue = null;

      if(attr == 'validationNotes.abilityModifierSum') {

        for(targetAttr in SRD35.ABILITIES) {
          targetAttr = targetAttr.toLowerCase();
          if(applied[targetAttr + 'Modifier'] <= 0) {
            targetValue = attributes[targetAttr] + 2;
            debug[debug.length] =
              attr + " '" + targetAttr + "': '" + attributes[targetAttr] +
              "' => '" + targetValue + "'";
            attributes[targetAttr] = targetValue;
            // Don't do this: attributesChanged[targetAttr] = targetValue;
            fixedThisPass++;
          }
        }

      } else if((matchInfo = attr.match(/\.(\w+)Allocation$/)) != null) {

        var allocated = applied[attr + '.2'];
        var available = applied[attr + '.1'];
        problemGroup = matchInfo[1] + 's';
        groupChoices = this.getChoices(problemGroup);
        if(groupChoices == null || allocated == null || available == null) {
          console.log('Error fixing allocation from ' + attr);
          continue;
        }

        if(allocated > available) {
          var excess = allocated - available;
          targetChoices = [];
          for(var a in attributes) {
            if(a.match('^' + problemGroup + '\\.') &&
               !(a in attributesChanged) && attributes[a] > 0) {
              targetChoices.push(a);
            }
          }
          while(targetChoices.length > 0 && excess > 0) {
            index = QuilvynUtils.random(0, targetChoices.length - 1);
            targetAttr = targetChoices[index];
            targetChoices.splice(index, 1);
            currentValue = attributes[targetAttr];
            targetValue = Math.max(currentValue - excess, 0);
            debug[debug.length] =
              attr + " '" + targetAttr + "': '" + attributes[targetAttr] +
              "' => '" + targetValue + "'";
            if(targetValue == 0) {
              delete attributes[targetAttr];
            } else {
              attributes[targetAttr] = targetValue;
            }
            excess -= currentValue - targetValue;
            // Don't do this: attributesChanged[targetAttr] = targetValue;
            fixedThisPass++;
          }
        } else {
          this.randomizeOneAttribute(attributes, problemGroup);
          debug[debug.length] = attr + ' Allocate additional ' + problemGroup;
          fixedThisPass++;
        }

      } else if(notes[attr].match(/^(Implies|Requires)\s/)) {

        var requirements =
          notes[attr].replace(/^(Implies|Requires)\s/, '').split(/\s*\/\s*/);

        for(var i = 0; i < requirements.length; i++) {

          // If multiple alternatives, choose a random one to fix
          var alternatives = requirements[i].split(/\s*\|\|\s*/);
          matchInfo = null;
          while(matchInfo == null && alternatives.length > 0) {
            index = QuilvynUtils.random(0, alternatives.length - 1);
            matchInfo =
              alternatives[index].match(/^([^<>!=]+)(([<>!=~]+)(.*))?/);
            alternatives.splice(index, 1);
          }
          if(matchInfo == null)
            continue; // No workable alternatives

          targetAttr =
            matchInfo[1].replace(/\s*$/, '').replace('features', 'feats');
          var targetOp = matchInfo[3] == null ? '>=' : matchInfo[3];
          targetValue = matchInfo[4] == null ? 1 :
                        matchInfo[4].trim().replace(/^\s*["']|['"]$/g, '');
          if(targetAttr.match(/^(Max|Sum)\s/)) {
            var pat =
              new RegExp(targetAttr.substring(3).replace(/^\s+["']|['"]$/g,''));
            problemGroup = targetAttr.substring(3).replace(/^\W*|\W.*$/g, '');
            targetChoices = [];
            for(var a in this.getChoices(problemGroup)) {
              if((problemGroup + '.' + a).match(pat))
                targetChoices.push(problemGroup + '.' + a);
            }
            if(targetChoices.length == 0)
              continue; // No matching items
            index = QuilvynUtils.random(0, targetChoices.length - 1);
            targetAttr = targetChoices[index];
            if(problemGroup != 'skills')
              targetValue = 1;
          }
          if(applied[targetValue] != null)
            targetValue = applied[targetValue];
          if(targetOp == '>') {
            targetOp = '>=';
            targetValue = targetValue * 1 + 1;
          } else if(targetOp == '<') {
            targetOp = '<=';
            targetValue = targetValue * 1 - 1;
          }

          // Allow features to come from, e.g. class as well as feats
          currentValue = applied[targetAttr.replace('feats.', 'features.')];
          if(currentValue != null) {
            if(targetOp == '==' ? currentValue == targetValue :
               targetOp == '!=' ? currentValue != targetValue :
               targetOp == '>=' ? Number(currentValue) >= Number(targetValue) :
               targetOp == '<=' ? Number(currentValue) <= Number(targetValue) :
               targetOp == '=~' ? currentValue.match(targetValue) :
               targetOp == '!~' ? !currentValue.match(targetValue) :
               false)
              continue; // No fix needed
          }

          // If this attr has a set of possible values (e.g., race), choose a
          // random one that satisfies targetOp
          if((groupChoices = this.getChoices(targetAttr + 's')) != null) {
            targetChoices = [];
            for(var value in groupChoices) {
              if((targetOp == '==' && value == targetValue) ||
                 (targetOp == '!=' && value != targetValue) ||
                 (targetOp == '=~' && value.match(new RegExp(targetValue))) ||
                 (targetOp == '!~' && !value.match(new RegExp(targetValue)))) {
                targetChoices.push(value);
              }
            }
            if(targetChoices.length == 0)
              continue; // No fix possible
            targetOp = '==';
            index = QuilvynUtils.random(0, targetChoices.length - 1);
            targetValue = targetChoices[index];
          }

          if(!(targetAttr in attributesChanged) &&
             (targetAttr in attributes || targetAttr.indexOf('.') > 0)) {
            debug.push(
              attr + " '" + targetAttr + "': '" + attributes[targetAttr] +
              "' => '" + targetValue + "'"
            );
            if(targetValue == 0) {
              delete attributes[targetAttr];
            } else {
              attributes[targetAttr] = targetValue;
            }
            attributesChanged[targetAttr] = targetValue;
            fixedThisPass++;
          }

        }

      }

    }

    debug[debug.length] = '-----';
    if(fixedThisPass == 0)
      break;

  }

  if(window.DEBUG) {
    notes = attributes.notes;
    attributes.notes =
      (notes != null ? attributes.notes + '\n' : '') + debug.join('\n');
  }

};

/* Returns an array of plugins upon which this one depends. */
SRD35.getPlugins = function() {
  return [];
};

/* Returns HTML body content for user notes associated with this rule set. */
SRD35.ruleNotes = function() {
  return '' +
    '<h2>Quilvyn SRD v3.5 Rule Set Notes</h2>\n' +
    '<p>\n' +
    'Quilvyn SRD v3.5 Rule Set Version ' + SRD35.VERSION + '\n' +
    '</p>\n' +
    '<h3>Usage Notes</h3>\n' +
    '<ul>\n' +
    '  <li>\n' +
    '    Although they have a range increment, the weapons Club, Dagger,' +
    '    Light Hammer, Sai, Shortspear, Spear, and Trident are all' +
    '    considered melee weapons.  Substitute the ranged attack attribute' +
    '    for the melee attack attribute given on the character sheet when' +
    '    any of these is thrown.\n' +
    '  </li><li>\n' +
    '    The armor class of characters with the Dodge feat includes a +1' +
    '    bonus that applies only to one foe at a time.\n' +
    '  </li><li>\n' +
    '    For purposes of computing strength damage bonuses, Quilvyn assumes' +
    '    that characters with a buckler wield their weapons one-handed and' +
    '    that characters with no buckler or shield wield with both hands.\n' +
    '  </li><li>\n' +
    '    Quilvyn assumes that masterwork composite bows are specially built' +
    '    to allow a strength damage bonus to be applied.\n' +
    '  </li><li>\n' +
    '    Quilvyn gives Commoners Simple Weapon Proficiency to account for' +
    "    the class's proficiency in a single simple weapon.\n" +
    '  </li>\n' +
    '</ul>\n' +
    '\n' +
    '<h3>Limitations</h3>\n' +
    '<ul>\n' + '  <li>\n' +
    '    Racial favored class is not reported.\n' +
    '  </li><li>\n' +
    '    You can only select each feat once. Multiple selections of feats\n' +
    '    that allow it can be managed by defining custom feats.\n' +
    '  </li><li>\n' +
    "    Quilvyn doesn't support double weapons where the two attacks have\n" +
    '    different critical multipliers. In the predefined weapons this\n' +
    '    affects only the Gnome Hooked Hammer, where Quilvyn displays a\n' +
    '    critical multiplier of x4 instead of x3/x4.\n' +
    '  </li><li>\n' +
    '    Quilvyn does not track companion feats, skills, and tricks.\n' +
    '  </li><li>\n' +
    '    Blackguard features of fallen Paladins are not reported.\n' +
    '  </li>\n' +
    '</ul>\n' +
    '\n' +
    '<h3>Known Bugs</h3>\n' +
    '<ul>\n' +
    '  <li>\n' +
    '    When an character ability score is modified, Quilvyn recalculates\n' +
    '    attributes based on that ability from scratch.  For example,\n' +
    '    bumping intelligence when a character reaches fourth level causes\n' +
    '    Quilvyn to recompute the number of skill points awarded at first\n' +
    '    through third levels.\n' +
    '  </li><li>\n' +
    '    Quilvyn gives multiclass characters quadruple skill points for the\n' +
    '    first level of each class, instead of just the first class.\n' +
    '  </li>\n' +
    '</ul>\n' +
    '<h3>Copyrights and Licensing</h3>\n' +
    '<p>\n' +
    'System Reference Document material is Open Game Content released by ' +
    'Wizards of the Coast under the Open Game License. System Reference ' +
    'Document Copyright 2000-2003, Wizards of the Coast, Inc.; Authors ' +
    'Jonathan Tweet, Monte Cook, Skip Williams, Rich Baker, Andy Collins, ' +
    'David Noonan, Rich Redman, Bruce R. Cordell, John D. Rateliff, Thomas ' +
    'Reid, James Wyatt, based on original material by E. Gary Gygax and Dave ' +
    'Arneson.\n' +
    '</p><p>\n' +
    'Open Game License v 1.0a Copyright 2000, Wizards of the Coast, LLC. You ' +
    'should have received a copy of the Open Game License with this program; ' +
    'if not, you can obtain one from ' +
    'https://media.wizards.com/2016/downloads/SRD-OGL_V1.1.pdf. ' +
    '<a href="plugins/ogl-srd35.txt">Click here</a> to see the license.<br/>\n'+
    '</p><p>\n' +
    'Quilvyn is not approved or endorsed by Wizards of the Coast. Portions ' +
    'of the materials used are property of Wizards of the Coast. ©Wizards of ' +
    'the Coast LLC.\n' +
    '</p>\n';
};
