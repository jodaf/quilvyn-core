/* $Id: Scribe.js,v 1.15 2004/05/06 19:30:39 Jim Exp $ */

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

var COOKIE_FIELD_SEPARATOR = '\n';
var COOKIE_NAME = 'scribePrefs';
var COPYRIGHT = 'Copyright 2004 James J. Hayes';
var TIMEOUT_DELAY = 1000;

var character = null;
var cookieInfo = {
  background : 'bisque',
  lastUrl: '',
  prefix: '',
  ruleUrls: '',
  suffix: '.html'
};
var editor;
var editWindow;
var loadingPopup = null;
var loadingWindow;
var pendingEditor = null;
var pendingRules = null;
var pendingViewer = null;
var rules = null;
var sheetWindow;
var urlLoading = null;
var viewer;

function AddUserRules() {
  pendingRules.AddRules.apply(pendingRules, arguments);
}

function AddUserView(name, within, before, format) {
  name = name.replace(/([a-z])([A-Z])/g, '$1 $2').
         replace(/\b[a-z]/g, function(c) {return c.toUpperCase();});
  pendingViewer.addElements(
    {name: name, within: within, before: before, format: format}
  );
}

function ChangeUserPreferences() {
  var value;
  for(var p in cookieInfo) {
    if(p == 'lastUrl')
      continue;
    if((value = prompt('Enter value for ' + p, cookieInfo[p])) == null)
      return;
    cookieInfo[p] = value;
  }
  StoreCookie();
}

function FullUrl(url) {
  if(url.match(/^[a-zA-Z0-9]*:/) == null)
    url = cookieInfo.prefix + url;
  if(url.match(/\.[a-zA-Z0-9]*$/) == null)
    url += cookieInfo.suffix;
  return url;
}

function InitialCharacter() {
  var result = new DndCharacter(null);
  result.Randomize(rules, 'class');
  for(var a in DndCharacter.defaults)
    result.Randomize(rules, a);
  result.Randomize(rules, 'feats');
  result.Randomize(rules, 'languages');
  result.Randomize(rules, 'skills');
  result.Randomize(rules, 'spells');
  return result;
}

function InitialEditor() {
  var result = new FormController();
  result.setCallback(Update);
  result.addElements(
    '', 'about', 'button', ['About'],
    '', 'help', 'button', ['Help'],
    '', 'preferences', 'button', ['Preferences'],
    '', 'open', 'button', ['New/Open'],
    '', 'view', 'button', ['View Html'],
    '', 'clear', 'select',
      ['--Clear--', 'alignment', 'armor', 'charisma', 'class',
       'constitution', 'dexterity', 'feats', 'gender', 'helm', 'hitPoints',
       'intelligence', 'languages', 'name', 'race', 'shield', 'skills',
       'spells', 'strength', 'wisdom'],
    '', 'randomize', 'select',
      ['--Randomize--', 'alignment', 'armor', 'charisma', 'class',
       'constitution', 'dexterity', 'feats', 'gender', 'helm', 'hitPoints',
       'intelligence', 'languages', 'name', 'race', 'shield', 'skills',
       'spells', 'strength', 'wisdom'],
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
    'Deity', 'deity', 'text', [20],
    'Origin', 'origin', 'text', [20],
    'Feats', 'feats', 'bag', DndCharacter.feats,
    'Skills', 'skills', 'bag', DndCharacter.skills,
    'Languages', 'languages', 'set', DndCharacter.languages,
    'Hit Points', 'hitPoints', 'range', [0,999],
    'Armor', 'armor', 'select', DndCharacter.armors,
    'Shield', 'shield', 'select', DndCharacter.shields,
    'Helm', 'helm', 'select', DndCharacter.helms,
    'Weapons', 'weapons', 'bag', DndCharacter.weapons,
    'Spells', 'spells', 'set', DndCharacter.spells,
    'Goodies', 'goodies', 'bag', DndCharacter.goodies,
    'Cleric Domains', 'domains', 'set', DndCharacter.domains,
    'Wizard Specialization', 'specialize', 'set', DndCharacter.schools,
    'Wizard Prohibition', 'prohibit', 'set', DndCharacter.schools
  );
  return result;
}

