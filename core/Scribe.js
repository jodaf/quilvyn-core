/* $Id: Scribe.js,v 1.98 2005/04/19 05:36:00 Jim Exp $ */

var COPYRIGHT = 'Copyright 2005 James J. Hayes';
var VERSION = '0.16.14';
var ABOUT_TEXT =
'Scribe Character Editor version ' + VERSION + '\n' +
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
'Temple Place, Suite 330, Boston, MA 02111-1307 USA.\n' +
'Thanks to my dungeon crew, especially fellow DM Rich Hakesley, for patient ' +
'testing of the program and for making suggestions that greatly improved it.';

var COOKIE_FIELD_SEPARATOR = '\n';
var COOKIE_NAME = 'ScribeCookie';
var TIMEOUT_DELAY = 1000; /* One second */

var cachedAttrs = {}; /* Unchanged attrs of all characters opened so far */
var character;      /* Current DndCharacter */
var characterUrl;   /* URL of current DndCharacter */
var cookieInfo = {  /* What we store in the cookie */
  dmonly: '0',     /* Show information marked "dmonly" on sheet? */
  italics: '1',    /* Show italicized notes on sheet? */
  recent: '',      /* Comma-separated and -terminated list of recent opens */
  untrained: '0'   /* Show untrained skills on sheet? */
};
var editForm;       /* Character editing form (window.frames[0].forms[0]) */
var loadingPopup = null; /* Current "loading" message popup window */
var rules;          /* RuleEngine with standard + user rules */
var showCodes = {}; /* Display status of spell category codes */
var urlLoading=null;/* Character URL presently loading */
var viewer;         /* ObjectViewer to translate character attrs into HTML */

/* Returns an array of choices for the editor's New/Open select input. */
function ChoicesForFileInput() {
  var result = cookieInfo.recent.split(',');
  result.length--; /* Trim trailing empty element */
  result = ['--New/Open--', 'New...', 'Open...'].concat(result);
  return result;
}

/* Returns an array of choices for the editor's Spells select input. */
function ChoicesForSpellInput() {
  var matchInfo;
  var result = [];
  for(var a in DndCharacter.spellsLevels) {
    var spellLevels = DndCharacter.spellsLevels[a].split('/');
    for(var i = 0; i < spellLevels.length; i++)
      if((matchInfo = spellLevels[i].match(/^(\D+)\d+$/)) != null &&
         showCodes[matchInfo[1]])
        result[result.length] = a + '(' + spellLevels[i] + ')';
  }
  if(result.length == 0)
    result[result.length] = '--- No spell categories selected ---';
  result.sort();
  return result;
}

/* Returns a recursively-copied clone of #o#. */
function CopyObject(o) {
  if(typeof o != "object" || o == null)
    return o;
  var result = new Object();
  for(var a in o)
    result[a] = CopyObject(o[a]);
  return result;
}

