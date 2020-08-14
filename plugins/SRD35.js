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

var SRD35_VERSION = '2.0.1.0';

/*
 * This module loads the rules from the System Reference Documents v3.5. The
 * SRD35 function contains methods that load rules for particular parts of the
 * SRD; raceRules for character races, domainRules for cleric domains, etc.
 * These member methods can be called independently in order to use a subset of
 * the SRD v3.5 rules.  Similarly, the constant fields of SRD35 (ALIGNMENTS,
 * FEATS, etc.) can be manipulated to modify the choices.
 */
function SRD35() {

  var rules = new QuilvynRules('SRD v3.5', SRD35_VERSION);
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
    'feats', 'featCount', 'selectableFeatureCount',
  );
  rules.defineChoice('preset', 'race', 'level', 'levels');

  SRD35.abilityRules(rules);
  SRD35.aideRules(rules, SRD35.ANIMAL_COMPANIONS, SRD35.FAMILIARS);
  SRD35.combatRules(rules, SRD35.ARMORS, SRD35.SHIELDS, SRD35.WEAPONS);
  // Spell definition is handled by each individual class and domain. Schools
  // have to be defined before this can be done.
  SRD35.magicRules(rules, SRD35.SCHOOLS, []);
  SRD35.identityRules(
    rules, SRD35.ALIGNMENTS, SRD35.CLASSES, SRD35.DEITIES, SRD35.DOMAINS,
    SRD35.GENDERS, SRD35.RACES
  );
  SRD35.talentRules
    (rules, SRD35.FEATS, SRD35.FEATURES, SRD35.LANGUAGES, SRD35.SKILLS);
  SRD35.goodiesRules(rules);

  Quilvyn.addRuleSet(rules);

}

/* List of items handled by choiceRules method. */
SRD35.CHOICES = [
  'Alignment', 'Animal Companion', 'Armor', 'Class', 'Deity', 'Domain',
  'Familiar', 'Feat', 'Feature', 'Gender', 'Language', 'Race', 'School',
  'Shield', 'Skill', 'Spell', 'Weapon'
];
/*
 * List of items handled by randomizeOneAttribute method. The order handles
 * dependencies among attributes when generating random characters.
 */
