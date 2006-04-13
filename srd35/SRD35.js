/* $Id: SRD35.js,v 1.4 2006/04/13 14:13:24 Jim Exp $ */

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


/* Loads the rules from the Player's Handbook v3.5 Edition. */
function PH35() {
  if(PH35.AbilityRules != null) PH35.AbilityRules();
  if(PH35.RaceRules != null) PH35.RaceRules();
  if(PH35.ClassRules != null) PH35.ClassRules();
  if(PH35.SkillRules != null) PH35.SkillRules();
  if(PH35.FeatRules != null) PH35.FeatRules();
  if(PH35.DescriptionRules != null) PH35.DescriptionRules();
  if(PH35.EquipmentRules != null) PH35.EquipmentRules();
  if(PH35.CombatRules != null) PH35.CombatRules();
  if(PH35.MagicRules != null) PH35.MagicRules();
  PH35.AbilityRules = null;
  PH35.RaceRules = null;
  PH35.ClassRules = null;
  PH35.SkillRules = null;
  PH35.FeatRules = null;
  PH35.DescriptionRules = null;
  PH35.EquipmentRules = null;
  PH35.CombatRules = null;
  PH35.MeleeRules = null;
  PH35.MagicRules = null;
}
PH35.ALIGNMENTS = [
  'Chaotic Evil',
  'Chaotic Good',
  'Chaotic Neutral',
  'Neutral',
  'Neutral Evil',
  'Neutral Good',
  'Lawful Evil',
  'Lawful Good',
  'Lawful Neutral'
];
PH35.CLASSES = [
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Wizard',
  null
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
  'Widen Spell',
  /* Ranger combat styles */
  'Combat Style (Archery)', 'Combat Style (Two Weapon Combat)',
  /* Rogue special abilities (PM 51) */
  'Crippling Strike', 'Defensive Roll', 'Improved Evasion', 'Opportunist',
  'Skill Mastery', 'Slippery Mind'
];
PH35.GOODIES = [
  'Ring Of Protection +1',
  'Ring Of Protection +2',
  'Ring Of Protection +3',
  'Ring Of Protection +4'
];
PH35.RACES = [
  'Dwarf',
  'Elf',
  'Gnome',
  'Half Elf',
  'Half Orc',
  'Halfling',
  'Human',
  null
];
PH35.SKILLS = [
  'Appraise:int', 'Balance:dex', 'Bluff:cha', 'Climb:str', 'Concentration:con',
  'Decipher Script:int:trained', 'Diplomacy:cha', 'Disable Device:int:trained',
  'Disguise:cha', 'Escape Artist:dex', 'Forgery:int', 'Gather Information:cha',
  'Handle Animal:cha:trained', 'Heal:wis', 'Hide:dex', 'Intimidate:cha',
  'Jump:str', 'Knowledge (Arcana):int:trained',
  'Knowledge (Dungeoneering):int:trained',
  'Knowledge (Engineering):int:trained', 'Knowledge (Geography):int:trained',
  'Knowledge (History):int:trained', 'Knowledge (Local):int:trained',
  'Knowledge (Nature):int:trained', 'Knowledge (Nobility):int:trained',
  'Knowledge (Planes):int:trained', 'Knowledge (Religion):int:trained',
  'Listen:wis', 'Move Silently:dex', 'Open Lock:dex:trained',
  'Perform (Act):cha', 'Perform (Comedy):cha', 'Perform (Dance):cha',
  'Perform (Keyboard):cha', 'Perform (Oratory):cha', 'Perform (Percussion):cha',
  'Perform (Sing):cha', 'Perform (String):cha', 'Perform (Wind):cha',
  'Ride:dex', 'Search:int', 'Sense Motive:wis', 'Sleight Of Hand:dex:trained',
  'Speak Language::trained', 'Spellcraft:int:trained', 'Spot:wis',
  'Survival:wis', 'Swim:str', 'Tumble:dex:trained',
  'Use Magic Device:cha:trained', 'Use Rope:dex'
];
PH35.STRENGTH_MAX_LOADS = [0,
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 115, 130, 150, 175,  200, 230, 260,
  300, 350, 400, 460, 520, 600, 700, 800, 920, 1040, 1200, 1400
];
PH35.WEAPONS = [
  'Bastard Sword:d10@19', 'Battleaxe:d8x3', 'Bolas:d4r10', 'Club:d6r10',
  'Composite Longbow:d8x3r110', 'Composite Shortbow:d6x3r70',
  'Dagger:d4@19r10:Dart:d4r20', 'Dire Flail:d8/d8', 'Dwarven Urgosh:d8x3/d6x3',
  'Dwarven Waraxe:d10x3', 'Falchion:2d4@18', 'Gauntlet:d3', 'Glaive:d10x3',
  'Gnome Hooked Hammer:d8x3/d6x4', 'Greataxe:d12x3', 'Greatclub:d10',
  'Greatsword:2d6@19', 'Guisarme:2d4x3', 'Halberd:d10x3', 'Handaxe:d6x3',
  'Hand Crossbow:d4@19r30', 'Heavy Crossbow:d10@19r120', 'Heavy Flail:d10@19',
  'Heavy Mace:d8', 'Heavy Pick:d6', 'Heavy Shield:d4',
  'Heavy Spiked Shield:d6', 'Javelin:d6r30', 'Kama:d6', 'Kukri:d4@18',
  'Lance:d8x3', 'Light Crossbow:d8@19r80', 'Light Flail:d8',
  'Light Hammer:d4r20', 'Light Mace:d6', 'Light Pick:d4x4', 'Light Shield:d3',
  'Light Spiked Shield:d4', 'Longbow:d8x3r100', 'Longspear:d8x3',
  'Longsword:d8@19', 'Morningstar:d8', 'Net:d0r10', 'Nunchaku:d6',
  'Orc Double Axe:d8/d8', 'Punching Dagger:d4x3', 'Quarterstaff:d6/d6',
  'Rapier:d6@18', 'Ranseur:2d4x3', 'Repeating Heavy Crossbow:d10@19r120',
  'Repeating Light Crossbow:d8@19r80', 'Sai:d4r10', 'Sap:d6', 'Scimitar:d6@18',
  'Scythe:2d4x4', 'Short Sword:d6@19', 'Shortbow:d6x3r60', 'Shortspear:d6r20',
  'Shuriken:d2r10', 'Siangham:d6', 'Sickle:d6', 'Sling:d4r50', 'Spear:d8r20',
  'Spiked Chain:2d4', 'Spiked Gauntlet:d4', 'Throwing Axe:d6r10',
  'Trident:d8r10', 'Two-Bladed Sword:d8@19/d8@19', 'Warhammer:d8x3', 'Whip:d3'
];

PH35.AbilityRules = function() {

  /* Ability modifier computation */
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

  /* Effects of ability modifiers */
  ScribeCustomRules('turningBase', 'charismaModifier', '+', 'source / 3')
  ScribeCustomRules('turningDamageModifier', 'charismaModifier', '+', null);
  ScribeCustomRules('turningFrequency', 'charismaModifier', '+', null);

  ScribeCustomRules('meleeNotes.constitutionHitPointsAdjustment',
    'constitutionModifier', '=', 'source == 0 ? null : source'
  );
  ScribeCustomRules
    ('hitPoints', 'meleeNotes.constitutionHitPointsAdjustment', '+', null);
  ScribeCustomRules('saveFortitude', 'constitutionModifier', '+', null);

  ScribeCustomRules('meleeNotes.dexterityArmorClassAdjustment',
    'dexterityModifier', '=', 'source == 0 ? null : source'
  );
  ScribeCustomRules
    ('armorClass', 'meleeNotes.dexterityArmorClassAdjustment', '+', null);
  ScribeCustomRules
    ('meleeAttack', 'meleeNotes.dexterityMeleeAttackAdjustment', '+', null);
  ScribeCustomRules('meleeNotes.dexterityRangedAttackAdjustment',
    'dexterityModifier', '=', 'source == 0 ? null : source'
  );
  ScribeCustomRules('saveReflex', 'dexterityModifier', '+', null);

  ScribeCustomRules('languageCount',
    'intelligenceModifier', '+', 'source > 0 ? source : null'
  );
  ScribeCustomRules('skillNotes.intelligenceSkillPointsAdjustment',
    'intelligenceModifier', '=', null,
    'level', '*', 'source + 3'
  );
  ScribeCustomRules
    ('skillPoints', 'skillNotes.intelligenceSkillPointsAdjustment', '+', null);

  ScribeCustomRules('meleeNotes.strengthDamageAdjustment',
    'strengthModifier', '=', 'source == 0 ? null : source'
  );
  ScribeCustomRules('meleeNotes.strengthMeleeAttackAdjustment',
    'strengthModifier', '=', 'source == 0 ? null : source'
  );
  ScribeCustomRules
    ('meleeAttack', 'meleeNotes.strengthMeleeAttackAdjustment', '+', null);

  ScribeCustomRules('saveWill', 'wisdomModifier', '+', null);

  /* Experience-dependent attributes */
  ScribeCustomRules('classSkillMaxRanks', 'level', '=', 'source + 3');
  ScribeCustomRules
    ('crossSkillMaxRanks', 'classSkillMaxRanks', '=', 'source / 2');
  ScribeCustomRules
    ('experienceNeeded', 'level', '=', '1000 * source * (source + 1) / 2');
  ScribeCustomRules('level',
    'experience', '=', 'Math.floor((1 + Math.sqrt(1 + source / 125)) / 2)'
  );
  ScribeCustomRules
    ('featCount', 'level', '=', '1 + Math.floor(source / 3)');
  ScribeCustomRules('skillPoints',
    null, '=', '0',
    'level', '^', 'source + 3'
  );

  /* Effects of experience-dependent attributes */
  ScribeCustomRules
    ('meleeNotes.constitutionHitPointsAdjustment', 'level', '*', null);

  /* Computation of other attributes */
  ScribeCustomRules('languageCount', null, '=', '1');
  ScribeCustomRules('languages.Common', null, '=', '1');
  ScribeCustomRules('loadLight', 'loadMax', '=', 'Math.floor(source / 3)');
  ScribeCustomRules
    ('loadMax','strength','=','PH35.STRENGTH_MAX_LOADS[source]');
  ScribeCustomRules('loadMedium', 'loadMax', '=', 'Math.floor(source * 2 / 3)');
  ScribeCustomRules('runSpeed', 'speed', '=', null);
  ScribeCustomRules('runSpeedMultiplier', null, '=', '4');

  /* Effects of other attributes */
  ScribeCustomRules('runSpeed', 'runSpeedMultipler', '*', null);

}

