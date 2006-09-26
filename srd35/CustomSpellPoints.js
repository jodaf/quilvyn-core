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


function ScribeCustomSpellPoints() {
  ScribeRules.defineRule('Spell Points',
    'casterLevel', '?', null,
    null, '=', '0'
  );
  for(var i = 1; i <= 9; i++) {
    ScribeRules.defineRule('Spell Points',
      'spellsPerDay.C' + i, '+', 'source * ' + i,
      'spellsPerDay.D' + i, '+', 'source * ' + i,
      'spellsPerDay.Dom' + i, '+', 'source * ' + i,
      'spellsPerDay.S' + i, '+', 'source * ' + i,
      'spellsPerDay.W' + i, '+', 'source * ' + i
    );
    if(i <= 6)
      ScribeRules.defineRule
        ('Spell Points', 'spellsPerDay.B' + i, '+', 'source * ' + i);
    if(i <= 4) {
      ScribeRules.defineRule
        ('Spell Points', 'spellsPerDay.P' + i, '+', 'source * ' + i);
      ScribeRules.defineRule
        ('Spell Points', 'spellsPerDay.R' + i, '+', 'source * ' + i);
    }
  }
  ScribeRules.defineSheetElement
    ('Spell Points', 'SpellStats', '<b>Spell Points</b>: %V', 'Spells Known');
}
