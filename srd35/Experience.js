/* $Id: Experience.js,v 1.8 2014/08/03 06:18:44 jhayes Exp $ */

/*
Copyright 2011, James J. Hayes

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
 * The SRD defines no method for level advancement.  This module defines level
 * advancement in terms of character experience points--1000 points for level
 * 2, 3000 for level 3, 6000 for level 4, and so forth.  The Experience
 * function adds experience-based level advancement to the SRD35 rule set; it
 * contains an experienceRules method that can be invoked to add experience-
 * based level advancement to other rule sets.
 */
function Experience() {
  if(window.SRD35 == null)
    return;
}

/*
 * Adds experience-based level advancement to #rules#, along with adding
 * experience to the editor and character sheet.
 */
Experience.experienceRules = function(rules) {
  var oldRandomizeOneAttribute = rules.randomizeOneAttribute;
  rules.randomizeOneAttribute = function(attributes, attribute) {
    oldRandomizeOneAttribute.apply(this, arguments);
    if(attribute == 'levels') {
      var level = ScribeUtils.sumMatching(attributes, /^levels\./); 
      var max = level * (level + 1) * 1000 / 2 - 1;
      var min = level * (level - 1) * 1000 / 2;
      attributes.experience = ScribeUtils.random(min, max);
      delete attributes.level;
    }
  };
  rules.defineRule
    ('experienceNeeded', 'level', '=', '1000 * source * (source + 1) / 2');
  rules.defineRule('level',
    'experience', '=', 'Math.floor((1 + Math.sqrt(1 + source / 125)) / 2)'
  );
  rules.defineEditorElement('experience', 'Experience', 'text', [8], 'levels');
  rules.defineSheetElement('ExperienceInfo', 'Level', null, '');
  rules.defineSheetElement('Experience', 'ExperienceInfo/');
  rules.defineSheetElement('Experience Needed', 'ExperienceInfo/', '/%V');
};
