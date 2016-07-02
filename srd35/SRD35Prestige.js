/*
Copyright 2015, James J. Hayes

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
 * This module loads the Prestige class rules from the System Reference
 * Documents v3.5.  Member methods can be called independently in order to use
 * a subset of the rules.  Similarly, the constant fields of SRDPrestige
 * (CLASSES, COMPANIONS) can be thined to limit the user's choices.
 */
function SRD35Prestige() {
  if(window.SRD35 == null) {
    alert('The SRD35Prestige module requires use of the SRD35 module');
    return;
  }
  SRD35Prestige.classRules(SRD35.rules, SRD35Prestige.CLASSES);
  SRD35Prestige.companionRules(SRD35.rules, SRD35Prestige.FIENDISH_SERVANTS);
}

SRD35Prestige.CLASSES = [
  'Arcane Archer', 'Arcane Trickster', 'Archmage', 'Assassin', 'Blackguard',
  'Dragon Disciple', 'Duelist', 'Dwarven Defender', 'Eldritch Knight',
  'Hierophant', 'Horizon Walker', 'Loremaster',

  'Mystic Theurge',
  'Shadowdancer', 'Thaumaturgist'
];
SRD35Prestige.FIENDISH_SERVANTS = {
  'Bat': 'HD=1 AC=16 Dam=0 Str=1 Dex=15 Con=10 Int=2 Wis=14 Cha=4',
  'Cat': 'HD=1 AC=14 Dam=2@1d2-4,1d3-4 Str=3 Dex=15 Con=10 Int=2 Wis=12 Cha=7',
  'Dire Rat': 'HD=1 AC=15 Dam=1d4 Str=10 Dex=17 Con=12 Int=1 Wis=12 Cha=4',
  'Heavy Horse': 'HD=3 AC=13 Dam=1d6+1 Str=16 Dex=13 Con=15 Int=2 Wis=12 Cha=6',
  'Light Horse': 'HD=3 AC=13 Dam=1d4+1 Str=14 Dex=13 Con=15 Int=2 Wis=12 Cha=6',
  'Pony': 'HD=2 AC=13 Dam=1d3 Str=13 Dex=13 Con=12 Int=2 Wis=11 Cha=4',
  'Raven': 'HD=1 AC=14 Dam=1d2-5 Str=1 Dex=15 Con=10 Int=2 Wis=14 Cha=6',
  'Toad': 'HD=1 AC=15 Dam=0 Str=1 Dex=12 Con=11 Int=1 Wis=14 Cha=4'
};