PH35.ClassRules = function() {

  var baseAttack, features, hitDie, notes, profArmor,
      profShield, profWeapon, saveFortitude, saveReflex, saveWill,
      skillPoints, skills;
  var prerequisites = null;  /* No base class has prerequisites */

  for(var i = 0; i < PH35.CLASSES.length; i++) {

    var klass = PH35.CLASSES[i];

    if(klass == 'Barbarian') {

      baseAttack = DndCharacter.ATTACK_BONUS_GOOD;
      features = [
        1, 'Fast Movement', 1, 'Rage', 2, 'Uncanny Dodge', 3, 'Trap Sense',
        5, 'Improved Uncanny Dodge', 7, 'Damage Reduction', 11, 'Greater Rage',
        14, 'Indomitable Will', 17, 'Tireless Rage', 20, 'Mighty Rage'
      ];
      hitDie = 12;
      notes = [
        'abilityNotes.fastMovementFeature', '+%V speed',
        'meleeNotes.damageReductionFeature', '%V subtracted from damage taken',
        'meleeNotes.greaterRageFeature', '+6 strength/constitution; +3 Will',
        'meleeNotes.improvedUncannyDodgeFeature',
          'Flanked only by rogue four levels higher',
        'meleeNotes.mightyRageFeature',
          '+8 strength/constitution; +4 Will save',
        'meleeNotes.rageFeature',
          '+4 strength/constitution/+2 Will save/-2 AC 5+conMod rounds %V/day',
        'meleeNotes.tirelessRageFeature', 'Not exhausted after rage',
        'meleeNotes.uncannyDodgeFeature',
          'Always adds dexterity modifier to AC',
        'saveNotes.indomitableWillFeature', '+4 Will save while raging',
        'saveNotes.trapSenseFeature', '+%V Reflex and AC vs. traps'
      ];
      profArmor = DndCharacter.ARMOR_PROFICIENCY_MEDIUM;
      profShield = DndCharacter.SHIELD_PROFICIENCY_HEAVY;
      profWeapon = DndCharacter.WEAPON_PROFICIENCY_MARTIAL;
      saveFortitude = DndCharacter.SAVE_BONUS_GOOD;
      saveReflex = DndCharacter.SAVE_BONUS_POOR;
      saveWill = DndCharacter.SAVE_BONUS_POOR;
      skillPoints = 4;
      skills = [
        'Climb', 'Handle Animal', 'Intimidate', 'Jump', 'Listen', 'Ride',
        'Survival', 'Swim'
      ];
      ScribeCustomRules('abilityNotes.fastMovementFeature',
        'levels.Barbarian', '+=', '10'
      );
      ScribeCustomRules('meleeNotes.rageFeature',
        'levels.Barbarian', '+=', '1 + Math.floor(source / 4)'
      );
      ScribeCustomRules('meleeNotes.damageReductionFeature',
        'levels.Barbarian', '+=', 'source>=7 ? Math.floor((source-4)/3) : null'
      );
      ScribeCustomRules('saveNotes.trapSenseFeature',
        'levels.Barbarian', '+=', 'source >= 3 ? Math.floor(source / 3) : null'
      );
      ScribeCustomRules('speed', 'abilityNotes.fastMovementFeature', '+', null);

    } else if(klass == 'Bard') {

      baseAttack = DndCharacter.ATTACK_BONUS_AVERAGE;
      features = [
        1, 'Bardic Knowledge', 1, 'Countersong', 1, 'Fascinate',
        1, 'Inspire Courage', 3, 'Inspire Competence', 6, 'Suggestion',
        9, 'Inspire Greatness', 12, 'Song Of Freedom', 15, 'Inspire Heroics',
        18, 'Mass Suggestion'
      ];
      hitDie = 6;
      notes = [
        'featureNotes.inspireCompetenceFeature',
          '+2 allies skill checks while performing',
        'featureNotes.inspireCourageFeature',
          '+%V morale/attack/damage to allies while performing',
        'featureNotes.inspireGreatnessFeature',
           '%V allies get +2 HD/attack/+1 Fortitude save while performing',
        'featureNotes.inspireHeroicsFeature',
          'Single ally +4 morale/AC while performing',
        'magicNotes.countersongFeature',
          'Perform check vs. sonic magic within 30 ft',
        'magicNotes.fascinateFeature',
          'Hold %V creatures within 90 ft spellbound',
        'magicNotes.songOfFreedomFeature',
          'Break enchantment through performing',
        'magicNotes.massSuggestionFeature',
          'Make suggestion to all fascinated creatures',
        'magicNotes.suggestionFeature',
          'Make suggestion to a fascinated creature',
        'skillNotes.bardicKnowledgeFeature',
          '+%V Knowledge checks on local history'
      ];
      profArmor = DndCharacter.ARMOR_PROFICIENCY_LIGHT;
      profShield = DndCharacter.SHIELD_PROFICIENCY_HEAVY;
      profWeapon = DndCharacter.WEAPON_PROFICIENCY_SIMPLE;
      saveFortitude = DndCharacter.SAVE_BONUS_POOR;
      saveReflex = DndCharacter.SAVE_BONUS_GOOD;
      saveWill = DndCharacter.SAVE_BONUS_GOOD;
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
      ScribeCustomRules
        ('casterLevelArcane', 'spellsPerDayLevel.Bard', '^=', null);
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
      ScribeCustomRules('featureNotes.inspireCourageFeature',
        'levels.Bard', '+=', 'source >= 8 ? Math.floor((source + 4) / 6) : 1'
      );
      ScribeCustomRules('featureNotes.inspireGreatnessFeature',
        'levels.Bard', '+=', 'source >= 12 ? Math.floor((source - 6) / 3) : 1'
      );
      ScribeCustomRules('magicNotes.fascinateFeature',
        'levels.Bard', '+=', 'Math.floor((source + 2) / 3)'
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
        'features.Bardic Knowledge', '?', null,
        'levels.Bard', '+=', null,
        'intelligenceModifier', '+', null
      );
      ScribeCustomRules('spellsPerDay.B0',
        'spellsPerDayLevels.Bard', '=', 'source == 1 ? 2 : source < 14 ? 3 : 4'
      );
      for(var j = 1; j <= 6; j++) {
        var none = (j - 1) * 3 + (j == 1 ? 1 : 0);
        var n2 = j == 1 || j == 6 ? 1 : 2;
        var n3 = j == 6 ? 1 : ((6 - j) * 2);
        ScribeCustomRules('spellsPerDay.B' + j,
          'spellsPerDayLevels.Bard', '=',
             'source <= ' + none + ' ? null : ' +
             'source <= ' + (none + 1) + ' ? 0 : ' +
             'source <= ' + (none + 2) + ' ? 1 : ' +
             'source <= ' + (none + 2 + n2) + ' ? 2 : ' +
             'source <= ' + (none + 2 + n2 + n3) + ' ? 3 : 4',
          'charismaModifier', '+',
             'source >= ' + j + ' ? Math.floor((source+' + (4-j) + ')/4) : null'
        );
        ScribeCustomRules('maxSpellLevelArcane', 'spellsPerDay.B' + j, '^=', j);
      }
      ScribeCustomRules('spellsPerDayLevels.Bard', 'levels.Bard', '=', null);

    } else if(klass == 'Cleric') {

      baseAttack = DndCharacter.ATTACK_BONUS_AVERAGE;
      features = [1, 'Spontaneous Cleric Spell', 1, 'Turn Undead'];
      hitDie = 8;
      notes = [
        'magicNotes.spontaneousClericSpellFeature', '%V',
        'meleeNotes.turnUndeadFeature',
          'Turn (good) or rebuke (evil) undead creatures'
      ];
      profArmor = DndCharacter.ARMOR_PROFICIENCY_HEAVY;
      profShield = DndCharacter.SHIELD_PROFICIENCY_HEAVY;
      profWeapon = DndCharacter.WEAPON_PROFICIENCY_SIMPLE;
      saveFortitude = DndCharacter.SAVE_BONUS_GOOD;
      saveReflex = DndCharacter.SAVE_BONUS_POOR;
      saveWill = DndCharacter.SAVE_BONUS_GOOD;
      skillPoints = 2;
      skills = [
        'Concentration', 'Diplomacy', 'Heal', 'Knowledge (Arcana)',
        'Knowledge (History)', 'Knowledge (Planes)', 'Knowledge (Religion)',
        'Spellcraft'
      ];
      ScribeCustomRules
        ('casterLevelDivine', 'spellsPerDayLevel.Cleric', '^=', null);
      ScribeCustomRules('magicNotes.spontaneousClericSpellFeature',
        'alignment', '=', 'source.indexOf("Evil") >= 0 ? "Inflict" : "Heal"'
      );
      ScribeCustomRules('spellsPerDay.C0',
        'spellsPerDayLevels.Cleric', '=',
          'source == 1 ? 3 : source <= 3 ? 4 : source <= 6 ? 5 : 6'
      );
      for(var j = 1; j <= 9; j++) {
        var none = (j - 1) * 2;
        ScribeCustomRules('spellsPerDay.C' + j,
          'spellsPerDayLevels.Cleric', '=',
             'source<=' + none + ' ? null : source<=' + (none+1) + ' ? 1 : ' +
             'source<=' + (none+3) + ' ? 2 : source<=' + (none+6) + ' ? 3 : ' +
             'source<=' + (none+10) + ' ? 4 : 5',
          'wisdomModifier', '+',
             'source>=' + j + ' ? Math.floor((source+' + (4-j) + ')/4) : null'
        );
        ScribeCustomRules('maxSpellLevelDivine', 'spellsPerDay.C' + j, '^=', j);
        ScribeCustomRules
          ('spellsPerDay.Dom' + j, 'spellsPerDay.C' + j, '=', '1');
      }
      ScribeCustomRules
        ('spellsPerDayLevels.Cleric', 'levels.Cleric', '=', null);
      ScribeCustomRules('turningLevel', 'levels.Cleric', '+=', null);

    } else if(klass == 'Druid') {

      baseAttack = DndCharacter.ATTACK_BONUS_AVERAGE;
      features = [
        1, 'Animal Companion', 1, 'Nature Sense', 1, 'Spontaneous Druid Spell',
        1, 'Wild Empathy', 2, 'Woodland Stride', 3, 'Trackless Step',
        4, 'Resist Nature', 5, 'Wild Shape', 9, 'Venom Immunity',
        13, 'Thousand Faces', 15, 'Timeless Body'
      ];
      hitDie = 8;
      notes = [
        'featureNotes.animalCompanionFeature', 'Special bond/abilities',
        'featureNotes.tracklessStepFeature', 'Untrackable outdoors',
        'featureNotes.woodlandStrideFeature',
          'Normal movement through undergrowth',
        'featureNotes.timelessBodyFeature', 'No aging penalties',
        'magicNotes.spontaneousDruidSpellFeature',
          '<i>Summon Nature\'s Ally</i>',
        'magicNotes.thousandFacesFeature', '<i>Alter Self</i> at will',
        'saveNotes.resistNatureFeature', '+4 vs. spells of feys',
        'saveNotes.venomImmunityFeature', 'Immune to organic poisons',
        'skillNotes.natureSenseFeature', '+2 Knowledge (Nature)/Survival',
        'skillNotes.wildEmpathyFeature', '+%V Diplomacy check with animals'
      ];
      profArmor = DndCharacter.ARMOR_PROFICIENCY_MEDIUM;
      profShield = DndCharacter.SHIELD_PROFICIENCY_HEAVY;
      profWeapon = DndCharacter.WEAPON_PROFICIENCY_NONE;
      saveFortitude = DndCharacter.SAVE_BONUS_GOOD;
      saveReflex = DndCharacter.SAVE_BONUS_POOR;
      saveWill = DndCharacter.SAVE_BONUS_GOOD;
      skillPoints = 4;
      skills = [
        'Concentration', 'Diplomacy', 'Handle Animal', 'Heal',
        'Knowledge (Nature)', 'Listen', 'Ride', 'Spellcraft', 'Spot',
        'Survival', 'Swim'
      ];
      ScribeCustomRules
        ('casterLevelDivine', 'spellsPerDayLevel.Druid', '^=', null);
      ScribeCustomRules('magicNotes.wildShapeFeature',
        'levels.Druid', '=',
          'source <  5 ? null : ' +
          'source == 5 ? "Small-medium 1/day" : ' +
          'source == 6 ? "Small-medium 2/day" : ' +
          'source == 7 ? "Small-medium 3/day" : ' +
          'source <  10 ? "Small-large 3/day" : ' +
          'source == 10 ? "Small-large 4/day" : ' +
          'source == 11 ? "Tiny-large 4/day" : ' +
          'source <  14 ? "Tiny-large/plant 4/day" : ' +
          'source == 14 ? "Tiny-large/plant 5/day" : ' +
          'source == 15 ? "Tiny-huge/plant 5/day" : ' +
          'source <  18 ? "Tiny-huge/plant 5/day; elemental 1/day" : ' +
          'source <  20 ? "Tiny-huge/plant 6/Day; elemental 2/day" : ' +
          '"Tiny-huge/plant 6/day; elemental 3/day"'
      );
      ScribeCustomRules('languageCount', 'levels.Druid', '+', '1');
      ScribeCustomRules('languages.Druidic', 'levels.Druid', '=', '1');
      ScribeCustomRules('skillNotes.wildEmpathyFeature',
        'levels.Druid', '+=', null,
        'charismaModifier', '+', null
      );
      ScribeCustomRules('spellsPerDay.D0',
        'spellsPerDayLevels.Druid', '=',
          'source == 1 ? 3 : source <= 3 ? 4 : source <= 6 ? 5 : 6'
      );
      for(var j = 1; j <= 9; j++) {
        var none = (j - 1) * 2;
        ScribeCustomRules('spellsPerDay.D' + j,
          'spellsPerDayLevels.Druid', '=',
             'source<=' + none + ' ? null : source<=' + (none+1) + ' ? 1 : ' +
             'source<=' + (none+3) + ' ? 2 : source<=' + (none+6) + ' ? 3 : ' +
             'source<=' + (none+10) + ' ? 4 : 5',
          'wisdomModifier', '+',
             'source>=' + j + ' ? Math.floor((source+' + (4-j) + ')/4) : null'
        );
        ScribeCustomRules('maxSpellLevelDivine', 'spellsPerDay.D' + j, '^=', j);
      }
      ScribeCustomRules('spellsPerDayLevels.Druid', 'levels.Druid', '=', null);

    } else if(klass == 'Fighter') {

      baseAttack = DndCharacter.ATTACK_BONUS_GOOD;
      features = null;
      hitDie = 10;
      notes = null;
      profArmor = DndCharacter.ARMOR_PROFICIENCY_HEAVY;
      profShield = DndCharacter.SHIELD_PROFICIENCY_TOWER;
      profWeapon = DndCharacter.WEAPON_PROFICIENCY_MARTIAL;
      saveFortitude = DndCharacter.SAVE_BONUS_GOOD;
      saveReflex = DndCharacter.SAVE_BONUS_POOR;
      saveWill = DndCharacter.SAVE_BONUS_POOR;
      skillPoints = 2;
      skills = [
        'Climb', 'Handle Animal', 'Intimidate', 'Jump', 'Ride', 'Swim'
      ];
      ScribeCustomRules('featureNotes.classFeatCountBonus',
        'levels.Fighter', '+=', '1 + Math.floor(source / 2)'
      );

    } else if(klass == 'Monk') {

      baseAttack = DndCharacter.ATTACK_BONUS_AVERAGE;
      features = [
        1, 'Flurry Of Blows', 1, 'Improved Unarmed Strike', 2, 'Evasion',
        3, 'Fast Movement', 3, 'Still Mind', 4, 'Ki Strike', 4, 'Slow Fall',
        5, 'Purity Of Body', 7, 'Wholeness Of Body', 9, 'Improved Evasion',
        11, 'Diamond Body', 11, 'Greater Flurry', 12, 'Abundant Step',
        13, 'Diamond Soul', 15, 'Quivering Palm', 17, 'Timeless Body',
        17, 'Tongue Of The Sun And Moon', 19, 'Empty Body', 20, 'Perfect Self'
      ];
      hitDie = 8;
      notes = [
        'featureNotes.timelessBodyFeature', 'No aging penalties',
        'featureNotes.tongueOfTheSunAndMoonFeature', 'Speak w/any creature',
        'magicNotes.abundantStepFeature',
          '<i>Dimension Door</i> at level %V 1/day',
        'magicNotes.emptyBodyFeature', 'Ethereal %V rounds/day',
        'magicNotes.wholenessOfBodyFeature', 'Heal %V damage to self/day',
        'meleeNotes.flurryOfBlowsFeature', 'Take %V penalty for extra attack',
        'meleeNotes.greaterFlurryFeature', 'Extra attack',
        'meleeNotes.kiStrikeFeature', 'Treat unarmed attacks as magic weapons',
        'meleeNotes.perfectSelfFeature',
          'Ignore first 10 points of non-magical damage',
        'meleeNotes.quiveringPalmFeature',
          'Foe makes DC %V Fortitude save or dies 1/week',
        'saveNotes.diamondBodyFeature', 'Immune to poison',
        'saveNotes.diamondSoulFeature', 'DC %V spell resistance',
        'saveNotes.evasionFeature', 'Save yields no damage instead of 1/2',
        'saveNotes.perfectSelfFeature', 'Treat as outsider for magic saves',
        'saveNotes.purityOfBodyFeature', 'Immune to disease',
        'saveNotes.slowFallFeature',
          'Subtract %V ft from falling distance damage',
        'saveNotes.stillMindFeature', '+2 vs. enchantments'
      ];
      profArmor = DndCharacter.ARMOR_PROFICIENCY_NONE;
      profShield = DndCharacter.SHIELD_PROFICIENCY_NONE;
      profWeapon = DndCharacter.WEAPON_PROFICIENCY_NONE;
      saveFortitude = DndCharacter.SAVE_BONUS_GOOD;
      saveReflex = DndCharacter.SAVE_BONUS_GOOD;
      saveWill = DndCharacter.SAVE_BONUS_GOOD;
      skillPoints = 4;
      skills = [
        'Balance', 'Climb', 'Concentration', 'Diplomacy', 'Escape Artist',
        'Hide', 'Jump', 'Knowledge (Arcana)', 'Knowledge (Religion)', 'Listen',
        'Move Silently', 'Perform (Act)', 'Perform (Comedy)',
        'Perform (Dance)', 'Perform (Keyboard)', 'Perform (Oratory)',
        'Perform (Percussion)', 'Perform (Sing)', 'Perform (String)',
        'Perform (Wind)', 'Sense Motive', 'Spot', 'Swim', 'Tumble'
      ];
      ScribeCustomRules('armorClass',
        'meleeNotes.classArmorClassAdjustment', '+', null,
        'meleeNotes.wisdomArmorClassAdjustment', '+', null
      );
      ScribeCustomRules('featureNotes.classFeatCountBonus',
        'levels.Monk', '+=', 'source < 2 ? 1 : source < 6 ? 2 : 3'
      );
      ScribeCustomRules('magicNotes.abundantStepFeature',
        'levels.Monk', '+=', 'Math.floor(source / 2)'
      );
      ScribeCustomRules
        ('magicNotes.emptyBodyFeature', 'levels.Monk', '+=', null);
      ScribeCustomRules('meleeNotes.classArmorClassAdjustment',
        'levels.Monk', '+=', 'Math.floor(source / 5)'
      );
      ScribeCustomRules('meleeNotes.fastMovementFeature',
        'levels.Monk', '+=', '10 * Math.floor(source / 3)'
      );
      ScribeCustomRules('meleeNotes.flurryOfBlowsFeature',
        'levels.Monk', '=', 'source < 5 ? -2 : source < 9 ? -1 : 0'
      );
      ScribeCustomRules('meleeNotes.quiveringPalmFeature',
        'levels.Monk', '+=', '10 + Math.floor(source / 2)',
        'wisdomModifier', '+', null
      );
      ScribeCustomRules
        ('magicNotes.wholenessOfBodyFeature', 'levels.Monk', '+=', '2*source');
      ScribeCustomRules('meleeNotes.wisdomArmorClassAdjustment',
        'levels.Monk', '?', null,
        'wisdomModifier', '+=', 'source <= 0 ? 0 : source'
      );
      ScribeCustomRules
        ('saveNotes.diamondSoulFeature', 'levels.Monk', '+=', '10 + source');
      ScribeCustomRules('saveNotes.slowFallFeature',
        'levels.Monk', '=', 'source < 20 ? Math.floor(source / 2) * 10 : "all"'
      );
      ScribeCustomRules('unarmedDamageMedium',
        'levels.Monk', '=',
          'source < 12 ? ("d" + (6 + Math.floor(source / 4) * 2)) : ' +
          '              ("2d" + (6 + Math.floor((source - 12) / 4) * 2))'
      );

    } else if(klass == 'Paladin') {

      baseAttack = DndCharacter.ATTACK_BONUS_GOOD;
      features = [
        1, 'Aura Of Good', 1, 'Detect Evil', 1, 'Smite Evil',
        2, 'Divine Grace', 2, 'Lay On Hands', 3, 'Aura Of Courage',
        3, 'Divine Health', 4, 'Turn Undead', 5, 'Special Mount',
        6, 'Remove Disease'
      ];
      hitDie = 10;
      notes = [
        'featureNotes.specialMountFeature', 'Magical mount w/special abilities',
        'magicNotes.auraOfGoodFeature', 'Visible to <i>Detect Good</i>',
        'magicNotes.detectEvilFeature', '<i>Detect Evil</i> at will',
        'magicNotes.layOnHandsFeature', 'Harm undead or heal %V HP/day',
        'magicNotes.removeDiseaseFeature', '<i>Remove Disease</i> %V/week',
        'meleeNotes.smiteEvilFeature',
          '%V/day add conMod to attack, paladin level to damage vs. evil',
        'meleeNotes.turnUndeadFeature',
          'Turn (good) or rebuke (evil) undead creatures',
        'saveNotes.auraOfCourageFeature',
          'Immune fear; +4 to allies w/in 30 ft',
        'saveNotes.divineGraceFeature', 'Add %V to saves',
        'saveNotes.divineHealthFeature', 'Immune to disease'
      ];
      profArmor = DndCharacter.ARMOR_PROFICIENCY_HEAVY;
      profShield = DndCharacter.SHIELD_PROFICIENCY_HEAVY;
      profWeapon = DndCharacter.WEAPON_PROFICIENCY_MARTIAL;
      saveFortitude = DndCharacter.SAVE_BONUS_GOOD;
      saveReflex = DndCharacter.SAVE_BONUS_POOR;
      saveWill = DndCharacter.SAVE_BONUS_POOR;
      skillPoints = 2;
      skills = [
        'Concentration', 'Diplomacy', 'Handle Animal', 'Heal',
        'Knowledge (Nobility)', 'Knowledge (Religion)', 'Ride', 'Sense Motive'
      ];
      ScribeCustomRules('casterLevelDivine',
        'spellsPerDayLevels.Paladin', '^=',
          'source >= 4 ? Math.floor((source - 2) / 2) : null'
      );
      ScribeCustomRules('magicNotes.layOnHandsFeature',
        'levels.Paladin', '+=', null,
        'charismaModifier', '*', null
      );
      ScribeCustomRules('magicNotes.removeDiseaseFeature',
        'levels.Paladin', '+=', 'Math.floor((source - 3) / 3)'
      );
      ScribeCustomRules('meleeNotes.smiteEvilFeature',
        'levels.Paladin', '=', '1 + Math.floor(source / 5)'
      );
      ScribeCustomRules
        ('saveNotes.divineGraceFeature', 'charismaModifier', '=', null);
      ScribeCustomRules
        ('saveFortitude', 'saveNotes.divineGraceFeature', '+', null);
      ScribeCustomRules
        ('saveReflex', 'saveNotes.divineGraceFeature', '+', null);
      ScribeCustomRules('saveWill', 'saveNotes.divineGraceFeature', '+', null);
      for(var j = 1; j <= 4; j++) {
        none = 3 * (j - 1) + (j == 1 ? 0 : 1);
        var n0 = j <= 2 ? 2 : 1;
        var n1 = 8 - j + (j == 1 ? 1 : 0);
        var n2 = 5 - j;
        ScribeCustomRules('spellsPerDay.P' + j,
          'spellsPerDayLevels.Paladin', '=',
            'source<=' + none + ' ? null : source<=' + (none+n0) + ' ? 0 : ' +
            'source<=' + (none + n0 + n1) + ' ? 1 : ' +
            'source<=' + (none + n0 + n1 + n2) + ' ? 2 : 3',
          'wisdomModifier', '+',
             'source>=' + j + ' ? Math.floor((source + ' + (4-j) + ')/4) : null'
        );
        ScribeCustomRules('maxSpellLevelDivine', 'spellsPerDay.P' + j, '^=', j);
      }
      ScribeCustomRules
        ('spellsPerDayLevels.Paladin', 'levels.Paladin', '=', 'source - 3');
      ScribeCustomRules
        ('turningLevel', 'levels.Paladin', '+=', 'source>3 ? source-3 : null');

    } else if(klass == 'Ranger') {

/* TODO
  DndCharacter.LoadClassFeatureRules(
    r, 'Ranger', 'featureNotes.combatStyle(Archery)Features',
    [2, 'Rapid Shot', 6, 'Manyshot', 11, 'Improved Precise Shot']
  );
  DndCharacter.LoadClassFeatureRules(
    r, 'Ranger', 'featureNotes.combatStyle(TwoWeaponCombat)Features',
    [2, 'Two Weapon Fighting', 6, 'Improved Two Weapon Fighting',
     11, 'Greater Two Weapon Fighting']
  );
  r.AddRules('featureNotes.combatStyle(Archery)Features',
    'features.Combat Style (Archery)', '?', null,
    'armorWeightClass', '?', 'source == "Light"'
  );
  r.AddRules('featureNotes.combatStyle(TwoWeaponCombat)Features',
    'features.Combat Style (Two Weapon Combat)', '?', null,
    'armorWeightClass', '?', 'source == "Light"'
  );
  Evasion only if unencumbered
*/
      baseAttack = DndCharacter.ATTACK_BONUS_GOOD;
      features = [
        1, 'Favored Enemy', 1, 'Track', 1, 'Wild Empathy', 3, 'Endurance',
        4, 'Animal Companion', 7, 'Woodland Stride', 8, 'Swift Tracker',
        9, 'Evasion', 13, 'Camouflage', 17, 'Hide In Plain Sight'
      ];
      hitDie = 8;
      notes = [
        'featureNotes.animalCompanionFeature', 'Special bond/abilities',
        'featureNotes.woodlandStrideFeature',
          'Normal movement through undergrowth',
        'meleeNotes.favoredEnemyFeature',
          '+2 or more damage vs. %V type(s) of creatures',
        'saveNotes.evasionFeature', 'Save yields no damage instead of 1/2',
        'skillNotes.camouflageFeature', 'Hide in any natural terrain',
        'skillNotes.favoredEnemyFeature',
          '+2 or more vs. %V type(s) of creatures on Bluff/Listen/Sense Motive/Spot/Survival',
        'skillNotes.hideInPlainSightFeature', 'Hide even when observed',
        'skillNotes.swiftTrackerFeature', 'Track at full speed',
        'skillNotes.wildEmpathyFeature', '+%V Diplomacy check with animals'
      ];
      profArmor = DndCharacter.ARMOR_PROFICIENCY_LIGHT;
      profShield = DndCharacter.SHIELD_PROFICIENCY_HEAVY;
      profWeapon = DndCharacter.WEAPON_PROFICIENCY_MARTIAL;
      saveFortitude = DndCharacter.SAVE_BONUS_GOOD;
      saveReflex = DndCharacter.SAVE_BONUS_GOOD;
      saveWill = DndCharacter.SAVE_BONUS_POOR;
      skillPoints = 6;
      skills = [
        'Climb', 'Concentration', 'Handle Animal', 'Heal', 'Hide', 'Jump',
        'Knowledge (Dungeoneering)', 'Knowledge (Geography)',
        'Knowledge (Nature)', 'Listen', 'Move Silently', 'Ride', 'Search',
        'Spot', 'Survival', 'Swim', 'Use Rope'
      ];
      ScribeCustomRules('casterLevelDivine',
        'spellsPerDayLevels.Ranger', '^=',
          'source >= 4 ? Math.floor((source - 2) / 2) : null'
      );
      ScribeCustomRules('featureNotes.classFeatCountBonus',
        'levels.Ranger', '+=', 'source >= 2 ? 1 : null'
      );
      ScribeCustomRules('meleeNotes.favoredEnemyFeature',
        'levels.Ranger', '+=', '1 + Math.floor(source / 5)'
      );
      ScribeCustomRules('skillNotes.favoredEnemyFeature',
        'levels.Ranger', '+=', '1 + Math.floor(source / 5)'
      );
      ScribeCustomRules('skillNotes.wildEmpathyFeature',
        'levels.Ranger', '+=', null,
        'charismaModifier', '+', null
      );
      for(var j = 1; j <= 4; j++) {
        var none = 3 * (j - 1) + (j == 1 ? 0 : 1);
        var n0 = j <= 2 ? 2 : 1;
        var n1 = 8 - j + (j == 1 ? 1 : 0);
        var n2 = 5 - j;
        ScribeCustomRules('spellsPerDay.R' + j,
          'spellsPerDayLevels.Ranger', '=',
            'source<=' + none + ' ? null : source<=' + (none+n0) + ' ? 0 : ' +
            'source<=' + (none + n0 + n1) + ' ? 1 : ' +
            'source<=' + (none + n0 + n1 + n2) + ' ? 2 : 3',
          'wisdomModifier', '+',
             'source>=' + j + ' ? Math.floor((source + ' + (4-j) + ')/4) : null'
        );
        ScribeCustomRules('maxSpellLevelDivine', 'spellsPerDay.R' + j, '^=', j);
      }
      ScribeCustomRules
        ('spellsPerDayLevels.Ranger', 'levels.Ranger', '=', 'source - 3');

    } else if(klass == 'Rogue') {

      baseAttack = DndCharacter.ATTACK_BONUS_AVERAGE;
      features = [
        1, 'Sneak Attack', 1, 'Trapfinding', 2, 'Evasion', 3, 'Trap Sense',
        4, 'Uncanny Dodge', 8, 'Improved Uncanny Dodge'
      ];
      hitDie = 6;
      notes = [
        'meleeNotes.sneakAttackFeature',
          '%Vd6 extra damage when surprising or flanking',
        'meleeNotes.uncannyDodgeFeature',
          'Always adds dexterity modifier to AC',
        'meleeNotes.improvedUncannyDodgeFeature',
          'Flanked only by rogue four levels higher',
        'saveNotes.evasionFeature', 'Save yields no damage instead of 1/2',
        'saveNotes.trapSenseFeature', '+%V Reflex and AC vs. traps',
        'skillNotes.trapfindingFeature', 'Search to find/remove DC 20+ traps'
      ];
      profArmor = DndCharacter.ARMOR_PROFICIENCY_LIGHT;
      profShield = DndCharacter.SHIELD_PROFICIENCY_NONE;
      profWeapon = DndCharacter.WEAPON_PROFICIENCY_SIMPLE;
      saveFortitude = DndCharacter.SAVE_BONUS_POOR;
      saveReflex = DndCharacter.SAVE_BONUS_GOOD;
      saveWill = DndCharacter.SAVE_BONUS_POOR;
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
      ScribeCustomRules('featureNotes.classFeatCountBonus',
        'levels.Rogue', '+=', 'source>=10 ? Math.floor((source-7)/3) : null'
      );
      ScribeCustomRules('meleeNotes.sneakAttackFeature',
        'levels.Rogue', '+=', 'Math.floor((source + 1) / 2)'
      );
      ScribeCustomRules('saveNotes.trapSenseFeature',
        'levels.Rogue', '+=', 'source >= 3 ? Math.floor(source / 3) : null'
      );

    } else if(klass == 'Sorcerer') {

      baseAttack = DndCharacter.ATTACK_BONUS_POOR;
      features = [1, 'Summon Familiar'];
      hitDie = 4;
      notes = [
        'magicNotes.summonFamiliarFeature', 'Special bond/abilities'
      ];
      profArmor = DndCharacter.ARMOR_PROFICIENCY_NONE;
      profShield = DndCharacter.SHIELD_PROFICIENCY_NONE;
      profWeapon = DndCharacter.WEAPON_PROFICIENCY_SIMPLE;
      saveFortitude = DndCharacter.SAVE_BONUS_POOR;
      saveReflex = DndCharacter.SAVE_BONUS_POOR;
      saveWill = DndCharacter.SAVE_BONUS_GOOD;
      skillPoints = 2;
      skills = [
        'Bluff', 'Concentration', 'Knowledge (Arcana)', 'Spellcraft'
      ];
      ScribeCustomRules
        ('casterLevelArcane', 'spellsPerDayLevels.Sorcerer', '^=', null);
      ScribeCustomRules('spellsPerDay.S0',
        'spellsPerDayLevels.Sorcerer', '=', 'source == 1 ? 5 : 6'
      );
      for(var j = 1; j <= 9; j++) {
        var none = (j - 1) * 2 + (j == 1 ? 0 : 1);
        ScribeCustomRules('spellsPerDay.S' + j,
          'spellsPerDayLevels.Sorcerer', '=',
             'source<=' + none + ' ? null : source>=' + (none + 5) + ' ? 6 : ' +
             '(source - ' + none + ' + 2)',
          'charismaModifier', '+',
             'source>=' + j + ' ? Math.floor((source+' + (4-j) + ')/4) : null'
        );
        ScribeCustomRules('maxSpellLevelArcane', 'spellsPerDay.S' + j, '^=', j);
      }
      ScribeCustomRules
        ('spellsPerDayLevels.Sorcerer', 'levels.Sorcerer', '=', null);

    } else if(klass == 'Wizard') {

      baseAttack = DndCharacter.ATTACK_BONUS_POOR;
      features = [1, 'Scribe Scroll', 1, 'Summon Familiar'];
      hitDie = 4;
      notes = [
        'magicNotes.summonFamiliarFeature', 'Special bond/abilities'
      ];
      profArmor = DndCharacter.ARMOR_PROFICIENCY_NONE;
      profShield = DndCharacter.SHIELD_PROFICIENCY_NONE;
      profWeapon = DndCharacter.WEAPON_PROFICIENCY_NONE;
      saveFortitude = DndCharacter.SAVE_BONUS_POOR;
      saveReflex = DndCharacter.SAVE_BONUS_POOR;
      saveWill = DndCharacter.SAVE_BONUS_GOOD;
      skillPoints = 2;
      skills = [
        'Concentration', 'Decipher Script', 'Knowledge (Arcana)',
        'Knowledge (Dungeoneering)', 'Knowledge (Engineering)',
        'Knowledge (Geography)', 'Knowledge (History)', 'Knowledge (Local)',
        'Knowledge (Nature)', 'Knowledge (Nobility)', 'Knowledge (Planes)',
        'Knowledge (Religion)', 'Spellcraft'
      ];
      ScribeCustomRules
        ('casterLevelArcane', 'spellsPerDayLevels.Wizard', '^=', null);
      ScribeCustomRules('featureNotes.classFeatCountBonus',
        'levels.Wizard', '+=', 'source >= 5 ? Math.floor(source / 5) : null'
      );
      ScribeCustomRules('spellsPerDay.W0',
        'spellsPerDayLevels.Wizard', '=', 'source == 1 ? 3 : 4',
        'magicNotes.wizardSpecialization', '+', '1'
      );
      for(var j = 1; j <= 9; j++) {
        var none = (j - 1) * 2;
        ScribeCustomRules('spellsPerDay.W' + j,
          'spellsPerDayLevels.Wizard', '=',
             'source<=' + none + ' ? null : source<=' + (none+1) + ' ? 1 : ' +
             'source<=' + (none+3) + ' ? 2 : source<=' + (none+6) + ' ? 3 : 4',
          'intelligenceModifier', '+',
             'source>=' + j + ' ? Math.floor((source+' + (4-j) + ')/4) : null',
          'magicNotes.wizardSpecialization', '+', '1'
        );
        ScribeCustomRules('maxSpellLevelArcane', 'spellsPerDay.W' + j, '^=', j);
      }
      ScribeCustomRules
        ('spellsPerDayLevels.Wizard', 'levels.Wizard', '=', null);

    } else
      continue;

    ScribeCustomClass
      (klass, hitDie, skillPoints, baseAttack, saveFortitude, saveReflex,
       saveWill, profArmor, profShield, profWeapon, skills, features,
       prerequisites);
    if(notes != null)
      ScribeCustomNotes(notes);

  }

  ScribeCustomChoices('domains',
    'Air', 'Animal', 'Chaos', 'Death', 'Destruction', 'Earth', 'Evil', 'Fire',
    'Good', 'Healing', 'Knowledge', 'Law', 'Luck', 'Magic', 'Plant',
    'Protection', 'Strength', 'Sun', 'Travel', 'Trickery', 'War', 'Water'
  );
  ScribeCustomRules
    ('featCount', 'featureNotes.classFeatCountBonus', '+', null);

}

