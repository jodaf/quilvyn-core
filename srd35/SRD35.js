/* $Id: SRD35.js,v 1.40 2006/09/26 04:48:56 Jim Exp $ */

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
 * This module loads the rules from the Player's Handbook v3.5 Edition.
 * The PH35 function contains methods that load rules for particular
 * parts/chapters of the PH; raceRules for character races, magicRules for
 * spells, etc.  Any of these member methods can be set to null or overridden
 * before calling PH35 in order to use a subset of the PH v3.5 rules.
 * Similarly, the constant fields of PH35--ALIGNMENTS, FEATS, etc.--can be
 * manipulated in order to trim the choices offered.
 */
function PH35() {
  if(PH35.abilityRules != null) PH35.abilityRules();
  if(PH35.raceRules != null) PH35.raceRules();
  if(PH35.classRules != null) PH35.classRules();
  if(PH35.skillRules != null) PH35.skillRules();
  if(PH35.featRules != null) PH35.featRules();
  if(PH35.descriptionRules != null) PH35.descriptionRules();
  if(PH35.equipmentRules != null) PH35.equipmentRules();
  if(PH35.combatRules != null) PH35.combatRules();
  if(PH35.adventuringRules != null) PH35.adventuringRules();
  if(PH35.magicRules != null) PH35.magicRules();
  if(PH35.randomize != null) {
    ScribeCustomRandomizers(PH35.randomize,
      'alignment', 'armor', 'charisma', 'constitution', 'deity', 'dexterity',
      'domains', 'feats', 'gender', 'hitPoints', 'intelligence', 'languages',
      'levels', 'name', 'race', 'selectableFeatures', 'shield', 'skills',
      'specialization', 'spells', 'strength', 'weapons', 'wisdom'
    );
  }
  PH35.abilityRules = PH35.raceRules = PH35.classRules = PH35.skillRules = 
    PH35.featRules = PH35.descriptionRules = PH35.equipmentRules = 
    PH35.combatRules = PH35.adventuringRules = PH35.magicRules = null;
  // A rule for handling DM-only information
  ScribeCustomRules('dmNotes', 'dmonly', '?', null);
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

// Arrays of choices passed to Scribe.
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
  'Olidammara (CN Theives):Chaos/Luck/Trickery',
  'Pelor (NG Sun):Good/Healing/Strength/Sun',
  'St. Cuthbert (LN Retribution):Destruction/Law/Protection/Strength',
  'Wee Jas (LN Death And Magic):Death/Law/Magic',
  'Yondalla (LG Halflings):Good/Law/Protection',
  'Vecna (NE Secrets):Evil/Knowledge/Magic'
];
PH35.DOMAINS = [
  'Air', 'Animal', 'Chaos', 'Death', 'Destruction', 'Earth', 'Evil', 'Fire',
  'Good', 'Healing', 'Knowledge', 'Law', 'Luck', 'Magic', 'Plant',
  'Protection', 'Strength', 'Sun', 'Travel', 'Trickery', 'War', 'Water'
];
PH35.FEATS = [
  'Acrobatic', 'Agile', 'Alertness', 'Animal Affinity',
  'Armor Proficiency Heavy', 'Armor Proficiency Light',
  'Armor Proficiency Medium', 'Athletic', 'Augment Summoning', 'Blind Fight',
  'Brew Potion', 'Cleave', 'Combat Casting', 'Combat Expertise',
  'Combat Reflexes', 'Craft Magic Arms And Armor', 'Craft Rod', 'Craft Staff',
  'Craft Wand', 'Craft Wondrous Item', 'Deceitful', 'Deflect Arrows',
  'Deft Hands', 'Diehard', 'Diligent', 'Dodge', 'Empower Spell', 'Endurance',
  'Enlarge Spell', 'Eschew Materials', 'Extend Spell', 'Extra Turning',
  'Far Shot', 'Forge Ring', 'Great Cleave', 'Great Fortitude',
  'Greater Spell Penetration', 'Greater Two Weapon Fighting', 'Heighten Spell',
  'Improved Bull Rush', 'Improved Counterspell', 'Improved Disarm',
  'Improved Feint', 'Improved Grapple', 'Improved Initiative',
  'Improved Overrun', 'Improved Precise Shot', 'Improved Shield Bash',
  'Improved Sunder', 'Improved Trip', 'Improved Turning',
  'Improved Two Weapon Fighting', 'Improved Unarmed Strike', 'Investigator',
  'Iron Will', 'Leadership', 'Lightning Reflexes', 'Magical Aptitude',
  'Manyshot', 'Maximize Spell', 'Mobility', 'Mounted Archery',
  'Mounted Combat', 'Natural Spell', 'Negotiator', 'Nimble Fingers',
  'Persuasive', 'Point Blank Shot', 'Power Attack', 'Precise Shot',
  'Quick Draw', 'Quicken Spell', 'Rapid Reload', 'Rapid Shot',
  'Ride By Attack', 'Run', 'Scribe Scroll', 'Self Sufficient',
  'Shield Proficiency', 'Shield Proficiency Tower', 'Shot On The Run',
  'Silent Spell', 'Snatch Arrows', 'Spell Penetration', 'Spirited Charge',
  'Spring Attack', 'Stealthy', 'Still Spell', 'Stunning Fist', 'Toughness',
  'Track', 'Trample', 'Two Weapon Defense', 'Two Weapon Fighting',
  'Weapon Finesse', 'Weapon Proficiency Simple', 'Whirlwind Attack',
  'Widen Spell'
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
PH35.SCHOOLS = [
  'Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation',
  'Illusion', 'Necromancy', 'Transmutation'
];
PH35.SHIELDS = [
  'Buckler', 'Heavy Steel', 'Heavy Wooden', 'Light Steel', 'Light Wooden',
  'None', 'Tower'
];
PH35.SKILLS = [
  'Appraise:int', 'Balance:dex', 'Bluff:cha', 'Climb:str', 'Concentration:con',
  'Decipher Script:int/trained', 'Diplomacy:cha', 'Disable Device:int/trained',
  'Disguise:cha', 'Escape Artist:dex', 'Forgery:int', 'Gather Information:cha',
  'Handle Animal:cha/trained', 'Heal:wis', 'Hide:dex', 'Intimidate:cha',
  'Jump:str', 'Knowledge (Arcana):int/trained',
  'Knowledge (Dungeoneering):int/trained',
  'Knowledge (Engineering):int/trained', 'Knowledge (Geography):int/trained',
  'Knowledge (History):int/trained', 'Knowledge (Local):int/trained',
  'Knowledge (Nature):int/trained', 'Knowledge (Nobility):int/trained',
  'Knowledge (Planes):int/trained', 'Knowledge (Religion):int/trained',
  'Listen:wis', 'Move Silently:dex', 'Open Lock:dex/trained',
  'Perform (Act):cha', 'Perform (Comedy):cha', 'Perform (Dance):cha',
  'Perform (Keyboard):cha', 'Perform (Oratory):cha', 'Perform (Percussion):cha',
  'Perform (Sing):cha', 'Perform (String):cha', 'Perform (Wind):cha',
  'Ride:dex', 'Search:int', 'Sense Motive:wis', 'Sleight Of Hand:dex/trained',
  'Speak Language:/trained', 'Spellcraft:int/trained', 'Spot:wis',
  'Survival:wis', 'Swim:str', 'Tumble:dex/trained',
  'Use Magic Device:cha/trained', 'Use Rope:dex'
];
PH35.SPELLS = [
  'Acid Fog:W6/Wa7', 'Acid Splash:W0', 'Aid:C2/Go2/Lu2',
  'Air Walk:Ai4/C4/D4', 'Alarm:B1/R1/W1', 'Align Weapon:C2',
  'Alter Self:B2/W2', 'Analyze Dweomer:B6/W6', 'Animal Growth:D5/R4/W5',
  'Animal Messenger:B2/D2/R1', 'Animal Shapes:An7/D8', 'Animal Trance:B2/D2',
  'Animate Dead:C3/De3/W4', 'Animate Objects:B6/C6/Ch6','Animate Plants:D7/Pl7',
  'Animate Rope:B1/W1', 'Anipathy:D9/W8', 'Antilife Shell:An6/C6/D6',
  'Antimagic Field:C8/Ma6/Pr6/W6', 'Antiplant Shell:D4', 'Arcane Eye:W4',
  'Arcane Lock:W2', 'Arcane Mark:W0', 'Arcane Sight:W3',
  'Astral Projection:C9/Tl9/W9', 'Atonement:C5/D5', 'Augury:C2',
  'Awaken:D5', 'Baleful Polymorph:D5/W5', 'Bane:C1',
  'Banishment:C6/W7', 'Barkskin:D2/Pl2/R2', 'Bear\'s Endurance:C2/D2/R2/W2',
  'Bestow Curse:C3/W4', 'Bigby\'s Clenched Fist:St8/W8',
    'Bigby\'s Crushing Hand:St9/W9',
  'Bigby\'s Forceful Hand:W6', 'Bigby\'s Grasping Hand:St7/W7',
    'Bigby\'s Interposing Hand:W5',
  'Binding:W8', 'Blade Barrier:C6/Go6/Wr6', 'Blasphemy:C7/Ev7',
  'Bless Water:C1/P1', 'Bless Weapon:P1', 'Bless:C1/P1',
  'Blight:D4/W5', 'Blindness/Deafness:B2/C3/W2', 'Blink:B3/W3',
  'Blur:B2/W2', 'Break Enchantment:B4/C5/Lu5/P4/W5',
    'Bull\'s Strength:C2/D2/P2/St2/W2',
  'Burning Hands:Fi1/W1', 'Call Lightning Storm:D5', 'Call Lightning:D3',
  'Calm Animals:An1/D1/R1','Calm Emotions:B2/C2/La2','Cat\'s Grace:B2/D2/R2/W2',
  'Cause Fear:B1/C1/De1/W1', 'Chain Lightning:Ai6/W6', 'Changestaff:D7',
  'Chaos Hammer:Ch4', 'Charm Animal:D1/R1', 'Charm Monster:B3/W4',
  'Charm Person:B1/W1', 'Chill Metal:D2', 'Chill Touch:W1',
  'Circle Of Death:W6', 'Clairaudience/Clairvoyance:B3/Kn3/W3',
    'Cloak Of Chaos:C8/Ch8',
  'Clone:W8', 'Cloudkill:W5', 'Color Spray:W1',
  'Command Plants:D4/Pl4/R3', 'Command Undead:W2', 'Command:C1',
  'Commune With Nature:An5/D5/R4', 'Commune:C5','Comprehend Languages:B1/C1/W1',
  'Cone Of Cold:W5/Wa6', 'Confusion:B3/Ty4/W4', 'Consecrate:C2',
  'Contact Other Plane:W5', 'Contagion:C3/Dn3/D3/W4', 'Contingency:W6',
  'Continual Flame:C3/W2', 'Control Plants:D8/Pl8', 'Control Undead:W7',
  'Control Water:C4/D4/W6/Wa4', 'Control Weather:Ai7/C7/D7/W7',
    'Control Winds:Ai5/D5',
  'Create Food And Water:C3', 'Create Greater Undead:C8/De8/W8',
    'Create Undead:C6/De6/Ev6/W6',
  'Create Water:C0/D0/P1', 'Creeping Doom:D7', 'Crushing Dispair:B3/W4',
  'Cure Critical Wounds:B4/C4/D5/He4', 'Cure Light Wounds:B1/C1/D1/He1/P1/R2',
    'Cure Minor Wounds:C0/D0',
  'Cure Moderate Wounds:B2/C2/D3/He2/P3/R3',
    'Cure Serious Wounds:B3/C3/D4/He3/P4/R4', 'Curse Water:C1',
  'Dancing Lights:B0/W0', 'Darkness:B2/C2/W2', 'Darkvision:R3/W2',
  'Daylight:B3/C3/D3/P3/W3', 'Daze Monster:B2/W2', 'Daze:B0/W0',
  'Death Knell:C2/De2', 'Death Ward:C4/De4/D5/P4', 'Deathwatch:C1',
  'Deep Slumber:B3/W3', 'Deeper Darkness:C3', 'Delay Poison:B2/C2/D2/P2/R1',
  'Delayed Blast Fireball:W7', 'Demand:W8', 'Desecrate:C2/Ev2',
  'Destruction:C7/De7', 'Detect Animals Or Plants:D1/R1', 'Detect Chaos:C1',
  'Detect Evil:C1', 'Detect Good:C1', 'Detect Law:C1',
  'Detect Magic:B0/C0/D0/W0', 'Detect Poison:C0/D0/P1/R1/W0',
    'Detect Scrying:B4/W4',
  'Detect Secret Doors:B1/Kn1/W1', 'Detect Snares And Pits:D1/R1',
    'Detect Thoughts:B2/Kn2/W2',
  'Detect Undead:C1/P1/W1', 'Dictum:C7/La7', 'Dimension Door:B4/Tl4/W4',
  'Dimensional Anchor:C4/W4', 'Dimensional Lock:C8/W8', 'Diminish Plants:D3/R3',
  'Discern Lies:C4/P3', 'Discern Location:C8/Kn8/W8', 'Disguise Self:B1/Ty1/W1',
  'Disintegrate:Dn7/W6', 'Dismissal:C4/W5', 'Dispel Chaos:C5/La5/P4',
  'Dispel Evil:C5/Go5/P4', 'Dispel Good:C5/Ev5', 'Dispel Law:C5/Ch5',
  'Dispel Magic:B3/C3/D4/Ma3/P3/W3', 'Displacement:B3/W3', 'Disrupt Undead:W0',
  'Disrupting Weapon:C5', 'Divination:C4/Kn4', 'Divine Favor:C1/P1',
  'Divine Power:C4/Wr4', 'Dominate Animal:An3/D3', 'Dominate Monster:W9',
  'Dominate Person:B4/W5', 'Doom:C1', 'Drawmij\'s Instant Summons:W7',
  'Dream:B5/W5', 'Eagle\'s Spendor:B2/C2/P2/W2', 'Earthquake:C8/Dn8/D8/Ea7',
  'Elemental Swarm:Ai9/D9/Ea9/Fi9/Wa9', 'Endure Elements:C1/D1/P1/R1/Su1/W1',
    'Energy Drain:C9/W9',
  'Enervation:W4', 'Enlarge Person:St1/W1', 'Entangle:D1/Pl1/R1',
  'Enthrall:B2/C2', 'Entropic Shield:C1/Lu1', 'Erase:B1/W1',
  'Ethereal Jaunt:C7/W7', 'Etherealness:C9/W9', 'Evard\'s Black Tentacles:W4',
  'Expeditious Retreat:B1/W1', 'Explosive Runes:W3', 'Eyebite:B6/W6',
  'Fabricate:W5', 'Faerie Fire:D1', 'False Life:W2',
  'False Vision:B5/Ty5/W5', 'Fear:B3/W4', 'Feather Fall:B1/W1',
  'Feeblemind:W5', 'Find The Path:B6/C6/D6/Kn6/Tl6', 'Find Traps:C2',
  'Finger Of Death:D8/W7', 'Fire Seeds:D6/Fi6/Su6', 'Fire Shield:Fi5/Su4/W4',
  'Fire Storm:C8/D7/Fi7', 'Fire Trap:D2/W4', 'Fireball:W3',
  'Flame Arrow:W3', 'Flame Blade:D2', 'Flame Strike:C5/D4/Su5/Wr5',
  'Flaming Sphere:D2/W2', 'Flare:B0/D0/W0', 'Flesh To Stone:W6',
  'Fly:Tl3/W3', 'Fog Cloud:D2/W2/Wa2', 'Forbiddance:C6',
  'Forcecage:W7', 'Foresight:D9/Kn9/W9', 'Fox\'s Cunning:B2/W2',
  'Freedom Of Movement:B4/C4/D4/Lu4/R4', 'Freedom:W9', 'Gaseous Form:Ai3/B3/W3',
  'Gate:C9/W9', 'Geas/Quest:B6/C6/W6', 'Gentle Repose:C2/W3',
  'Ghost Sound:B0/W0', 'Ghoul Touch:W2', 'Giant Vermin:C4/D4',
  'Glibness:B3', 'Glitterdust:B2/W2', 'Globe Of Invulnerability:W6',
  'Glyph Of Warding:C3', 'Good Hope:B3', 'Goodberry:D1',
  'Grease:B1/W1', 'Greater Arcane Sight:W7', 'Greater Command:C5',
  'Greater Dispel Magic:B5/C6/D6/W6', 'Greater Glyph Of Warding:C6',
    'Greater Heroism:B5/W6',
  'Greater Invisibility:B4/W4', 'Greater Magic Fang:D3/R3',
    'Greater Magic Weapon:C4/P3/W3',
  'Greater Planar Ally:C8','Greater Planar Binding:W8','Greater Prying Eyes:W8',
  'Greater Restoration:C7', 'Greater Scrying:B6/C7/D7/W7',
    'Greater Shadow Conjuration:W7',
  'Greater Shadow Evocation:W8', 'Greater Shout:B6/W8',
    'Greater Spell Immunity:C8',
  'Greater Teleport:W7/Tl7', 'Guards And Wards:W6', 'Guidance:C0/D0',
  'Gust Of Wind:D2/W2', 'Hallow:C5/D5', 'Hallucinatory Terrain:B4/W4',
  'Halt Undead:W3', 'Harm:C6/Dn6', 'Haste:B3/W3',
  'Heal Mount:P3', 'Heal:C6/D7/He6', 'Heat Metal:D2/Su2',
  'Helping Hand:C3', 'Heroes\' Feast:B6/C6', 'Heroism:B2/W3',
  'Hide From Animals:D1/R1', 'Hide From Undead:C1', 'Hold Animal:An2/D2/R2',
  'Hold Monster:B4/La6/W5', 'Hold Person:B2/C2/W3', 'Hold Portal:W1',
  'Holy Aura:C8/Go8', 'Holy Smite:Go4', 'Holy Sword:P4',
  'Holy Word:C7/Go7', 'Horrid Wilting:W8/Wa8', 'Hypnotic Pattern:B2/W2',
  'Hypnotism:B1/W1', 'Ice Storm:D4/W4/Wa5', 'Identify:B1/Ma2/W1',
  'Illusionary Script:B3/W3', 'Illusionary Wall:W4',
    'Imbue With Spell Ability:C4/Ma4',
  'Implosion:C9/Dn9', 'Imprisonment:W9', 'Incendiary Cloud:Fi8/W8',
  'Inflict Critical Wounds:C4/Dn4', 'Inflict Light Wounds:C1/Dn1',
    'Inflict Minor Wounds:C0',
  'Inflict Moderate Wounds:C2', 'Inflict Serious Wounds:C3', 'Insanity:W7',
  'Insect Plague:C5/D5', 'Invisibility Purge:C3', 'Invisibility Sphere:B3/W3',
  'Invisibility:B2/Ty2/W2', 'Iron Body:Ea8/W8', 'Ironwood:D6',
  'Jump:D1/R1/W1', 'Keen Edge:W3', 'Knock:W2',
  'Know Direction:B0/D0', 'Legend Lore:B4/Kn7/W6', 'Leomund\'s Secret Chest:W5',
  'Leomund\'s Secure Shelter:B4/W4', 'Leomund\'s Tiny Hut:B3/W3',
    'Leomund\'s Trap:W2',
  'Lesser Confusion:B1', 'Lesser Geas:B3/W4',
    'Lesser Globe Of Invulnerability:W4',
  'Lesser Planar Ally:C4', 'Lesser Planar Binding:W5',
    'Lesser Restoration:C2/D2/P1',
  'Levitate:W2', 'Light:B0/C0/D0/W0', 'Lightning Bolt:W3',
  'Limited Wish:W7', 'Liveoak:D6', 'Locate Creature:B4/W4',
  'Locate Object:B2/C3/Tl2/W2', 'Longstrider:D1/R1/Tl1', 'Lullaby:B0',
  'Mage Armor:W1', 'Mage Hand:B0/W0', 'Magic Circle Against Chaos:C3/La3/P3/W3',
  'Magic Circle Against Evil:C3/Go3/P3/W3',
    'Magic Circle Against Good:C3/Ev3/W3', 'Magic Circle Against Law:C3/Ch3/W3',
  'Magic Fang:D1/R1', 'Magic Jar:W5', 'Magic Missile:W1',
  'Magic Mouth:B1/W2', 'Magic Stone:C1/D1/Ea1', 'Magic Vestment:C3/St3/Wr3',
  'Magic Weapon:C1/P1/W1/Wr1', 'Major Creation:W5', 'Major Image:B3/W3',
  'Make Whole:C2', 'Mark Of Justice:C5/P4', 'Mass Bear\'s Endurance:C6/D6/W6',
  'Mass Bull\'s Strength:C6/D6/W6', 'Mass Cat\'s Grace:B6/D6/W6',
    'Mass Charm Monster:B6/W8',
  'Mass Cure Critical Wounds:C8/D9/He8', 'Mass Cure Light Wounds:B5/C5/D6/He5',
    'Mass Cure Moderate Wounds:B6/C6/D7',
  'Mass Cure Serious Wounds:C7/D8', 'Mass Eagle\'s Splendor:B6/C6/W6',
    'Mass Enlarge Person:W4',
  'Mass Fox\'s Cunning:B6/W6', 'Mass Heal:C9/He9', 'Mass Hold Monster:W9',
  'Mass Hold Person:W7', 'Mass Inflict Critical Wounds:C8',
    'Mass Inflict Light Wounds:C5/Dn5',
  'Mass Inflict Moderate Wounds:C6', 'Mass Inflict Serious Wounds:C7',
    'Mass Invisibility:W7',
  'Mass Owl\'s Wisdom:C6/D6/W6','Mass Reduce Person:W4','Mass Suggestion:B5/W6',
  'Maze:W8', 'Meld Into Stone:C3/D3', 'Melf\'s Acid Arrow:W2',
  'Mending:B0/C0/D0/W0', 'Message:B0/W0', 'Meteor Swarm:W9',
  'Mind Blank:Pr8/W8', 'Mind Fog:B5/W5', 'Minor Creation:W4',
  'Minor Image:B2/W2', 'Miracle:C9/Lu9', 'Mirage Arcana:B5/W5',
  'Mirror Image:B2/W2', 'Misdirection:B2/W2', 'Mislead:B5/Lu6/Ty6/W6',
  'Modify Memory:B4', 'Moment Of Prescience:Lu8/W8',
    'Mordenkainen\'s Disjunction:Ma9/W9',
  'Mordenkainen\'s Faithful Hound:W5', 'Mordenkainen\'s Lucubration:W6',
    'Mordenkainen\'s Magnificent Mansion:W7',
  'Mordenkainen\'s Private Sanctum:W5', 'Mordenkainen\'s Sword:W7', 'Mount:W1',
  'Move Earth:D6/W6', 'Neutralize Poison:B4/C4/D3/P4/R3', 'Nightmare:B5/W5',
  'Nondetection:R4/Ty3/W3', 'Nystul\'s Magic Aura:B1/Ma1/W1',
    'Obscure Object:B1/C3/W2',
  'Obscuring Mist:Ai1/C1/D1/W1/Wa1', 'Open/Close:B0/W0', 'Order\'s Wrath:La4',
  'Otiluke\'s Freezing Sphere:W6', 'Otiluke\'s Resilient Sphere:W4',
    'Otiluke\'s Telekinetic Sphere:W8',
  'Otto\'s Irresistible Dance:B6/W8', 'Overland Flight:W5',
    'Owl\'s Wisdom:C2/D2/P2/R2/W2',
  'Pass Without Trace:D1/R1', 'Passwall:W5', 'Permanency:W5',
  'Permanent Image:B6/W6', 'Persistent Image:B5/W5', 'Phantasmal Killer:W4',
  'Phantom Steed:B3/W3', 'Phase Door:Tl8/W7', 'Planar Ally:C6',
  'Planar Binding:W6', 'Plane Shift:C5/W7', 'Plant Growth:D3/Pl3/R3',
  'Poison:C4/D3', 'Polar Ray:W8', 'Polymorph Any Object:Ty8/W8',
  'Polymorph:W4', 'Power Word, Blind', 'Power Word, Kill', 'Power Word, Stun',
  'Prayer:C3/P3', 'Prestidigitation:B0/W0', 'Prismatic Sphere:Pr9/Su9/W9',
  'Prismatic Spray:W7', 'Prismatic Wall:W8', 'Produce Flame:D1/Fi2',
  'Programmed Image:B6/W6', 'Project Image:B6/W7', 'Protection From Arrows:W2',
  'Protection From Chaos:C1/La1/P1/W1',
    'Protection From Energy:C3/D3/Lu3/Pr3/R2/W3',
    'Protection From Evil:C1/Go1/P1/W1',
  'Protection From Good:C1/Ev1/W1', 'Protection From Law:C1/Ch1/W1',
    'Protection From Spells:Ma8/W8',
  'Prying Eyes:W5', 'Purify Food And Drink:C0/D0', 'Pyrotechnics:B2/W2',
  'Quench:D3', 'Rage:B2/W3', 'Rainbow Pattern:B4/W4',
  'Raise Dead:C5', 'Rary\'s Mnemonic Enhancer:W4', 'Rary\'s Telepathic Bond:W5',
  'Ray Of Enfeeblement:W1', 'Ray Of Exhaustion:W3', 'Ray Of Frost:W0',
  'Read Magic:B0/C0/D0/P1/R1/W0', 'Reduce Animal:D2/R3', 'Reduce Person:W1',
  'Refuge:C7/W9', 'Regenerate:C7/D9/He7', 'Reincarnate:D4',
  'Remove Blindness/Deafness:C3/P3', 'Remove Curse:B3/C3/P3/W4',
    'Remove Disease:C3/D3/R3',
  'Remove Fear:B1/C1', 'Remove Paralysis:C2/P2', 'Repel Metal Or Stone:D8',
  'Repel Vermin:B4/C4/D4/R3', 'Repel Wood:D6/Pl6', 'Repulsion:C7/Pr7/W6',
  'Resist Energy:C2/D2/Fi3/P2/R1/W2', 'Resistance:B0/C0/D0/P1/W0',
    'Restoration:C4/P4',
  'Resurrection:C7', 'Reverse Gravity:D8/W7', 'Righteous Might:C5/St5',
  'Rope Trick:W2', 'Rusting Grasp:D4', 'Sanctuary:C1/Pr1',
  'Scare:B2/W2', 'Scintillating Pattern:W8', 'Scorching Ray:W2',
  'Screen:Ty7/W8', 'Scrying:B3/C5/D4/W4', 'Sculpt Sound:B3',
  'Searing Light:C3/Su3', 'Secret Page:B3/W3', 'See Invisibility:B3/W2',
  'Seeming:B5/W5', 'Sending:C4/W5', 'Sepia Snake Sigil:B3/W3',
  'Sequester:W7', 'Shades:W9', 'Shadow Conjuration:B4/W4',
  'Shadow Evocation:B5/W5', 'Shadow Walk:B5/W6', 'Shambler:D9/Pl9',
  'Shapechange:An9/D9/W9', 'Shatter:B2/C2/Ch2/Dn2/W2', 'Shield Of Faith:C1',
  'Shield Of Law:C8/La8', 'Shield Other:C2/P2/Pr2', 'Shield:W1',
  'Shillelagh:D1', 'Shocking Grasp:W1', 'Shout:B4/W4',
  'Shrink Item:W3', 'Silence:B2/C2', 'Silent Image:B1/W1',
  'Simulacrum:W7', 'Slay Living:C5/De5', 'Sleep:B1/W1',
  'Sleet Storm:D3/W3', 'Slow:B3/W3', 'Snare:D3/R2',
  'Soften Earth And Stone:D2/Ea2', 'Solid Fog:W4', 'Song Of Discord:B5',
  'Soul Bind:C9/W9', 'Sound Burst:B2/C2', 'Speak With Animals:B3/D1/R1',
  'Speak With Dead:C3', 'Speak With Plants:B4/D3/R2', 'Spectral Hand:W2',
  'Spell Immunity:C4/Pr4/St4', 'Spell Resistance:C5/Ma5/Pr5',
    'Spell Turning:Lu7/Ma7/W7',
  'Spellstaff:D6', 'Spider Climb:D2/W2', 'Spike Growth:D3/R2',
  'Spike Stones:D4/Ea4', 'Spiritual Weapon:C2/Wr2', 'Statue:W7',
  'Status:C2', 'Stinking Cloud:W3', 'Stone Shape:C3/D3/Ea3/W5',
  'Stone Tell:D6', 'Stone To Flesh:W6', 'Stoneskin:D5/Ea6/St6/W4',
  'Storm Of Vengence:C9/D9', 'Suggestion:B2/W3', 'Summon Instrument:B0',
  'Summon Monster I:B1/C1/W1', 'Summon Monster II:B2/C2/W2',
    'Summon Monster III:B3/C3/W3',
  'Summon Monster IV:B4/C4/W4', 'Summon Monster IX:C9/Ch9/Ev9/Go9/La9/W9',
    'Summon Monster V:B5/C5/W5',
  'Summon Monster VI:B6/C6/W6', 'Summon Monster VII:C7/W7',
    'Summon Monster VIII:C8/W8',
  'Summon Nature\'s Ally I:D1/R1', 'Summon Nature\'s Ally II:D2/R2',
    'Summon Nature\'s Ally III:D3/R3',
  'Summon Nature\'s Ally IV:An4/D4/R4', 'Summon Nature\'s Ally IX:D9',
    'Summon Nature\'s Ally V:D5',
  'Summon Nature\'s Ally VI:D6', 'Summon Nature\'s Ally VII:D7',
    'Summon Nature\'s Ally VIII:An8/D8',
  'Summon Swarm:B2/D2/W2', 'Sunbeam:D7/Su7', 'Sunburst:D8/Su8/W8',
  'Symbol Of Death:C8/W8', 'Symbol Of Fear:C6/W6', 'Symbol Of Insanity:C8/W8',
  'Symbol Of Pain:C5/W5', 'Symbol Of Persuasion:C6/W6', 'Symbol Of Sleep:C5/W5',
  'Symbol Of Stunning:C7/W7', 'Symbol Of Weakness:C7/W7',
    'Sympathetic Vibration:B6',
  'Sympathy:D9/W8', 'Tasha\'s Hideous Laughter:B1/W2', 'Telekinesis:W5',
  'Teleport Object:W7', 'Teleport:Tl5/W5', 'Teleportation Circle:W9',
  'Temporal Stasis:W8', 'Tenser\'s Floating Disk:W1',
    'Tenser\'s Transformation:W6',
  'Time Stop:Ty9/W9', 'Tongues:B2/C4/W3', 'Touch Of Fatigue:W0',
  'Touch Of Idiocy:W2', 'Transmute Metal To Wood:D7',
    'Transmute Mud To Rock:D5/W5',
  'Transmute Rock To Mud:D5/W5', 'Transport Via Plants:D6', 'Trap The Soul:W8',
  'Tree Shape:D2/R3', 'Tree Stride:D5/R4', 'True Resurrection:C9',
  'True Seeing:C5/D7/Kn5/W6', 'True Strike:W1', 'Undeath To Death:C6/W6',
  'Undetectable Alignment:B1/C2/P2', 'Unhallow:C5/D5', 'Unholy Aura:C8/Ev8',
  'Unholy Blight:Ev4', 'Unseen Servant:B1/W1', 'Vampiric Touch:W3',
  'Veil:B6/W6', 'Ventriloquism:B1/W1', 'Virtue:C0/D0/P1',
  'Vision:W7', 'Wail Of The Banshee:De9/W9', 'Wall Of Fire:D5/Fi4/W4',
  'Wall Of Force:W5', 'Wall Of Ice:W4', 'Wall Of Iron:W6',
  'Wall Of Stone:C5/D6/Ea5/W5', 'Wall Of Thorns:D5/Pl5', 'Warp Wood:D2',
  'Water Breathing:C3/D3/Wa3/W3', 'Water Walk:C3/R3', 'Waves Of Exhaustion:W7',
  'Waves Of Fatigue:W5', 'Web:W2', 'Weird:W9',
  'Whirlwind:Ai8/D8', 'Whispering Wind:B2/W2', 'Wind Walk:C6/D7',
  'Wind Wall:Ai2/C3/D3/R2/W3', 'Wish:W9', 'Wood Shape:D2',
  'Word Of Chaos:C7/Ch7', 'Word Of Recall:C6/D8', 'Zone Of Silence:B4',
  'Zone Of Truth:C2/P2'
];
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
PH35.PROFICIENCY_LEVEL_NAMES = ["None", "Light", "Medium", "Heavy", "Tower"];

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
PH35.domainsNotes = [
  'combatNotes.airDomain:Turn earth/rebuke air',
  'combatNotes.destructionDomain:Smite (+4 attack/+level damage) 1/day',
  'combatNotes.earthDomain:Turn air/rebuke earth',
  'combatNotes.fireDomain:Turn water/rebuke fire',
  'combatNotes.plantDomain:Rebuke plants',
  'combatNotes.sunDomain:Destroy turned undead 1/day',
  'combatNotes.waterDomain:Turn fire/rebuke water',
  'featureNotes.warDomain:Weapon Proficiency/Weapon Focus (%V)',
  'magicNotes.animalDomain:<i>Speak With Animals</i> 1/Day',
  'magicNotes.chaosDomain:+1 caster level chaos spells',
  'magicNotes.deathDomain:<i>Death Touch</i> 1/Day',
  'magicNotes.evilDomain:+1 caster level evil spells',
  'magicNotes.goodDomain:+1 caster level good spells',
  'magicNotes.healingDomain:+1 caster level heal spells',
  'magicNotes.knowledgeDomain:+1 caster level divination spells',
  'magicNotes.lawDomain:+1 caster level law spells',
  'magicNotes.protectionDomain:Protective ward 1/day',
  'magicNotes.strengthDomain:Add level to strength 1 round/day',
  'magicNotes.travelDomain:<i>Freedom of Movement</i> 1 round/level/day',
  'saveNotes.luckDomain:Reroll 1/day',
  'skillNotes.animalDomain:Knowledge (Nature) is a class skill',
  'skillNotes.knowledgeDomain:All Knowledge skills are class skills',
  'skillNotes.magicDomain:Use Magic Device at level/2',
  'skillNotes.plantDomain:Knowledge (Nature) is a class skill',
  'skillNotes.travelDomain:Survival is a class skill',
  'skillNotes.trickeryDomain:Bluff/Disguise/Hide are class skills'
];
PH35.featsNotes = [
  'combatNotes.blindFightFeature:' +
    'Reroll concealed miss/no bonus to invisible foe/half penalty for impared vision',
  'combatNotes.cleaveFeature:Extra attack when foe drops',
  'combatNotes.combatExpertiseFeature:Up to -5 attack/+5 AC',
  'combatNotes.combatReflexesFeature:Add dexterity mod to AOO count',
  'combatNotes.deflectArrowsFeature:Deflect ranged 1/round',
  'combatNotes.diehardFeature:Remain conscious w/HP <= 0',
  'combatNotes.dodgeFeature:+1 AC vs. designated foe',
  'combatNotes.extraTurningFeature:+4/day',
  'combatNotes.farShotFeature:x1.5 projectile range; x2 thrown',
  'combatNotes.greatCleaveFeature:Cleave w/out limit',
  'combatNotes.greaterTwoWeaponFightingFeature:Second off-hand -10 attack',
  'combatNotes.improvedBullRushFeature:Bull rush w/out foe AOO; +4 strength',
  'combatNotes.improvedDisarmFeature:Disarm w/out foe AOO; +4 attack',
  'combatNotes.improvedFeintFeature:Bluff check to feint as move action',
  'combatNotes.improvedGrappleFeature:Grapple w/out foe AOO; +4 grapple',
  'combatNotes.improvedInitiativeFeature:+4 initiative',
  'combatNotes.improvedOverrunFeature:Foe cannot avoid; +4 strength',
  'combatNotes.improvedPreciseShotFeature:' +
    'No foe bonus for partial concealment; attack grappling w/no penalty',
  'combatNotes.improvedShieldBashFeature:Shield bash w/out AC penalty',
  'combatNotes.improvedSunderFeature:Sunder w/out foe AOO; +4 attack',
  'combatNotes.improvedTripFeature:' +
    'Trip w/out foe AOO; +4 strength; attack immediately after trip',
  'combatNotes.improvedTurningFeature:+1 turning level',
  'combatNotes.improvedTwoWeaponFightingFeature:Additional -5 attack',
  'combatNotes.improvedUnarmedStrikeFeature:Unarmed attack w/out foe AOO',
  'combatNotes.manyshotFeature:Fire multiple arrows simultaneously',
  'combatNotes.mobilityFeature:+4 AC vs. movement AOO',
  'combatNotes.mountedArcheryFeature:x.5 mounted ranged penalty',
  'combatNotes.mountedCombatFeature:Ride skill save vs. mount damage 1/round',
  'combatNotes.pointBlankShotFeature:+1 ranged attack/damage w/in 30 ft',
  'combatNotes.powerAttackFeature:Attack base -attack/+damage',
  'combatNotes.preciseShotFeature:Shoot into melee w/out penalty',
  'combatNotes.quickDrawFeature:Draw weapon as free action',
  'combatNotes.rapidReloadFeature:' +
    'Reload light/heavy crossbow as free/move action',
  'combatNotes.rapidShotFeature:Normal and extra ranged -2 attacks',
  'combatNotes.rideByAttackFeature:Move before and after mounted attack',
  'combatNotes.runFeature:Add 1 to speed multiplier; +4 running jump',
  'combatNotes.shotOnTheRunFeature:Move before and after ranged attack',
  'combatNotes.snatchArrowsFeature:Catch ranged weapons',
  'combatNotes.spiritedChargeFeature:x2 damage (x3 lance) from mounted charge',
  'combatNotes.springAttackFeature:Move before and after melee attack',
  'combatNotes.stunningFistFeature:' +
    'Foe %V Fortitude save or stunned 1/4 level/day',
  'combatNotes.toughnessFeature:+3 HP',
  'combatNotes.trampleFeature:Mounted overrun unavoidable/bonus hoof attack',
  'combatNotes.twoWeaponDefenseFeature:+1 AC w/two weapons',
  'combatNotes.twoWeaponFightingFeature:' +
    'Reduce on-hand penalty by 2/off-hand by 6',
  'combatNotes.weaponFinesseFeature:' +
    'Light weapons use dexterity mod instead of strength mod on attacks',
  'combatNotes.whirlwindAttackFeature:Attack all foes w/in reach',
  'featureNotes.leadershipFeature:Attract followers',
  'magicNotes.augmentSummoningFeature:' +
    'Summoned creatures +4 strength/constitution',
  'magicNotes.brewPotionFeature:Create potion for up to 3rd level spell',
  'magicNotes.craftMagicArmsAndArmorFeature:Create magic weapon/armor/shield',
  'magicNotes.craftRodFeature:Create magic rod',
  'magicNotes.craftStaffFeature:Create magic staff',
  'magicNotes.craftWandFeature:Create wand for up to 4th level spell',
  'magicNotes.craftWondrousItemFeature:Create miscellaneous magic item',
  'magicNotes.empowerSpellFeature:x1.5 designated spell variable effects',
  'magicNotes.enlargeSpellFeature:x2 designated spell range',
  'magicNotes.extendSpellFeature:x2 designated spell duration',
  'magicNotes.eschewMaterialsFeature:Cast spells w/out materials',
  'magicNotes.forgeRingFeature:Create magic ring',
  'magicNotes.greaterSpellPenetrationFeature:' +
    '+2 caster level vs. resistance checks',
  'magicNotes.heightenSpellFeature:Increase designated spell level',
  'magicNotes.improvedCounterspellFeature:Counter w/higher-level spell',
  'magicNotes.maximizeSpellFeature:' +
    'Maximize all designated spell variable effects',
  'magicNotes.naturalSpellFeature:Cast spell during <i>Wild Shape</i>',
  'magicNotes.quickenSpellFeature:Cast spell as free action 1/round',
  'magicNotes.scribeScrollFeature:Create scroll of any known spell',
  'magicNotes.silentSpellFeature:Cast designated spell w/out speech',
  'magicNotes.spellPenetrationFeature:+2 caster level vs. resistance checks',
  'magicNotes.stillSpellFeature:Cast designated spell w/out movement',
  'magicNotes.widenSpellFeature:Double area of affect',
  'saveNotes.enduranceFeature:+4 extended physical action',
  'saveNotes.greatFortitudeFeature:+2 Fortitude',
  'saveNotes.ironWillFeature:+2 Will',
  'saveNotes.lightningReflexesFeature:+2 Reflex',
  'skillNotes.acrobaticFeature:+2 Jump/Tumble',
  'skillNotes.agileFeature:+2 Balance/Escape Artist',
  'skillNotes.alertnessFeature:+2 Listen/Spot',
  'skillNotes.animalAffinityFeature:+2 Handle Animal/Ride',
  'skillNotes.athleticFeature:+2 Climb/Swim',
  'skillNotes.combatCastingFeature:+4 Concentration when casting on defensive',
  'skillNotes.deceitfulFeature:+2 Disguise/Forgery',
  'skillNotes.deftHandsFeature:+2 Sleight Of Hand/Use Rope',
  'skillNotes.diligentFeature:+2 Appraise/Decipher Script',
  'skillNotes.investigatorFeature:+2 Gather Information/Search',
  'skillNotes.magicalAptitudeFeature:+2 Spellcraft/Use Magic Device',
  'skillNotes.negotiatorFeature:+2 Diplomacy/Sense Motive',
  'skillNotes.nimbleFingersFeature:+2 Disable Device/Open Lock',
  'skillNotes.persuasiveFeature:+2 Bluff/Intimidate',
  'skillNotes.selfSufficientFeature:+2 Heal/Survival',
  'skillNotes.stealthyFeature:+2 Hide/Move Silently',
  'skillNotes.trackFeature:Survival to follow creatures at 1/2 speed'
];
PH35.featsPrerequisites = [
  '{feats.Armor Proficiency Medium} == null || {armorProficiencyLevel} > 0',
  '{feats.Armor Proficiency Heavy} == null || {armorProficiencyLevel} > 1',
  '{feats.Brew Potion} == null || {casterLevel} >= 3',
  '{feats.Cleave} == null || {features.Power Attack} != null',
  '{feats.Combat Expertise} == null || {intelligence} >= 13',
  '{feats.Craft Magic Arms And Armor} == null || {casterLevel} >= 5',
  '{feats.Craft Rod} == null || {casterLevel} >= 9',
  '{feats.Craft Staff} == null || {casterLevel} >= 12',
  '{feats.Craft Wand} == null || {casterLevel} >= 5',
  '{feats.Craft Wondrous Item} == null || {casterLevel} >= 3',
  '{feats.Deflect Arrows} == null || {dexterity} >= 13',
  '{feats.Deflect Arrows}==null || {features.Improved Unarmed Strike}!=null',
  '{feats.Diehard} == null || {features.Endurance} != null',
  '{feats.Dodge} == null || {dexterity} >= 13',
  '{feats.Empower Spell} == null || {casterLevel} >= 1',
  '{feats.Enlarge Spell} == null || {casterLevel} >= 1',
  '{feats.Extend Spell} == null || {casterLevel} >= 1',
  '{feats.Extra Turning} == null || {turningLevel} >= 1',
  '{feats.Far Shot} == null || {features.Point Blank Shot} != null',
  '{feats.Forge Ring} == null || {casterLevel} >= 12',
  '{feats.Great Cleave} == null || {baseAttack} >= 4',
  '{feats.Great Cleave} == null || {features.Cleave} != null',
  '{feats.Greater Spell Penetration} == null || ' +
    '{features.Spell Penetration} != null',
  '{feats.Greater Two Weapon Fighting} == null || {baseAttack} >= 11',
  '{feats.Greater Two Weapon Fighting} == null || {dexterity} >= 19',
  '{feats.Greater Two Weapon Fighting} == null || ' +
    '{features.Improved Two Weapon Fighting} != null',
  '{feats.Heighten Spell} == null || {casterLevel} >= 1',
  '{feats.Improved Bull Rush} == null || {features.Power Attack} != null',
  '{feats.Improved Disarm} == null || ' +
    '{levels.Monk} >= 6 || {features.Combat Expertise} != null',
  '{feats.Improved Feint} == null || {features.Combat Expertise} != null',
  '{feats.Improved Grapple} == null || ' + 
    '{levels.Monk} >= 1 || ' +
    '({dexterity} >= 13 && {features.Improved Unarmed Strike} != null)',
  '{feats.Improved Overrun} == null || {features.Power Attack} != null',
  '{feats.Improved Precise Shot} == null || {dexterity} >= 19',
  '{feats.Improved Precise Shot} == null || {baseAttack} >= 11',
  '{feats.Improved Precise Shot} == null || {features.Precise Shot} != null',
  '{feats.Improved Shield Bash} == null || ' +
    '{features.Shield Proficiency} != null',
  '{feats.Improved Sunder} == null || {features.Power Attack} != null',
  '{feats.Improved Trip} == null || ' +
    '{levels.Monk} >= 6 || {features.Combat Expertise} != null',
  '{feats.Improved Two Weapon Fighting} == null || {baseAttack} >= 6',
  '{feats.Improved Two Weapon Fighting} == null || {dexterity} >= 17',
  '{feats.Improved Two Weapon Fighting} == null || ' +
    '{features.Two Weapon Fighting} != null',
  '{feats.Improved Turning} == null || {turningLevel} >= 1',
  '{feats.Leadership} == null || {level} >= 6',
  '{feats.Manyshot} == null || {dexterity} >= 17',
  '{feats.Manyshot} == null || {baseAttack} >= 6',
  '{feats.Manyshot} == null || {features.Rapid Shot} != null',
  '{feats.Maximize Spell} == null || {casterLevel} >= 1',
  '{feats.Mobility} == null || {features.Dodge} != null',
  '{feats.Mounted Archery} == null || {features.Mounted Combat} != null',
  '{feats.Mounted Combat} == null || {skills.Ride} >= 1',
  '{feats.Natural Spell} == null || {wisdom} >= 13',
  '{feats.Natural Spell} == null || {features.Wild Shape} != null',
  '{feats.Power Attack} == null || {strength} >= 13',
  '{feats.Precise Shot} == null || {features.Point Blank Shot} != null',
  '{feats.Quick Draw} == null || {baseAttack} >= 1',
  '{feats.Quicken Spell} == null || {casterLevel} >= 1',
  '{feats.Rapid Shot} == null || {dexterity} >= 13',
  '{feats.Rapid Shot} == null || {features.Point Blank Shot} != null',
  '{feats.Ride By Attack} == null || {features.Mounted Combat} != null',
  '{feats.Scribe Scroll} == null || {casterLevel} >= 1',
  '{feats.Shield Proficiency Tower} == null || {shieldProficiencyLevel} > 0',
  '{feats.Shot On The Run} == null || {features.Mobility} != null',
  '{feats.Shot On The Run} == null || {features.Point Blank Shot} != null',
  '{feats.Shot On The Run} == null || {baseAttack} >= 4',
  '{feats.Silent Spell} == null || {casterLevel} >= 1',
  '{feats.Snatch Arrows} == null || {dexterity} >= 15',
  '{feats.Snatch Arrows} == null || {features.Deflect Arrows} != null',
  '{feats.Spell Penetration} == null || {casterLevel} >= 1',
  '{feats.Spirited Charge} == null || {features.Ride By Attack} != null',
  '{feats.Spring Attack} == null || {baseAttack} >= 4',
  '{feats.Spring Attack} == null || {features.Mobility} != null',
  '{feats.Still Spell} == null || {casterLevel} >= 1',
  '{feats.Stunning Fist} == null || {dexterity} >= 13',
  '{feats.Stunning Fist} == null || {wisdom} >= 13',
  '{feats.Stunning Fist} == null || {features.Improved Unarmed Strike}!=null',
  '{feats.Trample} == null || {features.Mounted Combat} != null',
  '{feats.Two Weapon Defense} == null || ' +
    '{features.Two Weapon Fighting} != null',
  '{feats.Two Weapon Defense} == null || ' +
    '{features.Two Weapon Fighting} != null',
  '{feats.Two Weapon Fighting} == null || {dexterity} >= 15',
  '{feats.Weapon Finesse} == null || {baseAttack} >= 1',
  '{feats.Whirlwind Attack} == null || {features.Combat Expertise} != null',
  '{feats.Whirlwind Attack} == null || {features.Spring Attack} != null',
  '{feats.Widen Spell} == null || {casterLevel} >= 1'
];
PH35.skillsSynergies = {
  'Bluff': 'Diplomacy/Intimidate/Sleight Of Hand',
  // TODO: Bluff also synergies Disguise (acting)
  'Decipher Script': 'Use Magic Device (scrolls)',
  'Escape Artist': 'Use Rope (bindings)',
   // TODO: Wild Empathy isn't a skill
  'Handle Animal': 'Ride/Wild Empathy',
  'Jump': 'Tumble',
  'Knowledge (Arcana)': 'Spellcraft',
  'Knowledge (Dungeoneering)': 'Survival (underground)',
  'Knowledge (Engineering)': 'Search (secret doors)',
  'Knowledge (Geography)': 'Survival (lost/hazards)',
  'Knowledge (History)': 'Bardic knowledge',
  'Knowledge (Local)': 'Gather Information',
  'knowledge (Nature)': 'Survival (outdoors)',
  'Knowledge (Nobility)': 'Diplomacy',
  'Knowledge (Planes)': 'Survival (other planes)',
  'Knowledge (Religion)': 'Turning check',
  'Search': 'Survival (tracking)',
  'Sense Motive': 'Diplomacy',
  'Spellcraft': 'Use Magic Device (scroll)',
  'Survival': 'Knowledge (Nature)',
  'Tumble': 'Balance/Jump',
  'Use Magic Device': 'Spellcraft (scrolls)',
  'Use Rope': 'Climb (rope)/Escape Artist (rope)'
};
// Filled in by the classes that define selectable features.
PH35.selectableFeatures = {
};
PH35.strengthMaxLoads = [0,
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 115, 130, 150, 175,  200, 230, 260,
  300, 350, 400, 460, 520, 600, 700, 800, 920, 1040, 1200, 1400
];

/* Defines the rules related to PH Chapter 1, Abilities. */
PH35.abilityRules = function() {

  var tests = [
    '{strengthModifier} + {intelligenceModifier} + {wisdomModifier} + ' +
      '{dexterityModifier} + {constitutionModifier} + {charismaModifier} > 0',
    '{strength} > 13 || {intelligence} > 13 || {wisdom} > 13 || ' +
      '{dexterity} > 13 || {constitution} > 13 || {charisma} > 13'
  ];
  ScribeCustomTests(tests);

  // Ability modifier computation
  ScribeCustomRules
    ('charismaModifier', 'charisma', '=', 'Math.floor((source - 10) / 2)');
  ScribeCustomRules
    ('constitutionModifier', 'constitution', '=', 'Math.floor((source-10)/2)');
  ScribeCustomRules
    ('dexterityModifier', 'dexterity', '=', 'Math.floor((source - 10) / 2)');
  ScribeCustomRules
    ('intelligenceModifier', 'intelligence', '=', 'Math.floor((source-10)/2)');
  ScribeCustomRules
    ('strengthModifier', 'strength', '=', 'Math.floor((source - 10) / 2)');
  ScribeCustomRules
    ('wisdomModifier', 'wisdom', '=', 'Math.floor((source - 10) / 2)');

  // Effects of ability modifiers
  ScribeCustomRules('combatNotes.constitutionHitPointsAdjustment',
    'constitutionModifier', '=', 'source == 0 ? null : source',
    'level', '*', null
  );
  ScribeCustomRules('combatNotes.dexterityArmorClassAdjustment',
    'dexterityModifier', '=', 'source == 0 ? null : source'
  );
  ScribeCustomRules('combatNotes.dexterityRangedAttackAdjustment',
    'dexterityModifier', '=', 'source == 0 ? null : source'
  );
  ScribeCustomRules('skillNotes.intelligenceSkillPointsAdjustment',
    'intelligenceModifier', '=', null,
    'level', '*', 'source + 3'
  );
  ScribeCustomRules('combatNotes.strengthDamageAdjustment',
    'strengthModifier', '=', 'source == 0 ? null : source'
  );
  ScribeCustomRules('combatNotes.strengthMeleeAttackAdjustment',
    'strengthModifier', '=', 'source == 0 ? null : source'
  );
  ScribeCustomRules('languageCount',
    'intelligenceModifier', '+', 'source > 0 ? source : null'
  );
  ScribeCustomRules('turningBase', 'charismaModifier', '+', 'source / 3')
  ScribeCustomRules('turningDamageModifier', 'charismaModifier', '+', null);
  ScribeCustomRules('turningFrequency', 'charismaModifier', '+', null);

  // Effects of the notes computed above
  ScribeCustomRules
    ('armorClass', 'combatNotes.dexterityArmorClassAdjustment', '+', null);
  ScribeCustomRules
    ('hitPoints', 'combatNotes.constitutionHitPointsAdjustment', '+', null);
  ScribeCustomRules
    ('meleeAttack', 'combatNotes.strengthMeleeAttackAdjustment', '+', null);
  ScribeCustomRules
    ('rangedAttack', 'combatNotes.dexterityRangedAttackAdjustment', '+', null);
  ScribeCustomRules
    ('skillPoints', 'skillNotes.intelligenceSkillPointsAdjustment', '+', null);
  // TODO strengthDamageAdjustment handled directly by Scribe

};

/* Defines the rules related to PH Chapter 9, Adventuring. */
PH35.adventuringRules = function() {
  ScribeCustomRules('loadLight', 'loadMax', '=', 'Math.floor(source / 3)');
  ScribeCustomRules
    ('loadMax','strength','=','PH35.strengthMaxLoads[source]');
  ScribeCustomRules('loadMedium', 'loadMax', '=', 'Math.floor(source * 2 / 3)');
  ScribeCustomRules('runSpeed',
    'speed', '=', null,
    'runSpeedMultiplier', '*', null
  );
  ScribeCustomRules('runSpeedMultiplier', null, '=', '4');
  ScribeCustomRules('speed', null, '=', '30');
};

/* Defines the rules related to PH Chapter 3, Classes. */
PH35.classRules = function() {

  // Experience- and level-dependent attributes
  ScribeCustomRules('classSkillMaxRanks', 'level', '=', 'source + 3');
  ScribeCustomRules
    ('crossSkillMaxRanks', 'classSkillMaxRanks', '=', 'source / 2');
  ScribeCustomRules
    ('experienceNeeded', 'level', '=', '1000 * source * (source + 1) / 2');
  ScribeCustomRules('featCount', 'level', '=', '1 + Math.floor(source / 3)');
  ScribeCustomRules('level',
    'experience', '=', 'Math.floor((1 + Math.sqrt(1 + source / 125)) / 2)'
  );
  ScribeCustomRules('skillPoints',
    null, '=', '0',
    'level', '^', 'source + 3'
  );
  // TODO level-based ability bonuses Math.floor(level / 4)

  for(var i = 0; i < PH35.CLASSES.length; i++) {

    var baseAttack, features, hitDie, notes, prerequisites, profArmor,
        profShield, profWeapon, saveFortitude, saveReflex, saveWill,
        skillPoints, skills, spellsKnown, spellsPerDay, spellsPerDayModifier;
    var klass = PH35.CLASSES[i];

    if(klass == 'Barbarian') {

      baseAttack = PH35.ATTACK_BONUS_GOOD;
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
          '+4 strength/constitution/+2 Will save/-2 AC 5+conMod rounds %V/day',
        'combatNotes.tirelessRageFeature:Not fatigued after rage',
        'combatNotes.uncannyDodgeFeature:Always adds dexterity modifier to AC',
        'saveNotes.trapSenseFeature:+%V Reflex and AC vs. traps',
        'saveNotes.indomitableWillFeature:' +
          '+4 enchantment resistance during rage',
        'skillNotes.illiteracyFeature:Must spend 2 skill points to read/write'
      ];
      prerequisites = ['{alignment}.indexOf("Lawful") < 0'];
      profArmor = PH35.PROFICIENCY_MEDIUM;
      profShield = PH35.PROFICIENCY_HEAVY;
      profWeapon = PH35.PROFICIENCY_MEDIUM;
      saveFortitude = PH35.SAVE_BONUS_GOOD;
      saveReflex = PH35.SAVE_BONUS_POOR;
      saveWill = PH35.SAVE_BONUS_POOR;
      skillPoints = 4;
      skills = [
        'Climb', 'Handle Animal', 'Intimidate', 'Jump', 'Listen', 'Ride',
        'Survival', 'Swim'
      ];
      spellsKnown = null;
      spellsPerDay = null;
      spellsPerDayModifier = null;
      ScribeCustomRules('abilityNotes.fastMovementFeature',
        'levels.Barbarian', '+=', '10'
      );
      ScribeCustomRules('combatNotes.damageReductionFeature',
        'levels.Barbarian', '+=', 'source>=7 ? Math.floor((source-4)/3) : null'
      );
      ScribeCustomRules('combatNotes.rageFeature',
        'levels.Barbarian', '+=', '1 + Math.floor(source / 4)'
      );
      ScribeCustomRules('saveNotes.trapSenseFeature',
        'levels.Barbarian', '+=', 'source >= 3 ? Math.floor(source / 3) : null'
      );
      ScribeCustomRules('speed', 'abilityNotes.fastMovementFeature', '+', null);

    } else if(klass == 'Bard') {

      baseAttack = PH35.ATTACK_BONUS_AVERAGE;
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
          'Hold %V creatures within 90 ft spellbound 1 round/bard level',
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
          '+%V Knowledge checks on local history'
      ];
      prerequisites = ['{alignment}.indexOf("Lawful") < 0'];
      profArmor = PH35.PROFICIENCY_LIGHT;
      profShield = PH35.PROFICIENCY_HEAVY;
      profWeapon = PH35.PROFICIENCY_LIGHT;
      saveFortitude = PH35.SAVE_BONUS_POOR;
      saveReflex = PH35.SAVE_BONUS_GOOD;
      saveWill = PH35.SAVE_BONUS_GOOD;
      skillPoints = 6;
      skills = [
        'Appraise', 'Balance', 'Bluff', 'Climb', 'Concentration',
        'Decipher Script', 'Diplomacy', 'Disguise', 'Escape Artist',
        'Gather Information', 'Hide', 'Jump', 'Knowledge (Arcana)',
        'Knowledge (Architecture)', 'Knowledge (Engineering)',
        'Knowledge (Dungeoneering)', 'Knowledge (Geography)',
        'Knowledge (History)', 'Knowledge (Local)', 'Knowledge (Nature)',
        'Knowledge (Nobility)', 'Knowledge (Planes)', 'Knowledge (Religion)',
        'Listen', 'Move Silently', 'Perform (Act)', 'Perform (Comedy)',
        'Perform (Dance)', 'Perform (Keyboard)', 'Perform (Oratory)',
        'Perform (Percussion)', 'Perform (Sing)', 'Perform (String)',
        'Perform (Wind)', 'Sense Motive', 'Sleight Of Hand', 'Speak Language',
        'Spellcraft', 'Swim', 'Tumble', 'Use Magic Device'
      ];
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
      spellsPerDayModifier = 'charismaModifier';
      ScribeCustomRules
        ('casterLevelArcane', 'spellsPerDayLevels.Bard', '^=', null);
      ScribeCustomRules
        ('featureNotes.bardicMusicFeature', 'levels.Bard', '=', null);
      ScribeCustomRules
        ('features.Countersong', 'performRanks', '?', 'source >= 3');
      ScribeCustomRules
        ('features.Fascinate', 'performRanks', '?', 'source >= 3');
      ScribeCustomRules
        ('features.Inspire Competence', 'performRanks', '?', 'source >= 6');
      ScribeCustomRules
        ('features.Inspire Courage', 'performRanks', '?', 'source >= 3');
      ScribeCustomRules
        ('features.Inspire Greatness', 'performRanks', '?', 'source >= 12');
      ScribeCustomRules
        ('features.Inspire Heroics', 'performRanks', '?', 'source >= 18');
      ScribeCustomRules
        ('features.Mass Suggestion', 'performRanks', '?', 'source >= 21');
      ScribeCustomRules
        ('features.Song Of Freedom', 'performRanks', '?', 'source >= 15');
      ScribeCustomRules
        ('features.Suggestion', 'performRanks', '?', 'source >= 9');
      ScribeCustomRules('magicNotes.fascinateFeature',
        'levels.Bard', '+=', 'Math.floor((source + 2) / 3)'
      );
      ScribeCustomRules('magicNotes.inspireCourageFeature',
        'levels.Bard', '+=', 'source >= 8 ? Math.floor((source + 4) / 6) : 1'
      );
      ScribeCustomRules('magicNotes.inspireGreatnessFeature',
        'levels.Bard', '+=', 'source >= 9 ? Math.floor((source - 6) / 3) : null'
      );
      ScribeCustomRules('performRanks',
        'skills.Perform (Act)', '^=', null,
        'skills.Perform (Comedy)', '^=', null,
        'skills.Perform (Dance)', '^=', null,
        'skills.Perform (Keyboard)', '^=', null,
        'skills.Perform (Oratory)', '^=', null,
        'skills.Perform (Percussion)', '^=', null,
        'skills.Perform (Sing)', '^=', null,
        'skills.Perform (String)', '^=', null,
        'skills.Perform (Wind)', '^=', null
      );
      ScribeCustomRules('skillNotes.bardicKnowledgeFeature',
        'levels.Bard', '+=', null,
        'intelligenceModifier', '+', null
      );

    } else if(klass == 'Cleric') {

      baseAttack = PH35.ATTACK_BONUS_AVERAGE;
      features = ['1:Spontaneous Cleric Spell', '1:Turn Undead'];
      hitDie = 8;
      notes = [
        'combatNotes.turnUndeadFeature:' +
          'Turn (good) or rebuke (evil) undead creatures',
        'magicNotes.spontaneousClericSpellFeature:%V'
      ];
      prerequisites = null;
      profArmor = PH35.PROFICIENCY_HEAVY;
      profShield = PH35.PROFICIENCY_HEAVY;
      profWeapon = PH35.PROFICIENCY_LIGHT;
      saveFortitude = PH35.SAVE_BONUS_GOOD;
      saveReflex = PH35.SAVE_BONUS_POOR;
      saveWill = PH35.SAVE_BONUS_GOOD;
      spellsKnown = [
        'C0:1:"all"', 'C1:1:"all"', 'C2:3:"all"', 'C3:5:"all"',
        'C4:7:"all"', 'C5:9:"all"', 'C6:11:"all"', 'C7:13:"all"',
        'C8:15:"all"', 'C9:17:"all"',
        'Dom1:1:"all"', 'Dom2:3:"all"', 'Dom3:5:"all"', 'Dom4:7:"all"',
        'Dom5:9:"all"', 'Dom6:11:"all"', 'Dom7:13:"all"', 'Dom8:15:"all"',
        'Dom9:17:"all"',
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
      spellsPerDayModifier = 'wisdomModifier';
      skillPoints = 2;
      skills = [
        'Concentration', 'Diplomacy', 'Heal', 'Knowledge (Arcana)',
        'Knowledge (History)', 'Knowledge (Planes)', 'Knowledge (Religion)',
        'Spellcraft'
      ];
      ScribeCustomRules
        ('casterLevelDivine', 'spellsPerDayLevels.Cleric', '^=', null);
      ScribeCustomRules
        ('classSkills.Bluff', 'skillNotes.trickeryDomain', '=', '1');
      ScribeCustomRules
        ('classSkills.Disguise', 'skillNotes.trickeryDomain', '=', '1');
      ScribeCustomRules
        ('classSkills.Hide', 'skillNotes.trickeryDomain', '=', '1');
      for(var j = 0; j < PH35.SKILLS.length; j++) {
        var skill = PH35.SKILLS[j].split(/:/)[0];
        if(skill.substring(0, 9) == "Knowledge")
          ScribeCustomRules
            ('classSkills.' + skill, 'skillNotes.knowledgeDomain', '=', '1');
      }
      ScribeCustomRules('classSkills.Knowledge (Nature)',
        'skillNotes.animalDomain', '=', '1',
        'skillNotes.plantDomain', '=', '1'
      );
      ScribeCustomRules
        ('classSkills.Survival', 'skillNotes.travelDomain', '=', '1');
      ScribeCustomRules('domainCount', 'levels.Cleric', '+=', '2');
      ScribeCustomRules('magicNotes.spontaneousClericSpellFeature',
        'alignment', '=', 'source.indexOf("Evil") >= 0 ? "Inflict" : "Heal"'
      );
      for(var j = 1; j < 10; j++) {
        ScribeCustomRules('spellsPerDay.Dom' + j,
          'spellsPerDayLevels.Cleric', '=',
          'source >= ' + (j * 2 - 1) + ' ? 1 : null');
      }
      ScribeCustomRules('turningLevel', 'levels.Cleric', '+=', null);

    } else if(klass == 'Druid') {

      baseAttack = PH35.ATTACK_BONUS_AVERAGE;
      features = [
        '1:Animal Companion', '1:Nature Sense', '1:Spontaneous Druid Spell',
        '1:Wild Empathy', '2:Woodland Stride', '3:Trackless Step',
        '4:Resist Nature', '5:Wild Shape', '9:Venom Immunity',
        '13:Thousand Faces', '15:Timeless Body'
      ];
      hitDie = 8;
      notes = [
        'featureNotes.animalCompanionFeature:Special bond/abilities',
        'featureNotes.timelessBodyFeature:No aging penalties',
        'featureNotes.tracklessStepFeature:Untrackable outdoors',
        'featureNotes.woodlandStrideFeature:' +
          'Normal movement through undergrowth',
        'magicNotes.spontaneousDruidSpellFeature:' +
          '<i>Summon Nature\'s Ally</i>',
        'magicNotes.thousandFacesFeature:<i>Alter Self</i> at will',
        'magicNotes.wildShapeFeature:Change into creature of size %V',
        'saveNotes.resistNatureFeature:+4 vs. spells of feys',
        'saveNotes.venomImmunityFeature:Immune to poisons',
        'skillNotes.natureSenseFeature:+2 Knowledge (Nature)/Survival',
        'skillNotes.wildEmpathyFeature:+%V Diplomacy check with animals'
      ];
      prerequisites = ['{alignment}.indexOf("Neutral") >= 0'];
      profArmor = PH35.PROFICIENCY_MEDIUM;
      profShield = PH35.PROFICIENCY_HEAVY;
      profWeapon = PH35.PROFICIENCY_NONE;
      saveFortitude = PH35.SAVE_BONUS_GOOD;
      saveReflex = PH35.SAVE_BONUS_POOR;
      saveWill = PH35.SAVE_BONUS_GOOD;
      skillPoints = 4;
      skills = [
        'Concentration', 'Diplomacy', 'Handle Animal', 'Heal',
        'Knowledge (Nature)', 'Listen', 'Ride', 'Spellcraft', 'Spot',
        'Survival', 'Swim'
      ];
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
      spellsPerDayModifier = 'wisdomModifier';
      ScribeCustomRules
        ('casterLevelDivine', 'spellsPerDayLevels.Druid', '^=', null);
      ScribeCustomRules('languageCount', 'levels.Druid', '+', '1');
      ScribeCustomRules('languages.Druidic', 'levels.Druid', '=', '1');
      ScribeCustomRules('magicNotes.wildShapeFeature',
        'levels.Druid', '=',
          'source <  5 ? null : ' +
          'source == 5 ? "small-medium 1/day" : ' +
          'source == 6 ? "small-medium 2/day" : ' +
          'source == 7 ? "small-medium 3/day" : ' +
          'source <  10 ? "small-large 3/day" : ' +
          'source == 10 ? "small-large 4/day" : ' +
          'source == 11 ? "tiny-large 4/day" : ' +
          'source <  14 ? "tiny-large/plant 4/day" : ' +
          'source == 14 ? "tiny-large/plant 5/day" : ' +
          'source == 15 ? "tiny-huge/plant 5/day" : ' +
          'source <  18 ? "tiny-huge/plant 5/day; elemental 1/day" : ' +
          'source <  20 ? "tiny-huge/plant 6/Day; elemental 2/day" : ' +
          '"tiny-huge/plant 6/day; elemental 3/day"'
      );
      ScribeCustomRules('skillNotes.wildEmpathyFeature',
        'levels.Druid', '+=', null,
        'charismaModifier', '+', null
      );

    } else if(klass == 'Fighter') {

      baseAttack = PH35.ATTACK_BONUS_GOOD;
      features = null;
      hitDie = 10;
      notes = null;
      prerequisites = null;
      profArmor = PH35.PROFICIENCY_HEAVY;
      profShield = PH35.PROFICIENCY_TOWER;
      profWeapon = PH35.PROFICIENCY_MEDIUM;
      saveFortitude = PH35.SAVE_BONUS_GOOD;
      saveReflex = PH35.SAVE_BONUS_POOR;
      saveWill = PH35.SAVE_BONUS_POOR;
      skillPoints = 2;
      skills = [
        'Climb', 'Handle Animal', 'Intimidate', 'Jump', 'Ride', 'Swim'
      ];
      spellsKnown = null;
      spellsPerDay = null;
      spellsPerDayModifier = null;
      ScribeCustomRules
        ('featCount', 'featureNotes.fighterFeatCountBonus', '+', null);
      ScribeCustomRules('featureNotes.fighterFeatCountBonus',
        'levels.Fighter', '=', '1 + Math.floor(source / 2)'
      );

    } else if(klass == 'Monk') {

      baseAttack = PH35.ATTACK_BONUS_AVERAGE;
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
        'saveNotes.diamondSoulFeature:+%V spell resistance',
        'saveNotes.evasionFeature:Reflex save yields no damage instead of 1/2',
        'saveNotes.improvedEvasionFeature:Failed save yields 1/2 damage',
        'saveNotes.perfectSelfFeature:Treat as outsider for magic saves',
        'saveNotes.purityOfBodyFeature:Immune to normal disease',
        'saveNotes.slowFallFeature:' +
          'Subtract %V ft from falling damage distance',
        'saveNotes.stillMindFeature:+2 vs. enchantment'
      ];
      prerequisites = ['{alignment}.indexOf("Lawful") >= 0'];
      profArmor = PH35.PROFICIENCY_NONE;
      profShield = PH35.PROFICIENCY_NONE;
      profWeapon = PH35.PROFICIENCY_NONE;
      saveFortitude = PH35.SAVE_BONUS_GOOD;
      saveReflex = PH35.SAVE_BONUS_GOOD;
      saveWill = PH35.SAVE_BONUS_GOOD;
      skillPoints = 4;
      skills = [
        'Balance', 'Climb', 'Concentration', 'Diplomacy', 'Escape Artist',
        'Hide', 'Jump', 'Knowledge (Arcana)', 'Knowledge (Religion)', 'Listen',
        'Move Silently', 'Perform (Act)', 'Perform (Comedy)',
        'Perform (Dance)', 'Perform (Keyboard)', 'Perform (Oratory)',
        'Perform (Percussion)', 'Perform (Sing)', 'Perform (String)',
        'Perform (Wind)', 'Sense Motive', 'Spot', 'Swim', 'Tumble'
      ];
      spellsKnown = null;
      spellsPerDay = null;
      spellsPerDayModifier = null;
      ScribeCustomRules('abilityNotes.fastMovementFeature',
        'levels.Monk', '+=', '10 * Math.floor(source / 3)'
      );
      ScribeCustomRules
        ('armorClass', 'combatNotes.monkArmorClassAdjustment', '+', null);
      ScribeCustomRules('combatNotes.flurryOfBlowsFeature',
        'levels.Monk', '=', 'source < 5 ? -2 : source < 9 ? -1 : 0'
      );
      ScribeCustomRules('combatNotes.monkArmorClassAdjustment',
        'levels.Monk', '+=', 'source >= 5 ? Math.floor(source / 5) : null',
        'wisdomModifier', '+=', 'source > 0 ? source : null'
      );
      ScribeCustomRules('combatNotes.quiveringPalmFeature',
        'levels.Monk', '+=', '10 + Math.floor(source / 2)',
        'wisdomModifier', '+', null
      );
      ScribeCustomRules
        ('featCount', 'featureNotes.monkFeatCountBonus', '+', null);
      ScribeCustomRules('featureNotes.monkFeatCountBonus',
        'levels.Monk', '=', 'source < 2 ? 1 : source < 6 ? 2 : 3'
      );
      ScribeCustomRules
        ('magicNotes.emptyBodyFeature', 'levels.Monk', '+=', null);
      ScribeCustomRules
        ('magicNotes.wholenessOfBodyFeature', 'levels.Monk', '+=', '2*source');
      ScribeCustomRules
        ('resistance.Enchantment', 'saveNotes.stillMindFeature', '+=', '2');
      ScribeCustomRules
        ('resistance.Magic', 'saveNotes.diamondSoulFeature', '+=', null);
      ScribeCustomRules
        ('saveNotes.diamondSoulFeature', 'levels.Monk', '+=', '10 + source');
      ScribeCustomRules('saveNotes.slowFallFeature',
        'levels.Monk', '=',
        'source < 4 ? null : source < 20 ? Math.floor(source / 2) * 10 : "all"'
      );
      ScribeCustomRules('speed', 'abilityNotes.fastMovementFeature', '+', null);
      ScribeCustomRules('weaponDamage.Unarmed',
        'levels.Monk', '=',
        'source < 12 ? ("d" + (6 + Math.floor(source / 4) * 2)) : ' +
        '              ("2d" + (6 + Math.floor((source - 12) / 4) * 2))'
      );

    } else if(klass == 'Paladin') {

      baseAttack = PH35.ATTACK_BONUS_GOOD;
      features = [
        '1:Aura Of Good', '1:Detect Evil', '1:Smite Evil', '2:Divine Grace',
        '2:Lay On Hands', '3:Aura Of Courage', '3:Divine Health',
        '4:Turn Undead', '5:Special Mount', '6:Remove Disease'
      ];
      hitDie = 10;
      notes = [
        'combatNotes.smiteEvilFeature:' +
          '%V/day add conMod to attack, paladin level to damage vs. evil foe',
        'combatNotes.turnUndeadFeature:' +
          'Turn (good) or rebuke (evil) undead creatures',
        'featureNotes.specialMountFeature:Magical mount w/special abilities',
        'magicNotes.auraOfGoodFeature:Visible to <i>Detect Good</i>',
        'magicNotes.detectEvilFeature:<i>Detect Evil</i> at will',
        'magicNotes.layOnHandsFeature:Harm undead or heal %V HP/day',
        'magicNotes.removeDiseaseFeature:<i>Remove Disease</i> %V/week',
        'saveNotes.auraOfCourageFeature:Immune fear; +4 to allies w/in 30 ft',
        'saveNotes.divineGraceFeature:Add %V to saves',
        'saveNotes.divineHealthFeature:Immune to disease'
      ];
      prerequisites = ['{alignment} == "Lawful Good"'];
      profArmor = PH35.PROFICIENCY_HEAVY;
      profShield = PH35.PROFICIENCY_HEAVY;
      profWeapon = PH35.PROFICIENCY_MEDIUM;
      saveFortitude = PH35.SAVE_BONUS_GOOD;
      saveReflex = PH35.SAVE_BONUS_POOR;
      saveWill = PH35.SAVE_BONUS_POOR;
      skillPoints = 2;
      skills = [
        'Concentration', 'Diplomacy', 'Handle Animal', 'Heal',
        'Knowledge (Nobility)', 'Knowledge (Religion)', 'Ride', 'Sense Motive'
      ];
      spellsKnown = [
        'P1:4:"all"', 'P2:8:"all"', 'P3:11:"all"', 'P4:14:"all"'
      ];
      spellsPerDay = [
        'P1:4:0/6:1/14:2/18:3',
        'P2:8:0/10:1/16:2/19:3',
        'P3:11:0/12:1/17:2/19:3',
        'P4:14:0/15:1/19:2/20:3'
      ];
      spellsPerDayModifier = 'wisdomModifier';
      ScribeCustomRules('casterLevelDivine',
        'spellsPerDayLevels.Paladin', '^=',
        'source < 4 ? null : Math.floor(source / 2)'
      );
      ScribeCustomRules('combatNotes.smiteEvilFeature',
        'levels.Paladin', '=', '1 + Math.floor(source / 5)'
      );
      ScribeCustomRules('magicNotes.layOnHandsFeature',
        'levels.Paladin', '+=', null,
        'charismaModifier', '*', null
      );
      ScribeCustomRules('magicNotes.removeDiseaseFeature',
        'levels.Paladin', '+=', 'Math.floor((source - 3) / 3)'
      );
      ScribeCustomRules
        ('saveFortitude', 'saveNotes.divineGraceFeature', '+', null);
      ScribeCustomRules
        ('saveNotes.divineGraceFeature', 'charismaModifier', '=', null);
      ScribeCustomRules
        ('saveReflex', 'saveNotes.divineGraceFeature', '+', null);
      ScribeCustomRules('saveWill', 'saveNotes.divineGraceFeature', '+', null);
      ScribeCustomRules
        ('turningLevel', 'levels.Paladin', '+=', 'source>3 ? source-3 : null');

    } else if(klass == 'Ranger') {

      PH35.selectableFeatures[klass] =
        'Combat Style (Archery)/Combat Style (Two Weapon Combat)';
      baseAttack = PH35.ATTACK_BONUS_GOOD;
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
      prerequisites = null;
      profArmor = PH35.PROFICIENCY_LIGHT;
      profShield = PH35.PROFICIENCY_HEAVY;
      profWeapon = PH35.PROFICIENCY_MEDIUM;
      saveFortitude = PH35.SAVE_BONUS_GOOD;
      saveReflex = PH35.SAVE_BONUS_GOOD;
      saveWill = PH35.SAVE_BONUS_POOR;
      skillPoints = 6;
      skills = [
        'Climb', 'Concentration', 'Handle Animal', 'Heal', 'Hide', 'Jump',
        'Knowledge (Dungeoneering)', 'Knowledge (Geography)',
        'Knowledge (Nature)', 'Listen', 'Move Silently', 'Ride', 'Search',
        'Spot', 'Survival', 'Swim', 'Use Rope'
      ];
      spellsKnown = [
        'R1:4:"all"', 'R2:8:"all"', 'R3:11:"all"', 'R4:14:"all"'
      ];
      spellsPerDay = [
        'R1:4:0/6:1/14:2/18:3',
        'R2:8:0/10:1/16:2/19:3',
        'R3:11:0/12:1/17:2/19:3',
        'R4:14:0/15:1/19:2/20:3'
      ];
      spellsPerDayModifier = 'wisdomModifier';
      ScribeCustomRules('casterLevelDivine',
        'spellsPerDayLevels.Ranger', '^=',
        'source < 4 ? null : Math.floor(source / 2)'
      );
      ScribeCustomRules('combatNotes.favoredEnemyFeature',
        'levels.Ranger', '+=', '1 + Math.floor(source / 5)'
      );
      ScribeCustomRules('rangerFeatures.Rapid Shot',
        'rangerFeatures.Combat Style (Archery)', '?', null
      );
      ScribeCustomRules('rangerFeatures.Manyshot',
        'rangerFeatures.Combat Style (Archery)', '?', null
      );
      ScribeCustomRules('rangerFeatures.Improved Precise Shot',
        'rangerFeatures.Combat Style (Archery)', '?', null
      );
      ScribeCustomRules('rangerFeatures.Two Weapon Fighting',
        'rangerFeatures.Combat Style (Two Weapon Combat)', '?', null
      );
      ScribeCustomRules('rangerFeatures.Improved Two Weapon Fighting',
        'rangerFeatures.Combat Style (Two Weapon Combat)', '?', null
      );
      ScribeCustomRules('rangerFeatures.Greater Two Weapon Fighting',
        'rangerFeatures.Combat Style (Two Weapon Combat)', '?', null
      );
      ScribeCustomRules('selectableFeatureCount.Ranger',
        'levels.Ranger', '=', 'source >= 2 ? 1 : null'
      );
      ScribeCustomRules('skillNotes.favoredEnemyFeature',
        'levels.Ranger', '+=', '1 + Math.floor(source / 5)'
      );
      ScribeCustomRules('skillNotes.wildEmpathyFeature',
        'levels.Ranger', '+=', null,
        'charismaModifier', '+', null
      );

    } else if(klass == 'Rogue') {

      PH35.selectableFeatures[klass] =
        'Crippling Strike/Defensive Roll/Feat Bonus/Improved Evasion/' +
        'Opportunist/Skill Mastery/Slippery Mind';
      baseAttack = PH35.ATTACK_BONUS_AVERAGE;
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
      prerequisites = null;
      profArmor = PH35.PROFICIENCY_LIGHT;
      profShield = PH35.PROFICIENCY_NONE;
      profWeapon = PH35.PROFICIENCY_LIGHT;
      saveFortitude = PH35.SAVE_BONUS_POOR;
      saveReflex = PH35.SAVE_BONUS_GOOD;
      saveWill = PH35.SAVE_BONUS_POOR;
      skillPoints = 8;
      skills = [
        'Appraise', 'Balance', 'Bluff', 'Climb', 'Decipher Script',
        'Diplomacy', 'Disable Device', 'Disguise', 'Escape Artist', 'Forgery',
        'Gather Information', 'Hide', 'Intimidate', 'Jump',
        'Knowledge (Local)', 'Listen', 'Move Silently', 'Open Lock',
        'Perform (Act)', 'Perform (Comedy)', 'Perform (Dance)',
        'Perform (Keyboard)', 'Perform (Oratory)', 'Perform (Percussion)',
        'Perform (Sing)', 'Perform (String)', 'Perform (Wind)', 'Search',
        'Sense Motive', 'Sleight Of Hand', 'Spot', 'Swim', 'Tumble',
        'Use Magic Device', 'Use Rope'
      ];
      spellsKnown = null;
      spellsPerDay = null;
      spellsPerDayModifier = null;
      ScribeCustomRules('combatNotes.sneakAttackFeature',
        'levels.Rogue', '+=', 'Math.floor((source + 1) / 2)'
      );
      ScribeCustomRules('featCount', 'features.Feat Bonus', '+=', 'null');
      ScribeCustomRules('saveNotes.trapSenseFeature',
        'levels.Rogue', '+=', 'source >= 3 ? Math.floor(source / 3) : null'
      );
      ScribeCustomRules('selectableFeatureCount.Rogue',
        'levels.Rogue', '+=', 'source>=10 ? Math.floor((source-7)/3) : null'
      );

    } else if(klass == 'Sorcerer') {

      baseAttack = PH35.ATTACK_BONUS_POOR;
      features = ['1:Summon Familiar'];
      hitDie = 4;
      notes = [
        'magicNotes.summonFamiliarFeature:Special bond/abilities'
      ];
      prerequisites = null;
      profArmor = PH35.PROFICIENCY_NONE;
      profShield = PH35.PROFICIENCY_NONE;
      profWeapon = PH35.PROFICIENCY_LIGHT;
      saveFortitude = PH35.SAVE_BONUS_POOR;
      saveReflex = PH35.SAVE_BONUS_POOR;
      saveWill = PH35.SAVE_BONUS_GOOD;
      skillPoints = 2;
      skills = [
        'Bluff', 'Concentration', 'Knowledge (Arcana)', 'Spellcraft'
      ];
      spellsKnown = [
        'W0:1:4/2:5/4:6/6:7/8:8/10:9',
        'W1:1:2/3:3/5:4/7:5',
        'W2:4:1/5:2/7:3/9:4/11:5',
        'W3:6:1/7:2/9:3/11:4',
        'W4:8:1/9:2/11:3/13:4',
        'W5:10:1/11:2/13:3/15:4',
        'W6:12:1/13:2/15:3',
        'W7:14:1/15:2/17:3',
        'W8:16:1/17:2/19:3',
        'W9:18:1/19:2/20:3'
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
      spellsPerDayModifier = 'charismaModifier';
      ScribeCustomRules
        ('casterLevelArcane', 'spellsPerDayLevels.Sorcerer', '^=', null);

    } else if(klass == 'Wizard') {

      baseAttack = PH35.ATTACK_BONUS_POOR;
      features = ['1:Scribe Scroll', '1:Summon Familiar'];
      hitDie = 4;
      notes = [
        'magicNotes.scribeScrollFeature:Create scroll of any known spell',
        'magicNotes.summonFamiliarFeature:Special bond/abilities',
        'magicNotes.wizardSpecialization:Extra %V spell/day each spell level',
        'skillNotes.wizardSpecialization:+2 Spellcraft (%V)'
      ];
      prerequisites = null;
      profArmor = PH35.PROFICIENCY_NONE;
      profShield = PH35.PROFICIENCY_NONE;
      profWeapon = PH35.PROFICIENCY_NONE;
      saveFortitude = PH35.SAVE_BONUS_POOR;
      saveReflex = PH35.SAVE_BONUS_POOR;
      saveWill = PH35.SAVE_BONUS_GOOD;
      skillPoints = 2;
      skills = [
        'Concentration', 'Decipher Script', 'Knowledge (Arcana)',
        'Knowledge (Dungeoneering)', 'Knowledge (Engineering)',
        'Knowledge (Geography)', 'Knowledge (History)', 'Knowledge (Local)',
        'Knowledge (Nature)', 'Knowledge (Nobility)', 'Knowledge (Planes)',
        'Knowledge (Religion)', 'Spellcraft'
      ];
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
      spellsPerDayModifier = 'intelligenceModifier';
      ScribeCustomRules
        ('casterLevelArcane', 'spellsPerDayLevels.Wizard', '^=', null);
      ScribeCustomRules
        ('featCount', 'featureNotes.wizardFeatCountBonus', '+', null);
      ScribeCustomRules('featureNotes.wizardFeatCountBonus',
        'levels.Wizard', '=', 'source >= 5 ? Math.floor(source / 5) : null'
      );
      for(var j = 0; j < PH35.SCHOOLS.length; j++) {
        var school = PH35.SCHOOLS[j];
        ScribeCustomRules('magicNotes.wizardSpecialization',
         'specialize.' + school, '=', '"' + school + '"'
        );
        ScribeCustomRules('skillNotes.wizardSpecialization',
          'specialize.' + school, '=', '"' + school + '"'
        );
      }
      for(var j = 0; j < 10; j++) {
        ScribeCustomRules
          ('spellsPerDay.W' + j, 'magicNotes.wizardSpecialization', '+', '1');
      }

    } else
      continue;

    ScribeCustomClass
      (klass, hitDie, skillPoints, baseAttack, saveFortitude, saveReflex,
       saveWill, profArmor, profShield, profWeapon, skills, features,
       prerequisites);
    if(notes != null)
      ScribeCustomNotes(notes);
    if(spellsKnown != null) {
      for(var j = 0; j < spellsKnown.length; j++) {
        var typeAndLevel = spellsKnown[j].split(/:/)[0];
        var code = spellsKnown[j].substring(typeAndLevel.length + 1).
                   split(/\//).reverse().join('source >= ');
        code = code.replace(/:/g, ' ? ').replace(/source/g, ' : source');
        code = 'source >= ' + code + ' : null';
        if(code.indexOf('source >= 1 ?') >= 0) {
          code = code.replace(/source >= 1 ./, '').replace(/ : null/, '');
        }
        ScribeCustomRules
          ('spellsKnown.' + typeAndLevel, 'levels.' + klass, '=', code);
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
        ScribeCustomRules
          ('spellsPerDay.' + typeAndLevel, 'levels.' + klass, '=', code);
        if(spellsPerDayModifier != null) {
          var level = typeAndLevel.replace(/[A-Za-z]*/g, '');
          if(level > 0) {
            code = 'source >= ' + level + ' ? 1 + Math.floor((source - ' + level + ') / 4) : null';
            ScribeCustomRules
              ('spellsPerDay.' + typeAndLevel, spellsPerDayModifier, '+', code);
          }
        }
        ScribeCustomRules('spellDifficultyClass.' + typeAndLevel,
          'spellsPerDay.' + typeAndLevel, '?', null,
          spellsPerDayModifier, '=', '10 + source + ' + level
        );
      }
      ScribeCustomRules
        ('spellsPerDayLevels.' + klass, 'levels.' + klass, '=', null);
    }

  }

};

/* Defines the rules related to PH Chapter 8, Combat. */
PH35.combatRules = function() {
  ScribeCustomRules('armorClass',
    null, '=', '10',
    'armor', '+', 'PH35.armorsArmorClassBonuses[source]',
    'shield', '+', 'source=="None" ? null : ' +
                   'source=="Tower" ? 4 : source.indexOf("Light") >= 0 ? 1 : 2'
  );
  ScribeCustomRules
    ('attacksPerRound', 'baseAttack', '=', 'Math.floor((source + 5) / 5)');
  ScribeCustomRules('baseAttack', null, '=', '0');
  ScribeCustomRules('initiative', 'dexterityModifier', '=', null);
  ScribeCustomRules('meleeAttack', 'baseAttack', '=', null);
  ScribeCustomRules('rangedAttack', 'baseAttack', '=', null);
  ScribeCustomRules('save.Fortitude', 'constitutionModifier', '=', null);
  ScribeCustomRules('save.Reflex', 'dexterityModifier', '=', null);
  ScribeCustomRules('save.Will', 'wisdomModifier', '=', null);
  ScribeCustomRules('turningBase', 'turningLevel', '=', null)
  ScribeCustomRules('turningDamageModifier', 'turningLevel', '=', null);
  ScribeCustomRules('turningFrequency', 'turningLevel', '+=', '3');
  ScribeCustomRules('turningMax',
    'turningBase', '=', 'Math.floor(source + 10 / 3)',
    'turningLevel', 'v', 'source + 4'
  );
  ScribeCustomRules('turningMin',
    'turningBase', '=', 'Math.floor(source - 3)',
    'turningLevel', '^', 'source - 4'
  );
  ScribeCustomRules('weapons.Unarmed', null, '=', '1');
};

/* Defines the rules related to PH Chapter 6, Description. */
PH35.descriptionRules = function() {

  ScribeCustomChoices('alignments', PH35.ALIGNMENTS);
  ScribeCustomChoices('deities', PH35.DEITIES, 'None:');
  ScribeCustomChoices('genders', PH35.GENDERS);

};

/* Defines the rules related to PH Chapter 7, Equipment. */
PH35.equipmentRules = function() {

  ScribeCustomChoices('armors', PH35.ARMORS);
  ScribeCustomChoices('goodies', PH35.GOODIES);
  ScribeCustomChoices('shields', PH35.SHIELDS);
  ScribeCustomChoices('weapons', PH35.WEAPONS);
  ScribeCustomNotes('magicNotes.arcaneSpellFailure:%V%'),
  ScribeCustomRules('abilityNotes.armorSpeedAdjustment',
    'armorWeightClass', '=', 'source == "Light" ? null : -10',
    'features.Slow', '+', '5'
  );
  ScribeCustomRules('armorWeightClass',
    'armor', '=',
      'PH35.armorsWeightClasses[source] == null ? "Light" : ' +
      'PH35.armorsWeightClasses[source]'
  );
  ScribeCustomRules('combatNotes.dexterityArmorClassAdjustment',
    'armor', 'v', 'PH35.armorsMaxDexBonuses[source]'
  );
  ScribeCustomRules('magicNotes.arcaneSpellFailure',
    'casterLevelArcane', '?', null,
    'armor', '+=', 'PH35.armorsArcaneSpellFailurePercentages[source]',
    'shield', '+=', 'source == "None" ? 0 : ' +
                    'source == "Tower" ? 50 : ' +
                    'source.indexOf("Heavy") >= 0 ? 15 : 5'
  );
  // TODO: Where does this rule belong?
  ScribeCustomRules('runSpeedMultiplier',
    'armorWeightClass', '+', 'source == "Heavy" ? -1 : null'
  );
  ScribeCustomRules('skillNotes.armorSkillCheckPenalty',
    'armor', '=', 'PH35.armorsSkillCheckPenalties[source]'
  );
  ScribeCustomRules('speed', 'abilityNotes.armorSpeedAdjustment', '+', null);
  // Hack to get combatNotes.strengthDamageAdjustment to appear in italics
  ScribeCustomRules
    ('level', 'combatNotes.strengthDamageAdjustment', '=', 'null');

};

/* Defines the rules related to PH Chapter 5, Feats. */
PH35.featRules = function() {

  ScribeCustomChoices('feats', PH35.FEATS);
  ScribeCustomNotes(PH35.featsNotes);
  for(var i = 0; i < PH35.FEATS.length; i++) {
    ScribeCustomRules
      ('features.' + PH35.FEATS[i], 'feats.' + PH35.FEATS[i], '=', null);
  }
  ScribeCustomTests(PH35.featsPrerequisites, '+/{^feats} == {featCount}');
  var allSelectable = {};
  for(var a in PH35.selectableFeatures) {
    var prefix = a.substring(0, 1).toLowerCase() +
                 a.substring(1).replace(/ /g, '');
    var features = PH35.selectableFeatures[a].split('/');
    for(var i = 0; i < features.length; i++) {
      selectable = features[i];
      ScribeCustomRules('features.' + selectable,
        'selectableFeatures.' + selectable, '+=', null
      );
      allSelectable[selectable] = '';
    }
  }
  ScribeCustomChoices('selectableFeatures', ScribeUtils.GetKeys(allSelectable));
  ScribeCustomTests('+/{^selectableFeatures} == +/{^selectableFeatureCount}');

  // TODO Find a way to test whether the feats these rules implement are def'd
  ScribeCustomRules('armorClass', 'combatNotes.dodgeFeature', '+', '1');
  ScribeCustomRules('armorProficiency',
    'armorProficiencyLevel', '=', 'PH35.PROFICIENCY_LEVEL_NAMES[source]'
  );
  ScribeCustomRules('armorProficiencyLevel',
    null, '=', PH35.PROFICIENCY_NONE,
    'features.Armor Proficiency Light', '^', PH35.PROFICIENCY_LIGHT,
    'features.Armor Proficiency Medium', '^', PH35.PROFICIENCY_MEDIUM,
    'features.Armor Proficiency Heavy', '^', PH35.PROFICIENCY_HEAVY
  );
  ScribeCustomRules('combatNotes.dexterityMeleeAttackAdjustment',
    'combatNotes.weaponFinesseFeature', '?', null,
    'dexterityModifier', '=', 'source == 0 ? null : source'
  );
  ScribeCustomRules('combatNotes.strengthMeleeAttackAdjustment',
    'combatNotes.weaponFinesseFeature', '*', '0'
  );
  ScribeCustomRules('combatNotes.stunningFistFeature',
    'level', '=', '10 + Math.floor(source / 2)',
    'wisdomModifier', '+', null
  );
  ScribeCustomRules
    ('hitPoints', 'combatNotes.toughnessFeature', '+', '3 * source');
  ScribeCustomRules
    ('initiative', 'combatNotes.improvedInitiativeFeature', '+', '4');
  ScribeCustomRules
    ('magicNotes.arcaneSpellFailure', 'features.Still Spell', 'v', '0');
  ScribeCustomRules
    ('meleeAttack', 'combatNotes.dexterityMeleeAttackAdjustment', '+', null);
  ScribeCustomRules('runSpeedMultiplier', 'combatNotes.runFeature', '+', '1');
  ScribeCustomRules
    ('save.Fortitude', 'saveNotes.greatFortitudeFeature', '+', '2');
  ScribeCustomRules
    ('save.Reflex', 'saveNotes.lightningReflexesFeature', '+', '2');
  ScribeCustomRules('save.Will', 'saveNotes.ironWillFeature', '+', '2');
  ScribeCustomRules('shieldProficiency',
    'shieldProficiencyLevel', '=', 'PH35.PROFICIENCY_LEVEL_NAMES[source]'
  );
  ScribeCustomRules('shieldProficiencyLevel',
    null, '=', PH35.PROFICIENCY_NONE,
    'features.Shield Proficiency', '^', PH35.PROFICIENCY_HEAVY,
    'features.Shield Proficiency Tower', '^', PH35.PROFICIENCY_TOWER
  );
  ScribeCustomRules
    ('turningFrequency', 'combatNotes.extraTurningFeature', '+', '4 * source');
  ScribeCustomRules
    ('turningLevel', 'combatNotes.improvedTurningFeature', '+', '1');
  ScribeCustomRules('weaponProficiency',
    'weaponProficiencyLevel', '=',
      'source==' + PH35.PROFICIENCY_LIGHT + ' ? "Simple" : ' +
      'source==' + PH35.PROFICIENCY_MEDIUM + ' ? "Martial" : ' +
      '"None"'
  );
  ScribeCustomRules('weaponProficiencyLevel',
    null, '=', PH35.PROFICIENCY_NONE,
    'features.Weapon Proficiency Simple', '^', PH35.PROFICIENCY_LIGHT
  );

};

/* Defines the rules related to PH Chapter 10, Magic and Chapter 11, Spells. */
PH35.magicRules = function() {
  ScribeCustomChoices('domains', PH35.DOMAINS);
  ScribeCustomChoices('schools', PH35.SCHOOLS);
  ScribeCustomChoices('spells', PH35.SPELLS);
  ScribeCustomNotes(PH35.domainsNotes);
  ScribeCustomRules
    ('armorClass', 'combatNotes.goodiesArmorClassAdjustment', '+', null);
  ScribeCustomRules('casterLevel',
    'casterLevelArcane', '^=', null,
    'casterLevelDivine', '^=', null
  );
  ScribeCustomRules('combatNotes.goodiesArmorClassAdjustment',
    'goodies.Ring Of Protection +1', '+=', null,
    'goodies.Ring Of Protection +2', '+=', 'source * 2',
    'goodies.Ring Of Protection +3', '+=', 'source * 3',
    'goodies.Ring Of Protection +4', '+=', 'source * 4'
  );
  for(var i = 0; i < PH35.DOMAINS.length; i++) {
    if(PH35.DOMAINS[i] != 'War')
      continue;
    ScribeCustomRules('featureNotes.warDomain',
      'deity', '=', 'PH35.deitiesFavoredWeapons[source]'
    );
    for(var a in PH35.deitiesFavoredWeapons) {
      var weapons = a.split(/\//);
      for(var j = 0; j < weapons.length; j++) {
        var weapon = weapons[j];
        var weaponNoSpace = weapon.replace(/ /g, '');
        ScribeCustomNotes
          ('combatNotes.weaponFocus(' + weaponNoSpace + ')Feature:+1 attack');
        ScribeCustomRules('clericFeatures.Weapon Focus (' + weapon + ')',
          'featureNotes.warDomain', '=',
          'source.indexOf("' + weapon + '") >= 0 ? 1 : null'
        );
      }
    }
  }
};

/* Defines the rules related to PH Chapter 2, Races. */
PH35.raceRules = function() {

  ScribeCustomRules('languageCount', 'race', '=', 'source != "Human" ? 2 : 1');
  ScribeCustomRules('languages.Common', null, '=', '1');

  for(var i = 0; i < PH35.RACES.length; i++) {

    var adjustment, features, notes;
    var race = PH35.RACES[i];

    if(race == 'Dwarf') {

      adjustment = '+2 constitution/-2 charisma';
      features = [
        'Darkvision', 'Dodge Giants', 'Dwarf Favored Enemy', 'Know Depth',
        'Magic Resistance', 'Natural Smith', 'Poison Resistance', 'Slow',
        'Stability', 'Stonecunning'
      ];
      notes = [
        'abilityNotes.dwarfArmorSpeedAdjustment:No speed penalty in armor',
        'combatNotes.dodgeGiantsFeature:+4 AC vs. giant creatures',
        'combatNotes.dwarfFavoredEnemyFeature:' +
          '+1 vs. bugbear/goblin/hobgoblin/orc',
        'featureNotes.darkvisionFeature:60 ft b/w vision in darkness',
        'featureNotes.knowDepthFeature:Intuit approximate depth underground',
        'saveNotes.magicResistanceFeature:+2 vs. spells',
        'saveNotes.poisonResistanceFeature:+2 vs. poison',
        'saveNotes.stabilityFeature:+4 vs. Bull Rush/Trip',
        'skillNotes.naturalSmithFeature:' +
           '+2 Appraise/Craft involving stone or metal',
        'skillNotes.stonecunningFeature:' +
          '+2 Search involving stone or metal/automatic check w/in 10 ft'
      ];
      ScribeCustomRules('abilityNotes.armorSpeedAdjustment',
        'abilityNotes.dwarfArmorSpeedAdjustment', '^', '0'
      );
      ScribeCustomRules('abilityNotes.dwarfArmorSpeedAdjustment',
        'race', '=', 'source == "Dwarf" ? 1 : null'
      );
      ScribeCustomRules
        ('resistance.Magic', 'saveNotes.magicResistanceFeature', '+=', '2');
      ScribeCustomRules
        ('resistance.Poison', 'saveNotes.poisonResistanceFeature', '+=', '2');
      ScribeCustomRules('speed', 'features.Slow', '+', '-10');

    } else if(race == 'Elf') {

      adjustment = '+2 dexterity/-2 constitution';
      features = [
        'Enchantment Resistance', 'Keen Senses', 'Low Light Vision',
        'Sense Secret Doors', 'Sleep Immunity'
      ];
      notes = [
        'featureNotes.lowLightVisionFeature:' +
          'Double normal distance in poor light',
        'featureNotes.senseSecretDoorsFeature:' +
          'Automatic Search when within 5 ft',
        'saveNotes.enchantmentResistanceFeature:+2 vs. enchantment',
        'saveNotes.sleepImmunityFeature:Immune <i>Sleep</i>',
        'skillNotes.keenSensesFeature:+2 Listen/Search/Spot'
      ];
      ScribeCustomRules('resistance.Enchantment',
        'saveNotes.enchantmentResistanceFeature', '+=', '2'
      );

    } else if(race == 'Gnome') {

      adjustment = '+2 constitution/-2 strength';
      features = [
        'Dodge Giants', 'Gnome Favored Enemy', 'Gnome Spells',
        'Illusion Resistance', 'Keen Ears', 'Keen Nose', 'Low Light Vision',
        'Natural Illusionist', 'Slow', 'Small'
      ];
      notes = [
        'combatNotes.dodgeGiantsFeature:+4 AC vs. giant creatures',
        'combatNotes.gnomeFavoredEnemyFeature:' +
           '+1 vs. bugbear/goblin/hobgoblin/kobold',
        'combatNotes.smallFeature:+1 AC/base attack',
        'featureNotes.lowLightVisionFeature:' +
          'Double normal distance in poor light',
        'magicNotes.gnomeSpellsFeature:%V 1/day',
        'magicNotes.naturalIllusionistFeature:+1 DC on illusion spells',
        'saveNotes.illusionResistanceFeature:+2 vs. illusions',
        'skillNotes.keenEarsFeature:+2 Listen',
        'skillNotes.smallFeature:+4 Hide',
        'skillNotes.keenNoseFeature:+2 Craft (Alchemy)'
      ];
      ScribeCustomRules('armorClass', 'combatNotes.smallFeature', '+', '1');
      ScribeCustomRules('baseAttack', 'combatNotes.smallFeature', '+', '1');
      ScribeCustomRules('magicNotes.gnomeSpellsFeature',
        'charisma', '=',
        '(source >= 10 ? "<i>Dancing Lights</i>/<i>Ghost Sound</i>/' +
        '<i>Prestidigitation</i>/" : "") + "<i>Speak With Animals</i>"'
      );
      ScribeCustomRules('resistance.Illusion',
        'saveNotes.illusionResistanceFeature', '+=', '2'
      );
      ScribeCustomRules('speed', 'features.Slow', '+', '-10');

    } else if(race == 'Half Elf') {

      adjustment = null;
      features = [
        'Alert Senses', 'Enchantment Resistance', 'Low Light Vision',
        'Sleep Immunity', 'Tolerance'
      ];
      notes = [
        'featureNotes.lowLightVisionFeature:' +
          'Double normal distance in poor light',
        'saveNotes.enchantmentResistanceFeature:+2 vs. enchantment',
        'saveNotes.sleepImmunityFeature:Immune <i>Sleep</i>',
        'skillNotes.alertSensesFeature:+1 Listen/Search/Spot',
        'skillNotes.toleranceFeature:+2 Diplomacy/Gather Information'
      ];
      ScribeCustomRules('resistance.Enchantment',
        'saveNotes.enchantmentResistanceFeature', '+=', '2'
      );

    } else if(race == 'Half Orc') {

      adjustment = '+2 strength/-2 intelligence/-2 charisma';
      features = ['Darkvision'];
      notes = [
        'featureNotes.darkvisionFeature:60 ft b/w vision in darkness'
      ];

    } else if(race == 'Halfling') {

      adjustment = '+2 dexterity/-2 strength';
      features = [
        'Accurate', 'Fortunate', 'Keen Ears', 'Slow', 'Small', 'Spry',
        'Unafraid'
      ];
      notes = [
        'combatNotes.accurateFeature:+1 attack with slings/thrown',
        'combatNotes.smallFeature:+1 AC/base attack',
        'saveNotes.fortunateFeature:+1 all saves',
        'saveNotes.unafraidFeature:+2 vs. fear',
        'skillNotes.keenEarsFeature:+2 Listen',
        'skillNotes.smallFeature:+4 Hide',
        'skillNotes.spryFeature:+2 Climb/Jump/Move Silently'
      ];
      ScribeCustomRules('armorClass', 'combatNotes.smallFeature', '+', '1');
      ScribeCustomRules('baseAttack', 'combatNotes.smallFeature', '+', '1');
      ScribeCustomRules
        ('resistance.Fear', 'saveNotes.unafraidFeature', '+=', '2');
      ScribeCustomRules('speed', 'features.Slow', '+', '-10');
      ScribeCustomRules('save.Fortitude','saveNotes.fortunateFeature','+','1');
      ScribeCustomRules('save.Reflex', 'saveNotes.fortunateFeature', '+', '1');
      ScribeCustomRules('save.Will', 'saveNotes.fortunateFeature', '+', '1');

    } else if(race == 'Human') {

      adjustment = null;
      features = null;
      notes = null;
      ScribeCustomRules('featCount',
        'featureNotes.humanFeatCountBonus', '+', null
      );
      ScribeCustomRules('featureNotes.humanFeatCountBonus',
        'race', '+=', 'source == "Human" ? 1 : null'
      );
      ScribeCustomRules('skillNotes.humanSkillPointsBonus',
        'race', '?', 'source == "Human"',
        'level', '=', 'source + 3'
      );
      ScribeCustomRules
        ('skillPoints', 'skillNotes.humanSkillPointsBonus', '+', null);

    } else
      continue;

    ScribeCustomRace(race, adjustment, features);
    if(notes != null) {
      ScribeCustomNotes(notes);
    }

  }

};

/* Defines the rules related to PH Chapter 4, Skills. */
PH35.skillRules = function() {

  var abilityNames = {
    'cha':'charisma', 'con':'constitution', 'dex':'dexterity',
    'int':'intelligence', 'str':'strength', 'wis':'wisdom'
  };
  ScribeCustomChoices('skills', PH35.SKILLS);
  for(var a in PH35.skillsSynergies) {
    var prefix = a.substring(0, 1).toLowerCase() +
                 a.substring(1).replace(/ /g, '');
    ScribeCustomNotes
      ('skillNotes.' + prefix + 'Synergy:+2 ' + PH35.skillsSynergies[a]);
  }
  ScribeCustomRules('skillNotes.bardicKnowledgeFeature',
    'skillNotes.knowledge(History)Synergy', '+', '2'
  );
  ScribeCustomRules('skillNotes.wildEmpathyFeature',
    'skillNotes.handleAnimalSynergy', '+', '2'
  );
  ScribeCustomRules('turningBase',
    'skillNotes.knowledge(Religion)Synergy', '+', '2/3'
  );
  for(var i = 0; i < PH35.SKILLS.length; i ++) {
    var pieces = PH35.SKILLS[i].split(/[:\/]/);
    var ability = pieces[1] == null ? '' : pieces[1];
    if(abilityNames[ability] != null) {
      var modifier = abilityNames[ability] + 'Modifier';
      ScribeCustomRules('skills.' + pieces[0], modifier, '+', null);
    }
  }

  // Speak Languge-related rules
  ScribeCustomChoices('languages', PH35.LANGUAGES);
  ScribeCustomTests('+/{^languages} == {languageCount}');
  ScribeCustomRules('languageCount', 'skills.Speak Language', '+', null);

};

/* TODO comment */
PH35.RandomAbility = function() {
  var rolls = [];
  for(i = 0; i < 4; i++)
    rolls[i] = ScribeUtils.Random(1, 6);
  rolls.sort();
  return rolls[1] + rolls[2] + rolls[3];
};

/* Returns a random name for a charater of race #race#. */
PH35.RandomName = function(race) {

  function RandomChar(string) {
    return string.charAt(ScribeUtils.Random(0, string.length - 1));
  }

  if(race == 'Half Elf')
    race = ScribeUtils.Random(0, 99) < 50 ? 'Elf' : 'Human';
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
  var dipthongs = {a:'wy', e:'aei', o: 'aiouy', u: 'ae'};
  var syllables = ScribeUtils.Random(0, 99);
  syllables = syllables < 50 ? 2 :
              syllables < 75 ? 3 :
              syllables < 90 ? 4 :
              syllables < 95 ? 5 :
              syllables < 99 ? 6 : 7;
  var result = '';
  var vowel;

  for(var i = 0; i < syllables; i++) {
    if(ScribeUtils.Random(0, 99) <= 80) {
      endConsonant = RandomChar(consonants).toUpperCase();
      if(clusters[endConsonant] != null && ScribeUtils.Random(0, 99) < 15)
        endConsonant += RandomChar(clusters[endConsonant]);
      result += endConsonant;
      if(endConsonant == 'Q')
        result += 'u';
    }
    else if(endConsonant.length == 1 && ScribeUtils.Random(0, 99) < 10) {
      result += endConsonant;
      endConsonant += endConsonant;
    }
    vowel = RandomChar(vowels);
    if(endConsonant.length > 0 && dipthongs[vowel] != null &&
       ScribeUtils.Random(0, 99) < 15)
      vowel += RandomChar(dipthongs[vowel]);
    result += vowel;
    endConsonant = '';
    if(ScribeUtils.Random(0, 99) <= 60) {
      while(leading.indexOf((endConsonant = RandomChar(consonants))) >= 0)
        ; /* empty */
      if(clusters[endConsonant] != null && ScribeUtils.Random(0, 99) < 15)
        endConsonant += RandomChar(clusters[endConsonant]);
      result += endConsonant;
    }
  }
  return result.substring(0, 1).toUpperCase() +
         result.substring(1).toLowerCase();

};

/*
 * Sets the character's #attribute# attribute to a random value.  #rules# is
 * the RuleEngine used to produce computed values; the function sometimes needs
 * to apply the rules to determine valid values for some attributes.
 */
PH35.randomize = function(rules, attributes, attribute) {

  /*
   * Randomly selects #howMany# elements of the array #choices#, prepends
   * #prefix# to each, and sets those attributes in #attributes# to #value#.
   */
  function PickAttrs(attributes, prefix, choices, howMany, value) {
    var remaining = [].concat(choices);
    for(var i = 0; i < howMany && remaining.length > 0; i++) {
      var which = ScribeUtils.Random(0, remaining.length - 1);
      attributes[prefix + remaining[which]] = value;
      remaining = remaining.slice(0, which).concat(remaining.slice(which + 1));
    }
  }

  /* Returns the sum of all #attr# elements that match #pat#. */
  function SumMatching(attrs, pat) {
    var result = 0;
    for(var a in attrs)
      if(a.search(pat) >= 0)
        result += attrs[a] - 0;
    return result;
  }

  var abilities = {
    'charisma': '', 'constitution': '', 'dexterity': '', 'intelligence': '',
    'strength': '', 'wisdom': ''
  };
  var selections = {
    'alignment': Scribe.alignments, 'armor': Scribe.armors,
    'gender': Scribe.genders, 'race': Scribe.races, 'shield': Scribe.shields
  };

  var attr;
  var attrs;
  var choices;
  var howMany;
  var i;

  if(abilities[attribute] != null) {
    var rolls = [];
    for(i = 0; i < 4; i++)
      rolls[i] = ScribeUtils.Random(1, 6);
    rolls.sort();
    attributes[attribute] = rolls[1] + rolls[2] + rolls[3];
  } else if(selections[attribute] != null) {
    attributes[attribute] = ScribeUtils.RandomKey(selections[attribute]);
  } else if(attribute == 'deity') {
    /* Pick a deity that's no more than one alignment position removed. */
    var aliInfo = attributes.alignment.match(/^([CLN]).* ([GEN])/);
    var aliPat;
    if(aliInfo == null) /* Neutral character */
      aliPat = '\\((N |N.|.N)';
    else if(aliInfo[1] == 'N')
      aliPat = '\\((N |.' + aliInfo[2] + ')';
    else if(aliInfo[2] == 'N')
      aliPat = '\\((N |' + aliInfo[1] + '.)';
    else
      aliPat = '\\(([N' + aliInfo[1] + '][N' + aliInfo[2] + '])';
    choices = [];
    for(attr in Scribe.deities)
      if(attr.match(aliPat))
        choices[choices.length] = attr;
    attributes['deity'] = choices[ScribeUtils.Random(0, choices.length - 1)];
  } else if(attribute == 'domains') {
    attrs = rules.Apply(attributes);
    howMany = attrs.domainCount;
    if(howMany != null) {
      if((choices = Scribe.deities[attributes.deity]) == null)
        choices = ScribeUtils.GetKeys(Scribe.domains);
      else
        choices = choices.split('/');
      PickAttrs
        (attributes, 'domains.', choices, howMany-SumMatching(/^domains\./), 1);
    }
  } else if(attribute == 'feats') {
    attrs = rules.Apply(attributes);
    howMany = attrs.featCount;
    var selections = {};
    for(attr in Scribe.feats) {
      if(attrs['feats.' + attr] != null)
        howMany--;
      else if(attrs['features.' + attr] == null)
        selections['feats.' + attr] = 1;
    }
    while(howMany > 0 &&
          (choices = ScribeUtils.GetKeys(selections)).length > 0) {
      attr = choices[ScribeUtils.Random(0, choices.length - 1)];
      attrs[attr] = 1;
      var invalid = Validate(attrs);
      for(i = 0; i < invalid.length && invalid[i].indexOf(attr) < 0; i++)
        ; /* empty */
      if(i < invalid.length) {
        delete attrs[attr];
      } else {
        attributes[attr] = 1;
        delete selections[attr];
        howMany--;
      }
    }
  } else if(attribute == 'hitPoints') {
    attributes.hitPoints = 0;
    for(var klass in Scribe.classes) {
      if((attr = attributes['levels.' + klass]) == null)
        continue;
      var matchInfo =
        Scribe.classes[klass].match(/^((\d+)?d)?(\d+)$/);
      var number = matchInfo == null || matchInfo[2] == null ? 1 : matchInfo[2];
      var sides = matchInfo == null || matchInfo[3] == null ? 6 : matchInfo[3];
      attributes.hitPoints += number * sides;
      while(--attr > 0)
        attributes.hitPoints += ScribeUtils.Random(number, number * sides);
    }
  } else if(attribute == 'languages') {
    attrs = rules.Apply(attributes);
    var race = attributes.race.replace(/.* /, '');
    attributes['languages.Common'] = 1;
    if(race != 'Human')
      attributes['languages.' + race] = 1;
    choices = [];
    for(attr in Scribe.languages) {
      if(attributes['languages.' + attr] == null)
        choices[choices.length] = attr;
    }
    PickAttrs(attributes, 'languages.', choices,
              attrs.languageCount - SumMatching(attributes, /^languages\./), 1);
  } else if(attribute == 'levels') {
    for(attr in attributes) {
      if(attr.indexOf('levels.') == 0)
        delete attributes[attr];
    }
    choices = [];
    for(attr in Scribe.classes)
      choices[choices.length] = attr;
    PickAttrs(attributes, 'levels.', choices, 1, 1);
  } else if(attribute == 'name') {
    attributes['name'] = PH35.RandomName(attributes['race']);
  } else if(attribute == 'selectableFeatures') {
    attrs = rules.Apply(attributes);
    for(attr in attrs) {
      if(!attr.match(/^selectableFeatureCount\./))
        continue;
      choices = PH35.selectableFeatures[attr.substring(attr.indexOf('.') + 1)];
      if(choices == null)
        continue;
      choices = choices.split('/');
      howMany = attrs[attr];
      var selections = {};
      for(i = 0; i < choices.length; i++) {
        attr = choices[i];
        if(attrs['selectableFeatures.' + attr] != null)
          howMany--;
        else if(attrs['features.' + attr] == null)
          selections['selectableFeatures.' + attr] = 1;
      }
      while(howMany > 0 &&
            (choices = ScribeUtils.GetKeys(selections)).length > 0) {
        attr = choices[ScribeUtils.Random(0, choices.length - 1)];
        attrs[attr] = 1;
        var invalid = Validate(attrs);
        for(i = 0; i < invalid.length && invalid[i].indexOf(attr) < 0; i++)
          ; /* empty */
        if(i < invalid.length) {
          delete attrs[attr];
        } else {
          attributes[attr] = 1;
          delete selections[attr];
          howMany--;
        }
      }
    }
  } else if(attribute == 'skills') {
    attrs = rules.Apply(attributes);
    var maxRanks = attrs.classSkillMaxRanks;
    var skillPoints = attrs.skillPoints;
    choices = [];
    for(attr in Scribe.skills) {
      if(attrs['skills.' + attr] == null)
        choices[choices.length] = attr;
      else
        skillPoints -= attrs['skills.' + attr] *
                       (attrs['classSkills.' + attr] != null ? 1 : 2);
    }
    while(skillPoints > 0 && choices.length > 0) {
      var pickClassSkill = ScribeUtils.Random(0, 99) >= 15;
      i = ScribeUtils.Random(0, choices.length - 1);
      attr = choices[i];
      if((attrs['classSkills.' + attr] != null) != pickClassSkill)
        continue;
      var points = ScribeUtils.Random(0, 99) < 60 ?
        maxRanks : ScribeUtils.Random(1, maxRanks - 1);
      if(points > skillPoints)
        points = skillPoints;
      if(pickClassSkill)
        attributes['skills.' + attr] = points;
      else {
        if(points % 2 == 1)
          points--;
        if(points == 0)
          continue;
        attributes['skills.' + attr] = points / 2;
      }
      skillPoints -= points;
      choices = choices.slice(0, i).concat(choices.slice(i + 1));
      if((i = attr.indexOf(' (')) >= 0) {
        /* Select only one of a set of subskills (Craft, Perform, etc.) */
        attr = attr.substring(0, i);
        for(i = choices.length - 1; i >= 0; i--)
          if(choices[i].search(attr) == 0)
            choices = choices.slice(0, i).concat(choices.slice(i + 1));
      }
    }
  } else if(attribute == 'specialization') {
    for(attr in attributes) {
      if(attr.indexOf('prohibit.') == 0 || attr.indexOf('specialize.') == 0)
        delete attributes[attr];
    }
    if(attributes['levels.Wizard'] != null) {
      var specialty = ScribeUtils.RandomKey(Scribe.schools);
      attributes['specialize.' + specialty] = 1;
      choices = [];
      for(attr in Scribe.schools) {
        if(attr != specialty)
          choices[choices.length] = attr;
      }
      PickAttrs(attributes, 'prohibit.', choices,
                specialty == 'Divination' ? 1 : 2, 1);
    }
  } else if(attribute == 'spells') {

    var category;
    var matchInfo;
    var spellLevel;
    var spells = {};
    var spellsByLevel = {};

    for(attr in Scribe.spells) {
      var spellLevels = Scribe.spells[attr].split('/');
      for(i = 0; i < spellLevels.length; i++) {
        spellLevel = spellLevels[i];
        if(spellsByLevel[spellLevel] == null)
          spellsByLevel[spellLevel] = [];
        spellsByLevel[spellLevel][spellsByLevel[spellLevel].length] = attr;
      }
    }
    attrs = rules.Apply(attributes);
    for(attr in attributes) {
      if((matchInfo = attr.match(/^spells\.(.*)\((.*)\)/)) != null)
        spells[matchInfo[1]] = matchInfo[2];
    }
    for(attr in Scribe.domains) {
      if(attributes['domains.' + attr] == null)
        continue;
      category = Scribe.spellsCategoryCodes[attr];
      for(var level = 0; level < 10; level++) {
        spellLevel = category + level;
        if((choices = spellsByLevel[spellLevel]) == null ||
           (howMany = attrs['spellsKnown.Dom' + level]) == null)
          continue;
        if(howMany == 'all')
          howMany = choices.length;
        PickAttrs(spells, '', choices, howMany, spellLevel);
      }
    }
    for(attr in Scribe.classes) {
      if(attributes['levels.' + attr] == null ||
         (category = Scribe.spellsCategoryCodes[attr]) == null)
        continue;
      for(var level = 0; level < 10; level++) {
        spellLevel = category + level;
        if((choices = spellsByLevel[spellLevel]) == null ||
           (howMany = attrs['spellsKnown.' + spellLevel]) == null)
          continue;
        for(i = choices.length - 1; i >= 0; i--)
          if(spells[choices[i]] != null)
            choices = choices.slice(0, i).concat(choices.slice(i + 1));
        if(howMany == 'all')
          howMany = choices.length;
        PickAttrs(spells, '', choices, howMany -
                  SumMatching(attributes, '^spells\\..*('+spellLevel+')'),
                  spellLevel);
      }
    }
    for(attr in spells)
      attributes['spells.' + attr + '(' + spells[attr] + ')'] = 1;

  } else if(attribute == 'weapons') {
    choices = [];
    for(attr in Scribe.weapons)
      choices[choices.length] = attr;
    PickAttrs(attributes, 'weapons.', choices,
              2 - SumMatching(attributes, /^weapons\./), 1);
  }

};
