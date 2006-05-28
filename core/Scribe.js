/* $Id: Scribe.js,v 1.141 2006/05/28 06:23:32 Jim Exp $ */

var COPYRIGHT = 'Copyright 2005 James J. Hayes';
var VERSION = '0.28.17';
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
var EMPTY_SPELL_LIST = '--- No spell categories selected ---';
var TIMEOUT_DELAY = 1000; /* One second */

var cachedAttrs = {}; /* Unchanged attrs of all characters opened so far */
var character;      /* Current RPG Character */
var characterUrl;   /* URL of current RPG Character */
var cookieInfo = {  /* What we store in the cookie */
  dmonly: '0',     /* Show information marked "dmonly" on sheet? */
  italics: '1',    /* Show italicized notes on sheet? */
  recent: '',      /* Comma-separated and -terminated list of recent opens */
  untrained: '0'   /* Show untrained skills on sheet? */
};
var editForm;       /* Character editing form (window.frames[0].forms[0]) */
var loadingPopup = null; /* Current "loading" message popup window */
var rules;          /* RuleEngine with standard + user rules */
var showCodes;      /* Display status of spell category codes */
var urlLoading=null;/* Character URL presently loading */
var viewer;         /* ObjectViewer to translate character attrs into HTML */

/* Launch routine called after all Scribe scripts are loaded. */
function Scribe() {

  var defaults = {
    'BACKGROUND':'wheat', 'CLASS_RULES_VERSION':'3.5',
    'FEAT_RULES_VERSION':'3.5', 'HELP_URL':'scribedoc.html',
    'LOGO_URL':'scribe.gif', 'MAGIC_RULES_VERSION':'3.5',
    'MAX_RECENT_OPENS':20, 'URL_PREFIX':'', 'URL_SUFFIX':'.html',
    'WARN_ABOUT_DISCARD':true
  };

  if(InputGetValue == null || ObjectViewer == null || RuleEngine == null) {
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

  for(var a in defaults) {
    if(window[a] == null)
      window[a] = defaults[a];
  }

  var i = document.cookie.indexOf(COOKIE_NAME + '=');
  if(i >= 0) {
    var end = document.cookie.indexOf(';', i);
    if(end < 0)
      end = document.cookie.length;
    var cookie = document.cookie.substring(i + COOKIE_NAME.length + 1, end);
    var settings = unescape(cookie).split(COOKIE_FIELD_SEPARATOR);
    for(i = 0; i < settings.length; i += 2) {
      if(cookieInfo[settings[i]] != null)
        cookieInfo[settings[i]] = settings[i + 1];
    }
  }

  PopUp('<img src="' + LOGO_URL + '" alt="Scribe"/><br/>' +
        COPYRIGHT + '<br/>' +
        'Press the "About" button for more info',
        'Ok', 'window.close();');
  rules = new RuleEngine();
  viewer = InitialViewer();
  if(CustomizeScribe != null)
    CustomizeScribe();
  character = {};
  RefreshShowCodes();
  RefreshEditor(true);
  RandomizeCharacter(false);
  /*
  if(SCRIBE_DEBUG != null) {
    var html = '<html><head><title>Scribe Attributes</title></head>\n<body>\n';
    var attrs = rules.AllSources();
    html += '<h2>Sources</h2>\n' + attrs.join('<br/>\n') + '\n';
    attrs = rules.AllTargets();
    html += '<h2>Targets</h2>\n' + attrs.join('<br/>\n') + '\n';
    html += '</body></html>\n';
    var w = window.open('', 'attrwin');
    w.document.write(html);
    w.document.close();
  }
  */

}
Scribe.randomizers = {};
Scribe.tests = [];

/* Mapping of medium damage to small damage. */
Scribe.smallDamage = {
  'd2':'d1', 'd3':'d2', 'd4':'d3', 'd6':'d4', 'd8':'d6', '2d4':'d6', 'd10':'d8',
  'd12':'d10', '2d6':'d10', '2d8':'2d6', '2d10':'2d8'
};

Scribe.spellsCategoryCodes = {
  'Bard': 'B', 'Cleric': 'C', 'Druid': 'D', 'Paladin': 'P', 'Ranger': 'R',
  'Sorcerer': 'W', 'Wizard': 'W',
  'Air':'Ai', 'Animal':'An', 'Chaos':'Ch', 'Death':'De', 'Destruction':'Dn',
  'Earth':'Ea', 'Evil':'Ev', 'Fire':'Fi', 'Good':'Go', 'Healing':'He',
  'Knowledge':'Kn', 'Law':'La', 'Luck':'Lu', 'Magic':'Ma', 'Plant':'Pl',
  'Protection':'Pr', 'Strength':'St', 'Sun':'Su', 'Travel':'Tl',
  'Trickery':'Ty', 'War':'Wr', 'Water':'Wa'
};

/* Returns a sorted array containing all keys from object #o#. */
Scribe.GetKeys = function(o) {
  var result = [];
  for(var a in o) {
    result[result.length] = a;
  }
  result.sort();
  return result;
}

/* Returns a random integer in the range low .. high, inclusive. */
Scribe.Random = function(low, hi) {
  return Math.floor(Math.random() * (hi - low + 1) + low);
};

/* Returns an array of choices for the editor's New/Open select input. */
function ChoicesForFileInput() {
  var result = cookieInfo.recent.split(',');
  result.length--; /* Trim trailing empty element */
  result = ['--New/Open--', 'New...', 'Open...'].concat(result);
  return result;
}

/* Returns a recursively-copied clone of #o#. */
function CopyObject(o) {
  if(typeof o != 'object' || o == null)
    return o;
  var result = new Object();
  for(var a in o) {
    result[a] = CopyObject(o[a]);
  }
  return result;
}

/* Returns HTML for the character editor form. */
function EditorHtml() {
  var abilityChoices=[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  var spellsCategoryOptions = [];
  for(var a in Scribe.spellsCategoryCodes) {
    spellsCategoryOptions[spellsCategoryOptions.length] =
      a + '(' + Scribe.spellsCategoryCodes[a] + ')';
  }
  spellsCategoryOptions.sort();
  var weapons = Scribe.GetKeys(Scribe.weapons);
  var editorElements = [
    ['', 'about', 'button', ['About']],
    ['', 'help', 'button', ['Help']],
    [' ', 'file', 'select-one', ChoicesForFileInput()],
    ['', 'summary', 'button', ['Summary']],
    [' ', 'validate', 'button', ['Validate']],
    ['', 'view', 'button', ['View Html']],
    ['Show: ', 'italics', 'checkbox', ['Italic Notes']],
    ['', 'untrained', 'checkbox', ['Untrained Skills']],
    ['', 'dmonly', 'checkbox', ['DM Info']],
    [' ', 'randomize', 'select-one',
      ['--Randomize--'].concat(Scribe.GetKeys(Scribe.randomizers))],
    ['Name', 'name', 'text', [20]],
    ['Race', 'race', 'select-one', Scribe.GetKeys(Scribe.races)],
    ['Experience', 'experience', 'text', [8]],
    ['Levels', 'levels_sel', 'select-one', Scribe.GetKeys(Scribe.classes)],
    ['', 'levels', 'text', [3]],
    ['Image URL', 'imageUrl', 'text', [20]],
    ['Strength', 'strength', 'select-one', abilityChoices],
    ['Intelligence', 'intelligence', 'select-one', abilityChoices],
    ['Wisdom', 'wisdom', 'select-one', abilityChoices],
    ['Dexterity', 'dexterity', 'select-one', abilityChoices],
    ['Constitution', 'constitution', 'select-one', abilityChoices],
    ['Charisma', 'charisma', 'select-one', abilityChoices],
    ['Player', 'player', 'text', [20]],
    ['Alignment', 'alignment', 'select-one', Scribe.GetKeys(Scribe.alignments)],
    ['Gender', 'gender', 'select-one', Scribe.GetKeys(Scribe.genders)],
    ['Deity', 'deity', 'select-one', Scribe.GetKeys(Scribe.deities)],
    ['Origin', 'origin', 'text', [20]],
    ['Feats', 'feats_sel', 'select-one', Scribe.GetKeys(Scribe.feats)],
    ['', 'feats', 'checkbox', null],
    ['', 'feats_clear', 'button', ['Clear All']],
    ['Skills', 'skills_sel', 'select-one', Scribe.GetKeys(Scribe.skills)],
    ['', 'skills', 'text', [3]],
    ['', 'skills_clear', 'button', ['Clear All']],
    ['Languages', 'languages_sel', 'select-one',
     Scribe.GetKeys(Scribe.languages)],
    ['', 'languages', 'checkbox', null],
    ['', 'languages_clear', 'button', ['Clear All']],
    ['Hit Points', 'hitPoints', 'text', [4]],
    ['Armor', 'armor', 'select-one', Scribe.GetKeys(Scribe.armors)],
    ['Shield', 'shield', 'select-one', Scribe.GetKeys(Scribe.shields)],
    ['Weapons', 'weapons_sel', 'select-one', weapons],
    ['', 'weapons', 'text', [3]],
    ['', 'weapons_clear', 'button', ['Clear All']],
    ['Spell Categories', 'spellcats_sel', 'select-one', spellsCategoryOptions],
    ['', 'spellcats', 'checkbox', null],
    ['Spells', 'spells_sel', 'select-one', Scribe.GetKeys(Scribe.spells)],
    ['', 'spells', 'checkbox', null],
    ['', 'spells_clear', 'button', ['Clear All']],
    ['Goodies', 'goodies_sel', 'select-one', Scribe.GetKeys(Scribe.goodies)],
    ['', 'goodies', 'text', [2]],
    ['', 'goodies_clear', 'button', ['Clear All']],
    ['Cleric Domains', 'domains_sel', 'select-one',
     Scribe.GetKeys(Scribe.domains)],
    ['', 'domains', 'checkbox', null],
    ['', 'domains_clear', 'button', ['Clear All']],
    ['Wizard Specialization', 'specialize_sel', 'select-one',
     Scribe.GetKeys(Scribe.schools)],
    ['', 'specialize', 'checkbox', null],
    ['', 'specialize_clear', 'button', ['Clear All']],
    ['Wizard Prohibition', 'prohibit_sel', 'select-one',
     Scribe.GetKeys(Scribe.schools)],
    ['', 'prohibit', 'checkbox', null],
    ['', 'prohibit_clear', 'button', ['Clear All']],
    ['Notes', 'notes', 'textarea', [40,10]],
    ['DM Notes', 'dmNotes', 'textarea', [40,10]]
  ];
  // TODO Define a way to add editor fields and move to MN2E.js.
  if(Scribe.heroicPaths != null) {
    var hp = [['Heroic Path', 'heroicPath', 'select-one', Scribe.GetKeys(Scribe.heroicPaths)]];
    for(var i = 0; i < editorElements.length; i++) {
      if(editorElements[i][0] == 'Experience') {
        editorElements =
         editorElements.slice(0, i).concat(hp).concat(editorElements.slice(i));
        break;
      }
    }
  }
  if(Scribe.selectableFeatures != null) {
    var sf = [['Selectable Features', 'selectableFeatures_sel', 'select-one', Scribe.GetKeys(Scribe.selectableFeatures)],
              ['', 'selectableFeatures', 'checkbox', null],
              ['', 'selectableFeatures_clear', 'button', ['Clear All']]];
    for(var i = 0; i < editorElements.length; i++) {
      if(editorElements[i][0] == 'Skills') {
        editorElements =
         editorElements.slice(0, i).concat(sf).concat(editorElements.slice(i));
        break;
      }
    }
  }
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

/* Returns true iff all attributes of #o1# have the same values in #o2#. */
function EqualObjects(o1, o2) {
  if(typeof o1 != "object" || typeof o2 != "object")
    return o1 == o2;
  var o1Keys = Scribe.GetKeys(o1), o2Keys = Scribe.GetKeys(o2);
  if(o1Keys.length != o2Keys.length)
    return false;
  for(var i = 0; i < o1Keys.length; i++) {
    var key = o1Keys[i];
    if(o2Keys[i] != key || !EqualObjects(o1[key], o2[key]))
      return false;
  }
  return true;
}

/* Returns an ObjectViewer loaded with the default character sheet format. */
function InitialViewer() {
  var result = new ObjectViewer();
  result.addElements(
    {name: '_top', borders: 1, separator: '\n'},
    {name: 'Header', within: '_top'},
      {name: 'Identity', within: 'Header', separator: ''},
        {name: 'Name', within: 'Identity', format: '<b>%V</b>'},
        {name: 'Race', within: 'Identity', format: ' -- <b>%V</b>'},
        {name: 'Levels', within: 'Identity', format: ' <b>%V</b>',
         separator: '/'},
      {name: 'Image Url', within: 'Header', format: '<img src="%V">'},
    {name: 'Attributes', within: '_top', separator: '\n'},
      {name: 'Abilities', within: 'Attributes'},
        {name: 'StrInfo', within: 'Abilities', separator: ''},
          {name: 'Strength', within: 'StrInfo'},
          {name: 'Strength Modifier', within: 'StrInfo', format: ' (%V)'},
        {name: 'IntInfo', within: 'Abilities', separator: ''},
          {name: 'Intelligence', within: 'IntInfo'},
          {name: 'Intelligence Modifier', within: 'IntInfo',format: ' (%V)'},
        {name: 'WisInfo', within: 'Abilities', separator: ''},
          {name: 'Wisdom', within: 'WisInfo'},
          {name: 'Wisdom Modifier', within: 'WisInfo', format: ' (%V)'},
        {name: 'DexInfo', within: 'Abilities', separator: ''},
          {name: 'Dexterity', within: 'DexInfo'},
          {name: 'Dexterity Modifier', within: 'DexInfo', format: ' (%V)'},
        {name: 'ConInfo', within: 'Abilities', separator: ''},
          {name: 'Constitution', within: 'ConInfo'},
          {name: 'Constitution Modifier', within: 'ConInfo',format: ' (%V)'},
        {name: 'ChaInfo', within: 'Abilities', separator: ''},
          {name: 'Charisma', within: 'ChaInfo'},
          {name: 'Charisma Modifier', within: 'ChaInfo', format: ' (%V)'},
      {name: 'Description', within: 'Attributes'},
        {name: 'Alignment', within: 'Description'},
        {name: 'Deity', within: 'Description'},
        {name: 'Origin', within: 'Description'},
        {name: 'Gender', within: 'Description'},
        {name: 'Player', within: 'Description'},
      {name: 'Statistics', within: 'Attributes'},
        {name: 'ExperienceInfo', within: 'Statistics', separator: ''},
          {name: 'Experience', within: 'ExperienceInfo'},
          {name: 'Experience Needed', within: 'ExperienceInfo', format: '/%V'},
        {name: 'Level', within: 'Statistics'},
        {name: 'SpeedInfo', within: 'Statistics', separator: ''},
          {name: 'Speed', within: 'SpeedInfo',
            format: '<b>Speed/Run</b>: %V'},
          {name: 'Run Speed', within: 'SpeedInfo', format: '/%V'},
        {name: 'LoadInfo', within: 'Statistics', separator: ''},
          {name: 'Load Light', within: 'LoadInfo',
            format: '<b>Light/Med/Max Load:</b> %V'},
          {name: 'Load Medium', within: 'LoadInfo', format: '/%V'},
          {name: 'Load Max', within: 'LoadInfo', format: '/%V'},
      {name: 'Ability Notes', within: 'Attributes', separator: ' * '},
    {name: 'FeaturesAndSkills', within: '_top', separator: '\n',
      format: '<b>Features/Skills</b><br/>%V'},
      {name: 'FeatStats', within: 'FeaturesAndSkills'},
        {name: 'Feat Count', within: 'FeatStats'},
      {name: 'Feats', within: 'FeaturesAndSkills',
        format: '<b>Selected Feats/Features</b>: %V', separator: ' * '},
      {name: 'Features', within: 'FeaturesAndSkills',
        format: '<b>Acquired Features</b>: %V', separator: ' * '},
      {name: 'Feature Notes', within: 'FeaturesAndSkills', separator: ' * '},
      {name: 'SkillStats', within: 'FeaturesAndSkills'},
        {name: 'Skill Points', within: 'SkillStats'},
        {name: 'SkillRanksInfo', within: 'SkillStats', separator: ''},
          {name: 'Class Skill Max Ranks', within: 'SkillRanksInfo',
            format: '<b>Class/Cross Skill Max Ranks</b>: %V'},
          {name: 'Cross Skill Max Ranks', within: 'SkillRanksInfo',
            format: '/%V'},
      {name: 'Skills', within: 'FeaturesAndSkills', separator: ' * '},
      {name: 'Skill Notes', within: 'FeaturesAndSkills', separator: ' * '},
      {name: 'LanguageStats', within: 'FeaturesAndSkills'},
        {name: 'Language Count', within: 'LanguageStats'},
      {name: 'Languages', within: 'FeaturesAndSkills', separator: ' * '},
    {name: 'Combat', within: '_top', separator: '\n',
      format: '<b>Combat</b><br/>%V'},
      {name: 'CombatInfo', within: 'Combat'},
        {name: 'Hit Points', within: 'CombatInfo'},
        {name: 'Initiative', within: 'CombatInfo'},
        {name: 'Armor Class', within: 'CombatInfo'},
        {name: 'AttackInfo', within: 'CombatInfo', separator: ''},
          {name: 'Base Attack', within: 'AttackInfo',
            format: '<b>Base/Melee/Ranged Attack</b>: %V'},
          {name: 'Melee Attack', within: 'AttackInfo', format: '/%V'},
          {name: 'Ranged Attack', within: 'AttackInfo', format: '/%V'},
      {name: 'Turning', within: 'Combat'},
        {name: 'Turning Frequency', within: 'Turning',
          format: '<b>%N</b>: %V/Day'},
        {name: 'TurningMinMaxInfo', within: 'Turning', separator: ''},
          {name: 'Turning Min', within: 'TurningMinMaxInfo',
            format: '<b>Turning Min/Max HD</b>: %V'},
          {name: 'Turning Max', within: 'TurningMinMaxInfo', format: '/%V'},
        {name: 'Turning Damage Modifier', within: 'Turning',
          format: '<b>Turning Damage</b>: 2d6+%V'},
      {name: 'Weapons', within: 'Combat', separator: ' * '},
      {name: 'Geer', within: 'Combat'},
        {name: 'Armor Proficiency', within: 'Geer'},
        {name: 'Armor', within: 'Geer'},
        {name: 'Shield Proficiency', within: 'Geer'},
        {name: 'Shield', within: 'Geer'},
        {name: 'Weapon Proficiency', within: 'Geer'},
      {name: 'Combat Notes', within: 'Combat', separator: ' * '},
      {name: 'Saves', within: 'Combat'},
        {name: 'Save Fortitude', within: 'Saves'},
        {name: 'Save Reflex', within: 'Saves'},
        {name: 'Save Will', within: 'Saves'},
      {name: 'Save Notes', within: 'Combat', separator: ' * '},
    {name: 'Magic', within: '_top', separator: '\n',
      format: '<b>Magic</b><br/>%V'},
      {name: 'SpellStats', within: 'Magic'},
        {name: 'Spells Per Day', within: 'SpellStats', separator: ' * '},
        {name: 'Domains', within: 'SpellStats', separator: ' * '},
        {name: 'Specialize', within: 'SpellStats'},
        {name: 'Prohibit', within: 'SpellStats', separator: ' * '},
      {name: 'Spells', within: 'Magic', separator: ' * '},
      {name: 'Goodies', within: 'Magic', separator: ' * '},
      {name: 'Magic Notes', within: 'Magic', separator: ' * '},
    {name: 'Notes Area', within: '_top', separator: '\n',
      format: '<b>Notes</b><br/>%V'},
      {name: 'Notes', within: 'Notes Area', format: '%V'},
      {name: 'Dm Notes', within: 'Notes Area', format: '%V'}
  );
  return result;
}

/*
 * Starts the process of loading #name# (a full or partial URL) into the editor
 * and character sheet windows.  Schedules repeated calls of itself, ignoring
 * new calls, until either the character is loaded or the user cancels.
 */
function LoadCharacter(name) {
  var OLD_DEFAULTS = {
    'alignment': 'Neutral Good', 'armor': 'None', 'charisma': 10,
    'constitution': 10, 'deity': 'None', 'dexterity': 10, 'experience': 0,
    'gender': 'Male', 'hitPoints': 0, 'intelligence': 10,
    'name': 'New Character', 'race': 'Human', 'shield': 'None', 'strength': 10,
    'wisdom': 10
  };
  var loadingWindow = window.frames[1];
  var url = name;
  if(url.match(/^\w*:/) == null)
    url = URL_PREFIX + url;
  if(url.match(/\.\w*$/) == null)
    url += URL_SUFFIX;
  if(urlLoading == url && loadingPopup.closed) {
    urlLoading = null; /* User cancel. */
  } else if(urlLoading == url && loadingWindow.attributes != null) {
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
    character = {};
    /*
     * Turn objects into "dot" attributes and convert values from prior
     * versions of Scribe.
     */
    for(var a in loadingWindow.attributes) {
      var value = loadingWindow.attributes[a];
      if(typeof value == 'object') {
        for(var x in value) {
          if(a == 'combatStyle') {
            character['feats.Combat Style (' + x + ')'] = '1';
          } else if(a == 'focus')
            character['feats.Weapon Focus (' + x + ')'] = '1';
          else if(a == 'specialization') {
            character['feats.Weapon Specialization (' + x + ')'] = '1';
          } else {
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
            character[a + '.' + convertedName] = value[x];
          }
        }
      } else if(a == 'shield' && value.indexOf('Large') == 0) {
        character[a] = 'Heavy' + value.substring(5);
      } else if(a == 'shield' && value.indexOf('Small') == 0) {
        character[a] = 'Light' + value.substring(5);
      } else {
        character[a] = value;
      }
    }
    for(var a in OLD_DEFAULTS) {
      if(character[a] == null)
        character[a] = OLD_DEFAULTS[a];
    }
    RefreshShowCodes();
    RefreshEditor(false);
    RefreshSheet();
    currentUrl = name;
    cachedAttrs[currentUrl] = CopyObject(character);
    urlLoading = null;
    if(!loadingPopup.closed)
      loadingPopup.close();
  } else if(urlLoading == null) {
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
  } else {
    /* Something (possibly this function) in progress; try again later. */
    setTimeout('LoadCharacter("' + name + '")', TIMEOUT_DELAY);
  }
}

/* Prompts the user for a character URL and starts the load. */
function OpenDialog() {
  if(loadingPopup != null && !loadingPopup.closed)
    return; /* Ignore during load. */
  var name = prompt('Enter URL to Edit (Blank for Random Character)', '');
  if(name == null)
    return; /* User cancel. */
  if(name == '')
    RandomizeCharacter(true);
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
  for(var i = 2; i < arguments.length; i += 2) {
    content +=
      '<input type="button" value="' + arguments[i - 1] + '" ' +
                           'onclick="' + arguments[i] + '"/>\n';
  }
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
function RandomizeCharacter(prompt) {
  if(!prompt || (urlLoading == 'random' && loadingPopup.okay != null)) {
    /* Ready to generate. */
    var totalLevels = 0;
    var value;
    character = {};
    if(prompt) {
      character.race = InputGetValue(loadingPopup.document.frm.race);
      for(var a in Scribe.classes) {
        var attr = 'levels.' + a;
        if((value = InputGetValue(loadingPopup.document.frm[attr])) != null &&
           value > 0) {
          character[attr] = value;
          totalLevels += character[attr] - 0;
        }
      }
    } else {
      Scribe.randomizers['race'](rules, character, 'race');
    }
    if(totalLevels == 0) {
      Scribe.randomizers['levels'](rules, character, 'levels');
      totalLevels = 1;
    }
    character.experience = totalLevels * (totalLevels-1) * 1000 / 2;
    for(var a in Scribe.randomizers) {
      if(a != 'race' && a != 'levels')
        Scribe.randomizers[a](rules, character, a);
    }
    RefreshShowCodes();
    RefreshEditor(false);
    RefreshSheet();
    currentUrl = 'random';
    cachedAttrs[currentUrl] = CopyObject(character);
    if(loadingPopup != null)
      loadingPopup.close();
    urlLoading = null;
  } else if(urlLoading == 'random' && loadingPopup.closed) {
    urlLoading = null; /* User cancel. */
  } else if(urlLoading == null) {
    /* Nothing presently loading. */
    urlLoading = 'random';
    var classes = Scribe.GetKeys(Scribe.classes);
    var htmlBits = [
      '<html><head><title>New Character</title></head>\n',
      '<body bgcolor="' + BACKGROUND + '">\n',
      '<img src="' + LOGO_URL + ' "/><br/>\n',
      '<h2>New Character Attributes</h2>\n',
      '<form name="frm"><table>\n',
      '<tr><th>Race</th><td>' +
      InputHtml('race', 'select-one', Scribe.GetKeys(Scribe.races)) + '</td></tr>\n',
      '<tr><th>Level(s)</th></tr>\n'
    ];
    for(var i = 0; i < classes.length; i++)
      htmlBits[htmlBits.length] =
        '<tr><th>' + classes[i] + '</th><td>' +
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
      Scribe.Random(0, Scribe.GetKeys(Scribe.races).length - 1);
    loadingPopup.okay = null;
    setTimeout('RandomizeCharacter(' + prompt + ')', TIMEOUT_DELAY);
  } else {
    /* Something (possibly this function) in progress; try again later. */
    setTimeout('RandomizeCharacter(' + prompt + ')', TIMEOUT_DELAY);
  }
}

/*
 * Resets the editing window fields to the values of the current character.
 * First redraws the editor if #redraw# is true.
 */
function RefreshEditor(redraw) {

  var i;

  if(redraw) {
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
    for(i = 0; i < editForm.elements.length; i++) {
      InputSetCallback(editForm.elements[i], callback);
    }
  }

  var fileOpts = ChoicesForFileInput();
  var spellOpts = [];
  for(var a in Scribe.spells) {
    var matchInfo;
    var spellLevels = Scribe.spells[a].split('/');
    for(i = 0; i < spellLevels.length; i++) {
      if((matchInfo = spellLevels[i].match(/^(\D+)\d+$/)) != null &&
         showCodes[matchInfo[1]])
        spellOpts[spellOpts.length] = a + '(' + spellLevels[i] + ')';
    }
  }
  if(spellOpts.length == 0)
    spellOpts[spellOpts.length] = EMPTY_SPELL_LIST;
  spellOpts.sort();

  InputSetOptions(editForm.file, fileOpts);
  InputSetOptions(editForm.spells_sel, spellOpts);
  if(!redraw &&
     (editForm.file.options.length != fileOpts.length ||
      editForm.spells_sel.options.length != spellOpts.length)) /* Opera bug */
    return RefreshEditor(true);

  /* Skip to first character-related editor input */
  for(i = 0;
      i < editForm.elements.length && editForm.elements[i].name != 'name';
      i++)
    ; /* empty */
  for( ; i < editForm.elements.length; i++) {
    var input = editForm.elements[i];
    var name = input.name;
    var sel = editForm[name + '_sel'];
    var value = null;
    if(name.indexOf('_sel') >= 0) {
      var prefix = name.substring(0, name.indexOf('_sel')) + '.';
      for(var a in character) {
        if(a.substring(0, prefix.length) == prefix) {
          value = a.substring(prefix.length);
          break;
        }
      }
    } else if(sel == null) {
      value = character[name];
    } else {
      value = character[name + '.' + InputGetValue(sel)];
    }
    if(InputGetValue(input) != value)
      InputSetValue(input, value);
  }
  var attrs = rules.Apply(character);
  for(i = 0; i < editForm.skills_sel.options.length; i++) {
    var opt = editForm.skills_sel.options[i];
    opt.text =
      opt.value + (attrs['classSkills.' + opt.value] == null ? ' (cc)' : '');
  }

  InputSetValue(editForm.dmonly, cookieInfo.dmonly - 0);
  InputSetValue(editForm.italics, cookieInfo.italics - 0);
  InputSetValue(editForm.untrained, cookieInfo.untrained - 0);
  var codeOpts = Scribe.GetKeys(Scribe.spellsCategoryCodes);
  codeOpts.sort();
  for(i = 0;
      i < codeOpts.length &&
      !showCodes[Scribe.spellsCategoryCodes[codeOpts[i]]];
      i++)
    ; /* empty */
  editForm.spellcats_sel.selectedIndex = i < codeOpts.length ? i : 0;
  InputSetValue(editForm.spellcats, i < codeOpts.length);

}

/* Draws the sheet for the current character in the character sheet window. */
function RefreshSheet() {
  var sheetWindow = window.opener;
  if(sheetWindow == null || sheetWindow.closed)
    sheetWindow = window.open('', 'scribeSheet');
  sheetWindow.document.write(SheetHtml());
  sheetWindow.document.close();
}

/* Recomputes the showCodes global to reflect the current character's spells. */
function RefreshShowCodes() {
  var matchInfo;
  showCodes = {};
  for(var a in Scribe.spellsCategoryCodes) {
    showCodes[Scribe.spellsCategoryCodes[a]] = false;
  }
  for(var a in character) {
    if((matchInfo = a.match(/^spells\..*\((\D+)\d+\)$/)) != null)
      showCodes[matchInfo[1]] = true;
    else if((matchInfo = a.match(/^(domains|levels)\.(.*)$/)) != null &&
            Scribe.spellsCategoryCodes[matchInfo[2]] != null)
      showCodes[Scribe.spellsCategoryCodes[matchInfo[2]]] = true;
  }
}

/* Returns the character sheet HTML for the current character. */
function SheetHtml() {

  var a;
  var attrs = CopyObject(character);
  var codeAttributes = {};
  var computedAttributes;
  var displayAttributes = {};
  var i;

  for(a in character) {
    /* Turn "dot" attributes into objects. */
    if((i = a.indexOf('.')) < 0) {
      codeAttributes[a] = attrs[a];
    } else {
      var object = a.substring(0, i);
      if(codeAttributes[object] == null)
        codeAttributes[object] = {};
      codeAttributes[object][a.substring(i + 1)] = attrs[a];
    }
  }

  attrs.dmonly = cookieInfo.dmonly - 0;
  if(cookieInfo.untrained == '1') {
    for(a in Scribe.skills) {
      if(character['skills.' + a] == null &&
         Scribe.skills[a].indexOf('/trained') < 0)
        attrs['skills.' + a] = 0;
    }
  }
  computedAttributes = rules.Apply(attrs);
  if(cookieInfo.untrained == '1') {
    for(a in Scribe.skills) {
      if(character['skills.' + a] == null &&
         computedAttributes['skills.' + a] == 0)
        delete computedAttributes['skills.' + a];
    }
  }
  for(a in computedAttributes) {
    if(a.search(/^feats\./) >= 0)
      delete computedAttributes['features.' + a.substring(6)];
  }
  /*
   * NOTE: The ObjectFormatter doesn't support interspersing values in a list
   * (e.g., skill ability, weapon damage), so we do some inelegant manipulation
   * of displayAttributes' names and values here to get the sheet to look right.
   */
  var strengthDamageAdjustment =
    computedAttributes['combatNotes.strengthDamageAdjustment'];
  if(strengthDamageAdjustment == null)
    strengthDamageAdjustment = 0;
  for(a in computedAttributes) {
    var name = a.replace(/([a-z\)])([A-Z\(])/g, '$1 $2');
    name = name.substring(0, 1).toUpperCase() + name.substring(1);
    var value = computedAttributes[a];
    /* Add entered value in brackets if it differs from computed value. */
    if(attrs[a] != null && attrs[a] != value)
      value += '[' + attrs[a] + ']';
    if((i = name.indexOf('.')) < 0) {
      if(name == 'imageUrl' && value.match(/^\w*:/) == null)
        value = URL_PREFIX + value;
      displayAttributes[name] = value;
    } else {
      var object = name.substring(0, i);
      name = name.substring(i + 1, i + 2).toUpperCase() + name.substring(i + 2);
      if(object.indexOf('Notes') >= 0 && typeof(value) == 'number') {
        if(value == 0)
          continue; /* Suppress notes with zero value. */
        else if(Scribe.notes[a] == null)
          value = Signed(value); /* Make signed if not otherwise formatted. */
      }
      if(Scribe.notes[a] != null)
        value = Scribe.notes[a].replace(/%V/, value);
      if(object == 'Skills') {
        var ability = Scribe.skills[name];
        var skillInfo = new Array();
        if(ability != null && ability != '' && ability.substring(0, 1) != '/')
          skillInfo[skillInfo.length] = ability.substring(0, 3);
        if(computedAttributes['classSkills.' + name] == null)
          skillInfo[skillInfo.length] = 'cc';
        if(skillInfo.length > 0)
          name += ' (' + skillInfo.join(';') + ')';
      } else if(object == 'Weapons') {
        var damages = Scribe.weapons[name];
        damages = damages == null ? 'd6' : damages.replace(/ /g, '');
        var range;
        if((i = damages.search(/[rR]/)) < 0) {
          range = 0;
        } else {
          range = damages.substring(i + 1) - 0;
          damages = damages.substring(0, i);
          if(computedAttributes['weaponRangeAdjustment.' + name] != null)
            range += computedAttributes['weaponRangeAdjustment.' + name] - 0;
          if(computedAttributes['features.Far Shot'] != null)
            range *= name.indexOf('bow') < 0 ? 2 : 1.5;
        }
        var attack =
          range == 0 ||
          name.match
            (/^(Club|Dagger|Light Hammer|Shortspear|Spear|Trident)$/) != null ?
          computedAttributes.meleeAttack : computedAttributes.rangedAttack;
        if(computedAttributes['weaponAttackAdjustment.' + name] != null)
          attack += computedAttributes['weaponAttackAdjustment.' + name] - 0;
        var addedDamage = strengthDamageAdjustment;
        if(name.indexOf('bow') >= 0 &&
           (name.indexOf('Composite') < 0 || addedDamage > 0))
          addedDamage = 0;
        if(computedAttributes['weaponDamageAdjustment.' + name] != null)
          addedDamage += computedAttributes['weaponDamageAdjustment.'+name] - 0;
        damages = damages == null ? ['0'] : damages.split('/');
        for(i = 0; i < damages.length; i++) {
          var pieces =
            damages[i].match(/^(\d*d\d+)([\+\-]\d+)? *(x(\d+))? *(@(\d+))?$/);
          if(pieces == null)
            pieces = ['d6', 'd6'];
          var additional = (pieces[2] ? pieces[2] - 0 : 0) + addedDamage;
          var damage = computedAttributes['weaponDamage.' + name];
          if(damage == null)
            damage = pieces[1];
          var multiplier = pieces[4] ? pieces[4] - 0 : 2;
          var smallDamage = Scribe.smallDamage[damage];
          var threat = pieces[6] ? pieces[6] - 0 : 20;
          if(computedAttributes['weaponCriticalAdjustment.' + name] != null)
            threat -= computedAttributes['weaponCriticalAdjustment.' + name];
          if(computedAttributes['features.Small'] && smallDamage != null)
            damage = smallDamage;
          if(additional != 0)
            damage += Signed(additional);
          damages[i] = damage + ' x' + multiplier + '@' + threat;
        }
        name += '(' + Signed(attack) + ' ' + damages.join('/') +
                (range != 0 ? ' R' + range : '') + ')';
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
    if(typeof displayAttributes[a] == 'object')
      displayAttributes[a].sort();
  }

  return '<' + '!' + '-- Generated ' + new Date().toString() +
           ' by Scribe version ' + VERSION + ' --' + '>\n' +
         '<html>\n' +
         '<head>\n' +
         '  <title>' + attrs.name + '</title>\n' +
         '  <script>\n' +
         'var attributes = ' + ObjectViewer.toCode(codeAttributes) + ';\n' +
         '  </' + 'script>\n' +
         '</head>\n' +
         '<body>\n' +
         viewer.getHtml(displayAttributes, '_top') + '\n' +
         '</body>\n' +
         '</html>\n';

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

/* Returns #value# with a leading sign. */
function Signed(value) {
  return (value >= 0 ? '+' : '') + value;
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

/*
 * Opens a window that displays a summary of the attributes of all characters
 * that have been loaded into the editor.
 */
function SummarizeCachedAttrs() {
  var allAttrs = {};
  for(var a in cachedAttrs) {
    if(a != 'random')
      allAttrs[a] = rules.Apply(cachedAttrs[a]);
  }
  var urls = Scribe.GetKeys(allAttrs);
  urls.sort();
  var htmlBits = [
    '<html>',
    '<head><title>Scribe Charcter Attribute Summary</title></head>',
    '<body bgcolor="' + BACKGROUND + '">',
    '<h1>Scribe Character Attribute Summary</h1>',
    '<table border="1">'
  ];
  var rowHtml = '<tr><td></td>';
  for(var i = 0; i < urls.length; i++) {
    rowHtml += '<th>' + urls[i] + '</th>';
  }
  htmlBits[htmlBits.length] = rowHtml;
  var inTable = {};
  for(var a in allAttrs) {
    var spells = [];
    for(var b in allAttrs[a]) {
      if(b.match(/^(features|skills|languages)\./))
        inTable[b] = 1;
      else if(b.match(/^spells\./))
        spells[spells.length] = b.substring(b.indexOf('.') + 1);
    }
    if(spells.length > 0) {
      spells.sort();
      allAttrs[a]['spells'] = spells.join('<br/>');
    }
  }
  inTable['notes'] = inTable['dmNotes'] = inTable['spells'] = 1;
  inTable = Scribe.GetKeys(inTable);
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
  if(SummarizeCachedAttrs.win == null || SummarizeCachedAttrs.win.closed)
    SummarizeCachedAttrs.win = window.open('', 'sumwin');
  else
    SummarizeCachedAttrs.win.focus();
  SummarizeCachedAttrs.win.document.write(htmlBits.join('\n'));
  SummarizeCachedAttrs.win.document.close();
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
  } else if(name.search(/dmonly|italics|untrained/) >= 0) {
    cookieInfo[name] = value + '';
    StoreCookie();
    RefreshSheet();
  } else if(name == 'file') {
    input.selectedIndex = 0;
    if(WARN_ABOUT_DISCARD &&
       !EqualObjects(character, cachedAttrs[currentUrl]) &&
       !confirm("Discard changes to character?"))
      ; /* empty */
    else if(value == 'Open...')
      OpenDialog();
    else if(value == 'New...')
      RandomizeCharacter(true);
    else
      LoadCharacter(value);
  } else if(name == 'help') {
    if(Update.helpWindow == null || Update.helpWindow.closed)
      Update.helpWindow = window.open(HELP_URL, 'help');
    else
      Update.helpWindow.focus();
  } else if(name == 'randomize') {
    input.selectedIndex = 0;
    if(Scribe.randomizers[value] != null) {
      Scribe.randomizers[value](rules, character, value);
      RefreshEditor(false);
      RefreshSheet();
    }
  } else if(name == 'spellcats') {
    var matchInfo = InputGetValue(editForm.spellcats_sel).match(/\((.+)\)/);
    showCodes[matchInfo[1]] = value;
    RefreshEditor(false);
  } else if(name == 'summary') {
    SummarizeCachedAttrs();
  } else if(name == 'validate') {
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
  } else if(name == 'view') {
    ShowHtml(SheetHtml());
    cachedAttrs[currentUrl] = CopyObject(character);
  } else if(name.indexOf('_clear') >= 0) {
    name = name.replace(/_clear/, '');
    for(var a in character) {
      if(a.indexOf(name + '.') == 0)
        delete character[a];
    }
    input = editForm[name]
    if(input != null)
      InputSetValue(input, null);
    input = editForm[name + '_sel']
    if(input != null)
      input.selectedIndex = 0;
    RefreshEditor(false);
    RefreshSheet();
  } else if(name.indexOf('_sel') >= 0) {
    name = name.replace(/_sel/, '');
    input = editForm[name]
    if(input != null) {
      if(name == 'spellcats') {
        var matchInfo=InputGetValue(editForm.spellcats_sel).match(/\((.+)\)/);
        InputSetValue(input, showCodes[matchInfo[1]]);
      }
      else
        InputSetValue(input, character[name + '.' + value]);
    }
  } else {
    var selector = editForm[name + '_sel'];
    if(selector != null)
      name += '.' + InputGetValue(selector);
    if(!value)
      delete character[name];
    else if(typeof(value) == 'string' &&
            value.match(/^\+-?\d+$/) &&
            (typeof(character[name]) == 'number' ||
             (typeof(character[name]) == 'string' &&
              character[name].match(/^\d+$/)))) {
      character[name] = ((character[name] - 0) + (value.substring(1) - 0)) + '';
      InputSetValue(input, character[name]);
    }
    else if(name == 'spells.' + EMPTY_SPELL_LIST)
      InputSetValue(input, 0);
    else
      character[name] = value;
    RefreshSheet();
    if(name.search(/^(levels|domains)\./) >= 0)
      RefreshEditor(false);
  }

}

/*
 * Tests #attributes# against the PH validation rules. Returns an array
 * containing any failed rules.
 */
function Validate(attributes) {
  var reverseOps = {
    '==': '!=', '!=': '==', '<': '>=', '>=': '<', '>': '<=', '<=': '>',
    '&&': '||', '||': '&&'
  };
  var result = [];
  for(var i = 0; i < Scribe.tests.length; i++) {
    var matchInfo;
    var test = Scribe.tests[i];
    var resolved = '';
    while((matchInfo = test.match(/(\+\/)?\{([^\}]+)\}/)) != null) {
      var value;
      if(matchInfo[1] == '+/') {
        value = 0;
        var pattern = '^' + matchInfo[2];
        for(var a in attributes)
          if(a.match(pattern))
            value += attributes[a] - 0;
      }
      else
        value = attributes[matchInfo[2]];
      resolved += test.substring(0, matchInfo.index) +
                  (value == null ? 'null' : value);
      test = test.substring(matchInfo.index + matchInfo[0].length);
    }
    resolved += test;
    if(!eval(resolved)) {
      var reversed = '';
      while((matchInfo = resolved.match(/==|!=|<|>=|>|<=|&&|\|\|/)) != null) {
        reversed +=
          resolved.substring(0, matchInfo.index) + reverseOps[matchInfo[0]];
        resolved = resolved.substring(matchInfo.index + matchInfo[0].length);
      }
      reversed += resolved;
      result[result.length] =
        Scribe.tests[i] + '  [' + reversed + ']';
    }
  }
  return result;
}

/*
 * Returns HTML showing the results of applying validation rules to the current
 * character's attributes.
 */
function ValidationHtml() {
  var computedAttributes = rules.Apply(character);
  var errors;
  var i;
  var invalid = Validate(computedAttributes);
  var result;
  /*
   * Because of cross-class skills, we can't write a simple validation test for
   * the number of assigned skill points; we have to compute it here.
   */
  var maxRanks = computedAttributes.classSkillMaxRanks;
  var skillPointsAssigned = 0;
  for(var a in character) {
    if(a.substring(0, 7) != 'skills.')
      continue;
    var skill = a.substring(7);
    var isCross = computedAttributes['classSkills.' + skill] == null;
    var maxAllowed = maxRanks / (isCross ? 2 : 1);
    if(character[a] > maxAllowed)
      invalid[invalid.length] =
        '{' + a + '} <= {' + (isCross ? 'cross' : 'class') + 'SkillMaxRanks} ' +
        '[' + character[a] + ' > ' + maxAllowed + ']';
    skillPointsAssigned += character[a] * (isCross ? 2 : 1);
  }
  if(skillPointsAssigned != computedAttributes.skillPoints)
    invalid[invalid.length] =
      '+/{skills} == {skillPoints} [' + skillPointsAssigned + ' != ' +
      computedAttributes.skillPoints + ']';
  if(invalid.length == 0)
    result = 'No validation errors<br/>\n';
  else
    result =
      'Failed: ' + invalid.join('<br/>\nFailed:') + '<br/>\n' + invalid.length +
      ' validation error' + (invalid.length == 1 ? '' : 's') + '<br/>\n';
  return result;
}