/* Returns HTML for the character editor form. */
function EditorHtml() {
  var abilityChoices=[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  var spellsCategoryOptions = [];
  for(var a in DndCharacter.spellsCategoryCodes)
    spellsCategoryOptions[spellsCategoryOptions.length] =
      a + '(' + DndCharacter.spellsCategoryCodes[a] + ')';
  spellsCategoryOptions.sort();
  var weapons = GetKeys(DndCharacter.weaponsDamage);
  var editorElements = [
    ['', 'about', 'button', ['About']],
    ['', 'help', 'button', ['Help']],
    [' ', 'file', 'select-one', ChoicesForFileInput()],
    ['', 'summary', 'button', ['Summary']],
    [' ', 'validate', 'button', ['Validate']],
    ['', 'view', 'button', ['View Html']],
    ['Show: ', 'italics', 'checkbox', ['Italic Notes']],
    ['', 'untrained', 'checkbox', ['Untrained Skills']],
    ['', 'dmonly', 'checkbox', ['DM Only Info']],
    [' ', 'clear', 'select-one',
      ['--Clear--', 'alignment', 'armor', 'charisma', 'constitution', 'deity',
       'dexterity', 'domains', 'feats', 'gender', 'hitPoints', 'intelligence',
       'languages', 'levels', 'name', 'race', 'shield', 'skills', 'spells',
       'strength', 'weapons', 'wisdom']],
    ['', 'randomize', 'select-one',
      ['--Randomize--', 'alignment', 'armor', 'charisma', 'constitution',
       'deity', 'dexterity', 'domains', 'feats', 'gender', 'hitPoints',
       'intelligence', 'languages', 'levels', 'name', 'race', 'shield',
       'skills', 'spells', 'strength', 'weapons', 'wisdom']],
    ['Name', 'name', 'text', [20]],
    ['Race', 'race', 'select-one', DndCharacter.races],
    ['Experience', 'experience', 'text', [8]],
    ['Levels', 'levels_sel', 'select-one', GetKeys(DndCharacter.classesHitDie)],
    ['', 'levels', 'text', [3]],
    ['Image URL', 'imageUrl', 'text', [20]],
    ['Strength', 'strength', 'select-one', abilityChoices],
    ['Intelligence', 'intelligence', 'select-one', abilityChoices],
    ['Wisdom', 'wisdom', 'select-one', abilityChoices],
    ['Dexterity', 'dexterity', 'select-one', abilityChoices],
    ['Constitution', 'constitution', 'select-one', abilityChoices],
    ['Charisma', 'charisma', 'select-one', abilityChoices],
    ['Player', 'player', 'text', [20]],
    ['Alignment', 'alignment', 'select-one', DndCharacter.alignments],
    ['Gender', 'gender', 'select-one', DndCharacter.genders],
    ['Deity', 'deity', 'select-one', GetKeys(DndCharacter.deitiesDomains)],
    ['Origin', 'origin', 'text', [20]],
    ['Feats', 'feats_sel', 'select-one', DndCharacter.feats],
    ['', 'feats', 'checkbox', null],
    ['Skills', 'skills_sel', 'select-one', GetKeys(DndCharacter.skillsAbility)],
    ['', 'skills', 'text', [3]],
    ['Languages', 'languages_sel', 'select-one', DndCharacter.languages],
    ['', 'languages', 'checkbox', null],
    ['Hit Points', 'hitPoints', 'text', [4]],
    ['Armor', 'armor', 'select-one',
     GetKeys(DndCharacter.armorsArmorClassBonuses)],
    ['Shield', 'shield', 'select-one', DndCharacter.shields],
    ['Weapons', 'weapons_sel', 'select-one', weapons],
    ['', 'weapons', 'text', [3]],
    ['Ranger Combat Style', 'combatStyle_sel', 'select-one',
     DndCharacter.combatStyles],
    ['', 'combatStyle', 'checkbox', null],
    ['Spell Categories', 'spellcats_sel', 'select-one', spellsCategoryOptions],
    ['', 'spellcats', 'checkbox', null],
    ['Spells', 'spells_sel', 'select-one', ChoicesForSpellInput()],
    ['', 'spells', 'checkbox', null],
    ['Goodies', 'goodies_sel', 'select-one', DndCharacter.goodies],
    ['', 'goodies', 'text', [2]],
    ['Cleric Domains', 'domains_sel', 'select-one', DndCharacter.domains],
    ['', 'domains', 'checkbox', null],
    ['Wizard Specialization', 'specialize_sel', 'select-one',
     DndCharacter.schools],
    ['', 'specialize', 'checkbox', null],
    ['Wizard Prohibition', 'prohibit_sel', 'select-one', DndCharacter.schools],
    ['', 'prohibit', 'checkbox', null],
    ['Notes', 'notes', 'textarea', [40,10]],
    ['DM Notes', 'dmNotes', 'textarea', [40,10]]
  ];
  var htmlBits = ['<form name="frm"><table>\n'];
  for(var i = 0; i < editorElements.length; i++) {
    var element = editorElements[i];
    htmlBits[htmlBits.length] =
      '<tr><th>' + element[0] + '</th><td>' +
      InputHtml(element[1], element[2], element[3]) + '</td></tr>\n';
  }
  htmlBits[htmlBits.length] = '</table></form>';
  var result = htmlBits.join('');
  result = result.replace(/<\/td><\/tr>\n<tr><th><\/th><td>/g, '');
  return result;
}

/* Returns a sorted array containing all keys from object #o#. */
function GetKeys(o) {
  var result = [];
  for(var a in o)
    result[result.length] = a;
  result.sort();
  return result;
}

/* Returns true iff all attributes of #o1# have the same values in #o2#. */
function HasSameValues(o1, o2) {
  if(typeof o1 != "object" || typeof o2 != "object")
    return o1 == o2;
  for(var a in o1)
    if(!HasSameValues(o2[a], o1[a]))
      return false;
  return true;
}

/* Returns a RuleEngine loaded with the default DndCharacter rules. */
function InitialRuleEngine() {
  var i;
  var result = new RuleEngine();
  var versions;
  DndCharacter.LoadVersion3Rules(result);
  versions = CLASS_RULES_VERSION.split('/');
  for(i = 0; i < versions.length; i++)
    DndCharacter.LoadVersion3PointRules(result, versions[i], 'class');
  versions = FEAT_RULES_VERSION.split('/');
  for(i = 0; i < versions.length; i++)
    DndCharacter.LoadVersion3PointRules(result, versions[i], 'feat');
  versions = MAGIC_RULES_VERSION.split('/');
  for(i = 0; i < versions.length; i++)
    DndCharacter.LoadVersion3PointRules(result, versions[i], 'magic');
  result.AddRules('dmNotes', 'dmonly', '?', null);
  /* Hack to get meleeNotes.strengthDamageAdjustment to appear in italics. */
  result.AddRules('ignored', 'meleeNotes.strengthDamageAdjustment', '=', null);
  return result;
}

/* Returns an ObjectViewer loaded with the default character sheet format. */
function InitialViewer() {
  var result = new ObjectViewer();
  result.addElements(
    {name: '_top', borders: 1},
    {name: 'Image Url', within: '_top', format: '<img src="%V">'},
    {name: 'Header', within: '_top', compact: 1},
      {name: 'Name', within: 'Header', format: '<b>%V</b>'},
      {name: 'Race', within: 'Header', format: ' -- <b>%V</b>'},
      {name: 'Levels', within: 'Header', format: ' <b>%V</b>'},
    {name: 'Attributes Break', within: '_top', format: '\n'},
    {name: 'Attributes', within: '_top'},
      {name: 'Str Break', within: 'Attributes', format: '\n'},
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
        {name: 'Experience Needed', within: 'ExpSection', format: '/%V'},
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
      {name: 'LoadSection', within: 'FeatsAndSkills', compact: 1},
        {name: 'Load Light', within: 'LoadSection',
          format: '<b>Light/Med/Max Load:</b> %V'},
        {name: 'Load Medium', within: 'LoadSection', format: '/%V'},
        {name: 'Load Max', within: 'LoadSection', format: '/%V'},
    {name: 'Melee Break', within: '_top', format: '\n'},
    {name: 'Melee', within: '_top', title: 'Melee'},
      {name: 'Hit Points', within: 'Melee'},
      {name: 'Armor', within: 'Melee'},
      {name: 'Shield', within: 'Melee'},
      {name: 'Armor Class', within: 'Melee'},
      {name: 'Speed', within: 'Melee'},
      {name: 'Run Speed', within: 'Melee'},
      {name: 'Armor Proficiency Break', within: 'Melee', format: '\n'},
      {name: 'Armor Proficiency', within: 'Melee'},
      {name: 'Shield Proficiency', within: 'Melee'},
      {name: 'Weapon Proficiency', within: 'Melee'},
      {name: 'Combat Style', within: 'Melee'},
      {name: 'Initiative Break', within: 'Melee', format: '\n'},
      {name: 'Initiative', within: 'Melee'},
      {name: 'Base Attack', within: 'Melee'},
      {name: 'Melee Attack', within: 'Melee'},
      {name: 'Ranged Attack', within: 'Melee'},
      {name: 'Unarmed Damage', within: 'Melee'},
      {name: 'Turning Frequency Break', within: 'Melee', format: '\n'},
      {name: 'Turning Frequency', within: 'Melee', format: '<b>%N</b>: %V/Day'},
      {name: 'TurningSection', within: 'Melee', compact: 1},
        {name: 'Turning Min', within: 'TurningSection',
          format: '<b>Turning Min/Max HD</b>: %V'},
        {name: 'Turning Max', within: 'TurningSection', format: '/%V'},
      {name: 'Turning Damage Modifier', within: 'Melee',
        format: '<b>Turning Damage</b>: 2d6+%V'},
      {name: 'Weapons Break', within: 'Melee', format: '\n'},
      {name: 'Weapons', within: 'Melee'},
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
      {name: 'Notes', within: 'NotesSection', format: '%V'},
      {name: 'Dm Notes Break', within: 'NotesSection', format: '\n'},
      {name: 'Dm Notes', within: 'NotesSection', format: '%V'}
  );
  return result;
}

/*
 * Starts the process of loading #name# (a full or partial URL) into the editor
 * and character sheet windows.  Schedules repeated calls of itself, ignoring
 * new calls, until either the character is loaded or the user cancels.
 */
function LoadCharacter(name) {
  var loadingWindow = window.frames[1];
  var url = name;
  if(url.match(/^\w*:/) == null)
    url = URL_PREFIX + url;
  if(url.match(/\.\w*$/) == null)
    url += URL_SUFFIX;
  if(urlLoading == url && loadingPopup.closed)
    /* User cancel. */
    urlLoading = null;
  else if(urlLoading == url && loadingWindow.attributes != null) {
    /* Character done loading. */
    var i;
    /* Place loaded name at head of New/Open list */
    var names = cookieInfo.recent.split(',');
    names.length--; /* Trim trailing empty element */
    for(i = 0; i < names.length && names[i] != name; i++)
      ; /* empty */
    if(i < names.length)
      names = names.slice(0, i).concat(names.slice(i + 1));
    names = [name].concat(names);
    if(names.length >= MAX_RECENT_OPENS)
      names.length = MAX_RECENT_OPENS - 1;
    cookieInfo.recent = names.join(',') + ',';
    StoreCookie();
    InputSetOptions(editForm.file, ChoicesForFileInput());
    /* NOTE: No redraw here for Opera; ResetShowCodes will do it later. */
    character = new DndCharacter(null);
    for(var a in loadingWindow.attributes) {
      var value = loadingWindow.attributes[a];
      /*
       * Turn objects into "dot" attributes and convert values from prior
       * versions of Scribe.
       */
      if(typeof value == 'object') {
        for(var x in value) {
          if(a == 'focus')
            character.attributes['feats.Weapon Focus (' + x + ')'] = '1';
          else if(a == 'specialization')
            character.attributes
              ['feats.Weapon Specialization (' + x + ')'] = '1';
          else {
            var convertedName = x;
            while((i = convertedName.search(/\([a-z]/)) >= 0)
              convertedName =
                convertedName.substring(0, i + 1) +
                convertedName.substring(i + 1, i + 2).toUpperCase() +
                convertedName.substring(i + 2);
            if(a == 'domains' && (i = convertedName.indexOf(' Domain')) >= 0)
              convertedName = convertedName.substring(0, i);
            else if(a == 'feats' && x == 'Expertise')
              convertedName = 'Combat Expertise';
            else if(a == 'skills' && x == 'Pick Pocket')
              convertedName = 'Sleight Of Hand';
            else if(a == 'skills' && x == 'Wilderness Lore')
              convertedName = 'Survival';
            else if(a == 'weapons' && (i = convertedName.indexOf(' (')) >= 0)
              convertedName = convertedName.substring(0, i);
            character.attributes[a + '.' + convertedName] = value[x];
          }
        }
      }
      else if(a == 'shield' && value.indexOf('Large') == 0)
        character.attributes[a] = 'Heavy' + value.substring(5);
      else if(a == 'shield' && value.indexOf('Small') == 0)
        character.attributes[a] = 'Light' + value.substring(5);
      else
        character.attributes[a] = value;
    }
    ResetShowCodes();
    RefreshEditor();
    RedrawSheet();
    currentUrl = name;
    cachedAttrs[currentUrl] = CopyObject(character.attributes);
    urlLoading = null;
    if(!loadingPopup.closed)
      loadingPopup.close();
  }
  else if(urlLoading == null) {
    /* Nothing presently loading. */
    urlLoading = url;
    loadingPopup =
      PopUp('Loading character from ' + url, 'Cancel', 'window.close();');
    if(loadingWindow.location != 'about:blank') /* Opera pukes w/o this test */
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

/* Prompts the user for a character URL and starts the load. */
function OpenDialog() {
  if(loadingPopup != null && !loadingPopup.closed)
    return; /* Ignore during load. */
  var name = prompt('Enter URL to Edit (Blank for Random Character)', '');
  if(name == null)
    return; /* User cancel. */
  if(name == '')
    RandomizeCharacter();
  else
    LoadCharacter(name);
}

/*
 * Returns a popup window containing #html# and the optional set of #buttons#,
 * each associated with an #action#.
 */
function PopUp(html, button, action /*, button, action ... */) {
  var popup = window.open('', 'pop' + PopUp.next++, 'height=200,width=400');
  var content = '<html><head><title>Scribe Message</title></head>\n' +
                '<body bgcolor="' + BACKGROUND + '">' + html +
                '<br/>\n<form>\n';
  for(var i = 2; i < arguments.length; i += 2)
    content +=
      '<input type="button" value="' + arguments[i - 1] + '" ' +
                           'onclick="' + arguments[i] + '"/>\n';
  content += '</form>\n</body></html>';
  popup.document.write(content);
  popup.document.close();
  return popup;
}
PopUp.next = 0;

/*
 * Replaces the current character with one that has all randomized attributes.
 * Allows the user to specify race and class level(s).
 */
function RandomizeCharacter() {
  if(urlLoading == 'random' && loadingPopup.closed)
    /* User cancel. */
    urlLoading = null;
  else if(urlLoading == 'random' && loadingPopup.okay != null) {
    /* Ready to generate. */
    var totalLevels = 0;
    var value;
    character = new DndCharacter(null);
    for(var a in DndCharacter.classesHitDie) {
      var attr = 'levels.' + a;
      if((value = InputGetValue(loadingPopup.document.frm[attr])) != null &&
         value > 0) {
        character.attributes[attr] = value;
        totalLevels += character.attributes[attr] - 0;
      }
    }
    if(totalLevels == 0) {
      character.Randomize(rules, 'levels');
      totalLevels = 1;
    }
    character.attributes.experience = totalLevels * (totalLevels-1) * 1000 / 2;
    for(var a in DndCharacter.defaults)
      character.Randomize(rules, a);
    character.attributes.race = InputGetValue(loadingPopup.document.frm.race);
    character.Randomize(rules, 'domains');
    character.Randomize(rules, 'feats');
    character.Randomize(rules, 'languages');
    character.Randomize(rules, 'skills');
    character.Randomize(rules, 'spells');
    character.Randomize(rules, 'weapons');
    ResetShowCodes();
    RefreshEditor();
    RedrawSheet();
    currentUrl = 'random';
    cachedAttrs[currentUrl] = CopyObject(character.attributes);
    loadingPopup.close();
    urlLoading = null;
  }
  else if(urlLoading == null) {
    /* Nothing presently loading. */
    urlLoading = 'random';
    var classes = GetKeys(DndCharacter.classesHitDie);
    var htmlBits = [
      '<html><head><title>New Character</title></head>\n',
      '<body bgcolor="' + BACKGROUND + '">\n',
      '<img src="' + LOGO_URL + ' "/><br/>\n',
      '<h2>New Character Attributes</h2>\n',
      '<form name="frm"><table>\n',
      '<tr><th>Race</th><td>' +
      InputHtml('race', 'select-one', DndCharacter.races) + '</td></tr>\n'
    ];
    for(var i = 0; i < classes.length; i++)
      htmlBits[htmlBits.length] =
        '<tr><th>' + classes[i] + ' Level' + '</th><td>' +
        InputHtml('levels.' + classes[i], 'text', [2]) + '</td></tr>\n';
    htmlBits = htmlBits.concat([
      '</table></form>\n',
      '<form>\n',
      '<input type="button" value="Ok" onclick="okay=1;"/>\n',
      '<input type="button" value="Cancel" onclick="window.close();"/>\n',
      '</form></body></html>\n'
    ]);
    var html = htmlBits.join('');
    loadingPopup = window.open('', 'randomWin');
    loadingPopup.document.write(html);
    loadingPopup.document.close();
    loadingPopup.document.frm.race.selectedIndex =
      DndCharacter.Random(0, DndCharacter.races.length - 1);
    loadingPopup.okay = null;
    setTimeout('RandomizeCharacter()', TIMEOUT_DELAY);
  }
  else
    /* Something (possibly this function) in progress; try again later. */
    setTimeout('RandomizeCharacter()', TIMEOUT_DELAY);
}

/* Draws the character editor in the editor frame. */
function RedrawEditor() {
  var editHtml =
    '<html><head><title>Editor</title></head>\n' +
    '<body bgcolor="' + BACKGROUND + '">\n' +
    '<img src="' + LOGO_URL + ' "/><br/>\n' +
    EditorHtml() + '\n' +
    '</body></html>\n';
  var editWindow = window.frames[0];
  editWindow.document.write(editHtml);
  editWindow.document.close();
  editForm = editWindow.document.frm;
  var callback = function() {Update(this);};
  for(i = 0; i < editForm.elements.length; i++)
    InputSetCallback(editForm.elements[i], callback);
}

/* Draws the sheet for the current character in the character sheet window. */
function RedrawSheet() {
  var sheetWindow = window.opener;
  if(sheetWindow == null || sheetWindow.closed)
    sheetWindow = window.open('', 'scribeSheet');
  sheetWindow.document.write(SheetHtml());
  sheetWindow.document.close();
}

/* Sets the editing window fields to the values of the current character. */
function RefreshEditor() {
  var i;
  for(i = 0; i < editForm.elements.length; i++)
    InputSetValue(editForm.elements[i], null);
  for(var attr in character.attributes) {
    i = attr.indexOf('.');
    var sel = i < 0 ? null : editForm[attr.substring(0, i) + '_sel'];
    var val = i < 0 ? editForm[attr] : editForm[attr.substring(0, i)];
    if(sel != null)
      InputSetValue(sel, attr.substring(i + 1));
    if(val != null)
      InputSetValue(val, character.attributes[attr]);
  }
  InputSetValue(editForm.dmonly, cookieInfo.dmonly - 0);
  InputSetValue(editForm.italics, cookieInfo.italics - 0);
  InputSetValue(editForm.untrained, cookieInfo.untrained - 0);
}

/* Recomputes the showCodes global to reflect the current character's spells. */
function ResetShowCodes() {
  var matchInfo;
  showCodes = {};
  for(var a in character.attributes) {
    if((matchInfo = a.match(/^spells\..*\((\D+)\d+\)$/)) != null)
      showCodes[matchInfo[1]] = true;
    else if((matchInfo = a.match(/^(domains|levels)\.(.*)$/)) != null &&
            DndCharacter.spellsCategoryCodes[matchInfo[2]] != null)
      showCodes[DndCharacter.spellsCategoryCodes[matchInfo[2]]] = true;
  }
  InputSetOptions(editForm.spells_sel, ChoicesForSpellInput());
  if(editForm.spells_sel.options.length == 0) /* Stupid bug in Opera */
    RedrawEditor();
}

/* Launch routine called after all Scribe scripts are loaded. */
function Scribe() {

  var defaults = {
    'BACKGROUND':'wheat', 'CLASS_RULES_VERSION':'3.5',
    'FEAT_RULES_VERSION':'3.5', 'HELP_URL':'help.html',
    'LOGO_URL':'scribe.gif', 'MAGIC_RULES_VERSION':'3.5',
    'MAX_RECENT_OPENS':15, 'URL_PREFIX':'', 'URL_SUFFIX':'.html',
    'WARN_ABOUT_DISCARD':true
  };

  if(DndCharacter == null || ObjectViewer == null || RuleEngine == null) {
    alert('JavaScript functions required by Scribe are missing; exiting');
    return;
  }
  if(window.opener == null || window.opener.Scribe == null) {
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
    for(i = 0; i < settings.length; i += 2)
      if(cookieInfo[settings[i]] != null)
        cookieInfo[settings[i]] = settings[i + 1];
  }

  PopUp('<img src="' + LOGO_URL + '" alt="Scribe"/><br/>' +
        COPYRIGHT + '<br/>' +
        'Press the "About" button for more info',
        'Ok', 'window.close();');
  character = new DndCharacter(null);
  currentUrl = 'random';
  cachedAttrs[currentUrl] = CopyObject(character.attributes);
  rules = InitialRuleEngine();
  viewer = InitialViewer();
  if(CustomizeScribe != null)
    CustomizeScribe();
  RedrawEditor();
  RefreshEditor();
  RedrawSheet();
  /*
  if(SCRIBE_DEBUG != null) {
    var html = '<html><head><title>Scribe Attributes</title></head>\n<body>\n';
    var attrs = rules.AllSources();
    html += '<h2>Sources</h2>\n' + attrs.join('<br/>\n') + '\n';
    attrs = rules.AllTargets();
    html += '<h2>Targets</h2>\n' + attrs.join('<br/>\n') + '\n';
    html += '</body></html>/n';
    var w = window.open('', 'attrwin');
    w.document.write(html);
    w.document.close();
  }
  */

}

/* Returns the character sheet HTML for the current character. */
function SheetHtml() {

  var a;
  var attrs = CopyObject(character.attributes);
  var codeAttributes = {};
  var computedAttributes;
  var displayAttributes = {};
  var i;

  for(a in character.attributes) {
    if(attrs[a] == DndCharacter.defaults[a])
      continue; /* No point in storing default attr values. */
    /* Turn "dot" attributes into objects. */
    if((i = a.indexOf('.')) < 0)
      codeAttributes[a] = attrs[a];
    else {
      var object = a.substring(0, i);
      if(codeAttributes[object] == null)
        codeAttributes[object] = {};
      codeAttributes[object][a.substring(i + 1)] = attrs[a];
    }
  }

  attrs.dmonly = cookieInfo.dmonly - 0;
  if(cookieInfo.untrained == '1') {
    for(a in DndCharacter.skillsAbility)
      if(character.attributes['skills.' + a] == null &&
         DndCharacter.skillsAbility[a].indexOf(';trained') < 0)
        attrs['skills.' + a] = 0;
  }
  computedAttributes = rules.Apply(attrs);
  if(cookieInfo.untrained == '1') {
    for(a in DndCharacter.skillsAbility) {
      if(character.attributes['skills.' + a] == null &&
         computedAttributes['skills.' + a] == 0)
        delete computedAttributes['skills.' + a];
    }
  }
  /*
   * NOTE: The ObjectFormatter doesn't support interspersing values in a list
   * (e.g., skill ability, weapon damage), so we do some inelegant manipulation
   * of displayAttributes' names and values here to get the sheet to look right.
   */
  var damageAdjustment =
    computedAttributes['meleeNotes.strengthDamageAdjustment'];
  for(a in computedAttributes) {
    var name = SheetName(a);
    var value = computedAttributes[a];
    /* Add entered value in brackets if it differs from computed value. */
    if(attrs[a] != null && attrs[a] != value)
      value += '[' + attrs[a] + ']';
    if((i = name.indexOf('.')) < 0) {
      if(name == 'Image Url' && value.match(/^\w*:/) == null)
        value = URL_PREFIX + value;
      else if(name == 'Unarmed Damage')
        value += Signed(damageAdjustment);
      displayAttributes[name] = value;
    }
    else {
      var object = name.substring(0, i);
      name = name.substring(i + 1, i + 2).toUpperCase() + name.substring(i + 2);
      if(object.indexOf('Notes') >= 0 && typeof(value) == 'number') {
        if(value == 0)
          continue; /* Suppress notes with zero value. */
        else if(DndCharacter.notes[a] == null)
          value = Signed(value); /* Make signed if not otherwise formatted. */
      }
      if(DndCharacter.notes[a] != null)
        value = DndCharacter.notes[a].replace(/%V/, value);
      if(object == 'Skills') {
        var skill = name;
        if(DndCharacter.skillsAbility[skill] != null)
          name += ' (' + DndCharacter.skillsAbility[skill].substring(0,3) + ')';
        if(computedAttributes['classSkills.' + skill] == null)
          name += '(X)';
      }
      else if(object == 'Weapons') {
        var damages = DndCharacter.weaponsDamage[name];
        var attack =
          DndCharacter.weaponsRangeIncrement[name] == null ||
          name.match
            (/^(Club|Dagger|Light Hammer|Shortspear|Spear|Trident)$/) != null ?
          computedAttributes.meleeAttack : computedAttributes.rangedAttack;
        if(computedAttributes['weaponAttackAdjustment.' + name] != null)
          attack += computedAttributes['weaponAttackAdjustment.' + name];
        var extraDamage = damageAdjustment;
        if(name.indexOf('bow') >= 0 &&
           (name.indexOf('Composite') < 0 || extraDamage > 0))
          extraDamage = 0;
        if(computedAttributes['weaponDamageAdjustment.' + name] != null)
          extraDamage += computedAttributes['weaponDamageAdjustment.' + name];
        damages = damages == null ? ['0'] : damages.split('/');
        for(i = 0; i < damages.length; i++) {
          var pieces = damages[i].match(/^(\d*d\d+) *(x(\d+))? *(@(\d+))?$/);
          if(pieces == null)
            pieces = ['d6', 'd6'];
          var damage = pieces[1];
          var multiplier = pieces[3] ? pieces[3] - 0 : 2;
          var smallDamage = DndCharacter.weaponsSmallDamage[damage];
          var threat = pieces[5] ? pieces[5] - 0 : 20;
          if(computedAttributes['weaponCriticalAdjustment.' + name] != null)
            threat = 21 - (21 - threat) -
                     computedAttributes['weaponCriticalAdjustment.' + name];
          if(computedAttributes.isSmall && smallDamage != null)
            damage = smallDamage;
          damage += Signed(extraDamage);
          damages[i] = damage + ' x' + multiplier + '@' + threat;
        }
        name += '(' + Signed(attack) + ' ' + damages.join('/') + ')';
      }
      value = name + (value == '1' ? '' : (': ' + value));
      if(object.indexOf('Notes') > 0 && rules.IsSource(a)) {
        if(cookieInfo.italics == '1')
          value = '<i>' + value + '</i>';
        else
          continue;
      }
      if(displayAttributes[object] == null)
        displayAttributes[object] = [];
      displayAttributes[object][displayAttributes[object].length] = value;
    }
  }

  for(a in displayAttributes) {
    if(typeof displayAttributes[a] == 'object') {
      displayAttributes[a].sort();
      displayAttributes[a] = displayAttributes[a].join(' * ');
    }
  }

  return '<' + '!' + '-- Generated ' + new Date().toString() +
           ' by Scribe version ' + VERSION + ' --' + '>\n' +
         '<html>\n' +
         '<head>\n' +
         '  <title>' + attrs.name + '</title>\n' +
         '  <script>\n' +
         '    var attributes = ' + ObjectViewer.toCode(codeAttributes) + ';\n' +
         '  </' + 'script>\n' +
         '</head>\n' +
         '<body>\n' +
         viewer.getHtml(displayAttributes) +
         '</body>\n' +
         '</html>\n';

}

/* Returns #name# formatted for character sheet display. */
function SheetName(name) {
  var matchInfo;
  var result = name.replace(/([a-z\)])([A-Z\(])/g, '$1 $2');
  result = result.substring(0, 1).toUpperCase() + result.substring(1);
  return result;
}

/* Opens a window that contains HTML for #html# in readable/copyable format. */
function ShowHtml(html) {
  if(ShowHtml.htmlWindow == null || ShowHtml.htmlWindow.closed)
    ShowHtml.htmlWindow = window.open('', 'html');
  else
    ShowHtml.htmlWindow.focus();
  html = html.replace(/</g, '&lt;');
  html = html.replace(/>/g, '&gt;');
  ShowHtml.htmlWindow.document.write(
    '<html><head><title>HTML</title></head>\n' +
    '<body><pre>' + html + '</pre></body></html>\n'
  );
  ShowHtml.htmlWindow.document.close();
}

/* Returns an empty string if #value# is 0, otherwise a string with a sign. */
function Signed(value) {
  return value == null || value == 0 ? '' : value > 0 ? '+' + value : value;
}

/* Stores the current values of cookieInfo in the browser cookie. */
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

function SummarizeCachedAttrs() {
  var allAttrs = {};
  for(var a in cachedAttrs)
    if(a != 'random')
      allAttrs[a] = rules.Apply(cachedAttrs[a]);
  var urls = GetKeys(allAttrs);
  urls.sort();
  var htmlBits = [
    '<html>',
    '<head><title>Scribe Charcter Attribute Summary</title></head>',
    '<body bgcolor="' + BACKGROUND + '">',
    '<h1>Scribe Character Attribute Summary</h1>',
    '<table border="1">'
  ];
  var rowHtml = '<tr><td></td>';
  for(var i = 0; i < urls.length; i++)
    rowHtml += '<td align="center"><b>' + urls[i] + '</b></th>';
  htmlBits[htmlBits.length] = rowHtml;
  var inTable = {};
  for(var a in allAttrs) {
    var spells = [];
    for(var b in allAttrs[a]) {
      if(b.match(/^(feats|features|skills|languages)\./))
        inTable[b] = 1;
      else if(b.match(/^spells\./))
        spells[spells.length] = b.substring(b.indexOf('.') + 1);
    }
    spells.sort();
    allAttrs[a]['spells'] = spells.length==0 ? '&nbsp;' : spells.join('<br/>');
  }
  inTable['notes'] = inTable['spells'] = 1;
  inTable = GetKeys(inTable);
  inTable.sort();
  for(var i = 0; i < inTable.length; i++) {
    rowHtml = '<tr><td><b>' + inTable[i] + '</b></td>';
    for(var j = 0; j < urls.length; j++) {
      var value = allAttrs[urls[j]][inTable[i]];
      if(value == null)
        value = '&nbsp;';
      rowHtml += '<td align="center">' + value + '</td>';
    }
    htmlBits[htmlBits.length] = rowHtml;
  }
  htmlBits[htmlBits.length] = '</table>';
  htmlBits[htmlBits.length] = '</body></html>\n';
  SummarizeCachedAttrs.win = window.open('', 'sumwin');
  SummarizeCachedAttrs.win.document.write(htmlBits.join('\n'));
  SummarizeCachedAttrs.win.document.close();
  SummarizeCachedAttrs.urls = null;
  SummarizeCachedAttrs.attrs = null;
}

/* Callback invoked when the user changes the editor value of Input #input#. */
function Update(input) {

  var name = input.name;
  var value = InputGetValue(input);
  if(name == 'about') {
    if(Update.aboutWindow == null || Update.aboutWindow.closed)
      Update.aboutWindow = PopUp
        (ABOUT_TEXT.replace(/\n/g, '\n</p>\n<p>'), 'Ok', 'window.close();');
    else
      Update.aboutWindow.focus();
  }
  else if('clear randomize'.indexOf(name) >= 0) {
    input.selectedIndex = 0;
    var attr;
    var pat = '^' + value + '(\\.|$)';
    if(name == 'clear')
      character.Clear(value);
    else
      character.Randomize(rules, value);
    input = editForm[value];
    InputSetValue(input, null);
    for(attr in character.attributes)
      if(attr.search(pat) >= 0) {
        InputSetValue(input, character.attributes[attr]);
        if((input = editForm[value + '_sel']) != null)
          InputSetValue(input, attr.substring(attr.indexOf('.') + 1));
        break;
      }
    RedrawSheet();
  }
  else if('dmonly italics untrained'.indexOf(name) >= 0) {
    cookieInfo[name] = value + '';
    StoreCookie();
    RedrawSheet();
  }
  else if(name == 'file') {
    input.selectedIndex = 0;
    if(WARN_ABOUT_DISCARD &&
       !(HasSameValues(character.attributes, cachedAttrs[currentUrl]) &&
         HasSameValues(cachedAttrs[currentUrl], character.attributes)) &&
       !confirm("Discard changes to character?"))
      ; /* empty */
    else if(value == 'Open...')
      OpenDialog();
    else if(value == 'New...')
      RandomizeCharacter();
    else
      LoadCharacter(value);
  }
  else if(name == 'help') {
    if(Update.helpWindow == null || Update.helpWindow.closed)
      Update.helpWindow = window.open(HELP_URL, 'help');
    else
      Update.helpWindow.focus();
  }
  else if(name == 'spellcats') {
    var matchInfo = InputGetValue(editForm.spellcats_sel).match(/\((\D+)\)/);
    showCodes[matchInfo[1]] = value;
    InputSetOptions(editForm.spells_sel, ChoicesForSpellInput());
    if(editForm.spells_sel.options.length == 0) { /* Stupid bug in Opera */
      RedrawEditor();
      RefreshEditor();
    }
  }
  else if(name == 'summary')
    SummarizeCachedAttrs();
  else if(name == 'validate') {
    if(Update.validateWindow == null || Update.validateWindow.closed)
      Update.validateWindow = window.open('', 'vdate', 'height=400,width=400');
    else
      Update.validateWindow.focus();
    Update.validateWindow.document.write(
      '<html><head><title>Character Validation Check</title></head>\n' +
      '<body bgcolor="' + BACKGROUND + '">\n' +
      '<h2>Validation Results</h2>\n<p>\n' +
      ValidationHtml() +
      '\n</p>\n</body></html>\n'
    );
    Update.validateWindow.document.close();
  }
  else if(name == 'view') {
    ShowHtml(SheetHtml());
    cachedAttrs[currentUrl] = CopyObject(character.attributes);
  }
  else if(name.indexOf('_sel') >= 0) {
    name = name.substring(0, name.length - 4);
    input = editForm[name]
    if(input != null) {
      if(name == 'spellcats') {
        var matchInfo=InputGetValue(editForm.spellcats_sel).match(/\((\D+)\)/);
        InputSetValue(input, showCodes[matchInfo[1]]);
      }
      else
        InputSetValue(input, character.attributes[name + '.' + value]);
    }
  }
  else {
    var selector = editForm[name + '_sel'];
    if(selector != null)
      name += '.' + InputGetValue(selector);
    if(!value && DndCharacter.defaults[name] == null)
      delete character.attributes[name];
    else if(typeof(value) == 'string' &&
            value.match(/^\+-?\d+$/) &&
            typeof(character.attributes[name]) == 'string' &&
            character.attributes[name].match(/^\d+$/)) {
      character.attributes[name] =
        ((character.attributes[name] - 0) + (value.substring(1) - 0)) + '';
      InputSetValue(input, character.attributes[name]);
    }
    else if(name == 'spells.--- No spell categories selected ---')
      InputSetValue(input, 0);
    else
      character.attributes[name] = value;
    RedrawSheet();
  }

}

/*
 * Returns HTML showing the results of applying validation rules to the current
 * character's attributes.
 */
function ValidationHtml() {
  var computedAttributes = rules.Apply(character.attributes);
  var errors;
  var i;
  var invalid = DndCharacter.Validate(computedAttributes);
  var result = '';
  for(i = 0; i < invalid.length; i++)
    result += 'Failed test: ' + invalid[i] + '<br/>';
  /*
   * Because of cross-class skills, we can't write a simple validation test for
   * the number of assigned skill points; we have to compute it here.
   */
  var maxRanks = computedAttributes.classSkillMaxRanks;
  var skillPointsAssigned = 0;
  for(var a in character.attributes) {
    if(a.substring(0, 7) != 'skills.')
      continue;
    var skill = a.substring(7);
    var isCross = computedAttributes['classSkills.' + skill] == null;
    var maxAllowed = maxRanks / (isCross ? 2 : 1);
    if(character.attributes[a] > maxAllowed)
      result += 'Failed test: {' + skill + '} <= ' + maxAllowed + '<br/>';
    skillPointsAssigned += character.attributes[a] * (isCross ? 2 : 1);
  }
  if(skillPointsAssigned != computedAttributes.skillPoints)
    result += 'Failed test: Sum(/^skills\\.*) == ' +
              computedAttributes.skillPoints + '<br/>';
  for(i = -1, errors = 0; (i = result.indexOf('<br/>', i + 1)) >= 0; errors++)
    ; /* empty */
  result += errors + ' validation error' + (errors == 1 ? '' : 's') + '<br/>';
  return result;
}