/* Defines the rules related to SRDv3.5 Prestige Classes. */
SRD35Prestige.classRules = function(rules, classes) {

  var schools = rules.getChoices('schools');

  for(var i = 0; i < classes.length; i++) {

    var baseAttack, features, hitDie, notes, profArmor, profShield, profWeapon,
        saveFortitude, saveReflex, saveWill, selectableFeatures, skillPoints,
        skills, spellAbility, spells, spellsKnown, spellsPerDay;
    var klass = classes[i];

    if(klass == 'Arcane Archer') {

      baseAttack = SRD35.ATTACK_BONUS_GOOD;
      features = [
        '1:Enhance Arrow', '2:Imbue Arrow', '4:Seeker Arrow', '6:Phase Arrow',
        '8:Hail Of Arrows', '10:Arrow Of Death'
      ];
      hitDie = 8;
      notes = [
        'combatNotes.arrowOfDeathFeature:' +
          'Special arrow requires foe DC 20 fortitude check or die',
        'combatNotes.enhanceArrowFeature:Arrows treated as +%V magic weapons',
        'combatNotes.hailOfArrowsFeature:' +
          'Simultaneously fire arrows at %V targets 1/day',
        'combatNotes.phaseArrowFeature:' +
          'Arrow passes through normal obstacles 1/day',
        'combatNotes.seekerArrowFeature:Arrow maneuvers to target 1/day',
        'magicNotes.imbueArrowFeature:Center spell where arrow lands',
        'validationNotes.arcaneArcherClassBaseAttack:Requires Base Attack >= 6',
        'validationNotes.arcaneArcherClassCasterLevel:' +
          'Requires Caster Level Arcane >= 1',
        'validationNotes.arcaneArcherClassFeats:' +
          'Requires Point Blank Shot/Precise Shot/' +
          'Weapon Focus (Longbow)||Weapon Focus (Shortbow)',
        'validationNotes.arcaneArcherClassRace:Requires Race =~ Elf'
      ];
      profArmor = SRD35.PROFICIENCY_MEDIUM;
      profShield = SRD35.PROFICIENCY_HEAVY;
      profWeapon =  SRD35.PROFICIENCY_MEDIUM;
      saveFortitude = SRD35.SAVE_BONUS_GOOD;
      saveReflex = SRD35.SAVE_BONUS_GOOD;
      saveWill = SRD35.SAVE_BONUS_POOR;
      selectableFeatures = null;
      skillPoints = 4;
      skills = [
        'Craft', 'Hide', 'Listen', 'Move Silently', 'Ride', 'Spot', 'Survival',
        'Use Rope'
      ];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule('combatNotes.enhanceArrowFeature',
        'levels.Arcane Archer', '+=', 'Math.floor((source + 1) / 2)'
      );
      rules.defineRule
        ('combatNotes.hailOfArrowsFeature', 'levels.Arcane Archer', '+=', null);

    } else if(klass == 'Arcane Trickster') {

      baseAttack = SRD35.ATTACK_BONUS_POOR;
      features = [
        '1:Caster Level Bonus', '1:Ranged Legerdemain', '2:Sneak Attack',
        '3:Impromptu Sneak Attack'
      ];
      hitDie = 4;
      notes = [
        'combatNotes.impromptuSneakAttackFeature:' +
           'Declare any attack a sneak attack %V/day',
        'combatNotes.rangedLegerdemainFeature:' +
           '+5 DC on Disable Device/Open Lock/Sleight Of Hand at 30 ft %V/day',
        'combatNotes.sneakAttackFeature:' +
          '%Vd6 extra damage when surprising or flanking',
        'magicNotes.casterLevelBonusFeature:' +
          '+%V base class level for spells known/per day',
        'validationNotes.arcaneTricksterClassAlignment:' +
          'Requires Alignment !~ Lawful',
        'validationNotes.arcaneTricksterClassFeatures:' +
          'Requires Sneak Attack >= 2',
        'validationNotes.arcaneTricksterClassSkills:' +
          'Requires Decipher Script >= 7/Disable Device >= 7/' +
          'Escape Artist >= 7/Knowledge (Arcana) >= 4',
        'validationNotes.arcaneTricksterClassSpells:' +
          'Requires Mage Hand/arcane level 3'
      ];
      profArmor = SRD35.PROFICIENCY_NONE;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon = SRD35.PROFICIENCY_NONE;
      saveFortitude = SRD35.SAVE_BONUS_POOR;
      saveReflex = SRD35.SAVE_BONUS_GOOD;
      saveWill = SRD35.SAVE_BONUS_GOOD;
      selectableFeatures = null;
      skillPoints = 4;
      skills = [
        'Appraise', 'Balance', 'Bluff', 'Climb', 'Concentration', 'Craft',
        'Decipher Script', 'Diplomacy', 'Disable Device', 'Disguise',
        'Escape Artist', 'Gather Information', 'Hide', 'Jump',
        'Knowledge', 'Listen', 'Move Silently', 'Open Lock',
        'Profession', 'Sense Motive', 'Search', 'Sleight Of Hand',
        'Speak Language', 'Spellcraft', 'Spot', 'Swim', 'Tumble', 'Use Rope'
      ];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule('combatNotes.impromptuSneakAttackFeature',
        'levels.Arcane Trickster', '+=', 'source < 7 ? 1 : 2'
      );
      rules.defineRule('combatNotes.rangedLegerdemainFeature',
        'levels.Arcane Trickster', '+=', 'Math.floor((source + 3) / 4)'
      );
      rules.defineRule('combatNotes.sneakAttackFeature',
        'levels.Arcane Trickster', '+=', 'Math.floor(source / 2)'
      );
      rules.defineRule('magicNotes.casterLevelBonusFeature',
        'levels.Arcane Trickster', '+=', null
      );
      rules.defineRule('validationNotes.arcaneTricksterClassFeatures',
        'levels.Arcane Trickster', '=', '-1',
        // Check standard classes that provide 2d6 Sneak Attack
        'levels.Assassin', '+', 'source >= 3 ? 1 : null',
        'levels.Rogue', '+', 'source >= 3 ? 1 : null',
        '', 'v', '0'
      );
      rules.defineRule('validationNotes.arcaneTricksterClassSpells',
        'levels.Arcane Trickster', '=', '-11',
        // NOTE: False valid w/multiple Mage Hand spells
        /^spells\.Mage Hand/, '+=', '10',
        /^spellsKnown\.(AS|B|S|W)3/, '+', '1',
        '', 'v', '0'
      );

    } else if(klass == 'Archmage') {

      baseAttack = SRD35.ATTACK_BONUS_POOR;
      features = ['1:Caster Level Bonus'];
      hitDie = 4;
      notes = [
        'magicNotes.arcaneFireFeature:Transform arcane spell into bolt of fire',
        'magicNotes.arcaneReachFeature:Use arcane touch spell 30 ft away',
        'magicNotes.casterLevelBonusFeature:' +
          '+%V base class level for spells known/per day',
        'magicNotes.improvedArcaneReachFeature:' +
          'Use arcane touch spell 60 ft away',
        'magicNotes.masteryOfCounterspellingFeature:' +
          'Counterspell turns effect back on caster',
        'magicNotes.masteryOfElementsFeature:Change energy type of spell',
        'magicNotes.masteryOfShapingFeature:' +
          'Create holes in spell effect area',
        'magicNotes.spellPowerFeature:+1 caster level for spell effects',
        'magicNotes.spellLikeAbilityFeature:Use spell as ability 2+/day',
        'validationNotes.archmageClassFeatures:' +
          'Requires Skill Focus (Spellcraft)/2 Spell Focus',
        'validationNotes.archmageClassSkills:' +
          'Requires Knowledge (Arcana) >= 15/Spellcraft >= 15',
        'validationNotes.archmageClassSpells:' +
          'Requires arcane level 7/level 5 from 5 schools'
      ];
      profArmor = SRD35.PROFICIENCY_NONE;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon = SRD35.PROFICIENCY_NONE;
      saveFortitude = SRD35.SAVE_BONUS_POOR;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_GOOD;
      selectableFeatures = [
        'Arcane Fire', 'Arcane Reach', 'Improved Arcane Reach',
        'Mastery Of Counterspelling', 'Mastery Of Elements',
        'Mastery Of Shaping', 'Spell Power', 'Spell Like Ability'
      ];
      skillPoints = 2;
      skills = [
        'Concentration', 'Craft (Alchemy)', 'Knowledge', 'Profession',
        'Search', 'Spellcraft'
      ];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule
        ('magicNotes.casterLevelBonusFeature', 'levels.Archmage', '+=', null);
      rules.defineRule
        ('selectableFeatureCount.Archmage', 'levels.Archmage', '+=', null);
      rules.defineRule('validationNotes.archmageClassFeatures',
        'levels.Archmage', '=', '-12',
        'features.Skill Focus (Spellcraft)', '+', '10',
        /^features.Spell Focus/, '+', '1',
        '', 'v', '0'
      );
      rules.defineRule('validationNotes.archmageClassSpells',
        'levels.Archmage', '=', '-1',
        /^spellsKnown\.(AS|B|S|W)7/, '+', '1',
        // NOTE: level 5 from 5 schools
        '', 'v', '0'
      );

    } else if(klass == 'Assassin') {

      baseAttack = SRD35.ATTACK_BONUS_AVERAGE;
      features = [
        '1:Death Attack', '1:Poison Use', '1:Sneak Attack',
        '1:Weapon Proficiency ' +
          '(Dagger/Dart/Hand Crossbow/Heavy Crossbow/Light Crossbow/Punching Dagger/Rapier/Sap/Shortbow/Composit Shortbow/Short Sword)',
        '2:Poison Tolerance', '2:Uncanny Dodge', '5:Improved Uncanny Dodge',
        '8:Hide In Plain Sight'
      ];
      hitDie = 6;
      notes = [
        'combatNotes.deathAttackFeature:' +
          'Foe DC %V fortitude save on successful sneak attack after 3 ' +
          'rounds of study or die/paralyzed for d6+%1 rounds',
        'combatNotes.improvedUncannyDodgeFeature:' +
          'Flanked only by rogue four levels higher',
        'combatNotes.sneakAttackFeature:' +
          '%Vd6 extra damage when surprising or flanking',
        'combatNotes.uncannyDodgeFeature:Always adds dexterity modifier to AC',
        'featureNotes.poisonUseFeature:' +
          'No chance of self-poisoning when applying to blade',
        'saveNotes.poisonToleranceFeature:+%V vs. poison',
        'skillNotes.hideInPlainSightFeature:Hide even when observed',
        'validationNotes.assassinClassAlignment:Requires Alignment =~ Evil',
        'validationNotes.assassinClassSkills:' +
          'Requires Disguise >= 4/Hide >= 8/Move Silently >= 8'
      ];
      profArmor = SRD35.PROFICIENCY_LIGHT;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon = SRD35.PROFICIENCY_NONE;
      saveFortitude = SRD35.SAVE_BONUS_POOR;
      saveReflex = SRD35.SAVE_BONUS_GOOD;
      saveWill = SRD35.SAVE_BONUS_POOR;
      selectableFeatures = null;
      skillPoints = 4;
      skills = [
        'Balance', 'Bluff', 'Climb', 'Craft', 'Decipher Script', 'Diplomacy',
        'Disable Device', 'Disguise', 'Escape Artist', 'Forgery',
        'Gather Information', 'Hide', 'Intimidate', 'Jump', 'Listen',
        'Move Silently', 'Open Lock', 'Search', 'Sense Motive',
        'Sleight Of Hand', 'Spot', 'Swim', 'Tumble', 'Use Magic Device',
        'Use Rope'
      ];
      spellAbility = 'intelligence';
      spells = [
        'AS1:Detect Poison:Disguise Self:Feather Fall:Ghost Sound:Jump:' +
        'Obscuring Mist:Sleep:True Strike',
        'AS2:Alter Self:Cat\'s Grace:Darkness:Fox\'s Cunning:Illusory Script:' +
        'Invisibility:Pass Without Trace:Spider Climb:Undetectable Alignment',
        'AS3:Deep Slumber:Deeper Darkness:False Life:' +
        'Magic Circle Against Good:Misdirection:Nondetection',
        'AS4:Clairaudience/Clairvoyance:Dimension Door:Freedom Of Movement:' +
        'Glibness:Greater Invisibility:Locate Creature:Modify Memory:Poison'
      ];
      spellsPerDay = [
        'AS1:1:0/2:1/3:2/4:3',
        'AS2:3:0/4:1/5:2/6:3',
        'AS3:5:0/6:1/7:2/8:3',
        'AS4:7:0/8:1/9:2/10:3'
      ];
      spellsKnown = [
        'AS1:1:1/2:2/4:3',
        'AS2:3:1/4:2/6:3',
        'AS3:5:1/6:2/8:3',
        'AS4:7:1/8:2/10:3'
      ];
      rules.defineRule('casterLevelArcane', 'levels.Assassin', '+=', null);
      rules.defineRule('combatNotes.deathAttackFeature',
        'levels.Assassin', '+=', '10 + source',
        'intelligenceModifier', '+', null
      );
      rules.defineRule
        ('combatNotes.deathAttackFeature.1', 'levels.Assassin', '+=', null);
      rules.defineRule('combatNotes.sneakAttackFeature',
        'levels.Assassin', '+=', 'Math.floor((source + 1) / 2)'
      );
      rules.defineRule
        ('resistance.Poison', 'saveNotes.poisonToleranceFeature', '+=', null);
      rules.defineRule('saveNotes.poisonToleranceFeature',
        'levels.Assassin', '+=', 'Math.floor(source / 2)'
      );

    } else if(klass == 'Blackguard') {

      baseAttack = SRD35.ATTACK_BONUS_GOOD;
      features = [
        '1:Aura Of Evil', '1:Blackguard Hands', '1:Detect Good',
        '1:Fiendish Summoning', '1:Poison Use', '2:Smite Good',
        '2:Dark Blessing', '3:Aura Of Despair', '3:Turn Undead',
        '4:Sneak Attack', '5:Fiendish Servant', '5:Undead Companion' 
      ];
      hitDie = 10;
      notes = [
        'combatNotes.auraOfDespairFeature:All foes within 10 ft -2 all saves',
        'combatNotes.smiteGoodFeature:' +
          '+%1 attack/+%2 damage vs. good foe %V/day',
        'combatNotes.sneakAttackFeature:' +
          '%Vd6 extra damage when surprising or flanking',
        'combatNotes.turnUndeadFeature:' +
          'Turn (good) or rebuke (evil) undead creatures',
        'featureNotes.fiendishServantFeature:' +
          'Animal servant w/special abilities',
        'featureNotes.poisonUseFeature:' +
          'No chance of self-poisoning when applying to blade',
        'featureNotes.undeadCompanionFeature:' +
          'Unturnable undead servant w/fiendish servant abilities',
        'magicNotes.auraOfEvilFeature:Visible to <i>Detect Evil</i>',
        'magicNotes.blackguardHandsFeature:Heal %V HP/day to self or servant',
        'magicNotes.detectGoodFeature:<i>Detect Good</i> at will',
        'magicNotes.fiendishSummoningFeature:' +
          '<i>Summon Monster I</i> as level %V caster 1/day',
        'saveNotes.darkBlessingFeature:+%V on all saves',
        'validationNotes.blackguardClassAlignment:Requires Alignment =~ Evil',
        'validationNotes.blackguardClassBaseAttack:Requires Base Attack >= 6',
        'validationNotes.blackguardClassFeats:' +
          'Requires Cleave/Improved Sunder/Power Attack',
        'validationNotes.blackguardClassSkills:' +
          'Requires Hide >= 5/Knowledge (Religion) >= 2'
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
        'Concentration', 'Craft', 'Diplomacy', 'Handle Animal', 'Heal', 'Hide',
        'Intimidate', 'Knowledge (Religion)', 'Profession', 'Ride'
      ];
      spellAbility = 'wisdom';
      spells = [
        'BL1:Cause Fear:Corrupt Weapon:Cure Light Wounds:Doom:' +
        'Inflict Light Wounds:Magic Weapon:Summon Monster I',
        'BL2:Bull\'s Strength:Cure Moderate Wounds:Darkness:Death Knell:' +
        'Eagle\'s Splendor:Inflict Moderate Wounds:Shatter:Summon Monster II',
        'BL3:Contagion:Cure Serious Wounds:Deeper Darkness:' +
        'Inflict Serious Wounds:Protection From Energy:Summon Monster III',
        'BL4:Cure Critical Wounds:Freedom Of Movement:' +
        'Inflict Critical Wounds:Poison:Summon Monster IV'
      ];
      spellsKnown = [
        'BL1:1:"all"', 'BL2:3:"all"', 'BL3:5:"all"', 'BL4:7:"all"'
      ];
      spellsPerDay = [
        'BL1:1:0/2:1/7:2',
        'BL2:3:0/4:1/9:2',
        'BL3:5:0/6:1/10:2',
        'BL4:7:0/8:1'
      ];
      SRD35.spellsSchools['Corrupt Weapon'] = 'Transmutation';
      rules.defineRule('casterLevelDivine', 'levels.Blackguard', '+=', null);
      rules.defineRule('combatNotes.smiteGoodFeature',
        'levels.Blackguard', '+=', 'source<2 ? null : 1 + Math.floor(source/5)'
      );
      rules.defineRule('combatNotes.smiteGoodFeature.1',
        'charismaModifier', '=', 'source > 0 ? source : 0'
      );
      rules.defineRule
        ('combatNotes.smiteGoodFeature.2', 'levels.Blackguard', '=', null);
      rules.defineRule('combatNotes.sneakAttackFeature',
        'levels.Blackguard', '+=', 'source<4 ? null : Math.floor((source-1)/3)'
      );
      rules.defineRule
        ('fiendishServantMasterLevel', 'levels.Blackguard', '+=', null);
      rules.defineRule('magicNotes.blackguardHandsFeature',
        'level', '+=', null,
        'charismaModifier', '*', null
      );
      rules.defineRule('magicNotes.fiendishSummoningFeature',
        'levels.Blackguard', '=', 'source * 2'
      );
      rules.defineRule
        ('save.Fortitude', 'saveNotes.darkBlessingFeature', '+', null);
      rules.defineRule
        ('save.Reflex', 'saveNotes.darkBlessingFeature', '+', null);
      rules.defineRule('save.Will', 'saveNotes.darkBlessingFeature', '+', null);
      rules.defineRule('saveNotes.darkBlessingFeature',
        'charismaModifier', '=', 'source > 0 ? source : null'
      );
      rules.defineRule('turnUndead.level',
        'levels.Blackguard', '+=', 'source > 2 ? source - 2 : null'
      );
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
      rules.defineRule('combatNotes.smiteGoodFeature',
        'levels.Paladin', '+', 'source >= 9 ? 3 : source >= 5 ? 2 : 1'
      );
      // NOTE: Minor bug: this will also effect the sneak attack feature of
      // some unlikely combinations, e.g., rogue/paladin
      rules.defineRule('combatNotes.sneakAttackFeature',
        'levels.Paladin', '+', 'source >= 5 ? 1 : null'
      );

    } else if(klass == 'Dragon Disciple') {

      baseAttack = SRD35.ATTACK_BONUS_AVERAGE;
      features = [
        '1:Bonus Spells', '2:Bite Attack', '2:Claw Attack',
        '2:Strength Boost', '3:Breath Weapon', '5:Blindsense',
        '6:Constitution Boost', '8:Intelligence Boost', '9:Wings',
        '10:Darkvision', '10:Dragon Apotheosis', '10:Low Light Vision'
      ];
      hitDie = 12;
      notes = [
        'abilityNotes.constitutionBoostFeature:+2 constitution',
        'abilityNotes.dragonApotheosisFeature:+4 strength/+2 charisma',
        'abilityNotes.intelligenceBoostFeature:+2 intelligence',
        'abilityNotes.strengthBoostFeature:+%V strength',
        'combatNotes.biteAttackFeature:Attack with bite',
        'combatNotes.breathWeaponFeature:Breathe for %Vd8 damage 1/day, DC %1',
        'combatNotes.clawAttackFeature:Attack with claws',
        'combatNotes.dragonDiscipleArmorClassAdjustment:%V',
        'featureNotes.blindsenseFeature:' +
          'Other senses allow detection of unseen objects w/in 30 ft',
        'featureNotes.darkvisionFeature:%V ft b/w vision in darkness',
        'featureNotes.dragonApotheosisFeature:Darkvision/Low Light Vision',
        'featureNotes.lowLightVisionFeature:x%V normal distance in poor light',
        'featureNotes.wingsFeature:Fly at normal land speed',
        'magicNotes.bonusSpellsFeature:%V bonus spells of any level',
        'saveNotes.dragonApotheosisFeature:' +
          'Immune sleep/paralysis/breath weapon energy',
        'validationNotes.dragonDiscipleClassLanguages:Requires Draconic',
        'validationNotes.dragonDiscipleClassRace:Requires Race !~ Dragon',
        'validationNotes.dragonDiscipleClassSkills:' +
          'Requires Knowledge (Arcana) >= 8',
        'validationNotes.dragonDiscipleClassSpells:' +
          'Requires arcane spells w/out preparation'
      ];
      profArmor = SRD35.PROFICIENCY_NONE;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon = SRD35.PROFICIENCY_NONE;
      saveFortitude = SRD35.SAVE_BONUS_GOOD;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_GOOD;
      selectableFeatures = null;
      skillPoints = 2;
      skills = [
        'Concentration', 'Craft', 'Diplomacy', 'Escape Artist',
        'Gather Information', 'Knowledge', 'Listen', 'Profession', 'Search',
        'Speak Language', 'Spellcraft', 'Spot'
      ];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule('abilityNotes.strengthBoostFeature',
        'levels.Dragon Disciple', '+=', 'source>=4 ? 4 : source>=2 ? 2 : null'
      );
      rules.defineRule('armorClass',
        'combatNotes.dragonDiscipleArmorClassAdjustment', '+', null
      );
      rules.defineRule
        ('charisma', 'abilityNotes.dragonApotheosisFeature', '+', '2');
      rules.defineRule('combatNotes.breathWeaponFeature',
        'levels.Dragon Disciple', '=', 'source < 7 ? 2 : source < 10 ? 4 : 6'
      );
      rules.defineRule('combatNotes.breathWeaponFeature.1',
        'levels.Dragon Disciple', '=', '10 + source',
        'constitutionModifier', '+', null
      );
      rules.defineRule('combatNotes.dragonDiscipleArmorClassAdjustment',
        'levels.Dragon Disciple', '+=', 'Math.floor((source + 2) / 3)'
      );
      rules.defineRule
        ('constitution', 'abilityNotes.constitutionBoostFeature', '+', '2');
      rules.defineRule('featureNotes.darkvisionFeature',
        'dragonDiscipleFeatures.Darkvision', '^=', '60'
      );
      rules.defineRule('featureNotes.lowLightVisionFeature',
        '', '=', '1',
        'dragonDiscipleFeatures.Low Light Vision', '+', null
      );
      rules.defineRule
        ('intelligence', 'abilityNotes.intelligenceBoostFeature', '+', '2');
      rules.defineRule('magicNotes.bonusSpellsFeature',
        'levels.Dragon Disciple', '+=',
          'source - (source == 10 ? 3 : source >= 7 ? 2 : source >= 3 ? 1 : 0)'
      );
      rules.defineRule('strength',
        'abilityNotes.dragonApotheosisFeature', '+', '4',
        'abilityNotes.strengthBoostFeature', '+', null
      );
      rules.defineRule('validationNotes.dragonDiscipleClassSpells',
        'levels.Dragon Disciple', '=', '-1',
        // Check standard ways to learn arcane spells w/out study
        'levels.Bard', '+', '1',
        'levels.Sorcerer', '+', '1',
        'features.Spell Mastery', '+', '1',
        '', 'v', '0'
      );
      rules.defineChoice('weapons', 'Bite:d6', 'Claw:d4');
      rules.defineRule
        ('weapons.Bite', 'combatNotes.biteAttackFeature', '=', '1');
      rules.defineRule
        ('weapons.Claw', 'combatNotes.clawAttackFeature', '=', '1');

    } else if(klass == 'Duelist') {

      baseAttack = SRD35.ATTACK_BONUS_GOOD;
      features = [
        '1:Canny Defense', '2:Improved Reaction', '3:Enhanced Mobility',
        '4:Grace', '5:Precise Strike', '6:Acrobatic Charge',
        '7:Elaborate Parry', '9:Deflect Arrows'
      ];
      hitDie = 10;
      notes = [
        'combatNotes.acrobaticChargeFeature:May charge in difficult terrain',
        'combatNotes.cannyDefenseFeature:Add %V to melee AC when unarmored',
        'combatNotes.deflectArrowsFeature:Deflect ranged 1/round',
        'combatNotes.elaborateParryFeature:+%V AC when fighting defensively',
        'combatNotes.enhancedMobilityFeature:' +
          '+4 AC vs. movement AOO when unarmored',
        'combatNotes.improvedReactionFeature:+%V initiative',
        'combatNotes.preciseStrikeFeature:' +
          'Extra %Vd6 damage with light piercing weapon',
        'saveNotes.graceFeature:+2 Reflex when unarmored',
        'validationNotes.duelistClassBaseAttack:Requires Base Attack >= 6',
        'validationNotes.duelistClassFeats:' +
          'Requires Dodge/Mobility/Weapon Finesse',
        'validationNotes.duelistClassSkills:' +
          'Requires Sum Perform >= 3/Tumble >= 5'
      ];
      profArmor = SRD35.PROFICIENCY_NONE;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon = SRD35.PROFICIENCY_MEDIUM;
      saveFortitude = SRD35.SAVE_BONUS_POOR;
      saveReflex = SRD35.SAVE_BONUS_GOOD;
      saveWill = SRD35.SAVE_BONUS_POOR;
      selectableFeatures = null;
      skillPoints = 4;
      skills = [
        'Balance', 'Bluff', 'Escape Artist', 'Jump', 'Listen', 'Perform',
        'Sense Motive', 'Spot', 'Tumble'
      ];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule
        ('armorClass', 'combatNotes.cannyDefenseFeature', '+', null);
      rules.defineRule('combatNotes.cannyDefenseFeature',
        'intelligenceModifier', '+=', null,
        'levels.Duelist', 'v', null
      );
      rules.defineRule
        ('combatNotes.elaborateParryFeature', 'levels.Duelist', '+=', null);
      rules.defineRule('combatNotes.improvedReactionFeature',
        'levels.Duelist', '+=', 'source < 2 ? null : source < 8 ? 2 : 4'
      );
      rules.defineRule('combatNotes.preciseStrikeFeature',
        'levels.Duelist', '=', 'Math.floor(source / 5)'
      );
      rules.defineRule
        ('initiative', 'combatNotes.improvedReactionFeature', '+', null);
      rules.defineRule('save.Reflex', 'saveNotes.graceFeature', '+', null);

    } else if(klass == 'Dwarven Defender') {

      baseAttack = SRD35.ATTACK_BONUS_GOOD;
      features = [
        '1:Defensive Stance', '2:Uncanny Dodge', '4:Trap Sense',
        '6:Damage Reduction', '6:Improved Uncanny Dodge', '8:Mobile Defense'
      ];
      hitDie = 12;
      notes = [
        'combatNotes.damageReductionFeature:%V subtracted from damage taken',
        'combatNotes.dwarvenDefenderArmorClassAdjustment:%V',
        'combatNotes.improvedUncannyDodgeFeature:' +
          'Flanked only by rogue four levels higher',
        'combatNotes.mobileDefenseFeature:' +
          'Allowed 5 ft. step during Defensive Stance',
        'combatNotes.uncannyDodgeFeature:Always adds dexterity modifier to AC',
        'featureNotes.defensiveStanceFeature:' +
          '+2 strength/+4 constitution/+2 saves/+4 AC while unmoving for ' +
          '%V rounds %1/day',
        'saveNotes.trapSenseFeature:+%V Reflex and AC vs. traps',
        'validationNotes.dwarvenDefenderClassAlignment:' +
          'Requires Alignment =~ Lawful',
        'validationNotes.dwarvenDefenderClassBaseAttack:' +
          'Requires Base Attack >= 7',
        'validationNotes.dwarvenDefenderClassFeats:' +
          'Requires Dodge/Endurance/Toughness',
        'validationNotes.dwarvenDefenderClassRace:Requires Race =~ Dwarf'
      ];
      profArmor = SRD35.PROFICIENCY_HEAVY;
      profShield = SRD35.PROFICIENCY_HEAVY;
      profWeapon = SRD35.PROFICIENCY_MEDIUM;
      saveFortitude = SRD35.SAVE_BONUS_GOOD;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_GOOD;
      selectableFeatures = null;
      skillPoints = 2;
      skills = ['Craft', 'Listen', 'Sense Motive', 'Spot'];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule('armorClass',
        'combatNotes.dwarvenDefenderArmorClassAdjustment', '+', null
      );
      rules.defineRule('combatNotes.damageReductionFeature',
        'levels.Dwarven Defender', '+=', 'source<6 ? null : source<10 ? 3 : 6'
      );
      rules.defineRule('combatNotes.dwarvenDefenderArmorClassAdjustment',
        'levels.Dwarven Defender', '+=', 'Math.floor((source + 2) / 3)'
      );
      rules.defineRule('featureNotes.defensiveStanceFeature',
        'constitutionModifier', '+=', 'source + 5'
      );
      rules.defineRule('featureNotes.defensiveStanceFeature.1',
        'levels.Dwarven Defender', '+=', 'Math.floor((source + 1) / 2)'
      );
      rules.defineRule('saveNotes.trapSenseFeature',
        'levels.Dwarven Defender', '+=', 'Math.floor(source / 4)'
      );

    } else if(klass == 'Eldritch Knight') {

      baseAttack = SRD35.ATTACK_BONUS_GOOD;
      features = ['2:Caster Level Bonus'];
      hitDie = 6;
      notes = [
        'magicNotes.casterLevelBonusFeature:' +
          '+%V base class level for spells known/per day',
        'validationNotes.eldritchKnightClassWeaponProficiencyLevel:' +
          'Requires Class Weapon Proficiency Level>='+SRD35.PROFICIENCY_MEDIUM,
        'validationNotes.eldritchKnightClassSpells:Requires arcane level 3'
      ];
      profArmor = SRD35.PROFICIENCY_NONE;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon = SRD35.PROFICIENCY_NONE;
      saveFortitude = SRD35.SAVE_BONUS_GOOD;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_POOR;
      selectableFeatures = null;
      skillPoints = 2;
      skills = [
        'Concentration', 'Craft', 'Decipher Script', 'Jump',
        'Knowledge (Arcana)', 'Knowledge (Nobility)', 'Ride', 'Sense Motive',
        'Spellcraft', 'Swim'
      ];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule('featCount.Fighter', 'levels.Eldritch Knight', '+=','1');
      rules.defineRule('magicNotes.casterLevelBonusFeature',
        'levels.Eldritch Knight', '+=', 'source > 1 ? source - 1 : null'
      );
      rules.defineRule('validationNotes.eldritchKnightClassSpells',
        'levels.Eldritch Knight', '=', '-1',
        /^spellsKnown\.(AS|B|S|W)3/, '+', '1',
        '', 'v', '0'
      );
 
    } else if(klass == 'Hierophant') {

      baseAttack = SRD35.ATTACK_BONUS_POOR;
      features = null;
      hitDie = 8;
      notes = [
        'combatNotes.masteryOfEnergyFeature:+4 undead turning checks/damage',
        'featureNotes.giftOfTheDivineFeature:' +
          'Transfer undead turn/rebuke to another for 1-7 days',
        'featureNotes.powerOfNatureFeature:' +
          'Transfer druid feature to another for 1-7 days',
        'featureNotes.spellLikeAbilityFeature:Use spell as ability 2+/day',
        'magicNotes.blastInfidelFeature:' +
           'Negative energy spells vs. opposed-alignment foe have max effect',
        'magicNotes.divineReachFeature:Use divine touch spell 30 ft away',
        'magicNotes.faithHealingFeature:' +
          'Healing spells on same-aligned creature have max effect',
        'magicNotes.improvedDivineReachFeature:' +
          'Use divine touch spell 60 ft away',
        'magicNotes.spellPowerFeature:+1 caster level for spell effects',
        'validationNotes.hierophantClassFeats:Requires any Metamagic',
        'validationNotes.hierophantClassSkills:' +
          'Requires Knowledge (Religion) >= 15',
        'validationNotes.hierophantClassSpells:Requires divine level 7'
      ];
      profArmor = SRD35.PROFICIENCY_NONE;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon = SRD35.PROFICIENCY_NONE;
      saveFortitude = SRD35.SAVE_BONUS_GOOD;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_GOOD;
      selectableFeatures = [
        'Blast Infidel', 'Divine Reach', 'Faith Healing', 'Gift Of The Divine',
        'Improved Divine Reach', 'Mastery Of Energy', 'Power Of Nature',
        'Spell Power', 'Spell Like Ability'
      ];
      skillPoints = 2;
      skills = [
        'Concentration', 'Craft', 'Diplomacy', 'Heal', 'Knowledge (Arcana)',
        'Knowledge (Religion)', 'Profession', 'Spellcraft'
      ];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule('casterLevelDivine', 'levels.Hierophant', '+=', null);
      rules.defineRule
        ('selectableFeatureCount.Hierophant', 'levels.Hierophant', '=', null);
      rules.defineRule('turnUndead.damageModifier',
        'combatNotes.masteryOfEnergyFeature', '+', '4'
      );
      rules.defineRule('turnUndead.maxHitDice',
        'combatNotes.masteryOfEnergyFeature', '+', '4'
      );
      rules.defineRule('validationNotes.hierophantClassFeats',
        'levels.Hierophant', '=', '-1',
        // NOTE: False valid w/Natural Spell
        /^features\..*Spell$/, '+', '1',
        '', 'v', '0'
      );
      rules.defineRule('validationNotes.hierophantClassSpells',
        'levels.Hierophant', '=', '-1',
        /^spellsKnown\.(AD|C|D|P|R)7/, '+', '1',
        '', 'v', '0'
      );

    } else if(klass == 'Horizon Walker') {

      baseAttack = SRD35.ATTACK_BONUS_GOOD;
      features = null;
      hitDie = 8;
      notes = [
        'combatNotes.terrainMastery(Aquatic)Feature:' +
          '+1 attack/damage vs. aquatic creatures',
        'combatNotes.terrainMastery(Cold)Feature:' +
          '+1 attack/damage vs. cold elementals/outsiders',
        'combatNotes.terrainMastery(Desert)Feature:' +
          '+1 attack/damage vs. desert creatures',
        'combatNotes.terrainMastery(Fiery)Feature:' +
          '+1 attack/damage vs. fire elementals/outsiders',
        'combatNotes.terrainMastery(Forest)Feature:' +
          '+1 attack/damage vs. forest creatures',
        'combatNotes.terrainMastery(Hills)Feature:' +
          '+1 attack/damage vs. hill creatures',
        'combatNotes.terrainMastery(Marsh)Feature:' +
          '+1 attack/damage vs. marsh creatures',
        'combatNotes.terrainMastery(Mountains)Feature:' +
          '+1 attack/damage vs. mountain creatures',
        'combatNotes.terrainMastery(Plains)Feature:' +
          '+1 attack/damage vs. plain creatures',
        'combatNotes.terrainMastery(Shifting)Feature:' +
          '+1 attack/damage vs. shifting plane elementals/outsiders',
        'combatNotes.terrainMastery(Underground)Feature:' +
          '+1 attack/damage vs. underground creatures',
        'combatNotes.terrainMastery(Weightless)Feature:' +
           '+1 attack/damage vs. astral/elemental air/ethereal creatures',
        'featureNotes.darkvisionFeature:%V ft b/w vision in darkness',
        'featureNotes.terrainMastery(Aligned)Feature:' +
          'Mimic dominant alignment of any plane',
        'featureNotes.terrainMastery(Aquatic)Feature:+10 ft swim speed',
        'featureNotes.terrainMastery(Mountains)Feature:+10 ft climb speed',
        'featureNotes.terrainMastery(Cavernous)Feature:Tremorsense',
        'featureNotes.terrainMastery(Underground)Feature:+60 ft Darkvision',
        'featureNotes.terrainMastery(Weightless)Feature:' +
          '+30 ft fly speed on gravityless planes',
        'featureNotes.tremorsenseFeature:' +
          'Detect creatures in contact w/ground w/in 30 ft',
        'magicNotes.terrainMastery(Shifting)Feature:' +
          '<i>Dimension Door</i> every d4 rounds',
        'saveNotes.terrainMastery(Cold)Feature:20 DC cold resistance',
        'saveNotes.terrainMastery(Desert)Feature:' +
          'Immune fatigue, resist exhaustion',
        'saveNotes.terrainMastery(Fiery)Feature:20 DC fire resistance',
        'skillNotes.terrainMastery(Aquatic)Feature:+4 Swim',
        'skillNotes.terrainMastery(Forest)Feature:+4 Hide',
        'skillNotes.terrainMastery(Hills)Feature:+4 Listen',
        'skillNotes.terrainMastery(Marsh)Feature:+4 Move Silently',
        'skillNotes.terrainMastery(Mountains)Feature:+4 Climb',
        'skillNotes.terrainMastery(Plains)Feature:+4 Spot',
        'validationNotes.horizonWalkerClassFeats:Requires Endurance',
        'validationNotes.horizonWalkerClassSkills:' +
          'Requires Knowledge (Geography) >= 8',
        'validationNotes.terrainMastery(Aligned)SelectableFeatureLevels:' +
          'Requires Horizon Walker >= 6',
        'validationNotes.terrainMastery(Aquatic)SelectableFeatureLevels:' +
          'Requires Horizon Walker >= 1',
        'validationNotes.terrainMastery(Cavernous)SelectableFeatureLevels:' +
          'Requires Horizon Walker >= 6',
        'validationNotes.terrainMastery(Cold)SelectableFeatureLevels:' +
          'Requires Horizon Walker >= 6',
        'validationNotes.terrainMastery(Desert)SelectableFeatureLevels:' +
          'Requires Horizon Walker >= 1',
        'validationNotes.terrainMastery(Fiery)SelectableFeatureLevels:' +
          'Requires Horizon Walker >= 6',
        'validationNotes.terrainMastery(Forest)SelectableFeatureLevels:' +
          'Requires Horizon Walker >= 1',
        'validationNotes.terrainMastery(Hills)SelectableFeatureLevels:' +
          'Requires Horizon Walker >= 1',
        'validationNotes.terrainMastery(Marsh)SelectableFeatureLevels:' +
          'Requires Horizon Walker >= 1',
        'validationNotes.terrainMastery(Mountains)SelectableFeatureLevels:' +
          'Requires Horizon Walker >= 1',
        'validationNotes.terrainMastery(Plains)SelectableFeatureLevels:' +
          'Requires Horizon Walker >= 1',
        'validationNotes.terrainMastery(Shifting)SelectableFeatureLevels:' +
          'Requires Horizon Walker >= 6',
        'validationNotes.terrainMastery(Underground)SelectableFeatureLevels:' +
          'Requires Horizon Walker >= 1',
        'validationNotes.terrainMastery(Weightless)SelectableFeatureLevels:' +
          'Requires Horizon Walker >= 6'
      ];
      profArmor = SRD35.PROFICIENCY_NONE;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon = SRD35.PROFICIENCY_NONE;
      saveFortitude = SRD35.SAVE_BONUS_GOOD;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_POOR;
      selectableFeatures = [
        'Terrain Mastery (Aquatic)', 'Terrain Mastery (Desert)',
        'Terrain Mastery (Forest)', 'Terrain Mastery (Hills)',
        'Terrain Mastery (Marsh)', 'Terrain Mastery (Mountains)',
        'Terrain Mastery (Plains)', 'Terrain Mastery (Underground)',
        'Terrain Mastery (Aligned)', 'Terrain Mastery (Cavernous)',
        'Terrain Mastery (Cold)', 'Terrain Mastery (Fiery)',
        'Terrain Mastery (Shifting)', 'Terrain Mastery (Weightless)'
      ];
      skillPoints = 4;
      skills = [
        'Balance', 'Climb', 'Diplomacy', 'Handle Animal', 'Hide',
        'Knowledge (Geography)', 'Listen', 'Move Silently', 'Profession',
        'Ride', 'Speak Language', 'Spot', 'Survival'
      ];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule('featureNotes.darkvisionFeature',
        'featureNotes.terrainMastery(Underground)Feature:', '+=', '60'
      );
      rules.defineRule('features.Tremorsense',
        'features.Terrain Mastery (Cavernous)', '=', '1'
      );
      rules.defineRule('selectableFeatureCount.Horizon Walker',
        'levels.Horizon Walker', '+=', null
      );

    } else if(klass == 'Loremaster') {

      baseAttack = SRD35.ATTACK_BONUS_POOR;
      features = [
        '1:Caster Level Bonus', '2:Lore', '4:Bonus Language', '6:Greater Lore',
        '10:True Lore'
      ];
      hitDie = 4;
      notes = [
        'combatNotes.dodgeTrickFeature:+1 AC',
        'combatNotes.secretHealthFeature:+3 HP',
        'combatNotes.weaponTrickFeature:+1 Attack',
        'featureNotes.applicableKnowledgeFeature:Bonus feat',
        'featureNotes.bonusLanguageFeature:%V additional language(s)',
        'magicNotes.casterLevelBonusFeature:' +
          '+%V base class level for spells known/per day',
        'magicNotes.greaterLoreFeature:<i>Identify</i> at will',
        'magicNotes.moreNewfoundArcanaFeature:Bonus level 2 spell',
        'magicNotes.newfoundArcanaFeature:Bonus level 1 spell',
        'magicNotes.trueLoreFeature:' +
          '<i>Legend Lore</i>, <i>Analyze Dweomer</i> 1/day',
        'saveNotes.secretKnowledgeOfAvoidanceFeature:+2 Reflex',
        'saveNotes.secretsOfInnerStrengthFeature:+2 Will',
        'saveNotes.theLoreOfTrueStaminaFeature:+2 Fortitude',
        'skillNotes.instantMasteryFeature:4 ranks in untrained skill',
        'skillNotes.loreFeature:+%V Knowledge checks with local history',
        'validationNotes.loremasterClassFeats:' +
          'Requires Skill Focus in any Knowledge skill/' +
          'any 3 metamagic or item creation',
        'validationNotes.loremasterClassSkills:Requires any 2 Knowledge >= 10',
        'validationNotes.loremasterClassSpells:' +
          'Requires any 7 divination/any level 3 divination'
      ];
      profArmor = SRD35.PROFICIENCY_NONE;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon = SRD35.PROFICIENCY_NONE;
      saveFortitude = SRD35.SAVE_BONUS_POOR;
      saveReflex = SRD35.SAVE_BONUS_POOR;
      saveWill = SRD35.SAVE_BONUS_GOOD;
      selectableFeatures = [
        'Applicable Knowledge', 'Dodge Trick', 'Instant Mastery',
        'More Newfound Arcana', 'Newfound Arcana', 'Secret Health',
        'Secret Knowledge Of Avoidance', 'Secrets Of Inner Strength',
        'The Lore Of True Stamina', 'Weapon Trick'
      ];
      skillPoints = 4;
      skills = [
        'Appraise', 'Concentration', 'Craft (Alchemy)', 'Decipher Script',
        'Gather Information', 'Handle Animal', 'Heal', 'Knowledge', 'Perform',
        'Profession', 'Speak Language', 'Spellcraft', 'Use Magic Device'
      ];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule('armorClass', 'combatNotes.dodgeTrickFeature', '+', '1');
      rules.defineRule('baseAttack', 'combatNotes.weaponTrickFeature', '+','1');
      rules.defineRule('casterLevelArcane', 'levels.Loremaster', '+=', null);
      rules.defineRule('featCount.General',
        'featureNotes.applicableKnowledgeFeature', '+', '1'
      );
      rules.defineRule('featureNotes.bonusLanguageFeature',
        'levels.Loremaster', '+=', 'Math.floor(source / 4)'
      );
      rules.defineRule('hitPoints', 'combatNotes.secretHealthFeature', '+','3');
      rules.defineRule
        ('languageCount', 'featureNotes.bonusLanguageFeature', '+', null);
      rules.defineRule
        ('magicNotes.casterLevelBonusFeature', 'levels.Loremaster', '+=', null);
      rules.defineRule
        ('save.Fortitude', 'saveNotes.theLoreOfTrueStaminaFeature', '+', '2');
      rules.defineRule
        ('save.Will', 'saveNotes.secretsOfInnerStrengthFeature', '+', '2');
      rules.defineRule('save.Reflex',
        'saveNotes.secretKnowledgeOfAvoidanceFeature', '+', '2'
      );
      rules.defineRule('selectableFeatureCount.Loremaster',
        'levels.Loremaster', '+=', 'Math.floor((source + 1) / 2)'
      );
      rules.defineRule('skillNotes.loreFeature',
        'levels.Loremaster', '+=', null,
        'intelligenceModifier', '+=', null
      );
      rules.defineRule('validationNotes.loremasterClassFeats',
        'levels.Loremaster', '=', '-13',
        // NOTE: False valid w/multiple Skill Focus (.* Knowledge) feats
        /^features.Skill Focus.*Knowledge/, '+', '10',
        // NOTE: False valid w/Natural Spell
        /^features\..*Spell$/, '+', '1',
        /^features\.(Brew|Craft|Forge|Scribe)/, '+', '1',
        '', 'v', '0'
      );
      rules.defineRule('validationNotes.loremasterClassSkills',
        'levels.Loremaster', '=', '-2',
        /^skillModifier\.Knowledge/, '+=', 'source >= 10 ? 1 : null',
        '', 'v', '0'
      );
      rules.defineRule('validationNotes.loremasterClassSpells',
        'levels.Loremaster', '=', '-107',
        // NOTE: False valid w/multiple Div3 spells
        /^spells\..*Div3/, '+', '100',
        /^spells\..*Div\d/, '+', '1',
        '', 'v', '0'
      );

    } else if(klass == 'Mystic Theurge') {

      baseAttack = SRD35.ATTACK_BONUS_POOR;
      features = ['1:Caster Level Bonus'];
      hitDie = 4;
      notes = [
        'magicNotes.casterLevelBonusFeature:' +
          '+%V base class level for spells known/per day',
        'validationNotes.mysticTheurgeClassCasterLevelArcane:' +
          'Requires Caster Level Arcane >= 2',
        'validationNotes.mysticTheurgeClassCasterLevelDivine:' +
          'Requires Caster Level Divine >= 2',
        'validationNotes.mysticTheurgeClassSkills:' +
          'Requires Knowledge (Arcana) >= 6/Knowledge (Religion) >= 6'
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
        'Concentration', 'Craft', 'Decipher Script', 'Knowledge (Arcana)',
        'Knowledge (Religion)', 'Profession', 'Sense Motive', 'Spellcraft'
      ];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule('magicNotes.casterLevelBonusFeature',
        'levels.Mystic Theurge', '+=', null
      );

    } else if(klass == 'Shadowdancer') {

      baseAttack = SRD35.ATTACK_BONUS_AVERAGE;
      features = [
        '1:Hide In Plain Sight',
        '1:Weapon Proficiency ' +
          '(Club/Composite Shortbow/Dagger/Dart/Hand Crossbow/Heavy Crossbow/Light Crossbow/Mace/Morningstar/Punching Dagger/Quaterstaff/Rapier/Sap/Shortbow/Short Sword)',
        '2:Darkvision', '2:Evasion',
        '2:Uncanny Dodge', '3:Shadow Illusion', '3:Summon Shadow',
        '4:Shadow Jump', '5:Defensive Roll', '5:Improved Uncanny Dodge',
        '7:Slippery Mind', '10:Improved Evasion'
      ];
      hitDie = 8;
      notes = [
        'combatNotes.defensiveRollFeature:' +
          'DC damage Reflex save vs. lethal blow for half damage',
        'combatNotes.improvedUncannyDodgeFeature:' +
          'Flanked only by rogue four levels higher',
        'combatNotes.uncannyDodgeFeature:Always adds dexterity modifier to AC',
        'featureNotes.darkvisionFeature:%V ft b/w vision in darkness',
        'magicNotes.shadowIllusionFeature:<i>Silent Image</i> 1/day',
        'magicNotes.shadowJumpFeature:<i>Dimension Door</i> %V ft/day',
        'magicNotes.summonShadowFeature:' +
          'Summon unturnable %V HD Shadow companion',
        'saveNotes.evasionFeature:Reflex save yields no damage instead of 1/2',
        'saveNotes.improvedEvasionFeature:Failed save yields 1/2 damage',
        'saveNotes.slipperyMindFeature:Second save vs. enchantment',
        'skillNotes.hideInPlainSightFeature:Hide even when observed',
        'validationNotes.shadowdancerClassFeats:' +
          'Requires Combat Reflexes/Dodge/Mobility',
        'validationNotes.shadowdancerClassSkills:' +
          'Requires Hide >= 10/Move Silently >= 8/Perform (Dance) >= 5'
      ];
      profArmor = SRD35.PROFICIENCY_LIGHT;
      profShield = SRD35.PROFICIENCY_NONE;
      profWeapon = SRD35.PROFICIENCY_NONE;
      saveFortitude = SRD35.SAVE_BONUS_POOR;
      saveReflex = SRD35.SAVE_BONUS_GOOD;
      saveWill = SRD35.SAVE_BONUS_POOR;
      selectableFeatures = null;
      skillPoints = 6;
      skills = [
        'Balance', 'Bluff', 'Decipher Script', 'Diplomacy', 'Disguise',
        'Escape Artist', 'Hide', 'Jump', 'Listen', 'Move Silently', 'Perform',
        'Profession', 'Search', 'Sleight Of Hand', 'Spot', 'Tumble', 'Use Rope'
      ];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule('featureNotes.darkvisionFeature',
        'shadowdancerFeatures.Darkvision', '^=', '60'
      );
      rules.defineRule('magicNotes.shadowJumpFeature',
        'levels.Shadowdancer', '=',
           'source < 4 ? null : (10 * Math.pow(2, Math.floor((source-2)/2)))'
      );
      rules.defineRule('magicNotes.summonShadowFeature',
        'levels.Shadowdancer', '=',
        'source >= 3 ? Math.floor(source / 3) * 2 : null'
      );

    } else if(klass == 'Thaumaturgist') {

      baseAttack = SRD35.ATTACK_BONUS_POOR;
      features = [
        '1:Caster Level Bonus', '1:Improved Ally', '2:Augment Summoning',
        '3:Extended Summoning', '4:Contingent Conjuration', '5:Planar Cohort'
      ];
      hitDie = 4;
      notes = [
        'magicNotes.augmentSummoningFeature:' +
          'Summoned creatures +4 strength/constitution',
        'magicNotes.casterLevelBonusFeature:' +
          '+%V base class level for spells known/per day',
        'magicNotes.improvedAllyFeature:Planar ally for 1/2 usual payment',
        'magicNotes.extendedSummoningFeature:' +
          'Summoning spells last twice as long',
        'magicNotes.contingentConjurationFeature:' +
          '<i>Contingency</i> on summoning spell',
        'magicNotes.planarCohortFeature:Summoned creature serves as cohort',
        'validationNotes.thaumaturgistClassFeats:' +
          'Requires Spell Focus (Conjuration)',
        'validationNotes.thaumaturgistClassSpells:Requires Lesser Planar Ally'
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
        'Concentration', 'Craft', 'Diplomacy', 'Knowledge (Planes)',
        'Knowledge (Religion)', 'Profession', 'Sense Motive', 'Speak Language',
        'Spellcraft'
      ];
      spellAbility = null;
      spells = null;
      spellsKnown = null;
      spellsPerDay = null;
      rules.defineRule('magicNotes.casterLevelBonusFeature',
        'levels.Thaumaturgist', '+=', null
      );

    } else
      continue;

    SRD35.defineClass
      (rules, klass, hitDie, skillPoints, baseAttack, saveFortitude, saveReflex,
       saveWill, profArmor, profShield, profWeapon, skills, features,
       spellsKnown, spellsPerDay, spellAbility);
    if(notes != null)
      rules.defineNote(notes);
    if(selectableFeatures != null) {
      for(var j = 0; j < selectableFeatures.length; j++) {
        var selectable = selectableFeatures[j];
        var choice = klass + ' - ' + selectable;
        rules.defineChoice('selectableFeatures', choice + ':' + klass);
        rules.defineRule(klass + 'Features.' + selectable,
          'selectableFeatures.' + choice, '+=', null
        );
        rules.defineRule('features.' + selectable,
          'selectableFeatures.' + choice, '+=', null
        );
      }
    }
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

};

/* Defines the SRD v3.5 rules related to Prestige class companion creatures. */
SRD35Prestige.companionRules = function(rules, servants) {
  if(servants != null) {
    SRD35.companionRules(rules, servants, null, null);
    var features = {
      'Companion Evasion': 1, 'Companion Improved Evasion': 1, 
      'Empathic Link': 1, 'Share Saving Throws': 1, 'Share Spells': 1,
      'Speak With Master': 2, 'Blood Bond': 3, 'Companion Resist Spells': 4,
      'Link': 0, 'Devotion' : 0, 'Multiattack': 0
    };
    for(var feature in features) {
      if(features[feature] > 0) {
        rules.defineRule('companionFeatures.' + feature,
          'fiendishServantLevel', '=',
          'source >= ' + features[feature] + ' ? 1 : null'
        );
        rules.defineRule
          ('features.' + feature, 'companionFeatures.' + feature, '=', '1');
      } else {
        // Disable N/A companion features
        rules.defineRule
          ('companionFeatures.' + feature, 'fiendishServantLevel', 'v', '0');
      }
    }
    var notes = [
      'companionNotes.bloodBondFeature:' +
        '+2 attack/check/save when seeing master threatened',
      'companionNotes.shareSavingThrowsFeature:' +
        "Companion uses higher of own or master's saving throws"
    ];
    rules.defineNote(notes);
    rules.defineRule('fiendishServantLevel',
      'features.Fiendish Servant', '?', null,
      'level', '=', 'source < 13 ? 1 : Math.floor((source - 7) / 3)'
    );
    rules.defineRule
      ('companionStats.AC', 'fiendishServantLevel', '+', 'source*2-1');
    rules.defineRule
      ('companionStats.HD', 'fiendishServantLevel', '+', 'source * 2');
    rules.defineRule
      ('companionStats.Int', 'fiendishServantLevel', '=', 'source + 5');
    rules.defineRule
      ('companionStats.Str', 'fiendishServantLevel', '+', null);
  }
};
