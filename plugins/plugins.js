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
 *     single string value or an array enclosed in [].
 *   supplement: Used for rule sets that modify existing rule sets, rather than
 *     defining a new one. This names the modified rule set.
 *   autoload: Set to true for rule sets that must be loaded early, generally
 *     because other rule sets depend on variables defined by this rule set.
 *   init: The name of the initialization function for the rule set. Defaults
 *     to the filename of the plugin.
 */
RULESETS['v3.5 (SRD only)'] = {
  url:'plugins/SRD35.js',
  group:'v3.5',
  autoload:true,
};
