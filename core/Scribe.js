/* $Id: Scribe.js,v 1.52 2004/12/05 07:26:00 Jim Exp $ */

var COPYRIGHT = 'Copyright 2004 James J. Hayes';
var ABOUT_TEXT =
'Scribe Character Editor version 0.11.1\n' +
'The Scribe Character Editor is ' + COPYRIGHT + '\n' +
'This program is free software; you can redistribute it and/or modify it ' +
'under the terms of the GNU General Public License as published by the Free ' +
'Software Foundation; either version 2 of the License, or (at your option) ' +
'any later version.\n' +
'This program is distributed in the hope that it will be useful, but WITHOUT ' +
'ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or ' +
'FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for ' +
'more details.\n' +
'You should have received a copy of the GNU General Public License along ' +
'with this program; if not, write to the Free Software Foundation, Inc., 59 ' +
'Temple Place, Suite 330, Boston, MA 02111-1307 USA.';

var COOKIE_FIELD_SEPARATOR = '\n';
var COOKIE_NAME = 'ScribeCookie';
var TIMEOUT_DELAY = 1000;

var character;
var cookieInfo = {
  recent: ''
};
var editor;
var editWindow;
var loadingPopup = null;
var loadingWindow;
var rules;
var sheetWindow;
var urlLoading = null;
var viewer;

function AddUserRules() {
  rules.AddRules.apply(rules, arguments);
}

function AddUserView(name, within, before, format) {
  name = name.replace(/([a-z])([A-Z])/g, '$1 $2').
         replace(/(^|[ ._])[a-z]/g, function(c) {return c.toUpperCase();});
  viewer.addElements(
    {name: name, within: within, before: before, format: format}
  );
}

function FullUrl(url) {
  if(url.match(/^\w*:/) == null)
    url = URL_PREFIX + url;
  if(url.match(/\.\w*$/) == null)
    url += URL_SUFFIX;
  return url;
}

function InitialEditor() {
  var a;
  var result = new FormController();
  var spellsCategoryOptions = [];
  var skills = [];
  var weapons = [];
  for(a in DndCharacter.skillsAbility)
    skills.push(a);
  skills.sort();
  for(a in DndCharacter.spellsCategoryCodes)
    spellsCategoryOptions.push
      (a + '(' + DndCharacter.spellsCategoryCodes[a] + ')');
  spellsCategoryOptions.sort();
  for(a in DndCharacter.weaponsDamage)
    weapons.push(a);
  result.setCallback(Update);
  result.addElements(
    '', 'about', 'button', ['About'],
    '', 'help', 'button', ['Help'],
    '', 'view', 'button', ['View Html'],
    '', 'file', 'select', ['--New/Open--'],
    '', 'clear', 'select',
      ['--Clear--', 'alignment', 'armor', 'charisma', 'class',
       'constitution', 'deity', 'dexterity', 'feats', 'gender',
       'domains', 'hitPoints', 'intelligence', 'languages', 'name', 'race',
       'shield', 'skills', 'spells', 'strength', 'weapons', 'wisdom'],
    '', 'randomize', 'select',
      ['--Randomize--', 'alignment', 'armor', 'charisma', 'class',
       'constitution', 'deity', 'dexterity', 'domains', 'feats', 'gender',
       'hitPoints', 'intelligence', 'languages', 'name', 'race',
       'shield', 'skills', 'spells', 'strength', 'weapons', 'wisdom'],
    '', 'validate', 'button', ['Validate'],
    'Name', 'name', 'text', [20],
    'Race', 'race', 'select', DndCharacter.races,
    'Experience', 'experience', 'range', [0,9999999],
    'Levels', 'levels', 'bag', DndCharacter.classes,
    'Strength', 'strength', 'range', [3,18],
    'Intelligence', 'intelligence', 'range', [3,18],
    'Wisdom', 'wisdom', 'range', [3,18],
    'Dexterity', 'dexterity', 'range', [3,18],
    'Constitution', 'constitution', 'range', [3,18],
    'Charisma', 'charisma', 'range', [3,18],
    'Player', 'player', 'text', [20],
    'Alignment', 'alignment', 'select', DndCharacter.alignments,
    'Gender', 'gender', 'select', DndCharacter.genders,
    'Deity', 'deity', 'select', DndCharacter.deities,
    'Origin', 'origin', 'text', [20],
    'Feats', 'feats', 'bag', DndCharacter.feats,
    'Skills', 'skills', 'bag', skills,
    'Languages', 'languages', 'set', DndCharacter.languages,
    'Hit Points', 'hitPoints', 'range', [0,999],
    'Armor', 'armor', 'select', DndCharacter.armors,
    'Shield', 'shield', 'select', DndCharacter.shields,
    'Weapons', 'weapons', 'bag', weapons,
    'Weapon Focus', 'focus', 'set', weapons,
    'Weapon Specialization', 'specialization', 'set', weapons,
    'Spell Categories', 'spellcats', 'set', spellsCategoryOptions,
    'Spells', 'spells', 'set', [],
    'Goodies', 'goodies', 'bag', DndCharacter.goodies,
    'Cleric Domains', 'domains', 'set', DndCharacter.domains,
    'Wizard Specialization', 'specialize', 'set', DndCharacter.schools,
    'Wizard Prohibition', 'prohibit', 'set', DndCharacter.schools,
    'Notes', 'notes', 'text', [40,10]
  );
  return result;
}

