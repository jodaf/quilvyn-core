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
 * This module loads the Prestige class rules from the System Reference
 * Documents v3.5.  Member methods can be called independently in order to use
 * a subset of the rules.  Similarly, the constant fields of SRDPrestige
 * (CLASSES, COMPANIONS) can be manipulated to modify the choices.
 */
function SRD35Prestige() {
  if(window.SRD35 == null) {
    alert('The SRD35Prestige module requires use of the SRD35 module');
    return;
  }
  SRD35Prestige.identityRules(SRD35.rules, SRD35Prestige.CLASSES);
  SRD35Prestige.magicRules(SRD35.rules, SRD35Prestige.SPELLS);
  SRD35Prestige.talentRules(SRD35.rules, SRD35Prestige.FEATURES);
}

SRD35Prestige.CLASSES = {
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
      '"1:Armor Proficiency (Medium)","1:Shield Proficiency (Heavy)",' +
      '"1:Weapon Proficiency (Martial)",' +
      '"1:Enhance Arrow","2:Imbue Arrow","4:Seeker Arrow","6:Phase Arrow",' +
      '"8:Hail Of Arrows","10:Arrow Of Death"',
  'Arcane Trickster':
    'Require=' +
      '"alignment !~ \'Lawful\'","levels.Rogue >= 3",' +
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
       '"1:Ranged Legerdemain","1:Spell Slot Bonus","2:Sneak Attack",' +
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
      '"1:Spell Slot Bonus" ' +
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
      '"1:Weapon Proficiency (Dagger/Dart/Hand Crossbow/Heavy Crossbow/Light Crossbow/Punching Dagger/Rapier/Sap/Shortbow/Composit Shortbow/Short Sword)",' +
      '"1:Death Attack","1:Poison Use","1:Sneak Attack","2:Poison Tolerance",' +
      '"2:Uncanny Dodge","5:Improved Uncanny Dodge","8:Hide In Plain Sight" ' +
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
      '"1:Armor Proficiency (Heavy)","1:Shield Proficiency (Heavy)",' +
      '"1:Weapon Proficiency (Martial)",' +
      '"1:Aura Of Evil","1:Blackguard Hands","1:Detect Good",' +
      '"1:Fiendish Summoning","1:Poison Use","2:Smite Good",' +
      '"2:Dark Blessing","3:Aura Of Despair","3:Turn Undead",' +
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
      '"1:Bonus Spells","1:Dragon Armor","2:Bite Attack","2:Claw Attack",' +
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
      '"1:Armor Proficiency (Heavy)","1:Shield Proficiency (Heavy)",' +
      '"1:Weapon Proficiency (Martial)",' +
      '"1:Defender Armor","1:Defensive Stance","2:Uncanny Dodge",' +
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
      '"2:Spell Slot Bonus"',
  'Hierophant':
    'Require=' +
      '"skills.Knowledge (Religion) >= 15","spellSlots.C7||spellSlots.D7",' +
      '"sumMetamagicFeats > 0" ' +
    'HitDie=d8 Attack=1/2 SkillPoints=2 Fortitude=1/2 Reflex=1/3 Will=1/2 ' +
    'Skills=' +
      'Concentration,Craft,Diplomacy,Heal,"Knowledge (Arcana)",' +
      '"Knowledge (Religion)",Profession,Spellcraft ' +
    'Selectables=' +
      '"1:Blast Infidel","1:Divine Reach","1:Faith Healing",' +
      '"1:Gift Of The Divine","1:Improved Divine Reach",' +
      '"1:Mastery Of Energy","1:Spell Power","1:Spell-Like Ability",' +
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
      '"1:Spell Slot Bonus",2:Lore,"4:Bonus Language","6:Greater Lore",' +
      '"10:True Lore" ' +
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
      '"1:Spell Slot Bonus"',
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
      '"1:Weapon Proficiency (Club/Composite Shortbow/Dagger/Dart/Hand Crossbow/Heavy Crossbow/Light Crossbow/Mace/Morningstar/Punching Dagger/Quaterstaff/Rapier/Sap/Shortbow/Short Sword)",' +
      '"1:Hide In Plain Sight",2:Darkvision,2:Evasion,"2:Uncanny Dodge",' +
      '"3:Shadow Illusion","3:Summon Shadow","4:Shadow Jump",' +
      '"5:Defensive Roll","5:Improved Uncanny Dodge","7:Slippery Mind",' +
      '"10:Improved Evasion" ' +
    'CasterLevelArcane=level ' +
    // SRD doesn't specify ability; adopt PRD's use of charisma
    'SpellAbility=charisma ' +
    'SpellSlots=' +
      'Shadowdancer1:3=1,' +
      'Shadowdancer4:4=1',
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
      '"1:Improved Ally","1:Spell Slot Bonus","2:Augment Summoning",' +
      '"3:Extended Summoning","4:Contingent Conjuration","5:Planar Cohort"'
};
SRD35Prestige.FEATURES = {
  'Acrobatic Charge':'Section=combat Note="May charge in difficult terrain"',
  'Applicable Knowledge':'Section=feature Note="+1 General Feat"',
  'Arcane Fire':'Section=magic Note="Transform arcane spell into bolt of fire"',
  'Arcane Reach':'Section=magic Note="Use arcane touch spell 30\' away"',
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
    'Note="R30\' Other senses allow detection of unseen objects"',
  'Blood Bond':
    'Section=companion ' +
    'Note="+2 attack, checks, and saves when seeing master threatened"',
  'Bonus Language':'Section=feature Note="+%V Language Count"',
  'Bonus Spells':'Section=magic Note="%V"',
  'Breath Weapon':'Section=combat Note="Breathe %Vd8 HP (DC %1 Ref half) 1/dy"',
  'Canny Defense':'Section=combat Note="Add %V to melee AC when unarmored"',
  'Claw Attack':'Section=combat Note="Attack with claws"',
  'Constitution Boost':'Section=ability Note="+2 Constitution"',
  'Contingent Conjuration':
    'Section=magic Note="<i>Contingency</i> on summoning spell"',
  'Dark Blessing':'Section=save Note="+%V Fortitude/+%V Reflex/+%V Will"',
  'Death Attack':
    'Section=combat ' +
    'Note="Sneak attack after 3 rd of study causes death or paralysis d6+%{levels.Assassin} rd (DC %{levels.Assassin+intelligenceModifier} Fort neg)"',
  'Defender Armor':'Section=combat Note="+%V AC"',
  'Defensive Stance':
     'Section=feature ' +
    'Note="+2 Str, +4 Con, +2 saves, +4 AC while unmoving %V rd %1/dy"',
  'Detect Good':'Section=magic Note="<i>Detect Good</i> at will"',
  'Divine Reach':'Section=magic Note="Use divine touch spell 30\' away"',
  'Dodge Trick':'Section=combat Note="+1 AC"',
  'Dragon Apotheosis':
    'Section=ability,save ' +
    'Note="+4 Strength/+2 Charisma",' +
         '"Immune sleep, paralysis, and breath weapon energy"',
  'Dragon Armor':'Section=combat Note="+%V AC"',
  'Elaborate Parry':'Section=combat Note="+%{levels.Duelist} AC when fighting defensively"',
  'Enhance Arrow':'Section=combat Note="Arrows treated as +%V magic weapons"',
  'Enhanced Mobility':
    'Section=combat Note="+4 AC vs. movement AOO when unarmored"',
  'Extended Summoning':'Section=magic Note="x2 Summoning spell duration"',
  'Faith Healing':
    'Section=magic ' +
    'Note="Healing spells on same-aligned creature have max effect"',
  'Fiendish Servant':
    'Section=feature Note="Animal servant w/special abilities"',
  'Fiendish Summoning':
    'Section=magic Note="<i>Summon Monster I</i> as level %{levels.Blackguard*2} caster 1/dy"',
  'Gift Of The Divine':
    'Section=feature Note="Transfer undead turn/rebuke to another 1-7 days"',
  'Grace':'Section=save Note="+2 Reflex when unarmored"',
  'Greater Lore':'Section=magic Note="<i>Identify</i> at will"',
  'Hail Of Arrows':
    'Section=combat Note="Simultaneously fire arrows at %V targets 1/dy"',
  'Imbue Arrow':'Section=magic Note="Center spell where arrow lands"',
  'Impromptu Sneak Attack':
    'Section=combat Note="Declare any attack a sneak attack %V/dy"',
  'Improved Ally':'Section=magic Note="Planar ally for half usual payment"',
  'Improved Arcane Reach':
    'Section=magic Note="Use arcane touch spell 60\' away"',
  'Improved Divine Reach':
    'Section=magic Note="Use divine touch spell 60\' away"',
  'Improved Reaction':'Section=combat Note="+%V Initiative"',
  'Instant Mastery':'Section=skill Note="+4 Skill Points in untrained skill"',
  'Intelligence Boost':'Section=ability Note="+2 Intelligence"',
  'Lore':'Section=skill Note="+%{levels.Loremaster+intelligenceModifier} Knowledge (local history)"',
  'Mastery Of Counterspelling':
    'Section=magic Note="Counterspell turns effect back on caster"',
  'Mastery Of Elements':'Section=magic Note="Change energy type of spell"',
  'Mastery Of Energy':
    'Section=combat Note="+4 undead turning checks and damage"',
  'Mastery Of Shaping':'Section=magic Note="Create holes in spell effect area"',
  'Mobile Defense':
    'Section=combat Note="Allowed 5\' step during Defensive Stance"',
  'More Newfound Arcana':'Section=magic Note="Bonus level 2 spell"',
  'Newfound Arcana':'Section=magic Note="Bonus level 1 spell"',
  'Phase Arrow':
    'Section=combat Note="Arrow passes through normal obstacles 1/dy"',
  'Planar Cohort':'Section=magic Note="Summoned creature serves as cohort"',
  'Poison Tolerance':'Section=save Note="+%{levels.Assassin//2} vs. poison"',
  'Poison Use':
    'Section=feature Note="No chance of self-poisoning when applying to blade"',
  'Power Of Nature':
    'Section=feature Note="Transfer druid feature to another 1-7 days"',
  'Precise Strike':
    'Section=combat ' +
    'Note="+%{levels.Duelist//5}d6 HP damage with light piercing weapon"',
  'Ranged Legerdemain':
    'Section=combat ' +
    'Note="+5 DC on Disable Device, Open Lock, Sleight Of Hand at 30\' %V/dy"',
  'Secret Health':'Section=combat Note="+3 HP"',
  'Secret Knowledge Of Avoidance':'Section=save Note="+2 Reflex"',
  'Secrets Of Inner Strength':'Section=save Note="+2 Will"',
  'Seeker Arrow':'Section=combat Note="Arrow maneuvers to target 1/dy"',
  'Shadow Illusion':'Section=magic Note="<i>Silent Image</i> 1/dy"',
  'Shadow Jump':'Section=magic Note="<i>Dimension Door</i> %V\'/dy"',
  'Smite Good':'Section=combat Note="+%V attack/+%1 damage vs. good foe %2/dy"',
  'Spell Power':'Section=magic Note="+1 caster level for spell effects"',
  'Spell Slot Bonus':
    'Section=magic ' +
    'Note="+%V base class level for spells known and spells per day"',
  'Spell-Like Ability':'Section=magic Note="Use spell as ability 2+/dy"',
  'Strength Boost':'Section=ability Note="+%V Strength"',
  'Summon Shadow':
    'Section=magic Note="Summon unturnable %{levels.Shadowdancer//3*2} HD Shadow companion"',
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
         '"20 DC cold resistance"',
  'Terrain Mastery (Desert)':
    'Section=combat,save ' +
     'Note="+1 attack and damage vs. desert creatures",' +
          '"Immune fatigue, resist exhaustion"',
  'Terrain Mastery (Fiery)':
    'Section=combat,save ' +
    'Note="+1 attack and damage vs. fire elementals and fire outsiders",' +
         '"20 DC fire resistance"',
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
    'Note="+30\' fly speed on gravityless planes",' +
         '"+1 attack and damage vs. astral, elemental air, and ethereal creatures"',
  'The Lore Of True Stamina':'Section=save Note="+2 Fortitude"',
  'Tremorsense':
    'Section=feature Note="Detect creatures in contact w/ground w/in 30\'"',
  'True Lore':
    'Section=magic Note="<i>Legend Lore</i>, <i>Analyze Dweomer</i> 1/dy"',
  'Undead Companion':
    'Section=feature ' +
    'Note="Unturnable undead servant w/fiendish servant abilities"',
  'Weapon Trick':'Section=combat Note="+1 Melee Attack/+1 Ranged Attack"',
  'Wings':'Section=ability Note="%{speed} Fly Speed"'
};
SRD35Prestige.SPELLS = {
  'Corrupt Weapon':
    'School=Transmutation ' +
    'Level=Blackguard1 ' +
    'Description="Weapon evil aligned, +1 vs. good foe DR for $L min"',
  'Alter Self':'Level=Assassin2',
  "Bull's Strength":'Level=Blackguard2',
  "Cat's Grace":'Level=Assassin2',
  'Cause Fear':'Level=Blackguard1',
  'Clairaudience/Clairvoyance':'Level=Assassin4',
  'Contagion':'Level=Blackguard3',
  'Cure Critical Wounds':'Level=Blackguard4',
  'Cure Light Wounds':'Level=Blackguard1',
  'Cure Moderate Wounds':'Level=Blackguard2',
  'Cure Serious Wounds':'Level=Blackguard3',
  'Darkness':'Level=Assassin2,Blackguard2',
  'Death Knell':'Level=Blackguard2',
  'Deep Slumber':'Level=Assassin3',
  'Deeper Darkness':'Level=Assassin3,Blackguard3',
  'Detect Good':'Level=Blackguard1',
  'Detect Poison':'Level=Assassin1',
  'Dimension Door':'Level=Assassin4,Shadowdancer4',
  'Disguise Self':'Level=Assassin1',
  'Doom':'Level=Blackguard1',
  "Eagle's Splendor":'Level=Blackguard2',
  'False Life':'Level=Assassin3',
  'Feather Fall':'Level=Assassin1',
  "Fox's Cunning":'Level=Assassin2',
  'Freedom Of Movement':'Level=Assassin4,Blackguard4',
  'Ghost Sound':'Level=Assassin1',
  'Glibness':'Level=Assassin4',
  'Greater Invisibility':'Level=Assassin4',
  'Illusory Script':'Level=Assassin2',
  'Inflict Critical Wounds':'Level=Blackguard4',
  'Inflict Light Wounds':'Level=Blackguard1',
  'Inflict Moderate Wounds':'Level=Blackguard2',
  'Inflict Serious Wounds':'Level=Blackguard3',
  'Invisibility':'Level=Assassin2',
  'Jump':'Level=Assassin1',
  'Locate Creature':'Level=Assassin4',
  'Magic Circle Against Good':'Level=Assassin3',
  'Magic Weapon':'Level=Blackguard1',
  'Misdirection':'Level=Assassin3',
  'Modify Memory':'Level=Assassin4',
  'Nondetection':'Level=Assassin3',
  'Obscuring Mist':'Level=Assassin1',
  'Pass Without Trace':'Level=Assassin2',
  'Poison':'Level=Assassin4,Blackguard4',
  'Protection From Energy':'Level=Blackguard3',
  'Shatter':'Level=Blackguard2',
  'Silent Image':'Level=Shaddowncer1',
  'Sleep':'Level=Assassin1',
  'Spider Climb':'Level=Assassin2',
  'Summon Monster I':'Level=Blackguard1',
  'Summon Monster II':'Level=Blackguard2',
  'Summon Monster III':'Level=Blackguard3',
  'Summon Monster IV':'Level=Blackguard4',
  'True Strike':'Level=Assassin1',
  'Undetectable Alignment':'Level=Assassin2'
};

