/*
Copyright 2004, James J. Hayes

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


function CustomizeSpellPoints(AddElement, AddRules, AddToSheet) {
  AddRules('spellPoints', 'sPoints', '=', 'source <= 0 ? null : source');
  AddRules('sPoints',
    null, '=', '0',
    'levels.Bard', '+', 'source > 2 ? (source - 2) * (source - 1) / 2 : null',
    'levels.Cleric', '+', 'source * (source + 1) / 2',
    'levels.Druid', '+', 'source * (source + 1) / 2',
    'levels.Paladin', '+', 'source > 3 ? (source-3) * (source-2) / 2 : null',
    'levels.Ranger', '+', 'source > 3 ? (source - 3) * (source - 2) / 2 : null',
    'levels.Sorcerer', '+', 'source * (source + 1) / 2',
    'levels.Wizard', '+', 'source * (source + 1) / 2',
    'spellNotes.abilitySpellPointsBonus', '+', null
  );
  AddRules('chaSPModifier',
    null, '=', '0',
    'levels.Bard', '+', 'source > 2 ? source - 2 : null',
    'levels.Sorcerer', '+', null,
    'charismaModifier', '*', null
  );
  AddRules('intSPModifier',
    null, '=', '0',
    'levels.Wizard', '+', null,
    'intelligenceModifier', '*', null
  );
  AddRules('wisSPModifier',
    null, '=', '0',
    'levels.Bard', '+', null,
    'levels.Cleric', '+', null,
    'levels.Paladin', '+', 'source > 3 ? source - 3 : null',
    'levels.Ranger', '+', 'source > 3 ? source - 3 : null',
    'wisdomModifier', '*', null
  );
  AddRules('spellNotes.abilitySpellPointsBonus',
    null, '=', '0',
    'chaSPModifier', '+', null,
    'intSPModifier', '+', null,
    'wisSPModifier', '+', null
  );
  AddToSheet('spellPoints', 'Magic', 'Domains', null);
}