function InitialRuleEngine() {
  var i;
  var result = new RuleEngine();
  var versions;
  DndCharacter.LoadVersion3Rules(result);
  versions = CLASS_RULES_VERSION.split(';');
  for(i = 0; i < versions.length; i++)
    DndCharacter.LoadVersion3PointRules(result, versions[i], 'class');
  versions = FEAT_RULES_VERSION.split(';');
  for(i = 0; i < versions.length; i++)
    DndCharacter.LoadVersion3PointRules(result, versions[i], 'feat');
  versions = MAGIC_RULES_VERSION.split(';');
  for(i = 0; i < versions.length; i++)
    DndCharacter.LoadVersion3PointRules(result, versions[i], 'magic');
  return result;
}

function InitialViewer() {
  var result = new ObjectViewer();
  result.addElements(
    {name: '_top', borders: 1},
    {name: 'Header', within: '_top', compact: 1},
      {name: 'Name', within: 'Header', format: '<b>%V</b>'},
      {name: 'Race', within: 'Header', format: ' -- <b>%V</b>'},
      {name: 'Levels', within: 'Header', format: ' <b>%V</b>'},
    {name: 'Attributes Break', within: '_top', format: '\n'},
    {name: 'Attributes', within: '_top'},
      {name: 'StrSection', within: 'Attributes', compact: 1},
        {name: 'Strength', within: 'StrSection'},
        {name: 'Strength Modifier', within: 'StrSection', format: ' (%V)'},
      {name: 'IntSection', within: 'Attributes', compact: 1},
        {name: 'Intelligence', within: 'IntSection'},
        {name: 'Intelligence Modifier', within: 'IntSection', format: ' (%V)'},
      {name: 'WisSection', within: 'Attributes', compact: 1},
        {name: 'Wisdom', within: 'WisSection'},
        {name: 'Wisdom Modifier', within: 'WisSection', format: ' (%V)'},
      {name: 'DexSection', within: 'Attributes', compact: 1},
        {name: 'Dexterity', within: 'DexSection'},
        {name: 'Dexterity Modifier', within: 'DexSection', format: ' (%V)'},
      {name: 'ConSection', within: 'Attributes', compact: 1},
        {name: 'Constitution', within: 'ConSection'},
        {name: 'Constitution Modifier', within: 'ConSection', format: ' (%V)'},
      {name: 'ChaSection', within: 'Attributes', compact: 1},
        {name: 'Charisma', within: 'ChaSection'},
        {name: 'Charisma Modifier', within: 'ChaSection', format: ' (%V)'},
      {name: 'Experience Break', within: 'Attributes', format: '\n'},
      {name: 'ExpSection', within: 'Attributes', compact: 1},
        {name: 'Experience', within: 'ExpSection'},
        {name: 'Needs', within: 'ExpSection', format: '/%V'},
      {name: 'Level', within: 'Attributes'},
      {name: 'Alignment', within: 'Attributes'},
      {name: 'Deity', within: 'Attributes'},
      {name: 'Origin', within: 'Attributes'},
      {name: 'Gender', within: 'Attributes'},
      {name: 'Player', within: 'Attributes'},
      {name: 'Ability Notes Break', within: 'Attributes', format: '\n'},
      {name: 'Ability Notes', within: 'Attributes'},
    {name: 'FeatsAndSkills Break', within: '_top', format: '\n'},
    {name: 'FeatsAndSkills', within: '_top', title: 'Feats/Features/Skills'},
      {name: 'Feat Count', within: 'FeatsAndSkills'},
      {name: 'Skill Points', within: 'FeatsAndSkills'},
      {name: 'Class Skill Max Ranks', within: 'FeatsAndSkills'},
      {name: 'Cross Skill Max Ranks', within: 'FeatsAndSkills'},
      {name: 'Feats Break', within: 'FeatsAndSkills', format: '\n'},
      {name: 'Feats', within: 'FeatsAndSkills'},
      {name: 'Features Break', within: 'FeatsAndSkills', format: '\n'},
      {name: 'Features', within: 'FeatsAndSkills'},
      {name: 'Feat Notes Break', within: 'FeatsAndSkills', format: '\n'},
      {name: 'Feat Notes', within: 'FeatsAndSkills'},
      {name: 'Skills Break', within: 'FeatsAndSkills', format: '\n'},
      {name: 'Skills', within: 'FeatsAndSkills'},
      {name: 'Skill Notes Break', within: 'FeatsAndSkills', format: '\n'},
      {name: 'Skill Notes', within: 'FeatsAndSkills'},
      {name: 'Languages Break', within: 'FeatsAndSkills', format: '\n'},
      {name: 'Language Count', within: 'FeatsAndSkills'},
      {name: 'Languages', within: 'FeatsAndSkills'},
    {name: 'Melee Break', within: '_top', format: '\n'},
    {name: 'Melee', within: '_top', title: 'Melee'},
      {name: 'Hit Points', within: 'Melee'},
      {name: 'Armor', within: 'Melee'},
      {name: 'Shield', within: 'Melee'},
      {name: 'Armor Class', within: 'Melee'},
      {name: 'Speed', within: 'Melee'},
      {name: 'Run', within: 'Melee'},
      {name: 'Armor Proficiency Break', within: 'Melee', format: '\n'},
      {name: 'Armor Proficiency', within: 'Melee'},
      {name: 'Shield Proficiency', within: 'Melee'},
      {name: 'Weapon Proficiency', within: 'Melee'},
      {name: 'Initiative Break', within: 'Melee', format: '\n'},
      {name: 'Initiative', within: 'Melee'},
      {name: 'Melee Attack', within: 'Melee'},
      {name: 'Ranged Attack', within: 'Melee'},
      {name: 'Unarmed Damage', within: 'Melee'},
      {name: 'Turning Frequency Break', within: 'Melee', format: '\n'},
      {name: 'Turning Frequency', within: 'Melee', format: '<b>%N</b>: %V/Day'},
      {name: 'Turning Damage Modifier', within: 'Melee',
        format: '<b>Turning Damage</b>: 2d6+%V'},
      {name: 'Weapons Break', within: 'Melee', format: '\n'},
      {name: 'Weapons', within: 'Melee'},
      {name: 'Focus', within: 'Melee'},
      {name: 'Specialization', within: 'Melee'},
      {name: 'Melee Notes Break', within: 'Melee', format: '\n'},
      {name: 'Melee Notes', within: 'Melee'},
      {name: 'Save Fortitude Break', within: 'Melee', format: '\n'},
      {name: 'Save Fortitude', within: 'Melee'},
      {name: 'Save Reflex', within: 'Melee'},
      {name: 'Save Will', within: 'Melee'},
      {name: 'Save Notes Break', within: 'Melee', format: '\n'},
      {name: 'Save Notes', within: 'Melee'},
    {name: 'Magic Break', within: '_top', format: '\n'},
    {name: 'Magic', within: '_top', title: 'Magic'},
      {name: 'Spells Per Day', within: 'Magic'},
      {name: 'Spells Break', within: 'Magic', format: '\n'},
      {name: 'Spells', within: 'Magic'},
      {name: 'Domains Break', within: 'Magic', format: '\n'},
      {name: 'Domains', within: 'Magic'},
      {name: 'Specialize', within: 'Magic'},
      {name: 'Prohibit', within: 'Magic'},
      {name: 'Goodies Break', within: 'Magic', format: '\n'},
      {name: 'Goodies', within: 'Magic'},
      {name: 'Magic Notes Break', within: 'Magic', format: '\n'},
      {name: 'Magic Notes', within: 'Magic'},
    {name: 'Notes Break', within: '_top', format: '\n'},
    {name: 'NotesSection', within: '_top', title: 'Notes'},
      {name: 'Notes', within: 'NotesSection', format: '%V'}
  );
  return result;
}