PH35.CombatRules = function() {

  ScribeCustomRules('armorClass',
    null, '=', '10',
    'armor', '+', 'DndCharacter.armorsArmorClassBonuses[source]',
    'shield', '+', 'source=="None" ? null : ' +
                   'source=="Tower" ? 4 : source.indexOf("Light") >= 0 ? 1 : 2'
  );
  ScribeCustomRules
    ('armorProficiencyLevel', null, '=', DndCharacter.ARMOR_PROFICIENCY_NONE);
  ScribeCustomRules('baseAttack', null, '=', '0');
  ScribeCustomRules('meleeAttack', 'baseAttack', '=', null);
  ScribeCustomRules('rangedAttack', 'baseAttack', '=', null);
  ScribeCustomRules('saveReflex', null, '=', '0');
  ScribeCustomRules('saveFortitude', null, '=', '0');
  ScribeCustomRules('saveWill', null, '=', '0');
  ScribeCustomRules
    ('shieldProficiencyLevel', null, '=', DndCharacter.SHIELD_PROFICIENCY_NONE);
  ScribeCustomRules('turningBase', 'turningLevel', '=', null)
  ScribeCustomRules('turningDamageModifier', 'turningLevel', '=', null);
  ScribeCustomRules('turningFrequency', 'turningLevel', '=', '3');
  ScribeCustomRules('turningMax',
    'turningBase', '=', 'Math.floor(source + 10 / 3)',
    'turningLevel', 'v', 'source + 4'
  );
  ScribeCustomRules('turningMin',
    'turningBase', '=', 'Math.floor(source - 3)',
    'turningLevel', '^', 'source - 4'
  );
  ScribeCustomRules('unarmedDamageMedium', null, '=', '"d3"');
  ScribeCustomRules('unarmedDamage',
    'unarmedDamageMedium', '=', null,
    'unarmedDamageSmall', '=', null
  );
  ScribeCustomRules('unarmedDamageSmall',
    'features.Small', '?', null,
    'unarmedDamageMedium', '=', 'DndCharacter.weaponsSmallDamage[source]'
  );
  ScribeCustomRules
    ('weaponProficiencyLevel', null, '=', DndCharacter.WEAPON_PROFICIENCY_NONE);

}

