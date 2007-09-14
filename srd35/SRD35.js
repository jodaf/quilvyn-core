/* $Id: SRD35.js,v 1.114 2007/09/14 22:29:31 Jim Exp $ */

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
 * This module loads the rules from the Player's Handbook v3.5 Edition.  The
 * PH35 function contains methods that load rules for particular parts/chapters
 * of the PH; raceRules for character races, magicRules for spells, etc.  These
 * member methods can be called independently in order to use a subset of the
 * PH v3.5 rules.  Similarly, the constant fields of PH35 (ALIGNMENTS, FEATS,
 * etc.) can be manipulated to modify the choices.
 */
function PH35() {
  var rules = new ScribeRules('Core v3.5');
  PH35.viewer = new ObjectViewer();
  PH35.createViewers(rules, PH35.VIEWERS);
  PH35.abilityRules(rules);
  PH35.raceRules(rules, PH35.LANGUAGES, PH35.RACES);
  PH35.classRules(rules, PH35.CLASSES);
  PH35.companionRules(rules, PH35.COMPANIONS);
  PH35.skillRules(rules, PH35.SKILLS, PH35.SUBSKILLS);
  PH35.featRules(rules, PH35.FEATS, PH35.SUBFEATS);
  PH35.descriptionRules(rules, PH35.ALIGNMENTS, PH35.DEITIES, PH35.GENDERS);
  PH35.equipmentRules
    (rules, PH35.ARMORS, PH35.GOODIES, PH35.SHIELDS, PH35.WEAPONS);
  PH35.combatRules(rules);
  PH35.adventuringRules(rules);
  PH35.magicRules(rules, PH35.CLASSES, PH35.DOMAINS, PH35.SCHOOLS);
  rules.defineChoice('preset', 'race', 'levels');
  rules.defineChoice('random', PH35.RANDOMIZABLE_ATTRIBUTES);
  rules.editorElements = PH35.initialEditorElements();
  rules.randomizeOneAttribute = PH35.randomizeOneAttribute;
  rules.makeValid = PH35.makeValid;
  Scribe.addRuleSet(rules);
  PH35.rules = rules;
}

// JavaScript expressions for several (mostly class-based) attributes.
PH35.ATTACK_BONUS_GOOD = 'source';
PH35.ATTACK_BONUS_AVERAGE = 'source - Math.floor((source + 3) / 4)';
PH35.ATTACK_BONUS_POOR = 'Math.floor(source / 2)'
PH35.PROFICIENCY_HEAVY = '3';
PH35.PROFICIENCY_LIGHT = '1';
PH35.PROFICIENCY_MEDIUM = '2';
PH35.PROFICIENCY_NONE = '0';
PH35.PROFICIENCY_TOWER = '4';
PH35.SAVE_BONUS_GOOD = '2 + Math.floor(source / 2)';
PH35.SAVE_BONUS_POOR = 'Math.floor(source / 3)';

// Arrays of choices
PH35.ALIGNMENTS = [
  'Chaotic Evil', 'Chaotic Good', 'Chaotic Neutral', 'Neutral', 'Neutral Evil',
  'Neutral Good', 'Lawful Evil', 'Lawful Good', 'Lawful Neutral'
];
PH35.ARMORS = [
  'None', 'Padded', 'Leather', 'Studded Leather', 'Chain Shirt', 'Hide',
  'Scale Mail', 'Chainmail', 'Breastplate', 'Splint Mail', 'Banded Mail',
  'Half Plate', 'Full Plate'
];
PH35.CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin',
  'Ranger', 'Rogue', 'Sorcerer', 'Wizard'
];
PH35.COMPANIONS = ['Animal Companion', 'Familiar', 'Mount'];
PH35.DEITIES = [
  'Boccob (N Magic):Knowledge/Magic/Trickery',
  'Corellon Larethian (CG Elves):Chaos/Good/Protection/War',
  'Ehlonna (NG Woodlands):Animal/Good/Plant/Sun',
  'Erythnul (CE Slaughter):Chaos/Evil/Trickery/War',
  'Fharlanghn (N Roads):Luck/Protection/Travel',
  'Garl Glittergold (NG Gnomes):Good/Protection/Trickery',
  'Gruumsh (CE Orcs):Chaos/Evil/Strength/War',
  'Heironeous (LG Valor):Good/Law/War',
  'Hextor (LE Tyranny):Destruction/Evil/Law/War',
  'Kord (CG Strength):Chaos/Good/Luck/Strength',
  'Moradin (LG Dwarves):Earth/Good/Law/Protection',
  'Nerull (NE Death):Death/Evil/Trickery',
  'Obad-Hai (N Nature):Air/Animal/Earth/Fire/Plant/Water',
  'Olidammara (CN Thieves):Chaos/Luck/Trickery',
  'Pelor (NG Sun):Good/Healing/Strength/Sun',
  'St. Cuthbert (LN Retribution):Destruction/Law/Protection/Strength',
  'Wee Jas (LN Death And Magic):Death/Law/Magic',
  'Yondalla (LG Halflings):Good/Law/Protection',
  'Vecna (NE Secrets):Evil/Knowledge/Magic',
  'None:'
];
PH35.DOMAINS = [
  'Air', 'Animal', 'Chaos', 'Death', 'Destruction', 'Earth', 'Evil', 'Fire',
  'Good', 'Healing', 'Knowledge', 'Law', 'Luck', 'Magic', 'Plant',
  'Protection', 'Strength', 'Sun', 'Travel', 'Trickery', 'War', 'Water'
];
PH35.FEATS = [
  'Acrobatic:', 'Agile:', 'Alertness:', 'Animal Affinity:',
  'Armor Proficiency:', 'Athletic:', 'Augment Summoning:',
  'Blind Fight:Fighter', 'Brew Potion:Item Creation', 'Cleave:Fighter',
  'Combat Casting:', 'Combat Expertise:Fighter', 'Combat Reflexes:Fighter',
  'Craft Magic Arms And Armor:Item Creation', 'Craft Rod:Item Creation',
  'Craft Staff:Item Creation', 'Craft Wand:Item Creation',
  'Craft Wondrous Item:Item Creation', 'Deceitful:', 'Deflect Arrows:Fighter',
  'Deft Hands:', 'Diehard:', 'Diligent:', 'Dodge:Fighter',
  'Empower Spell:Metamagic', 'Endurance:', 'Enlarge Spell:Metamagic',
  'Eschew Materials:', 'Extend Spell:Metamagic', 'Extra Turning:',
  'Far Shot:Fighter', 'Forge Ring:Item Creation', 'Great Cleave:Fighter',
  'Great Fortitude:', 'Greater Spell Focus:', 'Greater Spell Penetration:',
  'Greater Two Weapon Fighting:Fighter', 'Greater Weapon Focus:Fighter',
  'Greater Weapon Specialization:Fighter', 'Heighten Spell:Metamagic',
  'Improved Bull Rush:Fighter', 'Improved Counterspell:',
  'Improved Critical:Fighter', 'Improved Disarm:Fighter',
  'Improved Feint:Fighter', 'Improved Grapple:Fighter',
  'Improved Initiative:Fighter', 'Improved Overrun:Fighter',
  'Improved Precise Shot:Fighter', 'Improved Shield Bash:Fighter',
  'Improved Sunder:Fighter', 'Improved Trip:Fighter', 'Improved Turning:',
  'Improved Two Weapon Fighting:Fighter', 'Improved Unarmed Strike:Fighter',
  'Investigator:', 'Iron Will:', 'Leadership:', 'Lightning Reflexes:',
  'Magical Aptitude:', 'Manyshot:Fighter', 'Maximize Spell:Metamagic',
  'Mobility:Fighter', 'Mounted Archery:Fighter', 'Mounted Combat:Fighter',
  'Natural Spell:', 'Negotiator:', 'Nimble Fingers:', 'Persuasive:',
  'Point Blank Shot:Fighter', 'Power Attack:Fighter', 'Precise Shot:Fighter',
  'Quick Draw:Fighter', 'Quicken Spell:Metamagic', 'Rapid Reload:Fighter',
  'Rapid Shot:Fighter', 'Ride By Attack:Fighter', 'Run:',
  'Scribe Scroll:Item Creation', 'Self Sufficient:', 'Shield Proficiency:',
  'Shot On The Run:Fighter', 'Silent Spell:Metamagic', 'Skill Focus:',
  'Snatch Arrows:Fighter', 'Spell Focus:', 'Spell Mastery:',
  'Spell Penetration:', 'Spirited Charge:Fighter', 'Spring Attack:Fighter',
  'Stealthy:', 'Still Spell:Metamagic', 'Stunning Fist:Fighter', 'Toughness:',
  'Track:', 'Trample:Fighter', 'Two Weapon Defense:Fighter',
  'Two Weapon Fighting:Fighter', 'Weapon Finesse:Fighter',
  'Weapon Focus:Fighter', 'Weapon Proficiency:',
  'Weapon Specialization:Fighter', 'Whirlwind Attack:Fighter',
  'Widen Spell:Metamagic'
];
PH35.GENDERS = ['Female', 'Male'];
PH35.GOODIES = [
  'Ring Of Protection +1',
  'Ring Of Protection +2',
  'Ring Of Protection +3',
  'Ring Of Protection +4'
];
PH35.LANGUAGES = [
  'Abyssal', 'Aquan', 'Avian', 'Celestial', 'Common', 'Draconic', 'Druidic',
  'Dwarven', 'Elven', 'Giant', 'Gnoll', 'Gnome', 'Goblin', 'Halfling',
  'Ignan', 'Infernal', 'Orc', 'Sylvan', 'Terran', 'Undercommon'
];
PH35.RACES =
  ['Dwarf', 'Elf', 'Gnome', 'Half Elf', 'Half Orc', 'Halfling', 'Human'];