function LoadCharacter(name) {
  url = FullUrl(name);
  if(urlLoading == url && loadingWindow.attributes != null) {
    /* Character done loading. */
    var i;
    var names = cookieInfo.recent.split(',');
    for(i = 0; i < names.length && names[i] != name; i++)
      ; /* empty */
    if(i < names.length)
      names.splice(i, 1);
    names.unshift(name);
    names.splice(MAX_RECENT_OPENS);
    cookieInfo.recent = names.join(',');
    StoreCookie();
    RefreshRecentOpens();
    character = new DndCharacter(null);
    for(var e in loadingWindow.attributes) {
      var value = loadingWindow.attributes[e];
      /*
       * Turn objects into "dot" attributes and convert values from prior
       * versions of Scribe.
       */
      if(typeof value == 'object') {
        for(var x in value) {
          var convertedName = x;
          if(e == 'domains' && (i = convertedName.indexOf(' Domain')) >= 0)
            convertedName = convertedName.substring(0, i);
          else if(e == 'feats' && x == 'Expertise')
            convertedName = 'Combat Expertise';
          else if(e == 'skills' && x == 'Pick Pocket')
            convertedName = 'Sleight of Hand';
          else if(e == 'skills' && x == 'Wilderness Lore')
            convertedName = 'Survival';
          else if(e == 'weapons' && (i = convertedName.indexOf(' (')) >= 0)
            convertedName = convertedName.substring(0, i);
          character.attributes[e + '.' + convertedName] = value[x];
        }
      }
      else if(e == 'shield' && value.indexOf('Large') == 0)
        character.attributes[e] = 'Heavy' + value.substring(5);
      else if(e == 'shield' && value.indexOf('Small') == 0)
        character.attributes[e] = 'Light' + value.substring(5);
      else
        character.attributes[e] = value;
    }
    RefreshEditor(false);
    RefreshSheet();
    urlLoading = null;
    if(!loadingPopup.closed)
      loadingPopup.close();
  }
  else if(urlLoading == url && loadingPopup.closed)
    /* User cancel. */
    urlLoading = null;
  else if(urlLoading == null) {
    /* Nothing presently loading. */
    urlLoading = url;
    loadingPopup =
      PopUp('Loading character from ' + url, 'Cancel', 'window.close();');
    loadingWindow.attributes = null;
    try {
      loadingWindow.location = url;
    } catch(e) {
      loadingPopup.close();
      urlLoading = null;
      alert('Attempt to load ' + url + ' failed');
    }
    if(urlLoading != null)
      setTimeout('LoadCharacter("' + name + '")', TIMEOUT_DELAY);
  }
  else
    /* Something (possibly this function) in progress; try again later. */
    setTimeout('LoadCharacter("' + name + '")', TIMEOUT_DELAY);
}