PH35.DescriptionRules = function() {
  ScribeCustomChoices('alignments', PH35.ALIGNMENTS);
  for(var i = 0; i < PH35.DEITIES.length; i++) {
    var pieces = PH35.DEITIES[i].split(/:/);
    ScribeCustomChoices('deities', pieces[0], pieces[1]==null ? '' : pieces[1]);
  }
  ScribeCustomChoices('deities', 'None', '');
  ScribeCustomChoices('genders', 'Female', 'Male');
}

PH35.EquipmentRules = function() {
  ScribeCustomChoices('goodies', PH35.GOODIES);
  for(var i = 0; i < PH35.WEAPONS.length; i++) {
    var pieces = PH35.WEAPONS[i].split(/:/);
    if(pieces[1] != null)
      ScribeCustomChoices('weapons', pieces[0], pieces[1]);
  }
  ScribeCustomRules('runSpeedMultiplier',
    'armorWeightClass', '=', 'source == "Heavy" ? 3 : null'
  );
}

PH35.FeatRules = function() {

  var notes = [
    'featureNotes.leadershipFeature', 'Attract followers',
    'magicNotes.augmentSummoningFeature',
      'Summoned creatures +4 strength/constitution',
    'magicNotes.brewPotionFeature', 'Create potion for up to 3rd level spell',
    'magicNotes.craftMagicArmsAndArmorFeature',
      'Create magic weapon/armor/shield',
    'magicNotes.craftRodFeature', 'Create magic rod',
    'magicNotes.craftStaffFeature', 'Create magic staff',
    'magicNotes.craftWandFeature', 'Create wand for up to 4th level spell',
    'magicNotes.craftWondrousItemFeature', 'Create miscellaneous magic item',
    'magicNotes.empowerSpellFeature', 'x1.5 designated spell variable effects',
    'magicNotes.enlargeSpellFeature', 'x2 designated spell range',
    'magicNotes.extendSpellFeature', 'x2 designated spell duration',
    'magicNotes.eschewMaterialsFeature', 'Cast spells w/out materials',
    'magicNotes.forgeRingFeature', 'Create magic ring',
    'magicNotes.greaterSpellPenetrationFeature',
      '+2 caster level vs. resistance checks',
    'magicNotes.heightenSpellFeature', 'Increase designated spell level',
    'magicNotes.improvedCounterspellFeature', 'Counter w/higher-level spell',
    'magicNotes.maximizeSpellFeature',
      'Maximize all designated spell variable effects',
    'magicNotes.naturalSpellFeature', 'Cast spell during <i>Wild Shape</i>',
    'magicNotes.quickenSpellFeature', 'Cast spell as free action 1/round',
    'magicNotes.scribeScrollFeature', 'Create scroll of any known spell',
    'magicNotes.silentSpellFeature', 'Cast designated spell w/out speech',
    'magicNotes.spellMasteryFeature', 'No book needed for designated spells',
    'magicNotes.spellPenetrationFeature',
      '+2 caster level vs. resistance checks',
    'magicNotes.stillSpellFeature', 'Cast designated spell w/out movement',
    'magicNotes.widenSpellFeature', 'Double area of affect',
    'meleeNotes.blindFightFeature',
      'Reroll concealed miss/no bonus to invisible foe/half penalty for impared vision',
    'meleeNotes.cleaveFeature', 'Extra attack when foe drops',
    'meleeNotes.combatExpertiseFeature', 'Up to -5 attack/+5 AC',
    'meleeNotes.combatReflexesFeature', 'Add dexterity mod to AOO count',
    'meleeNotes.cripplingStrikeFeature',
      '2 points strength damage from sneak attack',
    'meleeNotes.defensiveRollFeature' ,
      'DC damage Reflex save vs. lethal blow for half damage',
    'meleeNotes.deflectArrowsFeature', 'Deflect ranged 1/round',
    'meleeNotes.diehardFeature', 'Remain conscious w/HP <= 0',
    'meleeNotes.dodgeFeature', '+1 AC vs. designated foe',
    'meleeNotes.extraTurningFeature', '+4/day',
    'meleeNotes.farShotFeature', 'x1.5 projectile range; x2 thrown',
    'meleeNotes.greatCleaveFeature', 'Cleave w/out limit',
    'meleeNotes.greaterTwoWeaponFightingFeature', 'Second off-hand -10 attack',
    'meleeNotes.improvedBullRushFeature','Bull rush w/out foe AOO; +4 strength',
    'meleeNotes.improvedDisarmFeature', 'Disarm w/out foe AOO; +4 attack',
    'meleeNotes.improvedFeintFeature', 'Bluff check to feint as move action',
    'meleeNotes.improvedGrappleFeature', 'Grapple w/out foe AOO; +4 grapple',
    'meleeNotes.improvedInitiativeFeature', '+4 initiative',
    'meleeNotes.improvedOverrunFeature', 'Foe cannot avoid; +4 strength',
    'meleeNotes.improvedPreciseShotFeature',
      'No foe bonus for partial concealment; attack grappling w/out penalty',
    'meleeNotes.improvedShieldBashFeature', 'Shield bash w/out AC penalty',
    'meleeNotes.improvedSunderFeature', 'Sunder w/out foe AOO; +4 attack',
    'meleeNotes.improvedTripFeature',
      'Trip w/out foe AOO; +4 strength; attack immediately after trip',
    'meleeNotes.improvedTurningFeature', '+1 turning level',
    'meleeNotes.improvedTwoWeaponFightingFeature', 'Additional -5 attack',
    'meleeNotes.improvedUnarmedStrikeFeature', 'Unarmed attack w/out foe AOO',
    'meleeNotes.manyshotFeature', 'Fire multiple arrows simultaneously',
    'meleeNotes.mobilityFeature', '+4 AC vs. movement AOO',
    'meleeNotes.mountedArcheryFeature', 'x.5 mounted ranged penalty',
    'meleeNotes.mountedCombatFeature',
      'Ride skill save vs. mount damage 1/round',
    'meleeNotes.opportunistFeature', 'AOO vs. any struck foe',
    'meleeNotes.pointBlankShotFeature', '+1 ranged attack/damage w/in 30 ft',
    'meleeNotes.powerAttackFeature', 'Attack base -attack/+damage',
    'meleeNotes.preciseShotFeature', 'Shoot into melee w/out penalty',
    'meleeNotes.quickDrawFeature', 'Draw weapon as free action',
    'meleeNotes.rapidReloadFeature',
      'Reload light/heavy crossbow as free/move action',
    'meleeNotes.rapidShotFeature', 'Normal and extra ranged -2 attacks',
    'meleeNotes.rideByAttackFeature', 'Move before and after mounted attack',
    'meleeNotes.runFeature', 'Add 1 to speed multiplier',
    'meleeNotes.shotOnTheRunFeature', 'Move before and after ranged attack',
    'meleeNotes.snatchArrowsFeature', 'Catch ranged weapons',
    'meleeNotes.spiritedChargeFeature',
      'x2 damage (x3 lance) from mounted charge',
    'meleeNotes.springAttackFeature', 'Move before and after melee attack',
    'meleeNotes.stunningFistFeature',
      'Foe %V Fortitude save or stunned 1/4 level/day',
    'meleeNotes.toughnessFeature', '+3 HP',
    'meleeNotes.trampleFeature','Mounted overrun unavoidable/bonus hoof attack',
    'meleeNotes.twoWeaponDefenseFeature', '+1 AC w/two weapons',
    'meleeNotes.twoWeaponFightingFeature',
      'Reduce on-hand penalty by 2/off-hand by 6',
    'meleeNotes.weaponFinesseFeature',
      'Light weapons use dexterity mod instead of strength mod on attacks',
    'meleeNotes.weaponFocus(HeavyFlail)Feature', '+1 attack',
    'meleeNotes.weaponFocus(LightFlail)Feature', '+1 attack',
    'meleeNotes.weaponFocus(Longsword)Feature', '+1 attack',
    'meleeNotes.weaponFocus(Morningstar)Feature', '+1 attack',
    'meleeNotes.weaponFocus(Spear)Feature', '+1 attack',
    'meleeNotes.whirlwindAttackFeature', 'Attack all foes w/in reach',
    'saveNotes.enduranceFeature', '+4 extended physical action',
    'saveNotes.greatFortitudeFeature', '+2 Fortitude',
    'saveNotes.improvedEvasionFeature', 'Failed save yields 1/2 damage',
    'saveNotes.ironWillFeature', '+2 Will',
    'saveNotes.lightningReflexesFeature', '+2 Reflex',
    'saveNotes.slipperyMindFeature', 'Second save vs. enchantments',
    'skillNotes.acrobaticFeature', '+2 Jump/Tumble',
    'skillNotes.agileFeature', '+2 Balance/Escape Artist',
    'skillNotes.alertnessFeature', '+2 Listen/Spot',
    'skillNotes.animalAffinityFeature', '+2 Handle Animal/Ride',
    'skillNotes.athleticFeature', '+2 Climb/Swim',
    'skillNotes.combatCastingFeature',
      '+4 Concentration when casting on defensive',
    'skillNotes.deceitfulFeature', '+2 Disguise/Forgery',
    'skillNotes.deftHandsFeature', '+2 Sleight Of Hand/Use Rope',
    'skillNotes.diligentFeature', '+2 Appraise/Decipher Script',
    'skillNotes.investigatorFeature', '+2 Gather Information/Search',
    'skillNotes.magicalAptitudeFeature', '+2 Spellcraft/Use Magic Device',
    'skillNotes.negotiatorFeature', '+2 Diplomacy/Sense Motive',
    'skillNotes.nimbleFingersFeature', '+2 Disable Device/Open Lock',
    'skillNotes.persuasiveFeature', '+2 Bluff/Intimidate',
    'skillNotes.selfSufficientFeature', '+2 Heal/Survival',
    'skillNotes.skillMasteryFeature', 'Never distracted from designated skills',
    'skillNotes.stealthyFeature', '+2 Hide/Move Silently',
    'skillNotes.trackFeature', 'Survival to follow creatures at 1/2 speed'
  ];
  ScribeCustomNotes(notes);

  ScribeCustomChoices('feats', PH35.FEATS);
  for(var i = 0; i < PH35.FEATS.length; i++) {
    ScribeCustomRules
      ('features.' + PH35.FEATS[i], 'feats.' + PH35.FEATS[i], '=', '1');
  }
  ScribeCustomRules('armorProficiency',
    'armorProficiencyLevel', '=',
      'source == ' + DndCharacter.ARMOR_PROFICIENCY_LIGHT + ' ? "Light" : ' +
      'source == ' + DndCharacter.ARMOR_PROFICIENCY_MEDIUM + ' ? "Medium" : ' +
      'source == ' + DndCharacter.ARMOR_PROFICIENCY_HEAVY + ' ? "Heavy" : ' +
      '"None"'
  );
  ScribeCustomRules('armorProficiencyLevel',
    'features.Armor Proficiency Light', '^',
      DndCharacter.ARMOR_PROFICIENCY_LIGHT,
    'features.Armor Proficiency Medium', '^',
      DndCharacter.ARMOR_PROFICIENCY_MEDIUM,
    'features.Armor Proficiency Heavy', '^',
      DndCharacter.ARMOR_PROFICIENCY_HEAVY
  );
  ScribeCustomRules('armorClass', 'meleeNotes.dodgeFeature', '+', '1');
  ScribeCustomRules('hitPoints',
    'meleeNotes.toughnessFeature', '+', '3 * source'
  );
  ScribeCustomRules('meleeNotes.dexterityMeleeAttackAdjustment',
    'meleeNotes.weaponFinesseFeature', '?', null,
    'dexterityModifier', '=', 'source == 0 ? null : source'
  );
  ScribeCustomRules
    ('initiative', 'meleeNotes.improvedInitiativeFeature', '+', '4');
  ScribeCustomRules('meleeNotes.strengthMeleeAttackAdjustment',
    'meleeNotes.weaponFinesseFeature', '*', '0'
  );
  ScribeCustomRules('meleeNotes.stunningFistFeature',
    'level', '=', '10 + Math.floor(source / 2)',
    'wisdomModifier', '+', null
  );
  ScribeCustomRules('runSpeedMultiplier', 'meleeNotes.runFeature', '+', '1');
  ScribeCustomRules
    ('saveFortitude', 'saveNotes.greatFortitudeFeature', '+', '2');
  ScribeCustomRules
    ('saveReflex', 'saveNotes.lightningReflexesFeature', '+', '2');
  ScribeCustomRules('saveWill', 'saveNotes.ironWillFeature', '+', '2');
  ScribeCustomRules('shieldProficiency',
    'shieldProficiencyLevel', '=',
      'source==' + DndCharacter.SHIELD_PROFICIENCY_LIGHT + '?"Light":' +
      'source==' + DndCharacter.SHIELD_PROFICIENCY_HEAVY + '?"Heavy":' +
      'source==' + DndCharacter.SHIELD_PROFICIENCY_TOWER + '?"Tower":' +
      '"None"'
  );
  ScribeCustomRules('shieldProficiencyLevel',
    'features.Shield Proficiency', '^', DndCharacter.SHIELD_PROFICIENCY_HEAVY,
    'features.Shield Proficiency Tower', '^',
      DndCharacter.SHIELD_PROFICIENCY_TOWER
  );
  ScribeCustomRules
    ('turningFrequency', 'meleeNotes.extraTurningFeature', '+', '4 * source');
  ScribeCustomRules
    ('turningLevel', 'meleeNotes.improvedTurningFeature', '+', '1');
  ScribeCustomRules('weaponProficiency',
    'weaponProficiencyLevel', '=',
      'source==' + DndCharacter.WEAPON_PROFICIENCY_SIMPLE + ' ? "Simple" : ' +
      'source==' + DndCharacter.WEAPON_PROFICIENCY_MARTIAL + ' ? "Martial" : ' +
      '"None"'
  );
  ScribeCustomRules('weaponProficiencyLevel',
    'features.Weapon Proficiency Simple', '^',
      DndCharacter.WEAPON_PROFICIENCY_SIMPLE
  );

}