/* Defines rules related to basic character identity. */
SRD35Prestige.identityRules = function(rules, classes) {
  QuilvynUtils.checkAttrTable
    (classes, ['Require', 'HitDie', 'Attack', 'SkillPoints', 'Fortitude', 'Reflex', 'Will', 'Skills', 'Features', 'Selectables', 'Languages', 'CasterLevelArcane', 'CasterLevelDivine', 'SpellAbility', 'SpellSlots', 'Spells']);
  for(var clas in classes) {
    rules.choiceRules(rules, 'Class', clas, classes[clas]);
    SRD35Prestige.classRulesExtra(rules, clas);
  }
};

/* Defines rules related to magic use. */
SRD35Prestige.magicRules = function(rules, spells) {
  QuilvynUtils.checkAttrTable(spells, ['School', 'Level', 'Description']);
  for(var spell in spells) {
    rules.choiceRules
      (rules, 'Spell', spell, (SRD35.SPELLS[spell]||'') + ' ' + spells[spell]);
  }
};

/* Defines rules related to character aptitudes. */
SRD35Prestige.talentRules = function(rules, features) {
  QuilvynUtils.checkAttrTable(features, ['Section', 'Note']);
  for(var feature in features) {
    rules.choiceRules(rules, 'Feature', feature, features[feature]);
  }
};