function OpenDialog() {
  if(loadingPopup != null && !loadingPopup.closed)
    return; /* Ignore during load. */
  var name = prompt('Enter URL to Edit (Blank for Random Character)', '');
  if(name == null)
    return; /* User cancel. */
  else if(name == '')
    RandomizeCharacter();
  else
    LoadCharacter(name);
}

function PopUp(html, button, action /* ... */) {
  var popup = window.open
    ('about:blank', 'pop' + PopUp.next++, 'height=200,width=400');
  var content = '<html><head><title>Scribe Message</title></head>\n' +
                '<body bgcolor="' + BACKGROUND + '">' + html +
                '<br/>\n<form>\n';
  for(var i = 1; i < arguments.length; i += 2)
    content +=
      '<input type="button" value="' + arguments[i] + '" ' +
                           'onclick="' + arguments[i + 1] + '"/>\n';
  content += '</form>\n</body></html>';
  popup.document.write(content);
  popup.document.close();
  return popup;
}
PopUp.next = 0;

function RandomizeCharacter() {
  var i;
  if(urlLoading == 'random' && loadingPopup.closed)
    /* User cancel. */
    urlLoading = null;
  else if(urlLoading == 'random' && loadingPopup.okay != null) {
    var totalLevels = 0;
    var value;
    character = new DndCharacter(null);
    for(i = 0; i < DndCharacter.classes.length; i++) {
      var attr = 'levels.' + DndCharacter.classes[i];
      if((value = loadingPopup.fc.getElementValue(attr)) != null &&
         value > 0) {
        character.attributes[attr] = value;
        totalLevels += character.attributes[attr];
      }
    }
    if(totalLevels == 0) {
      character.Randomize(rules, 'class');
      totalLevels = 1;
    }
    character.attributes.experience = totalLevels * (totalLevels-1) * 1000 / 2;
    for(var a in DndCharacter.defaults)
      character.Randomize(rules, a);
    if((value = loadingPopup.fc.getElementValue('race')) != '(Random)')
      character.attributes.race = value;
    character.Randomize(rules, 'domains');
    character.Randomize(rules, 'feats');
    character.Randomize(rules, 'languages');
    character.Randomize(rules, 'skills');
    character.Randomize(rules, 'spells');
    character.Randomize(rules, 'weapons');
    RefreshEditor(false);
    RefreshSheet();
    loadingPopup.close();
    urlLoading = null;
  }
  else if(urlLoading == null) {
    /* Nothing presently loading. */
    var fixedAttributes = new FormController();
    var races = ['(Random)'];
    races = races.concat(DndCharacter.races);
    fixedAttributes.addElements(
      'Race', 'race', 'select', races,
      'Levels', 'levels', 'bag', DndCharacter.classes
    );
    urlLoading = 'random';
    loadingPopup = window.open('about:blank', 'randomWin');
    loadingPopup.document.write(
      '<html><head><title>Editor</title></head>\n' +
      '<body bgcolor="' + BACKGROUND + '">\n' +
      '<img src="' + LOGO_URL + ' "/><br/>\n' +
      '<h2>Fixed Attributes</h2>'
    );
    fixedAttributes.writeToWindow(loadingPopup, 'red');
    loadingPopup.document.write(
      '<form>\n' +
      '<input type="button" value="Ok" onclick="okay=1;"/>\n' +
      '<input type="button" value="Cancel" onclick="window.close();"/>\n' +
      '</form></body></html>\n'
    );
    loadingPopup.document.close();
    fixedAttributes.setElementValue('race', '(Random)');
    loadingPopup.fc = fixedAttributes;
    loadingPopup.okay = null;
    setTimeout('RandomizeCharacter()', TIMEOUT_DELAY);
  }
  else
    /* Something (possibly this function) in progress; try again later. */
    setTimeout('RandomizeCharacter()', TIMEOUT_DELAY);
}