PH35.MagicRules = function() {

  var notes = [
    'featureNotes.warDomain', 'Weapon Proficiency/Weapon Focus (%V)',
    'magicNotes.animalDomain', '<i>Speak With Animals</i> 1/Day',
    'magicNotes.arcaneSpellFailure', '%V%',
    'magicNotes.chaosDomain', '+1 caster level chaos spells',
    'magicNotes.deathDomain', '<i>Death Touch</i> 1/Day',
    'magicNotes.evilDomain', '+1 caster level evil spells',
    'magicNotes.goodDomain', '+1 caster level good spells',
    'magicNotes.healingDomain', '+1 caster level heal spells',
    'magicNotes.knowledgeDomain', '+1 caster level divination spells',
    'magicNotes.lawDomain', '+1 caster level law spells',
    'magicNotes.protectionDomain', 'Protective ward 1/day',
    'magicNotes.strengthDomain', 'Add level to strength 1 round/day',
    'magicNotes.travelDomain', '<i>Freedom of Movement</i> 1 round/level/day',
    'magicNotes.wizardSpecialization', 'Extra %V spell/day each spell level',
    'meleeNotes.airDomain', 'Turn earth/rebuke air',
    'meleeNotes.destructionDomain', 'Smite (+4 attack/+level damage) 1/day',
    'meleeNotes.earthDomain', 'Turn air/rebuke earth',
    'meleeNotes.fireDomain', 'Turn water/rebuke fire',
    'meleeNotes.plantDomain', 'Rebuke plants',
    'meleeNotes.sunDomain', 'Destroy turned undead 1/day',
    'meleeNotes.waterDomain', 'Turn fire/rebuke water',
    'saveNotes.luckDomain', 'Reroll 1/day',
    'skillNotes.animalDomain', 'Knowledge (Nature) is a class skill',
    'skillNotes.knowledgeDomain', 'All Knowledge skills are class skills',
    'skillNotes.magicDomain', 'Use Magic Device at level/2',
    'skillNotes.plantDomain', 'Knowledge (Nature) is a class skill',
    'skillNotes.travelDomain', 'Survival is a class skill',
    'skillNotes.trickeryDomain', 'Bluff/Disguise/Hide are class skills',
    'skillNotes.wizardSpecialization', '+2 Spellcraft (%V)'
  ];
  ScribeCustomNotes(notes);
  ScribeCustomChoices('schools',
    'Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation',
    'Illusion', 'Necromancy', 'Transmutation'
  );
  ScribeCustomRules('casterLevel',
    'casterLevelArcane', '^=', null,
    'casterLevelDivine', '^=', null
  );
  ScribeCustomRules
    ('classSkills.Knowledge (Nature)', 'skillNotes.animalDomain', '=', '1');
  ScribeCustomRules
    ('classSkills.Survival', 'skillNotes.travelDomain', '=', '1');
  ScribeCustomRules('featureNotes.warDomain',
    'deity', '=', 'DndCharacter.deitiesFavoredWeapons[source]'
  );
  ScribeCustomRules('features.Weapon Focus (Heavy Flail)',
    'featureNotes.warDomain', '=', 'source.indexOf("Heavy Flail")>=0? 1 : null'
  );
  ScribeCustomRules('features.Weapon Focus (Light Flail)',
    'featureNotes.warDomain', '=', 'source.indexOf("Light Flail")>=0 ? 1 : null'
  );
  ScribeCustomRules('features.Weapon Focus (Longsword)',
    'featureNotes.warDomain', '=', 'source.indexOf("Longsword") >= 0 ? 1 : null'
  );
  ScribeCustomRules('features.Weapon Focus (Morningstar)',
    'featureNotes.warDomain', '=', 'source.indexOf("Morningstar")>=0 ? 1 : null'
  );
  ScribeCustomRules('features.Weapon Focus (Spear)',
    'featureNotes.warDomain', '=', 'source.indexOf("Spear") >= 0 ? 1 : null'
  );
  for(var a in DndCharacter.skillsAbility)
    if(a.substring(0, 9) == "Knowledge")
      ScribeCustomRules
        ('classSkills.' + a, 'skillNotes.knowledgeDomain', '=', '1');
  ScribeCustomRules
    ('classSkills.Knowledge (Nature)', 'skillNotes.plantDomain', '=', '1');
  ScribeCustomRules('classSkills.Bluff', 'skillNotes.trickeryDomain', '=', '1');
  ScribeCustomRules
    ('classSkills.Disguise', 'skillNotes.trickeryDomain', '=', '1');
  ScribeCustomRules('classSkills.Hide', 'skillNotes.trickeryDomain', '=', '1');

}