function InitialRuleEngine() {
  var result = new RuleEngine();
  DndCharacter.AddThirdEditionRules(result);
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
    {name: 'FeatsAndSkills', within: '_top', title: 'Feats/Skills'},
      {name: 'Feat Count', within: 'FeatsAndSkills'},
      {name: 'Skill Points', within: 'FeatsAndSkills'},
      {name: 'Class Skill Max Ranks', within: 'FeatsAndSkills'},
      {name: 'Cross Skill Max Ranks', within: 'FeatsAndSkills'},
      {name: 'Feats Break', within: 'FeatsAndSkills', format: '\n'},
      {name: 'Feats', within: 'FeatsAndSkills'},
      {name: 'Feat Notes Break', within: 'FeatsAndSkills', format: '\n'},
      {name: 'Feat Notes', within: 'FeatsAndSkills'},
      {name: 'Skills Break', within: 'FeatsAndSkills', format: '\n'},
      {name: 'Skills', within: 'FeatsAndSkills'},
      {name: 'Skill Notes Break', within: 'FeatsAndSkills', format: '\n'},
      {name: 'Skill Notes', within: 'FeatsAndSkills'},
      {name: 'Languages Break', within: 'FeatsAndSkills', format: '\n'},
      {name: 'Languages', within: 'FeatsAndSkills'},
    {name: 'Melee Break', within: '_top', format: '\n'},
    {name: 'Melee', within: '_top', title: 'Melee'},
      {name: 'Hit Points', within: 'Melee'},
      {name: 'ArmSection', within: 'Melee', compact: 1},
        {name: 'Armor', within: 'ArmSection'},
        {name: 'Armor Class', within: 'ArmSection', format: ' (%V)'},
      {name: 'Shield', within: 'Melee'},
      {name: 'Helm', within: 'Melee'},
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
      {name: 'Turning Bonus Break', within: 'Melee', format: '\n'},
      {name: 'Turning Bonus', within: 'Melee'},
      {name: 'Turning Frequency', within: 'Melee'},
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
      {name: 'Spells', within: 'Magic'},
      {name: 'Domains Break', within: 'Magic', format: '\n'},
      {name: 'Domains', within: 'Magic'},
      {name: 'Specialize', within: 'Magic'},
      {name: 'Prohibit', within: 'Magic'},
      {name: 'Goodies Break', within: 'Magic', format: '\n'},
      {name: 'Goodies', within: 'Magic'},
      {name: 'Magic Notes Break', within: 'Magic', format: '\n'},
      {name: 'Magic Notes', within: 'Magic'}
  );
  return result;
}

function LoadCharacter(url) {
  url = FullUrl(url);
  if(urlLoading == url && loadingWindow.attributes != null) {
    /* Character done loading. */
    if(!loadingPopup.closed)
      loadingPopup.close();
    if(cookieInfo.lastUrl != url) {
      cookieInfo.lastUrl = url;
      StoreCookie();
    }
    character = new DndCharacter(null);
    for(var e in loadingWindow.attributes) {
      var value = loadingWindow.attributes[e];
      if(typeof value == 'object') {
        for(var x in value)
          character.attributes[e + '.' + x] = value[x];
      }
      else
        character.attributes[e] = value;
    }
    RefreshEditor(false);
    RefreshSheet();
    urlLoading = null;
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
    loadingWindow.location = url;
    setTimeout
      ('LoadCharacter("' + url.replace(/\\/g, "\\\\") + '")', TIMEOUT_DELAY);
  }
  else
    /* Something (possibly this character) loading; try again later. */
    setTimeout
      ('LoadCharacter("' + url.replace(/\\/g, "\\\\") + '")', TIMEOUT_DELAY);
}

function LoadRules(urls) {

  var splitUrls = urls.split(';');

  while(splitUrls.length > 0 && splitUrls[0] == '')
    splitUrls.shift();
  if(splitUrls.length == 0) {
    /* All rule sets done loading. */
    if(pendingRules != null) {
      /* TODO: Allow user to make editor changes w/out losing option changes. */
      editor = InitialEditor();
      pendingEditor = null;
      rules = pendingRules;
      pendingRules = null;
      viewer = pendingViewer;
      pendingViewer = null;
      RefreshEditor(true);
      RefreshSheet();
    }
    return;
  }

  var url = FullUrl(splitUrls[0]);
  if(urlLoading == url && loadingWindow.CustomizeScribe != null) {
    /* Current rule set done loading. */
    loadingWindow.CustomizeScribe
      (DndCharacter, DndCharacter.AddChoices, AddUserRules, AddUserView);
    loadingPopup.close();
    urlLoading = null;
    splitUrls.shift();
    LoadRules(splitUrls.join(';'));
  }
  else if(urlLoading == url && loadingPopup.closed) {
    /* User cancel. */
    urlLoading = null;
    pendingEditor = null;
    pendingRules = null;
    pendingViewer = null;
  }
  else if(urlLoading == null) {
    /* Nothing presently loading. */
    urlLoading = url;
    loadingWindow.CustomizeScribe = null;
    loadingWindow.location = url;
    loadingPopup =
      PopUp('Loading rules from ' + url, 'Cancel', 'window.close();');
    if(pendingRules == null) {
      pendingEditor = InitialEditor();
      pendingRules = InitialRuleEngine();
      pendingViewer = InitialViewer();
    }
    setTimeout
      ('LoadRules("' + splitUrls.join(';').replace(/\\/g, "\\\\") + '");',
       TIMEOUT_DELAY);
  }
  else
    /* Something (possibly this rule set) loading; try again later. */
    setTimeout
      ('LoadRules("' + splitUrls.join(';').replace(/\\/g, "\\\\") + '");',
       TIMEOUT_DELAY);

}