function RefreshEditor(redraw) {
  if(redraw) {
    editWindow.document.write(
      '<html><head><title>Editor</title></head>\n' +
      '<body bgcolor="' + BACKGROUND + '">' +
      '<img src="' + LOGO_URL + ' "/><br/>');
    editor.writeToWindow(editWindow, 'ched');
    editWindow.document.write(
      '</body></html>\n'
    );
    editWindow.document.close();
  }
  editor.setElementValues(character.attributes);
  RefreshSpellSelections(true);
}

function RefreshRecentOpens() {
  var names = cookieInfo.recent.split(',');
  for(var i = names.length - 1; i >= 0; i--)
    if(names[i] == '')
      names.splice(i, 1);
  names.unshift('--New/Open--', 'New...', 'Open...');
  editor.setElementSelections('file', names);
}

function RefreshSheet() {
  if(sheetWindow == null || sheetWindow.closed)
    sheetWindow = window.open('about:blank', 'scribeSheet');
  sheetWindow.document.write(SheetHtml());
  sheetWindow.document.close();
}

function RefreshSpellSelections(resetToCharacter) {
  var a;
  var i;
  var code;
  var codesToDisplay = {};
  var matchInfo;
  var option;
  if(resetToCharacter) {
    for(a in DndCharacter.spellsCategoryCodes)
      codesToDisplay[DndCharacter.spellsCategoryCodes[a]] = 0;
    for(a in character.attributes) {
      if((matchInfo = a.match(/^spells\..*\((\D+)\d+\)$/)) != null)
        codesToDisplay[matchInfo[1]] = 1;
      else if((matchInfo = a.match(/^domains\.(.*)$/)) != null &&
              DndCharacter.spellsCategoryCodes[matchInfo[1]] != null)
        codesToDisplay[DndCharacter.spellsCategoryCodes[matchInfo[1]]] = 1;
      else if((matchInfo = a.match(/^levels\.(.*)$/)) != null &&
              DndCharacter.spellsCategoryCodes[matchInfo[1]] != null)
        codesToDisplay[DndCharacter.spellsCategoryCodes[matchInfo[1]]] = 1;
    }
    for(a in DndCharacter.spellsCategoryCodes) {
      code = DndCharacter.spellsCategoryCodes[a];
      option = a + '(' + code + ')';
      editor.setElementValue('spellcats.' + option, codesToDisplay[code]);
    }
  }
  else {
    for(a in DndCharacter.spellsCategoryCodes) {
      code = DndCharacter.spellsCategoryCodes[a];
      option = a + '(' + code + ')';
      codesToDisplay[code] = editor.getElementValue('spellcats.' + option);
    }
  }
  var spells = [];
  for(a in DndCharacter.spellsLevels) {
    var spellLevels = DndCharacter.spellsLevels[a].split('/');
    for(i = 0; i < spellLevels.length; i++)
      if((matchInfo = spellLevels[i].match(/^(\D+)\d+$/)) != null &&
         codesToDisplay[matchInfo[1]])
        spells.push(a + '(' + spellLevels[i] + ')');
  }
  if(spells.length == 0)
    spells.push('--- No spell categories selected ---');
  spells.sort();
  editor.setElementSelections('spells', spells);
}

