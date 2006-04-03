/* $Id: SRD35.js,v 1.1 2006/04/03 03:46:01 Jim Exp $ */

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
  PH35AbilityRules();
  PH35RaceRules();
  PH35ClassRules();
  PH35FeatRules();
  PH35MeleeRules();
  PH35SkillRules();
  PH35MagicRules();
}

function PH35AbilityRules() {

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
  ScribeCustomRules('hitPoints',
    'meleeNotes.constitutionHitPointsAdjustment', '+', null
  );
  ScribeCustomRules('saveFortitude', 'constitutionModifier', '+', null);

  ScribeCustomRules('meleeNotes.dexterityArmorClassAdjustment',
    'dexterityModifier', '=', 'source == 0 ? null : source'
  );
  ScribeCustomRules('armorClass',
    'meleeNotes.dexterityArmorClassAdjustment', '+', null
  );
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
  ScribeCustomRules('skillPoints',
    'skillNotes.intelligenceSkillPointsAdjustment', '+', null
  );

  ScribeCustomRules('meleeNotes.strengthDamageAdjustment',
    'strengthModifier', '=', 'source == 0 ? null : source'
  );
  ScribeCustomRules('meleeNotes.strengthMeleeAttackAdjustment',
    'strengthModifier', '=', 'source == 0 ? null : source'
  );
  ScribeCustomRules('meleeAttack',
    'meleeNotes.strengthMeleeAttackAdjustment', '+', null
  );

  ScribeCustomRules('saveWill', 'wisdomModifier', '+', null);

  /* Computation of other attributes */
  ScribeCustomRules('languageCount', null, '=', '1');

  /* Effects of other attributes */

}

function PH35ClassRules() {

  var CLASSES = [
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

  for(var i = 0; i < CLASSES.length; i++) {

    var klass = CLASSES[i];
    var baseAttack, features, hitDie, notes, profArmor,
        profShield, profWeapon, saveFortitude, saveReflex, saveWill,
        skillPoints, skills;
    var prerequisites = null;  /* No base class has prerequisites */

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
        'saveNotes.indomitableWillFeature', '+4 Will save while raging'
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
          '+%V Knowledge checks on local history',
        'skillNotes.knowledge(History)Synergy', '+2 Bardic Knowledge'
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
      ScribeCustomRules('casterLevelArcane', 'levels.Bard', '^=', null);
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
        'intelligenceModifier', '+', null,
        'skillNotes.knowledge(History)Synergy', '+', '2'
      );
      ScribeCustomRules('spellsPerDay.B0',
        'spellsPerDayLevels.Bard', '=', 'source == 1 ? 2 : source < 14 ? 3 : 4'
      );
      for(var i = 1; i <= 6; i++) {
        var none = (i - 1) * 3 + (i == 1 ? 1 : 0);
        var n2 = i == 1 || i == 6 ? 1 : 2;
        var n3 = i == 6 ? 1 : ((6 - i) * 2);
        ScribeCustomRules('spellsPerDay.B' + i,
          'spellsPerDayLevels.Bard', '=',
             'source <= ' + none + ' ? null : ' +
             'source <= ' + (none + 1) + ' ? 0 : ' +
             'source <= ' + (none + 2) + ' ? 1 : ' +
             'source <= ' + (none + 2 + n2) + ' ? 2 : ' +
             'source <= ' + (none + 2 + n2 + n3) + ' ? 3 : 4',
          'charismaModifier', '+',
             'source >= ' + i + ' ? Math.floor((source+' + (4-i) + ')/4) : null'
        );
        ScribeCustomRules('maxSpellLevelArcane', 'spellsPerDay.B' + i, '^=', i);
      }
      ScribeCustomRules('spellsPerDayLevels.Bard', 'levels.Bard', '=', null);

    } else if(klass == 'Cleric') {

    } else if(klass == 'Druid') {

    } else if(klass == 'Fighter') {

    } else if(klass == 'Monk') {

    } else if(klass == 'Paladin') {

    } else if(klass == 'Ranger') {

    } else if(klass == 'Rogue') {

    } else if(klass == 'Sorcerer') {

    } else if(klass == 'Wizard') {

    } else
      continue;

    ScribeCustomClass
      (klass, hitDie, skillPoints, baseAttack, saveFortitude, saveReflex,
       saveWill, profArmor, profShield, profWeapon, skills, features,
       prerequisites);
    if(notes != null)
      ScribeCustomNotes(notes);

  }

  /* Experience-dependent attributes */
  ScribeCustomRules('classSkillMaxRanks', 'level', '=', 'source + 3');
  ScribeCustomRules
    ('crossSkillMaxRanks', 'classSkillMaxRanks', '=', 'source / 2');
  ScribeCustomRules
    ('experienceNeeded', 'level', '=', '1000 * source * (source + 1) / 2');
  ScribeCustomRules('level',
    'experience', '=', 'Math.floor((1 + Math.sqrt(1 + source / 125)) / 2)'
  );
  ScribeCustomRules('featCount',
    'level', '=', '1 + Math.floor(source / 3)',
    'featureNotes.classFeatCountBonus', '+', null
  );
  ScribeCustomRules('skillPoints',
    null, '=', '0',
    'level', '^', 'source + 3'
  );

  /* Effects of experience-dependent attributes */
  ScribeCustomRules
    ('meleeNotes.constitutionHitPointsAdjustment', 'level', '*', null);

}

function PH35FeatRules() {

  ScribeCustomRules('meleeNotes.strengthMeleeAttackAdjustment',
    'meleeNotes.weaponFinesseFeature', '*', '0'
  );

}

function PH35MagicRules() {

  ScribeCustomRules('casterLevel',
    'casterLevelArcane', '^=', null,
    'casterLevelDivine', '^=', null
  );

}

function PH35MeleeRules() {

  ScribeCustomRules('armorClass',
    null, '=', '10',
    'armor', '+', 'DndCharacter.armorsArmorClassBonuses[source]',
    'shield', '+', 'source=="None" ? null : ' +
                   'source=="Tower" ? 4 : source.indexOf("Light") >= 0 ? 1 : 2'
  );
  ScribeCustomRules('baseAttack', null, '=', '0');
  ScribeCustomRules('saveReflex', null, '=', '0');
  ScribeCustomRules('saveFortitude', null, '=', '0');
  ScribeCustomRules('saveWill', null, '=', '0');

}

function PH35RaceRules() {

  var features = null;
  var notes = null;
  var RACES = [
    'Dwarf',
    'Elf',
    'Gnome',
    'Half Elf',
    'Half Orc',
    'Halfling',
    'Human',
    null
  ];

  for(var i = 0; i < RACES.length; i++) {

    var name = RACES[i];

    if(name == 'Dwarf') {

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

    } else if(name == 'Elf') {

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

    } else if(name == 'Gnome') {

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

    } else if(name == 'Half Elf') {

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

    } else if(name == 'Half Orc') {

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

    } else if(name == 'Halfling') {

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

    } else if(name == 'Human') {

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

    ScribeCustomRace(name, features);
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

function PH35SkillRules() {
}
