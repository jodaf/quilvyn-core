/*
 * This file defines the rule sets available to Quilvyn; by default, only the
 * included v3.5 SRD rule set is available. To add additional plugins, extend
 * this file with RULESET definitions with the same format as shown by the v3.5
 * SRD entry below:
 *   RULESETS['name'] = {
 *     attribute:'value',
 *     attribute:'value',
 *     ...
 *   }
 * Recognized attributes are
 *   url (required): The URL for this rule set, which may be a relative URL.
 *     Generally, the value will be similar to 'plugin/filename.js'.
 *   group: The name of the rule set group to which this rule set belongs. This
 *     is used to title the sections of the plugin picker.
 *   require: Other rule sets that must be present for this rule set. May be a
 *     single string value or an array of strings enclosed in [].
 *   supplement: Used for rule sets that modify existing rule sets, rather than
 *     defining a new one. This names the modified rule set.
 *   init: The name of the initialization function for the rule set. Defaults
 *     to the filename of the plugin.
 */
RULESETS['AD&D First Edition (1E)'] = {
  url:'plugins/OldSchool.js',
  group:'Old School D&D',
  require:'OSRIC.js'
};
RULESETS['Unearthed Arcana (1E)'] = {
  url:'plugins/UnearthedArcana1e.js',
  group:'Old School D&D',
  supplement:'AD&D First Edition (1E)'
};
RULESETS['AD&D Second Edition (2E)'] = {
  url:'plugins/OldSchool.js',
  group:'Old School D&D',
  require:'OSRIC.js'
};
RULESETS['The Complete Psionics Handbook supplement (2E)'] = {
  url:'plugins/OSPsionics.js',
  group:'Old School D&D',
  supplement:'AD&D Second Edition (2E)'
};
RULESETS['OSRIC - Old School Reference and Index Compilation (1E)'] = {
  url:'plugins/OSRIC.js',
  group:'Old School D&D',
  require:'SRD35.js'
};
if(window.location.href.includes('DarkSun')) {
RULESETS['Dark Sun Campaign Setting using AD&D 2E rules'] = {
  url:'plugins/DarkSun2E.js',
  group:'Old School D&D',
  require:['OSRIC.js', 'OldSchool.js', 'OSPsionics.js']
};
}
RULESETS['D&D v3.5'] = {
  url:'plugins/PHB35.js',
  group:'v3.5',
  require:'SRD35.js'
};
RULESETS['v3.5 (SRD only)'] = {
  url:'plugins/SRD35.js',
  group:'v3.5'
};
if(window.location.href.includes('DarkSun')) {
RULESETS['Dark Sun Campaign Setting using SRD v3.5 rules'] = {
  url:'plugins/DarkSun3E.js',
  group:'v3.5',
  require:'SRD35.js'
};
}
RULESETS['Eberron Campaign Setting using D&D v3.5 rules'] = {
  url:'plugins/Eberron.js',
  group:'v3.5',
  require:'PHB35.js'
};
RULESETS['Forgotten Realms Campaign Setting using D&D v3.5 rules'] = {
  url:'plugins/Realms.js',
  group:'v3.5',
  require:'PHB35.js'
};
RULESETS['Midnight Campaign Setting using SRD v3.5 rules'] = {
  url:'plugins/LastAge.js',
  group:'v3.5',
  require:'SRD35.js'
};
RULESETS['Pathfinder 1E'] = {
  url:'plugins/Pathfinder.js',
  group:'Pathfinder',
  require:'SRD35.js'
};
RULESETS["Pathfinder 1E Advanced Player's Guide"] = {
  url:'plugins/PFAPG.js',
  group:'Pathfinder',
  supplement:'Pathfinder 1E'
};
RULESETS['Midnight Campaign Setting using Pathfinder 1E rules'] = {
  url:'plugins/LastAge.js',
  group:'Pathfinder',
  require:'Pathfinder.js'
};
if(window.location.href.includes('PF2E')) {
RULESETS['Pathfinder 2E'] = {
  url:'plugins/Pathfinder2E.js',
  group:'Pathfinder',
  require:'SRD35.js'
};
}
RULESETS['D&D 5E'] = {
  url:'plugins/PHB5E.js',
  group:'5E',
  require:'SRD5E.js'
};
RULESETS['5E (SRD only)'] = {
  url:'plugins/SRD5E.js',
  group:'5E',
  require:'SRD35.js'
};
RULESETS["Tasha's Cauldron supplement to D&D 5E rules"] = {
  url:'plugins/Tasha.js',
  group:'5E',
  supplement:'D&D 5E'
};
RULESETS["Volo's Guide supplement to D&D 5E rules - Character Races"] = {
  url:'plugins/Volo.js',
  group:'5E',
  supplement:'D&D 5E'
};
RULESETS["Volo's Guide supplement to D&D 5E rules - Monstrous Races"] = {
  url:'plugins/Volo.js',
  group:'5E',
  supplement:'D&D 5E'
};
RULESETS["Xanathar's Guide supplement to D&D 5E rules"] = {
  url:'plugins/Xanathar.js',
  group:'5E',
  supplement:'D&D 5E'
};
RULESETS['Eberron Campaign Setting using D&D 5E rules'] = {
  url:'plugins/Eberron5E.js',
  group:'5E',
  require:'PHB5E.js'
};
RULESETS['Midnight Legacy of Darkness Campain Setting using SRD 5E rules'] = {
  url:'plugins/MidnightLegacy.js',
  group:'5E',
  require:'SRD5E.js'
};
RULESETS['Sword Coast Campaign Setting using D&D 5E rules'] = {
  url:'plugins/SwordCoast.js',
  group:'5E',
  require:'PHB5E.js'
};
RULESETS['Taldorei Reborn Campaign Setting using D&D 5E rules'] = {
  url:'plugins/TaldoreiReborn.js',
  group:'5E',
  require:'PHB5E.js'
};
RULESETS['Wildemount Campaign Setting using D&D 5E rules'] = {
  url:'plugins/Wildemount.js',
  group:'5E',
  require:'PHB5E.js'
};
RULESETS["Savage Worlds Deluxe Edition"] = {
  url:'plugins/SWD.js',
  group:'Savage Worlds',
  require:'SWADE.js'
};
RULESETS["Savage Worlds Adventurer's Edition"] = {
  url:'plugins/SWADE.js',
  group:'Savage Worlds'
};
RULESETS["Deadlands - The Weird West"] = {
  url:'plugins/WeirdWest.js',
  group:'Savage Worlds',
  require:'SWADE.js'
};
RULESETS["Hellfrost Campaign Setting using the SWD rules"] = {
  url:'plugins/Hellfrost.js',
  group:'Savage Worlds',
  require:'SWD.js'
};
RULESETS["Hellfrost Campaign Setting using the SWADE rules"] = {
  url:'plugins/Hellfrost.js',
  group:'Savage Worlds',
  require:['SWD.js','SWADE.js']
};
RULESETS["Pathfinder for SWADE"] = {
  url:'plugins/PF4SW.js',
  group:'Savage Worlds',
  require:'SWADE.js'
};