function ScribeLoaded() {

  var defaults = {
    'BACKGROUND':'wheat', 'CLASS_RULES_VERSION':'3.5',
    'FEAT_RULES_VERSION':'3.5', 'HELP_URL':'help.html', 'LOGO_URL':'scribe.gif',
    'MAGIC_RULES_VERSION':'3.5', 'MAX_RECENT_OPENS':15, 'URL_PREFIX':'',
    'URL_SUFFIX':'.html'
  };

  if(window.DndCharacter == null ||
     window.FormController == null ||
     window.ObjectViewer == null ||
     window.RuleEngine == null) {
    alert('JavaScript functions required by Scribe are missing; exiting');
    return;
  }
  if(window.opener == null || window.opener.ScribeLoaded == null) {
    if(window.frames[0] == null || window.frames[1] == null)
      alert('Scribe must be embedded in a document that defines at least ' +
            'two frames; exiting');
    else
      window.open(document.location, 'scribeEditor');
    return;
  }

  for(var a in defaults)
    if(window[a] == null)
      window[a] = defaults[a];

  var i = document.cookie.indexOf(COOKIE_NAME + '=');
  if(i >= 0) {
    var end = document.cookie.indexOf(';', i);
    if(end < 0)
      end = document.cookie.length;
    var cookie = document.cookie.substring(i + COOKIE_NAME.length + 1, end);
    var settings = unescape(cookie).split(COOKIE_FIELD_SEPARATOR);
    for(i = 0; i < settings.length && settings[i] != ''; i += 2)
      if(cookieInfo[settings[i]] != null)
        cookieInfo[settings[i]] = settings[i + 1];
  }


  PopUp('<img src="' + LOGO_URL + '" alt="Scribe"/><br/>' +
        COPYRIGHT + '<br/>' +
        'Press the "About" button for more info',
        'Ok', 'window.close();');
  editWindow = window.frames[0];
  loadingWindow = window.frames[1];
  sheetWindow = window.opener;
  character = new DndCharacter(null);
  editor = InitialEditor();
  rules = InitialRuleEngine();
  viewer = InitialViewer();
  if(CustomizeScribe != null)
    CustomizeScribe(DndCharacter.AddChoices, AddUserRules, AddUserView);
  /* TODO: Allow user to make editor changes w/out losing option changes. */
  editor = InitialEditor();
  RefreshEditor(true);
  RefreshSheet();
  RefreshRecentOpens();

}