function OpenDialog() {
  if(loadingPopup != null && !loadingPopup.closed) {
    /* Try again after character or rules have loaded. */
    setTimeout('OpenDialog();', TIMEOUT_DELAY);
    return;
  }
  var url = prompt
    ('Enter URL to Edit (Blank for Random Character)', cookieInfo.lastUrl);
  if(url == null && character != null)
    /* User cancel. */
    return;
  if(url == null || url == '') {
    character = InitialCharacter();
    RefreshEditor(false);
    RefreshSheet();
  }
  else
    LoadCharacter(url);
}

function PopUp(html, button, action /* ... */) {
  var popup = window.open
    ('about:blank', 'pop' + PopUp.next++, 'height=200,width=400');
  var content = '<html><head><title>Scribe Message</title></head>\n' +
                '<body bgcolor="' + cookieInfo.background + '">' + html +
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

function RefreshEditor(redraw) {
  if(redraw) {
    editWindow.document.write(
      '<html><head><title>Editor</title></head>\n' +
      '<body bgcolor="' + cookieInfo.background + '">' +
      '<img src="scribe.gif"/><br/>');
    editor.writeToWindow(editWindow, 'ched');
    editWindow.document.write(
      '</body></html>\n'
    );
    editWindow.document.close();
  }
  if(character != null)
    editor.setElementValues(character.attributes);
}

function RefreshSheet() {
  if(character == null)
    return;
  if(sheetWindow == null || sheetWindow.closed)
    sheetWindow = window.open('about:blank', 'scribeSheet');
  sheetWindow.document.write(SheetHtml());
  sheetWindow.document.close();
}

function ScribeLoaded() {

  if(window.DndCharacter == null ||
     window.FormController == null ||
     window.ObjectViewer == null ||
     window.RuleEngine == null) {
    alert('JavaScript script(s) required by Scribe are missing; exiting');
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

  var i = document.cookie.indexOf(COOKIE_NAME + '=');
  if(i >= 0) {
    var end = document.cookie.indexOf(';', i);
    if(end < 0)
      end = document.cookie.length;
    var cookie = document.cookie.substring(i + COOKIE_NAME.length + 1, end);
    var settings = unescape(cookie).split(COOKIE_FIELD_SEPARATOR);
    for(i = 0; i < settings.length && settings[i] != ''; i += 2)
      cookieInfo[settings[i]] = settings[i + 1];
  }
  PopUp(COPYRIGHT + '<br/>' +
        'Press the "About" button for more info',
        'Ok', 'window.close();');
  editWindow = window.frames[0];
  loadingWindow = window.frames[1];
  sheetWindow = window.opener;
  editor = InitialEditor();
  rules = InitialRuleEngine();
  viewer = InitialViewer();
  RefreshEditor(true);
  LoadRules(cookieInfo.ruleUrls);
  OpenDialog();

}

function SheetHtml() {
  var a;
  var codeAttributes = {};
  var computedAttributes = rules.Apply(character.attributes);
  var displayAttributes = {};
  var i;
  for(a in character.attributes) {
    if(character.attributes[a] != DndCharacter.defaults[a]) {
      if((i = a.indexOf('.')) < 0)
        codeAttributes[a] = character.attributes[a];
      else {
        var group = a.substring(0, i);
        if(codeAttributes[group] == null)
          codeAttributes[group] = {};
        codeAttributes[group][a.substring(i + 1)] = character.attributes[a];
      }
    }
  }
  for(a in computedAttributes) {
    var name = a.replace(/([a-z])([A-Z])/g, '$1 $2').
               replace(/\b[a-z]/g, function(c) {return c.toUpperCase();});
    var value = computedAttributes[a];
    if(character.attributes[a] != null && character.attributes[a] != value)
      value += '[' + character.attributes[a] + ']';
    if((i = name.indexOf('.')) < 0)
      displayAttributes[name] = value;
    else {
      var group = name.substring(0, i);
      if(DndCharacter.formats[a] != null)
        value = DndCharacter.formats[a].replace(/%v/, value);
      if(group.indexOf('Notes') > 0 && typeof value == 'number' && value >= 0)
        value = '+' + value;
      value = name.substring(i + 1) + (value == '1' ? '' : (': ' + value));
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

  if(name == 'about')
    window.open('about.html', 'about');
  else if(name == 'help')
    window.open('help.html', 'help');
  else if(name == 'preferences') {
    var oldUrls = cookieInfo.ruleUrls;
    ChangeUserPreferences();
    if(cookieInfo.ruleUrls != oldUrls) {
      rules = InitialRuleEngine();
      viewer = InitialViewer();
      LoadRules(cookieInfo.ruleUrls);
    }
  }
  else if(name == 'open')
    OpenDialog();
  else if(name == 'view') {
    var html = SheetHtml();
    var htmlWindow = window.open('about:blank', 'html');
    html = html.replace(/</g, '&lt;');
    html = html.replace(/>/g, '&gt;');
    htmlWindow.document.write(
      '<html><head><title>HTML</title></head>\n' +
      '<body><pre>' + html + '</pre></body></html>\n'
    );
    htmlWindow.document.close();
  }
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
  else {
    if(!value && DndCharacter.defaults[name] == null)
      delete character.attributes[name];
    else
      character.attributes[name] = value;
    RefreshSheet();
  }

}