SRD35.RANDOMIZABLE_ATTRIBUTES = [
  'charisma', 'constitution', 'dexterity', 'intelligence', 'strength', 'wisdom',
  'name', 'race', 'gender', 'alignment', 'deity', 'levels', 'features',
  'feats', 'skills', 'languages', 'hitPoints', 'armor', 'shield', 'weapons',
  'spells', 'companion'
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
SRD35.DEITIES = {
  'None':'' // SRD v3.5 defines no deities; they're in the Players Handbook
};
SRD35.DOMAINS = {
  'Air':
    'Features="1:Air Turning" ' +
    'Spells="Obscuring Mist","Wind Wall","Gaseous Form","Air Walk",' +
    '"Control Winds","Chain Lightning","Control Weather",Whirlwind,' +
    '"Elemental Swarm"',
  'Animal':
    'Features="1:Animal Talk","1:Nature Knowledge" ' +
    'Spells="Calm Animals","Hold Animal","Dominate Animal",' +
    '"Summon Nature\'s Ally IV","Commune With Nature","Antilife Shell",' +
    '"Animal Shapes","Summon Nature\'s Ally VIII",Shapechange',
  'Chaos':
    'Features="1:Empowered Chaos" ' +
    'Spells="Protection From Law",Shatter,"Magic Circle Against Law",' +
    '"Chaos Hammer","Dispel Law","Animate Objects","Word Of Chaos",' +
    '"Cloak Of Chaos","Summon Monster IX"',
  'Death':
    'Features="1:Deadly Touch" ' +
    'Spells="Cause Fear","Death Knell","Animate Dead","Death Ward",' +
    '"Slay Living","Create Undead",Destruction,"Create Greater Undead",' +
    '"Wail Of The Banshee"',
  'Destruction':
    'Features=1:Smite ' +
    'Spells="Inflict Light Wounds",Shatter,Contagion,' +
    '"Inflict Critical Wounds","Mass Inflict Light Wounds",Harm,Disintegrate,' +
    'Earthquake,Implosion',
  'Earth':
    'Features="1:Earth Turning" ' +
    'Spells="Magic Stone","Soften Earth And Stone","Stone Shape",' +
    '"Spike Stones","Wall Of Stone",Stoneskin,Earthquake,"Iron Body",' +
    '"Elemental Swarm"',
  'Evil':
    'Features="1:Empowered Evil" ' +
    'Spells="Protection From Good",Desecrate,"Magic Circle Against Good",' +
    '"Unholy Blight","Dispel Good","Create Undead",Blasphemy,"Unholy Aura",' +
    '"Summon Monster IX"',
  'Fire':
    'Features="1:Fire Turning" ' +
    'Spells="Burning Hands","Produce Flame","Resist Energy","Wall Of Fire",' +
    '"Fire Shield","Fire Seeds","Fire Storm","Incendiary Cloud",' +
    '"Elemental Swarm"',
  'Good':
    'Features="1:Empowered Good" ' +
    'Spells="Protection From Evil",Aid,"Magic Circle Against Evil",' +
    '"Holy Smite","Dispel Evil","Blade Barrier","Holy Word","Holy Aura",' +
    '"Summon Monster IX"',
  'Healing':
    'Features="1:Empowered Healing" ' +
    'Spells="Cure Light Wounds","Cure Moderate Wounds","Cure Serious Wounds",' +
    '"Cure Critical Wounds","Mass Cure Light Wounds",Heal,Regenerate,' +
    '"Mass Cure Critical Wounds","Mass Heal"',
  'Knowledge':
    'Features=1:All-Knowing,"1:Empowered Knowledge" ' +
    'Spells="Detect Secret Doors","Detect Thoughts",' +
    '"Clairaudience/Clairvoyance",Divination,"True Seeing","Find The Path",' +
    '"Legend Lore","Discern Location",Foresight',
  'Law':
    'Features="1:Empowered Law" ' +
    'Spells="Protection From Chaos","Calm Emotions",' +
    '"Magic Circle Against Chaos","Order\'s Wrath","Dispel Chaos",' +
    '"Hold Monster",Dictum,"Shield Of Law","Summon Monster IX"',
  'Luck':
    'Features="1:Good Fortune" ' +
    'Spells="Entropic Shield",Aid,"Protection From Energy",' +
    '"Freedom Of Movement","Break Enchantment",Mislead,"Spell Turning",' +
    '"Moment Of Prescience",Miracle',
  'Magic':
    'Features="1:Arcane Adept" ' +
    'Spells="Magic Aura",Identify,"Dispel Magic","Imbue With Spell Ability",' +
    '"Spell Resistance","Antimagic Field","Spell Turning",' +
    '"Protection From Spells","Mage\'s Disjunction"',
  'Plant':
    'Features="1:Nature Knowledge","1:Plant Turning" ' +
    'Spells=Entangle,Barkskin,"Plant Growth","Command Plants",' +
    '"Wall Of Thorns","Repel Wood","Animate Plants","Control Plants",Shambler',
  'Protection':
    'Features="1:Protective Touch" ' +
    'Spells=Sanctuary,"Shield Other","Protection From Energy",' +
    '"Spell Immunity","Spell Resistance","Antimagic Field",Repulsion,' +
    '"Mind Blank","Prismatic Sphere"',
  'Strength':
    'Features="1:Strength Burst" ' +
    'Spells="Enlarge Person","Bull\'s Strength","Magic Vestment",' +
    '"Spell Immunity","Righteous Might",Stoneskin,"Grasping Hand",' +
    '"Clenched Fist","Crushing Hand"',
  'Sun':
    'Features="1:Destroy Undead" ' +
    'Spells="Endure Elements","Heat Metal","Searing Light","Fire Shield",' +
    '"Flame Strike","Fire Seeds",Sunbeam,Sunburst,"Prismatic Sphere"',
  'Travel':
    'Features="1:Outdoors Knowledge",1:Unhindered ' +
    'Spells=Longstrider,"Locate Object",Fly,"Dimension Door",Teleport,' +
    '"Find The Path","Greater Teleport","Phase Door","Astral Projection"',
  'Trickery':
    'Features="1:Deceptive Knowledge" ' +
    'Spells="Disguise Self",Invisibility,Nondetection,Confusion,' +
    '"False Vision",Mislead,Screen,"Polymorph Any Object","Time Stop"',
  'War':
    'Features="1:Weapon Of War" ' +
    'Spells="Magic Weapon","Spiritual Weapon","Magic Vestment",' +
    '"Divine Power","Flame Strike","Blade Barrier","Power Word Blind",' +
    '"Power Word Stun","Power Word Kill"',
  'Water':
    'Features="1:Fire Turning" ' +
    'Spells="Obscuring Mist","Fog Cloud","Water Breathing","Control Water",' +
    '"Ice Storm","Cone Of Cold","Acid Fog","Horrid Wilting","Elemental Swarm"'
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
  'Extend Spell':'Type=Metamagic,Wizard Imply="casterLevel >= 1"',
  'Extra Turning':'Type=General Require="turningLevel >= 1"',
  'Far Shot':'Type=Fighter Require="features.Point-Blank Shot"',
  'Forge Ring':'Type="Item Creation",Wizard Require="casterLevel >= 12"',
  'Great Cleave':
    'Type=Fighter Require="strength >= 13","baseAttack >= 4","features.Cleave","features.Power Attack"',
  'Great Fortitude':'Type=General',
  'Greater Spell Focus (Abjuration)':
    'Type=General Require="features.Spell Focus (Abjuration)"',
  'Greater Spell Focus (Conjuration)':
    'Type=General Require="features.Spell Focus (Conjuration)"',
  'Greater Spell Focus (Divination)':
    'Type=General Require="features.Spell Focus (Diviniation)"',
  'Greater Spell Focus (Enchantment)':
    'Type=General Require="features.Spell Focus (Enchantment)"',
  'Greater Spell Focus (Evocation)':
    'Type=General Require="features.Spell Focus (Evocation)"',
  'Greater Spell Focus (Illusion)':
    'Type=General Require="features.Spell Focus (Illusion)"',
  'Greater Spell Focus (Necromancy)':
    'Type=General Require="features.Spell Focus (Necromancy)"',
  'Greater Spell Focus (Transmutation)':
    'Type=General Require="features.Spell Focus (Transmutation)"',
  'Greater Spell Penetration':
    'Type=General Imply="casterLevel >= 1" Require="features.Spell Penetration"',
  'Greater Two-Weapon Fighting':
    'Type=Fighter Require="dexterity >= 12","baseAttack >= 11","features.Two-Weapon Fighting","features.Improved Two-Weapon Fighting"',
  'Greater Weapon Focus (Longsword)':
    'Type=Fighter Require="features.Weapon Focus (Longsword)","levels.Fighter >= 8" Imply=weapons.Longsword',
  'Greater Weapon Specialization (Longsword)':
    'Type=Fighter Require="features.Weapon Focus (Longsword)","features.Greater Weapon Focus (Longsword)","features.Weapon Specialization (Longsword)","levels.Fighter >= 12" Imply=weapons.Longsword',
  'Heighten Spell':'Type=Metamagic,Wizard Imply="casterLevel >= 1"',
  'Improved Bull Rush':
    'Type=Fighter Require="strength >= 13","features.Power Attack"',
  'Improved Counterspell':'Type=General Imply="casterLevel >= 1"',
  'Improved Critical (Longsword)':
    'Type=Fighter Require="baseAttack >= 8" Imply=weapons.Longsword',
  'Improved Disarm':
    'Type=Fighter Require="intelligence >= 13","features.Combat Expertise"',
  'Improved Familiar':'Type=General Require="features.Familiar"',
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
    'Type=Fighter Require="features.Shield Proficiency (Heavy)"',
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
  'Shield Proficiency (Heavy)':'Type=General',
  'Shield Proficiency (Tower)':'Type=General',
  'Shot On The Run':
    'Type=Fighter Require="dexterity >= 13","baseAttack >= 4",features.Dodge,features.Mobility,"features.Point-Blank Shot"',
  'Silent Spell':'Type=Metamagic,Wizard Imply="casterLevel >= 1"',
  'Snatch Arrows':
    'Type=Fighter Require="dexterity >= 15","features.Deflect Arrows","features.Improved Unarmed Strike"',
  'Spell Focus (Abjuration)':'Type=General Imply="casterLevel >= 1"',
  'Spell Focus (Conjuration)':'Type=General Imply="casterLevel >= 1"',
  'Spell Focus (Divination)':'Type=General Imply="casterLevel >= 1"',
  'Spell Focus (Enchantment)':'Type=General Imply="casterLevel >= 1"',
  'Spell Focus (Evocation)':'Type=General Imply="casterLevel >= 1"',
  'Spell Focus (Illusion)':'Type=General Imply="casterLevel >= 1"',
  'Spell Focus (Necromancy)':'Type=General Imply="casterLevel >= 1"',
  'Spell Focus (Transmutation)':'Type=General Imply="casterLevel >= 1"',
  'Spell Mastery':'Type=Wizard Require="levels.Wizard >= 1"',
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
  'Track':'Type=General Imply=skills.Survival',
  'Trample':'Type=Fighter Require="features.Mounted Combat",skills.Ride',
  'Two-Weapon Defense':
    'Type=Fighter Require="dexterity >= 15","features.Two-Weapon Fighting"',
  'Two-Weapon Fighting':'Type=Fighter Require="dexterity >= 15"',
  'Weapon Finesse':
    'Type=Fighter Require="baseAttack >= 1" Imply="dexterityModifier > strengthModifier"',
  'Weapon Focus (Longsword)':
    'Type=Fighter Require="baseAttack >= 1" Imply=weapons.Longsword',
  'Weapon Proficiency (Simple)':'Type=General',
  'Weapon Proficiency (Longsword)':
    'Type=General Require="baseAttack >= 1" Imply="weapons.Longsword"',
  'Weapon Specialization (Longsword)':
    'Type=Fighter Require="features.Weapon Focus (Longsword)","levels.Fighter >= 4" Imply="weapons.Longsword"',
  'Whirlwind Attack':
    'Type=Fighter Require="dexterity >= 13","intelligence >= 13","baseAttack >= 4","features.Combat Expertise",features.Dodge,features.Mobility,"features.Spring Attack"',
  'Widen Spell':'Type=Metamagic,Wizard Imply="casterLevel >= 1"'
};
SRD35.FEATURES = {
  'Abundant Step':'Section=magic Note="<i>Dimension Door</i> 1/dy"',
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
  'Arcane Adept':'Section=magic Note="Use magic device as W%V"',
  'Armor Class Bonus':'Section=combat Note="+%V AC"',
  'Athletic':'Section=skill Note="+2 Climb/+2 Swim"',
  'Augment Summoning':'Section=magic Note="Summoned creatures +4 Str, +4 Con"',
  'Aura Of Courage':'Section=save Note="Immune fear, +4 to allies w/in 30\'"',
  'Aura':
    'Section=magic Note="Visible to <i>Detect Chaos/Evil/Good/Law</i> based on deity alignment"',
  'Bardic Knowledge':
    'Section=skill Note="+%V check for knowledge of notable people, items, places"',
  'Bardic Music':'Section=feature Note="Bardic music effect %V/dy"',
  'Blind-Fight':
    'Section=combat Note="Reroll concealed miss, no bonus to invisible foe, half penalty for impaired vision"',
  'Brew Potion':'Section=magic Note="Create potion for up to 3rd level spell"',
  'Camouflage':'Section=skill Note="Hide in any natural terrain"',
  'Celestial Familiar':
    'Section=companion Note="Smite Evil (+%V HP) 1/dy, 60\' darkvision, %1 acid/cold/electricity resistance, DR %2/magic"',
  'Cleave':'Section=combat Note="Extra attack when foe drops"',
  'Combat Casting':
    'Section=skill Note="+4 Concentration (defensive or grappling)"',
  'Combat Expertise':
    'Section=combat Note="Trade up to -5 attack for equal AC bonus"',
  'Combat Reflexes':'Section=combat Note="Flatfooted AOO, up to %V AOO/rd"',
  'Command Like Creatures':
    'Section=companion Note="DC %V <i>Command</i> vs. similar creatures %1/dy"',
  'Companion Alertness':
    'Section=skill Note="+2 Listen and Spot when companion in reach"',
  'Companion Evasion':
    'Section=companion Note="Reflex save yields no damage instead of half"',
  'Companion Improved Evasion':
    'Section=companion Note="Failed save yields half damage"',
  'Countersong':
    'Section=magic Note="R30\' Perform check vs. sonic magic for 10 rd"',
  'Craft Magic Arms And Armor':
    'Section=magic Note="Create and mend magic weapons, armor, and shields"',
  'Craft Rod':'Section=magic Note="Create magic rod"',
  'Craft Staff':'Section=magic Note="Create magic staff"',
  'Craft Wand':'Section=magic Note="Create wand for up to 4th level spell"',
  'Craft Wondrous Item':
    'Section=magic Note="Create and mend miscellaneous magic items"',
  'Crippling Strike':
    'Section=combat Note="2 points Str damage from sneak attack"',
  'Damage Reduction':'Section=combat Note="Negate %V HP each attack"',
  'Darkvision':'Section=feature Note="60\' b/w vision in darkness"',
  'Deadly Touch':'Section=magic Note="Touch kills if %Vd6 ge target HP 1/dy"',
  'Deceitful':'Section=skill Note="+2 Disguise/+2 Forgery"',
  'Deceptive Knowledge':
    'Section=skill Note="Bluff is a class skill/Disguise is a class skill/Hide is a class skill"',
  'Defensive Roll':
    'Section=combat Note="DC damage Reflex save vs. lethal blow for half damage"',
  'Deflect Arrows':'Section=combat Note="No damage from ranged hit 1/rd"',
  'Deft Hands':'Section=skill Note="+2 Sleight Of Hand/+2 Use Rope"',
  'Deliver Touch Spells':
    'Section=companion Note="Deliver touch spells if in contact w/master when cast"',
  'Destroy Undead':'Section=combat Note="Destroy turned undead 1/dy"',
  'Detect Evil':'Section=magic Note="<i>Detect Evil</i> at will"',
  'Devotion':'Section=companion Note="+4 Will vs. enchantment"',
  'Diamond Body':'Section=save Note="Immune to poison"',
  'Diamond Soul':'Section=save Note="DC %V spell resistance"',
  'Diehard':
    'Section=combat Note="Remain conscious and stable with negative HP"',
  'Diligent':'Section=skill Note="+2 Appraise/+2 Decipher Script"',
  'Divine Grace':'Section=save Note="+%V Fortitude/+%V Reflex/+%V Will"',
  'Divine Health':'Section=save Note="Immune to disease"',
  'Dodge Giants':'Section=combat Note="+4 AC vs. giant creatures"',
  'Dodge':'Section=combat Note="+1 AC"',
  'Dwarf Ability Adjustment':
    'Section=ability Note="+2 Constitution/-2 Charisma"',
  'Dwarf Armor Speed Adjustment':
    'Section=ability Note="No armor speed penalty"',
  'Dwarf Emnity':'Section=combat Note="+1 attack vs. goblinoid and orc"',
  'Earth Turning':'Section=combat Note="Turn Air, rebuke Earth"',
  'Elemental Shape':'Section=magic Note="Wild Shape to elemental %V/dy"',
  'Elf Ability Adjustment':
    'Section=ability Note="+2 Dexterity/-2 Constitution"',
  'Empathic Link':'Section=companion Note="Share emotions up to 1 mile"',
  'Empower Spell':
    'Section=magic Note="x1.5 chosen spell variable effects uses +2 spell slot"',
  'Empowered Chaos':'Section=magic Note="+1 caster level on Chaos spells"',
  'Empowered Evil':'Section=magic Note="+1 caster level on Evil spells"',
  'Empowered Good':'Section=magic Note="+1 caster level on Good spells"',
  'Empowered Healing':'Section=magic Note="+1 caster level on Heal spells"',
  'Empowered Knowledge':
    'Section=magic Note="+1 caster level on Divination spells"',
  'Empowered Law':'Section=magic Note="+1 caster level on Law spells"',
  'Empty Body':'Section=magic Note="<i>Etherealness</i> %V rd/dy"',
  'Endurance':'Section=save Note="+4 extended physical action"',
  'Enlarge Spell':
    'Section=magic Note="x2 chosen spell range uses +1 spell slot"',
  'Eschew Materials':'Section=magic Note="Cast spells w/out materials"',
  'Evasion':'Section=save Note="Reflex save yields no damage instead of half"',
  'Extend Spell':
    'Section=magic Note="x2 chosen spell duration uses +1 spell slot"',
  'Extra Turning':'Section=combat Note="+4 Turnings"',
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
  'Familiar':'Section=feature Note="Special bond and abilities"',
  'Far Shot':'Section=combat Note="x1.5 projectile range, x2 thrown"',
  'Fascinate':
    'Section=magic Note="R90\' Hold %V creatures spellbound %1 rd (Will neg)"',
  'Fast Movement':'Section=ability Note="+10 Speed"',
  'Favored Enemy':
    'Section=combat,skill Note="+2 or more damage vs. %V chosen creature type","+2 or more Bluff, Listen, Sense Motive, Spot and Survival vs. %V chosen creature type"',
  'Fiendish Familiar':
    'Section=companion Note="Smite Good (+%V HP) 1/dy, 60\' darkvision, %1 cold/fire resistance, DR %2/magic"',
  'Fire Turning':'Section=combat Note="Turn Water, rebuke Fire"',
  'Flurry Of Blows':'Section=combat Note="Trade -%V attack for extra attack"',
  'Forge Ring':'Section=magic Note="Create and mend magic rings"',
  'Fortunate':'Section=save Note="+1 Fortitude/+1 Reflex/+1 Will"',
  'Gnome Ability Adjustment':
    'Section=ability Note="+2 Constitution/-2 Strength"',
  'Gnome Emnity':'Section=combat Note="+1 attack vs. goblinoid and kobold"',
  'Good Fortune':'Section=save Note="Reroll 1/dy"',
  'Great Cleave':'Section=combat Note="Cleave w/out limit"',
  'Great Fortitude':'Section=save Note="+2 Fortitude"',
  'Greater Flurry':'Section=combat Note="Extra attack"',
  'Greater Rage':'Section=combat Note="+6 Str, +6 Con, +3 Will during rage"',
  'Greater Spell Focus (Abjuration)':
    'Section=magic Note="+1 Spell DC (Abjuration)"',
  'Greater Spell Focus (Conjuration)':
    'Section=magic Note="+1 Spell DC (Conjuration)"',
  'Greater Spell Focus (Divination)':
    'Section=magic Note="+1 Spell DC (Divination)"',
  'Greater Spell Focus (Enchantment)':
    'Section=magic Note="+1 Spell DC (Enhancement)"',
  'Greater Spell Focus (Evocation)':
    'Section=magic Note="+1 Spell DC (Evocation)"',
  'Greater Spell Focus (Illusion)':
    'Section=magic Note="+1 Spell DC (Illusion)"',
  'Greater Spell Focus (Necromancy)':
    'Section=magic Note="+1 Spell DC (Necromancy)"',
  'Greater Spell Focus (Transmutation)':
    'Section=magic Note="+1 Spell DC (Transmutation)"',
  'Greater Spell Penetration':
    'Section=magic Note="+2 caster level vs. resistance checks"',
  'Greater Two-Weapon Fighting':
    'Section=combat Note="Third off-hand -10 attack"',
  'Half-Orc Ability Adjustment':
    'Section=ability Note="+2 Strength/-2 Intelligence/-2 Charisma"',
  'Halfling Ability Adjustment':
    'Section=ability Note="+2 Dexterity/-2 Strength"',
  'Heighten Spell':'Section=magic Note="Increase chosen spell level"',
  'Hide In Plain Sight':'Section=skill Note="Hide even when observed"',
  'Human Feat Bonus':'Section=feature Note="+1 General Feat"',
  'Human Skill Bonus':'Section=skill Note="+%V skill points"',
  'Illiteracy':
    'Section=skill Note="Must spend 2 skill points to read and write"',
  'Improved Bull Rush':
    'Section=combat Note="No AOO on Bull Rush, +4 Str check"',
  'Improved Counterspell':
    'Section=magic Note="Counter using higher-level spell from same school"',
  'Improved Critical (Longsword)':
    'Section=combat Note="x2 Longsword Threat Range"',
  'Improved Disarm':'Section=combat Note="No AOO on Disarm, +4 attack"',
  'Improved Evasion':'Section=save Note="Failed save yields half damage"',
  'Improved Familiar':'Section=feature Note="Expanded Familiar choices"',
  'Improved Feint':'Section=combat Note="Bluff check to Feint as move action"',
  'Improved Grapple':'Section=combat Note="No AOO on Grapple, +4 Grapple"',
  'Improved Initiative':'Section=combat Note="+4 Initiative"',
  'Improved Overrun':'Section=combat Note="Foe cannot avoid, +4 Str check"',
  'Improved Precise Shot':
    'Section=combat Note="No foe AC bonus for partial concealment, attack grappling target"',
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
    'Section=combat Note="Cannot be flanked, sneak attack only by rogue level %V+"',
  'Increased Unarmed Damage':'Section=combat Note="%V"',
  'Indomitable Will':
    'Section=save Note="+4 enchantment resistance during rage"',
  'Inspire Competence':
    'Section=magic Note="+2 allies skill checks while performing"',
  'Inspire Courage':
    'Section=magic Note="+%V allies attack, damage, charm, fear saves while performing"',
  'Inspire Greatness':
    'Section=magic Note="%V allies +2d10 HP, +2 attack, +1 Fortitude while performing"',
  'Inspire Heroics':
    'Section=magic Note="%V allies +4 AC and saves while performing"',
  'Investigator':'Section=skill Note="+2 Gather Information/+2 Search"',
  'Iron Will':'Section=save Note="+2 Will"',
  'Keen Ears':'Section=skill Note="+2 Listen"',
  'Keen Nose':'Section=skill Note="+2 Craft (Alchemy)"',
  'Keen Senses':'Section=skill Note="+2 Listen/+2 Search/+2 Spot"',
  'Ki Strike':'Section=combat Note="Unarmed attack is %V"',
  'Know Depth':'Section=feature Note="Intuit approximate depth underground"',
  'Large':
    'Section=ability,combat,skill Note="x2 Load Max","-1 AC/-1 Melee Attack/-1 Ranged Attack","-4 Hide/+4 Intimidate"',
  'Lay On Hands':'Section=magic Note="Harm undead or heal %V HP/dy"',
  'Leadership':'Section=feature Note="Attract followers"',
  'Lightning Reflexes':'Section=save Note="+2 Reflex"',
  'Link':
    'Section=skill Note="+4 Handle Animal (companion)/Wild Empathy (companion)"',
  'Low-Light Vision':'Section=feature Note="x2 normal distance in poor light"',
  'Magical Aptitude':'Section=skill Note="+2 Spellcraft/+2 Use Magic Device"',
  'Manyshot':
    'Section=combat Note="Fire up to %V arrows simultaneously at -2 attack"',
  'Mass Suggestion':
    'Section=magic Note="<i>Suggestion</i> to all fascinated creatures (DC %V neg)"',
  'Maximize Spell':
    'Section=magic Note="Maximize all chosen spell variable effects uses +3 spell slot"',
  'Mighty Rage':'Section=combat Note="+8 Str, +8 Con, +4 Will during rage"',
  'Mobility':'Section=combat Note="+4 AC vs. movement AOO"',
  'Mounted Archery':'Section=combat Note="x.5 mounted ranged penalty"',
  'Mounted Combat':
    'Section=combat Note="Ride skill save vs. mount damage 1/rd"',
  'Multiattack':
    'Section=companion Note="Reduce additional attack penalty to -2 or second attack at -5"',
  'Natural Illusionist':'Section=magic Note="+1 Spell DC (Illusion)"',
  'Natural Smith':
    'Section=skill Note="+2 Appraise (stone or metal)/+2 Craft (stone or metal)"',
  'Natural Spell':'Section=magic Note="Cast spell during <i>Wild Shape</i>"',
  'Nature Knowledge':'Section=skill Note="Knowledge (Nature) is a class skill"',
  'Nature Sense':'Section=skill Note="+2 Knowledge (Nature)/+2 Survival"',
  'Negotiator':'Section=skill Note="+2 Diplomacy/+2 Sense Motive"',
  'Nimble Fingers':'Section=skill Note="+2 Disable Device/+2 Open Lock"',
  'Opportunist':'Section=combat Note="AOO vs. foe struck by ally"',
  'Outdoors Knowledge':'Section=skill Note="Survival is a class skill"',
  'Perfect Self':
    'Section=combat,save Note="DR 10/magic","Treat as outsider for magic saves"',
  'Persuasive':'Section=skill Note="+2 Bluff/+2 Intimidate"',
  'Plant Turning':'Section=combat Note="Turn Plant, rebuke Plant"',
  'Point-Blank Shot':
    'Section=combat Note="+1 ranged attack and damage w/in 30\'"',
  'Power Attack':
    'Section=combat Note="Trade up to -%V attack for equal damage bonus"',
  'Precise Shot':'Section=combat Note="No penalty on shot into melee"',
  'Protective Touch':
    'Section=magic Note="Touched +%V on next save w/in 1 hour 1/dy"',
  'Purity Of Body':'Section=save Note="Immune to normal disease"',
  'Quick Draw':'Section=combat Note="Draw weapon as free action"',
  'Quicken Spell':
    'Section=magic Note="Free action casting 1/rd uses +4 spell slot"',
  'Quivering Palm':
    'Section=combat Note="Struck foe dies 1/wk (DC %V Fort neg)"',
  'Rage':'Section=combat Note="+4 Str, +4 Con, +2 Will, -2 AC %V rd %1/dy"',
  'Rapid Reload (Hand)':
    'Section=combat Note="Reload Hand Crossbow as free action"',
  'Rapid Reload (Heavy)':
    'Section=combat Note="Reload Heavy Crossbow as move action"',
  'Rapid Reload (Light)':
    'Section=combat Note="Reload Light Crossbow as free action"',
  'Rapid Shot':'Section=combat Note="Normal and extra ranged -2 attacks"',
  'Remove Disease':'Section=magic Note="<i>Remove Disease</i> %V/week"',
  'Resist Enchantment':'Section=save Note="+2 vs. enchantment"',
  'Resist Fear':'Section=save Note="+2 vs. fear"',
  'Resist Illusion':'Section=save Note="+2 vs. illusions"',
  "Resist Nature's Lure":'Section=save Note="+4 vs. spells of feys"',
  'Resist Poison':'Section=save Note="+2 vs. Poison"',
  'Resist Spells':'Section=save Note="+2 vs. Spells"',
  'Ride-By Attack':'Section=combat Note="Move before, after mounted attack"',
  'Run':
    'Section=ability,skill Note="+1 Run Speed Multiplier","+4 running Jump"',
  'School Opposition (Abjuration)':
    'Section=magic Note="Cannot learn or cast Abjuration spells"',
  'School Opposition (Conjuration)':
    'Section=magic Note="Cannot learn or cast Conjuration spells"',
  'School Opposition (Enchantment)':
    'Section=magic Note="Cannot learn or cast Enchantment spells"',
  'School Opposition (Evocation)':
    'Section=magic Note="Cannot learn or cast Evocation spells"',
  'School Opposition (Illusion)':
    'Section=magic Note="Cannot learn or cast Illusion spells"',
  'School Opposition (Necromancy)':
    'Section=magic Note="Cannot learn or cast Necromancy spells"',
  'School Opposition (Transmutation)':
    'Section=magic Note="Cannot learn or cast Transmutation spells"',
  'School Specialization (Abjuration)':
    'Section=magic,skill Note="Extra Abjuration spell/dy each spell level","+2 Spellcraft (Abjuration effects)"',
  'School Specialization (Conjuration)':
    'Section=magic,skill Note="Extra Conjuration spell/dy each spell level","+2 Spellcraft (Conjuration effects)"',
  'School Specialization (Divination)':
    'Section=magic,skill Note="Extra Divination spell/dy each spell level","+2 Spellcraft (Divination effects)"',
  'School Specialization (Enchantment)':
    'Section=magic,skill Note="Extra Enchantment spell/dy each spell level","+2 Spellcraft (Enchantment effects)"',
  'School Specialization (Evocation)':
    'Section=magic,skill Note="Extra Evocation spell/dy each spell level","+2 Spellcraft (Evocation effects)"',
  'School Specialization (Illusion)':
    'Section=magic,skill Note="Extra Illusion spell/dy each spell level","+2 Spellcraft (Illusion effects)"',
  'School Specialization (Necromancy)':
    'Section=magic,skill Note="Extra Necromancy spell/dy each spell level","+2 Spellcraft (Necromancy effects)"',
  'School Specialization (Transmutation)':
    'Section=magic,skill Note="Extra Transmutation spell/dy each spell level","+2 Spellcraft (Transmutation effects)"',
  'Scribe Scroll':'Section=magic Note="Create scroll of any known spell"',
  'Scry':'Section=companion Note="Master views companion 1/dy"',
  'Self-Sufficient':'Section=skill Note="+2 Heal/+2 Survival"',
  'Sense Secret Doors':'Section=feature Note="Automatic Search w/in 5\'"',
  'Share Saving Throws':'Section=companion Note="+%1 Fort/+%2 Ref/+%3 Will"',
  'Share Spells':
    'Section=companion Note="Master share self spell w/companion w/in 5\'"',
  'Shot On The Run':'Section=combat Note="Move before, after ranged attack"',
  'Silent Spell':
    'Section=magic Note="Cast spell w/out speech uses +1 spell slot"',
  'Simple Somatics':
    'Section=magic Note="No arcane spell failure in light armor"',
  'Skill Mastery':
    'Section=skill Note="Take 10 despite distraction on %V chosen skills"',
  'Sleep Immunity':'Section=save Note="Immune <i>Sleep</i>"',
  'Slippery Mind':'Section=save Note="Second save vs. enchantment"',
  'Slow Fall':'Section=save Note="Subtract %V\' from falling damage distance"',
  'Slow':'Section=ability Note="-10 Speed"',
  'Small':
    'Section=ability,combat,skill Note="x0.75 Load Max","+1 AC/+1 Melee Attack/+1 Ranged Attack","+4 Hide/-4 Intimidate"',
  'Smite Evil':'Section=combat Note="+%V attack/+%1 damage vs. evil foe %2/dy"',
  'Smite':'Section=combat Note="+4 attack, +%V damage 1/dy"',
  'Snatch Arrows':'Section=combat Note="Catch ranged weapons"',
  'Sneak Attack':
    'Section=combat Note="Hit +%Vd6 HP when surprising or flanking"',
  'Song Of Freedom':'Section=magic Note="<i>Break Enchantment</i> via Perform"',
  'Speak With Like Animals':'Section=companion Note="Talk w/similar creatures"',
  'Speak With Master':
    'Section=companion Note="Talk w/master in secret language"',
  'Special Mount':'Section=feature Note="Magical mount w/special abilities"',
  'Spell Focus (Abjuration)':'Section=magic Note="+1 Spell DC (Abjuration)"',
  'Spell Focus (Conjuration)':'Section=magic Note="+1 Spell DC (Conjuration)"',
  'Spell Focus (Divination)':'Section=magic Note="+1 Spell DC (Divination)"',
  'Spell Focus (Enchantment)':'Section=magic Note="+1 Spell DC (Enhancement)"',
  'Spell Focus (Evocation)':'Section=magic Note="+1 Spell DC (Evocation)"',
  'Spell Focus (Illusion)':'Section=magic Note="+1 Spell DC (Illusion)"',
  'Spell Focus (Necromancy)':'Section=magic Note="+1 Spell DC (Necromancy)"',
  'Spell Focus (Transmutation)':
    'Section=magic Note="+1 Spell DC (Transmutation)"',
  'Spell Mastery':'Section=magic Note="Prepare %V spells w/out spellbook"',
  'Spell Penetration':
    'Section=magic Note="+2 checks to overcome spell resistance"',
  'Spirited Charge':
    'Section=combat Note="x2 damage (x3 lance) on mounted charge"',
  'Spontaneous Cleric Spell':
    'Section=magic Note="Cast <i>Cure</i> or <i>Inflict<i> in place of known spell"',
  'Spontaneous Druid Spell':
    'Section=magic Note="Cast <i>Summon Nature\'s Ally</i> in place of known spell"',
  'Spring Attack':'Section=combat Note="Move before, after melee attack"',
  'Spry':'Section=skill Note="+2 Climb/+2 Jump/+2 Move Silently"',
  'Stability':'Section=combat Note="+4 vs. Bull Rush and Trip"',
  'Stealthy':'Section=skill Note="+2 Hide/+2 Move Silently"',
  'Still Mind':'Section=save Note="+2 vs. enchantment"',
  'Still Spell':
    'Section=magic Note="Cast spell w/out movement uses +1 spell slot"',
  'Stonecunning':
    'Section=skill Note="+2 Search (stone or metal), automatic check w/in 10\'"',
  'Strength Burst':'Section=ability Note="+%V Strength 1 rd/dy"',
  'Stunning Fist':
    'Section=combat Note="Struck foe stunned %1/dy (DC %V Fort neg)"',
  'Suggestion':
    'Section=magic Note="<i>Suggestion</i> to 1 fascinated creature (DC %V neg)"',
  'Swift Tracker':'Section=skill Note="Track at full speed"',
  'Thousand Faces':'Section=magic Note="<i>Alter Self</i> at will"',
  'Timeless Body':'Section=feature Note="No aging penalties"',
  'Tireless Rage':'Section=combat Note="Not fatigued after rage"',
  'Tolerance':'Section=skill Note="+2 Diplomacy/+2 Gather Information"',
  'Tongue Of The Sun And Moon':
    'Section=feature Note="Speak w/any living creature"',
  'Toughness':'Section=combat Note="+3 HP"',
  'Track':'Section=skill Note="Survival to follow creatures\' trails"',
  'Trackless Step':'Section=feature Note="Untrackable outdoors"',
  'Trample':
    'Section=combat Note="Mounted overrun unavoidable, bonus hoof attack"',
  'Trap Sense':'Section=save Note="+%V Reflex and AC vs. traps"',
  'Trapfinding':
    'Section=skill Note="Use Search and Disable Device to find and remove DC 20+ traps"',
  'Turn Undead':
    'Section=combat Note="Turn (good) or rebuke (evil) 2d6+%1 HD of undead creatures of up to (d20+%2)/3 HD %3/dy"',
  'Two-Weapon Defense':
    'Section=combat Note="+1 AC wielding two weapons (+2 fighting defensively)"',
  'Two-Weapon Fighting':
    'Section=combat Note="Reduce on-hand penalty by 2, off-hand by 6"',
  'Unarmored Speed Bonus':'Section=ability Note="+%V Speed"',
  'Uncanny Dodge':'Section=combat Note="Always adds Dex modifier to AC"',
  'Unhindered':'Section=magic Note="<i>Freedom Of Movement</i> %V rd/dy"',
  'Venom Immunity':'Section=save Note="Immune to poisons"',
  'Water Turning':'Section=combat Note="Turn Fire, rebuke Water"',
  'Weapon Finesse':
    'Section=combat Note="+%V light melee attack (dex instead of str)"',
  'Weapon Of War':
    'Section=feature Note="Weapon Proficiency (%V)/Weapon Focus (%V)"',
  'Whirlwind Attack':'Section=combat Note="Attack all foes in reach"',
  'Wholeness Of Body':'Section=magic Note="Heal %V HP to self/dy"',
  'Widen Spell':'Section=magic Note="x2 area of affect uses +3 spell slot"',
  'Wild Empathy':'Section=skill Note="+%V Diplomacy (animals)"',
  'Wild Shape':
    'Section=magic Note="Change into creature of size %V %1 hr %2/dy"',
  'Woodland Stride':'Section=feature Note="Normal movement through undergrowth"'
};
SRD35.GENDERS = {
  'Female':'',
  'Male':''
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
SRD35.RACES = {
  'Dwarf':
    'Features=' +
      'Darkvision,"Dodge Giants","Dwarf Ability Adjustment",' +
      '"Dwarf Armor Speed Adjustment","Dwarf Emnity","Know Depth",' +
      '"Natural Smith","Resist Poison","Resist Spells","Slow","Stability",' +
      '"Stonecunning","Weapon Familiarity (Dwarven Urgosh/Dwarven Waraxe)" ' +
    'Languages=Common,Dwarven',
  'Elf':
    'Features=' +
      '"Elf Ability Adjustment","Keen Senses","Low-Light Vision",' +
      '"Resist Enchantment","Sense Secret Doors","Sleep Immunity",' +
      '"Weapon Proficiency (Composite Longbow/Composite Shortbow/Longsword/Rapier/Longbow/Shortbow)" ' +
    'Languages=Common,Elven',
  'Gnome':
    'Features=' +
      '"Dodge Giants","Gnome Ability Adjustment","Gnome Emnity","Keen Ears",' +
      '"Keen Nose","Low-Light Vision","Natural Illusionist","Resist Illusion",'+
      'Slow,Small,"Weapon Familiarity (Gnome Hooked Hammer)" ' +
    'Languages=Common,Gnome ' +
    'SpellAbility=charisma ' +
    'Spells=' +
      '"Gnome1:Speak With Animals",' +
      '"charisma >= 10 ? Gnome0:Dancing Lights;Ghost Sound;Prestidigitation"',
  'Half-Elf':
    'Features=' +
      '"Alert Senses","Low-Light Vision","Resist Enchantment",' +
      '"Sleep Immunity",Tolerance ' +
    'Languages=Common,Elven',
  'Half-Orc':
    'Features=' +
       'Darkvision,"Half-Orc Ability Adjustment" ' +
    'Languages=Common,Orc',
  'Halfling':
    'Features=' +
      'Accurate,Fortunate,"Halfling Ability Adjustment","Keen Ears",Slow,' +
      'Small,Spry,"Resist Fear" ' +
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
  'Transmutation':'',
  'Universal':''
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
    'Ability=intelligence Class=all Synergy="Appraise (related)"',
  'Craft (Armor)':'Ability=intelligence Class=all Synergy="Appraise (related)"',
  'Craft (Bows)':'Ability=intelligence Class=all Synergy="Appraise (related)"',
  'Craft (Traps)':'Ability=intelligence Class=all Synergy="Appraise (related)"',
  'Craft (Weapons)':
    'Ability=intelligence Class=all Synergy="Appraise (related)"',
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
    'Class=Bard,Cleric,Wizard',
  'Knowledge (Local)':
    'Ability=intelligence untrained=n ' +
    'Class=Bard,Rogue,Wizard Synergy="Gather Information"',
  'Knowledge (Nature)':
    'Ability=intelligence untrained=n ' +
    'Class=Bard,Druid,Ranger,Wizard Synergy="Survial (outdoors)"',
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
    'Description="R$RL\' Ranged touch 2d4 HP/rd for $Ldiv3plus1 rd"',
  'Acid Fog':
    'School=Conjuration ' +
    'Description="R$RM\' 20\' fog cylinder 2d6 HP/rd for $L rd"',
  'Acid Splash':
    'School=Conjuration ' +
    'Description="R$RS\' Ranged touch 1d3 HP"',
  'Aid':
    'School=Enchantment ' +
    'Description="Touched +1 attack and fear saves, +1d8+$Lmin10 HP for $L min"',
  'Air Walk':
    'School=Transmutation ' +
    'Description="Touched walks on air for $L10 min"',
  'Alarm':
    'School=Abjuration ' +
    'Description="R$RS\' 20\' radius alarmed for $L2 hr"',
  'Align Weapon':
    'School=Transmutation ' +
    'Description="Touched weapon gains alignment for $L min (Will neg)"',
  'Alter Self':
    'School=Transmutation ' +
    'Description="Self becomes small (+2 Dex) or medium (+2 Str) humanoid for $L min"',
  'Analyze Dweomer':
    'School=Divination ' +
    'Description="R$RS\' Target reveals magical aspects for $L rd (Will neg)"',
  'Animal Growth':
    'School=Transmutation ' +
    'Description="R$RM\' Animal target dbl size for $L min (Fort neg)"',
  'Animal Messenger':
    'School=Enchantment ' +
    'Description="R$RS\' Tiny animal target goes to specified place for $L dy"',
  'Animal Shapes':
    'School=Transmutation ' +
    'Description="R$RS\' $L allies in 30\' area become chosen animal for $L hr"',
  'Animal Trance':
    'School=Enchantment ' +
    'Description="R$RS\' 2d6 HD animals facinated for conc (Will neg)"',
  'Animate Dead':
    'School=Necromancy ' +
    'Description="Touched corpses become $L2 HD of skeletons/zombies"',
  'Animate Objects':
    'School=Transmutation ' +
    'Description="R$RM\' $L objects attack foes for $L rd"',
  'Animate Plants':
    'School=Transmutation ' +
    'Description="R$RS\' $Ldiv3 plants attack/entwine foes for $L rd/hr"',
  'Animate Rope':
    'School=Transmutation ' +
    'Description="R$RM\' $L5plus50\' rope obey for $L rd"',
  'Antilife Shell':
    'School=Abjuration ' +
    'Description="10\'-radius bars living for $L min"',
  'Antimagic Field':
    'School=Abjuration ' +
    'Description="10\'-radius suppresses magic for $L10 min"',
  'Antipathy':
    'School=Enchantment ' +
    'Description="Named kind/align creatures avoid $L10\' cube for $L2 hr (Will -4 dex)"',
  'Antiplant Shell':
    'School=Abjuration ' +
    'Description="10\'-radius bars animate plants for $L min"',
  'Arcane Eye':
    'School=Divination ' +
    'Description="Invisible remote eye moves 30\' for $L min"',
  'Arcane Lock':
    'School=Abjuration ' +
    'Description="Magical lock on door/portal/chest open DC +10 with lock/20 otherwise"',
  'Arcane Mark':
    'School=Universal ' +
    'Description="Permanent in/visible personal rune on object/creature"',
  'Arcane Sight':
    'School=Divination ' +
    'Description="R120\' See auras/spell abilities for $L min, DC 15+level to know school"',
  'Greater Arcane Sight':
    'School=Divination ' +
    'Description="R120\' See auras/spell abilities and know spell for $L min"',
  'Astral Projection':
    'School=Necromancy ' +
    'Description="Project you and others to Astral Plane"',
  'Atonement':
    'School=Abjuration ' +
    'Description="Restore alignment/holy powers"',
  'Augury':
    'School=Divination ' +
    'Description="$Lplus70min90% chance to know weal/woe of act proposed w/in 30 min"',
  'Awaken':
    'School=Transmutation ' +
    'Description="Animal/tree target gains human sentience (Will neg)"',

  'Baleful Polymorph':
    'School=Transmutation ' +
    'Description="R$RS\' Target becomes 1HD creature (Fort neg)"',
  'Bane':
    'School=Enchantment ' +
    'Description="Enemies w/in 50\' -1 attack/fear saves $L min (Will neg)"',
  'Banishment':
    'School=Abjuration ' +
    'Description="R$RS\' $L2 HD extraplanar creatures banished from plane (Will neg)"',
  'Barkskin':
    'School=Transmutation ' +
    'Description="+${2 + (lvl<6 ? 0 : Math.min(Math.floor((lvl-3)/3),3))} natural armor for $L10 min"',
  "Bear's Endurance":
    'School=Transmutation ' +
    'Description="Touched +4 Con for $L min"',
  "Mass Bear's Endurance":
    'School=Transmutation ' +
    'Description="R$RS\' $L targets +4 Con for $L min"',
  'Bestow Curse':
    'School=Necromancy ' +
    'Description="Touched permanent -6 ability, -4 attack, saves, and checks, or 50% chance/rd of losing action (Will neg)"',
  'Binding':
    'School=Enchantment ' +
    'Description="R$RS\' Target magically imprisoned (Will neg (min $Ldiv2 HD))"',
  'Black Tentacles':
    'School=Conjuration ' +
    'Description="R$RM\' Tentacles grapple (CMB/CMD $Lplus5/$Lplus15) 20\' radius, 1d6+4/rd HP for $L rd"',
  'Blade Barrier':
    'School=Evocation ' +
    'Description="R$RM\' Blade wall ${Lmin15}d6 HP (Ref half) for $L min"',
  'Blasphemy':
    'School=Evocation ' +
    'Description="Nonevil creatures w/in 40\' with equal/-1/-5/-10 HD dazed 1 rd/-2d6 Str 2d4 rd/paralyzed 1d10 min/killed and banished (Will neg)"',
  'Bless':
    'School=Enchantment ' +
    'Description="R50\' Allies +1 attack/fear saves for $L min"',
  'Bless Water':
    'School=Transmutation ' +
    'Description="Makes 1 pint holy water (Will neg)"',
  'Bless Weapon':
    'School=Transmutation ' +
    'Description="Weapon good aligned, +1 vs. evil foe DR for $L min"',
  'Blight':
    'School=Necromancy ' +
    'Description="Touched plant ${Lmin15}d6 HP (Fort half)"',
  'Blindness/Deafness':
    'School=Necromancy ' +
    'Description="R$RM\' target permanently blind or deaf (Fort neg)"',
  'Blink':
    'School=Transmutation ' +
    'Description="Self randomly ethereal for $L rd--foes 50% miss chance, half HP from area attacks/falling"',
  'Blur':
    'School=Illusion ' +
    'Description="Touched foes 20% miss chance for $L min"',
  'Break Enchantment':
    'School=Abjuration ' +
    'Description="R$RS\' $L targets freed from enchantments/transmutations/curses"',
  "Bull's Strength":
    'School=Transmutation ' +
    'Description="Touched +4 Str for $L min"',
  "Mass Bull's Strength":
    'School=Transmutation ' +
    'Description="R$RS\' $L targets +4 Str for $L min"',
  'Burning Hands':
    'School=Evocation ' +
    'Description="R15\' cone ${Lmin5}d4 HP (Ref half)"',

  'Call Lightning':
    'School=Evocation ' +
    'Description="R$RM\' $L bolts 3d6 HP (Ref half), 1/rd for $L min"',
  'Call Lightning Storm':
    'School=Evocation ' +
    'Description="R$RL\' 15 bolts 5d6 HP (Ref half), 1/rd for $L min"',
  'Calm Animals':
    'School=Enchantment ' +
    'Description="R$RS\' 2d4+$L HD of animals docile for $L min (Will neg)"',
  'Calm Emotions':
    'School=Enchantment ' +
    'Description="R$RM\' Creatures in 20\' radius pacified $L rd/conc (Will neg)"',
  "Cat's Grace":
    'School=Transmutation ' +
    'Description="Touched +4 Dex for $L min"',
  "Mass Cat's Grace":
    'School=Transmutation ' +
    'Description="R$RS\' $L targets +4 Dex for $L min"',
  'Cause Fear':
    'School=Necromancy ' +
    'Description="R$RS\' Target le 5 HD flee for 1d4 rd (Will shaken 1 rd)"',
  'Chain Lightning':
    'School=Evocation ' +
    'Description="R$RL\' ${Lmin20}d6 HP primary/$Lmin20 secondary targets (Ref half, secondary save at +2)"',
  'Changestaff':
    'School=Transmutation ' +
    'Description="Staff becomes treant-like creature for $L hr"',
  'Chaos Hammer':
    'School=Evocation ' +
    'Description="R$RM\' Lawful in 20\'-radius burst ${Ldiv2min5}d8 HP and slowed 1d6 rd, neutral half (Will half)"',
  'Charm Animal':
    'School=Enchantment ' +
    'Description="R$RS\' Target treats you as trusted friend for $L hr (Will neg)"',
  'Charm Monster':
    'School=Enchantment ' +
    'Description="R$RS\' Target treats you as trusted friend for $L dy (Will neg)"',
  'Mass Charm Monster':
    'School=Enchantment ' +
    'Description="R$RS\' $L2 HD targets treats you as trusted friend for $L dy (Will neg)"',
  'Charm Person':
    'School=Enchantment ' +
    'Description="R$RS\' Target treats you as trusted friend for $L hr (Will neg)"',
  'Chill Metal':
    'School=Transmutation ' +
    'Description="R$RS\' Metal of $Ldiv2 creatures 0/1/2/2/2/1/0d4 HP for 7 rd (Will neg)"',
  'Chill Touch':
    'School=Necromancy ' +
    'Description="$L touched 1d6 HP negative energy (Will neg), 1 Str (Fort neg, undead flee 1d4+$L rd)"',
  'Circle Of Death':
    'School=Necromancy ' +
    'Description="R$RM\' ${Lmin20}d4 HD of creatures le 8 HD in 40\' die (Fort neg)"',
  'Clairaudience/Clairvoyance':
    'School=Divination ' +
    'Description="$RL\' Remote sight or hearing for $L min"',
  'Clenched Fist':
    'School=Evocation ' +
    'Description="R$RM\' 10\' (AC 20, caster HP) hand cover (+4 AC), move 60\', hit (+$L+mod for 1d8+11, stunned 1 rd (Fort neg)), bull rush (CMB $Lplus12) for $L rd"',
  'Cloak Of Chaos':
    'School=Abjuration ' +
    'Description="$L targets in 20\' +4 AC and saves, SR 25 and mental protection vs. lawful, lawful hits cause confused 1 rd for $L rd (Will neg)"',
  'Clone':
    'School=Necromancy ' +
    'Description="Soul enters duplicate if original dies"',
  'Cloudkill':
    'School=Conjuration ' +
    'Description="R$RM\' 20\' cylinder moves away 10\', 1-3 HD die, 4-6 HD die (Fort 1d4 Con), 6+ HD 1d4 Con (Fort half) for $L min"',
  'Color Spray':
    'School=Illusion ' +
    'Description="R15\' cone targets with 2/4/any HD unconscious 2d4 rd/blind 1d4 rd/stunned 1 rd (Will neg)"',
  'Command':
    'School=Enchantment ' +
    'Description="R$RS\' Target approach/drop/fall/flee/halt for 1 rd (Will neg)"',
  'Greater Command':
    'School=Enchantment ' +
    'Description="R$RS\' $L targets approach/drop/fall/flee/halt for $L rd (Will neg)"',
  'Command Plants':
    'School=Transmutation ' +
    'Description="R$RS\' $L2 HD plant creatures obey for $L dy (Will neg)"',
  'Command Undead':
    'School=Necromancy ' +
    'Description="R$RS\' Undead target obey for $L dy (Will neg)"',
  'Commune':
    'School=Divination ' +
    'Description="Deity answers $L yes/no questions"',
  'Commune With Nature':
    'School=Divination ' +
    'Description="Learn natural facts for $L mi outdoors/$L100\' underground"',
  'Comprehend Languages':
    'School=Divination ' +
    'Description="Self understands all languages for $L10 min"',
  'Cone Of Cold':
    'School=Evocation ' +
    'Description="R60\' cone ${Lmin15}d6 HP (Ref half)"',
  'Confusion':
    'School=Enchantment ' +
    'Description="R$RM\' Creatures in 15\' radius randomly normal/babble/d8+str to self/attack nearest for $L rd (Will neg)"',
  'Lesser Confusion':
    'School=Enchantment ' +
    'Description="R$RS\' Target randomly normal/babble/d8+str to self/attack nearest for 1 rd (Will neg)"',
  'Consecrate':
    'School=Evocation ' +
    'Description="R$RS\' Positive energy in 20\' radius gives undead -1 attack/damage/saves for $L2 hr"',
  'Contact Other Plane':
    'School=Divination ' +
    'Description="Ask $Ldiv2 questions of extraplanar entity"',
  'Contagion':
    'School=Necromancy ' +
    'Description="Touched diseased (Fort neg)"',
  'Contingency':
    'School=Evocation ' +
    'Description="Set trigger for $Ldiv3min6-level spell for $L dy"',
  'Continual Flame':
    'School=Evocation ' +
    'Description="Touched emits heatless torch flame permanently"',
  'Control Plants':
    'School=Transmutation ' +
    'Description="R$RS\' $L2 HD plant creatures obey for $L min (Will neg)"',
  'Control Undead':
    'School=Necromancy ' +
    'Description="R$RS\' Undead target obey for $L min (Will neg)"',
  'Control Water':
    'School=Transmutation ' +
    'Description="R$RL\' Raise/lower ${Math.pow(lvl, 3)} 10\'x10\'x2\' of water $L2\' for $L10 min"',
  'Control Weather':
    'School=Transmutation ' +
    'Description="Create seasonal weather in 2 mi radius for 4d12 hr"',
  'Control Winds':
    'School=Transmutation ' +
    'Description="R$L40\' Changes wind direction/speed in $L40\'x40\' cylinder for $L10 min"',
  'Corrupt Weapon':
    'School=Transmutation ' +
    'Description="Weapon evil aligned, +1 vs. good foe DR for $L min"',
  'Create Food And Water':
    'School=Conjuration ' +
    'Description="Daily food/water for $L3 humans/$L horses"',
  'Create Greater Undead':
    'School=Necromancy ' +
    'Description="Raise shadow/wraith/spectr/devourer from physical remains at level -/16/18/20"',
  'Create Undead':
    'School=Necromancy ' +
    'Description="Raise ghoul/ghast/mummy/mohrg from physical remains at level -/12/15/18"',
  'Create Water':
    'School=Conjuration ' +
    'Description="R$RS\' Creates $L2 gallons of pure water"',
  'Creeping Doom':
    'School=Conjuration ' +
    'Description="R$Ldiv2times5plus25min100\' Four 60-HP insect swarms 4d6 HP obey for $L rd"',
  'Crushing Despair':
    'School=Enchantment ' +
    'Description="R30\' cone Targets -2 attack/damage/saves/checks for $L min (Will neg)"',
  'Crushing Hand':
    'School=Evocation ' +
    'Description="R$RM\' 10\' (AC 20, caster HP) hand cover (+4 AC), move 60\', grapple (CMB $Lplus12, 2d6+12 HP) for $L rd"',
  'Cure Critical Wounds':
    'School=Conjuration ' +
    'Description="Touched heal/damage undead 4d8+$Lmin20 (Will half)"',
  'Mass Cure Critical Wounds':
    'School=Conjuration ' +
    'Description="R$RS\' $L targets heal/damage undead 4d8+$Lmin40 (Will half)"',
  'Cure Light Wounds':
    'School=Conjuration ' +
    'Description="Touched heal/damage undead 1d8+$Lmin5 (Will half)"',
  'Mass Cure Light Wounds':
    'School=Conjuration ' +
    'Description="R$RS\' $L targets heal/damage undead 1d8+$Lmin25 (Will half)"',
  'Cure Minor Wounds':
    'School=Conjuration ' +
    'Description="Touched heal 1 HP"',
  'Cure Moderate Wounds':
    'School=Conjuration ' +
    'Description="Touched heal/damage undead 2d8+$Lmin10 (Will half)"',
  'Mass Cure Moderate Wounds':
    'School=Conjuration ' +
    'Description="R$RS\' $L targets heal/damage undead 2d8+$Lmin30 (Will half)"',
  'Cure Serious Wounds':
    'School=Conjuration ' +
    'Description="Touched heal/damage undead 3d8+$Lmin15 (Will half)"',
  'Mass Cure Serious Wounds':
    'School=Conjuration ' +
    'Description="R$RS\' $L targets heal/damage undead 3d8+$Lmin35 (Will half)"',
  'Curse Water':
    'School=Necromancy ' +
    'Description="Makes 1 pint unholy water (Will neg)"',

  'Dancing Lights':
    'School=Evocation ' +
    'Description="R$RM\' 4 torch lights in 10\' radius move 100\' for 1 min"',
  'Darkness':
    'School=Evocation ' +
    'Description="Touched lowers illumination one step in 20\'-radius for $L min"',
  'Darkvision':
    'School=Transmutation ' +
    'Description="Touched sees 60\' in total darkness for $L hr"',
  'Daylight':
    'School=Evocation ' +
    'Description="Touched radiates 60\'-radius illumination for $L10 min"',
  'Daze':
    'School=Enchantment ' +
    'Description="R$RS\' Humanoid target le 4 HD lose next action (Will neg)"',
  'Daze Monster':
    'School=Enchantment ' +
    'Description="R$RM\' Creature target le 6 HD lose next action (Will neg)"',
  'Death Knell':
    'School=Necromancy ' +
    'Description="Touched w/negative HP die and you gain 1d8 HP/+2 Str/+1 caster level for 10*target HD min (Will neg)"',
  'Death Ward':
    'School=Necromancy ' +
    'Description="Touched +4 vs. death spells and effects, immune drain for $L min"',
  'Deathwatch':
    'School=Necromancy ' +
    'Description="R30\' cone Reveals state of targets for $L10 min"',
  'Deep Slumber':
    'School=Enchantment ' +
    'Description="R$RS\' 10 HD of targets sleep $L min (Will neg)"',
  'Deeper Darkness':
    'School=Evocation ' +
    'Description="Touched lowers illumination two steps in 60\'-radius for $L10 min"',
  'Delay Poison':
    'School=Conjuration ' +
    'Description="Touched immune to poison for $L hr"',
  'Delayed Blast Fireball':
    'School=Evocation ' +
    'Description="R$RL\' ${Lmin20}d6 HP (Ref half) in 20\' radius, delay le 5 rd"',
  'Demand':
    'School=Enchantment ' +
    'Description="25-word message to target, carry out suggestion (Will neg)"',
  'Desecrate':
    'School=Evocation ' +
    'Description="R$RS\' Negative energy in 20\' radius gives undead +1 attack/damage/saves/HP per HD for $L2 hr"',
  'Destruction':
    'School=Necromancy ' +
    'Description="R$RS\' Target $L10 HP, consumed if slain (Fort 10d6 HP)"',
  'Detect Animals Or Plants':
    'School=Divination ' +
    'Description="R$RL\' cone info on animals/plants for $L10 min"',
  'Detect Chaos':
    'School=Divination ' +
    'Description="R60\' cone info on chaotic auras for $L10 min"',
  'Detect Evil':
    'School=Divination ' +
    'Description="R60\' cone info on evil auras for $L10 min"',
  'Detect Good':
    'School=Divination ' +
    'Description="R60\' cone info on good auras for $L10 min"',
  'Detect Law':
    'School=Divination ' +
    'Description="R60\' cone info on lawful auras for $L10 min"',
  'Detect Magic':
    'School=Divination ' +
    'Description="R60\' cone info on magical auras for $L min"',
  'Detect Poison':
    'School=Divination ' +
    'Description="R$RS\' Detects poison in target, DC20 Wis/Alchemy check for type"',
  'Detect Scrying':
    'School=Divination ' +
    'Description="R40\' Detects scrying, opposed caster check to see source"',
  'Detect Secret Doors':
    'School=Divination ' +
    'Description="R60\' cone info on secret doors for $L min"',
  'Detect Snares And Pits':
    'School=Divination ' +
    'Description="R60\' cone info on traps $L10 min"',
  'Detect Thoughts':
    'School=Divination ' +
    'Description="R60\' cone info on thoughts for $L min (Will neg)"',
  'Detect Undead':
    'School=Divination ' +
    'Description="R60\' cone info on undead auras for $L min"',
  'Dictum':
    'School=Evocation ' +
    'Description="R40\' Nonlawful creatures with equal/-1/-5/-10 HD deafened 1d4 rd/staggered 2d4 rd/paralyzed 1d10 min/killed and banished (Will neg)"',
  'Dimension Door':
    'School=Conjuration ' +
    'Description="Teleport self and touched willing object or creature $RL\'"',
  'Dimensional Anchor':
    'School=Abjuration ' +
    'Description="R$RM\' Ranged touch bars extradimensional travel for $L min"',
  'Dimensional Lock':
    'School=Abjuration ' +
    'Description="R$RM\' Bar extradimensional travel in 20\' radius for $L dy"',
  'Diminish Plants':
    'School=Transmutation ' +
    'Description="Prunes/blights growth of normal plants"',
  'Discern Lies':
    'School=Divination ' +
    'Description="R$RS\' Reveals lies from $L creatures for $L rd/conc (Will neg)"',
  'Discern Location':
    'School=Divination ' +
    'Description="Know exact location of creature/object"',
  'Disguise Self':
    'School=Illusion ' +
    'Description="Self change appearance/+10 Disguise for $L10 min"',
  'Disintegrate':
    'School=Transmutation ' +
    'Description="R$RM\' Target ${L2min40}d6 HP (Fort half), dust if slain (Fort 5d6)"',
  'Dismissal':
    'School=Abjuration ' +
    'Description="R$RS\' Target returned to native plane (Will neg)"',
  'Dispel Chaos':
    'School=Abjuration ' +
    'Description="Touched +4 AC vs. chaotic/touch to dismiss chaotic creature/spell (Will neg)"',
  'Dispel Evil':
    'School=Abjuration ' +
    'Description="Touched +4 AC vs. evil/touch to dismiss evil creature/spell (Will neg)"',
  'Dispel Good':
    'School=Abjuration ' +
    'Description="Touched +4 AC vs. good/touch to dismiss good creature/spell (Will neg)"',
  'Dispel Law':
    'School=Abjuration ' +
    'Description="Touched +4 AC vs. lawful/touch to dismiss lawful creature/spell (Will neg)"',
  'Dispel Magic':
    'School=Abjuration ' +
    'Description="R$RM\' d20+$L vs. 11+caster level cancels spell/effect"',
  'Greater Dispel Magic':
    'School=Abjuration ' +
    'Description="R$RM\' d20+$L vs. 11+caster level cancels $Ldiv4 spells/effects or all w/in 20\' radius"',
  'Displacement':
    'School=Illusion ' +
    'Description="Attacks on touched 50% miss for $L rd"',
  'Disrupt Undead':
    'School=Necromancy ' +
    'Description="R$RS\' Ranged touched undead 1d6 HP"',
  'Disrupting Weapon':
    'School=Transmutation ' +
    'Description="Undead hit w/touched weapon destroyed for $L rd (Will neg)"',
  'Divination':
    'School=Divination ' +
    'Description="$Lplus70min90% chance for advice on act proposed w/in a week"',
  'Divine Favor':
    'School=Evocation ' +
    'Description="Self +$Ldiv3min3 attack/damage for 1 min"',
  'Divine Power':
    'School=Evocation ' +
    'Description="Self +$Ldiv3min6 attack/damage/Str check, +$L HP for $L rd"',
  'Dominate Animal':
    'School=Enchantment ' +
    'Description="R$RS\' Target animal obey thoughts for $L rd (Will neg)"',
  'Dominate Monster':
    'School=Enchantment ' +
    'Description="R$RS\' Target obey thoughts for $L dy (Will neg)"',
  'Dominate Person':
    'School=Enchantment ' +
    'Description="R$RS\' Target humanoid obey thoughts for $L dy (Will neg)"',
  'Doom':
    'School=Necromancy ' +
    'Description="R$RM\' Target shaken (-2 attack/damage/saves/checks) for $L min (Will neg)"',
  'Dream':
    'School=Illusion ' +
    'Description="Touched sends message to sleeping target"',

  "Eagle's Splendor":
    'School=Transmutation ' +
    'Description="Touched +4 Cha for $L min"',
  "Mass Eagle's Splendor":
    'School=Transmutation ' +
    'Description="R$RS\' $L targets +4 Cha for $L min"',
  'Earthquake':
    'School=Evocation ' +
    'Description="R$RL\' Intense tremor shakes 80\' radius for 1 rd"',
  'Elemental Swarm':
    'School=Conjuration ' +
    'Description="R$RM\' Summons 2d4 large, then 1d4 huge, then 1 greater  elementals for $L10 min"',
  'Endure Elements':
    'School=Abjuration ' +
    'Description="Touched comfortable in at -50-140F for 1 dy"',
  'Energy Drain':
    'School=Necromancy ' +
    'Description="R$RS\' Ranged touch 2d4 negative levels (Fort 1 dy, undead +2d4x5 HP for 1 hr)"',
  'Enervation':
    'School=Necromancy ' +
    'Description="R$RS\' Ranged touch 1d4 negative levels for $L hr (undead +1d4x5 HP for 1 hr)"',
  'Enlarge Person':
    'School=Transmutation ' +
    'Description="R$RS\' Target humanoid dbl size (+2 Str/-2 Dex/-1 attack/-1 AC) for $L min (Fort neg)"',
  'Mass Enlarge Person':
    'School=Transmutation ' +
    'Description="R$RS\' $L target humanoid dbl size (+2 Str/-2 Dex/-1 attack/-1 AC) for $L min (Fort neg)"',
  'Entangle':
    'School=Transmutation ' +
    'Description="R$RL\' Creatures in 40\' radius entangled for $L min (Ref half speed)"',
  'Enthrall':
    'School=Enchantment ' +
    'Description="R$RM\' Listeners captivated for 1 hr (Will neg)"',
  'Entropic Shield':
    'School=Abjuration ' +
    'Description="Foes\' ranged attacks 20% miss for $L min"',
  'Erase':
    'School=Transmutation ' +
    'Description="R$RS\' Two pages of writing vanish (magical writing DC 15 caster check)"',
  'Ethereal Jaunt':
    'School=Transmutation ' +
    'Description="Self ethereal for $L rd"',
  'Etherealness':
    'School=Transmutation ' +
    'Description="Self+$Ldiv3 others ethereal for $L min"',
  'Expeditious Retreat':
    'School=Transmutation ' +
    'Description="Self speed +30 for $L min"',
  'Explosive Runes':
    'School=Abjuration ' +
    'Description="Runes 6d6 HP when read (Ref half w/in 10\', adjacent no save)"',
  'Eyebite':
    'School=Necromancy ' +
    'Description="R$RS\' 1 target/rd with 4/9/10+ HD comatose $L10 min/panicked d4 rd and shaken 10 min/sickened 10 min for $L rd (Fort neg)"',

  'Fabricate':
    'School=Transmutation ' +
    'Description="Create $L10\' cube ($L\' mineral cube) of finished items from raw materials"',
  'Faerie Fire':
    'School=Evocation ' +
    'Description="R$RL\' Creatures in 5\' radius glow for $L min"',
  'False Life':
    'School=Necromancy ' +
    'Description="Self +1d10+$Lmin10 temporary HP for $L hr"',
  'False Vision':
    'School=Illusion ' +
    'Description="Scrying in touched 40\' radius sees illusion for $L hr"',
  'Fear':
    'School=Necromancy ' +
    'Description="R30\' cone Creatures flee for $L rd (Will shaken 1 rd)"',
  'Feather Fall':
    'School=Transmutation ' +
    'Description="R$RS\' $L targets fall 60\' for $L rd (Will neg)"',
  'Feeblemind':
    'School=Enchantment ' +
    'Description="R$RM\' Target Int/Cha permanently drop to 1 (Will (arcane -4) neg)"',
  'Find The Path':
    'School=Divination ' +
    'Description="Know most direct route to location for $L10 min"',
  'Find Traps':
    'School=Divination ' +
    'Description="Self +10 Perception to notice traps w/in 10\' for $L min"',
  'Finger Of Death':
    'School=Necromancy ' +
    'Description="R$RS\' Target $L10 HP (Fort 3d6+$L)"',
  'Fire Seeds':
    'School=Conjuration ' +
    'Description="4 acorn grenades ${Lmin20}d4 total/8 berry bombs 1d8+$L (Ref half) that detonate on command for $L10 min"',
  'Fire Shield':
    'School=Evocation ' +
    'Description="Cold/hot flames enveloping self do d6+$Lmin15 HP upon foe hit, take half HP from heat/cold attacks (Ref no HP) for $L rd"',
  'Fire Storm':
    'School=Evocation ' +
    'Description="R$RM\' $L2 10\' cubes do ${Lmin20}d6 HP to targets, burn for 4d6/rd (Ref half and no burn)"',
  'Fire Trap':
    'School=Abjuration ' +
    'Description="Warded object 1d4+$Lmin20 HP (Ref half) w/in 5\' when opened"',
  'Fireball':
    'School=Evocation ' +
    'Description="R$RL\' ${Lmin10}d6 HP (Ref half) in 20\' radius"',
  'Flame Arrow':
    'School=Transmutation ' +
    'Description="R$RS\' 50 projectiles +1d6 HP for $L10 min"',
  'Flame Blade':
    'School=Evocation ' +
    'Description="Touch 1d8+$Ldiv2min10 HP for $L min"',
  'Flame Strike':
    'School=Evocation ' +
    'Description="R$RM\' 10\' radius x 40\' high ${Lmin15}d6 HP (Ref half)"',
  'Flaming Sphere':
    'School=Evocation ' +
    'Description="R$RM\' 5\' diameter sphere 3d6 HP (Ref neg) jump/move 30\' for $L rd"',
  'Flare':
    'School=Evocation ' +
    'Description="R$RS\' Target dazzled 1 min (Fort neg)"',
  'Flesh To Stone':
    'School=Transmutation ' +
    'Description="Target statue (Fort neg)"',
  'Floating Disk':
    'School=Evocation ' +
    'Description="R$RS\' 3\'-diameter x 1 inch thick force disk follows, holds $L100 lbs at 3\' for $L hr"',
  'Fly':
    'School=Transmutation ' +
    'Description="Touched fly at 60\' for $L min"',
  'Fog Cloud':
    'School=Conjuration ' +
    'Description="R$RM\' 20\'-radius fog obscures vision for $L10 min"',
  'Forbiddance':
    'School=Abjuration ' +
    'Description="R$RM\' 60\' cube bars planar travel, 6d6/12d6 HP on transit if align differs in 1/2 dimensions"',
  'Forcecage':
    'School=Evocation ' +
    'Description="R$RS\' Traps targets in 20\' cage/10\' cube for $L rd"',
  'Forceful Hand':
    'School=Evocation ' +
    'Description="R$RM\' 10\' (AC 20, caster HP) hand cover (+4 AC), move 60\', bull rush (CMB $Lplus9, 2d6+12 HP) for $L rd"',
  'Foresight':
    'School=Divination ' +
    'Description="Warnings provide +2 AC/+2 Reflex, no surprise/flat-footed for $L min"',
  "Fox's Cunning":
    'School=Transmutation ' +
    'Description="Touched +4 Int for $L min"',
  "Mass Fox's Cunning":
    'School=Transmutation ' +
    'Description="R$RS\' $L targets +4 Int for $L min"',
  'Freedom':
    'School=Abjuration ' +
    'Description="R$RS\' Target released from movement restrictions"',
  'Freedom Of Movement':
    'School=Abjuration ' +
    'Description="R$RS\' Target moves freely for $L10 min"',
  'Freezing Sphere':
    'School=Evocation ' +
    'Description="R$RL\' Burst ${Lmin15}d6 HP in 40\' radius (Ref half)"',

  'Gaseous Form':
    'School=Transmutation ' +
    'Description="Touched insubstantial (DR 10/magic, immune poison/sneak/critical, unable to use spell components, fly 10\') for $L2 min"',
  'Gate':
    'School=Conjuration ' +
    'Description="5\'-20\' disk connects another plane for $L rd"',
  'Geas/Quest':
    'School=Enchantment ' +
    'Description="R$RS\' Target must complete task (Will neg)"',
  'Lesser Geas':
    'School=Enchantment ' +
    'Description="R$RS\' Target le 7 HD must complete task (Will neg)"',
  'Gentle Repose':
    'School=Necromancy ' +
    'Description="Touched corpse preserved $L dy (Will neg)"',
  'Ghost Sound':
    'School=Illusion ' +
    'Description="R$RS\' produce sound volume of $L4 humans (Will disbelieve) for $L rd"',
  'Ghoul Touch':
    'School=Necromancy ' +
    'Description="Touched paralyzed 1d6+2 rd and stench sickens 10\' radius (Fort neg)"',
  'Giant Vermin':
    'School=Transmutation ' +
    'Description="R$RS\' ${lvl<10?3:lvl<14?4:lvl<18?6:lvl<20?8:12} centipedes/${lvl<20?1+Math.floor((lvl-6)/4):6} scorpions/${lvl<20?2+Math.floor((lvl-6)/4):8} spiders become giant and obey for $L min"',
  'Glibness':
    'School=Transmutation ' +
    'Description="Self +20 Bluff, DC $Lplus15 magical lie detection for $L10 min"',
  'Glitterdust':
    'School=Conjuration ' +
    'Description="R$RM\' Creatures in 10\'-radius outlined and blind for $L rd (Will neg)"',
  'Globe Of Invulnerability':
    'School=Abjuration ' +
    'Description="R10\' Bars spell effects le 4th level for $L rd"',
  'Lesser Globe Of Invulnerability':
    'School=Abjuration ' +
    'Description="Bars spell effects le 3rd level in 10\' radius for $L rd"',
  'Glyph Of Warding':
    'School=Abjuration ' +
    'Description="Proscribed creatures passing $L5 sq\' area trigger ${Ldiv2max5plus1}d8 blast (Ref half) or harmful spell le 3rd level"',
  'Greater Glyph Of Warding':
    'School=Abjuration ' +
    'Description="Proscribed creatures passing $L5 sq\' area trigger ${Ldiv2max10plus1}d8 blast (Ref half) or harmful spell le 6th level"',
  'Good Hope':
    'School=Enchantment ' +
    'Description="$L targets +2 attack, damage, saves, and checks for $L min"',
  'Goodberry':
    'School=Transmutation ' +
    'Description="2d4 berries provide meal and heal 1 HP for $L dy"',
  'Grasping Hand':
    'School=Evocation ' +
    'Description="R$RM\' 10\' (AC 20, caster HP) hand cover (+4 AC), move 60\', grapple (CMB $Lplus12) for $L rd"',
  'Grease':
    'School=Conjuration ' +
    'Description="R$RS\' Object or 10\' square slippery (Ref or fall) for $L min"',
  'Guards And Wards':
    'School=Abjuration ' +
    'Description="Multiple magic effects protect $L200\' sq area for $L2 hr"',
  'Guidance':
    'School=Divination ' +
    'Description="Touched +1 next attack, save, or skill check for 1 min"',
  'Gust Of Wind':
    'School=Evocation ' +
    'Description="60\' gust affects medium/smaller creatures (Fort neg)"',

  'Hallow':
    'School=Evocation ' +
    'Description="40\' radius warded against evil, bars undead creation, evokes boon spell"',
  'Hallucinatory Terrain':
    'School=Illusion ' +
    'Description="R$RL\' $L 30\' cube terrain illusion (Will disbelieve) for $L2 hr"',
  'Halt Undead':
    'School=Necromancy ' +
    'Description="R$RM\' 3 undead immobilized for $L rd (Will neg)"',
  'Harm':
    'School=Necromancy ' +
    'Description="Touched $L10min150 HP (Will half)"',
  'Haste':
    'School=Transmutation ' +
    'Description="R$RS\' $L targets extra attack, +1 attack, AC, and Reflex, +30 move for $L rd"',
  'Heal':
    'School=Conjuration ' +
    'Description="Touched heal $L10min150, remove negative conditions"',
  'Mass Heal':
    'School=Conjuration ' +
    'Description="R$RS\' $L targets heal $L10min150, remove negative conditions"',
  'Heal Mount':
    'School=Conjuration ' +
    'Description="Mount heal $L10min150, remove negative conditions"',
  'Heat Metal':
    'School=Transmutation ' +
    'Description="R$RS\' Metal of $Ldiv2 creatures 0/1/2/2/2/1/0d4 HP for 7 rd (Will neg)"',
  'Helping Hand':
    'School=Evocation ' +
    'Description="R5 miles Ghostly hand leads target to you for 4 hr"',
  "Heroes' Feast":
    'School=Conjuration ' +
    'Description="Food for $L creatures cures sickness/poison/disease, 1d8+$Ldiv2min10 temporary HP, +1 attack and Will saves, +4 saves vs. poison and fear for 12 hr"',
  'Heroism':
    'School=Enchantment ' +
    'Description="Touched +2 attack, saves, and skill checks for $L10 min"',
  'Greater Heroism':
    'School=Enchantment ' +
    'Description="Touched +4 attack, saves, and skill checks, +$Lmin20 HP, immune fear for $L10 min"',
  'Hide From Animals':
    'School=Abjuration ' +
    'Description="$L touched imperceptable to animals for $L10 min"',
  'Hide From Undead':
    'School=Abjuration ' +
    'Description="$L touched imperceptable to undead for $L10 min"',
  'Hideous Laughter':
    'School=Enchantment ' +
    'Description="R$RS\' Target ROFL for $L rd (Will neg)"',
  'Hold Animal':
    'School=Enchantment ' +
    'Description="R$RM\' Target animal immobile for $L rd (Will neg)"',
  'Hold Monster':
    'School=Enchantment ' +
    'Description="R$RM\' Target immobile for $L rd (Will neg)"',
  'Mass Hold Monster':
    'School=Enchantment ' +
    'Description="R$RM\' Targets in 30\' radius immobile for $L rd (Will neg)"',
  'Hold Person':
    'School=Enchantment ' +
    'Description="R$RM\' Target humanoid immobile for $L rd (Will neg)"',
  'Mass Hold Person':
    'School=Enchantment ' +
    'Description="R$RM\' Targets in 30\' radius immobile for $L rd (Will neg)"',
  'Hold Portal':
    'School=Abjuration ' +
    'Description="R$RM\' Door/gate/window locked, +5 DC to open for $L min"',
  'Holy Aura':
    'School=Abjuration ' +
    'Description="$L creatures w/in 20\' +4 AC and saves, SR 25 vs. evil spells, protected from possession, striking foes blinded (Fort neg), for $L rd"',
  'Holy Smite':
    'School=Evocation ' +
    'Description="R$RM\' Evil w/in 20\'-radius burst ${Ldiv2min5}d8 HP and blinded 1 rd, neutral half (Will half)"',
  'Holy Sword':
    'School=Evocation ' +
    'Description="Touched weapon +5 attack and damage, vs. evil +2d6 damage, +2 AC and saves, extra save vs. enchantment, bars contact for $L rd"',
  'Holy Word':
    'School=Evocation ' +
    'Description="Nongood creatures w/in 40\' with equal/-1/-5/-10 HD deafened 1d4 rd/blinded 2d4 rd/paralyzed 1d10 min/killed and banished (Will neg)"',
  'Horrid Wilting':
    'School=Necromancy ' +
    'Description="R$RL\' ${Lmin20}d6 HP (${Lmin20}d8 plants/water elementals) in 30\' radius (Fort half)"',
  'Hypnotic Pattern':
    'School=Illusion ' +
    'Description="R$RM\' 2d4+$Lmin10 HD of creatures fascinated for conc + 2 rd (Will neg)"',
  'Hypnotism':
    'School=Enchantment ' +
    'Description="R$RS\' 2d4 HD of creatures fascinated and suggestable for 2d4 rd (Will neg)"',

  'Ice Storm':
    'School=Evocation ' +
    'Description="R$RL\' Hail in 40\' cylinder 3d6 HP bludgeoning/2d6 HP cold, -4 Perception for $L rd"',
  'Identify':
    'School=Divination ' +
    'Description="R60\' cone info on magical auras, +10 Spellcraft for $L3 rd"',
  'Illusory Script':
    'School=Illusion ' +
    'Description="Unauthorized readers suggestion for $L dy (Will neg)"',
  'Illusory Wall':
    'School=Illusion ' +
    'Description="R$RS\' Permanent illusionary 1\'x10\'x10\' surface (Will disbelieve)"',
  'Imbue With Spell Ability':
    'School=Evocation ' +
    'Description="Touched with 2/4/5 HD can cast specified 1st/2x1st/2x1st+2nd level spells"',
  'Implosion':
    'School=Evocation ' +
    'Description="R$RS\' 1 target/rd $L10 HP for $Ldiv2 rd (Fort neg)"',
  'Imprisonment':
    'School=Abjuration ' +
    'Description="Target entombed (Will neg)"',
  'Incendiary Cloud':
    'School=Conjuration ' +
    'Description="R$RM\' 20\' cylinder moves away 10\', 6d6 HP (Ref half) for $L rd"',
  'Inflict Critical Wounds':
    'School=Necromancy ' +
    'Description="Touched damage/heal undead 4d8+$Lmin20 (Will half)"',
  'Mass Inflict Critical Wounds':
    'School=Necromancy ' +
    'Description="R$RS\' $L targets damage/heal undead 4d8+$Lmin40 (Will half)"',
  'Inflict Light Wounds':
    'School=Necromancy ' +
    'Description="Touched damage/heal undead 1d8+$Lmin5 (Will half)"',
  'Mass Inflict Light Wounds':
    'School=Necromancy ' +
    'Description="R$RS\' $L targets damage/heal undead 1d8+$Lmin25 (Will half)"',
  'Inflict Minor Wounds':
    'School=Necromancy ' +
    'Description="Touched 1 HP"',
  'Inflict Moderate Wounds':
    'School=Necromancy ' +
    'Description="Touched damage/heal undead 2d8+$Lmin10 (Will half)"',
  'Mass Inflict Moderate Wounds':
    'School=Necromancy ' +
    'Description="R$RS\' $L targets damage/heal undead 2d8+$Lmin30 (Will half)"',
  'Inflict Serious Wounds':
    'School=Necromancy ' +
    'Description="Touched damage/heal undead 3d8+$Lmin15 (Will half)"',
  'Mass Inflict Serious Wounds':
    'School=Necromancy ' +
    'Description="R$RS\' $L targets damage/heal undead 3d8+$Lmin35 (Will half)"',
  'Insanity':
    'School=Enchantment ' +
    'Description="R$RM\' Target randomly normal/babble/d8+str to self/attack nearest permanently (Will neg)"',
  'Insect Plague':
    'School=Conjuration ' +
    'Description="R$RL\' $Ldiv3min6 wasp swarms attack for $L min"',
  'Instant Summons':
    'School=Conjuration ' +
    'Description="Prepared object appears in your hand"',
  'Interposing Hand':
    'School=Evocation ' +
    'Description="R$RM\' 10\' (AC 20, caster HP) hand cover (+4 AC) for $L rd"',
  'Invisibility':
    'School=Illusion ' +
    'Description="Touched invisible for $L min/until attacks"',
  'Greater Invisibility':
    'School=Illusion ' +
    'Description="Touched invisible for $L rd"',
  'Mass Invisibility':
    'School=Illusion ' +
    'Description="R$RL\' Targets in 90\' radius invisible for $L min/until attacks"',
  'Invisibility Purge':
    'School=Evocation ' +
    'Description="R$L5\' Invisible becomes visible for $L min"',
  'Invisibility Sphere':
    'School=Illusion ' +
    'Description="Creatures w/in 10\' of touched invisible for $L min/until attacks/leave area"',
  'Iron Body':
    'School=Transmutation ' +
    'Description="Become iron (+6 Str/-6 Dex, half Speed, 35% arcane failure, -6 skill, DR 15/adamantine, half damage acid and fire, immune other attacks and effects) for $L min"',
  'Ironwood':
    'School=Transmutation ' +
    'Description="Make a wood object as strong as steel"',
  'Irresistible Dance':
    'School=Enchantment ' +
    'Description="Touched dance (-4 AC, -10 Ref) for d4+1 rd"',

  'Jump':
    'School=Transmutation ' +
    'Description="Touched +${lvl<5?10:lvl<9?20:30} jump for $L min"',

  'Keen Edge':
    'School=Transmutation ' +
    'Description="R$RS\' Target weapon double threat range for $L10 min"',
  'Knock':
    'School=Transmutation ' +
    'Description="R$RM\' +$Lplus10 check to open stuck/barred/locked/magically held door/chest/shackle"',
  'Know Direction':
    'School=Divination ' +
    'Description="Self determine north"',

  'Legend Lore':
    'School=Divination ' +
    'Description="Info about target person/place/object"',
  'Levitate':
    'School=Transmutation ' +
    'Description="R$RS\' Move willing target up/down 20\' for $L min"',
  'Light':
    'School=Evocation ' +
    'Description="Touched gives torchlight for $L10 min"',
  'Lightning Bolt':
    'School=Evocation ' +
    'Description="120\' bolt ${Lmin10}d6 HP (Ref half)"',
  'Limited Wish':
    'School=Universal ' +
    'Description="Alter reality, with limits"',
  'Liveoak':
    'School=Transmutation ' +
    'Description="Touched oak becomes treant guardian for $L dy"',
  'Locate Creature':
    'School=Divination ' +
    'Description="R$RL\' Sense direction of creature/kind for $L10 min"',
  'Locate Object':
    'School=Divination ' +
    'Description="R$RL\' Sense direction of object/type for $L min"',
  'Longstrider':
    'School=Transmutation ' +
    'Description="Self +10 Speed for $L hr"',
  'Lullaby':
    'School=Enchantment ' +
    'Description="R$RM\' Targets in 10\' radius -5 Perception/-2 Will saves vs. sleep for conc + $L rd (Will neg)"',

  'Mage Armor':
    'School=Conjuration ' +
    'Description="Touched +4 AC for $L hr"',
  'Mage Hand':
    'School=Transmutation ' +
    'Description="R$RS\' Move target le 5 lb 15\'"',
  "Mage's Disjunction":
    'School=Abjuration ' +
    'Description="R$RS\' 40\' radius dispelled, magic items inert for $L min, $L% chance to destroy antimagic field (Will neg)"',
  "Mage's Faithful Hound":
    'School=Conjuration ' +
    'Description="R$RS\' Invisible dog barks at intruders w/in 30\', bites (+10 2d6+3) w/in 5\' for $L hr"',
  "Mage's Lucubration":
    'School=Transmutation ' +
    'Description="Recalls spell le 5th level from past day"',
  "Mage's Magnificent Mansion":
    'School=Conjuration ' +
    'Description="R$RS\' Door to extradimensional mansion for $L2 hr"',
  "Mage's Private Sanctum":
    'School=Abjuration ' +
    'Description="Prevents outside view/scry/hear of $L 30\' cubes for 1 dy"',
  "Mage's Sword":
    'School=Evocation ' +
    'Description="R$RS\' Unattended force blade attacks (+$Lplus3+abil 4d6+3x2@19) for $L rd"',
  'Magic Aura':
    'School=Illusion ' +
    'Description="Alters aura of target object le $L5 lb for $L dy"',
  'Magic Circle Against Chaos':
    'School=Abjuration ' +
    'Description="10\' radius from touched +2 AC, +2 saves, extra save vs. mental control, no contact vs. chaotic creatures for $L10 min"',
  'Magic Circle Against Evil':
    'School=Abjuration ' +
    'Description="10\' radius from touched +2 AC, +2 saves, extra save vs. mental control, no contact vs. evil creatures for $L10 min"',
  'Magic Circle Against Good':
    'School=Abjuration ' +
    'Description="10\' radius from touched +2 AC, +2 saves, extra save vs. mental control, no contact vs. good creatures for $L10 min"',
  'Magic Circle Against Law':
    'School=Abjuration ' +
    'Description="10\' radius from touched +2 AC, +2 saves, extra save vs. mental control, no contact vs. lawful creatures for $L10 min"',
  'Magic Fang':
    'School=Transmutation ' +
    'Description="Touched natural weapon +1 attack and damage for $L min"',
  'Greater Magic Fang':
    'School=Transmutation ' +
    'Description="R$RS\' target natural weapon +$Ldiv4min4 attack/damage for $L hr"',
  'Magic Jar':
    'School=Necromancy ' +
    'Description="R$RM\' Target possessed for $L hr (Will neg)"',
  'Magic Missile':
    'School=Evocation ' +
    'Description="R$RM\' $Lplus1div2min5 missles 1d4+1 HP"',
  'Magic Mouth':
    'School=Illusion ' +
    'Description="R$RS\' Mouth speaks 25 words upon trigger w/in $L15\' (Will neg)"',
  'Magic Stone':
    'School=Transmutation ' +
    'Description="3 touched stones +1 attack, 1d6+1 HP (2d6+2 vs. undead) for 30 min"',
  'Magic Vestment':
    'School=Transmutation ' +
    'Description="Touched armor/shield/clothing +$Ldiv4min5 AC for $L hr"',
  'Magic Weapon':
    'School=Transmutation ' +
    'Description="Touched weapon +1 attack and damage for $L min"',
  'Greater Magic Weapon':
    'School=Transmutation ' +
    'Description="R$RS\' target weapon +$Ldiv4min4 attack/damage for $L hr"',
  'Major Creation':
    'School=Conjuration ' +
    'Description="Create $L\' cu plant/mineral object for $L2 hr"',
  'Major Image':
    'School=Illusion ' +
    'Description="R$RL\' $L10plus40\' cu image w/sound/smell/thermal (Will disbelieve) for conc + 3 rd"',
  'Make Whole':
    'School=Transmutation ' +
    'Description="R$RS\' Repairs ${Lmin5}d6 damage to $L\' cu object"',
  'Mark Of Justice':
    'School=Necromancy ' +
    'Description="Touched permanent -6 ability, -4 attack, saves, and checks, or 50% chance/rd of losing action upon trigger"',
  'Maze':
    'School=Conjuration ' +
    'Description="R$RS\' Target in extradimensional maze for 10 min/until DC 20 Int check"',
  'Meld Into Stone':
    'School=Transmutation ' +
    'Description="Self pass into stone for $L10 min"',
  'Mending':
    'School=Transmutation ' +
    'Description="R10\' Repairs 1d4 HP to $L-lb object"',
  'Message':
    'School=Transmutation ' +
    'Description="R$RM\' Target DC 25 Perception for $L10-min whispered dialogue"',
  'Meteor Swarm':
    'School=Evocation ' +
    'Description="R$RL\' 4 spheres 6d6 HP fire 40\' radius (Ref half)/ranged touch 2d6 HP bludgeoning"',
  'Mind Blank':
    'School=Abjuration ' +
    'Description="R$RS\' Target immune divination/+8 vs. mental for 1 dy"',
  'Mind Fog':
    'School=Enchantment ' +
    'Description="20\' fog cylinder -10 Wis/Will checks (Will neg)"',
  'Minor Creation':
    'School=Conjuration ' +
    'Description="Create a $L\' cu plant object lasting $L hr"',
  'Minor Image':
    'School=Illusion ' +
    'Description="R$RL\' $L10plus40\' cu image w/noise (Will disbelieve) for conc + 2 rd"',
  'Miracle':
    'School=Evocation ' +
    'Description="Requests deity intercession"',
  'Mirage Arcana':
    'School=Illusion ' +
    'Description="R$RL\' $L 20\' cube terrain/structure illusion (Will disbelieve) for $L hr"',
  'Mirror Image':
    'School=Illusion ' +
    'Description="1d4+$Ldiv3min8 self decoys mislead attacks for $L min"',
  'Misdirection':
    'School=Illusion ' +
    'Description="R$RS\' Divinations upon target redirected for $L hr"',
  'Mislead':
    'School=Illusion ' +
    'Description="R$RS\' Self invisible $L rd, false double (Will disbelieve) conc + 3 rd"',
  'Mnemonic Enhancer':
    'School=Transmutation ' +
    'Description="Know +3 spell levels or retain just-cast spell le 3rd level for 1 dy"',
  'Modify Memory':
    'School=Enchantment ' +
    'Description="Target change 5 min of memory (Will neg)"',
  'Moment Of Prescience':
    'School=Divination ' +
    'Description="Self +$Lmin25 attack/check/save once w/in $L hr"',
  'Mount':
    'School=Conjuration ' +
    'Description="R$RS\' Summons riding horse for $L2 hr"',
  'Move Earth':
    'School=Transmutation ' +
    'Description="R$RL\' Slowly digs 7500\' cu dirt"',

  'Neutralize Poison':
    'School=Conjuration ' +
    'Description="Touched neutralized $L10 min/immunized/detoxified"',
  'Nightmare':
    'School=Illusion ' +
    'Description="Target 1d10 HP and fatigue (Will neg)"',
  'Nondetection':
    'School=Abjuration ' +
    'Description="Touched DC $Lplus11/$Lplus15 resistance to divination for $L hr"',

  'Obscure Object':
    'School=Abjuration ' +
    'Description="Touched immune to divination for 8 hr (Will neg)"',
  'Obscuring Mist':
    'School=Conjuration ' +
    'Description="20\'-radius fog around self obscures vision for $L min"',
  'Open/Close':
    'School=Transmutation ' +
    'Description="R$RS\' Target le 30 lb opens/closes (Will neg)"',
  "Order's Wrath":
    'School=Evocation ' +
    'Description="R$RM\' Chaotic w/in 30\' cube ${Ldiv2min5}d8 HP and dazed 1 rd, neutral half (Will half)"',
  'Overland Flight':
    'School=Transmutation ' +
    'Description="Self fly 40\', +$Ldiv2 Fly for $L hr"',
  "Owl's Wisdom":
    'School=Transmutation ' +
    'Description="Touched +4 Wis for $L min"',
  "Mass Owl's Wisdom":
    'School=Transmutation ' +
    'Description="R$RS\' $L targets +4 Wis for $L min"',

  'Pass Without Trace':
    'School=Transmutation ' +
    'Description="$L touched leave no tracks/scent for $L hr"',
  'Passwall':
    'School=Transmutation ' +
    'Description="8\'x5\'x$Ldiv3minus1times5min25\' passage through wood/stone/plaster lasts $L hr"',
  'Permanency':
    'School=Universal ' +
    'Description="Make certain spells permanent"',
  'Permanent Image':
    'School=Illusion ' +
    'Description="R$RL\' $L10plus40\' cu image w/sound/smell/thermal (Will disbelieve)"',
  'Persistent Image':
    'School=Illusion ' +
    'Description="R$RL\' $L10plus40\' cu image w/sound/smell/thermal (Will disbelieve) for $L min"',
  'Phantasmal Killer':
    'School=Illusion ' +
    'Description="R$RM\' Target fears create creature (Will neg), touch kills (Fort 3d6 HP)"',
  'Phantom Steed':
    'School=Conjuration ' +
    'Description="Create mount ($Lplus7 HP, AC 18, MV $L20min240) for target for $L hr"',
  'Phantom Trap':
    'School=Illusion ' +
    'Description="Touched object appears trapped"',
  'Phase Door':
    'School=Conjuration ' +
    'Description="Allow passage through 8\'x5\'x$Ldiv3minus1times5min25\' wood/stone/plaster $Ldiv2 times"',
  'Planar Ally':
    'School=Conjuration ' +
    'Description="Purchase service from extraplanar creature le 12 HD"',
  'Greater Planar Ally':
    'School=Conjuration ' +
    'Description="Purchase service from extraplanar creature le 18 HD"',
  'Lesser Planar Ally':
    'School=Conjuration ' +
    'Description="Purchase service from extraplanar creature le 6 HD"',
  'Planar Binding':
    'School=Conjuration ' +
    'Description="Extraplanar creature(s) le 12 HD trapped until escape (DC cha+$Ldiv2plus15) or performs a task (Will neg)"',
  'Greater Planar Binding':
    'School=Conjuration ' +
    'Description="Extraplanar creature(s) le 18 HD trapped until escape (DC cha+$Ldiv2plus15) or performs a task (Will neg)"',
  'Lesser Planar Binding':
    'School=Conjuration ' +
    'Description="Extraplanar creature le 6 HD trapped until escape (DC cha+$Ldiv2plus15) or performs a task (Will neg)"',
  'Plane Shift':
    'School=Conjuration ' +
    'Description="1 target (Will neg)/8 willing move to another plane"',
  'Plant Growth':
    'School=Transmutation ' +
    'Description="$RL\' vegetation becomes dense or half-mi radius increases productivity"',
  'Poison':
    'School=Necromancy ' +
    'Description="Touched 1d3 Con/rd for 6 rd (Fort neg)"',
  'Polar Ray':
    'School=Evocation ' +
    'Description="R$RM\' Ranged touch ${Lmin25}d6 HP/1d4 Dex"',
  'Polymorph':
    'School=Transmutation ' +
    'Description="Willing target becomes animal/elemental for $L min"',
  'Polymorph Any Object':
    'School=Transmutation ' +
    'Description="Target become something else (Fort neg)"',
  'Power Word Blind':
    'School=Enchantment ' +
    'Description="R$RS\' Target w/ 50/100/200 HP blinded forever/1d4+1 min/1d4+1 rd"',
  'Power Word Kill':
    'School=Enchantment ' +
    'Description="R$RS\' Kills one creature le 100 HP"',
  'Power Word Stun':
    'School=Enchantment ' +
    'Description="R$RS\' Target w/ 40/100/150 HP stunned for 4d4/2d4/1d4 rd"',
  'Prayer':
    'School=Enchantment ' +
    'Description="Allies w/in 40\' +1 attack, damage, save, and skill, foes -1 for $L rd"',
  'Prestidigitation':
    'School=Universal ' +
    'Description="R10\' Perform minor tricks for 1 hr"',
  'Prismatic Sphere':
    'School=Abjuration ' +
    'Description="R$RS\' 10\' sphere blocks attacks for $L10 min"',
  'Prismatic Spray':
    'School=Evocation ' +
    'Description="R60\' cone Blinds le 8 HD 2d4 rd, other effects"',
  'Prismatic Wall':
    'School=Abjuration ' +
    'Description="R$RS\' $L4\'x$L2\' wall blocks attacks for $L10 min"',
  'Produce Flame':
    'School=Evocation ' +
    'Description="Torch flame 1d6+$Lmin5 HP for $L min"',
  'Programmed Image':
    'School=Illusion ' +
    'Description="R$RL\' $L10plus40\' cu image w/sound/smell/thermal (Will disbelieve) for $L rd when triggered"',
  'Project Image':
    'School=Illusion ' +
    'Description="R$RM\' See/cast through illusory double for $L rd (Will disbelieve)"',
  'Protection From Arrows':
    'School=Abjuration ' +
    'Description="Touched DR 10/magic vs. ranged for $L hr/$L10min100 HP"',
  'Protection From Chaos':
    'School=Abjuration ' +
    'Description="Touched +2 AC, +2 saves, extra save vs. mental control, no contact by chaotic creatures for $L min"',
  'Protection From Energy':
    'School=Abjuration ' +
    'Description="Touched ignores up to $L12min120 HP from specified energy for $L10 min"',
  'Protection From Evil':
    'School=Abjuration ' +
    'Description="Touched +2 AC, +2 saves, extra save vs. mental control, no contact by evil creatures for $L min"',
  'Protection From Good':
    'School=Abjuration ' +
    'Description="Touched +2 AC, +2 saves, extra save vs. mental control, no contact by good creatures for $L min"',
  'Protection From Law':
    'School=Abjuration ' +
    'Description="Touched +2 AC, +2 saves, extra save vs. mental control, no contact by lawful creatures for $L min"',
  'Protection From Spells':
    'School=Abjuration ' +
    'Description="+8 spell saves for $L10 min"',
  'Prying Eyes':
    'School=Divination ' +
    'Description="1d4+$L floating eyes (AC 18, 1 HP) scout 1 mi for $L hr"',
  'Greater Prying Eyes':
    'School=Divination ' +
    'Description="1d4+$L floating eyes (AC 18, 1 HP) with True Seeing scout 1 mi for $L hr"',
  'Purify Food And Drink':
    'School=Transmutation ' +
    'Description="R10\' Make $L\' cu food/water safe (Will neg)"',
  'Pyrotechnics':
    'School=Transmutation ' +
    'Description="R$RL\' Fire becomes fireworks (120\' blinded 1d4+1 rd (Will neg)) or choking smoke (20\' -4 Str/Dex d4+1 rd (Fort neg))"',

  'Quench':
    'School=Transmutation ' +
    'Description="R$RM\' Extinguish fire/dispel fire magic/${Lmin10}d6 HP to fire creatures in $L 20\' cu (Will neg)"',

  'Rage':
    'School=Enchantment ' +
    'Description="R$RM\' $Ldiv3 willing targets +2 Str, +2 Con, +1 Will, -2 AC for conc + $L rd"',
  'Rainbow Pattern':
    'School=Illusion ' +
    'Description="R$RM\' 24 HD creatures in 20\' radius facinated for conc + $L rd (Will neg)"',
  'Raise Dead':
    'School=Conjuration ' +
    'Description="Restores life to touched corpse dead le $L dy"',
  'Ray Of Enfeeblement':
    'School=Necromancy ' +
    'Description="R$RS\' Ranged touch 1d6+$Ldiv2min5 Str"',
  'Ray Of Exhaustion':
    'School=Necromancy ' +
    'Description="R$RS\' Ranged touch causes exhaustion for $L min (Fort fatigued)"',
  'Ray Of Frost':
    'School=Evocation ' +
    'Description="R$RS\' Ranged touch 1d3 HP"',
  'Read Magic':
    'School=Divination ' +
    'Description="Self read magical writing"',
  'Reduce Animal':
    'School=Transmutation ' +
    'Description="Touched willing animal half size (-2 Str, +2 Dex, +1 attack, +1 AC) for $L hr"',
  'Reduce Person':
    'School=Transmutation ' +
    'Description="R$RS\' Target humanoid half size (-2 Str, +2 Dex, +1 attack, +1 AC) for $L min (Fort neg)"',
  'Mass Reduce Person':
    'School=Transmutation ' +
    'Description="R$RS\' $L target humanoid half size (-2 Str, +2 Dex, +1 attack, +1 AC) for $L min (Fort neg)"',
  'Refuge':
    'School=Conjuration ' +
    'Description="Breaking trigger transports you/target to other\'s location"',
  'Regenerate':
    'School=Conjuration ' +
    'Description="Touched regrow maims, heal 4d8+$Lmin35 HP, rid fatigue/exhaustion"',
  'Reincarnate':
    'School=Transmutation ' +
    'Description="Restore target dead le 1 week to new body"',
  'Remove Blindness/Deafness':
    'School=Conjuration ' +
    'Description="Restore target dead le 1 week to new body"',
  'Remove Curse':
    'School=Abjuration ' +
    'Description="Dispels all curses from touched"',
  'Remove Disease':
    'School=Conjuration ' +
    'Description="Cures all diseases affecting touched"',
  'Remove Fear':
    'School=Abjuration ' +
    'Description="R$RS\' $Lplus3div4 targets +4 vs. fear, existing fear suppressed for 10 min"',
  'Remove Paralysis':
    'School=Conjuration ' +
    'Description="R$RS\' Frees one target from paralysis/slow, 2/3/4 targets extra save at +4/+2/+2"',
  'Repel Metal Or Stone':
    'School=Abjuration ' +
    'Description="Repels 60\' line of unanchored metal/stone for $L rd"',
  'Repel Vermin':
    'School=Abjuration ' +
    'Description="10\' radius bars vermin le $Ldiv3 HD, 2d6 HP to others (Will neg) for $L10 min"',
  'Repel Wood':
    'School=Transmutation ' +
    'Description="Repels 60\' line of unanchored wood for $L min"',
  'Repulsion':
    'School=Abjuration ' +
    'Description="Creatures stay $L10\' away for $L rd (Will neg)"',
  'Resilient Sphere':
    'School=Evocation ' +
    'Description="R$RS\' Impassible/immobile $L\'-diameter sphere surrounds target for $L min (Ref neg)"',
  'Resist Energy':
    'School=Abjuration ' +
    'Description="Touched DR ${lvl>10?30:lvl>6?20:10} from specified energy for $L10 min"',
  'Resistance':
    'School=Abjuration ' +
    'Description="Touched +1 saves for 1 min"',
  'Restoration':
    'School=Conjuration ' +
    'Description="Touched remove magical/temporary/1 permanent ability harm, fatigue/exhaustion, 1 negative level"',
  'Greater Restoration':
    'School=Conjuration ' +
    'Description="Touched remove magical/temporary/permanent ability harm, fatigue/exhaustion, negative levels, mental effects"',
  'Lesser Restoration':
    'School=Conjuration ' +
    'Description="Touched remove 1 magical/1d4 temporary ability harm, fatigue/exhaustion, 1 negative level"',
  'Resurrection':
    'School=Conjuration ' +
    'Description="Fully restore target dead $L10 years w/1 negative level"',
  'Reverse Gravity':
    'School=Transmutation ' +
    'Description="Objects in $L10\' cu fall upward for $L rd"',
  'Righteous Might':
    'School=Transmutation ' +
    'Description="Self double size (+4 Str, +4 Con, -2 Dex, -1 attack, -1 AC) and DR ${lvl>14?10:5}/align for $L rd"',
  'Rope Trick':
    'School=Transmutation ' +
    'Description="Rope to extradimensional space for 8 creatures for $L hr"',
  'Rusting Grasp':
    'School=Transmutation ' +
    'Description="Touch corrodes 3\' radius"',

  'Sanctuary':
    'School=Abjuration ' +
    'Description="Touched foes no attack for $L rd/until attacks (Will neg)"',
  'Scare':
    'School=Necromancy ' +
    'Description="R$RS\' $Ldiv3 targets le 5 HD flee for 1d4 rd (Will shaken 1 rd)"',
  'Scintillating Pattern':
    'School=Illusion ' +
    'Description="R$RS\' $Lmin20 HD creatures in 20\' radius le 6/12/20 HD unconscious 1d4 rd/stunned 1d4 rd/confused 1d4 rd"',
  'Scorching Ray':
    'School=Evocation ' +
    'Description="${lvl>10?3:lvl>6?2:1} $RS\' rays ranged touch 4d6 HP"',
  'Screen':
    'School=Illusion ' +
    'Description="Illusion hides $L x 30\' cu from vision and scrying (Will disbelieve) for 1 dy"',
  'Scrying':
    'School=Divination ' +
    'Description="Target viewed for $L min (Will neg)"',
  'Greater Scrying':
    'School=Divination ' +
    'Description="Target viewed, subject to spells for $L hr (Will special neg)"',
  'Sculpt Sound':
    'School=Transmutation ' +
    'Description="R$RS\' $L targets sounds changed for $L hr (Will neg)"',
  'Searing Light':
    'School=Evocation ' +
    'Description="R$RM\' Range touch ${Ldiv2min5}d8 HP, undead ${Lmin10}d6, object ${Ldiv2min5}d6"',
  'Secret Chest':
    'School=Conjuration ' +
    'Description="$L\' cu ethereal chest can be recalled at will for 60 dy"',
  'Secret Page':
    'School=Transmutation ' +
    'Description="Hide content of touched page permanently"',
  'Secure Shelter':
    'School=Conjuration ' +
    'Description="R$RS\' 20\'x20\' cottage lasts $L2 hr"',
  'See Invisibility':
    'School=Divination ' +
    'Description="Self sees invisible creatures/objects for $L10 min"',
  'Seeming':
    'School=Illusion ' +
    'Description="R$RS\' $Ldiv2 targets appearance change/+10 disguise for 12 hr (Will disbelieve)"',
  'Sending':
    'School=Evocation ' +
    'Description="25-word exchange with target"',
  'Sepia Snake Sigil':
    'School=Conjuration ' +
    'Description="Target reader immobile 1d4+$L dy (Ref neg)"',
  'Sequester':
    'School=Abjuration ' +
    'Description="Willing touched invisible/unscryable/comatose for $L dy"',
  'Shades':
    'School=Illusion ' +
    'Description="Mimics conjuration (creation/summoning) le 8th level (Will 80% effect)"',
  'Shadow Conjuration':
    'School=Illusion ' +
    'Description="Mimics conjuration (creation/summoning) le 3rd level (Will 20% effect)"',
  'Greater Shadow Conjuration':
    'School=Illusion ' +
    'Description="Mimics conjuration (creation/summoning) le 6th level (Will 60% effect)"',
  'Shadow Evocation':
    'School=Illusion ' +
    'Description="Mimics evocation le 4th level (Will 20% effect)"',
  'Greater Shadow Evocation':
    'School=Illusion ' +
    'Description="Mimics evocation le 7th level (Will 60% effect)"',
  'Shadow Walk':
    'School=Illusion ' +
    'Description="Travel quickly via Plane of Shadow for $L hr"',
  'Shambler':
    'School=Conjuration ' +
    'Description="R$RM\' 1d4+2 advanced shambling mounds fight for 7 dy/guard for 7 mo"',
  'Shapechange':
    'School=Transmutation ' +
    'Description="Become different animal 1/rd for $L10 min"',
  'Shatter':
    'School=Evocation ' +
    'Description="R$RS\' Breakables in 5\' radius shatter (Will neg), or target ${Lmin10}d6 HP (Fort half)"',
  'Shield':
    'School=Abjuration ' +
    'Description="Self +4 AC, block magic missle for $L min"',
  'Shield Of Faith':
    'School=Abjuration ' +
    'Description="Touched +$Ldiv6plus2min5 AC for $L min"',
  'Shield Of Law':
    'School=Abjuration ' +
    'Description="$L creatures w/in 20\' radius +4 AC and saves, +25 vs chaotic spells, immune chaotic mental control, chaotic hit slowed for $L rd (Will neg)"',
  'Shield Other':
    'School=Abjuration ' +
    'Description="R$RS\' target +1 AC and saves, half damage transferred to you for $L hr"',
  'Shillelagh':
    'School=Transmutation ' +
    'Description="S/M/L staff +1 attack, 1d8+1/2d6+1/3d6+1 damage for $L min (Will neg)"',
  'Shocking Grasp':
    'School=Evocation ' +
    'Description="Touch ${Lmin5}d6 HP, +3 attack vs metal"',
  'Shout':
    'School=Evocation ' +
    'Description="R30\' cone 5d6 HP, deafened 2d6 rd (Will half damage only)"',
  'Greater Shout':
    'School=Evocation ' +
    'Description="60\' cone 10d6 HP, deafened 4d6 rd, stunned 1 rd (Will half damage/deafened only)"',
  'Shrink Item':
    'School=Transmutation ' +
    'Description="Touched $L2\' cu object 1/16 size, becomes cloth for $L dy (Will neg)"',
  'Silence':
    'School=Illusion ' +
    'Description="R$RL\' Bars sound in 20\' radius for $L rd"',
  'Silent Image':
    'School=Illusion ' +
    'Description="R$RL\' $L10plus40\' cu image (Will disbelieve) for conc"',
  'Simulacrum':
    'School=Illusion ' +
    'Description="Create permanent double of creature w/half HP/levels"',
  'Slay Living':
    'School=Necromancy ' +
    'Description="Touch attack 12d6+$L HP (Fort 3d6+$L)"',
  'Sleep':
    'School=Enchantment ' +
    'Description="R$RM\' 4 HD creatures in 10\' radius sleep for $L min (Will neg)"',
  'Sleet Storm':
    'School=Conjuration ' +
    'Description="R$RL\' Blinding sleet in 40\' area, creatures DC 10 Acrobatics to move for $L rd"',
  'Slow':
    'School=Transmutation ' +
    'Description="R$RS\' $L creatures single action per rd/-1 AC/attack/Ref/half Speed for $L rd (Will neg)"',
  'Snare':
    'School=Transmutation ' +
    'Description="Touched vine/thong/rope becomes permanent DC 23 trap"',
  'Soften Earth And Stone':
    'School=Transmutation ' +
    'Description="R$RS\' $L 10\'x4\' squares of wet earth/dry earth/natural stone becomes mud/sand/clay"',
  'Solid Fog':
    'School=Conjuration ' +
    'Description="R$RM\' 20\'-radius fog obscures vision and half Speed/-2 damage/attack for $L min"',
  'Song Of Discord':
    'School=Enchantment ' +
    'Description="R$RM\' Creatures in 20\' radius 50% chance each rd to attack neighbor for $L rd (Will neg)"',
  'Soul Bind':
    'School=Necromancy ' +
    'Description="Imprisons soul dead le $L rd to prevent resurrection (Will neg)"',
  'Sound Burst':
    'School=Evocation ' +
    'Description="R$RS\' 10\' radius 1d8 HP/stunned (Fort neg)"',
  'Speak With Animals':
    'School=Divination ' +
    'Description="Self converse w/animals for $L min"',
  'Speak With Dead':
    'School=Necromancy ' +
    'Description="R10\' Corpse answer $Ldiv2 questions (Will neg)"',
  'Speak With Plants':
    'School=Divination ' +
    'Description="Self converse w/plants for $L min"',
  'Spectral Hand':
    'School=Necromancy ' +
    'Description="Self yield 1d4 HP to glowing hand to deliver touch attacks at +2 for $L min"',
  'Spell Immunity':
    'School=Abjuration ' +
    'Description="Touched immune to $Ldiv4 spells le 4th level for $L10 min"',
  'Greater Spell Immunity':
    'School=Abjuration ' +
    'Description="Touched immune to $Ldiv4 spells le 8th level for $L10 min"',
  'Spell Resistance':
    'School=Abjuration ' +
    'Description="Touched +$Lplus12 saves vs spells for $L min"',
  'Spell Turning':
    'School=Abjuration ' +
    'Description="Self reflect onto caster 1d4+6 non-touch spell levels for $L10 min"',
  'Spellstaff':
    'School=Transmutation ' +
    'Description="Store 1 spell in wooden quarterstaff (Will neg)"',
  'Spider Climb':
    'School=Transmutation ' +
    'Description="Touched climb walls/ceilings for $L10 min"',
  'Spike Growth':
    'School=Transmutation ' +
    'Description="R$RM\' Spikes on vegetation in 20\' sq 1d4 HP each 5\' movement, slowed 1 dy to half speed (Ref neg) for $L hr"',
  'Spike Stones':
    'School=Transmutation ' +
    'Description="R$RM\' Spikes on stony group in 20\' sq 1d8 HP each 5\' movement, slowed 1 dy to half speed (Ref neg) for $L hr"',
  'Spiritual Weapon':
    'School=Evocation ' +
    'Description="R$RM\' Force weapon (+BAB+Wis 1d8+$Ldiv3min5) attacks designated foes for $L rd"',
  'Statue':
    'School=Transmutation ' +
    'Description="Touched become statue at will for $L hr"',
  'Status':
    'School=Divination ' +
    'Description="Monitor condition/position of $Ldiv3 touched allies for $L hr"',
  'Stinking Cloud':
    'School=Conjuration ' +
    'Description="R$RM\' 20\'-radius fog obscures vision, 1d4+1 rd nausea (no attacks or spells) (Fort neg) for $L rd"',
  'Stone Shape':
    'School=Transmutation ' +
    'Description="Shape $Lplus10\' cu of stone"',
  'Stone Tell':
    'School=Divination ' +
    'Description="Self dialogue w/stone for $L min"',
  'Stone To Flesh':
    'School=Transmutation ' +
    'Description="R$RM\' Restore stoned creature (DC 15 Fort to survive) or make flesh 10\'x3\' stone cyclinder"',
  'Stoneskin':
    'School=Abjuration ' +
    'Description="Touched DR 10/adamantine for $L10min150 HP/$L min"',
  'Storm Of Vengeance':
    'School=Conjuration ' +
    'Description="R$RL\' 360\' radius storm deafen 1d4x10 min (Fort neg), then rain acid 1d6 HP, then 6 bolts lightning 10d6 (Ref half), then hail 5d6 HP, then dark 6 rd"',
  'Suggestion':
    'School=Enchantment ' +
    'Description="R$RS\' Target follow reasonable suggestion (Will neg)"',
  'Mass Suggestion':
    'School=Enchantment ' +
    'Description="R$RM\' $L targets follow reasonable suggestion (Will neg)"',
  'Summon Instrument':
    'School=Conjuration ' +
    'Description="Musical instrument appears for $L min"',
  'Summon Monster I':
    'School=Conjuration ' +
    'Description="R$RS\' 1 1st-level creature appears, fights foes for $L rd"',
  'Summon Monster II':
    'School=Conjuration ' +
    'Description="R$RS\' 1 2nd-/1d3 1st-level creature appears, fights foes for $L rd"',
  'Summon Monster III':
    'School=Conjuration ' +
    'Description="R$RS\' 1 3rd-/1d3 2nd-/1d4+1 1st-level creature appears, fights foes for $L rd"',
  'Summon Monster IV':
    'School=Conjuration ' +
    'Description="R$RS\' 1 4th-/1d3 3rd-/1d4+1 lower-level creature appears, fights foes for $L rd"',
  'Summon Monster V':
    'School=Conjuration ' +
    'Description="R$RS\' 1 5th-/1d3 4th-/1d4+1 lower-level creature appears, fights foes for $L rd"',
  'Summon Monster VI':
    'School=Conjuration ' +
    'Description="R$RS\' 1 6th-/1d3 5th-/1d4+1 lower-level creature appears, fights foes for $L rd"',
  'Summon Monster VII':
    'School=Conjuration ' +
    'Description="R$RS\' 1 7th-/1d3 6th-/1d4+1 lower-level creature appears, fights foes for $L rd"',
  'Summon Monster VIII':
    'School=Conjuration ' +
    'Description="R$RS\' 1 8th-/1d3 7th-/1d4+1 lower-level creature appears, fights foes for $L rd"',
  'Summon Monster IX':
    'School=Conjuration ' +
    'Description="R$RS\' 1 9th-/1d3 8th-/1d4+1 lower-level creature appears, fights foes for $L rd"',
  "Summon Nature's Ally I":
    'School=Conjuration ' +
    'Description="R$RS\' 1 1st-level creature appears, fights foes for $L rd"',
  "Summon Nature's Ally II":
    'School=Conjuration ' +
    'Description="R$RS\' 1 2nd-/1d3 1st-level creature appears, fights foes for $L rd"',
  "Summon Nature's Ally III":
    'School=Conjuration ' +
    'Description="R$RS\' 1 3rd-/1d3 2nd-/1d4+1 1st-level creature appears, fights foes for $L rd"',
  "Summon Nature's Ally IV":
    'School=Conjuration ' +
    'Description="R$RS\' 1 4th-/1d3 3rd-/1d4+1 lower-level creature appears, fights foes for $L rd"',
  "Summon Nature's Ally V":
    'School=Conjuration ' +
    'Description="R$RS\' 1 5th-/1d3 4th-/1d4+1 lower-level creature appears, fights foes for $L rd"',
  "Summon Nature's Ally VI":
    'School=Conjuration ' +
    'Description="R$RS\' 1 6th-/1d3 5th-/1d4+1 lower-level creature appears, fights foes for $L rd"',
  "Summon Nature's Ally VII":
    'School=Conjuration ' +
    'Description="R$RS\' 1 7th-/1d3 6th-/1d4+1 lower-level creature appears, fights foes for $L rd"',
  "Summon Nature's Ally VIII":
    'School=Conjuration ' +
    'Description="R$RS\' 1 8th-/1d3 7th-/1d4+1 lower-level creature appears, fights foes for $L rd"',
  "Summon Nature's Ally IX":
    'School=Conjuration ' +
    'Description="R$RS\' 1 9th-/1d3 8th-/1d4+1 lower-level creature appears, fights foes for $L rd"',
  'Summon Swarm':
    'School=Conjuration ' +
    'Description="R$RS\' Swarm of bats/rats/spiders obey for conc + 2 rd"',
  'Sunbeam':
    'School=Evocation ' +
    'Description="60\' beam blinds, 4d6 HP (undead ${Lmin20}d6) (Ref unblind/half) 1/rd for $Ldiv30min6 rd"',
  'Sunburst':
    'School=Evocation ' +
    'Description="R$RL\' 80\' radius blinds, 6d6 HP (undead ${Lmin25}d6) (Ref unblind/half)"',
  'Symbol Of Death':
    'School=Necromancy ' +
    'Description="R60\' Rune kills 150 HP of creatures (Fort neg) when triggered"',
  'Symbol Of Fear':
    'School=Necromancy ' +
    'Description="R60\' Rune panics creatures (Will neg) for $L rd when triggered"',
  'Symbol Of Insanity':
    'School=Enchantment ' +
    'Description="R60\' Rune makes creatures insane (Will neg) permanently when triggered"',
  'Symbol Of Pain':
    'School=Necromancy ' +
    'Description="R60\' Rune causes pain (-4 attack/skill/ability) (Fort neg) when triggered for $L10 min"',
  'Symbol Of Persuasion':
    'School=Enchantment ' +
    'Description="R60\' Rune charms creatures (Will neg) for $L hrs when triggered for $L10 min"',
  'Symbol Of Sleep':
    'School=Enchantment ' +
    'Description="R60\' Rune sleeps creatures (Will neg) le 10 HD for 3d6x10 min when triggered for $L10 min"',
  'Symbol Of Stunning':
    'School=Enchantment ' +
    'Description="R60\' Rune stuns creatures (Will neg) for 1d6 rd when triggered"',
  'Symbol Of Weakness':
    'School=Necromancy ' +
    'Description="R60\' Rune weakens creatures (3d6 Str) (Fort neg) permanently when triggered for $L10 min"',
  'Sympathetic Vibration':
    'School=Evocation ' +
    'Description="Touched structure 2d10 HP/rd for $L rd"',
  'Sympathy':
    'School=Enchantment ' +
    'Description="Named kind/alignment creatures drawn to $L10\' cube for $L2 hr (Will neg)"',

  'Telekinesis':
    'School=Transmutation ' +
    'Description="R$RL\' Move $L25min375 lb 20\' for $L rd, combat maneuver (CMB $L) $L rd, or hurl $Lmin15 objects $L25min375 lbs total (Will neg)"',
  'Telekinetic Sphere':
    'School=Evocation ' +
    'Description="R$RS\' Impassible $L\'-diameter sphere surrounds target, move 30\' to $RM\' away for $L min"',
  'Telepathic Bond':
    'School=Divination ' +
    'Description="R$RS\' Self share thoughts w/$Ldiv3 allies for $L10 min"',
  'Teleport':
    'School=Conjuration ' +
    'Description="Transport self, $Ldiv3 others $L100 mi w/some error chance"',
  'Greater Teleport':
    'School=Conjuration ' +
    'Description="Transport you, $Ldiv3 others anywhere w/no error chance"',
  'Teleport Object':
    'School=Conjuration ' +
    'Description="Transport touched object $L100 mi w/some error chance (Will neg)"',
  'Teleportation Circle':
    'School=Conjuration ' +
    'Description="Transport creatures in 5\' radius anywhere w/no error chance for $L10 min"',
  'Temporal Stasis':
    'School=Transmutation ' +
    'Description="Touched in permanent stasis (Fort neg)"',
  'Time Stop':
    'School=Transmutation ' +
    'Description="All others halt, invulnerable for 1d4+1 rd"',
  'Tiny Hut':
    'School=Evocation ' +
    'Description="20\' sphere resists elements for $L2 hr"',
  'Tongues':
    'School=Divination ' +
    'Description="Touched communicate in any language for $L10 min"',
  'Touch Of Fatigue':
    'School=Necromancy ' +
    'Description="Touch attack fatigues target for $L rd (Fort neg)"',
  'Touch Of Idiocy':
    'School=Enchantment ' +
    'Description="Touch attack 1d6 Int/Wis/Cha for $L10 min"',
  'Transformation':
    'School=Transmutation ' +
    'Description="Self +4 Str, Dex, Con, and AC, +5 Fort, martial prof, no spells for $L rd"',
  'Transmute Metal To Wood':
    'School=Transmutation ' +
    'Description="R$RL\' Metal 40\' radius becomes wood (-2 attack/damage/AC)"',
  'Transmute Mud To Rock':
    'School=Transmutation ' +
    'Description="R$RM\' $L2 10\' mud cubes become rock"',
  'Transmute Rock To Mud':
    'School=Transmutation ' +
    'Description="R$RM\' $L2 10\' natural rock cubes become mud"',
  'Transport Via Plants':
    'School=Transmutation ' +
    'Description="Self and $Ldiv3 willing targets teleport via like plants"',
  'Trap The Soul':
    'School=Conjuration ' +
    'Description="R$RS\' Target imprisoned in gem (Will neg)"',
  'Tree Shape':
    'School=Transmutation ' +
    'Description="Become tree for $L hr"',
  'Tree Stride':
    'School=Conjuration ' +
    'Description="Teleport 3000\' via like trees"',
  'True Resurrection':
    'School=Conjuration ' +
    'Description="Fully restore target dead $L10 yr"',
  'True Seeing':
    'School=Divination ' +
    'Description="Touched sees through 120\' darkness/illusion/invisible for $L min"',
  'True Strike':
    'School=Divination ' +
    'Description="Self +20 next attack"',

  'Undeath To Death':
    'School=Necromancy ' +
    'Description="R$RM\' ${Lmin20}d4 HD of creatures le 8 HD w/in 40\' destroyed (Will neg)"',
  'Undetectable Alignment':
    'School=Abjuration ' +
    'Description="R$RS\' Target alignment concealed for 1 dy (Will neg)"',
  'Unhallow':
    'School=Evocation ' +
    'Description="40\' radius warded against good, evokes bane spell"',
  'Unholy Aura':
    'School=Abjuration ' +
    'Description="$L creatures w/in 20\' +4 AC and saves, SR 25 vs. good spells, protected from possession, good hit 1d6 Str (Fort neg), for $L rd"',
  'Unholy Blight':
    'School=Evocation ' +
    'Description="R$RM\' Good w/in 20\'-radius burst ${Ldiv2min5}d8 HP and sickened 1d4 rd, neutral half (Will half)"',
  'Unseen Servant':
    'School=Conjuration ' +
    'Description="R$RS\' Invisible servant obey for $L hr"',

  'Vampiric Touch':
    'School=Necromancy ' +
    'Description="Touch attack $Ldiv2min10 HP, gain half as temporary HP for 1 hr"',
  'Veil':
    'School=Illusion ' +
    'Description="R$RL\' Targets in 30\' radius appear as other creatures for conc + $L hr (Will neg)"',
  'Ventriloquism':
    'School=Illusion ' +
    'Description="R$RS\' Self voice moves for $L min (Will disbelieve)"',
  'Virtue':
    'School=Transmutation ' +
    'Description="Touched +1 HP for 1 min"',
  'Vision':
    'School=Divination ' +
    'Description="Info about target person/place/object"',

  'Wail Of The Banshee':
    'School=Necromancy ' +
    'Description="R$RS\' $L targets w/in 40\' $L10 HP (Fort neg)"',
  'Wall Of Fire':
    'School=Evocation ' +
    'Description="R$RM\' $L20\' wall 2d4 HP w/in 10\', 1d4 HP w/in 20\', 2d6 HP transit (undead dbl) for conc + $L rd"',
  'Wall Of Force':
    'School=Evocation ' +
    'Description="R$RS\' Impassible/immobile $L x 10\' sq wall $L rd"',
  'Wall Of Ice':
    'School=Evocation ' +
    'Description="R$RM\' $L x 10\' x $L in ice wall or $Lplus3\' hemisphere for $L min"',
  'Wall Of Iron':
    'School=Conjuration ' +
    'Description="R$RM\' $L x 5\' $Ldiv4 inch thick permanent iron wall"',
  'Wall Of Stone':
    'School=Conjuration ' +
    'Description="R$RM\' $L x 5\' $Ldiv4 inch thick permanent stone wall"',
  'Wall Of Thorns':
    'School=Conjuration ' +
    'Description="R$RM\' $L x 10\' cube thorns (25-AC) HP/rd to transiters for $L10 min"',
  'Warp Wood':
    'School=Transmutation ' +
    'Description="R$RS\' $L wooden objects warped (Will neg)"',
  'Water Breathing':
    'School=Transmutation ' +
    'Description="Touched breathe underwater for $L2 hrs total"',
  'Water Walk':
    'School=Transmutation ' +
    'Description="$L touched tread on liquid as if solid for $L10 min"',
  'Waves Of Exhaustion':
    'School=Necromancy ' +
    'Description="60\' cone exhausted"',
  'Waves Of Fatigue':
    'School=Necromancy ' +
    'Description="30\' cone fatigued"',
  'Web':
    'School=Conjuration ' +
    'Description="R$RM\' 20\'-radius webs grapple (Ref neg), burn for 2d4 HP for $L10 min"',
  'Weird':
    'School=Illusion ' +
    'Description="R$RM\' Targets in 30\' radius fears create creature (Will neg), touch kills (Fort 3d6 HP/1d4 Str/stun 1 rd)"',
  'Whirlwind':
    'School=Evocation ' +
    'Description="R$RL\' 10\'-radius wind 1d8 HP/rd for $L rd (Ref neg)"',
  'Whispering Wind':
    'School=Transmutation ' +
    'Description="Send 25-word message $L mi to 10\' area"',
  'Wind Walk':
    'School=Transmutation ' +
    'Description="Self + $Ldiv3 touched vaporize and move 60 mph for $L hr"',
  'Wind Wall':
    'School=Evocation ' +
    'Description="R$RM\' $L10\'x5\' curtain of air scatters objects, deflects arrows/bolts for $L rd"',
  'Wish':
    'School=Universal ' +
    'Description="Alter reality, with few limits"',
  'Wood Shape':
    'School=Transmutation ' +
    'Description="Shape $Lplus10\' cu of wood (Will neg)"',
  'Word Of Chaos':
    'School=Evocation ' +
    'Description="Nonchaotic creatures w/in 40\' with equal/-1/-5/-10 HD deafened 1d4 rd/stunned 1 rd/confused 1d10 min/killed and banished (Will neg)"',
  'Word Of Recall':
    'School=Conjuration ' +
    'Description="Self + $Ldiv3 willing targets return to designated place"',

  'Zone Of Silence':
    'School=Illusion ' +
    'Description="No sound escapes 5\' radius around self for $L hr"',
  'Zone Of Truth':
    'School=Enchantment ' +
    'Description="R$RS\' Creatures w/in 20\' radius cannot lie for $L min (Will neg)"'

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
      '"1:Armor Proficiency (Medium)","1:Shield Proficiency (Heavy)",' +
      '"1:Weapon Proficiency (Martial)",' +
      '"1:Fast Movement",1:Illiteracy,1:Rage,"2:Uncanny Dodge","3:Trap Sense",'+
      '"5:Improved Uncanny Dodge","7:Damage Reduction","11:Greater Rage",' +
      '"14:Indomitable Will","17:Tireless Rage","20:Mighty Rage"',
  'Bard':
    'Require="alignment !~ \'Lawful\'" ' +
    'HitDie=d6 Attack=3/4 SkillPoints=6 Fortitude=1/3 Reflex=1/2 Will=1/2 ' +
    'Features=' +
      '"1:Armor Proficiency (Light)","1:Shield Proficiency (Heavy)",' +
      '"1:Weapon Proficiency (Simple/Longsword/Rapier/Sap/Short Sword/Short Bow/Whip)",' +
      '"1:Bardic Knowledge","1:Bardic Music","1:Simple Somatics",' +
      '"Max \'^skills.Perform \\(.*\\)$\' >= 3 ? 1:Countersong",' +
      '"Max \'^skills.Perform \\(.*\\)$\' >= 3 ? 1:Fascinate",' +
      '"Max \'^skills.Perform \\(.*\\)$\' >= 3 ? 1:Inspire Courage",' +
      '"Max \'^skills.Perform \\(.*\\)$\' >= 6 ? 3:Inspire Competence",' +
      '"Max \'^skills.Perform \\(.*\\)$\' >= 9 ? 6:Suggestion",' +
      '"Max \'^skills.Perform \\(.*\\)$\' >= 12 ? 9:Inspire Greatness",' +
      '"Max \'^skills.Perform \\(.*\\)$\' >= 15 ? 12:Song Of Freedom",' +
      '"Max \'^skills.Perform \\(.*\\)$\' >= 18 ? 15:Inspire Heroics",' +
      '"Max \'^skills.Perform \\(.*\\)$\' >= 21 ? 18:Mass Suggestion" ' +
    'CasterLevelArcane=levels.Bard ' +
    'SpellAbility=charisma ' +
    'SpellsPerDay=' +
      'B0:1=2;2=3;14=4,' +
      'B1:2=0;3=1;4=2;5=3;15=4,' +
      'B2:4=0;5=1;6=2;8=3;16=4,' +
      'B3:7=0;8=1;9=2;11=3;17=4,' +
      'B4:10=0;11=1;12=2;14=3;18=4,' +
      'B5:13=0;14=1;15=2;17=3;19=4,' +
      'B6:16=0;17=1;18=2;19=3;20=4 ' +
    'Spells=' +
      '"B0:Dancing Lights;Daze;Detect Magic;Flare;Ghost Sound;Know Direction;' +
      'Light;Lullaby;Mage Hand;Mending;Message;Open/Close;Prestidigitation;' +
      'Read Magic;Resistance;Summon Instrument",' +
      '"B1:Alarm;Animate Rope;Cause Fear;Charm Person;Comprehend Languages;' +
      'Cure Light Wounds;Detect Secret Doors;Disguise Self;Erase;' +
      'Expeditious Retreat;Feather Fall;Grease;Hideous Laughter;Hypnotism;' +
      'Identify;Lesser Confusion;Magic Mouth;Magic Aura;Obscure Object;' +
      'Remove Fear;Silent Image;Sleep;Summon Monster I;' +
      'Undetectable Alignment;Unseen Servant;Ventriloquism",' +
      '"B2:Alter Self;Animal Messenger;Animal Trance;Blindness/Deafness;Blur;' +
      'Calm Emotions;Cat\'s Grace;Cure Moderate Wounds;Darkness;Daze Monster;' +
      'Delay Poison;Detect Thoughts;Eagle\'s Splendor;Enthrall;' +
      'Fox\'s Cunning;Glitterdust;Heroism;Hold Person;Hypnotic Pattern;' +
      'Invisibility;Locate Object;Minor Image;Mirror Image;Misdirection;' +
      'Pyrotechnics;Rage;Scare;Shatter;Silence;Sound Burst;Suggestion;' +
      'Summon Monster II;Summon Swarm;Tongues;Whispering Wind",' +
      '"B3:Blink;Charm Monster;Clairaudience/Clairvoyance;Confusion;' +
      'Crushing Despair;Cure Serious Wounds;Daylight;Deep Slumber;' +
      'Dispel Magic;Displacement;Fear;Gaseous Form;Glibness;Good Hope;Haste;' +
      'Illusory Script;Invisibility Sphere;Lesser Geas;Major Image;' +
      'Phantom Steed;Remove Curse;Scrying;Sculpt Sound;Secret Page;' +
      'See Invisibility;Sepia Snake Sigil;Slow;Speak With Animals;' +
      'Summon Monster III;Tiny Hut",' +
      '"B4:Break Enchantment;Cure Critical Wounds;Detect Scrying;' +
      'Dimension Door;Dominate Person;Freedom Of Movement;' +
      'Hallucinatory Terrain;Hold Monster;Greater Invisibility;Legend Lore;' +
      'Locate Creature;Modify Memory;Neutralize Poison;Rainbow Pattern;' +
      'Repel Vermin;Secure Shelter;Shadow Conjuration;Shout;' +
      'Speak With Plants;Summon Monster IV;Zone Of Silence",' +
      '"B5:Dream;False Vision;Greater Dispel Magic;Greater Heroism;' +
      'Mass Cure Light Wounds;Mass Suggestion;Mind Fog;Mirage Arcana;Mislead;' +
      'Nightmare;Persistent Image;Seeming;Shadow Evocation;Shadow Walk;' +
      'Song Of Discord;Summon Monster V",' +
      '"B6:Analyze Dweomer;Animate Objects;Eyebite;Find The Path;Geas/Quest;' +
      'Greater Scrying;Greater Shout;Heroes\' Feast;Irresistible Dance;' +
      'Mass Cat\'s Grace;Mass Charm Monster;Mass Cure Moderate Wounds;' +
      'Mass Eagle\'s Splendor;Mass Fox\'s Cunning;Permanent Image;' +
      'Programmed Image;Project Image;Summon Monster VI;' +
      'Sympathetic Vibration;Veil"',
  'Cleric':
    'HitDie=d8 Attack=3/4 SkillPoints=2 Fortitude=1/2 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Armor Proficiency (Heavy)","1:Shield Proficiency (Heavy)",' +
      '"1:Weapon Proficiency (Simple)",' +
      '1:Aura,"1:Spontaneous Cleric Spell","1:Turn Undead" '+
    'Selectables=' +
      QuilvynUtils.getKeys(SRD35.DOMAINS).map(x => '"deityDomains =~ \'' + x + '\' ? 1:' + x + ' Domain"').join(',') + ' ' +
    'CasterLevelDivine=levels.Cleric ' +
    'SpellAbility=wisdom ' +
    'SpellsPerDay=' +
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
      'Dom1:1=1,' +
      'Dom2:3=1,' +
      'Dom3:5=1,' +
      'Dom4:7=1,' +
      'Dom5:9=1,' +
      'Dom6:11=1,' +
      'Dom7:13=1,' +
      'Dom8:15=1,' +
      'Dom9:17=1 ' +
    'Spells=' +
      '"C0:Create Water;Cure Minor Wounds;Detect Magic;Detect Poison;' +
      'Guidance;Inflict Minor Wounds;Light;Mending;Purify Food And Drink;' +
      'Read Magic;Resistance;Virtue",' +
      '"C1:Bane;Bless;Bless Water;Cause Fear;Command;Comprehend Languages;' +
      'Cure Light Wounds;Curse Water;Deathwatch;Detect Chaos;Detect Evil;' +
      'Detect Good;Detect Law;Detect Undead;Divine Favor;Doom;' +
      'Endure Elements;Entropic Shield;Hide From Undead;Inflict Light Wounds;' +
      'Magic Stone;Magic Weapon;Obscuring Mist;Protection From Chaos;' +
      'Protection From Evil;Protection From Good;Protection From Law;' +
      'Remove Fear;Sanctuary;Shield Of Faith;Summon Monster I",' +
      '"C2:Aid;Align Weapon;Augury;Bear\'s Endurance;Bull\'s Strength;' +
      'Calm Emotions;Consecrate;Cure Moderate Wounds;Darkness;Death Knell;' +
      'Delay Poison;Desecrate;Eagle\'s Splendor;Enthrall;Find Traps;' +
      'Gentle Repose;Hold Person;Inflict Moderate Wounds;Lesser Restoration;' +
      'Make Whole;Owl\'s Wisdom;Remove Paralysis;Resist Energy;Shatter;' +
      'Shield Other;Silence;Sound Burst;Spiritual Weapon;Status;' +
      'Summon Monster II;Undetectable Alignment;Zone Of Truth",' +
      '"C3:Animate Dead;Bestow Curse;Blindness/Deafness;Contagion;' +
      'Continual Flame;Create Food And Water;Cure Serious Wounds;Daylight;' +
      'Deeper Darkness;Dispel Magic;Glyph Of Warding;Helping Hand;' +
      'Inflict Serious Wounds;Invisibility Purge;Locate Object;' +
      'Magic Circle Against Chaos;Magic Circle Against Evil;' +
      'Magic Circle Against Good;Magic Circle Against Law;Magic Vestment;' +
      'Meld Into Stone;Obscure Object;Prayer;Protection From Energy;' +
      'Remove Blindness/Deafness;Remove Curse;Remove Disease;Searing Light;' +
      'Speak With Dead;Stone Shape;Summon Monster III;Water Breathing;' +
      'Water Walk;Wind Wall",' +
      '"C4:Air Walk;Control Water;Cure Critical Wounds;Death Ward;' +
      'Dimensional Anchor;Discern Lies;Dismissal;Divination;Divine Power;' +
      'Freedom Of Movement;Giant Vermin;Greater Magic Weapon;' +
      'Imbue With Spell Ability;Inflict Critical Wounds;Lesser Planar Ally;' +
      'Neutralize Poison;Poison;Repel Vermin;Restoration;Sending;' +
      'Spell Immunity;Summon Monster IV;Tongues",' +
      '"C5:Atonement;Break Enchantment;Commune;Dispel Chaos;Dispel Evil;' +
      'Dispel Good;Dispel Law;Disrupting Weapon;Flame Strike;' +
      'Greater Command;Hallow;Insect Plague;Mark Of Justice;' +
      'Mass Cure Light Wounds;Mass Inflict Light Wounds;Plane Shift;' +
      'Raise Dead;Righteous Might;Scrying;Slay Living;Spell Resistance;' +
      'Summon Monster V;Symbol Of Pain;Symbol Of Sleep;True Seeing;Unhallow;' +
      'Wall Of Stone",' +
      '"C6:Animate Objects;Antilife Shell;Banishment;Blade Barrier;' +
      'Create Undead;Find The Path;Forbiddance;Geas/Quest;' +
      'Greater Dispel Magic;Greater Glyph Of Warding;Harm;Heal;' +
      'Heroes\' Feast;Mass Bear\'s Endurance;Mass Bull\'s Strength;' +
      'Mass Cure Moderate Wounds;Mass Eagle\'s Splendor;' +
      'Mass Inflict Moderate Wounds;Mass Owl\'s Wisdom;Planar Ally;' +
      'Summon Monster VI;Symbol Of Fear;Symbol Of Persuasion;' +
      'Undeath To Death;Wind Walk;Word Of Recall",' +
      '"C7:Blasphemy;Control Weather;Destruction;Dictum;Ethereal Jaunt;' +
      'Greater Restoration;Greater Scrying;Holy Word;' +
      'Mass Cure Serious Wounds;Mass Inflict Serious Wounds;Refuge;' +
      'Regenerate;Repulsion;Resurrection;Summon Monster VII;' +
      'Symbol Of Stunning;Symbol Of Weakness;Word Of Chaos",' +
      '"C8:Antimagic Field;Cloak Of Chaos;Create Greater Undead;' +
      'Dimensional Lock;Discern Location;Earthquake;Fire Storm;' +
      'Greater Planar Ally;Greater Spell Immunity;Holy Aura;' +
      'Mass Cure Critical Wounds;Mass Inflict Critical Wounds;Shield Of Law;' +
      'Summon Monster VIII;Symbol Of Death;Symbol Of Insanity",' +
      '"C9:Astral Projection;Energy Drain;Etherealness;Gate;Implosion;' +
      'Mass Heal;Miracle;Soul Bind;Storm Of Vengeance;Summon Monster IX;' +
      'True Resurrection;Unholy Aura"',
  'Druid':
    'Require=' +
      '"alignment =~ \'Neutral\'",' +
      '"armor =~ \'None|Hide|Leather|Padded\'",' +
      '"shield =~ \'None|Wooden\'" ' +
    'HitDie=d8 Attack=3/4 SkillPoints=4 Fortitude=1/2 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Armor Proficiency (Heavy)","1:Shield Proficiency (Heavy)",' +
      '"1:Weapon Proficiency (Club/Dagger/Dart/Quarterstaff/Scimitar/Sickle/Short Spear/Sling/Spear)",' +
      '"1:Animal Companion","1:Nature Sense","1:Spontaneous Druid Spell",' +
      '"1:Wild Empathy","2:Woodland Stride","3:Trackless Step",' +
      '"4:Resist Nature\'s Lure","5:Wild Shape","9:Venom Immunity",' +
      '"13:Thousand Faces","15:Timeless Body","16:Elemental Shape" ' +
    'Languages=Druidic ' +
    'CasterLevelDivine=levels.Druid ' +
    'SpellAbility=wisdom ' +
    'SpellsPerDay=' +
      'D0:1=3;2=4;4=5;7=6,' +
      'D1:1=1;2=2;4=3;7=4;11=5,' +
      'D2:3=1;4=2;6=3;9=4;13=5,' +
      'D3:5=1;6=2;8=3;11=4;15=5,' +
      'D4:7=1;8=2;10=3;13=4;17=5,' +
      'D5:9=1;10=2;12=3;15=4;19=5,' +
      'D6:11=1;12=2;14=3;17=4,' +
      'D7:13=1;14=2;16=3;19=4,' +
      'D8:15=1;16=2;18=3;20=4,' +
      'D9:17=1;18=2;19=3;20=4 ' +
    'Spells=' +
      '"D0:Create Water;Cure Minor Wounds;Detect Magic;Detect Poison;Flare;' +
      'Guidance;Know Direction;Light;Mending;Purify Food And Drink;' +
      'Read Magic;Resistance;Virtue",' +
      '"D1:Calm Animals;Charm Animal;Cure Light Wounds;' +
      'Detect Animals Or Plants;Detect Snares And Pits;Endure Elements;' +
      'Entangle;Faerie Fire;Goodberry;Hide From Animals;Jump;Longstrider;' +
      'Magic Fang;Magic Stone;Obscuring Mist;Pass Without Trace;' +
      'Produce Flame;Shillelagh;Speak With Animals;Summon Nature\'s Ally I",' +
      '"D2:Animal Messenger;Animal Trance;Barkskin;Bear\'s Endurance;' +
      'Bull\'s Strength;Cat\'s Grace;Chill Metal;Delay Poison;Fire Trap;' +
      'Flame Blade;Flaming Sphere;Fog Cloud;Gust Of Wind;Heat Metal;' +
      'Hold Animal;Lesser Restoration;Owl\'s Wisdom;Reduce Animal;' +
      'Resist Energy;Soften Earth And Stone;Spider Climb;' +
      'Summon Nature\'s Ally II;Summon Swarm;Tree Shape;Warp Wood;' +
      'Wood Shape",' +
      '"D3:Call Lightning;Contagion;Cure Moderate Wounds;Daylight;' +
      'Diminish Plants;Dominate Animal;Greater Magic Fang;Meld Into Stone;' +
      'Neutralize Poison;Plant Growth;Poison;Protection From Energy;Quench;' +
      'Remove Disease;Sleet Storm;Snare;Speak With Plants;Spike Growth;' +
      'Stone Shape;Summon Nature\'s Ally III;Water Breathing;Wind Wall",' +
      '"D4:Air Walk;Antiplant Shell;Blight;Command Plants;Control Water;' +
      'Cure Serious Wounds;Dispel Magic;Flame Strike;Freedom Of Movement;' +
      'Giant Vermin;Ice Storm;Reincarnate;Repel Vermin;Rusting Grasp;Scrying;' +
      'Spike Stones;Summon Nature\'s Ally IV",' +
      '"D5:Animal Growth;Atonement;Awaken;Baleful Polymorph;' +
      'Call Lightning Storm;Commune With Nature;Control Winds;' +
      'Cure Critical Wounds;Death Ward;Hallow;Insect Plague;Stoneskin;' +
      'Summon Nature\'s Ally V;Transmute Mud To Rock;Transmute Rock To Mud;' +
      'Tree Stride;Unhallow;Wall Of Fire;Wall Of Thorns",' +
      '"D6:Antilife Shell;Find The Path;Fire Seeds;Greater Dispel Magic;' +
      'Ironwood;Liveoak;Mass Bear\'s Endurance;Mass Bull\'s Strength;' +
      'Mass Cat\'s Grace;Mass Cure Light Wounds;Mass Owl\'s Wisdom;' +
      'Move Earth;Repel Wood;Spellstaff;Stone Tell;Summon Nature\'s Ally VI;' +
      'Transport Via Plants;Wall Of Stone",' +
      '"D7:Animate Plants;Changestaff;Control Weather;Creeping Doom;' +
      'Cure Moderate Wounds;Fire Storm;Greater Scrying;Heal;' +
      'Summon Nature\'s Ally VII;Sunbeam;Transmute Metal To Wood;' +
      'True Seeing;Wind Walk",' +
      '"D8:Animal Shapes;Control Plants;Earthquake;Finger Of Death;' +
      'Mass Cure Serious Wounds;Repel Metal Or Stone;Reverse Gravity;' +
      'Summon Nature\'s Ally VIII;Sunburst;Whirlwind",' +
      '"D9:Antipathy;Elemental Swarm;Foresight;Mass Cure Critical Wounds;' +
      'Regenerate;Shambler;Shapechange;Storm Of Vengeance;' +
      'Summon Nature\'s Ally IX;Sympathy;Word Of Recall"',
  'Fighter':
    'HitDie=d10 Attack=1 SkillPoints=2 Fortitude=1/2 Reflex=1/3 Will=1/3 ' +
    'Features=' +
      '"1:Armor Proficiency (Heavy)","1:Shield Proficiency (Tower)",' +
      '"1:Weapon Proficiency (Martial)"',
  'Monk':
    'Require="alignment =~ \'Lawful\'" ' +
    'Imply="armor == \'None\'","shield == \'None\'" ' +
    'HitDie=d8 Attack=3/4 SkillPoints=4 Fortitude=1/2 Reflex=1/2 Will=1/2 ' +
    'Features=' +
      '"1:Weapon Proficiency (Club/Dagger/Handaxe/Heavy Crossbow/Javelin/Kama/Light Crossbow/Nunchaku/Quarterstaff/Sai/Shuriken/Siangham/Sling)",' +
      '"1:Armor Class Bonus","1:Flurry Of Blows","1:Improved Unarmed Strike",' +
      '"1:Increased Unarmed Damage",2:Evasion,"3:Unarmored Speed Bonus",' +
      '"3:Still Mind","4:Ki Strike","4:Slow Fall","5:Purity Of Body",' +
      '"7:Wholeness Of Body","9:Improved Evasion","10:Lawful Ki Strike",' +
      '"11:Diamond Body","11:Greater Flurry","12:Abundant Step",' +
      '"13:Diamond Soul","15:Quivering Palm","16:Adamantine Ki Strike",' +
      '"17:Timeless Body","17:Tongue Of The Sun And Moon","19:Empty Body",' +
      '"20:Perfect Self" ' +
    'Selectables=' +
      '"1:Improved Grapple","1:Stunning Fist","2:Combat Reflexes",' +
      '"2:Deflect Arrows","6:Improved Disarm","6:Improved Trip" ' +
    'CasterLevelArcane="levels.Monk < 12 ? null : Math.floor(levels.Monk/2)" ' +
    'SpellAbility=intelligence ' +
    'SpellsPerDay=' +
      'Monk4:12=1,' +
      'Monk9:19=1 ' +
    'Spells=' +
      '"Monk4:Dimension Door",' +
      'Monk9:Etherealness',
  'Paladin':
    'Require="alignment == \'Lawful Good\'" ' +
    'HitDie=d10 Attack=1 SkillPoints=2 Fortitude=1/2 Reflex=1/3 Will=1/3 ' +
    'Features=' +
      '"1:Armor Proficiency (Heavy)","1:Shield Proficiency (Heavy)",' +
      '"1:Weapon Proficiency (Martial)",' +
      '1:Aura,"1:Detect Evil","1:Smite Evil","2:Divine Grace",' +
      '"2:Lay On Hands","3:Aura Of Courage","3:Divine Health","4:Turn Undead",'+
      '"5:Special Mount","6:Remove Disease" ' +
    'CasterLevelDivine="levels.Paladin < 4 ? null : Math.floor(levels.Paladin/2)" ' +
    'SpellAbility=wisdom ' +
    'SpellsPerDay=' +
      'P1:4=0;6=1;14=2;18=3,' +
      'P2:8=0;10=1;16=2;19=3,' +
      'P3:11=0;12=1;17=2;19=3,' +
      'P4:14=0;15=1;19=2;20=3 ' +
    'Spells=' +
      '"P1:Bless;Bless Water;Bless Weapon;Create Water;Cure Light Wounds;' +
      'Detect Poison;Detect Undead;Divine Favor;Endure Elements;' +
      'Lesser Restoration;Magic Weapon;Protection From Chaos;' +
      'Protection From Evil;Read Magic;Resistance;Virtue",' +
      '"P2:Bull\'s Strength;Delay Poison;Eagle\'s Splendor;Owl\'s Wisdom;' +
      'Remove Paralysis;Resist Energy;Shield Other;Undetectable Alignment;' +
      'Zone Of Truth",' +
      '"P3:Cure Moderate Wounds;Daylight;Discern Lies;Dispel Magic;' +
      'Greater Magic Weapon;Heal Mount;Magic Circle Against Chaos;' +
      'Magic Circle Against Evil;Prayer;Remove Blindness/Deafness;' +
      'Remove Curse",' +
      '"P4:Break Enchantment;Cure Serious Wounds;Death Ward;Dispel Chaos;' +
      'Dispel Evil;Holy Sword;Mark Of Justice;Neutralize Poison;Restoration"',
  'Ranger':
    'HitDie=d8 Attack=1 SkillPoints=6 Fortitude=1/2 Reflex=1/2 Will=1/3 ' +
    'Features=' +
      '"1:Armor Proficiency (Light)","1:Shield Proficiency (Heavy)",' +
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
    'SpellsPerDay=' +
      'R1:4=0;6=1;14=2;18=3,' +
      'R2:8=0;10=1;16=2;19=3,' +
      'R3:11=0;12=1;17=2;19=3,' +
      'R4:14=0;15=1;19=2;20=3 ' +
    'Spells=' +
      '"R1:Alarm;Animal Messenger;Calm Animals;Charm Animal;Delay Poison;' +
      'Detect Animals Or Plants;Detect Poison;Detect Snares And Pits;' +
      'Endure Elements;Entangle;Hide From Animals;Jump;Longstrider;' +
      'Magic Fang;Pass Without Trace;Read Magic;Resist Energy;' +
      'Speak With Animals;Summon Nature\'s Ally I",' +
      '"R2:Barkskin;Bear\'s Endurance;Cat\'s Grace;Cure Light Wounds;' +
      'Hold Animal;Owl\'s Wisdom;Protection From Energy;Snare;' +
      'Speak With Plants;Spike Growth;Summon Nature\'s Ally II;Wind Wall",' +
      '"R3:Command Plants;Cure Moderate Wounds;Darkvision;Diminish Plants;' +
      'Greater Magic Fang;Neutralize Poison;Plant Growth;Reduce Animal;' +
      'Remove Disease;Repel Vermin;Summon Nature\'s Ally III;Tree Shape;' +
      'Water Walk",' +
      '"R4:Animal Growth;Commune With Nature;Cure Serious Wounds;' +
      'Freedom Of Movement;Nondetection;Summon Nature\'s Ally IV;Tree Stride"',
  'Rogue':
    'HitDie=d6 Attack=3/4 SkillPoints=8 Fortitude=1/3 Reflex=1/2 Will=1/3 ' +
    'Features=' +
      '"1:Armor Proficiency (Light)",' +
      '"1:Weapon Proficiency (Simple/Hand Crossbow/Rapier/Shortbow/Short Sword)",' +
      '"1:Sneak Attack",1:Trapfinding,2:Evasion,"3:Trap Sense",' +
      '"4:Uncanny Dodge","8:Improved Uncanny Dodge" ' +
    'Selectables=' +
      '"10:Crippling Strike","10:Defensive Roll","10:Feat Bonus",' +
      '"10:Improved Evasion",10:Opportunist,"10:Skill Mastery",' +
      '"10:Slippery Mind"',
  'Sorcerer':
    'HitDie=d4 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Weapon Proficiency (Simple)",1:Familiar ' +
    'CasterLevelArcane=levels.Sorcerer ' +
    'SpellAbility=charisma ' +
    'SpellsPerDay=' +
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
      '1:Familiar,"1:Scribe Scroll" ' +
    'Selectables=' +
      QuilvynUtils.getKeys(SRD35.SCHOOLS).map(x => '"1:School Specialization (' + (x == 'Universal' ? 'None' : x) + ')"').join(',') + ',' +
      QuilvynUtils.getKeys(SRD35.SCHOOLS).filter(x => x != 'Universal' && x != 'Divination').map(x => '"1:School Opposition (' + x + ')"').join(',') + ' ' +
    'CasterLevelArcane=levels.Wizard ' +
    'SpellAbility=intelligence ' +
    'SpellsPerDay=' +
      'W0:1=3;2=4,' +
      'W1:1=1;2=2;4=3;7=4,' +
      'W2:3=1;4=2;6=3;9=4,' +
      'W3:5=1;6=2;8=3;11=4,' +
      'W4:7=1;8=2;10=3;13=4,' +
      'W5:9=1;10=2;12=3;15=4,' +
      'W6:11=1;12=2;14=3;17=4,' +
      'W7:13=1;14=2;16=3;19=4,' +
      'W8:15=1;16=2;18=3;20=4,' +
      'W9:17=1;18=2;19=3;20=4 ' +
    'Spells=' +
      '"W0:Acid Splash;Arcane Mark;Dancing Lights;Daze;Detect Magic;' +
      'Detect Poison;Disrupt Undead;Flare;Ghost Sound;Light;Mage Hand;' +
      'Mending;Message;Open/Close;Prestidigitation;Ray Of Frost;Read Magic;' +
      'Resistance;Touch Of Fatigue",' +
      '"W1:Alarm;Animate Rope;Burning Hands;Cause Fear;Charm Person;' +
      'Chill Touch;Color Spray;Comprehend Languages;Detect Secret Doors;' +
      'Detect Undead;Disguise Self;Endure Elements;Enlarge Person;Erase;' +
      'Expeditious Retreat;Feather Fall;Floating Disk;Grease;Hold Portal;' +
      'Hypnotism;Identify;Jump;Mage Armor;Magic Aura;Magic Missile;' +
      'Magic Weapon;Mount;Obscuring Mist;Protection From Chaos;' +
      'Protection From Evil;Protection From Good;Protection From Law;' +
      'Ray Of Enfeeblement;Reduce Person;Shield;Shocking Grasp;Silent Image;' +
      'Sleep;Summon Monster I;True Strike;Unseen Servant;Ventriloquism",' +
      '"W2:Acid Arrow;Alter Self;Arcane Lock;Bear\'s Endurance;' +
      'Blindness/Deafness;Blur;Bull\'s Strength;Cat\'s Grace;Command Undead;' +
      'Continual Flame;Darkness;Darkvision;Daze Monster;Detect Thoughts;' +
      'Eagle\'s Splendor;False Life;Flaming Sphere;Fog Cloud;Fox\'s Cunning;' +
      'Ghoul Touch;Glitterdust;Gust Of Wind;Hideous Laughter;' +
      'Hypnotic Pattern;Invisibility;Knock;Levitate;Locate Object;' +
      'Magic Mouth;Minor Image;Mirror Image;Misdirection;Obscure Object;' +
      'Owl\'s Wisdom;Phantom Trap;Protection From Arrows;Pyrotechnics;' +
      'Resist Energy;Rope Trick;Scare;Scorching Ray;See Invisibility;Shatter;' +
      'Spectral Hand;Spider Climb;Summon Monster II;Summon Swarm;' +
      'Touch Of Idiocy;Web;Whispering Wind",' +
      '"W3:Arcane Sight;Blink;Clairaudience/Clairvoyance;Daylight;' +
      'Deep Slumber;Dispel Magic;Displacement;Explosive Runes;Fireball;' +
      'Flame Arrow;Fly;Gaseous Form;Gentle Repose;Greater Magic Weapon;' +
      'Halt Undead;Haste;Heroism;Hold Person;Illusory Script;' +
      'Invisibility Sphere;Keen Edge;Lightning Bolt;' +
      'Magic Circle Against Chaos;Magic Circle Against Evil;' +
      'Magic Circle Against Good;Magic Circle Against Law;Major Image;' +
      'Nondetection;Phantom Steed;Protection From Energy;Rage;' +
      'Ray Of Exhaustion;Secret Page;Sepia Snake Sigil;Shrink Item;' +
      'Sleet Storm;Slow;Stinking Cloud;Suggestion;Summon Monster III;' +
      'Tiny Hut;Tongues;Vampiric Touch;Water Breathing;Wind Wall",' +
      '"W4:Animate Dead;Arcane Eye;Bestow Curse;Black Tentacles;' +
      'Charm Monster;Confusion;Contagion;Crushing Despair;Detect Scrying;' +
      'Dimension Door;Dimensional Anchor;Enervation;Fear;Fire Shield;' +
      'Fire Trap;Greater Invisibility;Hallucinatory Terrain;Ice Storm;' +
      'Illusory Wall;Lesser Geas;Lesser Globe Of Invulnerability;' +
      'Locate Creature;Mass Enlarge Person;Mass Reduce Person;Minor Creation;' +
      'Mnemonic Enhancer;Phantasmal Killer;Polymorph;Rainbow Pattern;' +
      'Remove Curse;Resilient Sphere;Scrying;Secure Shelter;' +
      'Shadow Conjuration;Shout;Solid Fog;Stone Shape;Stoneskin;' +
      'Summon Monster IV;Wall Of Fire;Wall Of Ice",' +
      '"W5:Animal Growth;Baleful Polymorph;Blight;Break Enchantment;' +
      'Cloudkill;Cone Of Cold;Contact Other Plane;Dismissal;Dominate Person;' +
      'Dream;Fabricate;False Vision;Feeblemind;Hold Monster;Interposing Hand;' +
      'Lesser Planar Binding;Mage\'s Faithful Hound;Mage\'s Private Sanctum;' +
      'Magic Jar;Major Creation;Mind Fog;Mirage Arcana;Nightmare;' +
      'Overland Flight;Passwall;Permanency;Persistent Image;Prying Eyes;' +
      'Secret Chest;Seeming;Sending;Shadow Evocation;Summon Monster V;' +
      'Symbol Of Pain;Symbol Of Sleep;Telekinesis;Telepathic Bond;Teleport;' +
      'Transmute Mud To Rock;Transmute Rock To Mud;Wall Of Force;' +
      'Wall Of Stone;Waves Of Fatigue",' +
      '"W6:Acid Fog;Analyze Dweomer;Antimagic Field;Chain Lightning;' +
      'Circle Of Death;Contingency;Control Water;Create Undead;Disintegrate;' +
      'Eyebite;Flesh To Stone;Forceful Hand;Freezing Sphere;Geas/Quest;' +
      'Globe Of Invulnerability;Greater Dispel Magic;Greater Heroism;' +
      'Guards And Wards;Legend Lore;Mage\'s Lucubration;' +
      'Mass Bear\'s Endurance;Mass Bull\'s Strength;Mass Cat\'s Grace;' +
      'Mass Eagle\'s Splendor;Mass Fox\'s Cunning;Mass Owl\'s Wisdom;' +
      'Mass Suggestion;Mislead;Move Earth;Permanent Image;Planar Binding;' +
      'Programmed Image;Repulsion;Shadow Walk;Stone To Flesh;' +
      'Summon Monster VI;Symbol Of Fear;Symbol Of Persuasion;Transformation;' +
      'True Seeing;Undeath To Death;Veil;Wall Of Iron",' +
      '"W7:Banishment;Control Undead;Control Weather;Delayed Blast Fireball;' +
      'Ethereal Jaunt;Finger Of Death;Forcecage;Grasping Hand;' +
      'Greater Arcane Sight;Greater Scrying;Greater Shadow Conjuration;' +
      'Greater Teleport;Insanity;Instant Summons;Limited Wish;' +
      'Mage\'s Magnificent Mansion;Mage\'s Sword;Mass Hold Person;' +
      'Mass Invisibility;Phase Door;Plane Shift;Power Word Blind;' +
      'Prismatic Spray;Project Image;Reverse Gravity;Sequester;Simulacrum;' +
      'Spell Turning;Statue;Summon Monster VII;Symbol Of Stunning;' +
      'Symbol Of Weakness;Teleport Object;Vision;Waves Of Exhaustion",' +
      '"W8:Antipathy;Binding;Clenched Fist;Clone;Create Greater Undead;' +
      'Demand;Dimensional Lock;Discern Location;Greater Planar Binding;' +
      'Greater Prying Eyes;Greater Shadow Evocation;Greater Shout;' +
      'Horrid Wilting;Incendiary Cloud;Iron Body;Irresistible Dance;' +
      'Mass Charm Monster;Maze;Mind Blank;Moment Of Prescience;Polar Ray;' +
      'Polymorph Any Object;Power Word Stun;Prismatic Wall;' +
      'Protection From Spells;Scintillating Pattern;Screen;' +
      'Summon Monster VIII;Sunburst;Symbol Of Death;Symbol Of Insanity;' +
      'Sympathy;Telekinetic Sphere;Temporal Stasis;Trap The Soul",' +
      '"W9:Astral Projection;Crushing Hand;Dominate Monster;Energy Drain;' +
      'Etherealness;Foresight;Freedom;Gate;Imprisonment;Mage\'s Disjunction;' +
      'Mass Hold Monster;Meteor Swarm;Power Word Kill;Prismatic Sphere;' +
      'Refuge;Shades;Shapechange;Soul Bind;Summon Monster IX;' +
      'Teleportation Circle;Time Stop;Wail Of The Banshee;Weird;Wish"'
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
    rules.defineRule(ability, ability + 'Adjust', '+', null);
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

  for(var companion in companions) {
    rules.choiceRules
      (rules, 'Animal Companion', companion, companions[companion]);
  }
  for(var familiar in familiars) {
    rules.choiceRules(rules, 'Familiar', familiar, familiars[familiar]);
  }

  rules.defineChoice('notes',
    'animalCompanionStats.Melee:+%V %1%2%3%4',
    'animalCompanionStats.SR:DC %V',
    'familiarStats.Melee:+%V %1',
    'familiarStats.SR:DC %V'
  );

  var features = [
    '1:Link', '1:Share Spells', '3:Companion Evasion', '6:Devotion',
    '9:Multiattack', '15:Companion Improved Evasion'
  ];
  SRD35.featureListRules
    (rules, features, 'Animal Companion', 'companionMasterLevel', false);

  rules.defineRule('animalCompanionStats.AC',
    'companionMasterLevel', '+', 'Math.floor(source / 3) * 2',
    'companionACBoosts', '+', 'Math.floor(source)'
  );
  rules.defineRule('animalCompanionStats.Dex',
    'companionMasterLevel', '+', 'Math.floor(source / 3)'
  );
  rules.defineRule('animalCompanionStats.Fort',
    'animalCompanionStats.HD', '=', SRD35.SAVE_BONUS_HALF,
    'animalCompanionStats.Con', '+', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule('animalCompanionStats.HD',
    'companionMasterLevel', '+', 'Math.floor(source / 3) * 2'
  );
  rules.defineRule
    ('animalCompanionStats.HP', 'companionHP', '=', 'Math.floor(source)');
  rules.defineRule('animalCompanionStats.Init',
    'animalCompanionStats.Dex', '=', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule
    ('animalCompanionStats.Melee', 'companionAttack', '=', 'source');
  rules.defineRule('animalCompanionStats.Melee.2',
    'companionDamAdj1', '=', 'source == 0 ? "" : source > 0 ? "+" + source : source',
  );
  // Default no second attack; overridden for specific animal companions
  rules.defineRule('animalCompanionStats.Melee.3',
    'animalCompanionStats.Melee', '?', null,
    '', '=', '""'
  );
  rules.defineRule('animalCompanionStats.Melee.4',
    'companionDamAdj2', '=', 'source == 0 ? "" : source > 0 ? "+" + source : source',
    'animalCompanionStats.Melee.3', '=', 'source == "" ? "" : null'
  );
  rules.defineRule('animalCompanionStats.Ref',
    'animalCompanionStats.HD', '=', SRD35.SAVE_BONUS_HALF,
    'animalCompanionStats.Dex', '+', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule('animalCompanionStats.Str',
    'companionMasterLevel', '+', 'Math.floor(source / 3)'
  );
  rules.defineRule('animalCompanionStats.Tricks',
    'animalCompanionStats.Int', '=', 'source * 3',
    'companionMasterLevel', '+=', 'Math.floor((source + 3) / 3)'
  );
  rules.defineRule('animalCompanionStats.Will',
    'animalCompanionStats.HD', '=', SRD35.SAVE_BONUS_THIRD,
    'animalCompanionStats.Wis', '+', 'Math.floor((source - 10) / 2)'
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
  rules.defineRule('companionMaxDexOrStr',
    'animalCompanionStats.Dex', '=', null,
    'animalCompanionStats.Str', '^', null
  );

  features = [
    '1:Companion Alertness', '1:Companion Evasion',
    '1:Companion Improved Evasion', '1:Empathic Link', '1:Share Spells',
    '3:Deliver Touch Spells', '5:Speak With Master',
    '7:Speak With Like Animals', '11:Companion Resist Spells', '13:Scry'
  ];
  SRD35.featureListRules
    (rules, features, 'Familiar', 'familiarMasterLevel', false);

  rules.defineRule('companionNotes.celestialFamiliar',
    'familiarCelestial', '=', '0',
    'familiarStats.HD', '^', null
  );
  rules.defineRule('companionNotes.celestialFamiliar.1',
    'familiarCelestial', '=', '0',
    'familiarStats.HD', '^', 'Math.floor((source + 7) / 8) * 5'
  );
  rules.defineRule('companionNotes.celestialFamiliar.2',
    'familiarCelestial', '=', '0',
    'familiarStats.HD', '^', 'source < 4 ? 0 : source < 12 ? 5 : 10'
  );
  rules.defineRule('companionNotes.fiendishFamiliar',
    'familiarFiendish', '=', '0',
    'familiarStats.HD', '^', null
  );
  rules.defineRule('companionNotes.fiendishFamiliar.1',
    'familiarFiendish', '=', '0',
    'familiarStats.HD', '^', 'Math.floor((source + 7) / 8) * 5'
  );
  rules.defineRule('companionNotes.fiendishFamiliar.2',
    'familiarFiendish', '=', '0',
    'familiarStats.HD', '^', 'source < 4 ? 0 : source < 12 ? 5 : 10'
  );
  rules.defineRule('familiarAttack',
    'familiarMasterLevel', '?', null,
    'baseAttack', '=', null,
  );
  rules.defineRule('familiarEnhancement',
    'familiarCelestial', '=', '"Celestial"',
    'familiarFiendish', '=', '"Fiendish"'
  );
  rules.defineRule('familiarStats.AC',
    'familiarMasterLevel', '+', 'Math.floor((source + 1) / 2)'
  );
  rules.defineRule('familiarStats.Fort',
    'familiarMasterLevel', '?', null,
    'classFortitudeBonus', '=', 'Math.max(source, 2)',
    'familiarStats.Con', '+', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule('familiarStats.HD',
    'familiarMasterLevel', '?', null,
    'level', '^=', null
  );
  rules.defineRule('familiarStats.HP',
    'familiarMasterLevel', '?', null,
    'hitPoints', '=', 'Math.floor(source / 2)'
  );
  rules.defineRule('familiarStats.Init',
    'familiarStats.Dex', '=', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule('familiarStats.Int',
    'familiarMasterLevel', '^', 'Math.floor((source + 11) / 2)'
  );
  rules.defineRule('familiarStats.Melee', 'familiarAttack', '=', null);
  rules.defineRule('familiarStats.Ref',
    'familiarMasterLevel', '?', null,
    'classReflexBonus', '=', 'Math.max(source, 2)',
    'familiarStats.Dex', '+', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule('familiarStats.SR',
    'familiarFeatures.Companion Resist Spells', '?', null,
    'familiarMasterLevel', '=', 'source + 5'
  );
  rules.defineRule('familiarStats.Will',
    'familiarMasterLevel', '?', null,
    'classWillBonus', '=', 'Math.max(source, 0)',
    'familiarStats.Wis', '+', 'Math.floor((source - 10) / 2)'
  );
  rules.defineRule
    ('features.Celestial Familiar', 'familiarCelestial', '=', '1');
  rules.defineRule('features.Fiendish Familiar', 'familiarFiendish', '=', '1');

  SRD35.prerequisiteRules
    (rules, 'validation', 'celestialFamiliar', 'familiarCelestial',
     'familiarMasterLevel >= 3');
  SRD35.prerequisiteRules
    (rules, 'validation', 'fiendishFamiliar', 'familiarFiendish',
     'familiarMasterLevel >= 3');

};

/* Defines rules related to combat. */
SRD35.combatRules = function(rules, armors, shields, weapons) {

  for(var armor in armors) {
    rules.choiceRules(rules, 'Armor', armor, armors[armor]);
  }
  for(var shield in shields) {
    rules.choiceRules(rules, 'Shield', shield, shields[shield]);
  }
  for(var weapon in weapons) {
    rules.choiceRules(rules, 'Weapon', weapon, weapons[weapon]);
  }

  rules.defineChoice('notes',
    'combatNotes.nonproficientArmorPenalty:%V attack',
    'combatNotes.nonproficientShieldPenalty:%V attack',
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
  rules.defineRule
    ('hitPoints', 'combatNotes.constitutionHitPointsAdjustment', '+', null);
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
  rules.defineRule('save.Fortitude', 'constitutionModifier', '=', null);
  rules.defineRule('save.Reflex', 'dexterityModifier', '=', null);
  rules.defineRule('save.Will', 'wisdomModifier', '=', null);
  rules.defineRule('shieldProficiency',
    'shieldProficiencyLevel', '=', 'SRD35.ARMOR_PROFICIENCY_NAMES[source]'
  );
  rules.defineRule('shieldProficiencyLevel',
    '', '=', '0',
    'features.Shield Proficiency (Heavy)', '^', '3',
    'features.Shield Proficiency (Tower)', '^', '4'
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

/* Defines the rules related to goodies included in character notes. */
SRD35.goodiesRules = function(rules) {

  rules.defineRule('goodiesList', 'notes', '=',
    'source.match(/^\\s*\\*/m) ? source.match(/^\\s*\\*.*/gm).reduce(function(list, line) {return list.concat(line.split(";"))}, []) : null'
  );

  for(var ability in SRD35.ABILITIES) {
    rules.defineRule('abilityNotes.goodies' + ability + 'Adjustment',
      'goodiesList', '=',
        '!source.join(";").match(/\\b' + ability + '\\b/i) ? null : ' +
        'source.filter(item => item.match(/\\b' + ability + '\\b/i)).reduce(' +
          'function(total, item) {' +
            'return total + ((item + "+0").match(/[-+]\\d+/) * 1);' +
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
          'return total + ((item + "+0").match(/[-+]\\d+/) * 1);' +
        '}' +
      ', 0)'
  );
  rules.defineRule
    ('armorClass', 'combatNotes.goodiesArmorClassAdjustment', '+', null);

  for(var save in {Fortitude:'', Reflex:'', Will:''}) {
    rules.defineRule('saveNotes.goodies' + save + 'Adjustment',
      'goodiesList', '=',
        '!source.join(";").match(/\\b' + save + '\\b/i) ? null : ' +
        'source.filter(item => item.match(/\\b' + save + '\\b/i)).reduce(' +
          'function(total, item) {' +
            'return total + ((item + "+0").match(/[-+]\\d+/) * 1);' +
          '}' +
        ', 0)'
    );
    rules.defineRule('save.' + save,
      'saveNotes.goodies' + save + 'Adjustment', '+', null
    );
  }

  rules.defineRule('featCount.General',
    'goodiesList', '+',
    'source.filter(item => item.match(/\\bextra\\b.*\\bfeat\\b/i)).length'
  );

  for(var skill in rules.getChoices('skills')) {
    // Subskills complicate the pattern match, since the parens are pattern
    // characters and a closing paren doesn't count as a word boundary
    var skillEscParens = skill.replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    rules.defineRule('skillNotes.goodies' + skill + 'Adjustment',
      'goodiesList', '=',
        '!source.join(";").match(/\\b' + skillEscParens + '(?!\\w)/i) ? null : ' +
        'source.filter(item => item.match(/\\b' + skillEscParens + '(?!\\w)/i)).reduce(' +
          'function(total, item) {' +
            'return total + ((item + "+0").match(/[-+]\\d+/) * 1);' +
          '}' +
        ', 0)'
    );
    rules.defineRule('skillModifier.' + skill,
      'skillNotes.goodies' + skill + 'Adjustment', '+', null
    );
    rules.defineRule('classSkills.' + skill,
      'goodiesList', '=',
        'source.filter(item => item.match(/\\b' + skillEscParens + '\\s.*class skill/i)).length > 0 ? 1 : null'
    );
  }
  rules.defineChoice('notes',
    'skillNotes.goodiesSkillCheckAdjustment:Reduce armor skill check penalty by %V'
  );
  rules.defineRule('skillNotes.armorSkillCheckPenalty',
    'skillNotes.goodiesSkillCheckAdjustment', '+', '-source'
  );
  rules.defineRule('skillNotes.goodiesSkillCheckAdjustment',
    'goodiesAffectingAC', '=',
      'source.filter(item => item.match(/\\b(armor|shield)\\b/i)).reduce(' +
        'function(total, item) {' +
          'return Math.max(total, item.match(/[-+]\\d|masterwork/i) ? 1 : 0)' +
        '}' +
      ', 0)'
  );

  // NOTE Weapon Attack/Damage bonus rules affect all weapons of a particular
  // type that the character owns. If the character has, e.g., two longswords,
  // both get the bonus. Ignoring this bug for now.
  for(var weapon in rules.getChoices('weapons')) {
    var weaponNoSpace = weapon.replace(/ /g, '');
    var prefix =
      weaponNoSpace.charAt(0).toLowerCase() + weaponNoSpace.substring(1);
    rules.defineRule('combatNotes.goodies' + weaponNoSpace + 'AttackAdjustment',
      'goodiesList', '=',
        '!source.join(";").match(/\\b' + weapon + '\\b/i) ? null : ' +
        'source.filter(item => item.match(/\\b' + weapon + '\\b/i)).reduce(' +
          'function(total, item) {' +
            'return total + ((item + (item.match(/masterwork/i)?"+1":"+0")).match(/[-+]\\d+/) * 1);' +
          '}' +
        ', 0)'
    );
    rules.defineRule(prefix + 'AttackModifier',
      'combatNotes.goodies' + weaponNoSpace + 'AttackAdjustment', '+', null
    );
    rules.defineRule('combatNotes.goodies' + weaponNoSpace + 'DamageAdjustment',
      'goodiesList', '=',
        '!source.join(";").match(/\\b' + weapon + '\\b/i) ? null : ' +
        'source.filter(item => item.match(/\\b' + weapon + '\\b/i)).reduce(' +
          'function(total, item) {' +
            'return total + ((item + "+0").match(/[-+]\\d+/) * 1);' +
          '}' +
        ', 0)'
    );
    rules.defineRule(prefix + 'DamageModifier',
      'combatNotes.goodies' + weaponNoSpace + 'DamageAdjustment', '+', null
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

  rules.defineChoice('notes',
    'sanityNotes.inertGoodies:No effect from goodie(s) "%V"'
  );

  var abilitiesAndSavesPat = [
    'strength','intelligence','wisdom','dexterity','constitution','charisma',
    'speed', 'fortitude', 'reflex', 'will'
  ].join('|');
  var armorAndWeaponsPat = [
    'armor', 'protection', 'shield'
  ].concat(QuilvynUtils.getKeys(rules.getChoices('weapons'))).join('|');
  var skillsPat = QuilvynUtils.getKeys(rules.getChoices('skills')).join('|').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  var abilitiesArmorSavesSkillsAndWeapons = [
    'strength','intelligence','wisdom','dexterity','constitution','charisma',
    'speed', 'armor', 'protection', 'shield', 'fortitude', 'reflex', 'will'
  ].concat(QuilvynUtils.getKeys(rules.getChoices('skills')))
   .concat(QuilvynUtils.getKeys(rules.getChoices('weapons')))
   .join('|').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  rules.defineRule('inertGoodies',
    'goodiesList', '=',
    'source.filter(item => ' +
      '!item.match(/\\bextra\\s.*\\bfeat\\b/i) && ' +
      '!item.match(/\\b(' + skillsPat + ').*\\bclass skill\\b/i) && ' +
      '!(item.match(/\\b(' + abilitiesAndSavesPat + '|' + armorAndWeaponsPat + '|' + skillsPat + ')\\b/i) && item.match(/[-+][1-9]/)) && ' +
      '!item.match(/\\bmasterwork\\b.*\\b(' + armorAndWeaponsPat + ')\\b/i)' +
    ')'
  );
  rules.defineRule('sanityNotes.inertGoodies',
    'inertGoodies', '=', 'source.length > 0 ? source.join(",") : null'
  );

};

/* Defines rules related to basic character identity. */
SRD35.identityRules = function(
  rules, alignments, classes, deities, domains, genders, races
) {

  for(var alignment in alignments) {
    rules.choiceRules(rules, 'Alignment', alignment, alignments[alignment]);
  }
  for(var clas in classes) {
    rules.choiceRules(rules, 'Class', clas, classes[clas]);
  }
  for(var deity in deities) {
    rules.choiceRules(rules, 'Deity', deity, deities[deity]);
  }
  for(var domain in domains) {
    rules.choiceRules(rules, 'Domain', domain, domains[domain]);
  }
  for(var gender in genders) {
    rules.choiceRules(rules, 'Gender', gender, genders[gender]);
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
  SRD35.validAllocationRules(rules, 'level', 'level', 'Sum "^levels\\."');

};

/* Defnes rules related to magic use. */
SRD35.magicRules = function(rules, schools, spells) {

  for(var school in schools) {
    rules.choiceRules(rules, 'School', school, schools[school]);
  }
  for(var spell in spells) {
    rules.choiceRules(rules, 'Spell', spell, spells[spell]);
  }

};

/* Defines rules related to character feats, languages, and skills. */
SRD35.talentRules = function(rules, feats, features, languages, skills) {

  for(var feat in feats) {
    rules.choiceRules(rules, 'Feat', feat, feats[feat]);
  }
  for(var feature in features) {
    rules.choiceRules(rules, 'Feature', feature, features[feature]);
  }
  for(var language in languages) {
    rules.choiceRules(rules, 'Language', language, languages[language]);
  }
  for(var skill in skills) {
    rules.choiceRules(rules, 'Skill', skill, skills[skill]);
  }

  rules.defineChoice('notes',
    'validationNotes.skillMaximum:' +
      'Points allocated to one or more skills exceed maximum'
  );

  rules.defineRule
    ('featCount.General', 'level', '=', '1 + Math.floor(source / 3)');
  rules.defineRule
    ('languageCount', 'intelligenceModifier', '=', 'Math.max(source, 0)');
  rules.defineRule('maxAllowedSkillAllocation', 'level', '=', 'source + 3');
  rules.defineRule
    ('maxActualSkillAllocation', /^skills\.[^\.]*$/, '^=', null);
  rules.defineRule('skillPoints',
    '', '=', '0',
    'skillNotes.intelligenceSkillPointsAdjustment', '+', null,
    'level', '^', null
  );
  rules.defineRule('skillNotes.armorSwimCheckPenalty',
    'skillNotes.armorSkillCheckPenalty', '=', 'source * 2'
  );
  rules.defineRule('skillNotes.intelligenceSkillPointsAdjustment',
    'intelligenceModifier', '=', null,
    'level', '*', 'source + 3'
  );
  SRD35.validAllocationRules
    (rules, 'feat', 'Sum "^featCount\\."', 'Sum "^feats\\."');
  SRD35.validAllocationRules
    (rules, 'language', 'languageCount', 'Sum "^languages\\."');
  SRD35.validAllocationRules
    (rules, 'selectableFeature', 'Sum "^selectableFeatureCount\\."', 'Sum "^selectableFeatures\\."');
  SRD35.validAllocationRules
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
  else if(type == 'Class') {
    SRD35.classRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValueArray(attrs, 'Imply'),
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
      QuilvynUtils.getAttrValueArray(attrs, 'SpellsPerDay'),
      QuilvynUtils.getAttrValueArray(attrs, 'Spells'),
      SRD35.SPELLS
    );
    SRD35.classRulesExtra(rules, name);
  } else if(type == 'Deity')
    SRD35.deityRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Alignment'),
      QuilvynUtils.getAttrValueArray(attrs, 'Domain'),
      QuilvynUtils.getAttrValueArray(attrs, 'Weapon')
    );
  else if(type == 'Domain') {
    SRD35.domainRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValueArray(attrs, 'Spells'),
      SRD35.SPELLS
    );
    SRD35.domainRulesExtra(rules, name);
  } else if(type == 'Familiar')
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
  else if(type == 'Gender')
    SRD35.genderRules(rules, name);
  else if(type == 'Language')
    SRD35.languageRules(rules, name);
  else if(type == 'Race') {
    SRD35.raceRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValueArray(attrs, 'Selectables'),
      QuilvynUtils.getAttrValueArray(attrs, 'Languages'),
      QuilvynUtils.getAttrValue(attrs, 'SpellAbility'),
      QuilvynUtils.getAttrValueArray(attrs, 'Spells'),
      SRD35.SPELLS
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
  } else if(type == 'Spell')
    SRD35.spellRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'School'),
      QuilvynUtils.getAttrValue(attrs, 'Group'),
      QuilvynUtils.getAttrValue(attrs, 'Level'),
      QuilvynUtils.getAttrValue(attrs, 'Description')
    );
  else if(type == 'Weapon')
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
  if(type != 'Feature') {
    type = type == 'Class' ? 'levels' :
    type = type == 'Deity' ? 'deities' :
    (type.charAt(0).toLowerCase() + type.substring(1).replace(/ /g, '') + 's');
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
 * of hard prerequisites #requires# and soft prerequisites #implies#. The class
 * grants #hitDie# (format [n]'d'n) additional hit points and #skillPoints#
 * additional skill points with each level advance. #attack# is one of '1',
 * '1/2', or '3/4', indicating the base attack progression for the class;
 * similarly, #saveFort#, #saveRef#, and #saveWill# are each one of '1/2' or
 * '1/3', indicating the saving throw progressions. #skills# indicate class
 * skills for the class; see skillRules for an alternate way these can be
 * defined. #features# and #selectables# list the fixed and selectable features
 * acquired as the character advances in class level, and #languages# list any
 * automatic languages for the class. #casterLevelArcane# and
 * #casterLevelDivine#, if specified, give the Javascript expression for
 * determining the caster level for the class; these can incorporate a class
 * level attribute (e.g., 'levels.Fighter') or the character level attribute
 * 'level'. #spellAbility#, if specified, contains the ability for computing
 * spell difficulty class for cast spells. #spellsPerDay# lists the number of
 * spells per level per day that the class can cast, and #spells# lists spells
 * defined by the class.
 */
SRD35.classRules = function(
  rules, name, requires, implies, hitDie, attack, skillPoints, saveFort,
  saveRef, saveWill, skills, features, selectables, languages,
  casterLevelArcane, casterLevelDivine, spellAbility, spellsPerDay, spells,
  spellDict
) {

  if(!name) {
    console.log('Empty class name');
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
  if(!saveFort.match(/^(1\/2|1\/3)$/)) {
    console.log('Bad saveFort "' + saveFort + '" for class ' + name);
    return;
  }
  if(!saveRef.match(/^(1\/2|1\/3)$/)) {
    console.log('Bad saveRef "' + saveRef + '" for class ' + name);
    return;
  }
  if(!saveWill.match(/^(1\/2|1\/3)$/)) {
    console.log('Bad saveWill "' + saveWill + '" for class ' + name);
    return;
  }
  if(spellAbility &&
     !spellAbility.match(/^(charisma|constitution|dexterity|intelligence|strength|wisdom)$/i)) {
    console.log('Bad spellAbility "' + spellAbility + '" for class ' + name);
    return;
  }
 
  var classLevel = 'levels.' + name;
  var prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replace(/ /g, '');

  if(requires.length > 0)
    SRD35.prerequisiteRules
      (rules, 'validation', prefix + 'Class', classLevel, requires);
  if(implies.length > 0)
    SRD35.prerequisiteRules
      (rules, 'sanity', prefix + 'Class', classLevel, implies);

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

  SRD35.featureListRules(rules, features, name, classLevel, false);
  SRD35.featureListRules(rules, selectables, name, classLevel, true);
  rules.defineSheetElement(name + ' Features', 'Feats+', null, '; ');
  rules.defineChoice('extras', prefix + 'Features');

  if(languages.length > 0)
    rules.defineRule('languageCount', classLevel, '+', languages.length);

  for(var i = 0; i < languages.length; i++) {
    if(languages[i] != 'any')
      rules.defineRule('languages.' + languages[i], classLevel, '=', '1');
  }

  if(spellsPerDay.length >= 0) {
    var casterLevelExpr = casterLevelArcane || casterLevelDivine || classLevel;
    if(casterLevelExpr.match(new RegExp('\\b' + classLevel + '\\b', 'i'))) {
      rules.defineRule('casterLevels.' + name,
        classLevel, '=', casterLevelExpr.replace(new RegExp('\\b' + classLevel + '\\b', 'gi'), 'source')
      );
    } else {
      rules.defineRule('casterLevels.' + name,
        classLevel, '?', null,
        'level', '=', casterLevelExpr.replace(new RegExp('\\blevel\\b', 'gi'), 'source')
      );
    }
    if(casterLevelArcane) {
      rules.defineRule('casterLevelArcane',
        'casterLevels.' + name, '+=', null,
        'magicNotes.casterLevelBonus', '+', null
      );
    }
    if(casterLevelDivine) {
      rules.defineRule('casterLevelDivine',
        'casterLevels.' + name, '+=', null,
        'magicNotes.casterLevelBonus', '+', null
      );
    }
    rules.defineRule('spellCountLevel.' + name,
      'levels.' + name, '=', null,
      'magicNotes.casterLevelBonus', '+', null
    );
    for(var i = 0; i < spellsPerDay.length; i++) {
      var spellModifier = spellAbility.toLowerCase() + 'Modifier';
      var spellTypeAndLevel = spellsPerDay[i].split(/:/)[0];
      var spellType = spellTypeAndLevel.replace(/\d+/, '');
      var spellLevel = spellTypeAndLevel.replace(/[A-Z]*/, '');
      var code = spellsPerDay[i].substring(spellTypeAndLevel.length + 1).
                 replace(/=/g, ' ? ').
                 split(/;/).reverse().join(' : source >= ');
      code = 'source >= ' + code + ' : null';
      if(code.indexOf('source >= 1 ?') >= 0) {
        code = code.replace(/source >= 1 ./, '').replace(/ : null/, '');
      }
      rules.defineRule('spellsPerDay.' + spellTypeAndLevel,
        'spellCountLevel.' + name, '+=', code
      );
      if(spellLevel > 0) {
        rules.defineRule('spellsPerDay.' + spellTypeAndLevel,
          spellModifier, '+',
            'source >= ' + spellLevel +
              ' ? 1 + Math.floor((source - ' + spellLevel + ') / 4) : null'
        );
      }
      rules.defineRule('casterLevels.' + spellType,
        'casterLevels.' + name, '=', null,
        'magicNotes.casterLevelBonus', '+', null
      );
      rules.defineRule('spellDifficultyClass.' + spellType,
        'casterLevels.' + spellType, '?', null,
        spellModifier, '=', '10 + source'
      );
    }
  }

  for(var i = 0; i < spells.length; i++) {
    var pieces = spells[i].split(':');
    var matchInfo = pieces[0].match(/^(\w+)(\d)$/);
    if(pieces.length != 2 || !matchInfo) {
      console.log('Bad format for spell list "' + spells[i] + '"');
      break;
    }
    var group = matchInfo[1];
    var level = matchInfo[2];
    var spellNames = pieces[1].split(';');
    for(var j = 0; j < spellNames.length; j++) {
      var spellName = spellNames[j];
      if(spellDict[spellName] == null) {
        console.log('Unknown spell "' + spellName + '"');
        continue;
      }
      var school = QuilvynUtils.getAttrValue(spellDict[spellName], 'School');
      if(school == null) {
        console.log('No school given for spell ' + spellName);
        continue;
      }
      var fullSpell =
        spellName + '(' + group + level + ' ' + school.substring(0, 4) + ')';
      rules.choiceRules
        (rules, 'Spell', fullSpell,
         spellDict[spellName] + ' Group=' + group + ' Level=' + level);
    }
  }

};

/*
 * Defines in #rules# the rules associated with class #name# that are not
 * directly derived from the parmeters passed to classRules.
 */
SRD35.classRulesExtra = function(rules, name) {

  if(name == 'Barbarian') {

    rules.defineRule('barbarianFeatures.Improved Uncanny Dodge',
      'barbarianFeatures.Uncanny Dodge', '?', null,
      'uncannyDodgeSources', '=', 'source >= 2 ? 1 : null'
    );
    rules.defineRule('combatNotes.damageReduction',
      'levels.Barbarian', '+=', 'Math.floor((source - 4) / 3)'
    );
    rules.defineRule('combatNotes.improvedUncannyDodge',
      'levels.Barbarian', '+=', null,
      '', '+', '4'
    );
    rules.defineRule('combatNotes.rage',
      'constitutionModifier', '=', '5 + source',
      'features.Greater Rage', '+', '1',
      'features.Mighty Rage', '+', '1'
    );
    rules.defineRule('combatNotes.rage.1',
      'features.Rage', '?', null,
      'levels.Barbarian', '+=', '1 + Math.floor(source / 4)'
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
    rules.defineRule('magicNotes.fascinate',
      'levels.Bard', '+=', 'Math.floor((source + 2) / 3)'
    );
    rules.defineRule('magicNotes.fascinate.1', 'levels.Bard', '+=', null);
    rules.defineRule('magicNotes.inspireCourage',
      'levels.Bard', '+=', 'Math.max(Math.floor((source + 4) / 6, 1))'
    );
    rules.defineRule('magicNotes.inspireGreatness',
      'levels.Bard', '+=', 'Math.floor((source - 6) / 3)'
    );
    rules.defineRule('magicNotes.inspireHeroics',
      'levels.Bard', '+=', 'Math.floor((source - 15) / 3)'
    );
    rules.defineRule('magicNotes.massSuggestion',
      'levels.Bard', '=', '10 + Math.floor(source / 2)',
      'charismaModifier', '+', null
    );
    // Compute in simpeSomatics.1 so that note will show even if character is
    // wearing heavy armor
    rules.defineRule('magicNotes.simpleSomatics.1',
      'magicNotes.simpleSomatics', '?', null,
      'armorWeight', '=', 'source <= 1 ? 1 : null'
    );
    rules.defineRule('magicNotes.suggestion',
      'levels.Bard', '=', '10 + Math.floor(source / 2)',
      'charismaModifier', '+', null
    );
    rules.defineRule('skillNotes.bardicKnowledge',
      'levels.Bard', '=', null,
      'intelligenceModifier', '+', null,
      'skills.Knowledge (History)', '+', 'source >= 5 ? 2 : null'
    );

  } else if(name == 'Cleric') {

    rules.defineRule('combatNotes.turnUndead.1',
      'turningLevel', '=', null,
      'charismaModifier', '+', null
    );
    rules.defineRule('combatNotes.turnUndead.2',
      'turningLevel', '=', 'source * 3 - 10',
      'charismaModifier', '+', null
    );
    rules.defineRule('combatNotes.turnUndead.3',
      'turningLevel', '=', '3',
      'charismaModifier', '+', null
    );
    rules.defineRule
      ('selectableFeatureCount.Cleric', 'levels.Cleric', '=', '2');
    rules.defineRule('turningLevel', 'levels.Cleric', '+=', null);

  } else if(name == 'Druid') {

    rules.defineRule('companionMasterLevel', 'levels.Druid', '^=', null);
    rules.defineRule('magicNotes.elementalShape',
      'levels.Druid', '=', 'source < 16 ? null : Math.floor((source-14) / 2)'
    );
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

    rules.defineRule('abilityNotes.unarmoredSpeedBonus',
      'levels.Monk', '+=', '10 * Math.floor(source / 3)'
    );
    rules.defineRule('combatNotes.armorClassBonus',
      'levels.Monk', '=', 'Math.floor(source / 5)',
      'wisdomModifier', '+', 'source > 0 ? source : null'
    );
    rules.defineRule('combatNotes.flurryOfBlows',
      'levels.Monk', '=', 'source < 5 ? -2 : source < 9 ? -1 : 0'
    );
    rules.defineRule('combatNotes.kiStrike',
      'levels.Monk', '=',
      '"magic" + ' +
      '(source < 10 ? "" : "/lawful") + ' +
      '(source < 16 ? "" : "/adamantine")'
    )
    rules.defineRule('combatNotes.quiveringPalm',
      'levels.Monk', '+=', '10 + Math.floor(source / 2)',
      'wisdomModifier', '+', null
    );
    rules.defineRule('combatNotes.stunningFist',
      'level', '=', '10 + Math.floor(source / 2)',
      'wisdomModifier', '+', null
    );
    rules.defineRule('combatNotes.stunningFist.1',
      'levels.Monk', '+=', 'source - Math.floor(source / 4)'
    );
    rules.defineRule('magicNotes.emptyBody', 'levels.Monk', '+=', null);
    rules.defineRule
      ('magicNotes.wholenessOfBody', 'levels.Monk', '+=', '2 * source');
    rules.defineRule
      ('saveNotes.diamondSoul', 'levels.Monk', '+=', '10 + source');
    rules.defineRule('saveNotes.slowFall',
      'levels.Monk', '=', 'source < 20 ? Math.floor(source / 2) * 10 : "all"'
    );
    rules.defineRule('selectableFeatureCount.Monk',
      'levels.Monk', '=', 'source < 2 ? 1 : source < 6 ? 2 : 3'
    );
    // NOTE Our rule engine doesn't support modifying a value via indexing.
    // Here, we work around this limitation by defining rules that set global
    // values as a side effect, then use these values in our calculations.
    rules.defineRule('combatNotes.increasedUnarmedDamage',
      'monkFeatures.Flurry Of Blows', '?', null, // Limit these rules to monks
      'levels.Monk', '=',
        'SRD35.SMALL_DAMAGE["monk"] = ' +
        'SRD35.LARGE_DAMAGE["monk"] = ' +
        'source < 12 ? ("d" + (6 + Math.floor(source / 4) * 2)) : ' +
        '              ("2d" + (6 + Math.floor((source - 12) / 4) * 2))',
      'features.Small', '=', 'SRD35.SMALL_DAMAGE[SRD35.SMALL_DAMAGE["monk"]]',
      'features.Large', '=', 'SRD35.LARGE_DAMAGE[SRD35.LARGE_DAMAGE["monk"]]'
    );
    rules.defineRule
      ('unarmedDamageDice', 'combatNotes.increasedUnarmedDamage', '=', null);

  } else if(name == 'Paladin') {

    rules.defineRule
      ('combatNotes.smiteEvil', 'charismaModifier', '=', 'Math.max(source, 0)');
    rules.defineRule('combatNotes.smiteEvil.1', 'levels.Paladin', '=', null);
    rules.defineRule('combatNotes.smiteEvil.2',
      'levels.Paladin', '=', '1 + Math.floor(source / 5)'
    );
    rules.defineRule('magicNotes.layOnHands',
      'levels.Paladin', '+=', null,
      'charismaModifier', '*', null,
      'charisma', '?', 'source >= 12'
    );
    rules.defineRule('magicNotes.removeDisease',
      'levels.Paladin', '+=', 'Math.floor((source - 3) / 3)'
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
      '15:Companion Resist Spells'
    ];
    SRD35.featureListRules
      (rules, features, 'Animal Companion', 'levels.Paladin', false);
    rules.defineRule('companionNotes.commandLikeCreatures',
      'levels.Paladin', '=', '10 + Math.floor(source / 2)',
      'charismaModifier', '+', null
    );
    rules.defineRule('companionNotes.commandLikeCreatures.1',
      'animalCompanionFeatures.Command Like Creatures', '?', null,
      'levels.Paladin', '=', 'Math.floor(source / 2)'
    );
    rules.defineRule('animalCompanionStats.AC',
      'levels.Paladin', '+', 'Math.floor((source + 1) / 3) * 2'
    );
    rules.defineRule('animalCompanionStats.Fort',
      'companionNotes.shareSavingThrows.1', '+', null
    );
    rules.defineRule('animalCompanionStats.HD',
      'levels.Paladin', '+', 'Math.floor((source - 2) / 3) * 2'
    );
    rules.defineRule('animalCompanionStats.Int',
      'levels.Paladin', '^', 'Math.floor((source - 2) / 3) + 5'
    );
    rules.defineRule('animalCompanionStats.Ref',
      'companionNotes.shareSavingThrows.2', '+', null
    );
    rules.defineRule('animalCompanionStats.Str',
      'levels.Paladin', '+', 'Math.floor((source - 2) / 3)'
    );
    rules.defineRule('animalCompanionStats.SR',
      'levels.Paladin', '=', 'source >= 15 ? source + 5 : null'
    );
    rules.defineRule('animalCompanionStats.Will',
      'companionNotes.shareSavingThrows.3', '+', null
    );
    rules.defineRule
      ('companionAttackBoosts', 'levels.Paladin', '=', '(source - 2) / 6');
    rules.defineRule('companionNotes.shareSavingThrows.1',
      // Use base note in calculation so Quilvyn displays it in italics
      'companionNotes.shareSavingThrows', '?', null,
      'levels.Paladin', '=', SRD35.SAVE_BONUS_HALF,
      'animalCompanionStats.HD', '+', '-(' + SRD35.SAVE_BONUS_HALF + ')',
      '', '^', '0'
    );
    rules.defineRule('companionNotes.shareSavingThrows.2',
      'companionNotes.shareSavingThrows', '?', null,
      'levels.Paladin', '=', SRD35.SAVE_BONUS_THIRD,
      'animalCompanionStats.HD', '+', '-(' + SRD35.SAVE_BONUS_HALF + ')',
      '', '^', '0'
    );
    rules.defineRule('companionNotes.shareSavingThrows.3',
      'companionNotes.shareSavingThrows', '?', null,
      'levels.Paladin', '=', SRD35.SAVE_BONUS_THIRD,
      'animalCompanionStats.HD', '+', '-(' + SRD35.SAVE_BONUS_THIRD + ')',
      '', '^', '0'
    );

  } else if(name == 'Ranger') {

    rules.defineRule('companionMasterLevel',
      'levels.Ranger', '^=', 'source < 4 ? null : Math.floor(source / 2)'
    );
    rules.defineRule('combatNotes.favoredEnemy',
      'levels.Ranger', '+=', '1 + Math.floor(source / 5)'
    );
    rules.defineRule('combatNotes.manyshot',
      'baseAttack', '=', 'Math.floor((source + 9) / 5)'
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

    rules.defineRule('combatNotes.sneakAttack',
      'levels.Rogue', '+=', 'Math.floor((source + 1) / 2)'
    );
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
    rules.defineRule('combatNotes.improvedUncannyDodge',
      'levels.Rogue', '+=', null,
      '', '+', '4'
    );
    rules.defineRule
      ('uncannyDodgeSources', 'rogueFeatures.Uncanny Dodge', '+=', '1');

  } else if(name == 'Sorcerer') {

    rules.defineRule('familiarMasterLevel', 'levels.Sorcerer', '^=', null);

  } else if(name == 'Wizard') {

    rules.defineRule('familiarMasterLevel', 'levels.Wizard', '^=', null);
    rules.defineRule('featCount.Wizard',
      'levels.Wizard', '=', 'source >= 5 ? Math.floor(source / 5) : null'
    );
    rules.defineRule('selectableFeatureCount.Wizard',
      'levels.Wizard', '=', '3',
      'wizardFeatures.School Specialization (Divination)', '+', '-1',
      'wizardFeatures.School Specialization (None)', '+', '-2'
    );

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
  rules, name, str, dex, con, intel, wis, cha, hd, ac, attack, damage, size, level
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
  if(!size || 'DTSMLH'.indexOf(size) < 0) {
    console.log('Bad size "' + size + '" for companion ' + name);
    return;
  }
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
      ('companionMasterLevel', 'animalCompanion.' + name, '+', -level);
    SRD35.prerequisiteRules
      (rules, 'validation', 'animalCompanion', 'animalCompanion.' + name,
       'companionMasterLevel >= 0');
  }

};

/*
 * Defines in #rules# the rules associated with deity #name#. #alignment# gives
 * the deity's alignment, and #domains# and #weapons# list the associated
 * domains and favored weapons.
 */
SRD35.deityRules = function(rules, name, alignment, domains, weapons) {

  if(!name) {
    console.log('Empty deity name');
    return;
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
  for(var j = 0; j < weapons.length; j++) {
    var weapon = weapons[j];
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
 * Defines in #rules# the rules associated with domain #name#. #features# and
 * #spells# list the associated features and domain spells. #spellDict# is the
 * dictionary of all spells used to look up individual spell attributes.
 */
SRD35.domainRules = function(rules, name, features, spells, spellDict) {

  if(!name) {
    console.log('Empty domain name');
    return;
  }
  if(spells.length != 9) {
    console.log('Bad spell list ' + spells + ' for domain ' + name);
    return;
  }

  var domainLevel =
    name.charAt(0).toLowerCase() + name.substring(1).replace(/ /g,'') + 'Level';

  rules.defineRule(domainLevel,
    'selectableFeatures.Cleric - ' + name + ' Domain', '?', null,
    'levels.Cleric', '=', null
  );
  SRD35.featureListRules(rules, features, 'Cleric', domainLevel, false);

  for(var level = 1; level <= spells.length; level++) {
    var spellName = spells[level - 1];
    if(spellDict[spellName] == null) {
      console.log('Unknown spell "' + spellName + '"');
      continue;
    }
    var school = QuilvynUtils.getAttrValue(spellDict[spellName], 'School');
    if(school == null) {
      console.log('No school given for spell ' + spellName);
      continue;
    }
    var fullSpell =
      spellName + '(' + name + level + ' ' + school.substring(0, 4) + ')';
    rules.choiceRules
      (rules, 'Spell', fullSpell,
       spellDict[spellName] + ' Group=Dom Level=' + level);
  }

};

/*
 * Defines in #rules# the rules associated with domain #name# that are not
 * directly derived from the parmeters passed to domainRules.
 */
SRD35.domainRulesExtra = function(rules, name) {

  if(name == 'Death') {
    rules.defineRule('magicNotes.deadlyTouch', 'levels.Cleric', '=', null);
  } else if(name == 'Destruction') {
    rules.defineRule('combatNotes.smite', 'levels.Cleric', '=', null);
  } else if(name == 'Magic') {
    rules.defineRule('magicNotes.arcaneAdept',
      'levels.Cleric', '=', 'Math.max(Math.floor(source / 2), 1)',
      'levels.Wizard', '+', null
    );
  } else if(name == 'Protection') {
    rules.defineRule('magicNotes.protectiveTouch', 'levels.Cleric', '=', null);
  } else if(name == 'Strength') {
    rules.defineRule('abilityNotes.strengthBurst', 'levels.Cleric', '=', null);
  } else if(name == 'Travel') {
    rules.defineRule('magicNotes.unhindered', 'levels.Cleric', '=', null);
  } else if(name == 'War') {
    rules.defineRule
      ('featureNotes.weaponOfWar', 'deityFavoredWeapons', '=', null);
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
  rules, name, str, dex, con, intel, wis, cha, hd, ac, attack, damage, size, level
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
  if(!size || 'DTSMLH'.indexOf(size) < 0) {
    console.log('Bad size "' + size + '" for familiar ' + name);
    return;
  }
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
    SRD35.prerequisiteRules
      (rules, 'validation', 'familiar', 'familiar.' + name,
       'familiarMasterLevel >= familiarStats.Level');
  }

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

  var prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replace(/ /g, '');

  if(requires.length > 0)
    SRD35.prerequisiteRules
      (rules, 'validation', prefix + 'Feat', 'feats.' + name, requires);

  if(implies.length > 0)
    SRD35.prerequisiteRules
      (rules, 'sanity', prefix + 'Feat', 'feats.' + name, implies);

  rules.defineRule('features.' + name, 'feats.' + name, '=', null);

};

/*
 * Defines in #rules# the rules associated with feat #name# that are not
 * directly derived from the parmeters passed to featRules.
 */
SRD35.featRulesExtra = function(rules, name) {

  var matchInfo;

  if(name == 'Combat Reflexes') {
    rules.defineRule
      ('combatNotes.combatReflexes', 'dexterityModifier', '=', 'source + 1');
  } else if((matchInfo = name.match(/^(Greater )?Weapon Focus \((.*)\)$/)) != null) {
    SRD35.featureRules
      (rules, name, 'combat', '+1 ' + matchInfo[2] + ' Attack Modifier');
  } else if((matchInfo = name.match(/^(Greater )?Weapon Specialization \((.*)\)$/)) != null) {
    SRD35.featureRules
      (rules, name, 'combat', '+2 ' + matchInfo[2] + ' Damage Modifier');
  } else if((matchInfo = name.match(/^Improved Critical \((.*)\)$/)) != null) {
    SRD35.featureRules
      (rules, name, 'combat', 'x2 ' + matchInfo[1] + ' Threat Range');
  } else if(name == 'Manyshot') {
    rules.defineRule('combatNotes.manyshot',
      'baseAttack', '=', 'Math.floor((source + 9) / 5)'
    );
  } else if(name == 'Power Attack') {
    rules.defineRule('combatNotes.powerAttack', 'baseAttack', '=', null);
  } else if((matchInfo = name.match(/^Skill Focus \((.*)\)$/)) != null) {
    SRD35.featureRules(rules, name, 'skill', '+3 ' + matchInfo[1]);
  } else if(name == 'Spell Mastery') {
    rules.defineRule
      ('magicNotes.spellMastery', 'intelligenceModifier', '=', null);
  } else if(name == 'Stunning Fist') {
    rules.defineRule('combatNotes.stunningFist',
      'level', '=', '10 + Math.floor(source / 2)',
      'wisdomModifier', '+', null
    );
    rules.defineRule('combatNotes.stunningFist.1',
      'level', '+=', 'Math.floor(source / 4)'
    );
  } else if(name == 'Weapon Finesse') {
    rules.defineRule('combatNotes.weaponFinesse',
      'dexterityModifier', '=', null,
      'strengthModifier', '+', '-source'
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
  if(typeof sections == 'string')
    sections = [sections];
  if(typeof notes == 'string')
    notes = [notes];
  if(sections.length != notes.length) {
    console.log(sections.length + ' sections, ' + notes.length + ' notes for feature ' + name);
    return;
  }
  if(sections.length == 0) {
    console.log('Empty section/note list for feature ' + name);
    return;
  }

  var prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replace(/ /g, '');

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

      if((matchInfo = pieces[j].match(/^([-+x](\d+(\.\d+)?|%V))\s+(.*)$/)) != null) {

        var adjust = matchInfo[1];
        var adjusted = matchInfo[4];

        if(adjusted in SRD35.ABBREVIATIONS)
          adjusted = SRD35.ABBREVIATIONS[adjusted];
          
        if((matchInfo = adjusted.match(/^(([A-Z][a-z]*) )?Feat\b/)) != null) {
          adjusted = 'featCount.' + (matchInfo[2] ? matchInfo[2] : 'General');
        } else if(adjusted == 'Turnings') {
          adjusted = 'combatNotes.turnUndead.2';
        } else if(adjusted.match(/^Spell DC \(.*\)$/)) {
          adjusted = 'spellDCSchoolBonus.' + adjusted.replace('Spell DC (', '').replace(')', '');
        } else if(section == 'save' &&
                  adjusted.match(/^(Fortitude|Reflex|Will)$/)) {
          adjusted = 'save.' + adjusted.charAt(0).toUpperCase() + adjusted.substring(1).toLowerCase();
        } else if(section == 'skill' &&
                  adjusted != 'Skill Points' &&
                  adjusted.match(/^[A-Z][a-z]*( [A-Z][a-z]*)*( \([A-Z][a-z]*( [A-Z][a-z]*)*\))?$/)) {
          skillEffects++;
          var skillAttr = 'skills.' + adjusted;
          if(uniqueSkillsAffected.indexOf(skillAttr) < 0)
            uniqueSkillsAffected.push(skillAttr);
          adjusted = 'skillModifier.' + adjusted;
        } else if(adjusted.match(/^[A-Z][a-z]*( [A-Z][a-z]*)*$/)) {
          adjusted = adjusted.charAt(0).toLowerCase() + adjusted.substring(1).replace(/ /g, '');
        } else {
          continue;
        }
        if(adjust.startsWith('x')) {
          rules.defineRule(adjusted,
            note, '*', adjust == 'x%V' ? 'source' : adjust.substring(1)
          );
        } else {
          rules.defineRule(adjusted,
            note, '+', adjust == '-%V' ? '-source' : adjust == '+%V' ? 'source' : adjust
          );
        }

      } else if(section == 'skill' && pieces[j].match(/ class skill(s)?$/)) {
        var skill =
          pieces[j].replace(/^all | (is( a)?|are)? class skill(s)?$/gi, '');
        if(skill.match(/^[A-Z][a-z]*( [A-Z][a-z]*)*( \([A-Z][a-z]*( [A-Z][a-z]*)*\))?$/)) {
          rules.defineRule('classSkills.' + skill, note, '=', '1');
          skillEffects++;
          var skillAttr = 'skills.' + skill;
          if(uniqueSkillsAffected.indexOf(skillAttr) < 0)
            uniqueSkillsAffected.push(skillAttr);
        }
      }

    }

    if(skillEffects == pieces.length && !effects.match(/^-|\/-/)) {
      SRD35.prerequisiteRules
        (rules, 'sanity', prefix, 'features.' + name,
         uniqueSkillsAffected.join(' > 0 || ') + ' > 0');
    }

  }

};

/* Defines in #rules# the rules associated with gender #name#. */
SRD35.genderRules = function(rules, name) {
  if(!name) {
    console.log('Empty gender name');
    return;
  }
  // No rules pertain to gender
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
 * Defines in #rules# the rules associated with race #name#. #features# and
 * #selectables# list associated features and #languages# the automatic
 * languages. #spells# lists any natural spells, for which #spellAbility# is
 * used to compute the save DC. #spellDict# is the dictionary of all spells
 * used to look up individual spell attributes.
 */
SRD35.raceRules = function(
  rules, name, features, selectables, languages, spellAbility, spells, spellDict
) {

  if(!name) {
    console.log('Empty race name');
    return;
  }
  if(spellAbility &&
     !spellAbility.match(/^(charisma|constitution|dexterity|intelligence|strength|wisdom)$/i)) {
    console.log('Bad spellAbility "' + spellAbility + '" for class ' + name);
    return;
  }

  var matchInfo;
  var prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replace(/ /g, '');
  var raceLevel = prefix + 'Level';

  rules.defineRule(raceLevel,
    'race', '?', 'source == "' + name + '"',
    'level', '=', null
  );

  SRD35.featureListRules(rules, features, name, raceLevel, false);
  SRD35.featureListRules(rules, selectables, name, raceLevel, true);
  rules.defineSheetElement(name + ' Features', 'Feats+', null, '; ');
  rules.defineChoice('extras', prefix + 'Features');

  if(languages.length > 0)
    rules.defineRule('languageCount', raceLevel, '+', languages.length);

  for(var i = 0; i < languages.length; i++) {
    if(languages[i] != 'any')
      rules.defineRule('languages.' + languages[i], raceLevel, '=', '1');
  }

  if(spellAbility && spells.length > 0) {
    rules.defineRule('casterLevels.' + name, raceLevel, '=', null);
    rules.defineRule('casterLevel', 'casterLevel.' + name, '^=', '1');
    rules.defineRule('spellDifficultyClass.' + name,
      raceLevel, '?', null,
      spellAbility.toLowerCase() + 'Modifier', '=', '10 + source'
    );
  }

  for(var i = 0; i < spells.length; i++) {

    var pieces = spells[i].split(':');
    if(pieces.length != 2) {
      console.log('Bad format for spell list "' + spells[i] + '"');
      break;
    }
    var condition = null;
    var groupAndLevel = pieces[0];
    var spellList = pieces[1];
    if(groupAndLevel.indexOf('?') >= 0) {
      pieces = groupAndLevel.split(/\s*\?\s*/);
      condition = pieces[0];
      groupAndLevel = pieces[1];
    }
    var matchInfo = groupAndLevel.match(/^(\w+)(\d)$/);
    if(!matchInfo) {
      console.log('Bad format for spell list "' + spells[i] + '"');
      break;
    }
    var group = matchInfo[1];
    var level = matchInfo[2];
    var spellNames = spellList.split(';');
    for(var j = 0; j < spellNames.length; j++) {
      var spellName = spellNames[j];
      if(spellDict[spellName] == null) {
        console.log('Unknown spell "' + spellName + '"');
        continue;
      }
      var school = QuilvynUtils.getAttrValue(spellDict[spellName], 'School');
      if(school == null) {
        console.log('No school given for spell ' + spellName);
        continue;
      }
      var fullSpell =
        spellName + '(' + group + level + ' ' + school.substring(0, 4) + ')';
      rules.choiceRules
        (rules, 'Spell', fullSpell,
         spellDict[spellName] + ' Group=' + group + ' Level=' + level);
      if(condition) {
        SRD35.prerequisiteRules
          (rules, 'test', name + 'Spells' + j, raceLevel, condition);
        rules.defineRule('spells.' + fullSpell,
          raceLevel, '?', null,
          'testNotes.' + name + 'Spells' + j, '=', 'source == 0 ? 1 : null'
        );
      } else {
        rules.defineRule('spells.' + fullSpell, raceLevel, '=', '1');
      }
    }

  }

};

/*
 * Defines in #rules# the rules associated with race #name# that are not
 * directly derived from the parmeters passed to raceRules.
 */
SRD35.raceRulesExtra = function(rules, name) {
  if(name.match(/Dwarf/)) {
    rules.defineRule('abilityNotes.armorSpeedAdjustment',
      'abilityNotes.dwarfArmorSpeedAdjustment', '^', '0'
    );
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

  if(name == 'Universal')
    return;

  var prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replace(/ /g,'');
  var schoolLevel = prefix + 'Level';

  rules.defineRule(schoolLevel,
    'features.School Specialization (' + name + ')', '?', null,
    'levels.Wizard', '=', null
  );
  rules.defineRule('spellDCSchoolBonus.' + name, schoolLevel, '=', '0');
  SRD35.featureListRules(rules, features, 'Wizard', schoolLevel, false);

  for(var i = 1; i <= 9; i++) {
    rules.defineRule('spellsPerDay.W' + i,
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
 * use effectively, imposes #skillPenalty# on specific skills
 * and yields a #spellFail# percent chance of arcane spell failure.
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
 * #ability# (one of 'strength', 'intelligence', etc.). #untrained#, if
 * specified is a boolean indicating whether or not the skill can be used
 * untrained; the default is true. #classes# lists the classes for which this
 * is a class skill; a value of "all" indicates that this is a class skill for
 * all classes. #synergies#, if specified, lists synergies to other skills and
 * abilities granted by high ranks in this skill.
 */
SRD35.skillRules = function(
  rules, name, ability, untrained, classes, synergies
) {

  if(!name) {
    console.log('Empty skill name');
    return;
  }
  if(ability != null &&
     !ability.match(/^(charisma|constitution|dexterity|intelligence|strength|wisdom)$/i)) {
    console.log('Bad ability "' + ability + '" for skill ' + name);
  }
  if(untrained != null && typeof untrained != 'boolean') {
    console.log('Bad untrained "' + untrained + '" for skill ' + name);
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
  if(ability)
    rules.defineRule
      ('skillModifier.' + name, ability.toLowerCase() + 'Modifier', '+', null);
  if(ability)
    rules.defineRule
      ('skills.' + name + '.1', 'skills.' + name, '=', '"' + ability.substring(0,3) + '"');
  else
    rules.defineRule('skills.' + name + '.1', 'skills.' + name, '=', '""');
  rules.defineRule('skills.' + name + '.2',
    'skills.' + name, '?', '1',
    '', '=', '";cc"',
    'classSkills.' + name, '=', '""'
  );
  rules.defineRule('skills.' + name + '.3', 'skillModifier.' + name, '=', null);

  if(synergies.length > 0) {
    SRD35.featureRules
      (rules, name + ' Synergy', 'skill', '+2 ' + synergies.join('/+2 '));
    rules.defineRule('features.' + name + ' Synergy',
      'skills.' + name, '=', 'source >= 5 ? 1 : null'
    );
  }

};

/*
 * Defines in #rules# the rules associated with skill #name# that are not
 * directly derived from the parmeters passed to skillRules.
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
 * saving throw value required by the spell. #description# is a verbose
 * description of the spell's effects.
 */
SRD35.spellRules = function(
  rules, name, school, casterGroup, level, description
) {

  if(!name) {
    console.log('Empty spell name');
    return;
  }
  if(!school || !(school in rules.getChoices('schools'))) {
    console.log('Bad school "' + school + '" for spell ' + name);
    return;
  }
  if(!casterGroup || !casterGroup.match(/^[A-Z][A-Za-z]*$/)) {
    console.log('Bad caster group "' + casterGroup + '" for spell ' + name);
    return;
  }
  if(typeof level != 'number') {
    console.log('Bad level "' + level + '" for spell ' + name);
    return;
  }

  if(description == null)
    description = '';

  var inserts = description.match(/\$(\w+|{[^}]+})/g);
  if(inserts != null) {
    for(var i = 1; i <= inserts.length; i++) {
      var insert = inserts[i - 1];
      var expr = insert[1] == '{' ?
          insert.substring(2, insert.length - 1) : insert.substring(1);
      if(SRD35.ABBREVIATIONS[expr])
        expr = SRD35.ABBREVIATIONS[expr];
      if(expr.match(/^L\d*((plus|div|min|max|minus|times)\d+)*$/)) {
        var parsed = expr.match(/L\d*|(plus|div|min|max|minus|times)\d+/g);
        for(var j = 0; parsed[j]; j++) {
          if(parsed[j].startsWith('L')) {
            expr = 'source';
            if(parsed[j].length > 1)
              expr += ' * ' + parsed[j].substring(1);
          } else if(parsed[j].startsWith('plus'))
            expr += ' + ' + parsed[j].substring(4);
          else if(parsed[j].startsWith('minus'))
            expr += ' - ' + parsed[j].substring(5);
          else if(parsed[j].startsWith('div')) {
            if(expr == 'source')
              expr = 'Math.floor(' + expr + ' / ' + parsed[j].substring(3) + ')';
            else
              expr = 'Math.floor((' + expr + ') / ' + parsed[j].substring(3) + ')';
          } else if(parsed[j].startsWith('times')) {
            if(expr == 'source')
              expr = 'source * ' + parsed[j].substring(5);
            else
              expr = '(' + expr + ') * ' + parsed[j].substring(5);
          } else if(parsed[j].startsWith('min'))
            expr = 'Math.min(' + expr + ', ' + parsed[j].substring(3) + ')';
          else if(parsed[j].startsWith('max'))
            expr = 'Math.max(' + expr + ', ' + parsed[j].substring(3) + ')';
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
      description = description.replace(insert, '%' + i);
    }
  }
  var matchInfo;
  if((matchInfo = description.match(/(.*)(\((Fort|Ref|Will))(.*)/)) != null) {
    var index = inserts != null ? inserts.length + 1 : 1;
    var dcRule = 'spells.' + name + '.' + index;
    var schoolNoSpace = school.replace(/\s/g, '');
    description =
      matchInfo[1] + '(DC %' + index + ' ' + matchInfo[3] + matchInfo[4];
    rules.defineRule(dcRule,
      'spells.' + name, '?', null,
      'spellDifficultyClass.' + casterGroup, '=', 'source + ' + level,
      'spellDCSchoolBonus.' + school, '+', null
    );
    if(casterGroup == 'W') {
      rules.defineRule
        (dcRule, 'spellDifficultyClass.S', '^=', 'source + ' + level);
    }
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
    name.charAt(0).toLowerCase() + name.substring(1).replace(/ /g, '');
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
  if(name.match(/Blowgun|Crossbow|Dartgun|Gun/))
    rules.defineRule(prefix + 'DamageModifier', '', '=', '0');
  else if(name.match(/Longbow|Shortbow/))
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
  rules.defineRule(prefix + 'DamageDice',
    'weapons.' + name, '?', null,
    '', '=', '"' + firstDamage + '"',
    'features.Small', '=', '"' + SRD35.SMALL_DAMAGE[firstDamage] + '"',
    'features.Large', '=', '"' + SRD35.LARGE_DAMAGE[firstDamage] + '"'
  );
  rules.defineRule(weaponName + '.2', prefix + 'DamageDice', '=', null);
  rules.defineRule(weaponName + '.3',
    prefix + 'DamageModifier', '=', 'source>0 ? "+" + source : source==0 ? "" : source'
  );

  if(secondDamage) {
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

  if(category == 'Li' || name.match(/^(rapier|whip|spiked chain)$/i)) {
    rules.defineRule
      (prefix + 'AttackModifier', 'combatNotes.weaponFinesse', '+=', null);
  }

  rules.defineChoice('notes',
    'combatNotes.nonproficientWeaponPenalty.' + name + ':%V attack'
  );
  rules.defineRule(prefix + 'AttackModifier',
    'weapons.' + name, '?', null,
    'combatNotes.nonproficientArmorPenalty', '+=', null,
    'combatNotes.nonproficientShieldPenalty', '+=', null,
    'combatNotes.nonproficientWeaponPenalty.' + name, '+=', null
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
      'combatNotes.two-handedWeaponWithBucklerPenalty.' + name, '+', '-1'
    );
    SRD35.prerequisiteRules
      (rules, 'validation', 'two-handedWeapon', 'weapons.' + name,
       'shield =~ \'Buckler|None\'');
  }

};

/*
 * Returns the dictionary of attribute formats associated with character sheet
 * format #viewer# in #rules#.
 */
SRD35.getFormats = function(rules, viewer) {
  var formats = rules.getChoices('notes');
  var result = {};
  var matchInfo;
  if(viewer == 'Collected Notes') {
    for(var format in formats) {
      result[format] = formats[format];
      if((matchInfo = format.match(/Notes\.(.*)$/)) != null) {
        var feature = matchInfo[1];
        feature = feature.charAt(0).toUpperCase() + feature.substring(1).replace(/([A-Z\(])/g, ' $1');
        formats['features.' + feature] = formats[format];
      }
    }
  } else if(viewer == 'Compact') {
    for(var format in formats) {
      if(!format.startsWith('spells.'))
        result[format] = formats[format];
    }
  } else {
    result = formats;
  }
  return result;
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
            {name: 'Alignment', within: 'Section 1', format: '<b>Ali</b> %V'},
            {name: 'Save', within: 'Section 1', separator: '/'},
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
        {name: 'Header', within: '_top'},
          {name: 'Identity', within: 'Header', separator: ''},
            {name: 'Name', within: 'Identity', format: '<b>%V</b>'},
            {name: 'Gender', within: 'Identity', format: ' -- <b>%V</b>'},
            {name: 'Race', within: 'Identity', format: ' <b>%V</b>'},
            {name: 'Levels', within: 'Identity', format: ' <b>%V</b>',
             separator: '/'},
          {name: 'Image Url', within: 'Header', format: '<img src="%V" alt="No Image"/>'},
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
      } else {
        viewer.addElements(
          {name: 'Features', within: 'FeaturePart', separator: '\n', columns: '1L'}
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
      );
      if(name != 'Collected Notes') {
        viewer.addElements(
            {name: 'Combat Notes', within: 'CombatPart', separator: noteSep}
        );
      }
      viewer.addElements(
            {name: 'Save', within: 'CombatPart', separator: listSep},
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
              {name: 'Spells Per Day', within: 'SpellStats', separator:listSep},
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
          {name: 'NotesPart', within: 'Notes Area', separator: '\n'},
            {name: 'CompanionInfo', within: 'NotesPart', separator: ' '},
              {name: 'Animal Companion', within: 'CompanionInfo', separator: ' '},
              {name: 'Animal Companion Name', within: 'CompanionInfo', format: '"%V"'},
            {name: 'Animal Companion Features', within: 'NotesPart', separator: listSep},
            {name: 'Animal Companion Stats', within: 'NotesPart', separator: listSep},
            {name: 'FamiliarInfo', within: 'NotesPart', separator: ' ', format: '<b>Familiar</b>: %V'},
              {name: 'Familiar Enhancement', within: 'FamiliarInfo', format: '%V'},
              {name: 'Familiar', within: 'FamiliarInfo', format: '%V'},
              {name: 'Familiar Name', within: 'FamiliarInfo', format: '"%V"'},
            {name: 'Familiar Features', within: 'NotesPart', separator: listSep},
            {name: 'Familiar Stats', within: 'NotesPart', separator: listSep},
            {name: 'Companion Notes', within: 'NotesPart', separator: listSep},
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
  var result = [];
  if(type == 'Alignment')
    result.push(
      // empty
    );
  if(type == 'Animal Companion' || type == 'Familiar') {
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
      ['Size', 'Size', 'select-one', ['D', 'T', 'S', 'M', 'L', 'H']],
      ['Level', 'Min Master Level', 'select-one', oneToTwenty]
    );
  } else if(type == 'Armor' || type == 'Shield') {
    var zeroToTen = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var zeroToFifty = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    var minusTenToZero = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0];
    result.push(
      ['AC', 'AC Bonus', 'select-one', [0, 1, 2, 3, 4, 5]],
      ['Weight', 'Weight', 'select-one', ['None', 'Light', 'Medium', 'Heavy', 'Tower']],
      ['Dex', 'Max Dex', 'select-one', zeroToTen],
      ['Skill', 'Skill Penalty', 'select-one', minusTenToZero],
      ['Spell', 'Spell Failure', 'select-one', zeroToFifty]
    );
  } else if(type == 'Class') {
    var zeroToTen = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    result.push(
      ['Require', 'Prerequsites', 'text', [40]],
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
      ['SpellAbility', 'Spell Ability', 'select-one', ['charisma', 'constitution', 'dexterity', 'intelligence', 'strength', 'wisdom']],
      ['SpellsPerDay', 'Spells Per Day', 'text', [40]],
      ['Spells', 'Spells', 'text', [40]]
    );
  } else if(type == 'Deity')
    result.push(
      ['Alignment', 'Alignment', 'select-one', QuilvynUtils.getKeys(rules.getChoices('alignments'))],
      ['Weapon', 'Favored Weapon', 'text', [30]],
      ['Domain', 'Domains', 'text', [30]]
    );
  else if(type == 'Domain')
    result.push(
      ['Features', 'Features', 'text', [40]],
      ['Spells', 'Spells', 'text', [40]]
    );
  else if(type == 'Feat')
    result.push(
      ['Require', 'Prerequisites', 'text', [40]],
      ['Imply', 'Implies', 'text', [40]],
      ['Type', 'Types', 'text', [20]]
    );
  else if(type == 'Feature') {
    var sections =
      ['ability', 'combat', 'companion', 'feature', 'magic', 'skill'];
    result.push(
      ['Section', 'Section', 'select-one', sections],
      ['Note', 'Note', 'text', [60]]
    );
  } else if(type == 'Gender')
    result.push(
      // empty
    );
  else if(type == 'Language')
    result.push(
      // empty
    );
  else if(type == 'Race')
    result.push(
      ['Features', 'Features', 'text', [60]],
      ['Selectables', 'Selectables', 'text', [60]],
      ['Languages', 'Languages', 'text', [30]],
      ['SpellAbility', 'Spell Ability', 'select-one',
       ['charisma', 'constitution', 'dexterity', 'intelligence', 'strength',
        'wisdom']],
      ['Spells', 'Spells', 'text', [80]]
    );
  else if(type == 'School')
    result.push(
      ['Features', 'Features', 'text', [40]]
    );
  else if(type == 'Skill')
    result.push(
      ['Ability', 'Ability', 'select-one',
       ['charisma', 'constitution', 'dexterity', 'intelligence', 'strength',
        'wisdom']],
      ['Untrained', 'Untrained', 'select-one', ['Y', 'N']],
      ['Class', 'Class Skill', 'text', [30]],
      ['Synergy', 'Synergy', 'text', [30]]
    );
  else if(type == 'Spell') {
    var zeroToNine = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    result.push(
      ['School', 'School', 'select-one', QuilvynUtils.getKeys(rules.getChoices('schools'))],
      ['Level', 'Caster Group', 'text', [15]],
      ['Level', 'Level', 'select-one', zeroToNine],
      ['Description', 'Description', 'text', [60]]
    );
  } else if(type == 'Weapon') {
    var oneToFive = [1, 2, 3, 4, 5];
    var sixteenToTwenty = [16, 17, 18, 19, 20];
    var zeroToOneFifty =
     [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
    result.push(
      ['Level', 'Group', 'select-one', ['Simple', 'Martial', 'Exotic']],
      ['Category', 'Category', 'select-one',
       ['Unarmed', 'Light', 'One-Handed', 'Two-Handed', 'Ranged']],
      ['Damage', 'Damage', 'select-one',
       QuilvynUtils.getKeys(SRD35.LARGE_DAMAGE)],
      ['Threat', 'Threat', 'select-one', sixteenToTwenty],
      ['Crit', 'Crit Multiplier', 'select-one', oneToFive],
      ['Range', 'Range in Feet', 'select-one', zeroToOneFifty]
    );
  }
  return result
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
    ['selectableFeatures', 'Selectable Features', 'set', 'selectableFeatures'],
    ['skills', 'Skills', 'bag', 'skills'],
    ['languages', 'Languages', 'set', 'languages'],
    ['hitPoints', 'Hit Points', 'text', [4]],
    ['armor', 'Armor', 'select-one', 'armors'],
    ['shield', 'Shield', 'select-one', 'shields'],
    ['weapons', 'Weapons', 'bag', 'weapons'],
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
      attributes['armor'] = choices[QuilvynUtils.random(0, choices.length - 1)];
  } else if(attribute == 'companion') {
    attrs = this.applyRules(attributes);
    var companionAttrs = {
      'features.Animal Companion':'animalCompanion',
      'features.Divine Mount':'animalCompanion', // Pathfinder
      'features.Familiar':'familiar',
      'features.Fiendish Servant':'animalCompanion',
      'features.Special Mount':'animalCompanion'
    };
    for(var attr in companionAttrs) {
      if(!(attr in attrs) ||
         QuilvynUtils.sumMatching(attrs, new RegExp(companionAttrs[attr] + '\\.')) > 0)
        continue;
      choices =
        attr == 'features.Divine Mount' ?
          ['features.Small' in attrs ? 'Pony' : 'Horse'] :
        attr == 'features.Familiar' ?
          QuilvynUtils.getKeys(this.getChoices('familiars')) :
        attr == 'features.Fiendish Servant' ?
          ['Bat', 'Cat', 'Dire Rat', 'Raven', 'Toad',
           'features.Small' in attrs ? 'Pony' : 'Heavy Horse'] :
        attr == 'features.Special Mount' ?
          ['features.Small' in attrs ? 'Pony' : 'Heavy Horse'] :
        QuilvynUtils.getKeys(this.getChoices('animalCompanions'));
      while(true) {
        pickAttrs(attributes, companionAttrs[attr] + '.', choices, 1, 1);
        attrs = this.applyRules(attributes);
        if(attrs['validationNotes.familiar'] == null)
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
    var aliInfo = attributes.alignment.match(/^([CLN])\S+ ([GEN])/);
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
      if(deities[attr].match('=' + aliPat + '\\b'))
        choices.push(attr);
    }
    if(choices.length > 0)
      attributes['deity'] = choices[QuilvynUtils.random(0, choices.length - 1)];
  } else if(attribute == 'feats' || attribute == 'features') {
    var debug = [];
    attribute = attribute == 'feats' ? 'feat' : 'selectableFeature';
    var countPrefix = attribute + 'Count.';
    var prefix = attribute + 's';
    var suffix = attribute.charAt(0).toUpperCase() + attribute.substring(1);
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
        var picks = {};
        pickAttrs(picks, '', choices, howMany, 1);
        debug[debug.length] =
          'From ' + QuilvynUtils.getKeys(picks).join(", ") + ' reject';
        for(var pick in picks) {
          attributes[prefix + '.' + pick] = 1;
          delete availableChoicesInType[pick];
        }
        var validate = this.applyRules(attributes);
        for(var pick in picks) {
          var name = pick.charAt(0).toLowerCase() +
                     pick.substring(1).replace(/ /g, '').
                     replace(/\(/g, '\\(').replace(/\)/g, '\\)');
          if(QuilvynUtils.sumMatching
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
    for(var clas in this.getChoices('levels')) {
      if((attr = attributes['levels.' + clas]) == null)
        continue;
      var matchInfo = QuilvynUtils.getAttrValue(this.getChoices('levels')[clas], 'HitDie').match(/^((\d+)?d)?(\d+)$/);
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
    var assignedLevels = QuilvynUtils.sumMatching(attributes, /^levels\./);
    if(!attributes.level) {
      if(assignedLevels > 0)
        attributes.level = assignedLevels
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
    if(!attributes.experience || attributes.experience < min)
      attributes.experience = QuilvynUtils.random(min, max);
    choices = QuilvynUtils.getKeys(this.getChoices('levels'));
    if(assignedLevels == 0) {
      var classesToChoose =
        attributes.level == 1 || QuilvynUtils.random(1,10) < 9 ? 1 : 2;
      // Find choices that are valid or can be made so
      while(classesToChoose > 0) {
        var which = 'levels.' + choices[QuilvynUtils.random(0,choices.length-1)];
        attributes[which] = 1;
        assignedLevels++;
        classesToChoose--;
      }
    }
    while(assignedLevels < attributes.level) {
      var which = 'levels.' + choices[QuilvynUtils.random(0,choices.length-1)];
      while(!attributes[which]) {
        which = 'levels.' + choices[QuilvynUtils.random(0,choices.length-1)];
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
      attributes['shield'] = choices[QuilvynUtils.random(0, choices.length - 1)];
  } else if(attribute == 'skills') {
    attrs = this.applyRules(attributes);
    var maxPoints = attrs.maxAllowedSkillAllocation;
    howMany =
      attrs.skillPoints - QuilvynUtils.sumMatching(attributes, '^skills\\.'),
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
    var matchInfo;
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
      if((matchInfo = attr.match(/^spellsPerDay\.(.*)/)) == null)
        continue;
      groupAndLevel = matchInfo[1].replace(/^S(\d)/, 'W$1');
      howMany = attrs[attr];
      if(groupAndLevel.match(/^Dom\d/)) {
        choices = [];
        for(var domain in this.getChoices('domains')) {
          if(attrs['features.' + domain + ' Domain'] != null) {
            var domainLevel = domain + groupAndLevel.substring(3);
            if(availableSpellsByLevel[domainLevel] != null) {
              choices = choices.concat(availableSpellsByLevel[domainLevel]);
            }
            howMany -=
              QuilvynUtils.sumMatching(attributes, '^spells.*' + domainLevel);
          }
        }
      } else {
        choices = availableSpellsByLevel[groupAndLevel];
        howMany -=
          QuilvynUtils.sumMatching(attributes, '^spells.*' + groupAndLevel);
      }
      if(howMany > 0 && choices != null)
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
  } else if(attribute == 'charisma' || attribute == 'constitution' ||
     attribute == 'dexterity' || attribute == 'intelligence' ||
     attribute == 'strength' || attribute == 'wisdom') {
    var rolls = [];
    for(i = 0; i < 4; i++)
      rolls[i] = QuilvynUtils.random(1, 6);
    rolls.sort();
    attributes[attribute] = rolls[1] + rolls[2] + rolls[3];
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

      } else if(notes[attr].match(/^(Implies|Requires) /)) {

        var requirements =
          notes[attr].replace(/^(Implies|Requires) /, '').split(/\s*\/\s*/);

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
                        matchInfo[4].replace(/^\s*["']|['"]$/g, '');
          if(targetAttr.match(/^(Max|Sum) /)) {
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
    var notes = attributes.notes;
    attributes.notes =
      (notes != null ? attributes.notes + '\n' : '') + debug.join('\n');
  }

};

/* Returns HTML body content for user notes associated with this rule set. */
SRD35.ruleNotes = function() {
  return '' +
    '<h2>SRD35 Quilvyn Module Notes</h2>\n' +
    'SRD35 Quilvyn Module Version ' + SRD35_VERSION + '\n' +
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
    '    For purposes of computing strength damage bonuses, Quilvyn assumes\n' +
    '    that characters with a buckler wield their weapons one-handed and\n' +
    '    that characters with no buckler or shield wield with both hands.\n' +
    '  </li><li>\n' +
    '    Quilvyn assumes that masterwork composite bows are specially built\n' +
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
    "    class's single simple weapon proficiency.\n" +
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
    "    Quilvyn doesn't support double weapons where the two attacks have\n" +
    '    different critical mutipliers. In the predefined weapons this\n' +
    '    affects only the Gnome Hooked Hammer, where Quilvyn displays a\n' +
    '    critical multiplier of x4 instead of x3/x4.\n' +
    '  </li><li>\n' +
    '    Quilvyn does not track companion feats, skills, and tricks.\n' +
    '  </li><li>\n' +
    '    Quilvyn has problems dealing with attributes containing an\n' +
    '    uncapitalized word.  This is why, e.g., Quilvyn defines the skills\n' +
    '    "Sleight Of Hand" and "Knowledge (Arcana)" instead of "Sleight of\n' +
    '    Hand" and "Knowledge (arcana)".  There are other occasions when\n' +
    '    Quilvyn is picky about case; when defining your own attributes,\n' +
    "    it's safest to follow the conventions Quilvyn uses.\n" +
    '  </li><li>\n' +
    '    Blackguard features of fallen Paladins are not reported.\n' +
    '  </li>\n' +
    '</ul>\n' +
    '</p>\n' +
    '\n' +
    '<h3>Known Bugs</h3>\n' +
    '<p>\n' +
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
    '</p>\n';
};

/*
 * Defines in #rules# the rules associated with with the list #features#. Rules
 * add each feature to #setName# if the value of #levelAttr# is at least equal
 * to the value required for the feature. If #selectable# is true, the user is
 * allowed to select these features for the character, rather than having them
 * assigned automatically.
 */
SRD35.featureListRules = function(
  rules, features, setName, levelAttr, selectable
) {
  var prefix = setName.charAt(0).toLowerCase() +
               setName.slice(1).replace(/ /g, '') + 'Features';
  for(var i = 0; i < features.length; i++) {
    var pieces = features[i].split(':');
    var feature = pieces.length == 2 ? pieces[1] : pieces[0];
    var featureAttr = prefix + '.' + feature;
    var level = pieces.length == 2 ? pieces[0] : '1';
    var conditions = [];
    pieces = level.split(/\s*\?\s*/);
    if(pieces.length == 2) {
      conditions = pieces[0].split('/');
      level = pieces[1];
    }
    if(selectable) {
      var choice = setName + ' - ' + feature;
      rules.defineChoice
        ('selectableFeatures', choice + ':Type="' + setName + '"');
      rules.defineRule(featureAttr, 'selectableFeatures.' + choice, '=', null);
      conditions.push(levelAttr + ' >= ' + level);
      SRD35.prerequisiteRules
        (rules, 'validation', choice.charAt(0).toLowerCase() + choice.slice(1).replace(/ /g, '') + 'SelectableFeature',
         'selectableFeatures.' + choice, conditions);
    } else {
      if(conditions.length > 0) {
        SRD35.prerequisiteRules
          (rules, 'test', featureAttr, levelAttr, conditions);
        rules.defineRule(featureAttr,
         'testNotes.' + featureAttr, '?', 'source == 0 ? 1 : null'
        );
      }
      if(level == '1') {
        rules.defineRule(featureAttr, levelAttr, '=', '1');
      } else {
        rules.defineRule
          (featureAttr, levelAttr, '=', 'source >= ' + level + ' ? 1 : null');
      }
    }
    rules.defineRule('features.' + feature, featureAttr, '+=', null);
    var matchInfo;
    if((matchInfo = feature.match(/^Weapon (Familiarity|Proficiency) \((.*\/.*)\)$/)) != null) {
      // Set individual features for each weapon on the list.
      var weapons = matchInfo[2].split('/');
      for(var j = 0; j < weapons.length; j++) {
        rules.defineRule('features.Weapon '+matchInfo[1]+' ('+weapons[j]+')',
          'features.' + feature, '=', '1'
        );
      }
    }
  }
};

/*
 * Defines in #rules# the rules needed to check, when #attr# is defined, if the
 * list of prerequisites #tests# are met. The results of the tests are computed
 * in the #section# note #noteName#; zero if successful, non-zero otherwise.
 */
SRD35.prerequisiteRules = function(rules, section, noteName, attr, tests) {

  var matchInfo;
  var note = section + 'Notes.' + noteName;
  var verb = section == 'validation' ? 'Requires' : 'Implies';
  var subnote = 0;

  if(typeof(tests) == 'string')
    tests = [tests];

  rules.defineChoice('notes', note + ':' + verb + ' ' + tests.join('/'));
  rules.defineRule(note, attr, '=', -tests.length);

  for(var i = 0; i < tests.length; i++) {
    var alternatives = tests[i].split(/\s*\|\|\s*/);
    var target = note;
    if(alternatives.length > 1) {
      target = note + 'Alt.' + i;
      rules.defineRule(target, '', '=', '0');
      rules.defineRule(note, target, '+', 'source > 0 ? 1 : null');
    }
    for(var j = 0; j < alternatives.length; j++) {
      var test = alternatives[j];
      var matchInfo = test.match(/^(.*\S)\s*(<=|>=|==|!=|<|>|=~|!~)\s*(\S.*)$/);
      if(!matchInfo) {
        rules.defineRule(target, test, '+', '1');
      } else {
        var operand1 = matchInfo[1];
        var operand2 = matchInfo[3];
        var operator = matchInfo[2];
        if((matchInfo = operand1.match(/^(Max|Sum)\s+(.*)$/)) != null) {
          var pat = matchInfo[2].replace(/^["']|['"]$/g, '');
          operand1 = matchInfo[1] + pat;
          rules.defineRule(operand1,
            new RegExp(pat + '.*\\D$'), matchInfo[1]=='Max' ? '^=' : '+=', null
          );
        }
        if(operator == '!~') {
          rules.defineRule(target,
            operand1, '+', 'source.match(' + operand2 + ') ? null : 1'
          );
        } else if(operator == '=~') {
          rules.defineRule(target,
            operand1, '+', 'source.match(' + operand2 + ') ? 1 : null'
          );
        } else if(operand2.match(/^[a-z]/)) {
          subnote++;
          rules.defineRule(note + '.' + subnote,
            operand1, '=', null,
            operand2, '-', null
          );
          rules.defineRule(target,
            note + '.' + subnote, '+', 'source ' + operator + ' 0 ? 1 : null'
          );
        } else {
          rules.defineRule(target,
            operand1, '+', 'source ' + operator + ' ' + operand2 + ' ? 1 : null'
          );
        }
      }
    }
  }

};

/*
 * Defines in #rules# the rules necessary to check that the values of the
 * attributes #available# and #allocated# are equal. Results are stored in
 * the attribute validationNotes.#name#Allocation.
 */
SRD35.validAllocationRules = function(rules, name, available, allocated) {
  var note = 'validationNotes.' + name + 'Allocation';
  rules.defineChoice('notes', note + ':%1 available vs. %2 allocated');
  if(available.startsWith('Sum '))
    available = new RegExp(available.replace(/^Sum *["']|['"]$/g, ''));
  rules.defineRule(note + '.1',
    '', '=', '0',
    available, '+', null
  );
  if(allocated.startsWith('Sum '))
    allocated = new RegExp(allocated.replace(/^Sum *["']|['"]$/g, ''));
  rules.defineRule(note + '.2',
    '', '=', '0',
    allocated, '+', null
  );
  rules.defineRule(note,
    note + '.1', '=', '-source',
    note + '.2', '+=', null
  );
};