/*
 * Defines in #rules# the rules associated with class #name# that cannot be
 * derived directly from the attributes passed to classRules.
 */
SRD35Prestige.classRulesExtra = function(rules, name) {

  if(name == 'Arcane Archer') {

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
    rules.defineRule('combatNotes.sneakAttack',
      'levels.Arcane Trickster', '+=', 'Math.floor(source / 2)'
    );
    rules.defineRule
      ('magicNotes.spellSlotBonus', 'levels.Arcane Trickster', '+=', null);

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
    rules.defineRule
      ('magicNotes.spellSlotBonus', 'levels.Archmage', '+=', null);
    rules.defineRule
      ('selectableFeatureCount.Archmage', 'levels.Archmage', '+=', null);

  } else if(name == 'Assassin') {

    rules.defineRule('combatNotes.sneakAttack',
      'levels.Assassin', '+=', 'Math.floor((source + 1) / 2)'
    );
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

  } else if(name == 'Blackguard') {

    rules.defineRule('combatNotes.smiteGood',
      'charismaModifier', '=', 'source > 0 ? source : 0'
    );
    rules.defineRule('combatNotes.smiteGood.1', 'levels.Blackguard', '=', null);
    rules.defineRule('combatNotes.smiteGood.2',
      'levels.Blackguard', '+=', 'source<2 ? null : 1 + Math.floor(source/5)'
    );
    rules.defineRule('combatNotes.sneakAttack',
      'levels.Blackguard', '+=', 'source<4 ? null : Math.floor((source-1)/3)'
    );
    rules.defineRule('magicNotes.blackguardHands',
      'level', '+=', null,
      'charismaModifier', '*', null
    );
    rules.defineRule('saveNotes.darkBlessing',
      'charismaModifier', '=', 'source > 0 ? source : null'
    );
    rules.defineRule('turningLevel',
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
    rules.defineRule('combatNotes.smiteGood',
      'levels.Paladin', '+', 'source >= 9 ? 3 : source >= 5 ? 2 : 1'
    );
    // NOTE: Minor bug: this will also effect the sneak attack feature of
    // some unlikely combinations, e.g., rogue/paladin
    rules.defineRule('combatNotes.sneakAttack',
      'levels.Paladin', '+', 'source >= 5 ? 1 : null'
    );

    // Use animal companion stats and features for fiendish servant abilities
    var features = [
      '5:Companion Evasion', '5:Companion Improved Evasion', 
      '5:Empathic Link', '5:Share Saving Throws', '5:Share Spells',
      '13:Speak With Master', '16:Blood Bond', '19:Companion Resist Spells'
    ];
    QuilvynRules.featureListRules
      (rules, features, 'Animal Companion', 'fiendishServantMasterLevel', false);
    rules.defineRule('fiendishServantMasterBaseSaveFort',
      'fiendishServantMasterLevel', '?', null,
      'levels.Blackguard', '=', SRD35.SAVE_BONUS_GOOD,
      'levels.Barbarian', '+', SRD35.SAVE_BONUS_GOOD,
      'levels.Bard', '+', SRD35.SAVE_BONUS_POOR,
      'levels.Cleric', '+', SRD35.SAVE_BONUS_GOOD,
      'levels.Druid', '+', SRD35.SAVE_BONUS_GOOD,
      'levels.Fighter', '+', SRD35.SAVE_BONUS_GOOD,
      'levels.Monk', '+', SRD35.SAVE_BONUS_GOOD,
      'levels.Ranger', '+', SRD35.SAVE_BONUS_GOOD,
      'levels.Rogue', '+', SRD35.SAVE_BONUS_POOR,
      'levels.Sorcerer', '+', SRD35.SAVE_BONUS_POOR,
      'levels.Wizard', '+', SRD35.SAVE_BONUS_POOR
    );
    rules.defineRule('fiendishServantMasterBaseSaveRef',
      'fiendishServantMasterLevel', '?', null,
      'levels.Blackguard', '=', SRD35.SAVE_BONUS_POOR,
      'levels.Barbarian', '+', SRD35.SAVE_BONUS_POOR,
      'levels.Bard', '+', SRD35.SAVE_BONUS_GOOD,
      'levels.Cleric', '+', SRD35.SAVE_BONUS_POOR,
      'levels.Druid', '+', SRD35.SAVE_BONUS_POOR,
      'levels.Fighter', '+', SRD35.SAVE_BONUS_POOR,
      'levels.Monk', '+', SRD35.SAVE_BONUS_GOOD,
      'levels.Ranger', '+', SRD35.SAVE_BONUS_GOOD,
      'levels.Rogue', '+', SRD35.SAVE_BONUS_GOOD,
      'levels.Sorcerer', '+', SRD35.SAVE_BONUS_POOR,
      'levels.Wizard', '+', SRD35.SAVE_BONUS_POOR
    );
    rules.defineRule('fiendishServantMasterBaseSaveWill',
      'fiendishServantMasterLevel', '?', null,
      'levels.Blackguard', '=', SRD35.SAVE_BONUS_POOR,
      'levels.Barbarian', '+', SRD35.SAVE_BONUS_POOR,
      'levels.Bard', '+', SRD35.SAVE_BONUS_GOOD,
      'levels.Cleric', '+', SRD35.SAVE_BONUS_GOOD,
      'levels.Druid', '+', SRD35.SAVE_BONUS_GOOD,
      'levels.Fighter', '+', SRD35.SAVE_BONUS_POOR,
      'levels.Monk', '+', SRD35.SAVE_BONUS_GOOD,
      'levels.Ranger', '+', SRD35.SAVE_BONUS_POOR,
      'levels.Rogue', '+', SRD35.SAVE_BONUS_POOR,
      'levels.Sorcerer', '+', SRD35.SAVE_BONUS_GOOD,
      'levels.Wizard', '+', SRD35.SAVE_BONUS_GOOD
    );
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
    rules.defineRule('companionNotes.shareSavingThrows.1',
      'fiendishServantMasterBaseSaveFort', '=', null
    );
    rules.defineRule('companionNotes.shareSavingThrows.2',
      'fiendishServantMasterBaseSaveRef', '=', null
    );
    rules.defineRule('companionNotes.shareSavingThrows.3',
      'fiendishServantMasterBaseSaveWill', '=', null
    );
    rules.defineRule('fiendishServantMasterLevel',
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
    rules.defineRule('combatNotes.dragonArmor',
      'levels.Dragon Disciple', '+=', 'Math.floor((source + 2) / 3)'
    );
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
      'levels.Dwarven Defender', '+=', 'source<6 ? null : source<10 ? 3 : 6'
    );
    rules.defineRule('combatNotes.defenderArmor',
      'levels.Dwarven Defender', '+=', 'Math.floor((source + 2) / 3)'
    );
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

    rules.defineRule('featCount.Fighter', 'levels.Eldritch Knight', '+=','1');
    rules.defineRule
      ('magicNotes.spellSlotBonus', 'levels.Eldritch Knight', '+=', 'source-1');
 
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

    rules.defineRule('features.Tremorsense',
      'features.Terrain Mastery (Cavernous)', '=', '1'
    );
    rules.defineRule('selectableFeatureCount.Horizon Walker',
      'levels.Horizon Walker', '+=', null
    );

  } else if(name == 'Loremaster') {

    var allSkills = rules.getChoices('skills');
    for(var skill in allSkills) {
      if(skill.startsWith('Knowledge '))
        rules.defineRule('countKnowledgeSkillsGe10',
          'skills.' + skill, '+=', 'source >= 10 ? 1 : null'
        );
    }
    rules.defineRule('casterLevelArcane', 'levels.Loremaster', '+=', null);
    rules.defineRule('featureNotes.bonusLanguage',
      'levels.Loremaster', '+=', 'Math.floor(source / 4)'
    );
    rules.defineRule
      ('magicNotes.spellSlotBonus', 'levels.Loremaster', '+=', null);
    rules.defineRule('selectableFeatureCount.Loremaster',
      'levels.Loremaster', '+=', 'Math.floor((source + 1) / 2)'
    );

  } else if(name == 'Mystic Theurge') {

    rules.defineRule
      ('magicNotes.spellSlotBonus', 'levels.Mystic Theurge', '+=', null);

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
      ('magicNotes.spellSlotBonus', 'levels.Thaumaturgist', '+=', null);

  }

};