PH35.RaceRules = function() {

  var features = null;
  var notes = null;

  for(var i = 0; i < PH35.RACES.length; i++) {

    var race = PH35.RACES[i];

    if(race == 'Dwarf') {

      features = [
        1, 'Darkvision', 1, 'Dodge Giants', 1, 'Dwarf Ability Adjustment',
        1, 'Dwarf Favored Enemy', 1, 'Hardiness', 1, 'Know Depth',
        1, 'Magic Resistance', 1, 'Slow', 1, 'Stability', 1, 'Stonecunning'
      ];
      notes = [
        'abilityNotes.dwarfAbilityAdjustmentFeature',
          '+2 constitution/-2 charisma',
        'featureNotes.darkvisionFeature', '60 ft b/w vision in darkness',
        'featureNotes.knowDepthFeature', 'Intuit approximate depth underground',
        'meleeNotes.dodgeGiantsFeature', '+4 AC vs. giant creatures',
        'meleeNotes.dwarfFavoredEnemyFeature',
          '+1 vs. bugbear/goblin/hobgoblin/orc',
        'saveNotes.hardinessFeature', '+2 vs. poison',
        'saveNotes.magicResistanceFeature', '+2 vs. spells',
        'saveNotes.stabilityFeature', '+4 vs. Bull Rush/Trip',
        'skillNotes.stonecunningFeature',
          '+2 Appraise/Craft/Search involving stone or metal'
      ];
      ScribeCustomRules('charisma',
        'abilityNotes.dwarfAbilityAdjustmentFeature', '+', '-2'
      );
      ScribeCustomRules('constitution',
        'abilityNotes.dwarfAbilityAdjustmentFeature', '+', '2'
      );
      ScribeCustomRules('meleeNotes.armorSpeedAdjustment',
        'race', '^', 'source == "Dwarf" ? 0 : null'
      );

    } else if(race == 'Elf') {

      features = [
        1, 'Elf Ability Adjustment', 1, 'Enchantment Resistance',
        1, 'Keen Senses', 1, 'Low Light Vision', 1, 'Sense Secret Doors'
      ];
      notes = [
        'abilityNotes.elfAbilityAdjustmentFeature',
          '+2 dexterity/-2 constitution',
        'featureNotes.lowLightVisionFeature',
          'Double normal distance in poor light',
        'featureNotes.senseSecretDoorsFeature',
          'Automatic Search when within 5 ft',
        'saveNotes.enchantmentResistanceFeature',
          '+2 vs. enchantments; immune sleep',
        'skillNotes.keenSensesFeature', '+2 Listen/Search/Spot'
      ];
      ScribeCustomRules('constitution',
        'abilityNotes.elfAbilityAdjustmentFeature', '+', '-2'
      );
      ScribeCustomRules('dexterity',
        'abilityNotes.elfAbilityAdjustmentFeature', '+', '2'
      );

    } else if(race == 'Gnome') {

      features = [
        1, 'Dodge Giants', 1, 'Gnome Ability Adjustment',
        1, 'Gnome Favored Enemy', 1, 'Gnome Spells', 1, 'Illusion Resistance',
        1, 'Keen Ears', 1, 'Keen Nose', 1, 'Low Light Vision', 1, 'Slow',               1, 'Small'
      ];
      notes = [
        'abilityNotes.gnomeAbilityAdjustmentFeature',
          '+2 constitution/-2 strength',
        'featureNotes.lowLightVisionFeature',
          'Double normal distance in poor light',
        'magicNotes.gnomeSpellsFeature',
          '<i>Dancing Lights</i>/<i>Ghost Sound</i>/<i>Prestidigitation</i>/' +
          '<i>Speak With Animals</i> 1/day',
        'meleeNotes.dodgeGiantsFeature', '+4 AC vs. giant creatures',
        'meleeNotes.gnomeFavoredEnemyFeature',
           '+1 vs. bugbear/goblin/hobgoblin/kobold',
        'saveNotes.illusionResistanceFeature', '+2 vs. illusions',
        'skillNotes.keenEarsFeature', '+2 Listen',
        'skillNotes.keenNoseFeature', '+2 Craft (Alchemy)'
      ];
      ScribeCustomRules('constitution',
        'abilityNotes.gnomeAbilityAdjustmentFeature', '+', '2'
      );
      ScribeCustomRules
        ('magicNotes.gnomeSpellsFeature', 'charisma', '?', 'source >= 10');
      ScribeCustomRules('strength',
        'abilityNotes.gnomeAbilityAdjustmentFeature', '+', '-2'
      );

    } else if(race == 'Half Elf') {

      features = [
          1, 'Alert Senses', 1, 'Enchantment Resistance',
          1, 'Low Light Vision', 1, 'Tolerance'
      ];
      notes = [
        'featureNotes.lowLightVisionFeature',
          'Double normal distance in poor light',
        'saveNotes.enchantmentResistanceFeature',
          '+2 vs. enchantments; immune sleep',
        'skillNotes.alertSensesFeature', '+1 Listen/Search/Spot',
        'skillNotes.toleranceFeature', '+2 Diplomacy/Gather Information'
      ];

    } else if(race == 'Half Orc') {

      features = [1, 'Darkvision', 1, 'Half Orc Ability Adjustment'];
      notes = [
        'abilityNotes.halfOrcAbilityAdjustmentFeature',
          '+2 strength/-2 intelligence/-2 charisma',
        'featureNotes.darkvisionFeature', '60 ft b/w vision in darkness',
      ];
      ScribeCustomRules('charisma',
        'abilityNotes.halfOrcAbilityAdjustmentFeature', '+', '-2'
      );
      ScribeCustomRules('intelligence',
        'abilityNotes.halfOrcAbilityAdjustmentFeature', '+', '-2'
      );
      ScribeCustomRules('strength',
        'abilityNotes.halfOrcAbilityAdjustmentFeature', '+', '2'
      );

    } else if(race == 'Halfling') {

      features = [
        1, 'Accurate', 1, 'Halfling Ability Adjustment', 1, 'Keen Ears',
        1, 'Lucky', 1, 'Slow', 1, 'Small', 1, 'Spry', 1, 'Unafraid'
      ];
      notes = [
        'abilityNotes.halflingAbilityAdjustmentFeature',
          '+2 dexterity/-2 strength',
        'meleeNotes.accurateFeature', '+1 attack with slings/thrown',
        'saveNotes.luckyFeature', '+1 all saves',
        'saveNotes.unafraidFeature', '+2 vs. fear',
        'skillNotes.keenEarsFeature', '+2 Listen',
        'skillNotes.spryFeature', '+2 Climb/Jump/Listen/Move Silently'
      ];
      ScribeCustomRules('dexterity',
        'abilityNotes.halflingAbilityAdjustmentFeature', '+', '2'
      );
      ScribeCustomRules('saveFortitude', 'saveNotes.luckyFeature', '+', '1');
      ScribeCustomRules('saveReflex', 'saveNotes.luckyFeature', '+', '1');
      ScribeCustomRules('saveWill', 'saveNotes.luckyFeature', '+', '1');
      ScribeCustomRules('strength',
        'abilityNotes.halflingAbilityAdjustmentFeature', '+', '-2'
      );

    } else if(race == 'Human') {

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

    ScribeCustomRace(race, features);
    if(notes != null)
      ScribeCustomNotes(notes);

  }

  /* General race-based rules that apply to multiple races. */
  notes = [
    'skillNotes.smallSkillAdjustment', '+4 Hide'
  ];
  ScribeCustomNotes(notes);

  ScribeCustomRules('armorClass',
    'meleeNotes.smallArmorClassAdjustment', '+', null
  );
  ScribeCustomRules('baseAttack',
    'meleeNotes.smallBaseAttackAdjustment', '+', null
  );
  ScribeCustomRules
    ('meleeNotes.smallArmorClassAdjustment', 'features.Small', '=', '1');
  ScribeCustomRules
    ('meleeNotes.smallBaseAttackAdjustment', 'features.Small', '=', '1');
  ScribeCustomRules
    ('skillNotes.smallSkillAdjustment', 'features.Small', '=', '1');
  ScribeCustomRules
    ('skills.Hide', 'skillNotes.smallSkillAdjustment', '+', '4');
  ScribeCustomRules('speed',
    null, '=', '30',
    'features.Slow', '+', '-10'
  );

}

PH35.SkillRules = function() {

  var abilityNames = {
    'cha':'charisma', 'con':'constitution', 'dex':'dexterity',
    'int':'intelligence', 'str':'strength', 'wis':'wisdom'
  };
  var notes = [
    'skillNotes.bluffSynergy', '+2 Diplomacy/Intimidate/Sleight Of Hand',
    'skillNotes.bluffSynergy2', '+2 Disguise (acting)',
    'skillNotes.decipherScriptSynergy', '+2 Use Magic Device (scrolls)',
    'skillNotes.escapeArtistSynergy', '+2 Use Rope (bindings)',
    'skillNotes.handleAnimalSynergy', '+2 Ride/Wild Empathy',
    'skillNotes.jumpSynergy', '+2 Tumble',
    'skillNotes.knowledge(Arcana)Synergy', '+2 Spellcraft',
    'skillNotes.knowledge(Dungeoneering)Synergy', '+2 Survival (underground)',
    'skillNotes.knowledge(Engineering)Synergy', '+2 Search (secret doors)',
    'skillNotes.knowledge(Geography)Synergy', '+2 Survival (lost/hazards)',
    'skillNotes.knowledge(History)Synergy', '+2 Bardic Knowledge',
    'skillNotes.knowledge(Local)Synergy', '+2 Gather Information',
    'skillNotes.knowledge(Nature)Synergy', '+2 Survival (outdoors)',
    'skillNotes.knowledge(Nobility)Synergy', '+2 Diplomacy',
    'skillNotes.knowledge(Planes)Synergy', '+2 Survival (other planes)',
    'skillNotes.knowledge(Religion)Synergy', '+2 Turning Check',
    'skillNotes.searchSynergy', '+2 Survival (tracking)',
    'skillNotes.senseMotiveSynergy', '+2 Diplomacy',
    'skillNotes.spellcraftSynergy', '+2 Use Magic Device (scroll)',
    'skillNotes.survivalSynergy', '+2 Knowledge (Nature)',
    'skillNotes.tumbleSynergy', '+2 Balance/Jump',
    'skillNotes.useMagicDeviceSynergy', '+2 Spellcraft (scrolls)',
    'skillNotes.useRopeSynergy', '+2 Climb (rope)/Escape Artist (rope)'
  ];
  ScribeCustomNotes(notes);
  ScribeCustomChoices('languages',
    'Abyssal', 'Aquan', 'Avian', 'Celestial', 'Common', 'Draconic', 'Druidic',
    'Dwarven', 'Elven', 'Giant', 'Gnoll', 'Gnome', 'Goblin', 'Halfling',
    'Ignan', 'Infernal', 'Orc', 'Sylvan', 'Terran', 'Undercommon'
  );

  ScribeCustomRules('languageCount', 'skills.Speak Language', '+', null);
  ScribeCustomRules('skillNotes.bardicKnowledgeFeature',
    'skillNotes.knowledge(History)Synergy', '+', '2'
  );
  ScribeCustomRules
    ('skillNotes.bluffSynergy2', 'skills.Bluff', '=', 'source >= 5 ? 1 : null');
  ScribeCustomRules('skillNotes.wildEmpathyFeature',
    'skillNotes.handleAnimalSynergy', '+', '2'
  );
  ScribeCustomRules('turningBase',
    'skillNotes.knowledge(Religion)Synergy', '+', '2/3'
  );
  for(var i = 0; i < PH35.SKILLS.length; i ++) {
    var pieces = PH35.SKILLS[i].split(/:/);
    var skill = pieces[0];
    var ability = pieces.length >= 2 ? pieces[1] : '';
    if(abilityNames[ability] != null)
      ability = abilityNames[ability];
    var trained = pieces.length >= 3 && pieces[2] == 'trained';
    ScribeCustomChoices
      ('skills', skill, ability + (trained ? ';trained' : ''));
    if(ability != '')
      ScribeCustomRules('skills.' + skill, ability + 'Modifier', '+', null);
  }

}
