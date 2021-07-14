/*
Copyright 2021, James J. Hayes

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
 * This module loads the rules from the Players Handbook v3.5. The PHB35
 * function contains methods that load rules for particular parts of the PHB,
 * currently limited to deityRules for deity definitions. Member methods can be
 * called independently in order to use a subset of the PHB v3.5 rules.
 * Similarly, the constant fields of PHB35 (DEITIES) can be manipulated to
 * modify the choices.
 */
function PHB35() {

  if(window.SRD35 == null) {
    alert('The PHB35 module requires use of the SRD35 module');
    return;
  }

  PHB35.identityRules(SRD35.rules, PHB35.DEITIES);

}

PHB35.DEITIES = {
  'None':'',
  'Corellon Larethian':
    'Alignment=CG ' +
    'Weapon=Longsword ' +
    'Domain=Chaos,Good,Protection,War',
  'Garl Glittergold':
    'Alignment=NG ' +
    'Weapon=Battleaxe ' +
    'Domain=Good,Protection,Trickery',
  'St. Cuthbert':
    'Alignment=LN ' +
    'Weapon="Heavy Mace","Light Mace" ' +
    'Domain=Destruction,Law,Protection,Strength',
  'Wee Jas':
    'Alignment=LN ' +
    'Weapon=Dagger ' +
    'Domain=Death,Law,Magic',
  'Boccob':
    'Alignment=N ' +
    'Weapon=Quarterstaff ' +
    'Domain=Knowledge,Magic,Trickery',
  'Ehlonna':
    'Alignment=NG ' +
    'Weapon=Longbow ' +
    'Domain=Animal,Good,Plant,Sun',
  'Erythnul':
    'Alignment=CE ' +
    'Weapon=Morningstar ' +
    'Domain=Chaos,Evil,Trickery,War',
  'Fharlanghn':
    'Alignment=N ' +
    'Weapon=Quarterstaff ' +
    'Domain=Luck,Protection,Travel',
  'Gruumsh':
    'Alignment=CE ' +
    'Weapon=Spear ' +
    'Domain=Chaos,Evil,Strength,War',
  'Heironeous':
    'Alignment=LG ' +
    'Weapon=Longsword ' +
    'Domain=Good,Law,War',
  'Hextor':
    'Alignment=LE ' +
    'Weapon=Flail ' +
    'Domain=Destruction,Evil,Law,War',
  'Kord':
    'Alignment=CG ' +
    'Weapon=Greatsword ' +
    'Domain=Chaos,Good,Luck,Strength',
  'Moradin':
    'Alignment=LG ' +
    'Weapon=Warhammer ' +
    'Domain=Earth,Good,Law,Protection',
  'Nerull':
    'Alignment=NE ' +
    'Weapon=Scythe ' +
    'Domain=Death,Evil,Trickery',
  'Oba-Hai':
    'Alignment=N ' +
    'Weapon=Quarterstaff ' +
    'Domain=Air,Animal,Earth,Fire,Plant,Water',
  'Olidammara':
    'Alignment=CN ' +
    'Weapon=Rapier ' +
    'Domain=Chaos,Luck,Trickery',
  'Pelor':
    'Alignment=NG ' +
    'Weapon="Heavy Mace","Light Mace" ' +
    'Domain=Good,Healing,Strength,Sun',
  'Vecna':
    'Alignment=NE ' +
    'Weapon=Dagger ' +
    'Domain=Evil,Knowledge,Magic',
  'Yondalla':
    'Alignment=LG ' +
    'Weapon="Short Sword" ' +
    'Domain=Good,Law,Protection'
};

/* Defines rules related to basic character identity. */
PHB35.identityRules = function(rules, deities) {

  QuilvynUtils.checkAttrTable(deities, ['Alignment', 'Domain', 'Weapon']);
  for(var deity in deities) {
    rules.choiceRules(rules, 'Deity', deity, deities[deity]);
  }

};