// Note: the order here handles dependencies among attributes when generating
// random characters
PH35.RANDOMIZABLE_ATTRIBUTES = [
  'charisma', 'constitution', 'dexterity', 'intelligence', 'strength', 'wisdom',
  'name', 'race', 'gender', 'alignment', 'deity', 'levels', 'domains',
  'features', 'feats', 'skills', 'languages', 'hitPoints', 'armor', 'shield',
  'weapons', 'spells', 'goodies'
];
PH35.SCHOOLS = [
  'Abjuration:Abju', 'Conjuration:Conj', 'Divination:Divi', 'Enchantment:Ench',
  'Evocation:Evoc', 'Illusion:Illu', 'Necromancy:Necr', 'Transmutation:Tran'
];
PH35.SHIELDS = [
  'Buckler', 'Heavy Steel', 'Heavy Wooden', 'Light Steel', 'Light Wooden',
  'None', 'Tower'
];
PH35.SKILLS = [
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
PH35.SUBFEATS = {
  'Armor Proficiency':'Heavy/Light/Medium',
  'Greater Spell Focus':'',
  'Greater Weapon Focus':'',
  'Greater Weapon Specialization':'',
  'Improved Critical':'',
  'Rapid Reload':'Hand/Heavy/Light',
  'Shield Proficiency':'Heavy/Tower',
  'Skill Focus':'',
  'Spell Focus':'',
  'Weapon Focus':'',
  'Weapon Proficiency':'Simple',
  'Weapon Specialization':'Dwarven Waraxe/Longsword'
};
PH35.SUBSKILLS = {
  'Craft':'',
  'Knowledge':'Arcana/Architecture/Dungeoneering/Engineering/Geography/' +
              'History/Local/Nature/Nobility/Planes/Religion',
  'Perform':'Act/Comedy/Dance/Keyboard/Oratory/Percussion/Sing/String/Wind',
  'Profession':''
};
PH35.VIEWERS = ['Compact', 'Standard', 'Vertical'];
PH35.WEAPONS = [
  'Bastard Sword:d10@19', 'Battleaxe:d8x3', 'Bolas:d4r10', 'Club:d6r10',
  'Composite Longbow:d8x3r110', 'Composite Shortbow:d6x3r70',
  'Dagger:d4@19r10', 'Dart:d4r20', 'Dire Flail:d8/d8',
  'Dwarven Urgosh:d8x3/d6x3', 'Dwarven Waraxe:d10x3', 'Falchion:2d4@18',
  'Gauntlet:d3', 'Glaive:d10x3', 'Gnome Hooked Hammer:d8x3/d6x4',
  'Greataxe:d12x3', 'Greatclub:d10', 'Greatsword:2d6@19', 'Guisarme:2d4x3',
  'Halberd:d10x3', 'Handaxe:d6x3', 'Hand Crossbow:d4@19r30',
  'Heavy Crossbow:d10@19r120', 'Heavy Flail:d10@19', 'Heavy Mace:d8',
  'Heavy Pick:d6', 'Heavy Shield:d4', 'Heavy Spiked Shield:d6',
  'Javelin:d6r30', 'Kama:d6', 'Kukri:d4@18', 'Lance:d8x3',
  'Light Crossbow:d8@19r80', 'Light Flail:d8', 'Light Hammer:d4r20',
  'Light Mace:d6', 'Light Pick:d4x4', 'Light Shield:d3',
  'Light Spiked Shield:d4', 'Longbow:d8x3r100', 'Longspear:d8x3',
  'Longsword:d8@19', 'Morningstar:d8', 'Net:d0r10', 'Nunchaku:d6',
  'Orc Double Axe:d8/d8', 'Punching Dagger:d4x3', 'Quarterstaff:d6/d6',
  'Rapier:d6@18', 'Ranseur:2d4x3', 'Repeating Heavy Crossbow:d10@19r120',
  'Repeating Light Crossbow:d8@19r80', 'Sai:d4r10', 'Sap:d6', 'Scimitar:d6@18',
  'Scythe:2d4x4', 'Short Sword:d6@19', 'Shortbow:d6x3r60', 'Shortspear:d6r20',
  'Shuriken:d2r10', 'Siangham:d6', 'Sickle:d6', 'Sling:d4r50', 'Spear:d8r20',
  'Spiked Chain:2d4', 'Spiked Gauntlet:d4', 'Throwing Axe:d6r10',
  'Trident:d8r10', 'Two-Bladed Sword:d8@19/d8@19', 'Unarmed:d3',
  'Warhammer:d8x3', 'Whip:d3'
];

// Related information used internally by PH35
PH35.armorsArcaneSpellFailurePercentages = {
  'None': null, 'Padded': 5, 'Leather': 10, 'Studded Leather': 15,
  'Chain Shirt': 20, 'Hide': 20, 'Scale Mail': 25, 'Chainmail': 30,
  'Breastplate': 25, 'Splint Mail': 40, 'Banded Mail': 35, 'Half Plate': 40,
  'Full Plate': 35
};
PH35.armorsArmorClassBonuses = {
  'None': null, 'Padded': 1, 'Leather': 2, 'Studded Leather': 3,
  'Chain Shirt': 4, 'Hide': 3, 'Scale Mail': 4, 'Chainmail': 5,
  'Breastplate': 5, 'Splint Mail': 6, 'Banded Mail': 6, 'Half Plate': 7,
  'Full Plate': 8
};
PH35.armorsMaxDexBonuses = {
  'None': null, 'Padded': 8, 'Leather': 6, 'Studded Leather': 5,
  'Chain Shirt': 4, 'Hide': 4, 'Scale Mail': 3, 'Chainmail': 2,
  'Breastplate': 3, 'Splint Mail': 0, 'Banded Mail': 1, 'Half Plate': 0,
  'Full Plate': 1
};
PH35.armorsSkillCheckPenalties = {
  'None': null, 'Padded': null, 'Leather': null, 'Studded Leather': -1,
  'Chain Shirt': -2, 'Hide': -3, 'Scale Mail': -4, 'Chainmail': -5,
  'Breastplate': -4, 'Splint Mail': -7, 'Banded Mail': -6, 'Half Plate': -7,
  'Full Plate': -6
};
PH35.armorsWeightClasses = {
  'None': 'Light', 'Padded': 'Light', 'Leather': 'Light',
  'Studded Leather': 'Light', 'Chain Shirt': 'Light', 'Hide': 'Medium',
  'Scale Mail': 'Medium', 'Chainmail': 'Medium', 'Breastplate': 'Medium',
  'Splint Mail': 'Heavy', 'Banded Mail': 'Heavy', 'Half Plate': 'Heavy',
  'Full Plate': 'Heavy'
};
PH35.deitiesFavoredWeapons = {
  'Corellon Larethian (CG Elves)': 'Longsword',
  'Erythnul (CE Slaughter)': 'Morningstar',
  'Gruumsh (CE Orcs)': 'Spear',
  'Heironeous (LG Valor)': 'Longsword',
  'Hextor (LE Tyranny)': 'Heavy Flail/Light Flail'
};
PH35.proficiencyLevelNames = ["None", "Light", "Medium", "Heavy", "Tower"];
PH35.spellsSchools = {
  'Acid Fog':'Conjuration', 'Acid Splash':'Conjuration',
  'Aid':'Enchantment', 'Air Walk':'Transmutation',
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
  'Bigby\'s Clenched Fist':'Evocation', 'Bigby\'s Crushing Hand':'Evocation',
  'Bigby\'s Forceful Hand':'Evocation', 'Bigby\'s Grasping Hand':'Evocation',
  'Bigby\'s Interposing Hand':'Evocation', 'Binding':'Enchantment',
  'Blade Barrier':'Evocation', 'Blasphemy':'Evocation',
  'Bless':'Enchantment', 'Bless Water':'Transmutation',
  'Bless Weapon':'Transmutation', 'Blight':'Necromancy',
  'Blindness/Deafness':'Necromancy', 'Blink':'Transmutation',
  'Blur':'Illusion', 'Break Enchantment':'Abjuration',
  'Bull\'s Strength':'Transmutation', 'Burning Hands':'Evocation',
  'Call Lightning':'Evocation', 'Call Lightning Storm':'Evocation',
  'Calm Animals':'Enchantment', 'Calm Emotions':'Enchantment',
  'Cat\'s Grace':'Transmutation', 'Cause Fear':'Necromancy',
  'Chain Lightning':'Evocation', 'Changestaff':'Transmutation',
  'Chaos Hammer':'Evocation', 'Charm Animal':'Enchantment',
  'Charm Monster':'Enchantment', 'Charm Person':'Enchantment',
  'Chill Metal':'Transmutation', 'Chill Touch':'Necromancy',
  'Circle Of Death':'Necromancy', 'Clairaudience/Clairvoyance':'Divination',
  'Cloak Of Chaos':'Abjuration', 'Clone':'Necromancy',
  'Cloudkill':'Conjuration', 'Color Spray':'Illusion',
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
  'Cure Critical Wounds':'Conjuration', 'Cure Light Wounds':'Conjuration',
  'Cure Minor Wounds':'Conjuration', 'Cure Moderate Wounds':'Conjuration',
  'Cure Serious Wounds':'Conjuration', 'Curse Water':'Necromancy',
  'Dancing Lights':'Evocation', 'Darkness':'Evocation',
  'Darkvision':'Transmutation', 'Daylight':'Evocation',
  'Daze':'Enchantment', 'Daze Monster':'Enchantment',
  'Death Knell':'Necromancy', 'Death Ward':'Necromancy',
  'Deathwatch':'Necromancy', 'Deep Slumber':'Enchantment',
  'Deeper Darkness':'Evocation', 'Delay Poison':'Conjuration',
  'Delayed Blast Fireball':'Evocation', 'Demand':'Enchantment',
  'Desecrate':'Evocation', 'Destruction':'Necromancy',
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
  'Doom':'Necromancy', 'Drawmij\'s Instant Summons':'Conjuration',
  'Dream':'Illusion', 'Eagle\'s Splendor':'Transmutation',
  'Earthquake':'Evocation', 'Elemental Swarm':'Conjuration',
  'Endure Elements':'Abjuration', 'Energy Drain':'Necromancy',
  'Enervation':'Necromancy', 'Enlarge Person':'Transmutation',
  'Entangle':'Transmutation', 'Enthrall':'Enchantment',
  'Entropic Shield':'Abjuration', 'Erase':'Transmutation',
  'Ethereal Jaunt':'Transmutation', 'Etherealness':'Transmutation',
  'Evard\'s Black Tentacles':'Conjuration', 'Expeditious Retreat':'Transmutation',
  'Explosive Runes':'Abjuration', 'Eyebite':'Necromancy',
  'Fabricate':'Transmutation', 'Faerie Fire':'Evocation',
  'False Life':'Necromancy', 'False Vision':'Illusion',
  'Fear':'Necromancy', 'Feather Fall':'Transmutation',
  'Feeblemind':'Enchantment', 'Find The Path':'Divination',
  'Find Traps':'Divination', 'Finger Of Death':'Necromancy',
  'Fire Seeds':'Conjuration', 'Fire Shield':'Evocation',
  'Fire Storm':'Evocation', 'Fire Trap':'Abjuration',
  'Fireball':'Evocation', 'Flame Arrow':'Transmutation',
  'Flame Blade':'Evocation', 'Flame Strike':'Evocation',
  'Flaming Sphere':'Evocation', 'Flare':'Evocation',
  'Flesh To Stone':'Transmutation', 'Fly':'Transmutation',
  'Fog Cloud':'Conjuration', 'Forbiddance':'Abjuration',
  'Forcecage':'Evocation', 'Foresight':'Divination',
  'Fox\'s Cunning':'Transmutation', 'Freedom':'Abjuration',
  'Freedom Of Movement':'Abjuration', 'Gaseous Form':'Transmutation',
  'Gate':'Conjuration', 'Geas/Quest':'Enchantment',
  'Gentle Repose':'Necromancy', 'Ghost Sound':'Illusion',
  'Ghoul Touch':'Necromancy', 'Giant Vermin':'Transmutation',
  'Glibness':'Transmutation', 'Glitterdust':'Conjuration',
  'Globe Of Invulnerability':'Abjuration', 'Glyph Of Warding':'Abjuration',
  'Good Hope':'Enchantment', 'Goodberry':'Transmutation',
  'Grease':'Conjuration', 'Greater Arcane Sight':'Divination',
  'Greater Command':'Enchantment', 'Greater Dispel Magic':'Abjuration',
  'Greater Glyph Of Warding':'Abjuration', 'Greater Heroism':'Enchantment',
  'Greater Invisibility':'Illusion', 'Greater Magic Fang':'Transmutation',
  'Greater Magic Weapon':'Transmutation', 'Greater Planar Ally':'Conjuration',
  'Greater Planar Binding':'Conjuration', 'Greater Prying Eyes':'Divination',
  'Greater Restoration':'Conjuration', 'Greater Scrying':'Divination',
  'Greater Shadow Conjuration':'Illusion', 'Greater Shadow Evocation':'Illusion',
  'Greater Shout':'Evocation', 'Greater Spell Immunity':'Abjuration',
  'Greater Teleport':'Conjuration', 'Guards And Wards':'Abjuration',
  'Guidance':'Divination', 'Gust Of Wind':'Evocation',
  'Hallow':'Evocation', 'Hallucinatory Terrain':'Illusion',
  'Halt Undead':'Necromancy', 'Harm':'Necromancy',
  'Haste':'Transmutation', 'Heal':'Conjuration',
  'Heal Mount':'Conjuration', 'Heat Metal':'Transmutation',
  'Helping Hand':'Evocation', 'Heroes\' Feast':'Conjuration',
  'Heroism':'Enchantment', 'Hide From Animals':'Abjuration',
  'Hide From Undead':'Abjuration', 'Hold Animal':'Enchantment',
  'Hold Monster':'Enchantment', 'Hold Person':'Enchantment',
  'Hold Portal':'Abjuration', 'Holy Aura':'Abjuration',
  'Holy Smite':'Evocation', 'Holy Sword':'Evocation',
  'Holy Word':'Evocation', 'Horrid Wilting':'Necromancy',
  'Hypnotic Pattern':'Illusion', 'Hypnotism':'Enchantment',
  'Ice Storm':'Evocation', 'Identify':'Divination',
  'Illusory Script':'Illusion', 'Illusionary Wall':'Illusion',
  'Imbue With Spell Ability':'Evocation', 'Implosion':'Evocation',
  'Imprisonment':'Abjuration', 'Incendiary Cloud':'Conjuration',
  'Inflict Critical Wounds':'Necromancy', 'Inflict Light Wounds':'Necromancy',
  'Inflict Minor Wounds':'Necromancy', 'Inflict Moderate Wounds':'Necromancy',
  'Inflict Serious Wounds':'Necromancy', 'Insanity':'Enchantment',
  'Insect Plague':'Conjuration', 'Invisibility':'Illusion',
  'Invisibility Purge':'Evocation', 'Invisibility Sphere':'Illusion',
  'Iron Body':'Transmutation', 'Ironwood':'Transmutation',
  'Jump':'Transmutation', 'Keen Edge':'Transmutation',
  'Knock':'Transmutation', 'Know Direction':'Divination',
  'Legend Lore':'Divination', 'Leomund\'s Secret Chest':'Conjuration',
  'Leomund\'s Secure Shelter':'Conjuration', 'Leomund\'s Tiny Hut':'Evocation',
  'Leomund\'s Trap':'Illusion', 'Lesser Confusion':'Enchantment',
  'Lesser Geas':'Enchantment', 'Lesser Globe Of Invulnerability':'Abjuration',
  'Lesser Planar Ally':'Conjuration', 'Lesser Planar Binding':'Conjuration',
  'Lesser Restoration':'Conjuration', 'Levitate':'Transmutation',
  'Light':'Evocation', 'Lightning Bolt':'Evocation',
  'Limited Wish':'Universal', 'Liveoak':'Transmutation',
  'Locate Creature':'Divination', 'Locate Object':'Divination',
  'Longstrider':'Transmutation', 'Lullaby':'Enchantment',
  'Mage Armor':'Conjuration', 'Mage Hand':'Transmutation',
  'Magic Circle Against Chaos':'Abjuration', 'Magic Circle Against Evil':'Abjuration',
  'Magic Circle Against Good':'Abjuration', 'Magic Circle Against Law':'Abjuration',
  'Magic Fang':'Transmutation', 'Magic Jar':'Necromancy',
  'Magic Missile':'Evocation', 'Magic Mouth':'Illusion',
  'Magic Stone':'Transmutation', 'Magic Vestment':'Transmutation',
  'Magic Weapon':'Transmutation', 'Major Creation':'Conjuration',
  'Major Image':'Illusion', 'Make Whole':'Transmutation',
  'Mark Of Justice':'Necromancy', 'Mass Bear\'s Endurance':'Transmutation',
  'Mass Bull\'s Strength':'Transmutation', 'Mass Cat\'s Grace':'Transmutation',
  'Mass Charm Monster':'Enchantment', 'Mass Cure Critical Wounds':'Conjuration',
  'Mass Cure Light Wounds':'Conjuration', 'Mass Cure Moderate Wounds':'Conjuration',
  'Mass Cure Serious Wounds':'Conjuration', 'Mass Eagle\'s Splendor':'Transmutation',
  'Mass Enlarge Person':'Transmutation', 'Mass Fox\'s Cunning':'Transmutation',
  'Mass Heal':'Conjuration', 'Mass Hold Monster':'Enchantment',
  'Mass Hold Person':'Enchantment', 'Mass Inflict Critical Wounds':'Necromancy',
  'Mass Inflict Light Wounds':'Necromancy', 'Mass Inflict Moderate Wounds':'Necromancy',
  'Mass Inflict Serious Wounds':'Necromancy', 'Mass Invisibility':'Illusion',
  'Mass Owl\'s Wisdom':'Transmutation', 'Mass Reduce Person':'Transmutation',
  'Mass Suggestion':'Enchantment', 'Maze':'Conjuration',
  'Meld Into Stone':'Transmutation', 'Melf\'s Acid Arrow':'Conjuration',
  'Mending':'Transmutation', 'Message':'Transmutation',
  'Meteor Swarm':'Evocation', 'Mind Blank':'Abjuration',
  'Mind Fog':'Enchantment', 'Minor Creation':'Conjuration',
  'Minor Image':'Illusion', 'Miracle':'Evocation',
  'Mirage Arcana':'Illusion', 'Mirror Image':'Illusion',
  'Misdirection':'Illusion', 'Mislead':'Illusion',
  'Modify Memory':'Enchantment', 'Moment Of Prescience':'Divination',
  'Mordenkainen\'s Disjunction':'Abjuration', 'Mordenkainen\'s Faithful Hound':'Conjuration',
  'Mordenkainen\'s Lucubration':'Transmutation', 'Mordenkainen\'s Magnificent Mansion':'Conjuration',
  'Mordenkainen\'s Private Sanctum':'Abjuration', 'Mordenkainen\'s Sword':'Evocation',
  'Mount':'Conjuration', 'Move Earth':'Transmutation',
  'Neutralize Poison':'Conjuration', 'Nightmare':'Illusion',
  'Nondetection':'Abjuration', 'Nystul\'s Magic Aura':'Illusion',
  'Obscure Object':'Abjuration', 'Obscuring Mist':'Conjuration',
  'Open/Close':'Transmutation', 'Order\'s Wrath':'Evocation',
  'Otiluke\'s Freezing Sphere':'Evocation', 'Otiluke\'s Resilient Sphere':'Evocation',
  'Otiluke\'s Telekinetic Sphere':'Evocation', 'Otto\'s Irresistible Dance':'Enchantment',
  'Overland Flight':'Transmutation', 'Owl\'s Wisdom':'Transmutation',
  'Pass Without Trace':'Transmutation', 'Passwall':'Transmutation',
  'Permanency':'Universal', 'Permanent Image':'Illusion',
  'Persistent Image':'Illusion', 'Phantasmal Killer':'Illusion',
  'Phantom Steed':'Conjuration', 'Phase Door':'Conjuration',
  'Planar Ally':'Conjuration', 'Planar Binding':'Conjuration',
  'Plane Shift':'Conjuration', 'Plant Growth':'Transmutation',
  'Poison':'Necromancy', 'Polar Ray':'Evocation',
  'Polymorph':'Transmutation', 'Polymorph Any Object':'Transmutation',
  'Power Word, Blind':'Enchantment', 'Power Word, Kill':'Enchantment',
  'Power Word, Stun':'Enchantment', 'Prayer':'Enchantment',
  'Prestidigitation':'Universal', 'Prismatic Sphere':'Abjuration',
  'Prismatic Spray':'Evocation', 'Prismatic Wall':'Abjuration',
  'Produce Flame':'Evocation', 'Programmed Image':'Illusion',
  'Project Image':'Illusion', 'Protection From Arrows':'Abjuration',
  'Protection From Chaos':'Abjuration', 'Protection From Energy':'Abjuration',
  'Protection From Evil':'Abjuration', 'Protection From Good':'Abjuration',
  'Protection From Law':'Abjuration', 'Protection From Spells':'Abjuration',
  'Prying Eyes':'Divination', 'Purify Food And Drink':'Transmutation',
  'Pyrotechnics':'Transmutation', 'Quench':'Transmutation',
  'Rage':'Enchantment', 'Rainbow Pattern':'Illusion',
  'Raise Dead':'Conjuration', 'Rary\'s Mnemonic Enhancer':'Transmutation',
  'Rary\'s Telepathic Bond':'Divination', 'Ray Of Enfeeblement':'Necromancy',
  'Ray Of Exhaustion':'Necromancy', 'Ray Of Frost':'Evocation',
  'Read Magic':'Divination', 'Reduce Animal':'Transmutation',
  'Reduce Person':'Transmutation', 'Refuge':'Conjuration',
  'Regenerate':'Conjuration', 'Reincarnate':'Transmutation',
  'Remove Blindness/Deafness':'Conjuration', 'Remove Curse':'Abjuration',
  'Remove Disease':'Conjuration', 'Remove Fear':'Abjuration',
  'Remove Paralysis':'Conjuration', 'Repel Metal Or Stone':'Abjuration',
  'Repel Vermin':'Abjuration', 'Repel Wood':'Transmutation',
  'Repulsion':'Abjuration', 'Resist Energy':'Abjuration',
  'Resistance':'Abjuration', 'Restoration':'Conjuration',
  'Resurrection':'Conjuration', 'Reverse Gravity':'Transmutation',
  'Righteous Might':'Transmutation', 'Rope Trick':'Transmutation',
  'Rusting Grasp':'Transmutation', 'Sanctuary':'Abjuration',
  'Scare':'Necromancy', 'Scintillating Pattern':'Illusion',
  'Scorching Ray':'Evocation', 'Screen':'Illusion',
  'Scrying':'Divination', 'Sculpt Sound':'Transmutation',
  'Searing Light':'Evocation', 'Secret Page':'Transmutation',
  'See Invisibility':'Divination', 'Seeming':'Illusion',
  'Sending':'Evocation', 'Sepia Snake Sigil':'Conjuration',
  'Sequester':'Abjuration', 'Shades':'Illusion',
  'Shadow Conjuration':'Illusion', 'Shadow Evocation':'Illusion',
  'Shadow Walk':'Illusion', 'Shambler':'Conjuration',
  'Shapechange':'Transmutation', 'Shatter':'Evocation',
  'Shield':'Abjuration', 'Shield Of Faith':'Abjuration',
  'Shield Of Law':'Abjuration', 'Shield Other':'Abjuration',
  'Shillelagh':'Transmutation', 'Shocking Grasp':'Evocation',
  'Shout':'Evocation', 'Shrink Item':'Transmutation',
  'Silence':'Illusion', 'Silent Image':'Illusion',
  'Simulacrum':'Illusion', 'Slay Living':'Necromancy',
  'Sleep':'Enchantment', 'Sleet Storm':'Conjuration',
  'Slow':'Transmutation', 'Snare':'Transmutation',
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
  'Summon Nature\'s Ally I':'Conjuration', 'Summon Nature\'s Ally II':'Conjuration',
  'Summon Nature\'s Ally III':'Conjuration', 'Summon Nature\'s Ally IV':'Conjuration',
  'Summon Nature\'s Ally IX':'Conjuration', 'Summon Nature\'s Ally V':'Conjuration',
  'Summon Nature\'s Ally VI':'Conjuration', 'Summon Nature\'s Ally VII':'Conjuration',
  'Summon Nature\'s Ally VIII':'Conjuration', 'Summon Swarm':'Conjuration',
  'Sunbeam':'Evocation', 'Sunburst':'Evocation',
  'Symbol Of Death':'Necromancy', 'Symbol Of Fear':'Necromancy',
  'Symbol Of Insanity':'Enchantment', 'Symbol Of Pain':'Necromancy',
  'Symbol Of Persuasion':'Enchantment', 'Symbol Of Sleep':'Enchantment',
  'Symbol Of Stunning':'Enchantment', 'Symbol Of Weakness':'Necromancy',
  'Sympathetic Vibration':'Evocation', 'Sympathy':'Enchantment',
  'Tasha\'s Hideous Laughter':'Enchantment', 'Telekinesis':'Transmutation',
  'Teleport':'Conjuration', 'Teleport Object':'Conjuration',
  'Teleportation Circle':'Conjuration', 'Temporal Stasis':'Transmutation',
  'Tenser\'s Floating Disk':'Evocation', 'Tenser\'s Transformation':'Transmutation',
  'Time Stop':'Transmutation', 'Tongues':'Divination',
  'Touch Of Fatigue':'Necromancy', 'Touch Of Idiocy':'Enchantment',
  'Transmute Metal To Wood':'Transmutation', 'Transmute Mud To Rock':'Transmutation',
  'Transmute Rock To Mud':'Transmutation', 'Transport Via Plants':'Transmutation',
  'Trap The Soul':'Conjuration', 'Tree Shape':'Transmutation',
  'Tree Stride':'Conjuration', 'True Resurrection':'Conjuration',
  'True Seeing':'Divination', 'True Strike':'Divination',
  'Undeath To Death':'Necromancy', 'Undetectable Alignment':'Abjuration',
  'Unhallow':'Evocation', 'Unholy Aura':'Abjuration',
  'Unholy Blight':'Evocation', 'Unseen Servant':'Conjuration',
  'Vampiric Touch':'Necromancy', 'Veil':'Illusion',
  'Ventriloquism':'Illusion', 'Virtue':'Transmutation',
  'Vision':'Divination', 'Wail Of The Banshee':'Necromancy',
  'Wall Of Fire':'Evocation', 'Wall Of Force':'Evocation',
  'Wall Of Ice':'Evocation', 'Wall Of Iron':'Conjuration',
  'Wall Of Stone':'Conjuration', 'Wall Of Thorns':'Conjuration',
  'Warp Wood':'Transmutation', 'Water Breathing':'Transmutation',
  'Water Walk':'Transmutation', 'Waves Of Exhaustion':'Necromancy',
  'Waves Of Fatigue':'Necromancy', 'Web':'Conjuration',
  'Weird':'Illusion', 'Whirlwind':'Evocation',
  'Whispering Wind':'Transmutation', 'Wind Walk':'Transmutation',
  'Wind Wall':'Evocation', 'Wish':'Universal',
  'Wood Shape':'Transmutation', 'Word Of Chaos':'Evocation',
  'Word Of Recall':'Conjuration', 'Zone Of Silence':'Illusion',
  'Zone Of Truth':'Enchantment'
};
PH35.strengthMaxLoads = [0,
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 115, 130, 150, 175,  200, 230, 260,
  300, 350, 400, 460, 520, 600, 700, 800, 920, 1040, 1200, 1400
];
// Mapping of medium damage to large/small/tiny damage
PH35.weaponsLargeDamage = {
  'd2':'d3', 'd3':'d4', 'd4':'d6', 'd6':'d8', 'd8':'2d6', 'd10':'2d8',
  'd12':'3d6', '2d4':'2d6', '2d6':'3d6', '2d8':'3d8', '2d10':'4d8'
};
PH35.weaponsSmallDamage = {
  'd2':'1', 'd3':'d2', 'd4':'d3', 'd6':'d4', 'd8':'d6', 'd10':'d8',
  'd12':'d10', '2d4':'d6', '2d6':'d10', '2d8':'2d6', '2d10':'2d8'
};

/* Defines the rules related to PH Chapter 1, Abilities. */
PH35.abilityRules = function(rules) {

  // Ability modifier computation
  rules.defineRule
    ('charismaModifier', 'charisma', '=', 'Math.floor((source - 10) / 2)');
  rules.defineRule
    ('constitutionModifier', 'constitution', '=', 'Math.floor((source-10)/2)');
  rules.defineRule
    ('dexterityModifier', 'dexterity', '=', 'Math.floor((source - 10) / 2)');
  rules.defineRule
    ('intelligenceModifier', 'intelligence', '=', 'Math.floor((source-10)/2)');
  rules.defineRule
    ('strengthModifier', 'strength', '=', 'Math.floor((source - 10) / 2)');
  rules.defineRule
    ('wisdomModifier', 'wisdom', '=', 'Math.floor((source - 10) / 2)');

  // Effects of ability modifiers
  rules.defineRule('combatNotes.constitutionHitPointsAdjustment',
    'constitutionModifier', '=', 'source == 0 ? null : source',
    'level', '*', null
  );
  rules.defineRule('combatNotes.dexterityArmorClassAdjustment',
    'dexterityModifier', '=', 'source == 0 ? null : source'
  );
  rules.defineRule('combatNotes.dexterityRangedAttackAdjustment',
    'dexterityModifier', '=', 'source == 0 ? null : source'
  );
  rules.defineRule('skillNotes.intelligenceSkillPointsAdjustment',
    'intelligenceModifier', '=', null,
    'level', '*', 'source + 3'
  );
  rules.defineRule('combatNotes.strengthDamageAdjustment',
    'strengthModifier', '=', 'source == 0 ? null : source'
  );
  rules.defineRule('combatNotes.strengthMeleeAttackAdjustment',
    'strengthModifier', '=', 'source == 0 ? null : source'
  );
  rules.defineRule('languageCount',
    'intelligenceModifier', '+', 'source > 0 ? source : null'
  );

  // Effects of the notes computed above
  rules.defineRule
    ('armorClass', 'combatNotes.dexterityArmorClassAdjustment', '+', null);
  rules.defineRule
    ('hitPoints', 'combatNotes.constitutionHitPointsAdjustment', '+', null);
  rules.defineRule
    ('meleeAttack', 'combatNotes.strengthMeleeAttackAdjustment', '+', null);
  rules.defineRule
    ('rangedAttack', 'combatNotes.dexterityRangedAttackAdjustment', '+', null);
  rules.defineRule
    ('skillPoints', 'skillNotes.intelligenceSkillPointsAdjustment', '+', null);

  // Validation tests
  var notes = [
    'validationNotes.abilityMinimum:' +
      'Requires Charisma >= 14|Constitution >= 14|Dexterity >= 14|' +
      'Intelligence >= 14|Strength >= 14|Wisdom >= 14',
    'validationNotes.abilityModifierSum:Requires ability modifier sum >= 1'
  ];
  rules.defineNote(notes);
  rules.defineRule('validationNotes.abilityMinimum',
    '', '=', '-1',
    /^charisma|constitution|dexterity|intelligence|strength|wisdom$/,
    '^', 'source >= 14 ? 0 : null'
  );
  rules.defineRule('validationNotes.abilityModifierSum',
    'charismaModifier', '=', 'source - 1',
    /^(constitution|dexterity|intelligence|strength|wisdom)Modifier$/,
    '+', null,
    '', 'v', '0'
  );
};

/* Defines the rules related to PH Chapter 9, Adventuring. */
PH35.adventuringRules = function(rules) {
  rules.defineRule('loadLight', 'loadMax', '=', 'Math.floor(source / 3)');
  rules.defineRule('loadMax','strength','=','PH35.strengthMaxLoads[source]');
  rules.defineRule('loadMedium', 'loadMax', '=', 'Math.floor(source * 2 / 3)');
  rules.defineRule('runSpeed',
    'speed', '=', null,
    'runSpeedMultiplier', '*', null
  );
  rules.defineRule
    ('runSpeedMultiplier', 'armorWeightClass', '=', 'source=="Heavy" ? 3 : 4');
  rules.defineRule('speed', '', '=', '30');
};

/* Defines the rules related to PH Chapter 3, Classes. */
PH35.classRules = function(rules, classes) {

  // Experience- and level-dependent attributes
  rules.defineRule('classSkillMaxRanks', 'level', '=', 'source + 3');
  rules.defineRule
    ('experienceNeeded', 'level', '=', '1000 * source * (source + 1) / 2');
  rules.defineRule
    ('featCount.General', 'level', '=', '1 + Math.floor(source / 3)');
  rules.defineRule('level',
    'experience', '=', 'Math.floor((1 + Math.sqrt(1 + source / 125)) / 2)'
  );
  rules.defineRule('skillPoints',
    '', '=', '0',
    'level', '^', 'source + 3'
  );
  rules.defineNote
    ('validationNotes.levelsTotal:' +
     'Allocated levels differ from level total by %V');
  rules.defineRule('validationNotes.levelsTotal',
    'level', '+=', '-source',
    /^levels\./, '+=', null
  );

  for(var i = 0; i < classes.length; i++) {

    var baseAttack, feats, features, hitDie, notes, profArmor, profShield,
        profWeapon, saveFortitude, saveReflex, saveWill, selectableFeatures,
        skillPoints, skills, spellAbility, spellsKnown, spellsPerDay;
    var klass = classes[i];

    if(klass == 'Barbarian') {

      baseAttack = PH35.ATTACK_BONUS_GOOD;
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
        'combatNotes.damageReductionFeature:%V subtracted from damage taken',
        'combatNotes.greaterRageFeature:+6 strength/constitution; +3 Will',
        'combatNotes.improvedUncannyDodgeFeature:' +
          'Flanked only by rogue four levels higher',
        'combatNotes.mightyRageFeature:+8 strength/constitution; +4 Will save',
        'combatNotes.rageFeature:' +
          '+4 strength/constitution/+2 Will save/-2 AC for %V rounds %1/day',
        'combatNotes.tirelessRageFeature:Not fatigued after rage',
        'combatNotes.uncannyDodgeFeature:Always adds dexterity modifier to AC',
        'saveNotes.indomitableWillFeature:' +
          '+4 enchantment resistance during rage',
        'saveNotes.trapSenseFeature:+%V Reflex and AC vs. traps',
        'skillNotes.illiteracyFeature:Must spend 2 skill points to read/write',
        'validationNotes.barbarianClassAlignment:Requires Alignment !~ Lawful'
      ];
      profArmor = PH35.PROFICIENCY_MEDIUM;
      profShield = PH35.PROFICIENCY_HEAVY;
      profWeapon = PH35.PROFICIENCY_MEDIUM;
      saveFortitude = PH35.SAVE_BONUS_GOOD;
      saveReflex = PH35.SAVE_BONUS_POOR;
      saveWill = PH35.SAVE_BONUS_POOR;
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
      rules.defineRule('combatNotes.damageReductionFeature',
        'levels.Barbarian', '+=', 'source>=7 ? Math.floor((source-4)/3) : null'
      );
      rules.defineRule('combatNotes.rageFeature',
        'constitutionModifier', '=', '5 + source'
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

      baseAttack = PH35.ATTACK_BONUS_AVERAGE;
      feats = null;
      features = [
        '1:Bardic Knowledge', '1:Bardic Music', '1:Countersong', '1:Fascinate',
        '1:Inspire Courage', '3:Inspire Competence', '6:Suggestion',
        '9:Inspire Greatness', '12:Song Of Freedom', '15:Inspire Heroics',
        '18:Mass Suggestion'
      ];
      hitDie = 6;
      notes = [
        'featureNotes.bardicMusicFeature:Bardic music effect %V/day',
        'magicNotes.countersongFeature:' +
          'Perform check vs. sonic magic w/in 30 ft for 10 rounds',
        'magicNotes.fascinateFeature:' +
          'Hold %V creatures w/in 90 ft spellbound for %1 rounds',
        'magicNotes.inspireCompetenceFeature:' +
          '+2 allies skill checks while performing up to 2 minutes',
        'magicNotes.inspireCourageFeature:' +
          '+%V attack/damage and charm/fear saves to allies while performing',
        'magicNotes.inspireGreatnessFeature:' +
           '%V allies get +2 HD/attack/+1 Fortitude save while performing',
        'magicNotes.inspireHeroicsFeature:' +
          'Single ally +4 AC and saves while performing',
        'magicNotes.massSuggestionFeature:' +
          'Make suggestion to all fascinated creatures',
        'magicNotes.songOfFreedomFeature:Break enchantment through performing',
        'magicNotes.suggestionFeature:' +
          'Make suggestion to a fascinated creature',
        'skillNotes.bardicKnowledgeFeature:' +
          '+%V Knowledge checks on local history',
        'validationNotes.bardClassAlignment:Requires Alignment !~ Lawful'
      ];
      profArmor = PH35.PROFICIENCY_LIGHT;
      profShield = PH35.PROFICIENCY_HEAVY;
      profWeapon = PH35.PROFICIENCY_LIGHT;
      saveFortitude = PH35.SAVE_BONUS_POOR;
      saveReflex = PH35.SAVE_BONUS_GOOD;
      saveWill = PH35.SAVE_BONUS_GOOD;
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
        ('featureNotes.bardicMusicFeature', 'levels.Bard', '=', null);
      rules.defineRule
        ('features.Countersong',
        'sumskillModifier.Perform', '?', 'source >= 3'
      );
      rules.defineRule('features.Fascinate',
        'sumskillModifier.Perform', '?', 'source >= 3'
      );
      rules.defineRule('features.Inspire Competence',
        'sumskillModifier.Perform', '?', 'source >= 6'
      );
      rules.defineRule('features.Inspire Courage',
        'sumskillModifier.Perform', '?', 'source >= 3'
      );
      rules.defineRule('features.Inspire Greatness',
        'sumskillModifier.Perform', '?', 'source >= 12'
      );
      rules.defineRule('features.Inspire Heroics',
        'sumskillModifier.Perform', '?', 'source >= 18'
      );
      rules.defineRule('features.Mass Suggestion',
        'sumskillModifier.Perform', '?', 'source >= 21'
      );
      rules.defineRule('features.Song Of Freedom',
        'sumskillModifier.Perform', '?', 'source >= 15'
      );
      rules.defineRule('features.Suggestion',
        'sumskillModifier.Perform', '?', 'source >= 9'
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
      rules.defineRule('skillNotes.bardicKnowledgeFeature',
        'levels.Bard', '+=', null,
        'intelligenceModifier', '+', null
      );
      rules.defineRule
        ('sumskillModifier.Perform', /^skillModifier.Perform/, '+=', null);

    } else if(klass == 'Cleric') {

      baseAttack = PH35.ATTACK_BONUS_AVERAGE;
      feats = null;
      features = ['1:Spontaneous Cleric Spell', '1:Turn Undead'];
      hitDie = 8;
      notes = [
        'combatNotes.turnUndeadFeature:' +
          'Turn (good) or rebuke (evil) undead creatures',
        'magicNotes.spontaneousClericSpellFeature:%V'
      ];
      profArmor = PH35.PROFICIENCY_HEAVY;
      profShield = PH35.PROFICIENCY_HEAVY;
      profWeapon = PH35.PROFICIENCY_LIGHT;
      saveFortitude = PH35.SAVE_BONUS_GOOD;
      saveReflex = PH35.SAVE_BONUS_POOR;
      saveWill = PH35.SAVE_BONUS_GOOD;
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
      rules.defineRule
        ('classSkills.Bluff', 'skillNotes.trickeryDomain', '=', '1');
      rules.defineRule
        ('classSkills.Disguise', 'skillNotes.trickeryDomain', '=', '1');
      rules.defineRule
        ('classSkills.Hide', 'skillNotes.trickeryDomain', '=', '1');
      rules.defineRule
        ('classSkills.Knowledge', 'skillNotes.knowledgeDomain', '=', '1');
      rules.defineRule('classSkills.Knowledge (Nature)',
        'skillNotes.animalDomain', '=', '1',
        'skillNotes.plantDomain', '=', '1'
      );
      rules.defineRule
        ('classSkills.Survival', 'skillNotes.travelDomain', '=', '1');
      rules.defineRule('domainCount', 'levels.Cleric', '+=', '2');
      rules.defineRule('magicNotes.spontaneousClericSpellFeature',
        'alignment', '=', 'source.indexOf("Evil") >= 0 ? "Inflict" : "Heal"'
      );
      for(var j = 1; j < 10; j++) {
        rules.defineRule('spellsPerDay.Dom' + j,
          'levels.Cleric', '=',
          'source >= ' + (j * 2 - 1) + ' ? 1 : null');
      }
      rules.defineRule('turnUndead.level', 'levels.Cleric', '+=', null);
      rules.defineRule('turningLevel', 'turnUndead.level', '^=', null);

    } else if(klass == 'Druid') {

      baseAttack = PH35.ATTACK_BONUS_AVERAGE;
      feats = null;
      features = [
        '1:Animal Companion', '1:Nature Sense', '1:Spontaneous Druid Spell',
        '1:Wild Empathy', '2:Woodland Stride', '3:Trackless Step',
        '4:Resist Nature\'s Lure', '5:Wild Shape', '9:Venom Immunity',
        '13:Thousand Faces', '15:Timeless Body'
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
        'magicNotes.wildShapeFeature:Change into creature of size %V %1/day',
        'saveNotes.resistNature\'sLureFeature:+4 vs. spells of feys',
        'saveNotes.venomImmunityFeature:Immune to poisons',
        'skillNotes.natureSenseFeature:+2 Knowledge (Nature)/Survival',
        'skillNotes.wildEmpathyFeature:+%V Diplomacy check with animals',
        'validationNotes.druidClassAlignment:Requires Alignment =~ Neutral'
      ];
      profArmor = PH35.PROFICIENCY_MEDIUM;
      profShield = PH35.PROFICIENCY_HEAVY;
      profWeapon = PH35.PROFICIENCY_NONE;
      saveFortitude = PH35.SAVE_BONUS_GOOD;
      saveReflex = PH35.SAVE_BONUS_POOR;
      saveWill = PH35.SAVE_BONUS_GOOD;
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
      rules.defineRule('animalCompanionLevel',
        'levels.Druid', '+=', 'Math.floor((source + 2) / 3)'
      );
      rules.defineRule
        ('animalCompanionMasterLevel', 'levels.Druid', '+=', null);
      rules.defineRule('casterLevelDivine', 'levels.Druid', '+=', null);
      rules.defineRule('languageCount', 'levels.Druid', '+', '1');
      rules.defineRule('languages.Druidic', 'levels.Druid', '=', '1');
      rules.defineRule('magicNotes.elementalShapeFeature',
        'levels.Druid', '=', 'source < 16 ? null : source < 18 ? 1 : 2'
      );
      rules.defineRule('magicNotes.wildShapeFeature',
        'levels.Druid', '=',
          'source < 5 ? null : ' +
          'source < 8 ? "small-medium" : ' +
          'source < 11 ? "small-large" : ' +
          'source == 11 ? "tiny-large" : ' +
          'source < 15 ? "tiny-large/plant" : "tiny-huge/plant";'
      );
      rules.defineRule('magicNotes.wildShapeFeature.1',
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

      baseAttack = PH35.ATTACK_BONUS_GOOD;
      feats = null;
      features = null;
      hitDie = 10;
      notes = null;
      profArmor = PH35.PROFICIENCY_HEAVY;
      profShield = PH35.PROFICIENCY_TOWER;
      profWeapon = PH35.PROFICIENCY_MEDIUM;
      saveFortitude = PH35.SAVE_BONUS_GOOD;
      saveReflex = PH35.SAVE_BONUS_POOR;
      saveWill = PH35.SAVE_BONUS_POOR;
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

      baseAttack = PH35.ATTACK_BONUS_AVERAGE;
      feats = null;
      features = [
        '1:Flurry Of Blows', '1:Improved Unarmed Strike', '2:Evasion',
        '3:Fast Movement', '3:Still Mind', '4:Ki Strike', '4:Slow Fall',
        '5:Purity Of Body', '7:Wholeness Of Body', '9:Improved Evasion',
        '10:Lawful Ki Strike', '11:Diamond Body', '11:Greater Flurry',
        '12:Abundant Step', '13:Diamond Soul', '15:Quivering Palm',
        '16:Adamantine Ki Strike', '17:Timeless Body',
        '17:Tongue Of The Sun And Moon', '19:Empty Body', '20:Perfect Self'
      ];
      hitDie = 8;
      notes = [
        'abilityNotes.fastMovementFeature:+%V speed',
        'combatNotes.adamantineKiStrikeFeature:' +
          'Treat unarmed as adamantine weapon',
        'combatNotes.flurryOfBlowsFeature:Take %V penalty for extra attack',
        'combatNotes.greaterFlurryFeature:Extra attack',
        'combatNotes.improvedUnarmedStrikeFeature:Unarmed attack w/out foe AOO',
        'combatNotes.kiStrikeFeature:Treat unarmed as magic weapon',
        'combatNotes.lawfulKiStrikeFeature:Treat unarmed as lawful weapon',
        'combatNotes.perfectSelfFeature:' +
          'Ignore first 10 points of non-magical damage',
        'combatNotes.quiveringPalmFeature:' +
          'Foe makes DC %V Fortitude save or dies 1/week',
        'featureNotes.timelessBodyFeature:No aging penalties',
        'featureNotes.tongueOfTheSunAndMoonFeature:Speak w/any living creature',
        'magicNotes.abundantStepFeature:<i>Dimension Door</i> 1/day',
        'magicNotes.emptyBodyFeature:Ethereal %V rounds/day',
        'magicNotes.wholenessOfBodyFeature:Heal %V damage to self/day',
        'saveNotes.diamondBodyFeature:Immune to poison',
        'saveNotes.diamondSoulFeature:+%V vs. spells',
        'saveNotes.evasionFeature:Reflex save yields no damage instead of 1/2',
        'saveNotes.improvedEvasionFeature:Failed save yields 1/2 damage',
        'saveNotes.perfectSelfFeature:Treat as outsider for magic saves',
        'saveNotes.purityOfBodyFeature:Immune to normal disease',
        'saveNotes.slowFallFeature:' +
          'Subtract %V ft from falling damage distance',
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
      profArmor = PH35.PROFICIENCY_NONE;
      profShield = PH35.PROFICIENCY_NONE;
      profWeapon = PH35.PROFICIENCY_NONE;
      saveFortitude = PH35.SAVE_BONUS_GOOD;
      saveReflex = PH35.SAVE_BONUS_GOOD;
      saveWill = PH35.SAVE_BONUS_GOOD;
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
        'levels.Monk', '=', 'source >= 5 ? Math.floor(source / 5) : null',
        'wisdomModifier', '+', 'source > 0 ? source : null'
      );
      rules.defineRule('combatNotes.quiveringPalmFeature',
        'levels.Monk', '+=', '10 + Math.floor(source / 2)',
        'wisdomModifier', '+', null
      );
      rules.defineRule('combatNotes.stunningFistFeature.1',
        'levels.Monk', '+=', 'source - Math.floor(source / 4)'
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
      rules.defineRule('weaponDamage.Unarmed',
        'levels.Monk', '=',
        'source < 12 ? ("d" + (6 + Math.floor(source / 4) * 2)) : ' +
        '              ("2d" + (6 + Math.floor((source - 12) / 4) * 2))'
      );

    } else if(klass == 'Paladin') {

      baseAttack = PH35.ATTACK_BONUS_GOOD;
      feats = null;
      features = [
        '1:Aura Of Good', '1:Detect Evil', '1:Smite Evil', '2:Divine Grace',
        '2:Lay On Hands', '3:Aura Of Courage', '3:Divine Health',
        '4:Turn Undead', '5:Special Mount', '6:Remove Disease'
      ];
      hitDie = 10;
      notes = [
        'combatNotes.smiteEvilFeature:' +
          '%V/day add %1 to attack, %2 to damage vs. evil foe',
        'combatNotes.turnUndeadFeature:' +
          'Turn (good) or rebuke (evil) undead creatures',
        'featureNotes.specialMountFeature:Magical mount w/special abilities',
        'magicNotes.auraOfGoodFeature:Visible to <i>Detect Good</i>',
        'magicNotes.detectEvilFeature:<i>Detect Evil</i> at will',
        'magicNotes.layOnHandsFeature:Harm undead or heal %V HP/day',
        'magicNotes.removeDiseaseFeature:<i>Remove Disease</i> %V/week',
        'saveNotes.auraOfCourageFeature:Immune fear; +4 to allies w/in 30 ft',
        'saveNotes.divineGraceFeature:Add %V to saves',
        'saveNotes.divineHealthFeature:Immune to disease',
        'validationNotes.paladinClassAlignment:' +
          'Requires Alignment == Lawful Good'
      ];
      profArmor = PH35.PROFICIENCY_HEAVY;
      profShield = PH35.PROFICIENCY_HEAVY;
      profWeapon = PH35.PROFICIENCY_MEDIUM;
      saveFortitude = PH35.SAVE_BONUS_GOOD;
      saveReflex = PH35.SAVE_BONUS_POOR;
      saveWill = PH35.SAVE_BONUS_POOR;
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
        'levels.Paladin', '=', '1 + Math.floor(source / 5)'
      );
      rules.defineRule
        ('combatNotes.smiteEvilFeature.1', 'charismaModifier', '=', null);
      rules.defineRule
        ('combatNotes.smiteEvilFeature.2', 'levels.Paladin', '=', null);
      rules.defineRule('magicNotes.layOnHandsFeature',
        'levels.Paladin', '+=', null,
        'charismaModifier', '*', null
      );
      rules.defineRule('magicNotes.removeDiseaseFeature',
        'levels.Paladin', '+=', 'Math.floor((source - 3) / 3)'
      );
      rules.defineRule('mountLevel',
        'levels.Paladin', '+=',
        'source < 5 ? null : source < 8 ? 1 : source < 11 ? 2 : ' +
        'source < 15 ? 3 : 4'
      );
      rules.defineRule('mountMasterLevel', 'levels.Paladin', '+=', null);
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

      baseAttack = PH35.ATTACK_BONUS_GOOD;
      feats = null;
      features = [
        '1:Favored Enemy', '1:Track', '1:Wild Empathy', '2:Rapid Shot',
        '2:Two Weapon Fighting', '3:Endurance', '4:Animal Companion',
        '6:Manyshot', '6:Improved Two Weapon Fighting', '7:Woodland Stride',
        '8:Swift Tracker', '9:Evasion', '11:Improved Precise Shot',
        '11:Greater Two Weapon Fighting', '13:Camouflage',
        '17:Hide In Plain Sight'
      ];
      hitDie = 8;
      notes = [
        'featureNotes.animalCompanionFeature:Special bond/abilities',
        'combatNotes.favoredEnemyFeature:' +
          '+2 or more damage vs. %V type(s) of creatures',
        'combatNotes.greaterTwoWeaponFightingFeature:' +
          'Second off-hand -10 attack',
        'combatNotes.improvedPreciseShotFeature:' +
          'No foe bonus for partial concealment; attack grappling w/no penalty',
        'combatNotes.improvedTwoWeaponFightingFeature:Additional -5 attack',
        'combatNotes.manyshotFeature:Fire multiple arrows simultaneously',
        'combatNotes.rapidShotFeature:Normal and extra ranged -2 attacks',
        'combatNotes.twoWeaponFightingFeature:' +
          'Reduce on-hand penalty by 2/off-hand by 6',
        'featureNotes.woodlandStrideFeature:' +
          'Normal movement through undergrowth',
        'saveNotes.enduranceFeature:+4 extended physical action',
        'saveNotes.evasionFeature:Reflex save yields no damage instead of 1/2',
        'skillNotes.camouflageFeature:Hide in any natural terrain',
        'skillNotes.favoredEnemyFeature:' +
          '+2 or more vs. %V type(s) of creatures on ' +
          'Bluff/Listen/Sense Motive/Spot/Survival',
        'skillNotes.hideInPlainSightFeature:Hide even when observed',
        'skillNotes.swiftTrackerFeature:Track at full speed',
        'skillNotes.trackFeature:Survival to follow creatures at 1/2 speed',
        'skillNotes.wildEmpathyFeature:+%V Diplomacy check with animals'
      ];
      profArmor = PH35.PROFICIENCY_LIGHT;
      profShield = PH35.PROFICIENCY_HEAVY;
      profWeapon = PH35.PROFICIENCY_MEDIUM;
      saveFortitude = PH35.SAVE_BONUS_GOOD;
      saveReflex = PH35.SAVE_BONUS_GOOD;
      saveWill = PH35.SAVE_BONUS_POOR;
      selectableFeatures = [
        'Combat Style (Archery)', 'Combat Style (Two Weapon Combat)'
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
      rules.defineRule('animalCompanionLevel',
        'levels.Ranger', '+=', 'source<4 ? null : Math.floor((source + 6) / 6)'
      );
      rules.defineRule
        ('animalCompanionMasterLevel', 'levels.Ranger', '+=', null);
      rules.defineRule('casterLevelDivine',
        'levels.Ranger', '+=', 'source < 4 ? null : Math.floor(source / 2)'
      );
      rules.defineRule('combatNotes.favoredEnemyFeature',
        'levels.Ranger', '+=', '1 + Math.floor(source / 5)'
      );
      rules.defineRule('rangerFeatures.Rapid Shot',
        'selectableFeatures.Combat Style (Archery)', '?', null
      );
      rules.defineRule('rangerFeatures.Manyshot',
        'selectableFeatures.Combat Style (Archery)', '?', null
      );
      rules.defineRule('rangerFeatures.Improved Precise Shot',
        'selectableFeatures.Combat Style (Archery)', '?', null
      );
      rules.defineRule('rangerFeatures.Two Weapon Fighting',
        'selectableFeatures.Combat Style (Two Weapon Combat)', '?', null
      );
      rules.defineRule('rangerFeatures.Improved Two Weapon Fighting',
        'selectableFeatures.Combat Style (Two Weapon Combat)', '?', null
      );
      rules.defineRule('rangerFeatures.Greater Two Weapon Fighting',
        'selectableFeatures.Combat Style (Two Weapon Combat)', '?', null
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

      baseAttack = PH35.ATTACK_BONUS_AVERAGE;
      feats = null;
      features = [
        '1:Sneak Attack', '1:Trapfinding', '2:Evasion', '3:Trap Sense',
        '4:Uncanny Dodge', '8:Improved Uncanny Dodge'
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
          '%Vd6 extra damage when surprising or flanking',
        'combatNotes.uncannyDodgeFeature:Always adds dexterity modifier to AC',
        'saveNotes.evasionFeature:Reflex save yields no damage instead of 1/2',
        'saveNotes.improvedEvasionFeature:Failed save yields 1/2 damage',
        'saveNotes.slipperyMindFeature:Second save vs. enchantment',
        'saveNotes.trapSenseFeature:+%V Reflex and AC vs. traps',
        'skillNotes.skillMasteryFeature:' +
          'Never distracted from designated skills',
        'skillNotes.trapfindingFeature:' +
          'Use Search/Disable Device to find/remove DC 20+ traps'
      ];
      profArmor = PH35.PROFICIENCY_LIGHT;
      profShield = PH35.PROFICIENCY_NONE;
      profWeapon = PH35.PROFICIENCY_LIGHT;
      saveFortitude = PH35.SAVE_BONUS_POOR;
      saveReflex = PH35.SAVE_BONUS_GOOD;
      saveWill = PH35.SAVE_BONUS_POOR;
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

    } else if(klass == 'Sorcerer') {

      baseAttack = PH35.ATTACK_BONUS_POOR;
      feats = null;
      features = ['1:Summon Familiar'];
      hitDie = 4;
      notes = [
        'magicNotes.summonFamiliarFeature:Special bond/abilities'
      ];
      profArmor = PH35.PROFICIENCY_NONE;
      profShield = PH35.PROFICIENCY_NONE;
      profWeapon = PH35.PROFICIENCY_LIGHT;
      saveFortitude = PH35.SAVE_BONUS_POOR;
      saveReflex = PH35.SAVE_BONUS_POOR;
      saveWill = PH35.SAVE_BONUS_GOOD;
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
      rules.defineRule
        ('familiarLevel', 'levels.Sorcerer', '+=', 'Math.floor(source / 2)');
      rules.defineRule('familiarMasterLevel', 'levels.Sorcerer', '+=', null);

    } else if(klass == 'Wizard') {

      baseAttack = PH35.ATTACK_BONUS_POOR;
      feats = ['Spell Mastery'];
      for(var j = 0; j < PH35.FEATS.length; j++) {
        var pieces = PH35.FEATS[j].split(':');
        if(pieces[1].match(/Item Creation|Metamagic/)) {
          feats[feats.length] = pieces[0];
        }
      }
      features = ['1:Scribe Scroll', '1:Summon Familiar'];
      hitDie = 4;
      notes = [
        'magicNotes.scribeScrollFeature:Create scroll of any known spell',
        'magicNotes.summonFamiliarFeature:Special bond/abilities',
        'magicNotes.wizardSpecialization:Extra %V spell/day each spell level',
        'skillNotes.wizardSpecialization:+2 Spellcraft (%V)'
      ];
      profArmor = PH35.PROFICIENCY_NONE;
      profShield = PH35.PROFICIENCY_NONE;
      profWeapon = PH35.PROFICIENCY_NONE;
      saveFortitude = PH35.SAVE_BONUS_POOR;
      saveReflex = PH35.SAVE_BONUS_POOR;
      saveWill = PH35.SAVE_BONUS_GOOD;
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
      rules.defineRule
        ('familiarLevel', 'levels.Wizard', '+=', 'Math.floor(source / 2)');
      rules.defineRule('familiarMasterLevel', 'levels.Wizard', '+=', null);
      rules.defineRule('featCount.Wizard',
        'levels.Wizard', '=', 'source >= 5 ? Math.floor(source / 5) : null'
      );
      for(var j = 0; j < PH35.SCHOOLS.length; j++) {
        var school = PH35.SCHOOLS[j].split(':')[0];
        rules.defineRule('magicNotes.wizardSpecialization',
         'specialize.' + school, '=', '"' + school + '"'
        );
        rules.defineRule('skillNotes.wizardSpecialization',
          'specialize.' + school, '=', '"' + school + '"'
        );
      }
      for(var j = 0; j < 10; j++) {
        rules.defineRule
          ('spellsPerDay.W' + j, 'magicNotes.wizardSpecialization', '+', '1');
      }

    } else
      continue;

    PH35.defineClass
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
        rules.defineChoice('selectableFeatures', selectable + ':' + klass);
        rules.defineRule('features.' + selectable,
          'selectableFeatures.' + selectable, '+=', null
        );
      }
    }

  }

  rules.defineNote
    ('validationNotes.selectableFeaturesTotal:' +
     'Allocated selectable features differ from selectable features count ' +
     'total by %V');
  rules.defineRule('validationNotes.selectableFeaturesTotal',
    /^selectableFeatureCount\./, '+=', '-source',
    /^selectableFeatures\./, '+=', 'source'
  );

};

/* Defines the rules related to PH Chapter 8, Combat. */
PH35.combatRules = function(rules) {
  rules.defineNote([
    'turnUndead.damageModifier:2d6+%V',
    'turnUndead.frequency:%V/day',
    'turnUndead.maxHitDice:(d20+%V)/3'
  ]);
  rules.defineRule('armorClass',
    null, '=', '10',
    'armor', '+', 'PH35.armorsArmorClassBonuses[source]',
    'shield', '+', 'source=="None" ? null : ' +
                   'source=="Tower" ? 4 : source.indexOf("Light") >= 0 ? 1 : 2'
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
  rules.defineRule('weapons.Unarmed', null, '=', '1');
};

/* Defines the PHB Chapter 3 rules related to companion creatures. */
PH35.companionRules = function(rules, companions) {

  for(var i = 0; i < companions.length; i++) {

    var features, notes, prefix;
    var companion = companions[i];

    if(companion == 'Animal Companion') {
      features = [
        '1:Link', '1:Share Spells', '2:Companion Evasion', '3:Devotion',
        '4:Multiattack', '6:Companion Improved Evasion'
      ];
      notes = [
        'animalCompanionStats.armorClass:+%V',
        'animalCompanionStats.dexterity:+%V',
        'animalCompanionStats.hitDice:+%Vd8',
        'animalCompanionStats.strength:+%V',
        'animalCompanionStats.tricks:+%V',
        'companionNotes.companionEvasionFeature:' +
          'Reflex save yields no damage instead of 1/2',
        'companionNotes.companionImprovedEvasionFeature:' +
          'Failed save yields 1/2 damage',
        'companionNotes.devotionFeature:+4 Will vs. enchantment',
        'companionNotes.linkFeature:' +
          'Master +4 Handle Animal/Wild Empathy w/companion',
        'companionNotes.multiattackFeature:' +
          'Reduce additional attack penalty to -2 or second attack at -5',
        'companionNotes.shareSpellsFeature:' +
          'Master share self spell w/companion w/in 5 ft'
      ];
      prefix = 'animalCompanion';
      rules.defineRule('animalCompanionStats.armorClass',
        'animalCompanionLevel', '=', '(source-1) * 2'
      );
      rules.defineRule('animalCompanionStats.dexterity',
        'animalCompanionLevel', '=', 'source - 1'
      );
      rules.defineRule('animalCompanionStats.hitDice',
        'animalCompanionLevel', '=', '(source - 1) * 2'
      );
      rules.defineRule('animalCompanionStats.strength',
        'animalCompanionLevel', '=', 'source - 1'
      );
      rules.defineRule
        ('animalCompanionStats.tricks', 'animalCompanionLevel', '=', null);
    } else if(companion == 'Familiar') {
      features = [
        '1:Companion Alertness', '1:Companion Evasion',
        '1:Companion Improved Evasion', '1:Empathic Link', '1:Share Spells',
        '2:Deliver Touch Spells', '3:Speak With Master',
        '4:Speak With Like Animals', '6:Companion Resist Spells', '7:Scry'
      ];
      notes = [
        'familiarStats.armorClass:+%V',
        'familiarStats.intelligence:%V',
        'familiarStats.spellResistance:DC %V',
        'companionNotes.companionAlertnessFeature:' +
          'Master +2 listen/spot when w/in reach',
        'companionNotes.companionEvasionFeature:' +
          'Reflex save yields no damage instead of 1/2',
        'companionNotes.companionImprovedEvasionFeature:' +
          'Failed save yields 1/2 damage',
        'companionNotes.deliverTouchSpellsFeature:' +
          'Deliver touch spells if in contact w/master when cast',
        'companionNotes.empathicLinkFeature:' +
          'Master/companion share emotions up to 1 mile',
        'companionNotes.scryFeature:Master views companion 1/day',
        'companionNotes.shareSpellsFeature:' +
          'Master share self spell w/companion w/in 5 ft',
        'companionNotes.speakWithLikeAnimalsFeature:Talk w/similar creatures',
        'companionNotes.speakWithMasterFeature:Talk w/master in secret language'
      ];
      prefix = 'familiar';
      rules.defineRule('familiarStats.armorClass', 'familiarLevel', '=', null);
      rules.defineRule
        ('familiarStats.intelligence', 'familiarLevel', '=', 'source + 5');
      rules.defineRule('familiarStats.spellResistance',
        'features.Companion Resist Spells', '?', null,
        'familiarMasterLevel', '+=', 'source + 5'
      );
    } else if(companion == 'Mount') {
      features = [
        '1:Companion Evasion', '1:Companion Improved Evasion',
        '1:Empathic Link', '1:Share Saving Throws', '1:Share Spells',
        '2:Command Like Creatures', '2:Improved Speed',
        '3:Command Like Creatures', '4:Companion Resist Spells'
      ];
      notes = [
        'companionNotes.commandLikeCreaturesFeature:' +
          'DC %V <i>Command</i> vs. similar creatures %1/day',
        'companionNotes.companionEvasionFeature:' +
          'Reflex save yields no damage instead of 1/2',
        'companionNotes.companionImprovedEvasionFeature:' +
          'Failed save yields 1/2 damage',
        'companionNotes.empathicLinkFeature:' +
          'Master/companion share emotions up to 1 mile',
        'companionNotes.improvedSpeedFeature:+10 speed',
        'companionNotes.shareSavingThrowsFeature:' +
          'Companion uses higher of own or master\'s saving throws',
        'companionNotes.shareSpellsFeature:' +
          'Master share self spell w/companion w/in 5 ft',
        'mountStats.armorClass:+%V',
        'mountStats.hitDice:+%Vd8',
        'mountStats.intelligence:%V',
        'mountStats.spellResistance:DC %V',
        'mountStats.strength:+%V'
      ];
      prefix = 'mount';
      rules.defineRule('companionNotes.commandLikeCreaturesFeature',
        'mountMasterLevel', '=', '10 + Math.floor(source / 2)',
        'charismaModifier', '+', null
      );
      rules.defineRule('companionNotes.commandLikeCreaturesFeature.1',
        'mountMasterLevel', '=', 'Math.floor(source / 2)'
      );
      rules.defineRule('mountStats.armorClass', 'mountLevel', '=', 'source*2');
      rules.defineRule('mountStats.hitDice', 'mountLevel', '=', 'source * 2');
      rules.defineRule
        ('mountStats.intelligence', 'mountLevel', '=', 'source + 5');
      rules.defineRule('mountStats.spellResistance',
        'features.Companion Resist Spells', '?', null,
        'mountMasterLevel', '+=', 'source + 5'
      );
      rules.defineRule('mountStats.strength', 'mountLevel', '=', null);
    } else
      continue;

    for(var j = 0; j < features.length; j++) {
      var levelAndFeature = features[j].split(/:/);
      var feature = levelAndFeature[levelAndFeature.length == 1 ? 0 : 1];
      var level = levelAndFeature.length == 1 ? 1 : levelAndFeature[0];
      rules.defineRule(prefix + 'Features.' + feature,
        prefix + 'Level', '=', 'source >= ' + level + ' ? 1 : null'
      );
      rules.defineRule
        ('features.' + feature, prefix + 'Features.' + feature, '=', '1');
    }

    if(notes != null)
      rules.defineNote(notes);

    rules.defineSheetElement
      (companion + ' Features', 'Companion Notes', null, ' * ');
    rules.defineSheetElement
      (companion + ' Stats', companion + ' Features', null, ' * ');

  }

};

/* Returns an ObjectViewer loaded with the default character sheet format. */
PH35.createViewers = function(rules, viewers) {
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
            {name: 'Saves', within: 'Section 1', format: '<b>Save F/R/W</b> %V',
             separator: '/'},
              {name: 'save.Fortitude', within: 'Saves', format: '%V'},
              {name: 'save.Reflex', within: 'Saves', format: '%V'},
              {name: 'save.Will', within: 'Saves', format: '%V'},
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
            {name: 'Selectable Features', within: 'Section 2', separator: '/'},
            {name: 'Languages', within: 'Section 2', separator: '/'},
            {name: 'Spells', within: 'Section 2', separator: '/'},
            {name: 'Spell Difficulty Class', within: 'Section 2',
             separator: '/'},
            {name: 'Domains', within: 'Section 2', separator: '/'},
            {name: 'Goodies', within: 'Section 2', separator: '/'},
            {name: 'Companion Notes', within: 'Section 2', format: ''},
            {name: 'Notes', within: 'Section 2'},
            {name: 'Dm Notes', within: 'Section 2', format: '%V'}
      );
    } else if(name == 'Standard' || name == 'Vertical') {
      var innerSep = name == 'Standard' ? null : '\n';
      var listSep = name == 'Standard' ? ' * ' : '\n';
      var outerSep = name == 'Standard' ? '\n' : null;
      viewer.addElements(
        {name: '_top', borders: 1, separator: '\n'},
        {name: 'Header', within: '_top'},
          {name: 'Identity', within: 'Header', separator: ''},
            {name: 'Name', within: 'Identity', format: '<b>%V</b>'},
            {name: 'Race', within: 'Identity', format: ' -- <b>%V</b>'},
            {name: 'Levels', within: 'Identity', format: ' <b>%V</b>',
             separator: '/'},
          {name: 'Image Url', within: 'Header', format: '<img src="%V">'},
        {name: 'Attributes', within: '_top', separator: outerSep},
          {name: 'Abilities', within: 'Attributes', separator: innerSep},
            {name: 'StrInfo', within: 'Abilities', separator: ''},
              {name: 'Strength', within: 'StrInfo'},
              {name: 'Strength Modifier', within: 'StrInfo', format: ' (%V)'},
            {name: 'IntInfo', within: 'Abilities', separator: ''},
              {name: 'Intelligence', within: 'IntInfo'},
              {name: 'Intelligence Modifier', within: 'IntInfo',
               format: ' (%V)'},
            {name: 'WisInfo', within: 'Abilities', separator: ''},
              {name: 'Wisdom', within: 'WisInfo'},
              {name: 'Wisdom Modifier', within: 'WisInfo', format: ' (%V)'},
            {name: 'DexInfo', within: 'Abilities', separator: ''},
              {name: 'Dexterity', within: 'DexInfo'},
              {name: 'Dexterity Modifier', within: 'DexInfo', format: ' (%V)'},
            {name: 'ConInfo', within: 'Abilities', separator: ''},
              {name: 'Constitution', within: 'ConInfo'},
              {name: 'Constitution Modifier', within: 'ConInfo',
               format: ' (%V)'},
            {name: 'ChaInfo', within: 'Abilities', separator: ''},
              {name: 'Charisma', within: 'ChaInfo'},
              {name: 'Charisma Modifier', within: 'ChaInfo', format: ' (%V)'},
          {name: 'Description', within: 'Attributes', separator: innerSep},
            {name: 'Alignment', within: 'Description'},
            {name: 'Deity', within: 'Description'},
            {name: 'Origin', within: 'Description'},
            {name: 'Gender', within: 'Description'},
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
              {name: 'Load Max', within: 'LoadInfo', format: '/%V'},
          {name: 'Ability Notes', within: 'Attributes', separator: listSep},
        {name: 'FeaturesAndSkills', within: '_top', separator: outerSep,
         format: '<b>Features/Skills</b><br/>%V'},
          {name: 'FeaturePart', within: 'FeaturesAndSkills', separator: '\n'},
            {name: 'FeatStats', within: 'FeaturePart', separator: innerSep},
              {name: 'Feat Count', within: 'FeatStats', separator: listSep},
              {name: 'Selectable Feature Count', within: 'FeatStats',
               separator: listSep},
            {name: 'Feats', within: 'FeaturePart', separator: listSep},
            {name: 'Selectable Features', within: 'FeaturePart',
             separator: listSep},
            {name: 'Feature Notes', within: 'FeaturePart', separator: listSep},
          {name: 'SkillPart', within: 'FeaturesAndSkills', separator: '\n'},
            {name: 'SkillStats', within: 'SkillPart', separator:innerSep},
              {name: 'Skill Points', within: 'SkillStats'},
              {name: 'Class Skill Max Ranks', within: 'SkillStats'},
            {name: 'Skills', within: 'SkillPart', separator: listSep},
            {name: 'Skill Notes', within: 'SkillPart', separator:listSep},
          {name: 'LanguagePart', within: 'FeaturesAndSkills', separator: '\n'},
            {name: 'LanguageStats', within: 'LanguagePart', separtor: innerSep},
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
              {name: 'Turn Air', within: 'Turning', separator: listSep},
              {name: 'Turn Animal', within: 'Turning', separator: listSep},
              {name: 'Turn Earth', within: 'Turning', separator: listSep},
              {name: 'Turn Fire', within: 'Turning', separator: listSep},
              {name: 'Turn Plant', within: 'Turning', separator: listSep},
              {name: 'Turn Undead', within: 'Turning', separator: listSep},
              {name: 'Turn Water', within: 'Turning', separator: listSep},
            {name: 'Combat Notes', within: 'CombatPart', separator: listSep},
          {name: 'SavePart', within: 'Combat', separator: '\n'},
            {name: 'SaveAndResistance', within: 'SavePart', separator:innerSep},
              {name: 'Save', within: 'SaveAndResistance', separator: listSep},
              {name: 'Resistance', within: 'SaveAndResistance',
               separator: listSep},
            {name: 'Save Notes', within: 'SavePart', separator: listSep},
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
            {name: 'Goodies', within: 'SpellPart', separator: listSep},
          {name: 'Spells', within: 'Magic', separator: listSep},
          {name: 'Magic Notes', within: 'Magic', separator: listSep},
        {name: 'Notes Area', within: '_top', separator: outerSep,
         format: '<b>Notes</b><br/>%V'},
          {name: 'NotesPart', within: 'Notes Area', separator: '\n'},
            {name: 'Notes', within: 'NotesPart', format: '%V'},
            {name: 'Dm Notes', within: 'NotesPart', format: '%V'},
            {name: 'Companion Notes', within: 'NotesPart', separator: listSep},
          {name: 'ValidationPart', within: 'Notes Area', separator: '\n'},
            {name: 'Sanity Notes', within: 'ValidationPart', separator:listSep},
            {name: 'Validation Notes', within: 'ValidationPart',
             separator: listSep}
      );
    } else
      continue;
    rules.defineViewer(name, viewer);
  }
};

/* Defines the rules related to PH Chapter 6, Description. */
PH35.descriptionRules = function(rules, alignments, deities, genders) {
  rules.defineChoice('alignments', alignments);
  rules.defineChoice('deities', deities);
  rules.defineChoice('genders', genders);
};

/* Defines the rules related to PH Chapter 7, Equipment. */
PH35.equipmentRules = function(rules, armors, goodies, shields, weapons) {

  rules.defineChoice('armors', armors);
  rules.defineChoice('goodies', goodies);
  rules.defineChoice('shields', shields);
  rules.defineChoice('weapons', weapons);
  rules.defineNote('magicNotes.arcaneSpellFailure:%V%'),
  rules.defineRule('abilityNotes.armorSpeedAdjustment',
    'armorWeightClass', '=', 'source == "Light" ? null : -10',
    'features.Slow', '+', '5'
  );
  rules.defineRule('armorWeightClass',
    'armor', '=',
      'PH35.armorsWeightClasses[source] == null ? "Light" : ' +
      'PH35.armorsWeightClasses[source]'
  );
  rules.defineRule('combatNotes.dexterityArmorClassAdjustment',
    'armor', 'v', 'PH35.armorsMaxDexBonuses[source]'
  );
  rules.defineRule('magicNotes.arcaneSpellFailure',
    'casterLevelArcane', '?', null,
    'armor', '+=', 'PH35.armorsArcaneSpellFailurePercentages[source]',
    'shield', '+=', 'source == "None" ? 0 : ' +
                    'source == "Tower" ? 50 : ' +
                    'source.indexOf("Heavy") >= 0 ? 15 : 5'
  );
  rules.defineRule('skillNotes.armorSkillCheckPenalty',
    'armor', '=', 'PH35.armorsSkillCheckPenalties[source]'
  );
  rules.defineRule('speed', 'abilityNotes.armorSpeedAdjustment', '+', null);
  // TODO combatNotes.strengthDamageAdjustment handled directly by Scribe
  // Hack to get it to appear in italics
  rules.defineRule
    ('level', 'combatNotes.strengthDamageAdjustment', '=', 'null');

};

/* Defines the rules related to PH Chapter 5, Feats. */
PH35.featRules = function(rules, feats, subfeats) {

  var allFeats = [];
  for(var i = 0; i < feats.length; i++) {
    var pieces = feats[i].split(':');
    var feat = pieces[0];
    var featSubfeats = subfeats[feat];
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
        'sanityNotes.acrobaticFeatSkills:Requires Jump|Tumble',
        'skillNotes.acrobaticFeature:+2 Jump/Tumble'
      ];
    } else if(feat == 'Agile') {
      notes = [
        'sanityNotes.agileFeatSkills:Requires Balance|Escape Artist',
        'skillNotes.agileFeature:+2 Balance/Escape Artist'
      ];
    } else if(feat == 'Alertness') {
      notes = [
        'sanityNotes.alertnessFeatSkills:Requires Listen|Spot',
        'skillNotes.alertnessFeature:+2 Listen/Spot'
      ];
    } else if(feat == 'Animal Affinity') {
      notes = [
        'sanityNotes.animalAffinityFeatSkills:Requires Handle Animal|Ride',
        'skillNotes.animalAffinityFeature:+2 Handle Animal/Ride'
      ];
    } else if(feat == 'Armor Proficiency (Heavy)') {
      notes = [
        'sanityNotes.armorProficiency(Heavy)FeatProficiency:' +
        'Requires Class Armor Proficiency Level <= ' + PH35.PROFICIENCY_MEDIUM
      ];
      rules.defineRule('armorProficiencyLevel',
        'features.Armor Proficiency (Heavy)', '^', PH35.PROFICIENCY_HEAVY
      );
    } else if(feat == 'Armor Proficiency (Light)') {
      notes = [
        'sanityNotes.armorProficiency(Light)FeatProficiency:' +
        'Requires Class Armor Proficiency Level <= ' + PH35.PROFICIENCY_NONE
      ];
      rules.defineRule('armorProficiencyLevel',
        'features.Armor Proficiency (Light)', '^', PH35.PROFICIENCY_LIGHT
      );
    } else if(feat == 'Armor Proficiency (Medium)') {
      notes = [
        'sanityNotes.armorProficiency(Medium)FeatProficiency:' +
        'Requires Class Armor Proficiency Level <= ' + PH35.PROFICIENCY_LIGHT
      ];
      rules.defineRule('armorProficiencyLevel',
        'features.Armor Proficiency (Medium)', '^', PH35.PROFICIENCY_MEDIUM
      );
    } else if(feat == 'Athletic') {
      notes = [
        'sanityNotes.athleticFeatSkills:Requires Climb|Swim',
        'skillNotes.athleticFeature:+2 Climb/Swim'
      ];
    } else if(feat == 'Augment Summoning') {
      notes = [
        'magicNotes.augmentSummoningFeature:' +
          'Summoned creatures +4 strength/constitution',
        'validationNotes.augmentSummoningFeatFeats:' +
        'Requires Spell Focus (Conjuration)'
      ];
    } else if(feat == 'Blind Fight') {
      notes = [
        'combatNotes.blindFightFeature:' +
          'Reroll concealed miss/no bonus to invisible foe/half penalty for ' +
          'impaired vision'
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
        'validationNotes.cleaveFeatFeats:Requires Power Attack'
      ];
    } else if(feat == 'Combat Casting') {
      notes = [
        'sanityNotes.combatCastingFeatCasterLevel:Requires Caster Level >= 1',
        'skillNotes.combatCastingFeature:' +
          '+4 Concentration when casting on defensive'
      ];
    } else if(feat == 'Combat Expertise') {
      notes = [
        'combatNotes.combatExpertiseFeature:Up to -5 attack/+5 AC',
        'validationNotes.combatExpertiseFeatAbility:Requires Intelligence >= 13'
      ];
    } else if(feat == 'Combat Reflexes') {
      notes = [
        'combatNotes.combatReflexesFeature:Add dexterity mod to AOO count',
        'sanityNotes.combatReflexesFeatAbility:Requires Dexterity >= 12'
      ];
    } else if(feat == 'Craft Magic Arms And Armor') {
      notes = [
        'magicNotes.craftMagicArmsAndArmorFeature:' +
          'Create magic weapon/armor/shield',
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
        'magicNotes.craftWondrousItemFeature:Create miscellaneous magic item',
        'validationNotes.craftWondrousItemFeatCasterLevel:' +
          'Requires Caster Level >= 3'
      ];
    } else if(feat == 'Deceitful') {
      notes = [
        'sanityNotes.deceitfulFeatSkills:Requires Disguise|Forgery',
        'skillNotes.deceitfulFeature:+2 Disguise/Forgery'
      ];
    } else if(feat == 'Deflect Arrows') {
      notes = [
        'combatNotes.deflectArrowsFeature:Deflect ranged 1/round',
        'validationNotes.deflectArrowsFeatAbility:Requires Dexterity >= 13',
        'validationNotes.deflectArrowsFeatFeats:' +
          'Requires Improved Unarmed Strike'
      ];
    } else if(feat == 'Deft Hands') {
      notes = [
        'sanityNotes.deftHandsFeatSkills:Requires Sleight Of Hand|Use Rope',
        'skillNotes.deftHandsFeature:+2 Sleight Of Hand/Use Rope'
      ];
    } else if(feat == 'Diehard') {
      notes = [
        'combatNotes.diehardFeature:Remain conscious w/HP <= 0',
        'validationNotes.diehardFeatFeats:Requires Endurance'
      ];
    } else if(feat == 'Diligent') {
      notes = [
        'sanityNotes.diligentFeatSkills:Requires Appraise|Decipher Script',
        'skillNotes.diligentFeature:+2 Appraise/Decipher Script'
      ];
    } else if(feat == 'Dodge') {
      notes = [
        'combatNotes.dodgeFeature:+1 AC vs. designated foe',
        'validationNotes.dodgeFeatAbility:Requires Dexterity >= 13'
      ];
      rules.defineRule('armorClass', 'combatNotes.dodgeFeature', '+', '1');
    } else if(feat == 'Empower Spell') {
      notes = [
        'magicNotes.empowerSpellFeature:' +
          'x1.5 designated spell variable effects',
        'sanityNotes.empowerSpellFeatCasterLevel:Requires Caster Level >= 1'
      ];
    } else if(feat == 'Endurance') {
      notes = ['saveNotes.enduranceFeature:+4 extended physical action'];
    } else if(feat == 'Enlarge Spell') {
      notes = [
        'magicNotes.enlargeSpellFeature:x2 designated spell range',
        'sanityNotes.enlargeSpellFeatCasterLevel:Requires Caster Level >= 1'
      ];
    } else if(feat == 'Eschew Materials') {
      notes = [
        'magicNotes.eschewMaterialsFeature:Cast spells w/out materials',
        'sanityNotes.eschewMaterialsFeatCasterLevel:Requires Caster Level >= 1'
      ];
    } else if(feat == 'Extend Spell') {
      notes = [
        'magicNotes.extendSpellFeature:x2 designated spell duration',
        'sanityNotes.extendSpellFeatCasterLevel:Requires Caster Level >= 1'
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
        'combatNotes.farShotFeature:x1.5 projectile range; x2 thrown',
        'validationNotes.farShotFeatFeats:Requires Point Blank Shot'
      ];
    } else if(feat == 'Forge Ring') {
      notes = [
        'magicNotes.forgeRingFeature:Create magic ring',
        'validationNotes.forgeRingFeatCasterLevel:Requires Caster Level >= 12'
      ];
    } else if(feat == 'Great Cleave') {
      notes = [
        'combatNotes.greatCleaveFeature:Cleave w/out limit',
        'validationNotes.greatCleaveFeatAbility:Requires Strength >= 13',
        'validationNotes.greatCleaveFeatBaseAttack:Requires Base Attack >= 4',
        'validationNotes.greatCleaveFeatFeats:Requires Cleave/Power Attack'
      ];
    } else if(feat == 'Great Fortitude') {
      notes = ['saveNotes.greatFortitudeFeature:+2 Fortitude'];
      rules.defineRule
        ('save.Fortitude', 'saveNotes.greatFortitudeFeature', '+', '2');
    } else if((matchInfo = feat.match(/^Greater Spell Focus \((.*)\)$/))!=null){
      var school = matchInfo[1];
      var note = 'magicNotes.spellFocus(' + school + ')Feat';
      notes = [
        note + ':+1 DC on ' + school + ' spells',
        'sanityNotes.greaterSpellFocus(' + school + ')FeatCasterLevel:' +
          'Requires Caster Level >= 1',
        'validationNotes.greaterSpellFocus(' + school + ')FeatFeats:' +
          'Requires Spell Focus (' + school + ')'
      ];
    } else if(feat == 'Greater Spell Penetration') {
      notes = [
        'magicNotes.greaterSpellPenetrationFeature:' +
          '+2 caster level vs. resistance checks',
        'sanityNotes.greaterSpellPenetrationFeatCasterLevel:' +
          'Requires Caster Level >= 1',
        'validationNotes.greaterSpellPenetrationFeatFeats:' +
          'Requires Spell Penetration'
      ];
    } else if(feat == 'Greater Two Weapon Fighting') {
      notes = [
        'combatNotes.greaterTwoWeaponFightingFeature:' +
          'Second off-hand -10 attack',
        'validationNotes.greaterTwoWeaponFightingFeatAbility:' +
          'Requires Dexterity >= 19',
        'validationNotes.greaterTwoWeaponFightingFeatBaseAttack:' +
          'Requires Base Attack >= 11',
        'validationNotes.greaterTwoWeaponFightingFeatFeats:' +
          'Requires Two Weapon Fighting/Improved Two Weapon Fighting'
      ];
    } else if((matchInfo =
               feat.match(/^Greater Weapon Focus \((.*)\)$/)) != null) {
      var weapon = matchInfo[1];
      var weaponNoSpace = weapon.replace(/ /g, '');
      var note = 'combatNotes.greaterWeaponFocus(' + weaponNoSpace + ')Feature';
      notes = [
        note + ':+1 attack',
        'validationNotes.greaterWeaponFocus(' + weaponNoSpace + ')FeatFeats:' +
          'Requires Weapon Focus (' + weapon + ')',
        'validationNotes.greaterWeaponFocus(' + weaponNoSpace + ')FeatLevels:' +
          'Requires Fighter >= 8'
      ];
      rules.defineRule('weaponAttackAdjustment.' + weapon, note, '+=', '1');
    } else if((matchInfo =
               feat.match(/^Greater Weapon Specialization \((.*)\)$/))!=null) {
      var weapon = matchInfo[1];
      var weaponNoSpace = weapon.replace(/ /g, '');
      var note =
        'combatNotes.greaterWeaponSpecialization(' + weaponNoSpace + ')Feature';
      notes = [
        note + ':+2 damage',
        'validationNotes.greaterWeaponSpecialization('+weaponNoSpace+')FeatFeats:' +
          'Requires Weapon Focus (' + weapon + ')/' +
          'Greater Weapon Focus (' + weapon + ')/' +
          'Weapon Specialization (' + weapon + ')',
        'validationNotes.greaterWeaponSpecialization('+weaponNoSpace+')FeatLevels:' +
          'Requires Fighter >= 12'
      ];
      rules.defineRule('weaponDamageAdjustment.' + weapon, note, '+=', '2');
    } else if(feat == 'Heighten Spell') {
      notes = [
        'magicNotes.heightenSpellFeature:Increase designated spell level',
        'sanityNotes.heightenSpellFeatCasterLevel:Requires Caster Level >= 1'
      ];
    } else if(feat == 'Improved Bull Rush') {
      notes = [
        'combatNotes.improvedBullRushFeature:' +
          'Bull rush w/out foe AOO; +4 strength',
        'validationNotes.improvedBullRushFeatAbility:Requires Strength >= 13',
        'validationNotes.improvedBullRushFeatFeats:Requires Power Attack'
      ];
    } else if(feat == 'Improved Counterspell') {
      notes = [
        'magicNotes.improvedCounterspellFeature:Counter w/higher-level spell',
        'sanityNotes.improvedCounterspellFeatCasterLevel:' +
          'Requires Caster Level >= 1'
      ];
    } else if((matchInfo = feat.match(/^Improved Critical \((.*)\)$/)) != null){
      var weapon = matchInfo[1];
      var weaponNoSpace = weapon.replace(/ /g, '');
      var note = 'combatNotes.improvedCritical(' + weaponNoSpace + ')Feature';
      notes = [
        note + ':x2 critical threat range',
        'sanityNotes.improvedCritical('+weaponNoSpace+')FeatWeapons:' +
          'Requires ' + weapon,
        'validationNotes.improvedCritical('+weaponNoSpace+')FeatBaseAttack:' +
          'Requires Base Attack >= 8'
      ];
      var weaponPat = new RegExp('^' + weapon + ':');
      var bump = 1;
      for(var j = 0; j < PH35.WEAPONS.length; j++) {
        var spec = PH35.WEAPONS[j];
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
        'combatNotes.improvedDisarmFeature:Disarm w/out foe AOO; +4 attack',
        'validationNotes.improvedDisarmFeatAbility:Requires Intelligence >= 13',
        'validationNotes.improvedDisarmFeatFeats:Requires Combat Expertise'
      ];
    } else if(feat == 'Improved Feint') {
      notes = [
        'combatNotes.improvedFeintFeature:' +
          'Bluff check to feint as move action',
        'validationNotes.improvedFeintFeatAbility:Requires Intelligence >= 13',
        'validationNotes.improvedFeintFeatFeats:Requires Combat Expertise'
      ];
    } else if(feat == 'Improved Grapple') {
      notes = [
        'combatNotes.improvedGrappleFeature:Grapple w/out foe AOO; +4 grapple',
        'validationNotes.improvedGrappleFeatAbility:Requires Dexterity >= 13',
        'validationNotes.improvedGrappleFeatFeats:' +
          'Requires Improved Unarmed Strike'
      ];
    } else if(feat == 'Improved Initiative') {
      notes = ['combatNotes.improvedInitiativeFeature:+4 initiative'];
      rules.defineRule
        ('initiative', 'combatNotes.improvedInitiativeFeature', '+', '4');
    } else if(feat == 'Improved Overrun') {
      notes = [
        'combatNotes.improvedOverrunFeature:Foe cannot avoid; +4 strength',
        'validationNotes.improvedOverrunFeatAbility:Requires Strength >= 13',
        'validationNotes.improvedOverrunFeatFeats:Requires Power Attack'
      ];
    } else if(feat == 'Improved Precise Shot') {
      notes = [
        'combatNotes.improvedPreciseShotFeature:' +
          'No foe bonus for partial concealment; attack grappling w/no penalty',
        'validationNotes.improvedPreciseShotFeatAbility:' +
          'Requires Dexterity >= 19',
        'validationNotes.improvedPreciseShotFeatBaseAttack:' +
          'Requires Base Attack >= 11',
        'validationNotes.improvedPreciseShotFeatFeats:' +
          'Requires Point Blank Shot/Precise Shot'
      ];
    } else if(feat == 'Improved Shield Bash') {
      notes = [
        'combatNotes.improvedShieldBashFeature:Shield bash w/out AC penalty',
        'sanityNotes.improvedShieldBashShield:Requires Shield != None',
        'validationNotes.improvedShieldBashFeatFeatures:' +
          'Requires Shield Proficiency (Heavy)'
      ];
    } else if(feat == 'Improved Sunder') {
      notes = [
        'combatNotes.improvedSunderFeature:Sunder w/out foe AOO; +4 attack',
        'validationNotes.improvedSunderFeatAbility:Requires Strength >= 13',
        'validationNotes.improvedSunderFeatFeats:Requires Power Attack'
      ];
    } else if(feat == 'Improved Trip') {
      notes = [
        'combatNotes.improvedTripFeature:' +
          'Trip w/out foe AOO; +4 strength; attack immediately after trip',
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
    } else if(feat == 'Improved Two Weapon Fighting') {
      notes = [
        'combatNotes.improvedTwoWeaponFightingFeature:Additional -5 attack',
        'validationNotes.improvedTwoWeaponFightingFeatAbility:' +
          'Requires Dexterity >= 17',
        'validationNotes.improvedTwoWeaponFightingFeatBaseAttack:' +
          'Requires Base Attack >= 6',
        'validationNotes.improvedTwoWeaponFightingFeatFeats:' +
          'Requires Two Weapon Fighting'
      ];
    } else if(feat == 'Improved Unarmed Strike') {
      notes = [
        'combatNotes.improvedUnarmedStrikeFeature:Unarmed attack w/out foe AOO'
      ];
    } else if(feat == 'Investigator') {
      notes = [
        'sanityNotes.investigatorFeatSkills:Requires Gather Information|Search',
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
          'Requires Spellcraft|Use Magic Device',
        'skillNotes.magicalAptitudeFeature:+2 Spellcraft/Use Magic Device'
      ];
    } else if(feat == 'Manyshot') {
      notes = [
        'combatNotes.manyshotFeature:Fire multiple arrows simultaneously',
        'validationNotes.manyshotFeatAbility:Requires Dexterity >= 17',
        'validationNotes.manyshotFeatBaseAttack:Requires Base Attack >= 6',
        'validationNotes.manyshotFeatFeats:Requires Point Blank Shot/Rapid Shot'
      ];
    } else if(feat == 'Maximize Spell') {
      notes = [
        'magicNotes.maximizeSpellFeature:' +
          'Maximize all designated spell variable effects',
        'sanityNotes.maximizeSpellFeatCasterLevel:Requires Caster Level >= 1'
      ];
    } else if(feat == 'Mobility') {
      notes = [
        'combatNotes.mobilityFeature:+4 AC vs. movement AOO',
        'validationNotes.mobilityFeatAbility:Requires Dexterity >= 13',
        'validationNotes.mobilityFeatFeats:Requires Dodge'
      ];
    } else if(feat == 'Mounted Archery') {
      notes = [
        'combatNotes.mountedArcheryFeature:x.5 mounted ranged penalty',
        'validationNotes.mountedArcheryFeatFeats:Requires Mounted Combat',
        'validationNotes.mountedArcheryFeatSkills:Requires Ride'
      ];
    } else if(feat == 'Mounted Combat') {
      notes = [
        'combatNotes.mountedCombatFeature:' +
          'Ride skill save vs. mount damage 1/round',
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
        'sanityNotes.negotiatorFeatSkills:Requires Diplomacy|Sense Motive',
        'skillNotes.negotiatorFeature:+2 Diplomacy/Sense Motive'
      ];
    } else if(feat == 'Nimble Fingers') {
      notes = [
        'sanityNotes.nimbleFingersFeatSkills:Requires Disable Device|Open Lock',
        'skillNotes.nimbleFingersFeature:+2 Disable Device/Open Lock'
      ];
    } else if(feat == 'Persuasive') {
      notes = [
        'sanityNotes.persuasiveFeatSkills:Requires Bluff|Intimidate',
        'skillNotes.persuasiveFeature:+2 Bluff/Intimidate'
      ];
    } else if(feat == 'Point Blank Shot') {
      notes = [
        'combatNotes.pointBlankShotFeature:+1 ranged attack/damage w/in 30 ft'
      ];
    } else if(feat == 'Power Attack') {
      notes = [
        'combatNotes.powerAttackFeature:Attack base -attack/+damage',
        'validationNotes.powerAttackFeatAbility:Requires Strength >= 13'
      ];
    } else if(feat == 'Precise Shot') {
      notes = [
        'combatNotes.preciseShotFeature:Shoot into melee w/out penalty',
        'validationNotes.preciseShotFeatFeats:Requires Point Blank Shot'
      ];
    } else if(feat == 'Quick Draw') {
      notes = [
        'combatNotes.quickDrawFeature:Draw weapon as free action',
        'validationNotes.quickDrawFeatBaseAttack:Requires Base Attack >= 1'
      ];
    } else if(feat == 'Quicken Spell') {
      notes = [
        'magicNotes.quickenSpellFeature:Cast spell as free action 1/round',
        'sanityNotes.quickenSpellFeatCasterLevel:Requires Caster Level >= 1'
      ];
    } else if((matchInfo = feat.match(/^Rapid Reload \((.*)\)$/)) != null) {
      var weapon = matchInfo[1];
      var note = 'combatNotes.rapidReload(' + weapon + ')Feature';
      notes = [
        note + ':Reload ' + weapon + ' Crossbow as ' +
        (weapon == 'Heavy' ? 'move' : 'free') + ' action',
        'sanityNotes.rapidReload(' + weapon + ')FeatWeapons:' +
          'Requires ' + weapon + ' Crossbow'
      ];
    } else if(feat == 'Rapid Shot') {
      notes = [
        'combatNotes.rapidShotFeature:Normal and extra ranged -2 attacks',
        'validationNotes.rapidShotFeatAbility:Requires Dexterity >= 13',
        'validationNotes.rapidShotFeatFeats:Requires Point Blank Shot'
      ];
    } else if(feat == 'Ride By Attack') {
      notes = [
        'combatNotes.rideByAttackFeature:Move before and after mounted attack',
        'validationNotes.rideByAttackFeatFeats:Requires Mounted Combat',
        'validationNotes.rideByAttackFeatSkills:Requires Ride'
      ];
    } else if(feat == 'Run') {
      notes = [
        'combatNotes.runFeature:Add 1 to speed multiplier; +4 running jump'
      ];
      rules.defineRule
        ('runSpeedMultiplier', 'combatNotes.runFeature', '+', '1');
    } else if(feat == 'Scribe Scroll') {
      notes = [
        'magicNotes.scribeScrollFeature:Create scroll of any known spell',
        'validationNotes.scribeScrollFeatCasterLevel:Requires Caster Level >= 1'
      ];
    } else if(feat == 'Self Sufficient') {
      notes = [
        'sanityNotes.selfSufficientFeatSkills:Requires Heal|Survival',
        'skillNotes.selfSufficientFeature:+2 Heal/Survival'
      ];
    } else if(feat == 'Shield Proficiency (Heavy)') {
      notes = [
        'sanityNotes.shieldProficiency(Heavy)FeatProficiency:' +
          'Requires Class Shield Proficiency Level <= '+PH35.PROFICIENCY_MEDIUM
      ];
      rules.defineRule('shieldProficiencyLevel',
        'features.Shield Proficiency (Heavy)', '^', PH35.PROFICIENCY_HEAVY
      );
    } else if(feat == 'Shield Proficiency (Tower)') {
      notes = [
        'sanityNotes.shieldProficiency(Tower)FeatProficiency:' +
          'Requires Class Shield Proficiency Level <= ' + PH35.PROFICIENCY_HEAVY
      ];
      rules.defineRule('shieldProficiencyLevel',
        'features.Shield Proficiency (Tower)', '^', PH35.PROFICIENCY_TOWER
      );
    } else if(feat == 'Shot On The Run') {
      notes = [
        'combatNotes.shotOnTheRunFeature:Move before and after ranged attack',
        'validationNotes.shotOnTheRunFeatAbility:Requires Dexterity >= 13',
        'validationNotes.shotOnTheRunFeatBaseAttack:Requires Base Attack >= 4',
        'validationNotes.shotOnTheRunFeatFeats:' +
          'Requires Dodge/Mobility/Point Blank Shot'
      ];
    } else if(feat == 'Silent Spell') {
      notes = [
        'magicNotes.silentSpellFeature:Cast designated spell w/out speech',
        'sanityNotes.silentSpellFeatCasterLevel:Requires Caster Level >= 1'
      ];
    } else if((matchInfo = feat.match(/^Skill Focus \((.*)\)$/)) != null) {
      var skill = matchInfo[1];
      var skillNoSpace = skill.replace(/ /g, '');
      var note = 'skillNotes.skillFocus(' + skillNoSpace + ')Feature';
      notes = [
        note + ':+3 checks',
        'sanityNotes.skillFocus(' + skillNoSpace + ')FeatSkills:' +
          'Requires ' + skill
      ];
      rules.defineRule('skillModifier.' + skill, note, '+', '3');
    } else if(feat == 'Snatch Arrows') {
      notes = [
        'combatNotes.snatchArrowsFeature:Catch ranged weapons',
        'validationNotes.snatchArrowsFeatAbility:Requires Dexterity >= 15',
        'validationNotes.snatchArrowsFeatFeats:' +
          'Requires Deflect Arrows/Improved Unarmed Strike'
      ];
    } else if((matchInfo = feat.match(/^Spell Focus \((.*)\)$/)) != null) {
      var school = matchInfo[1];
      var note = 'magicNotes.spellFocus(' + school + ')Feature';
      notes = [
        note + ':+1 DC on ' + school + ' spells',
        'sanityNotes.spellFocus(' + school + ')FeatCasterLevel:' +
          'Requires Caster Level >= 1'
      ];
    } else if(feat == 'Spell Mastery') {
      notes = [
        'magicNotes.spellMasteryFeature:Prepare %V spells w/out spellbook',
        'validationNotes.spellMasteryFeatLevels:Requires Wizard >= 1'
      ];
      rules.defineRule('magicNotes.spellMasteryFeature',
        'intelligenceModifier', '=', '3 * source'
      );
    } else if(feat == 'Spell Penetration') {
      notes = [
        'magicNotes.spellPenetrationFeature:+2 caster level vs. resistance ' +
          'checks',
        'sanityNotes.spellPenetrationFeatCasterLevel:Requires Caster Level >= 1'
      ];
    } else if(feat == 'Spirited Charge') {
      notes = [
        'combatNotes.spiritedChargeFeature:' +
          'x2 damage (x3 lance) from mounted charge',
        'validationNotes.spiritedChargeFeatFeats:' +
          'Requires Mounted Combat/Ride By Attack',
        'validationNotes.spiritedChargeFeatSkills:Requires Ride'
      ];
    } else if(feat == 'Spring Attack') {
      notes = [
        'combatNotes.springAttackFeature:Move before and after melee attack',
        'validationNotes.springAttackFeatAbility:Requires Dexterity >= 13',
        'validationNotes.springAttackFeatBaseAttack:Requires Base Attack >= 4',
        'validationNotes.springAttackFeatFeats:Requires Dodge/Mobility'
      ];
    } else if(feat == 'Stealthy') {
      notes = [
        'sanityNotes.stealthyFeatSkills:Requires Hide|Move Silently',
        'skillNotes.stealthyFeature:+2 Hide/Move Silently'
      ];
    } else if(feat == 'Still Spell') {
      notes = [
        'magicNotes.stillSpellFeature:Cast designated spell w/out movement',
        'sanityNotes.stillSpellFeatCasterLevel:Requires Caster Level >= 1'
      ];
      rules.defineRule
        ('magicNotes.arcaneSpellFailure', 'features.Still Spell', 'v', '0');
    } else if(feat == 'Stunning Fist') {
      notes = [
        'combatNotes.stunningFistFeature:' +
          'Foe %V Fortitude save or stunned %1/day',
        'validationNotes.stunningFistFeatAbility:' +
          'Requires Dexterity >= 13/Wisdom >= 13',
        'validationNotes.stunningFistFeatBaseAttack:Requires Base Attack >= 8',
        'validationNotes.stunningFistFeatFeats:Requires Improved Unarmed Strike'
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
      rules.defineRule
        ('hitPoints', 'combatNotes.toughnessFeature', '+', '3 * source');
    } else if(feat == 'Track') {
      notes = [
        'sanityNotes.trackFeatSkills:Requires Survival',
        'skillNotes.trackFeature:Survival to follow creatures at 1/2 speed'
      ];
    } else if(feat == 'Trample') {
      notes = [
        'combatNotes.trampleFeature:' +
          'Mounted overrun unavoidable/bonus hoof attack',
        'validationNotes.trampleFeatFeats:Requires Mounted Combat',
        'validationNotes.trampleFeatSkills:Requires Ride'
      ];
    } else if(feat == 'Two Weapon Defense') {
      notes = [
        'combatNotes.twoWeaponDefenseFeature:+1 AC w/two weapons',
        'validationNotes.twoWeaponDefenseFeatAbility:Requires Dexterity >= 15',
        'validationNotes.twoWeaponDefenseFeatFeats:Requires Two Weapon Fighting'
      ];
    } else if(feat == 'Two Weapon Fighting') {
      notes = [
        'combatNotes.twoWeaponFightingFeature:' +
          'Reduce on-hand penalty by 2/off-hand by 6',
        'validationNotes.twoWeaponFightingFeatAbility:Requires Dexterity >= 15'
      ];
    } else if(feat == 'Weapon Finesse') {
      notes = [
        'combatNotes.weaponFinesseFeature:' +
          'Light weapon attacks use dexterity mod instead of strength mod',
        'sanityNotes.weaponFinesseFeatAbility:' +
          'Requires Dexterity Modifier > Strength Modifier',
        'validationNotes.weaponFinesseFeatBaseAttack:Requires Base Attack >= 1'
      ];
      rules.defineRule('combatNotes.dexterityMeleeAttackAdjustment',
        'combatNotes.weaponFinesseFeature', '?', null,
        'dexterityModifier', '=', 'source == 0 ? null : source'
      );
      rules.defineRule('combatNotes.strengthMeleeAttackAdjustment',
        'combatNotes.weaponFinesseFeature', '*', '0'
      );
      rules.defineRule('sanityNotes.weaponFinesseFeatAbility',
        'feats.Weapon Finesse', '=', '0',
        'dexterityModifier', '+', 'source',
        'strengthModifier', '+', '-source',
        '', 'v', '0'
      );
      rules.defineRule('meleeAttack',
        'combatNotes.dexterityMeleeAttackAdjustment', '+', null
      );
    } else if((matchInfo = feat.match(/^Weapon Focus \((.*)\)$/)) != null) {
      var weapon = matchInfo[1];
      var weaponNoSpace = weapon.replace(/ /g, '');
      var note = 'combatNotes.weaponFocus(' + weaponNoSpace + ')Feature';
      notes = [
        note + ':+1 attack',
        'sanityNotes.weaponFocus(' + weaponNoSpace + ')FeatWeapons:' +
          'Requires ' + weapon,
        'validationNotes.weaponFocus(' + weaponNoSpace + ')FeatBaseAttack:' +
          'Requires Base Attack >= 1'
      ];
      rules.defineRule('weaponAttackAdjustment.' + weapon, note, '+=', '1');
    } else if(feat == 'Weapon Proficiency (Simple)') {
      notes = [
        'sanityNotes.weaponProficiency(Simple)FeatProficiency:' +
          'Requires Class Weapon Proficiency Level <= ' + PH35.PROFICIENCY_NONE
      ];
      rules.defineRule('weaponProficiencyLevel',
        'features.Weapon Proficiency (Simple)', '^', PH35.PROFICIENCY_LIGHT
      );
    } else if(feat.match(/^Weapon Proficiency/)) {
      // empty
    } else if((matchInfo =
               feat.match(/^Weapon Specialization \((.*)\)$/)) != null) {
      var weapon = matchInfo[1];
      var weaponNoSpace = weapon.replace(/ /g, '');
      var note = 'combatNotes.weaponSpecialization('+weaponNoSpace+')Feature';
      notes = [
        note + ':+2 damage',
        'sanityNotes.weaponSpecialization(' + weaponNoSpace + ')FeatWeapons:' +
          'Requires ' + weapon,
        'validationNotes.weaponSpecialization('+weaponNoSpace+')FeatFeats:' +
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
        'validationNotes.whirlwindAttackFeatFeats:' +
          'Requires Combat Expertise/Dodge/Mobility/Spring Attack'
      ];
    } else if(feat == 'Widen Spell') {
      notes = [
        'magicNotes.widenSpellFeature:Double area of affect',
        'sanityNotes.widenSpellFeatCasterLevel:Requires Caster Level >= 1'
      ];
    } else {
      continue;
    }
    rules.defineChoice('feats', feat + ':' + pieces[1]);
    rules.defineRule('features.' + feat, 'feats.' + feat, '=', null);
    if(notes != null)
      rules.defineNote(notes);
  }

  rules.defineRule('armorProficiency',
    'armorProficiencyLevel', '=', 'PH35.proficiencyLevelNames[source]'
  );
  rules.defineRule('armorProficiencyLevel',
    '', '=', PH35.PROFICIENCY_NONE,
    'classArmorProficiencyLevel', '^=', null
  );
  rules.defineRule('shieldProficiency',
    'shieldProficiencyLevel', '=', 'PH35.proficiencyLevelNames[source]'
  );
  rules.defineRule('shieldProficiencyLevel',
    '', '=', PH35.PROFICIENCY_NONE,
    'classShieldProficiencyLevel', '^', null
  );
  rules.defineRule('weaponProficiency',
    'weaponProficiencyLevel', '=',
      'source == ' + PH35.PROFICIENCY_LIGHT + ' ? "Simple" : ' +
      'source == ' + PH35.PROFICIENCY_MEDIUM + ' ? "Martial" : ' +
      '"None"'
  );
  rules.defineRule('weaponProficiencyLevel',
    '', '=', PH35.PROFICIENCY_NONE,
    'classWeaponProficiencyLevel', '^', null
  );

  rules.defineNote
    ('validationNotes.featsTotal:Allocated feats differ from feat count ' +
     'total by %V');
  rules.defineRule('validationNotes.featsTotal',
    /^featCount\./, '+=', '-source',
    /^feats\./, '+=', null
  );

};

/* Defines the rules related to PH Chapter 10, Magic, and Chapter 11, Spells. */
PH35.magicRules = function(rules, classes, domains, schools) {

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
        'Expeditious Retreat:Feather Fall:Grease:Hypnotism:Identify:' +
        'Lesser Confusion:Magic Mouth:Nystul\'s Magic Aura:Obscure Object:' +
        'Remove Fear:Silent Image:Sleep:Summon Monster I:' +
        'Tasha\'s Hideous Laughter:Undetectable Alignment:Unseen Servant:' +
        'Ventriloquism',
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
        'Haste:Illusory Script:Invisibility Sphere:Leomund\'s Tiny Hut:' +
        'Lesser Geas:Major Image:Phantom Steed:Remove Curse:Scrying:' +
        'Sculpt Sound:Secret Page:See Invisibility:Sepia Snake Sigil:Slow:' +
        'Speak With Animals:Summon Monster III',
        'B4:Break Enchantment:Cure Critical Wounds:Detect Scrying:' +
        'Dimension Door:Dominate Person:Freedom Of Movement:' +
        'Greater Invisibility:Hallucinatory Terrain:Hold Monster:Legend Lore:' +
        'Leomund\'s Secure Shelter:Locate Creature:Modify Memory:' +
        'Neutralize Poison:Rainbow Pattern:Repel Vermin:Shadow Conjuration:' +
        'Shout:Speak With Plants:Summon Monster IV:Zone Of Silence',
        'B5:Dream:False Vision:Greater Dispel Magic:Greater Heroism:' +
        'Mass Cure Light Wounds:Mass Suggestion:Mind Fog:Mirage Arcana:' +
        'Mislead:Nightmare:Persistent Image:Seeming:Shadow Evocation:' +
        'Shadow Walk:Song Of Discord:Summon Monster V',
        'B6:Analyze Dweomer:Animate Objects:Eyebite:Find The Path:Geas/Quest:' +
        'Greater Scrying:Greater Shout:Heroes\' Feast:Mass Cat\'s Grace:' +
        'Mass Charm Monster:Mass Cure Moderate Wounds:Mass Eagle\'s Splendor:' +
        'Mass Fox\'s Cunning:Otto\'s Irresistible Dance:Permanent Image:' +
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
        'Unhallow',
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
        'Expeditious Retreat:Feather Fall:Grease:Hold Portal:Hypnotism:' +
        'Identify:Jump:Mage Armor:Magic Missile:Magic Weapon:Mount:' +
        'Nystul\'s Magic Aura:Obscuring Mist:Protection From Chaos:' +
        'Protection From Evil:Protection From Good:Protection From Law:' +
        'Ray Of Enfeeblement:Reduce Person:Shield:Shocking Grasp:' +
        'Silent Image:Sleep:Summon Monster I:Tenser\'s Floating Disk:' +
        'True Strike:Unseen Servant:Ventriloquism',
        'W2:Alter Self:Arcane Lock:Bear\'s Endurance:Blindness/Deafness:' +
        'Blur:Bull\'s Strength:Cat\'s Grace:Command Undead:Continual Flame:' +
        'Darkness:Darkvision:Daze Monster:Detect Thoughts:Eagle\'s Splendor:' +
        'False Life:Flaming Sphere:Fog Cloud:Fox\'s Cunning:Ghoul Touch:' +
        'Glitterdust:Gust Of Wind:Hypnotic Pattern:Invisibility:Knock:' +
        'Leomund\'s Trap:Levitate:Locate Object:Magic Mouth:' +
        'Melf\'s Acid Arrow:Minor Image:Mirror Image:Misdirection:' +
        'Obscure Object:Owl\'s Wisdom:Protection From Arrows:Pyrotechnics:' +
        'Resist Energy:Rope Trick:Scare:Scorching Ray:See Invisibility:' +
        'Shatter:Spectral Hand:Spider Climb:Summon Monster II:Summon Swarm:' +
        'Tasha\'s Hideous Laughter:Touch Of Idiocy:Web:Whispering Wind',
        'W3:Arcane Sight:Blink:Clairaudience/Clairvoyance:Daylight:' +
        'Deep Slumber:Dispel Magic:Displacement:Explosive Runes:Fireball:' +
        'Flame Arrow:Fly:Gaseous Form:Gentle Repose:Greater Magic Weapon:' +
        'Halt Undead:Haste:Heroism:Hold Person:Illusory Script:' +
        'Invisibility Sphere:Keen Edge:Leomund\'s Tiny Hut:Lightning Bolt:' +
        'Magic Circle Against Chaos:Magic Circle Against Evil:' +
        'Magic Circle Against Good:Magic Circle Against Law:Major Image:' +
        'Nondetection:Phantom Steed:Protection From Energy:Rage:' +
        'Ray Of Exhaustion:Secret Page:Sepia Snake Sigil:Shrink Item:' +
        'Sleet Storm:Slow:Stinking Cloud:Suggestion:Summon Monster III:' +
        'Tongues:Vampiric Touch:Water Breathing:Wind Wall',
        'W4:Animate Dead:Arcane Eye:Bestow Curse:Charm Monster:Confusion:' +
        'Contagion:Crushing Despair:Detect Scrying:Dimension Door:' +
        'Dimensional Anchor:Enervation:Evard\'s Black Tentacles:Fear:' +
        'Fire Shield:Fire Trap:Greater Invisibility:Hallucinatory Terrain:' +
        'Ice Storm:Illusionary Wall:Leomund\'s Secure Shelter:Lesser Geas:' +
        'Lesser Globe Of Invulnerability:Locate Creature:Mass Enlarge Person:' +
        'Mass Reduce Person:Minor Creation:Otiluke\'s Resilient Sphere:' +
        'Phantasmal Killer:Polymorph:Rainbow Pattern:' +
        'Rary\'s Mnemonic Enhancer:Remove Curse:Scrying:Shadow Conjuration:' +
        'Shout:Solid Fog:Stoneskin:Summon Monster IV:Wall Of Fire:Wall Of Ice',
        'W5:Animal Growth:Baleful Polymorph:Bigby\'s Interposing Hand:Blight:' +
        'Break Enchantment:Cloudkill:Cone Of Cold:Contact Other Plane:' +
        'Dismissal:Dominate Person:Dream:Fabricate:False Vision:Feeblemind:' +
        'Hold Monster:Leomund\'s Secret Chest:Lesser Planar Binding:' +
        'Magic Jar:Major Creation:Mind Fog:Mirage Arcana:' +
        'Mordenkainen\'s Faithful Hound:Mordenkainen\'s Private Sanctum:' +
        'Nightmare:Overland Flight:Passwall:Permanency:Persistent Image:' +
        'Prying Eyes:Rary\'s Telepathic Bond:Seeming:Sending:' +
        'Shadow Evocation:Stone Shape:Summon Monster V:Symbol Of Pain:' +
        'Symbol Of Sleep:Telekinesis:Teleport:Transmute Mud To Rock:' +
        'Transmute Rock To Mud:Wall Of Force:Wall Of Stone:Waves Of Fatigue',
        'W6:Acid Fog:Analyze Dweomer:Antimagic Field:Bigby\'s Forceful Hand:' +
        'Chain Lightning:Circle Of Death:Contingency:Control Water:' +
        'Create Undead:Disintegrate:Eyebite:Flesh To Stone:Geas/Quest:' +
        'Globe Of Invulnerability:Greater Dispel Magic:Greater Heroism:' +
        'Guards And Wards:Legend Lore:Mass Bear\'s Endurance:' +
        'Mass Bull\'s Strength:Mass Cat\'s Grace:Mass Eagle\'s Splendor:' +
        'Mass Fox\'s Cunning:Mass Owl\'s Wisdom:Mass Suggestion:Mislead:' +
        'Mordenkainen\'s Lucubration:Move Earth:Otiluke\'s Freezing Sphere:' +
        'Permanent Image:Planar Binding:Programmed Image:Repulsion:' +
        'Shadow Walk:Stone To Flesh:Summon Monster VI:Symbol Of Fear:' +
        'Symbol Of Persuasion:Tenser\'s Transformation:True Seeing:' +
        'Undeath To Death:Veil:Wall Of Iron',
        'W7:Banishment:Bigby\'s Grasping Hand:Control Undead:Control Weather:' +
        'Delayed Blast Fireball:Drawmij\'s Instant Summons:Ethereal Jaunt:' +
        'Finger Of Death:Forcecage:Greater Arcane Sight:Greater Scrying:' +
        'Greater Shadow Conjuration:Greater Teleport:Insanity:Limited Wish:' +
        'Mass Hold Person:Mass Invisibility:' +
        'Mordenkainen\'s Magnificent Mansion:Mordenkainen\'s Sword:' +
        'Phase Door:Plane Shift:Power Word, Blind:Prismatic Spray:' +
        'Project Image:Reverse Gravity:Sequester:Simulacrum:Spell Turning:' +
        'Statue:Summon Monster VII:Symbol Of Stunning:Symbol Of Weakness:' +
        'Teleport Object:Vision:Waves Of Exhaustion',
        'W8:Antipathy:Bigby\'s Clenched Fist:Binding:Clone:' +
        'Create Greater Undead:Demand:Dimensional Lock:Discern Location:' +
        'Greater Planar Binding:Greater Prying Eyes:Greater Shadow Evocation:' +
        'Greater Shout:Horrid Wilting:Incendiary Cloud:Iron Body:' +
        'Mass Charm Monster:Maze:Mind Blank:Moment Of Prescience:' +
        'Otiluke\'s Telekinetic Sphere:Otto\'s Irresistible Dance:Polar Ray:' +
        'Polymorph Any Object:Power Word, Stun:Prismatic Wall:' +
        'Protection From Spells:Scintillating Pattern:Screen:' +
        'Summon Monster VIII:Sunburst:Symbol Of Death:Symbol Of Insanity:' +
        'Sympathy:Temporal Stasis:Trap The Soul',
        'W9:Astral Projection:Bigby\'s Crushing Hand:Dominate Monster:' +
        'Energy Drain:Etherealness:Foresight:Freedom:Gate:Imprisonment:' +
        'Mass Hold Monster:Meteor Swarm:Mordenkainen\'s Disjunction:' +
        'Power Word, Kill:Prismatic Sphere:Refuge:Shades:Shapechange:' +
        'Soul Bind:Summon Monster IX:Teleportation Circle:Time Stop:' +
        'Wail Of The Banshee:Weird:Wish'
      ];
    } else
      continue;
    if(spells != null) {
      for(var j = 0; j < spells.length; j++) {
        var pieces = spells[j].split(':');
        for(var k = 1; k < pieces.length; k++) {
          var spell = pieces[k];
          var school = PH35.spellsSchools[spell];
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

  for(var i = 0; i < domains.length; i++) {
    var domain = domains[i];
    var notes;
    var spells;
    var turn;
    if(domain == 'Air') {
      notes = ['combatNotes.airDomain:Turn earth/rebuke air'];
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
        'combatNotes.destructionDomain:Smite (+4 attack/+level damage) 1/day'
      ];
      spells = [
        'Inflict Light Wounds', 'Shatter', 'Contagion',
        'Inflict Critical Wounds', 'Mass Inflict Light Wounds', 'Harm',
        'Disintegrate', 'Earthquake', 'Implosion'
      ];
      turn = null;
    } else if(domain == 'Earth') {
      notes = ['combatNotes.earthDomain:Turn air/rebuke earth'];
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
      notes = ['combatNotes.fireDomain:Turn water/rebuke fire'];
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
      notes = ['skillNotes.magicDomain:Use Magic Device at level/2'];
      spells = [
        'Nystul\'s Magic Aura', 'Identify', 'Dispel Magic',
        'Imbue With Spell Ability', 'Spell Resistance', 'Antimagic Field',
        'Spell Turning', 'Protection From Spells', 'Mordenkainen\'s Disjunction'
      ];
      turn = null;
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
    } else if(domain == 'Protection') {
      notes = ['magicNotes.protectionDomain:Protective ward 1/day'];
      spells = [
        'Sanctuary', 'Shield Other', 'Protection From Energy',
        'Spell Immunity', 'Spell Resistance', 'Antimagic Field', 'Repulsion',
        'Mind Blank', 'Prismatic Sphere'
      ];
      turn = null;
    } else if(domain == 'Strength') {
      notes = ['magicNotes.strengthDomain:Add level to strength 1 round/day'];
      spells = [
        'Enlarge Person', 'Bull\'s Strength', 'Magic Vestment',
        'Spell Immunity', 'Righteous Might', 'Stoneskin',
        'Bigby\'s Grasping Hand', 'Bigby\'s Clenched Fist',
        'Bigby\'s Crushing Hand'
      ];
      turn = null;
    } else if(domain == 'Sun') {
      notes = ['combatNotes.sunDomain:Destroy turned undead 1/day'];
      spells = [
        'Endure Elements', 'Heat Metal', 'Searing Light', 'Fire Shield',
        'Flame Strike', 'Fire Seeds', 'Sunbeam', 'Sunburst', 'Prismatic Sphere'
      ];
      turn = null;
    } else if(domain == 'Travel') {
      notes = [
        'magicNotes.travelDomain:<i>Freedom of Movement</i> 1 round/level/day',
        'skillNotes.travelDomain:Survival is a class skill'
      ];
      spells = [
        'Longstrider', 'Locate Object', 'Fly', 'Dimension Door', 'Teleport',
        'Find The Path', 'Greater Teleport', 'Phase Door', 'Astral Projection'
      ];
      turn = null;
    } else if(domain == 'Trickery') {
      notes =
        ['skillNotes.trickeryDomain:Bluff/Disguise/Hide are class skills'];
      spells = [
        'Disguise Self', 'Invisibility', 'Nondetection', 'Confusion',
        'False Vision', 'Mislead', 'Screen', 'Polymorph Any Object', 'Time Stop'
      ];
      turn = null;
    } else if(domain == 'War') {
      notes = ['featureNotes.warDomain:Weapon Proficiency/Weapon Focus (%V)'];
      spells = [
        'Magic Weapon', 'Spiritual Weapon', 'Magic Vestment', 'Divine Power',
        'Flame Strike', 'Blade Barrier', 'Power Word, Blind',
        'Power Word, Stun', 'Power Word, Kill'
      ];
      turn = null;
      rules.defineRule('featureNotes.warDomain',
        'deity', '=', 'PH35.deitiesFavoredWeapons[source]'
      );
      for(var a in PH35.deitiesFavoredWeapons) {
        var weapons = PH35.deitiesFavoredWeapons[a].split('/');
        for(var j = 0; j < weapons.length; j++) {
          var weapon = weapons[j];
          rules.defineRule('features.Weapon Focus (' + weapon + ')',
            'featureNotes.warDomain', '=',
            'source.indexOf("' + weapon + '") >= 0 ? 1 : null'
          );
        }
      }
    } else if(domain == 'Water') {
      notes = ['combatNotes.waterDomain:Turn fire/rebuke water'];
      spells = [
        'Obscuring Mist', 'Fog Cloud', 'Water Breathing', 'Control Water',
        'Ice Storm', 'Cone Of Cold', 'Acid Fog', 'Horrid Wilting',
        'Elemental Swarm'
      ];
      turn = 'Fire';
    } else
      continue;
    rules.defineChoice('domains', domain);
    if(notes != null) {
      rules.defineNote(notes);
    }
    if(spells != null) {
      for(var j = 0; j < spells.length; j++) {
        var spell = spells[j];
        var school = PH35.spellsSchools[spell];
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
    }
  }
  rules.defineNote
    ('validationNotes.domainsTotal:Allocated domains differ from domains ' +
     'total by %V');
  rules.defineRule('validationNotes.domainsTotal',
    'domainCount', '+=', '-source',
    /^domains\./, '+=', null
  );

  rules.defineRule
    ('armorClass', 'combatNotes.goodiesArmorClassAdjustment', '+', null);
  rules.defineRule('combatNotes.goodiesArmorClassAdjustment',
    'goodies.Ring Of Protection +1', '+=', null,
    'goodies.Ring Of Protection +2', '+=', 'source * 2',
    'goodies.Ring Of Protection +3', '+=', 'source * 3',
    'goodies.Ring Of Protection +4', '+=', 'source * 4'
  );
  rules.defineRule('casterLevel',
    'casterLevelArcane', '+=', null,
    'casterLevelDivine', '+=', null
  );

};

/* Defines the rules related to PH Chapter 2, Races. */
PH35.raceRules = function(rules, languages, races) {

  rules.defineChoice('languages', languages);
  for(var i = 0; i < languages.length; i++) {
    if(languages[i] == 'Common')
      rules.defineRule('languages.Common', '', '=', '1');
  }
  rules.defineRule('languageCount', 'race', '=', 'source != "Human" ? 2 : 1');
  rules.defineNote
    ('validationNotes.languagesTotal:Allocated languages differ from ' +
     'language total by %V');
  rules.defineRule('validationNotes.languagesTotal',
    'languageCount', '+=', '-source',
    /^languages\./, '+=', null
  );

  for(var i = 0; i < races.length; i++) {

    var adjustment, features, notes;
    var race = races[i];

    if(race == 'Dwarf') {

      adjustment = '+2 constitution/-2 charisma';
      features = [
        'Darkvision', 'Dodge Giants', 'Dwarf Favored Enemy', 'Know Depth',
        'Natural Smith', 'Resist Poison', 'Slow', 'Resist Spells',
        'Stability', 'Stonecunning'
      ];
      notes = [
        'abilityNotes.dwarfArmorSpeedAdjustment:No speed penalty in armor',
        'combatNotes.dodgeGiantsFeature:+4 AC vs. giant creatures',
        'combatNotes.dwarfFavoredEnemyFeature:' +
          '+1 vs. bugbear/goblin/hobgoblin/orc',
        'featureNotes.darkvisionFeature:60 ft b/w vision in darkness',
        'featureNotes.knowDepthFeature:Intuit approximate depth underground',
        'saveNotes.resistPoisonFeature:+2 vs. poison',
        'saveNotes.resistSpellsFeature:+2 vs. spells',
        'saveNotes.stabilityFeature:+4 vs. Bull Rush/Trip',
        'skillNotes.naturalSmithFeature:' +
           '+2 Appraise/Craft involving stone or metal',
        'skillNotes.stonecunningFeature:' +
          '+2 Search involving stone or metal/automatic check w/in 10 ft'
      ];
      rules.defineRule('abilityNotes.armorSpeedAdjustment',
        'abilityNotes.dwarfArmorSpeedAdjustment', '^', '0'
      );
      rules.defineRule('abilityNotes.dwarfArmorSpeedAdjustment',
        'race', '=', 'source == "Dwarf" ? 1 : null'
      );
      rules.defineRule('languages.Dwarven',
        'race', '=', 'source.indexOf("Dwarf") >= 0 ? 1 : null'
      );
      rules.defineRule
        ('resistance.Poison', 'saveNotes.resistPoisonFeature', '+=', '2');
      rules.defineRule
        ('resistance.Spell', 'saveNotes.resistSpellsFeature', '+=', '2');
      rules.defineRule('speed', 'features.Slow', '+', '-10');

    } else if(race == 'Elf') {

      adjustment = '+2 dexterity/-2 constitution';
      features = [
        'Resist Enchantment', 'Keen Senses', 'Low Light Vision',
        'Sense Secret Doors', 'Sleep Immunity'
      ];
      notes = [
        'featureNotes.lowLightVisionFeature:' +
          'Double normal distance in poor light',
        'featureNotes.senseSecretDoorsFeature:Automatic Search when w/in 5 ft',
        'saveNotes.resistEnchantmentFeature:+2 vs. enchantment',
        'saveNotes.sleepImmunityFeature:Immune <i>Sleep</i>',
        'skillNotes.keenSensesFeature:+2 Listen/Search/Spot'
      ];
      rules.defineRule('languages.Elven',
        'race', '=', 'source.indexOf("Elf") >= 0 ? 1 : null'
      );
      rules.defineRule('resistance.Enchantment',
        'saveNotes.resistEnchantmentFeature', '+=', '2'
      );

    } else if(race == 'Gnome') {

      adjustment = '+2 constitution/-2 strength';
      features = [
        'Dodge Giants', 'Gnome Favored Enemy', 'Gnome Spells',
        'Resist Illusion', 'Keen Ears', 'Keen Nose', 'Low Light Vision',
        'Natural Illusionist', 'Slow', 'Small'
      ];
      notes = [
        'combatNotes.dodgeGiantsFeature:+4 AC vs. giant creatures',
        'combatNotes.gnomeFavoredEnemyFeature:' +
           '+1 vs. bugbear/goblin/hobgoblin/kobold',
        'combatNotes.smallFeature:+1 AC/attack',
        'featureNotes.lowLightVisionFeature:' +
          'Double normal distance in poor light',
        'magicNotes.gnomeSpellsFeature:%V 1/day',
        'magicNotes.naturalIllusionistFeature:+1 DC on illusion spells',
        'saveNotes.resistIllusionFeature:+2 vs. illusions',
        'skillNotes.keenEarsFeature:+2 Listen',
        'skillNotes.smallFeature:+4 Hide',
        'skillNotes.keenNoseFeature:+2 Craft (Alchemy)'
      ];
      rules.defineRule('armorClass', 'combatNotes.smallFeature', '+', '1');
      rules.defineRule('languages.Gnome',
        'race', '=', 'source.indexOf("Gnome") >= 0 ? 1 : null'
      );
      rules.defineRule('magicNotes.gnomeSpellsFeature',
        'charisma', '=',
        '(source >= 10 ? "<i>Dancing Lights</i>/<i>Ghost Sound</i>/' +
        '<i>Prestidigitation</i>/" : "") + "<i>Speak With Animals</i>"'
      );
      rules.defineRule('meleeAttack', 'combatNotes.smallFeature', '+', '1');
      rules.defineRule('rangedAttack', 'combatNotes.smallFeature', '+', '1');
      rules.defineRule
        ('resistance.Illusion', 'saveNotes.resistIllusionFeature', '+=', '2');
      rules.defineRule('speed', 'features.Slow', '+', '-10');

    } else if(race == 'Half Elf') {

      adjustment = null;
      features = [
        'Alert Senses', 'Resist Enchantment', 'Low Light Vision',
        'Sleep Immunity', 'Tolerance'
      ];
      notes = [
        'featureNotes.lowLightVisionFeature:' +
          'Double normal distance in poor light',
        'saveNotes.resistEnchantmentFeature:+2 vs. enchantment',
        'saveNotes.sleepImmunityFeature:Immune <i>Sleep</i>',
        'skillNotes.alertSensesFeature:+1 Listen/Search/Spot',
        'skillNotes.toleranceFeature:+2 Diplomacy/Gather Information'
      ];
      rules.defineRule('languages.Elven',
        'race', '=', 'source.indexOf("Elf") >= 0 ? 1 : null'
      );
      rules.defineRule('resistance.Enchantment',
        'saveNotes.resistEnchantmentFeature', '+=', '2'
      );

    } else if(race == 'Half Orc') {

      adjustment = '+2 strength/-2 intelligence/-2 charisma';
      features = ['Darkvision'];
      notes = [
        'featureNotes.darkvisionFeature:60 ft b/w vision in darkness'
      ];
      rules.defineRule('languages.Orc',
        'race', '=', 'source.indexOf("Orc") >= 0 ? 1 : null'
      );

    } else if(race == 'Halfling') {

      adjustment = '+2 dexterity/-2 strength';
      features = [
        'Accurate', 'Fortunate', 'Keen Ears', 'Slow', 'Small', 'Spry',
        'Resist Fear'
      ];
      notes = [
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
        'race', '=', 'source.indexOf("Halfling") >= 0 ? 1 : null'
      );
      rules.defineRule('meleeAttack', 'combatNotes.smallFeature', '+', '1');
      rules.defineRule('rangedAttack', 'combatNotes.smallFeature', '+', '1');
      rules.defineRule
        ('resistance.Fear', 'saveNotes.resistFearFeature', '+=', '2');
      rules.defineRule('speed', 'features.Slow', '+', '-10');
      rules.defineRule('save.Fortitude','saveNotes.fortunateFeature','+','1');
      rules.defineRule('save.Reflex', 'saveNotes.fortunateFeature', '+', '1');
      rules.defineRule('save.Will', 'saveNotes.fortunateFeature', '+', '1');

    } else if(race == 'Human') {

      adjustment = null;
      features = null;
      notes = null;
      rules.defineRule
        ('featCount.General', 'featureNotes.humanFeatCountBonus', '+', null);
      rules.defineRule('featureNotes.humanFeatCountBonus',
        'race', '+=', 'source == "Human" ? 1 : null'
      );
      rules.defineRule('skillNotes.humanSkillPointsBonus',
        'race', '?', 'source == "Human"',
        'level', '=', 'source + 3'
      );
      rules.defineRule
        ('skillPoints', 'skillNotes.humanSkillPointsBonus', '+', null);

    } else
      continue;

    PH35.defineRace(rules, race, adjustment, features);
    if(notes != null) {
      rules.defineNote(notes);
    }

  }

};

/* Defines the rules related to PH Chapter 4, Skills. */
PH35.skillRules = function(rules, skills, subskills) {

  var abilityNames = {
    'cha':'charisma', 'con':'constitution', 'dex':'dexterity',
    'int':'intelligence', 'str':'strength', 'wis':'wisdom'
  };
  var synergies = {
    'Bluff':'Diplomacy/Intimidate/Sleight Of Hand',
    'Decipher Script':'Use Magic Device (scrolls)',
    'Escape Artist':'Use Rope (bindings)',
    'Handle Animal':'Ride',
    'Jump':'Tumble',
    'Knowledge (Arcana)':'Spellcraft',
    'Knowledge (Dungeoneering)':'Survival (underground)',
    'Knowledge (Engineering)':'Search (secret doors)',
    'Knowledge (Geography)':'Survival (lost/hazards)',
    'Knowledge (History)':'Bardic knowledge',
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

  var allSkills = [];
  for(var i = 0; i < skills.length; i++) {
    var pieces = skills[i].split(':');
    var skill = pieces[0];
    var skillSubskills = subskills[skill];
    if(skillSubskills == null) {
      allSkills[allSkills.length] = skill + ':' + pieces[1];
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
    var synergy = synergies[skill];
    rules.defineChoice('skills', skill + ':' + pieces[1]);
    rules.defineRule('skillModifier.' + skill,
      'skills.' + skill, '=', 'source / 2',
      'classSkills.' + skill, '*', '2'
    );
    if(abilityNames[ability] != null) {
      var modifier = abilityNames[ability] + 'Modifier';
      rules.defineRule('skillModifier.' + skill, modifier, '+', null);
    }
    if(skill == 'Heal') {
      rules.defineChoice('goodies', 'Healer\'s Kit');
      rules.defineRule('skillNotes.goodiesHealAdjustment',
        'goodies.Healer\'s Kit', '+=', '2'
      );
      rules.defineRule
        ('skillModifier.Heal', 'skillNotes.goodiesHealAdjustment', '+', null);
    } else if(skill == 'Speak Language') {
      rules.defineRule
        ('languageCount', 'skillModifier.Speak Language', '+', null);
    }
    if(synergy != null) {
      var prefix = skill.substring(0, 1).toLowerCase() +
                   skill.substring(1).replace(/ /g, '');
      rules.defineNote('skillNotes.' + prefix + 'Synergy:+2 ' + synergy);
      // Second notes for some synergies to distinguish bonuses automatically
      // applied by Scribe from those the DM must apply.  Also, additional
      // rules for effects on non-skill attributes.
      if(skill == 'Bluff') {
        rules.defineNote('skillNotes.bluffSynergy2:+2 Disguise (acting)');
        rules.defineRule('skillNotes.bluffSynergy2',
          'skillModifier.Bluff', '=', 'source >= 5 ? 1 : null'
        );
      } else if(skill == 'Handle Animal') {
        rules.defineNote
          ('skillNotes.handleAnimalSynergy2:+2 Wild Empathy checks');
        rules.defineRule('skillNotes.handleAnimalSynergy2',
          'skillModifier.Handle Animal', '=', 'source >= 5 ? 1 : null'
        );
        rules.defineRule('skillNotes.wildEmpathyFeature',
          'skillNotes.handleAnimalSynergy', '+', '2'
        );
      } else if(skill == 'Knowledge (History)') {
        rules.defineRule('skillNotes.bardicKnowledgeFeature',
          'skillNotes.knowledge(History)Synergy', '+', '2'
       );
      } else if(skill == 'Knowledge (Religion)') {
        rules.defineRule('turnUndead.maxHitDice',
          'skillNotes.knowledge(Religion)Synergy', '+', '2'
        );
      }
    }
  }

  rules.defineNote
    ('validationNotes.skillsTotal:Allocated skill points differ from skill ' +
     'point total by %V');
  rules.defineRule('validationNotes.skillsTotal',
    'skillPoints', '+=', '-source',
    /^skills\./, '+=', null
  );
  rules.defineNote
    ('validationNotes.skillMaximum:Points allocated to one or more skills ' +
     'exceed maximum');
  rules.defineRule('maxAllocatedSkillPoints', /^skills\./, '^=', null);
  rules.defineRule('validationNotes.skillMaximum',
    'maxAllocatedSkillPoints', '=', '-source',
    'classSkillMaxRanks', '+', 'source',
    '', 'v', '0'
  );

};

/* Returns a random name for a character of race #race#. */
PH35.randomName = function(race) {

  /* Return a random character from #string#. */
  function randomChar(string) {
    return string.charAt(ScribeUtils.random(0, string.length - 1));
  }

  if(race == null)
    race = 'Human';
  else if(race == 'Half Elf')
    race = ScribeUtils.random(0, 99) < 50 ? 'Elf' : 'Human';
  else if(race.indexOf('Dwarf') >= 0)
    race = 'Dwarf';
  else if(race.indexOf('Elf') >= 0)
    race = 'Elf';
  else if(race.indexOf('Gnome') >= 0)
    race = 'Gnome';
  else if(race.indexOf('Halfling') >= 0)
    race = 'Halfling';
  else if(race.indexOf('Orc') >= 0)
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

PH35.initialEditorElements = function() {
  var abilityChoices = [
    3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
  ];
  var editorElements = [
    ['name', 'Name', 'text', [20]],
    ['race', 'Race', 'select-one', 'races'],
    ['experience', 'Experience', 'text', [8]],
    ['levels', 'Levels', 'bag', 'levels'],
    ['imageUrl', 'Image URL', 'text', [20]],
    ['strength', 'Strength', 'select-one', abilityChoices],
    ['intelligence', 'Intelligence', 'select-one', abilityChoices],
    ['wisdom', 'Wisdom', 'select-one', abilityChoices],
    ['dexterity', 'Dexterity', 'select-one', abilityChoices],
    ['constitution', 'Constitution', 'select-one', abilityChoices],
    ['charisma', 'Charisma', 'select-one', abilityChoices],
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
    ['spells', 'Spells', 'set', 'spells'],
    ['goodies', 'Goodies', 'bag', 'goodies'],
    ['domains', 'Cleric Domains', 'set', 'domains'],
    ['specialize', 'Wizard Specialization', 'set', 'schools'],
    ['prohibit', 'Wizard Prohibition', 'set', 'schools'],
    ['notes', 'Notes', 'textarea', [40,10]],
    ['dmNotes', 'DM Notes', 'textarea', [40,10]]
  ];
  return editorElements;
};

/* Sets #attributes#'s #attribute# attribute to a random value. */
PH35.randomizeOneAttribute = function(attributes, attribute) {

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

  if(attribute == 'deity') {
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
    attrs = this.applyRules(attributes);
    var toAllocateByType = {};
    var countPat = new RegExp
      ('^' + (attribute=='feats' ? 'feat' : 'selectableFeature') + 'Count\\.');
    var prefix = attribute == 'feats' ? 'feats' : 'selectableFeatures';
    var suffix = attribute == 'feats' ? 'Feat' : 'SelectableFeature';
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
    for(attr in toAllocateByType) {
      howMany = toAllocateByType[attr];
      var availableChoicesInType = {};
      for(var a in availableChoices) {
        if(attr == 'General' ||
           ScribeUtils.findElement(availableChoices[a].split('/'), attr) >= 0) {
          availableChoicesInType[a] = '';
        }
      }
      while(howMany > 0 &&
            (choices=ScribeUtils.getKeys(availableChoicesInType)).length > 0) {
        var choice = choices[ScribeUtils.random(0, choices.length - 1)];
        attributes[prefix + '.' + choice] = 1;
        delete availableChoicesInType[choice];
        var name = choice.substring(0, 1).toLowerCase() +
                   choice.substring(1).replace(/ /g, '');
        var validation = this.applyRules(attributes);
        var validNote = 'validationNotes.' + name + suffix;
        var isValid = true;
        for(var a in validation) {
          if((a.substring(0, validNote.length) == validNote) && validation[a]) {
            isValid = false;
            break;
          }
        }
        if(isValid) {
          howMany--;
          delete availableChoices[choice];
        } else {
          delete attributes[prefix + '.' + choice];
        }
      }
    }
  } else if(attribute == 'goodies') {
    attrs = this.applyRules(attributes);
    choices = ScribeUtils.getKeys(this.getChoices('goodies'));
    howMany = Math.floor((attrs.level + 1) / 3);
    pickAttrs(attributes, 'goodies.', choices, howMany -
              ScribeUtils.sumMatching(attrs, /^goodies\./), 1);
  } else if(attribute == 'hitPoints') {
    attributes.hitPoints = 0;
    for(var klass in this.getChoices('levels')) {
      if((attr = attributes['levels.' + klass]) == null)
        continue;
      var matchInfo =
        this.getChoices('levels')[klass].match(/^((\d+)?d)?(\d+)$/);
      var number = matchInfo == null || matchInfo[2] == null ? 1 : matchInfo[2];
      var sides = matchInfo == null || matchInfo[3] == null ? 6 : matchInfo[3];
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
    choices = ScribeUtils.getKeys(this.getChoices('levels'));
    howMany = ScribeUtils.sumMatching(attributes, /^levels\./);
    if(howMany == 0) {
      var classes = ScribeUtils.random(1, 100);
      classes = classes <= 85 ? 1 : classes <= 95 ? 2 : 3;
      for(i = 0; i < classes; i++) {
        var level = ScribeUtils.random(1, 100);
        level = level<=50 ? 1 : level<=75 ? 2 : level<=87 ? 3 : level<=93 ? 4 :
                level<=96 ? 5 : level<=98 ? 6 : level<=99 ? 7 : 8;
        pickAttrs(attributes, 'levels.', choices, 1, level);
        howMany += level;
      }
    }
    var min = howMany * (howMany - 1) * 1000 / 2;
    var max = howMany * (howMany + 1) * 1000 / 2 - 1;
    if(attributes.experience == null ||
       attributes.experience < min ||
       attributes.experience > max) {
      attributes.experience = ScribeUtils.random(min, max);
    }
  } else if(attribute == 'name') {
    attributes['name'] = PH35.randomName(attributes['race']);
  } else if(attribute == 'skills') {
    attrs = this.applyRules(attributes);
    var maxPoints = attrs.classSkillMaxRanks;
    howMany =
      attrs.skillPoints - ScribeUtils.sumMatching(attributes, '^skills\\.'),
    choices = ScribeUtils.getKeys(this.getChoices('skills'));
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
        attributes[attr] = 0;
      var toAssign =
        ScribeUtils.random(0, 99) >= 66 ? maxPoints :
        ScribeUtils.random(0, 99) >= 50 ? Math.floor(maxPoints / 2) : 2;
      if(toAssign > howMany)
        toAssign = howMany;
      if(current + toAssign > maxPoints)
        toAssign = maxPoints - current;
      attributes[attr] = attributes[attr] - 0 + toAssign;
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
    choices = [];
    for(attr in this.getChoices('weapons'))
      choices[choices.length] = attr;
    pickAttrs(attributes, 'weapons.', choices,
              2 - ScribeUtils.sumMatching(attributes, /^weapons\./), 1);
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

/*
 * Fixes as many validation errors in #attributes# as possible.
 */
PH35.makeValid = function(attributes) {
  var attributesFixed = {};
  var choices;
  var debug = [];
  var fixCount;
  var matchInfo;
  var notes = this.getChoices('notes');
  var passes = 5;
  do {
    var applied = this.applyRules(attributes);
    fixCount = 0;
    for(var attr in applied) {
      var noteValue = applied[attr];
      if((matchInfo=
          attr.match(/^(sanity|validation)Notes\.(.*)([A-Z][a-z]+)/))==null ||
         !noteValue ||
         notes[attr] == null) {
        continue;
      }
      var notePrefix = matchInfo[2];
      var noteSuffix = matchInfo[3].substring(0, 1).toLowerCase() +
                       matchInfo[3].substring(1).replace(/ /g, '');
      if(noteSuffix == 'features') {
        noteSuffix = 'selectableFeatures';
      }
      var requireds = notes[attr].replace(/^Requires /, '').split(/\s*\/\s*/);
      for(var i = 0; i < requireds.length; i++) {
        choices = requireds[i].split(/\s*\|\s*/);
        matchInfo = choices[ScribeUtils.random(0, choices.length - 1)].
                    match(/^([^<>!=]+)([<>!=]+)?(.*)?/);
        if(matchInfo == null) {
          continue;
        }
        var toFixName = matchInfo[1].replace(/\s+$/, '');
        var toFixOp = matchInfo[2] == null ? '>=' : matchInfo[2];
        var toFixValue =
          matchInfo[3] == null ? 1 : matchInfo[3].replace(/^\s+/, '');;
        var toFixAttr = toFixName.substring(0, 1).toLowerCase() +
                        toFixName.substring(1).replace(/ /g, '');
        choices = this.getChoices(toFixAttr + 's');
        if(choices == null) {
           choices = this.getChoices(noteSuffix);
        }
        if(choices != null) {
          var target =
            this.getChoices(noteSuffix) == null ? toFixValue : toFixName;
          var possibilities = [];
          for(var choice in choices) {
            if(toFixOp != '!=' && choice == target) {
              possibilities = [choice];
              break;
            } else if((toFixOp == '!=') != (choice.indexOf(target) >= 0)) {
              possibilities[possibilities.length] = choice;
            }
          }
          if(possibilities.length == 0) {
            continue;
          }
          if(target == toFixName) {
            toFixAttr =
              noteSuffix + '.' +
              possibilities[ScribeUtils.random(0, possibilities.length - 1)];
          } else {
            toFixValue =
              possibilities[ScribeUtils.random(0, possibilities.length - 1)];
          }
        }
        if((choices != null || attributes[toFixAttr] != null) &&
           attributesFixed[toFixAttr] == null)  {
          debug[debug.length] = "'" + toFixAttr + "': '" + attributes[toFixAttr] + "' => '" + toFixValue + "'";
          attributes[toFixAttr] = toFixValue;
          if(toFixValue == 0) {
            delete attributes[toFixAttr];
          }
          attributesFixed[toFixAttr] = toFixValue;
          fixCount++;
        } else if(noteSuffix == 'total' && noteValue > 0 &&
                  (choices = this.getChoices(notePrefix)) != null) {
          var possibilities = [];
          for(var k in attributes) {
            if(k.match('^' + notePrefix + '\\.') && attributesFixed[k]==null) {
               possibilities[possibilities.length] = k;
            }
          }
          while(possibilities.length > 0 && noteValue > 0) {
            var index = ScribeUtils.random(0, possibilities.length - 1);
            toFixAttr = possibilities[index];
            possibilities =
              possibilities.slice(0,index).concat(possibilities.slice(index+1));
            var current = attributes[toFixAttr];
            toFixValue = current > noteValue ? current - noteValue : 0;
            debug[debug.length] = "'" + toFixAttr + "': '" + attributes[toFixAttr] + "' => '" + toFixValue + "'";
            attributes[toFixAttr] = toFixValue;
            noteValue -= current - toFixValue;
            if(toFixValue == 0) {
              delete attributes[toFixAttr];
            }
            // Don't do this: attributesFixed[toFixAttr] = toFixValue;
            fixCount++;
          }
        } else if(noteSuffix == 'total' && noteValue < 0 &&
                  (choices = this.getChoices(notePrefix)) != null) {
          this.randomizeOneAttribute(attributes,
            notePrefix == 'selectableFeatures' ? 'features' : notePrefix
          );
          debug[debug.length] = 'Allocate additional ' + notePrefix;
          fixCount++;
        } else if(attr == 'validationNotes.abilityModifierSum') {
          var abilities = {
            'charisma':'', 'constitution':'', 'dexterity':'',
            'intelligence':'', 'strength':'', 'wisdom':''
          };
          for(toFixAttr in abilities) {
            if(applied[toFixAttr + 'Modifier'] <= 0) {
              toFixValue = attributes[toFixAttr] + 2;
              debug[debug.length] = "'" + toFixAttr + "': '" + attributes[toFixAttr] + "' => '" + toFixValue + "'";
              attributes[toFixAttr] = toFixValue;
              // Don't do this: attributesFixed[toFixAttr] = toFixValue;
              fixCount++;
            }
          }
        }
      }
    }
    debug[debug.length] = '-----';
    if(--passes <= 0 && fixCount > 0) {
      alert('makeValid:Giving up\n' + debug.join('\n'));
      break;
    }
  } while(fixCount > 0);
  if(window.DEBUG) {
    attributes['notes'] = debug.join('<br/>');
  }
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
PH35.defineClass = function
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
  if(saveFortitudeBonus != null)
    rules.defineRule('save.Fortitude', classLevel, '+', saveFortitudeBonus);
  if(saveReflexBonus != null)
    rules.defineRule('save.Reflex', classLevel, '+', saveReflexBonus);
  if(saveWillBonus != null)
    rules.defineRule('save.Will', classLevel, '+', saveWillBonus);
  if(armorProficiencyLevel != null &&
     armorProficiencyLevel != PH35.PROFICIENCY_NONE)
    rules.defineRule
      ('classArmorProficiencyLevel', classLevel, '^=', armorProficiencyLevel);
  if(shieldProficiencyLevel != null &&
     shieldProficiencyLevel != PH35.PROFICIENCY_NONE)
    rules.defineRule
      ('classShieldProficiencyLevel', classLevel, '^=', shieldProficiencyLevel);
  if(weaponProficiencyLevel != null &&
     weaponProficiencyLevel != PH35.PROFICIENCY_NONE) {
    rules.defineRule
      ('classWeaponProficiencyLevel', classLevel, '^=', weaponProficiencyLevel);
  }
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
      rules.defineRule(prefix + 'Features.' + feature,
        'levels.' + name, '=', 'source >= ' + level + ' ? 1 : null'
      );
      rules.defineRule
        ('features.' + feature, prefix + 'Features.' + feature, '+=', null);
    }
    rules.defineSheetElement(name + ' Features', 'Feats', null, ' * ');
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
        var modifiier = spellAbility + 'Modifier';
        var level = typeAndLevel.replace(/[A-Za-z]*/g, '');
        if(level > 0) {
          code = 'source >= ' + level +
                 ' ? 1 + Math.floor((source - ' + level + ') / 4) : null';
          rules.defineRule
            ('spellsPerDay.' + typeAndLevel, modifiier, '+', code);
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
PH35.defineRace = function(rules, name, abilityAdjustment, features) {
  rules.defineChoice('races', name);
  var prefix =
    name.substring(0, 1).toLowerCase() + name.substring(1).replace(/ /g, '');
  if(abilityAdjustment != null) {
    var abilityNote = 'abilityNotes.' + prefix + 'AbilityAdjustment';
    rules.defineNote(abilityNote + ':' + abilityAdjustment);
    var adjustments = abilityAdjustment.split(/\//);
    for(var i = 0; i < adjustments.length; i++) {
      var amountAndAbility = adjustments[i].split(/ +/);
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
      rules.defineRule(prefix + 'Features.' + feature,
        'race', '?', 'source == "' + name + '"',
        'level', '=', 'source >= ' + level + ' ? 1 : null'
      );
      rules.defineRule
        ('features.' + feature, prefix + 'Features.' + feature, '+=', null);
    }
    rules.defineSheetElement(name + ' Features', 'Feats', null, ' * ');
  }
};

/* Convenience functions that invoke ScribeRules methods on the PH35 rules. */
PH35.applyRules = function() {
  return PH35.rules.applyRules.apply(PH35.rules, arguments);
};

PH35.defineChoice = function() {
  return PH35.rules.defineChoice.apply(PH35.rules, arguments);
};

PH35.defineEditorElement = function() {
  return PH35.rules.defineEditorElement.apply(PH35.rules, arguments);
};

PH35.defineNote = function() {
  return PH35.rules.defineNote.apply(PH35.rules, arguments);
};

PH35.defineRule = function() {
  return PH35.rules.defineRule.apply(PH35.rules, arguments);
};

PH35.defineSheetElement = function() {
  return PH35.rules.defineSheetElement.apply(PH35.rules, arguments);
};

PH35.getChoices = function() {
  return PH35.rules.getChoices.apply(PH35.rules, arguments);
};

PH35.isSource = function() {
  return PH35.rules.isSource.apply(PH35.rules, arguments);
};