function SheetHtml() {
  var a;
  var codeAttributes = {};
  var computedAttributes = rules.Apply(character.attributes);
  var displayAttributes = {};
  var i;
  for(a in character.attributes) {
    if(character.attributes[a] == DndCharacter.defaults[a])
      continue;
    if((i = a.indexOf('.')) < 0)
      codeAttributes[a] = character.attributes[a];
    else {
      var group = a.substring(0, i);
      if(codeAttributes[group] == null)
        codeAttributes[group] = {};
      codeAttributes[group][a.substring(i + 1)] = character.attributes[a];
    }
  }
  for(a in computedAttributes) {
    var name = a.replace(/([a-z])([A-Z])/g, '$1 $2').
               replace(/(^|[ ._])[a-z]/g, function(c){return c.toUpperCase();});
    var value = computedAttributes[a];
    if(character.attributes[a] != null && character.attributes[a] != value)
      value += '[' + character.attributes[a] + ']';
    if((i = name.indexOf('.')) < 0) {
      if(name == 'Unarmed Damage' && computedAttributes.meleeDamage != 0)
        value += (computedAttributes.meleeDamage > 0 ? '+' : '') +
                 computedAttributes.meleeDamage;
      displayAttributes[name] = value;
    }
    else {
      var group = name.substring(0, i);
      name = name.substring(i + 1);
      if(group.indexOf('Notes') >= 0 && typeof(value) == 'number') {
        if(value == 0)
          continue; /* Suppress notes with zero value. */
        else if(DndCharacter.notes[a] == null && value > 0)
          value = '+' + value;
      }
      if(DndCharacter.notes[a] != null)
        value = DndCharacter.notes[a].replace(/%V/, value);
      if(group == 'Skills' && DndCharacter.skillsAbility[name] != null)
        name += ' (' + DndCharacter.skillsAbility[name] + ')';
      else if(group == 'Weapons' && DndCharacter.weaponsDamage[name] != null) {
        var damages = DndCharacter.weaponsDamage[name];
        var extraDamage =
          name.indexOf('bow') < 0 ? computedAttributes.meleeDamage : 0;
        var multipliers = DndCharacter.weaponsCriticalMultiplier[name];
        var threats = DndCharacter.weaponsCriticalThreat[name];
        damages = damages == null ? ['0'] : damages.split('/');
        if(computedAttributes['specialization.' + name] != null)
          extraDamage += 2;
        multipliers = multipliers == null ? [2] :
                      typeof multipliers == 'number' ? [multipliers] :
                      multipliers.split('/');
        threats = threats == null ? [1] :
                  typeof threats == 'number' ? [threats] :
                  threats.split('/');
        for(i = 0; i < damages.length; i++) {
          var multiplier = multipliers[i < multipliers.length ? i : 0];
          var smallDamage = DndCharacter.weaponsSmallDamage[damages[i]];
          var threat = threats[i < threats.length ? i : 0];
          if(computedAttributes['feats.Improved Critical'] != null)
            threat *= 2;
          if(computedAttributes.isSmall && smallDamage != null)
            damages[i] = smallDamage;
          if(extraDamage != 0)
            damages[i] += (extraDamage > 0 ? '+' : '') + extraDamage;
          damages[i] += ' x' + multiplier + '@' + (21 - threat);
        }
        name += '(' + damages.join('/') + ')';
      }
      value = name + (value == '1' ? '' : (': ' + value));
      if(group.indexOf('Notes') > 0 && rules.IsSource(a))
        value = '<i>' + value + '</i>';
      if(displayAttributes[group] == null)
        displayAttributes[group] = [];
      displayAttributes[group].push(value);
    }
  }
  for(a in displayAttributes) {
    if(typeof displayAttributes[a] == 'object') {
      displayAttributes[a].sort();
      displayAttributes[a] = displayAttributes[a].join(' * ');
    }
  }
  return '<html>\n' +
         '<head>\n' +
         '  <title>' + character.attributes.name + '</title>\n' +
         '  <script>\n' +
         '    var attributes = ' + ObjectViewer.toCode(codeAttributes) + ';\n' +
         '  </' + 'script>\n' +
         '</head>\n' +
         '<body>\n' +
         viewer.getHtml(displayAttributes) +
         '</body>\n' +
         '</html>\n';
}

