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
    'levels.Bard', '+', 'source * (source + 1) / 2',
    'levels.Cleric', '+', 'source * (source + 1) / 2',
    'levels.Druid', '+', 'source * (source + 1) / 2',
    'levels.Paladin', '+', 'source > 3 ? (source-3) * (source-2) / 2 : null',
    'levels.Ranger', '+', 'source > 3 ? (source - 3) * (source - 2) / 2 : null',
    'levels.Sorcerer', '+', 'source * (source + 1) / 2',
    'levels.Wizard', '+', 'source * (source + 1) / 2',
    'magicNotes.bardChaSPModifier', '+', null,
    'magicNotes.clericWisSPModifier', '+', null,
    'magicNotes.paladinWisSPModifier', '+', null,
    'magicNotes.rangerWisSPModifier', '+', null,
    'magicNotes.sorcererChaSPModifier', '+', null,
    'magicNotes.wizardIntSPModifier', '+', null,
    'magicNotes.abilitySpellPointsBonus', '+', null
  );
  AddRules('chaMod', 'charismaModifier', '=', 'source == 0 ? null : 1');
  AddRules('intMod', 'intelligenceModifier', '=', 'source == 0 ? null : 1');
  AddRules('wisMod', 'wisdomModifier', '=', 'source == 0 ? null : 1');
  AddRules('magicNotes.bardChaSPModifier',
    'chaMod', '?', null,
    'levels.Bard', '=', null,
    'charismaModifier', '*', null
  );
  AddRules('magicNotes.sorcererChaSPModifier',
    'chaMod', '?', null,
    'levels.Sorcerer', '=', null,
    'charismaModifier', '*', null
  );
  AddRules('magicNotes.wizardIntSPModifier',
    'intMod', '?', null,
    'levels.Wizard', '=', null,
    'intelligenceModifier', '*', null
  );
  AddRules('magicNotes.clericWisSPModifier',
    'wisMod', '?', null,
    'levels.Cleric', '=', null,
    'wisdomModifier', '*', null
  );
  AddRules('magicNotes.paladinWisSPModifier',
    'wisMod', '?', null,
    'levels.Paladin', '=', null,
    'wisdomModifier', '*', null
  );
  AddRules('magicNotes.rangerWisSPModifier',
    'wisMod', '?', null,
    'levels.Ranger', '=', null,
    'wisdomModifier', '*', null
  );
  AddToSheet('spellPoints', 'Magic', 'Domains', null);
}
