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

"use strict";

var SRD35_VERSION = '1.5.1.0beta';

/*
 * This module loads the rules from the System Reference Documents v3.5.  The
 * SRD35 function contains methods that load rules for particular parts of the
 * SRD; raceRules for character races, magicRules for spells, etc.  These
 * member methods can be called independently in order to use a subset of the
 * SRD v3.5 rules.  Similarly, the constant fields of SRD35 (ALIGNMENTS, FEATS,
 * etc.) can be manipulated to modify the choices.
 */
function SRD35() {
  var rules = new ScribeRules('SRD v3.5', SRD35_VERSION);
  rules.editorElements = SRD35.initialEditorElements();
  rules.randomizeOneAttribute = SRD35.randomizeOneAttribute;
  rules.makeValid = SRD35.makeValid;
  rules.ruleNotes = SRD35.ruleNotes;
  SRD35.viewer = new ObjectViewer();
  SRD35.createViewers(rules, SRD35.VIEWERS);
  SRD35.abilityRules(rules);
  SRD35.raceRules(rules, SRD35.LANGUAGES, SRD35.RACES);
  SRD35.classRules(rules, SRD35.CLASSES);
  SRD35.companionRules(rules, SRD35.ANIMAL_COMPANIONS, SRD35.FAMILIARS);
  SRD35.skillRules(rules, SRD35.SKILLS, SRD35.SUBSKILLS, SRD35.SYNERGIES);
  SRD35.featRules(rules, SRD35.FEATS, SRD35.SUBFEATS);
  SRD35.descriptionRules(rules, SRD35.ALIGNMENTS, SRD35.DEITIES, SRD35.GENDERS);
  SRD35.equipmentRules(rules, SRD35.ARMORS, SRD35.SHIELDS, SRD35.WEAPONS);
  SRD35.combatRules(rules);
  SRD35.movementRules(rules);
  SRD35.magicRules(rules, SRD35.CLASSES, SRD35.DOMAINS, SRD35.SCHOOLS);
  SRD35.spellRules(rules, rules.getChoices('spells'), SRD35.spellsDescriptions);
  rules.defineChoice('preset', 'race', 'level', 'levels');
  rules.defineChoice('random', SRD35.RANDOMIZABLE_ATTRIBUTES);
  Scribe.addRuleSet(rules);
  SRD35.rules = rules;
}

// JavaScript expressions for several (mostly class-based) attributes.
SRD35.ATTACK_BONUS_GOOD = 'source';
SRD35.ATTACK_BONUS_AVERAGE = 'source - Math.floor((source + 3) / 4)';
SRD35.ATTACK_BONUS_POOR = 'Math.floor(source / 2)';
SRD35.PROFICIENCY_HEAVY = 3;
SRD35.PROFICIENCY_LIGHT = 1;
SRD35.PROFICIENCY_MEDIUM = 2;
SRD35.PROFICIENCY_NONE = 0;
SRD35.PROFICIENCY_TOWER = 4;
SRD35.SAVE_BONUS_GOOD = '2 + Math.floor(source / 2)';
SRD35.SAVE_BONUS_POOR = 'Math.floor(source / 3)';
SRD35.CATEGORY_UNARMED = 0;
SRD35.CATEGORY_LIGHT = 1;
SRD35.CATEGORY_ONE_HANDED = 2;
SRD35.CATEGORY_TWO_HANDED = 3;
SRD35.CATEGORY_RANGED = 4;

// Arrays of choices
SRD35.ALIGNMENTS = [
  'Chaotic Evil', 'Chaotic Good', 'Chaotic Neutral', 'Neutral', 'Neutral Evil',
  'Neutral Good', 'Lawful Evil', 'Lawful Good', 'Lawful Neutral'
];
// Attack, Dam, AC include all modifiers
SRD35.ANIMAL_COMPANIONS = {
  'Badger': 'Attack=4 HD=1 AC=15 Dam=2@1d2-1,1d3-1 Str=8 Dex=17 Con=15 Int=2 Wis=12 Cha=6',
  'Camel': 'Attack=0 HD=3 AC=13 Dam=1d4+2 Str=18 Dex=16 Con=14 Int=2 Wis=11 Cha=4',
  'Crocodile': 'Attack=6 HD=3 AC=15 Dam=1d8+6,1d12+6 Str=19 Dex=12 Con=17 Int=1 Wis=12 Cha=2',
  'Dire Rat': 'Attack=4 HD=1 AC=15 Dam=1d4 Str=10 Dex=17 Con=12 Int=1 Wis=12 Cha=4',
  'Dog': 'Attack=2 HD=1 AC=15 Dam=1d4+1 Str=13 Dex=17 Con=15 Int=2 Wis=12 Cha=6',
  'Eagle': 'Attack=3 HD=1 AC=14 Dam=2@1d4,1d4 Str=10 Dex=15 Con=12 Int=2 Wis=14 Cha=6',
  'Hawk': 'Attack=5 HD=1 AC=17 Dam=1d4-2 Str=6 Dex=17 Con=10 Int=2 Wis=14 Cha=6',
  'Heavy Horse': 'Attack=-1 HD=3 AC=13 Dam=1d6+1 Str=16 Dex=13 Con=15 Int=2 Wis=12 Cha=6',
  'Light Horse': 'Attack=-2 HD=3 AC=13 Dam=1d4+1 Str=14 Dex=13 Con=15 Int=2 Wis=12 Cha=6',
  'Medium Shark': 'Attack=4 HD=3 AC=15 Dam=1d6+1 Str=13 Dex=15 Con=13 Int=1 Wis=12 Cha=2',
  'Medium Viper': 'Attack=4 HD=2 AC=16 Dam=1d4-1 Str=8 Dex=17 Con=11 Int=1 Wis=12 Cha=2',
  'Owl': 'Attack=5 HD=1 AC=17 Dam=1d4-3 Str=4 Dex=17 Con=10 Int=2 Wis=14 Cha=4',
  'Pony': 'Attack=-3 HD=2 AC=13 Dam=1d3 Str=13 Dex=13 Con=12 Int=2 Wis=11 Cha=4',
  'Porpoise': 'Attack=4 HD=2 AC=15 Dam=2d4 Str=11 Dex=17 Con=13 Int=2 Wis=12 Cha=6',
  'Riding Dog': 'Attack=3 HD=2 AC=16 Dam=1d6+3 Str=15 Dex=15 Con=15 Int=2 Wis=12 Cha=6',
  'Small Viper': 'Attack=4 HD=1 AC=17 Dam=1d2-2 Str=6 Dex=17 Con=11 Int=1 Wis=12 Cha=2',
  'Squid': 'Attack=4 HD=3 AC=16 Dam=0,1d6+1 Str=14 Dex=17 Con=11 Int=1 Wis=12 Cha=2',
  'Wolf': 'Attack=3 HD=2 AC=14 Dam=1d6+1 Str=13 Dex=15 Con=15 Int=2 Wis=12 Cha=6',

  'Ape': 'Attack=7 HD=4 AC=14 Dam=1d6+5,1d6+2 Str=21 Dex=15 Con=14 Int=2 Wis=12 Cha=7 Level=4',
  'Bison': 'Attack=8 HD=5 AC=13 Dam=1d8+9 Str=22 Dex=10 Con=16 Int=2 Wis=11 Cha=4 Level=4',
  'Black Bear': 'Attack=6 HD=3 AC=13 Dam=2@1d4+4,1d6+2 Str=19 Dex=13 Con=15 Int=2 Wis=12 Cha=6 Level=4',
  'Boar': 'Attack=4 HD=3 AC=16 Dam=1d8+3 Str=15 Dex=10 Con=17 Int=2 Wis=13 Cha=4 Level=4',
  'Cheetah': 'Attack=6 HD=3 AC=15 Dam=2@1d2+1,1d6+3 Str=16 Dex=19 Con=15 Int=2 Wis=12 Cha=6 Level=4',
  'Constrictor': 'Attack=5 HD=3 AC=15 Dam=1d3+4 Str=17 Dex=17 Con=13 Int=1 Wis=12 Cha=2 Level=4',
  'Dire Badger': 'Attack=4 HD=3 AC=16 Dam=2@1d4+2,1d6+1 Str=14 Dex=17 Con=19 Int=2 Wis=12 Cha=10 Level=4',
  'Dire Bat': 'Attack=5 HD=4 AC=20 Dam=1d8+4 Str=17 Dex=22 Con=17 Int=2 Wis=14 Cha=6 Level=4',
  'Dire Weasel': 'Attack=6 HD=3 AC=16 Dam=1d6+3 Str=14 Dex=19 Con=10 Int=2 Wis=12 Cha=11 Level=4',
  'Large Shark': 'Attack=7 HD=7 AC=15 Dam=1d8+4 Str=17 Dex=15 Con=13 Int=1 Wis=12 Cha=2 Level=4',
  'Large Viper': 'Attack=4 HD=3 AC=15 Dam=1d4 Str=10 Dex=17 Con=11 Int=1 Wis=12 Cha=2 Level=4',
  'Leopard': 'Attack=6 HD=3 AC=15 Dam=2@1d3+1,1d6+3 Str=16 Dex=19 Con=15 Int=2 Wis=12 Cha=6 Level=4',
  'Monitor Lizard': 'Attack=5 HD=3 AC=15 Dam=1d8+4 Str=17 Dex=15 Con=17 Int=1 Wis=12 Cha=2 Level=4',
  'Wolverine': 'Attack=4 HD=3 AC=14 Dam=2@1d4+2,1d6+1 Str=14 Dex=15 Con=19 Int=2 Wis=12 Cha=10 Level=4',

  'Brown Bear': 'Attack=11 HD=6 AC=15 Dam=2@1d8+8,2d6+4 Str=27 Dex=13 Con=19 Int=2 Wis=12 Cha=6 Level=7',
  'Deinonychus': 'Attack=7 HD=4 AC=17 Dam=1d8+4,2@1d3+2,2d4+2 Str=19 Dex=15 Con=19 Int=2 Wis=12 Cha=10 Level=7',
  'Dire Ape': 'Attack=8 HD=5 AC=15 Dam=2@1d6+6,1d8+3 Str=22 Dex=15 Con=14 Int=2 Wis=12 Cha=7 Level=7',
  'Dire Boar': 'Attack=12 HD=7 AC=15 Dam=1d8+12 Str=27 Dex=10 Con=17 Int=2 Wis=13 Cha=8 Level=7',
  'Dire Wolf': 'Attack=11 HD=6 AC=14 Dam=1d8+10 Str=25 Dex=15 Con=17 Int=2 Wis=12 Cha=10 Level=7',
  'Dire Wolverine': 'Attack=8 HD=5 AC=16 Dam=2@1d6+6,1d8+3 Str=22 Dex=17 Con=19 Int=2 Wis=12 Cha=10 Level=7',
  'Elasmosaurus': 'Attack=13 HD=10 AC=13 Dam=2d8+12 Str=26 Dex=14 Con=22 Int=2 Wis=13 Cha=9 Level=7',
  'Giant Crocodile': 'Attack=11 HD=7 AC=16 Dam=2d8+12,1d12+12 Str=27 Dex=12 Con=19 Int=1 Wis=12 Cha=2 Level=7',
  'Huge Viper': 'Attack=6 HD=6 AC=15 Dam=1d6+4 Str=16 Dex=15 Con=13 Int=1 Wis=12 Cha=2 Level=7',
  'Lion': 'Attack=7 HD=5 AC=15 Dam=2@1d4+5,1d8+2 Str=21 Dex=17 Con=15 Int=2 Wis=12 Cha=6 Level=7',
  'Rhinoceros': 'Attack=13 HD=8 AC=16 Dam=2d6+12 Str=26 Dex=10 Con=21 Int=2 Wis=13 Cha=2 Level=7',
  'Tiger': 'Attack=9 HD=6 AC=14 Dam=2@1d8+6,2d6+3 Str=23 Dex=15 Con=17 Int=2 Wis=12 Cha=6 Level=7',

  'Dire Lion': 'Attack=15 HD=8 AC=13 Dam=2@1d6+7,1d8+3 Str=25 Dex=15 Con=17 Int=2 Wis=12 Cha=10 Level=10',
  'Giant Constrictor': 'Attack=15 HD=11 AC=12 Dam=1d8+10 Str=25 Dex=17 Con=13 Int=1 Wis=12 Cha=2 Level=10',
  'Huge Shark': 'Attack=10 HD=10 AC=15 Dam=2d6+7 Str=21 Dex=15 Con=15 Int=1 Wis=12 Cha=2 Level=10',
  'Megaraptor': 'Attack=10 HD=8 AC=17 Dam=2d6+5,2@1d4+2,1d8+2 Str=21 Dex=15 Con=21 Int=2 Wis=15 Cha=10 Level=10',
  'Orca': 'Attack=12 HD=9 AC=16 Dam=2d6+12 Str=27 Dex=15 Con=21 Int=2 Wis=14 Cha=6 Level=10',
  'Polar Bear': 'Attack=13 HD=8 AC=15 Dam=2@1d8+8,2d6+4 Str=27 Dex=13 Con=19 Int=2 Wis=12 Cha=6 Level=10',

  'Dire Bear': 'Attack=19 HD=12 AC=17 Dam=2@2d4+10,2d8+5 Str=31 Dex=13 Con=19 Int=2 Wis=12 Cha=10 Level=13',
  'Elephant': 'Attack=16 HD=11 AC=15 Dam=2d6+10,2@2d6+5 Str=30 Dex=10 Con=21 Int=2 Wis=13 Cha=7 Level=13',
  'Giant Octopus': 'Attack=10 HD=8 AC=18 Dam=8@1d4+5,1d8+2 Str=20 Dex=15 Con=13 Int=2 Wis=12 Cha=3 Level=13',

  'Dire Shark': 'Attack=18 HD=18 AC=17 Dam=2d8+9 Str=23 Dex=15 Con=17 Int=1 Wis=12 Cha=10 Level=16',
  'Dire Tiger': 'Attack=20 HD=16 AC=17 Dam=2@2d4+8,2d6+4 Str=27 Dex=15 Con=17 Int=2 Wis=12 Cha=10 Level=16',
  'Giant Squid': 'Attack=15 HD=12 AC=17 Dam=10@1d6+8,2d8+4 Str=26 Dex=17 Con=13 Int=1 Wis=12 Cha=2 Level=16',
  'Triceratops': 'Attack=20 HD=16 AC=18 Dam=2d8+15 Str=30 Dex=9 Con=25 Int=1 Wis=12 Cha=7 Level=16',
  'Tyrannosaurus': 'Attack=20 HD=18 AC=14 Dam=3d6+13 Str=28 Dex=12 Con=21 Int=2 Wis=15 Cha=10 Level=16'
};
SRD35.ARMORS = [
  'None', 'Padded', 'Leather', 'Studded Leather', 'Chain Shirt', 'Hide',
  'Scale Mail', 'Chainmail', 'Breastplate', 'Splint Mail', 'Banded Mail',
  'Half Plate', 'Full Plate'
];
SRD35.CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin',
  'Ranger', 'Rogue', 'Sorcerer', 'Wizard'
];
SRD35.DEITIES = ['None::']; // The SRD defines no deities
SRD35.DOMAINS = [
  'Air', 'Animal', 'Chaos', 'Death', 'Destruction', 'Earth', 'Evil', 'Fire',
  'Good', 'Healing', 'Knowledge', 'Law', 'Luck', 'Magic', 'Plant',
  'Protection', 'Strength', 'Sun', 'Travel', 'Trickery', 'War', 'Water'
];
// Attack, Dam, AC include all modifiers
SRD35.FAMILIARS = {
  'Bat': 'Attack=0 HD=1 AC=16 Dam=0 Str=1 Dex=15 Con=10 Int=2 Wis=14 Cha=4',
  'Cat': 'Attack=4 HD=1 AC=14 Dam=2@1d2-4,1d3-4 Str=3 Dex=15 Con=10 Int=2 Wis=12 Cha=7',
  'Hawk': 'Attack=5 HD=1 AC=17 Dam=1d4-2 Str=6 Dex=17 Con=10 Int=2 Wis=14 Cha=6',
  'Lizard': 'Attack=4 HD=1 AC=14 Dam=1d4-4 Str=3 Dex=15 Con=10 Int=1 Wis=12 Cha=2',
  'Owl': 'Attack=5 HD=1 AC=17 Dam=1d4-3 Str=4 Dex=17 Con=10 Int=2 Wis=14 Cha=4',
  'Rat': 'Attack=4 HD=1 AC=14 Dam=1d3-4 Str=2 Dex=15 Con=10 Int=2 Wis=12 Cha=2',
  'Raven': 'Attack=4 HD=1 AC=14 Dam=1d2-5 Str=1 Dex=15 Con=10 Int=2 Wis=14 Cha=6',
  'Tiny Viper': 'Attack=5 HD=1 AC=17 Dam=1 Str=4 Dex=17 Con=11 Int=1 Wis=12 Cha=2',
  'Toad': 'Attack=0 HD=1 AC=15 Dam=0 Str=1 Dex=12 Con=11 Int=1 Wis=14 Cha=4',
  'Weasel': 'Attack=4 HD=1 AC=14 Dam=1d3-4 Str=3 Dex=15 Con=10 Int=2 Wis=12 Cha=5',

  'Air Elemental': 'Attack=5 HD=2 AC=17 Dam=1d4 Str=10 Dex=17 Con=10 Int=4 Wis=11 Cha=11 Level=5',
  'Air Mephit': 'Attack=4 HD=3 AC=17 Dam=2@1d3 Str=10 Dex=17 Con=10 Int=6 Wis=11 Cha=15 Level=7',
  'Dust Mephit': 'Attack=4 HD=3 AC=17 Dam=2@1d3 Str=10 Dex=17 Con=10 Int=6 Wis=11 Cha=15 Level=7',
  'Earth Elemental': 'Attack=5 HD=2 AC=17 Dam=1d6+4 Str=17 Dex=8 Con=13 Int=4 Wis=11 Cha=11 Level=5',
  'Earth Mephit': 'Attack=7 HD=3 AC=16 Dam=2@1d3+3 Str=17 Dex=8 Con=13 Int=6 Wis=11 Cha=15 Level=7',
  'Fire Elemental': 'Attack=3 HD=2 AC=15 Dam=1d4+1d4 Str=10 Dex=13 Con=10 Int=4 Wis=11 Cha=11 Level=5',
  'Fire Mephit': 'Attack=4 HD=3 AC=16 Dam=2@1d3+1d4 Str=10 Dex=13 Con=10 Int=6 Wis=11 Cha=15 Level=7',
  'Formian Worker': 'Attack=3 HD=1 AC=17 Dam=1d4+1 Str=13 Dex=14 Con=13 Int=6 Wis=10 Cha=9 Level=7',
  'Homunculus': 'Attack=2 HD=2 AC=14 Dam=1d4-1 Str=8 Dex=15 Con=0 Int=10 Wis=12 Cha=7 Level=7',
  'Ice Mephit': 'Attack=4 HD=3 AC=18 Dam=2@1d3+1d4 Str=10 Dex=17 Con=10 Int=6 Wis=11 Cha=15 Level=7',
  'Imp': 'HD=3 AC=20 Dam=1d4 Str=10 Dex=20 Con=10 Int=10 Wis=12 Cha=14 Level=7',
  'Magma Mephit': 'Attack=4 HD=3 AC=16 Dam=2@1d3+1d4 Str=10 Dex=13 Con=10 Int=6 Wis=11 Cha=15 Level=7',
  'Ooze Mephit': 'Attack=6 HD=3 AC=16 Dam=2@1d3+2 Str=14 Dex=10 Con=13 Int=6 Wis=11 Cha=15 Level=7',
  'Pseudodragon': 'Attack=6 HD=2 AC=18 Dam=1d3-2 Str=6 Dex=15 Con=13 Int=10 Wis=12 Cha=10 Level=7',
  'Quasit': 'Attack=8 HD=3 AC=18 Dam=1d3-1+1d4-1 Str=8 Dex=17 Con=10 Int=10 Wis=12 Cha=10 Level=7',
  'Salt Mephit': 'Attack=7 HD=3 AC=16 Dam=2@1d3+3 Str=17 Dex=8 Con=13 Int=6 Wis=11 Cha=15 Level=7',
  'Shocker Lizard': 'Attack=3 HD=2 AC=16 Dam=1d4 Str=10 Dex=15 Con=13 Int=2 Wis=12 Cha=6 Level=5',
  'Steam Mephit': 'Attack=4 HD=3 AC=16 Dam=2@1d3+1d4 Str=10 Dex=13 Con=10 Int=6 Wis=11 Cha=15 Level=7',
  'Stirge': 'Attack=7 HD=1 AC=16 Dam=0 Str=3 Dex=19 Con=10 Int=1 Wis=12 Cha=6 Level=5',
  'Water Elemental': 'Attack=4 HD=2 AC=17 Dam=1d6+3 Str=14 Dex=10 Con=13 Int=4 Wis=11 Cha=11 Level=5',
  'Water Mephit': 'Attack=6 HD=3 AC=16 Dam=2@1d3+2 Str=14 Dex=10 Con=13 Int=6 Wis=11 Cha=15 Level=7',

  'Celestial': 'Level=3',
  'Fiendish': 'Level=3'

};
SRD35.FEATS = [
  'Acrobatic:', 'Agile:', 'Alertness:', 'Animal Affinity:',
  'Armor Proficiency:', 'Athletic:', 'Augment Summoning:',
  'Blind-Fight:Fighter', 'Brew Potion:Item Creation', 'Cleave:Fighter',
  'Combat Casting:', 'Combat Expertise:Fighter', 'Combat Reflexes:Fighter',
  'Craft Magic Arms And Armor:Item Creation', 'Craft Rod:Item Creation',
  'Craft Staff:Item Creation', 'Craft Wand:Item Creation',
  'Craft Wondrous Item:Item Creation', 'Deceitful:', 'Deflect Arrows:Fighter',
  'Deft Hands:', 'Diehard:', 'Diligent:', 'Dodge:Fighter',
  'Empower Spell:Metamagic', 'Endurance:', 'Enlarge Spell:Metamagic',
  'Eschew Materials:', 'Extend Spell:Metamagic', 'Extra Turning:',
  'Far Shot:Fighter', 'Forge Ring:Item Creation', 'Great Cleave:Fighter',
  'Great Fortitude:', 'Greater Spell Focus:', 'Greater Spell Penetration:',
  'Greater Two-Weapon Fighting:Fighter', 'Greater Weapon Focus:Fighter',
  'Greater Weapon Specialization:Fighter', 'Heighten Spell:Metamagic',
  'Improved Bull Rush:Fighter', 'Improved Counterspell:',
  'Improved Critical:Fighter', 'Improved Disarm:Fighter',
  'Improved Familiar:', 'Improved Feint:Fighter', 'Improved Grapple:Fighter',
  'Improved Initiative:Fighter', 'Improved Overrun:Fighter',
  'Improved Precise Shot:Fighter', 'Improved Shield Bash:Fighter',
  'Improved Sunder:Fighter', 'Improved Trip:Fighter', 'Improved Turning:',
  'Improved Two-Weapon Fighting:Fighter', 'Improved Unarmed Strike:Fighter',
  'Investigator:', 'Iron Will:', 'Leadership:', 'Lightning Reflexes:',
  'Magical Aptitude:', 'Manyshot:Fighter', 'Maximize Spell:Metamagic',
  'Mobility:Fighter', 'Mounted Archery:Fighter', 'Mounted Combat:Fighter',
  'Natural Spell:', 'Negotiator:', 'Nimble Fingers:', 'Persuasive:',
  'Point Blank Shot:Fighter', 'Power Attack:Fighter', 'Precise Shot:Fighter',
  'Quick Draw:Fighter', 'Quicken Spell:Metamagic', 'Rapid Reload:Fighter',
  'Rapid Shot:Fighter', 'Ride-By Attack:Fighter', 'Run:',
  'Scribe Scroll:Item Creation', 'Self Sufficient:', 'Shield Proficiency:',
  'Shot On The Run:Fighter', 'Silent Spell:Metamagic', 'Skill Focus:',
  'Snatch Arrows:Fighter', 'Spell Focus:', 'Spell Mastery:',
  'Spell Penetration:', 'Spirited Charge:Fighter', 'Spring Attack:Fighter',
  'Stealthy:', 'Still Spell:Metamagic', 'Stunning Fist:Fighter', 'Toughness:',
  'Track:', 'Trample:Fighter', 'Two-Weapon Defense:Fighter',
  'Two-Weapon Fighting:Fighter', 'Weapon Finesse:Fighter',
  'Weapon Focus:Fighter', 'Weapon Proficiency:',
  'Weapon Specialization:Fighter', 'Whirlwind Attack:Fighter',
  'Widen Spell:Metamagic'
];
SRD35.GENDERS = ['Female', 'Male'];
SRD35.GOODIES = [
];
SRD35.LANGUAGES = [
  'Abyssal', 'Aquan', 'Auran', 'Celestial', 'Common', 'Draconic', 'Druidic',
  'Dwarven', 'Elven', 'Giant', 'Gnoll', 'Gnome', 'Goblin', 'Halfling',
  'Ignan', 'Infernal', 'Orc', 'Sylvan', 'Terran', 'Undercommon'
];
SRD35.RACES =
  ['Dwarf', 'Elf', 'Gnome', 'Half Elf', 'Half Orc', 'Halfling', 'Human'];
// Note: the order here handles dependencies among attributes when generating
// random characters
SRD35.RANDOMIZABLE_ATTRIBUTES = [
  'charisma', 'constitution', 'dexterity', 'intelligence', 'strength', 'wisdom',
  'name', 'race', 'gender', 'alignment', 'deity', 'levels', 'domains',
  'features', 'feats', 'skills', 'languages', 'hitPoints', 'armor', 'shield',
  'weapons', 'spells'
];
SRD35.SCHOOLS = [
  'Abjuration:Abju', 'Conjuration:Conj', 'Divination:Divi', 'Enchantment:Ench',
  'Evocation:Evoc', 'Illusion:Illu', 'Necromancy:Necr', 'Transmutation:Tran'
];
SRD35.SHIELDS = [
  'Buckler', 'Heavy Steel', 'Heavy Wooden', 'Light Steel', 'Light Wooden',
  'None', 'Tower'
];
SRD35.SKILLS = [
  'Appraise:int', 'Balance:dex', 'Bluff:cha', 'Climb:str', 'Concentration:con',
  'Craft:int', 'Decipher Script:int/trained', 'Diplomacy:cha',
  'Disable Device:int/trained', 'Disguise:cha', 'Escape Artist:dex',
  'Forgery:int', 'Gather Information:cha', 'Handle Animal:cha/trained',
  'Heal:wis', 'Hide:dex', 'Intimidate:cha', 'Jump:str',
  'Knowledge:int/trained', 'Listen:wis', 'Move Silently:dex',
  'Open Lock:dex/trained', 'Perform:cha', 'Profession:wis/trained', 'Ride:dex',
  'Search:int', 'Sense Motive:wis', 'Sleight Of Hand:dex/trained',
  'Speak Language:/trained', 'Spellcraft:int/trained', 'Spot:wis',
  'Survival:wis', 'Swim:str', 'Tumble:dex/trained',
  'Use Magic Device:cha/trained', 'Use Rope:dex'
];
SRD35.SUBFEATS = {
  'Armor Proficiency':'Heavy/Light/Medium',
  'Greater Spell Focus':SRD35.SCHOOLS.join('/').replace(/:[^\/]+/g, ''),
  'Greater Weapon Focus':'',
  'Greater Weapon Specialization':'',
  'Improved Critical':'',
  'Rapid Reload':'Hand/Heavy/Light',
  'Shield Proficiency':'Heavy/Tower',
  'Skill Focus':'',
  'Spell Focus':SRD35.SCHOOLS.join('/').replace(/:[^\/]+/g, ''),
  'Weapon Focus':'',
  'Weapon Proficiency':'Simple',
  'Weapon Specialization':'Dwarven Waraxe/Longsword'
};
SRD35.SUBSKILLS = {
  'Craft':'',
  'Knowledge':'Arcana/Dungeoneering/Engineering/Geography/' +
              'History/Local/Nature/Nobility/Planes/Religion',
  'Perform':'Act/Comedy/Dance/Keyboard/Oratory/Percussion/Sing/String/Wind',
  'Profession':''
};
SRD35.SYNERGIES = {
  'Bluff':'Diplomacy/Disguise (acting)/Intimidate/Sleight Of Hand',
  'Decipher Script':'Use Magic Device (scrolls)',
  'Escape Artist':'Use Rope (bindings)',
  'Handle Animal':'Diplomacy (animals)/Ride',
  'Jump':'Tumble',
  'Knowledge (Arcana)':'Spellcraft',
  'Knowledge (Dungeoneering)':'Survival (underground)',
  'Knowledge (Engineering)':'Search (secret doors)',
  'Knowledge (Geography)':'Survival (lost/hazards)',
  'Knowledge (History)':'Bardic Knowledge',
  'Knowledge (Local)':'Gather Information',
  'Knowledge (Nature)':'Survival (outdoors)',
  'Knowledge (Nobility)':'Diplomacy',
  'Knowledge (Planes)':'Survival (other planes)',
  'Knowledge (Religion)':'undead turning check',
  'Search':'Survival (tracking)',
  'Sense Motive':'Diplomacy',
  'Spellcraft':'Use Magic Device (scroll)',
  'Survival':'Knowledge (Nature)',
  'Tumble':'Balance/Jump',
  'Use Magic Device':'Spellcraft (scrolls)',
  'Use Rope':'Climb (rope)/Escape Artist (rope)'
};
SRD35.VIEWERS = ['Collected Notes', 'Compact', 'Standard', 'Vertical'];
SRD35.WEAPONS = [
  'Bastard Sword:d10@19 1h Ex', 'Battleaxe:d8x3 1h Ma', 'Bolas:d4r10 Ex',
  'Club:d6r10 1h Si', 'Composite Longbow:d8x3r110 Ma',
  'Composite Shortbow:d6x3r70 Ma', 'Dagger:d4@19r10 Li Si', 'Dart:d4r20 Si',
  'Dire Flail:d8/d8 2h Ex', 'Dwarven Urgosh:d8/d6x3 2h Ex',
  'Dwarven Waraxe:d10x3 1h Ex', 'Falchion:2d4@18 2h Ma', 'Flail:d8 1h Ma',
  'Gauntlet:d3 Un Si', 'Glaive:d10x3 2h Ma',
  'Gnome Hooked Hammer:d8/d6x4 2h Ex', 'Greataxe:d12x3 2h Ma',
  'Greatclub:d10 2h Ma', 'Greatsword:2d6@19 2h Ma', 'Guisarme:2d4x3 2h Ma',
  'Halberd:d10x3 2h Ma', 'Hand Crossbow:d4@19r30 Ex', 'Handaxe:d6x3 Li Ma',
  'Heavy Crossbow:d10@19r120 Si', 'Heavy Flail:d10@19 2h Ma',
  'Heavy Mace:d8 1h Si', 'Heavy Pick:d6x4 1h Ma', 'Heavy Shield:d4 1h Ma',
  'Heavy Spiked Shield:d6 1h Ma', 'Improvised:d4r10 Ex', 'Javelin:d6r30 Si',
  'Kama:d6 Li Ex', 'Kukri:d4@18 Li Ma', 'Lance:d8x3 2h Ma',
  'Light Crossbow:d8@19r80 Si', 'Light Hammer:d4r20 Li Ma',
  'Light Mace:d6 Li Si', 'Light Pick:d4x4 Li Ma', 'Light Shield:d3 Li Ma',
  'Light Spiked Shield:d4 Li Ma', 'Longbow:d8x3r100 Ma', 'Longspear:d8x3 2h Si',
  'Longsword:d8@19 1h Ma', 'Morningstar:d8 1h Si', 'Net:d0r10 Ex',
  'Nunchaku:d6 Li Ex', 'Orc Double Axe:d8/d8x3 2h Ex',
  'Punching Dagger:d4x3 Li Si', 'Quarterstaff:d6/d6 2h Si',
  'Ranseur:2d4x3 2h Ma', 'Rapier:d6@18 1h Ma',
  'Repeating Heavy Crossbow:d10@19r120 Ex',
  'Repeating Light Crossbow:d8@19r80 Ex', 'Sai:d4r10 Li Ex', 'Sap:d6 Li Ma',
  'Scimitar:d6@18 1h Ma', 'Scythe:2d4x4 2h Ma', 'Short Sword:d6@19 Li Ma',
  'Shortbow:d6x3r60 Ma', 'Shortspear:d6r20 1h Si', 'Shuriken:d2r10 Ex',
  'Siangham:d6 Li Ex', 'Sickle:d6 Li Si', 'Sling:d4r50 Si',
  'Spear:d8x3r20 2h Si', 'Spiked Armor:d6 Li Ma', 'Spiked Chain:2d4 2h Ex',
  'Spiked Gauntlet:d4 Li Si', 'Throwing Axe:d6r10 Li Ma', 'Trident:d8r10 1h Ma',
  'Two-Bladed Sword:d8/d8@19 2h Ex', 'Unarmed:d3 Un Si', 'Warhammer:d8x3 1h Ma',
  'Whip:d3 1h Ex'
];

// Related information used internally by SRD35
SRD35.armorsArcaneSpellFailurePercentages = {
  'None': null, 'Padded': 5, 'Leather': 10, 'Studded Leather': 15,
  'Chain Shirt': 20, 'Hide': 20, 'Scale Mail': 25, 'Chainmail': 30,
  'Breastplate': 25, 'Splint Mail': 40, 'Banded Mail': 35, 'Half Plate': 40,
  'Full Plate': 35
};
SRD35.armorsArmorClassBonuses = {
  'None': null, 'Padded': 1, 'Leather': 2, 'Studded Leather': 3,
  'Chain Shirt': 4, 'Hide': 3, 'Scale Mail': 4, 'Chainmail': 5,
  'Breastplate': 5, 'Splint Mail': 6, 'Banded Mail': 6, 'Half Plate': 7,
  'Full Plate': 8
};
SRD35.armorsMaxDexBonuses = {
  'None': null, 'Padded': 8, 'Leather': 6, 'Studded Leather': 5,
  'Chain Shirt': 4, 'Hide': 4, 'Scale Mail': 3, 'Chainmail': 2,
  'Breastplate': 3, 'Splint Mail': 0, 'Banded Mail': 1, 'Half Plate': 0,
  'Full Plate': 1
};
SRD35.armorsSkillCheckPenalties = {
  'None': null, 'Padded': null, 'Leather': null, 'Studded Leather': 1,
  'Chain Shirt': 2, 'Hide': 3, 'Scale Mail': 4, 'Chainmail': 5,
  'Breastplate': 4, 'Splint Mail': 7, 'Banded Mail': 6, 'Half Plate': 7,
  'Full Plate': 6
};
SRD35.armorsProficiencyLevels = {
  'None':SRD35.PROFICIENCY_NONE, 'Padded':SRD35.PROFICIENCY_LIGHT,
  'Leather':SRD35.PROFICIENCY_LIGHT, 'Studded Leather':SRD35.PROFICIENCY_LIGHT,
  'Chain Shirt':SRD35.PROFICIENCY_LIGHT, 'Hide':SRD35.PROFICIENCY_MEDIUM,
  'Scale Mail':SRD35.PROFICIENCY_MEDIUM, 'Chainmail':SRD35.PROFICIENCY_MEDIUM,
  'Breastplate':SRD35.PROFICIENCY_MEDIUM, 'Splint Mail':SRD35.PROFICIENCY_HEAVY,
  'Banded Mail':SRD35.PROFICIENCY_HEAVY, 'Half Plate':SRD35.PROFICIENCY_HEAVY,
  'Full Plate': SRD35.PROFICIENCY_HEAVY
};
SRD35.deitiesFavoredWeapons = {};
SRD35.proficiencyLevelNames = ['None', 'Light', 'Medium', 'Heavy', 'Tower'];
SRD35.shieldsArcaneSpellFailurePercentages = {
  'Buckler':5, 'Heavy Steel':15, 'Heavy Wooden':15, 'Light Steel':5,
  'Light Wooden':5, 'None':0, 'Tower':50
};
SRD35.shieldsSkillCheckPenalties = {
  'Buckler':1, 'Heavy Steel':2, 'Heavy Wooden':2, 'Light Steel':1,
  'Light Wooden':1, 'None':0, 'Tower':10
};
SRD35.shieldsProficiencyLevels = {
  'Buckler':SRD35.PROFICIENCY_LIGHT, 'Heavy Steel':SRD35.PROFICIENCY_HEAVY,
  'Heavy Wooden':SRD35.PROFICIENCY_HEAVY, 'Light Steel':SRD35.PROFICIENCY_LIGHT,
  'Light Wooden':SRD35.PROFICIENCY_LIGHT, 'None':SRD35.PROFICIENCY_NONE,
  'Tower':SRD35.PROFICIENCY_TOWER
};
SRD35.spellsAbbreviations = {
  "BarkskinAC": "2 + (source < 6 ? 0 : Math.min(Math.floor((source - 3)/ 3), 3))",
  "L": "lvl",
  "L2": "lvl * 2",
  "L3": "lvl * 3",
  "L4": "lvl * 4",
  "L5": "lvl * 5",
  "L10": "lvl * 10",
  "L15": "lvl * 15",
  "L20": "lvl * 20",
  "L40": "lvl * 40",
  "L100": "lvl * 100",
  "L200": "lvl * 200",
  "Ldiv2": "Math.floor(lvl/2)",
  "Ldiv3": "Math.floor(lvl/3)",
  "Ldiv4": "Math.floor(lvl/4)",
  "Lmin5": "Math.min(source, 5)",
  "Lmin10": "Math.min(source, 10)",
  "Lmin15": "Math.min(source, 15)",
  "Lmin20": "Math.min(source, 20)",
  "Lmin25": "Math.min(source, 25)",
  "Lmin30": "Math.min(source, 30)",
  "Lmin35": "Math.min(source, 35)",
  "Lmin40": "Math.min(source, 40)",
  "RL": "400 + 40 * source",
  "RM": "100 + 10 * source",
  "RS": "25 + 5 * Math.floor(source / 2)"
};
SRD35.spellsDescriptions = {
  "Acid Arrow": "R$RL' Ranged touch 2d4 HP/rd for ${1 + Math.floor(lvl/3)} rd",
  "Acid Fog": "R$RM' 20' fog cylinder 2d6 HP/rd for $L rd",
  "Acid Splash": "R$RS' Ranged touch 1d3 HP",
  "Aid": "Touched +1 attack/fear saves, +1d8+$Lmin10 HP for $L min",
  "Air Walk": "Touched walks on air for $L10 min",
  "Alarm": "R$RS' 20' radius alarmed for $L2 hr",
  "Align Weapon": "Touched weapon Will save or gains alignment for $L min",
  "Alter Self": "Self becomes small (+2 Dex) or medium (+2 Str) humanoid for $L min",
  "Analyze Dweomer": "R$RS' Target Will save or reveals magical aspects for $L rd",
  "Animal Growth": "R$RM' Animal target Fort save or double in size for $L min",
  "Animal Messenger": "R$RS' Tiny animal target goes to specified place for $L dy",
  "Animal Shapes": "R$RS' $L allies in 30' area become chosen animal for $L hr",
  "Animal Trance": "R$RS' 2d6 HD animals Will save or facinated for conc",
  "Animate Dead": "Touched corpses become $L2 HD of skeletons/zombies",
  "Animate Objects": "R$RM' $L objects attack foes for $L rd",
  "Animate Plants": "R$RS' $Ldiv3 plants attack/entwine foes for $L rd/hr",
  "Animate Rope": "R$RM' ${50 + 5 * lvl}' rope obey for $L rd",
  "Antilife Shell": "10'-radius bars living for $L min",
  "Antimagic Field": "10'-radius suppresses magic for $L10 min",
  "Antipathy": "Named kind/align creatures Will save or avoid $L10' cube for $L2 hr",
  "Antiplant Shell": "10'-radius bars animate plants for $L min",
  "Arcane Eye": "Invisible remote eye moves 30' for $L min",
  "Arcane Lock": "Magical lock on door/portal/chest open DC +10 with lock/20 otherwise",
  "Arcane Mark": "Permanent in/visible personal rune on object/creature",
  "Arcane Sight": "R120' See auras/spell abilities for $L min, DC 15+level to know school",
  "Astral Projection": "Projects you and others to Astral Plane",
  "Atonement": "Restore alignment/holy powers",
  "Augury": "${Math.min(70 + lvl, 90)}% chance to know weal/woe of act proposed w/in 30 min",
  "Awaken": "Animal/tree target gains human sentience",
  "Baleful Polymorph": "R$RS' Target Fort save or become 1HD creature, Will save to keep abilities",
  "Bane": "Enemies w/in 50' Will save or -1 attack/fear saves $L min",
  "Banishment": "R$RS' $L2 HD extraplanar creatures Will save or banished from plane",
  "Barkskin": "+$BarkskinAC natural armor for $L10 min",
  "Bear's Endurance": "Touched +4 Con for $L min",
  "Beast Shape I": "Become small (+2 Dex/+1 AC) or medium (+2 Str/+2 AC) animal for $L min",
  "Beast Shape II": "Become tiny (+4 Dex/-2 Str/+1 AC) or large (+4 Str/-2 Dex/+4 AC) animal for $L min",
  "Beast Shape III": "Become dimunitive (+6 Dex/-4 Str/+1 AC) or huge (+6 Str/-4 Dex/+6 AC) animal or small (+4 Dex/+2 AC) or medium (+4 Str/+4 AC) magical beast for $L min",
  "Beast Shape IV": "Become tiny (+8 Dex/-2 Str/+3 AC) or large (+6 Str/-2 Dex/+2 Con/+6 AC) magical beast for $L min",
  "Bestow Curse": "Touched Will save or permanent -6 ability, -4 attack/saves/checks, or 50% chance/rd of losing action",
  "Binding": "R$RS' Target Will save (min $Ldiv2 HD) or magically imprisoned",
  "Black Tentacles": "R$RM' Tentacles grapple (CMB/CMD ${lvl + 5}/${lvl + 15}) 20' radius, 1d6+4/rd HP for $L rd",
  "Blade Barrier": "R$RM' Blade wall ${Lmin15}d6 HP (Ref half) for $L min",
  "Blasphemy": "Nonevil creatures w/in 40' with equal/-1/-5/-10 HD Will save or dazed 1 rd/-2d6 Str (save half) 2d4 rd/paralyzed 1d10 min (save 1 rd)/killed (save 3d6+$Lmin25 HP)",
  "Bleed": "R$RS' Stabilized target Will save or resume dying",
  "Bless": "R50' Allies +1 attack/fear saves for $L min",
  "Bless Water": "Makes 1 pint holy water",
  "Bless Weapon": "Weapon good aligned, +1 vs. evil foe DR for $L min",
  "Blight": "Touched plant ${Lmin15}d6 HP, Fort half",
  "Blindness/Deafness": "R$RM' target Fort save or permanently blind or deaf",
  "Blink": "Self randomly ethereal for $L rd--foes 50% miss chance, half HP from area attacks/falling",
  "Blur": "Self foes 20% miss chance for $L min",
  "Break Enchantment": "R$RS' $L targets freed from enchantments/transmutations/curses",
  "Breath Of Life": "Heal 5d8+$L/max 25 plus resurrect target dead lt 1 rd",
  "Bull's Strength": "Touched +4 Str for $L min",
  "Burning Hands": "R15' cone ${Lmin5}d4 HP (Ref half)",
  "Call Lightning": "R$RM' $L bolts 3d6 HP (Ref half), 1/rd for $L min",
  "Call Lightning Storm": "R$RL' 15 bolts 5d6 HP (Ref half), 1/rd for $L min",
  "Calm Animals": "R$RS' 2d4+$L HD of animals Will save or docile for $L min",
  "Calm Emotions": "R$RM' Creatures in 20' radius Will save or pacified $L rd/conc",
  "Cat's Grace": "Touched +4 Dex for $L min",
  "Cause Fear": "R$RS' Target le 5 HD flee for 1d4 rd (Will shaken 1 rd)",
  "Chain Lightning": "R$RL' ${Lmin20}d6 HP primary/$Lmin20 secondary targets (Ref half, secondary save at +2)",
  "Changestaff": "Staff becomes treant-like creature for $L hr",
  "Chaos Hammer": "R$RM' Lawful in 20'-radius burst ${Math.min(Math.floor(source/2),5)}d8 HP and slowed 1d6 rd, neutral half (Will half)",
  "Charm Animal": "R$RS' Target Will save or treats you as trusted friend for $L hr",
  "Charm Monster": "R$RS' Target Will save or treats you as trusted friend for $L dy",
  "Charm Person": "R$RS' Target Will save or treats you as trusted friend for $L hr",
  "Chill Metal": "R$RS' Metal of $Ldiv2 creatures Will save or 0/1/2/2/2/1/0d4 HP for 7 rd",
  "Chill Touch": "$L touched Will save or 1d6 HP negative energy, Fort save or 1 Str (undead flee 1d4+$L rd instead)",
  "Circle Of Death": "R$RM' ${Lmin20}d4 HD of creatures le 8 HD in 40' Fort save or die",
  "Clairaudience/Clairvoyance": "$RL' Remote sight or hearing for $L min",
  "Clenched Fist": "R$RM' 10' (AC 20, caster HP) hand cover (+4 AC), move 60', hit (+$L+mod for 1d8+11, Fort save or stunned 1 rd), bull rush (CMB ${lvl + 12}) for $L rd",
  "Cloak Of Chaos": "$L targets in 20' +4 AC/saves and SR 25 and mental protection vs. lawful, lawful hits cause Will save or confused 1 rd for $L rd",
  "Clone": "Soul enters duplicate if original dies",
  "Cloudkill": "R$RM' 20' cylinder moves away 10', 1-3 HD die, 4-6 HD die (Fort 1d4 Con), 6+ HD 1d4 Con (Fort half) for $L min",
  "Color Spray": "R15' cone targets with 2/4/any HD Will save or unconscious 2d4 rd/blind 1d4 rd/stunned 1 rd",
  "Command": "R$RS' Target Will save or approach/drop/fall/flee/halt for 1 rd",
  "Command Plants": "R$RS' $L2 HD plant creatures Will save or obey for $L dy",
  "Command Undead": "R$RS' Undead target Will save or obey for $L dy",
  "Commune": "Deity answers $L yes/no questions",
  "Commune With Nature": "Learn natural facts for $L mi outdoors/$L100' underground",
  "Comprehend Languages": "Self understands all languages for $L10 min",
  "Cone Of Cold": "R60' cone ${Lmin15}d6 HP (Ref half)",
  "Confusion": "R$RM' Creatures in 15' radius Will save or randomly normal/babble/d8+str to self/attack nearest for $L rd",
  "Consecrate": "R$RS' Positive energy in 20' radius gives undead -1 attack/damage/saves for $L2 hr",
  "Contact Other Plane": "Ask $Ldiv2 questions of extraplanar entity",
  "Contagion": "Touched Fort save or diseased",
  "Contingency": "Set trigger for ${Math.min(Math.floor(source / 3), 6)}-level spell for $L dy",
  "Continual Flame": "Touched emits heatless torch flame permanently",
  "Control Plants": "R$RS' $L2 HD plant creatures Will save or obey for $L min",
  "Control Undead": "R$RS' Undead target Will save or obey for $L min",
  "Control Water": "R$RL' Raise/lower ${Math.pow(source, 3)} 10'x10'x2' of water $L2' for $L10 min",
  "Control Weather": "Create seasonal weather in 2 mi radius for 4d12 hr",
  "Control Winds": "R$L40' Changes wind direction/speed in $L40'x40' cylinder for $L10 min",
  "Corrupt Weapon": "Weapon evil aligned, +1 vs. good foe DR for $L min",
  "Create Food And Water": "Daily food/water for $L3 humans/$L horses",
  "Create Undead": "Raise ghoul/ghast/mummy/mohrg from physical remains at level -/12/15/18",
  "Create Greater Undead": "Raise shadow/wraith/spectr/devourer from physical remains at level -/16/18/20",
  "Create Water": "R$RS' Creates $L2 gallons of pure water",
  "Creeping Doom": "R${Math.min(25 + 5 * Math.floor(source / 2), 100)}' Four 60-HP insect swarms 4d6 HP obey for $L rd",
  "Crushing Despair": "R30' cone Targets Will save or -2 attack/damage/saves/checks for $L min",
  "Crushing Hand": "R$RM' 10' (AC 20, caster HP) hand cover (+4 AC), move 60', grapple (CMB ${lvl + 12}, 2d6+12 HP) for $L rd",
  "Cure Critical Wounds": "Touched heal/damage undead 4d8+$Lmin20 (Will half)",
  "Cure Light Wounds": "Touched heal/damage undead 1d8+$Lmin5 (Will half)",
  "Cure Minor Wounds": "Touched heal 1 HP",
  "Cure Moderate Wounds": "Touched heal/damage undead 2d8+$Lmin10 (Will half)",
  "Cure Serious Wounds": "Touched heal/damage undead 3d8+$Lmin15 (Will half)",
  "Curse Water": "Makes 1 pint unholy water",
  "Dancing Lights": "R$RM' 4 torch lights in 10' radius move 100' for 1 min",
  "Darkness": "Touched lowers illumination one step in 20'-radius for $L min",
  "Darkvision": "Touched sees 60' in total darkness for $L hr",
  "Daylight": "Touched radiates 60'-radius illumination for $L10 min",
  "Daze": "R$RS' Humanoid target le 4 HD Will save or lose next action",
  "Daze Monster": "R$RM' Creature target le 6 HD Will save or lose next action",
  "Death Knell": "Touched w/negative HP Will save or die and you gain 1d8 HP/+2 Str/+1 caster level for 10*target HD min",
  "Death Ward": "Touched +4 vs. death spells/effects, immune drain for $L min",
  "Deathwatch": "R30' cone Reveals state of targets for $L10 min",
  "Deep Slumber": "R$RS' 10 HD of targets Will save or sleep $L min",
  "Deeper Darkness": "Touched lowers illumination two steps in 60'-radius for $L10 min",
  "Delay Poison": "Touched immune to poison for $L hr",
  "Delayed Blast Fireball": "R$RL' ${Lmin20}d6 HP (Ref half) in 20' radius, delay le 5 rd",
  "Demand": "25-word message to target, Will save or carry out suggestion",
  "Desecrate": "R$RS' Negative energy in 20' radius gives undead +1 attack/damage/saves/HP per HD for $L2 hr",
  "Destruction": "R$RS' Target $L10 HP, consumed if slain (Fort 10d6 HP)",
  "Detect Animals Or Plants": "R$RL' cone info on animals/plants for $L10 min",
  "Detect Chaos": "R60' cone info on chaotic auras for $L10 min",
  "Detect Evil": "R60' cone info on evil auras for $L10 min",
  "Detect Good": "R60' cone info on good auras for $L10 min",
  "Detect Law": "R60' cone info on lawful auras for $L10 min",
  "Detect Magic": "R60' cone info on magical auras for $L min",
  "Detect Poison": "R$RS' Detects poison in target, DC20 Wis/Alchemy check for type",
  "Detect Scrying": "R40' Detects scrying, opposed caster check to see source",
  "Detect Secret Doors": "R60' cone info on secret doors for $L min",
  "Detect Snares And Pits": "R60' cone info on traps $L10 min",
  "Detect Thoughts": "R60' cone info on thoughts for $L min",
  "Detect Undead": "R60' cone info on undead auras for $L min",
  "Dictum": "R40' Nonlawful creatures with equal/-1/-5/-10 HD Will save or deafened 1d4 rd/staggered 2d4 rd (save 1d4)/paralyzed 1d10 min (save 1 rd)/killed (save 3d6+$Lmin25 HP)",
  "Dimension Door": "Teleports self and touched willing object/creature $RL'",
  "Dimensional Anchor": "R$RM' Ranged touch bars extradimensional travel for $L min",
  "Dimensional Lock": "R$RM' Bar extradimensional travel in 20' radius for $L dy",
  "Diminish Plants": "Prunes/blights growth of normal plants",
  "Discern Lies": "R$RS' Reveals lies from $L creatures for $L rd/conc",
  "Discern Location": "Know exact location of creature/object",
  "Disguise Self": "Self change appearance/+10 disguise for $L10 min",
  "Disintegrate": "R$RM' Target ${Math.min(lvl*2,40)}d6 HP (Fort half), dust if slain",
  "Dismissal": "R$RS' Target Will save or returned to native plane",
  "Dispel Chaos": "Touched +4 AC vs. chaotic/touch to dismiss chaotic creature/spell",
  "Dispel Evil": "Touched +4 AC vs. evil/touch to dismiss evil creature/spell",
  "Dispel Good": "Touched +4 AC vs. good/touch to dismiss good creature/spell",
  "Dispel Law": "Touched +4 AC vs. lawful/touch to dismiss lawful creature/spell",
  "Dispel Magic": "R$RM' d20+$L vs. 11+caster level cancels spell/effect",
  "Displacement": "Attacks on touched 50% miss for $L rd",
  "Disrupt Undead": "R$RS' Ranged touched undead 1d6 HP",
  "Disrupting Weapon": "Undead hit w/touched weapon Will save or destroyed for $L rd",
  "Divination": "${Math.min(70 + lvl, 90)}% chance for advice on act proposed w/in a week",
  "Divine Favor": "Self +${Math.min(Math.floor(lvl/3),3)} attack/damage for 1 min",
  "Divine Power": "Self +${Math.min(Math.floor(lvl/3),6)} attack/damage/Str check, +$L HP for $L rd",
  "Dominate Animal": "R$RS' Target animal Will save or obey thoughts for $L rd",
  "Dominate Monster": "R$RS' Target Will save or obey thoughts for $L dy",
  "Dominate Person": "R$RS' Target humanoid Will save or obey thoughts for $L dy",
  "Doom": "R$RM' Target will save or shaken (-2 attack/damage/saves/checks) for $L min",
  "Dream": "Touched sends message to sleeping target",
  "Eagle's Splendor": "Touched +4 Cha for $L min",
  "Earthquake": "R$RL Intense tremor shakes 80' radius for 1 rd",
  "Elemental Body I": "Become small air (+2 Dex/+2 AC/fly 60'/whirlwind), earth (+2 Str/+4 AC/earth glide), fire (+2 Dex/+2 AC/resist fire/burn), water (+2 Con/+4 AC/swim 60'/vortex/breathe water) elemental, 60' darkvision for $L min",
  "Elemental Body II": "Become medium air (+4 Dex/+3 AC/fly 60'/whirlwind), earth (+4 Str/+5 AC/earth glide), fire (+4 Dex/+3 AC/resist fire/burn), water (+4 Con/+5 AC/swim 60'/vortex/breathe water) elemental, 60' darkvision for $L min",
  "Elemental Body III": "Become large air (+2 Str/+4 Dex/+4 AC/fly 60'/whirlwind), earth (+6 Str/-2 Dex/+2 Con/+6 AC/earth glide), fire (+4 Dex/+2 Con/+4 AC/resist fire/burn), water (+2 Str/-2 Dex/+6 Con/+6 AC/swim 60'/vortex/breathe water) elemental, 60' darkvision/immune bleed, critical, sneak attack for $L min",
  "Elemental Body IV": "Become huge air (+4 Str/+6 Dex/+4 AC/fly 120'/whirlwind), earth (+8 Str/-2 Dex/+4 Con/+6 AC/earth glide), fire (+6 Dex/+4 Con/+4 AC/resist fire/burn), water (+4 Str/-2 Dex/+8 Con/+6 AC/swim 120'/vortex/breathe water) elemental, 60' darkvision/immune bleed, critical, sneak attack/DR 5/- for $L min",
  "Elemental Swarm": "R$RM' Summons 2d4 large, then 1d4 huge, then 1 greater  elementals for $L10 min",
  "Endure Elements": "Touched comfortable in at -50-140F for 1 dy",
  "Energy Drain": "R$RS' Ranged touch 2d4 negative levels for 1 dy, Fort save or permanent (undead +2d4x5 HP for 1 hr)",
  "Enervation": "R$RS' Ranged touch 1d4 negative levels for $L hr (undead +1d4x5 HP for 1 hr)",
  "Enlarge Person": "R$RS' Target humanoid Fort save or double size (+2 Str/-2 Dex/-1 attack/-1 AC) for $L min",
  "Entangle": "R$RL' Creatures in 40' radius Ref save or entangled for $L min",
  "Enthrall": "R$RM' Listeners Will save or captivated for 1 hr",
  "Entropic Shield": "Foes' ranged attacks 20% miss for $L min",
  "Erase": "R$RS' Two pages of writing vanish (magical writing DC 15 caster check)",
  "Ethereal Jaunt": "Self ethereal for $L rd",
  "Etherealness": "Self+$Ldiv3 others ethereal for $L min",
  "Expeditious Retreat": "Self speed +30 for $L min",
  "Explosive Runes": "Runes 6d6 HP when read (adjacent no save, 10' Ref half)",
  "Eyebite": "R$RS' 1 target/rd with 4/9/10+ HD Fort save or comatose $L10 min/panicked d4 rd and shaken 10 min/sickened 10 min for $L rd",
  "Fabricate": "Create $L10' cube ($L' mineral cube) of finished items from raw materials",
  "Faerie Fire": "R$RL' Creatures in 5' radius glow for $L min",
  "False Life": "Self +1d10+$Lmin10 temporary HP for $L hr",
  "False Vision": "Scrying in touched 40' radius sees illusion for $L hr",
  "Fear": "R30' cone Creatures flee for $L rd (Will shaken 1 rd)",
  "Feather Fall": "R$RS' $L targets Will save or fall 60' for $L rd",
  "Feeblemind": "R$RM' Target Will save (arcane -4) or Int/Cha permanently drop to 1",
  "Find The Path": "Know most direct route to location for $L10 min",
  "Find Traps": "Self +10 Perception to notice traps w/in 10' for $L min",
  "Finger Of Death": "R$RS' Target $L10 HP (Fort 3d6+$L)",
  "Fire Seeds": "4 acorn grenades ${Math.min(lvl,20)}d4 total/8 berry bombs 1d8+$L (Ref half) that detonate on command for $L10 min",
  "Fire Shield": "Cold/hot flames enveloping self do d6+$Lmin15 HP upon foe hit, take half HP from heat/cold attacks (Ref no HP) for $L rd",
  "Fire Storm": "R$RM' $L2 10' cubes do ${Lmin20}d6 HP to targets, burn for 4d6/rd (Ref half and no burn)",
  "Fire Trap": "Warded object 1d4+$Lmin20 HP (Ref half) w/in 5' when opened",
  "Fireball": "R$RL' ${Lmin10}d6 HP (Ref half) in 20' radius",
  "Flame Arrow": "R$RS' 50 projectiles +1d6 HP for $L10 min",
  "Flame Blade": "Touch 1d8+${Math.min(Math.floor(lvl/2),10)} HP for $L min",
  "Flame Strike": "R$RM' 10' radius x 40' high ${Lmin15}d6 HP (Ref half)",
  "Flaming Sphere": "R$RM' 5' diameter sphere 3d6 HP (Ref negate) jump/move 30' for $L rd",
  "Flare": "R$RS' Target Fort save or dazzled 1 min",
  "Flesh To Stone": "Target Fort save or statue permanently",
  "Floating Disk": "R$RS' 3'-diameter x 1\" force disk follows, holds $L100 lbs at 3' for $L hr",
  "Fly": "Touched fly at 60' for $L min",
  "Fog Cloud": "R$RM' 20'-radius fog obscures vision for $L10 min",
  "Forbiddance": "R$RM' 60' cube bars planar travel, 6d6/12d6 HP on transit if align differs in 1/2 dimensions",
  "Forcecage": "R$RS' Traps targets in 20' cage/10' cube for $L rd",
  "Forceful Hand": "R$RM' 10' (AC 20, caster HP) hand cover (+4 AC), move 60', bull rush (CMB ${lvl + 9}, 2d6+12 HP) for $L rd",
  "Foresight": "Warnings provide +2 AC/Ref, no surprise/flat-footed for $L min",
  "Form Of The Dragon I": "Become Medium dragon (+4 Str/+2 Con/+4 AC/Fly 60'/Darkvision 60'/breath weapon once 6d8 HP (Ref half)/element resistance/bite 1d8 HP/claws 2x1d6 HP/wings 2x1d4 HP) for $L min",
  "Form Of The Dragon II": "Become Large dragon (+6 Str/+4 Con/+6 AC/Fly 90'/Darkvision 60'/breath weapon twice 8d8 HP (Ref half)/element resistance/bite 2d6 HP/claws 2x1d8 HP/wings 2x1d6 HP) for $L min",
  "Form Of The Dragon III": "Become Huge dragon (+10 Str/+8 Con/+8 AC/Fly 120'/Blindsense 60'/Darkvision 120'/breath weapon 1/d4 rd 12d8 HP (Ref half)/element immunity/bite 2d8 HP/claws 2x2d6 HP/wings 2x1d8 HP/tail 2d6 HP) for $L min",
  "Fox's Cunning": "Touched +4 Int for $L min",
  "Freedom": "R$RS' Target released from movement restrictions",
  "Freedom Of Movement": "R$RS' Target moves freely for $L10 min",
  "Freezing Sphere": "R$RL' Burst ${Lmin15}d6 HP in 40' radius (Ref half)",
  "Gaseous Form": "Touched insubstantial (DR 10/magic, immune poison/sneak/critical, unable to use spell components, fly 10') for $L2 min",
  "Gate": "5'-20' disk connects another plane for $L rd",
  "Geas/Quest": "R$RS' Target must complete task",
  "Gentle Repose": "Corpse Will save or preserved $L dy",
  "Ghost Sound": "R$RS' produce sound volume of $L4 humans (Will disbelieve) for $L rd",
  "Ghoul Touch": "Touched Fort save or paralyzed 1d6+2 rd and stench sickens 10' radius",
  "Giant Form I": "Become large giant (+6 Str/-2 Dex/+4 Con/+4 AC/low-light vision/form abilities) for $L min",
  "Giant Form II": "Become huge giant (+8 Str/-2 Dex/+6 Con/+6 AC/low-light vision/form abilities) for $L min",
  "Giant Vermin": "R$RS' ${lvl<10?3:lvl<14?4:lvl<18?6:lvl<20?8:12} centipedes/${lvl<20?1+Math.floor((lvl-6)/4):6} scorpions/${lvl<20?2+Math.floor((lvl-6)/4):8} spiders become giant and obey for $L min",
  "Glibness": "+20 Bluff, DC ${lvl+15} magical lie detection for $L10 min",
  "Glitterdust": "R$RM' Creatures in 10'-radius outlined and Will save or blind for $L rd",
  "Globe Of Invulnerability": "R10' Bars spell effects le 4th level for $L rd",
  "Glyph Of Warding": "Proscribed creatures passing $L5 sq' area trigger ${1+Math.max(Math.floor(lvl/2),5)}d8 blast or harmful spell le 3rd level",
  "Good Hope": "$L targets +2 attack/damage/saves and skill/ability checks for $L min",
  "Goodberry": "2d4 berries provide meal and heal 1 HP for $L dy",
  "Grasping Hand": "R$RM' 10' (AC 20, caster HP) hand cover (+4 AC), move 60', grapple (CMB ${lvl + 12}) for $L rd",
  "Grease": "R$RS' Object or 10' square slippery (Ref or fall) for $L min",
  "Greater Arcane Sight": "R120' See auras/spell abilities and know spell for $L min",
  "Greater Command": "R$RS' $L targets Will save each rd or approach/drop/fall/flee/halt for $L rd",
  "Greater Dispel Magic": "R$RM' d20+$L vs. 11+caster level cancels $Ldiv4 spells/effects or all w/in 20' radius",
  "Greater Glyph Of Warding": "Proscribed creatures passing $L5 sq' area trigger ${1+Math.max(Math.floor(lvl/2),10)}d8 blast or harmful spell le 6th level",
  "Greater Heroism": "Touched +4 attack/saves/skill checks, +$Lmin20 HP, immune fear for $L10 min",
  "Greater Invisibility": "Touched invisible for $L rd",
  "Greater Magic Fang": "R$RS' target natural weapon +${Math.min(Math.floor(lvl/4),4)} attack/damage for $L hr",
  "Greater Magic Weapon": "R$RS' target weapon +${Math.min(Math.floor(lvl/4),4)} attack/damage for $L hr",
  "Greater Planar Ally": "Purchase service from extraplanar creature le 18 HD",
  "Greater Planar Binding": "Extraplanar creature(s) le 18 HD Will save or trapped until escape (DC ${Math.floor(lvl/2)+15}+cha) or performs a task",
  "Greater Polymorph": "Willing target becomes animal/elemental/plant/dragon for $L min",
  "Greater Prying Eyes": "1d4+$L floating eyes (AC 18, 1 HP) with True Seeing scout 1 mi for $L hr",
  "Greater Restoration": "Touched remove magical/temporary/permanent ability harm, fatigue/exhaustion, negative levels, mental effects",
  "Greater Scrying": "Target special Will save or viewed, subject to spells for $L hr",
  "Greater Shadow Conjuration": "Mimics conjuration (creation/summoning) le 6th level, Will save 60% effect",
  "Greater Shadow Evocation": "Mimics evocation le 7th level, Will save 60% effect",
  "Greater Shout": "60' cone 10d6 HP, deafened 4d6 rd, stunned 1 rd (Will half damage/deafened only)",
  "Greater Spell Immunity": "Touched immune to $Ldiv4 spells le 8th level for $L10 min",
  "Greater Teleport": "Transport you, $Ldiv3 others anywhere w/no error chance",
  "Guards And Wards": "Multiple magic effects protect $L200' sq area for $L2 hr",
  "Guidance": "Touched +1 next attack/save/skill check for 1 min",
  "Gust Of Wind": "60' gust affects medium/smaller creatures",
  "Hallow": "40' radius warded against evil, bars undead creation, evokes boon spell",
  "Hallucinatory Terrain": "R$RL' ${L} 30' cube terrain illusion (Will disbelieve) for $L2 hr",
  "Halt Undead": "R$RM' 3 undead Will save or immobilized for $L rd",
  "Harm": "Touched ${Math.min(lvl*10,150)} HP (Will half)",
  "Haste": "R$RS' $L targets extra attack, +1 attack/AC/Ref, +30 move for $L rd",
  "Heal": "Touched heal ${Math.min(lvl*10,150)}, remove negative conditions",
  "Heal Mount": "Mount heal ${Math.min(lvl*10,150)}, remove negative conditions",
  "Heat Metal": "R$RS' Metal of $Ldiv2 creatures Will save or 0/1/2/2/2/1/0d4 HP for 7 rd",
  "Helping Hand": "R5 miles Ghostly hand leads target to you for 4 hr",
  "Heroes' Feast": "Food for $L creatures cures sickness/poison/disease, 1d8+${Math.min(Math.floor(lvl/2),10)} temporary HP, +1 attack/Will, +4 saves vs. poison/fear for 12 hr",
  "Heroism": "Touched +2 attack/saves/skill checks for $L10 min",
  "Hide From Animals": "$L touched imperceptable to animals for $L10 min",
  "Hide From Undead": "$L touched imperceptable to undead for $L10 min",
  "Hideous Laughter": "R$RS' Target Will save or ROFL for $L rd",
  "Hold Animal": "R$RM' Target animal immobile until Will save/$L rd",
  "Hold Monster": "R$RM' Target immobile until Will save/$L rd",
  "Hold Person": "R$RM' Target humanoid immobile until Will save/$L rd",
  "Hold Portal": "R$RM' Door/gate/window locked, +5 DC to open for $L min",
  "Holy Aura": "$L creatures w/in 20' +4 AC/saves, SR 25 vs. evil spells, protected from possession, striking foes Fort save or blinded, for $L rd",
  "Holy Smite": "R$RM' Evil w/in 20'-radius burst ${Math.min(Math.floor(source/2),5)}d8 HP and blinded 1 rd, neutral half (Will half)",
  "Holy Sword": "Touched weapon +5 attack/damage, vs. evil +2d6 damage, +2 AC/saves, extra save vs. enchantment, bars contact for $L rd",
  "Holy Word": "Nongood creatures w/in 40' with equal/-1/-5/-10 HD Will save or deafened 1d4 rd/blinded 2d4 rd (save 1d4)/paralyzed 1d10 min (save 1 rd)/killed (save 3d6+$Lmin25 HP)",
  "Horrid Wilting": "R$RL' ${Lmin20}d6 HP (${Lmin20}d8 plants/water elementals) in 30' radius",
  "Hypnotic Pattern": "R$RM' 2d4+$Lmin10 HD of creatures Will save or fascinated for conc + 2 rd",
  "Hypnotism": "R$RS' 2d4 HD of creatures fascinated and suggestable for 2d4 rd",
  "Ice Storm": "R$RL' Hail in 40' cylinder 3d6 HP bludgeoning/2d6 HP cold, -4 Perception for $L rd",
  "Identify": "R60' cone info on magical auras, +10 Spellcraft for $L3 rd",
  "Illusory Script": "Unauthorized readers Will save or suggestion for $L dy",
  "Illusory Wall": "R$RS' Permanent illusionary 1'x10'x10' surface (Will disbelieve)",
  "Imbue With Spell Ability": "Touched with 2/4/5 HD can cast specified 1st/2x1st/2x1st+2nd level spells",
  "Implosion": "R$RS' 1 target/rd Fort save or $L10 HP for $Ldiv2 rd",
  "Imprisonment": "Target Will save or entombed",
  "Incendiary Cloud": "R$RM' 20' cylinder moves away 10', 6d6 HP (Ref half) for $L rd",
  "Inflict Critical Wounds": "Touched damage/heal undead 4d8+$Lmin20 (Will half)",
  "Inflict Light Wounds": "Touched damage/heal undead 1d8+$Lmin5 (Will half)",
  "Inflict Minor Wounds": "Touched 1 HP",
  "Inflict Moderate Wounds": "Touched damage/heal undead 2d8+$Lmin10 (Will half)",
  "Inflict Serious Wounds": "Touched damage/heal undead 3d8+$Lmin15 (Will half)",
  "Insanity": "R$RM' Target Will save or randomly normal/babble/d8+str to self/attack nearest permanently",
  "Insect Plague": "R$RL' ${Math.min(Math.floor(lvl/3),6)} wasp swarms attack for $L min",
  "Instant Summons": "Prepared object appears in your hand",
  "Interposing Hand": "R$RM' 10' (AC 20, caster HP) hand cover (+4 AC) for $L rd",
  "Invisibility": "Touched invisible for $L min/until attacks",
  "Invisibility Purge": "R$L5' Invisible becomes visible for $L min",
  "Invisibility Sphere": "Creatures w/in 10' of touched invisible for $L min/until attacks/leave area",
  "Iron Body": "Become iron (+6 Str/-6 Dex, half speed, 35% arcane failure, -6 skill, DR 15/adamantine, half damage acid/fire, immune other attacks/effects) for $L min",
  "Ironwood": "Make a wood object as strong as steel",
  "Irresistible Dance": "Touched dance (-4 AC, -10 Ref) for d4+1 rd (Will 1 rd)",
  "Jump": "Touched +${lvl<5?10:lvl<9?20:30} jump Acrobatics for $L min",
  "Keen Edge": "R$RS' Target weapon double threat range for $L10 min",
  "Knock": "R$RM' +${lvl+10} check to open stuck/barred/locked/magically held door/chest/shackle",
  "Know Direction": "Self determine north",
  "Legend Lore": "Info about target person/place/object",
  "Lesser Confusion": "R$RS' Target Will save or randomly normal/babble/d8+str to self/attack nearest for 1 rd",
  "Lesser Geas": "R$RS' Target le 7 HD Will save or must complete task",
  "Lesser Globe Of Invulnerability": "Bars spell effects le 3rd level in 10' radius for $L rd",
  "Lesser Planar Ally": "Purchase service from extraplanar creature le 6 HD",
  "Lesser Planar Binding": "Extraplanar creature le 6 HD Will save or trapped until escape (DC ${Math.floor(lvl/2)+15}+cha) or performs a task",
  "Lesser Restoration": "Touched remove 1 magical/1d4 temporary ability harm, fatigue/exhaustion, 1 negative level",
  "Levitate": "R$RS' Move willing target up/down 20' for $L min",
  "Light": "Touched gives torchlight for $L10 min",
  "Lightning Bolt": "120' bolt ${Lmin10}d6 HP (Ref half)",
  "Limited Wish": "Alter reality, with limits",
  "Liveoak": "Touched oak becomes treant guardian for $L dy",
  "Locate Creature": "R$RL' Sense direction of creature/kind for $L10 min",
  "Locate Object": "R$RL' Sense direction of object/type for $L min",
  "Longstrider": "Self +10 speed for $L hr",
  "Lullaby": "R$RM' Targets in 10' radius -5 Perception/-2 Will saves vs. sleep for conc + $L rd",
  "Mage Armor": "Touched +4 AC for $L hr",
  "Mage Hand": "R$RS' Move target le 5 lb 15'",
  "Mage's Disjunction": "R$RS' 40' radius dispelled, magic items Will save or inert for $L min, $L% chance to destroy antimagic field",
  "Mage's Faithful Hound": "R$RS' Invisible dog barks at intruders w/in 30', bites (+10 2d6+3) w/in 5' for $L hr",
  "Mage's Lucubration": "Recalls spell le 5th level from past day",
  "Mage's Magnificent Mansion": "R$RS' Door to extradimensional mansion for $L2 hr",
  "Mage's Private Sanctum": "Prevents outside view/scry/hear of ${L} 30' cubes for 1 dy",
  "Mage's Sword": "R$RS' Unattended force blade attacks (+${lvl+3}+abil 4d6+3x2@19) for $L rd",
  "Magic Aura": "Alters aura of target object le $L5 lb for $L dy",
  "Magic Circle Against Chaos": "10' radius from touched +2 AC/+2 saves/extra save vs. mental control/no contact vs. chaotic creatures for $L10 min",
  "Magic Circle Against Evil": "10' radius from touched +2 AC/+2 saves/extra save vs. mental control/no contact vs. evil creatures for $L10 min",
  "Magic Circle Against Good": "10' radius from touched +2 AC/+2 saves/extra save vs. mental control/no contact vs. good creatures for $L10 min",
  "Magic Circle Against Law": "10' radius from touched +2 AC/+2 saves/extra save vs. mental control/no contact vs. lawful creatures for $L10 min",
  "Magic Fang": "Touched natural weapon +1 attack/damage for $L min",
  "Magic Jar": "R$RM' Target Will save or possessed for $L hr",
  "Magic Missile": "R$RM' ${Math.min(Math.floor((lvl+1)/2),5)} missles 1d4+1 HP",
  "Magic Mouth": "R$RS' Mouth speaks 25 words upon trigger w/in $L15'",
  "Magic Stone": "3 touched stones +1 attack/1d6+1 HP (2d6+2 vs. undead) for 30 min",
  "Magic Vestment": "Touched armor/shield/clothing +${Math.min(Math.floor(lvl/4),5)} AC for $L hr",
  "Magic Weapon": "Touched weapon +1 attack/damage for $L min",
  "Major Creation": "Create $L' cu plant/mineral object for $L2 hr",
  "Major Image": "R$RL' ${(lvl+4)*10}' cu image w/sound/smell/thermal (Will disbelieve) for conc + 3 rd",
  "Make Whole": "R$RS' Repairs ${Lmin5}d6 damage to $L' cu object",
  "Mark Of Justice": "Touched permanent -6 ability, -4 attack/saves/checks, or 50% chance/rd of losing action upon trigger",
  "Mass Bear's Endurance": "R$RS' $L targets +4 Con for $L min",
  "Mass Bull's Strength": "R$RS' $L targets +4 Str for $L min",
  "Mass Cat's Grace": "R$RS' $L targets +4 Dex for $L min",
  "Mass Charm Monster": "R$RS' $L2 HD targets Will save or treats you as trusted friend for $L dy",
  "Mass Cure Critical Wounds": "R$RS' $L targets heal/damage undead 4d8+$Lmin40 (Will half)",
  "Mass Cure Light Wounds": "R$RS' $L targets heal/damage undead 1d8+$Lmin25 (Will half)",
  "Mass Cure Moderate Wounds": "R$RS' $L targets heal/damage undead 2d8+$Lmin30 (Will half)",
  "Mass Cure Serious Wounds": "R$RS' $L targets heal/damage undead 3d8+$Lmin35 (Will half)",
  "Mass Eagle's Splendor": "R$RS' $L targets +4 Cha for $L min",
  "Mass Enlarge Person": "R$RS' $L target humanoid Fort save or double size (+2 Str/-2 Dex/-1 attack/-1 AC) for $L min",
  "Mass Fox's Cunning": "R$RS' $L targets +4 Int for $L min",
  "Mass Heal": "R$RS' $L targets heal ${Math.min(lvl*10,150)}, remove negative conditions",
  "Mass Hold Monster": "R$RM' Targets in 30' radius immobile until Will save/$L rd",
  "Mass Hold Person": "R$RM' Targets in 30' radius immobile until Will save/$L rd",
  "Mass Inflict Critical Wounds": "R$RS' $L targets damage/heal undead 4d8+$Lmin40 (Will half)",
  "Mass Inflict Light Wounds": "R$RS' $L targets damage/heal undead 1d8+$Lmin25 (Will half)",
  "Mass Inflict Moderate Wounds": "R$RS' $L targets damage/heal undead 2d8+$Lmin30 (Will half)",
  "Mass Inflict Serious Wounds": "R$RS' $L targets damage/heal undead 3d8+$Lmin35 (Will half)",
  "Mass Invisibility": "R$RL' Targets in 90' radius invisible for $L min/until attacks",
  "Mass Owl's Wisdom": "R$RS' $L targets +4 Wis for $L min",
  "Mass Reduce Person": "R$RS' $L target humanoid Fort save or half size (-2 Str/+2 Dex/+1 attack/+1 AC) for $L min",
  "Mass Suggestion": "R$RM' $L targets Will save or follow reasonable suggestion",
  "Maze": "R$RS' Target in extradimensional maze for 10 min/until DC 20 Int check",
  "Meld Into Stone": "Self pass into stone for $L10 min",
  "Mending": "R10' Repairs 1d4 HP to $L-lb object",
  "Message": "R$RM' Target DC 25 Perception for $L10-min whispered dialogue",
  "Meteor Swarm": "R$RL' 4 spheres 6d6 HP fire 40' radius (Ref half)/ranged touch 2d6 HP bludgeoning",
  "Mind Blank": "R$RS' Target immune divination/+8 vs. mental for 1 dy",
  "Mind Fog": "20' fog cylinder -10 Wis/Will checks",
  "Minor Creation": "Create a $L' cu plant object lasting $L hr",
  "Minor Image": "R$RL' ${(lvl+4)*10}' cu image w/noise (Will disbelieve) for conc + 2 rd",
  "Miracle": "Requests deity's intercession",
  "Mirage Arcana": "R$RL' ${L} 20' cube terrain/structure illusion (Will disbelieve) for $L hr",
  "Mirror Image": "1d4+${Math.min(Math.floor(lvl/3),8)} self decoys mislead attacks for $L min",
  "Misdirection": "R$RS' Divinations upon target redirected for $L hr",
  "Mislead": "R$RS' Self invisible $L rd, false double (Will disbelieve) conc + 3 rd",
  "Mnemonic Enhancer": "Know +3 spell levels or retain just-cast spell le 3rd level for 1 dy",
  "Modify Memory": "Target Will save or change 5 min of memory",
  "Moment Of Prescience": "Self +$Lmin25 attack/check/save once w/in $L hr",
  "Mount": "R$RS' Summons riding horse for $L2 hr",
  "Move Earth": "R$RL' Slowly digs 7500' cu dirt",
  "Neutralize Poison": "Touched neutralized $L10 min/immunized/detoxified",
  "Nightmare": "Target Will save or 1d10 HP and fatigue",
  "Nondetection": "Touched DC ${lvl+11}/${lvl+15} resistance to divination for $L hr",
  "Obscure Object": "Touched immune to divination for 8 hr",
  "Obscuring Mist": "20'-radius fog around self obscures vision for $L min",
  "Open/Close": "R$RS' Target le 30 lb opens/closes",
  "Order's Wrath": "R$RM' Chaotic w/in 30' cube ${Math.min(Math.floor(source/2),5)}d8 HP and dazed 1 rd, neutral half (Will half)",
  "Overland Flight": "Self fly 40', +$Ldiv2 Fly for $L hr",
  "Owl's Wisdom": "Touched +4 Wis for $L min",
  "Pass Without Trace": "$L touched leave no tracks/scent for $L hr",
  "Passwall": "8'x5'x${Math.min(10+5*Math.floor((lvl-9)/3),25)}' passage through wood/stone/plaster lasts $L hr",
  "Permanency": "Makes certain spells permanent",
  "Permanent Image": "R$RL' ${(lvl+4)*10}' cu image w/sound/smell/thermal (Will disbelieve)",
  "Persistent Image": "R$RL' ${(lvl+4)*10}' cu image w/sound/smell/thermal (Will disbelieve) for $L min",
  "Phantasmal Killer": "R$RM' Target Will save or fears create creature, touch kills (Fort 3d6 HP)",
  "Phantom Steed": "Create mount (${lvl+7} HP, AC 18, MV ${Math.min(Math.floor(lvl/2)*20,100)}) for target for $L hr",
  "Phantom Trap": "Touched object appears trapped",
  "Phase Door": "Allow passage through 8'x5'x${Math.min(10+5*Math.floor((lvl-9)/3),25)}' wood/stone/plaster $Ldiv2 times",
  "Planar Ally": "Purchase service from extraplanar creature le 12 HD",
  "Planar Binding": "Extraplanar creature(s) le 12 HD Will save or trapped until escape (DC ${Math.floor(lvl/2)+15}+cha) or performs a task",
  "Plane Shift": "1 target (Will negate)/8 willing move to another plane",
  "Plant Growth": "$RL' vegetation becomes dense or 1/2 mi radius increases productivity",
  "Plant Shape I": "Become small (+2 Con/+2 AC) or medium (+2 Str/+2 Con/+2 AC) plant creature for $L min",
  "Plant Shape II": "Become large (+4 Str/+2 Con/+4 AC) plant creature for $L min",
  "Plant Shape III": "Become huge (+8 Str/-2 Dex/+4 Con/+6 AC) plant creature for $L min",
  "Poison": "Touched Fort save or 1d3 Con/rd for 6 rd",
  "Polar Ray": "R$RM' Ranged touch ${Lmin25}d6 HP/1d4 Dex",
  "Polymorph": "Willing target becomes animal/elemental for $L min",
  "Polymorph Any Object": "Target Fort save or become something else",
  "Power Word Blind": "R$RS' Target w/ 50/100/200 HP blinded for ever/1d4+1 min/1d4+1 rd",
  "Power Word Kill": "R$RS' Kills one creature le 100 HP",
  "Power Word Stun": "R$RS' Target w/ 40/100/150 HP stunned for 4d4/2d4/1d4 rd",
  "Prayer": "Allies w/in 40' +1 attack/damage/save/skill, foes -1 for $L rd",
  "Prestidigitation": "R10' Perform minor tricks for 1 hr",
  "Prismatic Sphere": "R$RS' 10' sphere blocks attacks for $L10 min",
  "Prismatic Spray": "R60' cone Blinds le 8 HD 2d4 rd, other effects",
  "Prismatic Wall": "R$RS' $L4'x$L2' wall blocks attacks for $L10 min",
  "Produce Flame": "Torch flame 1d6+$Lmin5 HP for $L min",
  "Programmed Image": "R$RL' ${(lvl+4)*10}' cu image w/sound/smell/thermal (Will disbelieve) for $L rd when triggered",
  "Project Image": "R$RM' See/cast through illusory double for $L rd",
  "Protection From Arrows": "Touched DR 10/magic vs. ranged for $L hr/${Math.min(lvl*10,100)} HP",
  "Protection From Chaos": "Touched +2 AC/+2 saves/extra save vs. mental control/no contact by chaotic creatures for $L min",
  "Protection From Energy": "Touched ignores up to ${Math.min(lvl*12,120)} HP from specified energy for $L10 min",
  "Protection From Evil": "Touched +2 AC/+2 saves/extra save vs. mental control/no contact by evil creatures for $L min",
  "Protection From Good": "Touched +2 AC/+2 saves/extra save vs. mental control/no contact by good creatures for $L min",
  "Protection From Law": "Touched +2 AC/+2 saves/extra save vs. mental control/no contact by lawful creatures for $L min",
  "Protection From Spells": "+8 spell saves for $L10 min",
  "Prying Eyes": "1d4+$L floating eyes (AC 18, 1 HP) scout 1 mi for $L hr",
  "Purify Food And Drink": "R10' Make $L' cu food/water safe",
  "Pyrotechnics": "R$RL' Fire becomes fireworks (120' Will save or blinded 1d4+1 rd) or choking smoke (20' Fort save or -4 Str/Dex d4+1 rd)",
  "Quench": "R$RM' Extinguish fire/dispel fire magic/${Lmin10}d6 HP to fire creatures in $L 20' cu",
  "Rage": "R$RM' $Ldiv3 willing targets +2 Str/Con, +1 Will, -2 AC for conc + $L rd",
  "Rainbow Pattern": "R$RM' 24 HD creatures in 20' radius Will save or facinated for conc + $L rd",
  "Raise Dead": "Restores life to touched corpse dead le $L dy",
  "Ray Of Enfeeblement": "R$RS' Ranged touch 1d6+${Math.min(Math.floor(lvl/2),5)} Str (Fort half)",
  "Ray Of Exhaustion": "R$RS' Ranged touch causes exhaustion for $L min (Save fatigued)",
  "Ray Of Frost": "R$RS' Ranged touch 1d3 HP",
  "Read Magic": "Self read magical writing",
  "Reduce Animal": "Touched willing animal half size (-2 Str/+2 Dex/+1 attack/+1 AC) for $L hr",
  "Reduce Person": "R$RS' Target humanoid Fort save or half size (-2 Str/+2 Dex/+1 attack/+1 AC) for $L min",
  "Refuge": "Breaking trigger transports you/target to other's location",
  "Regenerate": "Touched regrow maims, heal 4d8+$Lmin35 HP, rid fatigue/exhaustion",
  "Reincarnate": "Restore target dead le 1 week to new body",
  "Remove Blindness/Deafness": "Touched cured of blindness or deafness",
  "Remove Curse": "Dispels all curses from touched",
  "Remove Disease": "Cures all diseases affecting touched",
  "Remove Fear": "R$RS' ${Math.floor((lvl+3)/4)} targets +4 vs. fear, existing fear suppressed for 10 min",
  "Remove Paralysis": "R$RS' Frees one target from paralysis/slow, 2/3/4 targets extra save at +4/+2/+2",
  "Repel Metal Or Stone": "Repels 60' line of unanchored metal/stone for $L rd",
  "Repel Vermin": "10' radius bars vermin le $Ldiv3 HD, 2d6 HP to others w/Will save for $L10 min",
  "Repel Wood": "Repels 60' line of unanchored wood for $L min",
  "Repulsion": "Creatures Will save or stay $L10' away for $L rd",
  "Resilient Sphere": "R$RS' Impassible/immobile $L'-diameter sphere surrounds target for $L min",
  "Resist Energy": "Touched DR ${lvl>10?30:lvl>6?20:10} from specified energy for $L10 min",
  "Resistance": "Touched +1 saves for 1 min",
  "Restoration": "Touched remove magical/temporary/1 permanent ability harm, fatigue/exhaustion, 1 negative level",
  "Resurrection": "Fully restore target dead $L10 years w/1 negative level",
  "Reverse Gravity": "Objects in $L10' cu fall upward for $L rd",
  "Righteous Might": "Self double size (+4 Str/+4 Con/-2 Dex/-1 attack/-1 AC) and DR ${lvl>14?10:5}/align for $L rd",
  "Rope Trick": "Rope to extradimensional space for 8 creatures for $L hr",
  "Rusting Grasp": "Touch corrodes 3' radius",
  "Sanctuary": "Touched foes Will save to attack for $L rd/until attacks",
  "Scare": "R$RS' $Ldiv3 targets le 5 HD flee for 1d4 rd (Will shaken 1 rd)",
  "Scintillating Pattern": "R$RS' $Lmin20 HD creatures in 20' radius le 6/12/20 HD unconscious 1d4 rd/stunned 1d4 rd/confused 1d4 rd",
  "Scorching Ray": "${lvl>10?3:lvl>6?2:1} $RS' rays ranged touch 4d6 HP",
  "Screen": "Illusion hides $L x 30' cu from vision and scrying (Will disbelieve) for 1 dy",
  "Scrying": "Target special Will save or viewed for $L min",
  "Sculpt Sound": "R$RS' $L targets Will save or sounds changed for $L hr",
  "Searing Light": "R$RM' Range touch ${Math.min(Math.floor(lvl/2),5)}d8 HP, undead ${Lmin10}d6, object ${Math.min(Math.floor(lvl/2),5)}d6",
  "Secret Chest": "$L' cu ethereal chest can be recalled at will for 60 dy",
  "Secret Page": "Hide content of touched page permanently",
  "Secure Shelter": "R$RS' 20'x20' cottage lasts $L2 hr",
  "See Invisibility": "Self sees invisible creatures/objects for $L10 min",
  "Seeming": "R$RS' $Ldiv2 targets appearance change/+10 disguise for 12 hr",
  "Sending": "25-word exchange with target",
  "Sepia Snake Sigil": "Target reader Ref save or immobile 1d4+$L dy",
  "Sequester": "Willing touched invisible/unscryable/comatose for $L dy",
  "Shades": "Mimics conjuration (creation/summoning) le 8th level (Will 80% effect)",
  "Shadow Conjuration": "Mimics conjuration (creation/summoning) le 3rd level (Will 20% effect)",
  "Shadow Evocation": "Mimics evocation le 4th level (Will 20% effect)",
  "Shadow Walk": "Travel quickly via Plane of Shadow for $L hr",
  "Shambler": "R$RM' 1d4+2 advanced shambling mounds fight for 7 dy/guard for 7 mo",
  "Shapechange": "Become different animal 1/rd for $L10 min",
  "Shatter": "R$RS' Breakables in 5' radius Will save or shatter, or target ${Lmin10}d6 HP (Fort half)",
  "Shield": "Self +4 AC, block magic missle for $L min",
  "Shield Of Faith": "Touched +${Math.min(2+Math.floor(lvl/6),5)} AC for $L min",
  "Shield Of Law": "$L creatures w/in 20' radius +4 AC/saves, +25 vs chaotic spells, immune chaotic mental control, chaotic hit Will save or slowed for $L rd",
  "Shield Other": "R$RS' target +1 AC/saves, half damage transferred to you for $L hr",
  "Shillelagh": "S/M/L staff +1 attack, 1d8+1/2d6+1/3d6+1 damage for $L min",
  "Shocking Grasp": "Touch ${Lmin5}d6 HP, +3 attack vs metal",
  "Shout": "R30' cone 5d6 HP, deafened 2d6 rd (Will half damage only)",
  "Shrink Item": "Touched $L2' cu object Will save or 1/16 size, becomes cloth for $L dy",
  "Silence": "R$RL' Bars sound in 20' radius for $L rd",
  "Silent Image": "R$RL' ${(lvl+4)*10}' cu image (Will disbelieve) for conc",
  "Simulacrum": "Create permanent double of creature w/half HP/levels",
  "Slay Living": "Touch attack 12d6+$L HP (Fort 3d6+$L)",
  "Sleep": "R$RM' 4 HD creatures in 10' radius Will save or sleep for $L min",
  "Sleet Storm": "R$RL' Blinding sleet in 40' area, creatures DC 10 Acrobatics to move for $L rd",
  "Slow": "R$RS' $L creatures single action per rd/-1 AC/attack/Ref/half speed for $L rd",
  "Snare": "Touched vine/thong/rope becomes permanent DC 23 trap",
  "Soften Earth And Stone": "R$RS' $L 10'x4' squares of wet earth/dry earth/natural stone becomes mud/sand/clay",
  "Solid Fog": "R$RM' 20'-radius fog obscures vision and half speed/-2 damage/attack for $L min",
  "Song Of Discord": "R$RM' Creatures in 20' radius 50% chance each rd to attack neighbor for $L rd",
  "Soul Bind": "Imprisons soul dead le $L rd to prevent resurrection",
  "Sound Burst": "R$RS' 10' radius 1d8 HP/Fort save or stunned",
  "Speak With Animals": "Self converse w/animals for $L min",
  "Speak With Dead": "R10' Corpse answer $Ldiv2 questions",
  "Speak With Plants": "Self converse w/plants for $L min",
  "Spectral Hand": "Self yield 1d4 HP to glowing hand to deliver touch attacks at +2 for $L min",
  "Spell Immunity": "Touched immune to $Ldiv4 spells le 4th level for $L10 min",
  "Spell Resistance": "Touched +${lvl+12} saves vs spells for $L min",
  "Spell Turning": "Self reflect onto caster 1d4+6 non-touch spell levels for $L10 min",
  "Spellstaff": "Store 1 spell in wooden quarterstaff",
  "Spider Climb": "Touched climb walls/ceilings for $L10 min",
  "Spike Growth": "R$RM' Spikes on vegetation in 20' sq 1d4 HP each 5' movement and Ref save or slowed 1 dy to half speed for $L hr",
  "Spike Stones": "R$RM' Spikes on stony group in 20' sq 1d8 HP each 5' movement and Ref save or slowed 1 dy to half speed for $L hr",
  "Spiritual Weapon": "R$RM' Force weapon (+BAB+Wis 1d8+${Math.min(Math.floor(lvl/3),5)}) attacks designated foes for $L rd",
  "Stabilize": "R$RS' Stabilize dying target",
  "Statue": "Touched become statue at will for $L hr",
  "Status": "Monitor condition/position of $Ldiv3 touched allies for $L hr",
  "Stinking Cloud": "R$RM' 20'-radius fog obscures vision, Fort save or 1d4+1 rd nausea (no attacks/spells) for $L rd",
  "Stone Shape": "Shape ${10+lvl}' cu of stone",
  "Stone Tell": "Self dialogue w/stone for $L min",
  "Stone To Flesh": "R$RM' Restore stoned creature (DC 15 Fort to survive) or make flesh 10'x3' stone cyclinder",
  "Stoneskin": "Touched DR 10/adamantine for ${Math.min(lvl*10,150)} HP/$L min",
  "Storm Of Vengeance": "R$RL' 360' radius storm deafen 1d4x10 min (Fort negates), then rain acid 1d6 HP, then 6 bolts lightning 10d6 (Ref half), then hail 5d6 HP, then dark 6 rd",
  "Suggestion": "R$RS' Target Will save or follow reasonable suggestion",
  "Summon Instrument": "Musical instrument appears for $L min",
  "Summon Monster I": "R$RS' 1 1st-level creature appears, fights foes for $L rd",
  "Summon Monster II": "R$RS' 1 2nd-/1d3 1st-level creature appears, fights foes for $L rd",
  "Summon Monster III": "R$RS' 1 3rd-/1d3 2nd-/1d4+1 1st-level creature appears, fights foes for $L rd",
  "Summon Monster IV": "R$RS' 1 4th-/1d3 3rd-/1d4+1 lower-level creature appears, fights foes for $L rd",
  "Summon Monster V": "R$RS' 1 5th-/1d3 4th-/1d4+1 lower-level creature appears, fights foes for $L rd",
  "Summon Monster VI": "R$RS' 1 6th-/1d3 5th-/1d4+1 lower-level creature appears, fights foes for $L rd",
  "Summon Monster VII": "R$RS' 1 7th-/1d3 6th-/1d4+1 lower-level creature appears, fights foes for $L rd",
  "Summon Monster VIII": "R$RS' 1 8th-/1d3 7th-/1d4+1 lower-level creature appears, fights foes for $L rd",
  "Summon Monster IX": "R$RS' 1 9th-/1d3 8th-/1d4+1 lower-level creature appears, fights foes for $L rd",
  "Summon Nature's Ally I": "R$RS' 1 1st-level creature appears, fights foes for $L rd",
  "Summon Nature's Ally II": "R$RS' 1 2nd-/1d3 1st-level creature appears, fights foes for $L rd",
  "Summon Nature's Ally III": "R$RS' 1 3rd-/1d3 2nd-/1d4+1 1st-level creature appears, fights foes for $L rd",
  "Summon Nature's Ally IV": "R$RS' 1 4th-/1d3 3rd-/1d4+1 lower-level creature appears, fights foes for $L rd",
  "Summon Nature's Ally V": "R$RS' 1 5th-/1d3 4th-/1d4+1 lower-level creature appears, fights foes for $L rd",
  "Summon Nature's Ally VI": "R$RS' 1 6th-/1d3 5th-/1d4+1 lower-level creature appears, fights foes for $L rd",
  "Summon Nature's Ally VII": "R$RS' 1 7th-/1d3 6th-/1d4+1 lower-level creature appears, fights foes for $L rd",
  "Summon Nature's Ally VIII": "R$RS' 1 8th-/1d3 7th-/1d4+1 lower-level creature appears, fights foes for $L rd",
  "Summon Nature's Ally IX": "R$RS' 1 9th-/1d3 8th-/1d4+1 lower-level creature appears, fights foes for $L rd",
  "Summon Swarm": "R$RS' Swarm of bats/rats/spiders obey for conc + 2 rd",
  "Sunbeam": "60' beam blinds, 4d6 HP (undead ${Lmin20}d6) (Ref unblind/half) 1/rd for ${Math.min(Math.floor(lvl/30),6)} rd",
  "Sunburst": "R$RL' 80' radius blinds, 6d6 HP (undead ${Lmin25}d6) (Ref unblind/half)",
  "Symbol Of Death": "R60' Rune kills 150 HP of creatures (Fort negate) when triggered",
  "Symbol Of Fear": "R60' Rune panics creatures (Will negate) for $L rd when triggered",
  "Symbol Of Insanity": "R60' Rune makes creatures insane (Will negate) permanently when triggered",
  "Symbol Of Pain": "R60' Rune causes pain (-4 attack/skill/ability, Fort negate) when triggered for $L10 min",
  "Symbol Of Persuasion": "R60' Rune charms creatures (Will negate) for $L hrs when triggered for $L10 min",
  "Symbol Of Sleep": "R60' Rune sleeps creatures (Will negate) le 10 HD for 3d6x10 min when triggered for $L10 min",
  "Symbol Of Stunning": "R60' Rune stuns creatures (Will negate) for 1d6 rd when triggered",
  "Symbol Of Weakness": "R60' Rune weakens creatures (3d6 Str, Fort negate) permanently when triggered for $L10 min",
  "Sympathetic Vibration": "Touched structure 2d10 HP/rd for $L rd",
  "Sympathy": "Named kind/alignment creatures Will save or drawn to $L10' cube for $L2 hr",
  "Telekinesis": "R$RL' Move ${Math.min(lvl*25,375)} lb 20' for $L rd, combat maneuver (CMB $L) $L rd, or hurl ${Math.min(lvl,15)} objects ${Math.min(lvl*25,375)} lbs total (Will negate)",
  "Telekinetic Sphere": "R$RS' Impassible $L'-diameter sphere surrounds target, move 30' to $RM' away for $L min",
  "Telepathic Bond": "R$RS' Self share thoughts w/$Ldiv3 allies for $L10 min",
  "Teleport": "Transport you, $Ldiv3 others $L100 mi w/some error chance",
  "Teleport Object": "Transport touched object $L100 mi w/some error chance",
  "Teleportation Circle": "Transport creatures in 5' radius anywhere w/no error chance for $L10 min",
  "Temporal Stasis": "Touched Fort save or in permanent stasis",
  "Time Stop": "All others halt, invulnerable for 1d4+1 rd",
  "Tiny Hut": "20' sphere resists elements for $L2 hr",
  "Tongues": "Touched communicate in any language for $L10 min",
  "Touch Of Fatigue": "Touch attack fatigues target for $L rd",
  "Touch Of Idiocy": "Touch attack 1d6 Int/Wis/Cha for $L10 min",
  "Transformation": "Self +4 Str/Dex/Con/AC, +5 Fort, martial prof, no spells for $L rd",
  "Transmute Metal To Wood": "R$RL' Metal 40' radius becomes wood (-2 attack/damage/AC)",
  "Transmute Mud To Rock": "R$RM' $L2 10' mud cubes become rock",
  "Transmute Rock To Mud": "R$RM' $L2 10' natural rock cubes become mud",
  "Transport Via Plants": "Self and $Ldiv3 willing targets teleport via like plants",
  "Trap The Soul": "R$RS' Target Will save or imprisoned in gem",
  "Tree Shape": "Become tree for $L hr",
  "Tree Stride": "Teleport 3000' via like trees",
  "True Resurrection": "Fully restore target dead $L10 yr",
  "True Seeing": "Touched sees through 120' darkness/illusion/invisible for $L min",
  "True Strike": "Self +20 next attack",
  "Undeath To Death": "R$RM' ${Lmin20}d4 HD of creatures le 8 HD w/in 40' Will save or destroyed",
  "Undetectable Alignment": "R$RS' Target Will save or alignment concealed for 1 dy",
  "Unhallow": "40' radius warded against good, evokes bane spell",
  "Unholy Aura": "$L creatures w/in 20' +4 AC/saves, SR 25 vs. good spells, protected from possession, good hit Fort save or 1d6 Str, for $L rd",
  "Unholy Blight": "R$RM' Good w/in 20'-radius burst ${Math.min(Math.floor(source/2),5)}d8 HP and sickened 1d4 rd, neutral half (Will half)",
  "Unseen Servant": "R$RS' Invisible servant obey for $L hr",
  "Vampiric Touch": "Touch attack ${Math.min(Math.floor(lvl/2),10)} HP, gain half as temporary HP for 1 hr",
  "Veil": "R$RL' Targets in 30' radius Will save or appear as other creatures for conc + $L hr",
  "Ventriloquism": "R$RS' Self voice moves for $L min",
  "Virtue": "Touched +1 HP for 1 min",
  "Vision": "Info about target person/place/object",
  "Wail Of The Banshee": "R$RS' $L targets w/in 40' Fort save or $L10 HP",
  "Wall Of Fire": "R$RM' $L20' wall 2d4 HP w/in 10', 1d4 HP w/in 20', 2d6 HP transit (undead double) for conc + $L rd",
  "Wall Of Force": "R$RS' Impassible/immobile $L x 10' sq wall $L rd",
  "Wall Of Ice": "R$RM' $L x 10' x $L\" ice wall or ${lvl+3}' hemisphere for $L min",
  "Wall Of Iron": "R$RM' $L x 5' $Ldiv4\"-thick permanent iron wall",
  "Wall Of Stone": "R$RM' $L x 5' $Ldiv4\"-thick permanent stone wall",
  "Wall Of Thorns": "R$RM' $L x 10' cube thorns (25-AC) HP/rd to transiters for $L10 min",
  "Warp Wood": "R$RS' $L wooden objects Will save or warped",
  "Water Breathing": "Touched breathe underwater for $L2 hrs total",
  "Water Walk": "$L touched tread on liquid as if solid for $L10 min",
  "Waves Of Exhaustion": "60' cone exhausted",
  "Waves Of Fatigue": "30' cone fatigued",
  "Web": "R$RM' 20'-radius webs grapple (Ref negate), burn for 2d4 HP for $L10 min",
  "Weird": "R$RM' Targets in 30' radius Will save or fears create creature, touch kills (Fort 3d6 HP/1d4 Str/stun 1 rd)",
  "Whirlwind": "R$RL' 10'-radius wind 1d8 HP/rd for $L rd (Ref negate)",
  "Whispering Wind": "Send 25-word message $L mi to 10' area",
  "Wind Walk": "Self + $Ldiv3 touched vaporize and move 60 mph for $L hr",
  "Wind Wall": "R$RM' $L10'x5' curtain of air scatters objects, deflects arrows/bolts for $L rd",
  "Wish": "Alter reality, with few limits",
  "Wood Shape": "Shape ${10+lvl}' cu of wood",
  "Word Of Chaos": "Nonchaotic creatures w/in 40' with equal/-1/-5/-10 HD Will save or deafened 1d4 rd/stunned 1 rd/confused 1d10 min (save 1 rd)/killed (save 3d6+$Lmin25 HP)",
  "Word Of Recall": "Self + $Ldiv3 willing targets return to designated place",
  "Zone Of Silence": "No sound escapes 5' radius around self for $L hr",
  "Zone Of Truth": "R$RS' Creatures w/in 20' radius Will save or cannot lie for $L min"
};
SRD35.spellsSchools = {

  'Acid Arrow':'Conjuration', 'Acid Fog':'Conjuration',
  'Acid Splash':'Conjuration', 'Aid':'Enchantment', 'Air Walk':'Transmutation',
  'Alarm':'Abjuration', 'Align Weapon':'Transmutation',
  'Alter Self':'Transmutation', 'Analyze Dweomer':'Divination',
  'Animal Growth':'Transmutation', 'Animal Messenger':'Enchantment',
  'Animal Shapes':'Transmutation', 'Animal Trance':'Enchantment',
  'Animate Dead':'Necromancy', 'Animate Objects':'Transmutation',
  'Animate Plants':'Transmutation', 'Animate Rope':'Transmutation',
  'Antilife Shell':'Abjuration', 'Antimagic Field':'Abjuration',
  'Antipathy':'Enchantment', 'Antiplant Shell':'Abjuration',
  'Arcane Eye':'Divination', 'Arcane Lock':'Abjuration',
  'Arcane Mark':'Universal', 'Arcane Sight':'Divination',
  'Astral Projection':'Necromancy', 'Atonement':'Abjuration',
  'Augury':'Divination', 'Awaken':'Transmutation',

  'Baleful Polymorph':'Transmutation', 'Bane':'Enchantment',
  'Banishment':'Abjuration', 'Barkskin':'Transmutation',
  'Bear\'s Endurance':'Transmutation', 'Bestow Curse':'Necromancy',
  'Binding':'Enchantment', 'Black Tentacles':'Conjuration',
  'Blade Barrier':'Evocation', 'Blasphemy':'Evocation', 'Bless':'Enchantment',
  'Bless Water':'Transmutation', 'Bless Weapon':'Transmutation',
  'Blight':'Necromancy', 'Blindness/Deafness':'Necromancy',
  'Blink':'Transmutation', 'Blur':'Illusion', 'Break Enchantment':'Abjuration',
  'Bull\'s Strength':'Transmutation', 'Burning Hands':'Evocation',

  'Call Lightning':'Evocation', 'Call Lightning Storm':'Evocation',
  'Calm Animals':'Enchantment', 'Calm Emotions':'Enchantment',
  'Cat\'s Grace':'Transmutation', 'Cause Fear':'Necromancy',
  'Chain Lightning':'Evocation', 'Changestaff':'Transmutation',
  'Chaos Hammer':'Evocation', 'Charm Animal':'Enchantment',
  'Charm Monster':'Enchantment', 'Charm Person':'Enchantment',
  'Chill Metal':'Transmutation', 'Chill Touch':'Necromancy',
  'Circle Of Death':'Necromancy', 'Clairaudience/Clairvoyance':'Divination',
  'Clenched Fist':'Evocation', 'Cloak Of Chaos':'Abjuration',
  'Clone':'Necromancy', 'Cloudkill':'Conjuration', 'Color Spray':'Illusion',
  'Command':'Enchantment', 'Command Plants':'Transmutation',
  'Command Undead':'Necromancy', 'Commune':'Divination',
  'Commune With Nature':'Divination', 'Comprehend Languages':'Divination',
  'Cone Of Cold':'Evocation', 'Confusion':'Enchantment',
  'Consecrate':'Evocation', 'Contact Other Plane':'Divination',
  'Contagion':'Necromancy', 'Contingency':'Evocation',
  'Continual Flame':'Evocation', 'Control Plants':'Transmutation',
  'Control Undead':'Necromancy', 'Control Water':'Transmutation',
  'Control Weather':'Transmutation', 'Control Winds':'Transmutation',
  'Create Food And Water':'Conjuration', 'Create Greater Undead':'Necromancy',
  'Create Undead':'Necromancy', 'Create Water':'Conjuration',
  'Creeping Doom':'Conjuration', 'Crushing Despair':'Enchantment',
  'Crushing Hand':'Evocation', 'Cure Critical Wounds':'Conjuration',
  'Cure Light Wounds':'Conjuration', 'Cure Minor Wounds':'Conjuration',
  'Cure Moderate Wounds':'Conjuration', 'Cure Serious Wounds':'Conjuration',
  'Curse Water':'Necromancy',

  'Dancing Lights':'Evocation', 'Darkness':'Evocation',
  'Darkvision':'Transmutation', 'Daylight':'Evocation', 'Daze':'Enchantment',
  'Daze Monster':'Enchantment', 'Death Knell':'Necromancy',
  'Death Ward':'Necromancy', 'Deathwatch':'Necromancy',
  'Deep Slumber':'Enchantment', 'Deeper Darkness':'Evocation',
  'Delay Poison':'Conjuration', 'Delayed Blast Fireball':'Evocation',
  'Demand':'Enchantment', 'Desecrate':'Evocation', 'Destruction':'Necromancy',
  'Detect Animals Or Plants':'Divination', 'Detect Chaos':'Divination',
  'Detect Evil':'Divination', 'Detect Good':'Divination',
  'Detect Law':'Divination', 'Detect Magic':'Divination',
  'Detect Poison':'Divination', 'Detect Scrying':'Divination',
  'Detect Secret Doors':'Divination', 'Detect Snares And Pits':'Divination',
  'Detect Thoughts':'Divination', 'Detect Undead':'Divination',
  'Dictum':'Evocation', 'Dimension Door':'Conjuration',
  'Dimensional Anchor':'Abjuration', 'Dimensional Lock':'Abjuration',
  'Diminish Plants':'Transmutation', 'Discern Lies':'Divination',
  'Discern Location':'Divination', 'Disguise Self':'Illusion',
  'Disintegrate':'Transmutation', 'Dismissal':'Abjuration',
  'Dispel Chaos':'Abjuration', 'Dispel Evil':'Abjuration',
  'Dispel Good':'Abjuration', 'Dispel Law':'Abjuration',
  'Dispel Magic':'Abjuration', 'Displacement':'Illusion',
  'Disrupt Undead':'Necromancy', 'Disrupting Weapon':'Transmutation',
  'Divination':'Divination', 'Divine Favor':'Evocation',
  'Divine Power':'Evocation', 'Dominate Animal':'Enchantment',
  'Dominate Monster':'Enchantment', 'Dominate Person':'Enchantment',
  'Doom':'Necromancy', 'Dream':'Illusion',

  'Eagle\'s Splendor':'Transmutation', 'Earthquake':'Evocation',
  'Elemental Swarm':'Conjuration', 'Endure Elements':'Abjuration',
  'Energy Drain':'Necromancy', 'Enervation':'Necromancy',
  'Enlarge Person':'Transmutation', 'Entangle':'Transmutation',
  'Enthrall':'Enchantment', 'Entropic Shield':'Abjuration',
  'Erase':'Transmutation', 'Ethereal Jaunt':'Transmutation',
  'Etherealness':'Transmutation', 'Expeditious Retreat':'Transmutation',
  'Explosive Runes':'Abjuration', 'Eyebite':'Necromancy',

  'Fabricate':'Transmutation', 'Faerie Fire':'Evocation',
  'False Life':'Necromancy', 'False Vision':'Illusion', 'Fear':'Necromancy',
  'Feather Fall':'Transmutation', 'Feeblemind':'Enchantment',
  'Find The Path':'Divination', 'Find Traps':'Divination',
  'Finger Of Death':'Necromancy', 'Fire Seeds':'Conjuration',
  'Fire Shield':'Evocation', 'Fire Storm':'Evocation',
  'Fire Trap':'Abjuration', 'Fireball':'Evocation',
  'Flame Arrow':'Transmutation', 'Flame Blade':'Evocation',
  'Flame Strike':'Evocation', 'Flaming Sphere':'Evocation',
  'Flare':'Evocation', 'Flesh To Stone':'Transmutation',
  'Floating Disk':'Evocation', 'Fly':'Transmutation',
  'Fog Cloud':'Conjuration', 'Forbiddance':'Abjuration',
  'Forcecage':'Evocation', 'Forceful Hand':'Evocation',
  'Foresight':'Divination', 'Fox\'s Cunning':'Transmutation',
  'Freedom':'Abjuration', 'Freedom Of Movement':'Abjuration',
  'Freezing Sphere':'Evocation',

  'Gaseous Form':'Transmutation', 'Gate':'Conjuration',
  'Geas/Quest':'Enchantment', 'Gentle Repose':'Necromancy',
  'Ghost Sound':'Illusion', 'Ghoul Touch':'Necromancy',
  'Giant Vermin':'Transmutation', 'Glibness':'Transmutation',
  'Glitterdust':'Conjuration', 'Globe Of Invulnerability':'Abjuration',
  'Glyph Of Warding':'Abjuration', 'Good Hope':'Enchantment',
  'Goodberry':'Transmutation', 'Grasping Hand':'Evocation',
  'Grease':'Conjuration', 'Greater Arcane Sight':'Divination',
  'Greater Command':'Enchantment', 'Greater Dispel Magic':'Abjuration',
  'Greater Glyph Of Warding':'Abjuration', 'Greater Heroism':'Enchantment',
  'Greater Invisibility':'Illusion', 'Greater Magic Fang':'Transmutation',
  'Greater Magic Weapon':'Transmutation', 'Greater Planar Ally':'Conjuration',
  'Greater Planar Binding':'Conjuration', 'Greater Prying Eyes':'Divination',
  'Greater Restoration':'Conjuration', 'Greater Scrying':'Divination',
  'Greater Shadow Conjuration':'Illusion','Greater Shadow Evocation':'Illusion',
  'Greater Shout':'Evocation', 'Greater Spell Immunity':'Abjuration',
  'Greater Teleport':'Conjuration', 'Guards And Wards':'Abjuration',
  'Guidance':'Divination', 'Gust Of Wind':'Evocation',

  'Hallow':'Evocation', 'Hallucinatory Terrain':'Illusion',
  'Halt Undead':'Necromancy', 'Harm':'Necromancy', 'Haste':'Transmutation',
  'Heal':'Conjuration', 'Heal Mount':'Conjuration',
  'Heat Metal':'Transmutation', 'Helping Hand':'Evocation',
  'Heroes\' Feast':'Conjuration', 'Heroism':'Enchantment',
  'Hide From Animals':'Abjuration', 'Hide From Undead':'Abjuration',
  'Hideous Laughter':'Enchantment', 'Hold Animal':'Enchantment',
  'Hold Monster':'Enchantment', 'Hold Person':'Enchantment',
  'Hold Portal':'Abjuration', 'Holy Aura':'Abjuration',
  'Holy Smite':'Evocation', 'Holy Sword':'Evocation', 'Holy Word':'Evocation',
  'Horrid Wilting':'Necromancy', 'Hypnotic Pattern':'Illusion',
  'Hypnotism':'Enchantment',

  'Ice Storm':'Evocation', 'Identify':'Divination',
  'Illusory Script':'Illusion', 'Illusory Wall':'Illusion',
  'Imbue With Spell Ability':'Evocation', 'Implosion':'Evocation',
  'Imprisonment':'Abjuration', 'Incendiary Cloud':'Conjuration',
  'Inflict Critical Wounds':'Necromancy', 'Inflict Light Wounds':'Necromancy',
  'Inflict Minor Wounds':'Necromancy', 'Inflict Moderate Wounds':'Necromancy',
  'Inflict Serious Wounds':'Necromancy', 'Insanity':'Enchantment',
  'Insect Plague':'Conjuration', 'Instant Summons':'Conjuration',
  'Interposing Hand':'Evocation', 'Invisibility':'Illusion',
  'Invisibility Purge':'Evocation', 'Invisibility Sphere':'Illusion',
  'Iron Body':'Transmutation', 'Ironwood':'Transmutation',
  'Irresistible Dance':'Enchantment',

  'Jump':'Transmutation',

  'Keen Edge':'Transmutation', 'Knock':'Transmutation',
  'Know Direction':'Divination',

  'Legend Lore':'Divination', 'Lesser Confusion':'Enchantment',
  'Lesser Geas':'Enchantment', 'Lesser Globe Of Invulnerability':'Abjuration',
  'Lesser Planar Ally':'Conjuration', 'Lesser Planar Binding':'Conjuration',
  'Lesser Restoration':'Conjuration', 'Levitate':'Transmutation',
  'Light':'Evocation', 'Lightning Bolt':'Evocation', 'Limited Wish':'Universal',
  'Liveoak':'Transmutation', 'Locate Creature':'Divination',
  'Locate Object':'Divination', 'Longstrider':'Transmutation',
  'Lullaby':'Enchantment',

  'Mage Armor':'Conjuration', 'Mage Hand':'Transmutation',
  'Mage\'s Disjunction':'Abjuration', 'Mage\'s Faithful Hound':'Conjuration',
  'Mage\'s Lucubration':'Transmutation',
  'Mage\'s Magnificent Mansion':'Conjuration',
  'Mage\'s Private Sanctum':'Abjuration', 'Mage\'s Sword':'Evocation',
  'Magic Aura':'Illusion', 'Magic Circle Against Chaos':'Abjuration',
  'Magic Circle Against Evil':'Abjuration',
  'Magic Circle Against Good':'Abjuration',
  'Magic Circle Against Law':'Abjuration', 'Magic Fang':'Transmutation',
  'Magic Jar':'Necromancy', 'Magic Missile':'Evocation',
  'Magic Mouth':'Illusion', 'Magic Stone':'Transmutation',
  'Magic Vestment':'Transmutation', 'Magic Weapon':'Transmutation',
  'Major Creation':'Conjuration', 'Major Image':'Illusion',
  'Make Whole':'Transmutation', 'Mark Of Justice':'Necromancy',
  'Mass Bear\'s Endurance':'Transmutation',
  'Mass Bull\'s Strength':'Transmutation', 'Mass Cat\'s Grace':'Transmutation',
  'Mass Charm Monster':'Enchantment', 'Mass Cure Critical Wounds':'Conjuration',
  'Mass Cure Light Wounds':'Conjuration',
  'Mass Cure Moderate Wounds':'Conjuration',
  'Mass Cure Serious Wounds':'Conjuration',
  'Mass Eagle\'s Splendor':'Transmutation',
  'Mass Enlarge Person':'Transmutation', 'Mass Fox\'s Cunning':'Transmutation',
  'Mass Heal':'Conjuration', 'Mass Hold Monster':'Enchantment',
  'Mass Hold Person':'Enchantment', 'Mass Inflict Critical Wounds':'Necromancy',
  'Mass Inflict Light Wounds':'Necromancy',
  'Mass Inflict Moderate Wounds':'Necromancy',
  'Mass Inflict Serious Wounds':'Necromancy', 'Mass Invisibility':'Illusion',
  'Mass Owl\'s Wisdom':'Transmutation', 'Mass Reduce Person':'Transmutation',
  'Mass Suggestion':'Enchantment', 'Maze':'Conjuration',
  'Meld Into Stone':'Transmutation', 'Mending':'Transmutation',
  'Message':'Transmutation', 'Meteor Swarm':'Evocation',
  'Mind Blank':'Abjuration', 'Mind Fog':'Enchantment',
  'Minor Creation':'Conjuration', 'Minor Image':'Illusion',
  'Miracle':'Evocation', 'Mirage Arcana':'Illusion', 'Mirror Image':'Illusion',
  'Misdirection':'Illusion', 'Mislead':'Illusion',
  'Mnemonic Enhancer':'Transmutation', 'Modify Memory':'Enchantment',
  'Moment Of Prescience':'Divination', 'Mount':'Conjuration',
  'Move Earth':'Transmutation',

  'Neutralize Poison':'Conjuration', 'Nightmare':'Illusion',
  'Nondetection':'Abjuration',

  'Obscure Object':'Abjuration', 'Obscuring Mist':'Conjuration',
  'Open/Close':'Transmutation', 'Order\'s Wrath':'Evocation',
  'Overland Flight':'Transmutation', 'Owl\'s Wisdom':'Transmutation',

  'Pass Without Trace':'Transmutation', 'Passwall':'Transmutation',
  'Permanency':'Universal', 'Permanent Image':'Illusion',
  'Persistent Image':'Illusion', 'Phantasmal Killer':'Illusion',
  'Phantom Steed':'Conjuration', 'Phantom Trap':'Illusion',
  'Phase Door':'Conjuration', 'Planar Ally':'Conjuration',
  'Planar Binding':'Conjuration', 'Plane Shift':'Conjuration',
  'Plant Growth':'Transmutation', 'Poison':'Necromancy',
  'Polar Ray':'Evocation', 'Polymorph':'Transmutation',
  'Polymorph Any Object':'Transmutation', 'Power Word Blind':'Enchantment',
  'Power Word Kill':'Enchantment', 'Power Word Stun':'Enchantment',
  'Prayer':'Enchantment', 'Prestidigitation':'Universal',
  'Prismatic Sphere':'Abjuration', 'Prismatic Spray':'Evocation',
  'Prismatic Wall':'Abjuration', 'Produce Flame':'Evocation',
  'Programmed Image':'Illusion', 'Project Image':'Illusion',
  'Protection From Arrows':'Abjuration', 'Protection From Chaos':'Abjuration',
  'Protection From Energy':'Abjuration', 'Protection From Evil':'Abjuration',
  'Protection From Good':'Abjuration', 'Protection From Law':'Abjuration',
  'Protection From Spells':'Abjuration', 'Prying Eyes':'Divination',
  'Purify Food And Drink':'Transmutation', 'Pyrotechnics':'Transmutation',

  'Quench':'Transmutation',

  'Rage':'Enchantment', 'Rainbow Pattern':'Illusion',
  'Raise Dead':'Conjuration', 'Ray Of Enfeeblement':'Necromancy',
  'Ray Of Exhaustion':'Necromancy', 'Ray Of Frost':'Evocation',
  'Read Magic':'Divination', 'Reduce Animal':'Transmutation',
  'Reduce Person':'Transmutation', 'Refuge':'Conjuration',
  'Regenerate':'Conjuration', 'Reincarnate':'Transmutation',
  'Remove Blindness/Deafness':'Conjuration', 'Remove Curse':'Abjuration',
  'Remove Disease':'Conjuration', 'Remove Fear':'Abjuration',
  'Remove Paralysis':'Conjuration', 'Repel Metal Or Stone':'Abjuration',
  'Repel Vermin':'Abjuration', 'Repel Wood':'Transmutation',
  'Repulsion':'Abjuration', 'Resilient Sphere':'Evocation',
  'Resist Energy':'Abjuration', 'Resistance':'Abjuration',
  'Restoration':'Conjuration', 'Resurrection':'Conjuration',
  'Reverse Gravity':'Transmutation', 'Righteous Might':'Transmutation',
  'Rope Trick':'Transmutation', 'Rusting Grasp':'Transmutation',

  'Sanctuary':'Abjuration', 'Scare':'Necromancy',
  'Scintillating Pattern':'Illusion', 'Scorching Ray':'Evocation',
  'Screen':'Illusion', 'Scrying':'Divination', 'Sculpt Sound':'Transmutation',
  'Searing Light':'Evocation', 'Secret Chest':'Conjuration',
  'Secret Page':'Transmutation', 'Secure Shelter':'Conjuration',
  'See Invisibility':'Divination', 'Seeming':'Illusion', 'Sending':'Evocation',
  'Sepia Snake Sigil':'Conjuration', 'Sequester':'Abjuration',
  'Shades':'Illusion', 'Shadow Conjuration':'Illusion',
  'Shadow Evocation':'Illusion', 'Shadow Walk':'Illusion',
  'Shambler':'Conjuration', 'Shapechange':'Transmutation',
  'Shatter':'Evocation', 'Shield':'Abjuration', 'Shield Of Faith':'Abjuration',
  'Shield Of Law':'Abjuration', 'Shield Other':'Abjuration',
  'Shillelagh':'Transmutation', 'Shocking Grasp':'Evocation',
  'Shout':'Evocation', 'Shrink Item':'Transmutation', 'Silence':'Illusion',
  'Silent Image':'Illusion', 'Simulacrum':'Illusion',
  'Slay Living':'Necromancy', 'Sleep':'Enchantment',
  'Sleet Storm':'Conjuration', 'Slow':'Transmutation', 'Snare':'Transmutation',
  'Soften Earth And Stone':'Transmutation', 'Solid Fog':'Conjuration',
  'Song Of Discord':'Enchantment', 'Soul Bind':'Necromancy',
  'Sound Burst':'Evocation', 'Speak With Animals':'Divination',
  'Speak With Dead':'Necromancy', 'Speak With Plants':'Divination',
  'Spectral Hand':'Necromancy', 'Spell Immunity':'Abjuration',
  'Spell Resistance':'Abjuration', 'Spell Turning':'Abjuration',
  'Spellstaff':'Transmutation', 'Spider Climb':'Transmutation',
  'Spike Growth':'Transmutation', 'Spike Stones':'Transmutation',
  'Spiritual Weapon':'Evocation', 'Statue':'Transmutation',
  'Status':'Divination', 'Stinking Cloud':'Conjuration',
  'Stone Shape':'Transmutation', 'Stone Tell':'Divination',
  'Stone To Flesh':'Transmutation', 'Stoneskin':'Abjuration',
  'Storm Of Vengeance':'Conjuration', 'Suggestion':'Enchantment',
  'Summon Instrument':'Conjuration', 'Summon Monster I':'Conjuration',
  'Summon Monster II':'Conjuration', 'Summon Monster III':'Conjuration',
  'Summon Monster IV':'Conjuration', 'Summon Monster IX':'Conjuration',
  'Summon Monster V':'Conjuration', 'Summon Monster VI':'Conjuration',
  'Summon Monster VII':'Conjuration', 'Summon Monster VIII':'Conjuration',
  'Summon Nature\'s Ally I':'Conjuration',
  'Summon Nature\'s Ally II':'Conjuration',
  'Summon Nature\'s Ally III':'Conjuration',
  'Summon Nature\'s Ally IV':'Conjuration',
  'Summon Nature\'s Ally IX':'Conjuration',
  'Summon Nature\'s Ally V':'Conjuration',
  'Summon Nature\'s Ally VI':'Conjuration',
  'Summon Nature\'s Ally VII':'Conjuration',
  'Summon Nature\'s Ally VIII':'Conjuration', 'Summon Swarm':'Conjuration',
  'Sunbeam':'Evocation', 'Sunburst':'Evocation', 'Symbol Of Death':'Necromancy',
  'Symbol Of Fear':'Necromancy', 'Symbol Of Insanity':'Enchantment',
  'Symbol Of Pain':'Necromancy', 'Symbol Of Persuasion':'Enchantment',
  'Symbol Of Sleep':'Enchantment', 'Symbol Of Stunning':'Enchantment',
  'Symbol Of Weakness':'Necromancy', 'Sympathetic Vibration':'Evocation',
  'Sympathy':'Enchantment',

  'Telekinesis':'Transmutation', 'Telekinetic Sphere':'Evocation',
  'Telepathic Bond':'Divination', 'Teleport':'Conjuration',
  'Teleport Object':'Conjuration', 'Teleportation Circle':'Conjuration',
  'Temporal Stasis':'Transmutation', 'Time Stop':'Transmutation',
  'Tiny Hut':'Evocation', 'Tongues':'Divination',
  'Touch Of Fatigue':'Necromancy', 'Touch Of Idiocy':'Enchantment',
  'Transformation':'Transmutation', 'Transmute Metal To Wood':'Transmutation',
  'Transmute Mud To Rock':'Transmutation',
  'Transmute Rock To Mud':'Transmutation', 'Transport Via Plants':'Conjuration',
  'Trap The Soul':'Conjuration', 'Tree Shape':'Transmutation',
  'Tree Stride':'Conjuration', 'True Resurrection':'Conjuration',
  'True Seeing':'Divination', 'True Strike':'Divination',

  'Undeath To Death':'Necromancy', 'Undetectable Alignment':'Abjuration',
  'Unhallow':'Evocation', 'Unholy Aura':'Abjuration',
  'Unholy Blight':'Evocation', 'Unseen Servant':'Conjuration',

  'Vampiric Touch':'Necromancy', 'Veil':'Illusion', 'Ventriloquism':'Illusion',
  'Virtue':'Transmutation', 'Vision':'Divination',

  'Wail Of The Banshee':'Necromancy', 'Wall Of Fire':'Evocation',
  'Wall Of Force':'Evocation', 'Wall Of Ice':'Evocation',
  'Wall Of Iron':'Conjuration', 'Wall Of Stone':'Conjuration',
  'Wall Of Thorns':'Conjuration', 'Warp Wood':'Transmutation',
  'Water Breathing':'Transmutation', 'Water Walk':'Transmutation',
  'Waves Of Exhaustion':'Necromancy', 'Waves Of Fatigue':'Necromancy',
  'Web':'Conjuration', 'Weird':'Illusion', 'Whirlwind':'Evocation',
  'Whispering Wind':'Transmutation', 'Wind Walk':'Transmutation',
  'Wind Wall':'Evocation', 'Wish':'Universal', 'Wood Shape':'Transmutation',
  'Word Of Chaos':'Evocation', 'Word Of Recall':'Conjuration',

  'Zone Of Silence':'Illusion', 'Zone Of Truth':'Enchantment'

};
SRD35.strengthMaxLoads = [0,
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 115, 130, 150, 175, 200, 230, 260,
  300, 350, 400, 460, 520, 600, 700, 800, 920, 1040, 1200, 1400
];
// Mapping of medium damage to large/small damage
SRD35.weaponsLargeDamage = {
  'd2':'d3', 'd3':'d4', 'd4':'d6', 'd6':'d8', 'd8':'2d6', 'd10':'2d8',
  'd12':'3d6', '2d4':'2d6', '2d6':'3d6', '2d8':'3d8', '2d10':'4d8'
};
SRD35.weaponsSmallDamage = {
  'd2':'1', 'd3':'d2', 'd4':'d3', 'd6':'d4', 'd8':'d6', 'd10':'d8',
  'd12':'d10', '2d4':'d6', '2d6':'d10', '2d8':'2d6', '2d10':'2d8'
};

/* Defines the rules related to character abilities. */
SRD35.abilityRules = function(rules) {

  // Ability modifier computation
  for(var ability in {'charisma':'', 'constitution':'', 'dexterity':'',
                      'intelligence':'', 'strength':'', 'wisdom':''}) {
    rules.defineRule(ability, ability + 'Adjust', '+', null);
    rules.defineRule
      (ability + 'Modifier', ability, '=', 'Math.floor((source - 10) / 2)');
    rules.defineNote(ability + ':%V (%1)');
    rules.defineRule(ability + '.1', ability + 'Modifier', '=', null);
  }

  // Effects of ability modifiers
  rules.defineRule('combatNotes.constitutionHitPointsAdjustment',
    'constitutionModifier', '=', null,
    'level', '*', null
  );
  rules.defineRule
    ('combatNotes.dexterityArmorClassAdjustment','dexterityModifier','=',null);
  rules.defineRule
    ('combatNotes.dexterityAttackAdjustment', 'dexterityModifier', '=', null);
  rules.defineRule('skillNotes.intelligenceSkillPointsAdjustment',
    'intelligenceModifier', '=', null,
    'level', '*', 'source + 3'
  );
  rules.defineRule
    ('combatNotes.strengthAttackAdjustment', 'strengthModifier', '=', null);
  rules.defineRule
    ('combatNotes.strengthDamageAdjustment', 'strengthModifier', '=', null);
  rules.defineRule('combatNotes.two-HandedWieldDamageAdjustment',
    'shield', '?', 'source == "None"',
    'combatNotes.strengthDamageAdjustment', '=', 'source < 0 ? null : Math.floor(source * 0.5)'
  );
  rules.defineRule
    ('languageCount', 'intelligenceModifier', '+', 'source > 0 ? source : 0');

  // Effects of the notes computed above
  rules.defineRule
    ('armorClass', 'combatNotes.dexterityArmorClassAdjustment', '+', null);
  rules.defineRule
    ('hitPoints', 'combatNotes.constitutionHitPointsAdjustment', '+', null);
  rules.defineRule
    ('meleeAttack', 'combatNotes.strengthAttackAdjustment', '+', null);
  rules.defineRule
    ('rangedAttack', 'combatNotes.dexterityAttackAdjustment', '+', null);
  rules.defineRule
    ('skillPoints', 'skillNotes.intelligenceSkillPointsAdjustment', '+', null);

  // Validation tests
  var notes = [
    'validationNotes.abilityMinimum:' +
      'Requires Charisma >= 14||Constitution >= 14||Dexterity >= 14||' +
      'Intelligence >= 14||Strength >= 14||Wisdom >= 14',
    'validationNotes.abilityModifierSum:Requires ability modifier sum >= 1'
  ];
  rules.defineNote(notes);
  rules.defineRule('validationNotes.abilityMinimum',
    '', '=', '-1',
    /^(charisma|constitution|dexterity|intelligence|strength|wisdom)$/,
    '^', 'source >= 14 ? 0 : null'
  );
  rules.defineRule('validationNotes.abilityModifierSum',
    'charismaModifier', '=', 'source - 1',
    /^(constitution|dexterity|intelligence|strength|wisdom)Modifier$/,
    '+', null,
    '', 'v', '0'
  );

};

/* Defines the rules related to character classes. */
SRD35.classRules = function(rules, classes) {

  rules.defineRule
    ('experienceNeeded', 'level', '=', '1000 * source * (source + 1) / 2');
  rules.defineRule('level',
    'experience', '=', 'Math.floor((1 + Math.sqrt(1 + source / 125)) / 2)'
  );

  rules.defineNote
    ('validationNotes.levelAllocation:%1 available vs. %2 allocated');
  rules.defineRule('validationNotes.levelAllocation.1',
    '', '=', '0',
    'level', '=', null
  );
  rules.defineRule('validationNotes.levelAllocation.2',
    '', '=', '0',
    /^levels\./, '+=', null
  );
  rules.defineRule('validationNotes.levelAllocation',
    'validationNotes.levelAllocation.1', '=', '-source',
    'validationNotes.levelAllocation.2', '+=', null
  );
  rules.defineNote
    ('validationNotes.selectableFeatureAllocation: %1 available vs. %2 allocated');
  rules.defineRule('validationNotes.selectableFeatureAllocation.1',
    '', '=', '0',
    /^selectableFeatureCount\./, '+=', null
  );
  rules.defineRule('validationNotes.selectableFeatureAllocation.2',
    '', '=', '0',
    /^selectableFeatures\./, '+=', null
  );
  rules.defineRule('validationNotes.selectableFeatureAllocation',
    'validationNotes.selectableFeatureAllocation.1', '=', '-source',
    'validationNotes.selectableFeatureAllocation.2', '+=', null
  );

  for(var i = 0; i < classes.length; i++) {

    var baseAttack, feats, features, hitDie, notes, profArmor, profShield,
        profWeapon, saveFortitude, saveReflex, saveWill, selectableFeatures,
        skillPoints, skills, spellAbility, spellsKnown, spellsPerDay;
    var klass = classes[i];
    var klassNoSpace =
      klass.substring(0,1).toLowerCase() + klass.substring(1).replace(/ /g, '');

    if(klass == 'Barbarian') {

      baseAttack = SRD35.ATTACK_BONUS_GOOD;
      feats = null;
      features = [
        '1:Fast Movement', '1:Illiteracy', '1:Rage', '2:Uncanny Dodge',
        '3:Trap Sense', '5:Improved Uncanny Dodge', '7:Damage Reduction',
        '11:Greater Rage', '14:Indomitable Will', '17:Tireless Rage',
        '20:Mighty Rage'
      ];
      hitDie = 12;
      notes = [
        'abilityNotes.fastMovementFeature:+%V speed',
        'combatNotes.greaterRageFeature:+6 strength/constitution, +3 Will',
        'combatNotes.improvedUncannyDodgeFeature:' +
          'Flanked only by rogue four levels higher',
        'combatNotes.mightyRageFeature:+8 strength/constitution, +4 Will',
        'combatNotes.rageFeature:' +
          '+4 strength/constitution, +2 Will, -2 AC %V rd %1/day',
        'combatNotes.tirelessRageFeature:Not fatigued after rage',
        'combatNotes.uncannyDodgeFeature:Always adds dexterity modifier to AC',
        'saveNotes.indomitableWillFeature:' +
          '+4 enchantment resistance during rage',
        'saveNotes.trapSenseFeature:+%V Reflex and AC vs. traps',
        'skillNotes.illiteracyFeature:Must spend 2 skill points to read/write',
        'validationNotes.barbarianClassAlignment:Requires Alignment !~ Lawful'
      ];
      profArmor = SRD35.PROFICIENCY_MEDIUM;
      profShield = SRD35.PROFICIENCY_HEAVY;
      profWeapon = SRD35.PROFICIENCY_MEDIUM;
      saveFortitude = SRD35.SAVE_BONUS_GOOD;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_POOR;
      selectableFeatures = null;
      skillPoints = 4;
      skills = [
        'Climb', 'Craft', 'Handle Animal', 'Intimidate', 'Jump', 'Listen',
        'Ride', 'Survival', 'Swim'
      ];
      spellAbility = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule
        ('abilityNotes.fastMovementFeature', 'levels.Barbarian', '+=', '10');
      rules.defineRule('damageReduction.All',
        'levels.Barbarian', '+=', 'source>=7 ? Math.floor((source-4)/3) : null'
      );
      rules.defineRule('combatNotes.rageFeature',
        'constitutionModifier', '=', '5 + source',
        'features.Greater Rage', '+', '1',
        'features.Mighty Rage', '+', '1'
      );
      rules.defineRule('combatNotes.rageFeature.1',
        'levels.Barbarian', '+=', '1 + Math.floor(source / 4)'
      );
      rules.defineRule('saveNotes.trapSenseFeature',
        'levels.Barbarian', '+=', 'source >= 3 ? Math.floor(source / 3) : null'
      );
      rules.defineRule('skillModifier.Speak Language',
        'skillNotes.illiteracyFeature', '+', '-2'
      );
      rules.defineRule('speed', 'abilityNotes.fastMovementFeature', '+', null);

    } else if(klass == 'Bard') {

      baseAttack = SRD35.ATTACK_BONUS_AVERAGE;
      feats = null;
      features = [
        '1:Bardic Knowledge', '1:Bardic Music', '1:Countersong', '1:Fascinate',
        '1:Inspire Courage', '1:Simple Somatics',
        '1:Weapon Proficiency ' +
          '(Longsword/Rapier/Sap/Short Sword/Short Bow/Whip)',
        '3:Inspire Competence', '6:Suggestion', '9:Inspire Greatness',
        '12:Song Of Freedom', '15:Inspire Heroics', '18:Mass Suggestion'
      ];
      hitDie = 6;
      notes = [
        'featureNotes.bardicMusicFeature:Bardic music effect %V/day',
        'magicNotes.countersongFeature:' +
          "Perform check vs. sonic magic w/in 30' 10 rd",
        'magicNotes.fascinateFeature:' +
          "Hold %V creatures w/in 90' spellbound %1 rd",
        'magicNotes.inspireCompetenceFeature:' +
          '+2 allies skill checks while performing up to 2 minutes',
        'magicNotes.inspireCourageFeature:' +
          '+%V attack/damage/charm/fear saves to allies while performing',
        'magicNotes.inspireGreatnessFeature:' +
           '+2d10 HP, +2 attack, +1 Fortitude save %V allies while performing',
        'magicNotes.inspireHeroicsFeature:' +
          '+4 AC/saves to 1 ally while performing',
        'magicNotes.massSuggestionFeature:' +
          '<i>Suggestion</i> to all fascinated creatures',
        'magicNotes.simpleSomaticsFeature:Reduce armor casting penalty by %V%',
        'magicNotes.songOfFreedomFeature:' +
          '<i>Break Enchantment</i> through performing',
        'magicNotes.suggestionFeature:' +
          '<i>suggestion</i> to 1 fascinated creature',
        'validationNotes.bardClassAlignment:Requires Alignment !~ Lawful'
      ];
      profArmor = SRD35.PROFICIENCY_LIGHT;
      profShield = SRD35.PROFICIENCY_HEAVY;
      profWeapon = SRD35.PROFICIENCY_LIGHT;
      saveFortitude = SRD35.SAVE_BONUS_POOR;
      saveReflex = SRD35.SAVE_BONUS_GOOD;
      saveWill = SRD35.SAVE_BONUS_GOOD;
      selectableFeatures = null;
      skillPoints = 6;
      skills = [
        'Appraise', 'Balance', 'Bluff', 'Climb', 'Concentration',
        'Craft', 'Decipher Script', 'Diplomacy', 'Disguise', 'Escape Artist',
        'Gather Information', 'Hide', 'Jump', 'Knowledge', 'Listen',
        'Move Silently', 'Perform', 'Profession', 'Sense Motive',
        'Sleight Of Hand', 'Speak Language', 'Spellcraft', 'Swim', 'Tumble',
        'Use Magic Device'
      ];
      spellAbility = 'charisma';
      spellsKnown = [
        'B0:1:4/2:5/3:6',
        'B1:2:1/3:2/5:3/16:4',
        'B2:4:1/5:2/7:3/17:4',
        'B3:7:1/8:2/10:3/18:4',
        'B4:10:1/11:2/13:3/19:4',
        'B5:13:1/14:2/16:3/20:4',
        'B6:16:1/17:2/19:3'
      ];
      spellsPerDay = [
        'B0:1:2/2:3/14:4',
        'B1:2:0/3:1/4:2/5:3/15:4',
        'B2:4:0/5:1/6:2/8:3/16:4',
        'B3:7:0/8:1/9:2/11:3/17:4',
        'B4:10:0/11:1/12:2/14:3/18:4',
        'B5:13:0/14:1/15:2/17:3/19:4',
        'B6:16:0/17:1/18:2/19:3/20:4'
      ];
      rules.defineRule('casterLevelArcane', 'levels.Bard', '+=', null);
      rules.defineRule
        ('classSkills.Bardic Knowledge', 'features.Bardic Knowledge', '=', '1');
      rules.defineRule
        ('featureNotes.bardicMusicFeature', 'levels.Bard', '=', null);
      rules.defineRule('features.Countersong',
        'maxSkillModifier.Perform', '?', 'source >= 3'
      );
      rules.defineRule('features.Fascinate',
        'maxSkillModifier.Perform', '?', 'source >= 3'
      );
      rules.defineRule('features.Inspire Competence',
        'maxSkillModifier.Perform', '?', 'source >= 6'
      );
      rules.defineRule('features.Inspire Courage',
        'maxSkillModifier.Perform', '?', 'source >= 3'
      );
      rules.defineRule('features.Inspire Greatness',
        'maxSkillModifier.Perform', '?', 'source >= 12'
      );
      rules.defineRule('features.Inspire Heroics',
        'maxSkillModifier.Perform', '?', 'source >= 18'
      );
      rules.defineRule('features.Mass Suggestion',
        'maxSkillModifier.Perform', '?', 'source >= 21'
      );
      rules.defineRule('features.Song Of Freedom',
        'maxSkillModifier.Perform', '?', 'source >= 15'
      );
      rules.defineRule('features.Suggestion',
        'maxSkillModifier.Perform', '?', 'source >= 9'
      );
      rules.defineRule('magicNotes.simpleSomaticsFeature',
        'armor', '=', 'source.match(/Padded|Leather|Chain Shirt/) ? ' +
        'SRD35.armorsArcaneSpellFailurePercentages[source] : null'
      );
      rules.defineRule('magicNotes.arcaneSpellFailure',
        'magicNotes.simpleSomaticsFeature', '+', '-source'
      );
      rules.defineRule('magicNotes.fascinateFeature',
        'levels.Bard', '+=', 'Math.floor((source + 2) / 3)'
      );
      rules.defineRule
        ('magicNotes.fascinateFeature.1', 'levels.Bard', '+=', null);
      rules.defineRule('magicNotes.inspireCourageFeature',
        'levels.Bard', '+=', 'source >= 8 ? Math.floor((source + 4) / 6) : 1'
      );
      rules.defineRule('magicNotes.inspireGreatnessFeature',
        'levels.Bard', '+=', 'source >= 9 ? Math.floor((source - 6) / 3) : null'
      );
      rules.defineRule
        ('maxSkillModifier.Perform', /^skillModifier.Perform/, '^=', null);
      rules.defineRule('skillModifier.Bardic Knowledge',
        'skills.Bardic Knowledge', '=', null,
        'levels.Bard', '+', null,
        'intelligenceModifier', '+', null
      );
      rules.defineRule
        ('skills.Bardic Knowledge', 'features.Bardic Knowledge', '=', '0');

    } else if(klass == 'Cleric') {

      baseAttack = SRD35.ATTACK_BONUS_AVERAGE;
      feats = null;
      features = ['1:Aura', '1:Spontaneous Cleric Spell', '1:Turn Undead'];
      hitDie = 8;
      notes = [
        'combatNotes.turnUndeadFeature:' +
          'Turn (good) or rebuke (evil) undead creatures',
        'magicNotes.auraFeature:' +
          'Visible to <i>Detect Chaos/Evil/Good/Law</i> depending on ' +
          'deity\'s alignment',
        'magicNotes.spontaneousClericSpellFeature:%V'
      ];
      profArmor = SRD35.PROFICIENCY_HEAVY;
      profShield = SRD35.PROFICIENCY_HEAVY;
      profWeapon = SRD35.PROFICIENCY_LIGHT;
      saveFortitude = SRD35.SAVE_BONUS_GOOD;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_GOOD;
      selectableFeatures = null;
      spellAbility = 'wisdom';
      spellsKnown = [
        'C0:1:"all"', 'C1:1:"all"', 'C2:3:"all"', 'C3:5:"all"',
        'C4:7:"all"', 'C5:9:"all"', 'C6:11:"all"', 'C7:13:"all"',
        'C8:15:"all"', 'C9:17:"all"',
        'Dom1:1:"all"', 'Dom2:3:"all"', 'Dom3:5:"all"', 'Dom4:7:"all"',
        'Dom5:9:"all"', 'Dom6:11:"all"', 'Dom7:13:"all"', 'Dom8:15:"all"',
        'Dom9:17:"all"'
      ];
      spellsPerDay = [
        'C0:1:3/2:4/4:5/7:6',
        'C1:1:1/2:2/4:3/7:4/11:5',
        'C2:3:1/4:2/6:3/9:4/13:5',
        'C3:5:1/6:2/8:3/11:4/15:5',
        'C4:7:1/8:2/10:3/13:4/17:5',
        'C5:9:1/10:2/12:3/15:4/19:5',
        'C6:11:1/12:2/14:3/17:4',
        'C7:13:1/14:2/16:3/19:4',
        'C8:15:1/16:2/18:3/20:4',
        'C9:17:1/18:2/19:3/20:4'
      ];
      skillPoints = 2;
      skills = [
        'Concentration', 'Craft', 'Diplomacy', 'Heal', 'Knowledge (Arcana)',
        'Knowledge (History)', 'Knowledge (Planes)', 'Knowledge (Religion)',
        'Profession', 'Spellcraft'
      ];
      rules.defineRule('casterLevelDivine', 'levels.Cleric', '+=', null);
      rules.defineRule('domainCount', 'levels.Cleric', '+=', '2');
      rules.defineRule('magicNotes.spontaneousClericSpellFeature',
        'alignment', '=', 'source.match(/Evil/) ? "Inflict" : "Heal"'
      );
      for(var j = 1; j < 10; j++) {
        rules.defineRule('spellsPerDay.Dom' + j,
          'levels.Cleric', '=',
          'source >= ' + (j * 2 - 1) + ' ? 1 : null');
      }
      rules.defineRule('turnUndead.level', 'levels.Cleric', '+=', null);
      rules.defineRule('turningLevel', 'turnUndead.level', '^=', null);

    } else if(klass == 'Druid') {

      baseAttack = SRD35.ATTACK_BONUS_AVERAGE;
      feats = null;
      features = [
        '1:Animal Companion', '1:Nature Sense', '1:Spontaneous Druid Spell',
        '1:Wild Empathy',
        '1:Weapon Proficiency ' +
          '(Club/Dagger/Dart/Quarterstaff/Scimitar/Sickle/Short Spear/Sling/Spear)',
        '2:Woodland Stride', '3:Trackless Step', '4:Resist Nature\'s Lure',
        '5:Wild Shape', '9:Venom Immunity', '13:Thousand Faces',
        '15:Timeless Body', '16:Elemental Shape'
      ];
      hitDie = 8;
      notes = [
        'featureNotes.animalCompanionFeature:Special bond/abilities',
        'featureNotes.timelessBodyFeature:No aging penalties',
        'featureNotes.tracklessStepFeature:Untrackable outdoors',
        'featureNotes.woodlandStrideFeature:' +
          'Normal movement through undergrowth',
        'magicNotes.elementalShapeFeature:Wild Shape to elemental %V/day',
        'magicNotes.spontaneousDruidSpellFeature:' +
          '<i>Summon Nature\'s Ally</i>',
        'magicNotes.thousandFacesFeature:<i>Alter Self</i> at will',
        'magicNotes.wildShapeFeature:' +
          'Change into creature of size %V %1 hours %2/day',
        'saveNotes.resistNature\'sLureFeature:+4 vs. spells of feys',
        'saveNotes.venomImmunityFeature:Immune to poisons',
        'skillNotes.natureSenseFeature:+2 Knowledge (Nature)/Survival',
        'skillNotes.wildEmpathyFeature:+%V Diplomacy (animals)',
        'validationNotes.druidClassAlignment:Requires Alignment =~ Neutral',
        'validationNotes.druidClassArmor:' +
          'Requires Armor =~ None|Hide|Leather|Padded',
        'validationNotes.druidClassShield:Requires Shield =~ None|Wooden'
      ];
      profArmor = SRD35.PROFICIENCY_MEDIUM;
      profShield = SRD35.PROFICIENCY_HEAVY;
      profWeapon = SRD35.PROFICIENCY_NONE;
      saveFortitude = SRD35.SAVE_BONUS_GOOD;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_GOOD;
      selectableFeatures = null;
      skillPoints = 4;
      skills = [
        'Concentration', 'Craft', 'Diplomacy', 'Handle Animal', 'Heal',
        'Knowledge (Nature)', 'Listen', 'Profession', 'Ride', 'Spellcraft',
        'Spot', 'Survival', 'Swim'
      ];
      spellAbility = 'wisdom';
      spellsKnown = [
        'D0:1:"all"', 'D1:1:"all"', 'D2:3:"all"', 'D3:5:"all"',
        'D4:7:"all"', 'D5:9:"all"', 'D6:11:"all"', 'D7:13:"all"',
        'D8:15:"all"', 'D9:17:"all"'
      ];
      spellsPerDay = [
        'D0:1:3/2:4/4:5/7:6',
        'D1:1:1/2:2/4:3/7:4/11:5',
        'D2:3:1/4:2/6:3/9:4/13:5',
        'D3:5:1/6:2/8:3/11:4/15:5',
        'D4:7:1/8:2/10:3/13:4/17:5',
        'D5:9:1/10:2/12:3/15:4/19:5',
        'D6:11:1/12:2/14:3/17:4',
        'D7:13:1/14:2/16:3/19:4',
        'D8:15:1/16:2/18:3/20:4',
        'D9:17:1/18:2/19:3/20:4'
      ];
      rules.defineRule
        ('companionMasterLevel', 'levels.Druid', '+=', null);
      rules.defineRule('casterLevelDivine', 'levels.Druid', '+=', null);
      rules.defineRule('languageCount', 'levels.Druid', '+', '1');
      rules.defineRule('languages.Druidic', 'levels.Druid', '=', '1');
      rules.defineRule('magicNotes.elementalShapeFeature',
        'levels.Druid', '=', 'source < 16 ? null : Math.floor((source-14) / 2)'
      );
      rules.defineRule('magicNotes.wildShapeFeature',
        'levels.Druid', '=',
          'source < 5 ? null : ' +
          'source < 8 ? "small-medium" : ' +
          'source < 11 ? "small-large" : ' +
          'source == 11 ? "tiny-large" : ' +
          'source < 15 ? "tiny-large/plant" : "tiny-huge/plant"'
      );
      rules.defineRule
        ('magicNotes.wildShapeFeature.1', 'levels.Druid', '=', null);
      rules.defineRule('magicNotes.wildShapeFeature.2',
        'levels.Druid', '=',
           'source < 5 ? null : ' +
           'source == 5 ? 1 : ' +
           'source == 6 ? 2 : ' +
           'source < 10 ? 3 : ' +
           'source < 14 ? 4 : ' +
           'source < 18 ? 5 : 6'
      );
      rules.defineRule('skillNotes.wildEmpathyFeature',
        'levels.Druid', '+=', null,
        'charismaModifier', '+', null
      );

    } else if(klass == 'Fighter') {

      baseAttack = SRD35.ATTACK_BONUS_GOOD;
      feats = null;
      features = null;
      hitDie = 10;
      notes = null;
      profArmor = SRD35.PROFICIENCY_HEAVY;
      profShield = SRD35.PROFICIENCY_TOWER;
      profWeapon = SRD35.PROFICIENCY_MEDIUM;
      saveFortitude = SRD35.SAVE_BONUS_GOOD;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_POOR;
      selectableFeatures = null;
      skillPoints = 2;
      skills = [
        'Climb', 'Craft', 'Handle Animal', 'Intimidate', 'Jump', 'Ride', 'Swim'
      ];
      spellAbility = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule('featCount.Fighter',
        'levels.Fighter', '=', '1 + Math.floor(source / 2)'
      );

    } else if(klass == 'Monk') {

      baseAttack = SRD35.ATTACK_BONUS_AVERAGE;
      feats = null;
      features = [
        '1:Flurry Of Blows', '1:Improved Unarmed Strike',
        '1:Weapon Proficiency ' +
          '(Club/Dagger/Handaxe/Heavy Crossbow/Javelin/Kama/Light Crossbow/Nunchaku/Quarterstaff/Sai/Shuriken/Siangham/Sling)',
        '2:Evasion', '3:Fast Movement', '3:Still Mind', '4:Ki Strike',
        '4:Slow Fall', '5:Purity Of Body', '7:Wholeness Of Body',
        '9:Improved Evasion', '10:Lawful Ki Strike', '11:Diamond Body',
        '11:Greater Flurry', '12:Abundant Step', '13:Diamond Soul',
        '15:Quivering Palm', '16:Adamantine Ki Strike', '17:Timeless Body',
        '17:Tongue Of The Sun And Moon', '19:Empty Body', '20:Perfect Self'
      ];
      hitDie = 8;
      notes = [
        'abilityNotes.fastMovementFeature:+%V speed',
        'combatNotes.adamantineKiStrikeFeature:' +
          'Treat unarmed as adamantine weapon',
        'combatNotes.flurryOfBlowsFeature:Take %V penalty for extra attack',
        'combatNotes.greaterFlurryFeature:Extra attack',
        'combatNotes.improvedUnarmedStrikeFeature:' +
          'No AOO on unarmed attack, may deal lethal damage',
        'combatNotes.kiStrikeFeature:Treat unarmed as magic weapon',
        'combatNotes.lawfulKiStrikeFeature:Treat unarmed as lawful weapon',
        'combatNotes.perfectSelfFeature:' +
          'Ignore first 10 points of non-magical damage',
        'combatNotes.quiveringPalmFeature:' +
          'Foe makes DC %V Fortitude save or dies 1/week',
        'featureNotes.timelessBodyFeature:No aging penalties',
        'featureNotes.tongueOfTheSunAndMoonFeature:Speak w/any living creature',
        'magicNotes.abundantStepFeature:' +
          '<i>Dimension Door</i> at level %V 1/day',
        'magicNotes.emptyBodyFeature:<i>Etherealness</i> %V rd/day',
        'magicNotes.wholenessOfBodyFeature:Heal %V HP to self/day',
        'sanityNotes.monkClassArmor:Implies Armor == "None"',
        'sanityNotes.monkClassShield:Implies Shield == "None"',
        'saveNotes.diamondBodyFeature:Immune to poison',
        'saveNotes.diamondSoulFeature:DC %V spell resistance',
        'saveNotes.evasionFeature:Reflex save yields no damage instead of 1/2',
        'saveNotes.improvedEvasionFeature:Failed save yields 1/2 damage',
        'saveNotes.perfectSelfFeature:Treat as outsider for magic saves',
        'saveNotes.purityOfBodyFeature:Immune to normal disease',
        'saveNotes.slowFallFeature:' +
          "Subtract %V' from falling damage distance",
        'saveNotes.stillMindFeature:+2 vs. enchantment',
        'validationNotes.combatReflexesSelectableFeatureLevels:' +
           'Requires Monk >= 2',
        'validationNotes.deflectArrowsSelectableFeatureLevels:' +
           'Requires Monk >= 2',
        'validationNotes.improvedDisarmSelectableFeatureLevels:' +
           'Requires Monk >= 6',
        'validationNotes.improvedGrappleSelectableFeatureLevels:' +
           'Requires Monk >= 1',
        'validationNotes.improvedTripSelectableFeatureLevels:' +
           'Requires Monk >= 6',
        'validationNotes.monkClassAlignment:Requires Alignment =~ Lawful',
        'validationNotes.stunningFistSelectableFeatureLevels:Requires Monk >= 1'
      ];
      profArmor = SRD35.PROFICIENCY_NONE;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon = SRD35.PROFICIENCY_NONE;
      saveFortitude = SRD35.SAVE_BONUS_GOOD;
      saveReflex = SRD35.SAVE_BONUS_GOOD;
      saveWill = SRD35.SAVE_BONUS_GOOD;
      selectableFeatures = [
        'Combat Reflexes', 'Deflect Arrows', 'Improved Disarm',
        'Improved Grapple', 'Improved Trip', 'Stunning Fist'
      ];
      skillPoints = 4;
      skills = [
        'Balance', 'Climb', 'Concentration', 'Craft', 'Diplomacy',
        'Escape Artist', 'Hide', 'Jump', 'Knowledge (Arcana)',
        'Knowledge (Religion)', 'Listen', 'Move Silently', 'Perform',
        'Profession', 'Sense Motive', 'Spot', 'Swim', 'Tumble'
      ];
      spellAbility = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule('abilityNotes.fastMovementFeature',
        'levels.Monk', '+=', '10 * Math.floor(source / 3)'
      );
      rules.defineRule
        ('armorClass', 'combatNotes.monkArmorClassAdjustment', '+', null);
      rules.defineRule('combatNotes.flurryOfBlowsFeature',
        'levels.Monk', '=', 'source < 5 ? -2 : source < 9 ? -1 : 0'
      );
      rules.defineRule('combatNotes.monkArmorClassAdjustment',
        'levels.Monk', '+=', 'source >= 5 ? Math.floor(source / 5) : null',
        'wisdomModifier', '+', 'source > 0 ? source : null'
      );
      rules.defineRule('combatNotes.quiveringPalmFeature',
        'levels.Monk', '+=', '10 + Math.floor(source / 2)',
        'wisdomModifier', '+', null
      );
      rules.defineRule('combatNotes.stunningFistFeature.1',
        'levels.Monk', '+=', 'source - Math.floor(source / 4)'
      );
      rules.defineRule('magicNotes.abundantStepFeature',
        'levels.Monk', '+=', 'Math.floor(source / 2)'
      );
      rules.defineRule
        ('magicNotes.emptyBodyFeature', 'levels.Monk', '+=', null);
      rules.defineRule
        ('magicNotes.wholenessOfBodyFeature', 'levels.Monk', '+=', '2*source');
      rules.defineRule
        ('resistance.Enchantment', 'saveNotes.stillMindFeature', '+=', '2');
      rules.defineRule
        ('resistance.Spell', 'saveNotes.diamondSoulFeature', '+=', null);
      rules.defineRule
        ('saveNotes.diamondSoulFeature', 'levels.Monk', '+=', '10 + source');
      rules.defineRule('saveNotes.slowFallFeature',
        'levels.Monk', '=',
        'source < 4 ? null : source < 20 ? Math.floor(source / 2) * 10 : "all"'
      );
      rules.defineRule('selectableFeatureCount.Monk',
        'levels.Monk', '=', 'source < 2 ? 1 : source < 6 ? 2 : 3'
      );
      rules.defineRule('speed', 'abilityNotes.fastMovementFeature', '+', null);
      rules.defineRule('monkUnarmedDamage',
        'levels.Monk', '=',
        'source < 12 ? ("d" + (6 + Math.floor(source / 4) * 2)) : ' +
        '              ("2d" + (6 + Math.floor((source - 12) / 4) * 2))'
      );

    } else if(klass == 'Paladin') {

      baseAttack = SRD35.ATTACK_BONUS_GOOD;
      feats = null;
      features = [
        '1:Aura Of Good', '1:Detect Evil', '1:Smite Evil', '2:Divine Grace',
        '2:Lay On Hands', '3:Aura Of Courage', '3:Divine Health',
        '4:Turn Undead', '5:Special Mount', '6:Remove Disease'
      ];
      hitDie = 10;
      notes = [
        'combatNotes.smiteEvilFeature:' +
          '+%V attack/+%1 damage vs. evil foe %2/day',
        'combatNotes.turnUndeadFeature:' +
          'Turn (good) or rebuke (evil) undead creatures',
        'featureNotes.specialMountFeature:Magical mount w/special abilities',
        'magicNotes.auraOfGoodFeature:Visible to <i>Detect Good</i>',
        'magicNotes.detectEvilFeature:<i>Detect Evil</i> at will',
        'magicNotes.layOnHandsFeature:Harm undead or heal %V HP/day',
        'magicNotes.removeDiseaseFeature:<i>Remove Disease</i> %V/week',
        "saveNotes.auraOfCourageFeature:Immune fear, +4 to allies w/in 30'",
        'saveNotes.divineGraceFeature:+%V all saves',
        'saveNotes.divineHealthFeature:Immune to disease',
        'validationNotes.paladinClassAlignment:' +
          'Requires Alignment == "Lawful Good"'
      ];
      profArmor = SRD35.PROFICIENCY_HEAVY;
      profShield = SRD35.PROFICIENCY_HEAVY;
      profWeapon = SRD35.PROFICIENCY_MEDIUM;
      saveFortitude = SRD35.SAVE_BONUS_GOOD;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_POOR;
      selectableFeatures = null;
      skillPoints = 2;
      skills = [
        'Concentration', 'Craft', 'Diplomacy', 'Handle Animal', 'Heal',
        'Knowledge (Nobility)', 'Knowledge (Religion)', 'Profession', 'Ride',
        'Sense Motive'
      ];
      spellAbility = 'wisdom';
      spellsKnown = [
        'P1:4:"all"', 'P2:8:"all"', 'P3:11:"all"', 'P4:14:"all"'
      ];
      spellsPerDay = [
        'P1:4:0/6:1/14:2/18:3',
        'P2:8:0/10:1/16:2/19:3',
        'P3:11:0/12:1/17:2/19:3',
        'P4:14:0/15:1/19:2/20:3'
      ];
      rules.defineRule('casterLevelDivine',
        'levels.Paladin', '+=', 'source < 4 ? null : Math.floor(source / 2)'
      );
      rules.defineRule('combatNotes.smiteEvilFeature',
        'charismaModifier', '=', 'source > 0 ? source : 0'
      );
      rules.defineRule
        ('combatNotes.smiteEvilFeature.1', 'levels.Paladin', '=', null);
      rules.defineRule('combatNotes.smiteEvilFeature.2',
        'levels.Paladin', '=', '1 + Math.floor(source / 5)'
      );
      rules.defineRule('magicNotes.layOnHandsFeature',
        'levels.Paladin', '+=', null,
        'charismaModifier', '*', null,
        'charisma', '?', 'source >= 12'
      );
      rules.defineRule('magicNotes.removeDiseaseFeature',
        'levels.Paladin', '+=', 'Math.floor((source - 3) / 3)'
      );
      rules.defineRule('mountMasterLevel', 'levels.Paladin', '=', null);
      rules.defineRule
        ('save.Fortitude', 'saveNotes.divineGraceFeature', '+', null);
      rules.defineRule
        ('save.Reflex', 'saveNotes.divineGraceFeature', '+', null);
      rules.defineRule('save.Will', 'saveNotes.divineGraceFeature', '+', null);
      rules.defineRule
        ('saveNotes.divineGraceFeature', 'charismaModifier', '=', null);
      rules.defineRule('turnUndead.level',
        'levels.Paladin', '+=', 'source > 3 ? source - 3 : null'
      );
      rules.defineRule('turningLevel', 'turnUndead.level', '^=', null);

    } else if(klass == 'Ranger') {

      baseAttack = SRD35.ATTACK_BONUS_GOOD;
      feats = null;
      features = [
        '1:Favored Enemy', '1:Track', '1:Wild Empathy', '2:Rapid Shot',
        '2:Two-Weapon Fighting', '3:Endurance', '4:Animal Companion',
        '6:Manyshot', '6:Improved Two-Weapon Fighting', '7:Woodland Stride',
        '8:Swift Tracker', '9:Evasion', '11:Improved Precise Shot',
        '11:Greater Two-Weapon Fighting', '13:Camouflage',
        '17:Hide In Plain Sight'
      ];
      hitDie = 8;
      notes = [
        'combatNotes.favoredEnemyFeature:' +
          '+2 or more damage vs. %V type(s) of creatures',
        'combatNotes.greaterTwo-WeaponFightingFeature:' +
          'Third off-hand -10 attack',
        'combatNotes.improvedPreciseShotFeature:' +
          'No foe AC bonus for partial concealment, attack grappling target',
        'combatNotes.improvedTwo-WeaponFightingFeature:' +
          'Second off-hand -5 attack',
        'combatNotes.manyshotFeature:' +
          'Fire up to %V arrows simultaneously at -2 attack',
        'combatNotes.rapidShotFeature:Normal and extra ranged -2 attacks',
        'combatNotes.two-WeaponFightingFeature:' +
          'Reduce on-hand penalty by 2, off-hand by 6',
        'featureNotes.animalCompanionFeature:Special bond/abilities',
        'featureNotes.woodlandStrideFeature:' +
          'Normal movement through undergrowth',
        'saveNotes.enduranceFeature:+4 extended physical action',
        'saveNotes.evasionFeature:Reflex save yields no damage instead of 1/2',
        'skillNotes.camouflageFeature:Hide in any natural terrain',
        'skillNotes.favoredEnemyFeature:' +
          '+2 or more Bluff/Listen/Sense Motive/Spot/Survival ' +
          'vs. %V type(s) of creatures',
        'skillNotes.hideInPlainSightFeature:Hide even when observed',
        'skillNotes.swiftTrackerFeature:Track at full speed',
        'skillNotes.trackFeature:Survival to follow creatures\' trail',
        'skillNotes.wildEmpathyFeature:+%V Diplomacy (animals)'
      ];
      profArmor = SRD35.PROFICIENCY_LIGHT;
      profShield = SRD35.PROFICIENCY_HEAVY;
      profWeapon = SRD35.PROFICIENCY_MEDIUM;
      saveFortitude = SRD35.SAVE_BONUS_GOOD;
      saveReflex = SRD35.SAVE_BONUS_GOOD;
      saveWill = SRD35.SAVE_BONUS_POOR;
      selectableFeatures = [
        'Combat Style (Archery)', 'Combat Style (Two-Weapon Combat)'
      ];
      skillPoints = 6;
      skills = [
        'Climb', 'Concentration', 'Craft', 'Handle Animal', 'Heal', 'Hide',
        'Jump', 'Knowledge (Dungeoneering)', 'Knowledge (Geography)',
        'Knowledge (Nature)', 'Listen', 'Move Silently', 'Profession', 'Ride',
        'Search', 'Spot', 'Survival', 'Swim', 'Use Rope'
      ];
      spellAbility = 'wisdom';
      spellsKnown = [
        'R1:4:"all"', 'R2:8:"all"', 'R3:11:"all"', 'R4:14:"all"'
      ];
      spellsPerDay = [
        'R1:4:0/6:1/14:2/18:3',
        'R2:8:0/10:1/16:2/19:3',
        'R3:11:0/12:1/17:2/19:3',
        'R4:14:0/15:1/19:2/20:3'
      ];
      rules.defineRule('companionMasterLevel',
        'levels.Ranger', '+=', 'source < 4 ? null : Math.floor(source / 2)'
      );
      rules.defineRule('casterLevelDivine',
        'levels.Ranger', '+=', 'source < 4 ? null : Math.floor(source / 2)'
      );
      rules.defineRule('combatNotes.favoredEnemyFeature',
        'levels.Ranger', '+=', '1 + Math.floor(source / 5)'
      );
      rules.defineRule('combatNotes.manyshotFeature',
        'baseAttack', '=', 'Math.floor((source + 9) / 5)'
      );
      rules.defineRule('rangerFeatures.Rapid Shot',
        'rangerFeatures.Combat Style (Archery)', '?', null
      );
      rules.defineRule('rangerFeatures.Manyshot',
        'rangerFeatures.Combat Style (Archery)', '?', null
      );
      rules.defineRule('rangerFeatures.Improved Precise Shot',
        'rangerFeatures.Combat Style (Archery)', '?', null
      );
      rules.defineRule('rangerFeatures.Two-Weapon Fighting',
        'rangerFeatures.Combat Style (Two-Weapon Combat)', '?', null
      );
      rules.defineRule('rangerFeatures.Improved Two-Weapon Fighting',
        'rangerFeatures.Combat Style (Two-Weapon Combat)', '?', null
      );
      rules.defineRule('rangerFeatures.Greater Two-Weapon Fighting',
        'rangerFeatures.Combat Style (Two-Weapon Combat)', '?', null
      );
      rules.defineRule('selectableFeatureCount.Ranger',
        'levels.Ranger', '=', 'source >= 2 ? 1 : null'
      );
      rules.defineRule('skillNotes.favoredEnemyFeature',
        'levels.Ranger', '+=', '1 + Math.floor(source / 5)'
      );
      rules.defineRule('skillNotes.wildEmpathyFeature',
        'levels.Ranger', '+=', null,
        'charismaModifier', '+', null
      );

    } else if(klass == 'Rogue') {

      baseAttack = SRD35.ATTACK_BONUS_AVERAGE;
      feats = null;
      features = [
        '1:Sneak Attack', '1:Trapfinding',
        '1:Weapon Proficiency (Hand Crossbow/Rapier/Shortbow/Short Sword)',
        '2:Evasion', '3:Trap Sense', '4:Uncanny Dodge',
        '8:Improved Uncanny Dodge'
      ];
      hitDie = 6;
      notes = [
        'combatNotes.cripplingStrikeFeature: ' +
          '2 points strength damage from sneak attack',
        'combatNotes.defensiveRollFeature:' +
          'DC damage Reflex save vs. lethal blow for half damage',
        'combatNotes.improvedUncannyDodgeFeature:' +
          'Flanked only by rogue four levels higher',
        'combatNotes.opportunistFeature:AOO vs. foe struck by ally',
        'combatNotes.sneakAttackFeature:' +
          '%Vd6 HP extra when surprising or flanking',
        'combatNotes.uncannyDodgeFeature:Always adds dexterity modifier to AC',
        'saveNotes.evasionFeature:Reflex save yields no damage instead of 1/2',
        'saveNotes.improvedEvasionFeature:Failed save yields 1/2 damage',
        'saveNotes.slipperyMindFeature:Second save vs. enchantment',
        'saveNotes.trapSenseFeature:+%V Reflex and AC vs. traps',
        'skillNotes.skillMasteryFeature:' +
          'Take 10 despite distraction on %V chosen skills',
        'skillNotes.trapfindingFeature:' +
          'Use Search/Disable Device to find/remove DC 20+ traps'
      ];
      profArmor = SRD35.PROFICIENCY_LIGHT;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon = SRD35.PROFICIENCY_LIGHT;
      saveFortitude = SRD35.SAVE_BONUS_POOR;
      saveReflex = SRD35.SAVE_BONUS_GOOD;
      saveWill = SRD35.SAVE_BONUS_POOR;
      selectableFeatures = [
        'Crippling Strike', 'Defensive Roll', 'Feat Bonus', 'Improved Evasion',
        'Opportunist', 'Skill Mastery', 'Slippery Mind'
      ];
      skillPoints = 8;
      skills = [
        'Appraise', 'Balance', 'Bluff', 'Climb', 'Craft', 'Decipher Script',
        'Diplomacy', 'Disable Device', 'Disguise', 'Escape Artist', 'Forgery',
        'Gather Information', 'Hide', 'Intimidate', 'Jump',
        'Knowledge (Local)', 'Listen', 'Move Silently', 'Open Lock',
        'Perform', 'Profession', 'Search', 'Sense Motive', 'Sleight Of Hand',
        'Spot', 'Swim', 'Tumble', 'Use Magic Device', 'Use Rope'
      ];
      spellAbility = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule('combatNotes.sneakAttackFeature',
        'levels.Rogue', '+=', 'Math.floor((source + 1) / 2)'
      );
      rules.defineRule
        ('featCount.General', 'features.Feat Bonus', '+=', 'null');
      rules.defineRule('saveNotes.trapSenseFeature',
        'levels.Rogue', '+=', 'source >= 3 ? Math.floor(source / 3) : null'
      );
      rules.defineRule('selectableFeatureCount.Rogue',
        'levels.Rogue', '+=', 'source>=10 ? Math.floor((source-7)/3) : null'
      );
      rules.defineRule('skillNotes.skillMasteryFeature',
        'intelligenceModifier', '=', 'source + 3',
        'rogueFeatures.Skill Mastery', '*', null
      );

    } else if(klass == 'Sorcerer') {

      baseAttack = SRD35.ATTACK_BONUS_POOR;
      feats = null;
      features = ['1:Familiar'];
      hitDie = 4;
      notes = [
        'featureNotes.familiarFeature:Special bond/abilities'
      ];
      profArmor = SRD35.PROFICIENCY_NONE;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon = SRD35.PROFICIENCY_LIGHT;
      saveFortitude = SRD35.SAVE_BONUS_POOR;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_GOOD;
      selectableFeatures = null;
      skillPoints = 2;
      skills = [
        'Bluff', 'Concentration', 'Craft', 'Knowledge (Arcana)', 'Profession',
        'Spellcraft'
      ];
      spellAbility = 'charisma';
      spellsKnown = [
        'S0:1:4/2:5/4:6/6:7/8:8/10:9',
        'S1:1:2/3:3/5:4/7:5',
        'S2:4:1/5:2/7:3/9:4/11:5',
        'S3:6:1/7:2/9:3/11:4',
        'S4:8:1/9:2/11:3/13:4',
        'S5:10:1/11:2/13:3/15:4',
        'S6:12:1/13:2/15:3',
        'S7:14:1/15:2/17:3',
        'S8:16:1/17:2/19:3',
        'S9:18:1/19:2/20:3'
      ];
      spellsPerDay = [
        'S0:1:5/2:6',
        'S1:1:3/2:4/3:5/4:6',
        'S2:4:3/5:4/6:5/7:6',
        'S3:6:3/7:4/8:5/9:6',
        'S4:8:3/9:4/10:5/11:6',
        'S5:10:3/11:4/12:5/13:6',
        'S6:12:3/13:4/14:5/15:6',
        'S7:14:3/15:4/16:5/17:6',
        'S8:16:3/17:4/18:5/19:6',
        'S9:18:3/19:4/20:6'
      ];
      rules.defineRule('casterLevelArcane', 'levels.Sorcerer', '+=', null);
      rules.defineRule('familiarMasterLevel', 'levels.Sorcerer', '+=', null);

    } else if(klass == 'Wizard') {

      baseAttack = SRD35.ATTACK_BONUS_POOR;
      feats = ['Spell Mastery'];
      for(var j = 0; j < SRD35.FEATS.length; j++) {
        var pieces = SRD35.FEATS[j].split(':');
        if(pieces[1].match(/Item Creation|Metamagic/)) {
          feats[feats.length] = pieces[0];
        }
      }
      features = [
        '1:Scribe Scroll', '1:Familiar',
        '1:Weapon Proficiency ' +
          '(Club/Dagger/Heavy Crossbow/Light Crossbow/Quarterstaff)'
      ];
      hitDie = 4;
      notes = [
        'featureNotes.familiarFeature:Special bond/abilities',
        'magicNotes.scribeScrollFeature:Create scroll of any known spell',
        'magicNotes.wizardSpecialization:Extra %V spell/day each spell level',
        'skillNotes.wizardSpecialization:+2 Spellcraft (%V)'
      ];
      profArmor = SRD35.PROFICIENCY_NONE;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon = SRD35.PROFICIENCY_NONE;
      saveFortitude = SRD35.SAVE_BONUS_POOR;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_GOOD;
      selectableFeatures = null;
      skillPoints = 2;
      skills = [
        'Concentration', 'Craft', 'Decipher Script', 'Knowledge', 'Profession',
        'Spellcraft'
      ];
      spellAbility = 'intelligence';
      spellsKnown = [
        'W0:1:"all"', 'W1:1:3/2:5', 'W2:3:2/4:4', 'W3:5:2/6:4',
        'W4:7:2/8:4', 'W5:9:2/10:4', 'W6:11:2/12:4', 'W7:13:2/14:4',
        'W8:15:2/16:4', 'W9:17:2/18:4/19:6/20:8'
      ];
      spellsPerDay = [
        'W0:1:3/2:4',
        'W1:1:1/2:2/4:3/7:4',
        'W2:3:1/4:2/6:3/9:4',
        'W3:5:1/6:2/8:3/11:4',
        'W4:7:1/8:2/10:3/13:4',
        'W5:9:1/10:2/12:3/15:4',
        'W6:11:1/12:2/14:3/17:4',
        'W7:13:1/14:2/16:3/19:4',
        'W8:15:1/16:2/18:3/20:4',
        'W9:17:1/18:2/19:3/20:4'
      ];
      rules.defineRule('casterLevelArcane', 'levels.Wizard', '+=', null);
      rules.defineRule('familiarMasterLevel', 'levels.Wizard', '+=', null);
      rules.defineRule('featCount.Wizard',
        'levels.Wizard', '=', 'source >= 5 ? Math.floor(source / 5) : null'
      );
      for(var j = 0; j < SRD35.SCHOOLS.length; j++) {
        var school = SRD35.SCHOOLS[j].split(':')[0];
        rules.defineRule('magicNotes.wizardSpecialization',
         'specialize.' + school, '=', '"' + school.toLowerCase() + '"'
        );
        rules.defineRule('skillNotes.wizardSpecialization',
          'specialize.' + school, '=', '"' + school.toLowerCase() + '"'
        );
      }
      for(var j = 0; j < 10; j++) {
        rules.defineRule
          ('spellsPerDay.W' + j, 'magicNotes.wizardSpecialization', '+', '1');
      }

    } else
      continue;

    SRD35.defineClass
      (rules, klass, hitDie, skillPoints, baseAttack, saveFortitude, saveReflex,
       saveWill, profArmor, profShield, profWeapon, skills, features,
       spellsKnown, spellsPerDay, spellAbility);
    if(notes != null)
      rules.defineNote(notes);
    if(feats != null) {
      for(var j = 0; j < feats.length; j++) {
        rules.defineChoice('feats', feats[j] + ':' + klass);
      }
    }
    if(selectableFeatures != null) {
      for(var j = 0; j < selectableFeatures.length; j++) {
        var selectable = selectableFeatures[j];
        var choice = klass + ' - ' + selectable;
        rules.defineChoice('selectableFeatures', choice + ':' + klass);
        rules.defineRule(klassNoSpace + 'Features.' + selectable,
          'selectableFeatures.' + choice, '+=', null
        );
        rules.defineRule('features.' + selectable,
          'selectableFeatures.' + choice, '+=', null
        );
      }
    }

  }

};

/* Defines the rules related to combat. */
SRD35.combatRules = function(rules) {
  rules.defineNote([
    'turnUndead.damageModifier:2d6+%V',
    'turnUndead.frequency:%V/day',
    'turnUndead.maxHitDice:(d20+%V)/3'
  ]);
  rules.defineRule('armorClass',
    '', '=', '10',
    'armor', '+', 'SRD35.armorsArmorClassBonuses[source]',
    'shield', '+', 'source == "None" ? null : ' +
                   'source == "Tower" ? 4 : source.match(/Heavy/) ? 2 : 1'
  );
  rules.defineRule('armorProficiency',
    'armorProficiencyLevel', '=', 'SRD35.proficiencyLevelNames[source]'
  );
  rules.defineRule('armorProficiencyLevel',
    '', '=', SRD35.PROFICIENCY_NONE,
    'classArmorProficiencyLevel', '^=', null
  );
  rules.defineRule('attacksPerRound',
    'baseAttack', '=', 'source > 0 ? 1 + Math.floor((source - 1) / 5) : 1'
  );
  rules.defineRule('baseAttack', '', '=', '0');
  rules.defineRule('initiative', 'dexterityModifier', '=', null);
  rules.defineRule('meleeAttack', 'baseAttack', '=', null);
  rules.defineRule('rangedAttack', 'baseAttack', '=', null);
  rules.defineRule('save.Fortitude', 'constitutionModifier', '=', null);
  rules.defineRule('save.Reflex', 'dexterityModifier', '=', null);
  rules.defineRule('save.Will', 'wisdomModifier', '=', null);
  rules.defineRule('shieldProficiency',
    'shieldProficiencyLevel', '=', 'SRD35.proficiencyLevelNames[source]'
  );
  rules.defineRule('shieldProficiencyLevel',
    '', '=', SRD35.PROFICIENCY_NONE,
    'classShieldProficiencyLevel', '^', null
  );
  rules.defineRule('turnUndead.damageModifier',
    'turnUndead.level', '=', null,
    'charismaModifier', '+', null
  );
  rules.defineRule('turnUndead.frequency',
    'turnUndead.level', '=', '3',
    'charismaModifier', '+', null
  );
  rules.defineRule('turnUndead.maxHitDice',
    'turnUndead.level', '=', 'source * 3 - 10',
    'charismaModifier', '+', null
  );
  rules.defineRule('weaponProficiency',
    'weaponProficiencyLevel', '=',
      'source == ' + SRD35.PROFICIENCY_LIGHT + ' ? "Simple" : ' +
      'source == ' + SRD35.PROFICIENCY_MEDIUM + ' ? "Martial" : ' +
      '"Limited"'
  );
  rules.defineRule('weaponProficiencyLevel',
    '', '=', SRD35.PROFICIENCY_NONE,
    'classWeaponProficiencyLevel', '^', null
  );
  rules.defineRule('weapons.Unarmed', '', '=', '1');
};

/* Defines the rules related to companion creatures. */
SRD35.companionRules = function(rules, companions, familiars) {

  var features, notes;

  notes = [
    "companionNotes.celestialCompanion:" +
      "Smite Evil (+%V HP) 1/day, 60' darkvision, " +
      "%1 acid/cold/electricity resistance, DR %2/magic",
    'companionNotes.companionEvasionFeature:' +
      'Reflex save yields no damage instead of 1/2',
    'companionNotes.companionImprovedEvasionFeature:' +
      'Failed save yields 1/2 damage',
    'companionNotes.deliverTouchSpellsFeature:' +
      'Deliver touch spells if in contact w/master when cast',
    'companionNotes.devotionFeature:+4 Will vs. enchantment',
    'companionNotes.empathicLinkFeature:Share emotions up to 1 mile',
    "companionNotes.fiendishCompanion:" +
      "Smite Good (+%V HP) 1/day, 60' darkvision, " +
      "%1 cold/fire resistance, DR %2/magic",
    'companionNotes.improvedSpeedFeature:+10 speed',
    'companionNotes.multiattackFeature:' +
      'Reduce additional attack penalty to -2 or second attack at -5',
    'companionNotes.scryFeature:Master views companion 1/day',
    'companionNotes.shareSpellsFeature:' +
      "Master share self spell w/companion w/in 5'",
    'companionNotes.speakWithLikeAnimalsFeature:Talk w/similar creatures',
    'companionNotes.speakWithMasterFeature:Talk w/master in secret language',
    'companionStats.Melee:+%V %1%2%3%4',
    'skillNotes.companionAlertnessFeature:' +
      '+2 listen/spot when companion w/in reach',
    'skillNotes.linkFeature:+4 Handle Animal (companion)/Wild Empathy (companion)'
  ];
  rules.defineNote(notes);

  rules.defineRule('companionNotes.celestialCompanion',
    'animalCompanion.Celestial', '=', null,
    'familiar.Celestial', '=', null,
    'companionStats.HD', '^', null
  );
  rules.defineRule('companionNotes.celestialCompanion.1',
    'features.Celestial Companion', '?', null,
    'companionStats.HD', '=', 'Math.floor((source + 7) / 8) * 5'
  );
  rules.defineRule('companionNotes.celestialCompanion.2',
    'features.Celestial Companion', '?', null,
    'companionStats.HD', '=', 'source < 4 ? 0 : source < 12 ? 5 : 10'
  );
  rules.defineRule('companionNotes.fiendishCompanion',
    'animalCompanion.Fiendish', '=', null,
    'familiar.Fiendish', '=', null,
    'companionStats.HD', '^', null
  );
  rules.defineRule('companionNotes.fiendishCompanion.1',
    'features.Fiendish Companion', '?', null,
    'companionStats.HD', '=', 'Math.floor((source + 7) / 8) * 5'
  );
  rules.defineRule('companionNotes.fiendishCompanion.2',
    'features.Fiendish Companion', '?', null,
    'companionStats.HD', '=', 'source < 4 ? 0 : source < 12 ? 5 : 10'
  );
  rules.defineRule('companionStats.Melee.2',
    'companionDamAdj1', '=', 'source == 0 ? "" : source > 0 ? "+" + source : source',
  );
  rules.defineRule('companionStats.Melee.4',
    'companionDamAdj2', '=', 'source == 0 ? "" : source > 0 ? "+" + source : source',
    'companionStats.Melee.3', '=', 'source == "" ? "" : null'
  );

  rules.defineSheetElement('Companion Features', 'Notes', null, '; ');
  rules.defineSheetElement('Companion Stats', 'Notes', null, '; ');
  rules.defineSheetElement('Companion Notes', 'Notes', null, '; ');

  if(companions != null) {

    rules.defineChoice('animalCompanions', ScribeUtils.getKeys(companions));
    rules.defineEditorElement
      ('animalCompanion', 'Animal Companion', 'set', 'animalCompanions',
       'notes');
    rules.defineEditorElement
      ('animalCompanionName', 'Name', 'text', [20], 'notes');
    rules.defineSheetElement
      ('Animal Companion', 'Companion Features', null, ' ');

    features = {
      'Link': 1, 'Share Spells': 1, 'Companion Evasion': 2, 'Devotion' : 3,
      'Multiattack': 4, 'Companion Improved Evasion': 6
    };
    for(var feature in features) {
      rules.defineRule('companionFeatures.' + feature,
        'companionLevel', '=',
        'source >= ' + features[feature] + ' ? 1 : null'
      );
      rules.defineRule
        ('features.' + feature, 'companionFeatures.' + feature, '=', '1');
    }

    notes = ['validationNotes.companionMasterLevel:Requires %1'];
    rules.defineNote(notes);

    rules.defineRule('companionAttack',
      'features.Animal Companion', '?', null,
      'companionStats.HD', '=', SRD35.ATTACK_BONUS_AVERAGE,
      'companionAttackBoosts', '+', 'Math.floor(source)'
    );
    rules.defineRule('companionAttackBoosts',
      'companionLevel', '=', 'Math.floor((source-1) / 2) + (source % 2 == 0 ? 0.5 : 0)',
      'companionMaxDexOrStr', '+', 'source % 2 == 0 ? 0.5 : 0'
    );
    rules.defineRule('companionDamAdj1',
      'companionStats.Str', '=', 'Math.floor((source - 10) / 2)',
      'companionDamageSingleAttackBonus', '+', null
    );
    rules.defineRule('companionDamAdj2',
      'companionStats.Str', '=', 'Math.floor((source - 10) / 2)'
    );
    rules.defineRule('companionDamageSingleAttackBonus',
      'companionStats.Melee.3', '?', 'source == ""',
      'companionStats.Str', '=', 'source<14 ? null : Math.floor((source-10)/4)'
    );
    rules.defineRule('companionFort',
      'features.Animal Companion', '?', null,
      'companionStats.HD', '=', SRD35.SAVE_BONUS_GOOD,
      'companionStats.Con', '+', 'Math.floor((source - 10)/2)'
    );
    rules.defineRule('companionHP',
      'features.Animal Companion', '?', null,
      'companionStats.Con', '=', '4.5 + Math.floor((source - 10)/2)',
      'companionStats.HD', '*', null
    );
    rules.defineRule('companionLevel',
      'companionMasterLevel', '=', 'Math.floor((source + 3) / 3)'
    );
    rules.defineRule('companionMaxDexOrStr',
      'companionStats.Dex', '=', null,
      'companionStats.Str', '^', null
    );
    rules.defineRule('companionRef',
      'features.Animal Companion', '?', null,
      'companionStats.HD', '=', SRD35.SAVE_BONUS_GOOD,
      'companionStats.Dex', '+', 'Math.floor((source - 10) / 2)'
    );
    rules.defineRule('companionWill',
      'features.Animal Companion', '?', null,
      'companionStats.HD', '=', SRD35.SAVE_BONUS_POOR,
      'companionStats.Wis', '+', 'Math.floor((source - 10) / 2)'
    );

    rules.defineRule('companionStats.AC',
      'companionLevel', '+', '(source - 1) * 2 + Math.floor(source / 2)',
    );
    rules.defineRule('companionStats.Dex', 'companionLevel', '+', 'source - 1');
    rules.defineRule('companionStats.Fort', 'companionFort', '=', null);
    rules.defineRule
      ('companionStats.HD', 'companionLevel', '+', '(source - 1) * 2');
    rules.defineRule('companionStats.HP', 'companionHP', '=', 'Math.floor(source)');
    rules.defineRule('companionStats.Init',
      'companionStats.Dex', '=', 'Math.floor((source - 10) / 2)'
    );
    rules.defineRule('companionStats.Melee', 'companionAttack', '=', 'Math.floor(source)');
    rules.defineRule('companionStats.Name', 'animalCompanionName', '=', null);
    rules.defineRule('companionStats.Ref', 'companionRef', '=', null);
    rules.defineRule('companionStats.Str', 'companionLevel', '+', 'source - 1');
    rules.defineRule('companionStats.Tricks', 'companionLevel', '=', null);
    rules.defineRule('companionStats.Will', 'companionWill', '=', null);

    for(var companion in companions) {
      var matchInfo;
      var stats = companions[companion].split(/\s+/);
      for(var i = 0; i < stats.length; i++) {
        if((matchInfo = stats[i].match(/(.+)=(.+)/)) == null)
          continue
        if(matchInfo[1] == 'Attack') {
          rules.defineRule('companionAttack',
            'animalCompanion.' + companion, '+', matchInfo[2]
          );
        } else if(matchInfo[1] == 'Dam') {
          var damages = matchInfo[2].split(',');
          matchInfo = damages[0].match(/([^-+]*)([-+]\d+)?/);
          rules.defineRule('companionStats.Melee.1',
            'animalCompanion.' + companion, '=', '"' + matchInfo[1] + '"'
          );
          if(damages.length > 1) {
            matchInfo = damages[1].match(/([^-+]*)([-+]\d+)?/);
            rules.defineRule('companionStats.Melee.3',
              'animalCompanion.' + companion, '=', '",' + matchInfo[1] + '"'
            );
          } else {
            rules.defineRule('companionStats.Melee.3',
              'animalCompanion.' + companion, '=', '""'
            );
          }
        } else if(matchInfo[1] == 'Level') {
          rules.defineRule('companionMasterLevel',
            'animalCompanion.' + companion, '+', '-' + matchInfo[2]
          );
          rules.defineRule('validationNotes.companionMasterLevel',
            'companionMasterLevel', '=', 'source >= 0 ? null : source'
          );
          rules.defineRule('validationNotes.companionMasterLevel.1',
            'animalCompanion.' + companion, '=', matchInfo[2]
          );
        } else if(matchInfo[2].match(/^\d+$/)) {
          rules.defineRule('companionStats.' + matchInfo[1],
            'animalCompanion.' + companion, '=', matchInfo[2]
          );
        } else {
          rules.defineRule('companionStats.' + matchInfo[1],
            'animalCompanion.' + companion, '=', '"' + matchInfo[2] + '"'
          );
        }
      }
    }

    // Adapt Paladin mount rules to make it a form of animal companion.
    var features = {
      'Companion Evasion': 5, 'Companion Improved Evasion': 5, 
      'Empathic Link': 5, 'Share Saving Throws': 5, 'Improved Speed': 8,
      'Command Like Creatures': 11, 'Companion Resist Spells': 15,
      'Link': 0, 'Devotion' : 0, 'Multiattack': 0, 'Share Spells': 0
    };
    rules.defineRule('companionOrFamiliar',
      'companionMasterLevel', '=', '1',
      'familiarMasterLevel', '=', '1'
    );
    for(var feature in features) {
      if(features[feature] > 0) {
        rules.defineRule('companionFeatures.' + feature,
          'mountMasterLevel', '=', 'source >= ' + features[feature] + ' ? 1 : null'
        );
        rules.defineRule
          ('features.' + feature, 'companionFeatures.' + feature, '=', '1');
      } else {
        // Disable N/A companion features
        rules.defineRule
          ('companionFeatures.' + feature, 'companionOrFamiliar', '?', null);
      }
    }
    notes = [
      'companionNotes.commandLikeCreaturesFeature:' +
        'DC %V <i>Command</i> vs. similar creatures %1/day',
    ];
    rules.defineNote(notes);
    rules.defineRule('companionLevel',
      'mountMasterLevel', '=', 'source<5 ? null : Math.floor((source + 1) / 3)'
    );
    rules.defineRule('companionNotes.commandLikeCreaturesFeature',
      'companionFeatures.Command Like Creatures', '?', null,
      'mountMasterLevel', '=', '10 + Math.floor(source / 2)',
      'charismaModifier', '+', null
    );
    rules.defineRule('companionNotes.commandLikeCreaturesFeature.1',
      'mountMasterLevel', '=', 'Math.floor(source / 2)'
    );
    rules.defineRule
      ('companionStats.AC', 'mountMasterLevel', '+', 'source < 5 ? null : 2');
    rules.defineRule('companionStats.Int',
      'mountMasterLevel', '^', 'source>=5 ? 5 + Math.floor((source-2)/3) : null'
    );
    rules.defineRule
      ('companionStats.SR', 'mountMasterLevel', '=', 'source + 5');
    rules.defineRule
      ('features.Animal Companion', 'paladinFeatures.Special Mount', '=', '1');

  }

  if(familiars != null) {

    rules.defineChoice('familiars', ScribeUtils.getKeys(familiars));
    rules.defineEditorElement
      ('familiar', 'Familiar', 'set', 'familiars', 'notes');
    rules.defineEditorElement('familiarName', 'Name', 'text', [20], 'notes');
    rules.defineSheetElement('Familiar', 'Companion Features', null, ' ');

    features = {
      'Companion Alertness': 1, 'Companion Evasion': 1,
      'Companion Improved Evasion': 1, 'Empathic Link': 1, 'Share Spells': 1,
      'Deliver Touch Spells': 2, 'Speak With Master': 3,
      'Speak With Like Animals': 4, 'Companion Resist Spells': 6, 'Scry': 7
    };
    for(var feature in features) {
      rules.defineRule('companionFeatures.' + feature,
        'familiarLevel', '=', 'source >= ' + features[feature] + ' ? 1 : null'
      );
      rules.defineRule
        ('features.' + feature, 'companionFeatures.' + feature, '=', '1');
    }

    notes = [
      'combatNotes.familiarToad:+3 Hit Points',
      'saveNotes.familiarRat:+2 Fortitude',
      'saveNotes.familiarWeasel:+2 Reflex',
      'skillNotes.familiarBat:+3 Listen',
      'skillNotes.familiarCat:+3 Move Silently',
      'skillNotes.familiarHawk:+3 Spot in bright light',
      'skillNotes.familiarLizard:+3 Climb',
      'skillNotes.familiarOwl:+3 Spot in shadows/darkness',
      'skillNotes.familiarRaven:+3 Appraise',
      'skillNotes.familiarViper:+3 Bluff',
      'companionStats.SR:DC %V',
      'validationNotes.familiarMasterLevel:Requires %1'
    ];
    rules.defineNote(notes);

    rules.defineRule('combatNotes.familiarToad', 'familiar.Toad', '=', '1');
    rules.defineRule('saveNotes.familiarRat', 'familiar.Rat', '=', '1');
    rules.defineRule('saveNotes.familiarWeasel', 'familiar.Weasel', '=', '1');
    rules.defineRule('skillNotes.familiarBat', 'familiar.Bat', '=', '1');
    rules.defineRule('skillNotes.familiarCat', 'familiar.Cat', '=', '1');
    rules.defineRule('skillNotes.familiarHawk', 'familiar.Hawk', '=', '1');
    rules.defineRule('skillNotes.familiarLizard', 'familiar.Lizard', '=', '1');
    rules.defineRule('skillNotes.familiarOwl', 'familiar.Owl', '=', '1');
    rules.defineRule('skillNotes.familiarRaven', 'familiar.Raven', '=', '1');
    rules.defineRule('skillNotes.familiarViper', 'familiar.Viper', '=', '1');

    rules.defineRule('hitPoints', 'combatNotes.familiarToad', '+', '3');
    rules.defineRule('save.Fortitude', 'saveNotes.familiarRat', '+', '2');
    rules.defineRule('save.Reflex', 'saveNotes.familiarWeasel', '+', '2');

    rules.defineRule('familiarAttack',
      'features.Familiar', '?', null,
      'baseAttack', '=', null,
    );
    rules.defineRule('familiarFort',
      'familiarLevel', '?', null,
      'classFortitudeBonus', '=', 'Math.max(source, 2)',
      'companionStats.Con', '+', 'Math.floor((source - 10) / 2)'
    );
    rules.defineRule('familiarHD',
      'features.Familiar', '?', null,
      'level', '=', null
    );
    rules.defineRule('familiarHP',
      'features.Familiar', '?', null,
      'hitPoints', '=', 'Math.floor(source / 2)'
    );
    rules.defineRule('familiarLevel',
      'features.Familiar', '?', null,
      'familiarMasterLevel', '=', 'Math.floor((source + 1) / 2)'
    );
    rules.defineRule('familiarRef',
      'familiarLevel', '?', null,
      'classReflexBonus', '=', 'Math.max(source, 2)',
      'companionStats.Dex', '+', 'Math.floor((source - 10) / 2)'
    );
    rules.defineRule('familiarWill',
      'familiarLevel', '?', null,
      'classWillBonus', '=', 'Math.max(source, 0)',
      'companionStats.Wis', '+', 'Math.floor((source - 10) / 2)'
    );

    rules.defineRule('companionStats.AC',
      'familiarLevel', '+', null
    );
    rules.defineRule('companionStats.Fort', 'familiarFort', '=', null);
    rules.defineRule('companionStats.HD', 'familiarHD', '^', null);
    rules.defineRule('companionStats.HP', 'familiarHP', '=', null);
    rules.defineRule('companionStats.Init',
      'companionStats.Dex', '=', 'Math.floor((source - 10) / 2)'
    );
    rules.defineRule('companionStats.Int', 'familiarLevel', '^', 'source + 5');
    rules.defineRule('companionStats.Melee', 'familiarAttack', '=', null);
    rules.defineRule('companionStats.Melee.2', 'familiarAttack', '=', '""');
    rules.defineRule('companionStats.Melee.3', 'familiarAttack', '=', '""');
    rules.defineRule('companionStats.Melee.4', 'familiarAttack', '=', '""');
    rules.defineRule('companionStats.Name', 'familiarName', '=', null);
    rules.defineRule('companionStats.Ref', 'familiarRef', '=', null);
    rules.defineRule('companionStats.SR',
      'features.Companion Resist Spells', '?', null,
      'familiarMasterLevel', '=', 'source + 5'
    );
    rules.defineRule('companionStats.Will', 'familiarWill', '=', null);

    rules.defineRule('validationNotes.familiarMasterLevel',
      'validationNotes.familiarMasterLevel.1', '=', null,
      'familiarMasterLevel', '+', '-source',
      '', '^', '0'
    );
    rules.defineRule
      ('validationNotes.familiarMasterLevel.1', 'features.Familiar', '=', '1');

    for(var familiar in familiars) {
      var matchInfo;
      var stats = familiars[familiar].split(/\s+/);
      for(var i = 0; i < stats.length; i++) {
        if((matchInfo = stats[i].match(/(.+)=(.+)/)) == null)
          continue
        if(matchInfo[1] == 'Attack') {
          rules.defineRule
            ('familiarAttack', 'familiar.' + familiar, '+', matchInfo[2]);
        } else if(matchInfo[1] == 'Dam') {
          rules.defineRule('companionStats.Melee.1',
            'familiar.' + familiar, '=', '"' + matchInfo[2] + '"'
          );
        } else if(matchInfo[1] == 'Level') {
          rules.defineRule('validationNotes.familiarMasterLevel.1',
            'familiar.' + familiar, '^', matchInfo[2]
          );
        } else if(matchInfo[2].match(/^\d+$/)) {
          rules.defineRule('companionStats.' + matchInfo[1],
            'familiar.' + familiar, '=', matchInfo[2]
          );
        } else {
          rules.defineRule('companionStats.' + matchInfo[1],
            'familiar.' + familiar, '=', '"' + matchInfo[2] + '"'
          );
        }
      }
    }

  }

};

/* Returns an ObjectViewer loaded with the default character sheet format. */
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
            {name: 'Weapons', within: 'Section 1', format: '<b>%N</b> %V',
             separator: '/'},
            {name: 'Turn Undead', within: 'Section 1', separator: '/'},
            {name: 'Alignment', within: 'Section 1', format: '<b>Ali</b> %V'},
            {name: 'Damage Reduction', within: 'Section 1',
             format: '<b>DR</b> %V', separator: '/'},
            {name: 'Save', within: 'Section 1', separator: '/'},
            {name: 'Resistance', within: 'Section 1', separator: '/'},
            {name: 'Abilities', within: 'Section 1',
             format: '<b>Str/Int/Wis/Dex/Con/Cha</b> %V', separator: '/'},
              {name: 'Strength', within: 'Abilities', format: '%V'},
              {name: 'Intelligence', within: 'Abilities', format: '%V'},
              {name: 'Wisdom', within: 'Abilities', format: '%V'},
              {name: 'Dexterity', within: 'Abilities', format: '%V'},
              {name: 'Constitution', within: 'Abilities', format: '%V'},
              {name: 'Charisma', within: 'Abilities', format: '%V'},
          {name: 'Section 2', within: '_top', separator: '; '},
            {name: 'Skill Modifier', within: 'Section 2', separator: '/'},
            {name: 'Feats', within: 'Section 2', separator: '/'},
            {name: 'Languages', within: 'Section 2', separator: '/'},
            {name: 'Spells', within: 'Section 2', separator: '/'},
            {name: 'Spell Difficulty Class', within: 'Section 2',
             separator: '/'},
            {name: 'Domains', within: 'Section 2', separator: '/'},
            {name: 'Notes', within: 'Section 2'},
            {name: 'Hidden Notes', within: 'Section 2', format: '%V'}
      );
    } else if(name == 'Collected Notes' || name == 'Standard' || name == 'Vertical') {
      var innerSep = name == 'Vertical' ? '\n' : null;
      var listSep = name == 'Vertical' ? '\n' : '; ';
      var noteSep = listSep;
      noteSep = '\n';
      var outerSep = name == 'Vertical' ? null : '\n';
      viewer.addElements(
        {name: '_top', borders: 1, separator: '\n'},
        {name: 'Header', within: '_top'},
          {name: 'Identity', within: 'Header', separator: ''},
            {name: 'Name', within: 'Identity', format: '<b>%V</b>'},
            {name: 'Gender', within: 'Identity', format: ' -- <b>%V</b>'},
            {name: 'Race', within: 'Identity', format: ' <b>%V</b>'},
            {name: 'Levels', within: 'Identity', format: ' <b>%V</b>',
             separator: '/'},
          {name: 'Image Url', within: 'Header', format: '<img src="%V"/>'},
        {name: 'Attributes', within: '_top', separator: outerSep},
          {name: 'Abilities', within: 'Attributes', separator: innerSep},
            {name: 'Strength', within: 'Abilities'},
            {name: 'Intelligence', within: 'Abilities'},
            {name: 'Wisdom', within: 'Abilities'},
            {name: 'Dexterity', within: 'Abilities'},
            {name: 'Constitution', within: 'Abilities'},
            {name: 'Charisma', within: 'Abilities'},
          {name: 'Description', within: 'Attributes', separator: innerSep},
            {name: 'Alignment', within: 'Description'},
            {name: 'Deity', within: 'Description'},
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
      } else {
        viewer.addElements(
          {name: 'AllNotes', within: 'FeaturePart', separator: '\n', columns: "1L"},
            {name: 'Ability Notes', within: 'AllNotes', separator: null, columns: "1L", format: "%V"},
            {name: 'Feature Notes', within: 'AllNotes', separator: null, columns: "1L", format: "%V"},
            {name: 'Skill Notes', within: 'AllNotes', separator: null, columns: "1L", format: "%V"},
            {name: 'Combat Notes', within: 'AllNotes', separator: null, columns: "1L", format: "%V"},
            {name: 'Save Notes', within: 'AllNotes', separator: null, columns: "1L", format: "%V"},
            {name: 'Magic Notes', within: 'AllNotes', separator: null, columns: "1L", format: "%V"}
        );
      }
      viewer.addElements(
          {name: 'SkillPart', within: 'FeaturesAndSkills', separator: '\n'},
            {name: 'SkillStats', within: 'SkillPart', separator:innerSep},
              {name: 'Skill Points', within: 'SkillStats'},
              {name: 'Max Allowed Skill Points', within: 'SkillStats'},
            {name: 'Skills', within: 'SkillPart', columns: '3LE', separator: null}
      );
      if(name != 'Collected Notes') {
        viewer.addElements(
            {name: 'Skill Notes', within: 'SkillPart', separator:noteSep}
        );
      }
      viewer.addElements(
          {name: 'LanguagePart', within: 'FeaturesAndSkills', separator: '\n'},
            {name: 'LanguageStats', within: 'LanguagePart', separator:innerSep},
              {name: 'Language Count', within: 'LanguageStats'},
            {name: 'Languages', within: 'LanguagePart', separator: listSep},
        {name: 'Combat', within: '_top', separator: outerSep,
         format: '<b>Combat</b><br/>%V'},
          {name: 'CombatPart', within: 'Combat', separator: '\n'},
            {name: 'CombatStats', within: 'CombatPart', separator: innerSep},
              {name: 'Hit Points', within: 'CombatStats'},
              {name: 'Initiative', within: 'CombatStats'},
              {name: 'Armor Class', within: 'CombatStats'},
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
              {name: 'Weapons', within: 'Gear', separator: listSep},
            {name: 'Turning', within: 'CombatPart', separator: innerSep},
              {name: 'Turn Undead', within: 'Turning', separator: listSep}
      );
      if(name != 'Collected Notes') {
        viewer.addElements(
            {name: 'Combat Notes', within: 'CombatPart', separator: noteSep}
        );
      }
      viewer.addElements(
          {name: 'SavePart', within: 'Combat', separator: '\n'},
            {name: 'SaveAndResistance', within: 'SavePart', separator:innerSep},
              {name: 'Damage Reduction', within: 'SaveAndResistance',
               separator: innerSep},
              {name: 'Save', within: 'SaveAndResistance', separator: listSep},
              {name: 'Resistance', within: 'SaveAndResistance',
               separator: listSep}
      );
      if(name != 'Collected Notes') {
        viewer.addElements(
            {name: 'Save Notes', within: 'SavePart', separator: noteSep}
        );
      }
      viewer.addElements(
        {name: 'Magic', within: '_top', separator: outerSep,
         format: '<b>Magic</b><br/>%V'},
          {name: 'SpellPart', within: 'Magic', separator: '\n'},
            {name: 'SpellStats', within: 'SpellPart', separator: innerSep},
              {name: 'Spells Known', within: 'SpellStats', separator: listSep},
              {name: 'Spells Per Day', within: 'SpellStats', separator:listSep},
              {name: 'Spell Difficulty Class', within: 'SpellStats',
               format: '<b>Spell DC</b>: %V', separator: listSep},
            {name: 'SpellSpecialties', within: 'SpellPart', separator:innerSep},
              {name: 'Domains', within: 'SpellSpecialties', separator: listSep},
              {name: 'Specialize', within: 'SpellSpecialties'},
              {name: 'Prohibit', within: 'SpellSpecialties', separator:listSep},
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
          {name: 'NotesPart', within: 'Notes Area', separator: '\n'},
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

/* Defines the rules related to character description. */
SRD35.descriptionRules = function(rules, alignments, deities, genders) {
  rules.defineChoice('alignments', alignments);
  rules.defineChoice('genders', genders);
  for(var i = 0; i < deities.length; i++) {
    var pieces = deities[i].split(':');
    if(pieces.length < 3)
      continue;
    var deity = pieces[0];
    var domains = pieces[2];
    rules.defineChoice('deities', deity + ':' + domains);
    if(pieces[1] != "") {
      var weapons = pieces[1].split('/');
      SRD35.deitiesFavoredWeapons[deity] = pieces[1];
      for(var j = 0; j < weapons.length; j++) {
        var weapon = weapons[j];
        var focusFeature = 'Weapon Focus (' + weapon + ')';
        var proficiencyFeature = 'Weapon Proficiency (' + weapon + ')';
        rules.defineRule('clericFeatures.' + focusFeature,
          'domains.War', '?', null,
          'levels.Cleric', '?', null,
          'deity', '=', 'SRD35.deitiesFavoredWeapons[source].indexOf("' + weapon + '") >= 0 ? 1 : null'
        );
        rules.defineRule('clericFeatures.' + proficiencyFeature,
          'domains.War', '?', null,
          'levels.Cleric', '?', null,
          'deity', '=', 'SRD35.deitiesFavoredWeapons[source].indexOf("' + weapon + '") >= 0 ? 1 : null'
        );
        rules.defineRule
          ('features.' + focusFeature, 'clericFeatures.' + focusFeature, '=', null);
        rules.defineRule
          ('features.' + proficiencyFeature, 'clericFeatures.' + proficiencyFeature, '=', null);
      }
    }
  }
};

/* Defines the rules related to equipment. */
SRD35.equipmentRules = function(rules, armors, shields, weapons) {

  rules.defineChoice('armors', armors);
  rules.defineChoice('shields', shields);
  rules.defineChoice('weapons', weapons);

  for(var i = 0; i < weapons.length; i++) {

    var pieces = weapons[i].split(':');
    var matchInfo = pieces[1].match(/(\d?d\d+)(\/(\d?d\d+))?(x(\d))?(@(\d+))?(r(\d+))?/);
    if(! matchInfo)
      continue;

    var critMultiplier = matchInfo[5] || '2';
    var critThreat = matchInfo[7] || '20';
    var firstDamage = matchInfo[1];
    var name = pieces[0];
    var range = matchInfo[9];
    var secondDamage = matchInfo[3];
    var weaponName = 'weapons.' + name;
    var attackBase = !range || 'ClubDaggerLight HammerSaiShortspearSpearTrident'.indexOf(name) >= 0 ? 'meleeAttack' : 'rangedAttack';

    var rangeVar = !range ? null : secondDamage ? 7 : 5;
    var threatVar = secondDamage ? 6 : 4;

    var format = '%V (%1 %2%3';
    if(secondDamage)
      format += '/%4%5';
    format += ' x' + critMultiplier + '@%' + threatVar;
    if(range)
      format += ' R%' + rangeVar + "'";
    format += ')';

    rules.defineNote(weaponName + ':' + format);

    rules.defineRule('attackBonus.' + name,
      'weapons.' + name, '?', null,
      attackBase, '=', null,
      'weaponAttackAdjustment.' + name, '+', null
    );
    if(name.startsWith('Composite')) {
      rules.defineRule
        ('attackBonus.' + name, 'strengthModifier', '+', 'source < 0 ? -2 : 0');
    }
    rules.defineRule('damageBonus.' + name, 'weapons.' + name, '?', null);
    if(name.match(/Blowgun|Crossbow|Dartgun|Gun/))
      rules.defineRule('damageBonus.' + name, '', '=', '0');
    else if(name.match(/Longbow|Shortbow/))
      rules.defineRule('damageBonus.' + name,
        'combatNotes.strengthDamageAdjustment', '=', 'source < 0 ? source : 0'
      );
    else if(pieces[1].match(/1h|2h/))
      rules.defineRule('damageBonus.' + name,
        'combatNotes.strengthDamageAdjustment', '=', null,
        'combatNotes.two-HandedWieldDamageAdjustment', '+', null
      );
    else
      rules.defineRule('damageBonus.' + name,
        'combatNotes.strengthDamageAdjustment', '=', null
      );
    rules.defineRule
      ('damageBonus.' + name, 'weaponDamageAdjustment.' + name, '+', null);

    rules.defineRule(weaponName + '.1',
      'attackBonus.' + name, '=', 'source < 0 ? source : ("+" + source)'
    );

    rules.defineRule('weaponDamage.' + name,
      'weapons.' + name, '=', '"' + firstDamage + '"',
      'features.Small', '=', '"' + SRD35.weaponsSmallDamage[firstDamage] + '"',
      'features.Large', '=', '"' + SRD35.weaponsLargeDamage[firstDamage] + '"'
    );
    rules.defineRule(weaponName + '.2', 'weaponDamage.' + name, '=', null);
    rules.defineRule(weaponName + '.3',
      'damageBonus.' + name, '=', 'source < 0 ? source : source == 0 ? "" : ("+" + source)'
    );
    if(secondDamage) {
      rules.defineRule('weaponDamage2.' + name,
        'weapons.' + name, '=', '"' + secondDamage + '"',
        'features.Small', '=', '"'+SRD35.weaponsSmallDamage[secondDamage]+'"',
        'features.Large', '=', '"'+SRD35.weaponsLargeDamage[secondDamage]+'"'
      );
      rules.defineRule(weaponName + '.4', 'weaponDamage2.' + name, '=', null);
      rules.defineRule(weaponName + '.5',
        'damageBonus.' + name, '=', 'source < 0 ? source : source == 0 ? "" : ("+" + source)'
      );
    }

    rules.defineRule('threat.' + name,
      'weapons.' + name, '=', critThreat,
      'weaponCriticalAdjustment.' + name, '+', '-source'
    );
    rules.defineRule(weaponName + '.' + threatVar, 'threat.' + name, '=', null);

    if(range) {
      rules.defineRule('range.' + name,
        'weapons.' + name, '=', range,
        'weaponRangeAdjustment.' + name, '+', null,
        'features.Far Shot', '*', name.indexOf('bow') < 0 ? '2' : '1.5'
      );
      rules.defineRule(weaponName + '.' + rangeVar, 'range.' + name, '=', null);
    }

    if(pieces[1].indexOf('Li') >= 0 ||
       'RapierWhipSpiked Chain'.indexOf(name) >= 0) {
      rules.defineRule('weaponAttackAdjustment.' + name,
        'combatNotes.weaponFinesseFeature', '+=', null
      );
    }

  }
  rules.defineRule('weaponDamage.Unarmed', 'monkUnarmedDamage', '=', null);

  rules.defineNote('magicNotes.arcaneSpellFailure:%V%'),
  rules.defineRule('abilityNotes.armorSpeedAdjustment',
    'armor', '=',
    'SRD35.armorsProficiencyLevels[source] != null && ' +
    'SRD35.armorsProficiencyLevels[source] >= ' + SRD35.PROFICIENCY_MEDIUM +
    ' ? -10 : null',
    'abilityNotes.slowFeature', '+', '5'
  );
  rules.defineRule('combatNotes.dexterityArmorClassAdjustment',
    'armor', 'v', 'SRD35.armorsMaxDexBonuses[source]'
  );
  rules.defineRule('magicNotes.arcaneSpellFailure',
    'casterLevelArcane', '?', null,
    'armor', '+=', 'SRD35.armorsArcaneSpellFailurePercentages[source]',
    'shield', '+=', 'SRD35.shieldsArcaneSpellFailurePercentages[source]'
  );
  rules.defineRule('speed', 'abilityNotes.armorSpeedAdjustment', '+', null);
  rules.defineNote(
    'sanityNotes.casterLevelArcaneArmor:Implies Armor == "None"',
    'sanityNotes.casterLevelArcaneShield:Implies Shield == "None"'
  );
  rules.defineRule('sanityNotes.casterLevelArcaneArmor',
    'magicNotes.arcaneSpellFailure', '?', null,
    'armor', '=', 'source == "None" ? null : 1'
  );
  rules.defineRule('sanityNotes.casterLevelArcaneShield',
    'magicNotes.arcaneSpellFailure', '?', null,
    'shield', '=', 'source == "None" ? null : 1'
  );

  rules.defineNote(
    'combatNotes.nonproficientArmorPenalty:%V attack',
    'combatNotes.nonproficientShieldPenalty:%V attack',
    'sanityNotes.armorProficiencyLevelArmor:Lowers attack bonus',
    'sanityNotes.shieldProficiencyLevelShield:Lowers attack bonus',
    'sanityNotes.two-handedWeaponWithBuckler:Lowers attack bonus, AC',
    'validationNotes.two-handedWeaponWithShield:' +
      'Shields cannot be used with two-handed weapons'
  );
  rules.defineRule('armorProficiencyLevelShortfall',
    'armor', '=', 'SRD35.armorsProficiencyLevels[source]',
    'armorProficiencyLevel', '+', '-source'
  );
  rules.defineRule('combatNotes.nonproficientArmorPenalty',
    'armor', '=', '-SRD35.armorsSkillCheckPenalties[source]',
    'armorProficiencyLevelShortfall', '?', 'source > 0'
  );
  rules.defineRule('shieldProficiencyLevelShortfall',
    'shield', '=', 'SRD35.shieldsProficiencyLevels[source]',
    'shieldProficiencyLevel', '+', '-source'
  );
  rules.defineRule('combatNotes.nonproficientShieldPenalty',
    'shield', '=', '-SRD35.shieldsSkillCheckPenalties[source]',
    'shieldProficiencyLevelShortfall', '?', 'source > 0'
  );
  rules.defineRule('sanityNotes.armorProficiencyLevelArmor',
    'combatNotes.nonproficientArmorPenalty', '=', null
  );
  rules.defineRule('sanityNotes.shieldProficiencyLevelShield',
    'combatNotes.nonproficientShieldPenalty', '=', null
  );
  rules.defineRule('sanityNotes.two-handedWeaponWithBuckler',
    'shield', '?', 'source == "Buckler"'
  );
  rules.defineRule('validationNotes.two-handedWeaponWithShield',
    'shield', '?', 'source != "None" && source != "Buckler"'
  );
  for(var i = 0; i < weapons.length; i++) {
    var pieces = weapons[i].split(':');
    var weapon = pieces[0];
    var profLevel = pieces[1].indexOf('Un') >= 0 ? SRD35.PROFICIENCY_NONE :
                    pieces[1].indexOf('Si') >= 0 ? SRD35.PROFICIENCY_LIGHT :
                    pieces[1].indexOf('Ma') >= 0 ? SRD35.PROFICIENCY_MARTIAL :
                                                   SRD35.PROFICIENCY_HEAVY;
    rules.defineNote(
      'combatNotes.nonproficientWeaponPenalty.' + weapon + ':%V attack',
      'combatNotes.two-handedWeaponWithBucklerPenalty.' + weapon + ':%V attack',
      'sanityNotes.weaponProficiencyLevelWeapon.' + weapon + ':Lowers attack bonus'
    );
    rules.defineRule('weaponAttackAdjustment.' + weapon,
      'weapons.' + weapon, '?', null,
      'combatNotes.nonproficientArmorPenalty', '+=', null,
      'combatNotes.nonproficientShieldPenalty', '+=', null,
      'combatNotes.nonproficientWeaponPenalty.' + weapon, '+=', null,
      'combatNotes.two-handedWeaponWithBucklerPenalty.' + weapon, '+', null
    );
    rules.defineRule('weaponProficiencyLevelShortfall.' + weapon,
      'weapons.' + weapon, '=', profLevel,
      'features.Weapon Familiarity (' + weapon + ')', '+', '-1',
      'weaponProficiencyLevel', '+', '-source',
      'features.Weapon Proficiency (' + weapon + ')', '*', '0'
    );
    rules.defineRule('combatNotes.nonproficientWeaponPenalty.' + weapon,
      'weapons.' + weapon, '=', '-4',
      'weaponProficiencyLevelShortfall.' + weapon, '?', 'source > 0'
    );
    rules.defineRule('sanityNotes.weaponProficiencyLevelWeapon.' + weapon,
      'combatNotes.nonproficientWeaponPenalty.' + weapon, '=', null
    );
    if(pieces[1].indexOf('2h') >= 0) {
      rules.defineRule('combatNotes.two-handedWeaponWithBucklerPenalty.' + weapon,
        'shield', '?', 'source == "Buckler"',
        'weapons.' + weapon, '=', '-1'
      );

      rules.defineRule('sanityNotes.two-handedWeaponWithBuckler',
        'weapons.' + weapon, '=', '1'
      );
      rules.defineRule('validationNotes.two-handedWeaponWithShield',
        'weapons.' + weapon, '=', '1'
      );
    }
  }

  rules.defineRule('goodiesList', 'notes', '=',
    'source.match(/^\\s*\\*/m) ? source.match(/^\\s*\\*.*/gm).reduce(function(list, line) {return list.concat(line.split(";"))}, []) : null'
  );

  for(var ability in {Charisma:'', Constitution:'', Dexterity:'', Intelligence:'', Strength:'', Wisdom:''}) {
    rules.defineRule('abilityNotes.goodies' + ability + 'Adjustment',
      'goodiesList', '=',
        '!source.join(";").match(/\\b' + ability + '\\b/i) ? null : ' +
        'source.filter(item => item.match(/\\b' + ability + '\\b/i)).reduce(' +
          'function(total, item) {' +
            'return total + ((item + "+0").match(/[-+]\\d+/) - 0);' +
          '}' +
        ', 0)'
    );
    rules.defineRule(ability.toLowerCase(),
      'abilityNotes.goodies' + ability + 'Adjustment', '+', null
    );
  }

  rules.defineRule('goodiesAffectingAC',
    'goodiesList', '=',
      '!source.join(";").match(/\\b(armor|protection|shield)\\b/i) ? null : ' +
      'source.filter(item => item.match(/\\b(armor|protection|shield)\\b/i))'
  );
  rules.defineRule('combatNotes.goodiesArmorClassAdjustment',
    'goodiesAffectingAC', '=',
      'source.reduce(' +
        'function(total, item) {' +
          'return total + ((item + "+0").match(/[-+]\\d+/) - 0);' +
        '}' +
      ', 0)'
  );
  rules.defineRule
    ('armorClass', 'combatNotes.goodiesArmorClassAdjustment', '+', null);

  for(var skill in rules.getChoices('skills')) {
    rules.defineRule('skillNotes.goodies' + skill + 'Adjustment',
      'goodiesList', '=',
        '!source.join(";").match(/\\b' + skill + '\\b/i) ? null : ' +
        'source.filter(item => item.match(/\\b' + skill + '\\b/i)).reduce(' +
          'function(total, item) {' +
            'return total + ((item + "+0").match(/[-+]\\d+/) - 0);' +
          '}' +
        ', 0)'
    );
    rules.defineRule('skillModifier.' + skill,
      'skillNotes.goodies' + skill + 'Adjustment', '+', null
    );
  }
  rules.defineNote
    ('skillNotes.goodiesSkillCheckAdjustment:Reduce armor skill check penalty by %V');
  rules.defineRule('skillNotes.armorSkillCheckPenalty',
    'skillNotes.goodiesSkillCheckAdjustment', '+', 'source > 0 ? -source : null'
  );
  rules.defineRule('skillNotes.goodiesSkillCheckAdjustment',
    'goodiesAffectingAC', '=',
      'source.filter(item => item.match(/\\b(armor|shield)\\b/i)).reduce(' +
        'function(total, item) {' +
          'return Math.max(total, item.match(/[-+]\\d|masterwork/i) ? 1 : 0)' +
        '}' +
      ', 0)'
  );

  // NOTE: weapon Attack/Damage bonus rules affect all weapons of a particular
  // type that the character owns. If the character has, e.g., two longswords,
  // both get the bonus. Ignoring this bug for now.
  for(var weapon in rules.getChoices('weapons')) {
    var weaponNoSpace = weapon.replace(/\s+/g, '');
    rules.defineRule('combatNotes.goodies' + weaponNoSpace + 'AttackAdjustment',
      'goodiesList', '=',
        '!source.join(";").match(/\\b' + weapon + '\\b/i) ? null : ' +
        'source.filter(item => item.match(/\\b' + weapon + '\\b/i)).reduce(' +
          'function(total, item) {' +
            'return total + ((item + (item.match(/masterwork/i)?"+1":"+0")).match(/[-+]\\d+/) - 0);' +
          '}' +
        ', 0)'
    );
    rules.defineRule('weaponAttackAdjustment.' + weapon,
      'combatNotes.goodies' + weaponNoSpace + 'AttackAdjustment', '+=', null
    );
    rules.defineRule('combatNotes.goodies' + weaponNoSpace + 'DamageAdjustment',
      'goodiesList', '=',
        '!source.join(";").match(/\\b' + weapon + '\\b/i) ? null : ' +
        'source.filter(item => item.match(/\\b' + weapon + '\\b/i)).reduce(' +
          'function(total, item) {' +
            'return total + ((item + "+0").match(/[-+]\\d+/) - 0);' +
          '}' +
        ', 0)'
    );
    rules.defineRule('weaponDamageAdjustment.' + weapon,
      'combatNotes.goodies' + weaponNoSpace + 'DamageAdjustment', '+=', null
    );
  }
  rules.defineRule('goodiesCompositeStrDamageAdjustment',
    'goodiesList', '?', 'source.filter(item => item.match(/composite/i)).filter(item => item.match(/masterwork|\\+\\d/i)).length > 0',
    'strengthModifier', '=', 'source > 0 ? source : null'
  );
  rules.defineRule('combatNotes.goodiesCompositeLongbowDamageAdjustment',
    'goodiesCompositeStrDamageAdjustment', '+', null
  );
  rules.defineRule('combatNotes.goodiesCompositeShortbowDamageAdjustment',
    'goodiesCompositeStrDamageAdjustment', '+', null
  );

};

/* Defines the rules related to feats. */
SRD35.featRules = function(rules, feats, subfeats) {

  rules.defineRule
    ('featCount.General', 'level', '=', '1 + Math.floor(source / 3)');
  rules.defineNote
    ('validationNotes.featAllocation:%1 available vs. %2 allocated');
  rules.defineRule('validationNotes.featAllocation.1',
    '', '=', '0',
    /^featCount\./, '+=', null
  );
  rules.defineRule('validationNotes.featAllocation.2',
    '', '=', '0',
    /^feats\./, '+=', null
  );
  rules.defineRule('validationNotes.featAllocation',
    'validationNotes.featAllocation.1', '=', '-source',
    'validationNotes.featAllocation.2', '+=', null
  );

  var allFeats = [];
  for(var i = 0; i < feats.length; i++) {
    var pieces = feats[i].split(':');
    var feat = pieces[0];
    var featSubfeats = subfeats == null ? null : subfeats[feat];
    if(featSubfeats == null) {
      allFeats[allFeats.length] = feat + ':' + pieces[1];
    } else if(featSubfeats != '') {
      featSubfeats = featSubfeats.split('/');
      for(var j = 0; j < featSubfeats.length; j++) {
        allFeats[allFeats.length] =
          feat + ' (' + featSubfeats[j] + '):' + pieces[1];
      }
    }
  }

  for(var i = 0; i < allFeats.length; i++) {
    var pieces = allFeats[i].split(':');
    var feat = pieces[0];
    var matchInfo;
    var notes = null;
    if(feat == 'Acrobatic') {
      notes = [
        'sanityNotes.acrobaticFeatSkills:Implies Jump||Tumble',
        'skillNotes.acrobaticFeature:+2 Jump/Tumble'
      ];
    } else if(feat == 'Agile') {
      notes = [
        'sanityNotes.agileFeatSkills:Implies Balance||Escape Artist',
        'skillNotes.agileFeature:+2 Balance/Escape Artist'
      ];
    } else if(feat == 'Alertness') {
      notes = [
        'sanityNotes.alertnessFeatSkills:Implies Listen||Spot',
        'skillNotes.alertnessFeature:+2 Listen/Spot'
      ];
    } else if(feat == 'Animal Affinity') {
      notes = [
        'sanityNotes.animalAffinityFeatSkills:Implies Handle Animal||Ride',
        'skillNotes.animalAffinityFeature:+2 Handle Animal/Ride'
      ];
    } else if(feat == 'Armor Proficiency (Heavy)') {
      notes = [
        'sanityNotes.armorProficiency(Heavy)FeatProficiency:' +
          'Implies Class Armor Proficiency Level < ' + SRD35.PROFICIENCY_HEAVY,
        'validationNotes.armorProficiency(Heavy)FeatProficiency:' +
          'Requires Armor Proficiency (Medium) || ' +
          'Class Armor Proficiency Level >= ' + SRD35.PROFICIENCY_MEDIUM
      ];
      rules.defineRule('armorProficiencyLevel',
        'features.Armor Proficiency (Heavy)', '^', SRD35.PROFICIENCY_HEAVY
      );
      rules.defineRule('validationNotes.armorProficiency(Heavy)FeatProficiency',
        'feats.Armor Proficiency (Heavy)', '=', '-1',
        'features.Armor Proficiency (Medium)', '+', '1',
        'classArmorProficiencyLevel', '+',
        'source == ' + SRD35.PROFICIENCY_MEDIUM + ' ? 1 : null'
      );
    } else if(feat == 'Armor Proficiency (Light)') {
      notes = [
        'sanityNotes.armorProficiency(Light)FeatProficiency:' +
          'Implies Class Armor Proficiency Level < ' + SRD35.PROFICIENCY_LIGHT
      ];
      rules.defineRule('armorProficiencyLevel',
        'features.Armor Proficiency (Light)', '^', SRD35.PROFICIENCY_LIGHT
      );
    } else if(feat == 'Armor Proficiency (Medium)') {
      notes = [
        'sanityNotes.armorProficiency(Medium)FeatProficiency:' +
          'Implies Class Armor Proficiency Level < '+SRD35.PROFICIENCY_MEDIUM,
        'validationNotes.armorProficiency(Medium)FeatProficiency:' +
          'Requires Armor Proficiency (Light) || ' +
          'Class Armor Proficiency Level >= ' + SRD35.PROFICIENCY_LIGHT
      ];
      rules.defineRule('armorProficiencyLevel',
        'features.Armor Proficiency (Medium)', '^', SRD35.PROFICIENCY_MEDIUM
      );
      rules.defineRule(
        'validationNotes.armorProficiency(Medium)FeatProficiency',
        'feats.Armor Proficiency (Medium)', '=', '-1',
        'features.Armor Proficiency (Light)', '+', '1',
        'classArmorProficiencyLevel', '+',
        'source == ' + SRD35.PROFICIENCY_LIGHT + ' ? 1 : null'
      );
    } else if(feat == 'Athletic') {
      notes = [
        'sanityNotes.athleticFeatSkills:Implies Climb||Swim',
        'skillNotes.athleticFeature:+2 Climb/Swim'
      ];
    } else if(feat == 'Augment Summoning') {
      notes = [
        'magicNotes.augmentSummoningFeature:' +
          'Summoned creatures +4 strength/constitution',
        'validationNotes.augmentSummoningFeatFeatures:' +
          'Requires Spell Focus (Conjuration)'
      ];
    } else if(feat == 'Blind-Fight') {
      notes = [
        'combatNotes.blind-FightFeature:' +
          'Reroll concealed miss, no bonus to invisible foe, half penalty ' +
          'for impaired vision'
      ];
    } else if(feat == 'Brew Potion') {
      notes = [
        'magicNotes.brewPotionFeature:Create potion for up to 3rd level spell',
        'validationNotes.brewPotionFeatCasterLevel:Requires Caster Level >= 3'
      ];
    } else if(feat == 'Cleave') {
      notes = [
        'combatNotes.cleaveFeature:Extra attack when foe drops',
        'validationNotes.cleaveFeatAbility:Requires Strength >= 13',
        'validationNotes.cleaveFeatFeatures:Requires Power Attack'
      ];
    } else if(feat == 'Combat Casting') {
      notes = [
        'sanityNotes.combatCastingFeatCasterLevel:Implies Caster Level >= 1',
        'skillNotes.combatCastingFeature:' +
          '+4 Concentration when casting on defensive/grappling'
      ];
    } else if(feat == 'Combat Expertise') {
      notes = [
        'combatNotes.combatExpertiseFeature:Up to -5 attack, +5 AC',
        'validationNotes.combatExpertiseFeatAbility:Requires Intelligence >= 13'
      ];
    } else if(feat == 'Combat Reflexes') {
      notes = [
        'combatNotes.combatReflexesFeature:Flatfooted AOO, up to %V AOO/rd',
        'sanityNotes.combatReflexesFeatAbility:Implies Dexterity >= 12'
      ];
      rules.defineRule('combatNotes.combatReflexesFeature',
        'dexterityModifier', '=', 'source + 1'
      );
    } else if(feat == 'Craft Magic Arms And Armor') {
      notes = [
        'magicNotes.craftMagicArmsAndArmorFeature:' +
          'Create/mend magic weapon/armor/shield',
        'validationNotes.craftMagicArmsAndArmorFeatCasterLevel:' +
          'Requires Caster Level >= 5'
      ];
    } else if(feat == 'Craft Rod') {
      notes = [
        'magicNotes.craftRodFeature:Create magic rod',
        'validationNotes.craftRodFeatCasterLevel:Requires Caster Level >= 9'
      ];
    } else if(feat == 'Craft Staff') {
      notes = [
        'magicNotes.craftStaffFeature:Create magic staff',
        'validationNotes.craftStaffFeatCasterLevel:Requires Caster Level >= 12'
      ];
    } else if(feat == 'Craft Wand') {
      notes = [
        'magicNotes.craftWandFeature:Create wand for up to 4th level spell',
        'validationNotes.craftWandFeatCasterLevel:Requires Caster Level >= 5'
      ];
    } else if(feat == 'Craft Wondrous Item') {
      notes = [
        'magicNotes.craftWondrousItemFeature:' +
          'Create/mend miscellaneous magic item',
        'validationNotes.craftWondrousItemFeatCasterLevel:' +
          'Requires Caster Level >= 3'
      ];
    } else if(feat == 'Deceitful') {
      notes = [
        'sanityNotes.deceitfulFeatSkills:Implies Disguise||Forgery',
        'skillNotes.deceitfulFeature:+2 Disguise/Forgery'
      ];
    } else if(feat == 'Deflect Arrows') {
      notes = [
        'combatNotes.deflectArrowsFeature:Deflect ranged 1/rd',
        'validationNotes.deflectArrowsFeatAbility:Requires Dexterity >= 13',
        'validationNotes.deflectArrowsFeatFeatures:' +
          'Requires Improved Unarmed Strike'
      ];
    } else if(feat == 'Deft Hands') {
      notes = [
        'sanityNotes.deftHandsFeatSkills:Implies Sleight Of Hand||Use Rope',
        'skillNotes.deftHandsFeature:+2 Sleight Of Hand/Use Rope'
      ];
    } else if(feat == 'Diehard') {
      notes = [
        'combatNotes.diehardFeature:Remain conscious/stable w/HP <= 0',
        'validationNotes.diehardFeatFeatures:Requires Endurance'
      ];
    } else if(feat == 'Diligent') {
      notes = [
        'sanityNotes.diligentFeatSkills:Implies Appraise||Decipher Script',
        'skillNotes.diligentFeature:+2 Appraise/Decipher Script'
      ];
    } else if(feat == 'Dodge') {
      notes = [
        'combatNotes.dodgeFeature:+1 AC vs. chosen foe',
        'validationNotes.dodgeFeatAbility:Requires Dexterity >= 13'
      ];
      rules.defineRule('armorClass', 'combatNotes.dodgeFeature', '+', '1');
    } else if(feat == 'Empower Spell') {
      notes = [
        'magicNotes.empowerSpellFeature:' +
          'x1.5 chosen spell variable effects uses +2 spell slot',
        'sanityNotes.empowerSpellFeatCasterLevel:Implies Caster Level >= 1'
      ];
    } else if(feat == 'Endurance') {
      notes = ['saveNotes.enduranceFeature:+4 extended physical action'];
    } else if(feat == 'Enlarge Spell') {
      notes = [
        'magicNotes.enlargeSpellFeature:' +
          'x2 chosen spell range uses +1 spell slot',
        'sanityNotes.enlargeSpellFeatCasterLevel:Implies Caster Level >= 1'
      ];
    } else if(feat == 'Eschew Materials') {
      notes = [
        'magicNotes.eschewMaterialsFeature:Cast spells w/out materials',
        'sanityNotes.eschewMaterialsFeatCasterLevel:Implies Caster Level >= 1'
      ];
    } else if(feat == 'Extend Spell') {
      notes = [
        'magicNotes.extendSpellFeature:' +
          'x2 chosen spell duration uses +1 spell slot',
        'sanityNotes.extendSpellFeatCasterLevel:Implies Caster Level >= 1'
      ];
    } else if(feat == 'Extra Turning') {
      notes = [
        'combatNotes.extraTurningFeature:+4/day',
        'validationNotes.extraTurningFeatTurningLevel:' +
          'Requires Turning Level >= 1'
      ];
      rules.defineRule(/^turn.*\.frequency$/,
        'combatNotes.extraTurningFeature', '+', '4 * source'
      );
    } else if(feat == 'Far Shot') {
      notes = [
        'combatNotes.farShotFeature:x1.5 projectile range, x2 thrown',
        'validationNotes.farShotFeatFeatures:Requires Point Blank Shot'
      ];
    } else if(feat == 'Forge Ring') {
      notes = [
        'magicNotes.forgeRingFeature:Create/mend magic ring',
        'validationNotes.forgeRingFeatCasterLevel:Requires Caster Level >= 12'
      ];
    } else if(feat == 'Great Cleave') {
      notes = [
        'combatNotes.greatCleaveFeature:Cleave w/out limit',
        'validationNotes.greatCleaveFeatAbility:Requires Strength >= 13',
        'validationNotes.greatCleaveFeatBaseAttack:Requires Base Attack >= 4',
        'validationNotes.greatCleaveFeatFeatures:Requires Cleave/Power Attack'
      ];
    } else if(feat == 'Great Fortitude') {
      notes = ['saveNotes.greatFortitudeFeature:+2 Fortitude'];
      rules.defineRule
        ('save.Fortitude', 'saveNotes.greatFortitudeFeature', '+', '2');
    } else if((matchInfo = feat.match(/^Greater Spell Focus \((.*)\)$/))!=null){
      var school = matchInfo[1];
      var schoolNoSpace = school.replace(/ /g, '');
      notes = [
        'magicNotes.spellFocus(' + schoolNoSpace + ')Feat:' +
          '+1 DC on ' + school + ' spells',
        'sanityNotes.greaterSpellFocus(' + schoolNoSpace + ')FeatCasterLevel:' +
          'Implies Caster Level >= 1',
        'validationNotes.greaterSpellFocus(' + schoolNoSpace + ')FeatFeatures:'+
          'Requires Spell Focus (' + school + ')'
      ];
    } else if(feat == 'Greater Spell Penetration') {
      notes = [
        'magicNotes.greaterSpellPenetrationFeature:' +
          '+2 caster level vs. resistance checks',
        'sanityNotes.greaterSpellPenetrationFeatCasterLevel:' +
          'Implies Caster Level >= 1',
        'validationNotes.greaterSpellPenetrationFeatFeatures:' +
          'Requires Spell Penetration'
      ];
    } else if(feat == 'Greater Two-Weapon Fighting') {
      notes = [
        'combatNotes.greaterTwo-WeaponFightingFeature:' +
          'Third off-hand -10 attack',
        'validationNotes.greaterTwo-WeaponFightingFeatAbility:' +
          'Requires Dexterity >= 19',
        'validationNotes.greaterTwo-WeaponFightingFeatBaseAttack:' +
          'Requires Base Attack >= 11',
        'validationNotes.greaterTwo-WeaponFightingFeatFeatures:' +
          'Requires Two-Weapon Fighting/Improved Two-Weapon Fighting'
      ];
    } else if((matchInfo =
               feat.match(/^Greater Weapon Focus \((.*)\)$/)) != null) {
      var weapon = matchInfo[1];
      var weaponNoSpace = weapon.replace(/ /g, '');
      var note = 'combatNotes.greaterWeaponFocus(' + weaponNoSpace + ')Feature';
      notes = [
        note + ':+1 attack',
        'sanityNotes.greaterWeaponFocus(' + weaponNoSpace + ')FeatWeapons:' +
          'Implies ' + weapon,
        'validationNotes.greaterWeaponFocus('+weaponNoSpace+')FeatFeatures:' +
          'Requires Weapon Focus (' + weapon + ')',
        'validationNotes.greaterWeaponFocus(' + weaponNoSpace + ')FeatLevels:' +
          'Requires Fighter >= 8'
      ];
      rules.defineRule('weaponAttackAdjustment.' + weapon, note, '+=', '1');
    } else if((matchInfo =
               feat.match(/^Greater Weapon Specialization \((.*)\)$/))!=null) {
      var weapon = matchInfo[1];
      var weaponNoSpace = weapon.replace(/ /g, '');
      var lead = 'greaterWeaponSpecialization(' + weaponNoSpace + ')';
      var note = 'combatNotes.' + lead + 'Feature';
      notes = [
        note + ':+2 damage',
        'sanityNotes.' + lead + 'FeatWeapons:Implies ' + weapon,
        'validationNotes.' + lead + 'FeatFeatures:' +
          'Requires Weapon Focus (' + weapon + ')/' +
          'Greater Weapon Focus (' + weapon + ')/' +
          'Weapon Specialization (' + weapon + ')',
        'validationNotes.' + lead + 'FeatLevels:Requires Fighter >= 12'
      ];
      rules.defineRule('weaponDamageAdjustment.' + weapon, note, '+=', '2');
    } else if(feat == 'Heighten Spell') {
      notes = [
        'magicNotes.heightenSpellFeature:Increase chosen spell level',
        'sanityNotes.heightenSpellFeatCasterLevel:Implies Caster Level >= 1'
      ];
    } else if(feat == 'Improved Bull Rush') {
      notes = [
        'combatNotes.improvedBullRushFeature:' +
          'No AOO on Bull Rush, +4 strength check',
        'validationNotes.improvedBullRushFeatAbility:Requires Strength >= 13',
        'validationNotes.improvedBullRushFeatFeatures:Requires Power Attack'
      ];
    } else if(feat == 'Improved Counterspell') {
      notes = [
        'magicNotes.improvedCounterspellFeature:' +
          'Counter w/higher-level spell from same school',
        'sanityNotes.improvedCounterspellFeatCasterLevel:' +
          'Implies Caster Level >= 1'
      ];
    } else if((matchInfo = feat.match(/^Improved Critical \((.*)\)$/)) != null){
      var weapon = matchInfo[1];
      var weaponNoSpace = weapon.replace(/ /g, '');
      var note = 'combatNotes.improvedCritical(' + weaponNoSpace + ')Feature';
      notes = [
        note + ':x2 critical threat range',
        'sanityNotes.improvedCritical('+weaponNoSpace+')FeatWeapons:' +
          'Implies ' + weapon,
        'validationNotes.improvedCritical('+weaponNoSpace+')FeatBaseAttack:' +
          'Requires Base Attack >= 8'
      ];
      var weaponPat = new RegExp('^' + weapon + ':');
      var bump = 1;
      for(var j = 0; j < SRD35.WEAPONS.length; j++) {
        var spec = SRD35.WEAPONS[j];
        var criticalMatchInfo;
        if(weapon == null || !spec.match(weaponPat))
          continue;
        if((criticalMatchInfo = spec.match(/@(\d+)/)) != null)
          bump = 21 - criticalMatchInfo[1];
        break;
      }
      rules.defineRule('weaponCriticalAdjustment.' + weapon, note, '+=', bump);
    } else if(feat == 'Improved Disarm') {
      notes = [
        'combatNotes.improvedDisarmFeature:No AOO on Disarm, +4 attack',
        'validationNotes.improvedDisarmFeatAbility:Requires Intelligence >= 13',
        'validationNotes.improvedDisarmFeatFeatures:Requires Combat Expertise'
      ];
    } else if(feat == 'Improved Familiar') {
      notes = [
        'featureNotes.improvedFamiliarFeature:Expanded Familiar choices',
        'validationNotes.improvedFamiliarFeatFeatures:Requires Familiar'
      ];
    } else if(feat == 'Improved Feint') {
      notes = [
        'combatNotes.improvedFeintFeature:Bluff check to Feint as move action',
        'validationNotes.improvedFeintFeatAbility:Requires Intelligence >= 13',
        'validationNotes.improvedFeintFeatFeatures:Requires Combat Expertise'
      ];
    } else if(feat == 'Improved Grapple') {
      notes = [
        'combatNotes.improvedGrappleFeature:No AOO on Grapple, +4 Grapple',
        'validationNotes.improvedGrappleFeatAbility:Requires Dexterity >= 13',
        'validationNotes.improvedGrappleFeatFeatures:' +
          'Requires Improved Unarmed Strike'
      ];
    } else if(feat == 'Improved Initiative') {
      notes = ['combatNotes.improvedInitiativeFeature:+4 initiative'];
      rules.defineRule
        ('initiative', 'combatNotes.improvedInitiativeFeature', '+', '4');
    } else if(feat == 'Improved Overrun') {
      notes = [
        'combatNotes.improvedOverrunFeature:' +
          'Foe cannot avoid, +4 strength check',
        'validationNotes.improvedOverrunFeatAbility:Requires Strength >= 13',
        'validationNotes.improvedOverrunFeatFeatures:Requires Power Attack'
      ];
    } else if(feat == 'Improved Precise Shot') {
      notes = [
        'combatNotes.improvedPreciseShotFeature:' +
          'No foe AC bonus for partial concealment, attack grappling target',
        'validationNotes.improvedPreciseShotFeatAbility:' +
          'Requires Dexterity >= 19',
        'validationNotes.improvedPreciseShotFeatBaseAttack:' +
          'Requires Base Attack >= 11',
        'validationNotes.improvedPreciseShotFeatFeatures:' +
          'Requires Point Blank Shot/Precise Shot'
      ];
    } else if(feat == 'Improved Shield Bash') {
      notes = [
        'combatNotes.improvedShieldBashFeature:No AC penalty on Shield Bash',
        'sanityNotes.improvedShieldBashFeatShield:Implies Shield != "None"',
        'validationNotes.improvedShieldBashFeatProficiency:' +
          'Requires Shield Proficiency (Heavy) || ' +
          'Class Shield Proficiency Level >= ' + SRD35.PROFICIENCY_HEAVY
      ];
    } else if(feat == 'Improved Sunder') {
      notes = [
        'combatNotes.improvedSunderFeature:No AOO on Sunder, +4 attack',
        'validationNotes.improvedSunderFeatAbility:Requires Strength >= 13',
        'validationNotes.improvedSunderFeatFeatures:Requires Power Attack'
      ];
    } else if(feat == 'Improved Trip') {
      notes = [
        'combatNotes.improvedTripFeature:' +
          'No AOO on Trip, +4 strength check, attack after trip',
        'validationNotes.improvedTripFeatAbility:Requires Intelligence >= 13',
        'validationNotes.improvedTripFeatFeats:Requires Combat Expertise'
      ];
    } else if(feat == 'Improved Turning') {
      notes = [
        'combatNotes.improvedTurningFeature:+1 turning level',
        'validationNotes.improvedTurningFeatTurningLevel:' +
          'Requires Turning Level >= 1'
      ];
      rules.defineRule
        (/^turn.*\.level$/, 'combatNotes.improvedTurningFeature', '+', '1');
    } else if(feat == 'Improved Two-Weapon Fighting') {
      notes = [
        'combatNotes.improvedTwo-WeaponFightingFeature:' +
          'Second off-hand -5 attack',
        'validationNotes.improvedTwo-WeaponFightingFeatAbility:' +
          'Requires Dexterity >= 17',
        'validationNotes.improvedTwo-WeaponFightingFeatBaseAttack:' +
          'Requires Base Attack >= 6',
        'validationNotes.improvedTwo-WeaponFightingFeatFeatures:' +
          'Requires Two-Weapon Fighting'
      ];
    } else if(feat == 'Improved Unarmed Strike') {
      notes = [
        'combatNotes.improvedUnarmedStrikeFeature:' +
          'No AOO on unarmed attack, may deal lethal damage'
      ];
    } else if(feat == 'Investigator') {
      notes = [
        'sanityNotes.investigatorFeatSkills:Implies Gather Information||Search',
        'skillNotes.investigatorFeature:+2 Gather Information/Search'
      ];
    } else if(feat == 'Iron Will') {
      notes = ['saveNotes.ironWillFeature:+2 Will'];
      rules.defineRule('save.Will', 'saveNotes.ironWillFeature', '+', '2');
    } else if(feat == 'Leadership') {
      notes = [
        'featureNotes.leadershipFeature:Attract followers',
        'validationNotes.leadershipFeatLevel:Requires Level >= 6'
      ];
    } else if(feat == 'Lightning Reflexes') {
      notes = ['saveNotes.lightningReflexesFeature:+2 Reflex'];
      rules.defineRule
        ('save.Reflex', 'saveNotes.lightningReflexesFeature', '+', '2');
    } else if(feat == 'Magical Aptitude') {
      notes = [
        'sanityNotes.magicalAptitudeFeatSkills:' +
          'Implies Spellcraft||Use Magic Device',
        'skillNotes.magicalAptitudeFeature:+2 Spellcraft/Use Magic Device'
      ];
    } else if(feat == 'Manyshot') {
      notes = [
        'combatNotes.manyshotFeature:' +
          'Fire up to %V arrows simultaneously at -2 attack',
        'validationNotes.manyshotFeatAbility:Requires Dexterity >= 17',
        'validationNotes.manyshotFeatBaseAttack:Requires Base Attack >= 6',
        'validationNotes.manyshotFeatFeatures:' +
          'Requires Point Blank Shot/Rapid Shot'
      ];
      rules.defineRule('combatNotes.manyshotFeature',
        'baseAttack', '=', 'Math.floor((source + 9) / 5)'
      );
    } else if(feat == 'Maximize Spell') {
      notes = [
        'magicNotes.maximizeSpellFeature:' +
          'Maximize all chosen spell variable effects uses +3 spell slot',
        'sanityNotes.maximizeSpellFeatCasterLevel:Implies Caster Level >= 1'
      ];
    } else if(feat == 'Mobility') {
      notes = [
        'combatNotes.mobilityFeature:+4 AC vs. movement AOO',
        'validationNotes.mobilityFeatAbility:Requires Dexterity >= 13',
        'validationNotes.mobilityFeatFeatures:Requires Dodge'
      ];
    } else if(feat == 'Mounted Archery') {
      notes = [
        'combatNotes.mountedArcheryFeature:x.5 mounted ranged penalty',
        'validationNotes.mountedArcheryFeatFeatures:Requires Mounted Combat',
        'validationNotes.mountedArcheryFeatSkills:Requires Ride'
      ];
    } else if(feat == 'Mounted Combat') {
      notes = [
        'combatNotes.mountedCombatFeature:' +
          'Ride skill save vs. mount damage 1/rd',
        'validationNotes.mountedCombatFeatSkills:Requires Ride'
      ];
    } else if(feat == 'Natural Spell') {
      notes = [
        'magicNotes.naturalSpellFeature:Cast spell during <i>Wild Shape</i>',
        'validationNotes.naturalSpellFeatAbility:Requires Wisdom >= 13',
        'validationNotes.naturalSpellFeatFeatures:Requires Wild Shape'
      ];
    } else if(feat == 'Negotiator') {
      notes = [
        'sanityNotes.negotiatorFeatSkills:Implies Diplomacy||Sense Motive',
        'skillNotes.negotiatorFeature:+2 Diplomacy/Sense Motive'
      ];
    } else if(feat == 'Nimble Fingers') {
      notes = [
        'sanityNotes.nimbleFingersFeatSkills:Implies Disable Device||Open Lock',
        'skillNotes.nimbleFingersFeature:+2 Disable Device/Open Lock'
      ];
    } else if(feat == 'Persuasive') {
      notes = [
        'sanityNotes.persuasiveFeatSkills:Implies Bluff||Intimidate',
        'skillNotes.persuasiveFeature:+2 Bluff/Intimidate'
      ];
    } else if(feat == 'Point Blank Shot') {
      notes = [
        "combatNotes.pointBlankShotFeature:+1 ranged attack/damage w/in 30'"
      ];
    } else if(feat == 'Power Attack') {
      notes = [
        'combatNotes.powerAttackFeature:Attack base -attack/+damage',
        'validationNotes.powerAttackFeatAbility:Requires Strength >= 13'
      ];
    } else if(feat == 'Precise Shot') {
      notes = [
        'combatNotes.preciseShotFeature:No penalty on shot into melee',
        'validationNotes.preciseShotFeatFeatures:Requires Point Blank Shot'
      ];
    } else if(feat == 'Quick Draw') {
      notes = [
        'combatNotes.quickDrawFeature:Draw weapon as free action',
        'validationNotes.quickDrawFeatBaseAttack:Requires Base Attack >= 1'
      ];
    } else if(feat == 'Quicken Spell') {
      notes = [
        'magicNotes.quickenSpellFeature:' +
          'Free action casting 1/rd uses +4 spell slot',
        'sanityNotes.quickenSpellFeatCasterLevel:Implies Caster Level >= 1'
      ];
    } else if((matchInfo = feat.match(/^Rapid Reload \((.*)\)$/)) != null) {
      var weapon = matchInfo[1];
      var weaponNoSpace = weapon.replace(/ /g, '');
      notes = [
        'combatNotes.rapidReload(' + weaponNoSpace + ')Feature:' +
          'Reload ' + weapon + ' Crossbow as ' +
          (weapon == 'Heavy' ? 'move' : 'free') + ' action',
        'sanityNotes.rapidReload(' + weaponNoSpace + ')FeatWeapons:' +
          'Implies ' + weapon + ' Crossbow'
      ];
    } else if(feat == 'Rapid Shot') {
      notes = [
        'combatNotes.rapidShotFeature:Normal and extra ranged -2 attacks',
        'validationNotes.rapidShotFeatAbility:Requires Dexterity >= 13',
        'validationNotes.rapidShotFeatFeatures:Requires Point Blank Shot'
      ];
    } else if(feat == 'Ride-By Attack') {
      notes = [
        'combatNotes.ride-ByAttackFeature:Move before and after mounted attack',
        'validationNotes.ride-ByAttackFeatFeatures:Requires Mounted Combat',
        'validationNotes.ride-ByAttackFeatSkills:Requires Ride'
      ];
    } else if(feat == 'Run') {
      notes = [
        'abilityNotes.runFeature:+1 run speed multiplier',
        'skillNotes.runFeature:+4 running Jump'
      ];
      rules.defineRule
        ('runSpeedMultiplier', 'abilityNotes.runFeature', '+', '1');
    } else if(feat == 'Scribe Scroll') {
      notes = [
        'magicNotes.scribeScrollFeature:Create scroll of any known spell',
        'validationNotes.scribeScrollFeatCasterLevel:Requires Caster Level >= 1'
      ];
    } else if(feat == 'Self Sufficient') {
      notes = [
        'sanityNotes.selfSufficientFeatSkills:Implies Heal||Survival',
        'skillNotes.selfSufficientFeature:+2 Heal/Survival'
      ];
    } else if(feat == 'Shield Proficiency (Heavy)') {
      notes = [
        'sanityNotes.shieldProficiency(Heavy)FeatProficiency:' +
          'Implies Class Shield Proficiency Level < ' + SRD35.PROFICIENCY_HEAVY
      ];
      rules.defineRule('shieldProficiencyLevel',
        'features.Shield Proficiency (Heavy)', '^', SRD35.PROFICIENCY_HEAVY
      );
    } else if(feat == 'Shield Proficiency (Tower)') {
      notes = [
        'sanityNotes.shieldProficiency(Tower)FeatProficiency:' +
          'Implies Class Shield Proficiency Level < ' + SRD35.PROFICIENCY_TOWER
      ];
      rules.defineRule('shieldProficiencyLevel',
        'features.Shield Proficiency (Tower)', '^', SRD35.PROFICIENCY_TOWER
      );
    } else if(feat == 'Shot On The Run') {
      notes = [
        'combatNotes.shotOnTheRunFeature:Move before and after ranged attack',
        'validationNotes.shotOnTheRunFeatAbility:Requires Dexterity >= 13',
        'validationNotes.shotOnTheRunFeatBaseAttack:Requires Base Attack >= 4',
        'validationNotes.shotOnTheRunFeatFeatures:' +
          'Requires Dodge/Mobility/Point Blank Shot'
      ];
    } else if(feat == 'Silent Spell') {
      notes = [
        'magicNotes.silentSpellFeature:' +
          'Cast spell w/out speech uses +1 spell slot',
        'sanityNotes.silentSpellFeatCasterLevel:Implies Caster Level >= 1'
      ];
    } else if((matchInfo = feat.match(/^Skill Focus \((.*)\)$/)) != null) {
      var skill = matchInfo[1];
      var skillNoSpace = skill.replace(/ /g, '');
      var note = 'skillNotes.skillFocus(' + skillNoSpace + ')Feature';
      notes = [
        note + ':+3 checks',
        'sanityNotes.skillFocus(' + skillNoSpace + ')FeatSkills:' +
          'Implies ' + skill
      ];
      rules.defineRule('skillModifier.' + skill, note, '+', '3');
    } else if(feat == 'Snatch Arrows') {
      notes = [
        'combatNotes.snatchArrowsFeature:Catch ranged weapons',
        'validationNotes.snatchArrowsFeatAbility:Requires Dexterity >= 15',
        'validationNotes.snatchArrowsFeatFeatures:' +
          'Requires Deflect Arrows/Improved Unarmed Strike'
      ];
    } else if((matchInfo = feat.match(/^Spell Focus \((.*)\)$/)) != null) {
      var school = matchInfo[1];
      var schoolNoSpace = school.replace(/ /g, '');
      notes = [
        'magicNotes.spellFocus(' + schoolNoSpace + ')Feature:' +
          '+1 DC on ' + school + ' spells',
        'sanityNotes.spellFocus(' + schoolNoSpace + ')FeatCasterLevel:' +
          'Implies Caster Level >= 1'
      ];
    } else if(feat == 'Spell Mastery') {
      notes = [
        'magicNotes.spellMasteryFeature:Prepare %V spells w/out spellbook',
        'validationNotes.spellMasteryFeatLevels:Requires Wizard >= 1'
      ];
      rules.defineRule
        ('magicNotes.spellMasteryFeature', 'intelligenceModifier', '=', null);
    } else if(feat == 'Spell Penetration') {
      notes = [
        'magicNotes.spellPenetrationFeature:' +
          '+2 checks to overcome spell resistance',
        'sanityNotes.spellPenetrationFeatCasterLevel:Implies Caster Level >= 1'
      ];
    } else if(feat == 'Spirited Charge') {
      notes = [
        'combatNotes.spiritedChargeFeature:' +
          'x2 damage (x3 lance) from mounted charge',
        'validationNotes.spiritedChargeFeatFeatures:' +
          'Requires Mounted Combat/Ride-By Attack',
        'validationNotes.spiritedChargeFeatSkills:Requires Ride'
      ];
    } else if(feat == 'Spring Attack') {
      notes = [
        'combatNotes.springAttackFeature:Move before and after melee attack',
        'validationNotes.springAttackFeatAbility:Requires Dexterity >= 13',
        'validationNotes.springAttackFeatBaseAttack:Requires Base Attack >= 4',
        'validationNotes.springAttackFeatFeatures:Requires Dodge/Mobility'
      ];
    } else if(feat == 'Stealthy') {
      notes = [
        'sanityNotes.stealthyFeatSkills:Implies Hide||Move Silently',
        'skillNotes.stealthyFeature:+2 Hide/Move Silently'
      ];
    } else if(feat == 'Still Spell') {
      notes = [
        'magicNotes.stillSpellFeature:' +
          'Cast spell w/out movement uses +1 spell slot',
        'sanityNotes.stillSpellFeatCasterLevel:Implies Caster Level >= 1'
      ];
    } else if(feat == 'Stunning Fist') {
      notes = [
        'combatNotes.stunningFistFeature:' +
          'Foe %V Fortitude save or stunned %1/day',
        'validationNotes.stunningFistFeatAbility:' +
          'Requires Dexterity >= 13/Wisdom >= 13',
        'validationNotes.stunningFistFeatBaseAttack:Requires Base Attack >= 8',
        'validationNotes.stunningFistFeatFeatures:' +
          'Requires Improved Unarmed Strike'
      ];
      rules.defineRule('combatNotes.stunningFistFeature',
        'level', '=', '10 + Math.floor(source / 2)',
        'wisdomModifier', '+', null
      );
      rules.defineRule('combatNotes.stunningFistFeature.1',
        'level', '+=', 'Math.floor(source / 4)'
      );
    } else if(feat == 'Toughness') {
      notes = ['combatNotes.toughnessFeature:+3 HP'];
      rules.defineRule('hitPoints', 'combatNotes.toughnessFeature', '+', '3');
    } else if(feat == 'Track') {
      notes = [
        'sanityNotes.trackFeatSkills:Implies Survival',
        'skillNotes.trackFeature:Survival to follow creatures\' trail'
      ];
    } else if(feat == 'Trample') {
      notes = [
        'combatNotes.trampleFeature:' +
          'Mounted overrun unavoidable, bonus hoof attack',
        'validationNotes.trampleFeatFeatures:Requires Mounted Combat',
        'validationNotes.trampleFeatSkills:Requires Ride'
      ];
    } else if(feat == 'Two-Weapon Defense') {
      notes = [
        'combatNotes.two-WeaponDefenseFeature:' +
          '+1 AC w/two weapons, +2 when fighting defensively',
        'validationNotes.two-WeaponDefenseFeatAbility:Requires Dexterity >= 15',
        'validationNotes.two-WeaponDefenseFeatFeatures:' +
          'Requires Two-Weapon Fighting'
      ];
    } else if(feat == 'Two-Weapon Fighting') {
      notes = [
        'combatNotes.two-WeaponFightingFeature:' +
          'Reduce on-hand penalty by 2, off-hand by 6',
        'validationNotes.two-WeaponFightingFeatAbility:Requires Dexterity >= 15'
      ];
    } else if(feat == 'Weapon Finesse') {
      notes = [
        'combatNotes.weaponFinesseFeature:' +
          '+%V light melee attack (dex instead of str)',
        'sanityNotes.weaponFinesseFeatAbility:' +
          'Implies Dexterity Modifier exceed Strength Modifier',
        'validationNotes.weaponFinesseFeatBaseAttack:Requires Base Attack >= 1'
      ];
      rules.defineRule('combatNotes.weaponFinesseFeature',
        'dexterityModifier', '=', null,
        'strengthModifier', '+', '-source'
      );
      rules.defineRule('sanityNotes.weaponFinesseFeatAbility',
        'feats.Weapon Finesse', '=', '-1',
        'dexterityModifier', '+', 'source',
        'strengthModifier', '+', '-source',
        '', 'v', '0'
      );
    } else if((matchInfo = feat.match(/^Weapon Focus \((.*)\)$/)) != null) {
      var weapon = matchInfo[1];
      var weaponNoSpace = weapon.replace(/ /g, '');
      var note = 'combatNotes.weaponFocus(' + weaponNoSpace + ')Feature';
      notes = [
        note + ':+1 attack',
        'sanityNotes.weaponFocus(' + weaponNoSpace + ')FeatWeapons:' +
          'Implies ' + weapon,
        'validationNotes.weaponFocus(' + weaponNoSpace + ')FeatBaseAttack:' +
          'Requires Base Attack >= 1'
      ];
      rules.defineRule('weaponAttackAdjustment.' + weapon, note, '+=', '1');
    } else if(feat == 'Weapon Proficiency (Simple)') {
      notes = [
        'sanityNotes.weaponProficiency(Simple)FeatProficiency:' +
          'Implies Class Weapon Proficiency Level < ' + SRD35.PROFICIENCY_LIGHT
      ];
      rules.defineRule('weaponProficiencyLevel',
        'features.' + feat, '^', SRD35.PROFICIENCY_LIGHT
      );
    } else if((matchInfo = feat.match(/^Weapon Proficiency \((.*)\)$/))!=null) {
      var weapon = matchInfo[1];
      var weaponNoSpace = weapon.replace(/ /g, '');
      var familiarityAttr = 'features.Weapon Familiarity (' + weapon + ')';
      notes = [
        'sanityNotes.weaponProficiency(' + weaponNoSpace + ')FeatWeapons:' +
          'Implies ' + weapon,
        'validationNotes.weaponProficiency(' + weaponNoSpace +
          ')FeatBaseAttack:Requires Base Attack >= 1'
      ];
      rules.defineRule('validationNotes.weaponProficiency(' + weaponNoSpace +
        ')FeatBaseAttack', familiarityAttr, '^', '0');
      if(weapon == 'Bastard Sword' || weapon == 'Dwarven Waraxe') {
        notes = notes.concat([
          'validationNotes.weaponProficiency(' + weaponNoSpace +
            ')FeatStrength:Requires Strength >= 13'
        ]);
        rules.defineRule('validationNotes.weaponProficiency(' + weaponNoSpace +
          ')FeatStrength', familiarityAttr, '^', '0');
      }
    } else if((matchInfo =
               feat.match(/^Weapon Specialization \((.*)\)$/)) != null) {
      var weapon = matchInfo[1];
      var weaponNoSpace = weapon.replace(/ /g, '');
      var note = 'combatNotes.weaponSpecialization('+weaponNoSpace+')Feature';
      notes = [
        note + ':+2 damage',
        'sanityNotes.weaponSpecialization(' + weaponNoSpace + ')FeatWeapons:' +
          'Implies ' + weapon,
        'validationNotes.weaponSpecialization('+weaponNoSpace+')FeatFeatures:' +
          'Requires Weapon Focus (' + weapon + ')',
        'validationNotes.weaponSpecialization('+weaponNoSpace+')FeatLevels:' +
          'Requires Fighter >= 4'
      ];
      rules.defineRule('weaponDamageAdjustment.' + weapon, note, '+=', '2');
    } else if(feat == 'Whirlwind Attack') {
      notes = [
        'combatNotes.whirlwindAttackFeature:Attack all foes w/in reach',
        'validationNotes.whirlwindAttackFeatAbility:' +
          'Requires Dexterity >= 13/Intelligence >= 13',
        'validationNotes.whirlwindAttackFeatBaseAttack:' +
          'Requires Base Attack >= 4',
        'validationNotes.whirlwindAttackFeatFeatures:' +
          'Requires Combat Expertise/Dodge/Mobility/Spring Attack'
      ];
    } else if(feat == 'Widen Spell') {
      notes = [
        'magicNotes.widenSpellFeature:x2 area of affect uses +3 spell slot',
        'sanityNotes.widenSpellFeatCasterLevel:Implies Caster Level >= 1'
      ];
    } else {
      continue;
    }
    rules.defineChoice('feats', feat + ':' + pieces[1]);
    rules.defineRule('features.' + feat, 'feats.' + feat, '=', null);
    if(notes != null)
      rules.defineNote(notes);
  }

};

/* Defines the rules related to spells and domains. */
SRD35.magicRules = function(rules, classes, domains, schools) {

  rules.defineChoice('schools', schools);
  schools = rules.getChoices('schools');

  for(var i = 0; i < classes.length; i++) {
    var klass = classes[i];
    var spells;
    if(klass == 'Bard') {
      spells = [
        'B0:Dancing Lights:Daze:Detect Magic:Flare:Ghost Sound:' +
        'Know Direction:Light:Lullaby:Mage Hand:Mending:Message:Open/Close:' +
        'Prestidigitation:Read Magic:Resistance:Summon Instrument',
        'B1:Alarm:Animate Rope:Cause Fear:Charm Person:Comprehend Languages:' +
        'Cure Light Wounds:Detect Secret Doors:Disguise Self:Erase:' +
        'Expeditious Retreat:Feather Fall:Grease:Hideous Laughter:Hypnotism:' +
        'Identify:Lesser Confusion:Magic Aura:Magic Mouth:Obscure Object:' +
        'Remove Fear:Silent Image:Sleep:Summon Monster I:' +
        'Undetectable Alignment:Unseen Servant:Ventriloquism',
        'B2:Alter Self:Animal Messenger:Animal Trance:Blindness/Deafness:' +
        'Blur:Calm Emotions:Cat\'s Grace:Cure Moderate Wounds:Darkness:' +
        'Daze Monster:Delay Poison:Detect Thoughts:Eagle\'s Splendor:' +
        'Enthrall:Fox\'s Cunning:Glitterdust:Heroism:Hold Person:' +
        'Hypnotic Pattern:Invisibility:Locate Object:Minor Image:' +
        'Mirror Image:Misdirection:Pyrotechnics:Rage:Scare:Shatter:Silence:' +
        'Sound Burst:Suggestion:Summon Monster II:Summon Swarm:Tongues:' +
        'Whispering Wind',
        'B3:Blink:Charm Monster:Clairaudience/Clairvoyance:Confusion:' +
        'Crushing Despair:Cure Serious Wounds:Daylight:Deep Slumber:' +
        'Dispel Magic:Displacement:Fear:Gaseous Form:Glibness:Good Hope:' +
        'Haste:Illusory Script:Invisibility Sphere:Lesser Geas:Major Image:' +
        'Phantom Steed:Remove Curse:Scrying:Sculpt Sound:Secret Page:' +
        'See Invisibility:Sepia Snake Sigil:Slow:Speak With Animals:' +
        'Summon Monster III:Tiny Hut',
        'B4:Break Enchantment:Cure Critical Wounds:Detect Scrying:' +
        'Dimension Door:Dominate Person:Freedom Of Movement:' +
        'Greater Invisibility:Hallucinatory Terrain:Hold Monster:Legend Lore:' +
        'Locate Creature:Modify Memory:Neutralize Poison:Rainbow Pattern:' +
        'Repel Vermin:Secure Shelter:Shadow Conjuration:Shout:' +
        'Speak With Plants:Summon Monster IV:Zone Of Silence',
        'B5:Dream:False Vision:Greater Dispel Magic:Greater Heroism:' +
        'Mass Cure Light Wounds:Mass Suggestion:Mind Fog:Mirage Arcana:' +
        'Mislead:Nightmare:Persistent Image:Seeming:Shadow Evocation:' +
        'Shadow Walk:Song Of Discord:Summon Monster V',
        'B6:Analyze Dweomer:Animate Objects:Eyebite:Find The Path:Geas/Quest:' +
        'Greater Scrying:Greater Shout:Heroes\' Feast:Irresistible Dance:' +
        'Mass Cat\'s Grace:Mass Charm Monster:Mass Cure Moderate Wounds:' +
        'Mass Eagle\'s Splendor:' + 'Mass Fox\'s Cunning:Permanent Image:' +
        'Programmed Image:Project Image:Summon Monster VI:' +
        'Sympathetic Vibration:Veil'
      ];
    } else if(klass == 'Cleric') {
      spells = [
        'C0:Create Water:Cure Minor Wounds:Detect Magic:Detect Poison:' +
        'Guidance:Inflict Minor Wounds:Light:Mending:Purify Food And Drink:' +
        'Read Magic:Resistance:Virtue',
        'C1:Bane:Bless:Bless Water:Cause Fear:Command:Comprehend Languages:' +
        'Cure Light Wounds:Curse Water:Deathwatch:Detect Chaos:Detect Evil:' +
        'Detect Good:Detect Law:Detect Undead:Divine Favor:Doom:' +
        'Endure Elements:Entropic Shield:Hide From Undead:' +
        'Inflict Light Wounds:Magic Stone:Magic Weapon:Obscuring Mist:' +
        'Protection From Chaos:Protection From Evil:Protection From Good:' +
        'Protection From Law:Remove Fear:Sanctuary:Shield Of Faith:' +
        'Summon Monster I',
        'C2:Aid:Align Weapon:Augury:Bear\'s Endurance:Bull\'s Strength:' +
        'Calm Emotions:Consecrate:Cure Moderate Wounds:Darkness:Death Knell:' +
        'Delay Poison:Desecrate:Eagle\'s Splendor:Enthrall:Find Traps:' +
        'Gentle Repose:Hold Person:Inflict Moderate Wounds:' +
        'Lesser Restoration:Make Whole:Owl\'s Wisdom:Remove Paralysis:' +
        'Resist Energy:Shatter:Shield Other:Silence:Sound Burst:' +
        'Spiritual Weapon:Status:Summon Monster II:Undetectable Alignment:' +
        'Zone Of Truth',
        'C3:Animate Dead:Bestow Curse:Blindness/Deafness:Contagion:' +
        'Continual Flame:Create Food And Water:Cure Serious Wounds:Daylight:' +
        'Deeper Darkness:Dispel Magic:Glyph Of Warding:Helping Hand:' +
        'Inflict Serious Wounds:Invisibility Purge:Locate Object:' +
        'Magic Circle Against Chaos:Magic Circle Against Evil:' +
        'Magic Circle Against Good:Magic Circle Against Law:' +
        'Magic Vestment:Meld Into Stone:Obscure Object:Prayer:' +
        'Protection From Energy:Remove Blindness/Deafness:Remove Curse:' +
        'Remove Disease:Searing Light:Speak With Dead:Stone Shape:' +
        'Summon Monster III:Water Breathing:Water Walk:Wind Wall',
        'C4:Air Walk:Control Water:Cure Critical Wounds:Death Ward:' +
        'Dimensional Anchor:Discern Lies:Dismissal:Divination:Divine Power:' +
        'Freedom Of Movement:Giant Vermin:Greater Magic Weapon:' +
        'Imbue With Spell Ability:Inflict Critical Wounds:' +
        'Lesser Planar Ally:Neutralize Poison:Poison:Repel Vermin:' +
        'Restoration:Sending:Spell Immunity:Summon Monster IV:Tongues',
        'C5:Atonement:Break Enchantment:Commune:Dispel Chaos:Dispel Evil:' +
        'Dispel Good:Dispel Law:Disrupting Weapon:Flame Strike:' +
        'Greater Command:Hallow:Insect Plague:Mark Of Justice:' +
        'Mass Cure Light Wounds:Mass Inflict Light Wounds:Plane Shift:' +
        'Raise Dead:Righteous Might:Scrying:Slay Living:Spell Resistance:' +
        'Summon Monster V:Symbol Of Pain:Symbol Of Sleep:True Seeing:' +
        'Unhallow:Wall Of Stone',
        'C6:Animate Objects:Antilife Shell:Banishment:Blade Barrier:' +
        'Create Undead:Find The Path:Forbiddance:Geas/Quest:' +
        'Greater Dispel Magic:Greater Glyph Of Warding:Harm:Heal:' +
        'Heroes\' Feast:Mass Bear\'s Endurance:Mass Bull\'s Strength:' +
        'Mass Cure Moderate Wounds:Mass Eagle\'s Splendor:' +
        'Mass Inflict Moderate Wounds:Mass Owl\'s Wisdom:Planar Ally:' +
        'Summon Monster VI:Symbol Of Fear:Symbol Of Persuasion:' +
        'Undeath To Death:Wind Walk:Word Of Recall',
        'C7:Blasphemy:Control Weather:Destruction:Dictum:Ethereal Jaunt:' +
        'Greater Restoration:Greater Scrying:Holy Word:' +
        'Mass Cure Serious Wounds:Mass Inflict Serious Wounds:Refuge:' +
        'Regenerate:Repulsion:Resurrection:Summon Monster VII:' +
        'Symbol Of Stunning:Symbol Of Weakness:Word Of Chaos',
        'C8:Antimagic Field:Cloak Of Chaos:Create Greater Undead:' +
        'Dimensional Lock:Discern Location:Earthquake:Fire Storm:' +
        'Greater Planar Ally:Greater Spell Immunity:Holy Aura:' +
        'Mass Cure Critical Wounds:Mass Inflict Critical Wounds:' +
        'Shield Of Law:Summon Monster VIII:Symbol Of Death:' +
        'Symbol Of Insanity:Unholy Aura',
        'C9:Astral Projection:Energy Drain:Etherealness:Gate:Implosion:' +
        'Mass Heal:Miracle:Soul Bind:Storm Of Vengeance:Summon Monster IX:' +
        'True Resurrection'
      ];
    } else if(klass == 'Druid') {
      spells = [
        'D0:Create Water:Cure Minor Wounds:Detect Magic:Detect Poison:Flare:' +
        'Guidance:Know Direction:Light:Mending:Purify Food And Drink:' +
        'Read Magic:Resistance:Virtue',
        'D1:Calm Animals:Charm Animal:Cure Light Wounds:' +
        'Detect Animals Or Plants:Detect Snares And Pits:Endure Elements:' +
        'Entangle:Faerie Fire:Goodberry:Hide From Animals:Jump:Longstrider:' +
        'Magic Fang:Magic Stone:Obscuring Mist:Pass Without Trace:' +
        'Produce Flame:Shillelagh:Speak With Animals:Summon Nature\'s Ally I',
        'D2:Animal Messenger:Animal Trance:Barkskin:Bear\'s Endurance:' +
        'Bull\'s Strength:Cat\'s Grace:Chill Metal:Delay Poison:Fire Trap:' +
        'Flame Blade:Flaming Sphere:Fog Cloud:Gust Of Wind:Heat Metal:' +
        'Hold Animal:Lesser Restoration:Owl\'s Wisdom:Reduce Animal:' +
        'Resist Energy:Soften Earth And Stone:Spider Climb:' +
        'Summon Nature\'s Ally II:Summon Swarm:Tree Shape:Warp Wood:Wood Shape',
        'D3:Call Lightning:Contagion:Cure Moderate Wounds:Daylight:' +
        'Diminish Plants:Dominate Animal:Greater Magic Fang:Meld Into Stone:' +
        'Neutralize Poison:Plant Growth:Poison:Protection From Energy:Quench:' +
        'Remove Disease:Sleet Storm:Snare:Speak With Plants:Spike Growth:' +
        'Stone Shape:Summon Nature\'s Ally III:Water Breathing:Wind Wall',
        'D4:Air Walk:Antiplant Shell:Blight:Command Plants:Control Water:' +
        'Cure Serious Wounds:Dispel Magic:Flame Strike:Freedom Of Movement:' +
        'Giant Vermin:Ice Storm:Reincarnate:Repel Vermin:Rusting Grasp:' +
        'Scrying:Spike Stones:Summon Nature\'s Ally IV',
        'D5:Animal Growth:Atonement:Awaken:Baleful Polymorph:' +
        'Call Lightning Storm:Commune With Nature:Control Winds:' +
        'Cure Critical Wounds:Death Ward:Hallow:Insect Plague:Stoneskin:' +
        'Summon Nature\'s Ally V:Transmute Mud To Rock:Transmute Rock To Mud:' +
        'Tree Stride:Unhallow:Wall Of Fire:Wall Of Thorns',
        'D6:Antilife Shell:Find The Path:Fire Seeds:Greater Dispel Magic:' +
        'Ironwood:Liveoak:Mass Bear\'s Endurance:Mass Bull\'s Strength:' +
        'Mass Cat\'s Grace:Mass Cure Light Wounds:Mass Owl\'s Wisdom:' +
        'Move Earth:Repel Wood:Spellstaff:Stone Tell:' +
        'Summon Nature\'s Ally VI:Transport Via Plants:Wall Of Stone',
        'D7:Animate Plants:Changestaff:Control Weather:Creeping Doom:' +
        'Fire Storm:Greater Scrying:Heal:Mass Cure Moderate Wounds:' +
        'Summon Nature\'s Ally VII:Sunbeam:Transmute Metal To Wood:' +
        'True Seeing:Wind Walk',
        'D8:Animal Shapes:Control Plants:Earthquake:Finger Of Death:' +
        'Mass Cure Serious Wounds:Repel Metal Or Stone:Reverse Gravity:' +
        'Summon Nature\'s Ally VIII:Sunburst:Whirlwind:Word Of Recall',
        'D9:Antipathy:Elemental Swarm:Foresight:Mass Cure Critical Wounds:' +
        'Regenerate:Shambler:Shapechange:Storm Of Vengeance:' +
        'Summon Nature\'s Ally IX:Sympathy'
      ];
    } else if(klass == 'Paladin') {
      spells = [
        'P1:Bless:Bless Water:Bless Weapon:Create Water:Cure Light Wounds:' +
        'Detect Poison:Detect Undead:Divine Favor:Endure Elements:' +
        'Lesser Restoration:Magic Weapon:Protection From Chaos:' +
        'Protection From Evil:Read Magic:Resistance:Virtue',
        'P2:Bull\'s Strength:Delay Poison:Eagle\'s Splendor:Owl\'s Wisdom:' +
        'Remove Paralysis:Resist Energy:Shield Other:Undetectable Alignment:' +
        'Zone Of Truth',
        'P3:Cure Moderate Wounds:Daylight:Discern Lies:Dispel Magic:' +
        'Greater Magic Weapon:Heal Mount:Magic Circle Against Chaos:' +
        'Magic Circle Against Evil:Prayer:Remove Blindness/Deafness:' +
        'Remove Curse',
        'P4:Break Enchantment:Cure Serious Wounds:Death Ward:Dispel Chaos:' +
        'Dispel Evil:Holy Sword:Mark Of Justice:Neutralize Poison:Restoration'
      ];
    } else if(klass == 'Ranger') {
      spells = [
        'R1:Alarm:Animal Messenger:Calm Animals:Charm Animal:Delay Poison:' +
        'Detect Animals Or Plants:Detect Poison:Detect Snares And Pits:' +
        'Endure Elements:Entangle:Hide From Animals:Jump:Longstrider:' +
        'Magic Fang:Pass Without Trace:Read Magic:Resist Energy:' +
        'Speak With Animals:Summon Nature\'s Ally I',
        'R2:Barkskin:Bear\'s Endurance:Cat\'s Grace:Cure Light Wounds:' +
        'Hold Animal:Owl\'s Wisdom:Protection From Energy:Snare:' +
        'Speak With Plants:Spike Growth:Summon Nature\'s Ally II:Wind Wall',
        'R3:Command Plants:Cure Moderate Wounds:Darkvision:Diminish Plants:' +
        'Greater Magic Fang:Neutralize Poison:Plant Growth:Reduce Animal:' +
        'Remove Disease:Repel Vermin:Summon Nature\'s Ally III:Tree Shape:' +
        'Water Walk',
        'R4:Animal Growth:Commune With Nature:Cure Serious Wounds:' +
        'Freedom Of Movement:Nondetection:Summon Nature\'s Ally IV:Tree Stride'
      ];
    } else if(klass == 'Sorcerer' || klass == 'Wizard') {
      // Identical spell lists
      spells = [
        'W0:Acid Splash:Arcane Mark:Dancing Lights:Daze:Detect Magic:' +
        'Detect Poison:Disrupt Undead:Flare:Ghost Sound:Light:Mage Hand:' +
        'Mending:Message:Open/Close:Prestidigitation:Ray Of Frost:Read Magic:' +
        'Resistance:Touch Of Fatigue',
        'W1:Alarm:Animate Rope:Burning Hands:Cause Fear:Charm Person:' +
        'Chill Touch:Color Spray:Comprehend Languages:Detect Secret Doors:' +
        'Detect Undead:Disguise Self:Endure Elements:Enlarge Person:Erase:' +
        'Expeditious Retreat:Feather Fall:Floating Disk:Grease:Hold Portal:' +
        'Hypnotism:Identify:Jump:Mage Armor:Magic Missile:Magic Weapon:' +
        'Magic Aura:Mount:Obscuring Mist:Protection From Chaos:' +
        'Protection From Evil:Protection From Good:Protection From Law:' +
        'Ray Of Enfeeblement:Reduce Person:Shield:Shocking Grasp:' +
        'Silent Image:Sleep:Summon Monster I:' +
        'True Strike:Unseen Servant:Ventriloquism',
        'W2:Acid Arrow:Alter Self:Arcane Lock:Bear\'s Endurance:' +
        'Blindness/Deafness:Blur:Bull\'s Strength:Cat\'s Grace:' +
        'Command Undead:Continual Flame:Darkness:Darkvision:Daze Monster:' +
        'Detect Thoughts:Eagle\'s Splendor:False Life:Flaming Sphere:' +
        'Fog Cloud:Fox\'s Cunning:Ghoul Touch:Glitterdust:Gust Of Wind:' +
        'Hideous Laughter:Hypnotic Pattern:Invisibility:Knock:Levitate:' +
        'Locate Object:Magic Mouth:Minor Image:Mirror Image:Misdirection:' +
        'Obscure Object:Owl\'s Wisdom:Phantom Trap:Protection From Arrows:' +
        'Pyrotechnics:Resist Energy:Rope Trick:Scare:Scorching Ray:' +
        'See Invisibility:Shatter:Spectral Hand:Spider Climb:' +
        'Summon Monster II:Summon Swarm:Touch Of Idiocy:Web:Whispering Wind',
        'W3:Arcane Sight:Blink:Clairaudience/Clairvoyance:Daylight:' +
        'Deep Slumber:Dispel Magic:Displacement:Explosive Runes:Fireball:' +
        'Flame Arrow:Fly:Gaseous Form:Gentle Repose:Greater Magic Weapon:' +
        'Halt Undead:Haste:Heroism:Hold Person:Illusory Script:' +
        'Invisibility Sphere:Keen Edge:Lightning Bolt:' +
        'Magic Circle Against Chaos:Magic Circle Against Evil:' +
        'Magic Circle Against Good:Magic Circle Against Law:Major Image:' +
        'Nondetection:Phantom Steed:Protection From Energy:Rage:' +
        'Ray Of Exhaustion:Secret Page:Sepia Snake Sigil:Shrink Item:' +
        'Sleet Storm:Slow:Stinking Cloud:Suggestion:Summon Monster III:' +
        'Tiny Hut:Tongues:Vampiric Touch:Water Breathing:Wind Wall',
        'W4:Animate Dead:Arcane Eye:Bestow Curse:Black Tentacles:' +
        'Charm Monster:Confusion:Contagion:Crushing Despair:Detect Scrying:' +
        'Dimension Door:Dimensional Anchor:Enervation:Fear:Fire Shield:' +
        'Fire Trap:Greater Invisibility:Hallucinatory Terrain:Ice Storm:' +
        'Illusory Wall:Lesser Geas:Lesser Globe Of Invulnerability:' +
        'Locate Creature:Mass Enlarge Person:Mass Reduce Person:' +
        'Minor Creation:Mnemonic Enhancer:Phantasmal Killer:Polymorph:' +
        'Rainbow Pattern:Remove Curse:Resilient Sphere:Scrying:' +
        'Secure Shelter:Shadow Conjuration:Shout:Solid Fog:Stone Shape:' +
        'Stoneskin:Summon Monster IV:Wall Of Fire:Wall Of Ice',
        'W5:Animal Growth:Baleful Polymorph:Blight:Break Enchantment:' +
        'Cloudkill:Cone Of Cold:Contact Other Plane:Dismissal:' +
        'Dominate Person:Dream:Fabricate:False Vision:Feeblemind:' +
        'Hold Monster:Interposing Hand:Lesser Planar Binding:' +
        'Mage\'s Faithful Hound:Mage\'s Private Sanctum:Magic Jar:' +
        'Major Creation:Mind Fog:Mirage Arcana:Nightmare:Overland Flight:' +
        'Passwall:Permanency:Persistent Image:Prying Eyes:Secret Chest:' +
        'Seeming:Sending:Shadow Evocation:Summon Monster V:Symbol Of Pain:' +
        'Symbol Of Sleep:Telekinesis:Telepathic Bond:Teleport:' +
        'Transmute Mud To Rock:Transmute Rock To Mud:Wall Of Force:' +
        'Wall Of Stone:Waves Of Fatigue',
        'W6:Acid Fog:Analyze Dweomer:Antimagic Field:Chain Lightning:' +
        'Circle Of Death:Contingency:Control Water:Create Undead:' +
        'Disintegrate:Eyebite:Flesh To Stone:Forceful Hand:Freezing Sphere:' +
        'Geas/Quest:Globe Of Invulnerability:Greater Dispel Magic:' +
        'Greater Heroism:Guards And Wards:Legend Lore:Mage\'s Lucubration:' +
        'Mass Bear\'s Endurance:Mass Bull\'s Strength:Mass Cat\'s Grace:' +
        'Mass Eagle\'s Splendor:Mass Fox\'s Cunning:Mass Owl\'s Wisdom:' +
        'Mass Suggestion:Mislead:Move Earth:Permanent Image:Planar Binding:' +
        'Programmed Image:Repulsion:Shadow Walk:Stone To Flesh:' +
        'Summon Monster VI:Symbol Of Fear:Symbol Of Persuasion:' +
        'Transformation:True Seeing:Undeath To Death:Veil:Wall Of Iron',
        'W7:Banishment:Control Undead:Control Weather:' +
        'Delayed Blast Fireball:Ethereal Jaunt:Finger Of Death:Forcecage:' +
        'Grasping Hand:Greater Arcane Sight:Greater Scrying:' +
        'Greater Shadow Conjuration:Greater Teleport:Insanity:' +
        'Instant Summons:Limited Wish:Mage\'s Magnificent Mansion:' +
        'Mage\'s Sword:Mass Hold Person:Mass Invisibility:Phase Door:' +
        'Plane Shift:Power Word Blind:Prismatic Spray:Project Image:' +
        'Reverse Gravity:Sequester:Simulacrum:Spell Turning:Statue:' +
        'Summon Monster VII:Symbol Of Stunning:Symbol Of Weakness:' +
        'Teleport Object:Vision:Waves Of Exhaustion',
        'W8:Antipathy:Binding:Clenched Fist:Clone:Create Greater Undead:' +
        'Demand:Dimensional Lock:Discern Location:Greater Planar Binding:' +
        'Greater Prying Eyes:Greater Shadow Evocation:Greater Shout:' +
        'Horrid Wilting:Incendiary Cloud:Iron Body:Irresistible Dance:' +
        'Mass Charm Monster:Maze:Mind Blank:Moment Of Prescience:Polar Ray:' +
        'Polymorph Any Object:Power Word Stun:Prismatic Wall:' +
        'Protection From Spells:Scintillating Pattern:Screen:' +
        'Summon Monster VIII:Sunburst:Symbol Of Death:Symbol Of Insanity:' +
        'Sympathy:Telekinetic Sphere:Temporal Stasis:Trap The Soul',
        'W9:Astral Projection:Crushing Hand:Dominate Monster:Energy Drain:' +
        'Etherealness:Foresight:Freedom:Gate:Imprisonment:' +
        'Mage\'s Disjunction:Mass Hold Monster:Meteor Swarm:Power Word Kill:' +
        'Prismatic Sphere:Refuge:Shades:Shapechange:Soul Bind:' +
        'Summon Monster IX:Teleportation Circle:Time Stop:' +
        'Wail Of The Banshee:Weird:Wish'
      ];
    } else
      continue;
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
        }
      }
    }
  }

  rules.defineChoice('domains', domains);
  for(var i = 0; i < domains.length; i++) {
    var domain = domains[i];
    var notes;
    var spells;
    var turn;
    if(domain == 'Air') {
      notes = ['combatNotes.airDomain:Turn earth, rebuke air'];
      spells = [
        'Obscuring Mist', 'Wind Wall', 'Gaseous Form', 'Air Walk',
        'Control Winds', 'Chain Lightning', 'Control Weather', 'Whirlwind',
        'Elemental Swarm'
      ];
      turn = 'Earth';
    } else if(domain == 'Animal') {
      notes = [
        'magicNotes.animalDomain:<i>Speak With Animals</i> 1/Day',
        'skillNotes.animalDomain:Knowledge (Nature) is a class skill'
      ];
      spells = [
        'Calm Animals', 'Hold Animal', 'Dominate Animal',
        'Summon Nature\'s Ally IV', 'Commune With Nature', 'Antilife Shell',
        'Animal Shapes', 'Summon Nature\'s Ally VIII', 'Shapechange'
      ];
      turn = null;
      rules.defineRule
        ('classSkills.Knowledge (Nature)', 'skillNotes.animalDomain', '=', '1');
    } else if(domain == 'Chaos') {
      notes = ['magicNotes.chaosDomain:+1 caster level chaos spells'];
      spells = [
        'Protection From Law', 'Shatter', 'Magic Circle Against Law',
        'Chaos Hammer', 'Dispel Law', 'Animate Objects', 'Word Of Chaos',
        'Cloak Of Chaos', 'Summon Monster IX'
      ];
      turn = null;
    } else if(domain == 'Death') {
      notes = ['magicNotes.deathDomain:<i>Death Touch</i> 1/Day'];
      spells = [
        'Cause Fear', 'Death Knell', 'Animate Dead', 'Death Ward',
        'Slay Living', 'Create Undead', 'Destruction', 'Create Greater Undead',
        'Wail Of The Banshee'
      ];
      turn = null;
    } else if(domain == 'Destruction') {
      notes = [
        'combatNotes.destructionDomain:+4 attack, +%V damage smite 1/day'
      ];
      spells = [
        'Inflict Light Wounds', 'Shatter', 'Contagion',
        'Inflict Critical Wounds', 'Mass Inflict Light Wounds', 'Harm',
        'Disintegrate', 'Earthquake', 'Implosion'
      ];
      turn = null;
      rules.defineRule
        ('combatNotes.destructionDomain', 'levels.Cleric', '=', null);
    } else if(domain == 'Earth') {
      notes = ['combatNotes.earthDomain:Turn air, rebuke earth'];
      spells = [
        'Magic Stone', 'Soften Earth And Stone', 'Stone Shape', 'Spike Stones',
        'Wall Of Stone', 'Stoneskin', 'Earthquake', 'Iron Body',
        'Elemental Swarm'
      ];
      turn = 'Air';
    } else if(domain == 'Evil') {
      notes = ['magicNotes.evilDomain:+1 caster level evil spells'];
      spells = [
        'Protection From Good', 'Desecrate', 'Magic Circle Against Good',
        'Unholy Blight', 'Dispel Good', 'Create Undead', 'Blasphemy',
        'Unholy Aura', 'Summon Monster IX'
      ];
      turn = null;
    } else if(domain == 'Fire') {
      notes = ['combatNotes.fireDomain:Turn water, rebuke fire'];
      spells = [
        'Burning Hands', 'Produce Flame', 'Resist Energy', 'Wall Of Fire',
        'Fire Shield', 'Fire Seeds', 'Fire Storm', 'Incendiary Cloud',
        'Elemental Swarm'
      ];
      turn = 'Water';
    } else if(domain == 'Good') {
      notes = ['magicNotes.goodDomain:+1 caster level good spells'];
      spells = [
        'Protection From Evil', 'Aid', 'Magic Circle Against Evil',
        'Holy Smite', 'Dispel Evil', 'Blade Barrier', 'Holy Word', 'Holy Aura',
        'Summon Monster IX'
      ];
      turn = null;
    } else if(domain == 'Healing') {
      notes = ['magicNotes.healingDomain:+1 caster level heal spells'];
      spells = [
        'Cure Light Wounds', 'Cure Moderate Wounds', 'Cure Serious Wounds',
        'Cure Critical Wounds', 'Mass Cure Light Wounds', 'Heal', 'Regenerate',
        'Mass Cure Critical Wounds', 'Mass Heal'
      ];
      turn = null;
    } else if(domain == 'Knowledge') {
      notes = [
        'magicNotes.knowledgeDomain:+1 caster level divination spells',
        'skillNotes.knowledgeDomain:All Knowledge skills are class skills'
      ];
      spells = [
        'Detect Secret Doors', 'Detect Thoughts', 'Clairaudience/Clairvoyance',
        'Divination', 'True Seeing', 'Find The Path', 'Legend Lore',
        'Discern Location', 'Foresight'
      ];
      turn = null;
      rules.defineRule
        (/^classSkills.Knowledge/, 'skillNotes.knowledgeDomain', '=', '1');
    } else if(domain == 'Law') {
      notes = ['magicNotes.lawDomain:+1 caster level law spells'];
      spells = [
        'Protection From Chaos', 'Calm Emotions', 'Magic Circle Against Chaos',
        'Order\'s Wrath', 'Dispel Chaos', 'Hold Monster', 'Dictum',
        'Shield Of Law', 'Summon Monster IX'
      ];
      turn = null;
    } else if(domain == 'Luck') {
      notes = ['saveNotes.luckDomain:Reroll 1/day'];
      spells = [
        'Entropic Shield', 'Aid', 'Protection From Energy',
        'Freedom Of Movement', 'Break Enchantment', 'Mislead', 'Spell Turning',
        'Moment Of Prescience', 'Miracle'
      ];
      turn = null;
    } else if(domain == 'Magic') {
      notes = ['skillNotes.magicDomain:Use Magic Device at level %V'];
      spells = [
        'Magic Aura', 'Identify', 'Dispel Magic',
        'Imbue With Spell Ability', 'Spell Resistance', 'Antimagic Field',
        'Spell Turning', 'Protection From Spells', 'Mage\'s Disjunction'
      ];
      turn = null;
      rules.defineRule('skillNotes.magicDomain',
        'levels.Cleric', '=', 'Math.floor(source / 2)',
        'levels.Wizard', '+', null
      );
    } else if(domain == 'Plant') {
      notes = [
        'combatNotes.plantDomain:Rebuke plants',
        'skillNotes.plantDomain:Knowledge (Nature) is a class skill'
      ];
      spells = [
        'Entangle', 'Barkskin', 'Plant Growth', 'Command Plants',
        'Wall Of Thorns', 'Repel Wood', 'Animate Plants', 'Control Plants',
        'Shambler'
      ];
      turn = 'Plant';
      rules.defineRule
        ('classSkills.Knowledge (Nature)', 'skillNotes.plantDomain', '=', '1');
    } else if(domain == 'Protection') {
      notes = [
        'magicNotes.protectionDomain:' +
          '<i>Protective Ward</i> +%V bonus to next save w/in 1 hour 1/day'
      ];
      spells = [
        'Sanctuary', 'Shield Other', 'Protection From Energy',
        'Spell Immunity', 'Spell Resistance', 'Antimagic Field', 'Repulsion',
        'Mind Blank', 'Prismatic Sphere'
      ];
      turn = null;
      rules.defineRule
        ('magicNotes.protectionDomain', 'levels.Cleric', '=', null);
    } else if(domain == 'Strength') {
      notes = ['abilityNotes.strengthDomain:Add %V to strength 1 rd/day'];
      spells = [
        'Enlarge Person', 'Bull\'s Strength', 'Magic Vestment',
        'Spell Immunity', 'Righteous Might', 'Stoneskin', 'Grasping Hand',
        'Clenched Fist', 'Crushing Hand'
      ];
      turn = null;
      rules.defineRule
        ('abilityNotes.strengthDomain', 'levels.Cleric', '=', null);
    } else if(domain == 'Sun') {
      notes = ['combatNotes.sunDomain:Destroy turned undead 1/day'];
      spells = [
        'Endure Elements', 'Heat Metal', 'Searing Light', 'Fire Shield',
        'Flame Strike', 'Fire Seeds', 'Sunbeam', 'Sunburst', 'Prismatic Sphere'
      ];
      turn = null;
    } else if(domain == 'Travel') {
      notes = [
        'magicNotes.travelDomain:<i>Freedom of Movement</i> %V rd/day',
        'skillNotes.travelDomain:Survival is a class skill'
      ];
      spells = [
        'Longstrider', 'Locate Object', 'Fly', 'Dimension Door', 'Teleport',
        'Find The Path', 'Greater Teleport', 'Phase Door', 'Astral Projection'
      ];
      turn = null;
      rules.defineRule
        ('classSkills.Survival', 'skillNotes.travelDomain', '=', '1');
      rules.defineRule('magicNotes.travelDomain', 'levels.Cleric', '=', null);
    } else if(domain == 'Trickery') {
      notes =
        ['skillNotes.trickeryDomain:Bluff/Disguise/Hide are class skills'];
      spells = [
        'Disguise Self', 'Invisibility', 'Nondetection', 'Confusion',
        'False Vision', 'Mislead', 'Screen', 'Polymorph Any Object', 'Time Stop'
      ];
      turn = null;
      rules.defineRule
        ('classSkills.Bluff', 'skillNotes.trickeryDomain', '=', '1');
      rules.defineRule
        ('classSkills.Disguise', 'skillNotes.trickeryDomain', '=', '1');
      rules.defineRule
        ('classSkills.Hide', 'skillNotes.trickeryDomain', '=', '1');
    } else if(domain == 'War') {
      notes = [
        'featureNotes.warDomain:' +
          'Weapon Proficiency/Weapon Focus in favored weapon'
      ];
      spells = [
        'Magic Weapon', 'Spiritual Weapon', 'Magic Vestment', 'Divine Power',
        'Flame Strike', 'Blade Barrier', 'Power Word Blind', 'Power Word Stun',
        'Power Word Kill'
      ];
      turn = null;
    } else if(domain == 'Water') {
      notes = ['combatNotes.waterDomain:Turn fire, rebuke water'];
      spells = [
        'Obscuring Mist', 'Fog Cloud', 'Water Breathing', 'Control Water',
        'Ice Storm', 'Cone Of Cold', 'Acid Fog', 'Horrid Wilting',
        'Elemental Swarm'
      ];
      turn = 'Fire';
    } else
      continue;
    if(notes != null) {
      rules.defineNote(notes);
    }
    if(spells != null) {
      for(var j = 0; j < spells.length; j++) {
        var spell = spells[j];
        var school = SRD35.spellsSchools[spell];
        if(school == null) {
          continue;
        }
        spell += '(' + domain + (j + 1) + ' ' +
                  (school == 'Universal' ? 'Univ' : schools[school]) + ')';
        rules.defineChoice('spells', spell);
      }
    }
    if(turn != null) {
      var prefix = 'turn' + turn;
      rules.defineRule(prefix + '.level',
        'domains.' + domain, '?', null,
        'levels.Cleric', '+=', null
      );
      rules.defineRule('turningLevel', prefix + '.level', '^=', null);
      rules.defineRule(prefix + '.damageModifier',
        prefix + '.level', '=', null,
        'charismaModifier', '+', null
      );
      rules.defineRule(prefix + '.frequency',
        prefix + '.level', '=', '3',
        'charismaModifier', '+', null
      );
      rules.defineRule(prefix + '.maxHitDice',
        prefix + '.level', '=', 'source * 3 - 10',
        'charismaModifier', '+', null
      );
      rules.defineNote([
        prefix + '.damageModifier:2d6+%V',
        prefix + '.frequency:%V/day',
        prefix + '.maxHitDice:(d20+%V)/3'
      ]);
      rules.defineSheetElement('Turn ' + turn, 'Turn Undead', null, '; ');
    }
  }
  rules.defineNote
    ('validationNotes.domainAllocation:%1 available vs. %2 allocated');
  rules.defineRule('validationNotes.domainAllocation.1',
    '', '=', '0',
    'domainCount', '=', null
  );
  rules.defineRule('validationNotes.domainAllocation.2',
    '', '=', '0',
    /^domains\./, '+=', null
  );
  rules.defineRule('validationNotes.domainAllocation',
    'validationNotes.domainAllocation.1', '=', '-source',
    'validationNotes.domainAllocation.2', '+=', null
  );

  rules.defineRule('casterLevel',
    'casterLevelArcane', '+=', null,
    'casterLevelDivine', '+=', null
  );

};

/* Defines the rules related to character movement. */
SRD35.movementRules = function(rules) {
  rules.defineRule('loadLight', 'loadMax', '=', 'Math.floor(source / 3)');
  rules.defineRule('loadMax',
    'strength', '=', 'SRD35.strengthMaxLoads[source]',
    'features.Small', '*', '0.75'
  );
  rules.defineRule('loadMedium', 'loadMax', '=', 'Math.floor(source * 2 / 3)');
  rules.defineRule('runSpeed',
    'speed', '=', null,
    'runSpeedMultiplier', '*', null
  );
  rules.defineRule('runSpeedMultiplier',
    'armor', '=',
    'SRD35.armorsProficiencyLevels[source] != null && ' +
    'SRD35.armorsProficiencyLevels[source] >= ' + SRD35.PROFICIENCY_HEAVY +
    ' ? 3 : 4'
  );
  rules.defineRule('speed', '', '=', '30');
};

/* Defines the rules related to character races. */
SRD35.raceRules = function(rules, languages, races) {

  rules.defineChoice('languages', languages);
  for(var i = 0; i < languages.length; i++) {
    if(languages[i] == 'Common')
      rules.defineRule('languages.Common', '', '=', '1');
  }
  rules.defineRule
    ('languageCount', 'race', '=', 'source.match(/Human/) ? 1 : 2');
  rules.defineNote
    ('validationNotes.languageAllocation:%1 available vs. %2 allocated');
  rules.defineRule('validationNotes.languageAllocation.1',
    '', '=', '0',
    'languageCount', '=', null
  );
  rules.defineRule('validationNotes.languageAllocation.2',
    '', '=', '0',
    /^languages\./, '+=', null
  );
  rules.defineRule('validationNotes.languageAllocation',
    'validationNotes.languageAllocation.1', '=', '-source',
    'validationNotes.languageAllocation.2', '+=', null
  );

  for(var i = 0; i < races.length; i++) {

    var adjustment, features, notes;
    var race = races[i];
    var raceNoSpace =
      race.substring(0,1).toLowerCase() + race.substring(1).replace(/ /g, '');

    if(race == 'Half Elf') {

      adjustment = null;
      features = [
        'Alert Senses', 'Resist Enchantment', 'Low-Light Vision',
        'Sleep Immunity', 'Tolerance'
      ];
      notes = [
        'featureNotes.low-LightVisionFeature:x%V normal distance in poor light',
        'saveNotes.resistEnchantmentFeature:+2 vs. enchantment',
        'saveNotes.sleepImmunityFeature:Immune <i>Sleep</i>',
        'skillNotes.alertSensesFeature:+1 Listen/Search/Spot',
        'skillNotes.toleranceFeature:+2 Diplomacy/Gather Information'
      ];
      rules.defineRule('featureNotes.low-LightVisionFeature',
        '', '=', '1',
        raceNoSpace + 'Features.Low-Light Vision', '+', null
      );
      rules.defineRule
        ('languages.Elven', 'race', '=', 'source.match(/Elf/) ? 1 : null');
      rules.defineRule('resistance.Enchantment',
        'saveNotes.resistEnchantmentFeature', '+=', '2'
      );

    } else if(race == 'Half Orc') {

      adjustment = '+2 strength/-2 intelligence/-2 charisma';
      features = ['Darkvision'];
      notes = [
        "featureNotes.darkvisionFeature:%V' b/w vision in darkness"
      ];
      rules.defineRule('featureNotes.darkvisionFeature',
        raceNoSpace + 'Features.Darkvision', '+=', '60'
      );
      rules.defineRule
        ('languages.Orc', 'race', '=', 'source.match(/Orc/) ? 1 : null');

    } else if(race.match(/Dwarf/)) {

      adjustment = '+2 constitution/-2 charisma';
      features = [
        'Darkvision', 'Dodge Giants', 'Dwarf Favored Enemy', 'Know Depth',
        'Natural Smith', 'Resist Poison', 'Resist Spells', 'Slow', 'Stability',
        'Stonecunning', 'Weapon Familiarity (Dwarven Urgosh/Dwarven Waraxe)'
      ];
      notes = [
        'abilityNotes.slowFeature:-10 speed',
        'abilityNotes.dwarfArmorSpeedAdjustment:No speed penalty in armor',
        'combatNotes.dodgeGiantsFeature:+4 AC vs. giant creatures',
        'combatNotes.dwarfFavoredEnemyFeature:+1 attack vs. goblinoid/orc',
        'combatNotes.stabilityFeature:+4 vs. Bull Rush/Trip',
        "featureNotes.darkvisionFeature:%V' b/w vision in darkness",
        'featureNotes.knowDepthFeature:Intuit approximate depth underground',
        'saveNotes.resistPoisonFeature:+2 vs. poison',
        'saveNotes.resistSpellsFeature:+2 vs. spells',
        'skillNotes.naturalSmithFeature:' +
           '+2 Appraise/Craft involving stone or metal',
        'skillNotes.stonecunningFeature:' +
          "+2 Search involving stone or metal, automatic check w/in 10'"
      ];

      rules.defineRule('abilityNotes.armorSpeedAdjustment',
        'abilityNotes.dwarfArmorSpeedAdjustment', '^', '0'
      );
      rules.defineRule('abilityNotes.dwarfArmorSpeedAdjustment',
        'race', '=', 'source.match(/Dwarf/) ? 1 : null'
      );
      rules.defineRule('featureNotes.darkvisionFeature',
        raceNoSpace + 'Features.Darkvision', '+=', '60'
      );
      rules.defineRule
        ('languages.Dwarven', 'race', '=', 'source.match(/Dwarf/) ? 1 : null');
      rules.defineRule
        ('resistance.Poison', 'saveNotes.resistPoisonFeature', '+=', '2');
      rules.defineRule
        ('resistance.Spell', 'saveNotes.resistSpellsFeature', '+=', '2');
      rules.defineRule('speed', 'abilityNotes.slowFeature', '+', '-10');

    } else if(race.match(/Elf/)) {

      adjustment = '+2 dexterity/-2 constitution';
      features = [
        'Keen Senses', 'Low-Light Vision', 'Resist Enchantment',
        'Sense Secret Doors', 'Sleep Immunity',
        'Weapon Proficiency (Composite Longbow/Composite Shortbow/Longsword/' +
        'Rapier/Longbow/Shortbow)'
      ];
      notes = [
        'featureNotes.low-LightVisionFeature:x%V normal distance in poor light',
        "featureNotes.senseSecretDoorsFeature:Automatic Search when w/in 5'",
        'saveNotes.resistEnchantmentFeature:+2 vs. enchantment',
        'saveNotes.sleepImmunityFeature:Immune <i>Sleep</i>',
        'skillNotes.keenSensesFeature:+2 Listen/Search/Spot'
      ];
      rules.defineRule('featureNotes.low-LightVisionFeature',
        '', '=', '1',
        raceNoSpace + 'Features.Low-Light Vision', '+', null
      );
      rules.defineRule
        ('languages.Elven', 'race', '=', 'source.match(/Elf/) ? 1 : null');
      rules.defineRule('resistance.Enchantment',
        'saveNotes.resistEnchantmentFeature', '+=', '2'
      );

    } else if(race.match(/Gnome/)) {

      adjustment = '+2 constitution/-2 strength';
      features = [
        'Dodge Giants', 'Gnome Favored Enemy', 'Gnome Weapons', 'Keen Ears',
        'Keen Nose', 'Low-Light Vision', 'Natural Illusionist',
        'Natural Spells', 'Resist Illusion', 'Slow', 'Small',
        'Weapon Familiarity (Gnome Hooked Hammer)'
      ];
      notes = [
        'abilityNotes.slowFeature:-10 speed',
        'combatNotes.dodgeGiantsFeature:+4 AC vs. giant creatures',
        'combatNotes.gnomeFavoredEnemyFeature:+1 attack vs. goblinoid/kobold',
        'combatNotes.gnomeWeapons:Racial weapons are martial weapons',
        'combatNotes.smallFeature:+1 AC/attack',
        'featureNotes.low-LightVisionFeature:x%V normal distance in poor light',
        'magicNotes.naturalIllusionistFeature:+1 DC on illusion spells',
        'magicNotes.naturalSpellsFeature:%V 1/day as caster %1',
        'saveNotes.resistIllusionFeature:+2 vs. illusions',
        'skillNotes.keenEarsFeature:+2 Listen',
        'skillNotes.keenNoseFeature:+2 Craft (Alchemy)',
        'skillNotes.smallFeature:+4 Hide'
      ];
      rules.defineRule('armorClass', 'combatNotes.smallFeature', '+', '1');
      rules.defineRule('featureNotes.low-LightVisionFeature',
        '', '=', '1',
        raceNoSpace + 'Features.Low-Light Vision', '+', null
      );
      rules.defineRule
        ('languages.Gnome', 'race', '=', 'source.match(/Gnome/) ? 1 : null');
      rules.defineRule('magicNotes.naturalSpellsFeature',
        'charisma', '=',
        'source < 10 ? "<i>Speak With Animals</i>" : ' +
        '"<i>Dancing Lights</i>/<i>Ghost Sound</i>/<i>Prestidigitation</i>/' +
        '<i>Speak With Animals</i>"'
      );
      rules.defineRule
        ('magicNotes.naturalSpellsFeature.1', 'level', '=', null);
      rules.defineRule('meleeAttack', 'combatNotes.smallFeature', '+', '1');
      rules.defineRule('rangedAttack', 'combatNotes.smallFeature', '+', '1');
      rules.defineRule
        ('resistance.Illusion', 'saveNotes.resistIllusionFeature', '+=', '2');
      rules.defineRule('speed', 'abilityNotes.slowFeature', '+', '-10');

    } else if(race.match(/Halfling/)) {

      adjustment = '+2 dexterity/-2 strength';
      features = [
        'Accurate', 'Fortunate', 'Keen Ears', 'Slow', 'Small', 'Spry',
        'Resist Fear'
      ];
      notes = [
        'abilityNotes.slowFeature:-10 speed',
        'combatNotes.accurateFeature:+1 attack with slings/thrown',
        'combatNotes.smallFeature:+1 AC/attack',
        'saveNotes.fortunateFeature:+1 all saves',
        'saveNotes.resistFearFeature:+2 vs. fear',
        'skillNotes.keenEarsFeature:+2 Listen',
        'skillNotes.smallFeature:+4 Hide',
        'skillNotes.spryFeature:+2 Climb/Jump/Move Silently'
      ];
      rules.defineRule('armorClass', 'combatNotes.smallFeature', '+', '1');
      rules.defineRule('languages.Halfling',
        'race', '=', 'source.match(/Halfling/) ? 1 : null'
      );
      rules.defineRule('meleeAttack', 'combatNotes.smallFeature', '+', '1');
      rules.defineRule('rangedAttack', 'combatNotes.smallFeature', '+', '1');
      rules.defineRule
        ('resistance.Fear', 'saveNotes.resistFearFeature', '+=', '2');
      rules.defineRule('save.Fortitude','saveNotes.fortunateFeature','+','1');
      rules.defineRule('save.Reflex', 'saveNotes.fortunateFeature', '+', '1');
      rules.defineRule('save.Will', 'saveNotes.fortunateFeature', '+', '1');
      rules.defineRule('speed', 'abilityNotes.slowFeature', '+', '-10');

    } else if(race.match(/Human/)) {

      adjustment = null;
      features = null;
      notes = null;
      rules.defineRule
        ('featCount.General', 'featureNotes.humanFeatCountBonus', '+', null);
      rules.defineRule('featureNotes.humanFeatCountBonus',
        'race', '+=', 'source.match(/Human/) ? 1 : null'
      );
      rules.defineRule('skillNotes.humanSkillPointsBonus',
        'race', '?', 'source.match(/Human/)',
        'level', '=', 'source + 3'
      );
      rules.defineRule
        ('skillPoints', 'skillNotes.humanSkillPointsBonus', '+', null);

    } else
      continue;

    SRD35.defineRace(rules, race, adjustment, features);
    if(notes != null) {
      rules.defineNote(notes);
    }

  }

};

/* Defines the rules related to character skills. */
SRD35.skillRules = function(rules, skills, subskills, synergies) {

  var allSkills = [];
  for(var i = 0; i < skills.length; i++) {
    var pieces = skills[i].split(':');
    var skill = pieces[0];
    var skillSubskills = subskills[skill];
    if(skillSubskills == null) {
      allSkills[allSkills.length] = skills[i];
    } else if(skillSubskills != '') {
      skillSubskills = skillSubskills.split('/');
      for(var j = 0; j < skillSubskills.length; j++) {
        var subskill = skill + ' (' + skillSubskills[j] + ')';
        allSkills[allSkills.length] = subskill + ':' + pieces[1];
        rules.defineRule
          ('classSkills.' + subskill, 'classSkills.' + skill, '=', '1');
      }
    }
  }

  for(var i = 0; i < allSkills.length; i++) {
    var pieces = allSkills[i].split(':');
    var skill = pieces[0];
    var ability = pieces[1].replace(/\/.*/, '');
    var matchInfo;
    var synergy = synergies == null ? null : synergies[skill];
    if((matchInfo = skill.match(/^Craft \((.*)\)$/)) != null &&
       synergies != null) {
      var topic = matchInfo[1];
      var topicNoSpace = topic.replace(/ /g, '');
      synergy = 'related Appraise';
    }
    SRD35.defineSkill
      (rules, skill, ability, pieces[1].includes('/trained'), synergy, null);
  }

  rules.defineNote(
    'skillNotes.armorSkillCheckPenalty:' +
      '-%V Balance/Climb/Escape Artist/Hide/Jump/Move Silently/' +
      'Sleight Of Hand/Tumble',
    'skillNotes.armorSwimCheckPenalty:-%V Swim',
    'validationNotes.skillMaximum:' +
      'Points allocated to one or more skills exceed maximum',
    'validationNotes.skillAllocation:%1 available vs. %2 allocated'
  );
  rules.defineRule('maxAllowedSkillPoints', 'level', '=', 'source + 3');
  rules.defineRule('maxAllocatedSkillPoints', /^skills\.[^\.]*$/, '^=', null);
  rules.defineRule('skillNotes.armorSkillCheckPenalty',
    'armor', '=', 'SRD35.armorsSkillCheckPenalties[source]',
    'shield', '+=', 'SRD35.shieldsSkillCheckPenalties[source]',
    '', '^', '0'
  );
  rules.defineRule('skillNotes.armorSwimCheckPenalty',
    'skillNotes.armorSkillCheckPenalty', '=', 'source * 2'
  );
  rules.defineRule('skillPoints',
    '', '=', '0',
    'level', '^', null
  );
  rules.defineRule('validationNotes.skillMaximum',
    'maxAllocatedSkillPoints', '=', '-source',
    'maxAllowedSkillPoints', '+', 'source',
    '', 'v', '0'
  );
  rules.defineRule('validationNotes.skillAllocation.1',
    '', '=', '0',
    'skillPoints', '=', null
  );
  rules.defineRule('validationNotes.skillAllocation.2',
    '', '=', '0',
    /^skills\.[^\.]*$/, '+=', null
  );
  rules.defineRule('validationNotes.skillAllocation',
    'validationNotes.skillAllocation.1', '=', '-source',
    'validationNotes.skillAllocation.2', '+=', null
  );

};

/* Replaces spell names with longer descriptions on the character sheet. */
SRD35.spellRules = function(rules, spells, descriptions) {
  if(spells == null) {
    spells = ScribeUtils.getKeys(rules.choices.spells);
  }
  if(descriptions == null) {
    descriptions = SRD35.spellsDescriptions;
  }
  rules.defineRule('casterLevels.AS', 'levels.Assassin', '=', null);
  rules.defineRule('casterLevels.B', 'levels.Bard', '=', null);
  rules.defineRule('casterLevels.BL', 'levels.Blackguard', '=', null);
  rules.defineRule('casterLevels.C', 'levels.Cleric', '=', null);
  rules.defineRule('casterLevels.D', 'levels.Druid', '=', null);
  rules.defineRule('casterLevels.Dom', 'levels.Cleric', '=', null);
  rules.defineRule('casterLevels.Dom', 'levels.Druid', '=', null);
  rules.defineRule('casterLevels.Dom', 'levels.Legate', '=', null);
  rules.defineRule('casterLevels.P', 'levels.Paladin', '=', null);
  rules.defineRule('casterLevels.R', 'levels.Ranger', '=', null);
  rules.defineRule('casterLevels.W', 'levels.Sorcerer', '=', null);
  rules.defineRule('casterLevels.W', 'levels.Wizard', '=', null);
  rules.defineRule('casterLevels.L', 'levels.Legate', '=', null);
  for(var i = 0; i < spells.length; i++) {
    var spell = spells[i];
    var matchInfo = spell.match(/^([^\(]+)\(([A-Za-z ]+)(\d+)\s*\w*\)$/);
    if(matchInfo == null) {
      alert('Bad format for spell ' + spell);
      continue;
    }
    var abbr = matchInfo[2];
    var level = matchInfo[3];
    var name = matchInfo[1];
    var description = descriptions[name];
    if(description == null) {
      alert('No description for spell ' + name);
      continue;
    }
    if(abbr.length > 2) {
      abbr = 'Dom'; // Assume domain spell
    }
    var inserts = description.match(/\$(\w+|{[^}]+})/g);
    if(inserts != null) {
      for(var index = 1; index <= inserts.length; index++) {
        var insert = inserts[index - 1];
        var expr = insert[1] == '{' ?
            insert.substring(2, insert.length - 1) : insert.substring(1);
        if(SRD35.spellsAbbreviations[expr] != null) {
          expr = SRD35.spellsAbbreviations[expr];
        }
        expr = expr.replace(/lvl/g, 'source');
        rules.defineRule('spells.' + spell + '.' + index,
          'spells.' + spell, '?', null,
          'casterLevels.' + abbr, '=', expr
        );
        description = description.replace(insert, '%' + index);
      }
    }
    rules.defineChoice('notes', 'spells.' + spell + ':' + description);
  }
};

/* Returns a random name for a character of race #race#. */
SRD35.randomName = function(race) {

  /* Return a random character from #string#. */
  function randomChar(string) {
    return string.charAt(ScribeUtils.random(0, string.length - 1));
  }

  if(race == null)
    race = 'Human';
  else if(race == 'Half Elf')
    race = ScribeUtils.random(0, 99) < 50 ? 'Elf' : 'Human';
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
  var syllables = ScribeUtils.random(0, 99);
  syllables = syllables < 50 ? 2 :
              syllables < 75 ? 3 :
              syllables < 90 ? 4 :
              syllables < 95 ? 5 :
              syllables < 99 ? 6 : 7;
  var result = '';
  var vowel;

  for(var i = 0; i < syllables; i++) {
    if(ScribeUtils.random(0, 99) <= 80) {
      endConsonant = randomChar(consonants).toUpperCase();
      if(clusters[endConsonant] != null && ScribeUtils.random(0, 99) < 15)
        endConsonant += randomChar(clusters[endConsonant]);
      result += endConsonant;
      if(endConsonant == 'Q')
        result += 'u';
    }
    else if(endConsonant.length == 1 && ScribeUtils.random(0, 99) < 10) {
      result += endConsonant;
      endConsonant += endConsonant;
    }
    vowel = randomChar(vowels);
    if(endConsonant.length > 0 && diphthongs[vowel] != null &&
       ScribeUtils.random(0, 99) < 15)
      vowel += randomChar(diphthongs[vowel]);
    result += vowel;
    endConsonant = '';
    if(ScribeUtils.random(0, 99) <= 60) {
      while(leading.indexOf((endConsonant = randomChar(consonants))) >= 0)
        ; /* empty */
      if(clusters[endConsonant] != null && ScribeUtils.random(0, 99) < 15)
        endConsonant += randomChar(clusters[endConsonant]);
      result += endConsonant;
    }
  }
  return result.substring(0, 1).toUpperCase() +
         result.substring(1).toLowerCase();

};

/* Returns the elements in a basic SRD character editor. */
SRD35.initialEditorElements = function() {
  var abilityChoices = [
    3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
  ];
  var editorElements = [
    ['name', 'Name', 'text', [20]],
    ['race', 'Race', 'select-one', 'races'],
    ['experience', 'Experience', 'text', [8]],
    ['levels', 'Levels', 'bag', 'levels'],
    ['imageUrl', 'Image URL', 'text', [20]],
    ['strength', 'Strength/Adjust', 'select-one', abilityChoices],
    ['strengthAdjust', '', 'text', [3]],
    ['intelligence', 'Intelligence/Adjust', 'select-one', abilityChoices],
    ['intelligenceAdjust', '', 'text', [3]],
    ['wisdom', 'Wisdom/Adjust', 'select-one', abilityChoices],
    ['wisdomAdjust', '', 'text', [3]],
    ['dexterity', 'Dexterity/Adjust', 'select-one', abilityChoices],
    ['dexterityAdjust', '', 'text', [3]],
    ['constitution', 'Constitution/Adjust', 'select-one', abilityChoices],
    ['constitutionAdjust', '', 'text', [3]],
    ['charisma', 'Charisma/Adjust', 'select-one', abilityChoices],
    ['charismaAdjust', '', 'text', [3]],
    ['player', 'Player', 'text', [20]],
    ['alignment', 'Alignment', 'select-one', 'alignments'],
    ['gender', 'Gender', 'select-one', 'genders'],
    ['deity', 'Deity', 'select-one', 'deities'],
    ['origin', 'Origin', 'text', [20]],
    ['feats', 'Feats', 'set', 'feats'],
    ['selectableFeatures', 'Selectable Features', 'bag', 'selectableFeatures'],
    ['skills', 'Skills', 'bag', 'skills'],
    ['languages', 'Languages', 'set', 'languages'],
    ['hitPoints', 'Hit Points', 'text', [4]],
    ['armor', 'Armor', 'select-one', 'armors'],
    ['shield', 'Shield', 'select-one', 'shields'],
    ['weapons', 'Weapons', 'bag', 'weapons'],
    ['spells', 'Spells', 'fset', 'spells'],
    ['domains', 'Cleric Domains', 'set', 'domains'],
    ['specialize', 'Wizard Specialization', 'set', 'schools'],
    ['prohibit', 'Wizard Prohibition', 'set', 'schools'],
    ['notes', 'Notes', 'textarea', [40,10]],
    ['hiddenNotes', 'Hidden Notes', 'textarea', [40,10]]
  ];
  return editorElements;
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
      var which = ScribeUtils.random(0, remaining.length - 1);
      attributes[prefix + remaining[which]] = value;
      remaining = remaining.slice(0, which).concat(remaining.slice(which + 1));
    }
  }

  var attr;
  var attrs;
  var choices;
  var howMany;
  var i;

  if(attribute == 'armor') {
    attrs = this.applyRules(attributes);
    var characterProfLevel = attrs.armorProficiencyLevel;
    if(characterProfLevel == null) {
      characterProfLevel = SRD35.PROFICIENCY_NONE;
    }
    choices = [];
    for(attr in this.getChoices('armors')) {
      if((SRD35.armorsProficiencyLevels[attr] != null &&
          SRD35.armorsProficiencyLevels[attr] <= characterProfLevel) ||
         attrs['armorProficiency.' + attr] != null) {
        choices[choices.length] = attr;
      }
    }
    if(choices.length > 0) {
      attributes['armor'] = choices[ScribeUtils.random(0, choices.length - 1)];
    }
  } else if(attribute == 'deity') {
    /* Pick a deity that's no more than one alignment position removed. */
    var aliInfo = attributes.alignment.match(/^([CLN]).* ([GEN])/);
    var aliPat;
    if(aliInfo == null) /* Neutral character */
      aliPat = '\\((N[ \\)]|N.|.N)';
    else if(aliInfo[1] == 'N')
      aliPat = '\\((N[ \\)]|.' + aliInfo[2] + ')';
    else if(aliInfo[2] == 'N')
      aliPat = '\\((N[ \\)]|' + aliInfo[1] + '.)';
    else
      aliPat = '\\(([N' + aliInfo[1] + '][N' + aliInfo[2] + '])';
    choices = [];
    for(attr in this.getChoices('deities')) {
      if(attr.match(aliPat))
        choices[choices.length] = attr;
    }
    if(choices.length > 0) {
      attributes['deity'] = choices[ScribeUtils.random(0, choices.length - 1)];
    }
  } else if(attribute == 'domains') {
    attrs = this.applyRules(attributes);
    howMany = attrs.domainCount;
    if(howMany != null) {
      if((choices = this.getChoices('deities')[attributes.deity]) == null)
        choices = ScribeUtils.getKeys(this.getChoices('domains'));
      else
        choices = choices.split('/');
      pickAttrs(attributes, 'domains.', choices, howMany -
                ScribeUtils.sumMatching(attributes, /^domains\./), 1);
    }
  } else if(attribute == 'feats' || attribute == 'features') {
    attribute = attribute == 'feats' ? 'feat' : 'selectableFeature';
    var countPat = new RegExp('^' + attribute + 'Count\\.');
    var prefix = attribute + 's';
    var suffix =
      attribute.substring(0, 1).toUpperCase() + attribute.substring(1);
    var toAllocateByType = {};
    attrs = this.applyRules(attributes);
    for(attr in attrs) {
      if(attr.match(countPat)) {
        toAllocateByType[attr.replace(countPat, '')] = attrs[attr];
      }
    }
    var availableChoices = {};
    var allChoices = this.getChoices(prefix);
    for(attr in allChoices) {
      if(attrs[prefix + '.' + attr] != null) {
        var type = 'General';
        for(var a in toAllocateByType) {
          if(ScribeUtils.findElement(allChoices[attr].split('/'), a) >= 0 &&
             toAllocateByType[a] > 0) {
            type = a;
            break;
          }
        }
        toAllocateByType[type]--;
      } else if(attrs['features.' + attr] == null) {
        availableChoices[attr] = allChoices[attr];
      }
    }
    var debug = [];
    for(attr in toAllocateByType) {
      var availableChoicesInType = {};
      for(var a in availableChoices) {
        if(attr == 'General' ||
           ScribeUtils.findElement(availableChoices[a].split('/'), attr) >= 0) {
          availableChoicesInType[a] = '';
        }
      }
      howMany = toAllocateByType[attr];
      debug[debug.length] = 'Choose ' + howMany + ' ' + attr + ' ' + prefix;
      while(howMany > 0 &&
            (choices=ScribeUtils.getKeys(availableChoicesInType)).length > 0) {
        debug[debug.length] =
          'Pick ' + howMany + ' from ' +
          ScribeUtils.getKeys(availableChoicesInType).length;
        var picks = {};
        pickAttrs(picks, '', choices, howMany, 1);
        debug[debug.length] =
          'From ' + ScribeUtils.getKeys(picks).join(", ") + ' reject';
        for(var pick in picks) {
          attributes[prefix + '.' + pick] = 1;
          delete availableChoicesInType[pick];
        }
        var validate = this.applyRules(attributes);
        for(var pick in picks) {
          var name = pick.substring(0, 1).toLowerCase() +
                     pick.substring(1).replace(/ /g, '').
                     replace(/\(/g, '\\(').replace(/\)/g, '\\)');
          if(ScribeUtils.sumMatching
               (validate,
                new RegExp('^(sanity|validation)Notes.'+name+suffix)) != 0) {
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
  } else if(attribute == 'hitPoints') {
    attributes.hitPoints = 0;
    for(var klass in this.getChoices('levels')) {
      if((attr = attributes['levels.' + klass]) == null)
        continue;
      var matchInfo =
        this.getChoices('levels')[klass].match(/^((\d+)?d)?(\d+)$/);
      var number = matchInfo == null || matchInfo[2] == null ||
                   matchInfo[2] == '' ? 1 : matchInfo[2];
      var sides = matchInfo == null || matchInfo[3] == null ||
                  matchInfo[3] == '' ? 6 : matchInfo[3];
      attributes.hitPoints += number * sides;
      while(--attr > 0)
        attributes.hitPoints += ScribeUtils.random(number, number * sides);
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
    pickAttrs(attributes, 'languages.', choices, howMany, 1);
  } else if(attribute == 'levels') {
    var assignedLevels = ScribeUtils.sumMatching(attributes, /^levels\./);
    if(!attributes.level) {
      if(assignedLevels > 0)
        attributes.level = assignedLevels
      else if(attributes.experience)
        attributes.level =
          Math.floor((1 + Math.sqrt(1 + attributes.experience/125)) / 2);
      else
        // Random 1..8 with each value half as likely as the previous one.
        attributes.level =
          9 - Math.floor(Math.log(ScribeUtils.random(2, 511)) / Math.log(2));
    }
    var max = attributes.level * (attributes.level + 1) * 1000 / 2 - 1;
    var min = attributes.level * (attributes.level - 1) * 1000 / 2;
    if(!attributes.experience || attributes.experience < min)
      attributes.experience = ScribeUtils.random(min, max);
    choices = ScribeUtils.getKeys(this.getChoices('levels'));
    if(assignedLevels == 0) {
      var classesToChoose =
        attributes.level == 1 || ScribeUtils.random(1,10) < 9 ? 1 : 2;
      // Find choices that are valid or can be made so
      while(classesToChoose > 0) {
        var which = 'levels.' + choices[ScribeUtils.random(0,choices.length-1)];
        attributes[which] = 1;
        if(ScribeUtils.sumMatching(this.applyRules(attributes),
             /^validationNotes.*(BaseAttack|CasterLevel|Spells)/) == 0) {
          assignedLevels++;
          classesToChoose--;
        } else {
          delete attributes[which];
        }
      }
    }
    while(assignedLevels < attributes.level) {
      var which = 'levels.' + choices[ScribeUtils.random(0,choices.length-1)];
      while(!attributes[which]) {
        which = 'levels.' + choices[ScribeUtils.random(0,choices.length-1)];
      }
      attributes[which]++;
      assignedLevels++;
    }
    delete attributes.level;
  } else if(attribute == 'name') {
    attributes['name'] = SRD35.randomName(attributes['race']);
  } else if(attribute == 'shield') {
    attrs = this.applyRules(attributes);
    var characterProfLevel = attrs.shieldProficiencyLevel;
    if(characterProfLevel == null) {
      characterProfLevel = SRD35.PROFICIENCY_NONE;
    }
    choices = [];
    for(attr in this.getChoices('shields')) {
      if((SRD35.shieldsProficiencyLevels[attr] != null &&
          SRD35.shieldsProficiencyLevels[attr] <= characterProfLevel) ||
         attrs['shieldProficiency.' + attr] != null) {
        choices[choices.length] = attr;
      }
    }
    if(choices.length > 0) {
      attributes['shield'] = choices[ScribeUtils.random(0, choices.length - 1)];
    }
  } else if(attribute == 'skills') {
    attrs = this.applyRules(attributes);
    var maxPoints = attrs.maxAllowedSkillPoints;
    howMany =
      attrs.skillPoints - ScribeUtils.sumMatching(attributes, '^skills\\.'),
    choices = ScribeUtils.getKeys(this.getChoices('skills'));
    for(i = choices.length - 1; i >= 0; i--)
      if(choices[i].indexOf(' (') >= 0)
        choices = choices.slice(0, i).concat(choices.slice(i + 1));
    while(howMany > 0 && choices.length > 0) {
      var pickClassSkill = ScribeUtils.random(0, 99) >= 15;
      i = ScribeUtils.random(0, choices.length - 1);
      var skill = choices[i];
      if((attrs['classSkills.' + skill] != null) != pickClassSkill)
        continue;
      attr = 'skills.' + skill;
      var current = attributes[attr];
      if(current != null && current >= maxPoints) {
        choices = choices.slice(0, i).concat(choices.slice(i + 1));
        continue;
      }
      if(current == null)
        current = attributes[attr] = 0;
      var toAssign =
        ScribeUtils.random(0, 99) >= 66 ? maxPoints :
        ScribeUtils.random(0, 99) >= 50 ? Math.floor(maxPoints / 2) : 2;
      if(toAssign > howMany)
        toAssign = howMany;
      if(toAssign == 0)
        toAssign = 1;
      if(current + toAssign > maxPoints)
        toAssign = maxPoints - current;
      attributes[attr] = attributes[attr] + toAssign;
      howMany -= toAssign;
      // Select only one of a set of subskills (Craft, Perform, etc.)
      if((i = skill.indexOf(' (')) >= 0) {
        skill = skill.substring(0, i);
        for(i = choices.length - 1; i >= 0; i--)
          if(choices[i].search(skill) == 0)
            choices = choices.slice(0, i).concat(choices.slice(i + 1));
      }
    }
  } else if(attribute == 'spells') {
    var availableSpellsByLevel = {};
    var matchInfo;
    var prohibitPat = ' (xxxx';
    var schools = this.getChoices('schools');
    var spellLevel;
    attrs = this.applyRules(attributes);
    for(attr in schools) {
      if(attrs['prohibit.' + attr])
         prohibitPat += '|' + schools[attr];
    }
    prohibitPat += ')\\)';
    for(attr in this.getChoices('spells')) {
      if(attrs['spells.' + attr] != null || attr.match(prohibitPat)) {
        continue;
      }
      spellLevel = attr.split('(')[1].split(' ')[0];
      if(availableSpellsByLevel[spellLevel] == null)
        availableSpellsByLevel[spellLevel] = [];
      availableSpellsByLevel[spellLevel]
        [availableSpellsByLevel[spellLevel].length] = attr;
    }
    for(attr in attrs) {
      if((matchInfo = attr.match(/^spellsKnown\.(.*)/)) == null) {
        continue;
      }
      spellLevel = matchInfo[1];
      howMany = attrs[attr];
      if(spellLevel.match(/^S\d+$/)) {
        spellLevel = spellLevel.replace(/S/, 'W');
        var additional = attrs['spellsKnown.' + spellLevel];
        if(additional == null)
          ; // empty
        else if(additional == 'all' || howMany == 'all')
          howMany = 'all';
        else
          howMany += additional;
      }
      if(spellLevel.substring(0, 3) == 'Dom') {
        choices = [];
        for(var domain in this.getChoices('domains')) {
          if(attrs['domains.' + domain] != null) {
            var domainLevel = domain + spellLevel.substring(3);
            if(availableSpellsByLevel[domainLevel] != null) {
              choices = choices.concat(availableSpellsByLevel[domainLevel]);
            }
          }
        }
      } else {
        choices = availableSpellsByLevel[spellLevel];
      }
      if(choices != null) {
        if(howMany == 'all') {
          howMany = choices.length;
        }
        var perDay = attrs['spellsPerDay.' + spellLevel];
        if(perDay != null && perDay < howMany) {
          howMany = perDay;
        }
        pickAttrs
          (attributes, 'spells.', choices, howMany -
           ScribeUtils.sumMatching(attributes, '^spells\\..*' + spellLevel),
           1);
      }
    }
  } else if(attribute == 'weapons') {
    attrs = this.applyRules(attributes);
    var characterProfLevel = attrs.weaponProficiencyLevel;
    if(characterProfLevel == null) {
      characterProfLevel = SRD35.PROFICIENCY_NONE;
    }
    choices = [];
    var weapons = this.getChoices('weapons');
    for(attr in weapons) {
      var requiredProfLevel =
        weapons[attr].indexOf('Un') >= 0 ? SRD35.PROFICIENCY_NONE :
        weapons[attr].indexOf('Si') >= 0 ? SRD35.PROFICIENCY_LIGHT :
        weapons[attr].indexOf('Ma') >= 0 ? SRD35.PROFICIENCY_MARTIAL :
                                           SRD35.PROFICIENCY_HEAVY;
      if(requiredProfLevel <= characterProfLevel ||
         attrs['features.Weapon Proficiency (' + attr + ')'] != null) {
        choices[choices.length] = attr;
      }
    }
    pickAttrs(attributes, 'weapons.', choices,
              3 - ScribeUtils.sumMatching(attributes, /^weapons\./), 1);
  } else if(attribute == 'charisma' || attribute == 'constitution' ||
     attribute == 'dexterity' || attribute == 'intelligence' ||
     attribute == 'strength' || attribute == 'wisdom') {
    var rolls = [];
    for(i = 0; i < 4; i++)
      rolls[i] = ScribeUtils.random(1, 6);
    rolls.sort();
    attributes[attribute] = rolls[1] + rolls[2] + rolls[3];
  } else if(this.getChoices(attribute + 's') != null) {
    attributes[attribute] =
      ScribeUtils.randomKey(this.getChoices(attribute + 's'));
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

    // Try to fix each sanity/validation note w/a non-zero value
    for(var attr in applied) {

      var matchInfo =
        attr.match(/^(sanity|validation)Notes\.(.*)([A-Z][a-z]+)/);
      var attrValue = applied[attr];

      if(matchInfo == null || !attrValue || notes[attr] == null) {
        continue;
      }

      var problemSource = matchInfo[2];
      var problemCategory = matchInfo[3].substring(0, 1).toLowerCase() +
                            matchInfo[3].substring(1).replace(/ /g, '');
      if(problemCategory == 'features') {
        problemCategory = 'selectableFeatures';
      }
      var requirements =
        notes[attr].replace(/^(Implies|Requires) /, '').split(/\s*\/\s*/);

      for(var i = 0; i < requirements.length; i++) {

        // Find a random requirement choice w/the format "name [op value]"
        var choices = requirements[i].split(/\s*\|\|\s*/);
        while(choices.length > 0) {
          var index = ScribeUtils.random(0, choices.length - 1);
          matchInfo = choices[index].match(/^([^<>!=]+)(([<>!=~]+)(.*))?/);
          if(matchInfo != null) {
            break;
          }
          choices = choices.slice(0, index).concat(choice.slice(index + 1));
        }
        if(matchInfo == null) {
          continue;
        }

        var toFixCombiner = null;
        var toFixName = matchInfo[1].replace(/\s+$/, '');
        var toFixOp = matchInfo[3] == null ? '>=' : matchInfo[3];
        var toFixValue = matchInfo[4] == null ? 1 :
                         matchInfo[4].replace(/^\s+/, '').replace(/"/g, '');
        if(toFixName.match(/^(Max|Sum)/)) {
          toFixCombiner = toFixName.substring(0, 3);
          toFixName = toFixName.substring(4).replace(/^\s+/, '');
        }
        var toFixAttr = toFixName.substring(0, 1).toLowerCase() +
                        toFixName.substring(1).replace(/ /g, '');

        // See if this attr has a set of choices (e.g., race) or a category
        // attribute (e.g., a feat)
        choices = this.getChoices(toFixAttr + 's');
        if(choices == null) {
          choices = this.getChoices(problemCategory);
        }
        if(choices != null) {
          // Find the set of choices that satisfy the requirement
          var target =
            this.getChoices(problemCategory) == null ? toFixValue : toFixName;
          var possibilities = [];
          for(var choice in choices) {
            if((toFixOp.match(/[^!]=/) && choice == target) ||
               (toFixOp == '!=' && choice != target) ||
               (toFixCombiner != null && choice.indexOf(target) == 0) ||
               (toFixOp == '=~' && choice.match(new RegExp(target))) ||
               (toFixOp == '!~' && !choice.match(new RegExp(target)))) {
              possibilities[possibilities.length] = choice;
            }
          }
          if(possibilities.length == 0) {
            continue; // No fix possible
          } else if(attributes[toFixAttr] != null &&
                    possibilities.indexOf(attributes[toFixAttr]) >= 0) {
            continue; // No fix needed
          }
          if(target == toFixName) {
            toFixAttr =
              problemCategory + '.' +
              possibilities[ScribeUtils.random(0, possibilities.length - 1)];
          } else {
            toFixValue =
              possibilities[ScribeUtils.random(0, possibilities.length - 1)];
          }
        } else if(attributes[toFixAttr] != null) {
          if((toFixOp == '>=' && Number(attributes[toFixAttr]) >= Number(toFixValue)) ||
             (toFixOp == '<=' && Number(attributes[toFixAttr]) <= Number(toFixValue))) {
              continue; // No fix needed
          }
        }
        if((choices != null || attributes[toFixAttr] != null) &&
           attributesChanged[toFixAttr] == null) {
          // Directly-fixable problem
          debug[debug.length] =
            attr + " '" + toFixAttr + "': '" + attributes[toFixAttr] +
            "' => '" + toFixValue + "'";
          if(toFixValue == 0) {
            delete attributes[toFixAttr];
          } else {
            attributes[toFixAttr] = toFixValue;
          }
          attributesChanged[toFixAttr] = toFixValue;
          fixedThisPass++;
        } else if(problemCategory == 'total' && attrValue > 0 &&
                  (choices = this.getChoices(problemSource)) != null) {
          // Too many items allocated in a category
          var possibilities = [];
          for(var k in attributes) {
            if(k.match('^' + problemSource + '\\.') &&
               attributesChanged[k] == null) {
               possibilities[possibilities.length] = k;
            }
          }
          while(possibilities.length > 0 && attrValue > 0) {
            var index = ScribeUtils.random(0, possibilities.length - 1);
            toFixAttr = possibilities[index];
            possibilities =
              possibilities.slice(0,index).concat(possibilities.slice(index+1));
            var current = attributes[toFixAttr];
            toFixValue = current > attrValue ? current - attrValue : 0;
            debug[debug.length] =
              attr + " '" + toFixAttr + "': '" + attributes[toFixAttr] +
              "' => '" + toFixValue + "'";
            if(toFixValue == 0) {
              delete attributes[toFixAttr];
            } else {
              attributes[toFixAttr] = toFixValue;
            }
            attrValue -= current - toFixValue;
            // Don't do this: attributesChanged[toFixAttr] = toFixValue;
            fixedThisPass++;
          }
        } else if(problemCategory == 'total' && attrValue < 0 &&
                  (choices = this.getChoices(problemSource)) != null) {
          // Too few items allocated in a category
          this.randomizeOneAttribute(attributes,
            problemSource == 'selectableFeatures' ? 'features' : problemSource
          );
          debug[debug.length] = attr + ' Allocate additional ' + problemSource;
          fixedThisPass++;
        } else if(attr.match(/validationNotes.abilityModifier(Sum|Minimum)/)) {
          // Special cases
          var abilities = {
            'charisma':'', 'constitution':'', 'dexterity':'',
            'intelligence':'', 'strength':'', 'wisdom':''
          };
          if(attr == 'validationNotes.abilityModifierMinimum') {
            toFixAttr = ScribeUtils.randomKey(abilities);
            toFixValue = 14;
            debug[debug.length] =
              attr + " '" + toFixAttr + "': '" + attributes[toFixAttr] +
              "' => '" + toFixValue + "'";
            attributes[toFixAttr] = toFixValue;
            // Don't do this: attributesChanged[toFixAttr] = toFixValue;
            fixedThisPass++;
          } else {
            for(toFixAttr in abilities) {
              if(applied[toFixAttr + 'Modifier'] <= 0) {
                toFixValue = attributes[toFixAttr] + 2;
                debug[debug.length] =
                  attr + " '" + toFixAttr + "': '" + attributes[toFixAttr] +
                  "' => '" + toFixValue + "'";
                attributes[toFixAttr] = toFixValue;
                // Don't do this: attributesChanged[toFixAttr] = toFixValue;
                fixedThisPass++;
              }
            }
          }
        }

      }

    }

    debug[debug.length] = '-----';
    if(fixedThisPass == 0) {
      break;
    }

  }

  if(window.DEBUG) {
    var notes = attributes.notes;
    attributes.notes =
      (notes != null ? attributes.notes + '\n' : '') + debug.join('\n');
  }

};

/* Returns HTML body content for user notes associated with this rule set. */
SRD35.ruleNotes = function() {
  return '' +
    '<h2>SRD35 Scribe Module Notes</h2>\n' +
    'SRD35 Scribe Module Version ' + SRD35_VERSION + '\n' +
    '\n' +
    '<h3>Usage Notes</h3>\n' +
    '<p>\n' +
    '<ul>\n' +
    '  <li>\n' +
    '    Although they have a range increment, the weapons Club, Dagger,\n' +
    '    Light Hammer, Sai, Shortspear, Spear, and Trident are all\n' +
    '    considered melee weapons.  Substitute the ranged attack attribute\n' +
    '    for the melee attack attribute given on the character sheet when\n' +
    '    any of these is thrown.\n' +
    '  </li><li>\n' +
    '    The armor class of characters with the Dodge feat includes a +1\n' +
    '    bonus that applies only to one foe at a time.\n' +
    '  </li><li>\n' +
    '    For purposes of computing strength damage bonuses, Scribe assumes\n' +
    '    that characters with a buckler wield their weapons one-handed and\n' +
    '    that characters with no buckler or shield wield with both hands.\n' +
    '  </li><li>\n' +
    '    Scribe assumes that masterwork composite bows are specially built\n' +
    '    to allow a strength damage bonus to be applied.\n' +
    '  </li><li>\n' +
    '    A few feats have been renamed to emphasize the relationship\n' +
    '    between similar feats: "Shield Proficiency" and "Tower Shield\n' +
    '    Proficiency" to "Shield Proficiency (Heavy)" and "Shield\n' +
    '    Proficiency (Tower)"; "Simple Weapon Proficiency" to "Weapon\n' +
    '    Proficiency (Simple)"; "Exotic Weapon Proficiency" and "Martial\n' +
    '    Weapon Proficiency" to "Weapon Proficiency" (a base feat that\n' +
    '    should be used to define weapon-specific subfeats).\n' +
    '  </li><li>\n' +
    '    The Commoner NPC class is given an extra feat to represent the\n' +
    '    class\'s single simple weapon proficiency.\n' +
    '  </li>\n' +
    '</ul>\n' +
    '</p>\n' +
    '\n' +
    '<h3>Limitations</h3>\n' +
    '<p>\n' +
    '<ul>\n' +
    '  <li>\n' +
    '    Racial favored class is not reported.\n' +
    '  </li><li>\n' +
    '    You can only select each feat once. Multiple selections of feats\n' +
    '    that allow it can be managed by defining custom feats.\n' +
    '  </li><li>\n' +
    '    Scribe doesn\'t support double weapons where the two attacks have\n' +
    '    different critical mutipliers. In the predefined weapons this\n' +
    '    affects only the Gnome Hooked Hammer, where Scribe displays a\n' +
    '    critical multiplier of x4 instead of x3/x4.\n' +
    '  </li><li>\n' +
    '    Animal companion feats, skills, and tricks are not supported\n' +
    '  </li><li>\n' +
    '    Scribe provides no place other than the notes section to enter\n' +
    '    mundane possessions like lanterns and rope. The same goes for\n' +
    '    physical description.\n' +
    '  </li><li>\n' +
    '    Scribe has problems dealing with attributes containing an\n' +
    '    uncapitalized word.  This is why, e.g., Scribe defines the skills\n' +
    '    "Sleight Of Hand" and "Knowledge (Arcana)" instead of "Sleight of\n' +
    '    Hand" and "Knowledge (arcana)".  There are other occasions when\n' +
    '    Scribe is picky about case; when defining your own attributes,\n' +
    '    it\'s safest to follow the conventions Scribe uses.\n' +
    '  </li>\n' +
    '</ul>\n' +
    '</p>\n' +
    '\n' +
    '<h3>Known Bugs</h3>\n' +
    '<p>\n' +
    '<ul>\n' +
    '  <li>\n' +
    '    When an character ability score is modified, Scribe recalculates\n' +
    '    attributes based on that ability from scratch.  For example,\n' +
    '    bumping intelligence when a character reaches fourth level causes\n' +
    '    Scribe to recompute the number of skill points awarded at first\n' +
    '    level.\n' +
    '  </li><li>\n' +
    '    Multi-class characters get quadruple spell points for the first\n' +
    '    level in each class, instead of just the first class.\n' +
    '  </li><li>\n' +
    '    For monks, Scribe shows the unarmed damage for medium size, even\n' +
    '    if the monk is small or large.\n' +
    '  </li>\n' +
    '</ul>\n' +
    '</p>\n';
};

/*
 * A convenience function that adds #name# to the list of valid classes in
 * #rules#.  Characters of class #name# roll #hitDice# ([Nd]S, where N is the
 * number of dice and S the number of sides) more hit points at each level.
 * All other parameters are optional.  #skillPoints# is the number of skill
 * points a character of the class receives each level; #baseAttackBonus#,
 * #saveFortitudeBonus#, #saveReflexBonus# and #saveWillBonus# are JavaScript
 * expressions that compute the attack and saving throw bonuses the character
 * accumulates each class level; #armorProficiencyLevel#,
 * #shieldProficiencyLevel# and #weaponProficiencyLevel# indicate any
 * proficiency in these categories that characters of the class gain;
 * #classSkills# is an array of skills that are class skills (as opposed to
 * cross-class) for the class, #features# an array of level:feature name pairs
 * indicating features that the class acquires when advancing levels,
 * #spellsKnown# an array of information about the type, number, and level of
 * spells known at each class level, #spellsPerDay# an array of information
 * about the type, number, and level of spells castable per day at each class
 * level, and #spellAbility# the ability that pertains to this class' spells.
 */
SRD35.defineClass = function
  (rules, name, hitDice, skillPoints, baseAttackBonus, saveFortitudeBonus,
   saveReflexBonus, saveWillBonus, armorProficiencyLevel,
   shieldProficiencyLevel, weaponProficiencyLevel, classSkills, features,
   spellsKnown, spellsPerDay, spellAbility) {

  var classLevel = 'levels.' + name;
  rules.defineChoice('levels', name + ':' + hitDice);
  if(skillPoints != null)
    rules.defineRule
      ('skillPoints', classLevel, '+', '(source + 3) * ' + skillPoints);
  if(baseAttackBonus != null)
    rules.defineRule('baseAttack', classLevel, '+', baseAttackBonus);
  if(saveFortitudeBonus != null) {
    rules.defineRule
      ('classFortitudeBonus', classLevel, '+=', saveFortitudeBonus);
    rules.defineRule('save.Fortitude', 'classFortitudeBonus', '+', null);
  }
  if(saveReflexBonus != null) {
    rules.defineRule('classReflexBonus', classLevel, '+=', saveReflexBonus);
    rules.defineRule('save.Reflex', 'classReflexBonus', '+', null);
  }
  if(saveWillBonus != null) {
    rules.defineRule('classWillBonus', classLevel, '+=', saveWillBonus);
    rules.defineRule('save.Will', 'classWillBonus', '+', null);
  }
  if(armorProficiencyLevel == null)
    armorProficiencyLevel = SRD35.PROFICIENCY_NONE;
  rules.defineRule
    ('classArmorProficiencyLevel', classLevel, '^=', armorProficiencyLevel);
  if(shieldProficiencyLevel == null)
    shieldProficiencyLevel = SRD35.PROFICIENCY_NONE;
  rules.defineRule
    ('classShieldProficiencyLevel', classLevel, '^=', shieldProficiencyLevel);
  if(weaponProficiencyLevel == null)
    weaponProficiencyLevel = SRD35.PROFICIENCY_NONE;
  rules.defineRule
    ('classWeaponProficiencyLevel', classLevel, '^=', weaponProficiencyLevel);
  if(classSkills != null) {
    for(var i = 0; i < classSkills.length; i++) {
      rules.defineRule('classSkills.' + classSkills[i], classLevel, '=', '1');
    }
  }
  if(features != null) {
    var prefix =
      name.substring(0, 1).toLowerCase() + name.substring(1).replace(/ /g, '');
    for(var i = 0; i < features.length; i++) {
      var levelAndFeature = features[i].split(/:/);
      var feature = levelAndFeature[levelAndFeature.length == 1 ? 0 : 1];
      var level = levelAndFeature.length == 1 ? 1 : levelAndFeature[0];
      var matchInfo;
      rules.defineRule(prefix + 'Features.' + feature,
        'levels.' + name, '=', 'source >= ' + level + ' ? 1 : null'
      );
      rules.defineRule
        ('features.' + feature, prefix + 'Features.' + feature, '+=', null);
      if((matchInfo = feature.match(/^Weapon (Familiarity|Proficiency) \((.*\/.*)\)$/)) != null) {
        // Set individual features for each weapon on the list.
        var weapons = matchInfo[2].split('/');
        for(var j = 0; j < weapons.length; j++) {
          rules.defineRule('features.Weapon ' + matchInfo[1] + ' (' + weapons[j] + ')', 'features.' + feature, '=', '1');
        }
      }
    }
    rules.defineSheetElement(name + ' Features', 'Feats+', null, '; ');
  }
  if(spellAbility != null) {
    rules.defineRule('spellDifficultyClass.' + name,
      'levels.' + name, '?', null,
      spellAbility + 'Modifier', '=', '10 + source'
    );
  }
  if(spellsKnown != null || spellsPerDay != null) {
    rules.defineRule('casterSpellLevel.' + name,
      'levels.' + name, '=', null,
      'magicNotes.casterLevelBonusFeature', '+', null
    );
  }
  if(spellsKnown != null) {
    for(var j = 0; j < spellsKnown.length; j++) {
      var typeAndLevel = spellsKnown[j].split(/:/)[0];
      var level = typeAndLevel.replace(/[A-Za-z]*/g, '');
      var code = spellsKnown[j].substring(typeAndLevel.length + 1).
                 split(/\//).reverse().join('source >= ');
      code = code.replace(/:/g, ' ? ').replace(/source/g, ' : source');
      code = 'source >= ' + code + ' : null';
      if(code.indexOf('source >= 1 ?') >= 0) {
        code = code.replace(/source >= 1 ./, '').replace(/ : null/, '');
      }
      rules.defineRule
        ('spellsKnown.' + typeAndLevel, 'casterSpellLevel.' + name, '=', code);
    }
  }
  if(spellsPerDay != null) {
    for(var j = 0; j < spellsPerDay.length; j++) {
      var typeAndLevel = spellsPerDay[j].split(/:/)[0];
      var level = typeAndLevel.replace(/[A-Z]*/, '');
      var code = spellsPerDay[j].substring(typeAndLevel.length + 1).
                 split(/\//).reverse().join('source >= ');
      code = code.replace(/:/g, ' ? ').replace(/source/g, ' : source');
      code = 'source >= ' + code + ' : null';
      if(code.indexOf('source >= 1 ?') >= 0) {
        code = code.replace(/source >= 1 ./, '').replace(/ : null/, '');
      }
      rules.defineRule
        ('spellsPerDay.' + typeAndLevel, 'casterSpellLevel.' + name, '=', code);
      if(spellAbility != null) {
        var modifier = spellAbility + 'Modifier';
        var level = typeAndLevel.replace(/[A-Za-z]*/g, '');
        if(level > 0) {
          code = 'source >= ' + level +
                 ' ? 1 + Math.floor((source - ' + level + ') / 4) : null';
          rules.defineRule
            ('spellsPerDay.' + typeAndLevel, modifier, '+', code);
        }
      }
    }
  }

};

/*
 * A convenience function that adds #name# to the list of valid races in
 * #rules#.  #abilityAdjustment# is either null or a note of the form "[+-]n
 * Ability[/[+-]n Ability]*", indicating ability adjustments for the race.
 * #features# is either null or an array of strings of the form
 * "[level:]Feature", indicating a list of features associated with the race
 * and the character levels at which they're acquired.  If no level is included
 * with a feature, the feature is acquired at level 1.
 */
SRD35.defineRace = function(rules, name, abilityAdjustment, features) {
  rules.defineChoice('races', name);
  var prefix =
    name.substring(0, 1).toLowerCase() + name.substring(1).replace(/ /g, '');
  if(abilityAdjustment != null) {
    var abilityNote = 'abilityNotes.' + prefix + 'AbilityAdjustment';
    rules.defineNote(abilityNote + ':' + abilityAdjustment);
    var adjustments = abilityAdjustment.split(/\//);
    for(var i = 0; i < adjustments.length; i++) {
      var amountAndAbility = adjustments[i].split(/ +/);
      if(amountAndAbility[1] != 'any')
        rules.defineRule
          (amountAndAbility[1], abilityNote, '+', amountAndAbility[0]);
    }
    rules.defineRule
      (abilityNote, 'race', '=', 'source == "' + name + '" ? 1 : null');
  }
  if(features != null) {
    for(var i = 0; i < features.length; i++) {
      var levelAndFeature = features[i].split(/:/);
      var feature = levelAndFeature[levelAndFeature.length == 1 ? 0 : 1];
      var level = levelAndFeature.length == 1 ? 1 : levelAndFeature[0];
      var matchInfo;
      rules.defineRule(prefix + 'Features.' + feature,
        'race', '?', 'source == "' + name + '"',
        'level', '=', 'source >= ' + level + ' ? 1 : null'
      );
      rules.defineRule
        ('features.' + feature, prefix + 'Features.' + feature, '+=', null);
      if((matchInfo = feature.match(/^Weapon (Familiarity|Proficiency) \((.*\/.*)\)$/)) != null) {
        // Set individual features for each weapon on the list.
        var weapons = matchInfo[2].split('/');
        for(var j = 0; j < weapons.length; j++) {
          rules.defineRule('features.Weapon ' + matchInfo[1] + ' (' + weapons[j] + ')', 'features.' + feature, '=', '1');
        }
      }
    }
    rules.defineSheetElement(name + ' Features', 'Feats+', null, '; ');
  }
};

/*
 * A convenience function that adds #name# to the list of known skills in
 * #rules#.  #ability# is either null or the three-character abbreviation for
 * the skills primary ability ("str", "int", "dex", etc.). #trainedOnly# is
 * a boolean indicating whether only those trained in the skill can use it.
 * #synergy#, if not null, is a slash-delimited list of skill names with which
 * this skill has a synergy. #classes#, if not null, is either "all" or a slash-
 * delimited list of class names, indicating the classes for which this skill
 * is a class skill.
 */
SRD35.defineSkill = function
  (rules, name, ability, trainedOnly, synergy, classes) {

  var abilityNames = {
    'cha':'charisma', 'con':'constitution', 'dex':'dexterity',
    'int':'intelligence', 'str':'strength', 'wis':'wisdom'
  };

  rules.defineChoice('skills', name + ':' + (ability ? ability : ''));
  rules.defineRule('skillModifier.' + name,
    'skills.' + name, '=', 'source / 2',
    'classSkills.' + name, '*', '2'
  );
  rules.defineNote('skills.' + name + ':(%1%2) %V (%3)');
  rules.defineRule
    ('skills.' + name + '.1', 'skills.' + name, '=', '"' + ability + '"');
  rules.defineRule('skills.' + name + '.2',
    'skills.' + name, '?', '1',
    '', '=', '";cc"',
    'classSkills.' + name, '=', '""'
  );
  rules.defineRule('skills.' + name + '.3', 'skillModifier.' + name, '=', null);

  if(ability && abilityNames[ability]) {
    rules.defineRule('skillModifier.' + name,
      abilityNames[ability] + 'Modifier', '+', null
    );
  }

  if(synergy != null) {
    var prefix = name.substring(0, 1).toLowerCase() +
                 name.substring(1).replace(/ /g, '');
    rules.defineNote('skillNotes.' + prefix + 'Synergy:+2 ' + synergy);
  }

  if(name == 'Knowledge (Religion)') {
    rules.defineRule('turnUndead.maxHitDice',
      'skillNotes.knowledge(Religion)Synergy', '+', '2'
    );
  } else if(name == 'Speak Language') {
    rules.defineRule
      ('languageCount', 'skillModifier.Speak Language', '+', null);
  }

  if(classes == 'all') {
    rules.defineRule('classSkills.' + name, 'level', '=', '1');
  } else if(classes) {
    classes = classes.split('/');
    for(var i = 0; i < classes.length; i++)
      rules.defineRule('classSkills.' + name, 'levels.'+classes[i], '=', '1');
  }

}

/* Convenience functions that invoke ScribeRules methods on the SRD35 rules. */
SRD35.applyRules = function() {
  return SRD35.rules.applyRules.apply(SRD35.rules, arguments);
};

SRD35.defineChoice = function() {
  return SRD35.rules.defineChoice.apply(SRD35.rules, arguments);
};

SRD35.defineEditorElement = function() {
  return SRD35.rules.defineEditorElement.apply(SRD35.rules, arguments);
};

SRD35.defineNote = function() {
  return SRD35.rules.defineNote.apply(SRD35.rules, arguments);
};

SRD35.defineRule = function() {
  return SRD35.rules.defineRule.apply(SRD35.rules, arguments);
};

SRD35.defineSheetElement = function() {
  return SRD35.rules.defineSheetElement.apply(SRD35.rules, arguments);
};

SRD35.getChoices = function() {
  return SRD35.rules.getChoices.apply(SRD35.rules, arguments);
};

SRD35.isSource = function() {
  return SRD35.rules.isSource.apply(SRD35.rules, arguments);
};