function ShowHtml(html) {
  if(ShowHtml.htmlWindow == null || ShowHtml.htmlWindow.closed)
    ShowHtml.htmlWindow = window.open('about:blank', 'html');
  html = html.replace(/</g, '&lt;');
  html = html.replace(/>/g, '&gt;');
  ShowHtml.htmlWindow.document.write(
    '<html><head><title>HTML</title></head>\n' +
    '<body><pre>' + html + '</pre></body></html>\n'
  );
  ShowHtml.htmlWindow.document.close();
}

function StoreCookie() {
  var cookie = '';
  for(var p in cookieInfo) {
    cookie +=
      p + COOKIE_FIELD_SEPARATOR + cookieInfo[p] + COOKIE_FIELD_SEPARATOR;
  }
  cookie = COOKIE_NAME + '=' + escape(cookie);
  var nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  cookie += ';expires=' + nextYear.toGMTString();
  document.cookie = cookie;
}

function Update(name, value) {

  if(name == 'about') {
    if(Update.aboutWindow != null && !Update.aboutWindow.closed)
      return;
    Update.aboutWindow = window.open('about:blank', 'about');
    Update.aboutWindow.document.write(
      '<html><head><title>About Scribe</title></head>\n' +
      '<body bgcolor="' + BACKGROUND + '"><p>' +
      '<img src="' + LOGO_URL + '" alt="Scribe"/>' +
       ABOUT_TEXT.replace(/\n/g, '\n</p>\n<p>') +
      '</p></body></html>\n'
    );
    Update.aboutWindow.document.close();
  }
  else if(name == 'file') {
    if(value == 'Open...')
      OpenDialog();
    else if(value == 'New...')
      RandomizeCharacter();
    else
      LoadCharacter(value);
    editor.setElementValue('file', '--New/Open--');
  }
  else if(name == 'help') {
    if(Update.helpWindow == null || Update.helpWindow.closed)
      Update.helpWindow = window.open(HELP_URL, 'help');
  }
  else if(name == 'view')
    ShowHtml(SheetHtml());
  else if(name == 'clear') {
    character.Clear(value);
    RefreshEditor(false);
    RefreshSheet();
    editor.setElementValue('clear', '--Clear--');
  }
  else if(name == 'randomize') {
    character.Randomize(rules, value);
    RefreshEditor(false);
    RefreshSheet();
    editor.setElementValue('randomize', '--Randomize--');
  }
  else if(name == 'validate') {
    if(Update.validateWindow != null && !Update.validateWindow.closed)
      Update.validateWindow.close();
    Update.validateWindow = window.open('about:blank', 'validate');
    Update.validateWindow.document.write(
      '<html><head><title>Character Validation Check</title></head>\n' +
      '<body bgcolor="' + BACKGROUND + '">\n' +
      '<h2>Validation Results</h2>\n<p>\n' +
      ValidationHtml() +
      '\n</p>\n</body></html>\n'
    );
    Update.validateWindow.document.close();
  }
  else if(name.match(/^spellcats\./))
    RefreshSpellSelections(false);
  else if(name == 'spells.--- No spell categories selected ---')
    editor.setElementValue(name, 0);
  else {
    if(!value && DndCharacter.defaults[name] == null)
      delete character.attributes[name];
    else if(typeof(value) == 'string' &&
            value.match(/^\+-?\d+$/) &&
            typeof(character.attributes[name]) == 'string' &&
            character.attributes[name].match(/^\d+$/)) {
      character.attributes[name] =
        ((character.attributes[name] - 0) + (value.substring(1) - 0)) + '';
      editor.setElementValue(name, character.attributes[name]);
    }
    else
      character.attributes[name] = value;
    RefreshSheet();
  }

}

function ValidationHtml() {
  var computedAttributes = rules.Apply(character.attributes);
  var invalid = DndCharacter.Validate(computedAttributes);
  var result = '';
  for(var i = 0; i < invalid.length; i += 2)
    result += invalid[i] + ' does not pass test ' + invalid[i + 1] + '<br/>';
  result += invalid.length / 2 + ' validation errors<br/>';
  return result;
}
